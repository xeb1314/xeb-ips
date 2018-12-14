/************************************************************************
日  期：		2013-9-29
作  者:		王均
版  本：     
描  述:	    protal    jwfm工作流对外接口服务
历  史：      
 ************************************************************************/

package jetsennet.wfm.webservices;

import java.util.HashMap;
import java.util.List;

import javax.jws.WebService;
import javax.ws.rs.FormParam;
import javax.ws.rs.POST;
import javax.ws.rs.Path;

import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.dom4j.Node;

import jetsennet.frame.security.ModuleVerification;
import jetsennet.frame.service.BaseService;
import jetsennet.jwfm.FlowActionTypes;
import jetsennet.jwfm.TaskActionTypes;
import jetsennet.jwfm.services.AssignUser;
import jetsennet.jwfm.services.AssignUserList;
import jetsennet.jwfm.services.FlowAction;
import jetsennet.jwfm.services.FlowNew;
import jetsennet.jwfm.services.FlowSearch;
import jetsennet.jwfm.services.FlowUpdate;
import jetsennet.jwfm.services.FlowVariable;
import jetsennet.jwfm.services.FlowVariableList;
import jetsennet.jwfm.services.TaskAction;
import jetsennet.jwfm.services.TaskSearch;
import jetsennet.logger.ILog;
import jetsennet.logger.LogManager;
import jetsennet.net.WSResult;
import jetsennet.util.ConvertUtil;
import jetsennet.util.SerializerUtil;
import jetsennet.util.StringUtil;
import jetsennet.wfm.business.FlowInterfaceBusiness;

@Path("/WfmWebService")
@WebService(name = "/WfmWebService")
public class WfmWebService extends BaseService
{
    public static final short JWFM = 22;
    protected boolean isServiceEnable = true;
    protected static ILog logger = LogManager.getLogger("jmtc-wfmservice");

    private FlowInterfaceBusiness flowInterfaceBusiness;
    public WfmWebService()
    {
        ModuleVerification.registerModule(this);
    }

    @javax.jws.WebMethod(exclude = true)
    public int getModuleCode()
    {
        return JWFM;
    }

    @javax.jws.WebMethod(exclude = true)
    public void setModuleEnable(boolean isEnable)
    {
        this.isServiceEnable = isEnable;
    }

    /**
     * 获取可用的流程
     * @param processType
     * @param userAuth
     * @return
     */
    @POST
    @Path("/wfmGetProcessList")
    public WSResult wfmGetProcessList(@FormParam("processType") String processType)
    {
    	if(StringUtil.isNullOrEmpty(processType)){
    		processType = "1";
    	}
    	
    	WSResult wsr = new WSResult();
        try
        {
        	wsr = getResult(ConvertUtil.serialize(flowInterfaceBusiness.getProcessList(Integer.valueOf(processType))));
        }
        catch (Exception ex)
        {
            errorProcess(wsr,"获取可用的流程错误!", ex);
        }
        return wsr;
    }

    /**
     * 获取流程
     * @param processType
     * @param userAuth
     * @return
     */
    @POST
    @Path("/wfmGetProcess")
    public WSResult wfmGetProcess(@FormParam("processId") String processId)
    {
    	if(StringUtil.isNullOrEmpty(processId)){
    		processId = "-1";
    	}
    	WSResult wsr = new WSResult();
        try
        {
        	wsr = getResult(ConvertUtil.serialize(flowInterfaceBusiness.getProcess(Integer.valueOf(processId))));
        }
        catch (Exception ex)
        {
            errorProcess(wsr,"获取流程错误!", ex);
        }
        return wsr;
    }

