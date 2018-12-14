package jetsennet.jdma.business;

import java.io.StringWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import jetsennet.jdma.dao.WebServiceDao;
import jetsennet.jdma.model.HeadParam;
import jetsennet.jdma.model.MethodParam;
import jetsennet.jdma.model.ServiceInfo;
import jetsennet.jdma.model.ServiceMethod;
import jetsennet.net.WebServiceDescription;
import jetsennet.net.WebServiceHeader;
import jetsennet.net.SchemaNode;
import jetsennet.net.WebServiceOperation;
import jetsennet.net.WebServiceProxy;
import jetsennet.sqlclient.ConnectionInfo;
import jetsennet.sqlclient.DbCommand;
import jetsennet.sqlclient.DbCommandType;
import jetsennet.sqlclient.ISqlExecutor;
import jetsennet.sqlclient.SqlClientObjFactory;
import jetsennet.sqlclient.SqlCondition;
import jetsennet.sqlclient.SqlLogicType;
import jetsennet.sqlclient.SqlParamType;
import jetsennet.sqlclient.SqlRelationType;
import jetsennet.sqlclient.SqlValue;
import jetsennet.util.SerializerUtil;
import jetsennet.util.StringUtil;
import jetsennet.util.XmlUtil;

import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Node;
import org.dom4j.io.OutputFormat;
import org.dom4j.io.XMLWriter;

public class WebService
{
	private static HashMap<String, String> hTabServiceUrl = new HashMap<String, String>();
	private ConnectionInfo dmaConnectionInfo;
	private ISqlExecutor sqlExecutor;
	private WebServiceDao dalWebService;

	public WebService()
	{
		dmaConnectionInfo = ConnectionInfo.createConnectionInfo("dma");
		sqlExecutor = SqlClientObjFactory.createSqlExecutor(dmaConnectionInfo);
		dalWebService = new WebServiceDao(sqlExecutor);
	}

	/**
	 * 添加服务
	 * 
	 * @param objXml
	 * @throws Exception
	 */
	public void addWebService(String objXml) throws Exception
	{
		HashMap<String, String> model = SerializerUtil.deserialize(objXml, "");
		sqlExecutor.transBegin();
		try
		{
			model.put(WebServiceDao.PRIMARY_KEY, java.util.UUID.randomUUID().toString());

			WebServiceProxy.removeServiceCache(model.get("WSDL_PATH"));
			WebServiceDescription wsDesc = WebServiceProxy.parseWebServiceWsdl(model.get("WSDL_PATH"));
			
			if ((wsDesc == null) || (wsDesc.ports == null) || (wsDesc.ports.size() == 0))
			{
				throw new Exception("无效的服务描述地址:" + model.get("WSDL_PATH"));
			}
			
			for (WebServiceOperation operation : wsDesc.ports.get(0).operations)
			{
				try
				{
					sqlExecutor.executeNonQuery(
							"INSERT INTO DMA_WEBACTION (SERVICE_ID,ACTION_NAME,METHOD_NAME,ACTION_DESC) VALUES (%s,%s,%s,%s)",
							new SqlValue(model.get(WebServiceDao.PRIMARY_KEY)),
							new SqlValue(StringUtil.isNullOrEmpty(operation.soapAction) ? 
									StringUtil.trimEnd(wsDesc.targetNamespace, '\\', '/') + "/"	+ operation.name : operation.soapAction), 
							new SqlValue(operation.name), new SqlValue(""));
				}
				catch (Exception ex)
				{
					throw new Exception("服务方法"+operation.name+"已存在", ex);
				}
			}
			
			dalWebService.add(model);
			sqlExecutor.transCommit();
			hTabServiceUrl.clear();
		}
		catch (Exception ex)
		{
			sqlExecutor.transRollback();
			throw ex;
		}
	}

