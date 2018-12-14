package jetsennet.ips.business;

import java.io.File;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import jetsennet.frame.business.BaseBusiness;
import jetsennet.frame.business.Business;
import jetsennet.frame.dataaccess.IDao;
import jetsennet.ips.schema.IpsCtrlword;
import jetsennet.ips.schema.IpsDatasource;
import jetsennet.ips.schema.IpsDatatsourcelabel;
import jetsennet.net.WSResult;
import jetsennet.sqlclient.DataMap;
import jetsennet.sqlclient.ISqlParser;
import jetsennet.sqlclient.SqlCondition;
import jetsennet.sqlclient.SqlQuery;
import jetsennet.util.SerializerUtil;
import jetsennet.util.SpringContextUtil;
import jetsennet.util.StringUtil;

import org.apache.log4j.Logger;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.uorm.dao.common.SqlParameter;

public class IpsDataSourceBusiness extends BaseBusiness {

	private static final Logger logger = Logger.getLogger(IpsDataSourceBusiness.class);
	
	public IDao getReplaceDao()
    {
        IDao daof = getDao();
        if (daof == null)
        {
        	IpsDataSourceBusiness ipsDataSourceBusiness = (IpsDataSourceBusiness) SpringContextUtil.getBean("ipsDataSourceBusiness");
            return ipsDataSourceBusiness.getDao();
        }
        return daof;
    }
	
	@Override
	@Business
	public int commonObjInsert(String className, String xml) throws Exception {
	/*	Element root = DocumentHelper.parseText(xml).getRootElement();
		IpsDatasource ipsDataSource = SerializerUtil.deserialize(IpsDatasource.class, root);
        getReplaceDao().saveBusinessObjs(ipsDataSource);
        return 0;*/
		Class cls = getSchemaClass("jetsennet.ips.schema.IpsDatasource");
		Map module = SerializerUtil.deserialize2map(cls, xml);
	    return getDao().saveModelData(cls, module);
	}
	
	@Override
    @Business
    public int commonObjUpdateByPk(String className, String xml, boolean isFilterNull) throws Exception
    {
        Element root = DocumentHelper.parseText(xml).getRootElement();
        IpsDatasource ipsDataSource = SerializerUtil.deserialize(IpsDatasource.class, root);
        getReplaceDao().updateBusinessObjs(isFilterNull, ipsDataSource);
        return 0;
    }
	
	public List<IpsDatasource> getDataSourceByUserId(int userId) throws Exception
    {
		return getReplaceDao().queryBusinessObjs(IpsDatasource.class, "SELECT * FROM IPS_DATASOURCE A WHERE (A.DS_ID IN (SELECT B.DS_ID FROM IPS_DATATOUSER B WHERE B.USER_ID = "+userId+") AND A.STATE = 1) OR A.STATE = 0");
    }
	
	public IpsDatasource getDataSourceByDsID(String dsID) throws Exception
	{
		return getReplaceDao().querySingleObject(IpsDatasource.class, "SELECT * FROM IPS_DATASOURCE WHERE DS_ID = ?", new SqlParameter(dsID));
	}

	public IpsDatasource copyDataSourceByDsID(String dsId, String loginName, int userId) throws Exception
	{
		SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyyMMddHHmmssSSS");
		Date currentDate = new Date();
		String timeName = simpleDateFormat.format(currentDate);
		
		IpsDatasource dataSource = getDataSourceByDsID(dsId);
		
		IpsDatasource ipsDatasource = new IpsDatasource();
		ipsDatasource.setDsId(UUID.randomUUID().toString());
		ipsDatasource.setDsUid(dataSource.getDsUid());
		ipsDatasource.setParentId(dsId);
		ipsDatasource.setDsName(dataSource.getDsName() + "_" + timeName);
		ipsDatasource.setDsType(dataSource.getDsType());
		ipsDatasource.setDsClass(dataSource.getDsClass());
		ipsDatasource.setState(0);//默认为公共
		ipsDatasource.setDsParam(dataSource.getDsParam());
		if(StringUtil.isNullOrEmpty(loginName))
		{
			ipsDatasource.setCreateUser(dataSource.getCreateUser());
		}else ipsDatasource.setCreateUser(loginName);
		if(userId != 0)
		{
			ipsDatasource.setCreateUserid(userId);
		}else ipsDatasource.setCreateUserid(dataSource.getCreateUserid());
		ipsDatasource.setCreateTime(new Timestamp(currentDate.getTime()));
		ipsDatasource.setDsDesc(dataSource.getDsDesc());
		ipsDatasource.setStr1(dataSource.getStr1());
		ipsDatasource.setStr2(dataSource.getStr2());
		ipsDatasource.setStr3(dataSource.getStr3());
		ipsDatasource.setDbType(dataSource.getDbType());
		int commonObjInsert = commonObjInsert("IPS_DATASOURCE", SerializerUtil.serialize(ipsDatasource, "ipsDataSrouceInfo"));
		return ipsDatasource;
	}
	
