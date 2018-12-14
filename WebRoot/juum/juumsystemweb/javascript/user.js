/** ===========================================================================
 * 用户管理
 * 20130814，郝晓文，新建
 * 20130819，郝晓文，修改，添加角色树
 * Copyright (c) Beijing Jetsen Technology Co., Ltd. All Rights Reserved.
 * ============================================================================
 */
jetsennet.require(["window", "gridlist", "pagebar", "jetsentree", "validate", "bootstrap/bootstrap", "crud", "jquery/jquery.md5"]);

var gCurRoleId = 0;

var gUserColumns = [{ fieldName: "ID", width: 30, align: "center", isCheck: 1, checkName: "chkUser"},
                    { fieldName: "LOGIN_NAME", sortField: "LOGIN_NAME", width: "50%", align: "left", name: "登录名称"},
                    { fieldName: "USER_NAME", sortField: "USER_NAME", width: "50%", align: "left", name: "用户名称"},
                    { fieldName: "CREATE_TIME", sortField: "CREATE_TIME", width: 135, align: "center", name: "创建时间"},
                    { fieldName: "STATE", sortField: "STATE", width: 80, align: "center", name: "用户状态", format: function(val, vals){
                        if (val == -1) {
                            return "待审核";
                        } else if (val == 0) {
                            return "启用";
                        } else {
                            return "停用";
                        }
                    }},
                    { fieldName: "ID", width: 45, align: "center", name: "编辑", format: function(val,vals){
                        return jetsennet.Crud.getEditCell("gCrud.edit('" + val + "')");
                    }},
                    { fieldName: "ID", width: 45, align: "center", name: "删除", format: function(val,vals){
                        return jetsennet.Crud.getDeleteCell("gCrud.remove('" + val + "')");
                    }}];
