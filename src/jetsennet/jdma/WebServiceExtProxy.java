/* ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
 * 北京捷成世纪科技股份有限公司
 * 日 期：2014-12-9 下午05:06:55
 * 文 件：WebServiceExtProxy.java
 * 作 者：薛恩彬
 * 版 本：1.0.0
 * ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
 */
package jetsennet.jdma;

import java.util.Enumeration;
import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;

import jetsennet.net.HttpRequestProxy;

/**
 *
 * @author <a href="mailto:xueenbin@jetsen.cn">薛恩彬</a>
 * @version 1.0.0
 * ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝<br/>
 * 修订日期            修订人          描述<br/>
 * 2014-12-9   薛恩彬          创建<br/>
 */
public class WebServiceExtProxy {
	private HttpServletRequest request;

	/**
	 * @param request
	 */
	public WebServiceExtProxy(HttpServletRequest request) {
		super();
		this.request = request;
	}

	public String sendSoap0(String serviceUrl, String soapAction, boolean keepAlive, String soapString) throws Exception {
		HashMap<String,String> requestProperties = new HashMap<String,String>();
		requestProperties.put("Content-Type", "text/xml;charset=utf-8");
		requestProperties.put("SOAPAction", soapAction);
		Enumeration<String> headerNames = this.request.getHeaderNames();
		while(headerNames.hasMoreElements()) {
			String h = headerNames.nextElement();
			requestProperties.put(h, this.request.getHeader(h));
			
		}
		return HttpRequestProxy.send(serviceUrl, soapString, requestProperties, "utf-8");
	}

}
