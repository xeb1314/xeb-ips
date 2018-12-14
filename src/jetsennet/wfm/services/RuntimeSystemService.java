package jetsennet.wfm.services;

import javax.jws.WebService;
import javax.ws.rs.FormParam;
import javax.ws.rs.POST;
import javax.ws.rs.Path;

import org.apache.log4j.Logger;

import jetsennet.frame.service.BaseService;
import jetsennet.jwfm.FlowActionTypes;
import jetsennet.jwfm.FlowObjectFactory;
import jetsennet.jwfm.IFmsFormat;
import jetsennet.jwfm.TaskActionTypes;
import jetsennet.jwfm.command.FmsFlowAction;
import jetsennet.jwfm.command.FmsTaskAction;
import jetsennet.net.WSResult;
import jetsennet.wfm.business.FlowProcessBusiness;

@Path("/RuntimeSystemService")
@WebService(name = "/RuntimeSystemService")
public class RuntimeSystemService extends BaseService{

	/**
	 * 数据库连接
	 */
	private FlowProcessBusiness flowProcessBusiness;
	private static final Logger logger = Logger.getLogger(RuntimeSystemService.class);
	private static IFmsFormat fmsFormat = FlowObjectFactory.createFmsFormat();


	/**
	 * 结束一个工作流程
	 * 
	 * @param flowInstanceId
	 *        流程实例ID
	 * @return
	 */
	@POST
    @Path("/stopFlow")
	public WSResult stopFlow(@FormParam("procExecId") String procExecId)
	{
		WSResult wsr = new WSResult();
		String flowInstanceId = procExecId;
		try
		{
			if(flowInstanceId.indexOf(",")>-1){
				String[] flowInstanceIdArray = flowInstanceId.split(",");
				for(String flowInstanceIdStr:flowInstanceIdArray){
					FmsFlowAction fmsFlowAction =  new FmsFlowAction();
					fmsFlowAction.setFlowInstanceId(flowInstanceIdStr);
					fmsFlowAction.setActionType(FlowActionTypes.FINISH);
					wsr = getResult(flowProcessBusiness.flowAction(fmsFormat.marshal(fmsFlowAction)));
				}
			}else{
				FmsFlowAction fmsFlowAction =  new FmsFlowAction();
				fmsFlowAction.setFlowInstanceId(flowInstanceId);
				fmsFlowAction.setActionType(FlowActionTypes.FINISH);
				wsr = getResult(flowProcessBusiness.flowAction(fmsFormat.marshal(fmsFlowAction)));
			}
			flowProcessBusiness.logOperator("终止流程:" + procExecId);
		}
		catch (Exception ex)
		{
		    errorProcess(wsr,"结束流程失败!",ex);
		}
		return wsr;
	}

	/**
	 * 终止任务
	 * 
	 * @param taskId
	 *        当前节点的任务ID
	 * @param finishNote
	 * @param processUser
	 * @param processUserId
	 * @return
	 */
	@POST
    @Path("/finishTask")
	public WSResult finishTask(@FormParam("taskId") String taskId,@FormParam("finishNote") String finishNote,@FormParam("processUser") String processUser
			,@FormParam("processUserId") String processUserId)
	{
		WSResult wsr = new WSResult();
		try
		{
			FmsTaskAction fmsTaskAction = new FmsTaskAction();
			fmsTaskAction.setTaskId(taskId);
			fmsTaskAction.setActionUser(processUser);
			fmsTaskAction.setActionUserId(processUserId);
			fmsTaskAction.setActionDesc(finishNote);
			fmsTaskAction.setActionType(TaskActionTypes.FINISH);
			wsr = getResult(flowProcessBusiness.taskAction(fmsFormat.marshal(fmsTaskAction)));
			flowProcessBusiness.logOperator("终止任务:" + taskId);
		}
		catch (Exception ex)
		{
		    errorProcess(wsr,"终止任务失败!",ex);
		}

		return wsr;
	}

	/**
	 * 提交任务
	 * 
	 * @param taskId
	 *        当前节点的任务ID
	 * @param commitNote
	 * @param commitUser
	 * @param commitUserId
	 * @return
	 */
	@POST
    @Path("/commitTask")
	public WSResult commitTask(@FormParam("taskId") String taskId,@FormParam("commitNote") String commitNote,@FormParam("processUser") String processUser
			,@FormParam("processUserId") String processUserId)
	{
		WSResult wsr = new WSResult();
		try
		{
			if(taskId.indexOf(",")>-1){
				String[] taskIdArray = taskId.split(",");
				for(String taskIdStr:taskIdArray){
					FmsTaskAction fmsTaskAction = new FmsTaskAction();
					fmsTaskAction.setTaskId(taskIdStr);
					fmsTaskAction.setActionUser(processUser);
					fmsTaskAction.setActionUserId(processUserId);
					fmsTaskAction.setActionDesc(commitNote);
					fmsTaskAction.setActionType(TaskActionTypes.COMMIT);
					wsr = getResult(flowProcessBusiness.taskAction(fmsFormat.marshal(fmsTaskAction)));
				}
			}else{
				FmsTaskAction fmsTaskAction = new FmsTaskAction();
				fmsTaskAction.setTaskId(taskId);
				fmsTaskAction.setActionUser(processUser);
				fmsTaskAction.setActionUserId(processUserId);
				fmsTaskAction.setActionDesc(commitNote);
				fmsTaskAction.setActionType(TaskActionTypes.COMMIT);
				wsr = getResult(flowProcessBusiness.taskAction(fmsFormat.marshal(fmsTaskAction)));
			}
			flowProcessBusiness.logOperator("提交任务:" + taskId);
		}
		catch (Exception ex)
		{
			errorProcess(wsr,"提交任务失败!",ex);
		}
		return wsr;
	}

