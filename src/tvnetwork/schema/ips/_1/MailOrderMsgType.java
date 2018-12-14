
package tvnetwork.schema.ips._1;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;


/**
 * 邮件订阅消息类型
 * 
 * <p>MailOrderMsgType complex type的 Java 类。
 * 
 * <p>以下模式片段指定包含在此类中的预期内容。
 * 
 * <pre>
 * &lt;complexType name="MailOrderMsgType">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="dsID" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="srcIP" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="srcPort" type="{http://www.w3.org/2001/XMLSchema}int"/>
 *         &lt;element name="dstIP" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="dstPort" type="{http://www.w3.org/2001/XMLSchema}int"/>
 *         &lt;element name="protocol" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="sendUser" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="recvUser" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="subject" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="content" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="notifyURL" type="{http://www.w3.org/2001/XMLSchema}string"/>
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
@XmlType(name = "MailOrderMsgType", propOrder = {
    "dsID",
    "srcIP",
    "srcPort",
    "dstIP",
    "dstPort",
    "protocol",
    "sendUser",
    "recvUser",
    "subject",
    "content",
    "notifyURL",
    "extendInfo"
})
public class MailOrderMsgType {

    @XmlElement(required = true)
    protected String dsID;
    @XmlElement(required = true)
    protected String srcIP;
    protected int srcPort;
    @XmlElement(required = true)
    protected String dstIP;
    protected int dstPort;
    @XmlElement(required = true)
    protected String protocol;
    @XmlElement(required = true)
    protected String sendUser;
    @XmlElement(required = true)
    protected String recvUser;
    @XmlElement(required = true)
    protected String subject;
    @XmlElement(required = true)
    protected String content;
    @XmlElement(required = true)
    protected String notifyURL;
    protected String extendInfo;

    /**
     * 获取dsID属性的值。
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getDsID() {
        return dsID;
    }

    /**
     * 设置dsID属性的值。
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setDsID(String value) {
        this.dsID = value;
    }

    /**
     * 获取srcIP属性的值。
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getSrcIP() {
        return srcIP;
    }

    /**
     * 设置srcIP属性的值。
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setSrcIP(String value) {
        this.srcIP = value;
    }

    /**
     * 获取srcPort属性的值。
     * 
     */
    public int getSrcPort() {
        return srcPort;
    }

    /**
     * 设置srcPort属性的值。
     * 
     */
    public void setSrcPort(int value) {
        this.srcPort = value;
    }

    /**
     * 获取dstIP属性的值。
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getDstIP() {
        return dstIP;
    }

    /**
     * 设置dstIP属性的值。
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setDstIP(String value) {
        this.dstIP = value;
    }

    /**
     * 获取dstPort属性的值。
     * 
     */
    public int getDstPort() {
        return dstPort;
    }

    /**
     * 设置dstPort属性的值。
     * 
     */
    public void setDstPort(int value) {
        this.dstPort = value;
    }

    /**
     * 获取protocol属性的值。
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getProtocol() {
        return protocol;
    }

    /**
     * 设置protocol属性的值。
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setProtocol(String value) {
        this.protocol = value;
    }

    /**
     * 获取sendUser属性的值。
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getSendUser() {
        return sendUser;
    }

    /**
     * 设置sendUser属性的值。
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setSendUser(String value) {
        this.sendUser = value;
    }

    /**
     * 获取recvUser属性的值。
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getRecvUser() {
        return recvUser;
    }

    /**
     * 设置recvUser属性的值。
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setRecvUser(String value) {
        this.recvUser = value;
    }

    /**
     * 获取subject属性的值。
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getSubject() {
        return subject;
    }

    /**
     * 设置subject属性的值。
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setSubject(String value) {
        this.subject = value;
    }

    /**
     * 获取content属性的值。
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getContent() {
        return content;
    }

    /**
     * 设置content属性的值。
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setContent(String value) {
        this.content = value;
    }

    /**
     * 获取notifyURL属性的值。
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getNotifyURL() {
        return notifyURL;
    }

    /**
     * 设置notifyURL属性的值。
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setNotifyURL(String value) {
        this.notifyURL = value;
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
