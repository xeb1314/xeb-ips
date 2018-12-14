/* 
 * Copyright (c) 北京捷成世纪科技股份有限公司. All Rights Reserved.
 * 文件：jetsennet.ips.business.CtrlWordBusiness.java
 * 日 期：2014-11-19 下午05:02:39
 * 作 者：薛恩彬
 */
package jetsennet.ips.business;

import java.util.List;
import java.util.Map;

import jetsennet.frame.business.BaseBusiness;
import jetsennet.frame.business.Business;
import jetsennet.ips.schema.IpsCtrlword;
import jetsennet.util.SerializerUtil;

import org.apache.poi.hssf.record.formula.functions.T;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.uorm.dao.common.SqlParameter;

/**
 *  TODO 数据字典的业务
 *
 * @author <a href="mailto:xueenbin@jetsen.cn">薛恩彬</a>
 * @version 1.0.0
 * ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝<br/>
 * 修订日期                 修订人            描述<br/>
 * 2014-11-19       薛恩彬           创建<br/>
 */
public class CtrlWordBusiness extends BaseBusiness{

	
	@Business
    public int commonObjInsert(int autoAddID,String xml) throws Exception
    {	
      /*  Element root = DocumentHelper.parseText(xml).getRootElement();
        root.selectSingleNode("CW_CODE").setText(String.valueOf(autoAddID));
        IpsCtrlword ipsCtrlword = SerializerUtil.deserialize(IpsCtrlword.class, root);
        getDao().saveBusinessObjs(ipsCtrlword);
        return 0;*/
		Element root = DocumentHelper.parseText(xml).getRootElement();
        root.selectSingleNode("CW_CODE").setText(String.valueOf(autoAddID));
		Class cls = getSchemaClass("jetsennet.ips.schema.IpsCtrlword");
		Map module = SerializerUtil.deserialize2map(cls, root);
	    return getDao().saveModelData(cls, module);
    }

	 /*
    @Business
    @Override
   public int commonObjDelete(String className, String keyValues) throws Exception
    {
        getDao().delete(IpsCtrlword.class, DBUtil.getInCond(Dbsource.PROP_SRC_ID, keyValues));
        return 0;
    }*/
    
    
    @Business
    @Override
    public int commonObjUpdateByPk(String className, String xml, boolean isFilterNull) throws Exception
    {
        Element root = DocumentHelper.parseText(xml).getRootElement();
        IpsCtrlword ipsCtrlword = SerializerUtil.deserialize(IpsCtrlword.class, root);
        getDao().updateBusinessObjs(isFilterNull, ipsCtrlword);
        return 0;
    }
    
    /**
     * 根据主键 CW_ID获取数据字典对象
     * 2015年10月19日 下午1:03:30 By JiJie.LianG
     * @param cwId
     * @return
     * @throws Exception
     */
    public IpsCtrlword getIpsCtrlWordByCWID(String cwId) throws Exception
    {
    	return getDao().querySingleObject(IpsCtrlword.class, "SELECT * FROM IPS_CTRLWORD WHERE CW_ID=?", new SqlParameter(cwId));
    }
    
    /**
     * 
     * 根据字典类别获取数据字典类别对象
     * 2015年10月19日 下午1:06:55 By JiJie.LianG
     * @param cwCode
     * @return
     * @throws Exception
     */
    public IpsCtrlword getIpsCtrlWordByCWCODE(String cwCode) throws Exception
    {
    	return getDao().querySingleObject(IpsCtrlword.class, "SELECT * FROM IPS_CTRLWORD WHERE CW_CODE=?", new SqlParameter(cwCode));
    }
}
