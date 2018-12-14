package jetsennet.juum.iface;

import javax.jws.WebMethod;
import javax.jws.WebParam;
import javax.jws.WebResult;
import javax.jws.WebService;
import javax.jws.soap.SOAPBinding;
import javax.xml.bind.annotation.XmlSeeAlso;

import tvnetwork.uum.uumsystemservice.GetAllOnlineUserRequest;
import tvnetwork.uum.uumsystemservice.GetAllOnlineUserResponse;
import tvnetwork.uum.uumsystemservice.GetAllUserRequest;
import tvnetwork.uum.uumsystemservice.GetAllUserResponse;
import tvnetwork.uum.uumsystemservice.GetAllUserRoleRequest;
import tvnetwork.uum.uumsystemservice.GetAllUserRoleResponse;
import tvnetwork.uum.uumsystemservice.GetOnlineUserByNameRequest;
import tvnetwork.uum.uumsystemservice.GetOnlineUserByNameResponse;
import tvnetwork.uum.uumsystemservice.GetRoleAuthorityRequest;
import tvnetwork.uum.uumsystemservice.GetRoleAuthorityResponse;
import tvnetwork.uum.uumsystemservice.GetUserItemRequest;
import tvnetwork.uum.uumsystemservice.GetUserItemResponse;
import tvnetwork.uum.uumsystemservice.ImportSysFunctionRequest;
import tvnetwork.uum.uumsystemservice.ImportSysFunctionResponse;
import tvnetwork.uum.uumsystemservice.ObjectFactory;
import tvnetwork.uum.uumsystemservice.UserLoginRequest;
import tvnetwork.uum.uumsystemservice.UserLoginResponse;
import tvnetwork.uum.uumsystemservice.UserLogoutRequest;
import tvnetwork.uum.uumsystemservice.UserLogoutResponse;
import tvnetwork.uum.uumsystemservice.UserModifyPwdRequest;
import tvnetwork.uum.uumsystemservice.UserModifyPwdResponse;

@WebService(targetNamespace = "http://TVNetwork/UUM/UUMSystemService/2.0", name = "UUMSystemExtService")
@XmlSeeAlso({ObjectFactory.class, tvnetwork.schema.uum._2.ObjectFactory.class, tvnetwork.schema.common._2.ObjectFactory.class})
@SOAPBinding(parameterStyle = SOAPBinding.ParameterStyle.BARE)
public interface UUMSystemServicePort {

    @WebResult(name = "userLoginResponse", targetNamespace = "http://TVNetwork/UUM/UUMSystemService/2.0", partName = "userLoginResponse")
    @WebMethod(action = "http://TVNetwork/UUM/UUMSystemService/2.0/userLogin")
    public UserLoginResponse userLogin(
        @WebParam(partName = "requestHead", name = "requestHead", targetNamespace = "http://TVNetwork/Schema/Common/2.0", header = true)
        tvnetwork.schema.common._2.RequestHeadType requestHead,
        @WebParam(partName = "userLoginRequest", name = "userLoginRequest", targetNamespace = "http://TVNetwork/UUM/UUMSystemService/2.0")
        UserLoginRequest userLoginRequest
    );
    
    @WebResult(name = "getAllOnlineUserResponse", targetNamespace = "http://TVNetwork/UUM/UUMSystemService/2.0", partName = "getAllOnlineUserResponse")
    @WebMethod(action = "http://TVNetwork/UUM/UUMSystemService/2.0/getAllOnlineUser")
    public GetAllOnlineUserResponse getAllOnlineUser(
        @WebParam(partName = "requestHead", name = "requestHead", targetNamespace = "http://TVNetwork/Schema/Common/2.0", header = true)
        tvnetwork.schema.common._2.RequestHeadType requestHead,
        @WebParam(partName = "getAllOnlineUserRequest", name = "getAllOnlineUserRequest", targetNamespace = "http://TVNetwork/UUM/UUMSystemService/2.0")
        GetAllOnlineUserRequest getAllOnlineUserRequest
    );

    @WebResult(name = "userModifyPwdResponse", targetNamespace = "http://TVNetwork/UUM/UUMSystemService/2.0", partName = "userModifyPwdResponse")
    @WebMethod(action = "http://TVNetwork/UUM/UUMSystemService/2.0/userModifyPwd")
    public UserModifyPwdResponse userModifyPwd(
        @WebParam(partName = "requestHead", name = "requestHead", targetNamespace = "http://TVNetwork/Schema/Common/2.0", header = true)
        tvnetwork.schema.common._2.RequestHeadType requestHead,
        @WebParam(partName = "userModifyPwdRequest", name = "userModifyPwdRequest", targetNamespace = "http://TVNetwork/UUM/UUMSystemService/2.0")
        UserModifyPwdRequest userModifyPwdRequest
    );

    @WebResult(name = "getAllUserResponse", targetNamespace = "http://TVNetwork/UUM/UUMSystemService/2.0", partName = "getAllUserResponse")
    @WebMethod(action = "http://TVNetwork/UUM/UUMSystemService/2.0/getAllUser")
    public GetAllUserResponse getAllUser(
        @WebParam(partName = "requestHead", name = "requestHead", targetNamespace = "http://TVNetwork/Schema/Common/2.0", header = true)
        tvnetwork.schema.common._2.RequestHeadType requestHead,
        @WebParam(partName = "getAllUserRequest", name = "getAllUserRequest", targetNamespace = "http://TVNetwork/UUM/UUMSystemService/2.0")
        GetAllUserRequest getAllUserRequest
    );

