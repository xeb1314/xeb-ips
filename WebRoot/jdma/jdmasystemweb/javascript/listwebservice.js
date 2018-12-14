jetsennet.require([ "gridlist", "pagebar","pageframe", "window", "bootstrap/moment", "crud","autocomplete", "bootstrap/daterangepicker","datepicker"]);
jetsennet.importCss("bootstrap/daterangepicker-bs3");

var gCurDate = new Date();
var gLastWeekDate;
var gParentId;
var gGrandParentIds;

var gWebServiceColumns = [ { fieldName: "SERVICE_ID", width: 30, align: "center", isCheck: 1, checkName: "chkWebService"},
                        { fieldName: "SERVICE_NAME", sortField: "SERVICE_NAME", width:"20%", align: "center", name: "服务名称"},
                        { fieldName: "SERVICE_CODE", sortField: "SERVICE_CODE", width:"10%", align: "center", name: "服务代号"},
                        { fieldName: "SYS_ID", sortField: "SYS_ID", width:"10%", align: "center", name: "系统名称",format: function(val, vals){
                        	
                        	var sResult = DMADAO.query("commonXmlQuery", "SYS_ID", "DMA_APPSYSTEM", null, null, [["SYS_ID", val, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String]], "SYS_NAME");
                        	var ssResult = jetsennet.xml.toObject(sResult.resultVal, "Record");
	                        	if(!$.isEmptyObject(ssResult)){
	                        		return ssResult[0].SYS_NAME;
	                        	}
	                 		}
                        },
                        { fieldName: "SERVICE_URL", sortField: "SERVICE_URL", width:"28%", align: "center", name: "服务地址"},
                        { fieldName: "STATE", sortField: "STATE", width:"7%", align: "center", name: "系统状态",format: function(val, vals){
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
                        { fieldName: "SERVICE_ID", width:45, align: "center", name: "查看", format: function(val,vals){
                        	
                       	 return "<a href=\"javascript:submenuList('"+val+"');\" style=\"text-decoration: underline;\"><img src='images/cel_info.png'/></a>";
//                        	return "<img src='images/cel_info.png'/>";
                        }},
                        { fieldName: "SERVICE_ID", width: 45, align: "center", name: "编辑", format: function(val,vals){
                            return jetsennet.Crud.getEditCell("gWebServiceCrud.edit('" + val + "')");
                        }},
                        { fieldName: "SERVICE_ID", width:45, align: "center", name: "删除", format: function(val,vals){
                       	var value= "'"+val+"'";
                        	return '<span style="cursor:pointer;" onclick="gWebServiceCrud.remove(' + value + ')"><img src="images/cel_del.png"></img></span>';
                        }}
                        ];
var gWebServiceCrud = $.extend(new jetsennet.Crud("divWebServiceList", gWebServiceColumns, "divWebServicePage", "ORDER BY t.CREATE_TIME DESC"), {
    dao : DMADAO,
    tableName : "DMA_WEBSERVICE",
    resultFields : "t.*",
    keyId : "SERVICE_ID",
    name : "应用系统",
    insertMethodName : "commonWebServiceInsert",
    updateMethodName : "commonWebServiceUpdate",
    deleteMethodName : "commonWebServiceDelete",
    checkId : "chkWebService",
    cfgId : "divWebServiceDialog",
    className : "jetsennet.jdma.schema.DmaWebservice",
    addDlgOptions : {size : {width : 510, height :0}},
    editDlgOptions : {size : {width : 510, height :0}},
    onAddInit : function() {
    	sysOptions();
    },
    onAddValid : function() {
	    return true;
    },
    onAddGet : function() {
    	return {
    		SYS_ID : el("sysName").value,
    		SERVICE_NAME : el("txtWebName").value,
    		SERVICE_CODE : el("txtWebCode").value,
    		SERVICE_URL : el("txt_requestUrl").value,
    		WSDL_PATH : el("txt_descUrl").value,
    		SERVICE_DESC : el("txt_webDesc").value,
    		STATE : el("webState").value,
    		CREATE_USER : jetsennet.application.userInfo.UserName
        };
    },
    onAddSuccess : function(){
   	 jetsennet.message("新建成功！");
   },
   onEditInit : function() {
	   sysOptions();
   },
   onEditValid : function(id, obj) {
   	 return true;
	},
   onEditSet : function(obj) {
   	el("sysName").value = valueOf(obj, "SYS_ID", "");
   	el("txtWebName").value = valueOf(obj, "SERVICE_NAME", "");
   	el("txtWebCode").value = valueOf(obj, "SERVICE_CODE", "");
   	el("txt_requestUrl").value = valueOf(obj, "SERVICE_URL", "");
   	el("txt_descUrl").value = valueOf(obj, "WSDL_PATH", "");
   	el("txt_webDesc").value = valueOf(obj, "SERVICE_DESC", "");
   	el("webState").value = valueOf(obj, "STATE", "");
   },
   onEditGet : function(id) {
       return {
    	SERVICE_ID : id,
    	SYS_ID : el("sysName").value,
   		SERVICE_NAME : el("txtWebName").value,
   		SERVICE_CODE : el("txtWebCode").value,
   		SERVICE_URL : el("txt_requestUrl").value,
   		WSDL_PATH : el("txt_descUrl").value,
   		SERVICE_DESC : el("txt_webDesc").value,
   		STATE : el("webState").value,
   		CREATE_USER : jetsennet.application.userInfo.UserName,
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
     gWebServiceCrud.search();
};

/**
 * 导航选择处理
 */
function submenuList(serviceId) {
	var a=  window.location.href;
	var b = a.substring(0,a.lastIndexOf("/",a.length-1));
	document.location = b+"/viewwebservice.htm?width=screen.width&height=screen.height&img=collectionsysmgr.png&" + jetsennet.getValideQueryString() + "&sysid=16301&serviceId="+serviceId;
}


/**
 * 获取web服务所属系统的下拉框
 */
function sysOptions(){
	var sResult = DMADAO.query("commonXmlQuery", "SYS_ID", "DMA_APPSYSTEM", null, null, null, "SYS_ID,SYS_NAME");
	var ssResult = jetsennet.xml.toObject(sResult.resultVal, "Record");
	if(!$.isEmptyObject(ssResult)){
		el("sysName").options.length=0;
		 var elm = el("sysName");
		    for (var i = 0; i < ssResult.length; i++) {
		    	
			    var objNewOption = document.createElement("option");
			    objNewOption.value = ssResult[i].SYS_ID;
			    objNewOption.innerHTML = ssResult[i].SYS_NAME;
			    elm.options.add(objNewOption);
		    }
	}
}

/**
 * 查询列表
 */
function searchWebService() {
    var conditions = [];
    if (el("txtStartTime").value != '') {
    	conditions.push(["CREATE_TIME", el("txtStartTime").value + " 00:00:00", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.ThanEqual, jetsennet.SqlParamType.DateTime]);						
    }
    if (el("txtEndTime").value != '') {
    	conditions.push(["CREATE_TIME", el("txtEndTime").value + " 23:59:59", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.LessEqual, jetsennet.SqlParamType.DateTime]);						
    }
    if (el("txtKeyWord").value != '') {
    	conditions.push(["SERVICE_NAME", el("txtKeyWord").value , jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Like]);						
    }
    gWebServiceCrud.search(conditions);
}

