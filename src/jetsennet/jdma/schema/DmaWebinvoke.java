/*
 * Copyright 2010-2016 the original author or authors.
 * 
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 文件：jetsennet.ips.schema.DmaWebinvoke.java
 * 日 期：Sun Nov 30 21:06:31 CST 2014
 */
package jetsennet.jdma.schema;

import java.io.Serializable;
import java.sql.Timestamp;
import org.uorm.orm.annotation.ClassMapping;
import org.uorm.orm.annotation.FieldMapping;

/**
 *
 * DMA_WEBINVOKE
 * this file is generated by the uorm pojo tools.
 *
 * @author <a href="mailto:xunchangguo@gmail.com">郭训常</a>
 * @version 1.0.0
 */
@ClassMapping(tableName = "DMA_WEBINVOKE", keyGenerator = "uuid")
public class DmaWebinvoke implements Serializable {
	
	private static final long serialVersionUID = 1L;
	
	public static String PROP_ACTION_NAME = "ACTION_NAME";
	public static String PROP_FIELD_1 = "FIELD_1";
	public static String PROP_FIELD_2 = "FIELD_2";
	public static String PROP_INVOKE_ID = "INVOKE_ID";
	public static String PROP_REQUEST_ID = "REQUEST_ID";
	public static String PROP_REQUEST_TIME = "REQUEST_TIME";
	public static String PROP_REQUEST_TYPE = "REQUEST_TYPE";
	public static String PROP_REQUEST_XML = "REQUEST_XML";
	public static String PROP_RESPONSE_TIME = "RESPONSE_TIME";
	public static String PROP_RESPONSE_XML = "RESPONSE_XML";
	public static String PROP_SERVICE_URL = "SERVICE_URL";
	public static String PROP_SOURCE_CODE = "SOURCE_CODE";
	public static String PROP_STATE = "STATE";
	public static String PROP_STATE_DESC = "STATE_DESC";
	public static String PROP_TARGET_CODE = "TARGET_CODE";
	public static String PROP_USER_NAME = "USER_NAME";
	public static String PROP_USER_TOKEN = "USER_TOKEN";
	
	/**
	 * primary key field of invokeId
	 */
	@FieldMapping(columnName = "INVOKE_ID", columnType = 12, primary = true)
	private String invokeId;
	@FieldMapping(columnName = "ACTION_NAME", columnType = 12)
	private String actionName;
	@FieldMapping(columnName = "FIELD_1", columnType = 12)
	private String field1;
	@FieldMapping(columnName = "FIELD_2", columnType = 12)
	private String field2;
	@FieldMapping(columnName = "REQUEST_ID", columnType = 12)
	private String requestId;
	@FieldMapping(columnName = "REQUEST_TIME", columnType = 93)
	private Timestamp requestTime;
	@FieldMapping(columnName = "REQUEST_TYPE", columnType = 4)
	private Integer requestType;
	@FieldMapping(columnName = "REQUEST_XML", columnType = 12)
	private String requestXml;
	@FieldMapping(columnName = "RESPONSE_TIME", columnType = 93)
	private Timestamp responseTime;
	@FieldMapping(columnName = "RESPONSE_XML", columnType = 12)
	private String responseXml;
	@FieldMapping(columnName = "SERVICE_URL", columnType = 12)
	private String serviceUrl;
	@FieldMapping(columnName = "SOURCE_CODE", columnType = 12)
	private String sourceCode;
	@FieldMapping(columnName = "STATE", columnType = 4)
	private Integer state;
	@FieldMapping(columnName = "STATE_DESC", columnType = 12)
	private String stateDesc;
	@FieldMapping(columnName = "TARGET_CODE", columnType = 12)
	private String targetCode;
	@FieldMapping(columnName = "USER_NAME", columnType = 12)
	private String userName;
	@FieldMapping(columnName = "USER_TOKEN", columnType = 12)
	private String userToken;
	
	public DmaWebinvoke() {
		super();
	}

	public DmaWebinvoke(String invokeId) {
		this.invokeId = invokeId;
	}

	/**
	 * @return the actionName
	 */
	public String getActionName() {
		return this.actionName;
	}
	
	/**
	 * @param actionName the actionName to set
	 */
	public void setActionName(String actionName) {
		this.actionName = actionName;
	}

	/**
	 * @return the field1
	 */
	public String getField1() {
		return this.field1;
	}
	
	/**
	 * @param field1 the field1 to set
	 */
	public void setField1(String field1) {
		this.field1 = field1;
	}

