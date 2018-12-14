
package tvnetwork.schema.common._2;

import javax.xml.bind.JAXBElement;
import javax.xml.bind.annotation.XmlElementDecl;
import javax.xml.bind.annotation.XmlRegistry;
import javax.xml.namespace.QName;


/**
 * This object contains factory methods for each 
 * Java content interface and Java element interface 
 * generated in the tvnetwork.schema.common._2 package. 
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

    private final static QName _RequestHead_QNAME = new QName("http://TVNetwork/Schema/Common/2.0", "requestHead");

    /**
     * Create a new ObjectFactory that can be used to create new instances of schema derived classes for package: tvnetwork.schema.common._2
     * 
     */
    public ObjectFactory() {
    }

    /**
     * Create an instance of {@link WSResultType }
     * 
     */
    public WSResultType createWSResultType() {
        return new WSResultType();
    }

    /**
     * Create an instance of {@link RequestHeadType }
     * 
     */
    public RequestHeadType createRequestHeadType() {
        return new RequestHeadType();
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link RequestHeadType }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://TVNetwork/Schema/Common/2.0", name = "requestHead")
    public JAXBElement<RequestHeadType> createRequestHead(RequestHeadType value) {
        return new JAXBElement<RequestHeadType>(_RequestHead_QNAME, RequestHeadType.class, null, value);
    }

}
