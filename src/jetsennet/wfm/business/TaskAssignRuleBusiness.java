package jetsennet.wfm.business;

import java.util.HashMap;

import jetsennet.frame.business.BaseBusiness;
import jetsennet.frame.business.Business;
import jetsennet.util.SerializerUtil;
import jetsennet.wfm.schema.Assignrule;

public class TaskAssignRuleBusiness extends BaseBusiness{

	/**
     * 更新流程节点的指派规则
     * 
     * @param assignRuleInfo
     * @throws Exception
     */
	@Business
    @Override
    public int commonObjUpdateByPk(String className, String xml, boolean isFilterNull) throws Exception
    {
		HashMap<String, String> model = SerializerUtil.deserialize2strmap(xml);
		Assignrule assignrule = getDao().queryBusinessObjByPk(Assignrule.class,Integer.valueOf(model.get("PROCACT_ID"))); 
		Assignrule assignruleInsert = new Assignrule();
		assignruleInsert.setAssignType(Integer.valueOf(model.get("ASSIGN_TYPE")));
		assignruleInsert.setAssignObjid(model.get("ASSIGN_OBJID"));
		assignruleInsert.setAssignParam(model.get("ASSIGN_PARAM"));
		assignruleInsert.setProcactId(Integer.valueOf(model.get("PROCACT_ID")));
		if(assignrule!=null){
			getDao().updateBusinessObjs(true,assignruleInsert);
		}else{
			getDao().saveBusinessObjs(assignruleInsert);
		}
		return 0;
    }
}
