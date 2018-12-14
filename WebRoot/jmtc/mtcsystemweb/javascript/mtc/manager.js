/**
* 获取主备manager信息
*/
function getManager() 
{
    var result;
    var conditions = new jetsennet.SqlConditionCollection();
    conditions.add(jetsennet.SqlCondition.create("SERVER_TYPE", "1", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric));

    var sqlQuery = new jetsennet.SqlQuery();
    jQuery.extend(sqlQuery, { IsPageResult: 0, KeyId: "SERVER_ID", PageInfo: null, Conditions: conditions, ResultFields: "SERVER_ID,SERVER_NAME,HOST_IP,HOST_PORT," +
    "HOST_NAME,SERVER_TYPE,WORK_MODE,WORK_STATE,STATE_DESC,UPDATE_TIME,CREATE_USER,CREATE_TIME,FIELD_1 AS SRCID",
        QueryTable: jQuery.extend(new jetsennet.QueryTable(), { TableName: "MTC_SERVER" })
    });

    jetsennet.request("../../../mtcmanage", { command: "query", query: sqlQuery.toXml() },
	 function (sResult) 
	 {
	     result = jQuery.parseJSON(sResult).Record;

	 }, function (ex) { jetsennet.error(ex); }, { async: false });

    return result;
}
/**
* 获取数据源信息
* 
*/
function getDatabaseInfo(srcId) 
{
    var result;
    var conditions = new jetsennet.SqlConditionCollection();
    conditions.add(jetsennet.SqlCondition.create("SRC_ID", srcId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric));

    var sqlQuery = new jetsennet.SqlQuery();
    jQuery.extend(sqlQuery, { IsPageResult: 0, KeyId: "SRC_ID", PageInfo: null, Conditions: conditions, ResultFields: "SRC_ID,SRC_NAME,DB_TYPE,DB_URL,DB_USER,DB_PASSWORD,STR_1 AS COUNT," +
    "STR_2 AS MAXCOUNT", QueryTable: jQuery.extend(new jetsennet.QueryTable(), { TableName: "WFM_DBSOURCE" })
    });
    jetsennet.request("../../../mtcmanage", { command: "query", query: sqlQuery.toXml() },
	 function (sResult) 
	 {
	     result = jQuery.parseJSON(sResult).Record[0];

	 }, function (ex) { jetsennet.error(ex); }, { async: false });

    return result;
}

/**
* 
* 装配信息
*/
function showData() 
{
    var managerInfo = getManager(); 
    var dbSource;
    if(managerInfo.length > 0)
	{
		jQuery.each(managerInfo,function(index,item)
	    {
	    	if(item.WORK_MODE == "1")//主
    		{
    			$('#txt_ip').val(item.HOST_IP);
    			$('#txt_port').val(item.HOST_PORT);
    			$('#txt_state').val(getState(item.WORK_STATE));
    			$('#txt_time').val(item.UPDATE_TIME);
    			dbSource = getDatabaseInfo(valueOf(item, 'SRCID', ''));
    		}
	    	else
    		{
    			$('#txt_ip_bak').val(item.HOST_IP);
    			$('#txt_port_bak').val(item.HOST_PORT);
    			$('#txt_state_bak').val(getState(item.WORK_STATE));
    			$('#txt_time_bak').val(item.UPDATE_TIME);
    		}
	    });
	}
    
    if (dbSource) //数据源
    {
        $('#txt_dbname').val(dbSource.SRC_NAME); 
        $('#txt_dbtype').val(dbSource.DB_TYPE);
        
        $('#txt_DATASOURCE_NAME').val(dbSource.SRC_NAME);
        $('#txt_DATASOURCE_URL').val(dbSource.DB_URL);
        $('#txt_DATASOURCE_USER').val(dbSource.DB_USER);
        $('#txt_DATASOURCE_PASSWD').val(dbSource.DB_PASSWORD);
        $('#txt_DATASOURCE_COUNT').val(dbSource.COUNT);
        $('#txt_DATASOURCE_MAXCOUNT').val(dbSource.MAXCOUNT);
        $('#txt_DATASOURCE_TYPE').val(dbSource.DB_TYPE);
        
    }

}
/**
 * 状态描述 
 * @param {Object} state
 * @return {TypeName} 
 */
function getState(state) 
{
    var stateStr = '未知';
    switch (parseInt(state, 10)) 
    {
        case 0: stateStr = '空闲'; break;
        case 3: stateStr = '执行中'; break;
        case 10: stateStr = '停止'; break;
        case 101: stateStr = '错误'; break;
    }
    return stateStr;
}
/**
* 
* 详情
*/
function viewData() 
{
    var dialog = new jetsennet.ui.Window("edit-1");
    jQuery.extend(dialog, { submitBox: false, cancelBox: false, maximizeBox: false, showScroll: false, windowStyle: 1, minimizeBox: false, title: "数据源详情" });
    dialog.size = { width: 450, height: 0 };
    dialog.controls = ["divDatascource"];
    dialog.showDialog();
}