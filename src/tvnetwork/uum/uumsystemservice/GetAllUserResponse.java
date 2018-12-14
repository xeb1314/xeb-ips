
package tvnetwork.uum.uumsystemservice;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;
import tvnetwork.schema.common._2.WSResultType;
import tvnetwork.schema.uum._2.UserAllInfoType;


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
 *         &lt;element name="allUser" type="{http://TVNetwork/Schema/UUM/2.0}UserAllInfoType"/>
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
    "allUser"
})
@XmlRootElement(name = "getAllUserResponse")
public class GetAllUserResponse {

    @XmlElement(name = "WSResult", required = true)
    protected WSResultType wsResult;
    @XmlElement(required = true)
    protected UserAllInfoType allUser;

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
     * 获取allUser属性的值。
     * 
     * @return
     *     possible object is
     *     {@link UserAllInfoType }
     *     
     */
    public UserAllInfoType getAllUser() {
        return allUser;
    }

    /**
     * 设置allUser属性的值。
     * 
     * @param value
     *     allowed object is
     *     {@link UserAllInfoType }
     *     
     */
    public void setAllUser(UserAllInfoType value) {
        this.allUser = value;
    }

}
