/**
 * 人员管理模块js
 * @author zw	2013-8-13 14:44:07
 */
jetsennet.require([ "window", "pageframe", "gridlist", "pagebar", "validate", "ztree/jquery.ztree.all-3.5", "ztree/jztree", "bootstrap/bootstrap", "bootstrap/moment", "bootstrap/daterangepicker", "crud"]);
jetsennet.importCss(["ztree/zTreeStyle", "bootstrap/daterangepicker-bs3"]);

var gCurGroupId = 0;

var gPersonColumns = [{ fieldName: "ID", width: 30, align: "center", isCheck: 1, checkName: "chkPerson"},
                    { fieldName: "NAME", sortField: "NAME", width: 80, align: "left", name: "姓名"},
                    { fieldName: "USER_CODE", sortField: "USER_CODE", width: 80, align: "left", name: "代号"},
                    { fieldName: "SEX", sortField: "SEX", width: 45, align: "center", name: "性别", format: function(val, vals){
                        if (val == 0) {
                            return "男";
                        } else {
                            return "女";
                        }
                    }},
                    { fieldName: "DUTY_TITLE", sortField: "DUTY_TITLE", width: 100, align: "center", name: "职务"},
                    { fieldName: "OFFICE_PHONE", sortField: "OFFICE_PHONE", width: 100, align: "center", name: "办公电话"},
                    { fieldName: "JOIN_DATE", sortField: "JOIN_DATE", width: 80, align: "center", name: "入职日期", format: function(val, vals){
                        if (val && val.length >= 10) {
                            return val.substring(0,10);
                        } else {
                            return val;
                        }
                    }},
                    { fieldName: "EMAIL", sortField: "EMAIL", width: "100%", align: "left", name: "邮箱"},
                    { fieldName: "STATE", sortField: "STATE", width: 45, align: "center", name: "状态", format: function(val, vals){
                        if (val == 0) {
                            return "活动";
                        } else {
                            return "冻结";
                        }
                    }},
                    { fieldName: "ID", width: 45, align: "center", name: "编辑", format: function(val,vals){
                        return jetsennet.Crud.getEditCell("gCrud.edit('" + val + "')");
                    }},
                    { fieldName: "ID", width: 45, align: "center", name: "删除", format: function(val,vals){
                        return jetsennet.Crud.getDeleteCell("gCrud.remove('" + val + "')");
                    }}];
var gCrud = $.extend(new jetsennet.Crud("divPersonList", gPersonColumns, "divPersonPage"), {
    dao : UUMDAO,
    tableName : "UUM_PERSON",
    joinTables : [ [ "UUM_PERSONTOGROUP", "upg", "t.ID=upg.PERSON_ID", jetsennet.TableJoinType.Inner ] ],
    name : "人员",
    className : "Person",
    cfgId : "divPerson",
    checkId : "chkPerson",
    addDlgOptions : {size : {width : 600, height : 600}},
    editDlgOptions : {size : {width : 600, height : 600}},
    onAddGet : function() {
        return {
            NAME : el("txtName").value,
            USER_CODE : el("txtCode").value,
            SEX : el("ddlSex").value,
            DUTY_TITLE : el("txtDutyTitle").value,
            ADDRESS : el("txtAddress").value,
            EMAIL : el("txtEmail").value,
            OFFICE_PHONE : el("txtOfficePhone").value,
            HOME_PHONE : el("txtHomePhone").value,
            MOBILE_PHONE : el("txtMobilePhone").value,
            JOIN_DATE : _timeToDate(el("txtJoinDate").value),
            USER_CARD : el("txtUserCard").value,
            DESCRIPTION : el("txtDescription").value,
            BIRTHDAY : _timeToDate(el("txtBirthday").value),
            STATE : el("ddlState").value,
            GROUP_ID : gCurGroupId
        };
    },
    onEditSet : function(obj) {
        el("txtName").value = valueOf(obj, "NAME", "");
        el("txtCode").value = valueOf(obj, "USER_CODE", "");
        el("ddlSex").value = valueOf(obj, "SEX", "0");
        el("txtDutyTitle").value = valueOf(obj, "DUTY_TITLE", "");
        el("txtAddress").value = valueOf(obj, "ADDRESS", "");
        el("txtEmail").value = valueOf(obj, "EMAIL", "");
        el("txtOfficePhone").value = valueOf(obj, "OFFICE_PHONE", "");
        el("txtHomePhone").value = valueOf(obj, "HOME_PHONE", "");
        el("txtMobilePhone").value = valueOf(obj, "MOBILE_PHONE", "");
        el("txtJoinDate").value = valueOf(obj, "JOIN_DATE", "").substr(0, 10);
        el("txtUserCard").value = valueOf(obj, "USER_CARD", "");
        el("txtBirthday").value = valueOf(obj, "BIRTHDAY", "").substr(0, 10);
        el("txtDescription").value = valueOf(obj, "DESCRIPTION", "");
        el("ddlState").value = valueOf(obj, "STATE", "0");
    },
    onEditGet : function(id) {
        return {
            ID : id,
            NAME : el("txtName").value,
            USER_CARD : el("txtUserCard").value,
            USER_CODE : el("txtCode").value,
            SEX : el("ddlSex").value,
            STATE : el("ddlState").value,
            BIRTHDAY : el("txtBirthday").value,
            DUTY_TITLE : el("txtDutyTitle").value,
            ADDRESS : el("txtAddress").value,
            EMAIL : el("txtEmail").value,
            OFFICE_PHONE : el("txtOfficePhone").value,
            HOME_PHONE : el("txtHomePhone").value,
            MOBILE_PHONE : el("txtMobilePhone").value,
            JOIN_DATE : _timeToDate(el("txtJoinDate").value),
            BIRTHDAY : _timeToDate(el("txtBirthday").value),
            DESCRIPTION : el("txtDescription").value
        };
    }
});
var gGroupCrud = $.extend(new jetsennet.Crud("divSelectUserGroupList", gSelectGroupColumns), {
    dao : UUMDAO,
    tableName : "UUM_USERGROUP",
    conditions : [ ["t.ID", "0", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.NotEqual, jetsennet.SqlParamType.Numeric], 
                   ["t.TYPE", 2, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]],
    name : "用户组",
    checkId : "chkGroup"
});
var gRoleCrud = $.extend(new jetsennet.Crud("divSelectUserRoleList", gSelectRoleColumns), {
    dao : UUMDAO,
    tableName : "UUM_ROLE",
    name : "角色",
    checkId : "chkRole"
});

