
package jetsennet.wfm.servlet;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.net.URLDecoder;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import jetsennet.util.FileAccess;
import jetsennet.util.StringUtil;

public class DownloadFile extends HttpServlet
{
	@Override
	public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
	{
		//response.setCharacterEncoding("gbk");

		ServletOutputStream out = null;
		BufferedInputStream bis = null;
		String filePath = "";
		try
		{
			//filePath = changeEncoding(request.getParameter("filepath"));
			filePath = new String(request.getParameter("filepath").getBytes("ISO-8859-1"), "UTF-8");

			if (StringUtil.isNullOrEmpty(filePath))
			{
				throw new Exception("请求资源失败！");
			}
			File file = new File(filePath);
			if (!file.exists()) 
			{
				throw new Exception("请求资源不存在！");
	        }
			bis = new BufferedInputStream(new FileInputStream(filePath));

			String fileName = file.getName();
			fileName = new String(fileName.getBytes(),"ISO-8859-1");  

			setResponse(response);
			response.setHeader("Content-Disposition", "attachment; filename=" + fileName);
			out = response.getOutputStream();
			byte[] buf = new byte[bis.available()];
			int size = 0;
			while ((size = bis.read(buf)) != -1)
			{
				out.write(buf, 0, size);
			}
		}
		catch (Exception e)
		{
			response.getWriter().write("<script>window.alert('操作失败:" + e.getMessage() + "!');window.close();</script>");
		}
		finally
		{
			if (out != null)
			{
				out.flush();
				out.close();
			}
			if (bis != null)
			{
				bis.close();
			}
			try {
				FileAccess.deleteFile(filePath);
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
	}

	private void setResponse(HttpServletResponse response)
	{
		response.setDateHeader("Expires", 0);
		response.setContentType("charset=utf-8");
		response.setHeader("Pragma", "no-cache");
		response.setHeader("Cache-Control", "no-cache");
	}

	private String changeEncoding(String parameter) throws Exception
	{
		// 非空判断
		if (StringUtil.isNullOrEmpty(parameter))
		{
			return "";
		}
		return URLDecoder.decode(parameter, "UTF-8");
	}

	@Override
	public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
	{
		doGet(request, response);
	}
}