    @WebResult(name = "getUserItemResponse", targetNamespace = "http://TVNetwork/UUM/UUMSystemService/2.0", partName = "getUserItemResponse")
    @WebMethod(action = "http://TVNetwork/UUM/UUMSystemService/2.0/getUserItem")
    public GetUserItemResponse getUserItem(
        @WebParam(partName = "requestHead", name = "requestHead", targetNamespace = "http://TVNetwork/Schema/Common/2.0", header = true)
        tvnetwork.schema.common._2.RequestHeadType requestHead,
        @WebParam(partName = "getUserItemRequest", name = "getUserItemRequest", targetNamespace = "http://TVNetwork/UUM/UUMSystemService/2.0")
        GetUserItemRequest getUserItemRequest
    );

    @WebResult(name = "userLogoutResponse", targetNamespace = "http://TVNetwork/UUM/UUMSystemService/2.0", partName = "userLogoutResponse")
    @WebMethod(action = "http://TVNetwork/UUM/UUMSystemService/2.0/userLogout")
    public UserLogoutResponse userLogout(
        @WebParam(partName = "requestHead", name = "requestHead", targetNamespace = "http://TVNetwork/Schema/Common/2.0", header = true)
        tvnetwork.schema.common._2.RequestHeadType requestHead,
        @WebParam(partName = "userLogoutRequest", name = "userLogoutRequest", targetNamespace = "http://TVNetwork/UUM/UUMSystemService/2.0")
        UserLogoutRequest userLogoutRequest
    );
    
    @WebResult(name = "importSysFunctionResponse", targetNamespace = "http://TVNetwork/UUM/UUMSystemService/2.0", partName = "importSysFunctionResponse")
    @WebMethod(action = "http://TVNetwork/UUM/UUMSystemService/2.0/importSysFunction")
    public ImportSysFunctionResponse importSysFunction(
        @WebParam(partName = "requestHead", name = "requestHead", targetNamespace = "http://TVNetwork/Schema/Common/2.0", header = true)
        tvnetwork.schema.common._2.RequestHeadType requestHead,
        @WebParam(partName = "importSysFunctionRequest", name = "importSysFunctionRequest", targetNamespace = "http://TVNetwork/UUM/UUMSystemService/2.0")
        ImportSysFunctionRequest importSysFunctionRequest
    );
    
    @WebResult(name = "getAllUserRoleResponse", targetNamespace = "http://TVNetwork/UUM/UUMSystemService/2.0", partName = "getAllUserRoleResponse")
    @WebMethod(action = "http://TVNetwork/UUM/UUMSystemService/2.0/getAllUserRole")
    public GetAllUserRoleResponse getAllUserRole(
        @WebParam(partName = "requestHead", name = "requestHead", targetNamespace = "http://TVNetwork/Schema/Common/2.0", header = true)
        tvnetwork.schema.common._2.RequestHeadType requestHead,
        @WebParam(partName = "getAllUserRoleRequest", name = "getAllUserRoleRequest", targetNamespace = "http://TVNetwork/UUM/UUMSystemService/2.0")
        GetAllUserRoleRequest getAllUserRoleRequest
    );
    
    @WebResult(name = "getRoleAuthorityResponse", targetNamespace = "http://TVNetwork/UUM/UUMSystemService/2.0", partName = "getRoleAuthorityResponse")
    @WebMethod(action = "http://TVNetwork/UUM/UUMSystemService/2.0/getRoleAuthority")
    public GetRoleAuthorityResponse getRoleAuthority(
        @WebParam(partName = "requestHead", name = "requestHead", targetNamespace = "http://TVNetwork/Schema/Common/2.0", header = true)
        tvnetwork.schema.common._2.RequestHeadType requestHead,
        @WebParam(partName = "getRoleAuthorityRequest", name = "getRoleAuthorityRequest", targetNamespace = "http://TVNetwork/UUM/UUMSystemService/2.0")
        GetRoleAuthorityRequest getRoleAuthorityRequest
    );
    
    @WebResult(name = "getOnlineUserByNameResponse", targetNamespace = "http://TVNetwork/UUM/UUMSystemService/2.0", partName = "getOnlineUserByNameResponse")
    @WebMethod(action = "http://TVNetwork/UUM/UUMSystemService/2.0/getOnlineUserByName")
    public GetOnlineUserByNameResponse getOnlineUserByName(
        @WebParam(partName = "requestHead", name = "requestHead", targetNamespace = "http://TVNetwork/Schema/Common/2.0", header = true)
        tvnetwork.schema.common._2.RequestHeadType requestHead,
        @WebParam(partName = "getOnlineUserByNameRequest", name = "getOnlineUserByNameRequest", targetNamespace = "http://TVNetwork/UUM/UUMSystemService/2.0")
        GetOnlineUserByNameRequest getOnlineUserByNameRequest
    );
}