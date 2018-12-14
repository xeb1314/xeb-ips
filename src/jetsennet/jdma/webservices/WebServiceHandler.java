/************************************************************************
日  期：		2011-06-30
作  者:		李小敏
版  本：     4.5
描  述:	    用于将原始请求信息进行转向，转向前及获取响应后，可对信息进行处理
历  史：      
 ************************************************************************/
package jetsennet.jdma.webservices;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Date;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import jetsennet.jdma.WebServiceExtProxy;
import jetsennet.net.ServiceRequest;
import jetsennet.net.WebServiceProxy;
import jetsennet.util.StringUtil;

public abstract class WebServiceHandler extends HttpServlet
{

	private final String ERROR_NO_SOAPACTION = "<soap:Envelope xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\" "
			+ "xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\">"
			+ "<soap:Body><soap:Fault><faultcode>soap:Client</faultcode><faultstring>服务器未能识别 HTTP 头 SOAPAction 的值</faultstring>"
			+ "<detail /></soap:Fault></soap:Body></soap:Envelope>";
	private final String ERROR_ADDRESS_INVALID = "<soap:Envelope xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\""
			+ " xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\">"
			+ "<soap:Body><soap:Fault><faultcode>soap:Client</faultcode><faultstring>请求的服务地址无效</faultstring>"
			+ "<detail /></soap:Fault></soap:Body></soap:Envelope>";
	private final String ERROR_READ_SOAP = "<soap:Envelope xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\" "
			+ "xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\">"
			+ "<soap:Body><soap:Fault><faultcode>soap:Client</faultcode><faultstring>读取SOAP消息失败</faultstring>"
			+ "<detail /></soap:Fault></soap:Body></soap:Envelope>";

	@Override
	public void init(ServletConfig config) throws ServletException
	{
		super.init(config);
	}
	
	@Override
	public void destroy()
	{
		super.destroy();
	}

	@Override
	public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
	{
		
		response.setContentType("text/xml;charset=UTF-8");

		ServiceRequest serviceRequest = new ServiceRequest();
		serviceRequest.RequestTime = new Date();
		serviceRequest.RequestAction = request.getHeader("SOAPAction");
		serviceRequest.RequestUser = request.getRemoteAddr();

		// soap info
		InputStreamReader inr = new InputStreamReader(request.getInputStream(), java.nio.charset.Charset.forName("utf-8"));
		StringWriter sw = new StringWriter();
		char[] buf = new char[8096];
		int size = 0;
		while ((size = inr.read(buf)) != -1)
		{
			sw.write(buf, 0, size);
		}

		sw.close();
		inr.close();
				
		serviceRequest.RequestXml = sw.toString();
		
		jetsennet.logger.LogManager.getLogger("soap").debug(serviceRequest.RequestXml);

		if (StringUtil.isNullOrEmpty(serviceRequest.RequestXml))
		{
			writeContent(response, ERROR_READ_SOAP);
			serviceRequest.RequestState = 1;
			serviceRequest.StateDesc = "无效的Soap封包";
			onRequestError(serviceRequest);
			return;
		}

		onRequestBegin(serviceRequest);

		if (StringUtil.isNullOrEmpty(serviceRequest.RequestAction))
		{
			writeContent(response, ERROR_NO_SOAPACTION);
			serviceRequest.RequestState = 1;
			serviceRequest.StateDesc = "无效的SoapAction";
			onRequestError(serviceRequest);
			return;
		}

		serviceRequest.RequestUrl = getRequestUrl(serviceRequest);

		if (StringUtil.isNullOrEmpty(serviceRequest.RequestUrl))
		{
			writeContent(response, ERROR_ADDRESS_INVALID);
			serviceRequest.RequestState = 1;
			serviceRequest.StateDesc = "取得服务地址失败:" + serviceRequest.RequestAction;
			onRequestError(serviceRequest);
			return;
		}
		try
		{
			serviceRequest.ResponseXml = new WebServiceExtProxy(request).sendSoap0(serviceRequest.RequestUrl, serviceRequest.RequestAction, true,
					serviceRequest.RequestXml);
//			serviceRequest.ResponseXml = WebServiceProxy.sendSoap(serviceRequest.RequestUrl, serviceRequest.RequestAction, true,
//					serviceRequest.RequestXml);
		}
		catch (Exception ex)
		{
		}
		serviceRequest.RespnoseTime = new Date();
		onRequestEnd(serviceRequest);

		writeContent(response, serviceRequest.ResponseXml);

	}

	@Override
	public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
	{
		this.doGet(request, response);
	}

	// 请求地址
	public abstract String getRequestUrl(ServiceRequest serviceRequest);

	// 请求开始
	public abstract void onRequestBegin(ServiceRequest serviceRequest);

	// 请求结束
	public abstract void onRequestEnd(ServiceRequest serviceRequest);

	// 请求错误
	public abstract void onRequestError(ServiceRequest serviceRequest);

	private void writeContent(HttpServletResponse response, String content) throws IOException
	{
		PrintWriter out = response.getWriter();
		try
		{
			out.write(content);
		}
		catch (Exception e)
		{
			e.printStackTrace();
		}
		finally
		{
			out.close();
		}
	}
}
