/* 
 * Copyright (c) 北京捷成世纪科技股份有限公司. All Rights Reserved.
 * 文件：jetsennet.jcms.services.JCMSystemService.java
 * 日 期：2014-11-8 下午12:23:42
 * 作 者：梁继杰
 */
package jetsennet.ips.services;

import java.sql.SQLException;

import javax.jws.WebService;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.FormParam;
import javax.ws.rs.POST;
import javax.ws.rs.Path;

import jetsennet.frame.service.BaseService;
import jetsennet.ips.business.CollecBusiness;
import jetsennet.ips.business.CtrlClassBusiness;
import jetsennet.ips.business.CtrlWordBusiness;
import jetsennet.ips.business.IpsDataSourceBusiness;
import jetsennet.ips.business.IpsDsLabelToUserGroupBusiness;
import jetsennet.ips.business.IpsJobBusiness;
import jetsennet.ips.business.IpsTaskBusiness;
import jetsennet.net.WSResult;
import jetsennet.util.AutoAddID;

import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Node;
import org.springframework.http.HttpRequest;
import org.springframework.web.multipart.MultipartFile;

/**
 *  TODO 添加该类的简单功能说明以及算法
 *
 * @author <a href="mailto:liangjijie@jetsen.cn">梁继杰</a>
 * @version 1.0.0
 * ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝<br/>
 * 修订日期                 修订人            描述<br/>
 * 2014-11-8       梁继杰           创建<br/>
 */
@Path("/IPSSystemService")
@WebService(name = "/IPSSystemService")
public class IPSSystemService extends BaseService {
	
	private IpsJobBusiness ipsJobBusiness;
	private IpsTaskBusiness ipsTaskBusiness;
	private CtrlClassBusiness classBusiness;
	private CtrlWordBusiness ctrlWordBusiness;
	private AutoAddID autoAddID;
	private CollecBusiness collecBusiness;
	private IpsDataSourceBusiness ipsDataSourceBusiness;
	private IpsDsLabelToUserGroupBusiness ipsDsLabelToUserGroupBuiness;
	
	@javax.jws.WebMethod(exclude = true)
	public IpsDsLabelToUserGroupBusiness getIpsDsLabelToUserGroupBuiness() {
		return ipsDsLabelToUserGroupBuiness;
	}

	@javax.jws.WebMethod(exclude = true)
	public void setIpsDsLabelToUserGroupBuiness(
			IpsDsLabelToUserGroupBusiness ipsDsLabelToUserGroupBuiness) {
		this.ipsDsLabelToUserGroupBuiness = ipsDsLabelToUserGroupBuiness;
	}

	@javax.jws.WebMethod(exclude = true)
	public IpsDataSourceBusiness getIpsDataSourceBusiness() {
		return ipsDataSourceBusiness;
	}
	
	@javax.jws.WebMethod(exclude = true)
	public void setIpsDataSourceBusiness(IpsDataSourceBusiness ipsDataSourceBusiness) {
		this.ipsDataSourceBusiness = ipsDataSourceBusiness;
	}

	@POST
	@Path("/commonCtrlWrodInsert")
	public WSResult commonCtrlWrodInsert(@FormParam("className") String className, @FormParam("saveXml") String xml)
	  throws Exception
	{
	  return getResult(String.valueOf(ctrlWordBusiness.commonObjInsert(autoAddID.getNewId("IPS_CTRLWORD"),xml)));
	}
	  
	@POST
	@Path("/commonDeviceMessage")//@FormParam("className") String className,
	public WSResult commonDeviceMessage(@FormParam("saveXml") String xml)
	  throws Exception
	{
	  return getResult(String.valueOf(collecBusiness.commonObjInsert(xml)));
	}
	
	/**
	 * @return the ctrlWordBusiness
	 */
	@javax.jws.WebMethod(exclude = true)
	public CtrlWordBusiness getCtrlWordBusiness() {
		return ctrlWordBusiness;
	}

