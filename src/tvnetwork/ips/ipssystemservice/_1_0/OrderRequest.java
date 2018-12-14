
package tvnetwork.ips.ipssystemservice._1_0;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;
import tvnetwork.schema.ips._1.OrderMsgType;


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
 *         &lt;element name="orderMsg" type="{http://TVNetwork/Schema/IPS/1.0}OrderMsgType"/>
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
    "orderMsg"
})
@XmlRootElement(name = "orderRequest")
public class OrderRequest {

    @XmlElement(required = true)
    protected OrderMsgType orderMsg;

    /**
     * 获取orderMsg属性的值。
     * 
     * @return
     *     possible object is
     *     {@link OrderMsgType }
     *     
     */
    public OrderMsgType getOrderMsg() {
        return orderMsg;
    }

    /**
     * 设置orderMsg属性的值。
     * 
     * @param value
     *     allowed object is
     *     {@link OrderMsgType }
     *     
     */
    public void setOrderMsg(OrderMsgType value) {
        this.orderMsg = value;
    }

}
