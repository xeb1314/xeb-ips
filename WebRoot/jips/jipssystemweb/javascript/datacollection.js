jetsennet.require([ "autocomplete","gridlist","crud", "pagebar","pageframe", "window", 
                    "tabpane","datepicker","datetime","jetsentree"]);
jetsennet.importCss("bootstrap/daterangepicker-bs3");
	/**
	 *警告：不同服务对应不同模板都是通过固定divId决定的，不能轻易修改其名字。 
	 */
//	var taskId;
//	var serviceID;
//	//IP数据下载的tabpane
//	var tabpane;
	//选中的IP数据下载的tabpane
	var tp;
	//配置弹出窗
	var dialog;
	var gCurDate = new Date().toDateString();
	var gLastWeekDate;
	var templXml;
	//IP数据下载规则名称
	var ruleName;
//	var taskName;
	//任务对象
	var objTask={};
	var divId;

	el('create_time').value = gCurDate+" - "+gCurDate;
	$('#create_time').daterangepicker(jQuery.extend({ opens : "right"}, dataPickerOptions),true);
	
/**
 * 页面初始化
 */
function pageInit() {
//	 jQuery("#divPageFrame").pageFrame({ splitType: 1, showSplit :false, layout : [  {splitType: 1, layout : [ 40, "auto" , 35]} ,{splitType: 1, layout : [ 40, 225 , 35]}]}).sizeBind(window);//300
//	 tabpane = new jetsennet.ui.TabPane(el('tabPaneaaa'), el('divBody'));
	 /*jQuery("#txtStartTime").pickDate();
	 jQuery("#txtEndTime").pickDate();
	 gLastWeekDate = new Date(gCurDate.getTime() - 6 * 24 * 3600 * 1000);
     el('txtStartTime').value = el('txtEndTime').value = gCurDate.toDateString();
     
    
     jQuery("input[name='chkState'][value='-1']").click(function () {
        var checked = this.checked;
        jQuery("input[name='chkState'][value!='-1']").each(function () { this.checked = checked; });
     });
     jQuery("input[name='chkState'][value!='-1']").click(function () {
        jQuery("input[name='chkState'][value='-1']").attr("checked", false);
     });*/
	
     jetsennet.ui.DropDownList.initOptions("txtSystem", true);
	 jetsennet.ui.DropDownList.initOptions("txt_SERVICE", true);
	 jetsennet.ui.DropDownList.initOptions("txt_COLLECSYSTEM", true);
	// gTaskCrud.load();
	 loadSystemList();
	 searchCollocTask(jetsennet.queryString("id"));
	 
//	 jetsennet.ui.DropDownList.initOptions("txt_SERVICETEMPL", true);
	 //初始化身份认证、口令下载、摆渡机摆渡 起始时间
	 jQuery("#txtStartIdentiTime").pickDate(true);
	 jQuery("#txtEndIdentiTime").pickDate(true);
	 jQuery("#txtStartPwdTime").pickDate(true);
	 jQuery("#txtEndPwdTime").pickDate(true);
	 jQuery("#txtStartFerryTime").pickDate(true);
	 jQuery("#txtEndFerryTime").pickDate(true);
	/* $('#txtStartTime, #txtEndTime').daterangepicker({
	        startDate : moment().startOf('day'),
	        singleDatePicker : true,
	        format : 'YYYY-MM-DD'
	    });*/
	 
	//加载数据字典所有的项
//		loadCWWord();
	//分类描述项目下拉
/*	jetsennet.ui.DropDownList.initOptions("lableNamesType1", true);
	jetsennet.ui.DropDownList.initOptions("lableNamesType2", true);
	jetsennet.ui.DropDownList.initOptions("lableNamesType3", true);
	jetsennet.ui.DropDownList.initOptions("lableNamesType4", true);
	jetsennet.ui.DropDownList.initOptions("lableNamesType5", true);
	jetsennet.ui.DropDownList.initOptions("lableSelectState", true);*/
	 el(ruleDivId).style.display = "none";
};

var gTaskColumns = [{ fieldName: "TASK_ID", width: 30, align: "center", isCheck: 1, checkName: "chkTask"},
                    { fieldName: "TASK_NAME", sortField: "TASK_NAME", width:"20%", align: "center", name: "任务名称"},
                    { fieldName: "TASK_STATE", sortField: "TASK_STATE", width:'5%', align: "center", name: "任务状态",format: function(val,vals){
                    	var stateName;
                    	switch(parseInt(val,10)){
                    	  case 100:
                    		  stateName="未运行";
                    		  break;
                    	  case 11:
                    		  stateName="运行中";
                    		  break;
                          default:
                        	  stateName="未知-"+val;
                              break;
                    	}
                    	return stateName;
                    }},
                    { fieldName: "SERVICE_URL", sortField: "SERVICE_URL", width:'15%', align: "center", name: "服务地址"},
                    { fieldName: "SYS_NAME", sortField: "SYS_NAME", width:'20%', align: "center", name: "采集系统"},
                    { fieldName: "CREATE_TIME", sortField: "t.CREATE_TIME", width:"12%", align: "center", name: "创建时间"},
                    { fieldName: "TASK_ID", width:'5%', align: "center", name: "返回总量",format: function(val,vals){
                    	var conditions = [];
                    		conditions.push(["a.TASK_ID", val, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String]);
                    	var sResult = IPSDAO.query("commonXmlQuery", "STAT_ID", "IPS_GATHTERSTAT", "a", null,conditions, "SUM(a.AMOUNT) AS COUNT");
                    	var objs = jetsennet.xml.toObject(sResult.resultVal, "Record");
                    	if(objs){
                    		return Number(objs[0].COUNT).toFixed(2);
                    	}else{
                    		return "无";
                    	}
                    	
                    }},
                    { fieldName: "TASK_DESC", sortField: "TASK_DESC", width:'11%', align: "center", name: "任务描述"},
                    { fieldName: "UPDATE_TIME", sortField: "UPDATE_TIME", width:'12%', align: "center", name: "修改时间"},
//                    { fieldName: "TASK_ID", enableHideColumns: false},
                    { fieldName: "TASK_ID", width: 45, align: "center", name: "编辑", format: function(val,vals){
                         return jetsennet.Crud.getEditCell("gTaskCrud.edit('" + val + "')");
                     }},
                    { fieldName: "TASK_ID", width:45, align: "center", name: "删除", format: function(val,vals){
                        return '<span style="cursor:pointer;" onclick="gTaskCrud.remove('+"'"+ val + "'"+')"><img src="images/cel_del.png"></img></span>';
                      }}                    
                    ];

var gTaskCrud = $.extend(new jetsennet.Crud("divTaskList", gTaskColumns,"divTaskPage", "ORDER BY t.CREATE_TIME DESC"), {
    dao : IPSDAO,
    tableName : "IPS_TASK",
    keyId:"TASK_ID",
    cfgId :"divTask",
    resultFields : "t.*,p.SERVICE_URL,a.SYS_NAME",
    joinTables: [ 
                 [ "DMA_WEBSERVICE", "p", "t.PROCTEMPLATE_ID=p.SERVICE_ID", jetsennet.TableJoinType.Left ],
                 [ "DMA_APPSYSTEM", "a", "a.SYS_ID=p.SYS_ID", jetsennet.TableJoinType.Left ]
    			],//Edit by JiJie.LianG 2015-04-30
    conditions:[
                ["t.TASK_TYPE", "20",jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric],
                ["t.CREATE_TIME", $('#create_time').data('daterangepicker').startDate.format('YYYY-MM-DD'), jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Than, jetsennet.SqlParamType.DateTime],
                ["t.CREATE_TIME", $('#create_time').data('daterangepicker').endDate.format('YYYY-MM-DD') + " 23:59:59", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Less, jetsennet.SqlParamType.DateTime]
                ],
    name : "任务",
    checkId : "chkTask",
    className : "jetsennet.ips.schema.IpsTask",
    addDlgOptions : {size : {width : 520, height : 0}},
    editDlgOptions : {size : {width : 520, height : 0}},
    onAddInit: function(){
    	//服务下拉
    	initSysList("txt_COLLECSYSTEM",'-选择系统列表-',"txt_SERVICE");
    },
    onAddValid : function() {
    	if(jetsennet.ui.DropDownList["txt_SERVICE"].selectedValue == "-1"){
    		jetsennet.warn("请选择采集系统对应的服务！");
    		return false;
    	}
    	return validateTaskName(el("txt_TASK_NAME").value,jetsennet.ui.DropDownList["txt_COLLECSYSTEM"].selectedValue);
    },
    onAddGet : function(){
    	return {
            TASK_NAME: el("txt_TASK_NAME").value,
            TASK_DESC: el("txt_TASK_DESC").value,
            TASK_PARAM : el("txt_ZDID").value,
            CLASS_ID: "0",
            CREATE_USER: jetsennet.application.userInfo.UserName,
            CREATE_USERID: jetsennet.application.userInfo.UserId,
            TASK_TYPE: "20",
            TASK_STATE: "100",
            PROCTEMPLATE_ID: jetsennet.ui.DropDownList["txt_SERVICE"].selectedValue,
            STR_2: jetsennet.ui.DropDownList["txt_COLLECSYSTEM"].selectedValue
        };
    },
    onAddSuccess:function(item){
//    	jetsennet.message("新建成功！");
    },
    onEditInit:function(){
    	//服务下拉
//    	initServiceList("txt_SERVICE",'-选择服务列表-');
    	initSysList("txt_COLLECSYSTEM",'-选择系统列表-',"txt_SERVICE");
    },
    onEditSet : function(obj) {
    	//赋值
    	el("txt_TASK_NAME").value=valueOf(obj,"TASK_NAME","");
    	el("txt_TASK_DESC").value=valueOf(obj,"TASK_DESC","");
    	el("txt_ZDID").value = valueOf(obj,"TASK_PARAM","");
    	var sysId = valueOf(obj,"STR_2","");
    	var serviceId = valueOf(obj,"PROCTEMPLATE_ID");
    /*	var conditions = [];
    	conditions.push(["t.SERVICE_ID", valueOf(obj,"PROCTEMPLATE_ID",""), jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String]);
    	var sResult = IPSDAO.query("commonXmlQuery", "SERVICE_ID", "DMA_WEBSERVICE", "t", null,conditions, "t.SYS_ID,t.SERVICE_NAME");
    	var objs = jetsennet.xml.toObject(sResult.resultVal, "Record");
    	if(objs){*/
    		//定位 模版下拉选项 
        	var sysObjs = jetsennet.ui.DropDownList["txt_COLLECSYSTEM"].dataItems;
    		for(var i=0; i< sysObjs.length; i++){
    			if(sysObjs[i].value == sysId){
    				jetsennet.ui.DropDownList["txt_COLLECSYSTEM"].selectedValue=sysObjs[i].value;
    				el("txt_COLLECSYSTEM").value = sysObjs[i].text;
    			}
    		}
    		
    		initServiceList("txt_SERVICE",sysId);
    		
    		var serviceName = jetsennet.ui.DropDownList["txt_SERVICE"].dataItems;
    		for(var i=0; i< serviceName.length; i++){
    			if(serviceName[i].value == serviceId){
    				jetsennet.ui.DropDownList["txt_SERVICE"].selectedValue=serviceName[i].value;
    				el("txt_SERVICE").value = serviceName[i].text;
    			}
    		}
//    	}
    	
    },
    onEditValid : function(id,obj) {
    	if(jetsennet.ui.DropDownList["txt_SERVICE"].selectedValue == "-1"){
    		jetsennet.warn("请选择采集系统对应的服务！");
    		return false;
    	}
    	return validateTaskName(el("txt_TASK_NAME").value,jetsennet.ui.DropDownList["txt_COLLECSYSTEM"].selectedValue,id);
    },
    onEditGet : function(id) {
    	return {
    		TASK_ID : id,
            TASK_NAME: el("txt_TASK_NAME").value,
            TASK_DESC: el("txt_TASK_DESC").value,
            TASK_PARAM : el("txt_ZDID").value,
            PROCTEMPLATE_ID: jetsennet.ui.DropDownList["txt_SERVICE"].selectedValue,
            STR_2: jetsennet.ui.DropDownList["txt_COLLECSYSTEM"].selectedValue
        };
    },
    onEditSuccess : function(){
    },
    onRemoveSuccess : function()
    {
//    	jetsennet.message("删除成功！");
    }
});

