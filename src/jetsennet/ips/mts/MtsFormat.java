/************************************************************************
日  期：		2012-08-15
作  者:		李小敏
版  本：     1.0
描  述:	    
历  史：      
 ************************************************************************/
package jetsennet.ips.mts;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import jetsennet.ips.mts.CommandTypes;
import jetsennet.ips.mts.ICommand;
import jetsennet.ips.mts.IMtsCommandMarshaller;
import jetsennet.logger.ILog;
import jetsennet.logger.LogManager;
import jetsennet.util.StringUtil;

/**
 * 
 * 消息格式解析
 * 
 * @author lixiaomin
 * 
 */
public class MtsFormat implements IMtsFormat
{
    private static Map<String, Byte> commandMap = new HashMap<String, Byte>();

    private static Map<Byte, IMtsCommandMarshaller> commandType2ObjectMap21 = new HashMap<Byte, IMtsCommandMarshaller>();//jmtc2.1协议解析

    private static ILog logger = LogManager.getLogger("mtc-mtsformat");

    static
    {
        commandMap.put("</mtsAck>", CommandTypes.MTS_ACK);
        commandMap.put("</mtsTaskNew>", CommandTypes.MTS_TASK_NEW);
        commandMap.put("</mtsGatherTaskNewResponse>", CommandTypes.MTS_GATHERTASK_NEW_REPONSE);
        commandMap.put("</mtsGatherTaskResult>", CommandTypes.MTS_GATHERTASK_RESULT);
        commandMap.put("</mtsUserCheckin>", CommandTypes.MTS_USER_CHECKIN);
        commandMap.put("</mtsTerminalOperation>", CommandTypes.MTS_TERMINAL_OPERATION);
        commandMap.put("</mtsCmd>", CommandTypes.MTS_CMD);

        commandType2ObjectMap21.put(CommandTypes.MTS_ACK, new MtsAckMarshaller());
        commandType2ObjectMap21.put(CommandTypes.MTS_GATHERTASK_RESULT, new MtsGatherTaskResultMarshaller());
        commandType2ObjectMap21.put(CommandTypes.MTS_GATHERTASK_NEW_REPONSE, new MtsGatherTaskNewResponseMarshaller());
        commandType2ObjectMap21.put(CommandTypes.MTS_USER_CHECKIN, new MtsUserCheckinMarshaller());
        commandType2ObjectMap21.put(CommandTypes.MTS_TERMINAL_OPERATION, new MtsTerminalOperationMarshaller());
        
//        commandType2ObjectMap21.put(CommandTypes.MTS_TASK_MODIFY, new MtsTaskModifyMarshaller());
//        commandType2ObjectMap21.put(CommandTypes.MTS_TASK_STOP, new MtsTaskStopMarshaller());
//        commandType2ObjectMap21.put(CommandTypes.MTS_TASK_PAUSE, new MtsTaskPauseMarshaller());
//        commandType2ObjectMap21.put(CommandTypes.MTS_TASK_RESULT, new MtsTaskResultMarshaller());
//        commandType2ObjectMap21.put(CommandTypes.MTS_REQ_TASK_STATE, new MtsReqTaskStateMarshaller());
//        commandType2ObjectMap21.put(CommandTypes.MTS_ACTOR_CHECKIN, new MtsActorCheckInMarshaller());
//        commandType2ObjectMap21.put(CommandTypes.MTS_ACTOR_CHECKOUT, new MtsActorCheckOutMarshaller());
//        commandType2ObjectMap21.put(CommandTypes.MTS_REQ_ACTOR_INFO, new MtsReqActorInfoMarshaller());
//        commandType2ObjectMap21.put(CommandTypes.MTS_ACTOR_INFO, new MtsActorInfoMarshaller());
//        commandType2ObjectMap21.put(CommandTypes.MTS_REQ_ACTOR_STATE, new MtsReqActorStateMarshaller());
//        commandType2ObjectMap21.put(CommandTypes.MTS_ACTOR_STATE, new MtsActorStateMarshaller());
//        commandType2ObjectMap21.put(CommandTypes.MTS_MANAGER_INFO, new MtsManagerInfoMarshaller());
//        commandType2ObjectMap21.put(CommandTypes.MTS_WORKER_INFO, new MtsWorkerInfoMarshaller());
//        commandType2ObjectMap21.put(CommandTypes.MTS_REQ_WORKER_INFO, new MtsReqWorkerInfoMarshaller());
//        commandType2ObjectMap21.put(CommandTypes.MTS_REQ_WORKER_CAP, new MtsReqWorkerCapMarshaller());
//        commandType2ObjectMap21.put(CommandTypes.MTS_WORKER_CAP, new MtsWorkerCapMarshaller());
//        commandType2ObjectMap21.put(CommandTypes.MTS_CMD, new MtsCmdMarshaller());
    }

    public String marshal(ICommand command)
    {
        IMtsCommandMarshaller marshaller = getMarshaller(command.getProtocolVersion(), command.getCommandType());
        return marshaller.marshal(this, command);
    }

    public ICommand unmarshal(String commandText) throws Exception
    {
        ICommand command = null;

        for (Iterator<String> iter = commandMap.keySet().iterator(); iter.hasNext();)
        {
            String commandKey = iter.next();

            if (jetsennet.util.StringUtil.right(commandText, 50).lastIndexOf(commandKey) > 0)
            {
                String versionTag = commandText.substring(0, commandText.indexOf('>'));
                IMtsCommandMarshaller marshaller = getMarshaller(versionTag, commandMap.get(commandKey));
                command = marshaller.createCommand();
                command.setProtocolVersion(marshaller.getProtocolVersion());

                try
                {
                    marshaller.unmarshal(this, command, commandText);
                }
                catch (Exception e)
                {
                    logger.error("格式不正确，解析报文出错！", e);
                    throw new Exception("格式不正确，解析报文出错！");
                }
                break;
            }
        }

        return command;
    }

    /**
     * 获取封包解包的类
     * 
     * @param commandType
     * @return
     */
    protected IMtsCommandMarshaller getMarshaller(String versionTag, byte commandType)
    {
        IMtsCommandMarshaller marshaller = null;

        marshaller = commandType2ObjectMap21.get(commandType);

        return marshaller;
    }
}