	/**
	 * @return the field2
	 */
	public String getField2() {
		return this.field2;
	}
	
	/**
	 * @param field2 the field2 to set
	 */
	public void setField2(String field2) {
		this.field2 = field2;
	}

	/**
	 * @return the invokeId
	 */
	public String getInvokeId() {
		return this.invokeId;
	}
	
	/**
	 * @param invokeId the invokeId to set
	 */
	public void setInvokeId(String invokeId) {
		this.invokeId = invokeId;
	}

	/**
	 * @return the requestId
	 */
	public String getRequestId() {
		return this.requestId;
	}
	
	/**
	 * @param requestId the requestId to set
	 */
	public void setRequestId(String requestId) {
		this.requestId = requestId;
	}

	/**
	 * @return the requestTime
	 */
	public Timestamp getRequestTime() {
		return this.requestTime;
	}
	
	/**
	 * @param requestTime the requestTime to set
	 */
	public void setRequestTime(Timestamp requestTime) {
		this.requestTime = requestTime;
	}

	/**
	 * @return the requestType
	 */
	public Integer getRequestType() {
		return this.requestType;
	}
	
	/**
	 * @param requestType the requestType to set
	 */
	public void setRequestType(Integer requestType) {
		this.requestType = requestType;
	}

	/**
	 * @return the requestXml
	 */
	public String getRequestXml() {
		return this.requestXml;
	}
	
	/**
	 * @param requestXml the requestXml to set
	 */
	public void setRequestXml(String requestXml) {
		this.requestXml = requestXml;
	}

	/**
	 * @return the responseTime
	 */
	public Timestamp getResponseTime() {
		return this.responseTime;
	}
	
	/**
	 * @param responseTime the responseTime to set
	 */
	public void setResponseTime(Timestamp responseTime) {
		this.responseTime = responseTime;
	}

	/**
	 * @return the responseXml
	 */
	public String getResponseXml() {
		return this.responseXml;
	}
	
	/**
	 * @param responseXml the responseXml to set
	 */
	public void setResponseXml(String responseXml) {
		this.responseXml = responseXml;
	}

	/**
	 * @return the serviceUrl
	 */
	public String getServiceUrl() {
		return this.serviceUrl;
	}
	
	/**
	 * @param serviceUrl the serviceUrl to set
	 */
	public void setServiceUrl(String serviceUrl) {
		this.serviceUrl = serviceUrl;
	}

	/**
	 * @return the sourceCode
	 */
	public String getSourceCode() {
		return this.sourceCode;
	}
	
	/**
	 * @param sourceCode the sourceCode to set
	 */
	public void setSourceCode(String sourceCode) {
		this.sourceCode = sourceCode;
	}

	/**
	 * @return the state
	 */
	public Integer getState() {
		return this.state;
	}
	
	/**
	 * @param state the state to set
	 */
	public void setState(Integer state) {
		this.state = state;
	}

	/**
	 * @return the stateDesc
	 */
	public String getStateDesc() {
		return this.stateDesc;
	}
	
	/**
	 * @param stateDesc the stateDesc to set
	 */
	public void setStateDesc(String stateDesc) {
		this.stateDesc = stateDesc;
	}

	/**
	 * @return the targetCode
	 */
	public String getTargetCode() {
		return this.targetCode;
	}
	
	/**
	 * @param targetCode the targetCode to set
	 */
	public void setTargetCode(String targetCode) {
		this.targetCode = targetCode;
	}

	/**
	 * @return the userName
	 */
	public String getUserName() {
		return this.userName;
	}
	
	/**
	 * @param userName the userName to set
	 */
	public void setUserName(String userName) {
		this.userName = userName;
	}

	/**
	 * @return the userToken
	 */
	public String getUserToken() {
		return this.userToken;
	}
	
	/**
	 * @param userToken the userToken to set
	 */
	public void setUserToken(String userToken) {
		this.userToken = userToken;
	}

	/* (non-Javadoc)
	 * @see java.lang.Object#equals(java.lang.Object)
	 */
	@Override
	public boolean equals(Object o) {
		if ((o == null) || !(o instanceof DmaWebinvoke)) {
			return false;
		}
		DmaWebinvoke other = (DmaWebinvoke)o;
		if (null == this.invokeId) {
			if (other.invokeId != null)
				return false;
		} else if (!this.invokeId.equals(other.invokeId))
			return false;
		return true;
	}
	
	/* (non-Javadoc)
	 * @see java.lang.Object#hashCode()
	 */
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((invokeId == null) ? 0 : invokeId.hashCode());
		return result;
	}
	
}