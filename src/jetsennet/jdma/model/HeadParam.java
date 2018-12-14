package jetsennet.jdma.model;

import java.util.ArrayList;
import java.util.List;

import jetsennet.util.ISerializer;

/**
 * Soapͷ
 * 
 * @author Administrator
 * 
 */
public class HeadParam implements ISerializer
{
	private String headName = "";

	private List<MethodParam> headFields;

	public HeadParam(String headName)
	{
		this.headName = headName;
	}

	public void deserialize(String serializedXml, String rootName)
	{

	}

	public List<MethodParam> getHeadFields()
	{
		if (headFields == null)
		{
			headFields = new ArrayList<MethodParam>();
		}
		return headFields;
	}

	public String getHeadName()
	{
		return headName;
	}

	public String serialize(String rootName)
	{
		StringBuilder sbSerial = new StringBuilder();
		sbSerial.append("<" + rootName + ">");
		sbSerial.append(String.format("<HeadName>%s</HeadName>", this.getHeadName()));

		sbSerial.append("<HeadFields>");
		for (MethodParam item : this.getHeadFields())
		{
			sbSerial.append(item.serialize("HeadField"));
		}
		sbSerial.append("</HeadFields>");
		sbSerial.append("</" + rootName + ">");

		return sbSerial.toString();
	}

	public void setHeadFields(List<MethodParam> val)
	{
		headFields = val;
	}

	public void setHeadName(String val)
	{
		headName = val;
	}
}
