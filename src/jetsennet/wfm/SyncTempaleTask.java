/**
 * 日  期：2012-09-22
 * 作  者: wangjun
 * 版  本： 1.0
 * 描  述: 同步模板到actor，对于没有更新的模板不同步
 * 
 */
package jetsennet.wfm;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TimerTask;
import java.util.concurrent.ConcurrentHashMap;

import javax.imageio.stream.FileImageInputStream;

import org.apache.commons.codec.binary.Base64;
import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;

import jetsennet.frame.dataaccess.IDao;
import jetsennet.jmtc.CmdTypes;
import jetsennet.jmtc.IMtsFormat;
import jetsennet.jmtc.MtsObjectFactory;
import jetsennet.jmtc.command.MtsAck;
import jetsennet.jmtc.command.MtsCmd;
import jetsennet.logger.ILog;
import jetsennet.logger.LogManager;
import jetsennet.util.FileAccess;
import jetsennet.util.FileUtil;
import jetsennet.util.HttpRequest;
import jetsennet.util.SpringContextUtil;
import jetsennet.util.StringUtil;
import jetsennet.util.XmlUtil;
import jetsennet.wfm.business.ProcessBusiness;
import jetsennet.wfm.schema.Actparam;

public class SyncTempaleTask extends  TimerTask
{
    private ConcurrentHashMap<String, Map<String,String>> templateList = new ConcurrentHashMap<String, Map<String,String>>(100); //模板列表,同步完成的模板
    private ConcurrentHashMap<String, Map<String,String>> actors = new ConcurrentHashMap<String, Map<String,String>>(); //actor列表
    private ConcurrentHashMap<String, ConcurrentHashMap<String, Map<String,String>>> actorTemplateList =
        new ConcurrentHashMap<String, ConcurrentHashMap<String, Map<String,String>>>(); //actor对应的同步失败的模板
    protected IMtsFormat mtsFormat = MtsObjectFactory.createMtsFormat();
    protected static ILog logger = LogManager.getLogger("wfm-SyncTempaleListener");
    private IDao dao;
       
    @Override
	public void run()
    {
    	logger.error("同步模板失败！");
    	try
        {
            doSyncTemplate();
        }
        catch (Exception e)
        {
            logger.error("同步模板失败！", e);
        }
    }   

