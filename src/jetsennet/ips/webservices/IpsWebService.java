/* 
 * Copyright (c) 北京捷成世纪科技股份有限公司. All Rights Reserved.
 * 文件：jetsennet.jcms.webservices.JcmsWebService.java
 * 日 期：2014-11-8 下午12:48:10
 * 作 者：梁继杰
 */
package jetsennet.ips.webservices;

import javax.jws.WebService;
import javax.ws.rs.FormParam;
import javax.ws.rs.POST;
import javax.ws.rs.Path;

import jetsennet.frame.service.BaseService;
import jetsennet.juum.business.UserBusiness;
import jetsennet.net.WSResult;
import jetsennet.util.SerializerUtil;
import jetsennet.util.ThreadLocalUtil;

import org.apache.log4j.Logger;

/**
 *  TODO 添加该类的简单功能说明以及算法
 *
 * @author <a href="mailto:liangjijie@jetsen.cn">梁继杰</a>
 * @version 1.0.0
 * ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝<br/>
 * 修订日期                 修订人            描述<br/>
 * 2014-11-8       梁继杰           创建<br/>
 */
@Path("/IpsWebService")
@WebService(name = "/IpsWebService")
public class IpsWebService extends BaseService {

	private static final Logger logger = Logger.getLogger(IpsWebService.class);
	private UserBusiness userBusiness;
	
	/**
     * 用户登录 
     * @param loginId 参数
     * @param passWord 密码
     * @return 结果
     * @throws Exception 
     */
    @POST
    @Path("/uumUserLogin")
    public WSResult uumUserLogin(@FormParam("loginId") String loginId, @FormParam("password") String password) throws Exception
    {
        return getResult(SerializerUtil.serialize(userBusiness.userLogin(loginId, password,true), "UserProfile"));
    }

    /**
     * 用户登出 
     * @param token 令牌
     * @return 结果
     * @throws Exception 
     */
    @POST
    @Path("/uumLogout")
    public WSResult uumLogout() throws Exception
    {
        userBusiness.userLogout((String) ThreadLocalUtil.get(ThreadLocalUtil.AUTH_HEAD));
        return getEmptyResult();
    }
	
}