	/**
	 * 
	 * 根据用户ID获取当前用户所拥有数据源以及权限标签
	 * 2015年10月19日 下午2:14:21 By JiJie.LianG
	 * @param userId
	 * @return
	 * @throws Exception
	 *  @SQL
	 * SELECT S.*,P.ID AS P_ID,P.TYPE AS P_TYPE,P.CW_IDS,P.CW_NAME,P.CW_TYPENAME FROM IPS_DATASOURCE S JOIN 
		(---获取当前用户的数据源主键以及标签权限
			SELECT D.ID,D.DS_ID,D.TYPE,D.CW_IDS,K.CW_NAME,K.STR_1 AS CW_TYPENAME FROM IPS_DATATSOURCELABEL D INNER JOIN 
			(---获取IPS_CTRLWORD 类别标识和各项名称 即所有权限
				SELECT R.CW_ID,R.CW_NAME,C.STR_1 FROM IPS_CTRLWORD R LEFT JOIN IPS_CTRLWORD C ON R.CW_TYPE = C.CW_CODE WHERE R.CW_TYPE NOT IN ('-1') AND C.STR_1 IS NOT NULL
			) K ON D.CW_IDS = K.CW_ID  WHERE D.ID IN 
				(---获取当前用户所在组并取得当前组所拥有的标签数据源主键 DS_LABELID
					SELECT O.DS_LABELID FROM IPS_DSLABELTOUSERGROUP O JOIN UUM_USERTOGROUP G ON O.GROUP_ID = G.GROUP_ID WHERE G.USER_ID = 12
				)
		) P on S.DS_ID = P.DS_ID
	 */
	public List<Map<String, Object>> getDataSourceAndLabelByUserID(int userId) throws Exception
	{
		return getReplaceDao().queryForListMap("SELECT S.*,P.ID AS P_ID,P.TYPE AS P_TYPE,P.CW_IDS,P.CW_NAME,P.CW_TYPENAME FROM IPS_DATASOURCE S JOIN "
				+ "(SELECT D.ID,D.DS_ID,D.TYPE,D.CW_IDS,K.CW_NAME,K.STR_1 AS CW_TYPENAME FROM IPS_DATATSOURCELABEL D INNER JOIN "
					+ "(SELECT R.CW_ID,R.CW_NAME,C.STR_1 FROM IPS_CTRLWORD R LEFT JOIN IPS_CTRLWORD C ON R.CW_TYPE = C.CW_CODE WHERE R.CW_TYPE NOT IN ('-1') AND C.STR_1 IS NOT NULL) K ON D.CW_IDS = K.CW_ID  WHERE D.ID IN "
				+ "(SELECT O.DS_LABELID FROM IPS_DSLABELTOUSERGROUP O JOIN UUM_USERTOGROUP G ON O.GROUP_ID = G.GROUP_ID WHERE G.USER_ID =?)"
				+ ") P on S.DS_ID = P.DS_ID", new SqlParameter(userId));
		
//		return getReplaceDao().queryBusinessObjs(DataMap.class,"SELECT S.*,P.ID AS P_ID,P.TYPE AS P_TYPE,P.CW_IDS,P.CW_NAME,P.CW_TYPENAME FROM IPS_DATASOURCE S JOIN "
//				+ "(SELECT D.ID,D.DS_ID,D.TYPE,D.CW_IDS,K.CW_NAME,K.STR_1 AS CW_TYPENAME FROM IPS_DATATSOURCELABEL D INNER JOIN "
//					+ "(SELECT R.CW_ID,R.CW_NAME,C.STR_1 FROM IPS_CTRLWORD R LEFT JOIN IPS_CTRLWORD C ON R.CW_TYPE = C.CW_CODE WHERE R.CW_TYPE NOT IN ('-1') AND C.STR_1 IS NOT NULL) K ON D.CW_IDS = K.CW_ID  WHERE D.ID IN "
//				+ "(SELECT O.DS_LABELID FROM IPS_DSLABELTOUSERGROUP O JOIN UUM_USERTOGROUP G ON O.GROUP_ID = G.GROUP_ID WHERE G.USER_ID = "+userId+")"
//				+ ") P on S.DS_ID = P.DS_ID");
	}