/**
 * 页面初始化
 */
function pageInit() {
	jQuery("#divPageFrame").pageFrame({ layout : [ 200, {splitType: 1, layout: [45, "auto", 38]} ] }).sizeBind(window);
    gCrud.load();
    _loadGroupTree();
    $('#txtBirthday, #txtJoinDate').daterangepicker({
        startDate : moment().startOf('day'),
        singleDatePicker : true,
        format : 'YYYY-MM-DD'
    });
}

/**
 * 加载分组树
 * @private
 */
function _loadGroupTree() {
    var conditions = [["ID", "0", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.NotEqual, jetsennet.SqlParamType.Numeric],
                       ["TYPE", "0", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]];
    var result = UUMDAO.query("commonXmlQuery", "ID", "UUM_USERGROUP", null, null, conditions, "ID,NAME,PARENT_ID,TYPE");
    if (result && result.errorCode == 0) {
        var onclickEvent = function() {
            var treeNode = getTreeSelectedNodes("divTree");
            searchPerson(treeNode["id"]);
        };
        createTree(result.resultVal, "ID", "PARENT_ID", "NAME", "divTree", onclickEvent);
    }
}

/**
 * 人员按组查询
 * @param {String} groupId 用户组Id
 */
function searchPerson(groupId) {
    gCurGroupId = groupId == null ? gCurGroupId : groupId;
    var conditions = [];
    if (gCurGroupId > 0) {
        conditions.push(["upg.GROUP_ID", gCurGroupId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
    }
    var subConditions = [];
    if (el('txtUserName').value) {
        subConditions.push([ [ "t.NAME", el('txtUserName').value, jetsennet.SqlLogicType.Or, jetsennet.SqlRelationType.Like, jetsennet.SqlParamType.String],
                             [ "t.USER_CODE", el('txtUserName').value, jetsennet.SqlLogicType.Or, jetsennet.SqlRelationType.Like, jetsennet.SqlParamType.String]]);
    }
    gCrud.search(conditions, subConditions);
}

/**
 * 日期字符串转为时间，为查询使用
 * @param {String} str 日期字符串
 * @return {String}
 * @private
 */
function _timeToDate(str) {
    //源字符串一定为日期或时间
    if (str.indexOf(":") > 0) {
        return str;
    }
    return str + " 00:00:00";
}

/**
 * 注册为系统用户
 * @param {String} keyId 选中的人员Id
 */
function regUser(keyId) {
    var checkIds = jetsennet.Crud.getCheckIds(keyId, "chkPerson");
    if (checkIds.length != 1) {
        jetsennet.alert("请选择一个要注册的人员！");
        return;
    }

    jetsennet.confirm("确定要注册为系统用户吗？", function() {
        var dialog = jetsennet.Crud.getConfigDialog("注册用户", "divRegUser", {size : {width : 600, height : 500}});
        $('#myTab a:first').tab('show');
        el("selectGroup").options.length = 0;
        el("selectRole").options.length = 0;
        
        var person = UUMDAO.queryObj("commonXmlQuery", "ID", "UUM_PERSON", null, null, [ ["ID", checkIds[0], jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]]);
        if (person) {
            el('txt_LOGIN_NAME').value = valueOf(person, "USER_CODE", "");
            el('txt_USER_NAME').value = valueOf(person, "NAME", "");
        }

        dialog.onsubmit = function() {
            var areaElements = jetsennet.form.getElements('divRegUser');
            if (!jetsennet.validate(areaElements, true)) {
                return;
            }

            var userInfo = {
                LOGIN_NAME : el('txt_LOGIN_NAME').value,
                USER_NAME : el('txt_USER_NAME').value,
                PASSWORD : "123456!1a",
                DESCRIPTION : el('txt_DESCRIPTION').value,
                STATE : el('txt_STATE').value,
                RIGHT_LEVEL : el('txt_RIGHT_LEVEL').value,
                APP_PARAM : jetsennet.xml.serialize({
                    PageTheme : el('ddl_PageTheme').value,
                    PageStyle : el('ddl_PageStyle').value
                }, "Param"),
                GROUP_USER : jetsennet.Crud.getSelectVals("selectGroup"),
                ROLE_USER : jetsennet.Crud.getSelectVals("selectRole")
            };

            var params = new HashMap();
            params.put("className", "User");
            params.put("saveXml", jetsennet.xml.serialize(userInfo, "UUM_USER"));
            var result = UUMDAO.execute("commonObjInsert", params);
            if (result && result.errorCode == 0) {
                jetsennet.alert("注册系统用户成功！");
                return true;
            }
        };
        dialog.showDialog();
        return true;
    });
}
