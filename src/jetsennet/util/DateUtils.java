/* 
 * Copyright (c) 北京捷成世纪科技股份有限公司. All Rights Reserved.
 * 文件：jetsennet.util.DateUtils.java
 * 日 期：2015年4月20日 上午10:16:37
 * 作 者：刘紫荣
 */
package jetsennet.util;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;

/**
 *  TODO 添加该类的简单功能说明以及算法
 *
 * @author <a href="mailto:liuzirong@jetsen.com">刘紫荣</a>
 * @version 1.0.0
 * ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝<br/>
 * 修订日期                 修订人            描述<br/>
 * 2015年4月20日       刘紫荣            创建<br/>
 */
public class DateUtils {
	/*
	 * 默认日期格式
	 */
	public static String DEFAULT_FORMAT = "yyyy-MM-dd";
	
	/**
	 * Date类型foramt
	 * @param obj 需要格式化的object,如果不是Date类型，将直接调用该类的toString()方法返回。
	 * @param parten format格式，如果为空，则默认为 "yyyy-MM-dd"
	 * @return String
	 */
	public static String dateFormat(Object obj, String parten){
		if(obj == null)
			return null;
		if(parten == null || parten.trim().length() == 0)
			parten = DEFAULT_FORMAT;
		SimpleDateFormat dateFormat = new SimpleDateFormat(parten);
		if (obj instanceof java.sql.Date) {
			return dateFormat.format(obj);			
		}else if(obj instanceof java.util.Date) {
			return dateFormat.format(obj);	
		}else if(obj instanceof java.sql.Timestamp) {
			return dateFormat.format(obj);	
		}else{
			return obj.toString();
		}
	}
	
	/*
	 * 获取当年第一天
	 */
	public static Date getCurrYearFirst()
	{
		Calendar currCal = Calendar.getInstance();
		int currentYear = currCal.get(Calendar.YEAR);
		return getYearFirst(currentYear);
	}
	
	/*
	 * 获取当年的最后一天
	 */
	public static Date getCurrYearLast()
	{
		Calendar currCal = Calendar.getInstance();
		int currentYear = currCal.get(Calendar.YEAR);
		return getYearLast(currentYear);
	}
	
	/*
	 * 获取某年第一天日期
	 */
	private static Date getYearFirst(int year)
	{
		Calendar currCal = Calendar.getInstance();
		currCal.clear();
		currCal.set(Calendar.YEAR, year);
		Date currYearFirst = currCal.getTime();
		return currYearFirst;
	}
	
	/*
	 * 获取某年最后一天日期
	 */
	private static Date getYearLast(int year)
	{
		Calendar currCal = Calendar.getInstance();
		currCal.clear();
		currCal.set(Calendar.YEAR, year);
		currCal.roll(Calendar.DAY_OF_YEAR, -1);
		Date currYearLast = currCal.getTime();
		return currYearLast;
	}
	
	/*
	 * 获取当前月第一天
	 */
	public static Date getMonthFirst()
	{
		//获取当前月第一天
		Calendar c = Calendar.getInstance();
		c.add(Calendar.MONTH, 0);
		c.set(Calendar.DAY_OF_MONTH, 1);//设置为1号，当前日期既为本月第一天
		return c.getTime();
	}
	
	/*
	 * 获取当前月最后一天
	 */
	public static Date getMonthLast()
	{
		Calendar c = Calendar.getInstance();
		c.set(Calendar.DAY_OF_MONTH, c.getActualMaximum(Calendar.DAY_OF_MONTH));
		return c.getTime();
	}
	
	public static void main(String[] args)
	{
		for(int i=1953;i<2009;i++)
		{
			System.out.println(dateFormat(getYearFirst(i),null));
			System.out.println(dateFormat(getYearLast(i),null));
		}
	}
}
