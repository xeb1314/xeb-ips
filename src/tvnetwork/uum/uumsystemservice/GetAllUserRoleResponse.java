
package tvnetwork.uum.uumsystemservice;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;
import tvnetwork.schema.common._2.WSResultType;
import tvnetwork.schema.uum._2.UserAllRoleInfoType;


/**
 * <p>anonymous complex type的 Java 类。
 * 
 * <p>以下模式片段指定包含在此类中的预期内容。
 * 
 * <pre>
 * &lt;complexType>
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="WSResult" type="{http://TVNetwork/Schema/Common/2.0}WSResultType"/>
 *         &lt;element name="allUserRole" type="{http://TVNetwork/Schema/UUM/2.0}UserAllRoleInfoType"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "", propOrder = {
    "wsResult",
    "allUserRole"
})
@XmlRootElement(name = "getAllUserRoleResponse")
public class GetAllUserRoleResponse {

    @XmlElement(name = "WSResult", required = true)
    protected WSResultType wsResult;
    @XmlElement(required = true)
    protected UserAllRoleInfoType allUserRole;

    /**
     * 获取wsResult属性的值。
     * 
     * @return
     *     possible object is
     *     {@link WSResultType }
     *     
     */
    public WSResultType getWSResult() {
        return wsResult;
    }

    /**
     * 设置wsResult属性的值。
     * 
     * @param value
     *     allowed object is
     *     {@link WSResultType }
     *     
     */
    public void setWSResult(WSResultType value) {
        this.wsResult = value;
    }

    /**
     * 获取allUserRole属性的值。
     * 
     * @return
     *     possible object is
     *     {@link UserAllRoleInfoType }
     *     
     */
    public UserAllRoleInfoType getAllUserRole() {
        return allUserRole;
    }

    /**
     * 设置allUserRole属性的值。
     * 
     * @param value
     *     allowed object is
     *     {@link UserAllRoleInfoType }
     *     
     */
    public void setAllUserRole(UserAllRoleInfoType value) {
        this.allUserRole = value;
    }

}
