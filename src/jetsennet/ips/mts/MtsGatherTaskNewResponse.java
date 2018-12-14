/* 
 * Copyright (c) 北京捷成世纪科技股份有限公司. All Rights Reserved.
 * 文件：jetsennet.ips.mts.MtsGatherTaskNewResponse.java
 * 日 期：2015年4月9日 下午5:10:45
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
 * 2015年4月9日       刘紫荣            创建<br/>
 */
public class MtsGatherTaskNewResponse extends BaseCommand {
	public byte getCommandType()
	{
		return CommandTypes.MTS_GATHERTASK_NEW_REPONSE;
	}
	private String taskID;
	private String taskPath;
	private String zhenDi;
	private String danWei;
	private String shouDuan;
	/**
	 * @return the taskID
	 */
	public String getTaskID() {
		return taskID;
	}
	/**
	 * @param taskID the taskID to set
	 */
	public void setTaskID(String taskID) {
		this.taskID = taskID;
	}
	/**
	 * @return the taskPath
	 */
	public String getTaskPath() {
		return taskPath;
	}
	/**
	 * @param taskPath the taskPath to set
	 */
	public void setTaskPath(String taskPath) {
		this.taskPath = taskPath;
	}
	/**
	 * @return the zhenDi
	 */
	public String getZhenDi() {
		return zhenDi;
	}
	/**
	 * @param zhenDi the zhenDi to set
	 */
	public void setZhenDi(String zhenDi) {
		this.zhenDi = zhenDi;
	}
	/**
	 * @return the danWei
	 */
	public String getDanWei() {
		return danWei;
	}
	/**
	 * @param danWei the danWei to set
	 */
	public void setDanWei(String danWei) {
		this.danWei = danWei;
	}
	/**
	 * @return the shouDuan
	 */
	public String getShouDuan() {
		return shouDuan;
	}
	/**
	 * @param shouDuan the shouDuan to set
	 */
	public void setShouDuan(String shouDuan) {
		this.shouDuan = shouDuan;
	}
	
}
