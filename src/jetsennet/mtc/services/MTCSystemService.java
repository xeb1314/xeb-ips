package jetsennet.mtc.services;


import java.io.File;
import java.io.StringWriter;

import javax.jws.WebService;
import javax.ws.rs.FormParam;
import javax.ws.rs.POST;
import javax.ws.rs.Path;

import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.dom4j.io.OutputFormat;
import org.dom4j.io.SAXReader;
import org.dom4j.io.XMLWriter;

import jetsennet.frame.service.BaseService;
import jetsennet.mtc.business.MtsBusiness;
import jetsennet.mtc.business.TaskBusiness;
import jetsennet.net.WSResult;

/**
 * 
 */
@Path("/MTCSystemService")
@WebService(name = "/MTCSystemService")
public class MTCSystemService extends BaseService
{
    
    private MtsBusiness mtsBusiness;
    private TaskBusiness taskBusiness;
    
    @javax.jws.WebMethod(exclude = true)
    public MtsBusiness getMtsBusiness() {
		return mtsBusiness;
	}
    
    @javax.jws.WebMethod(exclude = true)
	public void setMtsBusiness(MtsBusiness mtsBusiness) {
		this.mtsBusiness = mtsBusiness;
	}
    
    @javax.jws.WebMethod(exclude = true)
    public TaskBusiness getTaskBusiness() {
		return taskBusiness;
	}
    @javax.jws.WebMethod(exclude = true)
	public void setTaskBusiness(TaskBusiness taskBusiness) {
		this.taskBusiness = taskBusiness;
	}
    
    /**
     * 获取Worker列表
     * @param serverType
     * @param serverId
     * @param actorUrl
     * @return
     * @throws Exception 
     */
    @POST
    @Path("/getServerWorkerState")
    public WSResult getServerWorkerState(@FormParam("serverXML") String serverXML) throws Exception
    {
    	return getResult(mtsBusiness.getWorkerStateByServer(serverXML));
    }
    

    /**
    * 从缓存里面加载worker状态
    * @param serverXML
    * @return
    * @throws Exception
    */
    @POST
    @Path("/getAllWorkerStateFromCache")
    public WSResult getAllWorkerStateFromCache(@FormParam("serverXML") String serverXML) throws Exception
    {
        return getResult(mtsBusiness.getAllWorkerStateFromCache(serverXML));
    }
    
    /**
	 * 获取Actor状态
	 * @param actorUrl
	 * @return
	 */
    @POST
    @Path("/getActorState")
	public WSResult getActorState(@FormParam("id") String id,@FormParam("url") String url) throws Exception
	{
    	return getResult(mtsBusiness.getActorState(id, url));
	}
    
    /**
	 * 停止Worker
	 * @param 
	 * @return
     * @throws Exception 
	 */
    @POST
    @Path("/stopWorker")
	public WSResult stopWorker(@FormParam("workerID") String workerID,@FormParam("actorID") String actorID,@FormParam("actorURL") String actorURL) throws Exception
	{
    	return getResult(mtsBusiness.stopWorker(workerID, actorID, actorURL));	
	}
	
	/**
	 * 启动Worker
	 * @param 
	 * @return
	 * @throws Exception 
	 */
    @POST
    @Path("/startWorker")
	public WSResult startWorker(@FormParam("workerID") String workerID,@FormParam("actorID") String actorID,@FormParam("actorURL") String actorURL) throws Exception
	{
    	return getResult(mtsBusiness.startWorker(workerID, actorID, actorURL));	
	}
    
	/**
	 * 启动actor
	 * @param 
	 * @return
	 * @throws Exception 
	 */
    @POST
    @Path("/startActor")
	public WSResult startActor(@FormParam("actorID") String actorID,@FormParam("actorURL") String actorURL) throws Exception
	{
    	return getResult(mtsBusiness.startActor(actorID, actorURL));	
	}
    
	/**
	 * 停止actor
	 * @param 
	 * @return
	 * @throws Exception 
	 */
    @POST
    @Path("/stopActor")
	public WSResult stopActor(@FormParam("actorID") String actorID,@FormParam("actorURL") String actorURL) throws Exception
	{
    	return getResult(mtsBusiness.stopActor(actorID, actorURL));	
	}
    
    
    /**
	 * 获取actor参数配置
     * @throws Exception 
	 * 
	 */
    @POST
    @Path("/getActorConfig")
	public WSResult getActorConfig(@FormParam("actorID") String actorID,@FormParam("actorURL") String actorURL) throws Exception
	{
        return getResult(mtsBusiness.getActorConfigFromCache(actorID, actorURL));
	}
	
	/**
	 *保存worker参数配置
	 * @throws Exception 
	 */
    @POST
    @Path("/saveWorkerConfig")
	public WSResult saveWorkerConfig(@FormParam("actorID") String actorID,@FormParam("actorURL") String actorURL,@FormParam("cmdInfo") String cmdInfo) throws Exception
	{
    	return getResult(mtsBusiness.saveWorkerConfig(actorID, actorURL, cmdInfo));
	}
	
	/**
	 *修改Task优先级
	 * @throws Exception 
	 * 
	 */
    @POST
    @Path("/modifyTaskLevel")
	public WSResult modifyTaskLevel(@FormParam("taskId") String taskId,@FormParam("taskLevel") String taskLevel) throws Exception
	{
    	return getResult(mtsBusiness.modifyTaskLevel(taskId, taskLevel));
	}
	
	/**
	 *删除Task
	 * @throws Exception 
	 * 
	 */
    @POST
    @Path("/deleteTask")
	public WSResult deleteTask(@FormParam("taskId") String taskId) throws Exception
	{
    	return getResult(mtsBusiness.deleteTask(taskId));
	}
    
    
    /**
	 * 统计流程任务延时
	 * @param token
	 * @param request
	 * @return
	 */
    @POST
    @Path("/mtcGetTaskStatistics")
    public WSResult mtcGetTaskStatistics(@FormParam("objXml") String objXml) throws Exception
    {
    	return getResult(taskBusiness.statisticsTask(objXml));
    }
    
    
    /**
     * 技审结果查看
     * @param UQCXml
     * @return
     * @throws Exception
     */
    @POST
    @Path("/getUQCResult")
    public WSResult getUQCResult(@FormParam("UQCXml") String UQCXml) throws Exception
    {
        WSResult resultVal = new WSResult();
        String filePath = "";
        try
        {
            Element root = DocumentHelper.parseText(UQCXml).getRootElement();
            filePath = root.getText();
            SAXReader reader = new SAXReader();
            Document doc = reader.read(new File(filePath));
            String requestXML = null;  
            XMLWriter writer = null;  
            if (doc != null) {  
                try {  
                    StringWriter stringWriter = new StringWriter();  
                    OutputFormat format = new OutputFormat(" ", true);  
                    writer = new XMLWriter(stringWriter, format);  
                    writer.write(doc);  
                    writer.flush();  
                    requestXML = stringWriter.getBuffer().toString();  
                } finally {  
                    if (writer != null) {  
                        writer.close();  
                    }  
                }  
            }  
            resultVal = getResult(requestXML);
        }
        catch (Exception e)
        {
        }
        return resultVal;
    }
}
