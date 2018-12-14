/* 
 * Copyright (c) 北京捷成世纪科技股份有限公司. All Rights Reserved.
 * 文件：jetsennet.jwfm.servlet.MsgServer.java
 * 日 期：2014-10-31 下午4:04:14
 * 作 者：梁继杰
 */
package jetsennet.ips.servlet;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.sql.Timestamp;
import java.util.Date;
import java.util.UUID;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import jetsennet.ips.business.CollecBusiness;
import jetsennet.ips.business.MtsMsgHandle;
import jetsennet.jdma.schema.DmaWebinvoke;
import jetsennet.util.DateUtil;
import jetsennet.util.SerializerUtil;
import jetsennet.util.SpringContextUtil;

import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.dom4j.Node;

/**
 *  TODO 添加该类的简单功能说明以及算法
 *
 * @author <a href="mailto:liangjijie@jetsen.cn">梁继杰</a>
 * @version 1.0.0
 * ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝<br/>
 * 修订日期                 修订人            描述<br/>
 * 2014-10-31       梁继杰           创建<br/>
 */
public class MsgServer extends HttpServlet {

	/* (non-Javadoc)
	 * @see javax.servlet.http.HttpServlet#doGet(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		// TODO Auto-generated method stub
		this.doPost(req, resp);
	}

	/* (non-Javadoc)
	 * @see javax.servlet.http.HttpServlet#doPost(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		PrintWriter out = response.getWriter();
		response.setContentType("text/xml;charset=UTF-8");
		InputStreamReader inr = new InputStreamReader(request.getInputStream(), java.nio.charset.Charset.forName("utf-8"));
		StringWriter sw = new StringWriter();
		CollecBusiness collecBusiness = null;
		String uuId = "";
		try
		{
			char[] buf = new char[8096];
			int size = 0;
			while ((size = inr.read(buf)) != -1)
			{
				sw.write(buf, 0, size);
			}
	
			collecBusiness = (CollecBusiness) SpringContextUtil.getBean("collecBusiness");
			
			String messgeText = sw.toString();
			uuId = UUID.randomUUID().toString();
		
			DmaWebinvoke dmaWebinvoke = new DmaWebinvoke();
			dmaWebinvoke.setInvokeId(uuId);
			dmaWebinvoke.setActionName(request.getRequestURL().toString());
			dmaWebinvoke.setRequestXml(messgeText);
			dmaWebinvoke.setRequestTime(new Timestamp(new Date().getTime()));
			
			Element root = DocumentHelper.parseText(SerializerUtil.serialize(dmaWebinvoke, "dmaWebinvoke")).getRootElement();
			DmaWebinvoke ipsWebInvoke = SerializerUtil.deserialize(DmaWebinvoke.class, root);
			//请求消息存入dma_webinvoke表
			collecBusiness.getDao().saveBusinessObjs(ipsWebInvoke);
			//请求消息的返回结果
			String onHandleResStr = new MtsMsgHandle().onRequest(messgeText);
			out.write(onHandleResStr);
			//解析返回的xml
			Element rootResult = DocumentHelper.parseText(onHandleResStr).getRootElement();
			Element mtsAck = rootResult.element("mtsAck");
			String stateCode = mtsAck.selectSingleNode("stateCode").getText();
			int state = 0;
			if(stateCode.equals("-1")){
				state = 1;
			}
			//响应消息存入dma_webinvoke表
			collecBusiness.getDao().update(String.format("UPDATE DMA_WEBINVOKE SET RESPONSE_XML='%s',RESPONSE_TIME='%s' ,STATE=%s WHERE INVOKE_ID='%s'", onHandleResStr,new Timestamp(new Date().getTime()),state,uuId));
		}
		catch (Exception ex)
		{			
		}
		finally
		{
			sw.close();
			inr.close();
			out.close();
		}
	}
	
}
