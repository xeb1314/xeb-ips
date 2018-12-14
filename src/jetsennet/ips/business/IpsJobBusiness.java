/* 
 * Copyright (c) 北京捷成世纪科技股份有限公司. All Rights Reserved.
 * 文件：jetsennet.jcms.business.JcmsBusiness.java
 * 日 期：2014-11-8 下午12:31:07
 * 作 者：梁继杰
 */
package jetsennet.ips.business;

import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.io.Serializable;
import java.sql.SQLException;
import java.util.Collection;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import jetsennet.frame.business.BaseBusiness;
import jetsennet.frame.business.Business;
import jetsennet.ips.schema.IpsJob;
import jetsennet.util.DBUtil;
import jetsennet.util.SerializerUtil;

import org.apache.commons.fileupload.FileItemIterator;
import org.apache.commons.fileupload.FileItemStream;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.log4j.Logger;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

/**
 *  TODO 添加该类的简单功能说明以及算法
 *
 * @author <a href="mailto:liangjijie@jetsen.cn">梁继杰</a>
 * @version 1.0.0
 * ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝<br/>
 * 修订日期                 修订人            描述<br/>
 * 2014-11-8       梁继杰           创建<br/>
 */
public class IpsJobBusiness extends BaseBusiness {

	private static final Logger logger = Logger.getLogger(IpsJobBusiness.class);

	@Override
	@Business
	public int commonObjInsert(String className, String xml) throws Exception {
		Element root = DocumentHelper.parseText(xml).getRootElement();
		IpsJob job = SerializerUtil.deserialize(IpsJob.class, root);
        getDao().saveBusinessObjs(job);
        return 0;
	}
	
	@Override
	@Business
	public int commonObjUpdateByPk(String className, String xml,
			boolean isFilterNull) throws Exception {
		Element root = DocumentHelper.parseText(xml).getRootElement();
		IpsJob job = SerializerUtil.deserialize(IpsJob.class, root);
        getDao().updateBusinessObjs(isFilterNull, job);
        return 0;
	}

	@Override
	@Business
	public int commonObjDelete(String className, String keyValues)
			throws Exception {
		getDao().delete(IpsJob.class, DBUtil.getInCond(IpsJob.PROP_JOB_ID, keyValues));
        return 0;
	}
	
	
	public String importUser(HttpServletRequest request,HttpServletResponse response) throws IOException{
		
		if (ServletFileUpload.isMultipartContent(request))
		{
			DiskFileItemFactory dff = new DiskFileItemFactory();// 创建该对象
			ServletFileUpload sfu = new ServletFileUpload(dff);// 创建该对象
			FileItemIterator fii = null;
			InputStream in = null;
			try {
				fii = sfu.getItemIterator(request);
			} catch (FileUploadException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
				return "解析excel失败！";
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
						}
						
						StringBuilder build = new StringBuilder();
						try {
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
							
							String string = build.toString();
							if(string.length()>0){
								string = string.substring(0,string.length()-1);
								getDao().execute("INSERT INTO UUM_USER (ID,STATE,LOGIN_NAME,USER_NAME) VALUES "+string);
							}
							
						} catch (SQLException e) {
							return "解析excel失败！";
							// TODO Auto-generated catch block
						}
						finally
						{
							in.close();
						}
					}
				}
			} catch (FileUploadException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
				return "解析excel失败！";
			}
		}else{
			return "文件不存在";
		}
		return "导入成功";
		
		/*MultipartHttpServletRequest multipart = (MultipartHttpServletRequest)req;
		
		MultipartFile file = multipart.getFile("fileImport");
		if(file.isEmpty()){
			return "文件不存在";
		}
		InputStream in = file.getInputStream();
		
		Workbook workbook = null;
		try {
			workbook = WorkbookFactory.create(in);
		} catch (InvalidFormatException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return "解析excel失败！";
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
				build.append("('"+cell1.getStringCellValue()+"','"+cell2.getStringCellValue()+"')");
			}
			
		}
		
		try {
			getDao().execute("INSERT INTO UUM_USER (LOGIN_NAME,USER_NAME) VALUES "+build.toString());
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		
		return "导入成功";*/
	}
	

	
	
}
