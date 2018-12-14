package jetsennet.jdma.model;

import java.util.ArrayList;
import java.util.List;

import jetsennet.util.XmlUtil;
import jetsennet.util.ISerializer;

/**
 * 服务方法
 * 
 * @author Administrator
 * 
 */
public class ServiceMethod implements ISerializer
{

	private String methodName = "";

	private String methodDesc = "";

	private String methodInput = "";

	private String methodOutput = "";

	private String methodFault;

	private String soapAction;

	private List<MethodParam> methodParams;

	private List<HeadParam> headParams;

	public void deserialize(String serializedXml, String rootName)
	{

	}

	public List<HeadParam> getHeadParams()
	{
		if (headParams == null)
		{
			headParams = new ArrayList<HeadParam>();
		}
		return headParams;
	}

	public String getMethodDesc()
	{
		return methodDesc;
	}

	public String getMethodFault()
	{
		return methodFault;
	}

	public String getMethodInput()
	{
		return methodInput;
	}

	public String getMethodName()
	{
		return methodName;
	}

	public String getMethodOutput()
	{
		return methodOutput;
	}

	public List<MethodParam> getMethodParams()
	{
		if (methodParams == null)
		{
			methodParams = new ArrayList<MethodParam>();
		}
		return methodParams;
	}

	public String getSoapAction()
	{
		return soapAction;
	}

	public String serialize(String rootName)
	{
		StringBuilder sbSerial = new StringBuilder();
		sbSerial.append("<" + rootName + ">");
		sbSerial.append(String.format("<MethodName>%s</MethodName>", XmlUtil.escapeXml(this.getMethodName())));
		sbSerial.append(String.format("<MethodDesc>%s</MethodDesc>", XmlUtil.escapeXml(this.getMethodDesc())));
		sbSerial.append(String.format("<SoapAction>%s</SoapAction>", XmlUtil.escapeXml(this.getSoapAction())));
		sbSerial.append(String.format("<MethodInput>%s</MethodInput>", XmlUtil.escapeXml(this.getMethodInput())));
		sbSerial.append(String.format("<MethodOutput>%s</MethodOutput>", XmlUtil.escapeXml(this.getMethodOutput())));
		sbSerial.append(String.format("<MethodFault>%s</MethodFault>", XmlUtil.escapeXml(this.getMethodFault())));

		sbSerial.append("<MethodParams>");
		for (MethodParam item : this.getMethodParams())
		{
			sbSerial.append(item.serialize("MethodParam"));
		}
		sbSerial.append("</MethodParams>");

		sbSerial.append("<HeadParams>");
		for (HeadParam item : this.getHeadParams())
		{
			sbSerial.append(item.serialize("HeadParam"));
		}
		sbSerial.append("</HeadParams>");

		sbSerial.append("</" + rootName + ">");

		return sbSerial.toString();
	}

	public void setHeadParams(List<HeadParam> val)
	{
		headParams = val;
	}

	public void setMethodDesc(String val)
	{
		methodDesc = val;
	}

	public void setMethodFault(String val)
	{
		methodFault = val;
	}

	public void setMethodInput(String val)
	{
		methodInput = val;
	}

	public void setMethodName(String val)
	{
		methodName = val;
	}

	public void setMethodOutput(String val)
	{
		methodOutput = val;
	}

	public void setMethodParams(List<MethodParam> val)
	{
		methodParams = val;
	}

	public void setSoapAction(String val)
	{
		soapAction = val;
	}
}
