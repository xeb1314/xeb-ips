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
 * 文件：jetsennet.wfm.schema.Procver.java
 * 日 期：Wed Apr 08 12:13:17 CST 2015
 */
package jetsennet.wfm.schema;

import java.io.Serializable;
import java.util.Date;
import org.uorm.orm.annotation.ClassMapping;
import org.uorm.orm.annotation.FieldMapping;

/**
 *
 * WFM_PROCVER
 * this file is generated by the uorm pojo tools.
 *
 * @author <a href="mailto:xunchangguo@gmail.com">郭训常</a>
 * @version 1.0.0
 */
@ClassMapping(tableName = "WFM_PROCVER", keyOrder = "procId,procVer", keyGenerator = "increment")
public class Procver implements Serializable {
	
	private static final long serialVersionUID = 1L;
	
	public static String PROP_CREATE_TIME = "CREATE_TIME";
	public static String PROP_PROC_ID = "PROC_ID";
	public static String PROP_PROC_VER = "PROC_VER";
	public static String PROP_VER_DESC = "VER_DESC";
	
	/**
	 * primary key field of procId
	 */
	@FieldMapping(columnName = "PROC_ID", columnType = 4, primary = true)
	private Integer procId;
	/**
	 * primary key field of procVer
	 */
	@FieldMapping(columnName = "PROC_VER", columnType = 4, primary = true)
	private Integer procVer;
	@FieldMapping(columnName = "CREATE_TIME", columnType = 93)
	private Date createTime;
	@FieldMapping(columnName = "VER_DESC", columnType = 12)
	private String verDesc;
	
	public Procver() {
		super();
	}

	public Procver(Integer procId, Integer procVer) {
		this.procId = procId;
		this.procVer = procVer;
	}

	public Procver(Date createTime) {
		this.createTime = createTime;
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
	 * @return the procId
	 */
	public Integer getProcId() {
		return this.procId;
	}
	
	/**
	 * @param procId the procId to set
	 */
	public void setProcId(Integer procId) {
		this.procId = procId;
	}

	/**
	 * @return the procVer
	 */
	public Integer getProcVer() {
		return this.procVer;
	}
	
	/**
	 * @param procVer the procVer to set
	 */
	public void setProcVer(Integer procVer) {
		this.procVer = procVer;
	}

	/**
	 * @return the verDesc
	 */
	public String getVerDesc() {
		return this.verDesc;
	}
	
	/**
	 * @param verDesc the verDesc to set
	 */
	public void setVerDesc(String verDesc) {
		this.verDesc = verDesc;
	}

	/* (non-Javadoc)
	 * @see java.lang.Object#equals(java.lang.Object)
	 */
	@Override
	public boolean equals(Object o) {
		if ((o == null) || !(o instanceof Procver)) {
			return false;
		}
		Procver other = (Procver)o;
		if (null == this.procId) {
			if (other.procId != null)
				return false;
		} else if (!this.procId.equals(other.procId))
			return false;
		if (null == this.procVer) {
			if (other.procVer != null)
				return false;
		} else if (!this.procVer.equals(other.procVer))
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
		result = prime * result + ((procId == null) ? 0 : procId.hashCode());
		result = prime * result + ((procVer == null) ? 0 : procVer.hashCode());
		return result;
	}
	
}