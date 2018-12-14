package jetsennet.ips.business;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import org.dom4j.Attribute;
import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.iipg.hurricane.client.HConnException;
import org.iipg.hurricane.client.HConnFactory;
import org.iipg.hurricane.client.HConnection;
import org.iipg.hurricane.client.metadata.HCriteria;
import org.iipg.hurricane.client.metadata.HDocument;
import org.iipg.hurricane.client.metadata.HDocumentList;
import org.iipg.hurricane.client.metadata.HQuery;
import org.iipg.hurricane.client.metadata.HQueryFactory;
import org.iipg.hurricane.client.response.QueryResponse;
import org.iipg.hurricane.client.response.UpdateResponse;

import jetsennet.frame.business.BaseBusiness;
import jetsennet.ips.schema.IpsDatasource;
import jetsennet.ips.schema.IpsOrder;
import jetsennet.jdma.schema.DmaWebinvoke;
import jetsennet.net.HttpRequestProxy;
import jetsennet.util.ConfigUtil;
import jetsennet.util.ConvertUtil;
import jetsennet.util.SerializerUtil;
import jetsennet.util.SpringContextUtil;
import jetsennet.util.StringUtil;
import jetsennet.util.XmlUtil;

public class JFBusiness extends BaseBusiness{
	String fileName = "";
	
	private HConnection conn = HConnFactory.getInstance("config.client");
	//已处理数据MessageID 集合
	private static List<String> existsList = new ArrayList<String>();
	
	public JFBusiness() {
		//conn = HConnFactory.getInstance("config.client");
	}
	
	public boolean createTable(IpsOrder order, String userName, IpsDatasource ipsDataSource) throws Exception
	{
//		String tableName = userName+"_"+ipsDataSource.getDsName();
		
		String tableName = "";
		
		fileName = ipsDataSource.getDsClass()+"_"+ipsDataSource.getDbType()+".xml";
		StringBuffer schemaContent = fileReaderAll(fileName, "UTF-8");
		if(schemaContent.length() != 0)
		{
			Document schemaDoc = DocumentHelper.parseText(schemaContent.toString());
			Element document = schemaDoc.getRootElement();
			Attribute attribute = document.attribute("name");
			//时间戳
			SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyyMMddHHmmssSSS");
			Date currentDate = new Date();
			String newFileName = simpleDateFormat.format(currentDate);
			
			tableName = ipsDataSource.getStr1() +"_"+userName;//+"_"+newFileName
			
			//生成新表名
			attribute.setValue(tableName);
			String newSchema = schemaDoc.asXML().replace("\n", "");
			
			
			String url = ConfigUtil.getProperty("jf.url");
			StringBuilder msgSb = new StringBuilder();
			msgSb.append("wt=json");
			msgSb.append("&");
			msgSb.append("action=CREATE");
			msgSb.append("&");
			msgSb.append("stream.body=");
			msgSb.append(newSchema);
			msgSb.append("&");
			msgSb.append("forceOnError=true");
			String responseMsg = HttpRequestProxy.send(url, msgSb.toString());
			System.out.println(responseMsg);
//			{"responseHeader":{"message":"","status":0,"QTime":14102},"data":{"success":[{"desc":"邮件表ver3","name":"emailv3_123","create":true}]}}
			Object obj = ConvertUtil.jsonToObject(Object.class, responseMsg);
			
//			TODO: doSomething();
			IpsDataSourceBusiness ipsDataSourceBusiness = (IpsDataSourceBusiness) SpringContextUtil.getBean("ipsDataSourceBusiness");
			ipsDataSource.setStr1(tableName);
			int updateBusinessObjs = ipsDataSourceBusiness.getDao().updateBusinessObjs(true,ipsDataSource);
//			int commonObjUpdateByPk = ipsDataSourceBusiness.getDao().commonObjUpdateByPk("IPS_DATASOURCE", SerializerUtil.serialize(ipsDataSource, "ipsDataSrouceInfo"), true);
			if(updateBusinessObjs != 0)
			{
				StringBuilder msgServerSb = new StringBuilder();
				msgServerSb.append("<mts version=\"2.1\">");
				msgServerSb.append("<mtsOrderInfo>");
				msgServerSb.append("<userName>");
				msgServerSb.append(userName);
				msgServerSb.append("</userName>");
				msgServerSb.append("<orderId>");
				msgServerSb.append(order.getOrderId());
				msgServerSb.append("</orderId>");
				msgServerSb.append("<DsID>");
				msgServerSb.append(ipsDataSource.getDsId());
				msgServerSb.append("</DsID>");
				msgServerSb.append("<tableName>");
				msgServerSb.append(ipsDataSource.getStr1());
				msgServerSb.append("</tableName>");
				msgServerSb.append("<orderInfo>");
//				msgServerSb.append(order.getOrderInfo());
				msgServerSb.append("</orderInfo>");
				msgServerSb.append("</mtsOrderInfo>");
				msgServerSb.append("</mts>");
				
				//消息
				DmaWebinvoke dmaWebinvoke = new DmaWebinvoke();
				dmaWebinvoke.setInvokeId(UUID.randomUUID().toString());
				dmaWebinvoke.setActionName(ConfigUtil.getProperty("msg.server.ip")+":"+ConfigUtil.getProperty("msg.server.port"));
				dmaWebinvoke.setRequestXml(msgServerSb.toString());
				dmaWebinvoke.setRequestTime(new Timestamp(new Date().getTime()));
				
				Element dmaRoot = DocumentHelper.parseText(SerializerUtil.serialize(dmaWebinvoke, "dmaWebinvoke")).getRootElement();
				DmaWebinvoke ipsWebInvoke = SerializerUtil.deserialize(DmaWebinvoke.class, dmaRoot);
				ipsDataSourceBusiness.getDao().saveBusinessObjs(ipsWebInvoke);
				
				String response = SocketMsgProxy.send(ConfigUtil.getProperty("msg.server.ip"), 
						Integer.parseInt(ConfigUtil.getProperty("msg.server.port")), msgServerSb.toString());
				
				dmaWebinvoke.setResponseXml(response);
				dmaWebinvoke.setResponseTime(new Timestamp(new Date().getTime()));
				
				dmaRoot = DocumentHelper.parseText(SerializerUtil.serialize(dmaWebinvoke, "dmaWebinvoke")).getRootElement();
				ipsWebInvoke = SerializerUtil.deserialize(DmaWebinvoke.class, dmaRoot);
				ipsDataSourceBusiness.getDao().updateBusinessObjs(false, dmaWebinvoke);
				
			}
		}
		return true;
	}
	
