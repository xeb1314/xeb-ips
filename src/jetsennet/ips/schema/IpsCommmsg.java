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
 * 文件：jetsennet.ips.schema.IpsCommmsg.java
 * 日 期：Tue Nov 25 15:08:00 CST 2014
 */
package jetsennet.ips.schema;

import java.io.Serializable;
import java.util.Date;
import org.uorm.orm.annotation.ClassMapping;
import org.uorm.orm.annotation.FieldMapping;

/**
 *
 * IPS_COMMMSG
 * this file is generated by the uorm pojo tools.
 *
 * @author <a href="mailto:xunchangguo@gmail.com">郭训常</a>
 * @version 1.0.0
 */
@ClassMapping(tableName = "IPS_COMMMSG", keyGenerator = "guid")
public class IpsCommmsg implements Serializable {
	
	private static final long serialVersionUID = 1L;
	
	public static String PROP_DST_CODE = "DST_CODE";
	public static String PROP_DST_URL = "DST_URL";
	public static String PROP_HOST_NAME = "HOST_NAME";
	public static String PROP_ID = "ID";
	public static String PROP_LOG_TIME = "LOG_TIME";
	public static String PROP_MSG_ID = "MSG_ID";
	public static String PROP_MSG_TYPE = "MSG_TYPE";
	public static String PROP_REPLY_ID = "REPLY_ID";
	public static String PROP_REPLY_MSG = "REPLY_MSG";
	public static String PROP_REPLY_RESULT = "REPLY_RESULT";
	public static String PROP_SEND_MSG = "SEND_MSG";
	public static String PROP_SEND_RESULT = "SEND_RESULT";
	public static String PROP_SEND_TIME = "SEND_TIME";
	public static String PROP_SRC_CODE = "SRC_CODE";
	public static String PROP_SRC_URL = "SRC_URL";
	public static String PROP_STATE = "STATE";
	public static String PROP_USER_NAME = "USER_NAME";
	public static String PROP_USER_TOKEN = "USER_TOKEN";
	
	/**
	 * primary key field of id
	 */
	@FieldMapping(columnName = "ID", columnType = 12, primary = true)
	private String id;
	@FieldMapping(columnName = "DST_CODE", columnType = 12)
	private String dstCode;
	@FieldMapping(columnName = "DST_URL", columnType = 12)
	private String dstUrl;
	@FieldMapping(columnName = "HOST_NAME", columnType = 12)
	private String hostName;
	@FieldMapping(columnName = "LOG_TIME", columnType = 93)
	private Date logTime;
	@FieldMapping(columnName = "MSG_ID", columnType = 12)
	private String msgId;
	@FieldMapping(columnName = "MSG_TYPE", columnType = 12)
	private String msgType;
	@FieldMapping(columnName = "REPLY_ID", columnType = 12)
	private String replyId;
	@FieldMapping(columnName = "REPLY_MSG", columnType = 2005)
	private String replyMsg;
	@FieldMapping(columnName = "REPLY_RESULT", columnType = 12)
	private String replyResult;
	@FieldMapping(columnName = "SEND_MSG", columnType = 2005)
	private String sendMsg;
	@FieldMapping(columnName = "SEND_RESULT", columnType = 12)
	private String sendResult;
	@FieldMapping(columnName = "SEND_TIME", columnType = 12)
	private String sendTime;
	@FieldMapping(columnName = "SRC_CODE", columnType = 12)
	private String srcCode;
	@FieldMapping(columnName = "SRC_URL", columnType = 12)
	private String srcUrl;
	@FieldMapping(columnName = "STATE", columnType = 4)
	private Integer state;
	@FieldMapping(columnName = "USER_NAME", columnType = 12)
	private String userName;
	@FieldMapping(columnName = "USER_TOKEN", columnType = 12)
	private String userToken;
	
	public IpsCommmsg() {
		super();
	}

	public IpsCommmsg(String id) {
		this.id = id;
	}

	public IpsCommmsg(String msgType, String srcCode) {
		this.msgType = msgType;
		this.srcCode = srcCode;
	}

	/**
	 * @return the dstCode
	 */
	public String getDstCode() {
		return this.dstCode;
	}
	
	/**
	 * @param dstCode the dstCode to set
	 */
	public void setDstCode(String dstCode) {
		this.dstCode = dstCode;
	}

	/**
	 * @return the dstUrl
	 */
	public String getDstUrl() {
		return this.dstUrl;
	}
	
	/**
	 * @param dstUrl the dstUrl to set
	 */
	public void setDstUrl(String dstUrl) {
		this.dstUrl = dstUrl;
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
	 * @return the msgId
	 */
	public String getMsgId() {
		return this.msgId;
	}
	
	/**
	 * @param msgId the msgId to set
	 */
	public void setMsgId(String msgId) {
		this.msgId = msgId;
	}

	/**
	 * @return the msgType
	 */
	public String getMsgType() {
		return this.msgType;
	}
	
	/**
	 * @param msgType the msgType to set
	 */
	public void setMsgType(String msgType) {
		this.msgType = msgType;
	}

	/**
	 * @return the replyId
	 */
	public String getReplyId() {
		return this.replyId;
	}
	
	/**
	 * @param replyId the replyId to set
	 */
	public void setReplyId(String replyId) {
		this.replyId = replyId;
	}

	/**
	 * @return the replyMsg
	 */
	public String getReplyMsg() {
		return this.replyMsg;
	}
	
	/**
	 * @param replyMsg the replyMsg to set
	 */
	public void setReplyMsg(String replyMsg) {
		this.replyMsg = replyMsg;
	}

	/**
	 * @return the replyResult
	 */
	public String getReplyResult() {
		return this.replyResult;
	}
	
	/**
	 * @param replyResult the replyResult to set
	 */
	public void setReplyResult(String replyResult) {
		this.replyResult = replyResult;
	}

	/**
	 * @return the sendMsg
	 */
	public String getSendMsg() {
		return this.sendMsg;
	}
	
	/**
	 * @param sendMsg the sendMsg to set
	 */
	public void setSendMsg(String sendMsg) {
		this.sendMsg = sendMsg;
	}

	/**
	 * @return the sendResult
	 */
	public String getSendResult() {
		return this.sendResult;
	}
	
	/**
	 * @param sendResult the sendResult to set
	 */
	public void setSendResult(String sendResult) {
		this.sendResult = sendResult;
	}

	/**
	 * @return the sendTime
	 */
	public String getSendTime() {
		return this.sendTime;
	}
	
	/**
	 * @param sendTime the sendTime to set
	 */
	public void setSendTime(String sendTime) {
		this.sendTime = sendTime;
	}

	/**
	 * @return the srcCode
	 */
	public String getSrcCode() {
		return this.srcCode;
	}
	
	/**
	 * @param srcCode the srcCode to set
	 */
	public void setSrcCode(String srcCode) {
		this.srcCode = srcCode;
	}

	/**
	 * @return the srcUrl
	 */
	public String getSrcUrl() {
		return this.srcUrl;
	}
	
	/**
	 * @param srcUrl the srcUrl to set
	 */
	public void setSrcUrl(String srcUrl) {
		this.srcUrl = srcUrl;
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
		if ((o == null) || !(o instanceof IpsCommmsg)) {
			return false;
		}
		IpsCommmsg other = (IpsCommmsg)o;
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