/**
 * 规则列表
 */
var gRuleColumns = [{ fieldName: "ID", width: 30, align: "center", isCheck: 1, checkName: "chkRule"},
                    { fieldName: "RULE_NAME", sortField: "RULE_NAME", width:300, align: "center", name: "规则名称"},
                    { fieldName: "PARAM", sortField: "PARAM", width:"100%", align: "center", name: "规则"},
                    { fieldName: "CREATE_TIME", sortField: "TIME", width:160, align: "center", name: "创建时间"},
                    { fieldName: "ID", width: 45, align: "center", name: "编辑", format: function(val,vals){
                        return jetsennet.Crud.getEditCell("editTaskRule('" + val + "')");//'" + val + "'
//                    	return '<span class="glyphicon glyphicon-edit" style="color: green;cursor:pointer;" onclick=' + editTaskRule(val) + '></span>' ;
                    }},
                   { fieldName: "ID", width:45, align: "center", name: "删除", format: function(val,vals){
                       return '<span style="cursor:pointer;" onclick="gRuleCrud.remove('+"'"+ val + "'"+')"><img src="images/cel_del.png"></img></span>';
                     }}
                   /* { fieldName: "TASK_ID", width: 45, align: "center", name: "详情", format: function(val,vals){
                         return jetsennet.Crud.getEditCell("gRuleCrud.edit('" + val + "')");
                     }}*/
                    ];

var gRuleCrud = $.extend(new jetsennet.Crud("divRuleList", gRuleColumns,"divRulePage", "ORDER BY t.CREATE_TIME DESC"), {
    dao : IPSDAO,
    tableName : "IPS_TASKRULEPARAM",
    keyId:"ID",
//    cfgId :"divTask",
    resultFields : "t.*",//taskId
    conditions:[["t.TASK_ID", objTask.taskId,jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal]],
    name : "任务",
    checkId : "chkRule",
    className : "jetsennet.ips.schema.IpsTaskruleparam",
    addDlgOptions : {size : {width : 760, height : 0}},
    editDlgOptions : {size : {width : 760, height : 0}},
    onAddInit: function(){
    	if(divId == "divIPTempl1"){
    		el("ipOne2").value = "255";
    		el("ipTwo2").value = "255";
    		el("ipThree2").value = "255";
    		el("ipFour2").value = "255";
    		el("ipOne4").value = "255";
    		el("ipTwo4").value = "255";
    		el("ipThree4").value = "255";
    		el("ipFour4").value = "255";
    	}
    	if(divId == "divIPTempl2"){
    		el("ipOne11").value = "255";
    		el("ipTwo11").value = "255";
    		el("ipThree11").value = "255";
    		el("ipFour11").value = "255";
    		el("ipOne13").value = "255";
    		el("ipTwo13").value = "255";
    		el("ipThree13").value = "255";
    		el("ipFour13").value = "255";
    	}
    	if(divId == "divIdentiTempl"){
    		el("txt_TASK_IDENTI_NAME").value = objTask.taskName;
    	}
    	if(divId == "divPasswordTempl"){
    		el("txt_TASK_PWD_NAME").value = objTask.taskName;
    	}
    },
    onAddValid : function() {
    	if(divId == "divIPTempl1"){
    		//,sysId,taskId,taskName,createUser,creatTime,serviceId
			return addTemplate1(divId);
		}else if(divId == "divIPTempl2"){
			//,sysId,taskId,taskName,createUser,creatTime,serviceId
			return addTemplate2(divId);
		}else if(divId == "divEmailTempl"){
			//,sysId,taskId,taskName,createUser,creatTime,serviceId
			return addEmailTemplate(divId);
		}else if(divId == "divIdentiTempl"){
			//,sysId,taskId,taskName,createUser,creatTime,serviceId
			return addIdentiTemplate(divId);
		}else if(divId == "divPasswordTempl"){
			//,sysId,taskId,taskName,createUser,creatTime,serviceId
			return addPwdTemplate(divId);
		}else if(divId == "divFerryTempl"){
			//,sysId,taskId,taskName,createUser,creatTime,serviceId
			return addFerryTemplate(divId);
		}
    },
    onAddGet : function(){
    	if(divId == "divIPTempl1" || divId == "divIPTempl2" || divId == "divEmailTempl"){
    		return {
        		RULE_NAME : ruleName,
        		PARAM : templXml,
        		TASK_ID : objTask.taskId
        		};
    	}else{
    		return {
//        		RULE_NAME : objTask.serviceName,
        		PARAM : templXml,
        		TASK_ID : objTask.taskId
        		};
        };
    },
    directAdd : function(obj) {
        var params = new HashMap();
        params.put("className", this.className);
        params.put("saveXml", jetsennet.xml.serialize(obj, this.tableName));
        var result = this.dao.execute(this.insertMethodName, params);
        if (result && result.errorCode == 0) {
            if (this.onAddSuccess) {
                this.onAddSuccess(obj);
            }
            this.load();
            return true;
        }
    },
    onAddSuccess:function(item){
    },
    onEditInit:function(){
    },
    onEditSet : function(obj) {
    	var param = jetsennet.xml.deserialize(obj.PARAM);
    	ruleName = obj.RULE_NAME;
//    	var param = params.mtsTaskNew.taskParameters.taskParameter;
    	var div = param.DIVID;
    		if(div == "divIPTempl1"){
    			editInitTemplate1(param,ruleName);
    		}else if(div == "divIPTempl2"){
    			editInitTemplate2(param,ruleName);
    		}else if(div == "divEmailTempl"){
    			editInitEmailTempl(param,ruleName);
    		}else if(div == "divIdentiTempl"){
    			el("txt_TASK_IDENTI_NAME").value = objTask.taskName;
    		}else if(div == "divPasswordTempl"){
    			el("txt_TASK_PWD_NAME").value = objTask.taskName;
    		}else if(div == "divFerryTempl"){
    			editInitFerryTempl(param);
    		}
    },
    onEditValid : function(id,obj) {
    	if(divId == "divIPTempl1"){
    		//,sysId,taskId,taskName,createUser,creatTime,serviceId
			return addTemplate1(divId);
		}else if(divId == "divIPTempl2"){
			//,sysId,taskId,taskName,createUser,creatTime,serviceId
			return addTemplate2(divId);
		}else if(divId == "divEmailTempl"){
			//,sysId,taskId,taskName,createUser,creatTime,serviceId
			return addEmailTemplate(divId);
		}else if(divId == "divIdentiTempl"){
			//,sysId,taskId,taskName,createUser,creatTime,serviceId
			return addIdentiTemplate(divId);
		}else if(divId == "divPasswordTempl"){
			//,sysId,taskId,taskName,createUser,creatTime,serviceId
			return addPwdTemplate(divId);
		}else if(divId == "divFerryTempl"){
			//,sysId,taskId,taskName,createUser,creatTime,serviceId
			return addFerryTemplate(divId);
		}
    },
    onEditGet : function(id) {
    	if(divId == "divIPTempl1" || divId == "divIPTempl2" || divId == "divEmailTempl"){
    		return {
        		ID : id,
        		RULE_NAME : ruleName,
        		PARAM : templXml,
        		TASK_ID : objTask.taskId
            };
		}else{
			return {
        		ID : id,
//        		RULE_NAME : objTask.taskName,
        		PARAM : templXml,
        		TASK_ID : objTask.taskId
            };
		}
    },
    onEditSuccess : function(){
    },
    onRemoveSuccess : function()
    {
    }
});

/**
 * 加载任务以及任务对应的服务
 * @returns
 */
function loadTaskAndService(){
	var conditions = [];
	conditions.push(["T.SERVICE_ID", objTask.serviceId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String]);
	conditions.push(["P.TASK_ID", objTask.taskId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String]);
	
	var jointables = [["IPS_TASK", "P", "T.SERVICE_ID=P.PROCTEMPLATE_ID", jetsennet.TableJoinType.Inner]];
	var sResult = IPSDAO.query("commonXmlQuery", "SERVICE_ID", "DMA_WEBSERVICE", "T", jointables,conditions, "T.*,P.TASK_ID,P.TASK_NAME,P.CREATE_USER USR,P.CREATE_TIME TIME");
    
	var objs = jetsennet.xml.toObject(sResult.resultVal, "Record");
	//给任务对象sysId赋值
    objTask.sysId = objs[0].SYS_ID;
    objTask.serviceType = objs[0].INT_1;
    objTask.serviceName = objs[0].SERVICE_NAME;
	return objs;
    
}

/**
 * 规则列表双击事件
 */
gRuleCrud.grid.ondoubleclick = function(item){
	gRuleCrud.cfgId = divId;
	editTaskRule(item.ID);
};

/**
 * 添加任务规则
 */
function addTaskRule(){
	
	var objs = loadTaskAndService();
	
    var serviceType = objs[0].INT_1;
    
    if(serviceType == "80801"){
    	 chkRadio(1);
		 clearLE(1);
		 divId = "divIPTempl1";
	 }else if(serviceType == "80802"){
		 chkRadio(2);
		 clearLE(2);
		 divId = "divIPTempl2";
	 }else if(serviceType == "803"){
		 divId = "divIdentiTempl";
	 }else if(serviceType == "802"){
		 divId = "divPasswordTempl";
	 }else if(serviceType == "801"){
		 divId = "divEmailTempl";
	 }else if(serviceType == "809"){
		 divId = "divFerryTempl";
	 };
	 /*if(divId == ""){
		 return;
	 }*/
	 gRuleCrud.cfgId = divId;
	 gRuleCrud.add();
}

/**
 * 修改任务规则
 */
function editTaskRule(ruleId){
	var objs = loadTaskAndService();
	var type = objs[0].INT_1;
		 if(type == "80801"){
			 divId = "divIPTempl1";
		 }else if(type == "80802"){
			 divId = "divIPTempl2";
		 }else if(type == "803"){
			 divId = "divIdentiTempl";
		 }else if(type == "802"){
			 divId = "divPasswordTempl";
		 }else if(type == "801"){
			 divId = "divEmailTempl";
		 }else if(type == "809"){
			 divId = "divFerryTempl";
		 };
		 gRuleCrud.cfgId = divId;
	     gRuleCrud.edit(ruleId);
}


/**
 * 启动任务
 */