	public void copyData(IpsOrder order, IpsDatasource ipsDataSource) throws Exception
	{
		
		IpsDataSourceBusiness ipsDataSourceBusiness = (IpsDataSourceBusiness) SpringContextUtil.getBean("ipsDataSourceBusiness");

		IpsDatasource oldDS = ipsDataSourceBusiness.getDataSourceByDsID(ipsDataSource.getParentId());
		if(oldDS == null)throw new Exception("数据源不存在！");
		fileName = ipsDataSource.getDsClass()+"_"+ipsDataSource.getDbType()+".xml";
		
		String orderInfoStr = order.getOrderInfo();
		Document doc = DocumentHelper.parseText(orderInfoStr);
		Element root = doc.getRootElement();
		Element mtsOrders = root.element("mtsOrder");
		Element orderInfos = mtsOrders.element("orderInfo");
		String conditionQL = XmlUtil.tryGetItemText(orderInfos, AttributeItemName.ConditionQL, "*:*");
		
		HDocumentList hDocumentList = new HDocumentList();
		HCriteria crit = new HCriteria();
		
		List<Element>fieldList = null;
		StringBuffer schemaContent = fileReaderAll(fileName, "UTF-8");
		if(schemaContent.length() != 0)
		{
			Document schemaDoc = DocumentHelper.parseText(schemaContent.toString());
			Element document = schemaDoc.getRootElement();
			fieldList = document.selectNodes("fields/field");
			for(Element ele:fieldList)
			{
				crit.addSelectField(ele.attributeValue("name"));
			}
		}
		crit.setQStr(conditionQL);
		HQuery hq = HQueryFactory.newQuery(oldDS.getStr1(), crit);
	    QueryResponse resp = this.conn.query(hq);
	    HDocumentList list = resp.getResults();
	    for(int i=0;i<list.size();i++)
	    {
	    	HDocument oldhdoc = list.get(i);
			if(existsList.contains(oldhdoc.getValue("SID").toString()))
				continue;
			HDocument newhdoc = new HDocument();
			newhdoc.setSchema(ipsDataSource.getStr1());
			for(Element ele:fieldList)
			{
				String attributeName = ele.attributeValue("name");
				if("AffixDat".equals(attributeName))continue;
				//String attributeType = ele.attributeValue("int");
				Object value = oldhdoc.getValue(attributeName);
				if(value!=null)
					newhdoc.setField(attributeName, value);
			}
//	    	newhdoc.setBField("AffixDat", newhdoc.getBField("AffixDat"));
	    	String oldMessageId = (String) oldhdoc.getValue("SID");
	    	newhdoc.setField("SPID", oldMessageId);
	    	newhdoc.setField("SID", UUID.randomUUID().toString());
			Object obj = oldhdoc.getValue("AffixDat");
			if(obj!=null)
			{
				String[] split = obj.toString().split(",");
				for(String item : split)
				{
					HDocument hBlob = getHBlob(oldhdoc.getValue("SID").toString(),item.replace("[", "").replace("]", ""),oldDS.getStr1());
					newhdoc.addBField("AffixDat", hBlob.getBinary());
				}
			}
			
			//testing
//			for(Element ele:fieldList)
//			{
//				if(newhdoc.getValue(ele.attributeValue("name"))!=null)
//					System.out.println(ele.attributeValue("name")+":"+ele.attributeValue("type")+":"+newhdoc.getValue(ele.attributeValue("name")));
//			}
			
			existsList.add(oldMessageId);
			hDocumentList.add(newhdoc);
	    }
	    UpdateResponse upres = conn.add(hDocumentList);
	}
	
