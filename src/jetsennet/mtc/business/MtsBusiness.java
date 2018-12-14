package jetsennet.mtc.business;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.ListIterator;
import java.util.Map;
import java.util.Map.Entry;

import jetsennet.frame.business.BaseBusiness;
import jetsennet.frame.business.Business;
import jetsennet.jmtc.CmdTypes;
import jetsennet.jmtc.IMtsFormat;
import jetsennet.jmtc.MtsHeader;
import jetsennet.jmtc.MtsObjectFactory;
import jetsennet.jmtc.TaskActorInfo;
import jetsennet.jmtc.TaskWorkerInfo;
import jetsennet.jmtc.command.ICommand;
import jetsennet.jmtc.command.MtsAck;
import jetsennet.jmtc.command.MtsActorState;
import jetsennet.jmtc.command.MtsActorView;
import jetsennet.jmtc.command.MtsCmd;
import jetsennet.jmtc.command.MtsReqActorState;
import jetsennet.jmtc.command.MtsReqActorView;
import jetsennet.jmtc.command.MtsTaskDelete;
import jetsennet.jmtc.command.MtsTaskModify;
import jetsennet.mtc.DataRepository;
import jetsennet.mtc.schema.Server;
import jetsennet.util.HttpRequest;
import jetsennet.util.SerializerUtil;
import jetsennet.util.StringUtil;
import jetsennet.util.XmlUtil;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.apache.log4j.Logger;
import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.dom4j.Node;

public class MtsBusiness extends BaseBusiness{

	private static final Logger logger = Logger.getLogger(MtsBusiness.class);
    private static final IMtsFormat mtsFormat = MtsObjectFactory.createMtsFormat();
	private  String managerUrl;
	
	/**
	 * 转发MTS消息
	 * @param mtsMessage
	 * @return
	 */
    @Business(log = false, auth = false, trans = false)
	public String mtsMessage(String mtsMessage)
	{
		try
		{
			String managerURL = getManageUrl();
            return HttpRequest.send(managerURL, mtsMessage);
		}
		catch(Exception ex)
		{
			MtsAck ack = new MtsAck();
			ack.setStateCode(-1);
			ack.setStateDesc(ex.getMessage());
			return mtsFormat.marshal(ack);
		}
	}
	
	/**
	 * 获取Actor状态(单个actor)
	 * @param actorId
	 * @param actorUrl
	 * @return
	 * @throws Exception
	 */
    @Business(log = false, auth = false, trans = false)
	public String getActorState(String actorId,String actorUrl) throws Exception
	{	
		MtsReqActorState mtsActorState = new MtsReqActorState();
		mtsActorState.setActorID(actorId);
		
		String content = mtsFormat.marshal(mtsActorState);
		
		ICommand result = mtsFormat.unmarshal(HttpRequest.send(actorUrl, content));
		if(result.isAck())
		{
			throw new Exception(((MtsAck)result).getStateDesc());
		}		
		
		MtsActorState command = (MtsActorState)result;
		TaskActorInfo actorInfo = command.getActorInfo();
		StringBuilder actors = new StringBuilder();		
		
		actors.append("{");
		actors.append(serializeJson("actorID",actorInfo.getActorID()));
		actors.append(",");
		actors.append(serializeJson("actorName",actorInfo.getActorName()));
		actors.append(",");
		actors.append(serializeJson("actorIP",actorInfo.getActorIP()));
		actors.append(",");
		actors.append(serializeJson("actorState",actorInfo.getActorState()));
		actors.append(",");
		actors.append(serializeJson("actorURL",actorUrl));
		actors.append(",");
		actors.append(serializeJson("startTime",actorInfo.getStartTime()));
		actors.append(",");
		actors.append(serializeJson("currTime",actorInfo.getCurrTime()));
		actors.append(",");
		actors.append(serializeJson("usedCPU",actorInfo.getUsedCPU()));
		actors.append(",");
		actors.append(serializeJson("usedMemory",actorInfo.getUsedMemory()));
		actors.append(",\"worker\":[");
		
		// 获取worker列表
		List<TaskWorkerInfo> workerList = actorInfo.getWorkers();
		Collections.sort(workerList);
		
		int windex = 0;
		
		for (TaskWorkerInfo workerInfo : workerList)
		{			
			if(windex>0)
			{
				actors.append(",");
			}
			
			actors.append("{");
			
			actors.append(serializeJson("workerID",workerInfo.getWorkerID()));
			actors.append(",");
			actors.append(serializeJson("workerName",workerInfo.getWorkerName()));
			actors.append(",");
			actors.append(serializeJson("taskType",workerInfo.getTaskType()));				
			actors.append(",");			
			actors.append(serializeJson("workerState",workerInfo.getWorkerState()));
			actors.append(",");			
			actors.append(serializeJson("taskStartTime",workerInfo.getTaskStartTime()));
			actors.append(",");			
			actors.append(serializeJson("stateDesc",workerInfo.getStateDesc()));		
			
			actors.append("}");
			
			windex++;
		}
		
		actors.append("]");
		actors.append("}");			
		return actors.toString();
	}
	
