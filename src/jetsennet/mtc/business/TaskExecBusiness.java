package jetsennet.mtc.business;


import java.util.UUID;

import jetsennet.frame.business.BaseBusiness;
import jetsennet.frame.business.Business;
import jetsennet.jmtc.MtsObjectFactory;
import jetsennet.jmtc.Task;
import jetsennet.jmtc.TaskStatus;
import jetsennet.jmtc.command.MtsTaskNew;
import jetsennet.mtc.schema.TaskExec;
import jetsennet.util.DateUtil;
import jetsennet.util.StringUtil;

import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;

public class TaskExecBusiness extends BaseBusiness{

	
	@Override
    @Business
    public int commonObjInsert(String className, String xml) throws Exception
    {
    	Task task = ((MtsTaskNew) MtsObjectFactory.createMtsFormat().unmarshal(xml)).getTask();
    	if(task==null){
    		throw new Exception("xml解析任务异常！");
    	}
    	Document doc = DocumentHelper.parseText(xml);
        Element taskCfg = doc.getRootElement().element("mtsTaskNew");
        String taskIdX = taskCfg.elementText("taskID");
        
        if(!StringUtil.isNullOrEmpty(taskIdX)){
        	throw new Exception("手动下发任务报文taskID应为空,请重新编辑！");
        }
        if(taskIdX==null){
            taskCfg.addElement("taskID");
        }
    	TaskExec taske = new TaskExec();
    	String taskId = UUID.randomUUID().toString();
    	taskCfg.selectSingleNode("taskID").setText(taskId);
    	taske.setTaskId(taskId);
    	taske.setAppObjid(task.getAppObjId());
    	taske.setAppObjsource(task.getAppObjSource());
    	taske.setAppObjtype(task.getAppObjType());
    	taske.setCreateTime(DateUtil.now());
    	taske.setCreateUser(task.getCreateUser());
//        	taske.setEndTime(StringUtil.isNullOrEmpty(task.getEndTime())?DateUtil.now():DateUtil.parseDate(task.getEndTime()));
    	taske.setExecMode(task.getExecMode());
    	taske.setField1(task.getField1());
    	taske.setField2(task.getField2());
    	taske.setMessageId(task.getMessageId());
    	taske.setNotifyType(task.getTaskNotifyType());
    	taske.setNotifyUrl(task.getTaskNotifyURL());
    	taske.setParentId(task.getParentId());
    	taske.setPrevTaskid(task.getPrevTaskId());
    	//taske.setStartTime(StringUtil.isNullOrEmpty(task.getStartTime())?DateUtil.now():DateUtil.parseDate(task.getStartTime()));
    	taske.setStateDesc(task.getStateDesc());
    	taske.setSubType(task.getSubType());
    	taske.setTaskActor(task.getTaskActor());
    	taske.setTaskGroup(task.getTaskGroup());
    	taske.setTaskLevel(task.getTaskLevel());
    	taske.setTaskName(task.getTaskName());
    	taske.setTaskPercent(task.getTaskPercent());
    	taske.setTaskState(TaskStatus.READY);
    	taske.setTaskType(task.getTaskType());
    	taske.setTaskWorker(task.getTaskWorker());
    	taske.setTaskXml(doc.asXML());

    	getDao().saveBusinessObjs(taske);
        
        return 0;
    }

}