	private HDocument getHBlob(String id, String itemID,String SCHEMA_NAME) throws Exception {
		HCriteria crit = new HCriteria();
		crit.addEqualTo("uid", id);
		crit.addEqualTo("item", itemID);

		byte[] buf = null;
		
		HQuery q = HQueryFactory.newQuery(SCHEMA_NAME, crit);
		
		QueryResponse resp = null;
		
		HDocumentList list = null;
		HDocument doc = null;
		try {
			resp = conn.getBinary(q);		
			list = resp.getResults();
			doc = list.get(0);
			buf = doc.getBinary();
			
			System.out.println(new String(buf, "gbk"));
		} catch (HConnException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} 
		return doc;
	}
	
	public int getHDocumentRowsSize(IpsOrder ipsOrder, String userName, IpsDatasource ipsDataSource) throws Exception
	{
		IpsDataSourceBusiness ipsDataSourceBusiness = (IpsDataSourceBusiness) SpringContextUtil.getBean("ipsDataSourceBusiness");

		IpsDatasource oldDS = ipsDataSourceBusiness.getDataSourceByDsID(ipsDataSource.getParentId());
		String orderInfoStr = ipsOrder.getOrderInfo();
		Document doc = DocumentHelper.parseText(orderInfoStr);
		Element root = doc.getRootElement();
		Element mtsOrders = root.element("mtsOrder");
		Element orderInfos = mtsOrders.element("orderInfo");
		String conditionQL = XmlUtil.tryGetItemText(orderInfos, AttributeItemName.ConditionQL, "*:*");
		
		HCriteria crit = new HCriteria();
		crit.setRowCount(1);
		crit.setQStr(conditionQL);
		HQuery hq = HQueryFactory.newQuery(oldDS.getStr1(), crit);
	    QueryResponse resp = this.conn.query(hq);
	    return resp.getTotalCount();
	}
	private StringBuffer fileReaderAll(String FileName, String charset)throws IOException {
		StringBuffer row = new StringBuffer();
		BufferedReader reader = new BufferedReader(new InputStreamReader(  
				ConfigUtil.class.getResourceAsStream("/"+FileName), charset));
		String line = new String();
		while ((line = reader.readLine()) != null) {  
			row.append(line);
		}
		reader.close();
		return row;  
	}
}
