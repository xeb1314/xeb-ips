/************************************************************************
日  期：		2012-08-15
作  者:		李小敏
版  本：     1.0
描  述:	    
历  史：      
************************************************************************/
package jetsennet.ips.mts;

/**
 * Mts消息格式解析
 * @author Administrator
 *
 */
public interface IMtsFormat
{
	/**
	 * 从对象至字符串
	 * @param object
	 * @return
	 */
	String marshal(ICommand object);
	
	/**
	 * 从字符串至对象
	 * @param message
	 * @return
	 * @throws Exception
	 */
	ICommand unmarshal(String message) throws Exception;
}