function activeTaskProcess(){
	
	if(typeof(objTask.taskId) == "undefined"){
		jetsennet.error("请选择要启动的任务！");
		return;
	}
	
	var jointables = [["DMA_WEBSERVICE", "a", "a.SERVICE_ID=t.PROCTEMPLATE_ID", jetsennet.TableJoinType.Inner]];
	var sResult = IPSDAO.query("commonXmlQuery", "TASK_ID", "IPS_TASK", "t", jointables, [["t.TASK_ID", objTask.taskId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String]], "t.TASK_ID,t.TASK_NAME,t.TASK_PARAM,a.SERVICE_URL,t.DS_ID,a.SYS_ID,a.SERVICE_ID,t.CREATE_USER,t.CREATE_TIME");
    var objs = jetsennet.xml.toObject(sResult.resultVal, "Record");
    if(objs.length >0){
	    var obj ={
				USER_NAME : window.location.host,
				REQUEST_TIME : new Date().toDateTimeString(),
				REQUEST_XML : "",
				ACTION_NAME: objs[0].SERVICE_URL
			};
	    
	    var mtsTaskNew = "<mts version='2.1'><mtsHeader><systemId>"+objs[0].SYS_ID+"</systemId><serviceId>"+objs[0].SERVICE_ID+"</serviceId></mtsHeader><mtsTaskNew><taskId>"+objs[0].TASK_ID+"</taskId><taskName>"+objs[0].TASK_NAME+"</taskName><taskLevel/>"
		+"<createUser>"+objs[0].CREATE_USER+"</createUser><createTime>"+objs[0].CREATE_TIME+"</createTime><taskStartTime/><taskEndTime/><taskType>1</taskType><taskSubType/><zdId>"+objs[0].TASK_PARAM+"</zdId><taskParameters>";
	    
	    
	    var sResult = IPSDAO.query("commonXmlQuery", "ID", "IPS_TASKRULEPARAM", "t", null, [["t.TASK_ID", objs[0].TASK_ID, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String]], "t.PARAM,t.RULE_NAME");
	    var rules = jetsennet.xml.toObject(sResult.resultVal, "Record");
	    if(rules.length >0){
	    	var temp1 = [];
			temp1.push(mtsTaskNew);
		
			for(var i = 0; i<rules.length; i++){
				temp1.push(rules[i].PARAM);
			}
			temp1.push("</taskParameters></mtsTaskNew></mts>");
			obj.REQUEST_XML = temp1.join("");
	    }
	    
		var params = new HashMap();
	    params.put("saveXml", jetsennet.xml.serialize(obj, "DMA_WEBINVOKE"));
	    var result = IPSDAO.execute("sendTask", params);
	    if (result && result.errorCode == 0) {
//	    	if(result.resultVal != "-1"){
	    	var taskObj = {
	    			TASK_ID : objTask.taskId,
	    			TASK_STATE : 11
	    	};
	    	var param = new HashMap();
	            param.put("className", "jetsennet.ips.schema.IpsTask");
	            param.put("updateXml", jetsennet.xml.serialize(taskObj, "IPS_TASK"));
	            param.put("isFilterNull", true);
            var result = IPSDAO.execute("commonObjUpdateByPk", param);
            if (result && result.errorCode == 0) {
            	//gTaskCrud.load();
            	searchCollocTask();
            }
	            
	    	 jetsennet.message("通信成功！");
	    	 //判断数据源ID是否为空，null说明任务需要生成数据源
	    	 /*if(!objs[0].DS_ID){
	    		 jetsennet.confirm("确定生成数据源吗?", function () {
	    			 //生成数据源
	        		 gDataSourceCrud.add();
	        		 //根据数据源名称，找到数据源ID，绑定任务。
	        		var sResult = IPSDAO.query("commonXmlQuery", "DS_ID", "IPS_DATASOURCE", "t", null, [["t.DS_NAME", el("txt_DataSourceName").value, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String]], "t.DS_ID");
	     	        var objs = jetsennet.xml.toObject(sResult.resultVal, "Record");
	     	        if(objs){
	     	        	var object = {
	     	        			TASK_ID : objTask.taskId,
	     	        			DS_ID : objs[0].DS_ID
	     	        	};
	     	            var params = new HashMap();
	     	            params.put("className", "jetsennet.ips.schema.IpsTask");
	     	            params.put("updateXml", jetsennet.xml.serialize(object, "IPS_TASK"));
	     	            params.put("isFilterNull", true);
	     	            var result = IPSDAO.execute("commonObjUpdateByPk", params);
	     	            if (result && result.errorCode == 0) {
	     	                if (this.onEditSuccess) {
	     	                    this.onEditSuccess(obj);
	     	                }
	     	                this.load();
	     	            }
	     	        }
	        		 return true;
	        	 });
	    	 }*/
//		    }else{
//		    	jetsennet.warn("启动失败，对方程序未启动！");
//		    }
	    }
    }
}

/**
 * 停止任务
 */
function stopTask(){
	var taskObj = {
			TASK_ID : objTask.taskId,
			TASK_STATE : 100
	};
	var param = new HashMap();
        param.put("className", "jetsennet.ips.schema.IpsTask");
        param.put("updateXml", jetsennet.xml.serialize(taskObj, "IPS_TASK"));
        param.put("isFilterNull", true);
    var result = IPSDAO.execute("commonObjUpdateByPk", param);
    if (result && result.errorCode == 0) {
    	//gTaskCrud.load();
    	searchCollocTask();
    }
        
	 jetsennet.message("操作成功，终止任务！");
	
}
/**
 * 初始化采集系统列表
 */
function initSysList(divId,text,divServiceId)
{
    var conditions = [];
    conditions.push(["w.SYS_TYPE", "200", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String]);
	var sResult = IPSDAO.query("commonXmlQuery", "SYS_ID", "DMA_APPSYSTEM", "w", null, conditions, "w.SYS_ID,w.SYS_NAME");
	var objs = jetsennet.xml.toObject(sResult.resultVal, "Record");
    jetsennet.ui.DropDownList[divId].clear();
    jetsennet.ui.DropDownList[divId].appendItem({ text: text, value: -1 });
    if (objs && objs.length > 0) {
        for (var i = 0; i < objs.length; i++) {
        	var sysName = objs[i].SYS_NAME;
            jetsennet.ui.DropDownList[divId].appendItem({ text: sysName, value: objs[i].SYS_ID });
        }
        jetsennet.ui.DropDownList[divId].setSelectedIndex(0);
    }
    
    jetsennet.ui.DropDownList[divId].onchanged= function (item){
    	var val = item.value;
    	if(val != "-1"){
    		initServiceList(divServiceId,val);
        }else{
        	jetsennet.ui.DropDownList[divServiceId].clear();
        	el(divServiceId).value="";
        	jetsennet.ui.DropDownList[divServiceId].appendItem({ text: "请先选择系统", value: -1 });
        	jetsennet.ui.DropDownList[divServiceId].setSelectedIndex(0);
        }
    }
    
}

/**
 * 获取服务列表
 * @param divServiceId
 * @param val
 */
function initServiceList(divServiceId,val){
	var conditions = [];
//    var jointables = [["DMA_APPSYSTEM", "a", "a.SYS_ID=w.SYS_ID", jetsennet.TableJoinType.Inner]];
//    conditions.push(["a.SYS_TYPE", "200", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String]);
    conditions.push(["w.SYS_ID", val, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String]);
	var sResult = IPSDAO.query("commonXmlQuery", "SERVICE_ID", "DMA_WEBSERVICE", "w", null, conditions, "w.SERVICE_ID,w.INT_1,w.SERVICE_NAME");
	var objs = jetsennet.xml.toObject(sResult.resultVal, "Record");
    jetsennet.ui.DropDownList[divServiceId].clear();
//    jetsennet.ui.DropDownList[divServiceId].appendItem({ text: text, value: -1 });
    if (objs && objs.length > 0) {
        for (var i = 0; i < objs.length; i++) {
        	var serviceName = objs[i].SERVICE_NAME;
            jetsennet.ui.DropDownList[divServiceId].appendItem({ text: serviceName, value: objs[i].SERVICE_ID });
        }
        jetsennet.ui.DropDownList[divServiceId].setSelectedIndex(0);
    }    	
}

/**
 * 任务列表选中行事件
 */
gTaskCrud.grid.onrowclick = function(item)
{
	/*//给任务对象赋值
	objTask.taskId = item.TASK_ID;
	objTask.taskName = item.TASK_NAME;
	objTask.createUser = item.CREATE_USER;
	objTask.creatTime = item.CREATE_TIME;
	objTask.serviceId = item.PROCTEMPLATE_ID;
	el(ruleDivId).style.display = "";
	//加载任务对应规则列表
	var conditions = [["t.TASK_ID", objTask.taskId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String]];
	gRuleCrud.search(conditions,null);*/
	onRowsClick(item);
};

/**
 * 暂时停用
 * 加载任务对应的服务列表
 * @param serviceId
 */
function loadServiceList(serviceId){
	if(typeof(serviceId) == "undefined"){
		loadServiceList(serviceID);
		return;
	}
	serviceID = serviceId;
	el('divServiceList').innerHTML = "";
    var sqlCollection = new jetsennet.SqlConditionCollection();
    sqlCollection.add(jetsennet.SqlCondition.create("T.SERVICE_ID", serviceId , jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal));
    sqlCollection.add(jetsennet.SqlCondition.create("P.TASK_ID", taskId , jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal));
    var gSqlQuery = new jetsennet.SqlQuery();
    var queryTable = jQuery.extend(new jetsennet.QueryTable(), { TableName: "DMA_WEBSERVICE", AliasName: "T" });
    queryTable.addJoinTable(jetsennet.createJoinTable("IPS_TASK", "P", "T.SERVICE_ID=P.PROCTEMPLATE_ID", jetsennet.TableJoinType.Inner));
    jQuery.extend(gSqlQuery, { IsPageResult: 1, PageInfo : pServiceInfo ,OrderString: pServiceInfo.orderBy,
        ResultFields: "T.*,P.TASK_ID,P.TASK_NAME,P.CREATE_USER USR,P.CREATE_TIME TIME",
        QueryTable: queryTable, Conditions: sqlCollection
    });
	
	var param = new HashMap();
    param.put("queryXml", gSqlQuery.toXml());
	param.put("startPageNum",pServiceInfo.currentPage-1);
    param.put("pageSize",pServiceInfo.pageSize);
    var sResult = IPSDAO.execute("commonQueryForPage", param);
    var xmlDoc = new jetsennet.XmlDoc();
    xmlDoc.loadXML(sResult.resultVal);
    var count = xmlDoc.documentElement.getAttribute("TotalCount");
    el('divServiceList').innerHTML = jetsennet.xml.transform("xslt/colloctoservice.xsl",xmlDoc);
    pServiceGrid.bind(el("divServiceList"), el("tabTask"));
    pServiceInfo.setRowCount(count);
}

/**
 * 暂时停用
 * 新增服务参数配置模板弹出窗
 * @param taskId
 */
