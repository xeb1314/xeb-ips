
package tvnetwork.schema.uum._2;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlType;


/**
 * 用户角色授权信息类型
 * 
 * <p>UserRoleAuthorityType complex type的 Java 类。
 * 
 * <p>以下模式片段指定包含在此类中的预期内容。
 * 
 * <pre>
 * &lt;complexType name="UserRoleAuthorityType">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="roleID" type="{http://www.w3.org/2001/XMLSchema}int"/>
 *         &lt;element name="functionID" type="{http://www.w3.org/2001/XMLSchema}int"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "UserRoleAuthorityType", propOrder = {
    "roleID",
    "functionID"
})
public class UserRoleAuthorityType {

    protected int roleID;
    protected int functionID;

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
     * 获取functionID属性的值。
     * 
     */
    public int getFunctionID() {
        return functionID;
    }

    /**
     * 设置functionID属性的值。
     * 
     */
    public void setFunctionID(int value) {
        this.functionID = value;
    }

}
