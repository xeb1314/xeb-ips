
package tvnetwork.uum.uumsystemservice;

import java.util.ArrayList;
import java.util.List;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import tvnetwork.schema.uum._2.SysFunctionType;


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
 *         &lt;element name="sysFunctions" type="{http://TVNetwork/Schema/UUM/2.0}ArrayOfSysFunctionType"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "sysFunctions", propOrder = {
    "sysFunctions"
})
@XmlRootElement(name = "importSysFunctionRequest")
public class ImportSysFunctionRequest {

    @XmlElement(required = true)
    protected List<SysFunctionType> sysFunctions;

    /**
     * Gets the value of the sysFunction property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the sysFunction property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getSysFunction().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link SysFunctionType }
     * 
     * 
     */
    public List<SysFunctionType> getSysFunctions() {
        if (sysFunctions == null) {
            sysFunctions = new ArrayList<SysFunctionType>();
        }
        return this.sysFunctions;
    }

    /**
     * @param sysFunction the sysFunction to set
     */
    public void setSysFunctions(List<SysFunctionType> sysFunction) {
        this.sysFunctions = sysFunction;
    }

}
