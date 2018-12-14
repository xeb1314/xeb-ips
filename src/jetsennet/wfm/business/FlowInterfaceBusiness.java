/************************************************************************
日  期：		2014-03-5
作  者:		李小敏
版  本：     2.1
描  述:	    
历  史：      
 ************************************************************************/
package jetsennet.wfm.business;

import jetsennet.frame.business.BaseBusiness;
import jetsennet.jwfm.services.AssignUserList;
import jetsennet.jwfm.services.FlowAction;
import jetsennet.jwfm.services.FlowInfo;
import jetsennet.jwfm.services.FlowList;
import jetsennet.jwfm.services.FlowNew;
import jetsennet.jwfm.services.FlowRecord;
import jetsennet.jwfm.services.FlowSearch;
import jetsennet.jwfm.services.FlowService;
import jetsennet.jwfm.services.FlowUpdate;
import jetsennet.jwfm.services.FlowVariable;
import jetsennet.jwfm.services.FlowVariableList;
import jetsennet.jwfm.services.ProcessInfo;
import jetsennet.jwfm.services.ProcessList;
import jetsennet.jwfm.services.ReportResult;
import jetsennet.jwfm.services.TaskAction;
import jetsennet.jwfm.services.TaskInfo;
import jetsennet.jwfm.services.TaskList;
import jetsennet.jwfm.services.TaskSearch;
import jetsennet.jwfm.services.TaskState;
import jetsennet.orm.configuration.ConfigurationBuilderProp;
import jetsennet.orm.configuration.ConnectionInfo;
import jetsennet.sqlclient.ISqlExecutor;
import jetsennet.sqlclient.SqlClientObjFactory;
import jetsennet.util.SpringContextUtil;

/**
 * 流程接口
 * @author 李小敏
 *
 */
public class FlowInterfaceBusiness extends BaseBusiness
{	
	private ISqlExecutor getSqlExecutor(){
		ConnectionInfo cInfo = ((ConfigurationBuilderProp)SpringContextUtil.getBean("wfmDBBuilderProp")).genConfiguration().connInfo;
		return SqlClientObjFactory.createSqlExecutor(
				new jetsennet.sqlclient.ConnectionInfo(cInfo.driver, cInfo.url, cInfo.user, cInfo.pwd));
	}
	
	/**
	 * 获取可用的流程列表
	 * @param processType
	 * @return
	 * @throws Exception
	 */
	public ProcessList getProcessList(int processType) throws Exception
	{		
		FlowService flowService = new FlowService(getSqlExecutor());
		return flowService.getProcessList(processType);		
	}
	
	/**
	 * 获取流程信息
	 * @param processId
	 * @return
	 * @throws Exception
	 */
	public ProcessInfo getProcess(int processId) throws Exception
	{
		FlowService flowService = new FlowService(getSqlExecutor());
		return flowService.getProcess(processId);	
		
	}
		
	/**
	 * 创建流程
	 * @param flowNew
	 * @return
	 * @throws Exception
	 */
	public String createFlow(FlowNew flowNew) throws Exception
	{
		FlowService flowService = new FlowService(getSqlExecutor());
		return flowService.createFlow(flowNew);			
	}
	
	/**
	 * 流程操作
	 * @param flowAction
	 * @return
	 * @throws Exception
	 */
	public String flowAction(FlowAction flowAction) throws Exception
	{
		FlowService flowService = new FlowService(getSqlExecutor());
		return flowService.flowAction(flowAction);			
	}
	
	/**
	 * 搜索流程
	 * @param flowSearch
	 * @return
	 * @throws Exception
	 */
	public FlowList searchFlow(FlowSearch flowSearch) throws Exception
	{
		FlowService flowService = new FlowService(getSqlExecutor());
		return flowService.searchFlow(flowSearch);			
	}
	
