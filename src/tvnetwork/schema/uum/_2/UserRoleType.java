
package tvnetwork.schema.uum._2;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;


/**
 * 用户角色类型
 * 
 * <p>UserRoleType complex type的 Java 类。
 * 
 * <p>以下模式片段指定包含在此类中的预期内容。
 * 
 * <pre>
 * &lt;complexType name="UserRoleType">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="roleID" type="{http://www.w3.org/2001/XMLSchema}int"/>
 *         &lt;element name="roleName" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="roleType" type="{http://www.w3.org/2001/XMLSchema}int"/>
 *         &lt;element name="roleDesc" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "UserRoleType", propOrder = {
    "roleID",
    "roleName",
    "roleType",
    "roleDesc"
})
public class UserRoleType {

    protected int roleID;
    @XmlElement(required = true)
    protected String roleName;
    protected int roleType;
    protected String roleDesc;

    /**
     * 获取roleID属性的值。
     * 
     */
    public int getRoleID() {
        return roleID;
    }

    /**
     * 设置roleID属性的值。
     * 
     */
    public void setRoleID(int value) {
        this.roleID = value;
    }

    /**
     * 获取roleName属性的值。
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getRoleName() {
        return roleName;
    }

    /**
     * 设置roleName属性的值。
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setRoleName(String value) {
        this.roleName = value;
    }

    /**
     * 获取roleType属性的值。
     * 
     */
    public int getRoleType() {
        return roleType;
    }

    /**
     * 设置roleType属性的值。
     * 
     */
    public void setRoleType(int value) {
        this.roleType = value;
    }

    /**
     * 获取roleDesc属性的值。
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getRoleDesc() {
        return roleDesc;
    }

    /**
     * 设置roleDesc属性的值。
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setRoleDesc(String value) {
        this.roleDesc = value;
    }

}
