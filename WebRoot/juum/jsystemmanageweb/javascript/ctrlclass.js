jetsennet.require([ "gridlist", "window", "pagebar", "autocomplete", "validate", "ztree/jquery.ztree.all-3.5", "ztree/jztree", "crud"]);
jetsennet.importCss("ztree/zTreeStyle");
// 区别分类和数据
var CLASS = 1;
var VALUE = 2;

var gCtrlclassColumns = [{ fieldName: "CLASS_ID", width: 30, align: "center", isCheck: 1, checkName: "chkClass"},
                        { fieldName: "CLASS_NAME", sortField: "CLASS_NAME", width: 60, align: "center", name: "名称"},
                        { fieldName: "CLASS_TYPE", sortField: "CLASS_TYPE", width: 60, align: "center", name: "分类值"},
                        { fieldName: "VIEW_NAME", sortField: "VIEW_NAME", width: 60, align: "center", name: "显示名称"},
                        { fieldName: "VIEW_VALUE", sortField: "VIEW_VALUE", width: 60, align: "center", name: "对应值"},
                        { fieldName: "STATUS", sortField: "STATUS", width: 60, align: "center", name: "是否显示", format: function(val, vals) {
                            return val == "1" ? "是" : "否";
                        }},
                        { fieldName: "CLASS_DESC", sortField: "CLASS_DESC", width: "100%", align: "center", name: "描述"},
                        { fieldName: "CLASS_ID", width: 45, align: "center", name: "编辑", format: function(val,vals){
                            return jetsennet.Crud.getEditCell("gCrud.edit('" + val + "')");
                        }},
                        { fieldName: "CLASS_ID", width: 45, align: "center", name: "删除", format: function(val,vals){
                            return jetsennet.Crud.getDeleteCell("gCrud.remove('" + val + "')");
                        }}];
var gCrud = $.extend(new jetsennet.Crud("divContent", gCtrlclassColumns, "divPage", "ORDER BY t.CLASS_ID"), {
    dao : SYSDAO,
    keyId : "t.CLASS_ID",
    tableName : "NET_CTRLCLASS",
    name : "分类",
    className : "jetsennet.jsystem.schema.Ctrlclass",
    cfgId : "div-New-Edit",
    checkId : "chkClass",
    onAddInit : function() {
        $(".clsHidden").show();
        $("#VIEW_NAME").attr("validatetype", "NotEmpty");
        $("#VIEW_VALUE").attr("validatetype", "NotEmpty");
        $("#CLASS_TYPE").attr("disabled", true);
        _newSelectTree(true);
        if (gTreeCrud.curNode) {
            el("PARENT_ID").value = gTreeCrud.curNode["id"];
            el("PARENT_NAME").value = gTreeCrud.curNode["name"];
            el("CLASS_TYPE").value = _getTypeById(gTreeCrud.curNode["id"]);
        }
    },
    onAddValid : function() {
        return _addEditValid(false);
    },
    onAddGet : function() {
        return $.extend(_addEditGet(), { CLASS_LAYER : VALUE});
    },
    addDlgOptions : {size : {width : 600, height : 400}},
    onEditInit : function(id) {
        $(".clsHidden").show();
        $("#VIEW_NAME").attr("validatetype", "NotEmpty");
        $("#VIEW_VALUE").attr("validatetype", "NotEmpty");
        $("#CLASS_TYPE").attr("disabled", true);
        _newSelectTree(true, id);
    },
    onEditSet : _editSet,
    onEditValid : function(id) {
        return _addEditValid(false, id);
    },
    onEditGet : function(id) {
        return $.extend(_addEditGet(), { CLASS_ID : id});
    },
    editDlgOptions : {size : {width : 600, height : 400}},
    onRemoveValid : _removeValid
});
var gTreeCrud = $.extend(new jetsennet.TreeCrud("divTree"), {
    onClickEvent : function(curNode) {
        searchData();
    },
    dao : SYSDAO,
    keyId : "t.CLASS_ID",
    tableName : "NET_CTRLCLASS",
    conditions : [ [ "t.CLASS_LAYER", CLASS, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.IEqual, jetsennet.SqlParamType.String ] ],
    resultFields : "t.CLASS_ID as ID,t.PARENT_ID,t.CLASS_NAME as NAME,t.CLASS_TYPE",
    orderBy : "ORDER BY t.CLASS_TYPE,t.CLASS_ID",
    name : "分类",
    className : "jetsennet.jsystem.schema.Ctrlclass",
    cfgId : "div-New-Edit",
    onAddInit : function() {
        $(".clsHidden").hide();
        $("#VIEW_NAME").attr("validatetype", "");
        $("#VIEW_VALUE").attr("validatetype", "");
        $("#CLASS_TYPE").attr("disabled", false);
        _newSelectTree(false);
        if (gTreeCrud.curNode) {
            el("PARENT_ID").value = gTreeCrud.curNode["id"];
            el("PARENT_NAME").value = gTreeCrud.curNode["name"];
            el("CLASS_TYPE").value = _getTypeById(gTreeCrud.curNode["id"]);
        }
    },
    onAddValid : function() {
        return _addEditValid(true);
    },
    onAddGet : function() {
        return $.extend(_addEditGet(), { CLASS_LAYER : CLASS });
    },
    addDlgOptions : {size : {width : 600, height : 300}},
    onEditInit : function(id) {
        $(".clsHidden").hide();
        $("#VIEW_NAME").attr("validatetype", "");
        $("#VIEW_VALUE").attr("validatetype", "");
        $("#CLASS_TYPE").attr("disabled", true);
        _newSelectTree(false, id);
    },
    onEditSet : _editSet,
    onEditValid : function(id) {
        return _addEditValid(true, id);
    },
    onEditGet : function(id) {
        return $.extend(_addEditGet(), { CLASS_ID : id });
    },
    editDlgOptions : {size : {width : 600, height : 300}},
    onRemoveValid : _removeValid
});

