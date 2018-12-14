package jetsennet.jdma.model;

import jetsennet.util.ISerializer;

/**
 * ��������
 * 
 * @author Administrator
 * 
 */
public class MethodParam implements ISerializer
{
	private String paramName = "";

	private String paramType = "";

	private boolean isComplexParam = false;

	public MethodParam(String paramName, String paramType, boolean isComplexParam)
	{
		this.paramName = paramName;
		this.paramType = paramType;
		this.isComplexParam = isComplexParam;
	}

	public void deserialize(String serializedXml, String rootName)
	{

	}

	public boolean getIsComplexParam()
	{
		return isComplexParam;
	}

	public String getParamName()
	{
		return paramName;
	}

	public String getParamType()
	{
		return paramType;
	}

	public String serialize(String rootName)
	{
		StringBuilder sbSerial = new StringBuilder();
		sbSerial.append("<" + rootName + ">");
		sbSerial.append(String.format("<ParamName>%s</ParamName>", this.getParamName()));
		sbSerial.append(String.format("<ParamType>%s</ParamType>", this.getParamType()));
		sbSerial.append(String.format("<IsComplexParam>%s</IsComplexParam>", this.getIsComplexParam()));
		sbSerial.append("</" + rootName + ">");
		return sbSerial.toString();
	}

	public void setIsComplexParam(boolean val)
	{
		isComplexParam = val;
	}

	public void setParamName(String val)
	{
		paramName = val;
	}

	public void setParamType(String val)
	{
		paramType = val;
	}
}
