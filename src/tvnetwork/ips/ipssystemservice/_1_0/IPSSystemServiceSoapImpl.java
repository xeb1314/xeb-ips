
/**
 * Please modify this class to meet your needs
 * This class is not complete
 */

package tvnetwork.ips.ipssystemservice._1_0;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Logger;

import jetsennet.frame.security.UserProfileInfo;
import jetsennet.ips.business.AttributeItemName;
import jetsennet.ips.business.Constant.OrderOperation;
import jetsennet.ips.business.IpsDataSourceBusiness;
import jetsennet.ips.business.IpsOrderBusiness;
import jetsennet.ips.schema.IpsDatasource;
import jetsennet.ips.schema.IpsOrder;
import jetsennet.juum.business.UserBusiness;
import jetsennet.util.SerializerUtil;

import org.uorm.dao.common.SqlParameter;

import tvnetwork.schema.ips._1.ArrayOfAttributeItemType;
import tvnetwork.schema.ips._1.AttributeItemType;
import tvnetwork.schema.ips._1.OrderMsgType;

/**
 * This class was generated by Apache CXF 3.0.0-milestone2
 * 2015-03-30T15:12:23.005+08:00
 * Generated source version: 3.0.0-milestone2
 * 
 */

@javax.jws.WebService(
                      serviceName = "IPSSystemService",
                      portName = "IPSSystemServiceSoap",
                      targetNamespace = "http://TVNetwork/IPS/IPSSystemService/1.0",
                      endpointInterface = "tvnetwork.ips.ipssystemservice._1_0.IPSSystemServicePort")
                      
public class IPSSystemServiceSoapImpl implements IPSSystemServicePort {

    private UserBusiness userBusiness;
	private IpsDataSourceBusiness ipsDataSourceBusiness;
	private IpsOrderBusiness ipsOrderBus;

	public void setUserBusiness(UserBusiness userBusiness) {
		this.userBusiness = userBusiness;
	}

	public void setIpsOrderBus(IpsOrderBusiness ipsOrderBus) {
		this.ipsOrderBus = ipsOrderBus;
	}

	public void setIpsDataSourceBusiness(IpsDataSourceBusiness ipsDataSourceBusiness) {
		this.ipsDataSourceBusiness = ipsDataSourceBusiness;
	}
	
    private static final Logger LOG = Logger.getLogger(IPSSystemServiceSoapImpl.class.getName());