    /**
     * 新流程
     * @param flowNew
     * @param userAuth
     * @return
     */
    @POST
    @Path("/wfmCreateFlow")
    public WSResult wfmCreateFlow(@FormParam("flowNew") String flowNew)
    {
    	WSResult wsr = new WSResult();
        try
        {
            HashMap<String, String> model = SerializerUtil.deserialize2strmap(flowNew);
            FlowNew flowNewObj = new FlowNew();
            String processId = model.get("processId");
            String processType = model.get("processType");
            String objType = model.get("objType");
            
            flowNewObj.setAutoStart("1".equals(model.get("autoStart")) ? true : false);
            flowNewObj.setCreateUser(model.get("createUser"));
            flowNewObj.setCreateUserId(model.get("createUserId"));
            flowNewObj.setExtendInfo(model.get("extendInfo"));
            flowNewObj.setFlowName(model.get("flowName"));
            flowNewObj.setObjId(model.get("objId"));
            flowNewObj.setObjName(model.get("objName"));
            flowNewObj.setNotifyUrl(model.get("notifyUrl"));
            flowNewObj.setParentTaskID(model.get("parentTaskId"));
            flowNewObj.setObjType(StringUtil.isNullOrEmpty(objType) ? 0 : Integer.parseInt(objType));
            flowNewObj.setProcessId(StringUtil.isNullOrEmpty(processId) ? 0 : Integer.parseInt(processId));
            flowNewObj.setProcessType(StringUtil.isNullOrEmpty(processType) ? 0 : Integer.parseInt(processType));
            wsr = getResult(flowInterfaceBusiness.createFlow(flowNewObj));
        }
        catch (Exception ex)
        {
            errorProcess(wsr,"创建程实例错误!", ex);
        }
        return wsr;
    }

    /**
     * 流程操作
     * @param flowAction
     * @param userAuth
     * @return
     */
    @POST
    @Path("/wfmFlowAtion")
    public WSResult wfmFlowAtion(@FormParam("flowAction") String flowAction)
    {
    	WSResult wsr = new WSResult();
        try
        {
            HashMap<String, String> model = SerializerUtil.deserialize2strmap(flowAction);
            FlowAction flowActionObj = new FlowAction();
            String actionType = model.get("actionType");
            
            flowActionObj.setActionDesc(model.get("actionDesc"));
            flowActionObj.setActionType(StringUtil.isNullOrEmpty(actionType)?FlowActionTypes.START:Integer.valueOf(actionType));
            flowActionObj.setActionUser(model.get("actionUser"));
            flowActionObj.setActionUserId(model.get("actionUserId"));
            flowActionObj.setExtendInfo(model.get("extendInfo"));
            flowActionObj.setFlowInstanceId(model.get("flowInstanceId"));
            flowActionObj.setAsync("1".equals(model.get("async")) ? true : false);
            wsr = getResult(flowInterfaceBusiness.flowAction(flowActionObj));
        }
        catch (Exception ex)
        {
            errorProcess(wsr,flowAction+"流程操作失败！", ex);
        }
        return wsr;
    }

    /**
     * 搜索流程
     * @param flowNew
     * @param userAuth
     * @return
     */
    @POST
    @Path("/wfmSearchFlow")
    public WSResult wfmSearchFlow(@FormParam("flowSearch") String flowSearch)
    {
    	WSResult wsr = new WSResult();
        try
        {
            HashMap<String, String> model = SerializerUtil.deserialize2strmap(flowSearch);
            FlowSearch flowSearchobj = new FlowSearch();
            flowSearchobj.setCreateUser(model.get("createUser"));
            flowSearchobj.setCreateUserId(model.get("createUserId"));
            flowSearchobj.setExtendInfo(model.get("extendInfo"));
            flowSearchobj.setFlowState(model.get("flowState"));
            flowSearchobj.setFlowType(model.get("flowType"));
            flowSearchobj.setObjId(model.get("objId"));
            flowSearchobj.setObjName(model.get("objName"));
            flowSearchobj.setFlowInstanceId(model.get("flowInstanceId"));
            
            String pageSize = model.get("pageSize");
            String currentPage = model.get("currentPage");
            flowSearchobj.setPageSize(StringUtil.isNullOrEmpty(pageSize)?0:Integer.parseInt(pageSize));
            flowSearchobj.setCurrentPage(StringUtil.isNullOrEmpty(currentPage)?0:Integer.parseInt(currentPage));
            
            wsr = getResult(ConvertUtil.serialize(flowInterfaceBusiness.searchFlow(flowSearchobj)));
        }
        catch (Exception ex)
        {
            logger.error(flowSearch);
            errorProcess(wsr,"搜索流程错误!", ex);
        }
        return wsr;
    }