function addConfigTemplate(val,sysId,taskId,taskName,createUser,creatTime,serviceId){
	
	var divId = "";
	 if(val == "80801"){
		 chkRadio(1);
		 clearLE(1);
		 divId = "divIPTempl1";
	 }else if(val == "80802"){
		 chkRadio(2);
		 clearLE(2);
		 divId = "divIPTempl2";
	 }else if(val == "803"){
		 divId = "divIdentiTempl";
	 }else if(val == "802"){
		 divId = "divPasswordTempl";
	 }else if(val == "801"){
		 divId = "divEmailTempl";
	 }else if(val == "809"){
		 divId = "divFerryTempl";
	 };
	 if(divId == ""){
		 return;
	 }
	
	var areaElements = jetsennet.form.getElements(divId);
    jetsennet.resetValue(areaElements);
    jetsennet.clearValidateState(areaElements);
    
    if(val == "803"){
    	el("txt_TASK_IDENTI_NAME").value = taskName;
    	addIdentiTemplate(divId,sysId,taskId,taskName,createUser,creatTime,serviceId);
    }
    if(val == "802"){
    	el("txt_TASK_PWD_NAME").value = taskName;
    	addPwdTemplate(divId,sysId,taskId,taskName,createUser,creatTime,serviceId);
    }
    
	/**
	 * 编辑模板时 IP数据下载 默认选中第一个 如果是第二个模板会优先显示第二个模板
	 */
//    tabpane.select(0);
    /**
     * 1.是为了清空IP数据下载对应的模板(若果是模板1会清空模板1,如果是模板2会清空模板2)
     * 2.当我切换IP数据下载模板时通过tp能够定位当前选的是哪个模板。
     */
//    tp = "0";
    /*//初始化固定特征、浮动特征、字节数的隐藏
    showInput1(true);
    showInput2(true);
    el('txt_BYTE').disabled=true;
    el('txt_BYTE10').disabled=true;*/
    
    var sResult = IPSDAO.query("commonXmlQuery", "TASK_ID", "IPS_TASK", null, null, [["TASK_ID", taskId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String]], "TASK_PARAM");
    var objs = jetsennet.xml.toObject(sResult.resultVal, "Record")[0].TASK_PARAM;
    if(objs != ""){
    	var params = jetsennet.xml.deserialize(objs);
    	var param = params.mtsTaskNew.taskParameter;
    	var div = param.DIVID;
    		if(div == "divIPTempl1"){
    			editInitTemplate1(param);
    		}else if(divId == "divIPTempl2"){
    			editInitTemplate2(param);
    		}else if(divId == "divEmailTempl"){
    			editInitEmailTempl(param);
    		}else if(divId == "divIdentiTempl"){
    			el("txt_TASK_IDENTI_NAME").value = params.mtsTaskNew.taskName;
    		}else if(divId == "divPasswordTempl"){
    			el("txt_TASK_PWD_NAME").value = params.mtsTaskNew.taskName;
    		}else if(divId == "divFerryTempl"){
    			editInitFerryTempl(param);
    		}
    }
    
    dialog = new jetsennet.ui.Window("new-service-win");  
	jQuery.extend(dialog, { maximizeBox: false, minimizeBox: false, windowStyle: 0,
		submitBox: true, cancelBox: true, title: "参数配置" }); 
	dialog.onsubmit =function(){
		
		if(divId == "divIPTempl1"){
			return addTemplate1(divId,sysId,taskId,taskName,createUser,creatTime,serviceId);
		}else if(divId == "divIPTempl2"){
			return addTemplate2(divId,sysId,taskId,taskName,createUser,creatTime,serviceId);
		}else if(divId == "divEmailTempl"){
			return addEmailTemplate(divId,sysId,taskId,taskName,createUser,creatTime,serviceId);
		}else if(divId == "divIdentiTempl"){
			return addIdentiTemplate(divId,sysId,taskId,taskName,createUser,creatTime,serviceId);
		}else if(divId == "divPasswordTempl"){
			return addPwdTemplate(divId,sysId,taskId,taskName,createUser,creatTime,serviceId);
		}else if(divId == "divFerryTempl"){
			return addFerryTemplate(divId,sysId,taskId,taskName,createUser,creatTime,serviceId);
		}
		
	};
	dialog.size = { width: 760, height: 0};//height:750
	dialog.attachButtons = [{text:"清空",clickEvent: function () { 
		clearTemplate(divId);
	}}];
	dialog.controls = [divId];  
	dialog.showDialog();
	
	if(objs == ""){
		//初始化身份认证、口令字下载、摆渡机摆渡默认值
		if(divId == "divIdentiTempl"){
			gLastWeekDate = new Date(gCurDate.getTime() - 6 * 24 * 3600 * 1000);
		    el('txtStartIdentiTime').value = gLastWeekDate.toDateString();
		    el('txtEndIdentiTime').value = gCurDate.toDateString();
	    }else if(divId == "divPasswordTempl"){
	    	gLastWeekDate = new Date(gCurDate.getTime() - 6 * 24 * 3600 * 1000);
		    el('txtStartPwdTime').value = gLastWeekDate.toDateString();
		    el('txtEndPwdTime').value = gCurDate.toDateString();
	    }else if(divId == "divFerryTempl"){
	    	gLastWeekDate = new Date(gCurDate.getTime() - 6 * 24 * 3600 * 1000);
		    el('txtStartFerryTime').value = gLastWeekDate.toDateString();
		    el('txtEndFerryTime').value = gCurDate.toDateString();
	    }
	}
}

/**
 * 新增服务配置模板
 * @param taskId
 * @returns
 * ,sysId,taskId,taskName,createUser,creatTime,serviceId
 */
function addTemplate1(divId){
	/*chkRadio(1);
	clearLE(1);
	chkRadio(2);
	clearLE(2);*/
	//#$%的单选框数组
	var validateArray = [];
	//,["chkState1-5","chkStates1"]
	validateArray.push(["chkState1","chkStates1"],["chkState2","chkStates2"],["chkState3","chkStates3"]);
	//验证固定特征的规则的可能性数组。
	var feature = [];
	feature.push(["txt_FEATURE_1","txt_FEATURE_1_EXTEND"],["txt_FEATURE_1_EXTEND","txt_FEATURE_1"],["txt_FEATURE_2","txt_FEATURE_2_EXTEND"],["txt_FEATURE_2_EXTEND","txt_FEATURE_2"],
			     ["txt_FEATURE_3","txt_FEATURE_3_EXTEND"],["txt_FEATURE_3_EXTEND","txt_FEATURE_3"],["txt_FEATURE_4","txt_FEATURE_4_EXTEND"],["txt_FEATURE_4_EXTEND","txt_FEATURE_4"]);
	var areaElements = jetsennet.form.getElements("divBody1");
    if (!jetsennet.form.validate(areaElements, true) || !validateRadio(validateArray) || !validateIsEmpty("chkState4",feature)) {
        return false;
    }
    var obj = document.getElementsByName("chkState4");
	for(var i=0;i<obj.length;i++){
		if(obj[i].checked){
			if(!((el("txt_FEATURE_1").value && el("txt_FEATURE_1_EXTEND").value) || (el("txt_FEATURE_2").value && el("txt_FEATURE_2_EXTEND").value) ||
			   (el("txt_FEATURE_3").value && el("txt_FEATURE_3_EXTEND").value) || (el("txt_FEATURE_4").value && el("txt_FEATURE_4_EXTEND").value) ||
			   el("txt_FLOAT_FEATURE1").value || el("txt_FLOAT_FEATURE2").value || el("txt_FLOAT_FEATURE3").value || el("txt_FLOAT_FEATURE4").value ||
			   el("txt_FLOAT_FEATURE5").value || el("txt_FLOAT_FEATURE6").value
			)){
				jetsennet.warn("固定特征和浮动特征至少有一项不为空！");
				return false;
			}
		}
	};
	var obj13 = document.getElementsByName("chkState5");
	for(var i=0;i<obj13.length;i++){
		if(obj13[i].checked){
			if(el("txt_BYTE").value == ""){
				el("txt_BYTE").style.border="1px #936 solid";
				return false;
			}else{
				el("txt_BYTE").style.border="1px #CCCCFF solid";
			}
		};
	}
    
	var temp1 = [];
	/*temp1.push("<mts version='2.1'><mtsHeader><SystemID>"+sysId+"</SystemID><ServiceID>"+serviceId+"</ServiceID></mtsHeader><mtsTaskNew><taskID>"+taskId+"</taskID><taskName>"+taskName+"</taskName><taskLevel/>"
		+"<createUser>"+createUser+"</createUser><createTime>"+creatTime+"</createTime><taskStartTime/><taskEndTime/><taskType>1</taskType><taskSubType/>");*/

	temp1.push("<taskParameter><DIVID>"+divId+"</DIVID>");
	
	var obj1 = document.getElementsByName("chkState1");
//	var obj1 = jetsennet.form.getCheckedValues("chkState1");
	temp1.push("<SJSX>");
    if (obj1) {
        for (var i = 0; i < obj1.length; i++) {
            if (obj1[i].checked) {
            	var val = obj1[i].getAttribute("val") ;
//            	var val = obj1[i].value;
            	if(val != ""){
            		temp1.push(val+";");
            	}
            }
        }
    }
    var obj15 = document.getElementsByName("chkState1-5");
    if(obj15[0].checked){
    	var val = obj15[0].getAttribute("val") ;
//    	var val = obj1[i].value;
    	if(val != ""){
    		temp1.push(val);
    	}
    }
    temp1.push("</SJSX>");
    var obj2 = document.getElementsByName("chkState2");
    temp1.push("<CCLX>");
    if (obj2) {
        for (var i = 0; i < obj2.length; i++) {
            if (obj2[i].checked) {
//            	var val = obj2[i].getAttribute("val");
        		temp1.push(obj2[i].getAttribute("val"));
            }
        }
    }
    temp1.push("</CCLX>");
//    temp1.push("<XYH>"+el("txt_PROTOCOL").value+"</XYH><YIP>"+el("ipOne1").value+"."+el("ipTwo1").value+"."+el("ipThree1").value+"."+el("ipFour1").value+"</YIP>");
    temp1.push("<XYH>"+el("txt_PROTOCOL").value+"</XYH><YIP>");
    //验证IP格式
    var aa = ipIsEmpty(["ipOne1","ipTwo1","ipThree1","ipFour1"]);
    if(aa != undefined){
    	temp1.push(aa);
    }else return false;
    
    temp1.push("</YIP>");
    temp1.push("<YPORT>"+el("txt_SRC_PORT").value+"</YPORT>");
    temp1.push("<MIP>");
    
    var mip = ipIsEmpty(["ipOne3","ipTwo3","ipThree3","ipFour3"]);
    if(mip != undefined){
    	temp1.push(mip);
    }else return false;
    
    temp1.push("</MIP>");
    temp1.push("<MPORT>"+el("txt_DEST_PORT").value+"</MPORT>");
//    temp1.push("<YYM>"+el("ipOne2").value+"."+el("ipTwo2").value+"."+el("ipThree2").value+"."+el("ipFour2").value+"</YYM>");
    temp1.push("<YYM>");
    
    var yym = ipIsEmpty(["ipOne2","ipTwo2","ipThree2","ipFour2"]);
    if(mip != undefined){
    	temp1.push(yym);
    }else return false;
    
    temp1.push("</YYM>");
    var obj3 = document.getElementsByName("chkState3");
    temp1.push("<IPPP>");
    if (obj3) {
        for (var i = 0; i < obj3.length; i++) {
            if (obj3[i].checked) {
//            	var val = obj3[i].getAttribute("val");
            	temp1.push(obj3[i].getAttribute("val"));
            }
        }
    }
    temp1.push("</IPPP>");
//    temp1.push("<MYM>"+el("ipOne4").value+"."+el("ipTwo4").value+"."+el("ipThree4").value+"."+el("ipFour4").value+"</MYM>");
    temp1.push("<MYM>");
    
    var mym = ipIsEmpty(["ipOne4","ipTwo4","ipThree4","ipFour4"]);
    if(mym != undefined){
    	temp1.push(mym);
    }else return false;
    
    temp1.push("</MYM>");
    var obj4 = document.getElementsByName("chkState4");
    temp1.push("<PPFS>");
    if (obj4) {
        for (var i = 0; i < obj4.length; i++) {
            if (obj4[i].checked) {
            	var val = obj4[i].getAttribute("val");
//            	var val = obj4[i].value;
            	if(val != ""){
            		temp1.push(val);
            	}
            	
            }
        }
    }
    temp1.push("</PPFS>");
    temp1.push("<GDWZ1>"+el("txt_FEATURE_1").value+"</GDWZ1><GD1>"+el("txt_FEATURE_1_EXTEND").value+"</GD1>");
    temp1.push("<GDWZ2>"+el("txt_FEATURE_2").value+"</GDWZ2><GD2>"+el("txt_FEATURE_2_EXTEND").value+"</GD2>");
    temp1.push("<GDWZ3>"+el("txt_FEATURE_3").value+"</GDWZ3><GD3>"+el("txt_FEATURE_3_EXTEND").value+"</GD3>");
    temp1.push("<GDWZ4>"+el("txt_FEATURE_4").value+"</GDWZ4><GD4>"+el("txt_FEATURE_4_EXTEND").value+"</GD4>");
    temp1.push("<FD1>"+el("txt_FLOAT_FEATURE1").value+"</FD1><FD2>"+el("txt_FLOAT_FEATURE2").value+"</FD2>");
    temp1.push("<FD3>"+el("txt_FLOAT_FEATURE3").value+"</FD3><FD4>"+el("txt_FLOAT_FEATURE4").value+"</FD4>");
    temp1.push("<FD5>"+el("txt_FLOAT_FEATURE5").value+"</FD5><FD6>"+el("txt_FLOAT_FEATURE6").value+"</FD6>");
    var obj5 = document.getElementsByName("chkState5");
    temp1.push("<LENGZ>");
    if (obj5) {
        for (var i = 0; i < obj5.length; i++) {
            if (obj5[i].checked) {
//            	var val = obj5[i].getAttribute("val");
            	temp1.push(obj5[i].getAttribute("val"));
            }
        }
    }
    temp1.push("</LENGZ>");
    temp1.push("<LENZ>"+el("txt_BYTE").value+"</LENZ>");
    temp1.push("<FZM>"+el("txt_DESC_PACKET").value+"</FZM><YXJ>"+el("txt_LEVEL").value+"</YXJ>");
    temp1.push("<FZLJ>"+el("txt_PATH").value+"</FZLJ><SMZQ>"+el("txt_LIFE_TIME").value+"</SMZQ><DESC>"+el("txt_DESC").value+"</DESC></taskParameter>");
    //</mtsTaskNew></mts>
//    return updateTaskParam(temp1.join(""));
    templXml = temp1.join("");
    ruleName = el("txt_RuleName1").value;
    return true;
}

