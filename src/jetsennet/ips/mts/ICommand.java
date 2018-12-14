/************************************************************************
日  期：		2012-08-15
作  者:		李小敏
版  本：     1.0
描  述:	    
历  史：      
************************************************************************/
package jetsennet.ips.mts;

/**
 * 消息接口
 * @author lixiaomin
 *
 */
public interface ICommand
{
	/**
	 * 返回消息类型
	 * @return
	 */
	byte getCommandType();
	
	/**
	 * 是否是任务消息
	 * @return
	 */
	boolean isTaskCommand();
	
	/**
	 * 是否是执行器注册
	 * @return
	 */
	boolean isActorCheckIn();
	
	/**
	 * 是否是执行器注销
	 * @return
	 */
	boolean isActorCheckOut();
	
	/**
	 * 是否是应答消息
	 * @return
	 */
	boolean isAck();
	
	/**
	 * 是否任务结果
	 * @return
	 */
	boolean isTaskResult();
	
	/**
	 * 是否新任务
	 * @return
	 */
	boolean isTaskNew();
	
	/**
	 * 返回协议版本
	 * @return
	 */
	String getProtocolVersion();
	
	/**
	 * 设定协议版本
	 * 
	 */
	void setProtocolVersion(String protocolVersion);
	
}