    /**
     * 从缓存里面加载所有执行器的 worker状态
     * @return
     * @throws Exception
     */

    @Business(log = false, auth = false, trans = false)
    public String getAllWorkerStateFromCache(String serverXml) throws Exception
    {
        Element root = DocumentHelper.parseText(serverXml).getRootElement();
        List<Element> serverELst = root.elements("SERVER");
        List<Server> serverLst = new ArrayList<Server>();

        JSONObject workersJson = new JSONObject();
        Map<String, JSONObject> actroInfoMap = new HashMap<String, JSONObject>();
        Map<Integer, Collection<JSONObject>> workerInfoMap = new HashMap<Integer, Collection<JSONObject>>();

        for (Element serverE : serverELst)
        {
            Server server = SerializerUtil.deserialize(Server.class, serverE);
            serverLst.add(server);
        }

        if (serverLst.size() == 0)
        {
            return "";
        }

        Map<String, String> resultMap = DataRepository.getWorkerStates(serverLst);

        for (Entry<String, String> entry : resultMap.entrySet())
        {
            String hostIp = entry.getKey();
            JSONObject workerJson = JSONObject.fromObject(entry.getValue());
            if (workerJson.has(hostIp))
            {
                actroInfoMap.put(hostIp, workerJson.getJSONObject(hostIp));
            }
            if (workerJson.has("workerList") && !workerJson.getJSONArray("workerList").isEmpty())
            {
                JSONArray worksARR = workerJson.getJSONArray("workerList");
                ListIterator<JSONObject> listIterator = worksARR.listIterator();
                while (listIterator.hasNext())
                {
                    JSONObject vWorkerTypeObj = listIterator.next();
                    int type = vWorkerTypeObj.getInt("type");
                    Collection<JSONObject> workColl = JSONArray.toCollection((vWorkerTypeObj.getJSONArray("worker")));
                    Collection<JSONObject> vWorkColl = workerInfoMap.get(type);
                    if (vWorkColl == null)
                    {
                        workerInfoMap.put(type, workColl);
                    }
                    else
                    {
                        vWorkColl.addAll(workColl);
                    }
                }
            }
        }

        for (Entry<String, JSONObject> entry : actroInfoMap.entrySet())
        {
            workersJson.accumulate(entry.getKey(), entry.getValue());
        }


        for (Entry<String, JSONObject> entry : actroInfoMap.entrySet())
        {
            workersJson.accumulate(entry.getKey(), entry.getValue());
        }

        JSONArray workersArr = new JSONArray();
        for (Entry<Integer, Collection<JSONObject>> entry : workerInfoMap.entrySet())
        {
            JSONObject workerObj = new JSONObject();
            workerObj.put("type", entry.getKey());
            workerObj.put("worker", entry.getValue());
            workersArr.add(workerObj);
        }
        workersJson.put("workerList", workersArr);
        return workersJson.toString();
    }

	/**
	 * 获取worker状态(所有worker，以type分组)
	 * @param actorList
	 * @return
	 * @throws Exception
	 */