	/**
	 * 
	 * 继承数据源标签
	 * 
	 * 继承之前先验证目标数据源中是否存在标签
	 * 2015年10月12日 上午10:28:14 By JiJie.LianG
	 * @param srcDsId
	 * @param dstDsId
	 * @return
	 * @throws SQLException
	 */
	 public int extendsDsLable(String srcDsId,String dstDsId) throws Exception{
		 //数据源标签集合
		 List<IpsDatatsourcelabel> srcDsLableList = getReplaceDao().queryBusinessObjs(IpsDatatsourcelabel.class, "SELECT * FROM IPS_DATATSOURCELABEL H INNER JOIN (SELECT R.CW_ID,R.CW_TYPE,C.STR_1 FROM IPS_CTRLWORD R LEFT JOIN IPS_CTRLWORD C ON R.CW_TYPE = C.CW_CODE WHERE R.CW_TYPE NOT IN ('-1') AND C.STR_1 IS NOT NULL) K ON H.CW_IDS = K.CW_ID WHERE H.DS_ID = '" + srcDsId +"'");
		 //源数据源标签集合为0,直接返回
		 if(srcDsLableList.size() == 0)
		 {
			 return 0;
		 }
		 
		 //获取当前目标数据源所有标签集合
		 List<IpsDatatsourcelabel> dstDsLableList = getReplaceDao().queryBusinessObjs(IpsDatatsourcelabel.class, "SELECT * FROM IPS_DATATSOURCELABEL WHERE DS_ID = '"+dstDsId+"'");
		 //目标数据源 数据字典ID集合
		 List<Object> dstCwIdLs = new ArrayList<Object>();
		 for(IpsDatatsourcelabel dsLable : dstDsLableList)
		 {
			 dstCwIdLs.add(dsLable.getCwIds());
		 }
		 
		 //继承的标签 更新IPS_DATASOURCE STR_2字段 Add by JiJie.LianG 2015.10.28
		 String str2 = "";
		 List<IpsDatatsourcelabel> tempList = new ArrayList<IpsDatatsourcelabel>();
		 if(dstCwIdLs.size() != 0){
			 for(IpsDatatsourcelabel dsLable : srcDsLableList)
			 {
				 if(!dstCwIdLs.contains(dsLable.getCwIds()))
				 {
					 dsLable.setId(UUID.randomUUID().toString());
					 dsLable.setDsId(dstDsId);
					 tempList.add(dsLable);
					 if(StringUtil.isNullOrEmpty(str2)){
						 str2 = dsLable.getCwIds();
					 }else{
						 str2 += "," + dsLable.getCwIds();
					 }
				 }
			 }
		 }else{
			 for(IpsDatatsourcelabel dsLable : srcDsLableList)
			 {
				 dsLable.setId(UUID.randomUUID().toString());
				 dsLable.setDsId(dstDsId);
				 if(StringUtil.isNullOrEmpty(str2)){
					 str2 = dsLable.getCwIds();
				 }else{
					 str2 += "," + dsLable.getCwIds();
				 }
			 }
			 tempList = srcDsLableList;
		 }
		 if(!StringUtil.isNullOrEmpty(str2)){
			 IpsDatasource dsObj = getReplaceDao().querySingleObject(IpsDatasource.class, "SELECT * FROM IPS_DATASOURCE WHERE DS_ID=?", new SqlParameter(dstDsId));
			 if(!StringUtil.isNullOrEmpty(dsObj.getStr2()))
			 {
				 str2 = dsObj.getStr2()+","+str2;
			 }
			 //更新目标数据源STR_2
			 IpsDatasource ipsDataSource = new IpsDatasource();
			 ipsDataSource.setDsId(dstDsId);
			 ipsDataSource.setStr2(str2);
			 getReplaceDao().updateBusinessObjs(true, ipsDataSource);
		 }
		 return getReplaceDao().saveBusinessObjsCol(tempList);
	 }
	 
