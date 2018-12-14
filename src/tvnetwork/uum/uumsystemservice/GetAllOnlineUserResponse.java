
package tvnetwork.uum.uumsystemservice;

import java.util.ArrayList;
import java.util.List;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import org.apache.cxf.aegis.type.java5.XmlFlattenedArray;

import tvnetwork.schema.common._2.WSResultType;


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
 *         &lt;element name="allOnlineUser">
 *           &lt;complexType>
 *             &lt;complexContent>
 *               &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *                 &lt;sequence>
 *                   &lt;element name="loginName" type="{http://www.w3.org/2001/XMLSchema}string" maxOccurs="unbounded"/>
 *                 &lt;/sequence>
 *               &lt;/restriction>
 *             &lt;/complexContent>
 *           &lt;/complexType>
 *         &lt;/element>
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
    "allOnlineUser"
})
@XmlRootElement(name = "getAllOnlineUserResponse")
public class GetAllOnlineUserResponse {

    @XmlElement(name = "WSResult", required = true)
    protected WSResultType wsResult;
    @XmlElement(required = true)
    protected GetAllOnlineUserResponse.AllOnlineUser allOnlineUser;

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
     * 获取allOnlineUser属性的值。
     * 
     * @return
     *     possible object is
     *     {@link GetAllOnlineUserResponse.AllOnlineUser }
     *     
     */
    public GetAllOnlineUserResponse.AllOnlineUser getAllOnlineUser() {
        return allOnlineUser;
    }

    /**
     * 设置allOnlineUser属性的值。
     * 
     * @param value
     *     allowed object is
     *     {@link GetAllOnlineUserResponse.AllOnlineUser }
     *     
     */
    public void setAllOnlineUser(GetAllOnlineUserResponse.AllOnlineUser value) {
        this.allOnlineUser = value;
    }


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
     *         &lt;element name="loginName" type="{http://www.w3.org/2001/XMLSchema}string" maxOccurs="unbounded"/>
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
        "loginName"
    })
    public static class AllOnlineUser {

        @XmlElement(required = true)
        protected List<String> loginName;

        /**
         * Gets the value of the loginName property.
         * 
         * <p>
         * This accessor method returns a reference to the live list,
         * not a snapshot. Therefore any modification you make to the
         * returned list will be present inside the JAXB object.
         * This is why there is not a <CODE>set</CODE> method for the loginName property.
         * 
         * <p>
         * For example, to add a new item, do as follows:
         * <pre>
         *    getLoginName().add(newItem);
         * </pre>
         * 
         * 
         * <p>
         * Objects of the following type(s) are allowed in the list
         * {@link String }
         * 
         * 
         */
        @XmlFlattenedArray
        public List<String> getLoginName() {
            if (loginName == null) {
                loginName = new ArrayList<String>();
            }
            return this.loginName;
        }

    }

}
