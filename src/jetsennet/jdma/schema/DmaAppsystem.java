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
 * 文件：jetsennet.jdma.schema.DmaAppsystem.java
 * 日 期：Fri Dec 19 09:57:04 CST 2014
 */
package jetsennet.jdma.schema;

import java.io.Serializable;
import java.sql.Timestamp;
import org.uorm.orm.annotation.ClassMapping;
import org.uorm.orm.annotation.FieldMapping;

/**
 *
 * DMA_APPSYSTEM
 * this file is generated by the uorm pojo tools.
 *
 * @author <a href="mailto:xunchangguo@gmail.com">郭训常</a>
 * @version 1.0.0
 */
@ClassMapping(tableName = "DMA_APPSYSTEM", keyGenerator = "guid")
public class DmaAppsystem implements Serializable {
	
	private static final long serialVersionUID = 1L;
	
	public static String PROP_CLASS_ID = "CLASS_ID";
	public static String PROP_CREATE_TIME = "CREATE_TIME";
	public static String PROP_CREATE_USER = "CREATE_USER";
	public static String PROP_STATE = "STATE";
	public static String PROP_STR_1 = "STR_1";
	public static String PROP_STR_2 = "STR_2";
	public static String PROP_STR_3 = "STR_3";
	public static String PROP_SYS_CODE = "SYS_CODE";
	public static String PROP_SYS_DESC = "SYS_DESC";
	public static String PROP_SYS_ID = "SYS_ID";
	public static String PROP_SYS_NAME = "SYS_NAME";
	public static String PROP_SYS_TYPE = "SYS_TYPE";
	
	/**
	 * primary key field of sysId
	 */
	@FieldMapping(columnName = "SYS_ID", columnType = 12, primary = true)
	private String sysId;
	@FieldMapping(columnName = "CLASS_ID", columnType = 12)
	private String classId;
	@FieldMapping(columnName = "CREATE_TIME", columnType = 93)
	private Timestamp createTime;
	@FieldMapping(columnName = "CREATE_USER", columnType = 12)
	private String createUser;
	@FieldMapping(columnName = "STATE", columnType = 4)
	private Integer state;
	@FieldMapping(columnName = "STR_1", columnType = 12)
	private String str1;
	@FieldMapping(columnName = "STR_2", columnType = 12)
	private String str2;
	@FieldMapping(columnName = "STR_3", columnType = 12)
	private String str3;
	@FieldMapping(columnName = "SYS_CODE", columnType = 12)
	private String sysCode;
	@FieldMapping(columnName = "SYS_DESC", columnType = 12)
	private String sysDesc;
	@FieldMapping(columnName = "SYS_NAME", columnType = 12)
	private String sysName;
	@FieldMapping(columnName = "SYS_TYPE", columnType = 4)
	private Integer sysType;
	
	public DmaAppsystem() {
		super();
	}

	public DmaAppsystem(String sysId) {
		this.sysId = sysId;
	}

	public DmaAppsystem(Timestamp createTime) {
		this.createTime = createTime;
	}

	/**
	 * @return the classId
	 */
	public String getClassId() {
		return this.classId;
	}
	
	/**
	 * @param classId the classId to set
	 */
	public void setClassId(String classId) {
		this.classId = classId;
	}

	/**
	 * @return the createTime
	 */
	public Timestamp getCreateTime() {
		return this.createTime;
	}
	
	/**
	 * @param createTime the createTime to set
	 */
	public void setCreateTime(Timestamp createTime) {
		this.createTime = createTime;
	}

	/**
	 * @return the createUser
	 */
	public String getCreateUser() {
		return this.createUser;
	}
	
	/**
	 * @param createUser the createUser to set
	 */
	public void setCreateUser(String createUser) {
		this.createUser = createUser;
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
	 * @return the str1
	 */
	public String getStr1() {
		return this.str1;
	}
	
	/**
	 * @param str1 the str1 to set
	 */
	public void setStr1(String str1) {
		this.str1 = str1;
	}

	/**
	 * @return the str2
	 */
	public String getStr2() {
		return this.str2;
	}
	
	/**
	 * @param str2 the str2 to set
	 */
	public void setStr2(String str2) {
		this.str2 = str2;
	}

	/**
	 * @return the str3
	 */
	public String getStr3() {
		return this.str3;
	}
	
	/**
	 * @param str3 the str3 to set
	 */
	public void setStr3(String str3) {
		this.str3 = str3;
	}

	/**
	 * @return the sysCode
	 */
	public String getSysCode() {
		return this.sysCode;
	}
	
	/**
	 * @param sysCode the sysCode to set
	 */
	public void setSysCode(String sysCode) {
		this.sysCode = sysCode;
	}

	/**
	 * @return the sysDesc
	 */
	public String getSysDesc() {
		return this.sysDesc;
	}
	
	/**
	 * @param sysDesc the sysDesc to set
	 */
	public void setSysDesc(String sysDesc) {
		this.sysDesc = sysDesc;
	}

	/**
	 * @return the sysId
	 */
	public String getSysId() {
		return this.sysId;
	}
	
	/**
	 * @param sysId the sysId to set
	 */
	public void setSysId(String sysId) {
		this.sysId = sysId;
	}

	/**
	 * @return the sysName
	 */
	public String getSysName() {
		return this.sysName;
	}
	
	/**
	 * @param sysName the sysName to set
	 */
	public void setSysName(String sysName) {
		this.sysName = sysName;
	}

	/**
	 * @return the sysType
	 */
	public Integer getSysType() {
		return this.sysType;
	}
	
	/**
	 * @param sysType the sysType to set
	 */
	public void setSysType(Integer sysType) {
		this.sysType = sysType;
	}

	/* (non-Javadoc)
	 * @see java.lang.Object#equals(java.lang.Object)
	 */
	@Override
	public boolean equals(Object o) {
		if ((o == null) || !(o instanceof DmaAppsystem)) {
			return false;
		}
		DmaAppsystem other = (DmaAppsystem)o;
		if (null == this.sysId) {
			if (other.sysId != null)
				return false;
		} else if (!this.sysId.equals(other.sysId))
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
		result = prime * result + ((sysId == null) ? 0 : sysId.hashCode());
		return result;
	}
	
}