    /* (non-Javadoc)
     * @see tvnetwork.ips.ipssystemservice._1_0.IPSSystemServicePort#getDataSource(tvnetwork.schema.common._2.RequestHeadType  requestHead ,)tvnetwork.ips.ipssystemservice._1_0.GetDataSourceRequest  getDataSourceRequest )*
     */
    public tvnetwork.ips.ipssystemservice._1_0.GetDataSourceResponse getDataSource(tvnetwork.schema.common._2.RequestHeadType requestHead,GetDataSourceRequest getDataSourceRequest) { 
        LOG.info("Executing operation getDataSource");
        System.out.println(requestHead);
        System.out.println(getDataSourceRequest);
        GetDataSourceResponse _return = new GetDataSourceResponse();
        tvnetwork.schema.common._2.WSResultType _returnWSResult = new tvnetwork.schema.common._2.WSResultType();
        try {
        	int code = this.userBusiness.getUserAuthentication().userValidate(requestHead.getUserToken(), new ArrayList<String>(0));
            if(code != 0) {
                throw new Exception("用户未登录");
            }
            Long lid = this.userBusiness.getDao().querySingleObject(Long.class, "SELECT T.ID FROM UUM_USER T WHERE T.LOGIN_NAME=?", new SqlParameter(getDataSourceRequest.getLoginName()));
        	if(lid != null) {
                
        		SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        		
        		tvnetwork.schema.ips._1.ArrayOfDataSourceType _returnDataSourceList = new tvnetwork.schema.ips._1.ArrayOfDataSourceType();
                java.util.List<tvnetwork.schema.ips._1.DataSourceType> _returnDataSourceListDataSource = new java.util.ArrayList<tvnetwork.schema.ips._1.DataSourceType>();
                
                //获取自定义数据集合 即 用户拥有的数据源以及标签权限集合
        		List<Map<String,Object>> objList = this.ipsDataSourceBusiness.getDataSourceAndLabelByUserID(lid.intValue());
        		for(Map<String,Object> dataMap : objList)
        		{
        			tvnetwork.schema.ips._1.DataSourceType dataSourceType = new tvnetwork.schema.ips._1.DataSourceType();
        			
        			//是否作为新数据源对象标识
    				boolean _flag = false;
    				
        			//判断当前返回数据源集合中是否存在数据源
        			if(_returnDataSourceListDataSource.size() > 0)
        			{
        				for(tvnetwork.schema.ips._1.DataSourceType dsObj : _returnDataSourceListDataSource)
        				{
        					//当前数据源ID是否与返回集合中的数据源ID
        					if(dsObj.getDsID().equals(dataMap.get("DS_ID")))
        					{
        						//将当前数据源的权限追加至返回集合数据源attributeItem中
        	        			AttributeItemType arr01 = new AttributeItemType();
        	        			arr01.setItemCode(dataMap.get("CW_TYPENAME").toString());
        	        			arr01.setItemValue(dataMap.get("CW_NAME").toString());
        	        			
        	        			ArrayOfAttributeItemType extendAttributes = dsObj.getExtendAttributes();
        	        			List<AttributeItemType> attributeItem = extendAttributes.getAttributeItem();
        	        			attributeItem.add(arr01);
        	        			_flag = true;
        	        			break;
        					}
        				}
        			}
        			//true-跳出循环，获取下一个dataMap对象;false-返回集合中不存在此数据源，需要插入
    				if(_flag)continue;
    				
    				dataSourceType.setDsID(dataMap.get("DS_ID").toString());
        			dataSourceType.setDsUID(dataMap.get("DS_UID")==null?"":dataMap.get("DS_UID").toString());
        			dataSourceType.setParentID(dataMap.get("PARENT_ID")==null?"":dataMap.get("PARENT_ID").toString());
        			dataSourceType.setDsName(dataMap.get("DS_NAME")==null?"":dataMap.get("DS_NAME").toString());
        			dataSourceType.setDsType(dataMap.get("DS_TYPE")==null?0:Integer.valueOf(dataMap.get("DS_TYPE").toString()));
        			dataSourceType.setDsClass(dataMap.get("DS_CLASS")==null?0:Integer.valueOf(dataMap.get("DS_CLASS").toString()));
        			dataSourceType.setDsClassName(getDsClassName(Integer.valueOf(dataMap.get("DS_CLASS").toString())));
        			dataSourceType.setState(dataMap.get("STATE")==null?0:Integer.valueOf(dataMap.get("STATE").toString()));
        			dataSourceType.setDsParam(dataMap.get("DS_PARAM")==null?"":dataMap.get("DS_PARAM").toString());
        			dataSourceType.setCreateUser(dataMap.get("CREATE_USER")==null?"":dataMap.get("CREATE_USER").toString());
        			dataSourceType.setCreateUserID(dataMap.get("CREATE_USERID")==null?0:Integer.valueOf(dataMap.get("CREATE_USERID").toString()));
        			dataSourceType.setCreateTime(simpleDateFormat.format(dataMap.get("CREATE_TIME")));
        			dataSourceType.setUpdateUser(dataMap.get("UPDATE_USER")==null?"":dataMap.get("UPDATE_USER").toString());
        			dataSourceType.setUpdateUserID(dataMap.get("UPDATE_USERID")==null?0:Integer.valueOf(dataMap.get("UPDATE_USERID").toString()));
        			if(dataMap.get("UPDATE_TIME")!=null)
        			{
        				dataSourceType.setUpdateTime(simpleDateFormat.format(dataMap.get("UPDATE_TIME")));
        			}else{
        				dataSourceType.setUpdateTime("");
        			}
        			dataSourceType.setDsDesc(dataMap.get("DS_DESC")==null?"":dataMap.get("DS_DESC").toString());
        			dataSourceType.setStr1(dataMap.get("STR_1")==null?"":dataMap.get("STR_1").toString());
        			dataSourceType.setStr2(dataMap.get("STR_2")==null?"":dataMap.get("STR_2").toString());
        			dataSourceType.setStr3(dataMap.get("STR_3")==null?"":dataMap.get("STR_3").toString());
        			
        			ArrayOfAttributeItemType arrayAtt = new ArrayOfAttributeItemType();
        			List<AttributeItemType> arr = new ArrayList<AttributeItemType>();
        			
        			AttributeItemType arr01 = new AttributeItemType();
        			arr01.setItemCode(AttributeItemName.DBType);
        			arr01.setItemValue(dataMap.get("DB_TYPE")==null?"":dataMap.get("DB_TYPE").toString());
        			
        			AttributeItemType arr02 = new AttributeItemType();
        			arr02.setItemCode(dataMap.get("CW_TYPENAME").toString());
        			arr02.setItemValue(dataMap.get("CW_NAME").toString());
        			
        			arr.add(arr01);
        			arr.add(arr02);
        			arrayAtt.getAttributeItem().addAll(arr);
        			dataSourceType.setExtendAttributes(arrayAtt);
        			_returnDataSourceListDataSource.add(dataSourceType);
        		}
        		_returnDataSourceList.getDataSource().addAll(_returnDataSourceListDataSource);
        		_return.setDataSourceList(_returnDataSourceList);
        	} else {
        		_returnWSResult.setErrorCode(-1);
        		_returnWSResult.setErrorString(String.format("无此用户[%s]", getDataSourceRequest.getLoginName()));
            }
        } catch (java.lang.Exception ex) {
        	_returnWSResult.setErrorCode(-1);
        	_returnWSResult.setErrorString(ex.getMessage());
            ex.printStackTrace();
        }
        _return.setWSResult(_returnWSResult);
        return _return;
    }