    /**
     * 同步模板
     * @throws SQLException
     */
    private void doSyncTemplate() throws Exception
    {
    	ProcessBusiness processBusiness = (ProcessBusiness) SpringContextUtil.getBean("processBusiness");
    	dao = processBusiness.getDao();
        //找到所有的actor列表
    	List<Map<String,String>> serverList = dao.getStrMapLst("SELECT HOST_IP,HOST_PORT,SERVER_NAME FROM NET_SERVER WHERE SERVER_TYPE=10");
        List<Map<String,String>> acotrList = dao.getStrMapLst("SELECT HOST_IP,HOST_PORT,SERVER_NAME FROM MTC_SERVER WHERE SERVER_TYPE=2");

        if (acotrList.size() == 0 && serverList.size() == 0)
        {
            return;
        }
        for (Map<String,String> server : serverList)
        {
            acotrList.add(server); //将wfm ip信息加入到actor里面 同步
        }
        //找到需要同步的模板
        List<Map<String,String>> tempList =
        		dao.getStrMapLst("SELECT W.PROCACT_ID,W.PARAM_TYPE,W.TEMPLATE_NAME,W.PARAM_DATA,W.FIELD_1 AS UPDATE_TIME,PARAM_ID FROM WFM_ACTPARAM W " +
        				"INNER JOIN WFM_PROCACT F ON W.PROCACT_ID = F.PROCACT_ID INNER JOIN WFM_PROCESS P ON F.PROC_ID=P.PROC_ID INNER JOIN " +
        				"(SELECT MAX(PROC_VER) AS PROC_VER,PROC_ID FROM WFM_PROCACT GROUP BY PROC_ID) PP ON  PP.PROC_VER = F.PROC_VER AND PP.PROC_ID = F.PROC_ID " +
        				"WHERE W.PARAM_TYPE=10 AND (P.PROC_STATE = 11 OR P.PROC_STATE = 10)");
        
        //同步台标 从文件中读取
        String filePath = FileUtil.getApplicationPath() + "stationTemplates\\stationTemplateInfo.xml";
        File stationfile = new File(filePath);
        String readTemplateInfoXml = "";
        if(stationfile.exists()){
            readTemplateInfoXml = FileAccess.readFileText(filePath);
        }
        
        if(!StringUtil.isNullOrEmpty(readTemplateInfoXml)){
            Document doc = DocumentHelper.parseText(readTemplateInfoXml);  
            List<Element> temEleLst = doc.getRootElement().selectNodes("STATION_ITEM");
            if(temEleLst!=null&&temEleLst.size()>0){
                for(Element temEle : temEleLst){
                    File file = new File(XmlUtil.tryGetItemText(temEle, "STATION_URL", "")); //路径下是不是文件
                    Map<String,String> map = new HashMap<String,String>();
                    if (file.exists()) {
                        map.put("STATION_URL",XmlUtil.tryGetItemText(temEle, "STATION_URL", ""));
                        map.put("PARAM_TYPE","11");
                        map.put("TEMPLATE_NAME", file.getName());
                        map.put("UPDATE_TIME", XmlUtil.tryGetItemText(temEle, "CREATE_TIME", ""));
                        tempList.add(map);
                    }
                }
            }
        }
        
        if (tempList.size() == 0)
        {
            return;
        }

        for (Map<String,String> actor : acotrList)
        {
            String actorURL = new StringBuffer("http://").append(actor.get("HOST_IP")).append(":").append(actor.get("HOST_PORT")).toString();
            for (Map<String,String> template : tempList)
            {
                sendTemplate(template, actorURL, actor);//向actor发送模板信息
            }
        }

    }

