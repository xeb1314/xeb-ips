/* 
 * Copyright (c) 北京捷成世纪科技股份有限公司. All Rights Reserved.
 * 文件：jetsennet.ips.business.ReportBusiness.java
 * 日 期：2015年4月20日 下午7:13:23
 * 作 者：刘紫荣
 */
package jetsennet.ips.business;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;

import jetsennet.frame.business.BaseBusiness;
import jetsennet.frame.business.Business;
import jetsennet.frame.security.UserProfileInfo;
import jetsennet.ips.mts.MtsTerminalOperation;
import jetsennet.ips.schema.IpsTeminaloperationstat;
import jetsennet.juum.schema.User;
import jetsennet.juum.schema.Usergroup;
import jetsennet.util.DateUtil;
import jetsennet.util.DateUtils;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;

import org.apache.log4j.Logger;
import org.uorm.dao.common.SqlParameter;

/**
 *  TODO 添加该类的简单功能说明以及算法
 *
 * @author <a href="mailto:liuzirong@jetsen.com">刘紫荣</a>
 * @version 1.0.0
 * ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝<br/>
 * 修订日期                 修订人            描述<br/>
 * 2015年4月20日       刘紫荣            创建<br/>
 */
public class ReportBusiness extends BaseBusiness {
	private static final Logger logger = Logger.getLogger(ReportBusiness.class);
	@Business(auth=false,log = false)
	public void recieveTerminalOperation(MtsTerminalOperation mtsTerminalOperation)throws Exception
	{
		IpsTeminaloperationstat stat = new IpsTeminaloperationstat();
		stat.setDatatype(mtsTerminalOperation.getDataType());
		stat.setIp(mtsTerminalOperation.getIp());
		stat.setLoginName(mtsTerminalOperation.getLoginName());
		stat.setOperation(mtsTerminalOperation.getOperation());
		stat.setOperationtime(DateUtil.parseDate(mtsTerminalOperation.getOperationTime()));
		stat.setRecordid(mtsTerminalOperation.getRecordID());
		stat.setReportsid(mtsTerminalOperation.getReportSid());
		stat.setReporttime(DateUtil.parseDate(mtsTerminalOperation.getReportTime()));
		stat.setReporttitle(mtsTerminalOperation.getReportTitle());
		User user = getDao().querySingleObject(User.class,"SELECT * FROM UUM_USER WHERE LOGIN_NAME='"+mtsTerminalOperation.getLoginName()+"'");
		if(user==null)throw new Exception("用户不存在！"+mtsTerminalOperation.getLoginName());
		stat.setUserId(user.getId());
		stat.setUserName(user.getUserName());
		Usergroup userGroup = getDao().querySingleObject(Usergroup.class,"SELECT * FROM UUM_USERGROUP WHERE GROUP_CODE='"+mtsTerminalOperation.getGroupCode()+"'");
		if(userGroup==null)throw new Exception("用户组不存在！"+mtsTerminalOperation.getGroupCode());
		stat.setGroupId(userGroup.getId());
		stat.setGroupName(userGroup.getName());
		stat.setGroupCode(mtsTerminalOperation.getGroupCode());
		stat.setCreateTime(new Date());
		getDao().saveBusinessObjs(stat);
	}
	