	/**
	 * 访问webservice
	 * 
	 * @param serviceCodeOrWsdlAddress
	 *        wsdl地址
	 * @param serviceUrl
	 *        服务地址
	 * @param methodName
	 *        访问方法
	 * @param header
	 *        soap头
	 * @param serviceArguments
	 *        服务参数
	 * @param requestInfo
	 *        请求信息
	 * @return
	 */	
	@SuppressWarnings("unchecked")
	public String callWebService(String serviceCodeOrWsdlAddress, String serviceUrl, String methodName, String header, String serviceArguments,
			String requestInfo) throws Exception
	{
		String[] serviceaArgs = null;
		String result = "";
		Exception ex = null;

		try
		{
			if (serviceArguments.length() > 0)
			{
				Document xmlDoc = DocumentHelper.parseText(serviceArguments);

				List<Node> nodes = xmlDoc.getRootElement().elements();

				if (nodes.size() > 0)
				{
					List<String> arguments = new ArrayList<String>();
					for (Node node : nodes)
					{
						arguments.add(node.getText());
					}
					serviceaArgs = new String[arguments.size()];
					serviceaArgs = arguments.toArray(serviceaArgs);
				}
			}

			if ((serviceCodeOrWsdlAddress.length() < 50) && (serviceCodeOrWsdlAddress.indexOf(".") < 0)
					&& (serviceCodeOrWsdlAddress.indexOf("/") < 0))
			{
				serviceCodeOrWsdlAddress = getServiceUrlByCode(serviceCodeOrWsdlAddress);
			}
			
			result = WebServiceProxy.callService(serviceCodeOrWsdlAddress, serviceUrl, methodName, header, true, serviceaArgs);
		}
		catch (Exception ex2)
		{
			result = ex2.getMessage();
			ex = ex2;
		}

		if (ex != null)
		{
			throw ex;
		}

		return result;

	}

	/**
	 * 删除服务日志
	 * 
	 * @param logIds
	 * @throws Exception
	 */
	public void deleteServiceLog(String logIds) throws Exception
	{
		sqlExecutor.transBegin();
		try
		{
			sqlExecutor.executeNonQuery(
					sqlExecutor.getSqlParser().getDeleteCommandString(
							"DMA_WEBINVOKE",
							new SqlCondition("INVOKE_ID", logIds, SqlLogicType.And, SqlRelationType.In, SqlParamType.String)));
			
			sqlExecutor.transCommit();
		}
		catch (Exception ex)
		{
			sqlExecutor.transRollback();
			throw ex;
		}
	}

	/**
	 * 删除服务
	 * 
	 * @param servcieId
	 * @throws Exception
	 */
	public void deleteWebService(String servcieId) throws Exception
	{
		sqlExecutor.transBegin();
		try
		{
			sqlExecutor.executeNonQuery(
					"DELETE FROM DMA_WEBACTION WHERE SERVICE_ID=%s",
					new SqlValue(servcieId));
			
			dalWebService.deleteById(servcieId);
			
			sqlExecutor.transCommit();
			hTabServiceUrl.clear();
		}
		catch (Exception ex)
		{
			sqlExecutor.transRollback();
			throw ex;
		}
	}

	/**
	 * 服务日志记录
	 * 
	 * @param xmlString
	 * @return
	 */
	private String formatXml(String xmlString) throws Exception
	{
		if (StringUtil.isNullOrEmpty(xmlString))
		{
			return "";
		}

		Document doc = DocumentHelper.parseText(xmlString);
		OutputFormat format = OutputFormat.createPrettyPrint();

		StringWriter out = new StringWriter();
		XMLWriter writer = new XMLWriter(out, format);
		try
		{
			writer.write(doc);
		}
		finally
		{
			if (writer != null)
			{
				writer.close();
			}
		}
		return out.toString();
	}

