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
 * 文件：jetsennet.ips.schema.IpsTaskruleparam.java
 * 日 期：Wed Apr 08 10:53:43 CST 2015
 */
package jetsennet.ips.schema;

import java.io.Serializable;
import java.sql.Timestamp;
import org.uorm.orm.annotation.ClassMapping;
import org.uorm.orm.annotation.FieldMapping;

/**
 *
 * IPS_TASKRULEPARAM
 * this file is generated by the uorm pojo tools.
 *
 * @author <a href="mailto:xunchangguo@gmail.com">郭训常</a>
 * @version 1.0.0
 */
@ClassMapping(tableName = "IPS_TASKRULEPARAM", keyGenerator = "guid")
public class IpsTaskruleparam implements Serializable {
	
	private static final long serialVersionUID = 1L;
	
	public static String PROP_CREATE_TIME = "CREATE_TIME";
	public static String PROP_ID = "ID";
	public static String PROP_PARAM = "PARAM";
	public static String PROP_RULE_NAME = "RULE_NAME";
	public static String PROP_TASK_ID = "TASK_ID";
	public static String PROP_TEMPLATE_ID = "TEMPLATE_ID";
	
	/**
	 * primary key field of id
	 */
	@FieldMapping(columnName = "ID", columnType = 12, primary = true)
	private String id;
	@FieldMapping(columnName = "CREATE_TIME", columnType = 93)
	private Timestamp createTime;
	@FieldMapping(columnName = "PARAM", columnType = 12)
	private String param;
	@FieldMapping(columnName = "RULE_NAME", columnType = 12)
	private String ruleName;
	@FieldMapping(columnName = "TASK_ID", columnType = 12)
	private String taskId;
	@FieldMapping(columnName = "TEMPLATE_ID", columnType = 12)
	private String templateId;
	
	public IpsTaskruleparam() {
		super();
	}

	public IpsTaskruleparam(String id) {
		this.id = id;
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
	 * @return the param
	 */
	public String getParam() {
		return this.param;
	}
	
	/**
	 * @param param the param to set
	 */
	public void setParam(String param) {
		this.param = param;
	}

	/**
	 * @return the ruleName
	 */
	public String getRuleName() {
		return this.ruleName;
	}
	
	/**
	 * @param ruleName the ruleName to set
	 */
	public void setRuleName(String ruleName) {
		this.ruleName = ruleName;
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

	/**
	 * @return the templateId
	 */
	public String getTemplateId() {
		return this.templateId;
	}
	
	/**
	 * @param templateId the templateId to set
	 */
	public void setTemplateId(String templateId) {
		this.templateId = templateId;
	}

	/* (non-Javadoc)
	 * @see java.lang.Object#equals(java.lang.Object)
	 */
	@Override
	public boolean equals(Object o) {
		if ((o == null) || !(o instanceof IpsTaskruleparam)) {
			return false;
		}
		IpsTaskruleparam other = (IpsTaskruleparam)o;
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