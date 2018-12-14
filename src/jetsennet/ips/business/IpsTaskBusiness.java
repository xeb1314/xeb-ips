/* 
 * Copyright (c) 北京捷成世纪科技股份有限公司. All Rights Reserved.
 * 文件：jetsennet.jcms.business.JcmsBusiness.java
 * 日 期：2014-11-8 下午12:31:07
 * 作 者：梁继杰
 */
package jetsennet.ips.business;

import java.net.ConnectException;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.Date;
import java.util.List;
import java.util.Map;

import jetsennet.frame.business.BaseBusiness;
import jetsennet.frame.business.Business;
import jetsennet.ips.schema.IpsTask;
import jetsennet.jdma.schema.DmaWebinvoke;
import jetsennet.net.HttpRequestProxy;
import jetsennet.net.WSResult;
import jetsennet.sqlclient.DbConfig;
import jetsennet.sqlclient.ISqlParser;
import jetsennet.sqlclient.SqlQuery;
import jetsennet.util.DBUtil;
import jetsennet.util.SerializerUtil;
import jetsennet.wfm.schema.Proclog;
import jetsennet.wfm.schema.Tasklog;

import org.apache.log4j.Logger;
import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.dom4j.Node;
import org.uorm.dao.common.SqlParameter;

/**
 *  TODO 添加该类的简单功能说明以及算法
 *
 * @author <a href="mailto:liangjijie@jetsen.cn">梁继杰</a>
 * @version 1.0.0
 * ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝<br/>
 * 修订日期                 修订人            描述<br/>
 * 2014-11-9       梁继杰           创建<br/>
 */
public class IpsTaskBusiness extends BaseBusiness {

	private static final Logger logger = Logger.getLogger(IpsTaskBusiness.class);

	@Override
	@Business
	public int commonObjInsert(String className, String xml) throws Exception {
		/*Element root = DocumentHelper.parseText(xml).getRootElement();
		IpsTask task = SerializerUtil.deserialize(IpsTask.class, root);
        getDao().saveBusinessObjs(task);
        return 0;*/
		Class cls = getSchemaClass("jetsennet.ips.schema.IpsTask");
		Map module = SerializerUtil.deserialize2map(cls, xml);
	    return getDao().saveModelData(cls, module);
	}
	
	@Override
	@Business
	public int commonObjUpdateByPk(String className, String xml,
			boolean isFilterNull) throws Exception {
		Element root = DocumentHelper.parseText(xml).getRootElement();
		IpsTask task = SerializerUtil.deserialize(IpsTask.class, root);
        getDao().updateBusinessObjs(isFilterNull, task);
        return 0;
	}

	@Override
	@Business
	public int commonObjDelete(String className, String keyValues)
			throws Exception {
		getDao().delete(IpsTask.class, DBUtil.getInCond(IpsTask.PROP_TASK_ID, keyValues));
        return 0;
	}
	
	/**
	 * 删除任务时相应的删除对应的子项
	 * @param className
	 * @param keyValues
	 * @return
	 * @throws Exception
	 */
	@Business
	public int commonObjDeleteNew(String className, String keyValues)throws Exception {
//		WSResult result = new WSResult();
//		List<Proclog> procLogList = getDao().queryBusinessObjs(Proclog.class, "SELECT PROCEXEC_ID FROM WFM_PROCLOG WHERE WFM_PROCLOG.PROC_ID = " +keyValues);
		getDao().update(String.format("DELETE FROM WFM_TASKLOG WHERE PROCEXEC_ID IN (SELECT PROCEXEC_ID FROM WFM_PROCLOG WHERE WFM_PROCLOG.PROC_ID =%s)",
				keyValues));
		getDao().update(String.format("DELETE FROM WFM_PROCLOG WHERE PROC_ID IN (%s)",
				keyValues));
//		result.setResultVal(getDao().delete(Proclog.class,DBUtil.getInCond(Proclog.PROP_PROC_ID, keyValues)));
		return 0;
	}
	/**
	 * 发送采集任务以及保存到damWebInvoke中
	 * @param queryXml
	 * @return
	 * @throws Exception
	 */
	public String sendTask(String queryXml) throws Exception{
		String msg="";
		Element retDoc = DocumentHelper.parseText(queryXml).getRootElement();
//		Document retDoc = DocumentHelper.parseText(queryXml);
		try{
			msg = HttpRequestProxy.send(retDoc.selectSingleNode("ACTION_NAME").getText(), retDoc.selectSingleNode("REQUEST_XML").getText());
		}catch(ConnectException e){
			msg = "-1";
		}
		
		//保存响应的消息
		retDoc.addElement("RESPONSE_XML").setText(msg.toString());
		retDoc.addElement("RESPONSE_TIME").setText(new Timestamp(new Date().getTime()).toString());
		String state = "0";
		if(msg.equals("-1")){
			state = "1";
		}
		retDoc.addElement("STATE").setText(state);
		DmaWebinvoke ipsCommmsg = SerializerUtil.deserialize(DmaWebinvoke.class, retDoc);
		getDao().saveBusinessObjs(ipsCommmsg);
		
		return msg;
	}
	/**
	 * 分页查询 我的任务---数据采集任务的gride
	 * @param xml
	 * @param startNum
	 * @param pageSize
	 * @return
	 * @throws SQLException
	 */
	 public WSResult collocTaskQueryForPage(String xml, int startNum, int pageSize) throws SQLException{
	    SqlQuery query = (SqlQuery)SerializerUtil.deserialize(SqlQuery.class, xml);
	    String orderBy = query.orderString;
	    query.orderString = "";
	    ISqlParser sqlParser = getDao().getSqlParser();
	    String sql = sqlParser.getSelectCommandString(query);
	    String resultSql = "SELECT t1.*,t2.AMOUNT FROM ("+sql+") t2 JOIN IPS_TASK t1 ON t1.TASK_ID=t2.TASK_ID "+orderBy;
	    String countSql = getDao().getSession().getTransform().getCountSql(resultSql);
	
	    WSResult result = new WSResult();
	    if (isJsonRequest())
	    {
	      result.setResultVal(getDao().fillJsonByPagedQuery(countSql, resultSql, startNum, pageSize, new SqlParameter[0]));
	    }
	    else
	    {
	      result.setResultVal(getDao().fillByPagedQuery(countSql, resultSql, startNum, pageSize, new SqlParameter[0]).asXML());
	    }
	    return result;
	  }
	 
