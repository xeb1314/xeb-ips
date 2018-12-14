/************************************************************************
日  期：		2012-08-15
作  者:		李小敏
版  本：     1.0
描  述:	    
历  史：      
************************************************************************/
package jetsennet.ips.mts;

/**
 * 消息解析器接口
 * @author lixiaomin
 *
 */
public interface IMtsCommandMarshaller
{
	/**
     * 消息类型
     * @return
     */
    byte getCommandType();
    
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
    
    /**
     * 创建消息
     * @return
     */
    ICommand createCommand();
   
    /**
     * 封装
     * @param format
     * @param c
     * @param ds
     * @throws IOException
     */
    String marshal(IMtsFormat format, ICommand c);
    
    /**
     * 解封装
     * @param format
     * @param data
     * @param dis
     * @throws IOException
     */
    void unmarshal(IMtsFormat format,ICommand command, String commandText) throws Exception;

}