/**
 * 页面初始化
 */
function pageInit() {
    
    searchData();
    gTreeCrud.load();
}

/**
 * 按照查询区域或者其他查询条件查询数据，数据执行结果更新到右侧表格
 */
function searchData() {
    var conditions = [];
    if (gTreeCrud.curNode && gTreeCrud.curNode["pId"] == 0) {
        conditions.push([ "t.CLASS_TYPE", _getTypeById(gTreeCrud.curNode["id"]), jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.IEqual, jetsennet.SqlParamType.String ]);
    } else if (gTreeCrud.curNode && gTreeCrud.curNode["id"] > 0) {
        conditions.push([ "t.PARENT_ID", gTreeCrud.curNode["id"], jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.IEqual, jetsennet.SqlParamType.String ]);
    }
    if (el("txtClassName").value != "") {
        conditions.push([ "t.CLASS_NAME", el("txtClassName").value, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.ILike, jetsennet.SqlParamType.String ]);
    }
    conditions.push([ "t.CLASS_LAYER", VALUE, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.IEqual, jetsennet.SqlParamType.String ]);
    gCrud.search(conditions);
}

/**
 * 创建完整选取树
 * @param {Boolean} firstmyself 是否显示根节点
 * @param {Int} id ctrlclass Id
 * @private
 */
function _newSelectTree(firstmyself, id) {
    var conditions = [ [ "CLASS_LAYER", CLASS, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String ] ];
    if (id) {
        var curTypeId = _getTypeById(id);
        conditions.push([ "CLASS_TYPE", curTypeId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String ]);
        conditions.push([ "CLASS_ID", id, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.NotEqual, jetsennet.SqlParamType.Numeric ]);
    }
    var sResult = gTreeCrud.query(conditions);
    if (sResult && sResult.errorCode == 0) {
        var onclickEvent = function() {
            var treeNode = getTreeNode("divHiddenTree");
            el("PARENT_ID").value = treeNode["id"];
            el("PARENT_NAME").value = treeNode["name"];
            if (treeNode["id"] < 1) {
                $("#CLASS_TYPE").attr("disabled", false);
            } else {
                $("#CLASS_TYPE").attr("disabled", true);
                $("#CLASS_TYPE").val(_getTypeById(treeNode["id"]));
            }
        };
        createTree(sResult.resultVal, "ID", "PARENT_ID", "NAME", "divHiddenTree", onclickEvent, false, null, null, null, firstmyself);
    }
}

/**
 * 设置界面数据
 * @param {Object} obj 修改对象
 * @private
 */
