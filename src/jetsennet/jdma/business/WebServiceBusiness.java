/* ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
 * 北京捷成世纪科技股份有限公司
 * 日 期：2014-11-30 下午01:55:25
 * 文 件：WebServiceBusiness.java
 * 作 者：薛恩彬
 * 版 本：1.0.0
 * ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
 */
package jetsennet.jdma.business;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import jetsennet.frame.business.BaseBusiness;
import jetsennet.frame.business.Business;
import jetsennet.frame.dataaccess.IDao;
import jetsennet.jdma.model.HeadParam;
import jetsennet.jdma.model.MethodParam;
import jetsennet.jdma.model.ServiceInfo;
import jetsennet.jdma.model.ServiceMethod;
import jetsennet.jdma.schema.DmaWebinvoke;
import jetsennet.jdma.schema.DmaWebservice;
import jetsennet.net.SchemaNode;
import jetsennet.net.ServiceRequest;
import jetsennet.net.WebServiceDescription;
import jetsennet.net.WebServiceHeader;
import jetsennet.net.WebServiceOperation;
import jetsennet.net.WebServiceProxy;
import jetsennet.sqlclient.SqlCondition;
import jetsennet.sqlclient.SqlLogicType;
import jetsennet.sqlclient.SqlParamType;
import jetsennet.sqlclient.SqlRelationType;
import jetsennet.util.SerializerUtil;
import jetsennet.util.SpringContextUtil;
import jetsennet.util.StringUtil;

import org.apache.log4j.Logger;
import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.dom4j.Node;

/**
 *  TODO 添加该类的简单功能说明以及算法
 *
 * @author <a href="mailto:xueenbin@jetsen.cn">薛恩彬</a>
 * @version 1.0.0
 * ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝<br/>
 * 修订日期            修订人          描述<br/>
 * 2014-11-30   薛恩彬          创建<br/>
 */
public class WebServiceBusiness extends BaseBusiness{
	private static final Logger logger = Logger.getLogger(WebServiceBusiness.class);
	private static HashMap<String, String> hTabServiceUrl = new HashMap<String, String>();

	public IDao getReplaceDao()
    {
        IDao daof = getDao();
        if (daof == null)
        {
        	WebServiceBusiness webServiceBusiness = (WebServiceBusiness) SpringContextUtil.getBean("webServiceBusiness");
            return webServiceBusiness.getDao();
        }
        return daof;
    }
	
	@Override
    @Business
	public int commonObjInsert(String className, String xml) throws Exception {
		Element root = DocumentHelper.parseText(xml).getRootElement();
//		DmaWebservice dmaWebservice = SerializerUtil.deserialize(DmaWebservice.class, root);
		
		String wsdlPath = root.selectSingleNode("WSDL_PATH").getText();
		WebServiceProxy.removeServiceCache(wsdlPath);
		WebServiceDescription wsDesc = WebServiceProxy.parseWebServiceWsdl(wsdlPath);
		if ((wsDesc == null) || (wsDesc.ports == null) || (wsDesc.ports.size() == 0))
		{
			throw new Exception("无效的服务描述地址:" + wsdlPath);
		}
		
//		getReplaceDao().saveBusinessObjs(dmaWebservice);
		Class cls = getSchemaClass(className);
		Map module = SerializerUtil.deserialize2map(cls, xml);
		getReplaceDao().saveModelData(cls, module);
		Object newKey = getReplaceDao().querySingleObject(Object.class, "SELECT SERVICE_ID FROM DMA_WEBSERVICE WHERE WSDL_PATH='"+wsdlPath+"'");
		
		for (WebServiceOperation operation : wsDesc.ports.get(0).operations)
		{
			Object sysCodeobj = getReplaceDao().querySingleObject(Object.class,"SELECT SYS_CODE FROM DMA_APPSYSTEM WHERE SYS_ID='"+root.selectSingleNode("SYS_ID").getText()+"'");
			if(sysCodeobj==null) throw new Exception("系统代码未注册!");
			String actionName = StringUtil.isNullOrEmpty(operation.soapAction) ? StringUtil.trimEnd(wsDesc.targetNamespace, '\\', '/') + "/"
					+ operation.name : operation.soapAction;
			Object acitonExist = getReplaceDao().querySingleObject(Object.class,"SELECT 1 FROM DMA_WEBACTION WHERE ACTION_NAME='"+actionName+"' AND SYS_CODE ='" +sysCodeobj.toString()+"'");
			if(acitonExist!=null)continue;
			
			try
			{
				getReplaceDao().execute(String.format("INSERT INTO DMA_WEBACTION (ACTION_ID,SERVICE_ID,ACTION_NAME,METHOD_NAME,SYS_CODE,ACTION_DESC) VALUES (%s,%s,%s,%s,%s,%s)",
						"'"+java.util.UUID.randomUUID().toString()+"'","'"+newKey+"'","'"+actionName+"'","'"+operation.name+"'","'"+sysCodeobj.toString()+"'","'"+"'"));
			}
			catch (Exception ex)
			{
				getReplaceDao().update("DELETE FROM DMA_WEBSERVICE WHERE WSDL_PATH ='" +wsdlPath+"'");
				throw new Exception("服务方法已存在", ex);
			}
		}
		hTabServiceUrl.clear();
        return 0;
	}

	

