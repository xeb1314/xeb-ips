/************************************************************************
日  期：		2011-06-30
作  者:		李小敏
版  本：     4.5
描  述:	    JDMA中ESB对WebServiceHandler的实现
历  史：      
 ************************************************************************/
package jetsennet.jdma.webservices;

import java.util.List;

import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.dom4j.Node;

import jetsennet.jdma.business.WebService;
import jetsennet.net.ServiceRequest;
import jetsennet.util.DateUtil;
import jetsennet.util.StringUtil;

public class EsbWebServiceHandler extends WebServiceHandler
{
	private static final long serialVersionUID = 1;
	
	private jetsennet.logger.ILog logger = jetsennet.logger.LogManager.getLogger("JetsenNet.JDMA");

	@Override
	public String getRequestUrl(ServiceRequest serviceRequest)
	{
		if (!StringUtil.isNullOrEmpty(serviceRequest.RequestAction))
		{
			serviceRequest.RequestAction = StringUtil.trimEnd(StringUtil.trimStart(serviceRequest.RequestAction, '"'), '"');
			WebService service = new WebService();
			try
			{
				return service.getServiceUrlBySoapAction(serviceRequest.RequestAction);
			}
			catch (Exception ex)
			{
				logger.error("", ex);
			}
		}
		return null;
	}

	@Override
	@SuppressWarnings("unchecked")
	public void onRequestBegin(ServiceRequest serviceRequest)
	{
		Document soapDoc = null;
		try
		{
			soapDoc = DocumentHelper.parseText(serviceRequest.RequestXml);
			soapDoc.getRootElement().addNamespace("soap", "http://schemas.xmlsoap.org/soap/envelope/");
			Node soapHead = soapDoc.getRootElement().selectSingleNode("//soap:Header");

			if (soapHead != null)
			{
				List<Node> headItems = soapHead.selectNodes("*");
				for (Node headItem : headItems)
				{
					if (headItem.getName().equals("requestHead"))
					{
						List<Node> requestHeadItems = soapHead.selectNodes("*");
						for (Node nodeItem : requestHeadItems)
						{
							if (nodeItem.getName().equals("sourceCode"))
							{
								serviceRequest.SourceCode = nodeItem.getText();
							}
							else if (nodeItem.getName().equals("targetCode"))
							{
								serviceRequest.TargetCode = nodeItem.getText();
							}
							else if (nodeItem.getName().equals("requestID"))
							{
								serviceRequest.RequetsID = nodeItem.getText();
							}
							else if (nodeItem.getName().equals("userName"))
							{
								serviceRequest.RequestUser = nodeItem.getText();
							}
							else if (nodeItem.getName().equals("userToken"))
							{
								serviceRequest.RequestToken = nodeItem.getText();
							}
						}
						break;
					}
				}
			}
			// Request中不带Action也是被允许的
			if (StringUtil.isNullOrEmpty(serviceRequest.RequestAction))
			{
				this.logger.info("未提供SOAPAction头,从SOAP包中读取");
				Node soapBody = soapDoc.getRootElement().selectSingleNode("//soap:Body");
				if (soapBody != null)
				{
					Element element = (Element) soapBody.selectNodes("*").get(0);
					serviceRequest.RequestAction = StringUtil.trimEnd(element.getNamespaceURI(), '/', '\\') + "/" + element.getName();
				}
			}

		}
		catch (Exception ex)
		{
		}
	}

	@Override
	public void onRequestEnd(ServiceRequest serviceRequest)
	{
		Document resultDoc = null;
		try
		{
			resultDoc = DocumentHelper.parseText(serviceRequest.ResponseXml);
			if (resultDoc.getRootElement().selectSingleNode("//faultstring") != null)
			{
				serviceRequest.RequestState = 1;
				serviceRequest.StateDesc = resultDoc.getRootElement().selectSingleNode("//faultstring").getText();
			}
		}
		catch (Exception ex)
		{
			serviceRequest.RequestState = 1;
			serviceRequest.StateDesc = "无法处理服务返回的结果!";
		}

		WebService servcie = new WebService();
		try
		{
			servcie.serviceLog(serviceRequest.RequetsID, serviceRequest.RequestAction, serviceRequest.RequestUrl, serviceRequest.SourceCode,
					serviceRequest.TargetCode, serviceRequest.RequestUser, serviceRequest.RequestToken, serviceRequest.RequestType, DateUtil
							.formatDateString(serviceRequest.RequestTime, "yyyy-MM-dd HH:mm:ss"), DateUtil.formatDateString(
							serviceRequest.RespnoseTime, "yyyy-MM-dd HH:mm:ss"), serviceRequest.RequestXml, serviceRequest.ResponseXml,
					serviceRequest.RequestState, serviceRequest.StateDesc);
		}
		catch (Exception ex)
		{
			logger.error("日志记录错误", ex);
		}
		logger.debug(serviceRequest.RequestUrl + ":" + serviceRequest.RequestAction + ":"
				+ (serviceRequest.RequestState == 1 ? " failure." : " success."));
	}

	@Override
	public void onRequestError(ServiceRequest serviceRequest)
	{
		WebService servcie = new WebService();
		try
		{
			servcie.serviceLog(serviceRequest.RequetsID, serviceRequest.RequestAction, serviceRequest.RequestUrl, serviceRequest.SourceCode,
					serviceRequest.TargetCode, serviceRequest.RequestUser, serviceRequest.RequestToken, serviceRequest.RequestType, DateUtil
							.formatDateString(serviceRequest.RequestTime, "yyyy-MM-dd HH:mm:ss"), DateUtil.formatDateString(
							serviceRequest.RespnoseTime, "yyyy-MM-dd HH:mm:ss"), serviceRequest.RequestXml, serviceRequest.ResponseXml,
					serviceRequest.RequestState, serviceRequest.StateDesc);
		}
		catch (Exception ex)
		{
			logger.error("日志记录错误", ex);
		}
		
		logger.error(serviceRequest.RequestUrl + ":" + serviceRequest.RequestAction + ":" + serviceRequest.StateDesc);
	}
}
