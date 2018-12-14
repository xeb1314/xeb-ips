
package tvnetwork.schema.uum._2;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;


/**
 * 用户组类型
 * 
 * <p>UserGroupType complex type的 Java 类。
 * 
 * <p>以下模式片段指定包含在此类中的预期内容。
 * 
 * <pre>
 * &lt;complexType name="UserGroupType">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="groupID" type="{http://www.w3.org/2001/XMLSchema}int"/>
 *         &lt;element name="parentID" type="{http://www.w3.org/2001/XMLSchema}int"/>
 *         &lt;element name="groupCode" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="groupName" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="groupType" type="{http://www.w3.org/2001/XMLSchema}int"/>
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
@XmlType(name = "UserGroupType", propOrder = {
    "groupID",
    "parentID",
    "groupCode",
    "groupName",
    "groupType",
    "extendInfo"
})
public class UserGroupType {

    protected int groupID;
    protected int parentID;
    @XmlElement(required = true)
    protected String groupCode;
    @XmlElement(required = true)
    protected String groupName;
    protected int groupType;
    protected String extendInfo;

    /**
     * 获取groupID属性的值。
     * 
     */
    public int getGroupID() {
        return groupID;
    }

    /**
     * 设置groupID属性的值。
     * 
     */
    public void setGroupID(int value) {
        this.groupID = value;
    }

    /**
     * 获取parentID属性的值。
     * 
     */
    public int getParentID() {
        return parentID;
    }

    /**
     * 设置parentID属性的值。
     * 
     */
    public void setParentID(int value) {
        this.parentID = value;
    }

    /**
     * 获取groupCode属性的值。
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getGroupCode() {
        return groupCode;
    }

    /**
     * 设置groupCode属性的值。
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setGroupCode(String value) {
        this.groupCode = value;
    }

    /**
     * 获取groupName属性的值。
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getGroupName() {
        return groupName;
    }

    /**
     * 设置groupName属性的值。
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setGroupName(String value) {
        this.groupName = value;
    }

    /**
     * 获取groupType属性的值。
     * 
     */
    public int getGroupType() {
        return groupType;
    }

    /**
     * 设置groupType属性的值。
     * 
     */
    public void setGroupType(int value) {
        this.groupType = value;
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