/**
 * 新增服务配置模板
 * @param taskId
 * @returns
 * ,sysId,taskId,taskName,createUser,creatTime,serviceId
 */
function addTemplate2(divId){
	
	/*var areaElements = jetsennet.form.getElements("divIPTempl");
    if (!jetsennet.form.validate(areaElements, true)) {
        return;
    }*/
	//#$%的单选框数组
	var validateArray = [];
	validateArray.push(["chkState10","chkStates10"],["chkState11","chkStates11-1"]);
	//验证固定特征的规则的可能性数组。
	var feature = [];
	feature.push(["txt_FEATURE_10","txt_FEATURE_1_EXTEND10"],["txt_FEATURE_1_EXTEND10","txt_FEATURE_10"],["txt_FEATURE_12","txt_FEATURE_2_EXTEND10"],["txt_FEATURE_2_EXTEND10","txt_FEATURE_12"],
			     ["txt_FEATURE_13","txt_FEATURE_3_EXTEND10"],["txt_FEATURE_3_EXTEND10","txt_FEATURE_13"],["txt_FEATURE_14","txt_FEATURE_4_EXTEND10"],["txt_FEATURE_4_EXTEND10","txt_FEATURE_14"]);
	
	var areaElements = jetsennet.form.getElements("divBody2");
    if (!jetsennet.form.validate(areaElements, true) || !validateRadio(validateArray) || !validateIsEmpty("chkState12",feature)) {
        return;
    }
    var obj = document.getElementsByName("chkState12");
	for(var i=0;i<obj.length;i++){
		if(obj[i].checked){
			if(!((el("txt_FEATURE_10").value && el("txt_FEATURE_1_EXTEND10").value) || (el("txt_FEATURE_12").value && el("txt_FEATURE_2_EXTEND10").value) ||
			   (el("txt_FEATURE_13").value && el("txt_FEATURE_3_EXTEND10").value) || (el("txt_FEATURE_14").value && el("txt_FEATURE_4_EXTEND10").value) ||
			   el("txt_FLOAT__FEATURE_11").value || el("txt_FLOAT__FEATURE_12").value || el("txt_FLOAT__FEATURE_13").value || el("txt_FLOAT__FEATURE_14").value ||
			   el("txt_FLOAT__FEATURE_15").value || el("txt_FLOAT__FEATURE_16").value
			)){    									   
				jetsennet.warn("固定特征和浮动特征至少有一项不为空！");
				return;
			}
		}
	};
	var obj13 = document.getElementsByName("chkState13");
	for(var i=0;i<obj13.length;i++){
		if(obj13[i].checked){
			if(el("txt_BYTE10").value == ""){
				el("txt_BYTE10").style.border="1px #936 solid";
				return;
			}else{
				el("txt_BYTE10").style.border="1px #CCCCFF solid";
			}
		};
	}
	
	var temp2 = [];
/*	temp2.push("<mts version='2.1'><mtsHeader><SystemID>"+sysId+"</SystemID><ServiceID>"+serviceId+"</ServiceID></mtsHeader><mtsTaskNew><taskID>"+taskId+"</taskID><taskName>"+taskName+"</taskName><taskLevel/>"
		+"<createUser>"+createUser+"</createUser><createTime>"+creatTime+"</createTime><taskStartTime/><taskEndTime/><taskType>1</taskType><taskSubType/>");*/
	
	temp2.push("<taskParameter><DIVID>"+divId+"</DIVID>");
	
	var obj10 = document.getElementsByName("chkState10");
//	var obj1 = jetsennet.form.getCheckedValues("chkState1");
    if (obj10) {
    	temp2.push("<SJSX>");
        for (var i = 0; i < obj10.length; i++) {
            if (obj10[i].checked) {
            	if (obj10[i].checked) {
                	var val = obj10[i].getAttribute("val") ;
//                	var val = obj1[i].value;
                	if(val != ""){
    	            	temp2.push(val);
                	}
                }
            }
        }
        temp2.push("</SJSX>");
    }
//    temp2.push("<XYH>"+el("txt_PROTOCOL2").value+"</XYH><YIP>"+el("ipOne10").value+"."+el("ipTwo10").value+"."+el("ipThree10").value+"."+el("ipFour10").value+"</YIP>");
    temp2.push("<XYH>"+el("txt_PROTOCOL2").value+"</XYH><YIP>");
    //验证IP格式
    var yip = ipIsEmpty(["ipOne10","ipTwo10","ipThree10","ipFour10"]);
    if(yip != undefined){
    	temp2.push(yip);
    }else return;
    
    temp2.push("</YIP>");
    temp2.push("<YPORT>"+el("txt_SRC_PORT2").value+"</YPORT>");
//    temp2.push("<MIP>"+el("ipOne12").value+"."+el("ipTwo12").value+"."+el("ipThree12").value+"."+el("ipFour12").value+"</MIP>");
    temp2.push("<MIP>");
    
    var mip = ipIsEmpty(["ipOne12","ipTwo12","ipThree12","ipFour12"]);
    if(mip != undefined){
    	temp2.push(mip);
    }else return;
    
    temp2.push("</MIP>");
    temp2.push("<MPORT>"+el("txt_DEST_PORT2").value+"</MPORT>");
//    temp2.push("<YYM>"+el("ipOne11").value+"."+el("ipTwo11").value+"."+el("ipThree11").value+"."+el("ipFour11").value+"</YYM>");
    temp2.push("<YYM>");
    
    var yym = ipIsEmpty(["ipOne11","ipTwo11","ipThree11","ipFour11"]);
    if(yym != undefined){
    	temp2.push(yym);
    }else return;
    
    temp2.push("</YYM>");
    var obj11 = document.getElementsByName("chkState11");
    temp2.push("<IPPP>");
    if (obj11) {
        for (var i = 0; i < obj11.length; i++) {
            if (obj11[i].checked) {
            	temp2.push(obj11[i].getAttribute("val"));
            }
        }
    }
    temp2.push("</IPPP>");
//    temp2.push("<MYM>"+el("ipOne13").value+"."+el("ipTwo13").value+"."+el("ipThree13").value+"."+el("ipFour13").value+"</MYM>");
    temp2.push("<MYM>");
    
    var mym = ipIsEmpty(["ipOne13","ipTwo13","ipThree13","ipFour13"]);
    if(mym != undefined){
    	temp2.push(mym);
    }else return;
    
    temp2.push("</MYM>");
    var obj12 = document.getElementsByName("chkState12");
    temp2.push("<PPFS>");
    if (obj12) {
        for (var i = 0; i < obj12.length; i++) {
            if (obj12[i].checked) {
            	temp2.push(obj12[i].getAttribute("val"));
            }
        }
    }
    temp2.push("</PPFS>");
    
    temp2.push("<GDWZ1>"+el("txt_FEATURE_10").value+"</GDWZ1><GD1>"+el("txt_FEATURE_1_EXTEND10").value+"</GD1>");
    temp2.push("<GDWZ2>"+el("txt_FEATURE_12").value+"</GDWZ2><GD2>"+el("txt_FEATURE_2_EXTEND10").value+"</GD2>");
    temp2.push("<GDWZ3>"+el("txt_FEATURE_13").value+"</GDWZ3><GD3>"+el("txt_FEATURE_3_EXTEND10").value+"</GD3>");
    temp2.push("<GDWZ4>"+el("txt_FEATURE_14").value+"</GDWZ4><GD4>"+el("txt_FEATURE_4_EXTEND10").value+"</GD4>");
    temp2.push("<FD1>"+el("txt_FLOAT__FEATURE_11").value+"</FD1><FD2>"+el("txt_FLOAT__FEATURE_12").value+"</FD2>");
    temp2.push("<FD3>"+el("txt_FLOAT__FEATURE_13").value+"</FD3><FD4>"+el("txt_FLOAT__FEATURE_14").value+"</FD4>");
    temp2.push("<FD5>"+el("txt_FLOAT__FEATURE_15").value+"</FD5><FD6>"+el("txt_FLOAT__FEATURE_16").value+"</FD6>");
    var obj13 = document.getElementsByName("chkState13");
    temp2.push("<LENGZ>");
    if (obj13) {
        for (var i = 0; i < obj13.length; i++) {
            if (obj13[i].checked) {
            	temp2.push(obj13[i].getAttribute("val"));
            }
        }
    }
    temp2.push("</LENGZ>");
    temp2.push("<LENZ>"+el("txt_BYTE10").value+"</LENZ>");
    temp2.push("<DESC>"+el("txt_DESC_PACKET10").value+"</DESC></taskParameter>");
//    return updateTaskParam(temp2.join(""));
    templXml = temp2.join("");
    ruleName = el("txt_RuleName2").value;
    return true;
}

/**
 * 添加邮件下载配置模板
 */
function addEmailTemplate(divId,sysId,taskId,taskName,createUser,creatTime,serviceId){
	
	var areaElements = jetsennet.form.getElements(divId);
    if (!jetsennet.form.validate(areaElements, true)) {
        return;
    }
	var temp3 = [];
	/*temp3.push("<mts version='2.1'><mtsHeader><SystemID>"+sysId+"</SystemID><ServiceID>"+serviceId+"</ServiceID></mtsHeader><mtsTaskNew><taskID>"+taskId+"</taskID><taskName>"+taskName+"</taskName><taskLevel/>"
			+"<createUser>"+createUser+"</createUser><createTime>"+creatTime+"</createTime><taskStartTime/><taskEndTime/><taskType>1</taskType><taskSubType/><taskParameters>");
*/	//配置模板的唯一标识
	temp3.push("<taskParameter><DIVID>"+divId+"</DIVID>");
	
	temp3.push("<TASK_GROUP>"+el("txt_TASK_GROUP").value+"</TASK_GROUP><TASKN>"+el("txt_TASK_NAME3").value+"</TASKN><FXID>"+el("txt_DIRECTION").value+"</FXID>");
	temp3.push("<GZMC>"+el("txt_RULE_NAME").value+"</GZMC>");
//	temp3.push("<YIP>"+el("ipOne21").value+"."+el("ipTwo21").value+"."+el("ipThree21").value+"."+el("ipFour21").value+"</YIP>");
	temp3.push("<YIP>");
    
    var yip = ipIsEmpty(["ipOne21","ipTwo21","ipThree21","ipFour21"]);
    if(yip != undefined){
    	temp3.push(yip);
    }else return;
    
    temp3.push("</YIP>");
//	temp3.push("<MIP>"+el("ipOne22").value+"."+el("ipTwo22").value+"."+el("ipThree22").value+"."+el("ipFour22").value+"</MIP>");
    temp3.push("<MIP>");
    
    var mip = ipIsEmpty(["ipOne22","ipTwo22","ipThree22","ipFour22"]);
    if(mip != undefined){
    	temp3.push(mip);
    }else return;
    
    temp3.push("</MIP>");
	temp3.push("<YPORT>"+el("txt_SRC_PORT3").value+"</YPORT><MPORT>"+el("txt_DEST_PORT3").value+"</MPORT>");
	temp3.push("<XYH>"+el("txt_PROTOCOL3").value+"</XYH><YXJ>"+el("txt_LEVEL3").value+"</YXJ>");
	temp3.push("<YX>"+el("txt_EMAIL3").value+"</YX><IPPP>"+el("txt_KEYWORD").value+"</IPPP><JZC>"+el("txt_HEX").value+"</JZC>");
	var obj21 = document.getElementsByName("chkState21");
	temp3.push("<GDWZ>");
	    if (obj21) {
            if (obj21[0].checked) {
            	temp3.push( obj21[0].getAttribute("val"));
            }
	    }
	temp3.push("</GDWZ>");
	temp3.push("<GDZ>"+el("txt_LOCATION").value+"</GDZ><FJKZM>"+el("txt_ANNEX_EXT").value+"</FJKZM>"); 
	var obj22 = document.getElementsByName("chkState22");
	temp3.push("<XTXLM>");
    if (obj22) {
    	for (var i = 0; i < obj22.length; i++) {
            if (obj22[i].checked) {
            	temp3.push(obj22[i].getAttribute("val"));
            }
    	}
    }
    temp3.push("</XTXLM>");
    temp3.push("<BZ>"+el("txt_NOTE_INFO").value+"</BZ></taskParameter>");  
//    return updateTaskParam(temp3.join(""));
    templXml = temp3.join("");
    ruleName = el("txt_RULE_NAME").value;
    return true;
}

