/**
 * ===========================================================================
 * 用户登录日志管理 20130814，刘海艳，查询 20130815，刘海艳，删除
 * ============================================================================
 */
jetsennet.require(["gridlist", "pagebar", "window", "crud"]);

var gLoginlogColumns = [{ fieldName: "ID", isCheck: true, checkName: "chk_ID", align: "center", width: 40},
                        { fieldName: "USER_NAME", sortField: "USER_NAME", width: "20%", align: "left", name: "用户名"},
                        { fieldName: "LOGIN_NAME", sortField: "u.LOGIN_NAME", width: "20%", align: "left", name: "登录名"},
                        { fieldName: "IP_ADDRESS", sortField: "IP_ADDRESS", width: "20%", align: "center", name: "登录IP"},
                        { fieldName: "LOGIN_TIME", sortField: "LOGIN_TIME", width: "20%", align: "center", name: "登录时间"},
                        { fieldName: "LOGOUT_TIME", sortField: "LOGOUT_TIME", width: "20%", align: "center", name: "登出时间"},
                        { fieldName: "ID", width: 45, align: "center", name: "删除", format: function(val, vals){
                            return jetsennet.Crud.getDeleteCell("gCrud.remove('" + val + "')");
                        }}];
var gCrud = $.extend(new jetsennet.Crud("userlogList", gLoginlogColumns, "loginPageBar", "ORDER BY t.LOGIN_TIME DESC"), {
    dao : SYSDAO,
    checkId : "chk_ID",
    tableName : "NET_LOGINLOG",
    joinTables : [ [ "UUM_USER", "u", "t.USER_ID=u.ID", jetsennet.TableJoinType.Inner ] ],
    resultFields : "t.ID,u.USER_NAME,t.LOGIN_NAME,IP_ADDRESS,DEVICE_NAME,LOGIN_TIME,LOGOUT_TIME",
    name : "用户登录日志", 
    className : "jetsennet.jsystem.schema.NetLoginlog",
});
gCrud.grid.ondoubleclick = null;

/**
 * 页面初始化
 */
function pageInit() {
    gCrud.load();
    $('#login_time').daterangepicker(jQuery.extend({ opens : "right"}, dataPickerOptions));
    $('#logout_time').daterangepicker(jQuery.extend({ opens : "left"}, dataPickerOptions));
};

/**
 * 查询列表
 */
function searchloginlog() {
    var conditions = [];
    if ($('#login_time').val()) {
        conditions.push([ "t.LOGIN_TIME", $('#login_time').data('daterangepicker').startDate.format('YYYY-MM-DD'), jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.ThanEqual, jetsennet.SqlParamType.DateTime ]);
        conditions.push([ "t.LOGIN_TIME", $('#login_time').data('daterangepicker').endDate.format('YYYY-MM-DD') + " 23:59:59", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.LessEqual, jetsennet.SqlParamType.DateTime ]);
    }
    if ($('#logout_time').val()) {
        conditions.push([ "t.LOGOUT_TIME", $('#logout_time').data('daterangepicker').startDate.format('YYYY-MM-DD'), jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.ThanEqual, jetsennet.SqlParamType.DateTime ]);
        conditions.push([ "t.LOGOUT_TIME", $('#logout_time').data('daterangepicker').endDate.format('YYYY-MM-DD') + " 23:59:59", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.LessEqual, jetsennet.SqlParamType.DateTime ]);
    }
    var subConditions = [];
    if (el("user_name").value) {
        subConditions.push([ [ "u.USER_NAME", el("user_name").value, jetsennet.SqlLogicType.Or, jetsennet.SqlRelationType.Like, jetsennet.SqlParamType.String ],
                             [ "u.LOGIN_NAME", el("user_name").value, jetsennet.SqlLogicType.Or, jetsennet.SqlRelationType.Like, jetsennet.SqlParamType.String ] ]);
    }
    gCrud.search(conditions, subConditions);
}

/**
 * 导出成Excel
 */
function exportExcel() {
    if(gCrud.pageBar && gCrud.pageBar.rowCount==0) {
        jetsennet.message("当前条件下，无登录日志需要导出!");
    } else {
        gCrud.exportData(true);
    }
};