	/**
	 * 通过代码获取服务地址
	 * 
	 * @param serviceCode
	 * @throws Exception
	 */
	public String getServiceUrlByCode(String serviceCode) throws Exception
	{
		// 待缓存
		Object obj = sqlExecutor.executeScalar(
					sqlExecutor.getSqlParser().formatCommand(
						"Select SERVICE_URL From DMA_WEBSERVICE WHERE SERVICE_CODE=%s", 
						new SqlValue(serviceCode)));
		
		return obj == null ? "" : obj.toString();
	}

	/**
	 * 通过soap活动获取服务地址
	 * 
	 * @param soapAction
	 * @return String
	 */
	public String getServiceUrlBySoapAction(String soapAction) throws Exception
	{
		if (hTabServiceUrl.containsKey(soapAction))
		{
			return hTabServiceUrl.get(soapAction);
		}

		String[] actionItem = sqlExecutor.find(
				sqlExecutor.getSqlParser().formatCommand(
						"SELECT W.SERVICE_URL FROM DMA_WEBACTION A inner join DMA_WEBSERVICE W on A.SERVICE_ID=W.SERVICE_ID WHERE ACTION_NAME=%s",
						new SqlValue(soapAction)));
		
		if ((actionItem != null) && !StringUtil.isNullOrEmpty(actionItem[0]))
		{
			try
			{
				hTabServiceUrl.put(soapAction, actionItem[0]);
			}
			catch (Exception ex)
			{
			}
			return actionItem[0];
		}
		return null;
	}

	/**
	 * 移除服务
	 * 
	 * @param serviceItem
	 *        服务项
	 */
	public void serviceDelete(jetsennet.jdma.model.ServiceItemType serviceItem) throws Exception
	{
		if ((serviceItem == null)
				|| (StringUtil.isNullOrEmpty(serviceItem.getServiceCode()) && StringUtil.isNullOrEmpty(serviceItem.getServiceURL())))
		{
			throw new Exception("无效的参数!");
		}

		Object objSysId = sqlExecutor.executeScalar(
							sqlExecutor.getSqlParser().formatCommand(
									"SELECT SYS_ID FROM DMA_APPSYSTEM WHERE SYS_CODE=%s",
									new SqlValue(serviceItem.getSystemCode())));
		
		if (objSysId == null)
		{
			throw new Exception("无效的系统代号!");
		}

		SqlCondition c0 = null;
		if (StringUtil.isNullOrEmpty(serviceItem.getServiceCode()))
		{
			c0 = new SqlCondition();
			c0.setSqlLogicType(SqlLogicType.And);
			c0.getSqlConditions().add(new SqlCondition("WSDL_PATH", serviceItem.getServiceURL(), 
							SqlLogicType.Or, SqlRelationType.Equal, SqlParamType.String));
			c0.getSqlConditions().add(new SqlCondition("SERVICE_URL", serviceItem.getServiceURL(), 
							SqlLogicType.Or, SqlRelationType.Equal, SqlParamType.String));
		}
		else
		{
			c0 = new SqlCondition("SERVICE_CODE", serviceItem.getServiceCode(), 
					SqlLogicType.And, SqlRelationType.Equal, SqlParamType.String);
		}

		dalWebService.delete(new SqlCondition("SYS_ID", objSysId.toString(), 
				SqlLogicType.And, SqlRelationType.Equal, SqlParamType.String), c0);

		WebServiceProxy.removeServiceCache(serviceItem.getServiceURL());
	}

