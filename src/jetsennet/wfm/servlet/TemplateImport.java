package jetsennet.wfm.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.log4j.Logger;

import jetsennet.util.StringUtil;
import jetsennet.wfm.business.ProcessBusiness;

/**
 * @author WEIRUKUN
 * 导入转码模板
 */
public class TemplateImport extends HttpServlet {

	private static final Logger logger = Logger.getLogger(TemplateImport.class);
    private int actId = -1;
	
	public void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		this.doPost(request, response);
        
	}

	public void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		response.setContentType("text/html;charset=UTF-8");
		request.setCharacterEncoding("UTF-8");
		PrintWriter out = response.getWriter();
        String type = request.getParameter("type");
		Map<String, String> templateMap = new HashMap<String, String>();
		
		try {
		    if(StringUtil.isNullOrEmpty(type)){
		        DiskFileItemFactory dff = new DiskFileItemFactory();
		        ServletFileUpload upload = new ServletFileUpload(dff);
		        List<FileItem> items = upload.parseRequest(request);
		        for (FileItem fileItem : items)
		        {
		            if (fileItem.isFormField())
		            {
		                templateMap.put(fileItem.getFieldName(), fileItem.getString("utf-8"));
		            }
		            else if (!StringUtil.isNullOrEmpty(fileItem.getName()))
		            {		
		                templateMap.put("templateData", new String(Base64.encodeBase64(fileItem.get())));
		            }
		        }	
		        //这种方式不可取，以后修改
		        actId = -1;
		        actId = new ProcessBusiness().saveTemplate(
		            Integer.valueOf(templateMap.get("hiddenProcId")),
		            templateMap.get("templateData"),templateMap.get("hiddenSuffix"));
		    }else{
		    	int i=0;
		    	while(actId<0 && i<5){
		    		Thread.sleep(2000);
		    		i++;
		    	}
		        out.write(new String(String.valueOf(actId).getBytes(),"utf-8"));
		    }
		}
		catch (Exception e) 
		{			
			logger.info("导入转码模板异常！"+e);
		}
		
	}

	
	public void init() throws ServletException {
	}

	
	public void destroy() {
		super.destroy(); 
	}
}
