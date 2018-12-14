/**
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
 */
package jetsennet.util;

import org.uorm.orm.annotation.KeyGenertator;
import org.uorm.pojo.generator.PojoGenerator;

/**
 * POJO 生成工具 Mapping对应的类生成工具
 * @author <a href="mailto:xunchangguo@gmail.com">郭训长</a>
 * @version 1.0.0
 * ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝<br/>
 * 修订日期                 修订人            描述<br/>
 * 2012-1-31       郭训长            创建<br/>
 */
public class Generator {
	//TODO edit below value
	/** 数据库driver */
	private String driver = "com.microsoft.sqlserver.jdbc.SQLServerDriver";//"oracle.jdbc.driver.OracleDriver";
	/**连接字串 */
	private String url = "jdbc:sqlserver://192.168.1.227:1433;DatabaseName=ips0305";//"jdbc:oracle:thin:@127.0.0.1:1521:orcl";
	/** 数据库用户名 */
	private String username = "sa";//"cctv";//"root";
	/** 数据库密码 */
	private String password = "password";//"1";//"root";
	/** 生成的POJO类包名 */
	private String packageName = "jetsennet.ips.schema";
    /** 生成表对应的POJO类名需要去除的表名前缀，如 “T_”, “DVN_”等 */
	private String prefix = "";//DVN_
	/** 生成类的目标地，默认为当前路径的 /src下，即 "./src" */
	private String destination = "./src";
	
	/**
	 * 生成指定表对应的 pojo类
	 * @param tableName 表名
	 * @param idgenerator 主键生成方式 {@link KeyGenertator}
	 */
	public void pojoGen (String tableName, String idgenerator) {
		PojoGenerator generator = new PojoGenerator(driver, url, username, password, packageName, destination);
		if(prefix != null){
			generator.setPrefix(prefix);
		}
		generator.createDatabaseEntities(tableName, idgenerator);
	}
	
	public static void main(String[] args) {
		Generator generator = new Generator();
//		generator.pojoGen("UUM_USER", KeyGenertator.INCREMENT);//TODO edit this
		//generator.pojoGen("UUM_USERTEMPLATE", KeyGenertator.INCREMENT);
		//generator.pojoGen("URM_SYSCLASS", KeyGenertator.UUID);
//		generator.pojoGen("uum_function", KeyGenertator.INCREMENT);
//		generator.pojoGen("uum_person", KeyGenertator.INCREMENT);
//		generator.pojoGen("uum_persontogroup", KeyGenertator.INCREMENT);
//		generator.pojoGen("uum_role", KeyGenertator.INCREMENT);
//		generator.pojoGen("uum_roleauthority", KeyGenertator.INCREMENT);
//		generator.pojoGen("uum_usergroup", KeyGenertator.INCREMENT);
//		generator.pojoGen("uum_usertogroup", KeyGenertator.INCREMENT);
//		generator.pojoGen("uum_usertorole", KeyGenertator.INCREMENT);
//		generator.pojoGen("DMP_SERVICEINFO", KeyGenertator.INCREMENT);
//		generator.pojoGen("DMP_CTRLCLASS", KeyGenertator.INCREMENT);
//		generator.pojoGen("DMP_MANUFACTURER", KeyGenertator.INCREMENT);
		//generator.pojoGen("NET_CTRLCLASS", KeyGenertator.INCREMENT);
		//generator.pojoGen("DVN_PROGRAM", KeyGenertator.SELECT);
		
		generator.pojoGen("IPS_DATATSOURCELABEL", KeyGenertator.GUID);
		//generator.pojoGen("NET_OPERATORLOG", KeyGenertator.UUID);

	}
}