    @Business(log = false, auth = false, trans = false)
    public String getWorkerState(String actorList) throws Exception
    {
        Document doc = DocumentHelper.parseText(actorList);
        List<Node> actors = doc.getRootElement().elements();
        MtsReqActorState mtsActorState = new MtsReqActorState();
        HashMap<Integer, List<TaskWorkerInfo>> typeMap = new HashMap<Integer, List<TaskWorkerInfo>>();
        StringBuilder workers = new StringBuilder();
        workers.append("{");

        int actorIndex = 0;

        for (Node actor : actors)
        {
            String actorId = XmlUtil.tryGetItemText(actor, "id", "");
            String actorURL = XmlUtil.tryGetItemText(actor, "url", "");
            mtsActorState.setActorID(actorId);

            String content = mtsFormat.marshal(mtsActorState);
            try
            {
                ICommand result = mtsFormat.unmarshal(HttpRequest.send(actorURL, content));

                if (result.isAck())
                {
                    continue;
                }

                MtsActorState command = (MtsActorState) result;
                TaskActorInfo actorInfo = command.getActorInfo();
                List<TaskWorkerInfo> workerList = actorInfo.getWorkers();

                if (actorIndex > 0)
                {
                    workers.append(",");
                }

                workers.append("\"" + actorInfo.getActorID() + "\":");
                workers.append("{");
                workers.append(serializeJson("actorURL", actorURL));
                workers.append(",");
                workers.append(serializeJson("actorState", actorInfo.getActorState()));
                workers.append(",");
                workers.append(serializeJson("actorIP", actorInfo.getActorIP()));
                workers.append(",");
                workers.append(serializeJson("actorName", actorInfo.getActorName()));
                workers.append("}");

                for (TaskWorkerInfo worker : workerList)
                {
                    //临时用WorkerPath存ID
                    worker.setWorkerPath(actorInfo.getActorID());

                    if (!typeMap.containsKey(worker.getTaskType()))
                    {
                        typeMap.put(worker.getTaskType(), new ArrayList<TaskWorkerInfo>());
                    }
                    typeMap.get(worker.getTaskType()).add(worker);
                }

                actorIndex++;
            }
            catch (Exception e)
            {
            }
        }

        if (actorIndex > 0)
        {
            workers.append(",");
        }

        workers.append("\"workerList\":[");
        int tindex = 0;

        for (int typeId : typeMap.keySet())
        {
            if (tindex > 0)
            {
                workers.append(",");
            }

            workers.append("{\"type\":" + typeId + "");
            workers.append(",\"worker\":[");

            List<TaskWorkerInfo> workerList = typeMap.get(typeId);
            int windex = 0;

            for (TaskWorkerInfo workerInfo : workerList)
            {
                if (windex > 0)
                {
                    workers.append(",");
                }

                workers.append("{");
                workers.append(serializeJson("workerID", workerInfo.getWorkerID()));
                workers.append(",");
                workers.append(serializeJson("workerName", workerInfo.getWorkerName()));
                workers.append(",");
                workers.append(serializeJson("workerState", workerInfo.getWorkerState()));
                workers.append(",");
                workers.append(serializeJson("actorID", workerInfo.getWorkerPath()));
                workers.append(",");
                workers.append(serializeJson("taskStartTime", workerInfo.getTaskStartTime()));
                workers.append(",");
                workers.append(serializeJson("stateDesc", workerInfo.getStateDesc()));
                workers.append("}");

                windex++;
            }
            workers.append("]}");
            tindex++;
        }
        workers.append("]}");
        return workers.toString();
	}
    
    /**
     * 获取worker状态
     * @param serverXML		server的xml结构
     * @return
     * @throws Exception
     */
    @Business(log = false, auth = false, trans = false)
    public String getWorkerStateByServer(String serverXML) throws Exception 
    {
    	Server server = SerializerUtil.deserialize(Server.class, serverXML);
        return DataRepository.getWorkerState(server);
    }
    
    

