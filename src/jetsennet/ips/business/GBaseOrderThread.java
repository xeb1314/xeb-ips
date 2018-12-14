package jetsennet.ips.business;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Timer;
import java.util.TimerTask;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;

import jetsennet.ips.schema.IpsDatasource;
import jetsennet.ips.schema.IpsOrder;
import jetsennet.jdma.schema.DmaWebinvoke;
import jetsennet.util.ConfigUtil;
import jetsennet.util.DateUtils;
import jetsennet.util.GBaseDbUtil;
import jetsennet.util.SerializerUtil;
import jetsennet.util.SpringContextUtil;
import jetsennet.util.XmlUtil;

import org.apache.log4j.Logger;
import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;

public class GBaseOrderThread extends AbstractOrderThread{

	private static final Logger logger = Logger.getLogger(GBaseOrderThread.class);
	
	private static final String SELECT_TABLE_COUNT = "SELECT COUNT(1) FROM ";

	private AtomicBoolean timerStarted = null;
	
	private Timer timer = null;
	private TimerTask task = null;
	
	//已处理数据MessageID 集合
	private List<String> existsList = new ArrayList<String>();
	
	public GBaseOrderThread(String taskName,IpsOrder order, String userName, String userId, IpsDatasource ipsDataSource)
	{
		super(order,userName,userId,ipsDataSource,(IpsOrderBusiness) SpringContextUtil.getBean("ipsOrderBusiness"));
		timerStarted = new AtomicBoolean(false);
		timer = new Timer(taskName, true);
		logger.debug("启动订阅单线程: " + taskName + " 订阅单名称： " + order.getOrderName());
	}
	@Override
	public void start()
	{
		if (timerStarted.get()) {
			//already start
			return;
		}
		task = new TimerTask() {
			
			@Override
			public void run() {
				try {
					switch(order.getInt1()) {
					case IpsOrderBusiness.IS_COPY_DATASOURCE:
						//创建数据库表，并且更改订单状态为以创建表--200
						if(createTable(order, userName, ipsDataSource));
						{
							ipsOrderBusiness.updateOrderStateByOrderID(IpsOrderBusiness.IS_CREATE_TABLE, order.getOrderId());
							order.setInt1(IpsOrderBusiness.IS_CREATE_TABLE);
						}
						break;
					case IpsOrderBusiness.IS_CREATE_TABLE:
						copyData2Table(order,ipsDataSource);
						sendMsg(order,userName,ipsDataSource);
						break;
					}
					
				} catch (Exception e) {
					logger.error(e);
				}
			}
		};
		//timeInterval--6秒执行一次
		timer.schedule(task, delay, timeInterval);
		timerStarted.set(true);
	}
	@Override
	public void stop() {
		if (timerStarted.compareAndSet(true, false)){
			if(task != null) {
				task.cancel();
			}
			synchronized (timer) {
				timer.purge();
				timer.cancel();
				timer = null;
			}
		}
	}
	
	
	/**
	 * 发送订阅结果给MsgServer
	 * @param ipsOrder
	 * @param userName
	 * @param ipsDataSource
	 * @throws Exception
	 */
	private void sendMsg(IpsOrder ipsOrder, String userName, IpsDatasource ipsDataSource) throws Exception
	{
		Connection conn = null;
		Statement stmt = null;
		ResultSet rs = null;
		try {
			long count = 0;
			conn = GBaseDbUtil.getGBaseConnection();
			stmt = conn.createStatement();
			rs = stmt.executeQuery(SELECT_TABLE_COUNT+ipsDataSource.getStr1());
			while(rs.next())
			{
				count = rs.getLong("COUNT(1)");
			}
			IpsDataSourceBusiness ipsDataSourceBusiness = (IpsDataSourceBusiness) SpringContextUtil.getBean("ipsDataSourceBusiness");
			
			String orderInfoStr = ipsOrder.getOrderInfo();
			Document doc = DocumentHelper.parseText(orderInfoStr);
			Element root = doc.getRootElement();
			Element mtsOrders = root.element("mtsOrder");
			Element orderInfos = mtsOrders.element("orderInfo");
			String orderUID = XmlUtil.tryGetItemText(orderInfos, AttributeItemName.OrderUID, "");
			
			StringBuilder msgSb = new StringBuilder();
			msgSb.append("<mts version=\"2.1\">");
			msgSb.append("<mtsMsgHead>");
			msgSb.append("<msgID>");
			msgSb.append(ipsOrder.getOrderId());
			msgSb.append("</msgID>");
			msgSb.append("<userName>");
			msgSb.append(userName);
			msgSb.append("</userName>");
			msgSb.append("</mtsMsgHead>");
			msgSb.append("<mtsMsgContent>");
			msgSb.append("<msgType>");
			msgSb.append("10");
			msgSb.append("</msgType>");
			msgSb.append("<msgInfo>");
			msgSb.append("<userName>");
			msgSb.append(userName);
			msgSb.append("</userName>");
			msgSb.append("<DsID>");
			msgSb.append(ipsDataSource.getDsId());
			msgSb.append("</DsID>");
			msgSb.append("<orderId>");
			msgSb.append(ipsOrder.getOrderId());
			msgSb.append("</orderId>");
			msgSb.append("<"+AttributeItemName.OrderUID+">");
			msgSb.append(orderUID);
			msgSb.append("</"+AttributeItemName.OrderUID+">");
			msgSb.append("<tableName>");
			msgSb.append(ipsDataSource.getStr1());
			msgSb.append("</tableName>");
			msgSb.append("<totalCount>");
			msgSb.append(count);
			msgSb.append("</totalCount>");
			msgSb.append("<orderInfo>");
//			msgSb.append(ipsOrder.getOrderInfo());
			msgSb.append("</orderInfo>");
			msgSb.append("</msgInfo>");
			msgSb.append("</mtsMsgContent>");
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
			String response = "";
			try {
				response = SocketMsgProxy.send(ConfigUtil.getProperty("msg.server.ip"), 
						Integer.parseInt(ConfigUtil.getProperty("msg.server.port")), msgSb.toString());
			} catch (Exception e) {
				throw new Exception("与MsgServer通信异常! ServerIp: "+ ConfigUtil.getProperty("msg.server.ip") + "ServerPort: " + ConfigUtil.getProperty("msg.server.port"),e);
			}
			
			dmaWebinvoke.setResponseXml(response);
			dmaWebinvoke.setResponseTime(new Timestamp(new Date().getTime()));
			
			dmaRoot = DocumentHelper.parseText(SerializerUtil.serialize(dmaWebinvoke, "dmaWebinvoke")).getRootElement();
			ipsWebInvoke = SerializerUtil.deserialize(DmaWebinvoke.class, dmaRoot);
			ipsDataSourceBusiness.getDao().updateBusinessObjs(false, dmaWebinvoke);
			
		} catch (Exception e) {
			throw e;
		} finally{
			GBaseDbUtil.closeGbase(rs);
			GBaseDbUtil.closeGbase(stmt);
			GBaseDbUtil.closeGBaseConnection(conn);;
		}
	}
	
