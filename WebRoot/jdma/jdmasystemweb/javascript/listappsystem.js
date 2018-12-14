jetsennet.require([ "gridlist", "pagebar","pageframe", "window", "bootstrap/moment", "crud","autocomplete", "bootstrap/daterangepicker","datepicker"]);
jetsennet.importCss("bootstrap/daterangepicker-bs3");

var gCurDate = new Date();
var gLastWeekDate;

var gAppSystemColumns = [ { fieldName: "SYS_ID", width: 30, align: "center", isCheck: 1, checkName: "chkAppSys"},
                        { fieldName: "SYS_NAME", sortField: "SYS_NAME", width:"25%", align: "center", name: "系统名称"},
                        { fieldName: "SYS_TYPE", sortField: "SYS_TYPE", width:"10%", align: "center", name: "系统类型"},
                        { fieldName: "SYS_CODE", sortField: "SYS_CODE", width:"10%", align: "center", name: "系统代号"},
                        { fieldName: "SYS_DESC", sortField: "SYS_DESC", width:"25%", align: "center", name: "系统描述"},
                        { fieldName: "STATE", sortField: "STATE", width:"5%", align: "center", name: "系统状态",format: function(val, vals){
                        	var state;
	                         	switch(parseInt(val,10)){
	                         	  case 0:
	                         		 state=" 正常";
	                         		  break;
	                         	  case 1:
	                         		 state="停用";
	                         		  break;
	                               default:
	                            	   state="未知-"+val;
	                                   break;
	                         	}
                         	return state;
                     		}
                        },
                        { fieldName: "CREATE_USER", sortField: "CREATE_USER", width:"10%", align: "center", name: "创建用户"},
                        { fieldName: "CREATE_TIME", sortField: "CREATE_TIME", width:"15%", align: "center", name: "创建时间"},
                        { fieldName: "SYS_ID", width: 45, align: "center", name: "编辑", format: function(val,vals){
                            return jetsennet.Crud.getEditCell("gAppSystemCrud.edit('" + val + "')");
                        }},
                        { fieldName: "SYS_ID", width:45, align: "center", name: "删除", format: function(val,vals){
                       	var value= "'"+val+"'";
                        	return '<span style="cursor:pointer;" onclick="gAppSystemCrud.remove(' + value + ')"><img src="images/cel_del.png"></img></span>';
                        }}
                        ];
var gAppSystemCrud = $.extend(new jetsennet.Crud("divAppSysList", gAppSystemColumns, "divAppSysListPage", "ORDER BY t.CREATE_TIME DESC"), {
    dao : DMADAO,
    tableName : "DMA_APPSYSTEM",
    resultFields : "t.*",
    keyId : "SYS_ID",
    name : "应用系统",
    checkId : "chkAppSys",
    cfgId : "divAppSysDialog",
    className : "jetsennet.jdma.schema.DmaAppsystem",
    addDlgOptions : {size : {width : 510, height :0}},
    editDlgOptions : {size : {width : 510, height :0}},
    onAddInit : function() {
    },
    onAddValid : function() {
	    return validateSysCode();
    },
    onAddGet : function() {
    	return {
    		SYS_NAME : el("txtSysName").value,
    		SYS_TYPE : el("txtSysType").value,
    		SYS_CODE : el("txtSysCode").value,
    		SYS_DESC : el("txt_sysDesc").value,
    		STATE : el("sysState").value,
    		CREATE_USER : jetsennet.application.userInfo.UserName,
        };
    },
    onAddSuccess : function(){
   	 jetsennet.message("新建成功！");
   },
   onEditInit : function() {
   	
   },
   onEditValid : function(id, obj) {
   	 return validateSysCode(id);
	},
   onEditSet : function(obj) {
   	el("txtSysName").value = valueOf(obj, "SYS_NAME", "");
   	el("txtSysType").value = valueOf(obj, "SYS_TYPE", "");
   	el("txtSysCode").value = valueOf(obj, "SYS_CODE", "");
   	el("txt_sysDesc").value = valueOf(obj, "SYS_DESC", "");
   	el("sysState").value = valueOf(obj, "STATE", "");
   },
   onEditGet : function(id) {
       return {
    	SYS_ID : id,
    	SYS_NAME : el("txtSysName").value,
   		SYS_TYPE : el("txtSysType").value,
   		SYS_CODE : el("txtSysCode").value,
   		SYS_DESC : el("txt_sysDesc").value,
   		STATE : el("sysState").value
       };
   },
   onEditSuccess : function(obj){
	   jetsennet.message("编辑成功！");
   }
});

/**
 * 页面初始化
 */
function pageInit() {
	
	 jQuery("#txtStartTime").pickDate();
 	 jQuery("#txtEndTime").pickDate();
	/* gLastWeekDate = new Date(gCurDate.getTime() - 6 * 24 * 3600 * 1000);
     el('txtStartTime').value = gLastWeekDate.toDateString();
     el('txtEndTime').value = gCurDate.toDateString();*/
	 gAppSystemCrud.search();
};

/**
 * 查询列表
 */
function searchAppSys() {
    var conditions = [];
    if (el("txtStartTime").value != '') {
    	conditions.push(["CREATE_TIME", el("txtStartTime").value + " 00:00:00", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.ThanEqual, jetsennet.SqlParamType.DateTime]);						
    }
    if (el("txtEndTime").value != '') {
    	conditions.push(["CREATE_TIME", el("txtEndTime").value + " 23:59:59", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.LessEqual, jetsennet.SqlParamType.DateTime]);						
    }
    if (el("txtKeyWord").value != '') {
    	conditions.push(["SYS_NAME", el("txtKeyWord").value , jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Like]);						
    }
    gAppSystemCrud.search(conditions);
}

/**
 * 校验系统编号重复
 * @param name
 * @returns {Boolean}
 */
function validateSysCode(id) {
	var conditions=[];
	if(typeof(id) != "undefined"){
		conditions.push([ "t.SYS_ID", id, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.NotEqual, jetsennet.SqlParamType.String ]);
	}
	var subConditions = [];
	subConditions.push([ [ "SYS_CODE", el("txtSysCode").value, jetsennet.SqlLogicType.Or, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String ],
	                     [ "SYS_NAME", el("txtSysName").value, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String ]
	                    ]);
	
	var funcs = DMADAO.queryObjs("commonXmlQuery", "SYS_ID", "DMA_APPSYSTEM", null, null,conditions, "SYS_ID",null,null,subConditions);
    if (funcs) {
    	jetsennet.warn("该系统名称或者代号已被使用！");
    	return false;
    }else return true;
}

