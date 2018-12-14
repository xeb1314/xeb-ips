//=============================================================================
// UUMSystemService application
//=============================================================================
jetsennet.require(["layoutit"]);
jetsennet.importCss([ "jetsen", "bootstrap/bootstrap" ]);

var SYSTEM_CODE_JUUM = 20;

//uumdao
var UUMDAO = new jetsennet.DefaultDal("UUMSystemService");
UUMDAO.dataType = "xml";

//sysdao
var SYSDAO = new jetsennet.DefaultDal("SystemService");
SYSDAO.dataType = "xml";

//权限模式:disable,hidden
var AUTH_MODE = "disable";

//选择用户组表格配置
var gSelectGroupColumns = [ {
    fieldName : "ID,NAME",
    width : 30,
    align : "center",
    isCheck : 1,
    checkName : "chkGroup",
    format : function(val, vals) {
        return vals[0] + "," + vals[1];
    }
}, {
    fieldName : "NAME",
    width : 150,
    align : "left",
    name : "用户组"
}, {
    fieldName : "DESCRIPTION",
    width : "100%",
    align : "left",
    name : "描述"
} ];

//选择角色表格配置
var gSelectRoleColumns = [ {
    fieldName : "ID,NAME,TYPE",
    width : 30,
    align : "center",
    isCheck : 1,
    checkName : "chkRole",
    format : function(val, vals) {
        var state = vals[2]!=0?" (已停用)":"";
        return vals[0] + "," + vals[1] + state;
    }
}, {
    fieldName : "NAME",
    width : 150,
    align : "left",
    name : "用户角色"
}, {
    fieldName : "DESCRIPTION,TYPE",
    width : "100%",
    align : "left",
    name : "描述",
    format : function(val, vals) {
        var state = vals[1]!=0?"<font color=\"#f0ad4e\">已停用</font>":"";
        if(val && state) {
            return val + "(" + state + ")";
        }else if(val){
            return val;
        }else{
            return state;
        }
    }
} ];

//选择用户表格配置
var gSelectUserColumns = [ {
    fieldName : "ID,USER_NAME,STATE",
    width : 30,
    align : "center",
    isCheck : 1,
    checkName : "chk_SelectUser",
    format : function(val, vals) {
        var state = vals[2]!=0?" (已停用)":"";
        return vals[0] + "," + vals[1] + state;
    }
}, {
    fieldName : "USER_NAME",
    sortField : "USER_NAME",
    width : "25%",
    align : "left",
    name : "用户姓名"
}, {
    fieldName : "LOGIN_NAME",
    sortField : "LOGIN_NAME",
    width : "25%",
    align : "left",
    name : "登录名称"
}, {
    fieldName : "DESCRIPTION,STATE",
    width : "50%",
    align : "left",
    name : "描述",
    format : function(val, vals) {
        var state = vals[1]!=0?"<font color=\"#f0ad4e\">已停用</font>":"";
        if(val && state) {
            return val + "(" + state + ")";
        }else if(val){
            return val;
        }else{
            return state;
        }
    }
} ];

/**
 * 取系统配置
 * @param {String} configNames 配置项列表
 */
jetsennet.application.getSysConfig = function(configNames) {
    var param = new HashMap();
    param.put("params", configNames);
    var result = SYSDAO.execute("getVagueMutiConfigFromDB", param);
    var configs = {};
    if (result && result.resultVal) {
        var objs = jQuery.parseJSON(result.resultVal);
        if(objs && objs.length>0) {
            for(var i=0; i<objs.length; i++) {
                var obj = objs[i];
                configs[obj.NAME] = obj.DATA;
            }
        }
    }
    return configs;
};

/**
 * 校验界面上的控件是否可用
 */
jetsennet.application.checkFunctionValidate = function() {
    var menuId = jetsennet.queryString("sysid");
    if (!menuId) {
        return;
    }
    var param = new HashMap();
    param.put("userId", jetsennet.application.userInfo.UserId);
    param.put("menuId", menuId);
    var result = UUMDAO.execute("uumGetUserOperateFunction", param);
    if (result && result.resultVal) {
        var objs = jetsennet.xml.toObject(result.resultVal, "Table");
        if (objs && objs.length > 0) {
            for (var i = 0; i < objs.length; i++) {
                var element = $(".func-" + objs[i]["PARAM"]);
                if (element) {
                    if (!objs[i]["STATE"] == "0") {
                        if (AUTH_MODE == "hidden") {
                            element.hide();
                        } else {
                            element.attr("disabled", true);
                        }
                    }
                }
            }
        }
    }
};

jetsennet.util.formatTreeData = function(nodes, parentId, pIdField, idField, childrenField) {
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    var randomString = function(size) {
        var string = "";
         for(var i = 0; i < size ; i ++) {
             var index = Math.ceil(Math.random()*(chars.length-1));
             string += chars.charAt(index);
         }
         return string;
    };
    var getValidField = function(obj, size) {
        while(true) {
            var field = "VALID_" + randomString(size);
            if(!obj[field] && !obj.hasOwnProperty(field)) {
                return field;
            }
        }
    };
    var addChildren = function(node, validField) {
        jQuery.each(nodes, function(){
            if(this[pIdField] == node[idField] && this[idField] != node[idField] && !this[validField]) {
                node[childrenField] = node[childrenField]||[];
                node[childrenField].push(this);
                this[validField] = true;
                addChildren(this, nodes, pIdField, idField, validField, childrenField);
            }
        });
    };
    var validField = getValidField(nodes[0], 6);
    var newNodes = [];
    jQuery.each(nodes, function(){     
        if(this[pIdField] == parentId && this[idField] != parentId  && !this[validField]) {
            this[validField] = true;
            newNodes.push(this);
            addChildren(this, validField);
        }
    });
    jQuery.each(nodes, function(){
        delete this[validField]; 
    });
    return newNodes;
};