	/**
	 * 移除服务
	 * 
	 * @param sysCode
	 *        服务码
	 * @param sysToken
	 *        认可证
	 * @param serviceCodeOrUrl
	 *        服务码地址
	 * @throws Exception
	 */
	public void serviceDelete(String sysCode, String sysToken, String serviceCodeOrUrl) throws Exception
	{
		if (StringUtil.isNullOrEmpty(sysCode) || StringUtil.isNullOrEmpty(serviceCodeOrUrl))
		{
			throw new Exception("无效的参数!");
		}

		Object objSysId = sqlExecutor.executeScalar(
					sqlExecutor.getSqlParser().formatCommand(
						"Select SYS_ID From DMA_APPSYSTEM Where STATE=0 AND SYS_CODE=%s", 
						new SqlValue(sysCode)));
		
		if (objSysId == null)
		{
			throw new Exception("无效的系统代号!");
		}

		if (!objSysId.toString().equals(sysToken))
		{
			throw new Exception("无效的系统认证!");
		}

		SqlCondition c0 = null;
		if ((serviceCodeOrUrl.length() < 50) 
				&& (serviceCodeOrUrl.indexOf(".") < 0) 
				&& (serviceCodeOrUrl.indexOf("/") < 0))
		{
			new SqlCondition("SERVICE_CODE", serviceCodeOrUrl, 
					SqlLogicType.And, SqlRelationType.Equal, SqlParamType.String);
		}
		else
		{
			new SqlCondition("SERVICE_URL", serviceCodeOrUrl, 
					SqlLogicType.And, SqlRelationType.Equal, SqlParamType.String);
		}

		dalWebService.delete(new SqlCondition("SYS_ID", sysToken, 
				SqlLogicType.And, SqlRelationType.Equal, SqlParamType.String), c0);

		WebServiceProxy.removeServiceCache(serviceCodeOrUrl);
	}

	/**
	 * 查找服务
	 * 
	 * @param requestXml
	 * @return String
	 */
	@SuppressWarnings("unchecked")
	public String serviceFind(String requestXml) throws Exception
	{
		if (StringUtil.isNullOrEmpty(requestXml))
		{
			throw new Exception("无效的参数!");
		}

		Document xmlDoc = DocumentHelper.parseText(requestXml);
		Node rootNode = xmlDoc.getRootElement();

		String sysCode = XmlUtil.tryGetItemText(rootNode, "SystemCode", "").trim();
		String sysType = XmlUtil.tryGetItemText(rootNode, "SystemType", "").trim();
		String serviceCode = XmlUtil.tryGetItemText(rootNode, "ServiceCode", "").trim();
		String sysOName = XmlUtil.tryGetItemText(rootNode, "OperationName", "").trim();

		SqlCondition c0 = StringUtil.isNullOrEmpty(sysCode) ? 
				null : new SqlCondition("SYS_CODE", sysCode, SqlLogicType.And, SqlRelationType.Equal,SqlParamType.String);
		SqlCondition c1 = StringUtil.isNullOrEmpty(sysType) ? 
				null : new SqlCondition("SYS_TYPE", sysType, SqlLogicType.And, SqlRelationType.Equal,SqlParamType.Numeric);
		SqlCondition c2 = StringUtil.isNullOrEmpty(serviceCode) ? 
				null : new SqlCondition("SERVICE_CODE", serviceCode, SqlLogicType.And,SqlRelationType.Equal, SqlParamType.String);
		SqlCondition c3 = new SqlCondition("W.STATE", "0", SqlLogicType.And, SqlRelationType.Equal, SqlParamType.Numeric);

		Document ds = sqlExecutor.fill(
				"Select SYS_NAME,SYS_CODE,SYS_TYPE,SERVICE_NAME,SERVICE_URL,SERVICE_CODE FROM DMA_WEBSERVICE W inner join DMA_APPSYSTEM S on W.SYS_ID=S.SYS_ID "
						+ sqlExecutor.getSqlParser().parseSqlCondition(c0, c1, c2, c3));

		StringBuilder sbResult = new StringBuilder();
		sbResult.append("<RecordSet>");

		List<Node> items = ds.getRootElement().elements();
		for (int i = 0; i < items.size(); i++)
		{
			Node serviceUrlNode = items.get(i).selectSingleNode("SERVICE_URL");
			if (serviceUrlNode == null)
			{
				continue;
			}

			String serviceUrl = serviceUrlNode.getText();
			if (serviceUrl.length() > 0)
			{
				if (!StringUtil.isNullOrEmpty(sysOName))
				{
					WebServiceDescription wsDesc = null;
					try
					{
						wsDesc = WebServiceProxy.parseWebServiceWsdl(serviceUrl);
					}
					catch (Exception ex)
					{
					}

					if ((wsDesc == null) || (wsDesc.getOpeartion(sysOName) == null))
					{
						continue;
					}
				}

				sbResult.append(String.format(
										"<Record><SystemName>%s</SystemName><ServiceName>%s</ServiceName><ServiceUrl>%s</ServiceUrl><SystemCode>%s</SystemCode><SystemType>%s</SystemType><ServiceCode>%s</ServiceCode></Record>",
										XmlUtil.tryGetItemText(items.get(i), "SYS_NAME", ""), 
										XmlUtil.escapeXml(XmlUtil.tryGetItemText(items.get(i), "SERVICE_NAME", "")), 
										serviceUrl, 
										XmlUtil.tryGetItemText(items.get(i), "SYS_CODE", ""),
										XmlUtil.tryGetItemText(items.get(i), "SYS_TYPE", ""), 
										XmlUtil.tryGetItemText(items.get(i), "SYS_TYPE",	"")));
			}
		}
		
		sbResult.append("</RecordSet>");

		return sbResult.toString();
	}

