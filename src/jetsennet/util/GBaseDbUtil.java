/* 
 * Copyright (c) 北京捷成世纪科技股份有限公司. All Rights Reserved.
 * 文件：jetsennet.jwfm.commons.GBaseDbUtil.java
 * 日 期：2015年4月16日 上午9:15:14
 * 作 者：刘紫荣
 */
package jetsennet.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import jetsennet.sqlclient.DbConfig;
import jetsennet.util.StringUtil;
import jetsennet.util.XmlUtil;

import org.dom4j.Element;

/**
 *  GBase数据库操作工具类
 *
 * @author <a href="mailto:liuzirong@jetsen.com">刘紫荣</a>
 * @version 1.0.0
 * ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝<br/>
 * 修订日期                 修订人            描述<br/>
 * 2015年4月16日       刘紫荣            创建<br/>
 */
public class GBaseDbUtil {
	public static String getGBaseDbName()
	{
		String dbUrl = DbConfig.getProperty("gbase_dburl");
		return dbUrl.substring(dbUrl.lastIndexOf('/')+1,dbUrl.indexOf('?'));
	}
	/**
	/**
	 * 获取Gbase数据库连接
	 */
	public static Connection getGBaseConnection() throws Exception
	{
		Connection gbaseConn = null;
		try {
			Class.forName(DbConfig.getProperty("gbase_driver")).newInstance();
			try {
				gbaseConn = DriverManager.getConnection(DbConfig.getProperty("gbase_dburl")+"&characterEncoding=utf-8");
				gbaseConn.setAutoCommit(false);
			} catch (SQLException e) {
				throw new Exception("连接GBase异常",e);
			}
		} catch (Exception e) {
			throw new Exception("加载Gbase驱动异常",e);
		}
		return gbaseConn;
	}
	
	/**
	 * 关闭Gbase数据库连接
	 */
	public static void closeGBaseConnection(Connection gbaseConn) throws Exception
	{
		if(gbaseConn == null)return;
		try {
			gbaseConn.close();
			gbaseConn = null;
		} catch (SQLException e) {
			throw new Exception("关闭GBase连接异常",e);
		}
	}
	
	/**
	 * 关闭事务
	 * @param pstmt
	 */
	public static void closeGbase(Statement pstmt) throws Exception
	{
		if (pstmt != null) {
			try {
				pstmt.close();
			} catch (SQLException e) {
				throw new Exception("关闭GBase事务异常",e);
			}
		}
	}
	
	/**
	 * 关闭结果接
	 * @param rs
	 */
	public static void closeGbase(ResultSet rs)throws Exception
	{
		if (rs != null) {
			try {
				rs.close();
			} catch (SQLException e) {
				throw new Exception("关闭GBase结果集异常",e);
			}
		}
	}
	
	/**
	 * 统一存PloText，存到doc_plo
	 * @param rs
	 */
	public static int saveDocPlo(PreparedStatement pplostmt,org.dom4j.Element ploText,String pid,String ploType)throws Exception
	{
		int execSize = 0;
		if(pplostmt==null||ploText==null)return execSize;
		List<Element> list = ploText.elements("PLOTextItem");
		for(Element element:list)
		{
			pplostmt.setString(1, UUID.randomUUID().toString());
			pplostmt.setString(2, XmlUtil.tryGetItemText(element, "Type", null));
			pplostmt.setString(3, pid);
			pplostmt.setString(4, XmlUtil.tryGetItemText(element, "Word", null));
			pplostmt.setInt(5, Integer.parseInt(XmlUtil.tryGetItemText(element, "Pos", "0")));
			pplostmt.setString(6, ploType);
			execSize++;
		}
		if(execSize>0)pplostmt.addBatch();
		return execSize;
	}
	
	/**
	 * Gbase数据库结构，拼成插入语句
	 * @param rs
	 */
	public static String getTableSchmaForInsert(Connection gbaseConn,String srcTableName,String targetTableName,Map columnInfo)throws Exception
	{
		StringBuilder sb = new StringBuilder();
		Statement stmt = null;
		ResultSet rs = null;
		String queryTableSql = "SELECT * FROM `information_schema`.`COLUMNS` where TABLE_SCHEMA='"+GBaseDbUtil.getGBaseDbName()+"' and TABLE_NAME='"+srcTableName+"'";
		sb.append("INSERT INTO "+targetTableName+"(");
		try
		{
			int size = 0;
			stmt = gbaseConn.createStatement();
			rs = stmt.executeQuery(queryTableSql);
			if(rs==null)return null;
			while(rs.next())
			{
				sb.append(rs.getString("COLUMN_NAME")).append(",");
				if(columnInfo!=null)
					columnInfo.put(rs.getString("COLUMN_NAME"), size+1);
				size++;
			}
			sb = new StringBuilder(StringUtil.trimEnd(sb.toString(),','));
			sb.append(") VALUES (");
			for(int i=1;i<=size;i++)
			{
				sb.append("?").append(",");
			}
			sb = new StringBuilder(StringUtil.trimEnd(sb.toString(),','));
			sb.append(")");
		}catch(Exception e)
		{
			throw e;
		}finally
		{
			closeGbase(rs);
			closeGbase(stmt);
		}
		return sb.toString();
	}
	

	/**
	 * Gbase数据库结构，拼成创建插入语句
	 * @param rs
	 */
	public static String getTableSchmaForCreate(Connection gbaseConn,String srcTableName,String targetTableName)throws Exception
	{
		StringBuilder sb = new StringBuilder();
		Statement stmt = null;
		ResultSet rs = null;
		String queryTableSql = "SELECT * FROM `information_schema`.`COLUMNS` where TABLE_SCHEMA='"+GBaseDbUtil.getGBaseDbName()+"' and TABLE_NAME='"+srcTableName+"'";
		sb.append("CREATE TABLE \""+targetTableName+"\"(").append("\n");
		try
		{
			stmt = gbaseConn.createStatement();
			rs = stmt.executeQuery(queryTableSql);
			if(rs==null)return null;
			while(rs.next())
			{
				sb.append("\"").append(rs.getString("COLUMN_NAME")).append("\" ").append(rs.getString("COLUMN_TYPE")).append(" ");
				if("NO".equals(rs.getString("IS_NULLABLE")))
				{
					sb.append("NOT NULL ");
				}
				if(rs.getString("COLUMN_DEFAULT")!=null&&!"NULL".equals(rs.getString("COLUMN_DEFAULT")))
				{
					sb.append("DEFAULT ").append(rs.getString("COLUMN_DEFAULT")).append(",").append("\n");
				}else
					sb.append(",").append("\n");
			}
			sb = new StringBuilder(StringUtil.trimEnd(sb.toString(),'\n'));
			sb = new StringBuilder(StringUtil.trimEnd(sb.toString(),','));
			sb.append(") ENGINE=EXPRESS DEFAULT CHARSET=utf8");
		}catch(Exception e)
		{
			throw e;
		}finally
		{
			closeGbase(rs);
			closeGbase(stmt);
		}
		return sb.toString();
	}
}
