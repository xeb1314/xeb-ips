package jetsennet.juum.iface;

import java.util.ArrayList;
import java.util.List;

import jetsennet.frame.security.UserProfileInfo;
import jetsennet.juum.business.UserBusiness;
import jetsennet.juum.schema.Function;
import jetsennet.juum.schema.Role;
import jetsennet.juum.schema.Roleauthority;
import jetsennet.juum.schema.User;
import jetsennet.juum.schema.Usergroup;
import jetsennet.juum.schema.Usertogroup;
import jetsennet.juum.schema.Usertorole;
import jetsennet.sqlclient.SqlCondition;
import jetsennet.util.DBUtil;
import jetsennet.util.SerializerUtil;
import jetsennet.util.StringUtil;

import org.uorm.dao.common.SqlParameter;

import tvnetwork.schema.common._2.RequestHeadType;
import tvnetwork.schema.uum._2.SysFunctionType;
import tvnetwork.schema.uum._2.UserOnlineInfoType;
import tvnetwork.uum.uumsystemservice.GetAllOnlineUserRequest;
import tvnetwork.uum.uumsystemservice.GetAllUserRequest;
import tvnetwork.uum.uumsystemservice.GetAllUserRoleRequest;
import tvnetwork.uum.uumsystemservice.GetOnlineUserByNameRequest;
import tvnetwork.uum.uumsystemservice.GetOnlineUserByNameResponse;
import tvnetwork.uum.uumsystemservice.GetRoleAuthorityRequest;
import tvnetwork.uum.uumsystemservice.GetUserItemRequest;
import tvnetwork.uum.uumsystemservice.ImportSysFunctionRequest;
import tvnetwork.uum.uumsystemservice.UserLoginRequest;
import tvnetwork.uum.uumsystemservice.UserLogoutRequest;
import tvnetwork.uum.uumsystemservice.UserModifyPwdRequest;


@javax.jws.WebService(
        serviceName = "UUMSystemExtService",
        portName = "UUMSystemServiceSoap",
        targetNamespace = "http://TVNetwork/UUM/UUMSystemService/2.0",
        endpointInterface = "jetsennet.juum.iface.UUMSystemServicePort")
public class UUMSystemExtService implements UUMSystemServicePort {
    private UserBusiness userBusiness;

    /* (non-Javadoc)
     * @see tvnetwork.uum.uumsystemservice.UUMSystemServicePort#userLogin(tvnetwork.schema.common._2.RequestHeadType  requestHead ,)tvnetwork.uum.uumsystemservice.UserLoginRequest  userLoginRequest )*
     */
    public tvnetwork.uum.uumsystemservice.UserLoginResponse userLogin(tvnetwork.schema.common._2.RequestHeadType requestHead,UserLoginRequest userLoginRequest) { 
        tvnetwork.uum.uumsystemservice.UserLoginResponse _return = new tvnetwork.uum.uumsystemservice.UserLoginResponse();
        tvnetwork.schema.common._2.WSResultType _returnWsResult = new tvnetwork.schema.common._2.WSResultType();
        try {
            String resultVal = SerializerUtil.serialize(this.userBusiness.userLogin(userLoginRequest.getLoginName(), userLoginRequest.getPassword(),true), "UserProfile");
            _returnWsResult.setResultVal(resultVal);
        } catch (java.lang.Exception ex) {
            _returnWsResult.setErrorCode(-1);
            _returnWsResult.setErrorString(ex.getMessage());
            ex.printStackTrace();
        }
        _return.setWSResult(_returnWsResult);
        return _return;
    }

