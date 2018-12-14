/* ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
 * 北京捷成世纪科技股份有限公司
 * 日 期：2014-11-30 下午01:53:31
 * 文 件：DMASystemService.java
 * 作 者：薛恩彬
 * 版 本：1.0.0
 * ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
 */
package jetsennet.jdma.services;

import javax.jws.WebService;
import javax.ws.rs.FormParam;
import javax.ws.rs.POST;
import javax.ws.rs.Path;

import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Node;

import jetsennet.frame.service.BaseService;
import jetsennet.jdma.business.WebServiceBusiness;
import jetsennet.net.WSResult;
import jetsennet.util.SerializerUtil;

/**
 *  TODO 添加该类的简单功能说明以及算法
 *
 * @author <a href="mailto:xueenbin@jetsen.cn">薛恩彬</a>
 * @version 1.0.0
 * ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝<br/>
 * 修订日期            修订人          描述<br/>
 * 2014-11-30   薛恩彬          创建<br/>
 */
@Path("/DMASystemService")
@WebService(name = "/DMASystemService")
public class DMASystemService extends BaseService {
	
	private WebServiceBusiness webServiceBusiness;
	
	@POST
	@Path("/commonWebServiceInsert")
	public WSResult commonWebServiceInsert(@FormParam("className") String className, @FormParam("saveXml") String xml)
	   throws Exception
	{
	   return getResult(String.valueOf(webServiceBusiness.commonObjInsert(className,xml)));
	}

	@POST
	@Path("/commonWebServiceUpdate")
	public WSResult commonWebServiceUpdate(@FormParam("className") String className, @FormParam("updateXml") String xml,@FormParam("isFilterNull") boolean isFilterNull)
	   throws Exception
	{
	   return getResult(String.valueOf(webServiceBusiness.commonObjUpdateWebService(className,xml,isFilterNull)));
	}
	
	@POST
	@Path("/commonWebServiceDelete")
	public WSResult commonWebServiceDelete(@FormParam("className") String className, @FormParam("deleteIds") String ids)
			throws Exception {
		return getResult(String.valueOf(webServiceBusiness.commonObjDelete(className,ids)));
	}

	@POST
    @Path("/queryXmlForPage")
	public WSResult queryXmlForPage(@FormParam("queryXml") String queryXml) throws Exception
	{
		Document retDoc = DocumentHelper.parseText(queryXml);
    	Node pageInfoNode = retDoc.getRootElement().selectSingleNode("PageInfo");
    	int pageSize = Integer.valueOf(pageInfoNode.selectSingleNode("PageSize").getText());
    	return webServiceBusiness.commonQueryForPage(queryXml,0,pageSize);
	}
	
	/**
	 * 解析服务描述结构
	 * 
	 * @param serviceId
	 * @param url
	 * @param refresh
	 * @return
	 */
	public WSResult dmaParseService(String serviceId, String url, int refresh)
	{
		WSResult retObj = new WSResult();
			try {
				retObj.resultVal = SerializerUtil.serialize(webServiceBusiness.serviceParse(serviceId, url, refresh), "Service");
			} catch (Exception e) {
				e.printStackTrace();
			}
		return retObj;
	}
	
	/**
	 * 调用服务
	 * 
	 * @param serviceCodeOrWsdlAddress
	 *        服务码或描述地址
	 * @param serviceUrl
	 *        请求地址
	 * @param methodName
	 * @param header
	 * @param serviceArguments
	 *        服务参数<param><1/><2/>...</param>
	 * @return
	 */
	public String callService(String serviceCodeOrWsdlAddress, String serviceUrl, String methodName, String header, String serviceArguments)
	{
//		jetsennet.jdma.business.WebService webService = new jetsennet.jdma.business.WebService();
		String strResult = "";
		try
		{
			strResult = webServiceBusiness.callWebService(
					serviceCodeOrWsdlAddress, 
					serviceUrl, 
					methodName, 
					header, 
					serviceArguments, 
					"");
		}
		catch (Exception ex)
		{
			ex.printStackTrace();
			return ex.getMessage();
		}

//		logger.debug(serviceCodeOrWsdlAddress + "-" + methodName);

		return strResult;
	}
	
	/**
	 * @return the webServiceBusiness
	 */
	@javax.jws.WebMethod(exclude = true)
	public WebServiceBusiness getWebServiceBusiness() {
		return webServiceBusiness;
	}

	/**
	 * @param webServiceBusiness the webServiceBusiness to set
	 */
	@javax.jws.WebMethod(exclude = true)
	public void setWebServiceBusiness(WebServiceBusiness webServiceBusiness) {
		this.webServiceBusiness = webServiceBusiness;
	}

}
