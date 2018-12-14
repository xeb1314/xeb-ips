/* 
 * Copyright (c) 北京捷成世纪科技股份有限公司. All Rights Reserved.
 * 文件：jetsennet.ips.mts.MtsTaskResult.java
 * 日 期：2015年4月8日 上午10:30:35
 * 作 者：刘紫荣
 */
package jetsennet.ips.mts;

import java.util.Date;

/**
 *  TODO 添加该类的简单功能说明以及算法
 *
 * @author <a href="mailto:liuzirong@jetsen.com">刘紫荣</a>
 * @version 1.0.0
 * ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝<br/>
 * 修订日期                 修订人            描述<br/>
 * 2015年4月8日       刘紫荣            创建<br/>
 */
public class MtsGatherTaskResult extends BaseCommand {
	public byte getCommandType()
	{
		return CommandTypes.MTS_GATHERTASK_RESULT;
	}
	private String taskID;
	private Double amount;
	private String statTime;
	private String path;
	
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
	 * @return the amount
	 */
	public Double getAmount() {
		return amount;
	}
	/**
	 * @param amount the amount to set
	 */
	public void setAmount(Double amount) {
		this.amount = amount;
	}
	/**
	 * @return the statTime
	 */
	public String getStatTime() {
		return statTime;
	}
	/**
	 * @param statTime the statTime to set
	 */
	public void setStatTime(String statTime) {
		this.statTime = statTime;
	}
	/**
	 * @return the path
	 */
	public String getPath() {
		return path;
	}
	/**
	 * @param path the path to set
	 */
	public void setPath(String path) {
		this.path = path;
	}
	
}
