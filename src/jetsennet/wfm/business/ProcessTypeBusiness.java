package jetsennet.wfm.business;


import org.dom4j.DocumentHelper;
import org.dom4j.Element;

import jetsennet.frame.business.BaseBusiness;
import jetsennet.frame.business.Business;
import jetsennet.sqlclient.SqlCondition;
import jetsennet.sqlclient.SqlLogicType;
import jetsennet.sqlclient.SqlParamType;
import jetsennet.sqlclient.SqlRelationType;
import jetsennet.util.DBUtil;
import jetsennet.util.SerializerUtil;
import jetsennet.wfm.schema.ProcessType;
import jetsennet.wfm.schema.Variable;

public class ProcessTypeBusiness extends BaseBusiness{

	@Override
    @Business
    public int commonObjInsert(String className, String xml) throws Exception
    {
        Element root = DocumentHelper.parseText(xml).getRootElement();
        ProcessType processtype = SerializerUtil.deserialize(ProcessType.class, root);
        if(getDao().isExist(ProcessType.class, DBUtil.getECond(ProcessType.PROP_PROC_TYPE, processtype.getProcType()))){
            throw new Exception("此类型编号已存在!");
        }
        getDao().saveBusinessObjs(processtype);
        return 0;
    }

	
    @Business
    @Override
    public int commonObjDelete(String className, String keyValues) throws Exception
    {
    	getDao().delete(ProcessType.class, 
    			new SqlCondition(ProcessType.PROP_PROC_TYPE,keyValues,SqlLogicType.And,SqlRelationType.In,SqlParamType.Numeric));
        return 0;
    }
    
    @Business
    @Override
    public int commonObjUpdateByPk(String className, String xml, boolean isFilterNull) throws Exception
    {
        Element root = DocumentHelper.parseText(xml).getRootElement();
        ProcessType processtype = SerializerUtil.deserialize(ProcessType.class, root);
        getDao().updateBusinessObjs(isFilterNull, processtype);
        return 0;
    }
}
