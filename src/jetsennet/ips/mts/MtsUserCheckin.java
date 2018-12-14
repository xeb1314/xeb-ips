/* 
 * Copyright (c) 北京捷成世纪科技股份有限公司. All Rights Reserved.
 * 文件：jetsennet.ips.mts.MtsUserCheckin.java
 * 日 期：2015年4月14日 上午10:05:43
 * 作 者：刘紫荣
 */
package jetsennet.ips.mts;

/**
 *  TODO 添加该类的简单功能说明以及算法
 *
 * @author <a href="mailto:liuzirong@jetsen.com">刘紫荣</a>
 * @version 1.0.0
 * ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝<br/>
 * 修订日期                 修订人            描述<br/>
 * 2015年4月14日       刘紫荣            创建<br/>
 */
public class MtsUserCheckin extends BaseCommand {
	public byte getCommandType()
	{
		return CommandTypes.MTS_USER_CHECKIN;
	}
	
	private String userName;
	
	private String userPWD;
	
	private String hostIP;

	/**
	 * @return the userName
	 */
	public String getUserName() {
		return userName;
	}

	/**
	 * @param userName the userName to set
	 */
	public void setUserName(String userName) {
		this.userName = userName;
	}

	/**
	 * @return the userPWD
	 */
	public String getUserPWD() {
		return userPWD;
	}

	/**
	 * @param userPWD the userPWD to set
	 */
	public void setUserPWD(String userPWD) {
		this.userPWD = userPWD;
	}

	/**
	 * @return the hostIP
	 */
	public String getHostIP() {
		return hostIP;
	}

	/**
	 * @param hostIP the hostIP to set
	 */
	public void setHostIP(String hostIP) {
		this.hostIP = hostIP;
	}
	
	
}
