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
 * 文件：jetsennet.mtc.schema.Server.java
 * 日 期：Thu Oct 09 15:06:53 CST 2014
 */
package jetsennet.wfm.schema;

import java.io.Serializable;
import java.util.Date;
import org.uorm.orm.annotation.ClassMapping;
import org.uorm.orm.annotation.FieldMapping;

/**
 *
 * CMP_OBJTYPE
 * this file is generated by the uorm pojo tools.
 *
 * @author <a href="mailto:xunchangguo@gmail.com">郭训常</a>
 * @version 1.0.0
 */
@ClassMapping(tableName = "CMP_OBJTYPE", keyGenerator = "java.util.UUID")
public class CmpObjtype implements Serializable {
	
	private static final long serialVersionUID = 1L;
	
	public static String PROP_CMOBJ_TYPE = "CMOBJ_TYPE";
	public static String PROP_TYPE_NAME = "TYPE_NAME";
	public static String PROP_TYPE_DESC = "TYPE_DESC";
	public static String PROP_SCHEMA_NAME = "SCHEMA_NAME";
	public static String PROP_HAS_FILE = "HAS_FILE";
	public static String PROP_BASE_TABLE = "BASE_TABLE";
	public static String PROP_CREATE_USER = "CREATE_USER";
	public static String PROP_CREATE_USERID = "CREATE_USERID";
	public static String PROP_CREATE_TIME = "CREATE_TIME";
	
	/**
	 * primary key field of serverId
	 */
	@FieldMapping(columnName = "CMOBJ_TYPE", columnType = 4, primary = true)
	private Integer cmObjType;
	@FieldMapping(columnName = "TYPE_NAME", columnType = 12)
	private String typeName;
	@FieldMapping(columnName = "TYPE_DESC", columnType = 12)
	private String typeDesc;
	@FieldMapping(columnName = "SCHEMA_NAME", columnType = 12)
	private String schemaName;
	@FieldMapping(columnName = "HAS_FILE", columnType = 4)
	private Integer hasFile;
	@FieldMapping(columnName = "BASE_TABLE", columnType = 12)
	private String baseTable;
	@FieldMapping(columnName = "CREATE_USER", columnType = 12)
	private String createUser;
	@FieldMapping(columnName = "CREATE_USERID", columnType = 12)
	private String createUserId;
	@FieldMapping(columnName = "CREATE_TIME", columnType = 93)
    private Date createTime;
    public Integer getCmObjType()
    {
        return cmObjType;
    }
    public void setCmObjType(Integer cmObjType)
    {
        this.cmObjType = cmObjType;
    }
    public String getTypeName()
    {
        return typeName;
    }
    public void setTypeName(String typeName)
    {
        this.typeName = typeName;
    }
    public String getTypeDesc()
    {
        return typeDesc;
    }
    public void setTypeDesc(String typeDesc)
    {
        this.typeDesc = typeDesc;
    }
    public String getSchemaName()
    {
        return schemaName;
    }
    public void setSchemaName(String schemaName)
    {
        this.schemaName = schemaName;
    }
    public Integer getHasFile()
    {
        return hasFile;
    }
    public void setHasFile(Integer hasFile)
    {
        this.hasFile = hasFile;
    }
    public String getBaseTable()
    {
        return baseTable;
    }
    public void setBaseTable(String baseTable)
    {
        this.baseTable = baseTable;
    }
    public String getCreateUser()
    {
        return createUser;
    }
    public void setCreateUser(String createUser)
    {
        this.createUser = createUser;
    }
    public String getCreateUserId()
    {
        return createUserId;
    }
    public void setCreateUserId(String createUserId)
    {
        this.createUserId = createUserId;
    }
    public Date getCreateTime()
    {
        return createTime;
    }
    public void setCreateTime(Date createTime)
    {
        this.createTime = createTime;
    }
	
	
}