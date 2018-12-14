
package tvnetwork.schema.ips._1;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;


/**
 * �ʼ�������Ϣ����
 * 
 * <p>OrderMsgType complex type�� Java �ࡣ
 * 
 * <p>����ģʽƬ��ָ�������ڴ����е�Ԥ�����ݡ�
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
     * ��ȡloginName���Ե�ֵ��
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
     * ����loginName���Ե�ֵ��
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
     * ��ȡorderType���Ե�ֵ��
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
     * ����orderType���Ե�ֵ��
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
     * ��ȡdataSourceID���Ե�ֵ��
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
     * ����dataSourceID���Ե�ֵ��
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
     * ��ȡextendAttributes���Ե�ֵ��
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
     * ����extendAttributes���Ե�ֵ��
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
