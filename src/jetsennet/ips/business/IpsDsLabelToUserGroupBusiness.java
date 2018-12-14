package jetsennet.ips.business;

import java.util.ArrayList;

import jetsennet.frame.business.BaseBusiness;
import jetsennet.frame.dataaccess.IDao;
import jetsennet.ips.schema.IpsDslabeltousergroup;
import jetsennet.ips.schema.IpsTask;
import jetsennet.util.DBUtil;
import jetsennet.util.SpringContextUtil;

import org.apache.log4j.Logger;

public class IpsDsLabelToUserGroupBusiness extends BaseBusiness {
	private static final Logger logger = Logger.getLogger(IpsDsLabelToUserGroupBusiness.class);
	public IDao getReplaceDao()
    {
        IDao daof = getDao();
        if (daof == null)
        {
        	IpsDsLabelToUserGroupBusiness ipsDsLabelToUserGroupBusiness = (IpsDsLabelToUserGroupBusiness) SpringContextUtil.getBean("ipsDsLabelToUserGroupBusiness");
            return ipsDsLabelToUserGroupBusiness.getDao();
        }
        return daof;
    }
	
	public int insertGroup2DsLabel(String dsLabelId, String[] groupIds) throws Exception 
	{
		//根据当前DS_LABELID删除当前所分配的组
		getReplaceDao().delete(IpsDslabeltousergroup.class, DBUtil.getInCond(IpsDslabeltousergroup.PROP_DS_LABELID, dsLabelId));
		
		ArrayList<IpsDslabeltousergroup> ls = new ArrayList<IpsDslabeltousergroup>();
		for (int k = 0; k < groupIds.length; k++) {
			IpsDslabeltousergroup ipsDslabeltousergroup = new IpsDslabeltousergroup();
			ipsDslabeltousergroup.setDsLabelid(dsLabelId);
			ipsDslabeltousergroup.setGroupId(Long.valueOf(groupIds[k]));
			ls.add(ipsDslabeltousergroup);
		}
		 return getReplaceDao().saveBusinessObjsCol(ls);
	}
}
