jetsennet.require(["gridlist", "crud", "window"]);

var columns = [{fieldName: "SRC_ID", width: 40, align: "center", isCheck: 1, checkName: "chkSource"},
						{ fieldName: "SRC_NAME", sortType: SORT_STRING, width: 180, align: "center", name: "数据源名称"},
						{ fieldName: "DB_TYPE", sortType: SORT_STRING, width: 150, align: "center", name: "数据库类型"},
						{ fieldName: "DB_URL", sortType: SORT_STRING, width: "100%", align: "center", name: "数据库地址"},
						{ fieldName: "DB_NAME", sortType: SORT_STRING, width: 120, align: "left", name: "数据库名称"},
						{ fieldName: "DB_USER", sortType: SORT_STRING, width: 120, align: "left", name: "用户名"},
                        { fieldName: "SRC_ID", width: 45, align: "center", name: "编辑", format: function(val,vals){
                        	return "<img style=\"cursor:pointer;\" src=\"../images/edit.png\" title=\"编辑\" onclick=\"gCrud.edit('" + val + "')\"></img>" ;
                        }},
                        { fieldName: "SRC_ID", width: 45, align: "center", name: "删除", format: function(val,vals){
                        	return "<img style=\"cursor:pointer;\" src=\"../images/cel_del.png\" title=\"删除\" onclick=\"gCrud.remove('" + val + "')\"></img>" ;
                        }}];
var gCrud = $.extend(new jetsennet.Crud("divContent", columns), {
    dao : WFMDAO,
    keyId : "SRC_ID",
    tableName : "WFM_DBSOURCE",
    name : "数据源",
    className : "jetsennet.wfm.schema.Dbsource",
    cfgId : "divDatascource",
    checkId : "chkSource",
    onAddGet : function() {
        return {
    	    SRC_NAME: el('txtSourceName').value,
    	    DB_TYPE: el("txtSourceType").value,
    	    DB_URL: el('txtSourceUrl').value,
    	    DB_NAME: el('txtDBName').value,
    	    DB_USER: el('txtUserName').value,
    	    DB_PASSWORD: el('txtPassword').value
    	};
    },
    onEditSet : function(obj) {
    	el('txtSourceName').value = obj.SRC_NAME;
        el('txtSourceUrl').value = obj.DB_URL;
        el('txtDBName').value = obj.DB_NAME;
        el('txtUserName').value = obj.DB_USER;
        el('txtPassword').value = obj.DB_PASSWORD;
        $("#txtSourceType").find("option").each(function(){if(this.value==obj.DB_TYPE){this.selected=true;}});
    },
    onEditGet : function(id) {
        return {
        	SRC_ID : id,
            SRC_NAME: el('txtSourceName').value,
    	    DB_TYPE: el("txtSourceType").value,
    	    DB_URL: el('txtSourceUrl').value,
    	    DB_NAME: el('txtDBName').value,
    	    DB_USER: el('txtUserName').value,
    	    DB_PASSWORD: el('txtPassword').value
        };
    }
});

/**
 * 页面初始化
 */
function pageInit() {
    gCrud.load();
    getDBType();
}

//加载数据库类型
function getDBType() {
    var conditions = [];
    conditions.push(["CW_SYS", "22", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
    conditions.push(["CW_TYPE", "2202", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
    var sResult = WFMDAO.query("commonXmlQuery", "CW_ID", "NET_CTRLWORD", null, null,conditions, "CW_ID,CW_NAME,CW_TYPE");
    var objs = jetsennet.xml.toObject(sResult.resultVal, "Record");
    if (objs && objs.length > 0) {
        for (var i = 0; i < objs.length; i++) {
        	jQuery("<option>"+objs[i].CW_NAME+"</option>", {}).attr("value", objs[i].CW_CODE).appendTo($("#txtSourceType"));
        }
    }
}
