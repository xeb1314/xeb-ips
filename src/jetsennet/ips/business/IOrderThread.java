/* 
 * Copyright (c) 北京捷成世纪科技股份有限公司. All Rights Reserved.
 * 文件：jetsennet.ips.business.IOrderThread.java
 * 日 期：2015年4月2日 下午9:12:32
 * 作 者：刘紫荣
 */
package jetsennet.ips.business;

import java.util.concurrent.atomic.AtomicBoolean;

/**
 *  TODO 添加该类的简单功能说明以及算法
 *
 * @author <a href="mailto:liuzirong@jetsen.com">刘紫荣</a>
 * @version 1.0.0
 * ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝<br/>
 * 修订日期                 修订人            描述<br/>
 * 2015年4月2日       刘紫荣            创建<br/>
 */
public interface IOrderThread {
	public void start();
	public void stop();
}
