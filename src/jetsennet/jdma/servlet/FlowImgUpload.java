package jetsennet.jdma.servlet;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItemIterator;
import org.apache.commons.fileupload.FileItemStream;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.commons.fileupload.util.Streams;

public class FlowImgUpload extends HttpServlet
{

	File saveDir = null;// 初始化上传文件后的保存目录
	File tmpDir = null;// 初始化上传文件的临时存放目录

	public FlowImgUpload()
	{
		super();
	}

	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
	{
		doPost(request, response);
	}

	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException
	{
		java.lang.StringBuilder sbResponse = new java.lang.StringBuilder();
		sbResponse.append("<ServerRespone>");
		try
		{
			if (ServletFileUpload.isMultipartContent(request))
			{
				DiskFileItemFactory dff = new DiskFileItemFactory();// 创建该对象
				dff.setRepository(tmpDir);// 指定上传文件的临时目录
				dff.setSizeThreshold(1024000);// 指定在内存中缓存数据大小,单位为byte
				ServletFileUpload sfu = new ServletFileUpload(dff);// 创建该对象
				FileItemIterator fii = sfu.getItemIterator(request);// 解析request请求,并返回FileItemIterator集合
				while (fii.hasNext())
				{
					FileItemStream fis = fii.next();// 从集合中获得一个文件流
					if (!fis.isFormField() && (fis.getName().length() > 0))
					{// 过滤掉表单中非文件域
						String fileName = java.util.UUID.randomUUID().toString() + fis.getName().substring(fis.getName().lastIndexOf("."));
						// 获得上传文件的文件名
						BufferedInputStream in = new BufferedInputStream(fis.openStream());// 获得文件输入流
						BufferedOutputStream out = new BufferedOutputStream(new FileOutputStream(new File(saveDir + "\\" + fileName)));// 获得文件输出流
						Streams.copy(in, out, true);// 开始把文件写到你指定的上传文件夹
						sbResponse.append(String.format("<File>%s</File>", fileName));
					}
				}
			}
			sbResponse.append("<ErrorCode>0</ErrorCode>");
		}
		catch (Exception e)
		{
			sbResponse.append("<ErrorCode>1</ErrorCode>");
			sbResponse.append("<ErrorString>" + e.getMessage() + "</ErrorString>");
		}
		sbResponse.append("</ServerRespone>");
		PrintWriter out = response.getWriter();
		out.println("<script>window.parent.serverCallBack('" + sbResponse.toString() + "');</script>");
	}

	@Override
	public void init() throws ServletException
	{
		/*
		 * 对上传文件夹和临时文件夹进行初始化
		 */
		super.init();
		String savePath = getServletContext().getRealPath("jdma/jfmssystemweb/flowimages/").toString();
		String tmpPath = getServletContext().getRealPath("").toString();
		tmpDir = new File(tmpPath);
		saveDir = new File(savePath);
		if (!tmpDir.isDirectory())
		{
			tmpDir.mkdir();
		}
		saveDir = new File(savePath);
		if (!saveDir.isDirectory())
		{
			saveDir.mkdir();
		}
	}
}
