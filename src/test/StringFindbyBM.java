/* 
 * Copyright (c) 北京捷成世纪科技股份有限公司. All Rights Reserved.
 * 文件：test.StringFindbyBM.java
 * 日 期：2015年3月23日 下午9:00:44
 * 作 者：刘紫荣
 */
package test;

import java.util.List;

import jetsennet.util.BoyerMoore;
import jetsennet.util.FileAccess;

/**
 *  TODO 添加该类的简单功能说明以及算法
 *
 * @author <a href="mailto:liuzirong@jetsen.com">刘紫荣</a>
 * @version 1.0.0
 * ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝<br/>
 * 修订日期                 修订人            描述<br/>
 * 2015年3月23日       刘紫荣            创建<br/>
 */
public class StringFindbyBM {

	/**
	 * TODO 方法说明
	 * 2015年3月23日 下午9:00:44
	 * @param args
	 */
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		String text = FileAccess.readFileText("c:\\Nonameeeee2.html");
		String patern = "编后语";
		long start = System.currentTimeMillis();
		List<Integer>matchers = BoyerMoore.match(patern,text);
		long end = System.currentTimeMillis();
		System.out.println(end-start);
		for(Integer integer:matchers)
		{
			System.out.println(integer);
			System.out.println(text.substring(integer, integer+patern.length()));
		}
	}

}