    @Business(log = false, auth = false, trans = false)
    public String getAllWorkerState(String managerList) throws Exception
    {
        Document doc = DocumentHelper.parseText(managerList);
        List<Node> managers = doc.getRootElement().elements();    
        MtsReqActorView mtsReqActorView = new MtsReqActorView();
        HashMap<Integer,List<TaskWorkerInfo>> typeMap = new HashMap<Integer,List<TaskWorkerInfo>>(); 
        StringBuilder workers = new StringBuilder();
        workers.append("{");
        
        int actorIndex = 0;
        for(Node manager : managers)
        {                       
            String managerURL = XmlUtil.tryGetItemText(manager, "url", "");
            String content = mtsFormat.marshal(mtsReqActorView);  
            try
            {
                ICommand result = mtsFormat.unmarshal(HttpRequest.send(managerURL, content));
                
                if(result.isAck())
                {
                    continue;
                }       
                
                MtsActorView command = (MtsActorView)result;
                List<TaskActorInfo> actorInfoList = command.getActorList();
                for (TaskActorInfo actorInfo: actorInfoList)
                {
                    List<TaskWorkerInfo> workerList = actorInfo.getWorkers();
                    if(actorIndex>0)
                    {
                        workers.append(",");
                    }
                    workers.append("\""+actorInfo.getActorID()+"\":");
                    workers.append("{");
                    workers.append(serializeJson("actorURL",actorInfo.getActorURL()));
                    workers.append(",");
                    workers.append(serializeJson("actorState",actorInfo.getActorState()));
                    workers.append(",");
                    workers.append(serializeJson("actorIP",actorInfo.getActorIP()));
                    workers.append(",");
                    workers.append(serializeJson("actorName",actorInfo.getActorName()));        
                    workers.append("}");
                    for(TaskWorkerInfo worker: workerList)
                    {   
                        //临时用WorkerPath存ID
                        worker.setWorkerPath(actorInfo.getActorID());               
                        
                        if(!typeMap.containsKey(worker.getTaskType()))
                        {
                            typeMap.put(worker.getTaskType(), new ArrayList<TaskWorkerInfo>());                                 
                        }
                        typeMap.get(worker.getTaskType()).add(worker);
                    }
                    actorIndex++;
                }
            }
            catch (Exception e)
            {
            }
        }
                
        if(actorIndex>0)
        {
            workers.append(",");
        }
        workers.append("\"workerList\":[");
        int tindex = 0;
        for(int typeId: typeMap.keySet())
        {
            if(tindex>0)
            {
                workers.append(",");
            }
            
            workers.append("{\"type\":"+typeId+"");         
            workers.append(",\"worker\":[");            
        
            List<TaskWorkerInfo> workerList = typeMap.get(typeId);      
            int windex = 0;
            
            for (TaskWorkerInfo workerInfo : workerList)
            {
                if(windex>0)
                {
                    workers.append(",");
                }
                
                workers.append("{");                
                workers.append(serializeJson("workerID",workerInfo.getWorkerID()));
                workers.append(",");
                workers.append(serializeJson("workerName",workerInfo.getWorkerName()));
                workers.append(",");                                
                workers.append(serializeJson("workerState",workerInfo.getWorkerState()));
                workers.append(",");                
                workers.append(serializeJson("actorID",workerInfo.getWorkerPath()));                
                workers.append(",");
                workers.append(serializeJson("taskStartTime",workerInfo.getTaskStartTime()));               
                workers.append(",");
                workers.append(serializeJson("stateDesc",workerInfo.getStateDesc()));   
                workers.append("}");
                
                windex++;
            }
            workers.append("]}");
            tindex++;
        }
        workers.append("]}");   
        return workers.toString();
    }
    
    
    /**
	 * 停止Worker
	 * @param workerID
	 * @param actorID
	 * @param actorURL
	 * @return
	 * @throws Exception
	 */

