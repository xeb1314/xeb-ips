package jetsennet.wfm.business;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;

import jetsennet.frame.business.BaseBusiness;
import jetsennet.frame.business.Business;
import jetsennet.frame.dataaccess.IDao;
import jetsennet.frame.security.UserProfileInfo;
import jetsennet.juum.IUserAuthentication;
import jetsennet.jwfm.FlowObjectFactory;
import jetsennet.jwfm.IFmsFormat;
import jetsennet.jwfm.command.FmsAck;
import jetsennet.jwfm.command.FmsAssignRule;
import jetsennet.jwfm.command.FmsFlowAction;
import jetsennet.jwfm.command.FmsProcessAction;
import jetsennet.jwfm.command.FmsReqAssignRule;
import jetsennet.jwfm.command.FmsTaskAction;
import jetsennet.mtc.schema.NetWfmMtcOperatorlog;
import jetsennet.util.HttpRequest;
import jetsennet.util.SpringContextUtil;
import jetsennet.util.StringUtil;
import jetsennet.util.ThreadLocalUtil;

import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;

public class FlowProcessBusiness extends BaseBusiness
{
	private static IFmsFormat fmsFormat = FlowObjectFactory.createFmsFormat();
	private IUserAuthentication userAuthentication;
	
	
    public IUserAuthentication getUserAuthentication() {
		return userAuthentication;
	}

	public void setUserAuthentication(IUserAuthentication userAuthentication) {
		this.userAuthentication = userAuthentication;
	}

	public IDao getReplaceDao(){
    	IDao daof = getDao();
    	if(daof==null){
    		FlowProcessBusiness flowProcessBusiness = (FlowProcessBusiness) SpringContextUtil.getBean("flowProcessBusiness");
    		return flowProcessBusiness.getDao();
    	}
    	return daof;
    }
	
	/**
     * 流程操作
     * @param flowNew
     * @return
     * @throws Exception
     */
	@Business(log = false, trans=false)
    public String flowAction(String flowAction) throws Exception
    {
        FmsFlowAction fmsFlowAction = (FmsFlowAction) fmsFormat.unmarshal(flowAction);
        if (fmsFlowAction == null)
        {
            throw new Exception("无效的参数");
        }
        
        FmsAck ack = (FmsAck) fmsFormat.unmarshal(HttpRequest.send(getWFMManagerUrl(), flowAction));

        if (ack.getStateCode() != 0)
        {
            throw new Exception(ack.getStateDesc());
        }

        return ack.getStateDesc();
    }

    /**
     * 任务操作
     * @param flowNew
     * @return
     * @throws Exception
     */
	@Business(log = false, trans=false)
    public String taskAction(String taskAction) throws Exception
    {
        FmsTaskAction fmsTaskAction = (FmsTaskAction) fmsFormat.unmarshal(taskAction);
        if (fmsTaskAction == null)
        {
            throw new Exception("无效的参数");
        }

        FmsAck ack = (FmsAck) fmsFormat.unmarshal(HttpRequest.send(getWFMManagerUrl(), taskAction));

        if (ack.getStateCode() != 0)
        {
            throw new Exception(ack.getStateDesc());
        }
        return ack.getStateDesc();
    }