	/**
	 * 服务日志记录
	 * 
	 * @param requestId
	 * @param actionName
	 * @param serviceUrl
	 * @param sourceCode
	 * @param targetCode
	 * @param requestInfo
	 */
	public void serviceLog(String requestId, String actionName, String serviceUrl, String sourceCode, String targetCode, String userName,
			String userToke, int requestType, String requestTime, String responseTime, String requestXml, String responseXml, int state,
			String stateDesc) throws Exception
	{
		DbCommand command = new DbCommand(sqlExecutor.getSqlParser(), DbCommandType.InsertCommand);
		command.setTableName("DMA_WEBINVOKE");
		command.addField("INVOKE_ID", java.util.UUID.randomUUID().toString());
		command.addField("REQUEST_ID", requestId);
		command.addField("ACTION_NAME", actionName);
		command.addField("SERVICE_URL", serviceUrl);
		command.addField("SOURCE_CODE", sourceCode);
		command.addField("TARGET_CODE", targetCode);
		command.addField("USER_NAME", userName);
		command.addField("USER_TOKEN", userToke);
		command.addField("REQUEST_TYPE", requestType, SqlParamType.Numeric);
		command.addField("REQUEST_TIME", requestTime, SqlParamType.DateTime);
		command.addField("RESPONSE_TIME", responseTime, SqlParamType.DateTime);
		command.addField("REQUEST_XML", requestXml);
		command.addField("RESPONSE_XML", responseXml);
		command.addField("STATE", state);
		command.addField("STATE_DESC", stateDesc);
		sqlExecutor.executeNonQuery(command.toString());
	}

