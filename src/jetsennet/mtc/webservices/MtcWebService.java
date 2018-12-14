/************************************************************************
日  期：		2013-9-29
作  者:		王均
版  本：     
描  述:	    protal    jmtc调度中心对外接口服务
历  史：      
 ************************************************************************/

package jetsennet.mtc.webservices;

import javax.jws.WebService;
import javax.ws.rs.FormParam;
import javax.ws.rs.POST;
import javax.ws.rs.Path;

import org.apache.log4j.Logger;

import jetsennet.frame.security.ModuleVerification;
import jetsennet.frame.service.BaseService;
import jetsennet.mtc.business.MtsBusiness;
import jetsennet.net.WSResult;
import jetsennet.wfm.business.ProcessBusiness;

@Path("/MtcWebService")
@WebService(name = "/MtcWebService")
public class MtcWebService extends BaseService 
{
	
	private static final Logger logger = Logger.getLogger(MtcWebService.class);
	private MtsBusiness mtsBusiness;
	private ProcessBusiness processBusiness;
	public static final short JMTC = 23;
	protected boolean isServiceEnable = true;
	
	public MtcWebService()
	{
		ModuleVerification.registerModule(this);
	}
	
	@Override
    @javax.jws.WebMethod(exclude = true)
    public int getModuleCode()
    {
		return JMTC;
    }
	
	@javax.jws.WebMethod(exclude=true)
	public void setModuleEnable(boolean isEnable)
	{
		 this.isServiceEnable = isEnable;
	}
	
	@javax.jws.WebMethod(exclude = true)
    public MtsBusiness getMtsBusiness() {
		return mtsBusiness;
	}
    
    @javax.jws.WebMethod(exclude = true)
	public void setMtsBusiness(MtsBusiness mtsBusiness) {
		this.mtsBusiness = mtsBusiness;
	}
    
    @javax.jws.WebMethod(exclude = true)
	public ProcessBusiness getProcessBusiness() {
		return processBusiness;
	}
    
    @javax.jws.WebMethod(exclude = true)
	public void setProcessBusiness(ProcessBusiness processBusiness) {
		this.processBusiness = processBusiness;
	}

	/**
	 * MTS消息
	 * @param mtsMessage
	 * @return
	 */
    @POST
    @Path("/mtcMtsMessage")
	public String mtcMtsMessage(@FormParam("mtsMessage") String mtsMessage)
	{
		return mtsBusiness.mtsMessage(mtsMessage);
	}
    
    /**
	 * 接收业务系统的模板(名称、类型、内容)，同步到ACTOR和WFM-SERVER
	 * @param templateName
	 * @param taskType
	 * @param templateData
	 * @throws Exception 
	 */
    @POST
    @Path("/getBusinessTemplateInfo")
	public String getBusinessTemplateInfo(@FormParam("templateName") String templateName,@FormParam("taskType") String taskType,
			@FormParam("templateData") String templateData) throws Exception{
		WSResult retObj = new WSResult();
		try{
			processBusiness.synchTemplateBusiness(templateName, templateData, taskType,"10");
		}catch(Exception e){
			logger.debug("导入模板失败！"+e);
			e.printStackTrace();
		}
		return retObj.toString();
	}
	
}
