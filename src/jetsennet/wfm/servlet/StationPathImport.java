package jetsennet.wfm.servlet;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

import javax.imageio.stream.FileImageInputStream;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.codec.binary.Base64;
import org.apache.log4j.Logger;
import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;

import jetsennet.util.FileAccess;
import jetsennet.util.FileUtil;
import jetsennet.util.StringUtil;
import jetsennet.util.XmlUtil;
import jetsennet.wfm.business.ProcessBusiness;

/**
 * @author WEIRUKUN
 * 同步台标
 */
public class StationPathImport extends HttpServlet {

	private static final Logger logger = Logger.getLogger(StationPathImport.class);
	
	public void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		this.doPost(request, response);
        
	}

	public void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
	    String stationPath = "";
	    String oldStationPath = ""; 
	    PrintWriter out = response.getWriter();
	    byte[] data = null;
	    
		try {
		    stationPath = new String(request.getParameter("stationPath").getBytes("ISO-8859-1"), "UTF-8");
		    oldStationPath = new String(request.getParameter("oldStationPath").getBytes("ISO-8859-1"), "UTF-8");
		    
		    File file = new File(stationPath); //路径下是不是文件
            if (file.exists()) 
            {
                //判断如果第二次的url跟第一次不一样 则更新同步
                if(stationPath.equals(oldStationPath)){
                    return;
                }
                //保存台标模板到文件
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
                String filePath = FileUtil.getApplicationPath() + "stationTemplates\\";
                File templatePath = new File(filePath);
                if (!templatePath.exists())
                {
                    templatePath.mkdir();
                }
                filePath = filePath + "stationTemplateInfo.xml";
                File whitefile = new File(filePath);
                Document xmlDoc = DocumentHelper.createDocument(DocumentHelper.createElement("STATION_INFO"));
                Element root = xmlDoc.getRootElement(); 
                HashMap<String,String> map = new HashMap<String, String>();
                if(whitefile.exists()){
                    String readTemplateInfoXml = FileAccess.readFileText(filePath);
                    if(!StringUtil.isNullOrEmpty(readTemplateInfoXml)){
                        Document doc = DocumentHelper.parseText(readTemplateInfoXml);  
                        List<Element> temEleLst = doc.getRootElement().selectNodes("STATION_ITEM");
                        if(temEleLst!=null&&temEleLst.size()>0){
                            for(Element temEle : temEleLst){
                                map.put(XmlUtil.tryGetItemText(temEle, "STATION_URL", ""), XmlUtil.tryGetItemText(temEle, "CREATE_TIME", ""));
                            }
                        }
                    }
                    
                }
                map.put(stationPath, sdf.format(new Date()));
                
                for(String key : map.keySet()){
                    String value = map.get(key);
                    Element temItemEle = root.addElement("STATION_ITEM");
                    temItemEle.addElement("STATION_URL").addText(key);  
                    temItemEle.addElement("CREATE_TIME").addText(value);  
                }
                FileAccess.saveFile(filePath, xmlDoc.asXML());
                
                //读取base64内容
                FileImageInputStream input = new FileImageInputStream(file);
                ByteArrayOutputStream output = new ByteArrayOutputStream();
                byte[] buf = new byte[1024];
                int numBytesRead = 0;
                while ((numBytesRead = input.read(buf)) != -1) {
                    output.write(buf, 0, numBytesRead);
                }
                data = output.toByteArray();
                output.close();
                input.close();
                
                final String fileName = file.getName();
                final String stationImageContent = new String(Base64.encodeBase64(data));
                
                //同步台标 异步
                new Thread(new Runnable(){
                    @Override
                    public void run()
                    {
                        try
                        {
                            new ProcessBusiness().saveStationPath(fileName,stationImageContent);
                        }
                        catch (Exception e)
                        {
                            logger.error("同步台标异常！"+e);
                        }
                    }
                    
                },"synchStationPath").start(); 
            }else{
                out.write("not a true url");
            }
            
		}
		catch (Exception e) 
		{	
		    logger.error("同步台标路径异常！"+e);
		}
		
	}

	
	public void init() throws ServletException {
	}

	
	public void destroy() {
		super.destroy(); 
	}
}
