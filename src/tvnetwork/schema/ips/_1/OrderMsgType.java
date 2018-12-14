
package tvnetwork.schema.ips._1;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;


/**
 * 邮件订阅消息类型
 * 
 * <p>OrderMsgType complex type的 Java 类。
 * 
 * <p>以下模式片段指定包含在此类中的预期内容。
 * 
 * <pre>
 * &lt;complexType name="OrderMsgType">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="LoginName" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="OrderType" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="DataSourceID" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="ExtendAttributes" type="{http://TVNetwork/Schema/IPS/1.0}ArrayOfAttributeItemType" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "OrderMsgType", propOrder = {
    "loginName",
    "orderType",
    "dataSourceID",
    "extendAttributes"
})
public class OrderMsgType {

    @XmlElement(name = "LoginName", required = true)
    protected String loginName;
    @XmlElement(name = "OrderType", required = true)
    protected String orderType;
    @XmlElement(name = "DataSourceID", required = true)
    protected String dataSourceID;
    @XmlElement(name = "ExtendAttributes")
    protected ArrayOfAttributeItemType extendAttributes;

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
     * 获取orderType属性的值。
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getOrderType() {
        return orderType;
    }

    /**
     * 设置orderType属性的值。
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setOrderType(String value) {
        this.orderType = value;
    }

    /**
     * 获取dataSourceID属性的值。
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getDataSourceID() {
        return dataSourceID;
    }

    /**
     * 设置dataSourceID属性的值。
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setDataSourceID(String value) {
        this.dataSourceID = value;
    }

    /**
     * 获取extendAttributes属性的值。
     * 
     * @return
     *     possible object is
     *     {@link ArrayOfAttributeItemType }
     *     
     */
    public ArrayOfAttributeItemType getExtendAttributes() {
        return extendAttributes;
    }

    /**
     * 设置extendAttributes属性的值。
     * 
     * @param value
     *     allowed object is
     *     {@link ArrayOfAttributeItemType }
     *     
     */
    public void setExtendAttributes(ArrayOfAttributeItemType value) {
        this.extendAttributes = value;
    }

}
