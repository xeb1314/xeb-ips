
jetsennet.valideLogin();

jetsennet.require(["window", "gridlist", "pagebar", "crud"]);
var sysCode;
var columns = [{ fieldName: "CW_ID", width: 40, align: "center", isCheck: 1, checkName: "chkWord"},
                        { fieldName: "CW_TYPE", sortField: "CW_TYPE", width: 100, align: "center", name: "受控类型" , format:function(val){
                        	return getCtrlType(val);
                        }},
                        { fieldName: "CW_NAME", sortField: "CW_NAME", width: "30%", align: "center", name: "受控词名"},
                        { fieldName: "CW_CODE", sortField: "CW_CODE", width: "30%", align: "center", name: "受控词码"},
                        { fieldName: "CW_DESC", sortField: "CW_DESC", width: "40%", align: "left", name: "受控词描述"},
                        { fieldName: "CW_ID", width: 45, align: "center", name: "编辑", format: function(val,vals){
                            return "<img style=\"cursor:pointer;\" src=\"../images/edit.png\" title=\"编辑\" onclick=\"gCrud.edit('" + val + "')\"></img>" ;
                        }},
                        { fieldName: "CW_ID,CW_TYPE", width: 45, align: "center", name: "删除", format: function(val,vals){
                            return "<img style=\"cursor:pointer;\" src=\"../images/cel_del.png\" title=\"删除\" onclick=\"deleteCtrlWord('" + val + "','"+vals[1]+"')\"></img>" ;
                        }}];
var gCrud = $.extend(new jetsennet.Crud("divList", columns, "divPage"), {
    dao : WFMDAO,
    keyId : "CW_ID",
    tableName : "NET_CTRLWORD",
    name : "受控词",
    className : "jetsennet.wfm.schema.Ctrlword",
    cfgId : "divCtrlword",
    checkId : "chkWord",
    onAddInit : function() {
    	$("#txt_CTRLWORD_SYS").attr("readonly", "readonly");
    	setTimeout(function(){
    		el("txt_CTRLWORD_SYS").value = gCwSysTypes[$("#ddl_Type").val().split(",")[1]];
    	}, 0);
    },
    onAddGet : function() {
        return {
        	CW_SYS: el("ddl_Type").value.split(",")[1],
        	CW_TYPE: el("ddl_Type").value.split(",")[0],
            CW_NAME: el("txt_CTRLWORD_NAME").value,
            CW_DESC: el("txt_DESCRIPTION").value,
            CW_CODE: el("txt_CTRLWORD_CODE").value
        };
    },
    onEditInit : function() {
        $("#txt_CTRLWORD_SYS").attr("readonly", "readonly");
    },
    onEditSet : function(obj) {
    	el("ddl_Type").value = obj.CW_TYPE + "," +obj.CW_SYS ;
        el("txt_CTRLWORD_NAME").value = obj.CW_NAME;
        el("txt_CTRLWORD_SYS").value = gCwSysTypes[obj.CW_SYS];
        el("txt_DESCRIPTION").value = obj.CW_DESC;
        el("txt_CTRLWORD_CODE").value = obj.CW_CODE;
    },
    onEditGet : function(id) {
        return {
            CW_ID : id,
            CW_SYS: el("ddl_Type").value.split(",")[1],
        	CW_TYPE: el("ddl_Type").value.split(",")[0],
            CW_NAME: el("txt_CTRLWORD_NAME").value,
            CW_DESC: el("txt_DESCRIPTION").value,
            CW_CODE: el("txt_CTRLWORD_CODE").value
        };
    }
});

/**
 * 页面初始化
 */
function pageInit() {
	sysCode=jetsennet.queryString("syscode");
	loadCtrlWordType();
	var conditions = [];
	conditions.push(["t.CW_SYS",el("ddl_Type").value.split(",")[1], jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
	conditions.push([ "t.CW_TYPE", el("ddl_Type").value.split(",")[0], jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric ]);
	gCrud.conditions = conditions;
    gCrud.load();
}


function getCtrlType(val){
	return $("#ddl_Type").find("option:selected").text();
}


/**
 * 查询列表
 */
function searchWord() {
    var conditions = [];
    if (el('ddl_Type').value != "") {
        conditions.push([ "t.CW_TYPE",el("ddl_Type").value.split(",")[0], jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric ]);
        conditions.push(["t.CW_SYS",el("ddl_Type").value.split(",")[1], jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
        el("txt_CTRLWORD_SYS").value = gCwSysTypes[el("ddl_Type").value.split(",")[1]];
    }
    gCrud.search(conditions);
}


/**
 * 加载受控词类别
 */
function loadCtrlWordType() {
    var conditions = [];
    if(sysCode){
    	conditions.push(["CW_SYS",sysCode, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.In, jetsennet.SqlParamType.Numeric]);
    }
    conditions.push(["CW_TYPE", "-1", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
    var sResult = WFMDAO.query("commonXmlQuery", "CW_ID", "NET_CTRLWORD", null, null,conditions, "CW_ID,CW_NAME,CW_CODE,CW_DESC,CW_SYS");
    var objs = jetsennet.xml.toObject(sResult.resultVal, "Record");
    
    if (objs && objs.length > 0) {
        for (var i = 0; i < objs.length; i++) {
        	jQuery("<option>"+objs[i].CW_NAME+"</option>", {}).attr("value", objs[i].CW_CODE+","+objs[i].CW_SYS).appendTo($("#ddl_Type"));
//        	jQuery("<option>"+objs[i].CW_NAME+"</option>", {}).attr("value", objs[i].CW_CODE+","+objs[i].CW_SYS).appendTo($("#ddl_CTRLWORD_TYPE"));
        }
    }
}


/**
 * 删除受控词
 * @param varId
 */
function deleteCtrlWord(varId,cwType){
	var confirmStr = getCtrlType(cwType);
	jetsennet.confirm("确定删除此"+confirmStr+"?", function () {
    	var params = new HashMap();
    	params.put("className", "jetsennet.wfm.schema.Ctrlword");
    	params.put("deleteIds", varId);
        var sResult = WFMDAO.execute("commonObjDelete",params);
        if(sResult.errorCode==0){
        	jetsennet.message("删除成功！");
        	gCrud.load();
        }
        return true;
    });
}