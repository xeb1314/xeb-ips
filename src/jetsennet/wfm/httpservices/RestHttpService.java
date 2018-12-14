package jetsennet.wfm.httpservices;
import java.util.HashMap;
import java.util.List;

import javax.jws.WebService;
import javax.ws.rs.FormParam;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

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
import jetsennet.net.WSResult;
import jetsennet.util.ConvertUtil;
import jetsennet.util.SerializerUtil;
import jetsennet.util.StringUtil;
import jetsennet.wfm.business.FlowInterfaceBusiness;

import org.apache.log4j.Logger;
import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.dom4j.Node;


/**
 * @author WEIRUKUN
 * 2014-05-16
 */
@Path("/RestHttpService")
@Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
@WebService(name = "/RestHttpService")
public class RestHttpService
{

    private static final Logger logger = Logger.getLogger(RestHttpService.class);
    private FlowInterfaceBusiness flowInterfaceBusiness;
    /**
     * 服务是否可用
     */
    protected boolean isServiceEnable = true;

    /**
      * 用于认证的模块代号
     * 
     */
    @javax.jws.WebMethod(exclude = true)
    public int getModuleCode()
    {
        return -1;
    }

    /**
     * 模块是否可用
    * 
    */
    @javax.jws.WebMethod(exclude = true)
    public void setModuleEnable(boolean isEnable)
    {
        this.isServiceEnable = isEnable;
    }

    /**去认证中心验证登录
     * @param validateCode
     * @return
     */
    protected WSResult validateAuth(String validateCode)
    {
        WSResult retObj = new WSResult();
        if (!this.isServiceEnable)
        {
            retObj.errorCode = -100;
            retObj.errorString = "产品未授权!";
        }

        return retObj;
    }

    /**
     * 获取可用的流程
     * @param processType
     * @param userAuth
     * @return
     */
    @POST
    @Path("/wfmGetProcessList")
    public String wfmGetProcessList(@FormParam("processType") String processType)
    {
        String result = "";
        try
        {
            result = ConvertUtil.objectToJson(flowInterfaceBusiness.getProcessList(Integer.valueOf(processType)));
        }
        catch (Exception ex)
        {
            logger.error("获取可用的流程错误!");
        }
        return result;
    }

    /**
     * 获取流程
     * @param processType
     * @param userAuth
     * @return
     */
    @POST
    @Path("/wfmGetProcess")
    public String wfmGetProcess(@FormParam("processType") int processId)
    {
        String result = "";
        try
        {
            result = ConvertUtil.objectToJson(flowInterfaceBusiness.getProcess(processId));
        }
        catch (Exception ex)
        {
            logger.error("获取流程错误!");
        }
        return result;
    }

    /**
     * 新流程
     * @param flowNew
     * @param userAuth
     * @return
     */
    @POST
    @Path("/wfmCreateFlow")
    public String wfmCreateFlow(@FormParam("flowNew") String flowNew)
    {
        String result = "";
        try
        {
            HashMap<String, String> model = SerializerUtil.deserialize(flowNew, "flowNew");
            FlowNew flowNewObj = new FlowNew();
            flowNewObj.setAutoStart("1".equals(model.get("autoStart")) ? true : false);
            flowNewObj.setCreateUser(model.get("createUser"));
            flowNewObj.setCreateUserId(model.get("createUserId"));
            flowNewObj.setExtendInfo(model.get("extendInfo"));
            flowNewObj.setFlowName(model.get("flowName"));
            flowNewObj.setObjId(model.get("objId"));
            flowNewObj.setObjName(model.get("objName"));
            flowNewObj.setNotifyUrl(model.get("notifyUrl"));
            flowNewObj.setObjType(Integer.parseInt(StringUtil.isNullOrEmpty(model.get("objType")) ? "0" : model.get("objType")));
            flowNewObj.setProcessId(Integer.valueOf(model.get("processId")));
            flowNewObj.setProcessType(Integer.valueOf(model.get("processType")));
            result = ConvertUtil.objectToJson(flowInterfaceBusiness.createFlow(flowNewObj));
        }
        catch (Exception ex)
        {
            logger.error("创建程实例错误!");
        }

        return result;
    }

    /**
     * 流程操作
     * @param flowAction
     * @param userAuth
     * @return
     */
    @POST
    @Path("/wfmFlowAtion")
    public String wfmFlowAtion(@FormParam("flowAction") String flowAction)
    {
        String result = "";
        try
        {
            HashMap<String, String> model = SerializerUtil.deserialize(flowAction, "flowAction");
            FlowAction flowActionObj = new FlowAction();
            flowActionObj.setActionDesc(model.get("actionDesc"));
            flowActionObj.setActionType(Integer.valueOf(model.get("actionType")));
            flowActionObj.setActionUser(model.get("actionUser"));
            flowActionObj.setActionUserId(model.get("actionUserId"));
            flowActionObj.setExtendInfo(model.get("extendInfo"));
            flowActionObj.setFlowInstanceId(model.get("flowInstanceId"));
            flowActionObj.setAsync("1".equals(model.get("async")) ? true : false);
            result = ConvertUtil.objectToJson(flowInterfaceBusiness.flowAction(flowActionObj));
        }
        catch (Exception ex)
        {
            logger.error("流程操作失败！");
        }
        return result;
    }

