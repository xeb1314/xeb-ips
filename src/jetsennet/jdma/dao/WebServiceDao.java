package jetsennet.jdma.dao;

import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

import jetsennet.common.DataAccessBase;
import jetsennet.sqlclient.ISqlExecutor;
import jetsennet.sqlclient.SqlCondition;
import jetsennet.sqlclient.SqlField;
import jetsennet.sqlclient.SqlLogicType;
import jetsennet.sqlclient.SqlParamType;
import jetsennet.sqlclient.SqlRelationType;

public class WebServiceDao extends DataAccessBase
{
	public final static String TABLE_NAME = "DMA_WEBSERVICE";
	public final static String PRIMARY_KEY = "SERVICE_ID";

	public WebServiceDao(ISqlExecutor sqlExecutor)
	{
		super(sqlExecutor);
	}

	public void add(HashMap<String, String> model) throws Exception
	{
		SqlField[] param = new SqlField[] { new SqlField("SERVICE_ID", model.get("SERVICE_ID")), 
				new SqlField("SYS_ID", model.get("SYS_ID")),
				new SqlField("SERVICE_NAME", model.get("SERVICE_NAME")), 
				new SqlField("SERVICE_CODE", model.get("SERVICE_CODE")),
				new SqlField("SERVICE_DESC", model.get("SERVICE_DESC")), 
				new SqlField("WSDL_PATH", model.get("WSDL_PATH")),
				new SqlField("SERVICE_URL", model.get("SERVICE_URL")), 
				new SqlField("CREATE_USER", model.get("CREATE_USER")),
				new SqlField("CREATE_TIME", new Date(), SqlParamType.DateTime), 
				new SqlField("STATE", model.get("STATE"), SqlParamType.Numeric) };
		getSqlExecutor().executeNonQuery(getSqlParser().getInsertCommandString(TABLE_NAME, Arrays.asList(param)));
	}

	public void delete(SqlCondition... p) throws Exception
	{
		getSqlExecutor().executeNonQuery(getSqlParser().getDeleteCommandString(TABLE_NAME, p));
	}

	public void deleteById(String keyId) throws Exception
	{
		SqlCondition p = new SqlCondition(PRIMARY_KEY, String.valueOf(keyId), SqlLogicType.And, SqlRelationType.Equal, SqlParamType.String);
		delete(p);
	}

	public void update(HashMap<String, String> model) throws Exception
	{
		SqlField[] param = new SqlField[] { SqlField.tryCreate("SYS_ID", model.get("SYS_ID")),
				SqlField.tryCreate("SERVICE_NAME", model.get("SERVICE_NAME")), 
				SqlField.tryCreate("SERVICE_CODE", model.get("SERVICE_CODE")),
				SqlField.tryCreate("SERVICE_DESC", model.get("SERVICE_DESC")), 
				SqlField.tryCreate("WSDL_PATH", model.get("WSDL_PATH")),
				SqlField.tryCreate("SERVICE_URL", model.get("SERVICE_URL")), 
				SqlField.tryCreate("STATE", model.get("STATE"), SqlParamType.Numeric) };
		SqlCondition p = new SqlCondition(PRIMARY_KEY, model.get(PRIMARY_KEY), SqlLogicType.And, SqlRelationType.Equal, SqlParamType.String);

		getSqlExecutor().executeNonQuery(getSqlParser().getUpdateCommandString(TABLE_NAME, Arrays.asList(param), p));
	}

	public void update(List<SqlField> updateItems, SqlCondition... p) throws Exception
	{
		if (updateItems == null)
		{
			return;
		}
		getSqlExecutor().executeNonQuery(getSqlParser().getUpdateCommandString(TABLE_NAME, updateItems, p));
	}
}
