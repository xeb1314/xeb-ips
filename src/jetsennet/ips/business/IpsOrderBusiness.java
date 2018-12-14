package jetsennet.ips.business;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;

import jetsennet.frame.business.BaseBusiness;
import jetsennet.frame.business.Business;
import jetsennet.frame.dataaccess.IDao;
import jetsennet.ips.business.Constant.DBType;
import jetsennet.ips.schema.IpsDatasource;
import jetsennet.ips.schema.IpsOrder;
import jetsennet.util.ConfigUtil;
import jetsennet.util.SerializerUtil;
import jetsennet.util.SpringContextUtil;
import jetsennet.util.XmlUtil;

import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.uorm.dao.common.SqlParameter;

public class IpsOrderBusiness extends BaseBusiness {
	
	private static final String SELECT_IPSORDER_INIT = "SELECT * FROM IPS_ORDER WHERE ORDER_TYPE = 20 AND INT_1 != 400";
	private static final String SELECT_IPSORDER_NEWORCANCLE_ORDER = "SELECT * FROM IPS_ORDER WHERE ORDER_TYPE = 20";// INT_1 IN (0,100,200,300,400) AND 
	private Map<String,IOrderThread> orderThreadList = new HashMap<String,IOrderThread>();
	
	//订单状态描述------------
	/**
	 * 新订单
	 */
	public static final int IS_NEW_ORDER = 0;
	/**
	 * 已扫到
	 */
	public static final int IS_HIT = 1;
	/**
	 * 已复制数据源
	 */
	public static final int IS_COPY_DATASOURCE = 100;
	/**
	 * 已创建 与源表相同格式 目标表
	 */
	public static final int IS_CREATE_TABLE = 200;
	/**
	 * 已开始根据条件循环匹配
	 */
	public static final int IS_EXEC = 300;
	/**
	 * 取消订阅
	 */
	public static final int IS_CANCEL = 400;
	
	//------------
	
	private static AtomicBoolean timerStarted = new AtomicBoolean(false);
	
	public IDao getReplaceDao()
    {
        IDao daof = getDao();
        if (daof == null)
        {
        	IpsOrderBusiness ipsOrderBusiness = (IpsOrderBusiness) SpringContextUtil.getBean("ipsOrderBusiness");
            return ipsOrderBusiness.getDao();
        }
        return daof;
    }

	@Override
    @Business
    public int commonObjInsert(String className, String xml) throws Exception
    {
       /* Element root = DocumentHelper.parseText(xml).getRootElement();
        IpsOrder ipsOrder = SerializerUtil.deserialize(IpsOrder.class, root);
        getReplaceDao().saveBusinessObjs(ipsOrder);
        return 0;*/
		Class cls = getSchemaClass("jetsennet.ips.schema.IpsOrder");
		Map module = SerializerUtil.deserialize2map(cls, xml);
	    return getDao().saveModelData(cls, module);
    }
	
    @Override
    @Business
    public int commonObjUpdateByPk(String className, String xml, boolean isFilterNull) throws Exception
    {
        Element root = DocumentHelper.parseText(xml).getRootElement();
        IpsOrder ipsOrder = SerializerUtil.deserialize(IpsOrder.class, root);
        getReplaceDao().updateBusinessObjs(isFilterNull, ipsOrder);
        return 0;
    }
    
    /**
     * 根据orderID更新订单状态
     * @param state
     * @param orderId
     * @return
     * @throws Exception
     */
    public int updateOrderStateByOrderID(int state, String orderId) throws Exception
    {
    	getReplaceDao().update(String.format("UPDATE IPS_ORDER SET INT_1 = %s WHERE ORDER_ID = '%s'", state, orderId));
    	return 0;
    }
    
	public IpsOrder getIpsOrderByOrderUid(String orderUid) throws Exception
	{
		return getReplaceDao().querySingleObject(IpsOrder.class, "SELECT * FROM IPS_DATASOURCE WHERE STR_2 = ?", new SqlParameter(orderUid));
	}
	