    /* (non-Javadoc)
     * @see tvnetwork.uum.uumsystemservice.UUMSystemServicePort#userModifyPwd(tvnetwork.schema.common._2.RequestHeadType  requestHead ,)tvnetwork.uum.uumsystemservice.UserModifyPwdRequest  userModifyPwdRequest )*
     */
    public tvnetwork.uum.uumsystemservice.UserModifyPwdResponse userModifyPwd(tvnetwork.schema.common._2.RequestHeadType requestHead,UserModifyPwdRequest userModifyPwdRequest) { 
        tvnetwork.uum.uumsystemservice.UserModifyPwdResponse _return = new tvnetwork.uum.uumsystemservice.UserModifyPwdResponse();
        tvnetwork.schema.common._2.WSResultType _returnWsResult = new tvnetwork.schema.common._2.WSResultType();
        try {
            int code = this.userBusiness.getUserAuthentication().userValidate(requestHead.getUserToken(),  new ArrayList<String>(0));
            if(code != 0) {
                throw new Exception("用户未登录");
            }
            Long lid = this.userBusiness.getDao().querySingleObject(Long.class, "SELECT T.ID FROM UUM_USER T WHERE T.LOGIN_NAME=?", new SqlParameter(userModifyPwdRequest.getLoginName()));
            if(lid != null) {
                this.userBusiness.changePassword(lid, userModifyPwdRequest.getOldPwd(), userModifyPwdRequest.getNewPwd(), false);
                _returnWsResult.setResultVal("sucess");
            } else {
                _returnWsResult.setErrorCode(-1);
                _returnWsResult.setErrorString("未找到用户信息");
            }
        } catch (java.lang.Exception ex) {
            _returnWsResult.setErrorCode(-1);
            _returnWsResult.setErrorString(ex.getMessage());
            ex.printStackTrace();
        }
        _return.setWSResult(_returnWsResult);
        return _return;
    }

    /* (non-Javadoc)
     * @see tvnetwork.uum.uumsystemservice.UUMSystemServicePort#getAllUser(tvnetwork.schema.common._2.RequestHeadType  requestHead ,)tvnetwork.uum.uumsystemservice.GetAllUserRequest  getAllUserRequest )*
     */
    public tvnetwork.uum.uumsystemservice.GetAllUserResponse getAllUser(tvnetwork.schema.common._2.RequestHeadType requestHead,GetAllUserRequest getAllUserRequest) { 
        tvnetwork.uum.uumsystemservice.GetAllUserResponse _return = new tvnetwork.uum.uumsystemservice.GetAllUserResponse();
        tvnetwork.schema.common._2.WSResultType _returnWsResult = new tvnetwork.schema.common._2.WSResultType();
        try {
            int code = this.userBusiness.getUserAuthentication().userValidate(requestHead.getUserToken(), new ArrayList<String>(0));
            if(code != 0) {
                throw new Exception("用户未登录");
            }
            tvnetwork.schema.uum._2.UserAllInfoType _returnUserAllInfo = new tvnetwork.schema.uum._2.UserAllInfoType();
            tvnetwork.schema.uum._2.ArrayOfUserItemType _returnUserAllInfoUserList = new tvnetwork.schema.uum._2.ArrayOfUserItemType();
            java.util.List<tvnetwork.schema.uum._2.UserItemType> _returnUserAllInfoUserListUserItem = new java.util.ArrayList<tvnetwork.schema.uum._2.UserItemType>();
            //user
            List<User> users = this.userBusiness.getDao().queryAllBusinessObjs(User.class);
            for (User user : users) {
                tvnetwork.schema.uum._2.UserItemType ui = new tvnetwork.schema.uum._2.UserItemType();
                ui.setDutyTitle(user.getDutyTitle());
                ui.setExtendInfo(user.getDescription());
                ui.setLoginName(user.getLoginName());
                ui.setPassword(user.getPassword());
                ui.setUserCode(user.getUserCard());
                ui.setUserID(user.getId().intValue());
                ui.setUserName(user.getUserName());
                ui.setUserSex(user.getSex()==null?0:user.getSex());
                ui.setUserType(user.getUserType()==null?0:user.getUserType());
                _returnUserAllInfoUserListUserItem.add(ui);
            }
            _returnUserAllInfoUserList.getUserItem().addAll(_returnUserAllInfoUserListUserItem);
            _returnUserAllInfo.setUserList(_returnUserAllInfoUserList);
            //usergroup
            tvnetwork.schema.uum._2.ArrayOfUserGroupType _returnUserAllInfoGroupList = new tvnetwork.schema.uum._2.ArrayOfUserGroupType();
            java.util.List<tvnetwork.schema.uum._2.UserGroupType> _returnUserAllInfoGroupListUserGroup = new java.util.ArrayList<tvnetwork.schema.uum._2.UserGroupType>();
            List<Usergroup> usergroups = this.userBusiness.getDao().queryAllBusinessObjs(Usergroup.class);
            for (Usergroup usergroup : usergroups) {
                tvnetwork.schema.uum._2.UserGroupType ug = new tvnetwork.schema.uum._2.UserGroupType();
                ug.setExtendInfo(usergroup.getDescription());
                ug.setGroupCode(usergroup.getGroupCode());
                ug.setGroupID(usergroup.getId().intValue());
                ug.setGroupName(usergroup.getName());
                ug.setGroupType(usergroup.getType());
                ug.setParentID(usergroup.getParentId());
                _returnUserAllInfoGroupListUserGroup.add(ug);
            }
            _returnUserAllInfoGroupList.getUserGroup().addAll(_returnUserAllInfoGroupListUserGroup);
            _returnUserAllInfo.setGroupList(_returnUserAllInfoGroupList);

            //user2group
            tvnetwork.schema.uum._2.ArrayOfUserGroupMapType _returnUserAllInfoMapList = new tvnetwork.schema.uum._2.ArrayOfUserGroupMapType();
            java.util.List<tvnetwork.schema.uum._2.UserGroupMapType> _returnUserAllInfoMapListUserGroupMap = new java.util.ArrayList<tvnetwork.schema.uum._2.UserGroupMapType>();
            List<Usertogroup> user2groups = this.userBusiness.getDao().queryAllBusinessObjs(Usertogroup.class);
            for (Usertogroup user2group : user2groups) {
                tvnetwork.schema.uum._2.UserGroupMapType u2g = new tvnetwork.schema.uum._2.UserGroupMapType();
                u2g.setGroupID(user2group.getGroupId());
                u2g.setUserID(user2group.getUserId());
                _returnUserAllInfoMapListUserGroupMap.add(u2g);
            }
            _returnUserAllInfoMapList.getUserGroupMap().addAll(_returnUserAllInfoMapListUserGroupMap);
            _returnUserAllInfo.setMapList(_returnUserAllInfoMapList);
            _return.setAllUser(_returnUserAllInfo);
        } catch (java.lang.Exception ex) {
            _returnWsResult.setErrorCode(-1);
            _returnWsResult.setErrorString(ex.getMessage());
            ex.printStackTrace();
        }
        _return.setWSResult(_returnWsResult);
        return _return;
    }