var gCrud = $.extend(new jetsennet.Crud("divUserList", gUserColumns, "divUserPage"), {
    dao : UUMDAO,
    tableName : "UUM_USER",
    name : "用户",
    className : "User",
    cfgId : "divUser",
    checkId : "chkUser",
    insertMethodName : "uumCreateUser",
    updateMethodName : "uumUpdateUser",
    deleteMethodName : "uumDeleteUser",
    onAddInit : function() {
        $('#myTab a:first').tab('show');
        el('tr_password').style.display = "";
        el('tr_ModifyPw').style.display = "none";
        el('txt_LOGIN_NAME').disabled = false;
        el("selectGroup").options.length = 0;
        el("selectRole").options.length = 0;
    },
    onAddValid : function() {
        if (el('txt_PASSWORD').value != el('txt_PASSWORD2').value) {
            jetsennet.alert('确认密码跟用户密码不一致，请重新输入！');
            el('txt_PASSWORD2').focus();
            return false;
        }
        return true;
    },
    onAddGet : function() {
        return {
            LOGIN_NAME : el('txt_LOGIN_NAME').value,
            USER_NAME : el('txt_USER_NAME').value,
            PASSWORD : jQuery.md5(el('txt_PASSWORD').value),
            DESCRIPTION : el('txt_DESCRIPTION').value,
            STATE : el('txt_STATE').value,
            RIGHT_LEVEL : el('txt_RIGHT_LEVEL').value,
            APP_PARAM : jetsennet.xml.serialize({
                PageTheme : (el('ddl_PageTheme').value||jetsennet["DEFAULT_THEME"]),
                PageStyle : (el('ddl_PageStyle').value||jetsennet["DEFAULT_STYLE"])
            }, "Param"),
            GROUP_USER : jetsennet.Crud.getSelectVals("selectGroup"),
            ROLE_USER : jetsennet.Crud.getSelectVals("selectRole")
        };
    },
    addDlgOptions : {size : {width : 600, height : 500}},
    onEditInit : function() {
        $('#myTab a:first').tab('show');
        el('tr_password').style.display = "none";
        el('tr_ModifyPw').style.display = "";
        el('chk_ModifyPw').checked = false;
        el('txt_LOGIN_NAME').disabled = true;
    },
    onEditSet : function(obj) {
        el("txt_LOGIN_NAME").value = valueOf(obj, "LOGIN_NAME", "");
        el("txt_USER_NAME").value = valueOf(obj, "USER_NAME", "");
        el("txt_PASSWORD").value = valueOf(obj, "PASSWORD", "");
        el("txt_PASSWORD2").value = valueOf(obj, "PASSWORD", "");
        el('txt_RIGHT_LEVEL').value = valueOf(obj, "RIGHT_LEVEL", "0");
        el("txt_DESCRIPTION").value = valueOf(obj, "DESCRIPTION", "");
        el("txt_STATE").value = valueOf(obj, "STATE", "0");
        var userParam = valueOf(obj, "APP_PARAM", "");
        try {
            var paramDoc = new jetsennet.XmlDoc();
            paramDoc.loadXML(userParam);
            if (paramDoc && paramDoc.documentElement) {
                el('ddl_PageTheme').value = valueOf(paramDoc.documentElement.selectSingleNode("PageTheme"), "text", "");
                el('ddl_PageStyle').value = valueOf(paramDoc.documentElement.selectSingleNode("PageStyle"), "text", "");
            }
        } catch (e) {
        }
        
        var jointables = [["UUM_USERTOGROUP", "ug", "ug.GROUP_ID=g.ID", jetsennet.TableJoinType.Inner]];
        var groups = UUMDAO.queryObjs("commonXmlQuery", "g.ID", "UUM_USERGROUP", "g", jointables, [["ug.USER_ID", obj.ID, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]]);
        jetsennet.Crud.initItems("selectGroup", groups);
        
        jointables = [["UUM_USERTOROLE", "ur", "ur.ROLE_ID=r.ID", jetsennet.TableJoinType.Inner]];
        var roles = UUMDAO.queryObjs("commonXmlQuery", "r.ID", "UUM_ROLE", "r", jointables, [ ["ur.USER_ID", obj.ID, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]]);
        if(roles && roles.length>0) {
            jQuery.each(roles, function(){
                var state = this.TYPE!=0?" (已停用)":"";
                this.NAME += state;
            });
        }
        jetsennet.Crud.initItems("selectRole", roles);
    },
    onEditValid : function() {
        if (el('chk_ModifyPw').checked == true) {
            if (el('txt_PASSWORD').value == "") {
                jetsennet.alert('请输入用户密码！');
                el('txt_PASSWORD').focus();
                return false;
            }
            if (el('txt_PASSWORD').value != el('txt_PASSWORD2').value) {
                jetsennet.alert('确认密码跟用户密码不一致，请重新输入！');
                el('txt_PASSWORD2').focus();
                return false;
            }
        }
        return true;
    },
    onEditGet : function(id) {
        return {
            ID : id,
            LOGIN_NAME : el('txt_LOGIN_NAME').value,
            USER_NAME : el('txt_USER_NAME').value,
            PASSWORD : jQuery.md5(el('txt_PASSWORD').value),
            MODIFY_PW : el('chk_ModifyPw').checked ? "1" : "0",
            DESCRIPTION : el('txt_DESCRIPTION').value,
            STATE : el('txt_STATE').value,
            RIGHT_LEVEL : el('txt_RIGHT_LEVEL').value,
            APP_PARAM : jetsennet.xml.serialize({
                PageTheme : (el('ddl_PageTheme').value||jetsennet["DEFAULT_THEME"]),
                PageStyle : (el('ddl_PageStyle').value||jetsennet["DEFAULT_STYLE"])
            }, "Param"),
            GROUP_USER : jetsennet.Crud.getSelectVals("selectGroup"),
            ROLE_USER : jetsennet.Crud.getSelectVals("selectRole")
        };
    },
    editDlgOptions : {size : {width : 600, height : 500}},
    onRemoveValid : function(checkIds) {
        for (var i = 0; i < checkIds.length; i++) {
            if (checkIds[i] == 1) {
                jetsennet.alert("系统不允许删除管理员用户！");
                return false;
            }
        }
        return true;
    }
});
var gGroupCrud = $.extend(new jetsennet.Crud("divSelectUserGroupList", gSelectGroupColumns), {
    dao : UUMDAO,
    tableName : "UUM_USERGROUP",
    conditions : [ ["t.ID", "0", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.NotEqual, jetsennet.SqlParamType.Numeric],
                   ["t.PARENT_ID", "0", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.NotEqual, jetsennet.SqlParamType.Numeric]],
    name : "用户组",
    checkId : "chkGroup"
});
gGroupCrud.grid.ondoubleclick = null;
var gRoleCrud = $.extend(new jetsennet.Crud("divSelectUserRoleList", gSelectRoleColumns), {
    dao : UUMDAO,
    tableName : "UUM_ROLE",
    name : "角色",
    checkId : "chkRole"
});
gRoleCrud.grid.ondoubleclick = null;
/**
 * 页面初始化
 */