	 /**
	  * 查询采集任务的统计图标
	  * 
	  * 增加按时间段筛选的条件 -- update by xueenbin 20151202
	  * 
	  * SELECT t2.PROCACT_NAME,t2.ACT_ID,t1.PROC_ID,t1.SUCCESS,t1.FAIL,t2.PROCACT_ID FROM (
	  		SELECT t.ACT_ID,t.PROC_ID,SUM(t.EXEC_COUNT) AS SUCCESS,SUM(t.FAIL_COUNT) AS FAIL
	    		FROM CM801_OBJTASK t WHERE (t.IPSTASK_ID = 'DBBDDA4C-BAC6-4C59-961D-4250EE26EC70' AND t.PROC_ID=72) 
	    			AND (t.FINISHED_TIME >'2015-11-27' AND t.FINISHED_TIME<'2015-11-27 23:59:59')
	    				GROUP BY t.ACT_ID,t.PROC_ID
	    					) t1 RIGHT JOIN WFM_PROCACT t2 ON t1.ACT_ID=t2.ACT_ID WHERE t2.PROC_ID=72 AND t2.ACT_ID NOT IN(10201,10001,10101)
	    						AND t2.PROC_VER =(SELECT MAX (PROC_VER) FROM WFM_PROCVER WHERE PROC_ID=72 GROUP BY PROC_ID)
	    				   			ORDER BY t2.PROCACT_ID
	  * @param xml
	  * @return
	  * @throws SQLException
	  */
	 public WSResult collocTotalQuery(String taskId,String procId,String startTime,String endTime) throws SQLException{
		 
		 String driver = DbConfig.getProperty("db.driver");
		 String driverVal = driver.substring(driver.lastIndexOf(".")+1);
		 if(driverVal.indexOf("OracleDriver") >= 0){
			 startTime = "to_date('"+startTime+" ','YYYY-MM-DD HH24:MI:SS')";
			 endTime = "to_date('"+endTime+" ','YYYY-MM-DD HH24:MI:SS')";
		 }else if(driverVal.indexOf("SQLServerDriver") >= 0){
			 startTime = "'"+startTime+"'";
			 endTime = "'"+endTime+"'";
		 }
		/*SqlQuery query = (SqlQuery)SerializerUtil.deserialize(SqlQuery.class, xml);
	    ISqlParser sqlParser = getDao().getSqlParser();
	    String sql = sqlParser.getSelectCommandString(query);
	    SqlCondition[] sqla = query.conditions;*/
//	    String resultSql = "SELECT t2.PROCACT_NAME,t1.SUCCESS,t1.FAIL FROM ("+sql+") t1 JOIN WFM_PROCACT t2 ON t2.PROC_ID=t1.PROC_ID AND t1.ACT_ID=t2.ACT_ID ORDER BY t2.PROCACT_ID";
	    String resultSql = "SELECT t2.PROCACT_NAME,t2.ACT_ID,t1.PROC_ID,t1.SUCCESS,t1.FAIL,t2.PROCACT_ID FROM (" +
	    				   	"SELECT t.ACT_ID,t.PROC_ID,SUM(t.EXEC_COUNT) AS SUCCESS,SUM(t.FAIL_COUNT) AS FAIL "+
	    				   		"FROM CM801_OBJTASK t WHERE (t.IPSTASK_ID = '"+taskId+"' AND t.PROC_ID="+procId+") "+
	    				   		"AND (t.FINISHED_TIME > "+startTime+" AND t.FINISHED_TIME< "+endTime+")"+
	    				   			"GROUP BY t.ACT_ID,t.PROC_ID  "+
	    				   	") t1 RIGHT JOIN WFM_PROCACT t2 ON t1.ACT_ID=t2.ACT_ID WHERE t2.PROC_ID="+procId+" AND t2.ACT_ID NOT IN(10201,10001,10101) " +
	    				   			"AND t2.PROC_VER =(SELECT MAX (PROC_VER) FROM WFM_PROCVER WHERE PROC_ID="+procId+" GROUP BY PROC_ID)" +
	    				   	"ORDER BY t2.PROCACT_ID";   
	    WSResult result = new WSResult();
	    logger.info(resultSql);
	    if (isJsonRequest())
	    {
	      result.setResultVal(getDao().fillJson(resultSql, new SqlParameter[0]));
	    }
	    else
	    {
	      result.setResultVal(getDao().fill(resultSql, new SqlParameter[0]).asXML());
	    }
	    return result;
		 
	 }
	 
