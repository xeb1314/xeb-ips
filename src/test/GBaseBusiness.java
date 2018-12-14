package test;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.text.SimpleDateFormat;
import java.util.Date;

import jetsennet.ips.schema.IpsDatasource;
import jetsennet.ips.schema.IpsOrder;
import jetsennet.sqlclient.DbConfig;

public class GBaseBusiness {

	/**
	 * Gbase数据库连接
	 */
//	private Connection conn = null;
	
	/**
	 * 获取Gbase数据库连接
	 */
	private static Connection getConnection()
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
	private static void closeConnection(Connection conn) throws SQLException
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
	private static void close(Statement pstmt) throws SQLException 
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
	private static void close(ResultSet rs) throws SQLException
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
	public static void createTable(IpsOrder ipsOrder, String userName, IpsDatasource ipsDataSource,String tablesql) throws Exception
	{
//		String gbaseTable = ConfigUtil.getProperty("gbase.table");
		
		//时间戳
		SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyyMMddHHmmssSSS");
		Date currentDate = new Date();
		String newFileName = simpleDateFormat.format(currentDate);
		
		String tableName = "email" +"_"+userName+"_"+newFileName;
		
		String createTableSql = String.format(tablesql, tableName);
		System.out.println(createTableSql.toString());
		Connection conn = getConnection();
		conn.setAutoCommit(true);
		Statement stmt = null;
		try {
			stmt = conn.createStatement();
			boolean execute = stmt.execute(createTableSql);
			if(!execute)
			{
			}
		} catch (SQLException e) {
			throw e;
		}finally{
			closeConnection(conn);
			close(stmt);
		}
		
	}
	
	public static void main(String[] args) throws Exception
	{
//		StringBuffer ss = FileAccess.fileReaderAll("email_gbase.txt","UTF-8");
//		createTable(null,"admin",null,ss.toString());
		copyData2Table(null,null);
		
	}
	
	/**
	 * 复制表数据
	 * @param ipsOrder
	 * @param ipsDataSource
	 * @throws Exception
	 */
	public static void copyData2Table(IpsOrder ipsOrder, IpsDatasource ipsDataSource) throws Exception
	{
		Connection conn = getConnection();
		Statement stmt = conn.createStatement();
		ResultSet rs = null;
		ResultSetMetaData rsmd = null;
		PreparedStatement pstmt = null;
		try {
//			IpsDataSourceBusiness ipsDataSourceBusiness = (IpsDataSourceBusiness) SpringContextUtil.getBean("ipsDataSourceBusiness");
//			
//			IpsDatasource oldDS = ipsDataSourceBusiness.getDataSourceByDsID(ipsDataSource.getParentId());
//			if(oldDS == null)throw new Exception("数据源不存在！");
			
			StringBuilder queryOldTableSql = new StringBuilder();
			
			queryOldTableSql.append("SELECT * FROM ");
			queryOldTableSql.append("email");
//			queryOldTableSql.append(" WHERE ");
			
//			String orderInfoStr = ipsOrder.getOrderInfo();
//			Document doc = DocumentHelper.parseText(orderInfoStr);
//			Element root = doc.getRootElement();
//			Element mtsOrders = root.element("mtsOrder");
//			Element orderInfos = mtsOrders.element("orderInfo");
//			String conditionQL = XmlUtil.tryGetItemText(orderInfos, AttributeItemName.ConditionQL, "1!=1");
			String conditionQL = "SID ='ee3f6caa-52ed-4d41-9031-a7c21edd60e9'";
//			queryOldTableSql.append(conditionQL);
			
			rs = stmt.executeQuery(queryOldTableSql.toString());
			if(rs==null)return;
			rsmd = rs.getMetaData();
			int rsColoumnCount = rsmd.getColumnCount();
			
			StringBuilder insertSql = new StringBuilder();
			insertSql.append("INSERT INTO ").append("email_leiyang_20150413190402088").append("(");//.append(" SELECT * FROM email WHERE SID IN (");
			int total = 0;
			while(rs.next())
			{
				String sid = rs.getString("SID");
//				if(existsList.contains(sid))
//					continue;
				if(total==0)
				{
					for (int i = 0; i < rsColoumnCount; i++) {
						if(i+1==rsColoumnCount)
							insertSql.append(rsmd.getColumnName(i +1));
						else
							insertSql.append(rsmd.getColumnName(i +1)).append(",");
					}
					insertSql.append(") VALUES (");
					
					for (int i = 0; i < rsColoumnCount; i++) {
						if(i+1==rsColoumnCount)
							insertSql.append("?");
						else
							insertSql.append("?,");
					}
					insertSql.append(")");
					pstmt = conn.prepareStatement(insertSql.toString());
					System.out.println(insertSql.toString());
				}
				
				for (int i = 0; i < rsColoumnCount; i++) {
					int columnType = rsmd.getColumnType(i+1);
					pstmt.setObject(i+1, rs.getObject(i + 1), columnType);
				}
//				pstmt.executeUpdate();
				total++;
//				existsList.add(sid);
			}
//			conn.commit();
		} catch (Exception e) {
			conn.rollback();
			throw new Exception("数据库结果订阅，操作南通数据库异常",e);
		} finally{
			close(rs);
			close(stmt);
			closeConnection(conn);
		}
	}
}
