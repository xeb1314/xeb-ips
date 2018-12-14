jetsennet.require(["window", "gridlist", "pagebar", "jetsentree", "crud"]);

//系统编号
jetsennet["SYSTEM_CODES"] = {
        "0": "JMAM", 
        "1": "JDVN", 
        "2": "JNMP", 
        "3": "JSMP", 
        "4": "JDIN", 
        "5": "JDMA",
        "6": "JPPM", 
        "7": "JPPN", 
        "8": "JURM", 
        "9": "JDMP", 
        "10": "JMMP", 
        "11": "JMAMS", 
        "20": "JUUM",
        "21": "JCMP", 
        "22": "JWFM",
        "23":"JMTC",
        "24": "JDSM", 
        "25": "JTSE", 
        "26": "JTSM", 
        "27": "JMSE"
};
//  当前应用涉及到的系统（模块），新建受控词的时候，将只能针对该数组给定的系统进行增加
jetsennet["CTRL_SYSTEMS"] = jetsennet.queryString("codes")?jetsennet.queryString("codes").split("-"):null;

var allCodes = new HashMap();//所有的系统编码
var myCodes = new HashMap();//允许新增的系统
if(jetsennet["SYSTEM_CODES"]) {
    for(var code in jetsennet["SYSTEM_CODES"])
    {
        if(jetsennet["SYSTEM_CODES"].hasOwnProperty(code))
        {
            var obj = {
                    PARENT_ID: 0,
                    ID: code,
                    NAME: jetsennet["SYSTEM_CODES"][code]
            };
            allCodes.put(code, obj);
            if(jetsennet["CTRL_SYSTEMS"] && jetsennet["CTRL_SYSTEMS"].length>0)
            {
                if(jetsennet["CTRL_SYSTEMS"].contains(code)) 
                {
                    myCodes.put(code, obj);
                }
            }else{
                myCodes.put(code, obj);
            }
        }
    }
}

var gCtrlwordColumns = [{ fieldName: "CW_ID", width: 30, align: "center", isCheck: 1, checkName: "chkWord"},
                        { fieldName: "CW_TYPE", sortField: "t.CW_TYPE", width: 100, align: "center", name: "类型编号"},
                        { fieldName: "CW_TYPE,CW_TYPENAME", sortField: "t.CW_TYPE", width: 100, align: "center", name: "类型名称",format: function(val, vals){
                            return vals[1]||vals[0];
                        }},
                        { fieldName: "CW_NAME", sortField: "t.CW_NAME", width: "30%", align: "center", name: "名称"},
                        { fieldName: "CW_CODE", sortField: "t.CW_CODE", width: "30%", align: "center", name: "代码"},
                        { fieldName: "CW_DESC", sortField: "t.CW_DESC", width: "40%", align: "left", name: "描述"},
                        { fieldName: "CW_ID", width: 45, align: "center", name: "编辑", format: function(val,vals){
                            return jetsennet.Crud.getEditCell("gCrud.edit('" + val + "')");
                        }},
                        { fieldName: "CW_ID", width: 45, align: "center", name: "删除", format: function(val,vals){
                            return jetsennet.Crud.getDeleteCell("gCrud.remove('" + val + "')");
                        }}];
