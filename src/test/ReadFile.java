package test;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.Iterator;
import java.util.List;

import javax.servlet.ServletContext;

import org.dom4j.Attribute;
import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;

import jetsennet.net.HttpRequestProxy;
import jetsennet.util.ConfigUtil;
import jetsennet.util.XmlUtil;

public class ReadFile {

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		
		String filePath = "C://33333.xml";
		StringBuffer fileReaderAll;
		try {
			fileReaderAll = FileReaderAll(filePath,"UTF-8");
			Document doc = DocumentHelper.parseText(fileReaderAll.toString());
			Element root = doc.getRootElement();
			List<Element> mtsOrders = root.elements("mtsOrder");
			for(Element mtsOrder : mtsOrders)
			{
				List<Element> orderInfos = mtsOrder.elements("orderInfo");
				for(Element orderInfo : orderInfos)
				{
					String userName = XmlUtil.tryGetItemText(orderInfo, "userName", ""); 
					String userId = XmlUtil.tryGetItemText(orderInfo, "userId", "");
				}
			}
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		/*
		String url = "http://192.168.1.81:12345/hurricane/admin/cores";
		StringBuilder msgSb = new StringBuilder();
		msgSb.append("wt=json");
		msgSb.append("&");
		msgSb.append("action=CREATE");
		msgSb.append("&");
		msgSb.append("stream.body=");
		msgSb.append("&");
		msgSb.append("forceOnError=true");
		try {
			String responseMsg = HttpRequestProxy.send(url, msgSb.toString());
			System.out.println(responseMsg);
		} catch (Exception e1) {
			e1.printStackTrace();
		}
		*/
		
//		InputStream input = ConfigUtil.class.getResourceAsStream("/"+"email_v3.xml");
		/*
		String filePath = "email_v3.xml";
		ReadFile readFile = new ReadFile();
		try {
			StringBuffer fileReaderAll = readFile.FileReaderAll(filePath, "UTF-8");
			try {
				System.out.println(fileReaderAll.toString());
				Document parseText = DocumentHelper.parseText(fileReaderAll.toString());
				Element document = parseText.getRootElement();
				Attribute attribute = document.attribute("name");
				attribute.setValue("我去");
				
//				System.out.println(document.attributeValue("name"));
//				parseText.asXML();
				System.out.println(parseText.asXML().replace("\n", ""));
			} catch (DocumentException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
//			System.out.println(fileReaderAll.toString());
		} catch (IOException e) {
			e.printStackTrace();
		}
		*/

	}
	
	private static StringBuffer FileReaderAll(String FileName, String charset)throws IOException {
		StringBuffer row = new StringBuffer();
		BufferedReader reader = new BufferedReader(new InputStreamReader(  
				new FileInputStream(FileName), charset));
		String line = new String();
		while ((line = reader.readLine()) != null) {  
			row.append(line);
		}
		reader.close();
		return row;  
	}

}
