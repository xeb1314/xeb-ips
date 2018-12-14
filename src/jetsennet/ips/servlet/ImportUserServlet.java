/* 
 * Copyright (c) 北京捷成世纪科技股份有限公司. All Rights Reserved.
 * 文件：jetsennet.jwfm.servlet.MsgServer.java
 * 日 期：2014-10-31 下午4:04:14
 * 作 者：梁继杰
 */
package jetsennet.ips.servlet;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.Date;
import java.util.UUID;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import jetsennet.ips.business.CollecBusiness;
import jetsennet.ips.business.MtsMsgHandle;
import jetsennet.jdma.schema.DmaWebinvoke;
import jetsennet.util.DateUtil;
import jetsennet.util.SerializerUtil;
import jetsennet.util.SpringContextUtil;

import org.apache.commons.fileupload.FileItemIterator;
import org.apache.commons.fileupload.FileItemStream;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.commons.fileupload.util.Streams;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.dom4j.Node;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

/**
 *  TODO 添加该类的简单功能说明以及算法
 *
 * @author <a href="mailto:liangjijie@jetsen.cn">梁继杰</a>
 * @version 1.0.0
 * ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝<br/>
 * 修订日期                 修订人            描述<br/>
 * 2014-10-31       梁继杰           创建<br/>
 */
public class ImportUserServlet extends HttpServlet {

	/* (non-Javadoc)
	 * @see javax.servlet.http.HttpServlet#doGet(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		// TODO Auto-generated method stub
		this.doPost(req, resp);
	}

	/* (non-Javadoc)
	 * @see javax.servlet.http.HttpServlet#doPost(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		response.setContentType("text/html");
		response.setCharacterEncoding("UTF-8");
		CollecBusiness collecBusiness = null;
		collecBusiness = (CollecBusiness) SpringContextUtil.getBean("collecBusiness");
	
		if (ServletFileUpload.isMultipartContent(request))
		{
			DiskFileItemFactory dff = new DiskFileItemFactory();// 创建该对象
			ServletFileUpload sfu = new ServletFileUpload(dff);// 创建该对象
			FileItemIterator fii = null;
			InputStream in = null;
			PrintWriter out = null;
			try {
				out = response.getWriter();
				fii = sfu.getItemIterator(request);
			} catch (FileUploadException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}// 解析request请求,并返回FileItemIterator集合
			try {
				while (fii.hasNext())
				{
					FileItemStream fis = fii.next();// 从集合中获得一个文件流
					if (!fis.isFormField() && (fis.getName().length() > 0))// 过滤掉表单中非文件域
					{
						in = fis.openStream();
						
						// 获得上传文件的文件名
						Workbook workbook = null;
						try {
							workbook = WorkbookFactory.create(in);
						} catch (InvalidFormatException e) {
							// TODO Auto-generated catch block
							e.printStackTrace();
							out.write("<script>parent.jetsennet.error('操作失败,不正确excel格式！');</script>");
						}
						
						StringBuilder build = new StringBuilder();
						
						for (int i = 0; i < workbook.getNumberOfSheets(); i++) {
							Sheet sheetAt = workbook.getSheetAt(i);
							int rowNum = sheetAt.getLastRowNum()+1;
							Row row = null;
							for (int j = 1; j < rowNum; j++) {
								row = sheetAt.getRow(j);
								Cell cell1 = row.getCell(1);
								Cell cell2 = row.getCell(2);
								int num = (int)(Math.random()*100+1000);
								build.append("("+num+",0,'"+cell1.getStringCellValue()+"','"+cell2.getStringCellValue()+"'),");
							}
							
						}
						
						try {
							
							String string = build.toString();
							if(string.length()>0){
								string = string.substring(0,string.length()-1);
								collecBusiness.getDao().execute("INSERT INTO UUM_USER (ID,STATE,LOGIN_NAME,USER_NAME) VALUES "+string);
//								response.setStatus(0);
								out.write("<script>parent.importDone();</script>");
							}
							
						} catch (SQLException e) {
							// TODO Auto-generated catch block
							out.write("<script>parent.jetsennet.error('操作失败,插入数据格式错误！');</script>");
						}
						finally
						{
							in.close();
							out.flush();
							out.close();
						}
					}
				}
			} catch (FileUploadException e) {
				// TODO Auto-generated catch block
				out.write("<script>parent.jetsennet.error('操作失败,不正确excel格式！');</script>");
			}
		}
	/*	MultipartHttpServletRequest multipart = (MultipartHttpServletRequest)request;
		MultipartFile file = multipart.getFile("fileImport");
		if(file.isEmpty()){
			response.setStatus(1);
		}
		InputStream in = file.getInputStream();
		
		Workbook workbook = null;
		try {
			workbook = WorkbookFactory.create(in);
		} catch (InvalidFormatException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			response.setStatus(1);
		}
		
		StringBuilder build = new StringBuilder();
		
		for (int i = 0; i < workbook.getNumberOfSheets(); i++) {
			Sheet sheetAt = workbook.getSheetAt(i);
			int rowNum = sheetAt.getLastRowNum()+1;
			Row row = null;
			for (int j = 1; j < rowNum; j++) {
				row = sheetAt.getRow(j);
				Cell cell1 = row.getCell(1);
				Cell cell2 = row.getCell(2);
				build.append("('"+cell1.getStringCellValue()+"','"+cell2.getStringCellValue()+"'),");
			}
			
		}
		
		try {
			
			String string = build.toString();
			if(string.length()>0){
				string = string.substring(0,string.length());
				collecBusiness.getDao().execute("INSERT INTO UUM_USER (LOGIN_NAME,USER_NAME) VALUES "+string);
				response.setStatus(0);
			}
			
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			response.setStatus(1);
		}
		finally
		{
			in.close();
		}*/
	}
	
}
