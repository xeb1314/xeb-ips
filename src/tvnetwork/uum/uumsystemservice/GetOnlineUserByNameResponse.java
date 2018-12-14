/**
		<xs:element name="getOnlineUserByNameResponse">
				<xs:complexType>
					<xs:sequence>
						<xs:element name="WSResult" type="nspub:WSResultType"/>
						<xs:element name="onlineUserInfo" type="nsuum:UserOnlineInfoType"/>
					</xs:sequence>
				</xs:complexType>
			</xs:element>
 */

package tvnetwork.uum.uumsystemservice;

import java.util.List;
import java.util.Set;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

import tvnetwork.schema.uum._2.UserOnlineInfoType;

import jetsennet.frame.security.UserProfileInfo;


@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "", propOrder = {
    "wsResult",
    "onlineUserInfo"
})
@XmlRootElement(name = "getOnlineUserByNameResponse")
public class GetOnlineUserByNameResponse{
	@XmlElement(name = "WSResult", required = true)
    private tvnetwork.schema.common._2.WSResultType wsResult;
    private tvnetwork.schema.uum._2.UserOnlineInfoType onlineUserInfo;
//    private Set<UserOnlineInfoType> userOnlines;

    /**
     * Gets the WSResult value for this GetOnlineUserByNameResponse.
     * 
     * @return WSResult
     */
    public tvnetwork.schema.common._2.WSResultType getWSResult() {
        return wsResult;
    }


    /**
     * Sets the WSResult value for this GetOnlineUserByNameResponse.
     * 
     * @param WSResult
     */
    public void setWSResult(tvnetwork.schema.common._2.WSResultType WSResult) {
        this.wsResult = WSResult;
    }


    /**
     * Gets the onlineUserInfo value for this GetOnlineUserByNameResponse.
     * 
     * @return onlineUserInfo
     */
    public tvnetwork.schema.uum._2.UserOnlineInfoType getOnlineUserInfo() {
        return onlineUserInfo;
    }


    /**
     * Sets the onlineUserInfo value for this GetOnlineUserByNameResponse.
     * 
     * @param onlineUserInfo
     */
    public void setOnlineUserInfo(tvnetwork.schema.uum._2.UserOnlineInfoType onlineUserInfo) {
        this.onlineUserInfo = onlineUserInfo;
    }

	/**
	 * @param userOnlines the userOnlines to set
	 */
	/*public void setUserOnlines(Set<UserOnlineInfoType> userOnlines) {
		this.userOnlines = userOnlines;
	}*/

}
