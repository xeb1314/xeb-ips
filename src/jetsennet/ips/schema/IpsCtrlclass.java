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
 * 文件：jetsennet.jpms.schema.IpsCtrlclass.java
 * 日 期：Sun Nov 09 23:38:01 CST 2014
 */
package jetsennet.ips.schema;

import java.io.Serializable;
import java.util.Date;
import org.uorm.orm.annotation.ClassMapping;
import org.uorm.orm.annotation.FieldMapping;

/**
 *
 * IPS_CTRLCLASS
 * this file is generated by the uorm pojo tools.
 *
 * @author <a href="mailto:xunchangguo@gmail.com">郭训常</a>
 * @version 1.0.0
 */
@ClassMapping(tableName = "IPS_CTRLCLASS", keyGenerator = "uuid")
public class IpsCtrlclass implements Serializable {
	
	private static final long serialVersionUID = 1L;
	
	public static String PROP_CLASS_DESC = "CLASS_DESC";
	public static String PROP_CLASS_ID = "CLASS_ID";
	public static String PROP_CLASS_LAYER = "CLASS_LAYER";
	public static String PROP_CLASS_NAME = "CLASS_NAME";
	public static String PROP_CLASS_TYPE = "CLASS_TYPE";
	public static String PROP_CREATE_TIME = "CREATE_TIME";
	public static String PROP_CREATE_USER = "CREATE_USER";
	public static String PROP_OBJ_TYPE = "OBJ_TYPE";
	public static String PROP_PARENT_ID = "PARENT_ID";
	public static String PROP_STR_1 = "STR_1";
	public static String PROP_SUB_CLASSID = "SUB_CLASSID";
	public static String PROP_VIEW_NAME = "VIEW_NAME";
	
	/**
	 * primary key field of classId
	 */
	@FieldMapping(columnName = "CLASS_ID", columnType = 12, primary = true)
	private String classId;
	@FieldMapping(columnName = "CLASS_DESC", columnType = 12)
	private String classDesc;
	@FieldMapping(columnName = "CLASS_LAYER", columnType = 12)
	private String classLayer;
	@FieldMapping(columnName = "CLASS_NAME", columnType = 12)
	private String className;
	@FieldMapping(columnName = "CLASS_TYPE", columnType = 4)
	private Integer classType;
	@FieldMapping(columnName = "CREATE_TIME", columnType = 93)
	private Date createTime;
	@FieldMapping(columnName = "CREATE_USER", columnType = 12)
	private String createUser;
	@FieldMapping(columnName = "OBJ_TYPE", columnType = 4)
	private Integer objType;
	@FieldMapping(columnName = "PARENT_ID", columnType = 12)
	private String parentId;
	@FieldMapping(columnName = "STR_1", columnType = 12)
	private String str1;
	@FieldMapping(columnName = "SUB_CLASSID", columnType = 4)
	private Integer subClassid;
	@FieldMapping(columnName = "VIEW_NAME", columnType = 12)
	private String viewName;
	
	public IpsCtrlclass() {
		super();
	}

	public IpsCtrlclass(String classId) {
		this.classId = classId;
	}

	public IpsCtrlclass(String className, Integer classType, Integer objType) {
		this.className = className;
		this.classType = classType;
		this.objType = objType;
	}

	/**
	 * @return the classDesc
	 */
	public String getClassDesc() {
		return this.classDesc;
	}
	
	/**
	 * @param classDesc the classDesc to set
	 */
	public void setClassDesc(String classDesc) {
		this.classDesc = classDesc;
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
	 * @return the classLayer
	 */
	public String getClassLayer() {
		return this.classLayer;
	}
	
	/**
	 * @param classLayer the classLayer to set
	 */
	public void setClassLayer(String classLayer) {
		this.classLayer = classLayer;
	}

	/**
	 * @return the className
	 */
	public String getClassName() {
		return this.className;
	}
	
	/**
	 * @param className the className to set
	 */
	public void setClassName(String className) {
		this.className = className;
	}

	/**
	 * @return the classType
	 */
	public Integer getClassType() {
		return this.classType;
	}
	
	/**
	 * @param classType the classType to set
	 */
	public void setClassType(Integer classType) {
		this.classType = classType;
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
	 * @return the objType
	 */
	public Integer getObjType() {
		return this.objType;
	}
	
	/**
	 * @param objType the objType to set
	 */
	public void setObjType(Integer objType) {
		this.objType = objType;
	}

	/**
	 * @return the parentId
	 */
	public String getParentId() {
		return this.parentId;
	}
	
	/**
	 * @param parentId the parentId to set
	 */
	public void setParentId(String parentId) {
		this.parentId = parentId;
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
	 * @return the subClassid
	 */
	public Integer getSubClassid() {
		return this.subClassid;
	}
	
	/**
	 * @param subClassid the subClassid to set
	 */
	public void setSubClassid(Integer subClassid) {
		this.subClassid = subClassid;
	}

	/**
	 * @return the viewName
	 */
	public String getViewName() {
		return this.viewName;
	}
	
	/**
	 * @param viewName the viewName to set
	 */
	public void setViewName(String viewName) {
		this.viewName = viewName;
	}

	/* (non-Javadoc)
	 * @see java.lang.Object#equals(java.lang.Object)
	 */
	@Override
	public boolean equals(Object o) {
		if ((o == null) || !(o instanceof IpsCtrlclass)) {
			return false;
		}
		IpsCtrlclass other = (IpsCtrlclass)o;
		if (null == this.classId) {
			if (other.classId != null)
				return false;
		} else if (!this.classId.equals(other.classId))
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
		result = prime * result + ((classId == null) ? 0 : classId.hashCode());
		return result;
	}
	
}