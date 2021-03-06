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
 * 文件：jetsennet.wfm.schema.Dbsource.java
 * 日 期：Thu Oct 09 15:08:57 CST 2014
 */
package jetsennet.wfm.schema;

import java.io.Serializable;
import java.util.Date;
import org.uorm.orm.annotation.ClassMapping;
import org.uorm.orm.annotation.FieldMapping;

/**
 *
 * WFM_DBSOURCE
 * this file is generated by the uorm pojo tools.
 *
 * @author <a href="mailto:xunchangguo@gmail.com">郭训常</a>
 * @version 1.0.0
 */
@ClassMapping(tableName = "WFM_DBSOURCE", keyGenerator = "jetsennet.orm.executor.keygen.KeyGenerationNetSequence")
public class Dbsource implements Serializable {
	
	private static final long serialVersionUID = 1L;
	
	public static String PROP_CREATE_TIME = "CREATE_TIME";
	public static String PROP_CREATE_USER = "CREATE_USER";
	public static String PROP_CREATE_USERID = "CREATE_USERID";
	public static String PROP_DB_NAME = "DB_NAME";
	public static String PROP_DB_PASSWORD = "DB_PASSWORD";
	public static String PROP_DB_TYPE = "DB_TYPE";
	public static String PROP_DB_URL = "DB_URL";
	public static String PROP_DB_USER = "DB_USER";
	public static String PROP_SRC_ID = "SRC_ID";
	public static String PROP_SRC_NAME = "SRC_NAME";
	public static String PROP_STR_1 = "STR_1";
	public static String PROP_STR_2 = "STR_2";
	public static String PROP_STR_3 = "STR_3";
	
	/**
	 * primary key field of srcId
	 */
	@FieldMapping(columnName = "SRC_ID", columnType = 4, primary = true)
	private Integer srcId;
	@FieldMapping(columnName = "CREATE_TIME", columnType = 93)
	private Date createTime;
	@FieldMapping(columnName = "CREATE_USER", columnType = 12)
	private String createUser;
	@FieldMapping(columnName = "CREATE_USERID", columnType = 4)
	private Integer createUserid;
	@FieldMapping(columnName = "DB_NAME", columnType = 12)
	private String dbName;
	@FieldMapping(columnName = "DB_PASSWORD", columnType = 12)
	private String dbPassword;
	@FieldMapping(columnName = "DB_TYPE", columnType = 12)
	private String dbType;
	@FieldMapping(columnName = "DB_URL", columnType = 12)
	private String dbUrl;
	@FieldMapping(columnName = "DB_USER", columnType = 12)
	private String dbUser;
	@FieldMapping(columnName = "SRC_NAME", columnType = 12)
	private String srcName;
	@FieldMapping(columnName = "STR_1", columnType = 12)
	private String str1;
	@FieldMapping(columnName = "STR_2", columnType = 12)
	private String str2;
	@FieldMapping(columnName = "STR_3", columnType = 12)
	private String str3;
	
	public Dbsource() {
		super();
	}

	public Dbsource(Integer srcId) {
		this.srcId = srcId;
	}

	/**
	 * @return the createTime
	 */
	public Date getCreateTime() {
		return this.createTime;
	}
	
	/**
	 * @param createTime the createTime to set
	 */
	public void setCreateTime(Date createTime) {
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
	 * @return the createUserid
	 */
	public Integer getCreateUserid() {
		return this.createUserid;
	}
	
	/**
	 * @param createUserid the createUserid to set
	 */
	public void setCreateUserid(Integer createUserid) {
		this.createUserid = createUserid;
	}

	/**
	 * @return the dbName
	 */
	public String getDbName() {
		return this.dbName;
	}
	
	/**
	 * @param dbName the dbName to set
	 */
	public void setDbName(String dbName) {
		this.dbName = dbName;
	}

	/**
	 * @return the dbPassword
	 */
	public String getDbPassword() {
		return this.dbPassword;
	}
	
	/**
	 * @param dbPassword the dbPassword to set
	 */
	public void setDbPassword(String dbPassword) {
		this.dbPassword = dbPassword;
	}

	/**
	 * @return the dbType
	 */
	public String getDbType() {
		return this.dbType;
	}
	
	/**
	 * @param dbType the dbType to set
	 */
	public void setDbType(String dbType) {
		this.dbType = dbType;
	}

	/**
	 * @return the dbUrl
	 */
	public String getDbUrl() {
		return this.dbUrl;
	}
	
	/**
	 * @param dbUrl the dbUrl to set
	 */
	public void setDbUrl(String dbUrl) {
		this.dbUrl = dbUrl;
	}

	/**
	 * @return the dbUser
	 */
	public String getDbUser() {
		return this.dbUser;
	}
	
	/**
	 * @param dbUser the dbUser to set
	 */
	public void setDbUser(String dbUser) {
		this.dbUser = dbUser;
	}

	/**
	 * @return the srcId
	 */
	public Integer getSrcId() {
		return this.srcId;
	}
	
	/**
	 * @param srcId the srcId to set
	 */
	public void setSrcId(Integer srcId) {
		this.srcId = srcId;
	}

	/**
	 * @return the srcName
	 */
	public String getSrcName() {
		return this.srcName;
	}
	
	/**
	 * @param srcName the srcName to set
	 */
	public void setSrcName(String srcName) {
		this.srcName = srcName;
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

	/* (non-Javadoc)
	 * @see java.lang.Object#equals(java.lang.Object)
	 */
	@Override
	public boolean equals(Object o) {
		if ((o == null) || !(o instanceof Dbsource)) {
			return false;
		}
		Dbsource other = (Dbsource)o;
		if (null == this.srcId) {
			if (other.srcId != null)
				return false;
		} else if (!this.srcId.equals(other.srcId))
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
		result = prime * result + ((srcId == null) ? 0 : srcId.hashCode());
		return result;
	}
	
}