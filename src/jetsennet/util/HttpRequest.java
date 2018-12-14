package jetsennet.util;

import java.util.HashMap;

import com.sun.istack.logging.Logger;

import jetsennet.net.HttpRequestProxy;

public class HttpRequest
{
    private static final Logger logger = Logger.getLogger(HttpRequest.class);
    
    private static HashMap<String, String> requestProperties; 
    private static String requestCharset = "utf-8";
    private static int connectTimeout = 5000; //请求超时时长
    private static int readTimeout = 60000; //读取超时时长
    
    public static String send(String requestUrl,String messageText) throws Exception{
        logger.info("发送：" + messageText);
        String returnText = null;
        requestProperties = new HashMap<String, String>();
        requestProperties.put("ConnectTimeOut", connectTimeout + "");
        requestProperties.put("ReadTimeOut", readTimeout + "");
        try
        {
            returnText = HttpRequestProxy.send(requestUrl, messageText, requestProperties, requestCharset);
        }
        catch (Exception e)
        {
            throw new Exception("连接异常");
        }
        logger.info("接收：" + returnText);
        return returnText;
    }
}
