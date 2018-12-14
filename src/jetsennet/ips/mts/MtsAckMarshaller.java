/************************************************************************
日  期：		2012-08-15
作  者:		李小敏
版  本：     1.0
描  述:	    
历  史：      
 ************************************************************************/
package jetsennet.ips.mts;

import jetsennet.util.XmlUtil;

import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;

/**
 * 应答消息解析器
 * 
 * @author lixiaomin
 * 
 */
public class MtsAckMarshaller extends BaseCommandMarshaller
{
	public byte getCommandType()
	{
		return CommandTypes.MTS_ACK;
	}

	public ICommand createCommand()
	{
		return new MtsAck();
	}

	/**
	 * 封装
	 * 
	 * @param format
	 * @param command
	 * @throws Exception
	 */
	public String marshal(IMtsFormat format, ICommand command)
	{
		MtsAck mtsAck = (MtsAck) command;

		StringBuilder sbMessage = new StringBuilder();
		sbMessage.append(ROOT_START);
		sbMessage.append("<mtsAck>");
		sbMessage.append("<stateCode>");
		sbMessage.append(mtsAck.getStateCode());
		sbMessage.append("</stateCode>");
		appendXmlNode(sbMessage,"stateDesc",mtsAck.getStateDesc());
		sbMessage.append("</mtsAck>");
		sbMessage.append(ROOT_END);

		return sbMessage.toString();
	}

	/**
	 * 解封装
	 * 
	 * @param format
	 * @param command
	 * @param commandText
	 * @throws Exception
	 */
	public void unmarshal(IMtsFormat format, ICommand command, String commandText) throws Exception
	{
		MtsAck mtsAck = (MtsAck) command;

		Document doc = DocumentHelper.parseText(commandText);
		if (doc != null)
		{
			Element element = doc.getRootElement().element("mtsAck");
			mtsAck.setStateCode(parseInt(element.elementTextTrim("stateCode")));
			mtsAck.setStateDesc(element.elementText("stateDesc"));
		}
	}
}
