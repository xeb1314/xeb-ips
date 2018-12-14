
package tvnetwork.schema.uum._2;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;


/**
 * 用户与用户组全部信息类型
 * 
 * <p>UserAllInfoType complex type的 Java 类。
 * 
 * <p>以下模式片段指定包含在此类中的预期内容。
 * 
 * <pre>
 * &lt;complexType name="UserAllInfoType">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="userList" type="{http://TVNetwork/Schema/UUM/2.0}ArrayOfUserItemType"/>
 *         &lt;element name="groupList" type="{http://TVNetwork/Schema/UUM/2.0}ArrayOfUserGroupType"/>
 *         &lt;element name="mapList" type="{http://TVNetwork/Schema/UUM/2.0}ArrayOfUserGroupMapType"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "UserAllInfoType", propOrder = {
    "userList",
    "groupList",
    "mapList"
})
public class UserAllInfoType {

    @XmlElement(required = true)
    protected ArrayOfUserItemType userList;
    @XmlElement(required = true)
    protected ArrayOfUserGroupType groupList;
    @XmlElement(required = true)
    protected ArrayOfUserGroupMapType mapList;

    /**
     * 获取userList属性的值。
     * 
     * @return
     *     possible object is
     *     {@link ArrayOfUserItemType }
     *     
     */
    public ArrayOfUserItemType getUserList() {
        return userList;
    }

    /**
     * 设置userList属性的值。
     * 
     * @param value
     *     allowed object is
     *     {@link ArrayOfUserItemType }
     *     
     */
    public void setUserList(ArrayOfUserItemType value) {
        this.userList = value;
    }

    /**
     * 获取groupList属性的值。
     * 
     * @return
     *     possible object is
     *     {@link ArrayOfUserGroupType }
     *     
     */
    public ArrayOfUserGroupType getGroupList() {
        return groupList;
    }

    /**
     * 设置groupList属性的值。
     * 
     * @param value
     *     allowed object is
     *     {@link ArrayOfUserGroupType }
     *     
     */
    public void setGroupList(ArrayOfUserGroupType value) {
        this.groupList = value;
    }

    /**
     * 获取mapList属性的值。
     * 
     * @return
     *     possible object is
     *     {@link ArrayOfUserGroupMapType }
     *     
     */
    public ArrayOfUserGroupMapType getMapList() {
        return mapList;
    }

    /**
     * 设置mapList属性的值。
     * 
     * @param value
     *     allowed object is
     *     {@link ArrayOfUserGroupMapType }
     *     
     */
    public void setMapList(ArrayOfUserGroupMapType value) {
        this.mapList = value;
    }

}