    /* (non-Javadoc)
     * @see tvnetwork.uum.uumsystemservice.UUMSystemServicePort#getUserItem(tvnetwork.schema.common._2.RequestHeadType  requestHead ,)tvnetwork.uum.uumsystemservice.GetUserItemRequest  getUserItemRequest )*
     */
    public tvnetwork.uum.uumsystemservice.GetUserItemResponse getUserItem(tvnetwork.schema.common._2.RequestHeadType requestHead,GetUserItemRequest getUserItemRequest) { 
        tvnetwork.uum.uumsystemservice.GetUserItemResponse _return = new tvnetwork.uum.uumsystemservice.GetUserItemResponse();
        tvnetwork.schema.common._2.WSResultType wsResult = new tvnetwork.schema.common._2.WSResultType();
        try {
            int code = this.userBusiness.getUserAuthentication().userValidate(requestHead.getUserToken(),  new ArrayList<String>(0));
            if(code != 0) {
                throw new Exception("用户未登录");
            }
            User user = this.userBusiness.getDao().querySingleObject(User.class, "SELECT T.* FROM UUM_USER T WHERE T.LOGIN_NAME=?",  new SqlParameter(getUserItemRequest.getLoginName()));
            if(user != null) {
                tvnetwork.schema.uum._2.UserItemType userItem = new tvnetwork.schema.uum._2.UserItemType();
                userItem.setUserID(user.getId().intValue());
                userItem.setUserCode(user.getUserCard());
                userItem.setLoginName(user.getLoginName());
                userItem.setPassword(user.getPassword());
                userItem.setUserName(user.getUserName());
                userItem.setUserType(user.getUserType()==null?0:user.getUserType());
                userItem.setUserSex(user.getSex()==null?0:user.getSex());
                userItem.setDutyTitle(user.getDutyTitle());
                userItem.setExtendInfo(user.getDescription());
                _return.setUserItem(userItem);
            }else {
                wsResult.setErrorCode(-1);
                wsResult.setErrorString(String.format("无此用户[%s]", getUserItemRequest.getLoginName()));
            }
        } catch (java.lang.Exception ex) {
            wsResult.setErrorCode(-1);
            wsResult.setErrorString(ex.getMessage());
            ex.printStackTrace();
        }
        _return.setWSResult(wsResult);
        return _return;
        
    }

