
package tvnetwork.schema.uum._2;

import java.util.ArrayList;
import java.util.List;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;

import org.apache.cxf.aegis.type.java5.XmlFlattenedArray;


/**
 * <p>ArrayOfUserGroupMapType complex type的 Java 类。
 * 
 * <p>以下模式片段指定包含在此类中的预期内容。
 * 
 * <pre>
 * &lt;complexType name="ArrayOfUserGroupMapType">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="userGroupMap" type="{http://TVNetwork/Schema/UUM/2.0}UserGroupMapType" maxOccurs="unbounded"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "ArrayOfUserGroupMapType", propOrder = {
    "userGroupMap"
})
public class ArrayOfUserGroupMapType {

    @XmlElement(required = true)
    protected List<UserGroupMapType> userGroupMap;

    /**
     * Gets the value of the userGroupMap property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the userGroupMap property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getUserGroupMap().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link UserGroupMapType }
     * 
     * 
     */
    @XmlFlattenedArray
    public List<UserGroupMapType> getUserGroupMap() {
        if (userGroupMap == null) {
            userGroupMap = new ArrayList<UserGroupMapType>();
        }
        return this.userGroupMap;
    }

}
