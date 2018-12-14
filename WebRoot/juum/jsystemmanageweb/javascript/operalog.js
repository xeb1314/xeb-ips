/** ===========================================================================
 * 用户操作日志管理
 * 20130815，刘海艳，查询
 * 20130815，刘海艳，删除
 * ============================================================================
 */
jetsennet.require(["gridlist", "pagebar", "window", "bootstrap/moment", "bootstrap/daterangepicker", "crud"]);

var gOperlogColumns = [ { fieldName: "ID", isCheck: true, checkName: "chk_ID", align: "center", width: 40},
                        { fieldName: "USER_NAME", sortField: "u.USER_NAME", width: 100, align: "left", name: "用户名"},
                        { fieldName: "SYS_NAME", sortField: "SYS_NAME", width: 100, align: "center", name: "系统名"},
                        { fieldName: "IP_ADDRESS", sortField: "IP_ADDRESS", width: 200, align: "center", name: "IP地址"},
                        { fieldName: "LOG_TIME", sortField: "LOG_TIME", width:200, align: "center", name: "日志时间"},
                        { fieldName: "DESCRIPTION", sortField: "t.DESCRIPTION", width:"100%", align: "left", name: "描述"}
//                        { fieldName: "ID", width: 45, align: "center", name: "删除", format: function(val, vals){
//                            return jetsennet.Crud.getDeleteCell("gCrud.remove('" + val + "')");
//                        }}
                        ];
var gCrud = $.extend(new jetsennet.Crud("operalogList", gOperlogColumns, "operalogPageBar", "ORDER BY t.LOG_TIME DESC"), {
    dao : SYSDAO,
    checkId : "chk_ID",
    tableName : "NET_OPERATORLOG",
    joinTables : [ [ "UUM_USER", "u", "t.USER_ID=u.ID", jetsennet.TableJoinType.Inner ] ],
    resultFields : "t.ID,u.USER_NAME,t.DESCRIPTION,t.SYS_NAME,t.IP_ADDRESS,t.LOG_TIME",
    name : "用户操作日志", 
    className : "jetsennet.jsystem.schema.NetOperatorlog",
});
gCrud.grid.ondoubleclick = null;

/**
 * 页面初始化
 */
function pageInit() {
	
    gCrud.load();
    $('#log_time').daterangepicker(jQuery.extend({ opens : "right"}, dataPickerOptions));
};

/**
 * 查询列表
 */
function searchoperalog() {
    var conditions = [];
    if (el("user_name").value) {
        conditions.push([ "u.USER_NAME", el("user_name").value, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Like, jetsennet.SqlParamType.String ]);
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
        jetsennet.message("当前条件下，无操作日志需要导出!");
    } else {
        gCrud.exportData(true);
    }
};