    /**
     * 搜索流程
     * @param flowNew
     * @param userAuth
     * @return
     */
    @POST
    @Path("/wfmSearchFlow")
    public String wfmSearchFlow(@FormParam("flowSearch") String flowSearch)
    {
        String result = "";
        try
        {
            HashMap<String, String> model = SerializerUtil.deserialize(flowSearch, "flowSearch");
            FlowSearch flowSearchobj = new FlowSearch();
            flowSearchobj.setCreateUser(model.get("createUser"));
            flowSearchobj.setCreateUserId(model.get("createUserId"));
            flowSearchobj.setCurrentPage(Integer.valueOf(model.get("currentPage")));
            flowSearchobj.setExtendInfo(model.get("extendInfo"));
            flowSearchobj.setFlowState(model.get("flowState"));
            flowSearchobj.setFlowType(model.get("flowType"));
            flowSearchobj.setObjId(model.get("objId"));
            flowSearchobj.setObjName(model.get("objName"));
            flowSearchobj.setPageSize(Integer.valueOf(model.get("pageSize")));
            result = ConvertUtil.objectToJson(flowInterfaceBusiness.searchFlow(flowSearchobj));
        }
        catch (Exception ex)
        {
            logger.error("搜索流程错误!");
        }
        return result;
    }

    /**
     * 获取流程变量
     * @param flowNew
     * @param userAuth
     * @return
     */
    @POST
    @Path("/wfmGetFlowVariable")
    public String wfmGetFlowVariable(@FormParam("flowInstanceId") String flowInstanceId)
    {
        String result = "";
        try
        {
            result = ConvertUtil.objectToJson(flowInterfaceBusiness.getFlowVariable(flowInstanceId));
        }
        catch (Exception ex)
        {
            logger.error("获取流程变量错误!");
        }
        return result;
    }

