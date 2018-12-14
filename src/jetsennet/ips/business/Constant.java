/* 
 * Copyright (c) 北京捷成世纪科技股份有限公司. All Rights Reserved.
 * 文件：jetsennet.ips.business.Constant.java
 * 日 期：2015年3月31日 下午4:12:55
 * 作 者：刘紫荣
 */
package jetsennet.ips.business;

/**
 *  TODO 添加该类的简单功能说明以及算法
 *
 * @author <a href="mailto:liuzirong@jetsen.com">刘紫荣</a>
 * @version 1.0.0
 * ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝<br/>
 * 修订日期                 修订人            描述<br/>
 * 2015年3月31日       刘紫荣            创建<br/>
 */
public class Constant {
	/**
	 * 数据源的DB存储位置
	 */
	public enum DBType
	{
		JFDB("JFDB"), 			//飓风数据库
		
		GBase("GBase"); 			//南通GBase

		private final String value;

		DBType(String value)
		{
			this.value = value;
		}

		public String getValue()
		{
			return value;
		}
		
		public String getStrValue()
		{
			return String.valueOf(value);
		}
	}
	
	/**
	 * 数据源的DB存储位置
	 */
	public enum OrderOperation
	{
		ADD("ADD"), 			//添加
		
		CANCEL("CANCEL"); 			//取消

		private final String value;

		OrderOperation(String value)
		{
			this.value = value;
		}

		public String getValue()
		{
			return value;
		}
		
		public String getStrValue()
		{
			return String.valueOf(value);
		}
	}
}