    @Business(log = false, trans=false)
	public String stopWorker(String workerID,String actorID,String actorURL) throws Exception
	{
		MtsCmd mtsCmd = new MtsCmd();
		MtsHeader headerType = new MtsHeader();
		headerType.setWorkerID(workerID);
		headerType.setActorID(actorID);
		mtsCmd.setHeader(headerType);
		mtsCmd.setCmdType(CmdTypes.UNLOAD);
		String content = mtsFormat.marshal(mtsCmd);
		MtsAck ack= (MtsAck)mtsFormat.unmarshal(HttpRequest.send(actorURL, content));
		
        if (ack.getStateCode() != 0)
        {
            throw new Exception(ack.getStateDesc());
        }

		return String.valueOf(ack.getStateCode());
	}
	
	/**
	 * 启动Worker
	 * @param workerID
	 * @param actorID
	 * @param actorURL
	 * @return
	 * @throws Exception
	 */

    @Business(log = false, trans=false)
	public String startWorker(String workerID,String actorID,String actorURL) throws Exception
	{
		MtsCmd mtsCmd = new MtsCmd();
		MtsHeader headerType = new MtsHeader();
		headerType.setWorkerID(workerID);
		headerType.setActorID(actorID);
		mtsCmd.setHeader(headerType);
		mtsCmd.setCmdType(CmdTypes.LOAD);
		String content = mtsFormat.marshal(mtsCmd);
		MtsAck ack= (MtsAck)mtsFormat.unmarshal(HttpRequest.send(actorURL, content));
		
        if (ack.getStateCode() != 0)
        {
            throw new Exception(ack.getStateDesc());
        }

		return String.valueOf(ack.getStateCode());
	}
	
	/**
	 * 启动actor
	 * @param actorID
	 * @param actorURL
	 * @return
	 * @throws Exception
	 */

    @Business(log = false, trans=false)
	public String startActor(String actorID,String actorURL) throws Exception
	{
		MtsCmd mtsCmd = new MtsCmd();
		MtsHeader headerType = new MtsHeader();
		headerType.setActorID(actorID);
		mtsCmd.setHeader(headerType);
		mtsCmd.setCmdType(CmdTypes.START);
		String content = mtsFormat.marshal(mtsCmd);
		MtsAck ack= (MtsAck)mtsFormat.unmarshal(HttpRequest.send(actorURL, content));
		
        if (ack.getStateCode() != 0)
        {
            throw new Exception(ack.getStateDesc());
        }

		return String.valueOf(ack.getStateCode());
	}
	
	/**
	 * 停止actor
	 * @param actorID
	 * @param actorURL
	 * @return
	 * @throws Exception
	 */

    @Business(log = false, trans=false)
	public String stopActor(String actorID,String actorURL) throws Exception
	{
		MtsCmd mtsCmd = new MtsCmd();
		MtsHeader headerType = new MtsHeader();
		headerType.setActorID(actorID);
		mtsCmd.setHeader(headerType);
		mtsCmd.setCmdType(CmdTypes.STOP);
		String content = mtsFormat.marshal(mtsCmd);
		MtsAck ack= (MtsAck)mtsFormat.unmarshal(HttpRequest.send(actorURL, content));
		
        if (ack.getStateCode() != 0)
        {
            throw new Exception(ack.getStateDesc());
        }

		return String.valueOf(ack.getStateCode());
	}
    
    /**
     * 获取actor参数配置
     * @param actorID
     * @param actorURL
     * @return
     * @throws Exception
     */
    @Business(log = false, auth = false, trans = false)
    public String getActorConfigFromCache(String actorID, String actorURL) throws Exception
    {
        return DataRepository.getActorInfo(actorID, actorURL);
    }

    /**
     * 获取actor参数配置
     * @param actorID
     * @param actorURL
     * @return
     * @throws Exception
     */
    @Business(log = false, auth = false, trans = false)
	public String getActorConfig(String actorID,String actorURL) throws Exception
	{
		MtsCmd mtsCmd = new MtsCmd();
		MtsHeader headerType = new MtsHeader();
		headerType.setActorID(actorID);
		mtsCmd.setHeader(headerType);
		mtsCmd.setCmdType(CmdTypes.READ_CFG);
		String content = mtsFormat.marshal(mtsCmd);
		ICommand result = mtsFormat.unmarshal(HttpRequest.send(actorURL, content));
		if(result.isAck())
		{
			throw new Exception(((MtsAck)result).getStateDesc());
		}
		return ((MtsCmd)result).getCmdInfo();
	}
	
