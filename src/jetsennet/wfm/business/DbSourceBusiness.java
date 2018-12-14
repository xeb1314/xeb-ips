package jetsennet.wfm.business;

import org.dom4j.DocumentHelper;
import org.dom4j.Element;

import jetsennet.frame.business.BaseBusiness;
import jetsennet.frame.business.Business;
import jetsennet.util.DBUtil;
import jetsennet.util.SerializerUtil;
import jetsennet.wfm.schema.Dbsource;

public class DbSourceBusiness extends BaseBusiness{

	@Override
    @Business
    public int commonObjInsert(String className, String xml) throws Exception
    {
        Element root = DocumentHelper.parseText(xml).getRootElement();
        Dbsource dbsource = SerializerUtil.deserialize(Dbsource.class, root);
        getDao().saveBusinessObjs(dbsource);
        return 0;
    }

	
    @Business
    @Override
    public int commonObjDelete(String className, String keyValues) throws Exception
    {
        getDao().delete(Dbsource.class, DBUtil.getInCond(Dbsource.PROP_SRC_ID, keyValues));
        return 0;
    }
    
    
    @Business
    @Override
    public int commonObjUpdateByPk(String className, String xml, boolean isFilterNull) throws Exception
    {
        Element root = DocumentHelper.parseText(xml).getRootElement();
        Dbsource dbsource = SerializerUtil.deserialize(Dbsource.class, root);
        getDao().updateBusinessObjs(isFilterNull, dbsource);
        return 0;
    }
}
