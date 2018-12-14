/* 
 * Copyright (c) 北京捷成世纪科技股份有限公司. All Rights Reserved.
 * 文件：jetsennet.ips.websocket.UserWebSocketAuthentication.java
 * 日 期：2015年4月14日 上午10:42:07
 * 作 者：刘紫荣
 */
package jetsennet.ips.websocket;

import java.util.Date;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

import org.apache.log4j.Logger;

import jetsennet.frame.security.UserProfileInfo;
import jetsennet.juum.IUserAuthentication;
import jetsennet.juum.business.UserBusiness;

/**
 * TODO 添加该类的简单功能说明以及算法
 *
 * @author <a href="mailto:liuzirong@jetsen.com">刘紫荣</a>
 * @version 1.0.0 ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝<br/>
 *          修订日期 修订人 描述<br/>
 *          2015年4月14日 刘紫荣 创建<br/>
 */
public class UserWebSocketAuthentication implements IUserAuthentication {

	private static final Logger logger = Logger
			.getLogger(UserWebSocketAuthentication.class);
	private static ConcurrentHashMap<String, UserProfileInfo> token_user= new ConcurrentHashMap();

	private UserBusiness userBusiness;

	public UserWebSocketAuthentication() {
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see jetsennet.frame.security.IUserAuth#userValidate(java.lang.String,
	 * java.util.List)
	 */
	@Override
	public int userValidate(String arg0, List<String> arg1) {
		// TODO Auto-generated method stub
		return 0;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see jetsennet.juum.IUserAuthentication#checkUpdateTime(java.lang.String)
	 */
	@Override
	public Date checkUpdateTime(String arg0) {
		// TODO Auto-generated method stub
		return null;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see jetsennet.juum.IUserAuthentication#getOnlineUsers(java.lang.String)
	 */
	@Override
	public List<UserProfileInfo> getOnlineUsers(String arg0) {
		// TODO Auto-generated method stub
		return null;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * jetsennet.juum.IUserAuthentication#getUserByAccount(java.lang.String)
	 */
	@Override
	public List<UserProfileInfo> getUserByAccount(String arg0) {
		// TODO Auto-generated method stub
		return null;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see jetsennet.juum.IUserAuthentication#getUserByToken(java.lang.String)
	 */
	@Override
	public UserProfileInfo getUserByToken(String loginIp) {
		return token_user.get(loginIp);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see jetsennet.juum.IUserAuthentication#logoutAccount(java.lang.String)
	 */
	@Override
	public void logoutAccount(String loginId) {
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * jetsennet.juum.IUserAuthentication#logoutAccountByIp(java.lang.String,
	 * java.lang.String)
	 */
	@Override
	public void logoutAccountByIp(String loginId, String currentIp) {

	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see jetsennet.juum.IUserAuthentication#logoutSSOUser(java.lang.String)
	 */
	@Override
	public void logoutSSOUser(String arg0) {
		// TODO Auto-generated method stub

	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see jetsennet.juum.IUserAuthentication#logoutUser(java.lang.String)
	 */
	@Override
	public void logoutUser(String userToken) {

	}
	/*
	 * 登出
	 */
	public void logoutUser(String loginId,String loginIp) {
		token_user.remove(loginIp);
	}

	
	/*
	 * (non-Javadoc)
	 * 
	 * @see jetsennet.juum.IUserAuthentication#refreshAccount(java.lang.String)
	 */
	@Override
	public void refreshAccount(String arg0) {
		// TODO Auto-generated method stub

	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see jetsennet.juum.IUserAuthentication#registerLogin(java.lang.String,
	 * java.lang.String)
	 */
	@Override
	public UserProfileInfo registerLogin(String arg0, String arg1)
			throws Exception {
		// TODO Auto-generated method stub
		return null;
	}

	/*
	 * 登录
	 */
	public UserProfileInfo userLogin(String loginId, String password,
			String loginIp) throws Exception {
		UserProfileInfo uInfo = this.userBusiness
				.getUserProfileInfo4Login(loginId);
		if (uInfo == null) {
			logger.error("无效的登录用户!");
			throw new Exception("无效的登录用户!");
		}
		uInfo.setRequestIP(loginIp);
		token_user.put(loginIp, uInfo);
		return uInfo;
	}
	
	 public UserBusiness getUserBusiness()
	  {
	    return this.userBusiness;
	  }

	  public void setUserBusiness(UserBusiness userBusiness)
	  {
	    this.userBusiness = userBusiness;
	  }

	/* (non-Javadoc)
	 * @see jetsennet.juum.IUserAuthentication#userLogin(java.lang.String, java.lang.String, boolean)
	 */
	@Override
	public UserProfileInfo userLogin(String s, String s1, boolean flag)
			throws Exception {
		// TODO Auto-generated method stub
		return null;
	}
}
