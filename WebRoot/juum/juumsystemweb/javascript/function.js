/** ===========================================================================
 * 功能管理
 * 20130816，杨裕发，新建
 * ============================================================================
 */
jetsennet.require(["pageframe", "window", "gridlist", "pagebar", "tabpane", "validate", "ztree/jquery.ztree.all-3.5", "ztree/jztree", "crud"]);
jetsennet.importCss(["ztree/zTreeStyle"]);

var gParentId;
var gGrandParentIds;

var gFuncColumns = [{ fieldName: "ID", width: 30, align: "center", isCheck: 1, checkName: "chkFunction"},
                    { fieldName: "ID", sortField: "ID", width: 100, align: "center", name: "ID"},
                    { fieldName: "NAME,ID", sortField: "NAME", width: 160, align: "center", name: "名称", format: function(val, vals){
                        return "<a href=\"javascript:submenuList('"+vals[1]+"');\" style=\"text-decoration: underline;\">"+val+"</a>";
                    }},
                    { fieldName: "STATE", sortField: "STATE", width: 60, align: "center", name: "状态", format: function(val, vals){
                        if (val == 0) {
                            return "启用";
                        } else {
                            return "禁用";
                        }
                    }},
                    { fieldName: "PARAM", sortField: "PARAM", width: "100%", align: "left", name: "参数"},
                    { fieldName: "DESCRIPTION", sortField: "DESCRIPTION", width: 150, align: "left", name: "描述"},
                    { fieldName: "VIEW_POS", sortField: "VIEW_POS", width: 60, align: "center", name: "排序号"},
                    { fieldName: "ID", width: 45, align: "center", name: "编辑", format: function(val,vals){
                        return jetsennet.Crud.getEditCell("gCrud.edit('" + val + "')");
                    }},
                    { fieldName: "ID", width: 45, align: "center", name: "删除", format: function(val,vals){
                        return jetsennet.Crud.getDeleteCell("gCrud.remove('" + val + "')");
                    }}];
var gCrud = $.extend(new jetsennet.Crud("divContent", gFuncColumns, "divPage", "order by t.VIEW_POS"), {
    dao : UUMDAO,
    tableName : "UUM_FUNCTION",
    name : "功能",
    className : "Function",
    cfgId : "divFunction",
    checkId : "chkFunction",
    addDlgOptions : {size : {width : 550, height : 500}},
    editDlgOptions : {size : {width : 550, height : 500}},
    onAddInit : function() {
        el('txt_ID').disabled = false;
        _loadFunctionTree();
    },
    onAddValid : function() {
        return !_checkFuncExist();
    },
    onAddGet : function() {
        return {
            ID : el("txt_ID").value,
            NAME : el("txt_Name").value,
            PARENT_ID : el("hidParentId").value,
            VIEW_POS : el("txt_ViewPos").value,
            TYPE : el("txtType").value,
            STATE : el("txtState").value,
            PARAM : el("txt_Param").value,
            DESCRIPTION : el("txt_Desc").value,
            OPEN_WIDTH : "screen.width",
            OPEN_HEIGHT : "screen.width"
        };
    },
    onEditInit : function() {
        el('txt_ID').disabled = true;
        _loadFunctionTree();
        el('hidParentId').value = gParentId;
        var node = getTreeNodeById("divFunctionTree", gParentId);
        if (node) {
            $.fn.zTree.getZTreeObj("divFunctionTree").selectNode(node);
            el('txt_Function').value = node["name"];
        } else {
            el('txt_Function').value = "";
        }
    },
    onEditSet : function(obj) {
        el("txt_ID").value = valueOf(obj, "ID", "");
        el("txt_Name").value = valueOf(obj, "NAME", "");
        el("txt_ViewPos").value = valueOf(obj, "VIEW_POS", "0");
        el("txtType").value = valueOf(obj, "TYPE", "");
        el("txtState").value = valueOf(obj, "STATE", "");
        el("txt_Param").value = valueOf(obj, "PARAM", "");
        el("txt_Desc").value = valueOf(obj, "DESCRIPTION", "");
    },
    onEditValid : function(id) {
        if (el('hidParentId').value == id) {
            jetsennet.alert("所属功能不为能自身,请重新选择所属功能!");
            return false;
        }
        return true;
    },
    onEditGet : function(id) {
        return {
            ID : el("txt_ID").value,
            NAME : el("txt_Name").value,
            PARENT_ID : el("hidParentId").value,
            VIEW_POS : el("txt_ViewPos").value,
            TYPE : el("txtType").value,
            STATE : el("txtState").value,
            PARAM : el("txt_Param").value,
            DESCRIPTION : el("txt_Desc").value
        };
    },
    onRemoveValid : function(checkIds) {
        var dialog = jetsennet.Crud.getConfigDialog("确定删除", "divDelete");
        el('chkDeleteAll').checked = false;
        dialog.onsubmit = function() {
            var objFunctionXml = jetsennet.xml.serialize({
                IDS : checkIds.join(","),
                RECURSIVE : el('chkDeleteAll').checked == true ? 1 : 0
            }, "UUM_FUNCTION");
            return gCrud.directRemove(objFunctionXml);
        };
        dialog.showDialog();
        return false;
    }
});

