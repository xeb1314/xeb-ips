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
 * 文件：jetsennet.wfm.schema.Processtype.java
 * 日 期：Thu Oct 09 15:08:57 CST 2014
 */
package jetsennet.wfm.schema;

import java.io.Serializable;

import org.uorm.orm.annotation.ClassMapping;
import org.uorm.orm.annotation.FieldMapping;

/**
 *
 * WFM_PROCESSTYPE
 * this file is generated by the uorm pojo tools.
 *
 * @author <a href="mailto:xunchangguo@gmail.com">郭训常</a>
 * @version 1.0.0
 */
@ClassMapping(tableName = "WFM_PROCESSTYPE", keyGenerator = "increment")
public class ProcessType implements Serializable
{

    private static final long serialVersionUID = 1L;

    public static String PROP_FIELD_1 = "FIELD_1";
    public static String PROP_FIELD_2 = "FIELD_2";
    public static String PROP_PROC_TYPE = "PROC_TYPE";
    public static String PROP_TYPE_NAME = "TYPE_NAME";

    /**
     * primary key field of procType
     */
    @FieldMapping(columnName = "PROC_TYPE", columnType = 4, primary = true)
    private Integer procType;
    @FieldMapping(columnName = "FIELD_1", columnType = 12)
    private String field1;
    @FieldMapping(columnName = "FIELD_2", columnType = 12)
    private String field2;
    @FieldMapping(columnName = "TYPE_NAME", columnType = 12)
    private String typeName;

    public ProcessType()
    {
        super();
    }

    public ProcessType(Integer procType)
    {
        this.procType = procType;
    }

    public ProcessType(String typeName)
    {
        this.typeName = typeName;
    }

    /**
     * @return the field1
     */
    public String getField1()
    {
        return this.field1;
    }

    /**
     * @param field1 the field1 to set
     */
    public void setField1(String field1)
    {
        this.field1 = field1;
    }

    /**
     * @return the field2
     */
    public String getField2()
    {
        return this.field2;
    }

    /**
     * @param field2 the field2 to set
     */
    public void setField2(String field2)
    {
        this.field2 = field2;
    }

    /**
     * @return the procType
     */
    public Integer getProcType()
    {
        return this.procType;
    }

    /**
     * @param procType the procType to set
     */
    public void setProcType(Integer procType)
    {
        this.procType = procType;
    }

    /**
     * @return the typeName
     */
    public String getTypeName()
    {
        return this.typeName;
    }

    /**
     * @param typeName the typeName to set
     */
    public void setTypeName(String typeName)
    {
        this.typeName = typeName;
    }

    /* (non-Javadoc)
     * @see java.lang.Object#equals(java.lang.Object)
     */
    @Override
    public boolean equals(Object o)
    {
        if ((o == null) || !(o instanceof ProcessType))
        {
            return false;
        }
        ProcessType other = (ProcessType) o;
        if (null == this.procType)
        {
            if (other.procType != null)
                return false;
        }
        else if (!this.procType.equals(other.procType))
            return false;
        return true;
    }

    /* (non-Javadoc)
     * @see java.lang.Object#hashCode()
     */
    @Override
    public int hashCode()
    {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((procType == null) ? 0 : procType.hashCode());
        return result;
    }

}