    /**
     * 发送模板信息给actor
     * @throws SQLException 
     */
    private void sendTemplate(Map<String,String> template, String actorURL, Map<String,String> actor) throws SQLException
    {

    	Map<String,String> processItem = dao.getStrMap(String.format("SELECT PROCACT_ID,ACT_ID FROM WFM_PROCACT WHERE PROCACT_ID=%s", template.get("PROCACT_ID")));

        String taskType = "200"; //转码

        if (processItem != null)
        {
            if ("5400".equals(XmlUtil.escapeXml(processItem.get("ACT_ID"))))
                taskType = "400"; //技审
            if ("5201".equals(XmlUtil.escapeXml(processItem.get("ACT_ID"))))
                taskType = "201"; //打包任务
            if ("5210".equals(XmlUtil.escapeXml(processItem.get("ACT_ID")))||"5209".equals(XmlUtil.escapeXml(processItem.get("ACT_ID"))))
                taskType = "210"; //打包任务
        }

        String cmdInfo =
            "<paramTemplate><taskType>"
                + taskType
                + "</taskType><taskParam><paramType>"
                + template.get("PARAM_TYPE")
                +"</paramType><templateName>"
                + template.get("TEMPLATE_NAME")
                + "</templateName><createDate>"
                + template.get("UPDATE_TIME")
                + "</createDate><paramMD5></paramMD5></taskParam></paramTemplate>";

        MtsCmd mtsCmd = new MtsCmd();
        mtsCmd.setCmdType(CmdTypes.TEMPLATE);
        mtsCmd.setCmdInfo(cmdInfo);
        String content = mtsFormat.marshal(mtsCmd);

        try
        {
            MtsAck ackcmd = (MtsAck) mtsFormat.unmarshal(HttpRequest.send(actorURL, content));
            if (ackcmd.getStateCode() == 10)  //同步数据
            {
                if(template.get("STATION_URL")!=null){
                    //读取base64内容
                    FileImageInputStream input = new FileImageInputStream(new File(template.get("STATION_URL")));
                    ByteArrayOutputStream output = new ByteArrayOutputStream();
                    byte[] buf = new byte[1024];
                    int numBytesRead = 0;
                    while ((numBytesRead = input.read(buf)) != -1) {
                        output.write(buf, 0, numBytesRead);
                    }
                    String stationImageContent = new String(Base64.encodeBase64(output.toByteArray()));
                    template.put("PARAM_DATA", stationImageContent);
                    output.close();
                    input.close();
                }
                
                String cmdDataInfo =
                        "<paramTemplate><taskType>"
                            + taskType
                            + "</taskType><taskParam><paramType>"
                            + template.get("PARAM_TYPE")
                            +"</paramType><templateName>"
                            + template.get("TEMPLATE_NAME")
                            + "</templateName><paramData>"
                            + template.get("PARAM_DATA")
                            + "</paramData><createDate>"
                            + template.get("UPDATE_TIME")
                            + "</createDate><paramMD5></paramMD5></taskParam></paramTemplate>";

                    MtsCmd mtsDataCmd = new MtsCmd();
                    mtsDataCmd.setCmdType(CmdTypes.TEMPLATE);
                    mtsDataCmd.setCmdInfo(cmdDataInfo);
                    String dataContent = mtsFormat.marshal(mtsDataCmd);
                    MtsAck ackDataCmd = (MtsAck) mtsFormat.unmarshal(HttpRequest.send(actorURL, dataContent));
                    if(ackDataCmd.getStateCode() == 0){
                        logger.info(StringUtil.format("同步模板[%s]至%s", template.get("TEMPLATE_NAME"), actor.get("SERVER_NAME")));
                    }
            }
        }
        catch (Exception e)
        {
            logger.error(StringUtil.format("同步模板[%s]至%s失败", template.get("TEMPLATE_NAME"), actor.get("SERVER_NAME")), e);
        }
    }

    
    /**
     * 从同步失败的列表里面查找模板
     */
    private boolean checkFailTemplate(Map<String,String> template, Map<String,String> actor)
    {
        boolean exist = false;//当前模板是否存在于同步失败列表,默认不在

        Map<String, Map<String,String>> failSyncTmp = actorTemplateList.get(actor.get("HOST_IP") + ":" + actor.get("HOST_PORT"));//寻找actor下是否有同步失败的模板，没有则不更新

        if (failSyncTmp.size() == 0)//没有同步失败的模板
        {
            exist = false;
        }
        else if (template.get("PROCACT_ID").equals(failSyncTmp.get(template.get("PROCACT_ID")).get("PROCACT_ID")))//在同步失败的列表，同步
        {
            exist = true;
        }

        return exist;

    }

    /**
     * 根据更新时间判断模板是否有更新
     */
    private boolean isTemplateModified(Map<String,String> template)
    {
        boolean modified = false;//是否更新过，默认否
        String lastModifyTime = "";
        Map<String,String> templateLastModify = templateList.get(template.get("PROCACT_ID"));//上次修改后的模板

        if (templateLastModify == null)//列表中没有，代表上次同步失败，需要同步
        {
            modified = false;
        }
        else
        {
            lastModifyTime = templateLastModify.get("UPDATE_TIME");//上次修改时间
        }
        if (!StringUtil.isNullOrEmpty(lastModifyTime) && !lastModifyTime.equals(template.get("UPDATE_TIME")))
        {
            modified = true;
        }

        return modified;
    }

    /**
     * 更新模板同步时间
     */
    private void updateTemplateModifyTime(Map<String,String> template)
    {
        try
        {
        	Actparam actparam = new Actparam();
        	actparam.setParamId(Integer.valueOf(template.get("PARAM_ID")));
        	actparam.setParamData(template.get("PARAM_DATA"));
        	actparam.setTemplateName(template.get("TEMPLATE_NAME"));
        	actparam.setProcactId(Integer.valueOf(template.get("PROCACT_ID")));
        	actparam.setField1(template.get("UPDATE_TIME"));
        	dao.updateBusinessObjs(true, actparam);
        }
        catch (SQLException e)
        {
            logger.error("更新模板同步时间失败!", e);
        }
    }
}