	/**
	 * 解析服务
	 * 
	 * @param serviceId
	 * @param url
	 * @param refresh
	 * @return ServiceInfo
	 */
	public ServiceInfo serviceParse(String serviceId, String url, int refresh) throws Exception
	{
		if (refresh == 1)
		{
			WebServiceProxy.removeServiceCache(url);
		}
		WebServiceDescription wsDesc = WebServiceProxy.parseWebServiceWsdl(url);

		if (!StringUtil.isNullOrEmpty(serviceId) && (refresh == 1))
		{
			if ((wsDesc != null) 
					&& (wsDesc.ports != null) 
					&& (wsDesc.ports.size() > 0))
			{
				sqlExecutor.executeNonQuery("DELETE FROM DMA_WEBACTION WHERE SERVICE_ID=%s",
						new SqlValue(serviceId));

			}
		}

		ServiceInfo serviceInfo = new ServiceInfo();
		serviceInfo.setServiceName(wsDesc.name);
		serviceInfo.setServiceDesc(wsDesc.description);

		for (WebServiceOperation operation : wsDesc.ports.get(0).operations)
		{
			ServiceMethod method = new ServiceMethod();
			method.setMethodName(operation.name);
			method.setMethodDesc(operation.nodeDesc);
			method.setMethodInput(formatXml(wsDesc.getRequestSoapFormat(operation.name)));
			method.setMethodOutput(formatXml(wsDesc.getResponseSoapFormat(operation.name)));
			method.setSoapAction(StringUtil.isNullOrEmpty(operation.soapAction) ? 
					StringUtil.trimEnd(wsDesc.targetNamespace, '\\', '/') + "/"	+ operation.name : operation.soapAction);

			if (!StringUtil.isNullOrEmpty(serviceId) && (refresh == 1))
			{
				sqlExecutor.executeNonQuery(
						"INSERT INTO DMA_WEBACTION (SERVICE_ID,ACTION_NAME,METHOD_NAME,ACTION_DESC) VALUES (%s,%s,%s,%s)", 
						new SqlValue(serviceId),
						new SqlValue(method.getSoapAction()), 
						new SqlValue(method.getMethodName()), 
						new SqlValue(""));
			}

			if (operation.inMessage.headers != null)
			{
				method.setHeadParams(new ArrayList<HeadParam>());
				for (WebServiceHeader header : operation.inMessage.headers)
				{
					HeadParam head = new HeadParam(header.name);
					for (SchemaNode hPNode : header.nodes)
					{
						head.getHeadFields().add(
								new MethodParam(hPNode.name, hPNode.dataType, 
										!WebServiceProxy.isServiceBaseDataType(hPNode.dataType)));
					}
					method.getHeadParams().add(head);
				}
			}
			if (operation.inMessage.nodes != null)
			{
				method.setMethodParams(new ArrayList<MethodParam>());
				for (SchemaNode param : operation.inMessage.nodes)
				{
					method.getMethodParams().add(
							new MethodParam(param.name, param.dataType, 
									!WebServiceProxy.isServiceBaseDataType(param.dataType)));
				}
			}
			serviceInfo.getMethods().add(method);
		}
		return serviceInfo;
	}

	/**
	 * 发布服务
	 * 
	 * @param serviceItem
	 * @throws Exception
	 */
	public void servicePublish(jetsennet.jdma.model.ServiceItemType serviceItem) throws Exception
	{
		if ((serviceItem == null) || StringUtil.isNullOrEmpty(serviceItem.getServiceURL()) 
				|| StringUtil.isNullOrEmpty(serviceItem.getServiceCode())
				|| StringUtil.isNullOrEmpty(serviceItem.getSystemCode()))
		{
			throw new Exception("无效的参数!");
		}

		Object objSysId = sqlExecutor.executeScalar(
				sqlExecutor.getSqlParser().formatCommand(
				"Select SYS_ID From DMA_APPSYSTEM Where STATE=0 AND SYS_CODE=%s", 
				new SqlValue(serviceItem.getSystemCode())));
		
		if (objSysId == null)
		{
			throw new Exception("无效的系统代号!");
		}

		Object objServiceId = sqlExecutor.executeScalar(
				sqlExecutor.getSqlParser().formatCommand(
				"Select SERVICE_ID From DMA_WEBSERVICE Where SERVICE_CODE=%s", 
				new SqlValue(serviceItem.getServiceCode())));

		HashMap<String, String> model = new HashMap<String, String>();
		model.put("SYS_ID", serviceItem.getSystemCode());
		model.put("SERVICE_NAME", serviceItem.getServiceName());
		model.put("SERVICE_DESC", serviceItem.getServiceDesc());
		model.put("WSDL_PATH", serviceItem.getServiceURL());
		model.put("SERVICE_URL", serviceItem.getServiceURL());
		model.put("CREATE_USER", "dmasystem");
		model.put("STATE", "0");
		model.put("SERVICE_CODE", serviceItem.getServiceCode());

		if (objServiceId != null)
		{
			model.put("SERVICE_ID", String.valueOf(objServiceId));
			dalWebService.update(model);
		}
		else
		{
			dalWebService.add(model);
		}
	}

