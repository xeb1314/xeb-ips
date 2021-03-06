package tvnetwork.ips.ipssystemservice._1_0;

import javax.jws.WebMethod;
import javax.jws.WebParam;
import javax.jws.WebResult;
import javax.jws.WebService;
import javax.jws.soap.SOAPBinding;
import javax.xml.bind.annotation.XmlSeeAlso;

/**
 * This class was generated by Apache CXF 3.0.0-milestone2
 * 2015-03-30T21:26:30.376+08:00
 * Generated source version: 3.0.0-milestone2
 * 
 */
@WebService(targetNamespace = "http://TVNetwork/IPS/IPSSystemService/1.0", name = "IPSSystemServicePort")
@XmlSeeAlso({tvnetwork.schema.ips._1.ObjectFactory.class, tvnetwork.schema.common._2.ObjectFactory.class, ObjectFactory.class})
@SOAPBinding(parameterStyle = SOAPBinding.ParameterStyle.BARE)
public interface IPSSystemServicePort {

    @WebResult(name = "getDataSourceResponse", targetNamespace = "http://TVNetwork/IPS/IPSSystemService/1.0", partName = "getDataSourceResponse")
    @WebMethod(action = "http://TVNetwork/IPS/IPSSystemService/1.0/getDataSource")
    public GetDataSourceResponse getDataSource(
        @WebParam(partName = "requestHead", name = "requestHead", targetNamespace = "http://TVNetwork/Schema/Common/2.0", header = true)
        tvnetwork.schema.common._2.RequestHeadType requestHead,
        @WebParam(partName = "getDataSourceRequest", name = "getDataSourceRequest", targetNamespace = "http://TVNetwork/IPS/IPSSystemService/1.0")
        GetDataSourceRequest getDataSourceRequest
    );

    @WebResult(name = "orderResponse", targetNamespace = "http://TVNetwork/IPS/IPSSystemService/1.0", partName = "orderResponse")
    @WebMethod(action = "http://TVNetwork/IPS/IPSSystemService/1.0/orderMail")
    public OrderResponse order(
        @WebParam(partName = "requestHead", name = "requestHead", targetNamespace = "http://TVNetwork/Schema/Common/2.0", header = true)
        tvnetwork.schema.common._2.RequestHeadType requestHead,
        @WebParam(partName = "orderRequest", name = "orderRequest", targetNamespace = "http://TVNetwork/IPS/IPSSystemService/1.0")
        OrderRequest orderRequest
    );
}