	/**
	 * 获取流程变量
	 * @param flowInstanceId
	 * @return
	 * @throws Exception
	 */
	public FlowVariableList getFlowVariable(String flowInstanceId) throws Exception
	{
		FlowService flowService = new FlowService(getSqlExecutor());
		return flowService.getFlowVariable(flowInstanceId);	
	}
	
	/**
     * 获取流程变量
     * @param flowId
     * @return
     * @throws Exception
     */
    public FlowVariable getFlowVariable(String flowId, String name) throws Exception
    {
        FlowService flowService = new FlowService(getSqlExecutor());
        return flowService.getFlowVariable(flowId, name);
    }
	
	/**
	 * 设置流程变量
	 * @param flowInstanceId
	 * @param flowVariableList
	 * @throws Exception
	 */
	public void setFlowVariable(String flowInstanceId,FlowVariableList flowVariableList) throws Exception
	{
		FlowService flowService = new FlowService(getSqlExecutor());
		flowService.setFlowVariable(flowInstanceId,flowVariableList);	
	}
	
	/**
	 * 更新流程
	 * @param flowUpdate
	 * @throws Exception
	 */
	public void updateFlow(FlowUpdate flowUpdate) throws Exception
	{
		FlowService flowService = new FlowService(getSqlExecutor());
		flowService.updateFlow(flowUpdate);	
	}
	
	/**
     * 提交任务
     * @param taskId
     * @param nextTaskId
     * @param commitUser
     * @param commitUserId
     * @param commitNote
     * @throws Exception
     */
    public void commitTask(String taskId, String nextTaskId, String userId, String userName, String commitNote) throws Exception
    {
        FlowService flowService = new FlowService(getSqlExecutor());
        flowService.commitTask(taskId, nextTaskId, userId, userName, commitNote);
    }
	
    
    /**
     * 打回任务
     * @param taskId
     * @param backTaskId
     * @param backUser
     * @param back
     * @param backNote
     * @throws Exception
     */
    public void pushbackTask(String taskId, String backTaskId, String userId, String userName, String backNote) throws Exception
    {
        FlowService flowService = new FlowService(getSqlExecutor());
        flowService.pushbackTask(taskId, backTaskId, userId, userName, backNote);
    }
    
    
	/**
     * 启动流程
     * @param flowId
     * @throws Exception
     */
    public void startFlow(String flowId) throws Exception
    {
        FlowService flowService = new FlowService(getSqlExecutor());
        flowService.startFlow(flowId);
    }
	
    /**
     * 结束流程
     * @param flowId
     * @param userId
     * @param userName
     * @param desc
     * @throws Exception
     */
    public void finishFlow(String flowId, String userId, String userName, String desc) throws Exception
    {
        FlowService flowService = new FlowService(getSqlExecutor());
        flowService.finishFlow(flowId, userId, userName, desc);
    }
    
	/**
	 * 获取流程信息
	 * @param flowInstanceId
	 * @return
	 * @throws Exception
	 */
	public FlowInfo getFlowInfo(String flowInstanceId) throws Exception
	{
		FlowService flowService = new FlowService(getSqlExecutor());
		return flowService.getFlowInfo(flowInstanceId);	
	}
	
	public FlowInfo getFlowView(String flowInstanceId,boolean deep) throws Exception
	{
		FlowService flowService = new FlowService(getSqlExecutor());
		return flowService.getFlowView(flowInstanceId,deep);	
	}
	
	/**
	 * 任务操作
	 * @param taskAction
	 * @return
	 * @throws Exception
	 */
	public String taskAction(TaskAction taskAction) throws Exception
	{
		FlowService flowService = new FlowService(getSqlExecutor());
		return flowService.taskAction(taskAction);	
	}
	
	/**
	 * 搜索任务
	 * @param taskSearch
	 * @return
	 * @throws Exception
	 */
	public TaskList searchTask(TaskSearch taskSearch) throws Exception
	{
		FlowService flowService = new FlowService(getSqlExecutor());
		return flowService.searchTask(taskSearch);	
	}
	
