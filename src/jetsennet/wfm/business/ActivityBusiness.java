package jetsennet.wfm.business;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

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
import jetsennet.util.StringUtil;
import jetsennet.wfm.schema.Activity;
import jetsennet.wfm.schema.Variable;

public class ActivityBusiness extends BaseBusiness{

	@Override
    @Business
    public int commonObjInsert(String className, String xml) throws Exception
    {
        Element root = DocumentHelper.parseText(xml).getRootElement();
        Activity activity = SerializerUtil.deserialize(Activity.class, root);
        getDao().saveBusinessObjs(activity);
        return 0;
    }

	
    @Business
    @Override
    public int commonObjDelete(String className, String keyValues) throws Exception
    {
    	String strKeyValues = keyValues.replace("'", "");
    	List<Map<String,String>> actList = getDao().getStrMapLst(
    			"SELECT ACT_NAME FROM WFM_ACTIVITY WHERE ACT_ID IN ("+strKeyValues+") AND ACT_ID IN (SELECT ACT_ID FROM WFM_PROCACT)");
    	List<String> actNames = new ArrayList<String>();
    	for(Map<String,String> item : actList){
    		actNames.add(item.get(Activity.PROP_ACT_NAME));
    	}
    	
    	if(actList.size()>0){
    		throw new Exception("删除节点失败，"+StringUtil.join(String.class,actNames,",")+"已被使用！");
    	}
    	
        getDao().delete(Activity.class, 
        		new SqlCondition(Activity.PROP_ACT_ID,keyValues,SqlLogicType.And,SqlRelationType.In,SqlParamType.Numeric));
        
        return 0;
    }
    
    
    @Business
    @Override
    public int commonObjUpdateByPk(String className, String xml, boolean isFilterNull) throws Exception
    {
        Element root = DocumentHelper.parseText(xml).getRootElement();
        Activity activity = SerializerUtil.deserialize(Activity.class, root);
        getDao().updateBusinessObjs(isFilterNull, activity);
        return 0;
    }

}