function _editSet(obj) {
    el('CLASS_NAME').value = obj.CLASS_NAME;
    el("CLASS_TYPE").value = obj.CLASS_TYPE;
    el("VIEW_NAME").value = obj.VIEW_NAME;
    el("VIEW_VALUE").value = obj.VIEW_VALUE;
    if (obj.STATUS == 1) {
        el("STATUS").checked;
    } else {
        el("STATUS").checked = false;
    }
    if (obj.PARENT_ID != 0) {
        var parent = SYSDAO.queryObj("commonXmlQuery", "CLASS_ID", "NET_CTRLCLASS", null, null, [ [ "CLASS_ID", obj.PARENT_ID, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String ] ], "CLASS_NAME");
        el("PARENT_ID").value = obj.PARENT_ID;
        el("PARENT_NAME").value = parent.CLASS_NAME;
    } else {
        el("PARENT_ID").value = 0;
        el("PARENT_NAME").value = "所有分组";
    }
}

/**
 * 获取界面值对象
 * @returns {Object}
 * @private
 */
function _addEditGet() {
    return {
        PARENT_ID : el("PARENT_ID").value,
        CLASS_NAME : el("CLASS_NAME").value,
        CLASS_TYPE : el("CLASS_TYPE").value,
        CLASS_DESC : el("CLASS_NAME").value,
        STATUS : el("STATUS").checked ? 1 : 0,
        VIEW_NAME : el("VIEW_NAME").value,
        VIEW_VALUE : el("VIEW_VALUE").value
    };
}

/**
 * 添加修改校验
 * @param {Boolean} isCls
 * @param {Int} id
 * @returns {Boolean}
 * @private
 */
function _addEditValid(isCls, id) {
    return d_out("CLASS_NAME", 20, "") && d_out("CLASS_TYPE", 10, "number") && !_isExist(isCls, id);
}

/**
 * 是否存在
 * @param {Boolean} isCls
 * @param {Int} id
 * @private
 */
function _isExist(isCls, id) {
    var conditions = [];
    conditions.push([ "CLASS_LAYER", isCls ? CLASS : VALUE, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String ]);
    conditions.push([ "CLASS_NAME", el("CLASS_NAME").value, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String ]);
    if (!isCls) {
        conditions.push([ "PARENT_ID", el("PARENT_ID").value, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String ]);
    }
    if (id) {
        conditions.push([ "CLASS_ID", id, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.NotEqual, jetsennet.SqlParamType.String ]);
    }
    var temp = SYSDAO.queryObj("commonXmlQuery", "CLASS_ID", "NET_CTRLCLASS", null, null, conditions, "CLASS_ID");
    if (temp) {
        jetsennet.error("分类已存在！");
        return true;
    }
    return false;
}

/**
 * 删除校验
 * @param {[]<String>} checkIds
 * @returns {Boolean}
 * @private
 */
function _removeValid(checkIds) {
    checkIds = checkIds.join(",");
    var temp = SYSDAO.queryObj("commonXmlQuery", "CLASS_ID", "NET_CTRLCLASS", null, null, 
            [ [ "PARENT_ID", checkIds, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.In, jetsennet.SqlParamType.String ],
              [ "class_id", checkIds, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.NotIn, jetsennet.SqlParamType.String ] ]);
    if (temp) {
        jetsennet.alert("您所要删除的分类有子分类或者数据，不能删除！");
        return false;
    }
    return true;
}

/**
 * 获取类型
 * @param {Int} id classid
 * @private
 */
function _getTypeById(id) {
    var temp = SYSDAO.queryObj("commonXmlQuery", "CLASS_ID", "NET_CTRLCLASS", null, null, [ [ "CLASS_ID", id, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String ] ], "CLASS_TYPE");
    if (temp) {
        return temp.CLASS_TYPE;
    }
    return "";
}

/**
 * 弹出隐藏树
 * @param {String} hideTree 树控件id
 * @param {String} relate 显示位置控件id
 */
function popHiddenTree(hideTree, relate) {
    var relateWid = $("#" + relate.id).css("width").replace("px", "");
    var minWidth = 0;
    if ($("#" + hideTree.id).attr("minWidth")) {
        minWidth = $("#" + hideTree.id).attr("minWidth").replace("px", "");
    }
    var width = relateWid > minWidth ? relateWid : minWidth;
    $("#" + hideTree.id).css("width", width);
    jetsennet.popup(hideTree, {
        reference : relate
    });
}
