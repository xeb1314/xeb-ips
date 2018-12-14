package jetsennet.wfm.business;

import org.dom4j.DocumentHelper;
import org.dom4j.Element;

import jetsennet.frame.business.BaseBusiness;
import jetsennet.frame.business.Business;
import jetsennet.util.SerializerUtil;
import jetsennet.wfm.schema.Sysconfig;

public class SysConfigBusiness extends BaseBusiness{

	@Override
    @Business
    public int commonObjInsert(String className, String xml) throws Exception
    {
        Element root = DocumentHelper.parseText(xml).getRootElement();
        Sysconfig sysconfig = SerializerUtil.deserialize(Sysconfig.class, root);
        getDao().saveBusinessObjs(sysconfig);
        return 0;
    }
	
	@Business
    @Override
    public int commonObjUpdateByPk(String className, String xml, boolean isFilterNull) throws Exception
    {
        Element root = DocumentHelper.parseText(xml).getRootElement();
        Sysconfig sysconfig = SerializerUtil.deserialize(Sysconfig.class, root);
        getDao().updateBusinessObjs(isFilterNull, sysconfig);
        return 0;
    }
}