var gCrud = $.extend(new jetsennet.Crud("divContent", gCtrlwordColumns, "divPage"), {
    dao : SYSDAO,
    keyId : "CW_ID",
    tableName : "NET_CTRLWORD",
    name : "受控词",
    className : "jetsennet.jsystem.schema.Ctrlword",
    conditions : [[ "t.CW_TYPE", -1, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.NotEqual, jetsennet.SqlParamType.Numeric ]],
    joinTables : [ [ "NET_CTRLWORD", "pt", "pt.CW_TYPE=-1 and pt.CW_CODE = t.CW_TYPE", jetsennet.TableJoinType.left ] ],
    resultFields: "t.*, pt.CW_NAME AS CW_TYPENAME",
    cfgId : "divCtrlword",
    checkId : "chkWord",
    onAddInit : function() {
        $("#selSystem").removeAttr("disabled");
        $("#txtControlType").removeAttr("disabled");
        if(currentSystem) {
            $("#selSystem").val(currentSystem);
        }
        if(currentType) {
            $("#txtControlType").val(currentType);
        }
    },
    onAddGet : function() {
        return {
            CW_SYS: el("selSystem").value,
            CW_TYPE : el("txtControlType").value,
            CW_NAME : el("txtControlName").value,
            CW_CODE : el("txtControlCode").value,
            CW_DESC : el("txtControlDesc").value
        };
    },
    onAddSuccess : function(){
        refreshExistSystemCodes();
    },
    onEditInit : function() {
        $("#selSystem").attr("disabled", "disabled");
        $("#txtControlType").attr("disabled", "disabled");
    },
    onEditSet : function(obj) {
        el("selSystem").value = valueOf(obj, "CW_SYS", "");
        el("txtControlType").value = valueOf(obj, "CW_TYPE", "");
        el("txtControlName").value = valueOf(obj, "CW_NAME", "");
        el("txtControlCode").value = valueOf(obj, "CW_CODE", "");
        el("txtControlDesc").value = valueOf(obj, "CW_DESC", "");
    },
    onEditGet : function(id) {
        return {
            CW_ID : id,
            CW_SYS: el("selSystem").value,
            CW_TYPE : el("txtControlType").value,
            CW_NAME : el("txtControlName").value,
            CW_CODE : el("txtControlCode").value,
            CW_DESC : el("txtControlDesc").value
        };
    }
});

/**
 * 页面初始化
 */
function pageInit() {
    
    refreshExistSystemCodes();
    gCrud.load();
}

/**
 * 获取当前已有的systemcode
 */
function refreshExistSystemCodes() {
    
    SYSDAO.execute("getCtrlTree", null, {async: true, success: function(result){
        jQuery("#divTree").empty();
        var tree = new jetsennet.ui.Tree("system-tree");
        var syscodes = jQuery.parseJSON(result);
        var systemtypes = new Array();
        for(var code in syscodes) 
        {
            if(syscodes.hasOwnProperty(code)) 
            {
                var sys = {ID: code, NAME: (allCodes.get(code).NAME)||"未知", PARENT_ID: 0 };
                if(!myCodes.containsKey(code)) {
                    myCodes.put(code, sys);
                }
                systemtypes.push(sys);
                var root = new jetsennet.ui.TreeItem(sys.NAME, "javascript:searchWord("+null+", '"+sys.ID+"')");
                root.isOpen = true;
                tree.addItem(root);
                for(var type in syscodes[code]) {
                    if(syscodes[code].hasOwnProperty(type)) {
                        var tp = {ID: type, NAME: syscodes[code][type].CW_NAME, PARENT_ID: code};
                        systemtypes.push(tp);
                        var leave = new jetsennet.ui.TreeItem(tp.NAME, "javascript:searchWord('" + tp.ID + "','"+tp.PARENT_ID+"','"+tp.NAME+"');");
                        root.addItem(leave);
                    }
                }
            }
        }
        tree.render("divTree");
        
        $("#selSystem").empty();
        for(var i=0; i<myCodes.values.length; i++) {
            jQuery("<option>"+myCodes.values[i].NAME+"</option>", {}).attr("value", myCodes.values[i].ID).appendTo($("#selSystem"));
        }
    }});
}

/**
 * 查询列表
 */
var currentType = null;
var currentTypeName = ''; 
var currentSystem = null;
function searchWord(cwType, cwSys, typeName) {
    if(cwType || cwSys) {
        if(!cwType){
            currentType = null;
            currentTypeName = '';
            currentSystem = cwSys;
        } else {
            currentType = cwType;
            currentTypeName = typeName;
            currentSystem = cwSys;
        }
    }
    var conditions = [];
    if(currentType) {
        conditions.push([ "t.CW_TYPE", currentType, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric ]);
    } else if(currentSystem) {
        conditions.push([ "t.CW_SYS", currentSystem, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric ]);
    }
    conditions.push([ "t.CW_TYPE", -1, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.NotEqual, jetsennet.SqlParamType.Numeric ]);
    if (el('txt_CW_NAME').value != "") {
        conditions.push([ "t.CW_NAME", el("txt_CW_NAME").value, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.ILike, jetsennet.SqlParamType.String ]);
    }
    gCrud.search(conditions);
}