	 /**
	  * 查询数据采集任务的统计图标
	  * @param taskId
	  * @param startTime
	  * @param endTime
	  * @return
	  * @throws SQLException
	  */
	 public WSResult collectTaskToCount(String taskId,String startTime,String endTime)throws SQLException{
		 String driver = DbConfig.getProperty("db.driver");
		 String driverVal = driver.substring(driver.lastIndexOf(".")+1);
		 String checkTime = "";
		 String[] startTimes = startTime.split(" ");
		 String[] endTimes = endTime.split(" ");
		 if(driverVal.indexOf("OracleDriver") >= 0){
			 if(startTimes[0].equals(endTimes[0])){
				 checkTime = "to_char(T.STAT_TIME,'HH24:MI:SS')";
			 }else{
				 checkTime = "to_char(T.STAT_TIME,'YYYY-MM-DD')";
			 }
			 startTime = "to_date('"+startTime+" ','YYYY-MM-DD HH24:MI:SS')";
			 endTime = "to_date('"+endTime+" ','YYYY-MM-DD HH24:MI:SS')";
		 }else if(driverVal.indexOf("SQLServerDriver") >= 0){
			 if(startTimes[0].equals(endTimes[0])){
				 checkTime = "CONVERT(char(2),T.STAT_TIME,114)";
			 }else{
				 checkTime = "CONVERT(char(10),T.STAT_TIME,111)";
			 }
			 startTime = "'"+startTime+"'";
			 endTime = "'"+endTime+"'";
		 }
		 String resultSql = "SELECT "+checkTime+" DATE_TIME,SUM(t.AMOUNT)AS COUNT FROM IPS_GATHTERSTAT t " +
		 		"INNER JOIN IPS_TASK i ON i.TASK_ID = t.TASK_ID WHERE (t.TASK_ID = '"+taskId+"') " +
		 				"AND (t.STAT_TIME > "+startTime+") AND (t.STAT_TIME < "
		 				+endTime+")GROUP BY "+checkTime +"ORDER BY "+checkTime;
		 WSResult result = new WSResult();
	 	 logger.info(resultSql);
	     if (isJsonRequest()){
	      result.setResultVal(getDao().fillJson(resultSql, new SqlParameter[0]));
	     }else{
		  result.setResultVal(getDao().fill(resultSql, new SqlParameter[0]).asXML());
		 }
		 return result;
	 }
	
	 /**
	  * 数据处理界面根据数据源ID获取处理任务对应最新版本的流程。
	  * add By Xueenbin 20160505
	  * @param dsId
	  * @return
	  * @throws SQLException
	  */
	 public String queryProcessByDS(String dsId) throws SQLException{
		    String resultSql = "SELECT * FROM WFM_PROCACT WHERE PROC_ID IN (SELECT PROC_ID FROM IPS_TASK WHERE " +
		    		"DS_ID='"+dsId+"' AND TASK_TYPE=10 ) AND " +
		    		"PROC_VER = (SELECT MAX(PROC_VER) FROM WFM_PROCACT WHERE PROC_ID IN " +
		    		"(SELECT PROC_ID FROM IPS_TASK WHERE DS_ID='"+dsId+"'));";
		
		    WSResult result = new WSResult();
		    logger.debug(resultSql);
		    if (isJsonRequest())
		    {
		      result.setResultVal(getDao().fillJson(resultSql, new SqlParameter[0]));
		    }
		    else
		    {
		      result.setResultVal(getDao().fill(resultSql, new SqlParameter[0]).asXML());
		    }
		    return result.resultVal;
	}
	
	 /**
	  * 根据数据源ID修改任务对应扫描节点的扫描路径
	  * @param procactId
	  * @param actParam
	  * @return
	  * @throws Exception
	  */
	public int updateActParamByDS(String procactId, String actParam)throws Exception {
//		WSResult result = new WSResult();
//		List<Proclog> procLogList = getDao().queryBusinessObjs(Proclog.class, "SELECT PROCEXEC_ID FROM WFM_PROCLOG WHERE WFM_PROCLOG.PROC_ID = " +keyValues);
		getDao().update(String.format("UPDATE WFM_PROCACT SET ACT_PARAM='%s' WHERE PROCACT_ID=%s; ",
				actParam,procactId));
//		result.setResultVal(getDao().delete(Proclog.class,DBUtil.getInCond(Proclog.PROP_PROC_ID, keyValues)));
		return 0;
	}
	 
}
