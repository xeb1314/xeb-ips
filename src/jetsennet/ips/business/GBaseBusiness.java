package jetsennet.ips.business;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;

import jetsennet.ips.schema.IpsDatasource;
import jetsennet.ips.schema.IpsOrder;
import jetsennet.jdma.schema.DmaWebinvoke;
import jetsennet.sqlclient.DbConfig;
import jetsennet.util.ConfigUtil;
import jetsennet.util.SerializerUtil;
import jetsennet.util.SpringContextUtil;
import jetsennet.util.StringUtil;
import jetsennet.util.XmlUtil;

public class GBaseBusiness {

	/**
	 * Gbase数据库连接
	 */
//	private Connection conn = null;
	
	/**
	 * 获取Gbase数据库连接
	 */
	private Connection getConnection()
	{
		Connection conn = null;
		try {
			Class.forName(DbConfig.getProperty("gbase_driver"));
			try {
				conn = DriverManager.getConnection(DbConfig.getProperty("gbase_dburl"));
				conn.setAutoCommit(false);
			} catch (SQLException e) {
				e.printStackTrace();
			}
		} catch (ClassNotFoundException e) {
			e.printStackTrace();
		}
		return conn;
	}
	
	/**
	 * 关闭Gbase数据库连接
	 * @throws SQLException 
	 */
	private void closeConnection(Connection conn) throws SQLException
	{
		if(conn == null)return;
		try {
			conn.close();
			conn = null;
		} catch (SQLException e) {
			throw e;
		}
	}
	
	/**
	 * 关闭事务
	 * @param pstmt
	 * @throws SQLException 
	 */
	private void close(Statement pstmt) throws SQLException 
	{
		if (pstmt != null) {
			try {
				pstmt.close();
			} catch (SQLException e) {
				throw e;
			}
		}
	}
	
	/**
	 * 关闭结果接
	 * @param rs
	 * @throws SQLException 
	 */
	private void close(ResultSet rs) throws SQLException
	{
		if (rs != null) {
			try {
				rs.close();
			} catch (SQLException e) {
				throw e;
			}
		}
	}
	
	/**
	 * 建表
	 * @param ipsOrder
	 * @param userName
	 * @param ipsDataSource
	 * @throws Exception
	 */
	public void createTable(IpsOrder ipsOrder, String userName, IpsDatasource ipsDataSource) throws Exception
	{
//		String gbaseTable = ConfigUtil.getProperty("gbase.table");
		
		//时间戳
		SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyyMMddHHmmssSSS");
		Date currentDate = new Date();
		String newFileName = simpleDateFormat.format(currentDate);
		
		String tableName = ipsDataSource.getStr1() +"_"+userName+"_"+newFileName;
		String createTableSql = String.format(fileReaderAll("email_gbase.txt","UTF-8").toString(), tableName);
		Connection conn = getConnection();
		conn.setAutoCommit(true);
		Statement stmt = null;
		try {
			stmt = conn.createStatement();
			boolean execute = stmt.execute(createTableSql);
			if(!execute)
			{
				IpsDataSourceBusiness ipsDataSourceBusiness = (IpsDataSourceBusiness) SpringContextUtil.getBean("ipsDataSourceBusiness");
				ipsDataSource.setStr1(tableName);
				int updateBusinessObjs = ipsDataSourceBusiness.getDao().updateBusinessObjs(true,ipsDataSource);
				if(updateBusinessObjs != 0)
				{
					copyData2Table(ipsOrder, ipsDataSource);
					
					StringBuilder msgSb = new StringBuilder();
					msgSb.append("<mts version=\"2.1\">");
					msgSb.append("<mtsOrderInfo>");
					msgSb.append("<userName>");
					msgSb.append(userName);
					msgSb.append("</userName>");
					msgSb.append("<orderId>");
					msgSb.append(ipsOrder.getOrderId());
					msgSb.append("</orderId>");
					msgSb.append("<DsID>");
					msgSb.append(ipsDataSource.getDsId());
					msgSb.append("</DsID>");
					msgSb.append("<tableName>");
					msgSb.append(ipsDataSource.getStr1());
					msgSb.append("</tableName>");
					msgSb.append("<orderInfo>");
//					msgSb.append(ipsOrder.getOrderInfo());
					msgSb.append("</orderInfo>");
					msgSb.append("</mtsOrderInfo>");
					msgSb.append("</mts>");
					
					//消息
					DmaWebinvoke dmaWebinvoke = new DmaWebinvoke();
					dmaWebinvoke.setInvokeId(UUID.randomUUID().toString());
					dmaWebinvoke.setActionName(ConfigUtil.getProperty("msg.server.ip")+":"+ConfigUtil.getProperty("msg.server.port"));
					dmaWebinvoke.setRequestXml(msgSb.toString());
					dmaWebinvoke.setRequestTime(new Timestamp(new Date().getTime()));
					
					Element dmaRoot = DocumentHelper.parseText(SerializerUtil.serialize(dmaWebinvoke, "dmaWebinvoke")).getRootElement();
					DmaWebinvoke ipsWebInvoke = SerializerUtil.deserialize(DmaWebinvoke.class, dmaRoot);
					ipsDataSourceBusiness.getDao().saveBusinessObjs(ipsWebInvoke);
					
					String response = SocketMsgProxy.send(ConfigUtil.getProperty("msg.server.ip"), 
							Integer.parseInt(ConfigUtil.getProperty("msg.server.port")), msgSb.toString());
					
					dmaWebinvoke.setResponseXml(response);
					dmaWebinvoke.setResponseTime(new Timestamp(new Date().getTime()));
					
					dmaRoot = DocumentHelper.parseText(SerializerUtil.serialize(dmaWebinvoke, "dmaWebinvoke")).getRootElement();
					ipsWebInvoke = SerializerUtil.deserialize(DmaWebinvoke.class, dmaRoot);
					ipsDataSourceBusiness.getDao().updateBusinessObjs(false, dmaWebinvoke);
				}
			}
		} catch (SQLException e) {
			throw e;
		}finally{
			closeConnection(conn);
			close(stmt);
		}
		
	}
	
