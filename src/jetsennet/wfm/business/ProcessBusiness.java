package jetsennet.wfm.business;

import java.io.File;
import java.io.FileInputStream;
import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import jetsennet.frame.business.BaseBusiness;
import jetsennet.frame.business.Business;
import jetsennet.frame.dataaccess.IDao;
import jetsennet.frame.security.UserProfileInfo;
import jetsennet.jmtc.CmdTypes;
import jetsennet.jmtc.IMtsFormat;
import jetsennet.jmtc.MtsObjectFactory;
import jetsennet.jmtc.command.MtsCmd;
import jetsennet.juum.IUserAuthentication;
import jetsennet.jwfm.FlowObjectFactory;
import jetsennet.jwfm.FlowStatus;
import jetsennet.jwfm.IFmsFormat;
import jetsennet.jwfm.command.FmsAck;
import jetsennet.jwfm.command.FmsFlowNew;
import jetsennet.jwfm.command.FmsProcessAction;
import jetsennet.net.HttpRequestProxy;
import jetsennet.sqlclient.DbCommand;
import jetsennet.sqlclient.DbCommandType;
import jetsennet.sqlclient.ISqlParser;
import jetsennet.sqlclient.SqlCondition;
import jetsennet.sqlclient.SqlLogicType;
import jetsennet.sqlclient.SqlParamType;
import jetsennet.sqlclient.SqlRelationType;
import jetsennet.util.DBUtil;
import jetsennet.util.HttpRequest;
import jetsennet.util.SerializerUtil;
import jetsennet.util.SpringContextUtil;
import jetsennet.util.StringUtil;
import jetsennet.util.ThreadLocalUtil;
import jetsennet.util.ValidateUtil;
import jetsennet.util.XmlUtil;
import jetsennet.wfm.schema.Actparam;
import jetsennet.wfm.schema.Assignrule;
import jetsennet.wfm.schema.Procact;
import jetsennet.wfm.schema.Process;
import jetsennet.wfm.schema.ProcessType;
import jetsennet.wfm.schema.Procver;
import jetsennet.wfm.schema.Transition;

import org.apache.commons.codec.binary.Base64;
import org.apache.log4j.Logger;
import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.dom4j.Node;

public class ProcessBusiness extends BaseBusiness{

	private static final Logger logger = Logger.getLogger(ProcessBusiness.class);
	protected IMtsFormat mtsFormat = MtsObjectFactory.createMtsFormat();
	private static IFmsFormat fmsFormat = FlowObjectFactory.createFmsFormat();
	
