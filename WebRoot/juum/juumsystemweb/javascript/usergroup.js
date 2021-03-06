/** ===========================================================================
 * 用户组管理
 * 2015年6月29日   李明
 * ============================================================================
 */
jetsennet.require([ "window", "pagebar", "gridlist", "validate", "ztree/jquery.ztree.all-3.5", "ztree/jztree", "crud"]);
jetsennet.importCss("ztree/zTreeStyle");

var gParentGroupId = 0;
var columns = [{ fieldName: "NAME", sortField: "NAME", width: 200, align: "left", name: "分组名称"},
                { fieldName: "TYPE", sortField: "TYPE", width: 80, align: "center", name: "分组类型", format: function(val, vals){
                    if (val == 0) {
                        return "部门";
                    } else if (val == 1){
                        return "栏目";
                    } else if (val == 2){
                        return "分组";
                    } else {
                        return "频道";
                    }
                }},
                { fieldName: "GROUP_CODE", sortField: "GROUP_CODE", width: 200, align: "left", name: "分组代号"},
                { fieldName: "DESCRIPTION", sortField: "DESCRIPTION", width: "100%", align: "left", name: "描述信息"},
                { fieldName: "ID,PARENT_ID", width: 45, align: "center", name: "编辑", format: function(val,vals){
                    if(vals[1]!=0 && vals[1]!="0") {
                        return jetsennet.Crud.getEditCell("gCrud.edit('" + val + "')");
                    }
                }},
                { fieldName: "ID", width: 45, align: "center", name: "删除", format: function(val,vals){
                    return jetsennet.Crud.getDeleteCell("gCrud.remove('" + val + "')");
                }}];

var gCrud = $.extend(new jetsennet.Crud("divContent", columns), {
  dao : UUMDAO,
  tableName : "UUM_USERGROUP",
  name : "用户组",
  className : "Usergroup",
  cfgId : "divUserGroup",
  checkId : "chkUserGroup",
  insertMethodName : "uumCreateUserGroup",
  updateMethodName : "uumUpdateUserGroup",
  deleteMethodName : "uumDeleteUserGroup",
  addDlgOptions : {size : {width : 550, height : 480}},
  editDlgOptions : {size : {width : 550, height : 480}},
  onAddInit : function() {
      el("selMember").options.length = 0;
	  $("#btnAdd").removeAttr("disabled", "disabled");
      $("#btnDel").removeAttr("disabled", "disabled");
	  $("#txt_groupType").closest(".form-group").hide();
      loadGroupTree();
//	  loadGroupTree(2);
  },
  onAddValid : function() {
      return !_checkGroupExist();
  },
  onAddGet : function() {
      return {
          NAME : el("txtGroupName").value,
          TYPE : $("#txt_groupType").val(),
          GROUP_CODE : el("txtGroupCode").value,
          PARENT_ID : el("ddlParentGroup").value,
          DESCRIPTION : el("txtDescription").value,
          GROUP_USER : jetsennet.Crud.getSelectVals("selMember")
      };
  },
  onEditInit : function() {
      el("selMember").options.length = 0;
	  $("#btnAdd").removeAttr("disabled", "disabled");
      $("#btnDel").removeAttr("disabled", "disabled");
      $("#txt_groupType").closest(".form-group").hide();
  },
  onEditSet : function(obj) {
      loadGroupTree(valueOf(obj, "TYPE", ""));
      el("txtGroupName").value = valueOf(obj, "NAME", "");
      el("txtGroupCode").value = valueOf(obj, "GROUP_CODE", "");
      el("txtDescription").value = valueOf(obj, "DESCRIPTION", "");
      var treeNode = getTreeNodeById("divGroupTree", valueOf(obj, "PARENT_ID", ""));
      if(treeNode){
          el('txt_ddlParentGroup').value = treeNode["name"];
          el('ddlParentGroup').value = treeNode["id"];
      }
      $("#txt_groupType").val(valueOf(obj, "TYPE", ""));
      var jointables = [["UUM_USERTOGROUP", "uu", "uu.USER_ID=u.ID", jetsennet.TableJoinType.Left],
                        ["UUM_USERGROUP", "ug", "ug.ID=uu.GROUP_ID", jetsennet.TableJoinType.Left]];
      var users = UUMDAO.queryObjs("commonXmlQuery", "u.ID", "UUM_USER", "u", jointables, [["uu.GROUP_ID", obj.ID, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]], "u.ID,u.USER_NAME AS NAME,u.STATE");
      if(users && users.length>0) {
          jQuery.each(users, function(){
             var state = this.STATE!=0?" (已停用)":""; 
             this.NAME += state;
          });
      }
      jetsennet.Crud.initItems("selMember", users);
  },
  onEditValid : function(id, obj) {
      if (el("txtGroupName").value != valueOf(obj, "NAME", "") && _checkGroupExist()) {
          return false;
      }
      return true;
  },
  onEditGet : function(id) {
      return {
          ID : id,
          NAME : el("txtGroupName").value,
          GROUP_CODE : el("txtGroupCode").value,
          PARENT_ID : el("ddlParentGroup").value,
          DESCRIPTION : el("txtDescription").value,
          GROUP_USER : jetsennet.Crud.getSelectVals("selMember")
      };
  },
  msgConfirmRemove : "删除用户组,将自动删除关联信息,不可恢复,确认吗?"
});
gCrud.grid.parentId = 0;
gCrud.grid.idField = "ID";
gCrud.grid.parentField = "PARENT_ID";
gCrud.grid.treeControlIndex = 0;
gCrud.grid.treeOpenAll = true;

