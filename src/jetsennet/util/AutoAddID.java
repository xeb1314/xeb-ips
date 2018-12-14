/* 
 * Copyright (c) 北京捷成世纪科技股份有限公司. All Rights Reserved.
 * 文件：jetsennet.util.AutoAddID.java
 * 日 期：2014-11-19 下午09:18:25
 * 作 者：薛恩彬
 */
package jetsennet.util;

import jetsennet.frame.business.BaseBusiness;
import jetsennet.sqlclient.ConnectionInfo;
import jetsennet.sqlclient.ISqlExecutor;
import jetsennet.sqlclient.SqlParamType;
import jetsennet.sqlclient.SqlValue;

/**
 *  TODO  ID自增
 *
 * @author <a href="mailto:xueenbin@jetsen.cn">薛恩彬</a>
 * @version 1.0.0
 * ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝<br/>
 * 修订日期                 修订人            描述<br/>
 * 2014-11-19       薛恩彬           创建<br/>
 */
public class AutoAddID extends BaseBusiness{

	/**
	 * 取得数据表新Id
	 * @param tableName 表名
	 */
	public int getNewId(String tableName) throws Exception {
		return Integer.parseInt(generateKey(tableName));
	}
	public String generateKey(String tableName) throws Exception
	{
		String keyId = "1";
		Object newKey;
		try {
			
			getDao().update("UPDATE NET_SEQUENCE SET SERIAL_NUMBER = SERIAL_NUMBER+1 WHERE TABLE_NAME='"+tableName+"'");
			newKey = getDao().querySingleObject(Object.class, "SELECT SERIAL_NUMBER FROM NET_SEQUENCE WHERE TABLE_NAME='"+tableName+"'");
//			sqlExecutor.executeNonQuery(cmd_update,tableNamelValue);
//			newKey = sqlExecutor.executeScalar(cmd_select,tableNamelValue);

			if (newKey != null) {
				keyId = newKey.toString();
			}
			else {
				getDao().execute("INSERT INTO NET_SEQUENCE (TABLE_NAME,SERIAL_NUMBER) VALUES('"+tableName+"',1)");
			}
		}
		catch (Exception ex) {
			throw new Exception("生成主键错误," + ex.getMessage());
		}
		return keyId;
	}
	
}
