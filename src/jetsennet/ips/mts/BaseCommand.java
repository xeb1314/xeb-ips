/************************************************************************
日  期：		2012-08-15
作  者:		李小敏
版  本：     1.0
描  述:	    
历  史：      
************************************************************************/
package jetsennet.ips.mts;

/**
 * 消息基类
 * @author lixiaomin
 *
 */
public class BaseCommand implements ICommand
{
	
	protected String protocolVersion = "2.1";//协议版本号
	/**
	 * 返回消息类型
	 * @return
	 */
	public byte getCommandType()
	{
		return CommandTypes.MTS_ACK;
	}
	
	/**
	 * 是否是任务消息
	 * @return
	 */
	public boolean isTaskCommand()
	{
		return false;
	}
	
	/**
	 * 是否是执行器注册
	 * @return
	 */
	public boolean isActorCheckIn()
	{
		return false;
	}
	
	/**
	 * 是否是执行器注销
	 * @return
	 */
	public boolean isActorCheckOut()
	{
		return false;
	}
	
	/**
	 * 是否是应答消息
	 * @return
	 */
	public boolean isAck()
	{
		return false;
	}
	
	/**
	 * 是否任务结果
	 */
	public boolean isTaskResult()
	{
		return false;
	}
	
	/**
	 * 是否新任务
	 */
	public boolean isTaskNew()
	{
		return false;
	}

	/**
	 * 返回协议版本
	 * @return
	 */
	public String getProtocolVersion() 
	{
		return protocolVersion;
	}
	
	public void setProtocolVersion(String protocolVersion) 
	{
		this.protocolVersion = protocolVersion;
	}

}