/**
 * 添加身份认证模板
 * @param divId
 */
function addIdentiTemplate(divId){
	var areaElements = jetsennet.form.getElements(divId);
    if (!jetsennet.form.validate(areaElements, true)) {
        return;
    }
	var templ = [];
/*	templ.push("<mts version='2.1'><mtsHeader><SystemID>"+objTask.sysId+"</SystemID><ServiceID>"+objTask.serviceId+"</ServiceID></mtsHeader><mtsTaskNew><taskID>"+objTask.taskId+"</taskID><taskName>"+objTask.taskName+"</taskName><taskLevel/>"
			+"<createUser>"+objTask.createUser+"</createUser><createTime>"+objTask.creatTime+"</createTime><taskStartTime/><taskEndTime/><taskType>1</taskType><taskSubType/>");
*/
	templ.push("<taskParameter><DIVID>"+divId+"</DIVID></taskParameter>");
//	return updateTaskParam(templ.join(""));
	templXml = templ.join("");
    return true;

}

/**
 * 添加口令字下载模板
 * @param divId
 */
function addPwdTemplate(divId){
	var areaElements = jetsennet.form.getElements(divId);
    if (!jetsennet.form.validate(areaElements, true)) {
        return;
    }
	var templ = [];
	/*templ.push("<mts version='2.1'><mtsHeader><SystemID>"+objTask.sysId+"</SystemID><ServiceID>"+objTask.serviceId+"</ServiceID></mtsHeader><mtsTaskNew><taskID>"+objTask.taskId+"</taskID><taskName>"+objTask.taskName+"</taskName><taskLevel/>"
			+"<createUser>"+objTask.createUser+"</createUser><createTime>"+objTask.creatTime+"</createTime><taskStartTime/><taskEndTime/><taskType>1</taskType><taskSubType/>");
*/
	templ.push("<taskParameter><DIVID>"+divId+"</DIVID></taskParameter>");
//	return updateTaskParam(templ.join(""));
	templXml = templ.join("");
    return true;
}

/**
 * 添加摆渡机摆渡模板
 * @param divId
 */
function addFerryTemplate(divId){
	
	var areaElements = jetsennet.form.getElements(divId);
    if (!jetsennet.form.validate(areaElements, true)) {
        return;
    }
	var templ = [];
	/*templ.push("<mts version='2.1'><mtsHeader><SystemID>"+objTask.sysId+"</SystemID><ServiceID>"+objTask.serviceId+"</ServiceID></mtsHeader><mtsTaskNew><taskID>"+objTask.taskId+"</taskID><taskName>"+objTask.taskName+"</taskName><taskLevel/>"
			+"<createUser>"+objTask.createUser+"</createUser><createTime>"+objTask.creatTime+"</createTime><taskStartTime/><taskEndTime/><taskType>1</taskType><taskSubType/>");
*/
	templ.push("<taskParameter><DIVID>"+divId+"</DIVID><INPUT_PATH>"+el("txt_FERRY_INPUT_PATH").value+"</INPUT_PATH><OUTPUT_PATH>"+el("txt_FERRY_OUTPUT_PATH").value+"</OUTPUT_PATH>");
	templ.push("<DATE_TIME>"+el("txtStartFerryTime").value);
	var endTime = el("txtEndFerryTime").value;
	if(endTime != ""){
		templ.push(","+endTime);	
	}
	templ.push("</DATE_TIME></taskParameter>");
	
//	return updateTaskParam(templ.join(""));
	templXml = templ.join("");
    return true;
}

/**
 * 修改服务配置模板的值
 * @param taskId
 * @param xml
 * @returns {Boolean}
 */
function updateTaskParam(xml){
	 var obj={
	     TASK_ID : objTask.taskId,
	     TASK_PARAM : xml,
	 };
	 var params = new HashMap();
	    params.put("className", "jetsennet.ips.schema.IpsTask");
	    params.put("updateXml", jetsennet.xml.serialize(obj, "IPS_TASK"));
	    params.put("isFilterNull", true);
    var result = IPSDAO.execute("commonObjUpdateByPk", params);
    if (result && result.errorCode == 0) {
//    	loadServiceList();
    	var conditions = [["t.TASK_ID", objTask.taskId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String]];
    	gRuleCrud.search(conditions,null);
    	return true;
    }
    return false;
}

/**
 * 模板1修改前的赋值
 * @param taskParam
 */
function editInitTemplate1(jsonParam,ruleName){
	el("txt_RuleName1").value = ruleName;
//	//xml字符串转为json
//	var jsonParam = jetsennet.xml.deserialize(taskParam);
	//给TP标签赋值
    var obj1 = document.getElementsByName("chkState1");
    var key = jsonParam.SJSX.split(";");
	for (var i = 0; i < obj1.length; i++) {
		if(key[0] == obj1[i].getAttribute("val")){
			obj1[i].checked = true;
			break;
		}               
    }
	 var obj15 = document.getElementsByName("chkState1-5");
	 if(key[1]==obj15[0].getAttribute("val")){
		 obj15[0].checked=true;
	 }
    //标签赋值
    var obj2 = document.getElementsByName("chkState2");
	for (var i = 0; i < obj2.length; i++) {
		if(jsonParam.CCLX == obj2[i].getAttribute("val")){
			obj2[i].checked = true;
			break;
		}               
    }
    el("txt_PROTOCOL").value = jsonParam.XYH;
    var srcIp = jsonParam.YIP;
    if(srcIp != ""){
    	var ip = srcIp.split(".");
    	el("ipOne1").value = ip[0];
    	el("ipTwo1").value = ip[1];
    	el("ipThree1").value = ip[2];
    	el("ipFour1").value = ip[3];
    }
    el("txt_SRC_PORT").value = jsonParam.YPORT;
    var destIp = jsonParam.MIP;
    if(destIp != ""){
    	var dIp = destIp.split("."); 
    	el("ipOne3").value = dIp[0];
		el("ipTwo3").value = dIp[1];
		el("ipThree3").value = dIp[2];
		el("ipFour3").value = dIp[3];
    }
	el("txt_DEST_PORT").value = jsonParam.MPORT;
	var rangeIp1 = jsonParam.YYM;
	if(rangeIp1 != ""){
		var rang = rangeIp1.split(".");
		el("ipOne2").value = rang[0];
		el("ipTwo2").value = rang[1];
		el("ipThree2").value = rang[2];
		el("ipFour2").value = rang[3];
	}
	var state3 = document.getElementsByName("chkState3");
	for (var i = 0; i < state3.length; i++) {
		if(jsonParam.IPPP == state3[i].getAttribute("val")){
			state3[i].checked = true;
			break;
		}               
    }
   /* if(typeof(jsonParam.PPFS) != ""){
    	jQuery("input[name='chkState3'][value='3-1']").attr("checked", false);
    }
    if(typeof(jsonParam.PPFS) != ""){
    	jQuery("input[name='chkState3'][value='3-2']").attr("checked", false);
    }*/
    var rangeIp2 = jsonParam.MYM;
    if(rangeIp2 !=""){
    	var rang2 = rangeIp2.split(".");
    	el("ipOne4").value = rang2[0];
 		el("ipTwo4").value = rang2[1];
 		el("ipThree4").value = rang2[2];
 		el("ipFour4").value = rang2[3];
    }
    var isChecked = false;
    var obj4 = document.getElementsByName("chkState4");
    if(jsonParam.PPFS != ""){
    	isChecked = false;
    	for (var i = 0; i < obj4.length; i++) {
    		if(jsonParam.PPFS == obj4[i].getAttribute("val")){
    			obj4[i].checked = true;
    			isChecked = true;
    			break;
    		}               
        }
	    if(isChecked){
	    	showInput1(false);
	    	el("txt_FEATURE_1").value = jsonParam.GDWZ1;
	        el("txt_FEATURE_1_EXTEND").value = jsonParam.GD1;
	        el("txt_FEATURE_2").value = jsonParam.GDWZ2;
	        el("txt_FEATURE_2_EXTEND").value = jsonParam.GD2;
	        el("txt_FEATURE_3").value = jsonParam.GDWZ3;
	        el("txt_FEATURE_3_EXTEND").value = jsonParam.GD3;
	        el("txt_FEATURE_4").value = jsonParam.GDWZ4;
	        el("txt_FEATURE_4_EXTEND").value = jsonParam.GD4;
	        el("txt_FLOAT_FEATURE1").value = jsonParam.FD1;
	        el("txt_FLOAT_FEATURE2").value = jsonParam.FD2;
	        el("txt_FLOAT_FEATURE3").value = jsonParam.FD3;
	        el("txt_FLOAT_FEATURE4").value = jsonParam.FD4;
	        el("txt_FLOAT_FEATURE5").value = jsonParam.FD5;
	        el("txt_FLOAT_FEATURE6").value = jsonParam.FD6;
		}
    }else{
		showInput1(true);
	};
    var obj5 = document.getElementsByName("chkState5");
    var strRule = jsonParam.LENGZ;
    if(strRule != ""){
    	isChecked = false;
		for (var i = 0; i < obj5.length; i++) {
			if(strRule == obj5[i].getAttribute("val")){
				obj5[i].checked = true;
				isChecked = true;
				break;
			}               
	    }
		if(isChecked){
	    	 el("txt_BYTE").value = jsonParam.LENZ;
	    	 el('txt_BYTE').disabled=false;
	    }
    }else{
    	el('txt_BYTE').disabled=true;
    };
    el("txt_DESC_PACKET").value = jsonParam.FZM;
    el("txt_LEVEL").value = jsonParam.YXJ;
    el("txt_PATH").value = jsonParam.FZLJ;
    el("txt_LIFE_TIME").value = jsonParam.SMZQ;
    el("txt_DESC").value = jsonParam.DESC;
}

/**
 * 模板2修改前的赋值
 * @param taskParam
 */
