/* 
 * Copyright (c) 北京捷成世纪科技股份有限公司. All Rights Reserved.
 * 文件：jetsennet.ips.business.JFOrderThread.java
 * 日 期：2015年4月2日 下午9:36:06
 * 作 者：刘紫荣
 */
package jetsennet.ips.business;

import java.sql.Timestamp;
import java.util.Date;
import java.util.Timer;
import java.util.TimerTask;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;

import jetsennet.ips.schema.IpsDatasource;
import jetsennet.ips.schema.IpsOrder;
import jetsennet.jdma.schema.DmaWebinvoke;
import jetsennet.util.ConfigUtil;
import jetsennet.util.SerializerUtil;
import jetsennet.util.SpringContextUtil;

import org.apache.log4j.Logger;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;

/**
 *  TODO 添加该类的简单功能说明以及算法
 *
 * @author <a href="mailto:liuzirong@jetsen.com">刘紫荣</a>
 * @version 1.0.0
 * ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝<br/>
 * 修订日期                 修订人            描述<br/>
 * 2015年4月2日       刘紫荣            创建<br/>
 */
public class JFOrderThread extends AbstractOrderThread {
	
	private static final Logger logger = Logger.getLogger(JFOrderThread.class);
	
	private AtomicBoolean timerStarted = null;
	
	private Timer timer = null;
	
	private TimerTask task = null;
	
	private JFBusiness jfBussiness = null;
	public JFOrderThread(String taskName,IpsOrder order, String userName, String userId, IpsDatasource ipsDataSource)
	{
		super(order,userName,userId,ipsDataSource,(IpsOrderBusiness) SpringContextUtil.getBean("ipsOrderBusiness"));
		jfBussiness = (JFBusiness) SpringContextUtil.getBean("jfBussiness");
		timerStarted = new AtomicBoolean(false);
		timer = new Timer(taskName, true);
		logger.debug("启动飓风库订阅单线程: " + taskName + " 订阅单名称： " + order.getOrderName());
	}
	
	@Override
	public void start()
	{
		if (timerStarted.get()) {
			//already start
			return;
		}
		task = new TimerTask() {
			
			@Override
			public void run() {
				try {
					switch(order.getInt1()) {
					case IpsOrderBusiness.IS_COPY_DATASOURCE:
						//创建数据库表，并且更改订单状态为以创建表--200
						if(jfBussiness.createTable(order, userName, ipsDataSource));
						{
							ipsOrderBusiness.updateOrderStateByOrderID(IpsOrderBusiness.IS_CREATE_TABLE, order.getOrderId());
							order.setInt1(IpsOrderBusiness.IS_CREATE_TABLE);
						}
						break;
					case IpsOrderBusiness.IS_CREATE_TABLE:
						jfBussiness.copyData(order, ipsDataSource);
						sendMsg(order,userName,ipsDataSource);
						break;
					}
					
				} catch (Exception e) {
					logger.error(e);
				}
			}
		};
		//timeInterval--6秒执行一次
		timer.schedule(task, delay, timeInterval);
		timerStarted.set(true);
	}
	@Override
	public void stop() {
		if (timerStarted.compareAndSet(true, false)){
			if(task != null) {
				task.cancel();
			}
			synchronized (timer) {
				timer.purge();
				timer.cancel();
				timer = null;
			}
		}
	}

	private void sendMsg(IpsOrder ipsOrder, String userName, IpsDatasource ipsDataSource) throws Exception
	{
		StringBuilder msgSb = new StringBuilder();
		msgSb.append("<mts version=\"2.1\">");
		msgSb.append("<mtsOrderInfo>");
		msgSb.append("<userName>");
		msgSb.append(userName);
		msgSb.append("</userName>");
		msgSb.append("<orderId>");
		msgSb.append(ipsOrder.getOrderId());
		msgSb.append("</orderId>");
		msgSb.append("<DsID>");
		msgSb.append(ipsDataSource.getDsId());
		msgSb.append("</DsID>");
		msgSb.append("<"+AttributeItemName.OrderUID+">");
		msgSb.append(ipsOrder.getStr2());
		msgSb.append("</"+AttributeItemName.OrderUID+">");
		msgSb.append("<tableName>");
		msgSb.append(ipsDataSource.getStr1());
		msgSb.append("</tableName>");
		msgSb.append("<totalCount>");
		msgSb.append(jfBussiness.getHDocumentRowsSize(ipsOrder, userName, ipsDataSource));
		msgSb.append("</totalCount>");
		msgSb.append("<orderInfo>");
//		msgSb.append(ipsOrder.getOrderInfo());
		msgSb.append("</orderInfo>");
		msgSb.append("</mtsOrderInfo>");
		msgSb.append("</mts>");
		
		//消息
		DmaWebinvoke dmaWebinvoke = new DmaWebinvoke();
		dmaWebinvoke.setInvokeId(UUID.randomUUID().toString());
		dmaWebinvoke.setActionName(ConfigUtil.getProperty("msg.server.ip")+":"+ConfigUtil.getProperty("msg.server.port"));
		dmaWebinvoke.setRequestXml(msgSb.toString());
		dmaWebinvoke.setRequestTime(new Timestamp(new Date().getTime()));
		
		Element dmaRoot = DocumentHelper.parseText(SerializerUtil.serialize(dmaWebinvoke, "dmaWebinvoke")).getRootElement();
		DmaWebinvoke ipsWebInvoke = SerializerUtil.deserialize(DmaWebinvoke.class, dmaRoot);
		jfBussiness.getDao().saveBusinessObjs(ipsWebInvoke);
		String response = "";
		try {
			response = SocketMsgProxy.send(ConfigUtil.getProperty("msg.server.ip"), 
					Integer.parseInt(ConfigUtil.getProperty("msg.server.port")), msgSb.toString());
		} catch (Exception e) {
			throw new Exception("与MsgServer通信异常! ServerIp: "+ ConfigUtil.getProperty("msg.server.ip") + "ServerPort: " + ConfigUtil.getProperty("msg.server.port"),e);
		}
		
		dmaWebinvoke.setResponseXml(response);
		dmaWebinvoke.setResponseTime(new Timestamp(new Date().getTime()));
		
		dmaRoot = DocumentHelper.parseText(SerializerUtil.serialize(dmaWebinvoke, "dmaWebinvoke")).getRootElement();
		ipsWebInvoke = SerializerUtil.deserialize(DmaWebinvoke.class, dmaRoot);
		jfBussiness.getDao().updateBusinessObjs(true, dmaWebinvoke);
	}
}