	/**
	 * 获取任务信息
	 * @param taskId
	 * @return
	 * @throws Exception
	 */
	public TaskInfo getTaskInfo(String taskId) throws Exception
	{
		FlowService flowService = new FlowService(getSqlExecutor());
		return flowService.getTaskInfo(taskId);	
	}
	
	
	/**
     * 获取流程执行记录
     * @param flowId
     * @return
     * @throws Exception
     */
    public FlowRecord getFlowRecord(String flowId) throws Exception
    {
        FlowService flowService = new FlowService(getSqlExecutor());
        return flowService.getFlowRecord(flowId);
    }
	
	
	/**
	 * 获取任务可打回的任务
	 * @param taskId
	 * @return
	 * @throws Exception
	 */
	public TaskList getTasksCanBack(String taskId) throws Exception
	{
		FlowService flowService = new FlowService(getSqlExecutor());
		return flowService.getTasksCanBack(taskId);	
	}
	
	/**
	 * 获取任务可提交的任务
	 * @param taskId
	 * @return
	 * @throws Exception
	 */
	public TaskList getTasksCanCommit(String taskId) throws Exception
	{
		FlowService flowService = new FlowService(getSqlExecutor());
		return flowService.getTasksCanCommit(taskId);	
	}
	
	
	/**
     * 获取任务状态
     * @param taskId
     * @return
     * @throws Exception
     */
    public TaskState getTaskState(String taskId) throws Exception
    {
        FlowService flowService = new FlowService(getSqlExecutor());
        return flowService.getTaskState(taskId);
    }
	
	
	/**
	 * 获取任务的指派者
	 * @param taskId
	 * @return
	 * @throws Exception
	 */
	public AssignUserList getTaskAssign(String taskId) throws Exception
	{
		FlowService flowService = new FlowService(getSqlExecutor());
		return flowService.getTaskAssign(taskId);
	}
	
	/**
	 * 设置任务的指派者
	 * @param taskId
	 * @param taskExecutorList
	 * @throws Exception
	 */
	public void setTaskExecutor(String taskId,AssignUserList taskExecutorList) throws Exception
	{		
		getSqlExecutor().transBegin();
		
		try
		{
			FlowService flowService = new FlowService(getSqlExecutor());
			flowService.taskAssign(taskId,taskExecutorList);
			
			getSqlExecutor().transCommit();
		}
		catch(Exception ex)
		{
			getSqlExecutor().transRollback();
			throw ex;
		}
	}
	
	
	/**
     * 用户当前任务数统计 List(Name:UserId,Val:TaskCount,Cols:actId)
     * @param userId
     * @return
     */
    public ReportResult userCurrentTaskReport(String userId) throws Exception
    {
        FlowService flowService = new FlowService(getSqlExecutor());
        return flowService.userCurrentTaskReport(userId);
    }
	
    /**
     * 用户创建流程数量统计 List(Name:UserId,Val:FlowCount,Cols:processType)
     * @param userId
     * @param minCreateTime
     * @param maxCreateTime
     * @return
     */
    public ReportResult userCreateFlowReport(String userId,String minCreateTime,String maxCreateTime) throws Exception
    {
        FlowService flowService = new FlowService(getSqlExecutor());
        return flowService.userCreateFlowReport(userId, minCreateTime, maxCreateTime);
    }
    
    /**
     * 用户执行任务数统计 List(Name:UserId,Val:ExecCount,Cols:actId)
     * @param userId
     * @param minExecTime
     * @param maxExecTime
     * @return
     */
    public ReportResult userTaskExecReport(String userId,String minExecTime,String maxExecTime) throws Exception
    {
        FlowService flowService = new FlowService(getSqlExecutor());
        return flowService.userTaskExecReport(userId, minExecTime, maxExecTime);
    }
}