    /* (non-Javadoc)
     * @see tvnetwork.uum.uumsystemservice.UUMSystemServicePort#userLogout(tvnetwork.schema.common._2.RequestHeadType  requestHead ,)tvnetwork.uum.uumsystemservice.UserLogoutRequest  userLogoutRequest )*
     */
    public tvnetwork.uum.uumsystemservice.UserLogoutResponse userLogout(tvnetwork.schema.common._2.RequestHeadType requestHead,UserLogoutRequest userLogoutRequest) { 
        tvnetwork.uum.uumsystemservice.UserLogoutResponse _return = new tvnetwork.uum.uumsystemservice.UserLogoutResponse();
        tvnetwork.schema.common._2.WSResultType wsResult = new tvnetwork.schema.common._2.WSResultType();
        try {
            this.userBusiness.userLogout(userLogoutRequest.getUserToken());
            wsResult.setResultVal("ok");
        } catch (java.lang.Exception ex) {
            ex.printStackTrace();
        }
        _return.setWSResult(wsResult);
        return _return;
    }
    
    /* (non-Javadoc)
     * @see tvnetwork.uum.uumsystemservice.UUMSystemServicePort#getAllOnlineUser(tvnetwork.schema.common._2.RequestHeadType  requestHead ,)tvnetwork.uum.uumsystemservice.GetAllOnlineUserRequest  getAllOnlineUserRequest )*
     */
    public tvnetwork.uum.uumsystemservice.GetAllOnlineUserResponse getAllOnlineUser(tvnetwork.schema.common._2.RequestHeadType requestHead,GetAllOnlineUserRequest getAllOnlineUserRequest) { 
        tvnetwork.uum.uumsystemservice.GetAllOnlineUserResponse _return = new tvnetwork.uum.uumsystemservice.GetAllOnlineUserResponse();
        tvnetwork.schema.common._2.WSResultType _returnWSResult = new tvnetwork.schema.common._2.WSResultType();
        try {
            int code = this.userBusiness.getUserAuthentication().userValidate(requestHead.getUserToken(),  new ArrayList<String>(0));
            if(code != 0) {
                throw new Exception("用户未登录");
            }
            
            tvnetwork.uum.uumsystemservice.GetAllOnlineUserResponse.AllOnlineUser _returnAllOnlineUser = new tvnetwork.uum.uumsystemservice.GetAllOnlineUserResponse.AllOnlineUser();
            java.util.Set<java.lang.String> onlineUserLoginNames = new java.util.HashSet<java.lang.String>();
            List<UserProfileInfo> userOnlines = this.userBusiness.getOnlineUsers(null);
            if(userOnlines != null && !userOnlines.isEmpty()) {
                for (UserProfileInfo userProfileInfo : userOnlines) {
                    onlineUserLoginNames.add(userProfileInfo.getLoginId());
                }
            }
            _returnAllOnlineUser.getLoginName().addAll(onlineUserLoginNames);

            _return.setAllOnlineUser(_returnAllOnlineUser);
        } catch (java.lang.Exception ex) {
            _returnWSResult.setErrorCode(-1);
            _returnWSResult.setErrorString(ex.getMessage());
            ex.printStackTrace();
        }
        _return.setWSResult(_returnWSResult);
        return _return;
    }
    