	public String reportStatBySelf(UserProfileInfo userProfile)throws Exception
	{
		JSONObject reportObj = new JSONObject();
		Usergroup userGroup = getDao().querySingleObject(Usergroup.class,"SELECT * FROM UUM_USERGROUP WHERE ID =?",new SqlParameter(Usergroup.PROP_ID, userProfile.getUserGroups()));
		String sql = "";
		//个人当天投稿量
		String dayStartTime = DateUtil.formatDateString(new Date(), "yyyy-MM-dd")+" 00:00:00";
		String dayEndTime = DateUtil.formatDateString(new Date(), "yyyy-MM-dd")+" 23:59:59";
		sql = "SELECT count(*) FROM IPS_TEMINALOPERATIONSTAT WHERE LOGIN_NAME=? AND OPERATIONTIME<=? AND OPERATIONTIME>=?";
		Long selfDayReportCount = getDao().querySingleObject(Long.class, sql, new SqlParameter(IpsTeminaloperationstat.PROP_LOGIN_NAME, userProfile.getLoginId())
		, new SqlParameter(IpsTeminaloperationstat.PROP_OPERATIONTIME, dayEndTime)
		, new SqlParameter(IpsTeminaloperationstat.PROP_OPERATIONTIME, dayStartTime)
		);
		reportObj.put("SELFDAYREPORTCOUNT", selfDayReportCount);
		
		//个人当天所属科室投稿量
		sql = "SELECT count(*) FROM IPS_TEMINALOPERATIONSTAT WHERE GROUP_CODE=? AND OPERATIONTIME<=? AND OPERATIONTIME>=?";
		Long selfGroupDayReportCount = getDao().querySingleObject(Long.class, sql, new SqlParameter(IpsTeminaloperationstat.PROP_GROUP_CODE, userGroup.getGroupCode())
		, new SqlParameter(IpsTeminaloperationstat.PROP_OPERATIONTIME, dayEndTime)
		, new SqlParameter(IpsTeminaloperationstat.PROP_OPERATIONTIME, dayStartTime)
		);
		reportObj.put("SELFGROUPDAYREPORTCOUNT", selfGroupDayReportCount);
		//个人当天所属处投稿量
		sql = "SELECT count(*) FROM IPS_TEMINALOPERATIONSTAT WHERE GROUP_CODE IN(SELECT GROUP_CODE FROM UUM_USERGROUP WHERE PARENT_ID=?) AND OPERATIONTIME<=? AND OPERATIONTIME>=?";
		Long selfGroupCDayReportCount = getDao().querySingleObject(Long.class, sql
				, new SqlParameter(Usergroup.PROP_PARENT_ID, userGroup.getParentId())
		, new SqlParameter(IpsTeminaloperationstat.PROP_OPERATIONTIME, dayEndTime)
		, new SqlParameter(IpsTeminaloperationstat.PROP_OPERATIONTIME, dayStartTime)
		);
		reportObj.put("SELFGROUPCDAYREPORTCOUNT", selfGroupCDayReportCount);
		
		//获取当前月第一天
		String mouthStartTime = DateUtils.dateFormat(DateUtils.getMonthFirst(),null)+" 00:00:00";
		
		//获取当前月最后一天
		String mouthEndTime = DateUtils.dateFormat(DateUtils.getMonthLast(),null)+" 23:59:59";
		
		//个人当月投稿量
		sql = "SELECT count(*) FROM IPS_TEMINALOPERATIONSTAT WHERE GROUP_CODE=? AND OPERATIONTIME<=? AND OPERATIONTIME>=?";
		Long selfMonthReportCount = getDao().querySingleObject(Long.class, sql, new SqlParameter(IpsTeminaloperationstat.PROP_GROUP_CODE, userGroup.getGroupCode())
		, new SqlParameter(IpsTeminaloperationstat.PROP_OPERATIONTIME, mouthEndTime)
		, new SqlParameter(IpsTeminaloperationstat.PROP_OPERATIONTIME, mouthStartTime)
		);
		reportObj.put("SELFMONTHREPORTCOUNT", selfMonthReportCount);
		
		//个人当月所属科室投稿量
		sql = "SELECT count(*) FROM IPS_TEMINALOPERATIONSTAT WHERE GROUP_CODE=? AND OPERATIONTIME<=? AND OPERATIONTIME>=?";
		Long selfGroupMonthReportCount = getDao().querySingleObject(Long.class, sql, new SqlParameter(IpsTeminaloperationstat.PROP_GROUP_CODE, userGroup.getGroupCode())
		, new SqlParameter(IpsTeminaloperationstat.PROP_OPERATIONTIME, mouthEndTime)
		, new SqlParameter(IpsTeminaloperationstat.PROP_OPERATIONTIME, mouthStartTime)
		);
		reportObj.put("SELFGROUPMONTHREPORTCOUNT", selfGroupMonthReportCount);
		
		//个人当月所属处投稿量
		sql = "SELECT count(*) FROM IPS_TEMINALOPERATIONSTAT WHERE GROUP_CODE IN(SELECT GROUP_CODE FROM UUM_USERGROUP WHERE PARENT_ID=?) AND OPERATIONTIME<=? AND OPERATIONTIME>=?";
		Long selfGroupCMonthCReportCount = getDao().querySingleObject(Long.class, sql
				, new SqlParameter(Usergroup.PROP_PARENT_ID, userGroup.getParentId())
		, new SqlParameter(IpsTeminaloperationstat.PROP_OPERATIONTIME, mouthEndTime)
		, new SqlParameter(IpsTeminaloperationstat.PROP_OPERATIONTIME, mouthStartTime)
		);
		reportObj.put("SELFGROUPCMONTHREPORTCOUNT", selfGroupCMonthCReportCount);
		
		//获取当前年第一天
		String yearStartTime = DateUtils.dateFormat(DateUtils.getCurrYearFirst(),null)+" 00:00:00";
		
		//获取当前年最后一天
		String yearEndTime = DateUtils.dateFormat(DateUtils.getCurrYearLast(),null)+" 23:59:59";
	
		//个人当年投稿量
		sql = "SELECT count(*) FROM IPS_TEMINALOPERATIONSTAT WHERE GROUP_CODE=? AND OPERATIONTIME<=? AND OPERATIONTIME>=?";
		Long selfYearReportCount = getDao().querySingleObject(Long.class, sql, new SqlParameter(IpsTeminaloperationstat.PROP_GROUP_CODE, userGroup.getGroupCode())
		, new SqlParameter(IpsTeminaloperationstat.PROP_OPERATIONTIME, yearEndTime)
		, new SqlParameter(IpsTeminaloperationstat.PROP_OPERATIONTIME, yearStartTime)
		);
		reportObj.put("SELFYEARREPORTCOUNT", selfYearReportCount);
		
		//个人当年所属科室投稿量
		sql = "SELECT count(*) FROM IPS_TEMINALOPERATIONSTAT WHERE GROUP_CODE=? AND OPERATIONTIME<=? AND OPERATIONTIME>=?";
		Long selfGroupYeatReportCount = getDao().querySingleObject(Long.class, sql, new SqlParameter(IpsTeminaloperationstat.PROP_GROUP_CODE, userGroup.getGroupCode())
		, new SqlParameter(IpsTeminaloperationstat.PROP_OPERATIONTIME, yearEndTime)
		, new SqlParameter(IpsTeminaloperationstat.PROP_OPERATIONTIME, yearStartTime)
		);
		reportObj.put("SELFGROUPYEARREPORTCOUNT", selfGroupYeatReportCount);
		
		//个人当年所属处投稿量
		sql = "SELECT count(*) FROM IPS_TEMINALOPERATIONSTAT WHERE GROUP_CODE IN(SELECT GROUP_CODE FROM UUM_USERGROUP WHERE PARENT_ID=?) AND OPERATIONTIME<=? AND OPERATIONTIME>=?";
		Long selfGroupCYeatCReportCount = getDao().querySingleObject(Long.class, sql
				, new SqlParameter(Usergroup.PROP_PARENT_ID, userGroup.getParentId())
		, new SqlParameter(IpsTeminaloperationstat.PROP_OPERATIONTIME, yearEndTime)
		, new SqlParameter(IpsTeminaloperationstat.PROP_OPERATIONTIME, yearStartTime)
		);
		reportObj.put("SELFGROUPCYEARREPORTCOUNT", selfGroupCYeatCReportCount);
		return reportObj.toString();
	}
}
