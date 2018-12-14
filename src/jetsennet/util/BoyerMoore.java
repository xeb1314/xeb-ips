/* 
 * Copyright (c) 北京捷成世纪科技股份有限公司. All Rights Reserved.
 * 文件：test.BoyerMoore.java
 * 日 期：2015年3月23日 下午8:23:14
 * 作 者：刘紫荣
 */
package jetsennet.util;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import jetsennet.util.FileAccess;

/**
 *  TODO 字符串匹配BoyerMoore算法实现
 *
 * @author <a href="mailto:liuzirong@jetsen.com">刘紫荣</a>
 * @version 1.0.0
 * ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝<br/>
 * 修订日期                 修订人            描述<br/>
 * 2015年3月23日       刘紫荣            创建<br/>
 */
public class BoyerMoore {

	/**
	 * TODO 方法说明
	 * 2015年3月23日 下午8:23:14
	 * @param args
	 */

	public static List<Integer> match(String pattern,String text)
	{
		List<Integer>matchers = new ArrayList<Integer>();
		int m = text.length();
		int n = pattern.length();
		Map<Character,Integer>rightMostIndexes = preprocessForBadCharacterShift(pattern);
		int allignedAt = 0;
		while(allignedAt+(n-1)<m)
		{
			for(int indexInPattern=n-1;indexInPattern>=0;indexInPattern--)
			{
				int indexInText = allignedAt+indexInPattern;
				char x = text.charAt(indexInText);
				char y = pattern.charAt(indexInPattern);
				if(indexInText>=m)break;
				if(x!=y)
				{
					Integer r = rightMostIndexes.get(x);
					if(r==null)
					{
						allignedAt=indexInText+1;
					}else
					{
						int shift = indexInText-(allignedAt+r);
						allignedAt+=shift>0?shift:1;
					}
					break;
				}else if(indexInPattern==0)
				{
					matchers.add(allignedAt);
					allignedAt++;
				}
			}
		}
		return matchers;
	}
	
	private static Map<Character,Integer>preprocessForBadCharacterShift(String pattern)
	{
		Map<Character,Integer>map = new HashMap<Character, Integer>();
		for(int i=pattern.length()-1;i>=0;i--)
		{
			char c = pattern.charAt(i);
			if(!map.containsKey(c))map.put(c, i);
		}
		return map;
	}
	
}
