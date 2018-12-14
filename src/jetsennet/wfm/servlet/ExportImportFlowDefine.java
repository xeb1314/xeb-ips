/************************************************************************
日  期：		2014-04-02
作  者:		wangjun
版  本：     
描  述:	    流程导入，导出
历  史：      
 ************************************************************************/
package jetsennet.wfm.servlet;

import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.net.URLEncoder;
import java.util.Iterator;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import jetsennet.util.StringUtil;
import jetsennet.wfm.business.ProcessBusiness;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.io.SAXReader;

public class ExportImportFlowDefine extends HttpServlet 
{

	private static final long serialVersionUID = 1L;

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp)throws ServletException, IOException 
	{
		this.doPost(req, resp);
	}

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp)throws ServletException, IOException 
	{
		resp.setContentType("text/html");
		resp.setCharacterEncoding("UTF-8");
		String type = req.getParameter("operateType");
		if("1".equals(type))
		{
			try 
			{
				this.doExport(req, resp);
				
			} catch (Exception e) {}
		}
		else
		{
			this.doImport(req, resp);
		}
	}

	/**
	 * 导出流程
	 * @param req
	 * @param resp
	 * @throws Exception 
	 */
	protected void doExport(HttpServletRequest req, HttpServletResponse resp) throws Exception
	{
		resp.setDateHeader("Expires", 0);
		resp.setCharacterEncoding("UTF-8");
		resp.setHeader("Pragma", "no-cache");
		resp.setHeader("Cache-Control", "no-cache");
		ServletOutputStream out = resp.getOutputStream();
		resp.setContentType("application/xml;charset=utf-8");
		
		
		String procId = req.getParameter("procId");
		String isIE = req.getParameter("isIE");  //是否是IE
		try 
		{
			String processXml = new ProcessBusiness().getProcess(Integer.parseInt(procId),"");
			Document doc = DocumentHelper.parseText(processXml);
			String fileName = doc.getRootElement().selectSingleNode("processName").getText()+".xml";
			//IE chrome和 火狐兼容性
//			String agent = req.getHeader("User-Agent");
//			boolean isMSIE = (agent != null && agent.indexOf("MSIE") != -1); 不适用IE11
	        if("true".equals(isIE)){
	            fileName = URLEncoder.encode(fileName, "utf-8").replace("+", " ");
	        }else{
	            fileName = new String(fileName.getBytes("UTF-8"), "ISO-8859-1");
	        }
			resp.setHeader("Content-Disposition", "attachment;  filename=\"" + fileName + "\"");
			byte [] arr = doc.asXML().getBytes("UTF-8");
			out.write(arr);
		} 
		catch (Exception e) 
		{
			e.printStackTrace();
		}
		finally
		{
			out.flush();
			out.close();
		}
	}
	
	/**
	 * 导入流程
	 * @param req
	 * @param resp
	 */
	@SuppressWarnings("unchecked")
	protected void doImport(HttpServletRequest req, HttpServletResponse resp)
	{
		PrintWriter out = null;
		try 
		{
			out = resp.getWriter();
			InputStream importFile = null;
			DiskFileItemFactory factory = new DiskFileItemFactory();
			ServletFileUpload upload = new ServletFileUpload(factory);
			List<FileItem> items = upload.parseRequest(req);
			Iterator<FileItem> iter = items.iterator();
			//解析http请求取出文件流
			while (iter.hasNext())
			{
				FileItem item = (FileItem) iter.next();
				//只取文件
				if (!item.isFormField())
				{	
					importFile = item.getInputStream();
				}
			}
			
			SAXReader saxReadr = new SAXReader();// 得到SAXReader对象
			Document document = saxReadr.read(importFile);
			new ProcessBusiness().addProcess(document);//导入
			out.write("<script>parent.importDone();</script>");
			
		} catch (Exception e) 
		{
		    if(!StringUtil.isNullOrEmpty(e.getMessage()) && e.getMessage().indexOf("error_not_processType")>-1){
		        out.write("<script>parent.jetsennet.error('不存在此流程对应的流程类型,请先添加类型编号为 "+e.getMessage().split(",")[1]+" 的流程类型！');</script>");
		    }else{
		        out.write("<script>parent.jetsennet.error('操作失败,不正确xml格式！');</script>");
		    }
		}
		finally
		{
			out.flush();
			out.close();
		}
	}

}
