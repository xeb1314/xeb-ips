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
 * 文件：jetsennet.ips.schema.IpsGathterresstat.java
 * 日 期：Wed Apr 08 16:03:06 CST 2015
 */
package jetsennet.ips.schema;

import java.io.Serializable;
import java.util.Date;

import org.uorm.orm.annotation.ClassMapping;
import org.uorm.orm.annotation.FieldMapping;

/**
 *
 * IPS_GATHTERRESSTAT
 * this file is generated by the uorm pojo tools.
 *
 * @author <a href="mailto:xunchangguo@gmail.com">郭训常</a>
 * @version 1.0.0
 */
@ClassMapping(tableName = "IPS_GATHTERRESSTAT", keyGenerator = "guid")
public class IpsGathterresstat implements Serializable {
	
	private static final long serialVersionUID = 1L;
	
	public static String PROP_DANWEI = "DANWEI";
	public static String PROP_PATH = "PATH";
	public static String PROP_SHOUDUAN = "SHOUDUAN";
	public static String PROP_STAT_ID = "STAT_ID";
	public static String PROP_STAT_TIME = "STAT_TIME";
	public static String PROP_TASK_ID = "TASK_ID";
	public static String PROP_ZHENDI = "ZHENDI";
	
	/**
	 * primary key field of statId
	 */
	@FieldMapping(columnName = "STAT_ID", columnType = 12, primary = true)
	private String statId;
	@FieldMapping(columnName = "DANWEI", columnType = 12)
	private String danwei;
	@FieldMapping(columnName = "PATH", columnType = 12)
	private String path;
	@FieldMapping(columnName = "SHOUDUAN", columnType = 12)
	private String shouduan;
	@FieldMapping(columnName = "STAT_TIME", columnType = 93)
	private Date statTime;
	@FieldMapping(columnName = "TASK_ID", columnType = 12)
	private String taskId;
	@FieldMapping(columnName = "ZHENDI", columnType = 12)
	private String zhendi;
	
	public IpsGathterresstat() {
		super();
	}

	public IpsGathterresstat(String statId) {
		this.statId = statId;
	}

	/**
	 * @return the danwei
	 */
	public String getDanwei() {
		return this.danwei;
	}
	
	/**
	 * @param danwei the danwei to set
	 */
	public void setDanwei(String danwei) {
		this.danwei = danwei;
	}

	/**
	 * @return the path
	 */
	public String getPath() {
		return this.path;
	}
	
	/**
	 * @param path the path to set
	 */
	public void setPath(String path) {
		this.path = path;
	}

	/**
	 * @return the shouduan
	 */
	public String getShouduan() {
		return this.shouduan;
	}
	
	/**
	 * @param shouduan the shouduan to set
	 */
	public void setShouduan(String shouduan) {
		this.shouduan = shouduan;
	}

	/**
	 * @return the statId
	 */
	public String getStatId() {
		return this.statId;
	}
	
	/**
	 * @param statId the statId to set
	 */
	public void setStatId(String statId) {
		this.statId = statId;
	}

	/**
	 * @return the statTime
	 */
	public Date getStatTime() {
		return this.statTime;
	}
	
	/**
	 * @param statTime the statTime to set
	 */
	public void setStatTime(Date statTime) {
		this.statTime = statTime;
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
	 * @return the zhendi
	 */
	public String getZhendi() {
		return this.zhendi;
	}
	
	/**
	 * @param zhendi the zhendi to set
	 */
	public void setZhendi(String zhendi) {
		this.zhendi = zhendi;
	}

	/* (non-Javadoc)
	 * @see java.lang.Object#equals(java.lang.Object)
	 */
	@Override
	public boolean equals(Object o) {
		if ((o == null) || !(o instanceof IpsGathterresstat)) {
			return false;
		}
		IpsGathterresstat other = (IpsGathterresstat)o;
		if (null == this.statId) {
			if (other.statId != null)
				return false;
		} else if (!this.statId.equals(other.statId))
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
		result = prime * result + ((statId == null) ? 0 : statId.hashCode());
		return result;
	}
	
}