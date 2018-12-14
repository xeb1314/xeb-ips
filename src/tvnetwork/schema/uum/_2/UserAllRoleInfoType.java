
package tvnetwork.schema.uum._2;

import java.util.ArrayList;
import java.util.List;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;

import org.apache.cxf.aegis.type.java5.XmlFlattenedArray;


/**
 * 用户与角色全部信息类型
 * 
 * <p>UserAllRoleInfoType complex type的 Java 类。
 * 
 * <p>以下模式片段指定包含在此类中的预期内容。
 * 
 * <pre>
 * &lt;complexType name="UserAllRoleInfoType">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="roleList" type="{http://TVNetwork/Schema/UUM/2.0}UserRoleType" maxOccurs="unbounded"/>
 *         &lt;element name="userToRoleList" type="{http://TVNetwork/Schema/UUM/2.0}UserToRoleType" maxOccurs="unbounded"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "UserAllRoleInfoType", propOrder = {
    "roleList",
    "userToRoleList"
})
public class UserAllRoleInfoType {

    @XmlElement(required = true)
    protected List<UserRoleType> roleList;
    @XmlElement(required = true)
    protected List<UserToRoleType> userToRoleList;

    /**
     * Gets the value of the roleList property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the roleList property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getRoleList().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link UserRoleType }
     * 
     * 
     */
    @XmlFlattenedArray
    public List<UserRoleType> getRoleList() {
        if (roleList == null) {
            roleList = new ArrayList<UserRoleType>();
        }
        return this.roleList;
    }

    /**
     * Gets the value of the userToRoleList property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the userToRoleList property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getUserToRoleList().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link UserToRoleType }
     * 
     * 
     */
    @XmlFlattenedArray
    public List<UserToRoleType> getUserToRoleList() {
        if (userToRoleList == null) {
            userToRoleList = new ArrayList<UserToRoleType>();
        }
        return this.userToRoleList;
    }

}
