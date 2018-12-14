/* ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
 * 北京捷成世纪科技股份有限公司
 * 日 期：2014-11-9 下午03:56:14
 * 文 件：CtrlClassBusiness.java
 * 作 者：薛恩彬
 * 版 本：1.0.0
 * ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
 */
package jetsennet.ips.business;

import java.util.Map;

import org.dom4j.DocumentHelper;
import org.dom4j.Element;

import jetsennet.frame.business.BaseBusiness;
import jetsennet.frame.business.Business;
import jetsennet.ips.schema.IpsCtrlclass;
import jetsennet.util.DBUtil;
import jetsennet.util.SerializerUtil;

/**
 *  TODO 添加该类的简单功能说明以及算法
 *
 * @author <a href="mailto:xueenbin@jetsen.cn">薛恩彬</a>
 * @version 1.0.0
 * ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝<br/>
 * 修订日期            修订人          描述<br/>
 * 2014-11-9   薛恩彬          创建<br/>
 */
public class CtrlClassBusiness extends BaseBusiness{
	
	@Override
    @Business
    public int commonObjInsert(String className, String xml) throws Exception
    {
        /*Element root = DocumentHelper.parseText(xml).getRootElement();
        IpsCtrlclass ipsCtrlclass = SerializerUtil.deserialize(IpsCtrlclass.class, root);
        getDao().saveBusinessObjs(ipsCtrlclass);
        return 0;*/
		Class cls = getSchemaClass("jetsennet.ips.schema.IpsCtrlclass");
		Map module = SerializerUtil.deserialize2map(cls, xml);
	    return getDao().saveModelData(cls, module);
    }

	
    @Business
    @Override
    public int commonObjDelete(String className, String keyValues) throws Exception
    {
        getDao().delete(IpsCtrlclass.class, DBUtil.getInCond(IpsCtrlclass.PROP_CLASS_ID, keyValues));
        return 0;
    }
    
    
    @Business
    @Override
    public int commonObjUpdateByPk(String className, String xml, boolean isFilterNull) throws Exception
    {
        Element root = DocumentHelper.parseText(xml).getRootElement();
        IpsCtrlclass ipsCtrlclass = SerializerUtil.deserialize(IpsCtrlclass.class, root);
        getDao().updateBusinessObjs(isFilterNull, ipsCtrlclass);
        return 0;
    }
}