    /**
     * 获取流程变量
     * @param flowNew
     * @param userAuth
     * @return
     */
    @POST
    @Path("/wfmGetFlowVariable")
    public WSResult wfmGetFlowVariable(@FormParam("flowInstanceId") String flowInstanceId)
    {
    	WSResult wsr = new WSResult();
        try
        {
        	wsr = getResult(ConvertUtil.serialize(flowInterfaceBusiness.getFlowVariable(flowInstanceId)));
        }
        catch (Exception ex)
        {
            logger.error(flowInstanceId);
            errorProcess(wsr,"获取流程变量错误!", ex);
        }
        return wsr;
    }
    
    
    /**
     * 启动流程
     * @param flowId
     * @throws Exception
     */
    @POST
    @Path("/wfmStartFlow")
    public WSResult wfmStartFlow(@FormParam("flowInstanceId") String flowInstanceId)
    {
        WSResult wsr = new WSResult();
        try
        {
            flowInterfaceBusiness.startFlow(flowInstanceId);
            wsr = getResult("");
        }
        catch (Exception ex)
        {
            logger.error(flowInstanceId);
            errorProcess(wsr,"启动流程错误!", ex);
        }
        return wsr;
    }

    
    /**
     * 结束流程
     * @param flowId
     * @param userId
     * @param userName
     * @param desc
     * @throws Exception
     */
    @POST
    @Path("/wfmFinishFlow")
    public WSResult wfmFinishFlow(@FormParam("flowInstanceId") String flowInstanceId,@FormParam("userId") String userId,
            @FormParam("userName") String userName,@FormParam("desc") String desc)
    {
        WSResult wsr = new WSResult();
        try
        {
            flowInterfaceBusiness.finishFlow(flowInstanceId, userId, userName, desc);
            wsr = getResult("");
        }
        catch (Exception ex)
        {
            logger.error(flowInstanceId);
            errorProcess(wsr,"结束流程错误!", ex);
        }
        return wsr;
    }
    
    
    /**
     * 设置流程变量
     * @param flowNew
     * @param userAuth
     * @return
     */
    @POST
    @Path("/wfmSetFlowVariable")
    public WSResult wfmSetFlowVariable(@FormParam("flowInstanceId") String flowInstanceId, @FormParam("flowVariableList") String flowVariableList)
    {
    	WSResult wsr = new WSResult();
        try
        {
            FlowVariableList flowVariableListObj = new FlowVariableList();
            Document doc = DocumentHelper.parseText(flowVariableList);
            Element rootElement = doc.getRootElement();
            List<Node> variableNodes = rootElement.selectNodes("variable");
            for (Node variableItem : variableNodes)
            {
                FlowVariable flowVariable = new FlowVariable();
                flowVariable.setName(variableItem.valueOf("@name"));
                flowVariable.setValue(variableItem.valueOf("@value"));
                flowVariableListObj.add(flowVariable);
            }
            flowInterfaceBusiness.setFlowVariable(flowInstanceId, flowVariableListObj);
        }
        catch (Exception ex)
        {
            logger.error(flowVariableList);
            errorProcess(wsr,"设置流程变量错误!", ex);
        }
        return wsr;
    }

    
    /**
     * 提交任务
     * @param taskId
     * @param nextTaskId
     * @param userId
     * @param userName
     * @param commitNote
     * @throws Exception
     */
    @POST
    @Path("/wfmCommitTask")
    public WSResult wfmCommitTask(@FormParam("taskId") String taskId,@FormParam("nextTaskId") String nextTaskId,@FormParam("userId") String userId
            ,@FormParam("userName") String userName,@FormParam("commitNote") String commitNote)
    {
        WSResult wsr = new WSResult();
        try
        {
            flowInterfaceBusiness.commitTask(taskId, nextTaskId, userId, userName, commitNote);
        }
        catch (Exception ex)
        {
            errorProcess(wsr,"提交任务错误!", ex);
        }
        return wsr;
    }
    
    
    /**
     * 打回任务
     * @param taskId
     * @param backTaskId
     * @param userId
     * @param userName
     * @param backNote
     * @throws Exception
     */
    @POST
    @Path("/wfmPushBackTask")
    public WSResult wfmPushBackTask(@FormParam("taskId") String taskId,@FormParam("backTaskId") String backTaskId,@FormParam("userId") String userId
            ,@FormParam("userName") String userName,@FormParam("backNote") String backNote)
    {
        WSResult wsr = new WSResult();
        try
        {
            flowInterfaceBusiness.pushbackTask(taskId, backTaskId, userId, userName, backNote);
        }
        catch (Exception ex)
        {
            errorProcess(wsr,"打回任务错误!", ex);
        }
        return wsr;
    }
    
    
    /**
     * 更新流程
     * @param flowNew
     * @param userAuth
     * @return
     */
    @POST
    @Path("/wfmUpdateFlow")
    public WSResult wfmUpdateFlow(@FormParam("flowUpdate") String flowUpdate)
    {
    	WSResult wsr = new WSResult();
        try
        {
            HashMap<String, String> model = SerializerUtil.deserialize2strmap(flowUpdate);
            FlowUpdate flowUpdateObj = new FlowUpdate();
            flowUpdateObj.setExtendInfo(model.get("extendInfo"));
            flowUpdateObj.setFlowDesc(model.get("flowDesc"));
            flowUpdateObj.setFlowInstanceId(model.get("flowInstanceId"));
            flowUpdateObj.setObjId(model.get("objId"));
            flowUpdateObj.setObjName(model.get("objName"));
            flowInterfaceBusiness.updateFlow(flowUpdateObj);
        }
        catch (Exception ex)
        {
            logger.error(flowUpdate);
            errorProcess(wsr,"更新流程错误!", ex);
        }
        return wsr;
    }