	/* (non-Javadoc)
	 * @see jetsennet.frame.business.BaseBusiness#commonObjUpdateByPk(java.lang.String, java.lang.String, boolean)
	 */
	public int commonObjUpdateWebService(String className, String xml,
			boolean isFilterNull) throws Exception {
		Element root = DocumentHelper.parseText(xml).getRootElement();
		DmaWebservice dmaWebservice = SerializerUtil.deserialize(DmaWebservice.class, root);
		
		String serviceId = root.selectSingleNode("SERVICE_ID").getText();
		
		Object objSysCode = getReplaceDao().querySingleObject(Object.class,"SELECT SYS_CODE FROM DMA_APPSYSTEM WHERE SYS_ID IN(SELECT SYS_ID FROM DMA_WEBSERVICE WHERE SERVICE_ID='"+serviceId+"')");
		
		WebServiceDescription wsDesc = WebServiceProxy.parseWebServiceWsdl(root.selectSingleNode("WSDL_PATH").getText());
		if ((wsDesc != null) && (wsDesc.ports != null) && (wsDesc.ports.size() > 0))
		{
			getReplaceDao().updateBusinessObjs(isFilterNull, dmaWebservice);
			getReplaceDao().update("DELETE FROM DMA_WEBACTION WHERE SERVICE_ID='"+serviceId+"'");
			
			for (WebServiceOperation operation : wsDesc.ports.get(0).operations)
			{
				try
				{
					getReplaceDao().execute(String.format("INSERT INTO DMA_WEBACTION (ACTION_ID,SERVICE_ID,ACTION_NAME,METHOD_NAME,SYS_CODE,ACTION_DESC) VALUES (%s,%s,%s,%s,%s,%s)",
							"'"+java.util.UUID.randomUUID().toString()+"'","'"+serviceId+"'","'"+
							(StringUtil.isNullOrEmpty(operation.soapAction) ? StringUtil.trimEnd(wsDesc.targetNamespace, '\\', '/') + "/"
									+ operation.name : operation.soapAction)
							+"'","'"+operation.name+"'","'"+objSysCode.toString()+"'","'"+"'"));
				}
				catch (Exception ex)
				{
					throw new Exception("服务方法已存在", ex);
				}
			}
		}
		hTabServiceUrl.clear();
		
		commonObjUpdateByPk(className, xml, isFilterNull);
        return 0;
	}



	/* (non-Javadoc)
	 * @see jetsennet.frame.business.BaseBusiness#commonObjDelete(java.lang.String, java.lang.String)
	 */
	@Override
	public int commonObjDelete(String className, String keyValues){
		try {
			getReplaceDao().update("DELETE FROM DMA_WEBSERVICE WHERE SERVICE_ID='"+keyValues+"'");
			getReplaceDao().update("DELETE FROM DMA_WEBACTION WHERE SERVICE_ID='"+keyValues+"'");
		} catch (SQLException e) {
			logger.error("删除web服务失败！",e);
			e.printStackTrace();
		}
		hTabServiceUrl.clear();
		return 0;
	}


