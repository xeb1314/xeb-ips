/* 
 * Copyright (c) 北京捷成世纪科技股份有限公司. All Rights Reserved.
 * 文件：jetsennet.ips.business.GatherTaskStatBusiness.java
 * 日 期：2015年4月8日 下午4:08:47
 * 作 者：刘紫荣
 */
package jetsennet.ips.business;

import java.util.Date;

import jetsennet.frame.business.BaseBusiness;
import jetsennet.frame.business.Business;
import jetsennet.ips.mts.MtsGatherTaskNewResponse;
import jetsennet.ips.mts.MtsGatherTaskResult;
import jetsennet.ips.schema.IpsDatasource;
import jetsennet.ips.schema.IpsGathterresstat;
import jetsennet.ips.schema.IpsGathterstat;
import jetsennet.ips.schema.IpsTask;
import jetsennet.util.DateUtil;

import org.apache.log4j.Logger;

/**
 *  TODO 添加该类的简单功能说明以及算法
 *
 * @author <a href="mailto:liuzirong@jetsen.com">刘紫荣</a>
 * @version 1.0.0
 * ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝<br/>
 * 修订日期                 修订人            描述<br/>
 * 2015年4月8日       刘紫荣            创建<br/>
 */
public class GatherTaskStatBusiness extends BaseBusiness {
	private static final Logger logger = Logger.getLogger(GatherTaskStatBusiness.class);
	
	@Business(auth=false,log = false)
	public void saveGatherStat(MtsGatherTaskResult mtsTaskResult)throws Exception
	{
		IpsTask ipsTask = getDao().queryBusinessObjByPk(IpsTask.class, mtsTaskResult.getTaskID());
		if(ipsTask==null)throw new Exception("该任务ID未匹配到任务："+mtsTaskResult.getTaskID());
		IpsGathterstat gathterstatExist = getDao().querySingleObject(IpsGathterstat.class,  "SELECT * FROM IPS_GATHTERSTAT WHERE TASK_ID='"+mtsTaskResult.getTaskID()+"'");
		if(mtsTaskResult.getAmount()>0||gathterstatExist==null)
		{
			IpsGathterstat gathterstat = new IpsGathterstat();
			gathterstat.setTaskId(mtsTaskResult.getTaskID());
			gathterstat.setAmount(mtsTaskResult.getAmount());
			gathterstat.setPath(mtsTaskResult.getPath());
			gathterstat.setStatTime(DateUtil.parseDate(mtsTaskResult.getStatTime()));
			this.getDao().saveBusinessObjs(gathterstat);
		}
		
		IpsDatasource ipsDatasource = null;
		ipsDatasource = getDao().querySingleObject(IpsDatasource.class, "SELECT * FROM IPS_DATASOURCE WHERE STR_1='"+mtsTaskResult.getPath()+"'");
		if(ipsDatasource==null)
		{
			ipsDatasource = new IpsDatasource();
			ipsDatasource.setCreateTime(new Date());
			ipsDatasource.setCreateUser("admin");
			ipsDatasource.setCreateUserid(1);
			ipsDatasource.setDsClass(800);
			ipsDatasource.setDsName(ipsTask.getTaskName());
			ipsDatasource.setDsParam("-1");
			ipsDatasource.setDsType(10);
			ipsDatasource.setState(0);
			ipsDatasource.setStr1(mtsTaskResult.getPath());
			ipsDatasource.setStr3("1");
			this.getDao().saveBusinessObjs(ipsDatasource);
		}
		
		ipsTask.setDsId(ipsDatasource.getDsId());
		ipsTask.setStr1("1");
		this.getDao().updateBusinessObjs(true, ipsTask);
	}
	
	@Business(auth=false,log = false)
	public void saveGatherTaskNewResponse(MtsGatherTaskNewResponse mtsGatherTaskNewResponse)throws Exception
	{
		IpsTask ipsTask = getDao().queryBusinessObjByPk(IpsTask.class, mtsGatherTaskNewResponse.getTaskID());
		if(ipsTask==null)throw new Exception("该任务ID未匹配到任务："+mtsGatherTaskNewResponse.getTaskID());
		IpsGathterresstat ipsGathterresstat = new IpsGathterresstat();
		ipsGathterresstat.setTaskId(mtsGatherTaskNewResponse.getTaskID());
		ipsGathterresstat.setDanwei(mtsGatherTaskNewResponse.getDanWei());
		ipsGathterresstat.setPath(mtsGatherTaskNewResponse.getTaskPath());
		ipsGathterresstat.setZhendi(mtsGatherTaskNewResponse.getZhenDi());
		ipsGathterresstat.setShouduan(mtsGatherTaskNewResponse.getShouDuan());
		this.getDao().saveBusinessObjs(ipsGathterresstat);
	}
}