	private String getDsClassName(int dsClass)
	{
		String dsClassName = "";
		switch(dsClass)
		{
			case 801:dsClassName="邮件";break;
			case 802:dsClassName="口令";break;
			case 803:dsClassName="身份认证";break;
			case 808:dsClassName="话音";break;
			case 810:dsClassName="文件";break;
			case 811:dsClassName="传真";break;
			case 812:dsClassName="文本";break;
			case 815:dsClassName="IP";break;
			case 895:dsClassName="短信";break;
			default: dsClassName = "其他";
		}
		
		return dsClassName;
	}
    /* (non-Javadoc)
     * @see tvnetwork.ips.ipssystemservice._1_0.IPSSystemServicePort#order(tvnetwork.schema.common._2.RequestHeadType  requestHead ,)tvnetwork.ips.ipssystemservice._1_0.OrderRequest  orderRequest )*
     */
    public tvnetwork.ips.ipssystemservice._1_0.OrderResponse order(tvnetwork.schema.common._2.RequestHeadType requestHead,OrderRequest orderRequest) { 
        LOG.info("Executing operation order");
        System.out.println(requestHead);
        System.out.println(orderRequest);
		OrderResponse _return = new OrderResponse();
        tvnetwork.schema.common._2.WSResultType _returnWSResult = new tvnetwork.schema.common._2.WSResultType();
        try {
        	String loginName = orderRequest.getOrderMsg().getLoginName();
        	UserProfileInfo userInfo = this.userBusiness.getUserProfileInfo4Login(loginName);
        	
        	OrderMsgType mailOrderMsg = orderRequest.getOrderMsg();
        	StringBuilder sb = new StringBuilder();
        	String orderOperation = "";
        	String orderUid = "";
//        	if("801".equals(mailOrderMsg.getOrderType()))
//        	{
               	sb.append("<mts version=\"2.1\">");
        		sb.append("<mtsOrder>");
		        	sb.append("<userName>");
		        		sb.append(mailOrderMsg.getLoginName());
		        	sb.append("</userName>");
		        	sb.append("<dsID>");
		        	sb.append(mailOrderMsg.getDataSourceID());
		        	sb.append("</dsID>");
		        	sb.append("<userId>");
		        	sb.append(userInfo.getUserId());
		        	sb.append("</userId>");
		        	sb.append("<orderInfo>");
		        	for(AttributeItemType orderItem : mailOrderMsg.getExtendAttributes().getAttributeItem())
		        	{
		        		sb.append("<"+orderItem.getItemCode()+">");
			        	sb.append(orderItem.getItemValue());
			        	sb.append("</"+orderItem.getItemCode()+">");;
			        	if(AttributeItemName.OrderOperation.equals(orderItem.getItemCode()))
			        	{
			        		orderOperation = orderItem.getItemValue();
			        	}
			        	if(AttributeItemName.OrderUID.equals(orderItem.getItemCode()))
			        	{
			        		orderUid = orderItem.getItemValue();
			        	}
		        	}
		        	sb.append("</orderInfo>");
        		sb.append("</mtsOrder>");
        	sb.append("</mts>");
//        	}
        	
        	//添加新的订阅单
        	if(OrderOperation.ADD.getValue().equals(orderOperation))
        	{
	        	SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyyMMddHHmmssSSS");
	    		Date currentDate = new Date();
	    		String timeName = simpleDateFormat.format(currentDate);
	        	
	    		String orderId = UUID.randomUUID().toString();
	    		IpsDatasource dataSource = this.ipsDataSourceBusiness.getDataSourceByDsID(mailOrderMsg.getDataSourceID());
	    		
	    		//订阅单
	        	IpsOrder ipsOrder = new IpsOrder();
	        	ipsOrder.setOrderId(orderId);
	        	ipsOrder.setOrderuserId(Integer.valueOf(userInfo.getUserId()));
	//        	ipsOrder.setOrderName(loginName + "_" + timeName + "_订阅单");//loginName + "_" + dataSource.getDsName() + "_" + timeName + "_订阅单"
	        	ipsOrder.setOrderName(loginName + "_" + dataSource.getDsName() + "_" + timeName + "_订阅单");
	        	ipsOrder.setOrderType(20);
	        	ipsOrder.setNotifyUrl("");
	        	ipsOrder.setDsId(mailOrderMsg.getDataSourceID());
	        	ipsOrder.setOrderInfo(sb.toString());
	        	ipsOrder.setInt1(0);
	        	ipsOrder.setStr2(orderUid);
	        	//生成订阅单
	        	this.ipsOrderBus.commonObjInsert("IPS_ORDER", SerializerUtil.serialize(ipsOrder, "ipsOrder"));
	    		_returnWSResult.setResultVal(orderId);
        	}else if(OrderOperation.CANCEL.getValue().equals(orderOperation))//取消订阅
        	{
        		IpsOrder ipsOrder = ipsOrderBus.getIpsOrderByOrderUid(orderUid);
        		ipsOrder.setInt1(400);
        		ipsOrderBus.getReplaceDao().updateBusinessObjs(true, ipsOrder);
        	}
        	
        } catch (java.lang.Exception ex) {
        	_returnWSResult.setErrorCode(-1);
        	_returnWSResult.setErrorString(ex.getMessage());
            ex.printStackTrace();
        }
        _return.setWSResult(_returnWSResult);
        return _return;
    }

}