    /**
     * 请求任务指派xml
     * @return
     * @throws Exception
     */
	@Business(log = false, trans=false)
    public String reqAssignRule() throws Exception
    {
        FmsReqAssignRule fmsReqTaskAssign = new FmsReqAssignRule();
        StringBuilder sb = new StringBuilder();
        try
        {
            String reqXml = HttpRequest.send(getWFMManagerUrl(), fmsFormat.marshal(fmsReqTaskAssign));
            FmsAssignRule fmsAssignRule = (FmsAssignRule) fmsFormat.unmarshal(reqXml);
            Document doc = DocumentHelper.parseText(fmsAssignRule.getAssignRule());
            //		Document doc = DocumentHelper.parseText("<assignRule><ruleItem type=\"1\" name=\"用户\" viewType=\"0\" idField=\"id\" nameField=\"name\" parentField=\"\"><data id=\"1\" name=\"管理员\"></data><data id=\"2\" name=\"管理员2\"></data></ruleItem><ruleItem type=\"3\" name=\"角色\" viewType=\"1\" idField=\"id\" nameField=\"name\" parentField=\"\"><data id=\"1\" name=\"管理员\"></data><data id=\"2\" name=\"管理员2\"></data></ruleItem><ruleItem type=\"5\" name=\"权限2\" viewType=\"2\" idField=\"id\" nameField=\"name\" parentField=\"parentId\"><data id=\"1\" name=\"管理员\" parentId=\"2\"></data><data id=\"2\" name=\"管理员2\"></data></ruleItem><ruleItem type=\"4\" name=\"权限\" viewType=\"2\" idField=\"id\" nameField=\"name\" parentField=\"parentId\"><data id=\"1\" name=\"管理员\" parentId=\"2\"></data><data id=\"2\" name=\"管理员2\"></data></ruleItem></assignRule>");
            Element rootElement = doc.getRootElement();
            sb.append("<DataSource>");
            List<Element> ruleItemNodes = rootElement.selectNodes("ruleItem");
            for (Element ruleItem : ruleItemNodes)
            {
                int ruleType = Integer.valueOf(ruleItem.valueOf("@type"));
                String idField = ruleItem.valueOf("@idField");
                String nameField = ruleItem.valueOf("@nameField");
                String parentField = ruleItem.valueOf("@parentField");
                List<Element> dataNodes = ruleItem.selectNodes("data");
                sb.append("<ruleItem><TYPE>"
                        + ruleType
                        + "</TYPE><NAME>"
                        + ruleItem.valueOf("@name")
                        + "</NAME><VIEWTYPE>"
                        + ruleItem.valueOf("@viewType")
                        + "</VIEWTYPE></ruleItem>");
                for (Element data : dataNodes)
                {
                    if (StringUtil.isNullOrEmpty(parentField))
                    {
                        sb.append("<item"
                                + ruleType
                                + "><ID>"
                                + data.valueOf("@" + idField)
                                + "</ID><NAME>"
                                + data.valueOf("@" + nameField)
                                + "</NAME></item"
                                + ruleType
                                + ">");
                    }
                    else
                    {
                        sb.append("<item"
                                + ruleType
                                + "><ID>"
                                + data.valueOf("@" + idField)
                                + "</ID><NAME>"
                                + data.valueOf("@" + nameField)
                                + "</NAME><PARENT_ID>"
                                + data.valueOf("@" + parentField)
                                + "</PARENT_ID></item"
                                + ruleType
                                + ">");
                    }
                }
            }
            sb.append("</DataSource>");
        }
        catch (Exception e)
        {
            throw new Exception("不能正确获取指派规则！");
        }
        return sb.toString();
    }

    
    
    /**
     * 更新工作流程状态
     * 
     * @param token
     * @param procId
     * @param objType
     * @param processState
     * @throws Exception
     */
    @SuppressWarnings("unchecked")
    @Business(trans=false)
    public void activeProcess(int procId, int objType, int processState) throws Exception
    {
    	 UserProfileInfo uInfo = SpringContextUtil.getBean("userAuth", IUserAuthentication.class).getUserByToken((String) ThreadLocalUtil.get(ThreadLocalUtil.AUTH_HEAD));
    	 String userName = ""; String userId = "";
    	 if(uInfo!=null){
    		 userName = uInfo.getUserName();
    		 userId = uInfo.getUserId();
    	 }
    	 FmsProcessAction fmsAction = new FmsProcessAction();
    	 fmsAction.setProcId(procId);
    	 fmsAction.setProcType(objType);
    	 fmsAction.setProcState(processState);
    	 fmsAction.setAlterUserId(Integer.valueOf(!StringUtil.isNullOrEmpty(userId)?userId:"0"));
    	 fmsAction.setAlterUserName(userName);
    	 FmsAck fmsack =(FmsAck) fmsFormat.unmarshal(HttpRequest.send(getWFMManagerUrl(), fmsFormat.marshal(fmsAction)));
    	 if(fmsack.getStateCode()!=0){
    		 throw new Exception(fmsack.getStateDesc());
    	 }
    }

    /**
     * 获取流程服务器HTTP地址
     * @return
     * @throws Exception 
     * @throws SQLException
     */
    @Business(log = false, trans=false)
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
    
    
    /**
	 * 操作日志
	 * 
	 * @param message
     * @throws SQLException 
	 */
    @Business(log = false)
	public void logOperator(String message)
	{
		UserProfileInfo userInfo  = SpringContextUtil.getBean("userAuth", IUserAuthentication.class).getUserByToken((String) ThreadLocalUtil.get(ThreadLocalUtil.AUTH_HEAD));
		if (userInfo != null)
		{
			if (message != null && message.length() > 490)
			{
				message = message.substring(0, 490);
			}

			NetWfmMtcOperatorlog netWfmMtcOperatorlog = new NetWfmMtcOperatorlog();
			netWfmMtcOperatorlog.setId(java.util.UUID.randomUUID().toString());
			netWfmMtcOperatorlog.setUserId(Integer.valueOf(userInfo.getUserId()));
			netWfmMtcOperatorlog.setUserName(userInfo.getUserName());
			netWfmMtcOperatorlog.setDescription(message);
			netWfmMtcOperatorlog.setLogTime(new java.util.Date());
			try {
				getDao().saveBusinessObjs(netWfmMtcOperatorlog);
			} catch (SQLException e) {
				e.printStackTrace();
			}
		}
	}
}