	/**
	 * @param ctrlWordBusiness the ctrlWordBusiness to set
	 */
	@javax.jws.WebMethod(exclude = true)
	public void setCtrlWordBusiness(CtrlWordBusiness ctrlWordBusiness) {
		this.ctrlWordBusiness = ctrlWordBusiness;
	}

	/**
	 * @return the ipsJobBusiness
	 */
	@javax.jws.WebMethod(exclude = true)
	public IpsJobBusiness getIpsJobBusiness() {
		return ipsJobBusiness;
	}

	/**
	 * @param ipsJobBusiness the ipsJobBusiness to set
	 */
	@javax.jws.WebMethod(exclude = true)
	public void setIpsJobBusiness(IpsJobBusiness ipsJobBusiness) {
		this.ipsJobBusiness = ipsJobBusiness;
	}
	
	@javax.jws.WebMethod(exclude = true)
	public IpsTaskBusiness getIpsTaskBusiness() {
		return ipsTaskBusiness;
	}

	@javax.jws.WebMethod(exclude = true)
	public void setIpsTaskBusiness(IpsTaskBusiness ipsTaskBusiness) {
		this.ipsTaskBusiness = ipsTaskBusiness;
	}

	/**
	 * @return the classBusiness
	 */
	@javax.jws.WebMethod(exclude = true)
	public CtrlClassBusiness getClassBusiness() {
		return classBusiness;
	}
	/**
	 * @param classBusiness the classBusiness to set
	 */
	@javax.jws.WebMethod(exclude = true)
	public void setClassBusiness(CtrlClassBusiness classBusiness) {
		this.classBusiness = classBusiness;
	}

    
	/**
	 * @return the autoAddID
	 */
	@javax.jws.WebMethod(exclude = true)
	public AutoAddID getAutoAddID() {
		return autoAddID;
	}


	/**
	 * @param autoAddID the autoAddID to set
	 */
	@javax.jws.WebMethod(exclude = true)
	public void setAutoAddID(AutoAddID autoAddID) {
		this.autoAddID = autoAddID;
	}

	 /**
	 * @return the collecBusiness
	 */
	@javax.jws.WebMethod(exclude = true)
	public CollecBusiness getCollecBusiness() {
		return collecBusiness;
	}

	/**
	 * @param collecBusiness the collecBusiness to set
	 */
	@javax.jws.WebMethod(exclude = true)
	public void setCollecBusiness(CollecBusiness collecBusiness) {
		this.collecBusiness = collecBusiness;
	}

	/**
	 * 
	 * 获取 Job列表
	 * JiJie.LianG 2014-11-8 下午12:36:16
	 * @param queryXml
	 * @return
	 * @throws Exception
	 */
	@POST
    @Path("/queryJobXmlForPage")
	public WSResult queryJobXmlForPage(@FormParam("queryXml") String queryXml) throws Exception
	{
		Document retDoc = DocumentHelper.parseText(queryXml);
    	Node pageInfoNode = retDoc.getRootElement().selectSingleNode("PageInfo");
    	int pageSize = Integer.valueOf(pageInfoNode.selectSingleNode("PageSize").getText());
    	return ipsJobBusiness.commonQueryForPage(queryXml,0,pageSize);
	}
	
	@POST
    @Path("/queryTaskXmlForPage")
	public WSResult queryTaskXmlForPage(@FormParam("queryXml") String queryXml) throws Exception
	{
		Document retDoc = DocumentHelper.parseText(queryXml);
    	Node pageInfoNode = retDoc.getRootElement().selectSingleNode("PageInfo");
    	int pageSize = Integer.valueOf(pageInfoNode.selectSingleNode("PageSize").getText());
    	return ipsTaskBusiness.commonQueryForPage(queryXml,0,pageSize);
	}
	
	/**
     * 特殊查询条件
     * @param queryXml
     * @return
     * @throws Exception
     */
    @POST
    @Path("/querySpecialXml")
    public WSResult querySpecialXml(@FormParam("queryXml") String queryXml) throws Exception
    {
    	return ipsTaskBusiness.commonXmlQuery(queryXml);
    }
	