    public IDao getReplaceDao(){
    	IDao daof = getDao();
    	if(daof==null){
    		ActivityBusiness activityBusiness = (ActivityBusiness) SpringContextUtil.getBean("activityBusiness");
    		return activityBusiness.getDao();
    	}
    	return daof;
    }
	
    
	/* 新建流程 增加版本号控制  同时创建一条WFM_PROCVER记录
	 * add 2015-4-8 
	 */
	@Override
    @Business
    public int commonObjInsert(String className, String xml) throws Exception
    {
        Element root = DocumentHelper.parseText(xml).getRootElement();
        Process process = SerializerUtil.deserialize(Process.class, root);
        SqlCondition sqlcon =
                new SqlCondition("PROC_NAME", process.getProcName(), SqlLogicType.And, SqlRelationType.Equal, SqlParamType.String);
        SqlCondition sqlcon1 =
                new SqlCondition("PROC_TYPE", String.valueOf(process.getProcType()), SqlLogicType.And, SqlRelationType.Equal, SqlParamType.Numeric);
        if(getReplaceDao().isExist(Process.class,sqlcon,sqlcon1)){
            throw new Exception("此类型下存在相同流程名称,请重新输入!");
        }
        getReplaceDao().saveBusinessObjs(process);
        Procver procver = new Procver();
        procver.setProcId(process.getProcId());
        procver.setProcVer(1);
        procver.setCreateTime(new Date());
        getReplaceDao().saveBusinessObjs(procver);
        return process.getProcId();
    }

	
	/**
	 * 复制流程 获取最新流程名称
	 * 复制（不改名默认加1） 导入默认（+1）
	 * @param processName
	 * @param processType
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
    @Business(trans=false,log = false)
	public String getNewProcessName(String processName,String processType) throws Exception{
	    String newProcessName = processName;
	    if(")".equals(processName.substring(processName.length()-1,processName.length()))&&processName.indexOf("(")>-1){
            String index = processName.substring(processName.lastIndexOf("(")+1, processName.length()-1);
            if(ValidateUtil.isNumeric(index)){
                newProcessName = processName.substring(0, processName.lastIndexOf("("));
            }
        }
        SqlCondition sqlcon =
                new SqlCondition("PROC_NAME", newProcessName, SqlLogicType.And, SqlRelationType.ILike, SqlParamType.String);
        SqlCondition sqlcon1 =
                new SqlCondition("PROC_TYPE", processType, SqlLogicType.And, SqlRelationType.Equal, SqlParamType.Numeric);
        List<Map<String, String>> list = getReplaceDao().getStrMapLst(Process.class, sqlcon,sqlcon1);
        if(list!=null&&list.size()>0){
            int maxNum = 0;
            for(Map<String, String> map:list){
                String procName = map.get("PROC_NAME");
                if(")".equals(procName.substring(procName.length()-1,procName.length()))&&procName.indexOf("(")>-1){
                    String index = procName.substring(procName.lastIndexOf("(")+1, procName.length()-1);
                    if(ValidateUtil.isNumeric(index)){
                        maxNum = (maxNum>Integer.valueOf(index.trim()))?maxNum:Integer.valueOf(index.trim());
                    }
                }
            }
            newProcessName = newProcessName+"("+(maxNum+1)+")";
        }
        return newProcessName;
	}
	
	
    @Override
    @Business(trans=false)
    public int commonObjDelete(String className, String keyValues) throws Exception
    {
    	 FmsProcessAction fmsAction = new FmsProcessAction();
	   	 fmsAction.setProcId(Integer.valueOf(keyValues));
	   	 fmsAction.setProcState(FlowStatus.DELET);
	   	 FmsAck fmsack =(FmsAck) fmsFormat.unmarshal(HttpRequest.send(getWFMManagerUrl(), fmsFormat.marshal(fmsAction)));
	   	 if(fmsack.getStateCode()!=0){
	   		 throw new Exception(fmsack.getStateDesc());
	   	 }
    	 return 0;
    }
    
    
    @Business
    @Override
    public int commonObjUpdateByPk(String className, String xml, boolean isFilterNull) throws Exception
    {
        Element root = DocumentHelper.parseText(xml).getRootElement();
        Process process = SerializerUtil.deserialize(Process.class, root);
        SqlCondition sqlcon =
                new SqlCondition("PROC_NAME", process.getProcName(), SqlLogicType.And, SqlRelationType.Equal, SqlParamType.String);
        SqlCondition sqlcon1 =
                new SqlCondition("PROC_TYPE", String.valueOf(process.getProcType()), SqlLogicType.And, SqlRelationType.Equal, SqlParamType.Numeric);
        SqlCondition sqlcon2 =
                new SqlCondition("PROC_ID", String.valueOf(process.getProcId()), SqlLogicType.And, SqlRelationType.NotEqual, SqlParamType.Numeric);
        if(getReplaceDao().isExist(Process.class,sqlcon,sqlcon1,sqlcon2)){
            throw new Exception("此类型下存在相同流程名称,请重新输入!");
        }
        return getReplaceDao().updateBusinessObjs(isFilterNull, process);
    }
    
    
    /**
     * 更新流程节点信息
     * 
     * @param flowXml
     * @return
     * @throws Exception
     */
    @SuppressWarnings("unchecked")
    @Business(log = false , trans=false)
    public String saveProcess(String flowXml) throws Exception
    {
        try
        {
            String type = "";
            if(!StringUtil.isNullOrEmpty(flowXml)&&flowXml.substring(flowXml.lastIndexOf(",")+1).equals("copy")){
                flowXml = flowXml.substring(0, flowXml.lastIndexOf(","));
                type = "copy";
            }
            Document processDoc = DocumentHelper.parseText(flowXml);
            Element processNode = processDoc.getRootElement();
            String processId = XmlUtil.tryGetItemText(processNode, "processId", "");
            if (StringUtil.isNullOrEmpty(processId))
            {
                throw new Exception("无效的流程标识");
            }
            Map<String,String> map = getReplaceDao().getStrMap(String.format("SELECT MAX(PROC_VER) AS MAXVER FROM WFM_PROCVER WHERE PROC_ID=%s",processId));
            
            getReplaceDao().update(String.format("DELETE FROM WFM_ASSIGNRULE WHERE PROCACT_ID IN (SELECT PROCACT_ID FROM WFM_PROCACT WHERE PROC_ID=%s AND PROC_VER=%s)",
            		processId,Integer.valueOf(map.get("MAXVER"))));
            getReplaceDao().update(String.format("DELETE FROM WFM_TRANSITION WHERE PROCACT_ID IN (SELECT PROCACT_ID FROM WFM_PROCACT WHERE PROC_ID=%s AND PROC_VER=%s)",
                    processId,Integer.valueOf(map.get("MAXVER"))));
            getReplaceDao().update(String.format("DELETE FROM WFM_PROCACT WHERE PROC_ID=%s AND PROC_VER=%s", processId,Integer.valueOf(map.get("MAXVER"))));

            List<Element> actList = processNode.selectNodes("flowActivities/flowActivity");
            saveProcessActivity(Integer.parseInt(processId), actList, 0,type,Integer.valueOf(map.get("MAXVER")));
        }
        catch (Exception ex)
        {
            throw new Exception("保存流程失败！");
        }
        return "0";
    }

