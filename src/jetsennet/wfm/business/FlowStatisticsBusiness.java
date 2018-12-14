/************************************************************************
日  期：		2013-10-9
作  者:		王均
版  本：     
描  述:	       流程任务相关处理
历  史：      
 ************************************************************************/
package jetsennet.wfm.business;

import java.text.ParseException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import jetsennet.frame.business.BaseBusiness;
import jetsennet.frame.business.Business;
import jetsennet.sqlclient.SqlQuery;
import jetsennet.util.DateUtil;
import jetsennet.util.SerializerUtil;
import jetsennet.util.StringUtil;
import jetsennet.util.TimeSpan;

public class FlowStatisticsBusiness extends BaseBusiness 
{
	
	/**
	 * 统计任务执行延时
	 * @param query
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
    @Business(auth = false)
	public String statisticsTaskdelay(String query) throws Exception
	{
		SqlQuery sqlQuery = SerializerUtil.deserialize(SqlQuery.class, query);
		String sql = getDao().getSqlParser().getSelectCommandString(sqlQuery);
		List<Map<String, String>> list = getDao().getStrMapLst(sql);
		if(list.size() == 0 )
		{
			return "{\"types\":[],\"time\":[]}";
		}
		Map<String,List<Map<String,String>>> taskMap = new HashMap<String,List<Map<String,String>>>();//按节点的任务集合
		List<Map<String,String>> actTaskList ;//存放一个节点下所有任务
		
		//整理查询结果，得到按节点的任务集合
		for(Map<String,String> task : list)
		{
			String actId = task.get("ACT_ID");
			actTaskList = taskMap.get(actId);
			if(actTaskList == null)
			{
				actTaskList = new ArrayList<Map<String,String>>(1000);
				actTaskList.add(task);
				taskMap.put(actId, actTaskList);
			}
			else
			{
				actTaskList.add(task);
			}
			
		}
		
		//统计节点延时，返回json对象
		StringBuilder sb = new StringBuilder();
		sb.append("{");
		StringBuilder sbTypes = new StringBuilder();
		StringBuilder sbTime = new StringBuilder();
		sbTypes.append("\"types\":[");
		sbTime.append("\"time\":[");
		
		for(Map.Entry<String, List<Map<String,String>>> entry : taskMap.entrySet())
		{
			//节点下所有任务
			List<Map<String,String>> taskList = entry.getValue();
			//节点名称
			sbTypes.append(StringUtil.format("\"%s\",",taskList.get(0).get("LONG_NAME")));
			//计算平均时间
			sbTime.append(StringUtil.format("\"%s\",",countTasktime(taskList)));;
		}
		
		sbTypes = new StringBuilder(sbTypes.substring(0, sbTypes.length()-1));
		sbTypes.append("],");
		
		sbTime = new StringBuilder((sbTime.substring(0, sbTime.length()-1)));
		sbTime.append("]");
		
		sb.append(sbTypes).append(sbTime).append("}");
		
		return sb.toString();
	}
	
	//计算平均延时
	@Business(auth = false)
	private String countTasktime(List<Map<String,String>> list) throws ParseException
	{
		Date startTime;
		Date endTime;
		long delayMillisecond = 0L;
		
		for(Map<String,String> task : list)
		{
			startTime = DateUtil.parseDate(task.get("START_TIME"));
			endTime = DateUtil.parseDate(task.get("END_TIME"));
			delayMillisecond += (endTime.getTime() - startTime.getTime());
		}
		
		TimeSpan delayTime = new TimeSpan(delayMillisecond/list.size());

		return String.valueOf(delayTime.getHours());
	}
}
