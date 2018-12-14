
package tvnetwork.schema.ips._1;

import javax.xml.bind.JAXBElement;
import javax.xml.bind.annotation.XmlElementDecl;
import javax.xml.bind.annotation.XmlRegistry;
import javax.xml.namespace.QName;


/**
 * This object contains factory methods for each 
 * Java content interface and Java element interface 
 * generated in the tvnetwork.schema.ips._1 package. 
 * <p>An ObjectFactory allows you to programatically 
 * construct new instances of the Java representation 
 * for XML content. The Java representation of XML 
 * content can consist of schema derived interfaces 
 * and classes representing the binding of schema 
 * type definitions, element declarations and model 
 * groups.  Factory methods for each of these are 
 * provided in this class.
 * 
 */
@XmlRegistry
public class ObjectFactory {

    private final static QName _ExtendAttributes_QNAME = new QName("http://TVNetwork/Schema/IPS/1.0", "ExtendAttributes");
    private final static QName _DataSource_QNAME = new QName("http://TVNetwork/Schema/IPS/1.0", "dataSource");

    /**
     * Create a new ObjectFactory that can be used to create new instances of schema derived classes for package: tvnetwork.schema.ips._1
     * 
     */
    public ObjectFactory() {
    }

    /**
     * Create an instance of {@link OrderMsgType }
     * 
     */
    public OrderMsgType createOrderMsgType() {
        return new OrderMsgType();
    }

    /**
     * Create an instance of {@link ArrayOfDataSourceType }
     * 
     */
    public ArrayOfDataSourceType createArrayOfDataSourceType() {
        return new ArrayOfDataSourceType();
    }

    /**
     * Create an instance of {@link ArrayOfAttributeItemType }
     * 
     */
    public ArrayOfAttributeItemType createArrayOfAttributeItemType() {
        return new ArrayOfAttributeItemType();
    }

    /**
     * Create an instance of {@link DataSourceType }
     * 
     */
    public DataSourceType createDataSourceType() {
        return new DataSourceType();
    }

    /**
     * Create an instance of {@link AttributeItemType }
     * 
     */
    public AttributeItemType createAttributeItemType() {
        return new AttributeItemType();
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link ArrayOfAttributeItemType }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://TVNetwork/Schema/IPS/1.0", name = "ExtendAttributes")
    public JAXBElement<ArrayOfAttributeItemType> createExtendAttributes(ArrayOfAttributeItemType value) {
        return new JAXBElement<ArrayOfAttributeItemType>(_ExtendAttributes_QNAME, ArrayOfAttributeItemType.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link DataSourceType }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://TVNetwork/Schema/IPS/1.0", name = "dataSource")
    public JAXBElement<DataSourceType> createDataSource(DataSourceType value) {
        return new JAXBElement<DataSourceType>(_DataSource_QNAME, DataSourceType.class, null, value);
    }

}