    /**
     * 更新流程节点信息
     * @param processDoc
     * @param sqlExecutor
     * @throws Exception
     */
    @SuppressWarnings("unchecked")
    @Business(log = false, trans=false)
    protected void saveProcess(Document processDoc) throws Exception
    {
        Element processNode = processDoc.getRootElement();

        String processId = XmlUtil.tryGetItemText(processNode, "processId", "");

        if (StringUtil.isNullOrEmpty(processId))
        {
            throw new Exception("无效的流程标识");
        }

        Map<String,String> map = getReplaceDao().getStrMap(String.format("SELECT MAX(PROC_VER) AS MAXVER FROM WFM_PROCVER WHERE PROC_ID=%s",processId));
        
        getReplaceDao().update(String.format("DELETE FROM WFM_ASSIGNRULE WHERE PROCACT_ID IN (SELECT PROCACT_ID FROM WFM_PROCACT WHERE PROC_ID=%s AND PROC_VER=%s)",
                processId,Integer.valueOf(map.get("MAXVER"))));
        getReplaceDao().update(String.format("DELETE FROM WFM_TRANSITION WHERE PROCACT_ID IN (SELECT PROCACT_ID FROM WFM_PROCACT WHERE PROC_ID=%s AND PROC_VER=%s)",
                processId,Integer.valueOf(map.get("MAXVER"))));
        getReplaceDao().update(String.format("DELETE FROM WFM_PROCACT WHERE PROC_ID=%s AND PROC_VER=%s", processId,Integer.valueOf(map.get("MAXVER"))));

        List<Element> actList = processNode.selectNodes("flowActivities/flowActivity");
        saveProcessActivity(Integer.parseInt(processId), actList, 0,"import",Integer.valueOf(map.get("MAXVER")));
    }
    
    
    /**
     * type : import导入进的xml 需要保存一份模板
     * @param processId
     * @param actList
     * @param parentId
     * @param type
     * @throws Exception
     */
    @Business(log = false, trans=true)
    private void saveProcessActivity(int processId, List<Element> actList, int parentId,String type,int currVer) throws Exception
    {
        int childSize = actList.size();

        if (childSize == 0)
        {
            return;
        }

        int lastId = 0;

        for (int i = 0; i < childSize; i++)
        {
            Element actNode = actList.get(i);
            int actId = Integer.valueOf(XmlUtil.tryGetItemText(actNode, "actId", "0"));
            
            Procact procact = new Procact();
            procact.setProcId(processId);
            procact.setActId(actId);
            procact.setActParam(XmlUtil.tryGetItemText(actNode, "parameter", ""));
            procact.setProcactName(XmlUtil.tryGetItemText(actNode, "name", ""));
            procact.setParentId(parentId);
            procact.setProcVer(currVer);
            getReplaceDao().saveBusinessObjs(procact);
            
            int dbId = procact.getProcactId();
            //更新转码模板procactId
            if (actId==5200 || actId==5201 || actId==5210 || actId==5209)
            {
                //按照模板名称的最大值排序
                List<Map<String,String>> mapActList = getReplaceDao().getStrMapLst(
                		String.format("SELECT TEMPLATE_NAME,PROCACT_ID FROM WFM_ACTPARAM ORDER BY TEMPLATE_NAME DESC"));
                int maxTemIndex = dbId;
                
                if(mapActList!=null&&mapActList.size()>0){
                	
                    int[] arraySort = new int[2*mapActList.size()];
                    
                    for (int j = 0; j < mapActList.size(); j++)
                    {
                        String templateMaxIndex = mapActList.get(j).get("TEMPLATE_NAME");
                        String procactParamId = mapActList.get(j).get("PROCACT_ID");
                        if(StringUtil.isNullOrEmpty(procactParamId)){
                            arraySort[2*j] = 0;
                        }else{
                            arraySort[2*j] = Integer.valueOf(procactParamId);
                        }
                        if(!StringUtil.isNullOrEmpty(templateMaxIndex)&&templateMaxIndex.lastIndexOf("_")>-1){
                            arraySort[2*j+1] = Integer.valueOf(templateMaxIndex.substring(6, templateMaxIndex.lastIndexOf("_")));
                        }else{
                            arraySort[2*j+1] = 0;
                        }
                    }
                    Arrays.sort(arraySort);
                    maxTemIndex = arraySort[arraySort.length-1];
                }
                
                if(!StringUtil.isNullOrEmpty(type)){
                	
                    Map<String,String> actParamMap = getReplaceDao().getStrMap(
                    		String.format("SELECT * FROM WFM_ACTPARAM WHERE PROCACT_ID=%s", XmlUtil.tryGetItemText(actNode, "flowActId", "0")));
                    Actparam actparam = new Actparam();
                    
                    if(actParamMap!=null){
                        actparam.setParamData(actParamMap.get("PARAM_DATA"));
                        actparam.setParamType(Integer.valueOf(actParamMap.get("PARAM_TYPE")));
                        actparam.setProcactId(dbId);
                        actparam.setTemplateName(actParamMap.get("TEMPLATE_NAME"));
                        actparam.setField1(actParamMap.get("FIELD_1"));
                        actparam.setParamMd5(actParamMap.get("PARAM_MD5"));
                        getReplaceDao().saveBusinessObjs(actparam);
                    }else{
                        //外部系统导入默认存储模板
                        if(!StringUtil.isNullOrEmpty(XmlUtil.tryGetItemText(actNode, "paramData", ""))){
                            actparam.setParamData(XmlUtil.tryGetItemText(actNode, "paramData", ""));
                            actparam.setProcactId(dbId);
                            actparam.setParamType(10);
                            actparam.setTemplateName("Action" + (maxTemIndex+1) + "_template.tpl");
                            actparam.setField1(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
                            getReplaceDao().saveBusinessObjs(actparam);
                        }
                    }
                    //同步模板名称
                    if(!StringUtil.isNullOrEmpty(procact.getActParam())){
                        Element ele = DocumentHelper.parseText(procact.getActParam()).getRootElement();
                        String oldTemplateName = XmlUtil.tryGetItemText(ele, "templateName", "");
                        
                        if(!StringUtil.isNullOrEmpty(oldTemplateName)&&!oldTemplateName.equals(actparam.getTemplateName())){
                            ele.selectSingleNode("templateName").setText(actparam.getTemplateName());
                            Procact upTemName = new Procact();
                            upTemName.setProcactId(dbId);
                            upTemName.setActParam(ele.asXML());
                            getReplaceDao().updateBusinessObjs(true, upTemName);
                        }
                    }
                }else{
                    if(actId==5400){
                        if(!StringUtil.isNullOrEmpty(procact.getActParam())){
                        	
                            Element ele = DocumentHelper.parseText(procact.getActParam()).getRootElement();
                            String newTemplateName = XmlUtil.tryGetItemText(ele, "templateName", "");
                            
                            if(StringUtil.isNullOrEmpty(newTemplateName)){
                                continue;
                            }
                            
                            //得到选中的模板信息
                            List<Map<String,String>> list = getReplaceDao().getStrMapLst(
                                String.format("SELECT * FROM WFM_ACTPARAM WHERE TEMPLATE_NAME='%s'", newTemplateName));
                            String paramData = ""; String paramType = ""; String field1 = "";
                            
                            if(list!=null&&list.size()>0){
                                paramData = list.get(0).get("PARAM_DATA");
                                paramType = list.get(0).get("PARAM_TYPE");
                                field1 = list.get(0).get("FIELD_1");
                            }
                            
                            //查询是否存在当前节点的模板 如果存在直接更新节点id与模板内容对应关系 如果不存在就新加一条
                            SqlCondition sqlcononly =
                                    new SqlCondition("PROCACT_ID", XmlUtil.tryGetItemText(actNode, "flowActId", "0"), SqlLogicType.And, SqlRelationType.Equal, SqlParamType.Numeric);
                            Map<String, String> actparamMap = getDao().getStrMap(Actparam.class, sqlcononly);
                            Actparam actparam = new Actparam();
                            actparam.setTemplateName(newTemplateName);
                            actparam.setParamData(paramData);
                            actparam.setProcactId(dbId);
                            
                            if(actparamMap!=null){
                                actparam.setParamId(Integer.valueOf(actparamMap.get("PARAM_ID")));
                                getDao().updateBusinessObjs(true, actparam);
                            }else{
                                actparam.setParamType(Integer.valueOf(paramType));
                                actparam.setField1(field1);
                                getDao().saveBusinessObjs(actparam);
                            }
                        }
                    }else{
                        getReplaceDao().update(String.format("UPDATE WFM_ACTPARAM SET PROCACT_ID = %s WHERE PROCACT_ID = %s",
                            dbId,
                            XmlUtil.tryGetItemText(actNode, "flowActId", "0")));
                    }
                }
            }

            // 插入指派规则
            Node assignNode = actNode.selectSingleNode("assignRule");

            if (assignNode != null)
            {
                String assignType = XmlUtil.tryGetItemText(assignNode, "assignType", "");
                if (!StringUtil.isNullOrEmpty(assignType))
                {
                    String assignObjId = XmlUtil.tryGetItemText(assignNode, "assignObjId", "");
                    String assignParam = XmlUtil.tryGetItemText(assignNode, "assignParam", "");
                    Assignrule assignrule = new Assignrule();
                    assignrule.setAssignType(Integer.valueOf(assignType));
                    assignrule.setAssignObjid(assignObjId);
                    assignrule.setAssignParam(assignParam);
                    assignrule.setProcactId(dbId);
                    getReplaceDao().saveBusinessObjs(assignrule);
                }
            }

            if (i > 0)
            {
            	Transition transition = new Transition();
            	transition.setProcactId(lastId);
            	transition.setNextactId(dbId);
                getReplaceDao().saveBusinessObjs(transition);
            }

            saveProcessActivity(processId, actNode.selectNodes("flowActivities/flowActivity"), dbId,type,currVer);

            lastId = dbId;
        }
    }

    @SuppressWarnings("unchecked")
    @Business(log = false, trans=false)
    public String getProcess(int processId,String procVer) throws Exception
    {
    	Map<String,String> processItem = getReplaceDao().getStrMap(
    			String.format("SELECT PROC_ID,PROC_TYPE,PROC_NAME,FLOW_TYPE,OBJ_TYPE,PROC_DESC FROM WFM_PROCESS WHERE PROC_ID=%s", processId));

        if (processItem == null || processItem.get("PROC_NAME") == null)
        {
            return "";
        }
        
        //当前版本号
        int currVer = 0;
        
        if(!StringUtil.isNullOrEmpty(procVer)){
            currVer = Integer.valueOf(procVer);
        }else{
            Map<String,String> procVerItem = getReplaceDao().getStrMap(
            		String.format("SELECT MAX(PROC_VER) AS MAXVER FROM WFM_PROCVER WHERE PROC_ID=%s", processId));
            currVer = Integer.valueOf(procVerItem.get("MAXVER"));
        }

        //清除为-1的模板 2015-1-15 不保存流程的时候 将已经提交的模板同步取消
        getReplaceDao().execute(String.format("DELETE FROM WFM_ACTPARAM WHERE PROCACT_ID=-1"));

        //增加流程版本号控制 取最大版本号显示
        List<Map<String,String>> actList = getReplaceDao().getStrMapLst(
        		String.format("SELECT PROCACT_ID,PA.ACT_ID,A.ACT_CLASS,PARENT_ID,PROCACT_NAME,ACT_PARAM,ACT_TYPE FROM WFM_PROCACT PA INNER JOIN WFM_ACTIVITY A on PA.ACT_ID=A.ACT_ID WHERE " +
        		"PROC_ID=%s AND PROC_VER=%s ORDER BY PROCACT_ID",processId,currVer));

        List<Map<String,String>> ruleList = getReplaceDao().getStrMapLst(
        		String.format("SELECT PROCACT_ID,ASSIGN_TYPE,ASSIGN_OBJID,ASSIGN_PARAM FROM WFM_ASSIGNRULE " +
        		"WHERE PROCACT_ID in (SELECT PROCACT_ID FROM WFM_PROCACT WHERE PROC_ID=%s AND PROC_VER=%s)",
                processId,currVer));

        StringBuilder processXml = new StringBuilder();

        processXml.append("<process version=\"2.1\">");
        processXml.append("<processId>" + processId + "</processId>");
        processXml.append("<processName>" + XmlUtil.escapeXml(processItem.get("PROC_NAME")) + "</processName>");
        processXml.append("<objType>" + processItem.get("PROC_TYPE") + "</objType>");
        processXml.append("<cmType>" + processItem.get("OBJ_TYPE") + "</cmType>");
        processXml.append("<processType>" + processItem.get("FLOW_TYPE") + "</processType>");
        processXml.append("<description>" + XmlUtil.escapeXml(processItem.get("PROC_DESC")) + "</description>");

        getProcessActivity(processXml, actList, ruleList, 0);

        processXml.append("</process>");
        return processXml.toString();
    }
    
    private void getProcessActivity(StringBuilder processXml, List<Map<String,String>> actList, List<Map<String,String>> ruleList, int parentId) throws Exception
    {
        boolean hasItem = false;

        for (Map<String,String> item : actList)
        {
            int thisParentId = Integer.parseInt(item.get("PARENT_ID"));

            if (parentId == thisParentId)
            {
                int procActId = Integer.parseInt(item.get("PROCACT_ID"));

                if (!hasItem)
                {
                    processXml.append("<flowActivities>");
                    hasItem = true;
                }

                processXml.append("<flowActivity>");

                processXml.append("<flowActId>" + procActId + "</flowActId>");
                processXml.append("<name>" + XmlUtil.escapeXml(item.get("PROCACT_NAME")) + "</name>");
                processXml.append("<actId>" + item.get("ACT_ID") + "</actId>");
                processXml.append("<actClass>" + item.get("ACT_CLASS") + "</actClass>");
                processXml.append("<actType>" + item.get("ACT_TYPE") + "</actType>");
                processXml.append("<parameter>" + XmlUtil.escapeXml(item.get("ACT_PARAM")) + "</parameter>");

                Map<String,String> map = getReplaceDao().getStrMap(
                		String.format("SELECT PARAM_DATA FROM WFM_ACTPARAM WHERE PROCACT_ID =%s",procActId));
                if(map!=null){
                    processXml.append("<paramData>" + map.get("PARAM_DATA") + "</paramData>");
                }
                
                for (Map<String,String> ruleItem : ruleList)
                {
                    int thisProcAcId = Integer.parseInt(ruleItem.get("PROCACT_ID"));
                    if (procActId == thisProcAcId)
                    {
                        processXml.append("<assignRule>");
                        processXml.append("<assignType>" + ruleItem.get("ASSIGN_TYPE") + "</assignType>");
                        processXml.append("<assignObjId>" + ruleItem.get("ASSIGN_OBJID") + "</assignObjId>");
                        processXml.append("<assignParam>" + XmlUtil.escapeXml(ruleItem.get("ASSIGN_PARAM")) + "</assignParam>");
                        processXml.append("</assignRule>");

                        break;
                    }
                }

                getProcessActivity(processXml, actList, ruleList, procActId);

                processXml.append("</flowActivity>");
            }
        }

        if (hasItem)
        {
            processXml.append("</flowActivities>");
        }
    }
    
    /**
     * 保存和同步模板
     * 
     * @param procactId
     * @param templateData
     * @param oldTemplateName  "package"：打包  ，"transcode"：转码， "Action24_template.tpl":技审，"mxffile":mxf文件导出
     * @throws Exception
     */
    @Business(log = false, trans=false)
    public int saveTemplate(int procactId, String templateData, String oldTemplateName) throws Exception
    {
        List<Map<String,String>> mapActList = getReplaceDao().getStrMapLst(
        		String.format("SELECT TEMPLATE_NAME,PROCACT_ID FROM WFM_ACTPARAM ORDER BY TEMPLATE_NAME DESC"));
        Map<String,String> actParamMap = getReplaceDao().getStrMap(
        		String.format("SELECT TEMPLATE_NAME FROM WFM_ACTPARAM WHERE PROCACT_ID=%s", procactId));
        
        //查找模板名称下有没有相同的名称 如果只有一个就编辑，超过一个就重新新建一个（保证不出现修改了模板影响了其他流程的使用）
        List<Map<String,String>> list = getReplaceDao().getStrMapLst(
            String.format("SELECT PROCACT_ID FROM WFM_ACTPARAM WHERE TEMPLATE_NAME='%s'", oldTemplateName));
        int dbId = 0;
        
        //dbId 取 WFM_ACTPARAM表中TEMPLATE_NAME,PROCACT_ID最大的序号
        if(mapActList!=null&&mapActList.size()>0){
        	
            int[] arraySort = new int[2*mapActList.size()];
            
            for (int i = 0; i < mapActList.size(); i++)
            {
                String templateMaxIndex = mapActList.get(i).get("TEMPLATE_NAME");
                String procactParamId = mapActList.get(i).get("PROCACT_ID");
                
                if(StringUtil.isNullOrEmpty(procactParamId)){
                    arraySort[2*i] = 0;
                }else{
                    arraySort[2*i] = Integer.valueOf(procactParamId);
                }
                if(!StringUtil.isNullOrEmpty(templateMaxIndex)&&templateMaxIndex.lastIndexOf("_")>-1){
                    arraySort[2*i+1] = Integer.valueOf(templateMaxIndex.substring(6, templateMaxIndex.lastIndexOf("_")));
                }else{
                    arraySort[2*i+1] = 0;
                }
            }
            Arrays.sort(arraySort);
            dbId = arraySort[arraySort.length-1];
        }
        
        String templateName = "Action" + (dbId+1) + "_template.tpl";// 模板名称
        
        try {
            if (!StringUtil.isNullOrEmpty(oldTemplateName)
            		&& !"package".equals(oldTemplateName)
            		&& !"transcode".equals(oldTemplateName)
            		&& !"mxffile".equals(oldTemplateName)
            		&& actParamMap!=null
            		&& actParamMap.get("TEMPLATE_NAME").equals(oldTemplateName)
            		&& list!=null && list.size()==1)
            {
                templateName = oldTemplateName;// 模板名称
                getReplaceDao().update(String.format("UPDATE WFM_ACTPARAM SET PARAM_DATA = '%s' WHERE TEMPLATE_NAME = '%s'",
                    templateData,
                    oldTemplateName));
            }
            
            String objXml =
                    StringUtil.format("<DataSource><PROCACT_ID>%s</PROCACT_ID><PARAM_TYPE>%s</PARAM_TYPE><TEMPLATE_NAME>%s</TEMPLATE_NAME><PARAM_DATA>%s</PARAM_DATA></DataSource>",
                        procactId == -1?(dbId+1):procactId,
                            10,
                            templateName,
                            templateData);
            addFormatTemplate(objXml);
            synchTemplate(templateName, templateData, procactId,oldTemplateName);
        }
        catch (Exception e){}
        
        return procactId == -1?(dbId+1):procactId;
    }
    
    
    /**
     * 台标同步
     * @param fileName
     * @param stationData
     * @param procactId
     * @throws Exception
     */
    @Business(log = false, trans=false)
    public void saveStationPath(String fileName,String stationData) throws Exception 
    {
        try {
            synchTemplateBusiness(fileName, stationData, "200","11");
        }
        catch (Exception e){}
    }
    
    /**
     * 添加模板
     * 
     * @param objXml
     * @return
     * @throws Exception
     */
    @Business(log = false)
    private void addFormatTemplate(String objXml) throws Exception
    {
        HashMap<String, String> model = SerializerUtil.deserialize2strmap(objXml);
        try
        {
            // 清除原数据
            getReplaceDao().update(String.format("DELETE FROM WFM_ACTPARAM WHERE PROCACT_ID=%s", model.get("PROCACT_ID")));

        	Actparam actparam = new Actparam();
        	actparam.setProcactId(Integer.valueOf(model.get("PROCACT_ID")));
        	actparam.setParamType(Integer.valueOf(model.get("PARAM_TYPE")));
        	actparam.setTemplateName(model.get("TEMPLATE_NAME"));
        	actparam.setParamData(model.get("PARAM_DATA"));
        	actparam.setField1(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
        	getReplaceDao().saveBusinessObjs(actparam);
        }
        catch (Exception e)
        {
        	logger.error(e);
        }
    }
    
    
    /**
     * 同步模板
     * 
     * @param templateName
     * @param paramData
     * @throws Exception
     */
    @Business(log = false, trans=false)
    private void synchTemplate(String templateName, String paramData, int procactId,String oldTemplateName) throws Exception
    {
        Map<String,String> processItem =
            getReplaceDao().getStrMap(String.format("SELECT PROCACT_ID,ACT_ID FROM WFM_PROCACT WHERE PROCACT_ID=%s", procactId));

        String taskType = "200"; //转码

        if (processItem != null)
        {
            if ("5400".equals(XmlUtil.escapeXml(processItem.get("ACT_ID"))))
                taskType = "400"; //技审
            if ("5201".equals(XmlUtil.escapeXml(processItem.get("ACT_ID"))))
                taskType = "201"; //打包任务
            if ("5210".equals(XmlUtil.escapeXml(processItem.get("ACT_ID")))||"5209".equals(XmlUtil.escapeXml(processItem.get("ACT_ID"))))
                taskType = "210"; //mxf导出
        }else{
            //没保存节点的情况下 根据导入节点的类型去判断导入worker
            if("package".equals(oldTemplateName)){
                taskType = "201"; //打包任务
            }else if("transcode".equals(oldTemplateName)){
                taskType = "200"; //转码
            }else if("mxffile".equals(oldTemplateName)){
                taskType = "210"; //mxf导出
            }else{
                taskType = "400"; //技审
            }
        }
        synchTemplateBusiness(templateName, paramData, taskType,"10");
    }

    /**
     * 抽取同步模板 供业务系统同步 
     * @param templateName
     * @param paramData
     * @param taskType
     * @throws Exception
     */
    @Business(log = false, trans=false)
    public void synchTemplateBusiness(String templateName, String paramData, String taskType,String paramType) throws Exception
    {
        //同步到actor
    	List<Map<String,String>> acotrList = getReplaceDao().getStrMapLst("SELECT HOST_IP,HOST_PORT FROM MTC_SERVER WHERE SERVER_TYPE=2");
        //同步到wfm_server
    	List<Map<String,String>> serverList = getReplaceDao().getStrMapLst("SELECT HOST_IP,HOST_PORT FROM NET_SERVER WHERE SERVER_TYPE=10");
        for (Map<String,String> server : serverList)
        {
            acotrList.add(server);
        }
        String cmdInfo =
            "<paramTemplate><taskType>"
                + taskType
                + "</taskType><taskParam><paramType>"
                + paramType
                +"</paramType><templateName>"
                + templateName
                + "</templateName><paramData>"
                + paramData
                + "</paramData><createDate>"
                + new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date())
                + "</createDate><paramMD5></paramMD5></taskParam></paramTemplate>";

        MtsCmd mtsCmd = new MtsCmd();
        mtsCmd.setCmdType(CmdTypes.TEMPLATE);
        mtsCmd.setCmdInfo(cmdInfo);
        String content = mtsFormat.marshal(mtsCmd);
        String actorURL = "";

        for (Map<String,String> actor : acotrList)
        {
            actorURL = new StringBuffer("http://").append(actor.get("HOST_IP")).append(":").append(actor.get("HOST_PORT")).toString();
            HttpRequest.send(actorURL, content);
        }
    }
    
    
    /**
     * 添加过程
     * 
     * @param processInfo
     * @return
     * @throws Exception
     */
    @Business(log = false)
    public int addProcess(Document document) throws Exception
    {
        int processId = 0;

        Process process = new Process();
        Element root = document.getRootElement();
        if(!getReplaceDao().isExist(ProcessType.class, DBUtil.getECond(ProcessType.PROP_PROC_TYPE, Integer.valueOf(root.selectSingleNode("objType").getText())))){
            throw new Exception("error_not_processType,"+root.selectSingleNode("objType").getText()); 
        }
        process.setProcType(Integer.valueOf(root.selectSingleNode("objType").getText()));
        process.setFlowType(Integer.valueOf(root.selectSingleNode("processType").getText()));
        process.setProcDesc(root.selectSingleNode("description").getText());
        process.setObjType(Integer.valueOf(root.selectSingleNode("cmType").getText()));
        process.setProcState(0);
        process.setProcName(getNewProcessName(root.selectSingleNode("processName").getText(),String.valueOf(process.getProcType())));
        try
        {
        	getReplaceDao().saveBusinessObjs(process);
        	processId = process.getProcId();
        	Procver procver = new Procver();
            procver.setProcId(processId);
            procver.setProcVer(1);
            procver.setCreateTime(new Date());
            getReplaceDao().saveBusinessObjs(procver);
            root.selectSingleNode("processId").setText(String.valueOf(processId));
            saveProcess(document);
        }
        catch (Exception ex)
        {
            ex.printStackTrace();
            throw ex;
        }
        return processId;
    }

    
    /**
     * 添加过程
     * 
     * @param processInfo
     * @return
     * @throws Exception
     */
    @Business(log = false)
    public String createTestProcess(String testProcXml) throws Exception
    {
        ISqlParser sqlParser = getReplaceDao().getSqlParser();
        
        Element root = DocumentHelper.parseText(testProcXml).getRootElement();
        String objCmType = XmlUtil.tryGetItemText(root, "OBJCM_TYPE", "");
        String groupType = XmlUtil.tryGetItemText(root, "GROUP_TYPE", "");
        String procType = XmlUtil.tryGetItemText(root, "PROC_TYPE", "");
        String objType = XmlUtil.tryGetItemText(root, "OBJ_TYPE", "");
        String procName = XmlUtil.tryGetItemText(root, "PROC_NAME", "");
        String procId = XmlUtil.tryGetItemText(root, "PROC_ID", "");
        List<Element> fithList =  root.selectNodes("FILE_PATHS/FILE_PATH");
        
        String cmIndex = getObjSchemaName(Integer.valueOf(objCmType));
        String groupTable = getCMTableName(cmIndex, "_FILEGROUP"); 
        String fileItemTable = getCMTableName(cmIndex, "_FILEITEM");
        String objectTable = getCMTableName(cmIndex, "_OBJECT");
        
        UserProfileInfo uInfo = SpringContextUtil.getBean("userAuth", IUserAuthentication.class).getUserByToken((String) ThreadLocalUtil.get(ThreadLocalUtil.AUTH_HEAD));
        String userName = "";String userId = "";
        if(uInfo!=null){
            userName = uInfo.getUserName();
            userId = uInfo.getUserId();
        }
        //校验文件路径是否正确合法
        for (int i = 0; i < fithList.size(); i++)
        {
            Element fithNode = fithList.get(i);
            String fileItemPath = fithNode.getText();
            File file = new File(fileItemPath);
            if (file.isDirectory())
            {
                throw new Exception("非法文件路径"+fileItemPath);
            }
            if(!file.exists()){
                throw new Exception("文件路径"+fileItemPath+"不存在");
            }
        }
        //保存元数据
        File file = new File(fithList.get(0).getText());
        String fileName = file.getName();
        String name = fileName.substring(0, fileName.lastIndexOf("."));
        String objId = UUID.randomUUID().toString();
        DbCommand dbCommand = new DbCommand(sqlParser, DbCommandType.InsertCommand);
        dbCommand.setTableName(objectTable);
        dbCommand.addField("CMOBJ_ID", objId);
        dbCommand.addField("ROOT_ID", "0");
        dbCommand.addField("CMOBJ_TYPE", 1);
        dbCommand.addField("PARENT_ID", "0");
        dbCommand.addField("IN_POINT", "0");
        dbCommand.addField("NAME", name, SqlParamType.String);
        dbCommand.addField("STATE", 0, SqlParamType.Numeric);
        dbCommand.addField("CREATE_TIME", new Date(), SqlParamType.DateTime);
        dbCommand.addField("UPDATE_TIME", new Date(), SqlParamType.DateTime);
        dbCommand.addField("CREATE_USER", userName, SqlParamType.String);
        dbCommand.addField("UPDATE_USER", userName, SqlParamType.String);
        String objsql = dbCommand.toString();
        getReplaceDao().execute(objsql);
        
        String groupId = UUID.randomUUID().toString();
        dbCommand.getSqlFields().clear();
        dbCommand.setTableName(groupTable);
        dbCommand.addField("GROUP_ID", groupId);
        dbCommand.addField("CMOBJ_ID", objId);
        dbCommand.addField("GROUP_TYPE", groupType, SqlParamType.Numeric);
        dbCommand.addField("IS_ONLINE", 0, SqlParamType.Numeric);
        dbCommand.addField("IS_ARCHIVE", 0, SqlParamType.Numeric);
        dbCommand.addField("CREATE_TIME", new Date(), SqlParamType.DateTime);
        dbCommand.addField("CREATE_USER", userName, SqlParamType.String);
        String groupsql = dbCommand.toString();
        getReplaceDao().execute(groupsql);
        
        for (int i = 0; i < fithList.size(); i++)
        {
            Element fithNode = fithList.get(i);
            String fileItemPath = fithNode.getText();
            File mxfFile = new File(fileItemPath);
            String mxfFileName = mxfFile.getName();
            dbCommand.getSqlFields().clear();
            dbCommand.setTableName(fileItemTable);
            dbCommand.addField("FILE_ID", UUID.randomUUID().toString());
            dbCommand.addField("CMOBJ_ID", objId);
            dbCommand.addField("GROUP_ID", groupId);
            dbCommand.addField("FILE_TYPE", i == 0 ? 1 : 2);
            dbCommand.addField("SOURCE_PATH", StringUtil.trimEnd(file.getParent(), '/', '\\') + "/", SqlParamType.String);
            dbCommand.addField("SOURCE_FILENAME", mxfFileName, SqlParamType.String);
            dbCommand.addField("DEST_PATH", StringUtil.trimEnd(file.getParent(), '/', '\\') + "/", SqlParamType.String);
            dbCommand.addField("DEST_FILENAME", mxfFileName, SqlParamType.String);
            FileInputStream fis = new FileInputStream(mxfFile);
            dbCommand.addField("FILE_SIZE", fis.available(), SqlParamType.Numeric);
            fis.close();
            fis = null;
            String fileitemsql = dbCommand.toString();
            getReplaceDao().execute(fileitemsql);
        }
        createTestFlow(userName,userId,objId,procType,name,objCmType,procName,procId);
        return objId;
    }
    
    
    
    /**
     * 创建测试流程实例
     * @param flowNew
     */
    public void createTestFlow(String userName,String userId,String objId,String procType,String objName,String objType,String procName,String procId) throws Exception
    {
        FmsFlowNew fmsFlowNew = new FmsFlowNew();
        fmsFlowNew.setAutoStart(1);
        fmsFlowNew.setFlowId(Integer.valueOf(procId));
        fmsFlowNew.setFlowName(procName);
        fmsFlowNew.setProcType(Integer.valueOf(procType));
        fmsFlowNew.setObjId(objId);
        fmsFlowNew.setObjType(Integer.parseInt(StringUtil.isNullOrEmpty(objType) ? "0" : objType));
        fmsFlowNew.setObjName(objName);
        fmsFlowNew.setCreateUser(userName);
        fmsFlowNew.setCreateUserId(userId);
//        fmsFlowNew.setNotifyUrl(flowNew.getNotifyUrl());
        FmsAck ack = (FmsAck) fmsFormat.unmarshal(HttpRequestProxy.send(getWFMManagerUrl(), fmsFormat.marshal(fmsFlowNew)));
        if (ack.getStateCode() != 0)
        {
            throw new Exception("创建流程实例错误!");
        }
    }
    
    /**
     * 获取存储对象
     * @return
     * @throws Exception
     */
    protected String getObjSchemaName(int objType) throws Exception{
        Map<String,String> tempObj = getReplaceDao().getStrMap(String.format("SELECT C.SCHEMA_NAME FROM CMP_OBJTYPE C WHERE C.CMOBJ_TYPE=%s",objType));
        if (tempObj == null)
        {
            throw new Exception("未正确匹配存储对象");
        }
        String cmIndex = tempObj.get("SCHEMA_NAME");
        return cmIndex;
    }
    
    
    /**
     * 获取技审模板的内容
     * @param templateName
     * @return
     * @throws Exception
     */
    public String getQcTemplateConfig(String templateName) throws Exception{
        SqlCondition sqlcon =
                new SqlCondition("TEMPLATE_NAME", templateName, SqlLogicType.And, SqlRelationType.Equal, SqlParamType.String);
        List<Map<String,String>> tempObjList = getReplaceDao().getStrMapLst(Actparam.class,sqlcon);
        String paramData = "";
        if(tempObjList!=null&&tempObjList.size()>0){
            paramData = new String(Base64.decodeBase64(tempObjList.get(0).get("PARAM_DATA").getBytes()));
        }
        return paramData;
    }
    
    
    /**
     * @param cmIndex
     * @param endStr
     * @return
     * @throws Exception
     */
    private String getCMTableName(String cmIndex, String endStr) throws Exception
    {
        if (!StringUtil.isNullOrEmpty(cmIndex))
        {
            return cmIndex + endStr;
        }
        throw new Exception("未配置业务CM表前缀");
    }
    
    
    /**
     * 获取流程服务器HTTP地址
     * @return
     * @throws Exception 
     * @throws SQLException
     */
    private String getWFMManagerUrl() throws Exception
    {
        String requestUrl = null;
        Map<String,String> wfmServer = getReplaceDao().getStrMap(String.format("SELECT HOST_IP,HOST_PORT FROM NET_SERVER WHERE SERVER_TYPE=10 AND WORK_MODE=1"));

        if (wfmServer != null)
        {
            requestUrl = new StringBuffer("http://").append(wfmServer.get("HOST_IP")).append(":").append(wfmServer.get("HOST_PORT")).toString();
        }
        else
        {
            throw new Exception("未找到流程服务器信息");
        }

        return requestUrl;
    }

    
}