	/**
	 * 保存worker参数配置
	 * @param actorID
	 * @param actorURL
	 * @param cmdInfo
	 * @return
	 * @throws Exception
	 */
    @Business(log = false, trans = false)
	public String saveWorkerConfig(String actorID,String actorURL,String cmdInfo) throws Exception
	{
		MtsCmd mtsCmd = new MtsCmd();
		MtsHeader headerType = new MtsHeader();
		headerType.setActorID(actorID);
		mtsCmd.setHeader(headerType);
		mtsCmd.setCmdType(CmdTypes.WRITE_CFG);
		mtsCmd.setCmdInfo(cmdInfo);
		String content = mtsFormat.marshal(mtsCmd);
		MtsAck ack = (MtsAck)mtsFormat.unmarshal(HttpRequest.send(actorURL, content));
		
        if (ack.getStateCode() != 0)
        {
            throw new Exception(ack.getStateDesc());
        }

		return String.valueOf(ack.getStateCode());
	}
	
	/**
	 * 修改Task优先级
	 * @param taskId
	 * @param taskLevel
	 * @return
	 * @throws Exception
	 */

    @Business(log = false, trans=false)
	public String modifyTaskLevel(String taskId,String taskLevel) throws Exception
	{
		MtsTaskModify mtsTask = new MtsTaskModify();
		mtsTask.setTaskId(taskId);
		mtsTask.setTaskLevel(Integer.parseInt(taskLevel));
		String content = mtsFormat.marshal(mtsTask);
		String managerURL = getManageUrl();
		MtsAck ack = (MtsAck)mtsFormat.unmarshal(HttpRequest.send(managerURL, content));
		
        if (ack.getStateCode() != 0)
        {
            throw new Exception(ack.getStateDesc());
        }

		return String.valueOf(ack.getStateCode());
	}
	
	/**
	 * 
	 * @param taskId
	 * @return
	 * @throws Exception
	 */

    @Business(log = false, trans=false)
	public String deleteTask(String taskId) throws Exception
	{
		MtsTaskDelete mtsTask = new MtsTaskDelete();
		mtsTask.setTaskId(taskId);
		String content = mtsFormat.marshal(mtsTask);
		String managerURL = getManageUrl();
		MtsAck ack = (MtsAck)mtsFormat.unmarshal(HttpRequest.send(managerURL, content));
		
        if (ack.getStateCode() != 0)
        {
            throw new Exception(ack.getStateDesc());
        }

		return String.valueOf(ack.getStateCode());
	}
    
    
    /**
	 * JSON序列化
	 * @param name
	 * @param value
	 * @return
	 */
	private String serializeJson(String name,String value)
	{
		return String.format("\"%s\":\"%s\"",name,StringUtil.escapeJson(value));
	}
	
    /**
	 * JSON序列化
	 * @param name
	 * @param value
	 * @return
	 */
	private String serializeJson(String name,int value)
	{
		return String.format("\"%s\":%s",name,value);
	}
    
    
    private String getManageUrl() throws Exception
	{
		if(!StringUtil.isNullOrEmpty(managerUrl))
		{
			return managerUrl;
		}
		List<Map<String, String>> list = getDao().getStrMapLst("SELECT HOST_IP,HOST_PORT FROM MTC_SERVER WHERE SERVER_TYPE = 1 AND WORK_MODE = 1");
		StringBuffer sb = new StringBuffer("http://");
		for(Map<String, String> map : list)
        {
			 String hostIp = map.get(Server.PROP_HOST_IP);
			 String hostPort = map.get(Server.PROP_HOST_PORT);
			 if(!StringUtil.isNullOrEmpty(hostIp))
	         {
				 sb.append(hostIp).append(":");
	         }
			 if(!StringUtil.isNullOrEmpty(hostPort))
			 {
				 sb.append(hostPort);
			 }
        }
		managerUrl = sb.toString();
		return managerUrl;
	}
    
}