    /**
     * 设置流程变量
     * @param flowNew
     * @param userAuth
     * @return
     */
    @POST
    @Path("/wfmSetFlowVariable")
    public void wfmSetFlowVariable(@FormParam("flowInstanceId") String flowInstanceId, @FormParam("flowVariableList") String flowVariableList)
    {
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
            logger.error("设置流程变量错误!");
        }
    }

    /**
     * 更新流程
     * @param flowNew
     * @param userAuth
     * @return
     */
    @POST
    @Path("/wfmUpdateFlow")
    public void wfmUpdateFlow(@FormParam("flowUpdate") String flowUpdate)
    {
        try
        {
            HashMap<String, String> model = SerializerUtil.deserialize(flowUpdate, "flowUpdate");
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
            logger.error("更新流程错误!");
        }
    }

    /**
     * 获取流程
     * @param flowNew
     * @param userAuth
     * @return
     */
    @POST
    @Path("/wfmGetFlowInfo")
    public String wfmGetFlowInfo(@FormParam("flowInstanceId") String flowInstanceId)
    {
        String result = "";
        try
        {
            result = ConvertUtil.objectToJson(flowInterfaceBusiness.getFlowInfo(flowInstanceId));
        }
        catch (Exception ex)
        {
            logger.error("获取流程错误!");
        }
        return result;
    }

    /**
     * 任务操作
     * @param taskAction
     * @param userAuth
     * @return
     */
    @POST
    @Path("/wfmTaskAction")
    public String wfmTaskAction(@FormParam("taskAction") String taskAction)
    {
        String result = "";
        try
        {
            HashMap<String, String> model = SerializerUtil.deserialize(taskAction, "taskAction");
            TaskAction taskActionObj = new TaskAction();
            taskActionObj.setActionDesc(model.get("actionDesc"));
            taskActionObj.setActionType(Integer.valueOf(model.get("actionType")));
            taskActionObj.setActionUser(model.get("actionUser"));
            taskActionObj.setActionUserId(model.get("actionUserId"));
            taskActionObj.setAsync("1".equals(model.get("async")) ? true : false);
            taskActionObj.setExtendInfo(model.get("extendInfo"));
            taskActionObj.setNextTaskId(model.get("nextTaskId"));
            taskActionObj.setTaskId(model.get("taskId"));
            result = ConvertUtil.objectToJson(flowInterfaceBusiness.taskAction(taskActionObj));
        }
        catch (Exception ex)
        {
            logger.error("任务操作失败！");
        }
        return result;
    }

    /**
     * 搜索任务
     * @param flowNew
     * @param userAuth
     * @return
     */
    @POST
    @Path("/wfmSearchTask")
    public String wfmSearchTask(@FormParam("taskSearch") String taskSearch)
    {
        String result = "";
        try
        {
            HashMap<String, String> model = SerializerUtil.deserialize(taskSearch, "taskSearch");
            TaskSearch taskSearchObj = new TaskSearch();
            taskSearchObj.setActId(model.get("actId"));
            taskSearchObj.setActType(model.get("actType"));
            taskSearchObj.setCreateUser(model.get("createUser"));
            taskSearchObj.setCurrentPage(Integer.valueOf(model.get("currentPage")));
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
            taskSearchObj.setPageSize(Integer.valueOf(model.get("pageSize")));
            taskSearchObj.setRequestUser(model.get("requestUser"));
            taskSearchObj.setTaskId(model.get("taskId"));
            taskSearchObj.setTaskState(model.get("taskState"));
            result = ConvertUtil.objectToJson(flowInterfaceBusiness.searchTask(taskSearchObj));
        }
        catch (Exception ex)
        {
            logger.error("搜索任务错误!");
        }

        return result;
    }

    /**
     * 获取任务
     * @param taskId
     * @param userAuth
     * @return
     */
    @POST
    @Path("/wfmGetTaskInfo")
    public String wfmGetTaskInfo(@FormParam("taskId") String taskId)
    {
        String result = "";
        try
        {
            result = ConvertUtil.objectToJson(flowInterfaceBusiness.getTaskInfo(taskId));
        }
        catch (Exception ex)
        {
            logger.error("获取任务错误!");
        }

        return result;
    }

    /**
     * 获取任务可打回的任务
     * @param taskId
     * @param userAuth
     * @return
     */
    @POST
    @Path("/wfmGetTasksCanBack")
    public String wfmGetTasksCanBack(@FormParam("taskId") String taskId)
    {
        String result = "";
        try
        {
            result = ConvertUtil.objectToJson(flowInterfaceBusiness.getTasksCanBack(taskId));
        }
        catch (Exception ex)
        {
            logger.error("获取任务可打回的任务错误!");
        }

        return result;
    }

    /**
     * 获取任务可提交的任务
     * @param taskId
     * @param userAuth
     * @return
     */
    @POST
    @Path("/wfmGetTasksCanCommit")
    public String wfmGetTasksCanCommit(@FormParam("taskId") String taskId)
    {
        String result = "";
        try
        {
            result = ConvertUtil.objectToJson(flowInterfaceBusiness.getTasksCanCommit(taskId));
        }
        catch (Exception ex)
        {
            logger.error("获取任务可提交的任务错误!");
        }

        return result;
    }

    /**
     * 获取任务指派者
     * @param taskId
     * @param userAuth
     * @return
     */
    @POST
    @Path("/wfmGetTaskAssign")
    public String wfmGetTaskAssign(@FormParam("taskId") String taskId)
    {
        String result = "";
        try
        {
            result = ConvertUtil.objectToJson(flowInterfaceBusiness.getTaskAssign(taskId));
        }
        catch (Exception ex)
        {
            logger.error("获取任务指派者错误!");
        }

        return result;
    }

    /**
     * 设置指派任务
     * @param taskId
     * @param userAuth
     * @return
     */
    @POST
    @Path("/wfmTaskAssign")
    public void wfmTaskAssign(@FormParam("taskId") String taskId, @FormParam("taskExecutorList") String taskExecutorList)
    {
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
            logger.error("设置指派任务错误!");
        }
    }

    
    /**
     * 用户当前任务数统计 List(Name:UserId,Val:TaskCount,Cols:actId)
     * @param userId
     * @return
     */
    @POST
    @Path("/wfmUserCurrentTaskReport")
    public String wfmUserCurrentTaskReport(@FormParam("userId") String userId)
    {
        String result = "";
        try
        {
            result = ConvertUtil.objectToJson(flowInterfaceBusiness.userCurrentTaskReport(userId));
        }
        catch (Exception ex)
        {
            logger.error("用户当前任务数统计错误!");
        }
        return result;
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
    public String wfmUserCreateFlowReport(@FormParam("userId") String userId,@FormParam("minCreateTime") String minCreateTime
            ,@FormParam("maxCreateTime") String maxCreateTime)
    {
        String result = "";
        try
        {
            result = ConvertUtil.objectToJson(flowInterfaceBusiness.userCreateFlowReport(userId, minCreateTime, maxCreateTime));
        }
        catch (Exception ex)
        {
            logger.error("用户创建流程数量统计错误!", ex);
        }
        return result;
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
    public String wfmUserTaskExecReport(@FormParam("userId") String userId,@FormParam("minExecTime") String minExecTime
            ,@FormParam("maxExecTime") String maxExecTime)
    {
        String result = "";
        try
        {
            result = ConvertUtil.objectToJson(flowInterfaceBusiness.userTaskExecReport(userId, minExecTime, maxExecTime));
        }
        catch (Exception ex)
        {
            logger.error("用户执行任务数统计错误!", ex);
        }
        return result;
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
