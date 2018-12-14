
package tvnetwork.ips.ipssystemservice._1_0;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;
import tvnetwork.schema.common._2.WSResultType;
import tvnetwork.schema.ips._1.ArrayOfDataSourceType;


/**
 * <p>anonymous complex type�� Java �ࡣ
 * 
 * <p>����ģʽƬ��ָ�������ڴ����е�Ԥ�����ݡ�
 * 
 * <pre>
 * &lt;complexType>
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="WSResult" type="{http://TVNetwork/Schema/Common/2.0}WSResultType"/>
 *         &lt;element name="dataSourceList" type="{http://TVNetwork/Schema/IPS/1.0}ArrayOfDataSourceType"/>
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
    "dataSourceList"
})
@XmlRootElement(name = "getDataSourceResponse")
public class GetDataSourceResponse {

    @XmlElement(name = "WSResult", required = true)
    protected WSResultType wsResult;
    @XmlElement(required = true)
    protected ArrayOfDataSourceType dataSourceList;

    /**
     * ��ȡwsResult���Ե�ֵ��
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
     * ����wsResult���Ե�ֵ��
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
     * ��ȡdataSourceList���Ե�ֵ��
     * 
     * @return
     *     possible object is
     *     {@link ArrayOfDataSourceType }
     *     
     */
    public ArrayOfDataSourceType getDataSourceList() {
        return dataSourceList;
    }

    /**
     * ����dataSourceList���Ե�ֵ��
     * 
     * @param value
     *     allowed object is
     *     {@link ArrayOfDataSourceType }
     *     
     */
    public void setDataSourceList(ArrayOfDataSourceType value) {
        this.dataSourceList = value;
    }

}