    public tvnetwork.uum.uumsystemservice.ImportSysFunctionResponse importSysFunction(tvnetwork.schema.common._2.RequestHeadType requestHead,ImportSysFunctionRequest importSysFunctionRequest) { 
        tvnetwork.uum.uumsystemservice.ImportSysFunctionResponse _return = new tvnetwork.uum.uumsystemservice.ImportSysFunctionResponse();
        tvnetwork.schema.common._2.WSResultType _returnWSResult = new tvnetwork.schema.common._2.WSResultType();
        try {
            int code = this.userBusiness.getUserAuthentication().userValidate(requestHead.getUserToken(),  new ArrayList<String>(0));
            if(code != 0) {
                throw new Exception("用户未登录");
            }
            
            List<SysFunctionType> sysFunction = importSysFunctionRequest.getSysFunctions();
            String sysName = null;
            for (SysFunctionType sysFunctionType : sysFunction) {
                if(sysFunctionType.getParentID() == 0){
                    if(sysName == null) {
                        sysName = sysFunctionType.getName();
                    } else {
                        //more than one system
                        throw new Exception("请求参数错误，一次只能导入一个系统。");
                    }
                }
            }
            if(sysName == null) {
                throw new Exception("请求参数错误，未提供系统参数。");
            }
            //first delete exit function
            String functionIds = null;
            String sql = "SELECT T.ID FROM UUM_FUNCTION T WHERE T.NAME = ? AND T.PARENT_ID = 0";
            Long pid = this.userBusiness.getDao().querySingleObject(Long.class, sql, new SqlParameter(Function.PROP_NAME, sysName));
            if(pid != null) {
                functionIds = pid.toString();
                //原来系统已经存在,删除原来的
                List<Integer> funcIds = this.userBusiness.getDao().getAllChildIdsByParent(Integer.class, Function.class, functionIds, Function.PROP_PARENT_ID, Function.PROP_ID);
                if(!funcIds.isEmpty()) {
                    functionIds = functionIds + "," + StringUtil.join(funcIds);
                }
            }
            List<Function> funcs = new ArrayList<Function>(sysFunction.size());
            for (SysFunctionType sysFunctionType : sysFunction) {
                Function func = new Function();
                func.setId(Long.valueOf(sysFunctionType.getID()));
                func.setParentId(sysFunctionType.getParentID());
                func.setName(sysFunctionType.getName());
                func.setParam(sysFunctionType.getParam());
                func.setState(sysFunctionType.getState());
                func.setDescription(sysFunctionType.getDescription());
                func.setViewPos(sysFunctionType.getViewPos());
                func.setType(sysFunctionType.getType());
                funcs.add(func);
            }
            try{
                this.userBusiness.getDao().beginTransation();
                if(functionIds != null) {
                    this.userBusiness.getDao().delete(Roleauthority.class, new SqlCondition[] { DBUtil.getInCond(Roleauthority.PROP_FUNCTION_ID, functionIds) });
                    this.userBusiness.getDao().delete(Function.class, new SqlCondition[] { DBUtil.getInCond(Function.PROP_ID, functionIds) });
                }
                this.userBusiness.getDao().saveBusinessObjsCol(funcs);
                this.userBusiness.getDao().commitTransation();
            }catch(Exception e) {
                this.userBusiness.getDao().rollbackTransation();
                throw e;
            }
        } catch (java.lang.Exception ex) {
            _returnWSResult.setErrorCode(-1);
            _returnWSResult.setErrorString(ex.getMessage());
            ex.printStackTrace();
        }
        _return.setWSResult(_returnWSResult);
        return _return;
    }
    
