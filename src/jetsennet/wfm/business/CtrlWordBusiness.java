package jetsennet.wfm.business;

import org.dom4j.DocumentHelper;
import org.dom4j.Element;

import jetsennet.frame.business.BaseBusiness;
import jetsennet.frame.business.Business;
import jetsennet.sqlclient.SqlField;
import jetsennet.util.DBUtil;
import jetsennet.util.SerializerUtil;
import jetsennet.wfm.schema.Activity;
import jetsennet.wfm.schema.Ctrlword;

public class CtrlWordBusiness extends BaseBusiness{

	@Override
    @Business
    public int commonObjInsert(String className, String xml) throws Exception
    {
        Element root = DocumentHelper.parseText(xml).getRootElement();
        Ctrlword ctrlword = SerializerUtil.deserialize(Ctrlword.class, root);
        getDao().saveBusinessObjs(ctrlword);
        return 0;
    }

	
    @Business
    @Override
    public int commonObjDelete(String className, String keyValues) throws Exception
    {
        if (getDao().isExist(Activity.class, DBUtil.getInCond(Activity.PROP_ACT_CLASS, keyValues)))
        {
            SqlField sqlF = new SqlField(Activity.PROP_ACT_CLASS, 0); 
            getDao().update(Activity.class, sqlF, DBUtil.getInCond(Activity.PROP_ACT_CLASS, keyValues));
        }
        getDao().delete(Ctrlword.class, DBUtil.getInCond(Ctrlword.PROP_CW_ID, keyValues));
        return 0;
    }
    
    
    @Business
    @Override
    public int commonObjUpdateByPk(String className, String xml, boolean isFilterNull) throws Exception
    {
        Element root = DocumentHelper.parseText(xml).getRootElement();
        Ctrlword ctrlword = SerializerUtil.deserialize(Ctrlword.class, root);
        getDao().updateBusinessObjs(isFilterNull, ctrlword);
        return 0;
    }
}