    /**
     * 根据OrderID更新订单新数据源ID
     * @param newDSID
     * @param orderId
     * @return
     * @throws Exception
     */
    public int updateOrderNewDSIDByOrderID(String newDSID,String orderId) throws Exception
    {
    	getReplaceDao().update(String.format("UPDATE IPS_ORDER SET STR_1 = '%s' WHERE ORDER_ID = '%s'", newDSID,orderId));
    	return 0;
    }
	
    /*
     * 检索订阅单
     */
	public void selectOrder() throws Exception
	{
		List<IpsOrder> orders = null;
		if(!timerStarted.get())
		{
			orders = getReplaceDao().queryBusinessObjs(IpsOrder.class, SELECT_IPSORDER_INIT);
			timerStarted.set(true);
		}else {
			orders = getReplaceDao().queryBusinessObjs(IpsOrder.class, SELECT_IPSORDER_NEWORCANCLE_ORDER);
		}
		
		if(orders != null && !orders.isEmpty())
		{
			for(IpsOrder order : orders)
			{
				if(order.getInt1() == IS_NEW_ORDER)
				{
					updateOrderStateByOrderID(IS_HIT,order.getOrderId());
					order.setInt1(IS_HIT);
				}
				if(order.getInt1() ==IS_CANCEL)
				{
					IOrderThread orderThead = orderThreadList.get(order.getOrderId());
					orderThead.stop();
					orderThead = null;
					orderThreadList.remove(order.getOrderId());
					continue;
				}
				if(orderThreadList.containsKey(order.getOrderId()))return;
				doBusiness(order);
			}
		}
	}
	
	/**
	 * 根据订阅单 进行业务处理
	 * @param order
	 * @throws Exception
	 */
	public void doBusiness(IpsOrder order) throws Exception
	{
		IpsDataSourceBusiness ipsDataSourceBusiness = (IpsDataSourceBusiness) SpringContextUtil.getBean("ipsDataSourceBusiness");
		
		String userName = "";
		String userId = "0";
		String orderInfoStr = order.getOrderInfo();
		Document doc = DocumentHelper.parseText(orderInfoStr);
		Element root = doc.getRootElement();
		List<Element> mtsOrders = root.elements("mtsOrder");
		for(Element mtsOrder : mtsOrders)
		{
			userName = XmlUtil.tryGetItemText(mtsOrder, "userName", ""); 
			userId = XmlUtil.tryGetItemText(mtsOrder, "userId", "");
		}
		IpsDatasource ipsDataSource = null;
		if(order.getInt1() == IS_HIT)
		{
			//复制数据源
			ipsDataSource = ipsDataSourceBusiness.copyDataSourceByDsID(order.getDsId(), userName, Integer.parseInt(userId));
			if(ipsDataSource != null)
			{
				//更改订单状态为 已复制数据源--100
				updateOrderStateByOrderID(IS_COPY_DATASOURCE, order.getOrderId());
				//更新 订单中STR_1 字段为 新数据源ID
				updateOrderNewDSIDByOrderID(ipsDataSource.getDsId(), order.getOrderId());
				order.setInt1(IS_COPY_DATASOURCE);
			}else throw new Exception("为新生成的订单复制数据源失败！");
		}
		else
		{
			//取得复制之后的数据源
			ipsDataSource = ipsDataSourceBusiness.getDataSourceByDsID(order.getStr1());
			if(ipsDataSource == null) throw new Exception("复制之后的数据源为空，DsID : " + order.getStr1());
		}
		
		//时间戳
		SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyyMMddHHmmssSSS");
		Date currentDate = new Date();
		String timeStr = simpleDateFormat.format(currentDate);
		
		//根据数据库标识入不同的库
		if(DBType.JFDB.getValue().equals(ipsDataSource.getDbType()))
		{
			JFOrderThread gBaseOrderThread = new JFOrderThread("ImportJFDB:"+timeStr, order, userName, userId, ipsDataSource);
			gBaseOrderThread.start();
			orderThreadList.put(order.getOrderId(), gBaseOrderThread);
		}else if(DBType.GBase.getValue().equals(ipsDataSource.getDbType()))
		{
			GBaseOrderThread gBaseOrderThread = new GBaseOrderThread("ImportGbase:"+timeStr, order, userName, userId, ipsDataSource);
			gBaseOrderThread.start();
			orderThreadList.put(order.getOrderId(), gBaseOrderThread);
		}
	}
}