/**
 * 页面加载完之后执行
 */
function pageInit() {
    gCrud.load();
    loadGroupType();
}

function loadGroupType() {
    var SYSTEM_CODE_JUUM = 20;
    var WORD_GROUP_TYPE = 2003;
    SYSDAO.queryObjs({
        method: "commonXmlQuery",
        keyId: "CW_ID",
        tableName: "NET_CTRLWORD",
        conditions: [["CW_SYS", SYSTEM_CODE_JUUM, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric],
                     ["CW_TYPE", WORD_GROUP_TYPE, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]],
        options: {
            success: function(objs) {
                if(objs && objs.length>0) {
                    for(var i=0; i<objs.length; i++) {
                        jQuery('<option value="'+objs[i].CW_CODE+'">'+objs[i].CW_NAME+'</option>').appendTo("#txt_groupType");
                    }
                }
            }
        }
    });
};

/**
 * 加载分组树
 * @private
 */
function loadGroupTree(type) {
    
    var cons = null;
    var subCons = null;
    if(type) {
        cons = [["PARENT_ID", 0, jetsennet.SqlLogicType.Or, jetsennet.SqlRelationType.NotEqual, jetsennet.SqlParamType.Numeric]];
        subCons = [[["TYPE", type, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric],
                    ["PARENT_ID", 0, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]]];
    }
    var result = UUMDAO.query("commonXmlQuery", "ID", "UUM_USERGROUP", null, null, cons, "ID,NAME,TYPE,PARENT_ID", null, null, subCons);
    if (result && result.errorCode == 0) {
        var onclickEvent = function() {
            var treeNode = getTreeSelectedNodes("divGroupTree");
            el("ddlParentGroup").value = treeNode["id"];//隐藏Input，用于保存选中的树节点ID
            el("txt_ddlParentGroup").value = treeNode["name"];//用于显示选中树节点名称
            if(el("ddlParentGroup").value=="0" || el("ddlParentGroup").value==0)
            {
                el("selMember").options.length = 0;
				$("#btnAdd").attr("disabled", "disabled");
                $("#btnDel").attr("disabled", "disabled");
                $("#txt_groupType").closest(".form-group").show();
            } else {
                el("selMember").options.length = 0;
                $("#btnAdd").removeAttr("disabled", "disabled");
                $("#btnDel").removeAttr("disabled", "disabled");
                $("#txt_groupType").val(treeNode["TYPE"]).closest(".form-group").hide();
            }
        };
        //fistLevelBySelf-false 显示 '所有分组' Edit by JiJie.LianG 2015.10.28
        createTree(result.resultVal, "ID", "PARENT_ID", "NAME", "divGroupTree", onclickEvent, null, null, null, null, false, [type?"0":"-1"]);
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

/**
 * 用户
 */
var gUserCrud = $.extend(new jetsennet.Crud("divSelectUserList", gSelectUserColumns, "divSelectUserPage", "order by t.ID"), {
    dao : UUMDAO,
    tableName : "UUM_USER",
    name : "用户",
    checkId : "chk_SelectUser"
});
gUserCrud.grid.ondoubleclick = null;

/**
 * 检查用户组是否存在
 * @returns {Boolean}
 * @private
 */
function _checkGroupExist() {
    var conditions = [["PARENT_ID", gParentGroupId, jetsennet.SqlLogicType.and, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric],
                      ["TYPE", 2, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]];
    var groups = UUMDAO.queryObjs("commonXmlQuery", "ID", "UUM_USERGROUP", null, null, conditions, "NAME");
    if (groups) {
        var name = el("txtGroupName").value;
        for (var i = 0; i < groups.length; i++) {
            if (name == groups[i].NAME) {
                jetsennet.alert("此组中，[" + name + "]组名称已被使用！");
                return true;
            }
        }
    }
    return false;
}

/**
 * 查询用户
 */
function searchSelectUserData() {
    var conditions = [];
    el('txtUserName').value = jetsennet.util.trim(el('txtUserName').value);
    el('txtLoginName').value = jetsennet.util.trim(el('txtLoginName').value);
    if (el('txtUserName').value != "") {
        conditions.push([ "t.USER_NAME", el('txtUserName').value, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Like, jetsennet.SqlParamType.String ]);
    }
    if (el('txtLoginName').value != "") {
        conditions.push([ "t.LOGIN_NAME", el('txtLoginName').value, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Like, jetsennet.SqlParamType.String ]);
    }
    gUserCrud.search(conditions);
}