    public tvnetwork.uum.uumsystemservice.GetAllUserRoleResponse getAllUserRole(tvnetwork.schema.common._2.RequestHeadType requestHead,GetAllUserRoleRequest getAllUserRoleRequest) { 
        tvnetwork.uum.uumsystemservice.GetAllUserRoleResponse _return = new tvnetwork.uum.uumsystemservice.GetAllUserRoleResponse();
        tvnetwork.schema.common._2.WSResultType _returnWSResult = new tvnetwork.schema.common._2.WSResultType();
        try {
            int code = this.userBusiness.getUserAuthentication().userValidate(requestHead.getUserToken(),  new ArrayList<String>(0));
            if(code != 0) {
                throw new Exception("用户未登录");
            }
            tvnetwork.schema.uum._2.UserAllRoleInfoType _returnAllUserRole = new tvnetwork.schema.uum._2.UserAllRoleInfoType();
            List<Role> roles = this.userBusiness.getDao().queryAllBusinessObjs(Role.class);
            if(roles != null && !roles.isEmpty()) {
                for (Role role : roles) {
                    tvnetwork.schema.uum._2.UserRoleType roletype = new tvnetwork.schema.uum._2.UserRoleType();
                    roletype.setRoleID(role.getId().intValue());
                    roletype.setRoleName(role.getName());
                    roletype.setRoleType(role.getType()==null?0:role.getType());
                    if(role.getDescription() != null) {
                        roletype.setRoleDesc(role.getDescription());
                    }
                    _returnAllUserRole.getRoleList().add(roletype);
                }
            }
            List<Usertorole> user2roles = this.userBusiness.getDao().queryAllBusinessObjs(Usertorole.class);
            if(user2roles != null && !user2roles.isEmpty()) {
                for (Usertorole user2role : user2roles) {
                    tvnetwork.schema.uum._2.UserToRoleType u2roleType = new tvnetwork.schema.uum._2.UserToRoleType();
                    u2roleType.setRoleID(user2role.getRoleId().intValue());
                    u2roleType.setUserID(user2role.getUserId().intValue());
                    _returnAllUserRole.getUserToRoleList().add(u2roleType);
                }
            }
            _return.setAllUserRole(_returnAllUserRole);
        } catch (java.lang.Exception ex) {
            _returnWSResult.setErrorCode(-1);
            _returnWSResult.setErrorString(ex.getMessage());
            ex.printStackTrace();
        }
        _return.setWSResult(_returnWSResult);
        return _return;
    }
    
    
    public tvnetwork.uum.uumsystemservice.GetRoleAuthorityResponse getRoleAuthority(tvnetwork.schema.common._2.RequestHeadType requestHead,GetRoleAuthorityRequest getRoleAuthorityRequest) { 
        tvnetwork.uum.uumsystemservice.GetRoleAuthorityResponse _return = new tvnetwork.uum.uumsystemservice.GetRoleAuthorityResponse();
        tvnetwork.schema.common._2.WSResultType _returnWSResult = new tvnetwork.schema.common._2.WSResultType();
        tvnetwork.schema.uum._2.ArrayOfRoleAuthorityType _returnRoleAuthoritys = new tvnetwork.schema.uum._2.ArrayOfRoleAuthorityType();
        try {
            int code = this.userBusiness.getUserAuthentication().userValidate(requestHead.getUserToken(),  new ArrayList<String>(0));
            if(code != 0) {
                throw new Exception("用户未登录");
            }
            String roleids = StringUtil.join(getRoleAuthorityRequest.getRoleIDs());
            String functionIds = null;
            if(getRoleAuthorityRequest.getSysName() != null){
                String sql = "SELECT T.ID FROM UUM_FUNCTION T WHERE T.NAME = ? AND T.PARENT_ID = 0";
                Long pid = this.userBusiness.getDao().querySingleObject(Long.class, sql, new SqlParameter(Function.PROP_NAME, getRoleAuthorityRequest.getSysName()));
                if(pid != null) {
                    functionIds = pid.toString();
                    List<Integer> funcIds = this.userBusiness.getDao().getAllChildIdsByParent(Integer.class, Function.class, functionIds, Function.PROP_PARENT_ID, Function.PROP_ID);
                    if(!funcIds.isEmpty()) {
                        functionIds = functionIds + "," + StringUtil.join(funcIds);
                    }
                }
            }
            List<Roleauthority> ras = null;
            if(functionIds != null) {
                ras = this.userBusiness.getDao().getLst(Roleauthority.class, new SqlCondition[] { DBUtil.getInCond(Roleauthority.PROP_ROLE_ID, roleids), DBUtil.getInCond(Roleauthority.PROP_FUNCTION_ID, functionIds)});                
            } else {
                ras = this.userBusiness.getDao().getLst(Roleauthority.class, new SqlCondition[] { DBUtil.getInCond(Roleauthority.PROP_ROLE_ID, roleids) });
            }
            if(ras != null && !ras.isEmpty()) {
                for (Roleauthority roleauthority : ras) {
                    tvnetwork.schema.uum._2.UserRoleAuthorityType u2atype = new tvnetwork.schema.uum._2.UserRoleAuthorityType();
                    u2atype.setRoleID(roleauthority.getRoleId().intValue());
                    u2atype.setFunctionID(roleauthority.getFunctionId().intValue());
                    
                    _returnRoleAuthoritys.getRoleAuthority().add(u2atype);
                }
            }
        } catch (java.lang.Exception ex) {
            _returnWSResult.setErrorCode(-1);
            _returnWSResult.setErrorString(ex.getMessage());
            ex.printStackTrace();
        }
        _return.setWSResult(_returnWSResult);
        _return.setRoleAuthoritys(_returnRoleAuthoritys);
        return _return;
    }
    
