/**
 *
 	<xs:element name="getOnlineUserByNameRequest">
				<xs:complexType>
					<xs:sequence>
						<xs:element name="loginName" type="xs:string"/>
					</xs:sequence>
				</xs:complexType>
			</xs:element>
 */

package tvnetwork.uum.uumsystemservice;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "", propOrder = {
    "loginName"
})
@XmlRootElement(name = "getOnlineUserByNameRequest")
public class GetOnlineUserByNameRequest{
	
	@XmlElement(required = true)
    private String loginName;

    /**
     * Gets the loginName value for this GetOnlineUserByNameRequest.
     * 
     * @return loginName
     */
    public String getLoginName() {
        return loginName;
    }


    /**
     * Sets the loginName value for this GetOnlineUserByNameRequest.
     * 
     * @param loginName
     */
    public void setLoginName(String loginName) {
        this.loginName = loginName;
    }
}