	/**
	 * 建表
	 * @param ipsOrder
	 * @param userName
	 * @param ipsDataSource
	 * @throws Exception
	 */
	public boolean createTable(IpsOrder ipsOrder, String userName, IpsDatasource ipsDataSource) throws Exception
	{
		Connection conn = GBaseDbUtil.getGBaseConnection();
		//时间戳
		SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyyMMddHHmmssSSS");
		Date currentDate = new Date();
		String newFileName = simpleDateFormat.format(currentDate);
		
		String tableName = ipsDataSource.getStr1() +"_"+userName+"_"+newFileName;
		
		//String createTableSql = String.format(FileAccess.fileReaderAll(ipsDataSource.getDsClass()+"_"+ipsDataSource.getDbType()+".txt","UTF-8").toString(), tableName);
		String createTableSql = GBaseDbUtil.getTableSchmaForCreate(conn, ipsDataSource.getStr1(), tableName);
		
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
					return true;
				}else throw new Exception("更新数据源数据库表："+tableName+" 失败！");
			}else throw new Exception("创建GBase数据库表："+tableName+" 失败！");
		} catch (SQLException e) {
			throw e;
		}finally{
			GBaseDbUtil.closeGbase(stmt);
			GBaseDbUtil.closeGBaseConnection(conn);
		}
		
	}
	
	/**
	 * 复制表数据
	 * @param ipsOrder
	 * @param ipsDataSource
	 * @throws Exception
	 */
	public void copyData2Table(IpsOrder ipsOrder, IpsDatasource ipsDataSource) throws Exception
	{
		Connection conn = GBaseDbUtil.getGBaseConnection();
		Statement stmt = null;
		ResultSet rs = null;
		PreparedStatement pstmt = null;
		ResultSetMetaData rsmd = null;
		Date now = new Date();
		try {
			conn.setAutoCommit(false);
			stmt = conn.createStatement();
					
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
			Element mtsOrders = root.element("mtsOrder");
			Element orderInfos = mtsOrders.element("orderInfo");
			String conditionQL = XmlUtil.tryGetItemText(orderInfos, AttributeItemName.ConditionQL, "1!=1");
			queryOldTableSql.append(conditionQL);
			
			//根据任务上次执行时间，获取上次到这次数据的增量复制，第一次取查询条件的所有数据
			if(ipsOrder.getExecTime()!=null)
			{
				String format = "yyyy-MM-dd HH:mm:ss";
				String startTime = DateUtils.dateFormat(ipsOrder.getExecTime(), format);
				String endTime = DateUtils.dateFormat(now, format);
				queryOldTableSql.append(" AND (DINDBTIME>='").append(startTime).append("' AND DINDBTIME<'").append(endTime).append("')");
			}
			
			rs = stmt.executeQuery(queryOldTableSql.toString());
			if(rs==null)return;
			rsmd = rs.getMetaData();
			int rsColoumnCount = rsmd.getColumnCount();
			if(rsColoumnCount<1)return;
			StringBuilder insertSql = new StringBuilder();
			insertSql.append("INSERT INTO ").append(ipsDataSource.getStr1()).append("(");
			
			StringBuilder querySqlBuild = new StringBuilder();
			int total = 0;
			while(rs.next())
			{
				String sid = rs.getString("SID");
				
/*				//数据库判从
				String querySql = querySqlBuild.append("SELECT COUNT(*) FROM ")
						.append(ipsDataSource.getStr1())
						.append(" WHERE SPID='").append(sid).append("'").toString();
				ResultSet queryrs = stmt.executeQuery(querySql);
				if(queryrs!=null)
				{
					queryrs.next();
					if(queryrs.getInt(1)>0)
					{
						queryrs.close();
						continue;
					}else
						queryrs.close();
				}
*/				
				//if(existsList.contains(sid))
				//	continue;
				
				if(total==0)
				{
					for (int i = 1; i <= rsColoumnCount; i++) {
						if(i==rsColoumnCount)
							insertSql.append(rsmd.getColumnName(i));
						else
							insertSql.append(rsmd.getColumnName(i)).append(",");
					}
					insertSql.append(") VALUES (");
					
					for (int i = 1; i <= rsColoumnCount; i++) {
						if(i==rsColoumnCount)
							insertSql.append("?");
						else
							insertSql.append("?,");
					}
					insertSql.append(")");
					pstmt = conn.prepareStatement(insertSql.toString());
					System.out.println(insertSql.toString());
				}
				
				for (int i = 1; i <= rsColoumnCount; i++) {
					int columnType = rsmd.getColumnType(i);
					if("SSourceID".equals(rsmd.getColumnName(i)))
							pstmt.setObject(i, ipsDataSource.getStr1(), java.sql.Types.VARCHAR);	
					else if("SSourcePID".equals(rsmd.getColumnName(i)))
						pstmt.setObject(i, oldDS.getStr1(), java.sql.Types.VARCHAR);	
					else if("SPID".equals(rsmd.getColumnName(i)))
						pstmt.setObject(i, sid, java.sql.Types.VARCHAR);
					else
						pstmt.setObject(i, rs.getObject(i), columnType);
				}
				pstmt.addBatch();
				if((total+1)%10000==0)
				{
					pstmt.executeBatch();
					pstmt.clearBatch();
				}
				total++;
				//existsList.add(sid);
			}
			if((total+1)%10000!=0&&total!=0)
			{
				pstmt.executeBatch();
			}
			if(total>0)
				conn.commit();
			ipsOrder.setExecTime(now);
			ipsOrderBusiness.getDao().updateBusinessObjs(true, ipsOrder);
		} catch (Exception e) {
			conn.rollback();
			throw new Exception("数据库结果订阅，操作南通数据库异常",e);
		} finally{
			GBaseDbUtil.closeGbase(rs);
			GBaseDbUtil.closeGbase(stmt);
			GBaseDbUtil.closeGBaseConnection(conn);
		}
	}
	
}
