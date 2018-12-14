package jetsennet.wfm.services;


import java.io.File;

import javax.jws.WebService;
import javax.ws.rs.FormParam;
import javax.ws.rs.POST;
import javax.ws.rs.Path;

import org.apache.commons.codec.binary.Base64;
import org.dom4j.Document;
import org.dom4j.io.SAXReader;

import jetsennet.frame.service.BaseService;
import jetsennet.net.WSResult;
import jetsennet.util.FileAccess;
import jetsennet.util.PathUtil;
import jetsennet.wfm.business.FlowProcessBusiness;
import jetsennet.wfm.business.FlowStatisticsBusiness;
import jetsennet.wfm.business.ProcessBusiness;

/**
 * 
 */
@Path("/WFMSystemService")
@WebService(name = "/WFMSystemService")
public class WFMSystemService extends BaseService
{
	
	private ProcessBusiness processBusiness;
	private FlowProcessBusiness flowProcessBusiness;
	private FlowStatisticsBusiness flowStatisticsBusiness;
	
	/**
     * 更新流程结构信息
     * 
     * @param token
     * @param flowXml
     * @return
	 * @throws Exception 
     */
	@POST
    @Path("/saveProcess")
    public WSResult saveProcess(@FormParam("processXml") String processXml) throws Exception
    {
		return getResult(processBusiness.saveProcess(processXml));
    }

    /**
     * 获取流程结构信息
     * 
     * @param token
     * @param flowXml
     * @return
     */
	@POST
    @Path("/getProcess")
    public WSResult getProcess(@FormParam("procId") String procId,@FormParam("procVer") String procVer) throws Exception
    {
		return getResult(processBusiness.getProcess(Integer.parseInt(procId),procVer));
    }

    /**
     * 更新工作流程状态
     * 
     * @param token
     * @param procId
     * @param objType
     * @param processState
     * @return
     */
	@POST
    @Path("/activeProcess")
    public WSResult activeProcess(@FormParam("procId") String procId,@FormParam("objType") String objType,@FormParam("state") String state) throws Exception
    {
		flowProcessBusiness.activeProcess(Integer.valueOf(procId) , Integer.valueOf(objType), Integer.valueOf(state));
		return getResult("");
    }

    /**
     * 导出流程
     * 
     * @param token
     * @param flowXml
     *        流程xml内容
     * @param xmlFileName
     *        导出文件名称
     * @return
     */
	@POST
    @Path("/exportProcess")
    public WSResult exportProcess(@FormParam("processXml") String processXml,@FormParam("fileName") String fileName) throws Exception
    {
        String tempPath = System.getProperty("java.io.tmpdir");
        String os = System.getProperty("os.name");
        if (os != null && os.startsWith("Windows"))
        {
            if (!tempPath.endsWith("\\"))
            {
                tempPath = tempPath + "\\" + fileName;
            }
            else
            {
                tempPath = tempPath + fileName;
            }
        }
        else
        {
            if (!tempPath.endsWith("/"))
            {
                tempPath = tempPath + "/" + fileName;
            }
            else
            {
                tempPath = tempPath + fileName;
            }
        }
        FileAccess.saveFile(tempPath, processXml);
        return getResult(tempPath);
    
    }

    /**
     * 取得设计指派规则资料
     * 
     * @return
     */
	@POST
    @Path("/getTaskAssignRule")
    public WSResult getTaskAssignRule() throws Exception
    {
		return getResult(new FlowProcessBusiness().reqAssignRule());
    }

    /**
     * 保存模板
     * @param token
     * @param procactId
     * @param templateData
     * @return
     */
	@POST
    @Path("/saveTemplate")
    public WSResult saveTemplate(@FormParam("procactId") String procactId,@FormParam("templateData") String templateData,@FormParam("templateName") String templateName) throws Exception
    {
        return getResult(String.valueOf(processBusiness.saveTemplate(Integer.valueOf(procactId), new String(Base64.encodeBase64(templateData.getBytes())), templateName)));
    }

    /**
     * 统计流程任务延时
     * @param token
     * @param request
     * @return
     */
	@POST
    @Path("/taskStatistics")
    public WSResult taskStatistics(@FormParam("query") String query) throws Exception
    {
		return getResult(flowStatisticsBusiness.statisticsTaskdelay(query));
    }
	
	
	/**
	 * 复制获取最新流程名称
	 * @param procName
	 * @param procType
	 * @return
	 * @throws Exception
	 */
	@POST
	@Path("/getNewProcessName")
	public WSResult getNewProcessName(@FormParam("procName") String procName,@FormParam("procType") String procType) throws Exception
	{
	    return getResult(processBusiness.getNewProcessName(procName, procType));
	}

    /**
     * 获取流程节点配置项
     * @param token
     * @param request
     * @return
     */
	@POST
    @Path("/getActConfig")
    public WSResult getActConfig(@FormParam("actId") String actId)
    {
	    WSResult resultVal = new WSResult();
	    String filePath = "";
        try
        {
            filePath = PathUtil.getWebRoot() + "actcfg/" + actId + ".xml";
            SAXReader reader = new SAXReader();
            Document doc = reader.read(new File(filePath));
            resultVal = getResult(doc.getRootElement().asXML());
        }
        catch (Exception e)
        {
//            resultVal.errorCode = -1;
//            resultVal.errorString = "未找到路径"+filePath;
        }
        return resultVal;
    }
	
	
	/**
	 * 获取技审模板的内容
	 * @param templateName
	 * @return
	 * @throws Exception 
	 */
	@POST
	@Path("/getQcTemplateConfig")
	public WSResult getQcTemplateConfig(@FormParam("templateName") String templateName) throws Exception
	{
	    return getResult(processBusiness.getQcTemplateConfig(templateName));
	}
	
	
	/**
	 * 创建试用流程
	 * @param testProcXml
	 * @return
	 * @throws Exception
	 */
	@POST
    @Path("/createTestProc")
    public WSResult createTestProc(@FormParam("testProcXml") String testProcXml) throws Exception
    {
        return getResult(processBusiness.createTestProcess(testProcXml));
    }
    
    @javax.jws.WebMethod(exclude = true)
	public ProcessBusiness getProcessBusiness() {
		return processBusiness;
	}
	@javax.jws.WebMethod(exclude = true)
	public void setProcessBusiness(ProcessBusiness processBusiness) {
		this.processBusiness = processBusiness;
	}
	
	@javax.jws.WebMethod(exclude = true)
	public FlowProcessBusiness getFlowProcessBusiness() {
		return flowProcessBusiness;
	}
	
	@javax.jws.WebMethod(exclude = true)
	public void setFlowProcessBusiness(FlowProcessBusiness flowProcessBusiness) {
		this.flowProcessBusiness = flowProcessBusiness;
	}
	
	@javax.jws.WebMethod(exclude = true)
	public FlowStatisticsBusiness getFlowStatisticsBusiness() {
		return flowStatisticsBusiness;
	}
	@javax.jws.WebMethod(exclude = true)
	public void setFlowStatisticsBusiness(
			FlowStatisticsBusiness flowStatisticsBusiness) {
		this.flowStatisticsBusiness = flowStatisticsBusiness;
	}
	
}
