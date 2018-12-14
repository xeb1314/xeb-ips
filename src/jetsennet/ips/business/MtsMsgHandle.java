/* 
 * Copyright (c) 北京捷成世纪科技股份有限公司. All Rights Reserved.
 * 文件：jetsennet.ips.business.MtsMsgBusiness.java
 * 日 期：2015年4月8日 上午10:58:14
 * 作 者：刘紫荣
 */
package jetsennet.ips.business;

import org.apache.log4j.Logger;

import jetsennet.ips.mts.ICommand;
import jetsennet.ips.mts.IMtsFormat;
import jetsennet.ips.mts.MtsAck;
import jetsennet.ips.mts.MtsFormat;
import jetsennet.ips.mts.MtsGatherTaskNewResponse;
import jetsennet.ips.mts.MtsGatherTaskResult;
import jetsennet.ips.mts.MtsTerminalOperation;
import jetsennet.ips.websocket.ChatServer;
import jetsennet.net.HttpRequestProxy;
import jetsennet.util.SpringContextUtil;

/**
 *  TODO 添加该类的简单功能说明以及算法
 *
 * @author <a href="mailto:liuzirong@jetsen.com">刘紫荣</a>
 * @version 1.0.0
 * ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝<br/>
 * 修订日期                 修订人            描述<br/>
 * 2015年4月8日       刘紫荣            创建<br/>
 */
public class MtsMsgHandle{
	private static final Logger logger = Logger.getLogger(MtsMsgHandle.class);
	
	private IMtsFormat messageFormat = new MtsFormat();
	
	/**
	 * 发送http请求消息
	 */
	public ICommand request(ICommand command,String requestUrl) throws Exception
	{
		String messageText = this.messageFormat.marshal(command);
		
		logger.debug("发送：" + messageText);
		
		String result = HttpRequestProxy.send(requestUrl, messageText);
		
		logger.debug("接收：" + result);
		
		return (ICommand) this.messageFormat.unmarshal(result);
	}
	
	/**
	 * 应答http请求消息处理
	 */
	public String onRequest(String messageText) throws Exception
	{
	        ICommand command = null;
	        MtsAck mtsAck = new MtsAck();

	        try
	        {
	            command = (ICommand) messageFormat.unmarshal(messageText);
	        }
	        catch (Exception e)
	        {
	            mtsAck.setStateCode(-1);
	            mtsAck.setStateDesc("无法识别消息");
	            return messageFormat.marshal(mtsAck);
	        }

	        if (command == null)
	        {
	            mtsAck.setStateCode(-1);
	            mtsAck.setStateDesc("无法识别消息");
	            return messageFormat.marshal(mtsAck);
	        }

	        String result = null;

	        try
	        {
	            result = messageFormat.marshal(onMessage(command));
	        }
	        catch (Exception ex)
	        {
	            mtsAck.setStateCode(-1);
	            mtsAck.setStateDesc("处理消息异常");
	            return messageFormat.marshal(mtsAck);
	        }

	        return result;
	}
	
	  /**
     * 消息处理
     * 接收执行器的HTTP消息
     * 接收接口过来的HTTP消息
     * @param command MTS消息命令
     * @return
     */
    public ICommand onMessage(ICommand command)
    {
        MtsAck mtsAck = new MtsAck();

        if (command instanceof MtsGatherTaskResult)
        {
        	MtsGatherTaskResult mtsTaskResult = (MtsGatherTaskResult) command;
            return onMtsTaskResultMessage(mtsTaskResult);
        }else if (command instanceof MtsGatherTaskNewResponse)
        {
        	MtsGatherTaskNewResponse mtsGatherTaskNewResponse = (MtsGatherTaskNewResponse) command;
            return onMtsGatherTaskNewResponse(mtsGatherTaskNewResponse);
        }else if (command instanceof MtsTerminalOperation)
        {
        	MtsTerminalOperation mtsTerminalOperation = (MtsTerminalOperation) command;
            return onMtsTerminalOperation(mtsTerminalOperation);
        }

        return mtsAck;
    }
    
    public ICommand onMtsTaskResultMessage(MtsGatherTaskResult mtsTaskResult)
    {
    	MtsAck mtsAck = new MtsAck();
    	try {
			GatherTaskStatBusiness gatherTaskStatBusiness = (GatherTaskStatBusiness) SpringContextUtil.getBean("gatherTaskStatBusiness");
			gatherTaskStatBusiness.saveGatherStat(mtsTaskResult);
		} catch (Exception e) {
            mtsAck.setStateCode(-1);
            mtsAck.setStateDesc("处理消息异常:"+e);
            logger.error("onMtsTaskResultMessage处理消息异常:"+e);
		}
    	return mtsAck;
    }
    
    public ICommand onMtsGatherTaskNewResponse(MtsGatherTaskNewResponse mtsGatherTaskNewResponse)
    {
    	MtsAck mtsAck = new MtsAck();
    	try {
			GatherTaskStatBusiness gatherTaskStatBusiness = (GatherTaskStatBusiness) SpringContextUtil.getBean("gatherTaskStatBusiness");
			gatherTaskStatBusiness.saveGatherTaskNewResponse(mtsGatherTaskNewResponse);
		} catch (Exception e) {
            mtsAck.setStateCode(-1);
            mtsAck.setStateDesc("处理消息异常:"+e);
            logger.error("onMtsGatherTaskNewResponse处理消息异常:"+e);
		}
    	return mtsAck;
    }
    
    public ICommand onMtsTerminalOperation(MtsTerminalOperation mtsTerminalOperation)
    {
    	MtsAck mtsAck = new MtsAck();
    	try {
    		ChatServer chatServer = (ChatServer) SpringContextUtil.getBean("chatServer");
    		chatServer.onRecieveTerminalOperation(mtsTerminalOperation);
		} catch (Exception e) {
            mtsAck.setStateCode(-1);
            mtsAck.setStateDesc("处理消息异常:"+e);
            logger.error("onMtsTerminalOperation处理消息异常:"+e);
		}
    	return mtsAck;
    }
}
