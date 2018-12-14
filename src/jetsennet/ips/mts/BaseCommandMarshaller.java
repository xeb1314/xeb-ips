/************************************************************************
日  期：		2012-08-15
作  者:		李小敏
版  本：     1.0
描  述:	    
历  史：      
 ************************************************************************/
package jetsennet.ips.mts;

import jetsennet.util.StringUtil;
import jetsennet.util.XmlUtil;

/**
 * 消息解析器基类
 * 
 * @author lixiaomin
 * 
 */
public abstract class BaseCommandMarshaller implements IMtsCommandMarshaller
{
	private String protocolVersion;
	
	public static final String ROOT_START = "<mts version=\"2.1\">";
	public static final String ROOT_END = "</mts>";

	public abstract byte getCommandType();

	/**
	 * 返回协议版本
	 * @return
	 */
	public String getProtocolVersion()
	{
		return this.protocolVersion;
	}	
	
	/**
	 * 设定协议版本
	 * 
	 */
	public void setProtocolVersion(String protocolVersion)
	{
		this.protocolVersion = protocolVersion;
	}
	
	public abstract ICommand createCommand();

	/**
	 * 封装
	 * 
	 * @param format
	 * @param command
	 * @throws Exception
	 */
	public abstract String marshal(IMtsFormat format, ICommand command);

	/**
	 * 解封装
	 * 
	 * @param format
	 * @param command
	 * @param commandText
	 * @throws Exception
	 */
	public abstract void unmarshal(IMtsFormat format, ICommand command, String commandText) throws Exception;

	/**
	 * 将字符形转化成整形
	 * 
	 * @param str
	 * @return
	 */
	public int parseInt(String str)
	{
		return !StringUtil.isNullOrEmpty(str) ? Integer.parseInt(str) : 0;
	}
	
	/**
	 * 将字符形转化成长整形
	 * 
	 * @param str
	 * @return
	 */
	public long parseLong(String str)
	{
		return !StringUtil.isNullOrEmpty(str) ? Long.parseLong(str) : 0;
	}
	
	protected void appendXmlNode(StringBuilder builder,String nodeName,String nodeValue)
	{
		if(nodeValue!=null)
		{
			builder.append(StringUtil.format("<%s>%s</%s>",nodeName,XmlUtil.escapeXml(nodeValue),nodeName));
		}
	}
}