	/**
	 * 发布服务
	 * 
	 * @param sysCode
	 * @param sysToken
	 * @param serviceXml
	 * @throws Exception
	 */
	public void servicePublish(String sysCode, String sysToken, String serviceXml) throws Exception
	{
		if (StringUtil.isNullOrEmpty(sysCode) || StringUtil.isNullOrEmpty(serviceXml))
		{
			throw new Exception("无效的参数!");
		}

		Object objSysId = sqlExecutor.executeScalar(
				sqlExecutor.getSqlParser().formatCommand(
				"Select SYS_ID From DMA_APPSYSTEM Where STATE=0 AND SYS_CODE=%s", 
				new SqlValue(sysCode)));
		
		if (objSysId == null)
		{
			throw new Exception("无效的系统代号!");
		}

		if (!objSysId.toString().equals(sysToken))
		{
			throw new Exception("无效的系统认证!");
		}

		Document xmlDoc = DocumentHelper.parseText(serviceXml);

		Node rootNode = xmlDoc.getRootElement();

		HashMap<String, String> model = new HashMap<String, String>();
		model.put("SERVICE_ID", java.util.UUID.randomUUID().toString());
		model.put("SYS_ID", sysToken);
		model.put("SERVICE_NAME", XmlUtil.tryGetItemText(rootNode, "ServiceName", ""));
		model.put("SERVICE_DESC", XmlUtil.tryGetItemText(rootNode, "ServiceDesc", ""));
		model.put("SERVICE_URL", XmlUtil.tryGetItemText(rootNode, "ServiceUrl", ""));
		model.put("CREATE_USER", "dmasystem");
		model.put("STATE", "0");
		String serviceCode = XmlUtil.tryGetItemText(rootNode, "ServiceCode", "");
		if (serviceCode.length() == 0)
		{
			throw new Exception("无效的服务代号!");
		}
		model.put("SERVICE_CODE", serviceCode);
		dalWebService.add(model);
	}

	/**
	 * 更新服务
	 * 
	 * @param objXml
	 * @throws Exception
	 */
	public void updateWebService(String objXml) throws Exception
	{

		HashMap<String, String> model = SerializerUtil.deserialize(objXml, "");
		sqlExecutor.transBegin();
		try
		{
			dalWebService.update(model);

			WebServiceDescription wsDesc = WebServiceProxy.parseWebServiceWsdl(model.get("WSDL_PATH"));
			
			if ((wsDesc != null) 
					&& (wsDesc.ports != null) 
					&& (wsDesc.ports.size() > 0))
			{
				sqlExecutor.executeNonQuery("DELETE FROM DMA_WEBACTION WHERE SERVICE_ID=%s",
						new SqlValue(model.get(WebServiceDao.PRIMARY_KEY)));
				
				for (WebServiceOperation operation : wsDesc.ports.get(0).operations)
				{
					try
					{
						sqlExecutor.executeNonQuery(
								"INSERT INTO DMA_WEBACTION (SERVICE_ID,ACTION_NAME,METHOD_NAME,ACTION_DESC) VALUES (%s,%s,%s,%s)",
								new SqlValue(model.get(WebServiceDao.PRIMARY_KEY)),
								new SqlValue(StringUtil.isNullOrEmpty(operation.soapAction) ? 
										StringUtil.trimEnd(wsDesc.targetNamespace, '\\', '/')+ "/" + operation.name : operation.soapAction), 
								new SqlValue(operation.name), new SqlValue(""));
					}
					catch (Exception ex)
					{
						throw new Exception("服务方法已存在", ex);
					}
				}
			}

			sqlExecutor.transCommit();
			hTabServiceUrl.clear();
		}
		catch (Exception ex)
		{
			sqlExecutor.transRollback();
			throw ex;
		}
	}
}