	private static StringBuffer fileReaderAll(String FileName, String charset)throws IOException {
		StringBuffer row = new StringBuffer();
		BufferedReader reader = new BufferedReader(new InputStreamReader(  
				ConfigUtil.class.getResourceAsStream("/"+FileName), charset));
		String line = new String();
		while ((line = reader.readLine()) != null) {  
			row.append(line);
		}
		reader.close();
		return row;  
	}
	
	
	/**
	 * 复制表数据
	 * @param ipsOrder
	 * @param ipsDataSource
	 * @throws Exception
	 */
	public void copyData2Table(IpsOrder ipsOrder, IpsDatasource ipsDataSource) throws Exception
	{
		IpsDataSourceBusiness ipsDataSourceBusiness = (IpsDataSourceBusiness) SpringContextUtil.getBean("ipsDataSourceBusiness");
		
		IpsDatasource oldDS = ipsDataSourceBusiness.getDataSourceByDsID(ipsDataSource.getParentId());
		if(oldDS == null)throw new Exception("数据源不存在！");
		
		StringBuilder queryOldTableSql = new StringBuilder();
		
		queryOldTableSql.append("SELECT * FROM ");
		queryOldTableSql.append(oldDS.getStr1());
		queryOldTableSql.append(" WHERE ");
		
		String orderInfoStr = ipsOrder.getOrderInfo();
		Document doc = DocumentHelper.parseText(orderInfoStr);
		Element root = doc.getRootElement();
		List<Element> mtsOrders = root.elements("mtsOrder");
		for(Element mtsOrder : mtsOrders)
		{
			List<Element> orderInfos = mtsOrder.elements("orderInfo");
			for(Element orderInfo : orderInfos)
			{
				String sendUser = XmlUtil.tryGetItemText(orderInfo, "sendUser", "");
        		String recvUser = XmlUtil.tryGetItemText(orderInfo, "recvUser", "");
        		String subject = XmlUtil.tryGetItemText(orderInfo, "subject", "");
        		String content = XmlUtil.tryGetItemText(orderInfo, "content", "");
        		String srcIP = XmlUtil.tryGetItemText(orderInfo, "srcIP", "");
        		String dstIP = XmlUtil.tryGetItemText(orderInfo, "dstIP", "");
        		String srcPort = XmlUtil.tryGetItemText(orderInfo, "srcPort", "");
        		String dstPort = XmlUtil.tryGetItemText(orderInfo, "dstPort", "");
        		String protocol = XmlUtil.tryGetItemText(orderInfo, "protocol", "");
        		
        		if (!StringUtil.isNullOrEmpty(sendUser)) {
        			String[] split = sendUser.split(",");
        			int i = 0;
        			for(String item : split)
        			{
        				if(i != 0)queryOldTableSql.append("OR ");
        				queryOldTableSql.append("FromAddr ");
        				queryOldTableSql.append("LIKE '%");
        				queryOldTableSql.append(item);
        				queryOldTableSql.append("%' ");
        				i++;
        			}
        			queryOldTableSql.append(" AND ");
    			}
        		if (!StringUtil.isNullOrEmpty(recvUser)) {
        			String[] split = recvUser.split(",");
        			int i = 0;
        			for(String item : split)
        			{
        				if(i != 0)queryOldTableSql.append("OR ");
        				queryOldTableSql.append("ToAddr ");
        				queryOldTableSql.append("LIKE '%");
        				queryOldTableSql.append(item);
        				queryOldTableSql.append("%' ");
        				i++;
        			}
        			queryOldTableSql.append(" AND ");
    			}
        		if (!StringUtil.isNullOrEmpty(subject)) {
        			String[] split = subject.split(",");
        			int i = 0;
        			for(String item : split)
        			{
        				if(i != 0)queryOldTableSql.append("OR ");
        				queryOldTableSql.append("Subject ");
        				queryOldTableSql.append("LIKE '%");
        				queryOldTableSql.append(item);
        				queryOldTableSql.append("%' ");
        				i++;
        			}
        			queryOldTableSql.append(" AND ");
    			}
        		if (!StringUtil.isNullOrEmpty(content)) {
        			String[] split = content.split(",");
        			int i = 0;
        			for(String item : split)
        			{
        				if(i != 0)queryOldTableSql.append("OR ");
        				queryOldTableSql.append("SText ");
        				queryOldTableSql.append("LIKE '%");
        				queryOldTableSql.append(item);
        				queryOldTableSql.append("%' ");
        				i++;
        			}
        			queryOldTableSql.append(" AND ");
    			}
        		if (!StringUtil.isNullOrEmpty(srcIP)) {
        			queryOldTableSql.append("SrcIP ");
        			queryOldTableSql.append("='");
        			queryOldTableSql.append(srcIP);
        			queryOldTableSql.append("' AND ");
    			}
        		if (!StringUtil.isNullOrEmpty(dstIP)) {
        			queryOldTableSql.append("DestIP");
        			queryOldTableSql.append("='");
        			queryOldTableSql.append(dstIP);
        			queryOldTableSql.append("' AND ");
    			}
        		if (!StringUtil.isNullOrEmpty(srcPort)) {
        			queryOldTableSql.append("SrcPort");
        			queryOldTableSql.append("=");
        			queryOldTableSql.append(srcPort);
        			queryOldTableSql.append(" AND ");
    			}
        		if (!StringUtil.isNullOrEmpty(dstPort)) {
        			queryOldTableSql.append("DestPort");
        			queryOldTableSql.append("=");
        			queryOldTableSql.append(dstPort);
        			queryOldTableSql.append(" AND ");
    			}
        		if (!StringUtil.isNullOrEmpty(protocol)) {
        			queryOldTableSql.append("EmailType");
        			queryOldTableSql.append("='");
        			queryOldTableSql.append(protocol);
        			queryOldTableSql.append("'");
    			}
			}
		}
		Connection conn = getConnection();
		PreparedStatement pstmt = null;
		Statement stmt = conn.createStatement();
		
		
//		String emlSql = "INSERT INTO "+ipsDataSource.getStr1()+" (MessageID,MessagePID,DsID,DsPID,ProcUser,ProcCode,ProcTime,InTime,Lang,LineNo1Char,LineNo2Char,FileNo,FileLength,SrcIP,DestIP,SFromIp,SToIp,SrcPort,DestPort,EmailType,LineNo3," +
//				"LineNo4,HasAffix,FromUser,ToUser,UnknownAffix,TaskId,SerialNum,FileName,SText,FromAddr,ToAddr,CC,BCC,Subject,SendTime,Keywords,LangCode,AffixNum) " +
//				"VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
		String emlSql = "INSERT INTO "+ipsDataSource.getStr1()+" (MessageID,MessagePID,DsID,DsPID,IPVersion,SrcIP,DestIP,SFromIp,SToIp,SrcPort,DestPort,EmailTypeCode,EmailType,LineNo1,LineNo2,LineNo1Char,LineNo2Char,LineNo4,SLineGrade,FromUser,ToUser,FromAddr,ToAddr,CC,BCC,AffixNum,AffixType,AffixName,AffixType1,AffixName1,AffixPath1,LangCode,Lang,Charset,IsEncrypt,Keywords,Abstract,IsMiss,HasAffix,UnknownAffix,TaskId,SText,MessageType,InUnit,Unit,InPerson,Person,InPosition,Position,InsystemType,email."+ipsDataSource.getStr1()+".System,Inequipment,Equipment,StoreAddress,FileName,FileNo,FileLength,CountryCode,Country,OrgCode,Org,Reader,SerialNum,CollectSys,CollectUser,CollectCode,ProcUser,ProcCode,RepeatMailID,IsRepeat,AffixSize,DataStatus,Subject,LineNo3,InTime,ReadTime,CollectTime,ProcTime,SendTime) " +
				"VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
		pstmt = conn.prepareStatement(emlSql);
		
		ResultSet rs = stmt.executeQuery(queryOldTableSql.toString());
		while(rs.next())
		{
			pstmt.setString(1, UUID.randomUUID().toString());
			pstmt.setString(2, rs.getString("MessageID")!=null?rs.getString("MessageID"):"");
			pstmt.setString(3, ipsDataSource.getDsId()!=null?ipsDataSource.getDsId():"");
			pstmt.setString(4, rs.getString("DsID")!=null?rs.getString("DsID"):"");
			pstmt.setString(5, rs.getString("IPVersion")!=null?rs.getString("IPVersion"):"");
			pstmt.setString(6, rs.getString("SrcIP")!=null?rs.getString("SrcIP"):"");
			pstmt.setString(7, rs.getString("DestIP")!=null?rs.getString("DestIP"):"");
			pstmt.setString(8, rs.getString("SFromIp")!=null?rs.getString("SFromIp"):"");
			pstmt.setString(9, rs.getString("SToIp")!=null?rs.getString("SToIp"):"");
			pstmt.setInt(10, rs.getInt("SrcPort"));
			pstmt.setInt(11, rs.getInt("DestPort"));
			pstmt.setString(12, rs.getString("EmailTypeCode")!=null?rs.getString("EmailTypeCode"):"");
			pstmt.setString(13, rs.getString("EmailType")!=null?rs.getString("EmailType"):"");
			pstmt.setInt(14, rs.getInt("LineNo1"));
			pstmt.setInt(15, rs.getInt("LineNo2"));
			pstmt.setString(16, rs.getString("LineNo1Char")!=null?rs.getString("LineNo1Char"):"");
			pstmt.setString(17, rs.getString("LineNo2Char")!=null?rs.getString("LineNo2Char"):"");
			pstmt.setInt(18, rs.getInt("LineNo4"));
			pstmt.setInt(19, rs.getInt("SLineGrade"));
			pstmt.setString(20, rs.getString("FromUser")!=null?rs.getString("FromUser"):"");
			pstmt.setString(21, rs.getString("ToUser")!=null?rs.getString("ToUser"):"");
			pstmt.setString(22, rs.getString("FromAddr")!=null?rs.getString("FromAddr"):"");
			pstmt.setString(23, rs.getString("ToAddr")!=null?rs.getString("ToAddr"):"");
			pstmt.setString(24, rs.getString("CC")!=null?rs.getString("CC"):"");
			pstmt.setString(25, rs.getString("BCC")!=null?rs.getString("BCC"):"");
			pstmt.setInt(26, rs.getInt("AffixNum"));
			pstmt.setString(27, rs.getString("AffixType")!=null?rs.getString("AffixType"):"");
			pstmt.setString(28, rs.getString("AffixName")!=null?rs.getString("AffixName"):"");
			pstmt.setString(29, rs.getString("AffixType1")!=null?rs.getString("AffixType1"):"");
			pstmt.setString(30, rs.getString("AffixName1")!=null?rs.getString("AffixName1"):"");
			pstmt.setString(31, rs.getString("AffixPath1")!=null?rs.getString("AffixPath1"):"");
			pstmt.setString(32, rs.getString("LangCode")!=null?rs.getString("LangCode"):"");
			pstmt.setString(33, rs.getString("Lang")!=null?rs.getString("Lang"):"");
			pstmt.setString(34, rs.getString("Charset")!=null?rs.getString("Charset"):"");
			pstmt.setInt(35, rs.getInt("IsEncrypt"));
			pstmt.setString(36, rs.getString("Keywords")!=null?rs.getString("Keywords"):"");
			pstmt.setString(37, rs.getString("Abstract")!=null?rs.getString("Abstract"):"");
			pstmt.setInt(38, rs.getInt("IsMiss"));
			pstmt.setInt(39, rs.getInt("HasAffix"));
			pstmt.setInt(40, rs.getInt("UnknownAffix"));
			pstmt.setInt(41, rs.getInt("TaskId"));
			pstmt.setString(42, rs.getString("SText")!=null?rs.getString("SText"):"");
			pstmt.setString(43, rs.getString("MessageType")!=null?rs.getString("MessageType"):"");
			pstmt.setString(44, rs.getString("InUnit")!=null?rs.getString("InUnit"):"");
			pstmt.setString(45, rs.getString("Unit")!=null?rs.getString("Unit"):"");
			pstmt.setString(46, rs.getString("InPerson")!=null?rs.getString("InPerson"):"");
			pstmt.setString(47, rs.getString("Person")!=null?rs.getString("Person"):"");
			pstmt.setString(48, rs.getString("InPosition")!=null?rs.getString("InPosition"):"");
			pstmt.setString(49, rs.getString("Position")!=null?rs.getString("Position"):"");
			pstmt.setString(50, rs.getString("InsystemType")!=null?rs.getString("InsystemType"):"");
			pstmt.setString(51, rs.getString("System")!=null?rs.getString("System"):"");
			pstmt.setString(52, rs.getString("Inequipment")!=null?rs.getString("Inequipment"):"");
			pstmt.setString(53, rs.getString("Equipment")!=null?rs.getString("Equipment"):"");
			pstmt.setString(54, rs.getString("StoreAddress")!=null?rs.getString("StoreAddress"):"");
			pstmt.setString(55, rs.getString("FileName")!=null?rs.getString("FileName"):"");
			pstmt.setString(56, rs.getString("FileNo")!=null?rs.getString("FileNo"):"");
			pstmt.setInt(57, rs.getInt("FileLength"));
			pstmt.setString(58, rs.getString("CountryCode")!=null?rs.getString("CountryCode"):"");
			pstmt.setString(59, rs.getString("Country")!=null?rs.getString("Country"):"");
			pstmt.setString(60, rs.getString("OrgCode")!=null?rs.getString("OrgCode"):"");
			pstmt.setString(61, rs.getString("Org")!=null?rs.getString("Org"):"");
			pstmt.setString(62, rs.getString("Reader")!=null?rs.getString("Reader"):"");
			pstmt.setString(63, rs.getString("SerialNum")!=null?rs.getString("SerialNum"):"");
			pstmt.setString(64, rs.getString("CollectSys")!=null?rs.getString("CollectSys"):"");
			pstmt.setString(65, rs.getString("CollectUser")!=null?rs.getString("CollectUser"):"");
			pstmt.setString(66, rs.getString("CollectCode")!=null?rs.getString("CollectCode"):"");
			pstmt.setString(67, rs.getString("ProcUser")!=null?rs.getString("ProcUser"):"");
			pstmt.setString(68, rs.getString("ProcCode")!=null?rs.getString("ProcCode"):"");
			pstmt.setString(69, rs.getString("RepeatMailID")!=null?rs.getString("RepeatMailID"):"");
			pstmt.setInt(70, rs.getInt("IsRepeat"));
			pstmt.setInt(71, rs.getInt("AffixSize"));
			pstmt.setInt(72, rs.getInt("DataStatus"));
			pstmt.setString(73, rs.getString("Subject")!=null?rs.getString("Subject"):"");
			pstmt.setInt(74, rs.getInt("LineNo3"));
			pstmt.setTimestamp(75, rs.getTimestamp("InTime"));
			pstmt.setTimestamp(76, rs.getTimestamp("ReadTime"));
			pstmt.setTimestamp(77, rs.getTimestamp("CollectTime"));
			pstmt.setTimestamp(78, rs.getTimestamp("ProcTime"));
			pstmt.setTimestamp(79, rs.getTimestamp("SendTime"));
			
			pstmt.executeUpdate();
		}
		try {
			conn.commit();
		} catch (Exception e) {
			conn.rollback();
			throw e;
		} finally{
			closeConnection(conn);
			close(pstmt);
			close(stmt);
			close(rs);
		}
	}
}