	/**
	 * 启动流程 查流程的第一个可用的节点置为待处理状态，如果第一节点有多个分支，则同时置位 如果没有可能节点，则结束流程
	 * 
	 * @param flowInstanceId
	 *        流程实例ID
	 * @return
	 */
	@POST
    @Path("/startFlow")
	public WSResult startFlow(@FormParam("procExecId") String procExecId)
	{
		WSResult wsr = new WSResult();
		String flowInstanceId = procExecId;
		try
		{
			FmsFlowAction fmsFlowAction =  new FmsFlowAction();
			fmsFlowAction.setFlowInstanceId(flowInstanceId);
			fmsFlowAction.setActionType(FlowActionTypes.START);
			wsr = getResult(flowProcessBusiness.flowAction(fmsFormat.marshal(fmsFlowAction)));
			flowProcessBusiness.logOperator("启动流程:" + flowInstanceId);
		}
		catch (Exception ex)
		{
		    errorProcess(wsr,"启动流程失败!",ex);
		}

		return wsr;
	}

	/**
	 * 暂停一个工作流程
	 * 
	 * @param flowInstanceId
	 *        流程实例ID
	 * @return
	 */
	@POST
    @Path("/pauseFlow")
	public WSResult pauseFlow(@FormParam("procExecId") String procExecId)
	{
		WSResult wsr = new WSResult();
		String flowInstanceId = procExecId;
		try
		{
			FmsFlowAction fmsFlowAction =  new FmsFlowAction();
			fmsFlowAction.setFlowInstanceId(flowInstanceId);
			fmsFlowAction.setActionType(FlowActionTypes.PAUSE);
			wsr = getResult(flowProcessBusiness.flowAction(fmsFormat.marshal(fmsFlowAction)));
			flowProcessBusiness.logOperator("暂停流程:" + flowInstanceId);
		}
		catch (Exception ex)
		{
			errorProcess(wsr,"暂停流程失败!",ex);
		}
		return wsr;
	}

	/**
	 * 打回任务
	 * 
	 * @param taskId
	 *        当前节点的任务ID
	 * @param backTaskId
	 *        打回至任务ID，可空，空为打回上一节点
	 * @param backNote
	 * @param processUser
	 * @param processUserId
	 * @return
	 */
	@POST
    @Path("/pushBackTask")
	public WSResult pushBackTask(@FormParam("taskId") String taskId,@FormParam("backTaskId") String backTaskId,@FormParam("backNote") String backNote
			,@FormParam("processUser") String processUser,@FormParam("processUserId") String processUserId)
	{
		WSResult wsr = new WSResult();
		try
		{
			if(taskId.indexOf(",")>-1){
				String[] taskIdArray = taskId.split(",");
				for(String taskIdStr:taskIdArray){
					FmsTaskAction fmsTaskAction = new FmsTaskAction();
					fmsTaskAction.setTaskId(taskIdStr);
					fmsTaskAction.setActionUser(processUser);
					fmsTaskAction.setActionUserId(processUserId);
					fmsTaskAction.setActionDesc(backNote);
					fmsTaskAction.setNextTaskId(backTaskId);
					fmsTaskAction.setActionType(TaskActionTypes.PUSHBACK);
					wsr = getResult(flowProcessBusiness.taskAction(fmsFormat.marshal(fmsTaskAction)));
				}
			}else{
				FmsTaskAction fmsTaskAction = new FmsTaskAction();
				fmsTaskAction.setTaskId(taskId);
				fmsTaskAction.setActionUser(processUser);
				fmsTaskAction.setActionUserId(processUserId);
				fmsTaskAction.setActionDesc(backNote);
				fmsTaskAction.setNextTaskId(backTaskId);
				fmsTaskAction.setActionType(TaskActionTypes.PUSHBACK);
				wsr = getResult(flowProcessBusiness.taskAction(fmsFormat.marshal(fmsTaskAction)));
			}
			flowProcessBusiness.logOperator("打回任务:" + taskId);
		}
		catch (Exception ex)
		{
		    errorProcess(wsr,"打回任务失败!",ex);
		}
		return wsr;
	}