function pageInit() {
    gCrud.load();
    _loadRoleTree();
    loadSkinAndTemplate();
}


/**
 * 加载皮肤
 */
function loadSkinAndTemplate() {
    
    UUMDAO.queryObjs({
        method:     "commonXmlQuery",
        keyId:      "CW_ID",
        tableName:  "NET_CTRLWORD",
        conditions: [["CW_SYS", SYSTEM_CODE_JUUM, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric],
                     ["CW_TYPE", "2001,2002", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.In, jetsennet.SqlParamType.Numeric]],
        resultFields: "CW_NAME,CW_CODE,CW_TYPE",
        options:    {
            success: function (result) {
                var len = result.length;
                for (var i = 0; i < len; i++) {
                    if(result[i].CW_TYPE == 2002)
                    {
                        jQuery("<option>"+result[i].CW_NAME+"</option>", {}).attr("value", result[i].CW_CODE).appendTo($("#ddl_PageTheme"));
                    }else{
                        jQuery("<option>"+result[i].CW_NAME+"</option>", {}).attr("value", result[i].CW_CODE).appendTo($("#ddl_PageStyle"));
                    }
                }
            }
        }
    });
}

/**
 * 加载角色
 * @private
 */
function _loadRoleTree() {
    jQuery("#divTree").html("");
    var roleTree = new jetsennet.ui.Tree("role-tree");
    var topTree = new jetsennet.ui.TreeItem("所有角色", "javascript:searchUser(0)");
    topTree.isOpen = true;
    roleTree.addItem(topTree);

    var result = UUMDAO.queryObjs("commonXmlQuery", "ID", "UUM_ROLE", null, null, [ ["ID", 0, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.NotEqual, jetsennet.SqlParamType.Numeric] ], "ID,NAME,TYPE");
    if (result) {
        var len = result.length;
        for (var i = 0; i < len; i++) {
            var subItem = new jetsennet.ui.TreeItem(result[i].NAME, "javascript:searchUser(" + result[i].ID + ")");
            topTree.addItem(subItem);
        }
    }
    roleTree.render("divTree");
}

/**
 * 查询用户
 * @param {Int} roleId 角色id
 */
function searchUser(roleId) {
    gCurRoleId = roleId == null ? gCurRoleId : roleId;
    var conditions = [];
    if (gCurRoleId > 0) {
        gCrud.joinTables = [[ "UUM_USERTOROLE", "ur", "ur.USER_ID=t.ID", jetsennet.TableJoinType.Left ]];
        conditions.push(["ur.ROLE_ID", gCurRoleId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
    }else{
        gCrud.joinTables = null;
    }
    var subConditions = [];
    var value = jetsennet.util.trim(el('txtUserName').value);
    if (value) {
        subConditions.push([ [ "t.LOGIN_NAME", value, jetsennet.SqlLogicType.Or, jetsennet.SqlRelationType.Like, jetsennet.SqlParamType.String ], 
                             [ "t.USER_NAME", value, jetsennet.SqlLogicType.Or, jetsennet.SqlRelationType.Like, jetsennet.SqlParamType.String ] ]);
    }
    gCrud.search(conditions, subConditions);
}

function importData(){
	var file = el("fileImport");
    if (file.outerHTML) {
        file.outerHTML = file.outerHTML;
    }
    else {
        file.value = '';
    }
	var dialog = new jetsennet.ui.Window("import-object-win");
    $.extend(dialog, { submitBox: true, cancelBox: true, windowStyle: 1, maximizeBox: false, minimizeBox: false, size: { width:500, height: 0 }, showScroll: false, title: "导入用户" });
    dialog.controls = ["divImport"];
    dialog.onsubmit = function () {
        if (el('fileImport').value == "") {
            jetsennet.alert("请选择要导入的excel文件!");
            return;
        }
        var hides = el('fileImport').value.substring(el('fileImport').value.lastIndexOf(".")+1);
        if(hides&&hides.toLowerCase()=="xls" || hides.toLowerCase()=="xlsx"){
        	el('frmImport').submit();
        }else{
        	jetsennet.alert("请导入excel文件!");
        	return;
        }
    };
    dialog.showDialog();
    dialog.adjustSize();
}

function importDone() {
    jetsennet.message("导入成功！");
    gCrud.load();
    jetsennet.ui.Windows.close("import-object-win");
}