    /**
     * 获取流程
     * @param flowNew
     * @param userAuth
     * @return
     */
    @POST
    @Path("/wfmGetFlowInfo")
    public WSResult wfmGetFlowInfo(@FormParam("flowInstanceId") String flowInstanceId)
    {
    	WSResult wsr = new WSResult();
        try
        {
        	wsr = getResult(ConvertUtil.serialize(flowInterfaceBusiness.getFlowInfo(flowInstanceId)));
        }
        catch (Exception ex)
        {
            errorProcess(wsr,"获取流程错误!", ex);
        }
        return wsr;
    }
    
    @POST
    @Path("/wfmGetFlowView")
    public WSResult wfmGetFlowView(@FormParam("flowInstanceId") String flowInstanceId,@FormParam("deep") int deep)
    {
    	WSResult wsr = new WSResult();
        try
        {
        	wsr = getResult(ConvertUtil.serialize(flowInterfaceBusiness.getFlowView(flowInstanceId,deep==1?true:false)));
        }
        catch (Exception ex)
        {
            errorProcess(wsr,"获取流程错误!", ex);
        }
        return wsr;
    }

    /**
     * 获取流程执行记录
     * @param flowId
     * @return
     * @throws Exception
     */
    @POST
    @Path("/wfmGetFlowRecord")
    public WSResult wfmGetFlowRecord(@FormParam("flowInstanceId") String flowInstanceId)
    {
        WSResult wsr = new WSResult();
        try
        {
            wsr = getResult(ConvertUtil.serialize(flowInterfaceBusiness.getFlowRecord(flowInstanceId)));
        }
        catch (Exception ex)
        {
            errorProcess(wsr,"获取流程执行记录!", ex);
        }
        return wsr;
    }
    
    
    /**
     * 任务操作
     * @param taskAction
     * @param userAuth
     * @return
     */
    @POST
    @Path("/wfmTaskAction")
    public WSResult wfmTaskAction(@FormParam("taskAction") String taskAction)
    {
    	WSResult wsr = new WSResult();
        try
        {
            HashMap<String, String> model = SerializerUtil.deserialize2strmap(taskAction);
            TaskAction taskActionObj = new TaskAction();
            String actionType = model.get("actionType");
            
            taskActionObj.setActionDesc(model.get("actionDesc"));
            taskActionObj.setActionType(StringUtil.isNullOrEmpty(actionType)?TaskActionTypes.COMMIT:Integer.valueOf(actionType));
            taskActionObj.setActionUser(model.get("actionUser"));
            taskActionObj.setActionUserId(model.get("actionUserId"));
            taskActionObj.setAsync("1".equals(model.get("async")) ? true : false);
            taskActionObj.setExtendInfo(model.get("extendInfo"));
            taskActionObj.setNextTaskId(model.get("nextTaskId"));
            taskActionObj.setTaskId(model.get("taskId"));
            wsr = getResult(ConvertUtil.serialize(flowInterfaceBusiness.taskAction(taskActionObj)));
        }
        catch (Exception ex)
        {
            logger.error(taskAction);
            errorProcess(wsr,"任务操作失败！", ex);
        }
        return wsr;
    }

