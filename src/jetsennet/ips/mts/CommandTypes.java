/************************************************************************
日  期：		2012-08-15
作  者:		李小敏
版  本：     1.0
描  述:	    
历  史：      
************************************************************************/
package jetsennet.ips.mts;

/**
 * 消息类型
 * @author 李小敏
 *
 */
public interface CommandTypes
{

    byte MTS_ACK = 0;
    byte MTS_TASK_NEW = 1;
    byte MTS_GATHERTASK_NEW_REPONSE = 2;
    byte MTS_USER_CHECKIN = 3;
    byte MTS_TERMINAL_OPERATION = 4;
    byte MTS_GATHERTASK_RESULT = 6;
    byte MTS_CMD = 50;
}