/**
 * 页面初始化
 */
function pageInit() {
	
    gParentId = jetsennet.queryString("pid");
    gParentId = gParentId ? gParentId : "0";
    gGrandParentIds = jetsennet.queryString("gpids");
    gGrandParentIds = gGrandParentIds ? (gGrandParentIds + "," + gParentId) : gParentId;
    
    var conditions = [];
    conditions.push([ "PARENT_ID", gParentId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric ]);
    conditions.push([ "ID", 0, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.NotEqual, jetsennet.SqlParamType.Numeric ]);
    gCrud.search(conditions);
    
    _loadNavigation();
};

/**
 * 显示导航位置链接
 * @private
 */
function _loadNavigation() {
    if (gParentId == 0) {
        el('divNavigation').innerHTML = " :: <a style='color:#000000;' href='function.htm?PID=0'>系统权限</a>";
        return;
    }
    var result = UUMDAO.queryObjs("commonXmlQuery", "ID", "UUM_FUNCTION", null, null, [ [ "ID", gGrandParentIds, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.In, jetsennet.SqlParamType.Numeric ] ]);
    if (result) {
        var contents = [];
        var ids = [];
        contents.push(" :: <a style='color:#000000;' href='function.htm?pid=0'>系统权限</a>");
        for (var i = 0; i < result.length; i++) {
            if (result[i].ID != 0) {
                contents.push("<a style='color:#000000;' href='function.htm?pid=" + result[i].ID + "&gpids=" + ids.join(",") + "'>" + result[i].NAME + "</a>");
                ids.push(result[i].ID);
            }
        }
        el('divNavigation').innerHTML = contents.join(" / ");
    }
}

/**
 * 导航选择处理
 */
function submenuList(menuid) {
    document.location = "function.htm?pid=" + menuid + "&gpids=" + gGrandParentIds;
}

/**
 * 处理后退
 */
function backward() {
    var gpids = gGrandParentIds.split(",");
    var pid = gpids.pop();
    if (gpids.length > 0) {
        pid = gpids.pop();
    }
    document.location = "function.htm?pid=" + pid + "&gpids=" + gpids.join(",");
}

/**
 * 检查功能是否存在
 * @returns {Boolean}
 * @private
 */
function _checkFuncExist() {
    var funcs = UUMDAO.queryObjs("commonXmlQuery", "ID", "UUM_FUNCTION", null, null, [ [ "ID", -1, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.NotEqual, jetsennet.SqlParamType.Numeric ] ], "ID");
    if (funcs) {
        var id = el("txt_ID").value;
        for (var i = 0; i < funcs.length; i++) {
            if (id == funcs[i].ID) {
                jetsennet.alert("该功能编号已被使用！");
                return true;
            }
        }
    }
    return false;
}

/**
 * 加载功能树
 * @private
 */
function _loadFunctionTree() {
    var sResult = UUMDAO.query("commonXmlQuery", "ID", "UUM_FUNCTION", null, null, [ [ "TYPE", 1, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.NotEqual, jetsennet.SqlParamType.Numeric ] ], "ID,NAME,PARENT_ID", "Order By PARENT_ID,VIEW_POS");
    if (sResult && sResult.errorCode == 0) {
        var onclickEvent = function() {
            var treeNode = getTreeSelectedNodes("divFunctionTree");
            el("hidParentId").value = treeNode["id"];//隐藏Input，用于保存选中的树节点ID
            el("txt_Function").value = treeNode["name"];//用于显示选中树节点名称
        }
        createTree(sResult.resultVal, "ID", "PARENT_ID", "NAME", "divFunctionTree", onclickEvent, false, null, null, null, true);
    }
}

/**
 * 显示功能树
 * @param {String} hideTree 树id
 * @param {String} relate 相对位置控件id
 */
function popHiddenTree(hideTree, relate) {
    var relateWid = $("#" + relate.id).css("width").replace("px", "");
    var minWidth = $("#" + hideTree.id).attr("minWidth").replace("px", "");
    var width = relateWid > minWidth ? relateWid : minWidth;
    $("#" + hideTree.id).css("width", width);
    jetsennet.popup(hideTree, {
        reference : relate
    });
}
