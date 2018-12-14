
package tvnetwork.schema.ips._1;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;


/**
 * ���Դ��Ŀ����
 * 
 * <p>DataSourceType complex type�� Java �ࡣ
 * 
 * <p>����ģʽƬ��ָ�����ڴ����е�Ԥ�����ݡ�
 * 
 * <pre>
 * &lt;complexType name="DataSourceType">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="dsID" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="dsUID" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="parentID" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="dsName" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="dsType" type="{http://www.w3.org/2001/XMLSchema}int"/>
 *         &lt;element name="dsClass" type="{http://www.w3.org/2001/XMLSchema}int"/>
 *         &lt;element name="state" type="{http://www.w3.org/2001/XMLSchema}int"/>
 *         &lt;element name="dsParam" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="dsDesc" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="createUser" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="createUserID" type="{http://www.w3.org/2001/XMLSchema}int"/>
 *         &lt;element name="createTime" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="updateUser" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="updateUserID" type="{http://www.w3.org/2001/XMLSchema}int"/>
 *         &lt;element name="updateTime" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="str1" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="str2" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="str3" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="ExtendAttributes" type="{http://TVNetwork/Schema/IPS/1.0}ArrayOfAttributeItemType" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "DataSourceType", propOrder = {
    "dsID",
    "dsUID",
    "parentID",
    "dsName",
    "dsType",
    "dsClassName",
    "dsClass",
    "state",
    "dsParam",
    "dsDesc",
    "createUser",
    "createUserID",
    "createTime",
    "updateUser",
    "updateUserID",
    "updateTime",
    "str1",
    "str2",
    "str3",
    "extendAttributes"
})
public class DataSourceType {

    @XmlElement(required = true)
    protected String dsID;
    @XmlElement(required = true)
    protected String dsUID;
    @XmlElement(required = true)
    protected String parentID;
    @XmlElement(required = true)
    protected String dsName;
    protected int dsType;
    @XmlElement(required = true)
    protected String dsClassName;
    protected int dsClass;
    protected int state;
    @XmlElement(required = true)
    protected String dsParam;
    @XmlElement(required = true)
    protected String dsDesc;
    @XmlElement(required = true)
    protected String createUser;
    protected int createUserID;
    @XmlElement(required = true)
    protected String createTime;
    @XmlElement(required = true)
    protected String updateUser;
    protected int updateUserID;
    @XmlElement(required = true)
    protected String updateTime;
    @XmlElement(required = true)
    protected String str1;
    @XmlElement(required = true)
    protected String str2;
    @XmlElement(required = true)
    protected String str3;
    @XmlElement(name = "ExtendAttributes")
    protected ArrayOfAttributeItemType extendAttributes;

    /**
     * ��ȡdsID���Ե�ֵ��
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getDsID() {
        return dsID;
    }

    /**
     * ����dsID���Ե�ֵ��
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setDsID(String value) {
        this.dsID = value;
    }

    /**
     * ��ȡdsUID���Ե�ֵ��
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getDsUID() {
        return dsUID;
    }

    /**
     * ����dsUID���Ե�ֵ��
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setDsUID(String value) {
        this.dsUID = value;
    }

    /**
     * ��ȡparentID���Ե�ֵ��
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getParentID() {
        return parentID;
    }

    /**
     * ����parentID���Ե�ֵ��
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setParentID(String value) {
        this.parentID = value;
    }

    /**
     * ��ȡdsName���Ե�ֵ��
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getDsName() {
        return dsName;
    }

    /**
     * ����dsName���Ե�ֵ��
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setDsName(String value) {
        this.dsName = value;
    }

    /**
     * ��ȡdsType���Ե�ֵ��
     * 
     */
    public int getDsType() {
        return dsType;
    }

    /**
     * ����dsType���Ե�ֵ��
     * 
     */
    public void setDsType(int value) {
        this.dsType = value;
    }


	/**
	 * @return the dsClassName
	 */
	public String getDsClassName() {
		return dsClassName;
	}

	/**
	 * @param dsClassName the dsClassName to set
	 */
	public void setDsClassName(String dsClassName) {
		this.dsClassName = dsClassName;
	}

	/**
     * ��ȡdsClass���Ե�ֵ��
     * 
     */
    public int getDsClass() {
        return dsClass;
    }

    /**
     * ����dsClass���Ե�ֵ��
     * 
     */
    public void setDsClass(int value) {
        this.dsClass = value;
    }

    /**
     * ��ȡstate���Ե�ֵ��
     * 
     */
    public int getState() {
        return state;
    }

    /**
     * ����state���Ե�ֵ��
     * 
     */
    public void setState(int value) {
        this.state = value;
    }

    /**
     * ��ȡdsParam���Ե�ֵ��
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getDsParam() {
        return dsParam;
    }

    /**
     * ����dsParam���Ե�ֵ��
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setDsParam(String value) {
        this.dsParam = value;
    }

    /**
     * ��ȡdsDesc���Ե�ֵ��
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getDsDesc() {
        return dsDesc;
    }

    /**
     * ����dsDesc���Ե�ֵ��
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setDsDesc(String value) {
        this.dsDesc = value;
    }

    /**
     * ��ȡcreateUser���Ե�ֵ��
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getCreateUser() {
        return createUser;
    }

    /**
     * ����createUser���Ե�ֵ��
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setCreateUser(String value) {
        this.createUser = value;
    }

    /**
     * ��ȡcreateUserID���Ե�ֵ��
     * 
     */
    public int getCreateUserID() {
        return createUserID;
    }

    /**
     * ����createUserID���Ե�ֵ��
     * 
     */
    public void setCreateUserID(int value) {
        this.createUserID = value;
    }

    /**
     * ��ȡcreateTime���Ե�ֵ��
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getCreateTime() {
        return createTime;
    }

    /**
     * ����createTime���Ե�ֵ��
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setCreateTime(String value) {
        this.createTime = value;
    }

    /**
     * ��ȡupdateUser���Ե�ֵ��
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getUpdateUser() {
        return updateUser;
    }

    /**
     * ����updateUser���Ե�ֵ��
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setUpdateUser(String value) {
        this.updateUser = value;
    }

    /**
     * ��ȡupdateUserID���Ե�ֵ��
     * 
     */
    public int getUpdateUserID() {
        return updateUserID;
    }

    /**
     * ����updateUserID���Ե�ֵ��
     * 
     */
    public void setUpdateUserID(int value) {
        this.updateUserID = value;
    }

    /**
     * ��ȡupdateTime���Ե�ֵ��
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getUpdateTime() {
        return updateTime;
    }

    /**
     * ����updateTime���Ե�ֵ��
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setUpdateTime(String value) {
        this.updateTime = value;
    }

    /**
     * ��ȡstr1���Ե�ֵ��
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getStr1() {
        return str1;
    }

    /**
     * ����str1���Ե�ֵ��
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setStr1(String value) {
        this.str1 = value;
    }

    /**
     * ��ȡstr2���Ե�ֵ��
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getStr2() {
        return str2;
    }

    /**
     * ����str2���Ե�ֵ��
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setStr2(String value) {
        this.str2 = value;
    }

    /**
     * ��ȡstr3���Ե�ֵ��
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getStr3() {
        return str3;
    }

    /**
     * ����str3���Ե�ֵ��
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setStr3(String value) {
        this.str3 = value;
    }

    /**
     * ��ȡextendAttributes���Ե�ֵ��
     * 
     * @return
     *     possible object is
     *     {@link ArrayOfAttributeItemType }
     *     
     */
    public ArrayOfAttributeItemType getExtendAttributes() {
        return extendAttributes;
    }

    /**
     * ����extendAttributes���Ե�ֵ��
     * 
     * @param value
     *     allowed object is
     *     {@link ArrayOfAttributeItemType }
     *     
     */
    public void setExtendAttributes(ArrayOfAttributeItemType value) {
        this.extendAttributes = value;
    }

}