	 /**
	 * 分页查询数据源标签以及类型集合
	 * @param xml
	 * @param startNum
	 * @param pageSize
	 * @return
	 * @throws SQLException
	 * @SQL 
	 * select * from IPS_CTRLWORD where CW_CODE in (select distinct k.CW_CODE from IPS_DATATSOURCELABEL h left join IPS_CTRLWORD k on h.CW_IDS = k.CW_ID or h.TYPE = k.CW_CODE where h.DS_ID = '0D41AFF2-A4FD-412D-B211-A3422A34002C')
	 */
	 public WSResult dsLabelsQueryForPage(String xml, int startNum, int pageSize) throws SQLException{
	    SqlQuery query = (SqlQuery)SerializerUtil.deserialize(SqlQuery.class, xml);
	    SqlCondition[] cons =  query.conditions;
	    String dsId="";
	    String cwType="";
	    String cwName="";
	    for(int i=0; i<cons.length; i++)
	    {
	    	if("t.DS_ID".equals(cons[i].getParamName()))
	    	{
	    		dsId = cons[i].getParamValue();
	    	}else if("t.CW_TYPE".equals(cons[i].getParamName()))
	    	{
	    		cwType = cons[i].getParamValue();
	    	}else if("t.CW_NAME".equals(cons[i].getParamName())){
	    		cwName = cons[i].getParamValue();
	    	}
	    }
	    
	    String resultSql = "SELECT * FROM IPS_CTRLWORD WHERE CW_CODE IN (SELECT DISTINCT K.CW_CODE FROM IPS_DATATSOURCELABEL H LEFT JOIN IPS_CTRLWORD K ON H.CW_IDS = K.CW_ID OR H.TYPE = K.CW_CODE WHERE H.DS_ID = '"+dsId+"')";
	    //根据CW_TYPE查询CW_TYPE为xxx的所有标签 或者 根据CW_TYPE和CW_NAME 模糊查询CW_TYPE为xxx时的结果
	    if(!StringUtil.isNullOrEmpty(cwType) && !StringUtil.isNullOrEmpty(cwName))
	    {
	    	resultSql +=" AND CW_TYPE = "+cwType+" AND CW_NAME LIKE '%"+cwName+"%'";
	    }else if(!StringUtil.isNullOrEmpty(cwType))
	    {
	    	resultSql +=" AND CW_TYPE = "+cwType+" ";
	    } 
	    String countSql = getDao().getSession().getTransform().getCountSql(resultSql);
	
	    WSResult result = new WSResult();
	    if (isJsonRequest())
	    {
	      result.setResultVal(getDao().fillJsonByPagedQuery(countSql, resultSql, startNum, pageSize, new SqlParameter[0]));
	    }
	    else
	    {
	      result.setResultVal(getDao().fillByPagedQuery(countSql, resultSql, startNum, pageSize, new SqlParameter[0]).asXML());
	    }
	    return result;
	  }
	 
	 
	 /**
	  * 根据路径打开文件夹
	  * flag  1 文件不存在，  0 正常打开文件夹
	  * @param filePath
	  * @return
	  */
	 public int openDeskTop(String filePath){
		int flag = 1;
		filePath = "\\\\192.168.1.111\\share";
		File file = new File(filePath);
		if(file.exists()){
			try{
				//Desktop.getDesktop().open(new File(filePath));
				Runtime rt = Runtime.getRuntime();
				rt.exec("explorer.exe "+file);
				flag = 0;
			}catch (Exception e) {
				e.printStackTrace();
			}
		}else{
			flag = 1;
		}
		return flag;
	 }
	 
}
