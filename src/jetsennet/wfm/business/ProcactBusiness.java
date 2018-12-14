package jetsennet.wfm.business;

import org.dom4j.DocumentHelper;
import org.dom4j.Element;

import jetsennet.frame.business.BaseBusiness;
import jetsennet.frame.business.Business;
import jetsennet.util.SerializerUtil;
import jetsennet.wfm.schema.Procact;

public class ProcactBusiness extends BaseBusiness{

	@Override
    @Business
    public int commonObjInsert(String className, String xml) throws Exception
    {
        Element root = DocumentHelper.parseText(xml).getRootElement();
        Procact procact = SerializerUtil.deserialize(Procact.class, root);
        getDao().saveBusinessObjs(procact);
        return 0;
    }

	
    @Business
    @Override
    public int commonObjUpdateByPk(String className, String xml, boolean isFilterNull) throws Exception
    {
        Element root = DocumentHelper.parseText(xml).getRootElement();
        Procact procact = SerializerUtil.deserialize(Procact.class, root);
        getDao().updateBusinessObjs(isFilterNull, procact);
        return 0;
    }
}
