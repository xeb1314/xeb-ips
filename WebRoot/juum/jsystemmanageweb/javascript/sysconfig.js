/** ===========================================================================
 * 系统管理
 * 20130816，白丹丹，新建
 * 20130819，白丹丹，修改
 * ============================================================================
 */
jetsennet.require(["gridlist", "window", "pagebar", "crud"]);

var gSyscfgColumns = [ { fieldName: "NAME", width: 30, align: "center", isCheck:1, checkName:"chkSysConfig"},
                       { fieldName: "NAME", sortField: "NAME", width: 200, align: "left", name: "参数名称"},
                       { fieldName: "DATA", sortField: "DATA", width: 200, align: "left", name: "参数值"},
                       { fieldName: "TYPE", sortField: "TYPE", width: 90, align: "center", name: "类型", format: function(val, vals) {
                           if (val == 0) {
                               return "统一用户系统";
                           }
                           return "其他系统";
                       }},
                       { fieldName: "VIEW_POS", sortField: "VIEW_POS", width: 50, align: "center", name: "排序"},
                       { fieldName: "DESCRIPTION", sortField: "DESCRIPTION", width: "100%", align: "left", name: "参数描述"},
                       { fieldName: "NAME", width: 45, align: "center", name: "编辑", format: function(val, vals){
                           return jetsennet.Crud.getEditCell("gCrud.edit('" + val + "')");
                       }},
                       { fieldName: "NAME", width: 45, align: "center", name: "删除", format: function(val, vals){
                           return jetsennet.Crud.getDeleteCell("gCrud.remove('" + val + "')");
                       }}];
var gCrud = $.extend(new jetsennet.Crud("divContent", gSyscfgColumns, "divPage"), {
    dao : SYSDAO,
    keyId : "NAME",
    tableName : "NET_SYSCONFIG",
    name : "系统参数",
    className : "jetsennet.jsystem.schema.NetSysconfig",
    cfgId : "divSysConfig",
    checkId : "chkSysConfig",
    onAddInit : function() {
        el("txtName").disabled = false;
    },
    onAddGet : function() {
        return {
            NAME : el("txtName").value,
            DATA : el("txtConfigData").value,
            TYPE : el("txtConfigType").value,
            VIEW_POS : el("txtView_pos").value,
            DESCRIPTION : el("txtDescription").value
        };
    },
    onEditInit : function() {
        el("txtName").disabled = true;
    },
    onEditSet : function(obj) {
        el("txtName").value = valueOf(obj, "NAME", "");
        el("txtConfigData").value = valueOf(obj, "DATA", "");
        el("txtConfigType").value = valueOf(obj, "TYPE", "");
        el("txtView_pos").value = valueOf(obj, "VIEW_POS", "");
        el("txtDescription").value = valueOf(obj, "DESCRIPTION", "");
        el("txtOldName").value = valueOf(obj, "NAME", "");
    },
    onEditGet : function(id) {
        return {
            NAME : el("txtName").value,
            DATA : el("txtConfigData").value,
            TYPE : el("txtConfigType").value,
            VIEW_POS : el("txtView_pos").value,
            DESCRIPTION : el("txtDescription").value,
            txtOldName : el("txtOldName").value
        };
    }
});

/**
 * 页面初始化
 */
function pageInit() {
    gCrud.load();
};

/**
 * 查询列表
 */
function searchSysConfig() {
    var conditions = [];
    if (el("txtConfigName").value != "") {
        conditions.push([ "NAME", el("txtConfigName").value, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Like, jetsennet.SqlParamType.String ]);
    }
    gCrud.search(conditions);
}