    /* (non-Javadoc)
     * @see tvnetwork.uum.uumsystemservice.UUMSystemServicePort#getAllOnlineUser(tvnetwork.schema.common._2.RequestHeadType  requestHead ,)tvnetwork.uum.uumsystemservice.GetAllOnlineUserRequest  getAllOnlineUserRequest )*
     */
    public tvnetwork.uum.uumsystemservice.GetOnlineUserByNameResponse getOnlineUserByName(tvnetwork.schema.common._2.RequestHeadType requestHead,GetOnlineUserByNameRequest getOnlineUserByNameRequest) { 
        tvnetwork.uum.uumsystemservice.GetOnlineUserByNameResponse _return = new tvnetwork.uum.uumsystemservice.GetOnlineUserByNameResponse();
        tvnetwork.schema.common._2.WSResultType _returnWSResult = new tvnetwork.schema.common._2.WSResultType();
        try {
            int code = this.userBusiness.getUserAuthentication().userValidate(requestHead.getUserToken(),  new ArrayList<String>(0));
            if(code != 0) {
                throw new Exception("用户未登录");
            }
            
            java.util.Set<UserOnlineInfoType> onlineUsers = new java.util.HashSet<UserOnlineInfoType>();
            
            UserOnlineInfoType userOnlineInfo = new UserOnlineInfoType();
            List<UserProfileInfo> userOnlines = this.userBusiness.getOnlineUsers(getOnlineUserByNameRequest.getLoginName());
            if(userOnlines != null && !userOnlines.isEmpty()) {
//                for (UserProfileInfo userProfileInfo : userOnlines) {
            		UserProfileInfo userProfileInfo = userOnlines.get(0);
	                userOnlineInfo.setLoginId(userProfileInfo.getLoginId());
	                userOnlineInfo.setRequestIP(userProfileInfo.getRequestIP());
	                userOnlineInfo.setUserGroups(userProfileInfo.getUserGroups());
	                userOnlineInfo.setUserId(Integer.parseInt(userProfileInfo.getUserId()));
	                userOnlineInfo.setUserName(userProfileInfo.getUserName());
	                userOnlineInfo.setUserRoles(userProfileInfo.getUserRoles());
	                userOnlineInfo.setUserType(userProfileInfo.getUserType());
	                userOnlineInfo.setUserToken(userProfileInfo.getUserToken());
//	                onlineUsers.add(userOnlineInfo);
//                }
            }
            _return.setOnlineUserInfo(userOnlineInfo);
        } catch (java.lang.Exception ex) {
            _returnWSResult.setErrorCode(-1);
            _returnWSResult.setErrorString(ex.getMessage());
            ex.printStackTrace();
        }
        _return.setWSResult(_returnWSResult);
        return _return;
    }
    
    /**
     * @param userBusiness the userBusiness to set
     */
    public void setUserBusiness(UserBusiness userBusiness) {
        this.userBusiness = userBusiness;
    }

}
