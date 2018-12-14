/* 
 * Copyright (c) 北京捷成世纪科技股份有限公司. All Rights Reserved.
 * 文件：jetsennet.ips.business.AbstractOrderThread.java
 * 日 期：2015年4月2日 下午10:38:15
 * 作 者：刘紫荣
 */
package jetsennet.ips.business;

import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.atomic.AtomicBoolean;

import jetsennet.ips.schema.IpsDatasource;
import jetsennet.ips.schema.IpsOrder;

/**
 * TODO 添加该类的简单功能说明以及算法
 *
 * @author <a href="mailto:liuzirong@jetsen.com">刘紫荣</a>
 * @version 1.0.0 ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝<br/>
 *          修订日期 修订人 描述<br/>
 *          2015年4月2日 刘紫荣 创建<br/>
 */
public abstract class AbstractOrderThread implements IOrderThread {
	public final static long timeInterval = 60000;
	public final static long delay = 100000;
	public IpsOrder order = null;
	public String userName = null;
	public String userId = null;
	public IpsDatasource ipsDataSource = null;
	public IpsOrderBusiness ipsOrderBusiness = null;

	/**
	 * @param order
	 * @param userName
	 * @param userId
	 * @param ipsDataSource
	 * @param ipsOrderBusiness
	 */
	public AbstractOrderThread(IpsOrder order, String userName, String userId,
			IpsDatasource ipsDataSource,IpsOrderBusiness ipsOrderBusiness
			) {
		super();
		this.order = order;
		this.userName = userName;
		this.userId = userId;
		this.ipsDataSource = ipsDataSource;
		this.ipsOrderBusiness = ipsOrderBusiness;
	}

	/**
	 * 
	 */
	public AbstractOrderThread() {
		super();
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see jetsennet.ips.business.IOrderThread#start()
	 */
	@Override
	public void start() {
		// TODO Auto-generated method stub

	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see jetsennet.ips.business.IOrderThread#stop()
	 */
	@Override
	public void stop() {
		// TODO Auto-generated method stub

	}

}
