package jetsennet.wfm.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import jetsennet.util.StringUtil;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.log4j.Logger;

/**
 * 计审模板文件导入
 * @author WEIRUKUN
 *
 */
public class AutoQcTemplateImport extends HttpServlet{

	private static final Logger logger = Logger.getLogger(AutoQcTemplateImport.class);

	private String content;
	
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
		try {
			if(StringUtil.isNullOrEmpty(type)){
				DiskFileItemFactory dff = new DiskFileItemFactory();
				ServletFileUpload upload = new ServletFileUpload(dff);
				List<FileItem> items = upload.parseRequest(request);
				for (FileItem fileItem : items)
				{
					if (!StringUtil.isNullOrEmpty(fileItem.getName()))
					{		
						content = new String(fileItem.get(),"utf-8");
					}
				}
			}
			if(!StringUtil.isNullOrEmpty(type)){
				out.write(content);
				content = "";
			}
		}
		catch (Exception e) 
		{			
			logger.info("导入计审模板异常！"+e);
		}
		finally
        {
            out.close();
        }
	}

	
	public void init() throws ServletException {
	}

	
	public void destroy() {
		super.destroy(); 
	}
}
