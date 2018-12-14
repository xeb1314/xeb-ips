/* 
 * Copyright (c) 北京捷成世纪科技股份有限公司. All Rights Reserved.
 * 文件：jetsennet.juum.iface.NoAuthUserBusiness.java
 * 日 期：2014-11-27 上午9:32:21
 * 作 者：郭训常
 */
package jetsennet.juum.iface;

import java.util.List;

import jetsennet.frame.security.UserProfileInfo;
import jetsennet.juum.business.UserBusiness;

/**
` *
 * @author <a href="mailto:xunchangguo@gmail.com">郭训常</a>
 * @version 1.0.0
 * ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝<br/>
 * 修订日期                 修订人            描述<br/>
 * 2014-11-27       郭训常            创建<br/>
 */
public class NoAuthUserBusiness extends UserBusiness {

    /* (non-Javadoc)
     * @see jetsennet.juum.business.UserBusiness#changePassword(long, java.lang.String, java.lang.String, boolean)
     */
	@Override
    public void changePassword(long userId, String oldPassword,
            String newPassword, boolean isEncrypt) throws Exception {
        super.changePassword(userId, oldPassword, newPassword, isEncrypt);
    }

    /* (non-Javadoc)
     * @see jetsennet.juum.business.UserBusiness#userLogout(java.lang.String)
     */
    @Override
    public void userLogout(String userToken) {
        super.userLogout(userToken);
    }

    /* (non-Javadoc)
     * @see jetsennet.juum.business.UserBusiness#getOnlineUsers(java.lang.String)
     */
    @Override
    public List<UserProfileInfo> getOnlineUsers(String loginName)
            throws Exception {
        return super.getOnlineUsers(loginName);
    }

}
