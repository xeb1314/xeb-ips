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
 * 文件：jetsennet.wfm.schema.Taskassign.java
 * 日 期：Thu Oct 09 15:08:58 CST 2014
 */
package jetsennet.wfm.schema;

import java.io.Serializable;
import org.uorm.orm.annotation.ClassMapping;
import org.uorm.orm.annotation.FieldMapping;

/**
 *
 * WFM_TASKASSIGN
 * this file is generated by the uorm pojo tools.
 *
 * @author <a href="mailto:xunchangguo@gmail.com">郭训常</a>
 * @version 1.0.0
 */
@ClassMapping(tableName = "WFM_TASKASSIGN", keyOrder = "executeUserid,taskId")
public class Taskassign implements Serializable {
	
	private static final long serialVersionUID = 1L;
	
	public static String PROP_EXECUTE_USER = "EXECUTE_USER";
	public static String PROP_EXECUTE_USERID = "EXECUTE_USERID";
	public static String PROP_FIELD_1 = "FIELD_1";
	public static String PROP_OBJ_ID = "OBJ_ID";
	public static String PROP_TASK_ID = "TASK_ID";
	
	/**
	 * primary key field of executeUserid
	 */
	@FieldMapping(columnName = "EXECUTE_USERID", columnType = 12, primary = true)
	private String executeUserid;
	/**
	 * primary key field of taskId
	 */
	@FieldMapping(columnName = "TASK_ID", columnType = 12, primary = true)
	private String taskId;
	@FieldMapping(columnName = "EXECUTE_USER", columnType = 12)
	private String executeUser;
	@FieldMapping(columnName = "FIELD_1", columnType = 12)
	private String field1;
	@FieldMapping(columnName = "OBJ_ID", columnType = 12)
	private String objId;
	
	public Taskassign() {
		super();
	}

	public Taskassign(String executeUserid, String taskId) {
		this.executeUserid = executeUserid;
		this.taskId = taskId;
	}

	public Taskassign(String objId) {
		this.objId = objId;
	}

	/**
	 * @return the executeUser
	 */
	public String getExecuteUser() {
		return this.executeUser;
	}
	
	/**
	 * @param executeUser the executeUser to set
	 */
	public void setExecuteUser(String executeUser) {
		this.executeUser = executeUser;
	}

	/**
	 * @return the executeUserid
	 */
	public String getExecuteUserid() {
		return this.executeUserid;
	}
	
	/**
	 * @param executeUserid the executeUserid to set
	 */
	public void setExecuteUserid(String executeUserid) {
		this.executeUserid = executeUserid;
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
	 * @return the objId
	 */
	public String getObjId() {
		return this.objId;
	}
	
	/**
	 * @param objId the objId to set
	 */
	public void setObjId(String objId) {
		this.objId = objId;
	}

	/**
	 * @return the taskId
	 */
	public String getTaskId() {
		return this.taskId;
	}
	
	/**
	 * @param taskId the taskId to set
	 */
	public void setTaskId(String taskId) {
		this.taskId = taskId;
	}

	/* (non-Javadoc)
	 * @see java.lang.Object#equals(java.lang.Object)
	 */
	@Override
	public boolean equals(Object o) {
		if ((o == null) || !(o instanceof Taskassign)) {
			return false;
		}
		Taskassign other = (Taskassign)o;
		if (null == this.executeUserid) {
			if (other.executeUserid != null)
				return false;
		} else if (!this.executeUserid.equals(other.executeUserid))
			return false;
		if (null == this.taskId) {
			if (other.taskId != null)
				return false;
		} else if (!this.taskId.equals(other.taskId))
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
		result = prime * result + ((executeUserid == null) ? 0 : executeUserid.hashCode());
		result = prime * result + ((taskId == null) ? 0 : taskId.hashCode());
		return result;
	}
	
}