package jetsennet.mtc.business;

import org.apache.log4j.Logger;

import jetsennet.frame.business.BaseBusiness;
import jetsennet.frame.business.Business;
import jetsennet.mtc.schema.NetWfmMtcOperatorlog;
import jetsennet.util.DBUtil;

public class WfmMtcBusiness extends BaseBusiness{

	private static final Logger logger = Logger.getLogger(WfmMtcBusiness.class);
	
	@Business
    @Override
    public int commonObjDelete(String className, String keyValues) throws Exception
    {
        getDao().delete(NetWfmMtcOperatorlog.class, DBUtil.getInCond(NetWfmMtcOperatorlog.PROP_ID, keyValues));
        return 0;
    }
}