    /**
     * 搜索任务
     * @param flowNew
     * @param userAuth
     * @return
     */
    @POST
    @Path("/wfmSearchTask")
    public WSResult wfmSearchTask(@FormParam("taskSearch") String taskSearch)
    {
    	WSResult wsr = new WSResult();
        try
        {
            HashMap<String, String> model = SerializerUtil.deserialize2strmap(taskSearch);
            TaskSearch taskSearchObj = new TaskSearch();
            taskSearchObj.setActId(model.get("actId"));
            taskSearchObj.setActType(model.get("actType"));
            taskSearchObj.setCreateUser(model.get("createUser"));            
            taskSearchObj.setExecuteUser(model.get("executeUser"));
            taskSearchObj.setExtendInfo(model.get("extendInfo"));
            taskSearchObj.setFlowActId(model.get("flowActId"));
            taskSearchObj.setFlowInstanceId(model.get("flowInstanceId"));
            taskSearchObj.setFlowState(model.get("flowState"));
            taskSearchObj.setFlowType(model.get("flowType"));
            taskSearchObj.setMaxCreateTime(model.get("maxCreateTime"));
            taskSearchObj.setMinCreateTime(model.get("minCreateTime"));
            taskSearchObj.setObjId(model.get("objId"));
            taskSearchObj.setObjName(model.get("objName"));            
            taskSearchObj.setRequestUser(model.get("requestUser"));
            taskSearchObj.setTaskId(model.get("taskId"));
            taskSearchObj.setTaskState(model.get("taskState"));
            
            String pageSize = model.get("pageSize");
            String currentPage = model.get("currentPage");
            taskSearchObj.setPageSize(StringUtil.isNullOrEmpty(pageSize)?0:Integer.parseInt(pageSize));
            taskSearchObj.setCurrentPage(StringUtil.isNullOrEmpty(currentPage)?0:Integer.parseInt(currentPage));
            
            wsr = getResult(ConvertUtil.serialize(flowInterfaceBusiness.searchTask(taskSearchObj)));
        }
        catch (Exception ex)
        {
            logger.error(taskSearch);
            errorProcess(wsr,"搜索任务错误!", ex);
        }
        return wsr;
    }

    /**
     * 获取任务
     * @param taskId
     * @param userAuth
     * @return
     */
    @POST
    @Path("/wfmGetTaskInfo")
    public WSResult wfmGetTaskInfo(@FormParam("taskId") String taskId)
    {
    	WSResult wsr = new WSResult();
        try
        {
        	wsr = getResult(ConvertUtil.serialize(flowInterfaceBusiness.getTaskInfo(taskId)));
        }
        catch (Exception ex)
        {
            errorProcess(wsr,"获取任务错误!", ex);
        }
        return wsr;
    }
    
    
    /**
     * 获取任务状态
     * @param taskId
     * @param userAuth
     * @return
     */
    @POST
    @Path("/wfmGetTaskState")
    public WSResult wfmGetTaskState(@FormParam("taskId") String taskId)
    {
        WSResult wsr = new WSResult();
        try
        {
            wsr = getResult(ConvertUtil.serialize(flowInterfaceBusiness.getTaskState(taskId)));
        }
        catch (Exception ex)
        {
            errorProcess(wsr,"获取任务状态错误!", ex);
        }
        return wsr;
    }
    

    /**
     * 获取任务可打回的任务
     * @param taskId
     * @param userAuth
     * @return
     */
    @POST
    @Path("/wfmGetTasksCanBack")
    public WSResult wfmGetTasksCanBack(@FormParam("taskId") String taskId)
    {
    	WSResult wsr = new WSResult();
        try
        {
        	wsr = getResult(ConvertUtil.serialize(flowInterfaceBusiness.getTasksCanBack(taskId)));
        }
        catch (Exception ex)
        {
            errorProcess(wsr,"获取任务可打回的任务错误!", ex);
        }
        return wsr;
    }

    /**
     * 获取任务可提交的任务
     * @param taskId
     * @param userAuth
     * @return
     */
    @POST
    @Path("/wfmGetTasksCanCommit")
    public WSResult wfmGetTasksCanCommit(@FormParam("taskId") String taskId)
    {
    	WSResult wsr = new WSResult();
        try
        {
        	wsr = getResult(ConvertUtil.serialize(flowInterfaceBusiness.getTasksCanCommit(taskId)));
        }
        catch (Exception ex)
        {
            errorProcess(wsr,"获取任务可提交的任务错误!", ex);
        }
        return wsr;
    }

    /**
     * 获取任务指派者
     * @param taskId
     * @param userAuth
     * @return
     */
    @POST
    @Path("/wfmGetTaskAssign")
    public WSResult wfmGetTaskAssign(@FormParam("taskId") String taskId)
    {
    	WSResult wsr = new WSResult();
        try
        {
        	wsr = getResult(ConvertUtil.serialize(flowInterfaceBusiness.getTaskAssign(taskId)));
        }
        catch (Exception ex)
        {
            errorProcess(wsr,"获取任务指派者错误!", ex);
        }
        return wsr;
    }

