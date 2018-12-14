
package tvnetwork.schema.ips._1;

import java.util.ArrayList;
import java.util.List;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;

import org.apache.cxf.aegis.type.java5.XmlFlattenedArray;


/**
 * 邮件订阅集合类型
 * 
 * <p>ArrayOfMailOrderItemType complex type的 Java 类。
 * 
 * <p>以下模式片段指定包含在此类中的预期内容。
 * 
 * <pre>
 * &lt;complexType name="ArrayOfMailOrderItemType">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="mailItem" type="{http://TVNetwork/Schema/IPS/1.0}MailOrderItemType" maxOccurs="unbounded"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "ArrayOfMailOrderItemType", propOrder = {
    "mailItem"
})
public class ArrayOfMailOrderItemType {

    @XmlElement(required = true)
    protected List<MailOrderItemType> mailItem;

    /**
     * Gets the value of the mailItem property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the mailItem property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getMailItem().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link MailOrderItemType }
     * 
     * 
     */
    @XmlFlattenedArray
    public List<MailOrderItemType> getMailItem() {
        if (mailItem == null) {
            mailItem = new ArrayList<MailOrderItemType>();
        }
        return this.mailItem;
    }

}
