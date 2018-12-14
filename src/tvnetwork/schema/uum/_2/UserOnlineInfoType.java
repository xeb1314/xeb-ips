/**
 * UserOnlineInfoType.java
 *
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package tvnetwork.schema.uum._2;

import java.util.Date;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;


/**
 * 在线用户信息
 * <xs:complexType name="UserOnlineInfoType">
		<xs:annotation>
			<xs:documentation>在线用户信息</xs:documentation>
		</xs:annotation>
		<xs:sequence>
			<xs:element name="loginId" type="xs:int"/>
			<xs:element name="requestIP" type="xs:string"/>
			<xs:element name="loginTime" type="xs:date"/>
			<xs:element name="userGroups" type="xs:string"/>
			<xs:element name="userId" type="xs:int"/>
			<xs:element name="userName" type="xs:string"/>
			<xs:element name="userParam" type="xs:string"/>
			<xs:element name="userRoles" type="xs:int"/>
			<xs:element name="userToken" type="xs:string"/>
			<xs:element name="userType" type="xs:int"/>
			<xs:element name="extendInfo" type="xs:string" minOccurs="0"/>
		</xs:sequence>
	</xs:complexType>
 * 
 */

@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "UserOnlineInfoType", propOrder = {
    "loginId",
    "requestIP",
    "loginTime",
    "userGroups",
    "userId",
    "userName",
    "userParam",
    "userRoles",
    "userToken",
    "userType",
    "extendInfo"
})
public class UserOnlineInfoType{
    private String loginId;
    private String requestIP;
    private Date loginTime;
    private String userGroups;
    private int userId;
    @XmlElement(required = true)
    private String userName;
    private String userParam;
    private String userRoles;
    @XmlElement(required = true)
    private String userToken;
    private int userType;
    private String extendInfo;

    /**
     * Gets the loginId value for this UserOnlineInfoType.
     * 
     * @return loginId
     */
    public String getLoginId() {
        return loginId;
    }


    /**
     * Sets the loginId value for this UserOnlineInfoType.
     * 
     * @param loginId
     */
    public void setLoginId(String loginId) {
        this.loginId = loginId;
    }


    /**
     * Gets the requestIP value for this UserOnlineInfoType.
     * 
     * @return requestIP
     */
    public String getRequestIP() {
        return requestIP;
    }


    /**
     * Sets the requestIP value for this UserOnlineInfoType.
     * 
     * @param requestIP
     */
    public void setRequestIP(String requestIP) {
        this.requestIP = requestIP;
    }


    /**
     * Gets the loginTime value for this UserOnlineInfoType.
     * 
     * @return loginTime
     */
    public java.util.Date getLoginTime() {
        return loginTime;
    }


    /**
     * Sets the loginTime value for this UserOnlineInfoType.
     * 
     * @param loginTime
     */
    public void setLoginTime(Date loginTime) {
        this.loginTime = loginTime;
    }


    /**
     * Gets the userGroups value for this UserOnlineInfoType.
     * 
     * @return userGroups
     */
    public String getUserGroups() {
        return userGroups;
    }


    /**
     * Sets the userGroups value for this UserOnlineInfoType.
     * 
     * @param userGroups
     */
    public void setUserGroups(String userGroups) {
        this.userGroups = userGroups;
    }


    /**
     * Gets the userId value for this UserOnlineInfoType.
     * 
     * @return userId
     */
    public int getUserId() {
        return userId;
    }


    /**
     * Sets the userId value for this UserOnlineInfoType.
     * 
     * @param userId
     */
    public void setUserId(int userId) {
        this.userId = userId;
    }


    /**
     * Gets the userName value for this UserOnlineInfoType.
     * 
     * @return userName
     */
    public String getUserName() {
        return userName;
    }


    /**
     * Sets the userName value for this UserOnlineInfoType.
     * 
     * @param userName
     */
    public void setUserName(String userName) {
        this.userName = userName;
    }


    /**
     * Gets the userParam value for this UserOnlineInfoType.
     * 
     * @return userParam
     */
    public java.lang.String getUserParam() {
        return userParam;
    }


    /**
     * Sets the userParam value for this UserOnlineInfoType.
     * 
     * @param userParam
     */
    public void setUserParam(String userParam) {
        this.userParam = userParam;
    }


    /**
     * Gets the userRoles value for this UserOnlineInfoType.
     * 
     * @return userRoles
     */
    public String getUserRoles() {
        return userRoles;
    }


    /**
     * Sets the userRoles value for this UserOnlineInfoType.
     * 
     * @param userRoles
     */
    public void setUserRoles(String userRoles) {
        this.userRoles = userRoles;
    }


    /**
     * Gets the userToken value for this UserOnlineInfoType.
     * 
     * @return userToken
     */
    public String getUserToken() {
        return userToken;
    }


    /**
     * Sets the userToken value for this UserOnlineInfoType.
     * 
     * @param userToken
     */
    public void setUserToken(String userToken) {
        this.userToken = userToken;
    }


    /**
     * Gets the userType value for this UserOnlineInfoType.
     * 
     * @return userType
     */
    public int getUserType() {
        return userType;
    }


    /**
     * Sets the userType value for this UserOnlineInfoType.
     * 
     * @param userType
     */
    public void setUserType(int userType) {
        this.userType = userType;
    }


    /**
     * Gets the extendInfo value for this UserOnlineInfoType.
     * 
     * @return extendInfo
     */
    public String getExtendInfo() {
        return extendInfo;
    }


    /**
     * Sets the extendInfo value for this UserOnlineInfoType.
     * 
     * @param extendInfo
     */
    public void setExtendInfo(String extendInfo) {
        this.extendInfo = extendInfo;
    }

}