    /**
     * 设置指派任务
     * @param taskId
     * @param userAuth
     * @return
     */
    @POST
    @Path("/wfmTaskAssign")
    public WSResult wfmTaskAssign(@FormParam("taskId") String taskId, @FormParam("taskExecutorList") String taskExecutorList)
    {
    	WSResult wsr = new WSResult();
        try
        {
            AssignUserList taskExecutorListObj = new AssignUserList();
            Document doc = DocumentHelper.parseText(taskExecutorList);
            Element rootElement = doc.getRootElement();
            List<Node> assignUserNodes = rootElement.selectNodes("assignUser");
            for (Node assignUserItem : assignUserNodes)
            {
                AssignUser assignUser = new AssignUser();
                assignUser.setUserId(assignUserItem.valueOf("@userId"));
                assignUser.setUserName(assignUserItem.valueOf("@userName"));
                taskExecutorListObj.add(assignUser);
            }
            flowInterfaceBusiness.setTaskExecutor(taskId, taskExecutorListObj);
        }
        catch (Exception ex)
        {
            logger.error(taskExecutorList);
            errorProcess(wsr,"设置指派任务错误!", ex);
        }
        return wsr;
    }
    
    
    /**
     * 用户当前任务数统计 List(Name:UserId,Val:TaskCount,Cols:actId)
     * @param userId
     * @return
     */
    @POST
    @Path("/wfmUserCurrentTaskReport")
    public WSResult wfmUserCurrentTaskReport(@FormParam("userId") String userId)
    {
        WSResult wsr = new WSResult();
        try
        {
            wsr = getResult(ConvertUtil.serialize(flowInterfaceBusiness.userCurrentTaskReport(userId)));
        }
        catch (Exception ex)
        {
            errorProcess(wsr,"用户当前任务数统计错误!", ex);
        }
        return wsr;
    }
    
    /**
     * 用户创建流程数量统计 List(Name:UserId,Val:FlowCount,Cols:processType)
     * @param userId
     * @param minCreateTime
     * @param maxCreateTime
     * @return
     */
    @POST
    @Path("/wfmUserCreateFlowReport")
    public WSResult wfmUserCreateFlowReport(@FormParam("userId") String userId,@FormParam("minCreateTime") String minCreateTime
            ,@FormParam("maxCreateTime") String maxCreateTime)
    {
        WSResult wsr = new WSResult();
        try
        {
            wsr = getResult(ConvertUtil.serialize(flowInterfaceBusiness.userCreateFlowReport(userId, minCreateTime, maxCreateTime)));
        }
        catch (Exception ex)
        {
            errorProcess(wsr,"用户创建流程数量统计错误!", ex);
        }
        return wsr;
    }
    
    
    /**
     * 用户执行任务数统计 List(Name:UserId,Val:ExecCount,Cols:actId)
     * @param userId
     * @param minExecTime
     * @param maxExecTime
     * @return
     */
    @POST
    @Path("/wfmUserTaskExecReport")
    public WSResult wfmUserTaskExecReport(@FormParam("userId") String userId,@FormParam("minExecTime") String minExecTime
            ,@FormParam("maxExecTime") String maxExecTime)
    {
        WSResult wsr = new WSResult();
        try
        {
            wsr = getResult(ConvertUtil.serialize(flowInterfaceBusiness.userTaskExecReport(userId, minExecTime, maxExecTime)));
        }
        catch (Exception ex)
        {
            errorProcess(wsr,"用户执行任务数统计错误!", ex);
        }
        return wsr;
    }
    
    
    private void errorProcess(WSResult retObj, String message, Exception ex)
    {
        logger.error(message, ex);
        retObj.errorCode = -1;
        retObj.errorString = message + ex.getMessage();
    }
    
    
    @javax.jws.WebMethod(exclude = true)
	public FlowInterfaceBusiness getFlowInterfaceBusiness() {
		return flowInterfaceBusiness;
	}
	@javax.jws.WebMethod(exclude = true)
	public void setFlowInterfaceBusiness(FlowInterfaceBusiness flowInterfaceBusiness) {
		this.flowInterfaceBusiness = flowInterfaceBusiness;
	}

}