    /**
     * 特殊查询条件
     * @param queryXml
     * @return
     * @throws Exception
     */
    @POST
    @Path("/sendTask")
    public WSResult sendTask(@FormParam("saveXml") String msg) throws Exception
    {
    	return getResult(String.valueOf(ipsTaskBusiness.sendTask(msg)));
    }
    /**
     * 分页查询 我的任务---数据采集任务的gride
     * @param xml
     * @param startNum
     * @param pageSize
     * @return
     * @throws SQLException
     */
    @POST
    @Path("/collocTaskQueryForPage")
    public WSResult collocTaskQueryForPage(@FormParam("queryXml") String xml, @FormParam("startPageNum") int startNum, @FormParam("pageSize") int pageSize)
      throws SQLException
    {
      return ipsTaskBusiness.collocTaskQueryForPage(xml, startNum, pageSize);
    }
    /**
     * 查询采集任务的统计图标
     */
    @POST
    @Path("/collocTotalQuery")
    public WSResult collocTotalQuery(@FormParam("taskId") String taskId,@FormParam("procId") String procId,@FormParam("startTime") String startTime,@FormParam("endTime") String endTime)
      throws SQLException
    {
      return ipsTaskBusiness.collocTotalQuery(taskId,procId,startTime,endTime);
    }
    
    /**
     * 查询数据采集任务的统计tubiao
     * @param taskId
     * @param startTime
     * @param endTime
     * @return
     * @throws SQLException
     */
    @POST
    @Path("/collectTaskToCount")
    public WSResult collectTaskToCount(@FormParam("taskId") String taskId,@FormParam("startTime") String startTime,@FormParam("endTime") String endTime)throws SQLException{
    	return ipsTaskBusiness.collectTaskToCount(taskId,startTime,endTime);
    }
    
    
    /**
     * 继承数据源
     */
    @POST
    @Path("/extendsDsLable")
    public WSResult extendsDsLable(@FormParam("fileDsId") String fileDsId,@FormParam("dbDsId") String dbDsId)
      throws Exception
    {
      return getResult(String.valueOf(ipsDataSourceBusiness.extendsDsLable(fileDsId,dbDsId)));
    }
    
    /**
     * 保存数据权限
     * 2015年10月15日 下午5:30:19 By JiJie.LianG
     * @param dsLabelIds
     * @param groupIds
     * @return
     * @throws Exception
     */
    @POST
    @Path("/insertGroup2DsLabel")
    public WSResult insertGroup2DsLabel(@FormParam("dsLabelId") String dsLabelId,@FormParam("groupIds") String groupIds) throws Exception{
    	return getResult(String.valueOf(ipsDsLabelToUserGroupBuiness.insertGroup2DsLabel(dsLabelId, groupIds.split(","))));
    }
    
    @POST
    @Path("/dsLabelsQueryForPage")
    public WSResult dsLabelsQueryForPage(@FormParam("queryXml") String xml, @FormParam("startPageNum") int startNum, @FormParam("pageSize") int pageSize)
      throws SQLException
    {
      return ipsDataSourceBusiness.dsLabelsQueryForPage(xml, startNum, pageSize);
    }
    
    @POST
    @Path("/openDeskTop")
    public int openDeskTop(@FormParam("filePath") String filePath){
      return ipsDataSourceBusiness.openDeskTop(filePath);
    }
    
    @POST
    @Path("/commonObjDeleteNew")
    public WSResult commonObjDeleteNew(@FormParam("className") String className, @FormParam("deleteIds") String ids)
    throws Exception{
      return getResult(String.valueOf(ipsTaskBusiness.commonObjDeleteNew(className, ids)));
    }
    
    @POST
    @Path("/queryProcessByDS")
    public WSResult queryProcessByDS(@FormParam("dsId") String dsId)
    throws Exception{
      return getResult(String.valueOf(ipsTaskBusiness.queryProcessByDS(dsId)));
    }
    
    @POST
    @Path("/updateActParamByDS")
    public WSResult updateActParamByDS(@FormParam("procactId") String procactId,@FormParam("actParam") String actParam)
    throws Exception{
      return getResult(String.valueOf(ipsTaskBusiness.updateActParamByDS(procactId,actParam)));
    }
}
