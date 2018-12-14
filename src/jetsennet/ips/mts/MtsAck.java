/************************************************************************
日  期：		2012-08-15
作  者:		李小敏
版  本：     1.0
描  述:	    
历  史：      
 ************************************************************************/
package jetsennet.ips.mts;

/**
 * 消息应答
 * 
 * @author lixiaomin
 * 
 */
public class MtsAck extends BaseCommand
{
	public byte getCommandType()
	{
		return CommandTypes.MTS_ACK;
	}

	private int stateCode = 0;
	private String stateDesc;

	public int getStateCode()
	{
		return this.stateCode;
	}

	@Override
	public boolean isAck()
	{
		return true;
	}

	public void setStateCode(int val)
	{
		this.stateCode = val;
	}

	public String getStateDesc()
	{
		return this.stateDesc;
	}

	public void setStateDesc(String val)
	{
		this.stateDesc = val;
	}
}
