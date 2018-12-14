package jetsennet.jdma.model;

import java.util.ArrayList;
import java.util.List;

import jetsennet.util.XmlUtil;
import jetsennet.util.ISerializer;

/**
 * 服务
 * @author Administrator
 */
public class ServiceInfo implements ISerializer
{
	private String serviceName = "";

	private String serviceDesc = "";

	private List<ServiceMethod> methods;

	/*
	 * (non-Javadoc)
	 * 
	 * @see jetsennet.util.ISerializer#deSerializer(java.lang.String, java.lang.String)
	 */
	public void deserialize(String serializedXml, String rootName)
	{

	}

	public List<ServiceMethod> getMethods()
	{
		if (methods == null)
		{
			methods = new ArrayList<ServiceMethod>();
		}
		return methods;
	}

	public String getServiceDesc()
	{
		return serviceDesc;
	}

	public String getServiceName()
	{
		return serviceName;
	}

	public String serialize(String rootName)
	{
		StringBuilder sbSerial = new StringBuilder();
		sbSerial.append("<" + rootName + ">");
		sbSerial.append(String.format("<ServiceName>%s</ServiceName>", XmlUtil.escapeXml(this.getServiceName())));
		sbSerial.append(String.format("<ServiceDesc>%s</ServiceDesc>", XmlUtil.escapeXml(this.getServiceDesc())));

		sbSerial.append("<ServiceMethods>");
		for (ServiceMethod item : this.getMethods())
		{
			sbSerial.append(item.serialize("ServiceMethod"));
		}
		sbSerial.append("</ServiceMethods>");
		sbSerial.append("</" + rootName + ">");

		return sbSerial.toString();
	}

	public void setMethods(List<ServiceMethod> val)
	{
		methods = val;
	}

	public void setServiceDesc(String val)
	{
		serviceDesc = val;
	}

	public void setServiceName(String val)
	{
		serviceName = val;
	}
}