function editInitTemplate2(jsonParam,ruleName){
	el("txt_RuleName2").value = ruleName;
    var obj1 = document.getElementsByName("chkState10");
    var key = jsonParam.SJSX;
    if(key != ""){
    	for(var j=0;j<key.length;j++){
    		for (var i = 0; i < obj1.length; i++) {
    			if(key[j] == obj1[i].getAttribute("val")){
    				obj1[i].checked = true;
    				break;
    			}               
    	    }
        }
    };
    el("txt_PROTOCOL2").value = jsonParam.XYH;
    var srcIp = jsonParam.YIP;
    if(srcIp != ""){
    	var ip = srcIp.split(".");
    	el("ipOne10").value = ip[0];
    	el("ipTwo10").value = ip[1];
    	el("ipThree10").value = ip[2];
    	el("ipFour10").value = ip[3];
    }
    el("txt_SRC_PORT2").value = jsonParam.YPORT;
    var destIp = jsonParam.MIP;
    if(destIp != ""){
    	var dIp = destIp.split(".");
    	el("ipOne12").value = dIp[0];
		el("ipTwo12").value = dIp[1];
		el("ipThree12").value = dIp[2];
		el("ipFour12").value = dIp[3];
    }
	el("txt_DEST_PORT2").value = jsonParam.MPORT;
	var rangeIp1 = jsonParam.YYM;
	if(rangeIp1 != ""){
		var srcRange = rangeIp1.split(".");
	    el("ipOne11").value = srcRange[0];
		el("ipTwo11").value = srcRange[1];
		el("ipThree11").value = srcRange[2];
		el("ipFour11").value = srcRange[3];
	}
    /*if(typeof(fiveInfo.LARGE) != "undefined"){
    	jQuery("input[name='chkState11'][value='11-1']").attr("checked", false);
    }
    if(typeof(fiveInfo.UNEAQU) != "undefined"){
    	jQuery("input[name='chkState11'][value='11-2']").attr("checked", false);
    }*/
	var state11 = document.getElementsByName("chkState11");
	for (var i = 0; i < state11.length; i++) {
		if(jsonParam.IPPP == state11[i].getAttribute("val")){
			state11[i].checked = true;
			break;
		}               
    }
	var rangeIp2 = jsonParam.MYM;
    if(rangeIp2 !=""){
    	var rang2 = rangeIp2.split(".");
	    el("ipOne13").value = rang2[0];
		el("ipTwo13").value = rang2[1];
		el("ipThree13").value = rang2[2];
		el("ipFour13").value = rang2[3];
   }
    var isChecked = false;
    var obj4 = document.getElementsByName("chkState12");
    if(jsonParam.PPFS != ""){
    	isChecked = false;
    	for (var i = 0; i < obj4.length; i++) {
    		if(jsonParam.PPFS == obj4[i].getAttribute("val")){
    			isChecked = true;
    			obj4[i].checked = true;
    			break;
    		}               
        }
    	if(isChecked){
    		el("txt_FEATURE_10").value = jsonParam.GDWZ1;
    	    el("txt_FEATURE_1_EXTEND10").value = jsonParam.GD1;
    	    el("txt_FEATURE_12").value = jsonParam.GDWZ2;
    	    el("txt_FEATURE_2_EXTEND10").value = jsonParam.GD2;
    	    el("txt_FEATURE_13").value = jsonParam.GDWZ3;
    	    el("txt_FEATURE_3_EXTEND10").value = jsonParam.GD3;
    	    el("txt_FEATURE_14").value = jsonParam.GDWZ4;
    	    el("txt_FEATURE_4_EXTEND10").value = jsonParam.GD4;
    	    el("txt_FLOAT__FEATURE_11").value = jsonParam.FD1;
    	    el("txt_FLOAT__FEATURE_12").value = jsonParam.FD2;
    	    el("txt_FLOAT__FEATURE_13").value = jsonParam.FD3;
    	    el("txt_FLOAT__FEATURE_14").value = jsonParam.FD4;
    	    el("txt_FLOAT__FEATURE_15").value = jsonParam.FD5;
    	    el("txt_FLOAT__FEATURE_16").value = jsonParam.FD6;
    	}
    	 
    }else{
    	showInput2(true);
    }
    var obj5 = document.getElementsByName("chkState13");
    var strRule = jsonParam.LENGZ;
    if(strRule != ""){
    	isChecked = false;
		for (var i = 0; i < obj5.length; i++) {
			if(strRule == obj5[i].getAttribute("val")){
				obj5[i].checked = true;
				isChecked = true;
				break;
			}               
	    }
		if(isChecked){
			el("txt_BYTE10").value = jsonParam.LENZ;
		}
    }else{
    	el('txt_BYTE10').disabled=true;
    };
    el("txt_DESC_PACKET10").value = jsonParam.DESC;
}

/**
 * 邮件下载配置模板修改前的初始化
 */
function editInitEmailTempl(jsonParam,ruleName){
	el("txt_RULE_NAME").value = ruleName;
	//xml字符串转为json
//	var jsonParam = jetsennet.xml.deserialize(taskParam);
	el("txt_TASK_GROUP").value = jsonParam.TASK_GROUP;
	el("txt_TASK_NAME3").value = jsonParam.TASKN;
	el("txt_DIRECTION").value = jsonParam.FXID;
	el("txt_RULE_NAME").value = jsonParam.GZMC;
	var srcIp = jsonParam.YIP;
	if(srcIp != ""){
		var ip = srcIp.split(".");
		el("ipOne21").value = ip[0]; 
		el("ipTwo21").value = ip[1]; 
		el("ipThree21").value = ip[2]; 
		el("ipFour21").value = ip[3]; 
	}
	
	var destIp = jsonParam.MIP;
	if(destIp != ""){
		var dIp = destIp.split("."); 
		el("ipOne22").value = dIp[0]; 
		el("ipTwo22").value = dIp[1]; 
		el("ipThree22").value = dIp[2]; 
		el("ipFour22").value = dIp[3]; 
	}
	el("txt_SRC_PORT3").value = jsonParam.YPORT;
	el("txt_DEST_PORT3").value = jsonParam.MPORT;
	el("txt_PROTOCOL3").value = jsonParam.XYH;
	el("txt_LEVEL3").value = jsonParam.YXJ;
	el("txt_EMAIL3").value = jsonParam.YX;
	el("txt_KEYWORD").value = jsonParam.IPPP;
	el("txt_HEX").value = jsonParam.JZC;
	if(jsonParam.GDWZ != ""){
    	document.getElementsByName("chkState21")[0].checked = true;
    }
	el("txt_LOCATION").value = jsonParam.GDZ;
	el("txt_ANNEX_EXT").value = jsonParam.FJKZM;
	/*var obj22 = document.getElementsByName("chkState22");
    	for (var key in jsonParam.XTXLM){
			for (var i = 0; i < obj22.length; i++) {
				if(key == obj22[i].getAttribute("val")){
					obj22[i].checked = true;
					break;
				}               
		    }
    	};*/
	if(jsonParam.XTXLM != ""){
    	document.getElementsByName("chkState22")[0].checked = true;
    }
    el("txt_NOTE_INFO").value = jsonParam.BZ;
}

/**
 * 修改前摆渡机配置模板赋值
 * @param jsonParam
 */
function editInitFerryTempl(jsonParam){
	el("txt_FERRY_INPUT_PATH").value= jsonParam.INPUT_PATH;
	el("txt_FERRY_OUTPUT_PATH").value= jsonParam.OUTPUT_PATH;
	var dateTime = jsonParam.DATE_TIME.split(",");
	if(dateTime.length<=1){
		el("txtStartFerryTime").value= dateTime[0];
		el("txtEndFerryTime").value= "";
	}else{
		el("txtStartFerryTime").value= dateTime[0];
		el("txtEndFerryTime").value= dateTime[1];
	}
}

/**
 * 点击tabpane事件
 * @param value

function selectTab(value){
	tp = value;
	if(value == "0"){
		chkRadio(1);
		clearLE(1);
	}else{
		chkRadio(2);
		clearLE(2);
	}
	
}
 */
/**
 * IP数据下载模板1 控制固定特征与浮动特征的隐藏于显示
 */
function showInput1(show){
	var array = [];
	array.push('txt_FEATURE_1','txt_FEATURE_1_EXTEND','txt_FEATURE_2','txt_FEATURE_2_EXTEND','txt_FEATURE_3','txt_FEATURE_3_EXTEND','txt_FEATURE_4','txt_FEATURE_4_EXTEND');
	array.push('txt_FLOAT_FEATURE1','txt_FLOAT_FEATURE2','txt_FLOAT_FEATURE3','txt_FLOAT_FEATURE4','txt_FLOAT_FEATURE5','txt_FLOAT_FEATURE6');
	showOrHiden(array,show);
}

/**
 * IP数据下载模板2 控制固定特征与浮动特征的隐藏于显示
 */
function showInput2(show){
	var array = [];
	array.push('txt_FEATURE_10','txt_FEATURE_1_EXTEND10','txt_FEATURE_12','txt_FEATURE_2_EXTEND10','txt_FEATURE_13','txt_FEATURE_3_EXTEND10','txt_FEATURE_14');
	array.push('txt_FEATURE_4_EXTEND10','txt_FLOAT__FEATURE_11','txt_FLOAT__FEATURE_12','txt_FLOAT__FEATURE_13','txt_FLOAT__FEATURE_14','txt_FLOAT__FEATURE_15','txt_FLOAT__FEATURE_16');
	showOrHiden(array,show);
}

/**
 * 控制固定和浮动特征以及字节的隐藏于显示工具类
 */
function showOrHiden(divIds,show){
	for(var i=0;i<divIds.length;i++){
		el(divIds[i]).disabled = show;
	}
}

/**
 * 清空操作
 */
function clearTemplate(divId){
	var areaElements = jetsennet.form.getElements(divId);
    jetsennet.resetValue(areaElements);
    jetsennet.clearValidateState(areaElements);
//    dialog.showDialog();
    if(divId == "divIPTempl1"){
		clearRadio(["chkState1","chkState2","chkState3","chkState4","chkState5"]);
		 showInput1(true);
		 el('txt_BYTE').disabled=true;
    }else if(divId == "divIPTempl2"){
    	clearRadio(["chkState10","chkState11","chkState12","chkState13"]);
		showInput2(true);
		el('txt_BYTE10').disabled=true;
    }else if(divId == "divEmailTempl"){
    	var obj21 = document.getElementsByName("chkState21");
		for(var i=0;i<obj21.length;i++){
			obj21[i].checked = false;
		};
		var obj22 = document.getElementsByName("chkState22");
		for(var i=0;i<obj22.length;i++){
			obj22[i].checked = false;
		};
    };
}

/**
 * 添加邮件下载中扩展名输入框的值
 */
function addExt(){
	var obj=el("extTable"); 
	for(var i=obj.rows.length-2;i > 0; i--){
		obj.deleteRow(i+1); 
	}
	var areaElements = jetsennet.form.getElements("divEmailExt");
    jetsennet.resetValue(areaElements);
    jetsennet.clearValidateState(areaElements);
	var extDialog = new jetsennet.ui.Window("new-Ext-win");  
	jQuery.extend(extDialog, { maximizeBox: false, minimizeBox: false, windowStyle: 0,
		submitBox: true, cancelBox: true, title: "Frm_GZTZM" }); 
	extDialog.onsubmit =function(){
		var value = "";
		var obj =el("extTable").rows.length-1;
		for(var i=0;i<=obj;i++){
			if(el("txt_format"+(i+1)) != null){
				var format = el("txt_format"+(i+1)).value;
				var encrypt = el("txt_encrypt"+(i+1)).value;
				if(encrypt != ""){
					value+=format+"("+encrypt+"),";
				}else value+=format+",";
			}else continue;
		}
		alert(value.substring(0,value.lastIndexOf(",")));
		el("txt_ANNEX_EXT").value=value.substring(0,value.lastIndexOf(","));
		return true;
	};
	extDialog.size = { width: 450, height: 450 };
	extDialog.controls = ["divEmailExt"];  
	extDialog.show();  
}

/**
 * 动态加载下一个扩展选择框
 */
function addNextExt(){
	var obj = el("extTable");
	var num = obj.rows.length;
	//插入行 
	var tr =obj.insertRow(num); 
	var trId="rowExt"+num; 
	tr.setAttribute("format"+num,trId);
	var td0 = tr.insertCell(0); 
	td0.setAttribute("align","center"); 
	td0.innerHTML = '<i class="fa fa-plus" onclick="addNextExt();"></i>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'; 

	var td1 = tr.insertCell(1); 
	td1.setAttribute("align","center"); 
	td1.innerHTML = '<select id="txt_format'+num+'" class="form-control" style=" width: 240px;"><option value=""></option><option value=".avi">.avi</option>'
		+'<option value=".bmp">.bmp</option><option value=".doc">.doc</option><option value=".docx">.docx</option><option value=".gif">.gif</option>'
		+'<option value=".htm">.htm</option><option value=".jpeg">.jpeg</option><option value=".jpg">.jpg</option><option value=".mp2">.mp2</option>'
		+'<option value=".mp4">.mp4</option><option value=".mpeg">.mpeg</option><option value=".mpg">.mpg</option><option value=".pdf">.pdf</option>'
		+'<option value=".pps">.pps</option><option value=".rar">.rar</option><option value=".rmvb">.rmvb</option><option value=".tif">.tif</option>'
		+'<option value=".txt">.txt</option><option value=".wma">.wma</option><option value=".wmv">.wmv</option><option value=".xls">.xls</option>'
		+'<option value=".zip">.zip</option></select>';
	var td2 = tr.insertCell(2); 
	td2.setAttribute("align","center"); 
	td2.innerHTML = '<select id="txt_encrypt'+num+'" class="form-control" style=" width: 200;"><option value=""></option><option value="加密">加密</option><option value="不加密">不加密</option></select>'; 
	var td3 = tr.insertCell(3); 
	td3.setAttribute("align","center"); 
	td3.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa fa-times" onclick="DelStructureRow('+num+');"></i>'; 
} 
 
