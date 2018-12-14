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
import jetsennet.wfm.schema.Procvar;
import jetsennet.wfm.schema.Variable;

public class VariableBusiness extends BaseBusiness
{

    @Override
    @Business
    public int commonObjInsert(String className, String xml) throws Exception
    {
        Element root = DocumentHelper.parseText(xml).getRootElement();
        Variable variable = SerializerUtil.deserialize(Variable.class, root);
        if (getDao().isExist(Variable.class, DBUtil.getECond(Variable.PROP_VAR_NAME, variable.getVarName())))
        {
            throw new Exception("变量名称已存在，请重新填写!");
        }
        getDao().saveBusinessObjs(variable);
        return 0;
    }

    @Business
    @Override
    public int commonObjDelete(String className, String keyValues) throws Exception
    {
        if(getDao().isExist(Procvar.class, 
        		new SqlCondition(Procvar.PROP_VAR_ID,keyValues,SqlLogicType.And,SqlRelationType.In,SqlParamType.Numeric))){
            throw new Exception("变量名称存在被使用的，请重新选择!");
        }
        getDao().delete(Variable.class, 
        		new SqlCondition(Variable.PROP_VAR_ID,keyValues,SqlLogicType.And,SqlRelationType.In,SqlParamType.Numeric));
        return 0;
    }

    @Business
    @Override
    public int commonObjUpdateByPk(String className, String xml, boolean isFilterNull) throws Exception
    {
        Element root = DocumentHelper.parseText(xml).getRootElement();
        Variable variable = SerializerUtil.deserialize(Variable.class, root);
        SqlCondition sqlcon =
            new SqlCondition("VAR_ID", String.valueOf(variable.getVarId()), SqlLogicType.And, SqlRelationType.NotEqual, SqlParamType.Numeric);
        if (getDao().isExist(Variable.class, DBUtil.getECond(Variable.PROP_VAR_NAME, variable.getVarName()), sqlcon))
        {
            throw new Exception("变量名称已存在，请重新填写!");
        }
        getDao().updateBusinessObjs(isFilterNull, variable);
        return 0;
    }

}
