/* 
 * Copyright (c) 北京捷成世纪科技股份有限公司. All Rights Reserved.
 * 文件：jetsennet.ips.business.CollecBusiness.java
 * 日 期：2014-11-25 下午02:45:12
 * 作 者：薛恩彬
 */
package jetsennet.ips.business;

import java.net.ConnectException;
import java.net.InetAddress;
import java.sql.Timestamp;
import java.util.Date;

import jetsennet.frame.business.BaseBusiness;
import jetsennet.frame.business.Business;
import jetsennet.ips.schema.IpsCommmsg;
import jetsennet.jdma.schema.DmaWebinvoke;
import jetsennet.net.HttpRequestProxy;
import jetsennet.util.ConfigUtil;
import jetsennet.util.SerializerUtil;

import org.dom4j.DocumentHelper;
import org.dom4j.Element;

/**
 *  TODO 添加该类的简单功能说明以及算法
 *
 * @author <a href="mailto:xueenbin@jetsen.cn">薛恩彬</a>
 * @version 1.0.0
 * ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝<br/>
 * 修订日期                 修订人            描述<br/>
 * 2014-11-25       薛恩彬           创建<br/>
 */
public class CollecBusiness extends BaseBusiness {
	
	  @Business
	  public String commonObjInsert(String xml) throws Exception{
		  
		String hostIp = "";
		String hostName = "";
		InetAddress addr = InetAddress.getLocalHost();
		hostIp = addr.getHostAddress();//获得本机IP
		hostName = addr.getHostName();//获得本机名称
			
		Element root = DocumentHelper.parseText(xml).getRootElement();
		/*String sysId = request.getParameter("SysId");
		String devId = request.getParameter("DevId");
		String sysName = request.getParameter("SysName");
		String devName = request.getParameter("DevName");
		String devUrl = request.getParameter("DevUrl");*/
		
		StringBuilder sbMessage = new StringBuilder();
		String actionName = root.selectSingleNode("ACTION_NAME").getText();
		sbMessage.append("<mts version=\"2.0\">");
		sbMessage.append("<mtsDeviceRegister>");
		sbMessage.append("<SystemID>");
		sbMessage.append(root.selectSingleNode("SRC_CODE").getText());
		sbMessage.append("</SystemID>");
		sbMessage.append("<DeviceID>");
		sbMessage.append(actionName);
		sbMessage.append("</DeviceID>");
		sbMessage.append("<SystemName>");
		sbMessage.append(root.selectSingleNode("SysName").getText());
		sbMessage.append("</SystemName>");
		sbMessage.append("<DeviceName>");
		sbMessage.append(root.selectSingleNode("DevName").getText());
		sbMessage.append("</DeviceName>");
		sbMessage.append("<ManagerIP>");
		sbMessage.append(hostIp);
		sbMessage.append("</ManagerIP>");
		sbMessage.append("<ManagerPort>");
		sbMessage.append(ConfigUtil.getProperty("ips.server.port"));
		sbMessage.append("</ManagerPort>");
		sbMessage.append("<ProtocolType>");
		sbMessage.append("http");
		sbMessage.append("</ProtocolType>");
		sbMessage.append("</mtsDeviceRegister>");
		sbMessage.append("</mts>");
		
		String requestXml = sbMessage.toString();
		String date = new Timestamp(new Date().getTime()).toString();
		
		root.addElement("REQUEST_XML").setText(requestXml);
		root.addElement("REQUEST_TIME").setText(date);
		root.remove(root.selectSingleNode("SysName"));
		root.remove(root.selectSingleNode("DevName"));
		root.remove(root.selectSingleNode("SRC_CODE"));
		root.remove(root.selectSingleNode("DST_CODE"));
//		String xmls = "<mts version=\"2.0\"><mtsDeviceRegister><SystemID>999</SystemID><DeviceID>111</DeviceID><SystemName>测试系统</SystemName><DeviceName>设备2</DeviceName><ManagerIP>192.168.213.133</ManagerIP><ManagerPort>7777</ManagerPort><ProtocolType></ProtocolType></mtsDeviceRegister></mts>";
		DmaWebinvoke ipsCommmsg = SerializerUtil.deserialize(DmaWebinvoke.class, root);
		getDao().saveBusinessObjs(ipsCommmsg);
		String msg = "";
		String state = "0";
		try{
			msg = HttpRequestProxy.send(root.selectSingleNode("ACTION_NAME").getText(), sbMessage.toString());
		}catch(Exception e){
			state = "1";
		}
		Object keyId = getDao().querySingleObject(Object.class, String.format("SELECT INVOKE_ID FROM DMA_WEBINVOKE WHERE REQUEST_XML='%s' AND ACTION_NAME='%s'",requestXml,actionName));
		
		getDao().update(String.format("UPDATE DMA_WEBINVOKE SET RESPONSE_XML ='%s' ,STATE=%s ,RESPONSE_TIME='%s'  WHERE INVOKE_ID='%s'",msg,state,new Timestamp(new Date().getTime()),keyId.toString()));

//			commMsg.add("http",sysId, hostIp, devUrl, devId, "", token, sbMessage.toString(), msg, "", "", hostName, "");
				return msg;
		}
	
}
