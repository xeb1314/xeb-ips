/** ===========================================================================
 * 用户错误日志管理
 * 20130816，刘海艳，查询
 * 20130816，刘海艳，删除
 * ============================================================================
 */
jetsennet.require(["gridlist", "pagebar", "window", "bootstrap/moment", "bootstrap/daterangepicker", "crud"]);


var gErrorlogColumns = [{ fieldName: "ID", isCheck: true, checkName: "chk_ID", align: "center", width: 40},
                        { fieldName: "USER_NAME", sortField: "u.USER_NAME", width:100, align: "left", name: "用户名"},
                        { fieldName: "SYS_NAME", sortField: "SYS_NAME", width:100, align: "center", name: "系统名称"},
                        { fieldName: "MODULE_NAME", sortField: "MODULE_NAME", width:100, align: "center", name: "模块名称"},
                        { fieldName: "LOG_TIME", sortField: "LOG_TIME", width:200, align: "center", name: "日志时间"},
                        { fieldName: "DESCRIPTION", sortField: "t.DESCRIPTION", width:"100%", align: "left", name: "描述"},
                        { fieldName: "ID", width:45, align: "center", name: "删除", format: function(val,vals){
                            return jetsennet.Crud.getDeleteCell("gCrud.remove('" + val + "')");
                        }}];
var gCrud = $.extend(new jetsennet.Crud("errorlogList", gErrorlogColumns, "errorlogPageBar", "ORDER BY t.ID DESC"), {
    dao : SYSDAO,
    checkId : "chk_ID",
    tableName : "NET_ERRORLOG",
    joinTables : [ [ "UUM_USER", "u", "t.USER_ID=u.ID", jetsennet.TableJoinType.Inner ] ],
    resultFields : "t.ID,u.USER_NAME,t.SYS_NAME,t.MODULE_NAME,t.LOG_TIME,t.DESCRIPTION",
    name : "错误日志", 
    className : "jetsennet.jsystem.schema.NET_ERRORLOG",
});
gCrud.grid.ondoubleclick = null;

/**
 * 页面初始化
 */
function pageInit() {
	
    gCrud.load();
    $('#log_time').daterangepicker(jQuery.extend({ opens : "left"}, dataPickerOptions));
};

/**
 * 查询列表
 */
function searcherrorlog() {
    var conditions = [];
    if (el("user_name").value) {
        conditions.push([ "u.USER_NAME", el("user_name").value, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Like, jetsennet.SqlParamType.String ]);
    }
    if (el("sys_module_name").value) {
        conditions.push([ "t.SYS_NAME", el("sys_module_name").value, jetsennet.SqlLogicType.Or, jetsennet.SqlRelationType.Like, jetsennet.SqlParamType.String ]);
        conditions.push([ "t.MODULE_NAME", el("sys_module_name").value, jetsennet.SqlLogicType.Or, jetsennet.SqlRelationType.Like, jetsennet.SqlParamType.String ]);
    }
    if ($('#log_time').val()) {
        conditions.push([ "t.LOG_TIME", $('#log_time').data('daterangepicker').startDate.format('YYYY-MM-DD'), jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.ThanEqual, jetsennet.SqlParamType.DateTime ]);
        conditions.push([ "t.LOG_TIME", $('#log_time').data('daterangepicker').endDate.format('YYYY-MM-DD') + " 23:59:59", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.LessEqual, jetsennet.SqlParamType.DateTime ]);
    }
    gCrud.search(conditions);
}

/**
 * 导出成Excel
 */
function exportExcel() {
    if(gCrud.pageBar && gCrud.pageBar.rowCount==0) {
        jetsennet.message("当前条件下，无错误日志需要导出!");
    } else {
        gCrud.exportData(true);
    }
};
