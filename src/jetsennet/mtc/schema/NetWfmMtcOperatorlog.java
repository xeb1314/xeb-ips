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
 * 文件：jetsennet.wfm.schema.NetOperatorlog.java
 * 日 期：Wed Oct 22 15:08:58 CST 2014
 */
package jetsennet.mtc.schema;

import java.io.Serializable;
import java.util.Date;
import org.uorm.orm.annotation.ClassMapping;
import org.uorm.orm.annotation.FieldMapping;

/**
 *
 * NET_OPERATORLOG
 * this file is generated by the uorm pojo tools.
 *
 * @author <a href="mailto:xunchangguo@gmail.com">郭训常</a>
 * @version 1.0.0
 */
@ClassMapping(tableName = "NET_OPERATORLOG", keyGenerator = "sequence")
public class NetWfmMtcOperatorlog implements Serializable {
	
	private static final long serialVersionUID = 1L;
	
	public static String PROP_DESCRIPTION = "DESCRIPTION";
	public static String PROP_HOST_NAME = "HOST_NAME";
	public static String PROP_ID = "ID";
	public static String PROP_LOG_INFO = "LOG_INFO";
	public static String PROP_LOG_LEVEL = "LOG_LEVEL";
	public static String PROP_LOG_TIME = "LOG_TIME";
	public static String PROP_SYS_CODE = "SYS_CODE";
	public static String PROP_SYS_NAME = "SYS_NAME";
	public static String PROP_USER_ID = "USER_ID";
	public static String PROP_USER_NAME = "USER_NAME";
	public static String PROP_IP_ADDRESS = "IP_ADDRESS";
	
	/**
	 * primary key field of id
	 */
	@FieldMapping(columnName = "ID", columnType = 12, primary = true)
	private String id;
	@FieldMapping(columnName = "DESCRIPTION", columnType = 12)
	private String description;
	@FieldMapping(columnName = "HOST_NAME", columnType = 12)
	private String hostName;
	@FieldMapping(columnName = "LOG_INFO", columnType = 12)
	private String logInfo;
	@FieldMapping(columnName = "LOG_LEVEL", columnType = 4)
	private Integer logLevel;
	@FieldMapping(columnName = "LOG_TIME", columnType = 93) 
	private Date logTime;
	@FieldMapping(columnName = "SYS_CODE", columnType = 4)
	private Integer sysCode;
	@FieldMapping(columnName = "SYS_NAME", columnType = 12)
	private String sysName;
	@FieldMapping(columnName = "USER_ID", columnType = 2)
	private Integer userId;
	@FieldMapping(columnName = "USER_NAME", columnType = 12)
	private String userName;
	@FieldMapping(columnName = "IP_ADDRESS", columnType = 12)
	private String ipAddress;
	
	public NetWfmMtcOperatorlog() {
		super();
	}

	public NetWfmMtcOperatorlog(String id) {
		this.id = id;
	}

	public NetWfmMtcOperatorlog(Integer userId, String userName) {
		this.userId = userId;
		this.userName = userName;
	}

	/**
	 * @return the description
	 */
	public String getDescription() {
		return this.description;
	}
	
	/**
	 * @param description the description to set
	 */
	public void setDescription(String description) {
		this.description = description;
	}

	/**
	 * @return the hostName
	 */
	public String getHostName() {
		return this.hostName;
	}
	
	/**
	 * @param hostName the hostName to set
	 */
	public void setHostName(String hostName) {
		this.hostName = hostName;
	}

	/**
	 * @return the id
	 */
	public String getId() {
		return this.id;
	}
	
	/**
	 * @param id the id to set
	 */
	public void setId(String id) {
		this.id = id;
	}


	/**
	 * @return the logInfo
	 */
	public String getLogInfo() {
		return this.logInfo;
	}
	
	/**
	 * @param logInfo the logInfo to set
	 */
	public void setLogInfo(String logInfo) {
		this.logInfo = logInfo;
	}

	/**
	 * @return the logLevel
	 */
	public Integer getLogLevel() {
		return this.logLevel;
	}
	
	/**
	 * @param logLevel the logLevel to set
	 */
	public void setLogLevel(Integer logLevel) {
		this.logLevel = logLevel;
	}

	/**
	 * @return the logTime
	 */
	public Date getLogTime() {
		return this.logTime;
	}
	
	/**
	 * @param logTime the logTime to set
	 */
	public void setLogTime(Date logTime) {
		this.logTime = logTime;
	}

	/**
	 * @return the sysCode
	 */
	public Integer getSysCode() {
		return this.sysCode;
	}
	
	/**
	 * @param sysCode the sysCode to set
	 */
	public void setSysCode(Integer sysCode) {
		this.sysCode = sysCode;
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
	 * @return the userId
	 */
	public Integer getUserId() {
		return this.userId;
	}
	
	/**
	 * @param userId the userId to set
	 */
	public void setUserId(Integer userId) {
		this.userId = userId;
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

	
	
	public String getIpAddress()
    {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress)
    {
        this.ipAddress = ipAddress;
    }

    /* (non-Javadoc)
	 * @see java.lang.Object#equals(java.lang.Object)
	 */
	@Override
	public boolean equals(Object o) {
		if ((o == null) || !(o instanceof NetWfmMtcOperatorlog)) {
			return false;
		}
		NetWfmMtcOperatorlog other = (NetWfmMtcOperatorlog)o;
		if (null == this.id) {
			if (other.id != null)
				return false;
		} else if (!this.id.equals(other.id))
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
		result = prime * result + ((id == null) ? 0 : id.hashCode());
		return result;
	}
	
}