/**
 * 删除行
 * @param rowIndex
 */
function DelStructureRow(rowIndex){ 
	var obj=el("extTable"); 
	obj.deleteRow(rowIndex); 
	//重新排列序号，如果没有序号，这一步省略
	/*for(var i=1;i<obj.rows.length;i++){
		var a =  "";
//		obj.rows[i].cells[0].innerHTML = i.toString();
		obj.rows[i].rowIndex = i.toString();
	}*/
} 
 
/**
 * 暂时没用
 * @param theObj
 * @param theDoc
 * @returns
 */
function findObj(theObj, theDoc){ 
	var p, i, foundObj; 
	if(!theDoc) theDoc = document; 
	if( (p = theObj.indexOf("?")) > 0 && parent.frames.length){ 
		theDoc = parent.frames[theObj.substring(p+1)].document; 
		theObj = theObj.substring(0,p);
	} 
	if(!(foundObj = theDoc[theObj]) && theDoc.all) 
		foundObj = theDoc.all[theObj]; 
		for (i=0; !foundObj && i < theDoc.forms.length; i++) 
			foundObj = theDoc.forms[i][theObj]; 
			for(i=0; !foundObj && theDoc.layers && i < theDoc.layers.length; i++) 
				foundObj = findObj(theObj,theDoc.layers[i].document); 
					if(!foundObj && document.getElementById) 
						foundObj = document.getElementById(theObj); 
					return foundObj;
}

/**
 * IP数据下载 单选框 全选与全部选以及控制固定和浮动特征。
 */
function chkRadio(num){
	if(num == 1){
		clearRadio(["chkState4"]);
		showInput1(true);
	    el("txt_FEATURE_1").value="";
	    el("txt_FEATURE_1_EXTEND").value="";
	    el("txt_FEATURE_2").value="";
	    el("txt_FEATURE_2_EXTEND").value="";
	    el("txt_FEATURE_3").value="";
	    el("txt_FEATURE_3_EXTEND").value="";
	    el("txt_FEATURE_4").value="";
	    el("txt_FEATURE_4_EXTEND").value="";
	    el("txt_FLOAT_FEATURE1").value="";
	    el("txt_FLOAT_FEATURE2").value="";
	    el("txt_FLOAT_FEATURE3").value="";
	    el("txt_FLOAT_FEATURE4").value="";
	    el("txt_FLOAT_FEATURE5").value="";
	    el("txt_FLOAT_FEATURE6").value="";
	}else if(num == 2){
		clearRadio(["chkState12"]);
		showInput2(true);
	    el("txt_FEATURE_10").value="";
	    el("txt_FEATURE_1_EXTEND10").value="";
	    el("txt_FEATURE_12").value="";
	    el("txt_FEATURE_2_EXTEND10").value="";
	    el("txt_FEATURE_13").value="";
	    el("txt_FEATURE_3_EXTEND10").value="";
	    el("txt_FEATURE_14").value="";
	    el("txt_FEATURE_4_EXTEND10").value="";
	    el("txt_FLOAT__FEATURE_11").value="";
	    el("txt_FLOAT__FEATURE_12").value="";
	    el("txt_FLOAT__FEATURE_13").value="";
	    el("txt_FLOAT__FEATURE_14").value="";
	    el("txt_FLOAT__FEATURE_15").value="";
	    el("txt_FLOAT__FEATURE_16").value="";
	}
}

/**
 * 清空LE单选框
 */
function clearLE(num){
	if(num == 1){
		clearRadio(["chkState5"]);
		el('txt_BYTE').disabled=true;
		el("txt_BYTE").value="";
	}else if(num == 2){
		clearRadio(["chkState13"]);
		el('txt_BYTE10').disabled=true;
		el("txt_BYTE10").value="";
	}
	el("txt_BYTE").style.border="1px #CCCCFF solid";
}

/**
 * 清空单选框工具类
 */
function clearRadio(names){
	for(var j=0;j<names.length;j++){
		var obj = document.getElementsByName(names[j]);
		for(var i=0;i<obj.length;i++){
			obj[i].checked = false;
		};	
	}
}

/**
 * Ip数据下载验证单选框是否选中
 * arrays[a][0]  单选框name
 * arrays[a][1]  border
 */
function validateRadio(arrays){
	var chkState = false;
	for(var a=0;a<arrays.length;a++){
		chkState = false;
		var obj = document.getElementsByName(arrays[a][0]);
		for(var i=0;i<obj.length;i++){
			if(obj[i].checked){
				chkState = true;
			};
		};
		//改变border颜色
		if(!chkState){
			el(arrays[a][1]).style.border="1px #936 solid";
			return chkState;
		}else{
			el(arrays[a][1]).style.border="1px #CCCCFF solid";
		}
	}
	return chkState;
}

/**
 * 验证固定特征和浮动特征是否为空
 * 规则是 
 * 		当单选框选中时，
 * 			1.固定和浮动特征必须有一项不为空
 * 			2.如果输入固定特征1 则1中的两个输入框必须都不能为空
 * 		当不选择单选框则都为空
 * @param name 单选框name
 * @param arrays 验证divId数组
 */
function validateIsEmpty(name,arrays){
	var obj = document.getElementsByName(name);
	for(var i=0;i<obj.length;i++){
		if(obj[i].checked){
			for(var a=0;a<arrays.length;a++){
				if(el(arrays[a][0]).value){
						if(!el(arrays[a][1]).value){
							el(arrays[a][1]).style.border="1px #936 solid";
							el(arrays[a][0]).style.border="1px #CCC solid";
							return false;
						}else{
							el(arrays[a][1]).style.border="1px #CCC solid";
						}	
					el(arrays[a][0]).style.border="1px #CCC solid";
				}else{
					el(arrays[a][0]).style.border="1px #CCC solid";
					el(arrays[a][1]).style.border="1px #CCC solid";
				}
			}
		}
	};
	return true;
}

/**
 * 检测任务名称的唯一性
 * @param taskName
 * @returns {Boolean}
 */
function validateTaskName(taskName,sysId,id){
	var conditions = [];
	conditions.push(["t.TASK_NAME", taskName, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String]);
	conditions.push(["t.TASK_TYPE", 20, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
	conditions.push(["t.STR_2", sysId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String]);
	if(typeof(id) != "undefined"){
		conditions.push(["t.TASK_ID", id, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.NotEqual, jetsennet.SqlParamType.String]);
	}
	var sResult = IPSDAO.query("commonXmlQuery", "TASK_ID", "IPS_TASK", "t", null,conditions, "t.TASK_ID");
	var objs = jetsennet.xml.toObject(sResult.resultVal, "Record");
	if(objs){
		jetsennet.warn("任务名称重复请重新选择！");
		return false;
	}
	return true;
}

/**
 * 根据条件查找任务
 */
function searchCollocTask(id){
	var conditions = [];
	
	//为工作管理页面跳转所用
	if(!jetsennet.util.isNullOrEmpty(id)){
		conditions.push([ "t.TASK_ID", id, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String ]);
		el('create_time').value = "";
//		el('txtEndTime').value = "";
	}
	
	var value = jetsennet.util.trim(el('txtCollocTaskName').value);
	if(value){
		conditions.push([ "t.TASK_NAME", value, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Like, jetsennet.SqlParamType.String ]);
	}
    conditions.push([ "t.TASK_TYPE", "20", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric ]);
    /*if(illegalityTime(el("txtStartTime").value, el("txtEndTime").value)){
		return;
	}*/
   /* if (el('txtStartTime').value != "") {
    	conditions.push(["t.CREATE_TIME", el('txtStartTime').value + " 00:00:00", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Than, jetsennet.SqlParamType.DateTime]);
    }
    if (el('txtEndTime').value != "") {
    	conditions.push(["t.CREATE_TIME", el('txtEndTime').value + " 23:59:59", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Less, jetsennet.SqlParamType.DateTime]);
    }*/
    var system = jetsennet.ui.DropDownList["txtSystem"].selectedValue;
    if (system != "-1" && system != "" && typeof(system) != "undefined") {
    	conditions.push([ "a.SYS_NAME", system, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String ]);
    }
    if ($('#create_time').val()) {
        conditions.push([ "t.CREATE_TIME", $('#create_time').data('daterangepicker').startDate.format('YYYY-MM-DD'), jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.ThanEqual, jetsennet.SqlParamType.DateTime ]);
        conditions.push([ "t.CREATE_TIME", $('#create_time').data('daterangepicker').endDate.format('YYYY-MM-DD') + " 23:59:59", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.LessEqual, jetsennet.SqlParamType.DateTime ]);
    }
    gTaskCrud.search(conditions);
    var objItems =  gTaskCrud.grid.objItems;
    if(objItems.length>0){
    	//默认选择行事件
        onRowsClick(objItems[0]);
        //默认渲染第一行
        gTaskCrud.grid.selectRow(0);
    }
    
}

/**
 * 加载查询任务所属采集系统下拉框
 */
function loadSystemList(){
	var condition = [];
	condition.push([ "t.TASK_TYPE", "20", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric ]);
	var joinTable = [];
	joinTable.push([ "DMA_WEBSERVICE", "p", "t.PROCTEMPLATE_ID=p.SERVICE_ID", jetsennet.TableJoinType.Inner ]);
	joinTable.push([ "DMA_APPSYSTEM", "a", "a.SYS_ID=p.SYS_ID", jetsennet.TableJoinType.Inner ]);
    var objs = IPSDAO.queryObjs("commonXmlQuery", "TASK_ID", "IPS_TASK", "t", joinTable,condition, "a.SYS_NAME",null,"a.SYS_NAME");
    if (objs && objs.length > 0) {
        jetsennet.ui.DropDownList["txtSystem"].clear();
        jetsennet.ui.DropDownList["txtSystem"].appendItem({ text: '所有系统', value: "-1" });
        for (var i = 0; i < objs.length; i++) {
            jetsennet.ui.DropDownList["txtSystem"].appendItem({ text: objs[i].SYS_NAME, value: objs[i].SYS_NAME });
        }
    }
	jetsennet.ui.DropDownList["txtSystem"].setSelectedIndex(0);
}

/**
 * 查询规则
 */
function searchRule(){
	if($.isEmptyObject(objTask)){
		jetsennet.warn("请您先选择采集任务！");
		el(ruleDivId).style.display = "none";
	}else{
		el(ruleDivId).style.display = "";
		var condition = [];
		condition.push([ "t.TASK_ID", objTask.taskId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String ]);
		var subConditions=[];
		subConditions.push([[ "t.RULE_NAME", el("txtTaskRule").value, jetsennet.SqlLogicType.Or, jetsennet.SqlRelationType.Like, jetsennet.SqlParamType.String ],
		                    [ "t.PARAM", el("txtTaskRule").value, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Like, jetsennet.SqlParamType.String ]
						   ]);
		gRuleCrud.search(condition,subConditions);
	}
}

/**
 * 默认选中行事件
 * @param item
 */
function onRowsClick(item){
	if(typeof(item) != "undefined"){
		//给任务对象赋值
		objTask.taskId = item.TASK_ID;
		objTask.taskName = item.TASK_NAME;
		objTask.createUser = item.CREATE_USER;
		objTask.creatTime = item.CREATE_TIME;
		objTask.serviceId = item.PROCTEMPLATE_ID;
		el(ruleDivId).style.display = "";
		//加载任务对应规则列表
		var conditions = [["t.TASK_ID", objTask.taskId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String]];
		gRuleCrud.search(conditions,null);
	}
}

