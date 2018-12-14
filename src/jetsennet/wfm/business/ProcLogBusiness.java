package jetsennet.wfm.business;

import jetsennet.frame.business.BaseBusiness;
import jetsennet.frame.business.Business;
import jetsennet.util.DBUtil;
import jetsennet.wfm.schema.Proclog;

public class ProcLogBusiness extends BaseBusiness{

	
    @Business
    @Override
    public int commonObjDelete(String className, String keyValues) throws Exception
    {
        getDao().delete(Proclog.class, DBUtil.getInCond(Proclog.PROP_PROCEXEC_ID, keyValues));
        return 0;
    }
    
}
