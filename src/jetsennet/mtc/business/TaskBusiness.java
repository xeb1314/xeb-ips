/************************************************************************
日  期：		2013-8-10
作  者:		王均
版  本：     
描  述:	        媒体任务
历  史：      
 ************************************************************************/
package jetsennet.mtc.business;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

import org.apache.log4j.Logger;
import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Node;

import jetsennet.frame.business.BaseBusiness;
import jetsennet.frame.business.Business;
import jetsennet.sqlclient.QueryTable;
import jetsennet.sqlclient.SqlCondition;
import jetsennet.sqlclient.SqlLogicType;
import jetsennet.sqlclient.SqlParamType;
import jetsennet.sqlclient.SqlQuery;
import jetsennet.sqlclient.SqlRelationType;
import jetsennet.util.DateUtil;
import jetsennet.util.StringUtil;

public class TaskBusiness extends BaseBusiness
{
	private static final Logger logger = Logger.getLogger(TaskBusiness.class);
			
			
	/**
	 * 任务统计
	 * 包括任务执行成功率，执行器使用率
	 * @param query
	 * @return
	 * @throws SQLException
	 */
	@SuppressWarnings("unchecked")
    @Business(auth = false)
	public String statisticsTask(String objXml) throws SQLException
	{
		HashMap<String, String> model = deserialize(objXml, "condition");
	    
		List<SqlCondition> cdList = new ArrayList<SqlCondition>();
		cdList.add(new SqlCondition("EXEC_MODE", String.valueOf(0), SqlLogicType.And, SqlRelationType.Equal,SqlParamType.Numeric));
	
		cdList.add(new SqlCondition("TASK_TYPE", model.get("TASK_TYPE"), SqlLogicType.And, SqlRelationType.Equal,SqlParamType.Numeric));
		cdList.add(new SqlCondition("CREATE_TIME", model.get("START_TIME"), SqlLogicType.And, SqlRelationType.Than,SqlParamType.DateTime));
		cdList.add(new SqlCondition("END_TIME", model.get("END_TIME"), SqlLogicType.And, SqlRelationType.Less,SqlParamType.DateTime));
		
		
		StringBuilder taskJson = countTaskByState(cdList);
		StringBuilder workerJson = countWorkerUsed(cdList, model);
		
		StringBuilder taskWorkerJson = new StringBuilder();
		taskWorkerJson.append("{");
		taskWorkerJson.append("\"task\":").append(taskJson);
		taskWorkerJson.append(",");
		taskWorkerJson.append("\"worker\":").append(workerJson);
		taskWorkerJson.append("}");
	    
		return taskWorkerJson.toString();
	}
	
	
	/**
	 * 统计任务执行情况,按状态
	 * @param model
	 * @return
	 * @throws SQLException 
	 */
	@Business(auth = false)
	private StringBuilder countTaskByState(List<SqlCondition> cdList) throws SQLException
	{
		SqlQuery query = new SqlQuery();
		query.isPageResult = false;
		query.queryTable = new QueryTable("MTC_TASKLOG","T");
		query.groupFields = "T.TASK_STATE";
		query.keyId = "TASK_ID";
		query.resultFields = "T.TASK_STATE,COUNT(0) AS TASKNUM";
		cdList.add(new SqlCondition("T.TASK_STATE", "100", SqlLogicType.And, SqlRelationType.Than,SqlParamType.Numeric));
		query.conditions = cdList.toArray(new SqlCondition[0]);
		
		String sql = getDao().getSqlParser().getSelectCommandString(query);
		 
		List<Map<String, String>> list = getDao().getStrMapLst(sql);
		//根据状态分组得到指定条件内的任务信息
		
		if(list.size() == 0 )
		{
			return new StringBuilder("{\"types\":[],\"typesnum\":[],\"sum\":\"0\"}");
		}
		
		HashMap<String,String> taskcountByState = new HashMap<String, String>();//按任务状态的任务数量集合
		int taskTotal = 0;//任务总数
		
		//为集合装配数据
		for(Map<String, String> task : list)
		{
			taskTotal += Integer.parseInt(task.get("TASKNUM"));
			taskcountByState.put(task.get("TASK_STATE"), task.get("TASKNUM"));
		}
//		
		//统计执行状态，返回json对象
		StringBuilder sb = new StringBuilder();
		sb.append("{");
		StringBuilder sbTypes = new StringBuilder();
		StringBuilder sbTypenum = new StringBuilder();
		sbTypes.append("\"types\":[");
		sbTypenum.append("\"typesnum\":[");
		
		//拼装具体的状态及相应的任务数量
		for(Map.Entry<String,String> entry : taskcountByState.entrySet())
		{
			sbTypes.append(StringUtil.format("\"%s\",",getStateDesc(Integer.parseInt(entry.getKey()))));
			sbTypenum.append(StringUtil.format("\"%s\",",entry.getValue()));
		}
		
		sbTypes = new StringBuilder(sbTypes.substring(0, sbTypes.length()-1));
		sbTypes.append("],");
		
		sbTypenum = new StringBuilder((sbTypenum.substring(0, sbTypenum.length()-1)));
		sbTypenum.append("]");
		sb.append(sbTypes).append(sbTypenum).append(StringUtil.format(",\"sum\":\"%s\"",taskTotal)).append("}");
		
		return sb;
	}
	
	
	/**
	 * 统计执行器使用率
	 * @param model
	 * @return
	 * @throws SQLException 
	 */
	@Business(auth = false)
	private StringBuilder countWorkerUsed(List<SqlCondition> cdList,HashMap<String, String> model) throws SQLException
	{
		SqlQuery query = new SqlQuery();
		query.isPageResult = false;
		query.queryTable = new QueryTable("MTC_TASKLOG","T");
		query.keyId = "TASK_ID";
		query.resultFields = " T.TASK_TYPE,T.TASK_ID,T.CREATE_TIME AS START_TIME,T.END_TIME,T.TASK_ACTOR,T.TASK_WORKER";
		query.conditions = cdList.toArray(new SqlCondition[0]);
		
		String sql = getDao().getSqlParser().getSelectCommandString(query);
		 
		//得到指定条件内的任务信息
		List<Map<String, String>> list = getDao().getStrMapLst(sql);
		
		if(list.size() == 0 )
		{
			return new StringBuilder("{\"types\":[],\"typesnum\":[],\"sum\":\"0\"}");
		}

		Set<String> workerNum = new TreeSet<String>();
		long totalMillisecond = 0L;//总时间,页面查询
		long usedMillisecond = 0L;//占用时间
		Date startTime;
		Date endTime;
		
		//计算执行器数量，占用总时间
		for(Map<String, String> task : list)
		{
			String workerId = task.get("TASK_ACTOR")+"-"+task.get("TASK_WORKER");
			workerNum.add(workerId);
			
			startTime = DateUtil.parseDate(task.get("START_TIME"));
			endTime = DateUtil.parseDate(task.get("END_TIME"));
			usedMillisecond += (endTime.getTime() - startTime.getTime());
		}
		
		startTime = DateUtil.parseDate(model.get("START_TIME"));
		endTime = DateUtil.parseDate(model.get("END_TIME"));
		totalMillisecond = (endTime.getTime() - startTime.getTime());
		
		//统计执行占用，返回json对象
		long usedSecond = usedMillisecond/1000;
		//同类型的执行器可以很多个在同时执行任务，所以总时间需要乘以执行器的数量
		long totalSecond = (totalMillisecond/1000)*workerNum.size();
		
		StringBuilder sb = new StringBuilder();
		sb.append("{");
		sb.append("\"types\":[\"占用\",\"空闲\"],");
		sb.append(StringUtil.format("\"typesnum\":[\"%s\",\"%s\"],",usedSecond,(totalSecond-usedSecond)));
		sb.append(StringUtil.format("\"sum\":\"%s\"",totalSecond));
		sb.append("}");
		
		return sb;
	}
	
	
	/**反序列化
	 * @param serializedXml 序列化字串
	 * @param rootName 根元素名称
	 * @return
	 */
	@Business(auth = false)
    public static HashMap<String,String> deserialize(String serializedXml, String rootName)
    {
    	if (StringUtil.isNullOrEmpty(serializedXml))
            return null;
    	
    	HashMap<String,String> obj = new HashMap<String,String>();
    	List<Node> nodes = null;
    	try{
	    	Document doc = DocumentHelper.parseText(serializedXml);       
	    	nodes = doc.getRootElement().elements();
    	}
    	catch(Exception ex)
    	{    	
    	}
        if ( nodes != null)
        {
        	for (int i = 0 ; i < nodes.size(); i ++)
            {
                obj.put(nodes.get(i).getName(), nodes.get(i).getText());
            }
        }         
        return obj;
    }
	
	/**
	 * 状态描述
	 * @param state
	 * @return
	 */
	@Business(auth = false)
	private String getStateDesc(int state)
	{
		String desc = "";
		switch(state)
		{
			case 0 : desc = "有依赖"; break;
			case 1 : desc = "新任务"; break; 
			case 2 : desc = "等待执行"; break; 
			case 100 : desc = "执行中"; break; 
			case 200 : desc = "成功"; break; 
			case 210 : desc = "失败"; break; 
			case 220 : desc = "停止"; break; 
			case 230 : desc = "错误，可重试"; break; 
			case 240 : desc = "暂停"; break;
			case 250 : desc = "中止"; break;
			case 500 : desc = "删除"; break;
		
			default : desc = "未知状态";
		
		}
		
		return desc;
	}
}