	/**
	 * 重置任务
	 * 
	 * @param taskId
	 *        当前节点的任务ID
	 * @param commitNote
	 * @param processUser
	 * @param processUserId
	 * @return
	 */
	@POST
    @Path("/resetTask")
	public WSResult resetTask(@FormParam("taskId") String taskId,@FormParam("resetNote") String resetNote
			,@FormParam("processUser") String processUser,@FormParam("processUserId") String processUserId)
	{
		WSResult wsr = new WSResult();
		try
		{
			if(taskId.indexOf(",")>-1){
				String[] taskIdArray = taskId.split(",");
				for(String taskIdStr:taskIdArray){
					FmsTaskAction fmsTaskAction = new FmsTaskAction();
					fmsTaskAction.setTaskId(taskIdStr);
					fmsTaskAction.setActionUser(processUser);
					fmsTaskAction.setActionUserId(processUserId);
					fmsTaskAction.setActionDesc(resetNote);
					fmsTaskAction.setActionType(TaskActionTypes.RESET);
					wsr = getResult(flowProcessBusiness.taskAction(fmsFormat.marshal(fmsTaskAction)));
				}
			}else{
				FmsTaskAction fmsTaskAction = new FmsTaskAction();
				fmsTaskAction.setTaskId(taskId);
				fmsTaskAction.setActionUser(processUser);
				fmsTaskAction.setActionUserId(processUserId);
				fmsTaskAction.setActionDesc(resetNote);
				fmsTaskAction.setActionType(TaskActionTypes.RESET);
				wsr = getResult(flowProcessBusiness.taskAction(fmsFormat.marshal(fmsTaskAction)));
			}
			flowProcessBusiness.logOperator("重置任务:" + taskId);
		}
		catch (Exception ex)
		{
		    errorProcess(wsr,"重置任务失败!",ex);
		}
		return wsr;
	}

	
	/**
	 * 暂停任务
	 * 
	 * @param taskId
	 *        当前节点的任务ID
	 * @param commitNote
	 * @param processUser
	 * @param processUserId
	 * @return
	 */
	@POST
    @Path("/pauseTask")
	public WSResult pauseTask(@FormParam("taskId") String taskId,@FormParam("pauseNote") String pauseNote
			,@FormParam("processUser") String processUser,@FormParam("processUserId") String processUserId)
	{
		WSResult wsr = new WSResult();
		try
		{
			FmsTaskAction fmsTaskAction = new FmsTaskAction();
			fmsTaskAction.setTaskId(taskId);
			fmsTaskAction.setActionUser(processUser);
			fmsTaskAction.setActionUserId(processUserId);
			fmsTaskAction.setActionDesc(pauseNote);
			fmsTaskAction.setActionType(TaskActionTypes.PAUSE);
			wsr = getResult(flowProcessBusiness.taskAction(fmsFormat.marshal(fmsTaskAction)));
			flowProcessBusiness.logOperator("暂停任务:" + taskId);
		}
		catch (Exception ex)
		{
		    errorProcess(wsr,"暂停任务失败!",ex);
		}
		return wsr;
	}
	
	/**
	 * 暂停任务
	 * 
	 * @param taskId
	 *        当前节点的任务ID
	 * @param commitNote
	 * @param processUser
	 * @param processUserId
	 * @return
	 */
	@POST
    @Path("/resumeTask")
	public WSResult resumeTask(@FormParam("taskId") String taskId,@FormParam("resumeNote") String resumeNote
			,@FormParam("processUser") String processUser,@FormParam("processUserId") String processUserId)
	{
		WSResult wsr = new WSResult();
		try
		{
			FmsTaskAction fmsTaskAction = new FmsTaskAction();
			fmsTaskAction.setTaskId(taskId);
			fmsTaskAction.setActionUser(processUser);
			fmsTaskAction.setActionUserId(processUserId);
			fmsTaskAction.setActionDesc(resumeNote);
			fmsTaskAction.setActionType(TaskActionTypes.RESUME);
			wsr = getResult(flowProcessBusiness.taskAction(fmsFormat.marshal(fmsTaskAction)));
			flowProcessBusiness.logOperator("恢复任务:" + taskId);
		}
		catch (Exception ex)
		{
		    errorProcess(wsr,"恢复任务失败!",ex);
		}
		return wsr;
	}
	
	@javax.jws.WebMethod(exclude = true)
	public FlowProcessBusiness getFlowProcessBusiness() {
		return flowProcessBusiness;
	}
	@javax.jws.WebMethod(exclude = true)
	public void setFlowProcessBusiness(FlowProcessBusiness flowProcessBusiness) {
		this.flowProcessBusiness = flowProcessBusiness;
	}
	
	 /**
	  * 错误打印
	 * @param retObj
	 * @param message
	 * @param ex
	 */
	private void errorProcess(WSResult retObj, String message, Exception ex)
	 {
	     logger.error(message, ex);
	     retObj.errorCode = -1;
	     retObj.errorString = message + ex.getMessage();
	 }
}