	/**
	 * 通过soap活动获取服务地址
	 * 
	 * @param soapAction
	 * @return String
	 */
	public String getServiceUrlBySoapAction(ServiceRequest serviceRequest) throws Exception
	{
		if (hTabServiceUrl.containsKey(serviceRequest.RequestAction+"_"+serviceRequest.TargetCode))
		{
			return hTabServiceUrl.get(serviceRequest.RequestAction+"_"+serviceRequest.TargetCode);
		}

		Object actionItem = getReplaceDao().querySingleObject(Object.class, "SELECT W.SERVICE_URL FROM DMA_WEBACTION A inner join DMA_WEBSERVICE W on A.SERVICE_ID=W.SERVICE_ID WHERE ACTION_NAME='"+serviceRequest.RequestAction+"' AND SYS_CODE='"+serviceRequest.TargetCode+"'");
		
		/*String[] actionItem = sqlExecutor.find(sqlExecutor.getSqlParser().formatCommand(
				"SELECT W.SERVICE_URL FROM DMA_WEBACTION A inner join DMA_WEBSERVICE W on A.SERVICE_ID=W.SERVICE_ID WHERE ACTION_NAME=%s AND SYS_CODE=%s",
				new SqlValue(serviceRequest.RequestAction),new SqlValue(serviceRequest.TargetCode)));*/
		if ((actionItem != null) && !StringUtil.isNullOrEmpty(actionItem.toString()))
		{
			try
			{
				hTabServiceUrl.put(serviceRequest.RequestAction+"_"+serviceRequest.TargetCode, actionItem.toString());
			}
			catch (Exception ex)
			{
			}
			return actionItem.toString();
		}
		return null;
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
		String logXml = "<DMA_WEBINVOKE>"+
				"<REQUEST_ID>"+requestId+"</REQUEST_ID>"+
				"<ACTION_NAME>"+actionName+"</ACTION_NAME>"+
				"<SERVICE_URL>"+serviceUrl+"</SERVICE_URL>"+
				"<SOURCE_CODE>"+sourceCode+"</SOURCE_CODE>"+
				"<TARGET_CODE>"+targetCode+"</TARGET_CODE>"+
				"<USER_NAME>"+userName+"</USER_NAME>"+
				"<USER_TOKEN>"+userToke+"</USER_TOKEN>"+
				"<REQUEST_TYPE>"+requestType+"</REQUEST_TYPE>"+
				"<REQUEST_TIME>"+requestTime+"</REQUEST_TIME>"+
				"<RESPONSE_TIME>"+responseTime+"</RESPONSE_TIME>"+
				"<REQUEST_XML>"+requestXml+"</REQUEST_XML>"+
				"<RESPONSE_XML>"+responseXml+"</RESPONSE_XML>"+
				"<STATE>"+state+"</STATE>"+
				"<STATE_DESC>"+stateDesc+"</STATE_DESC>"+
				"</DMA_WEBINVOKE>";
		Element root = DocumentHelper.parseText(logXml).getRootElement();
		DmaWebinvoke dmaWebinvoke = SerializerUtil.deserialize(DmaWebinvoke.class, root);
		getReplaceDao().saveBusinessObjs(dmaWebinvoke);
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
	 * 通过代码获取服务地址
	 * 
	 * @param serviceCode
	 * @throws Exception
	 */
	public String getServiceUrlByCode(String serviceCode) throws Exception
	{
		// 待缓存
		Object obj = getReplaceDao().querySingleObject(Object.class,"Select SERVICE_URL From DMA_WEBSERVICE WHERE SERVICE_CODE='"+serviceCode+"'");
		return obj == null ? "" : obj.toString();
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

		Object objSysCode = null;
		
		if (!StringUtil.isNullOrEmpty(serviceId) && (refresh == 1))
		{
			objSysCode =getReplaceDao().querySingleObject(Object.class,"SELECT SYS_CODE FROM DMA_APPSYSTEM WHERE SYS_ID IN(SELECT SYS_ID FROM DMA_WEBSERVICE WHERE SERVICE_ID='"+serviceId+"')");
			if ((wsDesc != null) && (wsDesc.ports != null) && (wsDesc.ports.size() > 0))
			{
				getReplaceDao().update("DELETE FROM DMA_WEBACTION WHERE SERVICE_ID='"+serviceId+"'");
				/*sqlExecutor.executeNonQuery(sqlExecutor.getSqlParser().formatCommand("DELETE FROM DMA_WEBACTION WHERE SERVICE_ID=%s",
						new SqlValue(serviceId)));
*/
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
			method.setMethodInput(wsDesc.getRequestSoapFormat(operation.name));//formatXml();
			method.setMethodOutput(wsDesc.getResponseSoapFormat(operation.name));//formatXml();
			method.setSoapAction(StringUtil.isNullOrEmpty(operation.soapAction) ? StringUtil.trimEnd(wsDesc.targetNamespace, '\\', '/') + "/"
					+ operation.name : operation.soapAction);

			if (!StringUtil.isNullOrEmpty(serviceId) && (refresh == 1))
			{
				getReplaceDao().execute(String.format("INSERT INTO DMA_WEBACTION (ACTION_ID,SYS_CODE,SERVICE_ID,ACTION_NAME,METHOD_NAME,ACTION_DESC) VALUES (%s,%s,%s,%s,%s,%s)",
						"'"+java.util.UUID.randomUUID().toString()+"'","'"+objSysCode.toString()+"'","'"+
						serviceId+"'","'"+method.getSoapAction()+"'","'"+method.getMethodName()+"'","'"+"'"));
				/*sqlExecutor.executeNonQuery(sqlExecutor.getSqlParser().formatCommand(
						"INSERT INTO DMA_WEBACTION (ACTION_ID,SYS_CODE,SERVICE_ID,ACTION_NAME,METHOD_NAME,ACTION_DESC) VALUES (%s,%s,%s,%s,%s,%s)", new SqlValue(java.util.UUID.randomUUID().toString()),
						new SqlValue(objSysCode.toString()),
						new SqlValue(serviceId),
						new SqlValue(method.getSoapAction()), new SqlValue(method.getMethodName()), new SqlValue("")));*/
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
								new MethodParam(hPNode.name, hPNode.dataType, !WebServiceProxy.isServiceBaseDataType(hPNode.dataType)));
					}
					method.getHeadParams().add(head);
				}
			}
			if (operation.inMessage.nodes != null)
			{
				method.setMethodParams(new ArrayList<MethodParam>());
				for (SchemaNode param : operation.inMessage.nodes)
				{
					method.getMethodParams().add(new MethodParam(param.name, param.dataType, !WebServiceProxy.isServiceBaseDataType(param.dataType)));
				}
			}
			serviceInfo.getMethods().add(method);
		}
		return serviceInfo;
	}
	
	/**
	 * 移除服务
	 * 
	 * @param serviceItem
	 *        服务项
	 */
	public void serviceDelete(jetsennet.jdma.schema.ServiceItemType serviceItem) throws Exception
	{
		if ((serviceItem == null)
				|| (StringUtil.isNullOrEmpty(serviceItem.getServiceCode()) && StringUtil.isNullOrEmpty(serviceItem.getServiceURL())))
		{
			throw new Exception("无效的参数!");
		}

		Object objSysId = getReplaceDao().querySingleObject(Object.class,"SELECT SYS_ID FROM DMA_APPSYSTEM WHERE SYS_CODE='"+serviceItem.getSystemCode()+"'");
		if (objSysId == null)
		{
			throw new Exception("无效的系统代号!");
		}

		SqlCondition c0 = null;
		if (StringUtil.isNullOrEmpty(serviceItem.getServiceCode()))
		{
			c0 = new SqlCondition();
			c0.setSqlLogicType(SqlLogicType.And);
			c0.getSqlConditions().add(
					new SqlCondition("WSDL_PATH", serviceItem.getServiceURL(), SqlLogicType.Or, SqlRelationType.Equal, SqlParamType.String));
			c0.getSqlConditions().add(
					new SqlCondition("SERVICE_URL", serviceItem.getServiceURL(), SqlLogicType.Or, SqlRelationType.Equal, SqlParamType.String));
		}
		else
		{
			c0 = new SqlCondition("SERVICE_CODE", serviceItem.getServiceCode(), SqlLogicType.And, SqlRelationType.Equal, SqlParamType.String);
		}
		getReplaceDao().delete(DmaWebservice.class, new SqlCondition("SYS_ID", objSysId.toString(), SqlLogicType.And, SqlRelationType.Equal, SqlParamType.String), c0);
//		dalWebService.delete(new SqlCondition("SYS_ID", objSysId.toString(), SqlLogicType.And, SqlRelationType.Equal, SqlParamType.String), c0);

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

		Object objSysId = getReplaceDao().querySingleObject(Object.class,"Select SYS_ID From DMA_APPSYSTEM Where STATE=0 AND SYS_CODE='"+sysCode+"'");
		if (objSysId == null)
		{
			throw new Exception("无效的系统代号!");
		}

		if (!objSysId.toString().equals(sysToken))
		{
			throw new Exception("无效的系统认证!");
		}

		SqlCondition c0 = null;
		if ((serviceCodeOrUrl.length() < 50) && (serviceCodeOrUrl.indexOf(".") < 0) && (serviceCodeOrUrl.indexOf("/") < 0))
		{
			new SqlCondition("SERVICE_CODE", serviceCodeOrUrl, SqlLogicType.And, SqlRelationType.Equal, SqlParamType.String);
		}
		else
		{
			new SqlCondition("SERVICE_URL", serviceCodeOrUrl, SqlLogicType.And, SqlRelationType.Equal, SqlParamType.String);
		}
		getReplaceDao().delete(DmaWebservice.class, new SqlCondition("SYS_ID", sysToken, SqlLogicType.And, SqlRelationType.Equal, SqlParamType.String), c0);
//		dalWebService.delete(new SqlCondition("SYS_ID", sysToken, SqlLogicType.And, SqlRelationType.Equal, SqlParamType.String), c0);

		WebServiceProxy.removeServiceCache(serviceCodeOrUrl);
	}
	
	/**
	 * 查找服务
	 * 
	 * @param requestXml
	 * @return String
	 */
	public String serviceFind(String requestXml) throws Exception
	{
		if (StringUtil.isNullOrEmpty(requestXml))
		{
			throw new Exception("无效的参数!");
		}
		Element rootNode = DocumentHelper.parseText(requestXml).getRootElement();
		//Document xmlDoc = DocumentHelper.parseText(requestXml);
		//Node rootNode = xmlDoc.getRootElement();
		String sysCode = rootNode.selectSingleNode("SystemCode").getText();//FormatUtil.tryGetItemText(rootNode, "SystemCode", "").trim();
		String sysType = rootNode.selectSingleNode("SystemType").getText();//FormatUtil.tryGetItemText(rootNode, "SystemType", "").trim();
		String serviceCode = rootNode.selectSingleNode("ServiceCode").getText();//FormatUtil.tryGetItemText(rootNode, "ServiceCode", "").trim();
		String sysOName = rootNode.selectSingleNode("OperationName").getText();//FormatUtil.tryGetItemText(rootNode, "OperationName", "").trim();

		SqlCondition c0 = StringUtil.isNullOrEmpty(sysCode) ? null : new SqlCondition("SYS_CODE", sysCode, SqlLogicType.And, SqlRelationType.Equal,
				SqlParamType.String);
		SqlCondition c1 = StringUtil.isNullOrEmpty(sysType) ? null : new SqlCondition("SYS_TYPE", sysType, SqlLogicType.And, SqlRelationType.Equal,
				SqlParamType.Numeric);
		SqlCondition c2 = StringUtil.isNullOrEmpty(serviceCode) ? null : new SqlCondition("SERVICE_CODE", serviceCode, SqlLogicType.And,
				SqlRelationType.Equal, SqlParamType.String);
		SqlCondition c3 = new SqlCondition("W.STATE", "0", SqlLogicType.And, SqlRelationType.Equal, SqlParamType.Numeric);

		List<Object> objs = getReplaceDao().queryBusinessObjs(Object.class, "Select SYS_NAME,SYS_CODE,SYS_TYPE,SERVICE_NAME,SERVICE_URL,SERVICE_CODE FROM DMA_WEBSERVICE W inner join DMA_APPSYSTEM S on W.SYS_ID=S.SYS_ID "
						+ "WHERE SYS_CODE='"+c0+"' SYS_TYPE="+c1+" SERVICE_CODE='"+c2+"' W.STATE="+c3);
		/*Document ds = sqlExecutor
				.fill("Select SYS_NAME,SYS_CODE,SYS_TYPE,SERVICE_NAME,SERVICE_URL,SERVICE_CODE FROM DMA_WEBSERVICE W inner join DMA_APPSYSTEM S on W.SYS_ID=S.SYS_ID "
						+ sqlExecutor.getSqlParser().parseSqlCondition(c0, c1, c2, c3));*/
		StringBuilder sbResult = new StringBuilder();
		sbResult.append("<RecordSet>");

//		List<Node> items = ds.getRootElement().elements();
		for (int i = 0; i < objs.size(); i++)
		{
			Object obj = objs.get(i);
			if (obj == null)
			{
				continue;
			}

			String serviceUrl = obj.toString();
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

				/*sbResult
						.append(String
								.format(
										"<Record>" +
											"<SystemName>%s</SystemName>" +
											"<ServiceName>%s</ServiceName>" +
											"<ServiceUrl>%s</ServiceUrl>" +
											"<SystemCode>%s</SystemCode>" +
											"<SystemType>%s</SystemType>" +
											"<ServiceCode>%s</ServiceCode>" +
										"</Record>",
										FormatUtil.tryGetItemText(items.get(i), "SYS_NAME", ""), FormatUtil.escapeXml(FormatUtil.tryGetItemText(items
												.get(i), "SERVICE_NAME", "")), serviceUrl, FormatUtil.tryGetItemText(items.get(i), "SYS_CODE", ""),
										FormatUtil.tryGetItemText(items.get(i), "SYS_TYPE", ""), FormatUtil.tryGetItemText(items.get(i), "SYS_TYPE",
												"")));*/
			}
		}
		sbResult.append("</RecordSet>");

		return sbResult.toString();
	}

	
}
