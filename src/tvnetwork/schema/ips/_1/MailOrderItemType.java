
package tvnetwork.schema.ips._1;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;


/**
 * 邮件订阅条目类型
 * 
 * <p>MailOrderItemType complex type的 Java 类。
 * 
 * <p>以下模式片段指定包含在此类中的预期内容。
 * 
 * <pre>
 * &lt;complexType name="MailOrderItemType">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="mailID" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="emlPath" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="xmlPath" type="{http://www.w3.org/2001/XMLSchema}string"/>
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
@XmlType(name = "MailOrderItemType", propOrder = {
    "mailID",
    "emlPath",
    "xmlPath",
    "extendInfo"
})
public class MailOrderItemType {

    @XmlElement(required = true)
    protected String mailID;
    @XmlElement(required = true)
    protected String emlPath;
    @XmlElement(required = true)
    protected String xmlPath;
    protected String extendInfo;

    /**
     * 获取mailID属性的值。
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getMailID() {
        return mailID;
    }

    /**
     * 设置mailID属性的值。
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setMailID(String value) {
        this.mailID = value;
    }

    /**
     * 获取emlPath属性的值。
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getEmlPath() {
        return emlPath;
    }

    /**
     * 设置emlPath属性的值。
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setEmlPath(String value) {
        this.emlPath = value;
    }

    /**
     * 获取xmlPath属性的值。
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getXmlPath() {
        return xmlPath;
    }

    /**
     * 设置xmlPath属性的值。
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setXmlPath(String value) {
        this.xmlPath = value;
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