/** 老方式，面向过程
// 加载系统参数
function loadSysconfig() {
    // 用jetsennet2.0基本模式
    // var sqlQuery = new jetsennet.SqlQuery();
    // var queryTable = jetsennet.createQueryTable("NET_SYSCONFIG");
    // jQuery.extend(sqlQuery,{IsPageResult:0,KeyId:"NAME",PageInfo:sysConfigPage,QueryTable:queryTable,ResultFields:""});
    // var sysConfigcondition = new jetsennet.SqlConditionCollection();
    // sysConfigcondition.SqlConditions = [];
    // if (el("txtConfigName").value != "") {
    // sysConfigcondition.SqlConditions.push(jetsennet.SqlCondition.create("NAME", el("txtConfigName").value, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Like, jetsennet.SqlParamType.String));
    // }
    // sqlQuery.Conditions = sysConfigcondition;
    // var ws = new jetsennet.Service(SYS_SYSTEM_SERVICE);
    // ws.displayLoading = false;
    // ws.soapheader = jetsennet.Application.authenticationHeader;
    // ws.oncallback = function(sResult) {
    // el('divContent').innerHTML =
    // jetsennet.xml.transformXML("xslt/sysconfig.xslt", sResult.resultVal);
    // gridList.bind(el('divContent'), el('tabSysconfig'));
    // sysConfigPage.setRowCount(el("hid_SysConfigTotalCount").value);
    // };
    // ws.onerror = function(ex) {
    // jetsennet.error("查询系统参数数据异常:"+ex);
    // };
    // ws.call("commonQueryForPage", [sqlQuery.toXml(),(sysConfigPage.currentPage-1),sysConfigPage.pageSize]);

    // 用扩展的基本模式
    // var dal = new defaultdal();
    // dal.wsMode = "HTTP_JQUERY";
    // dal.dataType = "xml";
    // var params = new HashMap();
    // var sqlQuery = new jetsennet.SqlQuery();
    // var queryTable = jetsennet.createQueryTable("NET_SYSCONFIG");
    // jQuery.extend(sqlQuery,{IsPageResult:0,KeyId:"NAME",PageInfo:sysConfigPage,QueryTable:queryTable,ResultFields:""});
    // var sysConfigcondition = new jetsennet.SqlConditionCollection();
    // sysConfigcondition.SqlConditions = [];
    // if (el("txtConfigName").value != "") {
    // sysConfigcondition.SqlConditions.push(jetsennet.SqlCondition.create("NAME", el("txtConfigName").value, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Like, jetsennet.SqlParamType.String));
    // }
    // sqlQuery.Conditions = sysConfigcondition;
    // params.put("queryXml", sqlQuery.toXml());
    // params.put("startPageNum", sysConfigPage.currentPage-1);
    // params.put("pageSize", sysConfigPage.pageSize);
    // var result = dal.execute("commonQueryForPage", params);
    // if (result && result.resultVal) {
    // el('divContent').innerHTML = jetsennet.xml.transformXML("xslt/sysconfig.xslt", result.resultVal);
    // gridList.bind(el('divContent'), el('tabSysconfig'));
    // sysConfigPage.setRowCount(el("hid_SysConfigTotalCount").value);
    // }

    // 用最简洁的查询模式
    var result = SYSDAO.queryForPage("commonQueryForPage", "NAME", "NET_SYSCONFIG", null, null, gSyscfgCondition, null, gSyscfgPageBar);
    if (result && result.resultVal) {
        gSyscfgGrid.renderXML(result.resultVal);
    }
}

// 新增系统参数
function newConfig() {
    var dialog = jetsennet.Crud.getConfigDialog("新建系统参数", "divSysConfig");
    el("txtName").disabled = false;
    dialog.onsubmit = function() {
        var areaElements = jetsennet.form.getElements("divSysConfig");
        if (jetsennet.validate(areaElements, true)) {
            var config = {
                NAME : el("txtName").value,
                DATA : el("txtConfigData").value,
                TYPE : el("txtConfigType").value,
                VIEW_POS : el("txtView_pos").value,
                DESCRIPTION : el("txtDescription").value
            };

            // 用jetsennet2.0基本模式
            // var submitXML = jetsennet.xml.serialize(commonData, "NET_SYSCONFIG");
            // var ws = new jetsennet.Service(SYS_SYSTEM_SERVICE);
            // ws.async = false;
            // // ws.cacheLevel = 2;
            // ws.displayLoading = false;
            // ws.soapheader = jetsennet.Application.authenticationHeader;
            // ws.oncallback = function(sResult) {
            // loadSysconfig();// 加载系统参数信息
            // jetsennet.ui.Windows.close("new-divobjgroup"); // 关闭新增窗口
            // };
            // ws.onerror = function(ex) {
            // jetsennet.error("新增系统参数数据异常:" + ex);
            // };
            // ws.call("commonObjInsert", [ "jetsennet.jsystem.schema.NetSysconfig", submitXML ]);

            // 用扩展的模式
            var params = new HashMap();
            params.put("className", "jetsennet.jsystem.schema.NetSysconfig");
            params.put("saveXml", jetsennet.xml.serialize(config, "NET_SYSCONFIG"));
            var result = SYSDAO.execute("commonObjInsert", params);
            if (result && result.errorCode == 0) {
                loadSysconfig();
                return true;
            }
        }
    };
    dialog.showDialog();
}

// 编辑系统参数
function editConfig(name) {
    var checkIds = jetsennet.Crud.getCheckIds(name, "chkSysConfig");
    if (checkIds.length != 1) {
        jetsennet.alert("请选择一个要编辑的系统参数！");
        return;
    }
    
    var dialog = jetsennet.Crud.getConfigDialog("编辑系统参数", "divSysConfig");
    el("txtName").disabled = true;

    // 用jetsennet2.0基本模式
    // var sqlQuery = new jetsennet.SqlQuery();
    // var queryTable = jetsennet.createQueryTable("NET_SYSCONFIG");
    // jQuery.extend(sqlQuery, {
    // IsPageResult : 0,
    // KeyId : "NAME",
    // PageInfo : null,
    // QueryTable : queryTable,
    // ResultFields : "NAME,DATA,TYPE,VIEW_POS,DESCRIPTION"
    // });
    // var condition = new jetsennet.SqlConditionCollection();
    // condition.SqlConditions.push(jetsennet.SqlCondition.create("NAME", checkIds[0], jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String));
    // sqlQuery.Conditions = condition;
    // var ws = new jetsennet.Service(SYS_SYSTEM_SERVICE);
    // ws.async = false;
    // // ws.cacheLevel = 2;
    // ws.displayLoading = false;
    // ws.soapheader = jetsennet.Application.authenticationHeader;
    // ws.oncallback = function(sResult) {
    // var objGroup = jetsennet.xml.deserialize(sResult.resultVal, "Record")[0];
    // if (objGroup != null) {
    // el("txtName").value = valueOf(objGroup, "NAME", "");
    // el("txtConfigData").value = valueOf(objGroup, "DATA", "");
    // el("txtConfigType").value = valueOf(objGroup, "TYPE", "");
    // el("txtView_pos").value = valueOf(objGroup, "VIEW_POS", "");
    // el("txtDescription").value = valueOf(objGroup, "DESCRIPTION", "");
    // el("txtOldName").value = valueOf(objGroup, "NAME", "");
    // }
    // };
    // ws.onerror = function(ex) {
    // jetsennet.error("查询系统参数数据异常:" + ex);
    // };
    // ws.call("commonXmlQuery", [ sqlQuery.toXml() ]);

    // 用扩展的异步模式
    //    var params = {
    //        method : "commonXmlQuery", 
    //        keyId : "NAME", 
    //        tableName : "NET_SYSCONFIG", 
    //        conditions : conditions,
    //        resultFields : "NAME,DATA,TYPE,VIEW_POS,DESCRIPTION",
    //        options: {
    //            async : true,
    //            success : function (obj) {
    //                if (obj) {
    //                    el("txtName").value = valueOf(obj, "NAME", "");
    //                    el("txtConfigData").value = valueOf(obj, "DATA", "");
    //                    el("txtConfigType").value = valueOf(obj, "TYPE", "");
    //                    el("txtView_pos").value = valueOf(obj, "VIEW_POS", "");
    //                    el("txtDescription").value = valueOf(obj, "DESCRIPTION", "");
    //                    el("txtOldName").value = valueOf(obj, "NAME", "");
    //                }
    //            }
    //        }
    //    }
    
    //用扩展的同步模式
    var conditions = [ [ "NAME", checkIds[0], jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String ] ];
    var result = SYSDAO.queryObj("commonXmlQuery", "NAME", "NET_SYSCONFIG", null, null, conditions, "NAME,DATA,TYPE,VIEW_POS,DESCRIPTION");
    if (result) {
        el("txtName").value = valueOf(result, "NAME", "");
        el("txtConfigData").value = valueOf(result, "DATA", "");
        el("txtConfigType").value = valueOf(result, "TYPE", "");
        el("txtView_pos").value = valueOf(result, "VIEW_POS", "");
        el("txtDescription").value = valueOf(result, "DESCRIPTION", "");
        el("txtOldName").value = valueOf(result, "NAME", "");
    }
    
    dialog.onsubmit = function() {
        var areaElements = jetsennet.form.getElements("divSysConfig");
        if (jetsennet.validate(areaElements, true)) {
            var config = {
                NAME : el("txtName").value,
                DATA : el("txtConfigData").value,
                TYPE : el("txtConfigType").value,
                VIEW_POS : el("txtView_pos").value,
                DESCRIPTION : el("txtDescription").value,
                txtOldName : el("txtOldName").value
            };

            // 用jetsennet2.0基本模式
            // var ws = new jetsennet.Service(SYS_SYSTEM_SERVICE);
            // ws.async = false;
            // // ws.cacheLevel = 2; //不注释：编辑有问题。编辑后取到的还是之前的值
            // ws.displayLoading = false;
            // ws.soapheader = jetsennet.Application.authenticationHeader;
            // ws.oncallback = function(sResult) {
            // searchSysConfig();// 加载系统参数信息
            // jetsennet.ui.Windows.close("edit-divobjgroup"); // 关闭编辑窗口
            // };
            // ws.onerror = function(ex) {
            // jetsennet.error("编辑系统参数数据异常:" + ex);
            // };
            // ws.call("commonObjUpdateByPk", [ "jetsennet.jsystem.schema.NetSysconfig", objgroupXml, true ]);

            // 用扩展的模式
            var params = new HashMap();
            params.put("className", "jetsennet.jsystem.schema.NetSysconfig");
            params.put("updateXml", jetsennet.xml.serialize(config, "NET_SYSCONFIG"));
            params.put("isFilterNull", true);
            var result = SYSDAO.execute("commonObjUpdateByPk", params);
            if (result && result.errorCode == 0) {
                loadSysconfig();
                return true;;
            }
        }
    };
    dialog.showDialog();
}

// 删除系统参数
function deleteConfig(name) {
    var checkIds = jetsennet.Crud.getCheckIds(name, "chkSysConfig");
    if (checkIds.length == 0) {
        jetsennet.alert("请选择要删除的系统参数！");
        return;
    }

    // 用jetsennet2.0基本模式
    // var ws = new jetsennet.Service(SYS_SYSTEM_SERVICE);
    // ws.displayLoading = false;
    // ws.soapheader = jetsennet.Application.authenticationHeader;
    // ws.oncallback = function(sResult) {
    // searchSysConfig();// 加载系统参数信息
    // };
    // ws.onerror = function(ex) {
    // jetsennet.error("删除系统参数数据异常:" + ex);
    // };
    // ws.call("commonObjDelete", [ "jetsennet.jsystem.schema.NetSysconfig", checkIds.join(",") ]);

    // 用扩展的模式
    jetsennet.confirm("确定删除？", function() {
        var params = new HashMap();
        params.put("className", "jetsennet.jsystem.schema.NetSysconfig");
        params.put("deleteIds", checkIds.join(","));
        var result = SYSDAO.execute("commonObjDelete", params);
        if (result && result.errorCode == 0) {
            loadSysconfig();
        }
        return true;
    });
}*/
