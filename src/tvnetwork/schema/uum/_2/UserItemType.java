
package tvnetwork.schema.uum._2;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;


/**
 * 用户条目类型
 * 
 * <p>UserItemType complex type的 Java 类。
 * 
 * <p>以下模式片段指定包含在此类中的预期内容。
 * 
 * <pre>
 * &lt;complexType name="UserItemType">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="userID" type="{http://www.w3.org/2001/XMLSchema}int"/>
 *         &lt;element name="userCode" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="loginName" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="password" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="userName" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="userType" type="{http://www.w3.org/2001/XMLSchema}int"/>
 *         &lt;element name="userSex" type="{http://www.w3.org/2001/XMLSchema}int"/>
 *         &lt;element name="dutyTitle" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="extendInfo" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "UserItemType", propOrder = {
    "userID",
    "userCode",
    "loginName",
    "password",
    "userName",
    "userType",
    "userSex",
    "dutyTitle",
    "extendInfo"
})
public class UserItemType {

    protected int userID;
    @XmlElement(required = true)
    protected String userCode;
    @XmlElement(required = true)
    protected String loginName;
    @XmlElement(required = true)
    protected String password;
    @XmlElement(required = true)
    protected String userName;
    protected int userType;
    protected int userSex;
    @XmlElement(required = true)
    protected String dutyTitle;
    protected String extendInfo;

    /**
     * 获取userID属性的值。
     * 
     */
    public int getUserID() {
        return userID;
    }

    /**
     * 设置userID属性的值。
     * 
     */
    public void setUserID(int value) {
        this.userID = value;
    }

    /**
     * 获取userCode属性的值。
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getUserCode() {
        return userCode;
    }

    /**
     * 设置userCode属性的值。
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setUserCode(String value) {
        this.userCode = value;
    }

    /**
     * 获取loginName属性的值。
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getLoginName() {
        return loginName;
    }

    /**
     * 设置loginName属性的值。
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setLoginName(String value) {
        this.loginName = value;
    }

    /**
     * 获取password属性的值。
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getPassword() {
        return password;
    }

    /**
     * 设置password属性的值。
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setPassword(String value) {
        this.password = value;
    }

    /**
     * 获取userName属性的值。
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getUserName() {
        return userName;
    }

    /**
     * 设置userName属性的值。
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setUserName(String value) {
        this.userName = value;
    }

    /**
     * 获取userType属性的值。
     * 
     */
    public int getUserType() {
        return userType;
    }

    /**
     * 设置userType属性的值。
     * 
     */
    public void setUserType(int value) {
        this.userType = value;
    }

    /**
     * 获取userSex属性的值。
     * 
     */
    public int getUserSex() {
        return userSex;
    }

    /**
     * 设置userSex属性的值。
     * 
     */
    public void setUserSex(int value) {
        this.userSex = value;
    }

    /**
     * 获取dutyTitle属性的值。
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getDutyTitle() {
        return dutyTitle;
    }

    /**
     * 设置dutyTitle属性的值。
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setDutyTitle(String value) {
        this.dutyTitle = value;
    }

    /**
     * 获取extendInfo属性的值。
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getExtendInfo() {
        return extendInfo;
    }

    /**
     * 设置extendInfo属性的值。
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setExtendInfo(String value) {
        this.extendInfo = value;
    }

}
