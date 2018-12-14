/************************************************************************
日  期：		2013-6-14
作  者:		jinweihu
版  本：     
描  述:	    
历  史：      
 ************************************************************************/
package jetsennet.wfm.servlet;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import jetsennet.util.PathUtil;

import org.apache.commons.fileupload.FileItemIterator;
import org.apache.commons.fileupload.FileItemStream;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.commons.fileupload.util.Streams;

public class UploadFile extends HttpServlet
{
	File saveDir = null;// 初始化上传文件后的保存目录

	/**
	 * Constructor of the object.
	 */
	public UploadFile()
	{
		super();
	}

	/**
	 * Destruction of the servlet. <br>
	 */
	public void destroy()
	{
		super.destroy(); // Just puts "destroy" string in log
		// Put your code here
	}

	/**
	 * The doGet method of the servlet. <br>
	 *
	 * This method is called when a form has its tag value method equals to get.
	 * 
	 * @param request the request send by the client to the server
	 * @param response the response send by the server to the client
	 * @throws ServletException if an error occurred
	 * @throws IOException if an error occurred
	 */
	public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
	{
		this.doPost(request, response);
	}

	/**
	 * The doPost method of the servlet. <br>
	 *
	 * This method is called when a form has its tag value method equals to post.
	 * 
	 * @param request the request send by the client to the server
	 * @param response the response send by the server to the client
	 * @throws ServletException if an error occurred
	 * @throws IOException if an error occurred
	 */
	public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
	{
		try
		{
			if (ServletFileUpload.isMultipartContent(request))
			{
				DiskFileItemFactory dff = new DiskFileItemFactory();// 创建该对象
				ServletFileUpload sfu = new ServletFileUpload(dff);// 创建该对象
				FileItemIterator fii = sfu.getItemIterator(request);// 解析request请求,并返回FileItemIterator集合
				while (fii.hasNext())
				{
					FileItemStream fis = fii.next();// 从集合中获得一个文件流
					if (!fis.isFormField() && (fis.getName().length() > 0))// 过滤掉表单中非文件域
					{
						// 获得上传文件的文件名
						BufferedInputStream in = new BufferedInputStream(fis.openStream());// 获得文件输入流
						BufferedOutputStream out = new BufferedOutputStream(new FileOutputStream(new File(saveDir + File.separator + fis.getName())));// 获得文件输出流
						Streams.copy(in, out, true);// 开始把文件写到你指定的上传文件夹
					}
				}
			}
		}
		catch (Exception e)
		{
			
		}
	}

	/**
	 * Initialization of the servlet. <br>
	 *
	 * @throws ServletException if an error occurs
	 */
	public void init() throws ServletException
	{
		/*
		 * 对上传文件夹和临时文件夹进行初始化
		 */
		super.init();
		String savePath = "";
		try
		{
			savePath = PathUtil.getWebRoot() + "jwfm" + File.separator + "jwfmsystemweb" + File.separator + "images";
			saveDir = new File(savePath);
		}
		catch (Exception e)
		{
			e.printStackTrace();
		}
	}

}
