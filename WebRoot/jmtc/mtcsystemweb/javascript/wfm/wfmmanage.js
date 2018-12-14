jetsennet.require([ "gridlist", "pagebar", "window", "bootstrap/moment", "bootstrap/daterangepicker", "crud","autocomplete","datepicker",
                    "menu","tabpane", "jetsentree","flowview", "accordion"]);
jetsennet.importCss("bootstrap/daterangepicker-bs3");

//显示子流程时的流程ID
gCurrentSubProcExecId = null;
//显示流程时的当前操作的任务ID(含子流程)
gCurrentTaskId = null;

var gCurrentProcExec;
var gLoadInterVal;
var gLoadInterValDailog;
var gTaskStatusInterVal;
var gTaskListInterVal;
var gTaskStatusProcessInterVal;
var gFlowView;
var gFlowViewDialog;
var gFunction;
var gAssignType = -1;
var gAssignPane;
var pInfo = new jetsennet.ui.PageBar("processListPage");
pInfo.onpagechange = function () {
    loadProcessExec();
};
pInfo.orderBy = " ORDER BY START_TIME DESC";
pInfo.onupdate = function () {
    el('divPage').innerHTML = this.render();
};

var gSqlQuery;
var gCurDate = new Date();
var gLastWeekDate = null;
var gPane;
var gWindowSizeChangedInterVal = null;

function pageInit() {
	initWfView();
    jetsennet.ui.DropDownList.initOptions("txtProcess", true);
    jQuery("#txtStartTime").pickDate();
	jQuery("#txtEndTime").pickDate();
    gLastWeekDate = new Date(gCurDate.getTime() - 6 * 24 * 3600 * 1000);
    el('txtStartTime').value = gLastWeekDate.toDateString();
    el('txtEndTime').value = gCurDate.toDateString();
    gPane = new jetsennet.ui.TabPane(el('tabPaneDetail'), el('tabPageDetail'));
    gPane.ontabpageselected = function (index) {
    	if(index==1){
    		jQuery('#menuTask').hidepop().remove();
    		seachProcessRecords();
    		if(logFlag){
    			if (gTaskListInterVal != null)
    		        window.clearTimeout(gTaskListInterVal);
    		}
    	}
    };
    loadProcess();
    searchFlow();

    jQuery("input[name='chkState'][value='-1']").click(function () {               
        var checked = this.checked;
        jQuery("input[name='chkState'][value!='-1']").each(function () { this.checked = checked; });
    });
    jQuery("input[name='chkState'][value!='-1']").click(function () {
    	var checkedFlag = true;
    	jQuery("input[name='chkState'][value!='-1']").each(function ()
    	{ 
    		if(!this.checked){
    			checkedFlag = this.checked;
    		}
    	});
    	jQuery("input[name='chkState'][value='-1']").each(function(){this.checked = checkedFlag;});
    });
    
    gAssignPane = new jetsennet.ui.TabPane(el('tabPane'), el('tabPage'));
    gAssignPane.ontabpageselected = function (index) {
        switch (index) {
            case 0:
                gAssignType = 2;
                break;
            case 1:
                gAssignType = 3;
                break;
            case 2:
                gAssignType = 4;
                break;
            case 3:
                gAssignType = 100;
                break;
        }
    };
}


//加载用户列表
function initUserControl(con, isId) {
    jetsennet.ui.DropDownList[con].clear();
    jetsennet.ui.DropDownList[con].appendItem({ text: '全部', value: "" });

    var objUsers = jetsennet.Application.getUserByFunctionId(-1);
    if (objUsers && objUsers.Table) {
        objUsers = objUsers.Table.length ? objUsers.Table : [objUsers.Table];
        var len = objUsers.length;
        for (var i = 0; i < len; i++) {
            var id = valueOf(objUsers[i], "ID", "");
            var name = valueOf(objUsers[i], "LOGIN_NAME", "");
            var userName = valueOf(objUsers[i], "USER_NAME", "");
            if (isId) {
                jetsennet.ui.DropDownList[con].appendItem({ text: userName, value: id });
            } else {
                jetsennet.ui.DropDownList[con].appendItem({ text: userName, value: name });
            }
        }
        jetsennet.ui.DropDownList[con].setSelectedIndex(0);
    }
}
// 初始化界面
function initWfView() {

    //初始化流程视图
    gFlowView = new jetsennet.ui.WfView(el("divDesign"),742,380);
    gFlowView.isDesignMode = false;
    gFlowView.align = "left-middle";
    gFlowView.enableScale = false;
    gFlowView.autoScroll = false;
    gFlowView.onnodemouseover = function (node) {
        if (node && node.nodeParam && node.nodeParam.stateDesc) {
            jetsennet.tooltip(node.nodeParam.stateDesc, { reference: node.control, position: 1 });
        }
    };
    gFlowView.onnodemouseout = function (node) {
        jetsennet.hidetip();
    };
    gFlowView.onnodecontextmenu = function (node) {
        showTaskMenu(node);
    };
    gFlowView.render();
    
    //弹出框初始化流程视图
    gFlowViewDialog = new jetsennet.ui.WfView(el("divDesignDialog"), 742, 200);
    gFlowViewDialog.isDesignMode = false;
    gFlowViewDialog.showStartEndNode = false;
    gFlowViewDialog.enableScale = false;
    gFlowViewDialog.autoScroll = true;
    gFlowViewDialog.align = "left-middle";
    gFlowViewDialog.onnodemouseover = function (node) {
        if (node && node.nodeParam && node.nodeParam.stateDesc) {
            jetsennet.tooltip(node.nodeParam.stateDesc, { reference: node.control, position: 1 });
        }
    };
    gFlowViewDialog.onnodemouseout = function (node) {
        jetsennet.hidetip();
    };   
    gFlowViewDialog.render();
}
//加载流程类型
function loadProcess() {
    var collection = [];
    collection.push(["PROC_STATE", "0,1", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.NotIn, jetsennet.SqlParamType.Numeric]);
    var objs = WFMDAO.queryObjs("commonXmlQuery", "PROC_ID", "WFM_PROCESS", null, null,collection, "PROC_ID,PROC_NAME,PROC_STATE","Order By PROC_TYPE");
    if (objs && objs.length > 0) {
        jetsennet.ui.DropDownList["txtProcess"].clear();
        jetsennet.ui.DropDownList["txtProcess"].appendItem({ text: '所有流程', value: "-1" });
        for (var i = 0; i < objs.length; i++) {
            jetsennet.ui.DropDownList["txtProcess"].appendItem({ text: objs[i].PROC_NAME, value: objs[i].PROC_ID });
        }
    }
    jetsennet.ui.DropDownList["txtProcess"].setSelectedIndex(0);
}

/**
* 搜索业务流程实例
* 根据状态来判断是否联合查询历史表
*/
gSqlQuery = new jetsennet.SqlQuery();
var queryTable;
var sqlCollection;
function searchFlow() {
//    el('divList').innerHTML = "";
    if(illegalityTime(el("txtStartTime").value, el("txtEndTime").value)){
    	jetsennet.alert("开始时间不能大于结束时间！");
		return;
	}
    sqlCollection = new jetsennet.SqlConditionCollection();
    var processVal = jetsennet.ui.DropDownList["txtProcess"].selectedValue;
    if (processVal != -1) {
        sqlCollection.add(jetsennet.SqlCondition.create("F.PROC_ID", processVal, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric));
    }
    if (el('txtObjName').value != "") {
        sqlCollection.add(jetsennet.SqlCondition.create("OBJ_NAME", el('txtObjName').value, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Like, jetsennet.SqlParamType.String));
    }  

    if (el('txtStartTime').value != "") {
        sqlCollection.add(jetsennet.SqlCondition.create("START_TIME", el('txtStartTime').value + " 00:00:00", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Than, jetsennet.SqlParamType.DateTime));
    }
    if (el('txtEndTime').value != "") {
        sqlCollection.add(jetsennet.SqlCondition.create("START_TIME", el('txtEndTime').value + " 23:59:59", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Less, jetsennet.SqlParamType.DateTime));
    }

    var stateVal = jetsennet.form.getCheckedValues("chkState");
    var checkStateVal = "," + stateVal + ",";
    if (stateVal != "" && checkStateVal.indexOf(",-1,") < 0) {
//    	if(checkStateVal.indexOf(",12,") >= 0){
//    		var subSqlQuery = new jetsennet.SqlQuery();
//            jQuery.extend(subSqlQuery, { IsPageResult: 0, ResultFields: "PROCEXEC_ID",
//                QueryTable: jQuery.extend(new jetsennet.QueryTable(), { TableName: "WFM_TASKEXEC" }),
//                Conditions: jQuery.extend(new jetsennet.SqlConditionCollection(), { SqlConditions: [jetsennet.SqlCondition.create("TASK_STATE", 10, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric)] })
//            });
//    		var objStateCondition = jetsennet.SqlCondition.create("","");
//			objStateCondition.SqlLogicType = jetsennet.SqlLogicType.And;
//			objStateCondition.SqlConditions.push(jetsennet.SqlCondition.create("F.PROC_STATE", stateVal, jetsennet.SqlLogicType.Or, jetsennet.SqlRelationType.In, jetsennet.SqlParamType.Numeric));
//			objStateCondition.SqlConditions.push(jetsennet.SqlCondition.create("F.PROCEXEC_ID", subSqlQuery.toXml(), jetsennet.SqlLogicType.Or, jetsennet.SqlRelationType.In, jetsennet.SqlParamType.SqlSelectCmd));
//			sqlCollection.SqlConditions.push(objStateCondition);
//    	}else{
    		sqlCollection.add(jetsennet.SqlCondition.create("F.PROC_STATE", stateVal, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.In, jetsennet.SqlParamType.Numeric));
//    	}
    }

    if (stateVal == "" || checkStateVal.indexOf(",-1,") >= 0 || checkStateVal.indexOf(",10,") >= 0 || checkStateVal.indexOf(",11,") >= 0) {

        var peSqlQuery = new jetsennet.SqlQuery();
        var peQueryTable = jQuery.extend(new jetsennet.QueryTable(), { TableName: "WFM_PROCEXEC", AliasName: "PE" });
        jQuery.extend(peSqlQuery, { ResultFields: "PROCEXEC_ID,PROC_ID,OBJ_NAME,OBJ_ID,PROC_TYPE,START_USER,START_TIME,PROC_STATE,END_TIME,PROC_VER", IsPageResult: 0, QueryTable: peQueryTable });

        var plSqlQuery = new jetsennet.SqlQuery();
        var plQueryTable = jQuery.extend(new jetsennet.QueryTable(), { TableName: "WFM_PROCLOG", AliasName: "PL" });
        jQuery.extend(plSqlQuery, { ResultFields: "PROCEXEC_ID,PROC_ID,OBJ_NAME,OBJ_ID,PROC_TYPE,START_USER,START_TIME,PROC_STATE,END_TIME,PROC_VER", IsPageResult: 0, QueryTable: plQueryTable });

        peSqlQuery.UnionQuery = new jetsennet.UnionQuery(plSqlQuery, jetsennet.QueryUnionType.Union);

        queryTable = jQuery.extend(new jetsennet.QueryTable(), { TableName: peSqlQuery.toXml(), AliasName: "F" });
    }
    else {
        queryTable = jQuery.extend(new jetsennet.QueryTable(), { TableName: "WFM_PROCEXEC", AliasName: "F" });
    }

    queryTable.addJoinTable(jetsennet.createJoinTable("WFM_PROCESS", "P", "F.PROC_ID=P.PROC_ID", jetsennet.TableJoinType.Inner));
    jQuery.extend(gSqlQuery, { IsPageResult: 1, KeyId: "PROCEXEC_ID",
        ResultFields: "F.PROCEXEC_ID,F.PROC_ID,F.OBJ_NAME,F.OBJ_ID,F.PROC_TYPE,P.PROC_DESC,F.START_USER,F.START_TIME,F.END_TIME,F.PROC_STATE,P.PROC_NAME,F.PROC_VER",
        QueryTable: queryTable, Conditions: sqlCollection
    });
    pInfo.currentPage = 1;
    loadProcessExec();
}


var columns = [{ fieldName: "PROCEXEC_ID,PROC_STATE,OBJ_ID", width: 40, align: "center", isCheck: 1, checkName: "chk_Proc", format:function(val, vals){
	                if(vals[0]==vals[2]){
	                	if(vals[1]==10||vals[1]==11){
	                		return vals[0] + "@" + vals[1] + "@" + vals[2];
	                	}
	                	return "";
	                } 
                    return vals[0] + "@" + vals[1] + "@" + vals[2];
                }},
                { fieldName: "OBJ_NAME", sortField: "OBJ_NAME", width: "100%", align: "left", name: "对象名称"},
                { fieldName: "PROC_NAME", sortField: "PROC_NAME", title:true, width: 180, align: "left", name: "所属流程"},
                { fieldName: "CURR_PROCACT_NAME", title:true, width: 180, align: "left", name: "当前工作节点", format:function(val, vals){
                    return val||"--";
                }},
                { fieldName: "START_USER", sortField: "START_USER", width: 120, align: "left", name: "创建用户", format:function(val, vals){
                    return val||"--";
                }},
                { fieldName: "PROC_STATE", sortField: "F.PROC_STATE", width: 120, align: "center", name: "流程状态",format:function(val, vals){
                    if(val == 0) {
                        return "未启动";
                    }
                    if(val == 1) {
                        return "等待执行";
                    }
                    if(val == 2) {
                        return "运行中";
                    }
                    if(val == 5) {
                        return "暂停";
                    }
                    if(val == 10) {
                        return "完成";
                    }
                    if(val == 11) {
                        return "终止";
                    }
                    if(val == 100) {
                        return "异常";
                    }
                    return val;
                }},
                { fieldName: "START_TIME", sortField: "START_TIME", width: 150, align: "center", name: "开始时间",format:function(val, vals){
                	 return val||"--";
                }},
                { fieldName: "END_TIME,PROC_STATE", sortField: "END_TIME", width: 150, align: "center", name: "结束时间",format:function(val, vals){
                	if(vals[1]==10||vals[1]==11){
                		return val;
                	}
                	return "--";
                }},
                { fieldName: "PROCEXEC_ID,PROC_STATE,ERROR_STATE,PROC_VER", width: 80, align: "center", name: "流程查看", format: function(val,vals){
                	if(vals[2]){
                		return "<img style=\"cursor:pointer;\" src=\"../images/cel_info_red.png\" title=\"异常流程查看\" " +
                		"onclick=\"viewProcess('"+vals[0]+"','"+vals[1]+"','"+vals[3]+"')\"></img>" ;
                	}
                	return "<img style=\"cursor:pointer;\" src=\"../images/cel_info.png\" title=\"查看\" " +
                	"onclick=\"viewProcess('"+vals[0]+"','"+vals[1]+"','"+vals[3]+"')\"></img>" ;
                }}];
var gGridList = jQuery.createGridlist("divList", columns); //表格对象，自动生成
gGridList.ondatasort = function(sortfield, desc) {
    pInfo.setOrderBy(sortfield, desc);
};


//加载业务流程实例
function loadProcessExec() {
    if (gLoadInterVal != null) {
        window.clearTimeout(gLoadInterVal);
    }
    _noteChecked();
    var stateVal = jetsennet.form.getCheckedValues("chkState");
    var checkStateVal = "," + stateVal + ",";
    jQuery.extend(gSqlQuery, { PageInfo: pInfo, OrderString: pInfo.orderBy });
    var param = new HashMap();
    param.put("queryXml", gSqlQuery.toXml());
    param.put("startPageNum", (pInfo.currentPage - 1));
    param.put("pageSize", pInfo.pageSize);
    var sResult = MTCDAO.execute("commonQueryForPage", param);
    var xmlDoc = new jetsennet.XmlDoc();
    xmlDoc.loadXML(sResult.resultVal);
    var nodes = xmlDoc.documentElement.selectNodes("Record");
    var count = xmlDoc.documentElement.getAttribute("TotalCount");
    //查询有异常错误的流程
	var procexecIdArray = [];
	for ( var i = 0; i < nodes.length; i++) {
		procexecIdArray.push(valueOf(nodes[i].selectSingleNode("PROCEXEC_ID"),"text", ""));
		nodes[i].appendChild(xmlDoc.createElement("ERROR_STATE"));
		nodes[i].appendChild(xmlDoc.createElement("CURR_PROCACT_NAME"));
    }
	var procexecIds = procexecIdArray.join(",");
	if(procexecIds){
		//查询异常的任务
		var condtion = [];
		condtion.push(jetsennet.SqlCondition.create("T.TASK_STATE", "10,2", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.In, jetsennet.SqlParamType.Numeric));
		condtion.push(jetsennet.SqlCondition.create("T.PROCEXEC_ID", procexecIds, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.In, jetsennet.SqlParamType.String));
		var gCurrSqlQuery = new jetsennet.SqlQuery();
        var gCurrQueryTable = jetsennet.createQueryTable("WFM_TASKEXEC", "T");
        gCurrQueryTable.addJoinTable(jetsennet.createJoinTable("WFM_PROCACT", "C", "T.PROCACT_ID = C.PROCACT_ID", jetsennet.TableJoinType.Inner));
        jQuery.extend(gCurrSqlQuery, { IsPageResult: 0, KeyId: "T.TASK_ID", PageInfo: null, QueryTable: gCurrQueryTable, 
        ResultFields: "C.PROCACT_NAME,T.PROCEXEC_ID,T.TASK_STATE",Conditions:jQuery.extend(new jetsennet.SqlConditionCollection(), { SqlConditions: condtion}) });
        var paramcurr = new HashMap();
        paramcurr.put("queryXml", gCurrSqlQuery.toXml());
        var resultcurr = MTCDAO.execute("commonXmlQuery", paramcurr);
        var records = jetsennet.xml.toObject(resultcurr.resultVal, "Record");

        if (records && records.length) {
            var errExecId = [];
            for (var j = 0; j < records.length; j++) {
            	if(records[j].TASK_STATE=="10"){
            		errExecId.push(records[j].PROCEXEC_ID);
            	}
            }
            for (var i = 0; i < nodes.length; i++) {
            	//异常流程 查看详情为红色图标
                var procexecId = valueOf(nodes[i].selectSingleNode("PROCEXEC_ID"), "text", "");
                if (errExecId.in_array(procexecId)) {
                	nodes[i].selectSingleNode("ERROR_STATE").text = "YES";
                }
                //关联当前工作列
                var currProcactNameArray = [];
                for ( var j = 0; j < records.length; j++) {
                	if(procexecId==records[j].PROCEXEC_ID){
                		currProcactNameArray.push(records[j].PROCACT_NAME);
                	}
        		}
        		nodes[i].selectSingleNode("CURR_PROCACT_NAME").text = currProcactNameArray.join(",");
            }
        }
	}

    gGridList.renderXML(xmlDoc);
    pInfo.setRowCount(count);
    _reChecked();

    var procExecId = gCurrentProcExec ? gCurrentProcExec.procExecId : 0;
    gLoadInterVal = window.setTimeout(function(){
    	gGridList.enableRemPosition=true;
    	loadProcessExec();
    }, 20000);
}

//PROCEXEC_ID,PROC_ID,OBJ_NAME,START_USER,START_TIME,PROC_TYPE,OBJ_ID,PROC_NAME,PROC_STATE
//查看流程=====================================================================
function viewProcess(procExecId, procState,procVer) {
	var procId, objName, createUser, createTime, objType, objId, procName;
	var queryTableView;
	var sqlQueryView = new jetsennet.SqlQuery();
	var sqlCollectionView = new jetsennet.SqlConditionCollection();
	sqlCollectionView.add(jetsennet.SqlCondition.create("F.PROCEXEC_ID", procExecId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String));
	var peSqlQuery = new jetsennet.SqlQuery();
    var peQueryTable = jQuery.extend(new jetsennet.QueryTable(), { TableName: "WFM_PROCLOG", AliasName: "TE" });
    jQuery.extend(peSqlQuery, { ResultFields: "PROCEXEC_ID,PROC_ID,OBJ_NAME,OBJ_ID,PROC_TYPE,START_USER,START_TIME,END_TIME,PROC_STATE", IsPageResult: 0, QueryTable: peQueryTable });
    var plSqlQuery = new jetsennet.SqlQuery();
    var plQueryTable = jQuery.extend(new jetsennet.QueryTable(), { TableName: "WFM_PROCEXEC", AliasName: "TL" });
    jQuery.extend(plSqlQuery, { ResultFields: "PROCEXEC_ID,PROC_ID,OBJ_NAME,OBJ_ID,PROC_TYPE,START_USER,START_TIME,END_TIME,PROC_STATE", IsPageResult: 0, QueryTable: plQueryTable });
    peSqlQuery.UnionQuery = new jetsennet.UnionQuery(plSqlQuery, jetsennet.QueryUnionType.Union);
    queryTableView = jQuery.extend(new jetsennet.QueryTable(), { TableName: peSqlQuery.toXml(), AliasName: "F" });
    queryTableView.addJoinTable(jetsennet.createJoinTable("WFM_PROCESS", "P", "F.PROC_ID=P.PROC_ID", jetsennet.TableJoinType.Inner));
    jQuery.extend(sqlQueryView, { IsPageResult: 0,
        ResultFields: "F.PROCEXEC_ID,F.PROC_ID,F.OBJ_NAME,F.OBJ_ID,F.PROC_TYPE,P.PROC_DESC,F.START_USER,F.START_TIME,F.END_TIME,F.PROC_STATE,P.PROC_NAME",
        QueryTable: queryTableView, Conditions: sqlCollectionView
    });
    
    var paramc = new HashMap();
    paramc.put("queryXml", sqlQueryView.toXml());
    var resultc = MTCDAO.execute("commonXmlQuery", paramc);
    var records = jetsennet.xml.toObject(resultc.resultVal, "Record");
    if (records && records.length) {
    	procId = records[0].PROC_ID; 
    	objName = records[0].OBJ_NAME;
    	createUser = records[0].START_USER;
    	createTime = records[0].START_TIME;
    	objType = records[0].PROC_TYPE;
    	objId = records[0].OBJ_ID;
    	procName = records[0].PROC_NAME;
    }
	gPane.select(0);
	gCurrentProcExec = { procExecId: procExecId, procId: procId, objName: objName, createUser: createUser,
	        createTime: createTime, objType: objType, objId: objId, procName: procName, procState: procState, procVer: procVer
	    };
	var dialog = new jetsennet.ui.Window("task-show-win");
    $.extend(dialog, { submitBox: false, cancelBox: false, windowStyle: 1,maximizeBox: false, minimizeBox: false, showScroll: false, size: { width: 750, height:500 }, title: "查看流程  -【"+jetsennet.xml.htmlEscape(objName)+"】" });
    if(procState=="0"||procState=="5"){
    	jQuery.extend(dialog, { attachButtons: [{ text: "启动流程", clickEvent: function () { startWorkflow(procExecId); } }]});
    }else if(procState=="1"||procState=="2"||procState=="100"){
    	var attButtonArray = [];
    	if(procExecId!=objId){
    		attButtonArray = [{ text: "终止流程", clickEvent: function () { stopWorkflow(procExecId); } },
             { text: "暂停流程", clickEvent: function () { pauseWorkflow(procExecId); } }];
        }else{
        	attButtonArray = [{ text: "暂停流程", clickEvent: function () { pauseWorkflow(procExecId); } }];
        }
    	jQuery.extend(dialog, { attachButtons: attButtonArray});
    }
    dialog.controls = ["divDesignDetail"];
    dialog.onclosed = function () {
    	if (gTaskStatusInterVal != null)
            window.clearTimeout(gTaskStatusInterVal);
    	if (gTaskListInterVal != null)
            window.clearTimeout(gTaskListInterVal);
        gFlowView.clearView();
        gCurrentProcExec = null;
        gGridList.enableRemPosition=true;
        loadProcessExec();
    };
    dialog.showDialog();
    
    if (gLoadInterVal != null)
        window.clearTimeout(gLoadInterVal);
    
//    seachProcessRecords();
    loadProceeActivity();
}


//查找流程记录
var procesList = new jetsennet.ui.GridList("grid-processList");
function seachProcessRecords() {
	if (gTaskListInterVal != null)
        window.clearTimeout(gTaskListInterVal);
	
    var sqlQuery = new jetsennet.SqlQuery();
    var queryTable = jQuery.extend(new jetsennet.QueryTable(), { TableName: "WFM_TASKOVER", AliasName: "T1" });
//    queryTable.addJoinTable(jetsennet.createJoinTable("WFM_ACTIVITY", "T2", "T1.ACT_ID = T2.ACT_ID", jetsennet.TableJoinType.Left));
    queryTable.addJoinTable(jetsennet.createJoinTable("WFM_PROCACT", "T2", "T1.PROCACT_ID = T2.PROCACT_ID", jetsennet.TableJoinType.Left));

    var sqlCollection = new jetsennet.SqlConditionCollection();
    sqlCollection.add(jetsennet.SqlCondition.create("PROCEXEC_ID", gCurrentProcExec.procExecId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String));
    jQuery.extend(sqlQuery, { IsPageResult: 0, Conditions: sqlCollection, QueryTable: queryTable, 
    	ResultFields: "T2.PROCACT_NAME AS ACT_NAME,T1.EXECUTE_USER,T1.OLD_STATE,T1.OVER_STATE,T1.START_TIME,T1.END_TIME",OrderString: "Order By T1.END_TIME DESC" });

    var param = new HashMap();
    param.put("queryXml", sqlQuery.toXml());
    var sResult = MTCDAO.execute("commonXmlQuery", param);
    var xmlDoc = new jetsennet.XmlDoc();
    xmlDoc.loadXML(sResult.resultVal);
    el('processList').innerHTML = jetsennet.xml.transform("../xslt/wfm/processrecords.xsl", xmlDoc);
    procesList.bind(el("processList"), el("processTab"));
    
    gTaskListInterVal = window.setTimeout(seachProcessRecords, 5000);
}

/**
加载流程节点
*/
function loadProceeActivity(procExecId) {
	var param = new HashMap();
    param.put("procId", gCurrentProcExec.procId);
    param.put("procVer", gCurrentProcExec.procVer);
    var sResult = WFMDAO.execute("getProcess", param);
    if(sResult.errorCode==0){
    	setProcessXml(sResult.resultVal);
        getTaskStatus();
    }
}
/**
获取流程状态
*/
var logFlag = true;
function getTaskStatus() {
    if (gTaskStatusInterVal != null)
        window.clearTimeout(gTaskStatusInterVal);
    var records = getTaskStatusByTable("WFM_TASKEXEC");
    if(records&&records.length>0){
    	logFlag = false;
    	for (var i = 0; i < records.length; i++) {
    		var node = gFlowView.getNodeByNodeId(records[i].PROCACT_ID);
    		if (node != null) {
    			jQuery.extend(node.nodeParam, { id: records[i].PROCACT_ID, taskId: records[i].TASK_ID, state: records[i].TASK_STATE, progress: records[i].TASK_PERCENT || 0, stateDesc: records[i].TASK_DESC });
    			node.refreshNodeStatus();
    		}
    	}
    	gTaskStatusInterVal = window.setTimeout(getTaskStatus, 2000);
    }else{
    	var logRecords = getTaskStatusByTable("WFM_TASKLOG");
    	if(logRecords&&logRecords.length>0){
    		for (var i = 0; i < logRecords.length; i++) {
    			var node = gFlowView.getNodeByNodeId(logRecords[i].PROCACT_ID);
    			if (node != null) {
    				jQuery.extend(node.nodeParam, { id: logRecords[i].PROCACT_ID, taskId: logRecords[i].TASK_ID, state: logRecords[i].TASK_STATE, progress: logRecords[i].TASK_PERCENT || 0, stateDesc: logRecords[i].TASK_DESC });
    				node.refreshNodeStatus();
    			}
    		}
    		logFlag = true;
    		$("#task-show-win_button").css("display","none");
    		$("#task-show-win_content").css("height","351px");
    		if (gTaskStatusInterVal != null)
    			window.clearTimeout(gTaskStatusInterVal);
    		seachProcessRecords();
    		if (gTaskListInterVal != null)
    			window.clearTimeout(gTaskListInterVal);
    	}
    }
}

//异常操作状态(可能正在操作流程WFM_TASKEXEC,在查询就会报错，屏蔽异常提示)
var errorState = null;
function getTaskStatusByTable(tableName){
//	var tableName = (gCurrentProcExec.procState == 10 || gCurrentProcExec.procState == 11) ? "WFM_TASKLOG" : "WFM_TASKEXEC";
    var sqlQuery = new jetsennet.SqlQuery();
    var queryTable = jetsennet.createQueryTable(tableName, "t");
    jQuery.extend(sqlQuery, { IsPageResult: 0, QueryTable: queryTable, ResultFields: "TASK_ID,PROCACT_ID,TASK_STATE,TASK_PERCENT,TASK_DESC" });
    var sqlCollection = new jetsennet.SqlConditionCollection();
    sqlCollection.add(jetsennet.SqlCondition.create("PROCEXEC_ID", gCurrentProcExec.procExecId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String));
    sqlCollection.add(jetsennet.SqlCondition.create("ACT_ID", 10000, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Less, jetsennet.SqlParamType.Numeric));
    sqlQuery.Conditions = sqlCollection;
    var records = null;
    var resultHander = {
    	success : function(sResult){
    		errorState = null;
    		records = jetsennet.xml.toObject(sResult, "Record");
    	},
    	error:function(){errorState=-1;}
    };
    var param = new HashMap();
    param.put("queryXml", sqlQuery.toXml());
    MTCDAO.execute("commonXmlQuery", param , resultHander);
    return records;
}


/**
任务菜单
*/
function showTaskMenu(node, isSubFlow) {

    if (node && node.nodeParam && gCurrentProcExec.procState!=11 && gCurrentProcExec.procState!=5) {
        jQuery('#menuTask').hidepop().remove();
        var taskMenu = jQuery.extend(new jetsennet.ui.Menu(), { menuWidth: 100 });
        gCurrentTaskId = node.nodeParam.taskId;
        var nodeState = node.nodeParam.state;
        var actType = node.nodeParam.actType;
        var actionCallBack = isSubFlow ? "actionCallback2" : "actionCallback";

        if(node.nodeParam.actId != 531){
        	if (nodeState == 1 || nodeState == 5 || nodeState == 10 || nodeState == 7) {
        		taskMenu.addItem(jQuery.extend(new jetsennet.ui.MenuItem("打回任务"), { onclick: function () { WfmTaskOperate.rollbackTask(); } }));
        		taskMenu.addItem(jQuery.extend(new jetsennet.ui.MenuItem("跳过任务"), { onclick: function () { WfmTaskOperate.commitTask(); } }));
        		taskMenu.addItem(jQuery.extend(new jetsennet.ui.MenuItem("结束任务"), { onclick: function () { WfmTaskOperate.stopTask(); } }));
        	}
        }

        if (nodeState == 10 || nodeState == 5) {
            taskMenu.addItem(jQuery.extend(new jetsennet.ui.MenuItem("重新执行"), { onclick: function () { WfmTaskOperate.resetTask(); } }));
        }

        if (nodeState == 1 || nodeState == 5 || nodeState == 2) {
            taskMenu.addItem(jQuery.extend(new jetsennet.ui.MenuItem("停止任务"), { onclick: function () { WfmTaskOperate.pauseTask(); } }));
        }

        if (nodeState == 7) {
            taskMenu.addItem(jQuery.extend(new jetsennet.ui.MenuItem("恢复任务"), { onclick: function () { WfmTaskOperate.resumeTask(); } }));
        }

        if (actType == 1) {
            //taskMenu.addItem(jQuery.extend(new jetsennet.ui.MenuItem("指派任务"), { onclick: function () { taskAssign(node); } }));
        }

        if ((nodeState == 1 || nodeState == 2 || nodeState == 10) && node.nodeParam.actId == 9101) {
            taskMenu.addItem(jQuery.extend(new jetsennet.ui.MenuItem("查看子流程"),
            { onclick: jetsennet.bindFunction(this, function () { viewSubFlow(gCurrentTaskId, nodeState == 10 ? true : false); }) }));
        }

        if (taskMenu.items.length > 0) {
            taskMenu.render("menuTask").popup({direction:1});
        }
    }
}

// 设置流程xml
function setProcessXml(processXml) {

    gFlowView.clearView();
    var flowObj = jetsennet.xml.deserialize(processXml);
    gFlowView.workflowNode = gFlowView.createNodesByObject(flowObj);
    gFlowView.render();
}


//设置子流程xml
function setProcessXmlDailog(processXml) {

	gFlowViewDialog.clearView();
    var flowObj = jetsennet.xml.deserialize(processXml);
    gFlowViewDialog.workflowNode = gFlowViewDialog.createNodesByObject(flowObj);
    gFlowViewDialog.render();
}

var subCurrentParam;
//显示子流程
function viewSubFlow(taskId, isError) {
    var sqlQuery = new jetsennet.SqlQuery();
    var queryTable = jetsennet.createQueryTable(isError ? "WFM_PROCLOG" : "WFM_PROCEXEC", "p");
    queryTable.addJoinTable(jetsennet.createJoinTable("WFM_TASKEXEC", "t", "p.PARENT_TASKID = t.TASK_ID", jetsennet.TableJoinType.Left));

    jQuery.extend(sqlQuery, { IsPageResult: 0, QueryTable: queryTable, ResultFields: "p.PROCEXEC_ID,p.PROC_ID,OBJ_NAME,p.START_TIME,PROC_STATE,p.START_USER,STATE_DESC,p.PROC_VER" });
    var condition = new jetsennet.SqlConditionCollection();
    condition.SqlConditions.push(jetsennet.SqlCondition.create("t.TASK_ID", taskId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String));
    sqlQuery.Conditions = condition;

    var param = new HashMap();
    param.put("queryXml", sqlQuery.toXml());
    var sResult = MTCDAO.execute("commonXmlQuery", param);
    var xmlDoc = new jetsennet.XmlDoc();
    xmlDoc.loadXML(sResult.resultVal);
    el('divDesignList').innerHTML = jetsennet.xml.transform("../xslt/wfm/wfminfo.xsl", xmlDoc);
//    	gFlowViewDialog.clearView();
//    	hidProcExecId = "";
    
    var dialog = new jetsennet.ui.Window("task-show-win");
    jQuery.extend(dialog, { submitBox: false, cancelBox: true, maximizeBox: false, minimizeBox: false, showScroll: false, size: { width: 750, height: 0 }, title: "查看子流程" });
    dialog.controls = ["divDialog"];
    dialog.onclosed = function () {
    	if (gTaskStatusProcessInterVal != null)
    	    window.clearTimeout(gTaskStatusProcessInterVal);
    };
    dialog.show();
	var flowObj = jQuery.parseJSON(result).Record[0];
	viewSubProcess(flowObj.PROCEXEC_ID,flowObj.PROC_ID,flowObj.PROC_STATE,flowObj.PROC_VER);
}

var hidProcExecId = "";
//查看子流程=====================================================================
function viewSubProcess(procExecId,procId,procState,procVer) {
	subCurrentParam = { procExecId: procExecId, procId: procId, procState: procState};
	hidProcExecId = procExecId;
    var param = new HashMap();
    param.put("procId", procId);
    param.put("procVer",procVer);
    var sResult = WFMDAO.execute("getProcess", param);
    if(sResult.errorCode==0){
    	setProcessXmlDailog(sResult.resultVal);
        getTaskStatusProcess();
    }
}


/**
 * 查找子流程任务状态
 * @return
 */
function getTaskStatusProcess(){
    if (gTaskStatusProcessInterVal != null)
        window.clearTimeout(gTaskStatusProcessInterVal);

    var tableName = (subCurrentParam.procState == 10 || subCurrentParam.procState == 11) ? "WFM_TASKLOG" : "WFM_TASKEXEC";
    var sqlQuery = new jetsennet.SqlQuery();
    var queryTable = jetsennet.createQueryTable(tableName, "t");
    jQuery.extend(sqlQuery, { IsPageResult: 0, QueryTable: queryTable, ResultFields: "TASK_ID,PROCACT_ID,TASK_STATE,TASK_PERCENT,TASK_DESC" });
    var sqlCollection = new jetsennet.SqlConditionCollection();
    sqlCollection.add(jetsennet.SqlCondition.create("PROCEXEC_ID", subCurrentParam.procExecId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String));
    sqlCollection.add(jetsennet.SqlCondition.create("ACT_ID", 10000, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Less, jetsennet.SqlParamType.Numeric));
    sqlQuery.Conditions = sqlCollection;

    var param = new HashMap();
    param.put("queryXml", sqlQuery.toXml());
    var sResult = MTCDAO.execute("commonXmlQuery", param);
    if(sResult.errorCode==0){
    	var records = jetsennet.xml.toObject(sResult.resultVal, "Record");
        for (var i = 0; i < records.length; i++) {
            var node = gFlowViewDialog.getNodeByNodeId(records[i].PROCACT_ID);
            if (node != null) {
                jQuery.extend(node.nodeParam, { id: records[i].PROCACT_ID, taskId: records[i].TASK_ID, state: records[i].TASK_STATE, progress: records[i].TASK_PERCENT || 0, stateDesc: records[i].TASK_DESC });
                node.refreshNodeStatus();
            }
        }
        gTaskStatusProcessInterVal = window.setTimeout(getTaskStatusProcess, 5000);
    }
}


function loadSubWfTaskData(procexecid, isError) {

    var sqlQuery = new jetsennet.SqlQuery();
    var queryTable = jetsennet.createQueryTable(isError ? "WFM_TASKLOG" : "WFM_TASKEXEC", "p");
    jetsennet.extend(sqlQuery, { IsPageResult: 0, QueryTable: queryTable, ResultFields: "PROCACT_ID,TASK_DESC,TASK_STATE,EXECUTE_USER,PROC_TYPE,OBJ_ID,TASK_ID,START_TIME,END_TIME,BACK_TIMES,TASK_PERCENT" });
    var condition = new jetsennet.SqlConditionCollection();
    condition.SqlConditions.push(jetsennet.SqlCondition.create("PROCEXEC_ID", procexecid, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String));
    sqlQuery.Conditions = condition;

    el('tdSubCurTask').innerHTML = "";
    if (!gHasRightOfControlFlow || isError)
        el('sub_href_stop').style.display = "none";
    else {
        el('sub_href_stop').style.display = "";
    }

    //取得当前工作流信息            
    var param = new HashMap();
    param.put("queryXml", sqlQuery.toXml());
    var sResult = MTCDAO.execute("commonXmlQuery", param);
    if(sResult.errorCode==0){
    	var objs = jetsennet.xml.toObject(sResult.resultVal, "Record");
        if (objs != null) {
            var objLength = objs.length;
            for (var i = 0; i < objLength; i++) {
                var nodeId = objs[i].PROCACT_ID;
                var newNode = gWorkflowViewSub.getNodeByNodeId(nodeId);
                if (newNode != null && (newNode.nodeType == jetsennet.ui.WfNodeType.TaskNode || newNode.nodeType == jetsennet.ui.WfNodeType.TaskAutoNode)) {
                    newNode.nodeData.description = objs[i].TASK_DESC;
                    newNode.nodeData.nodeState = objs[i].TASK_STATE;
                    newNode.nodeData.executeUser = valueOf(objs[i], "EXECUTE_USER", "");
                    newNode.nodeData.objType = objs[i].PROC_TYPE;
                    newNode.nodeData.objId = objs[i].OBJ_ID;
                    newNode.nodeData.taskId = objs[i].TASK_ID;
                    newNode.nodeData.startTime = objs[i].START_TIME.substring(0, 19);
                    newNode.nodeData.endTime = objs[i].END_TIME.substring(0, 19);
                    newNode.nodeData.backTimes = objs[i].BACK_TIMES;
                    newNode.nodeData.taskPercent = objs[i].TASK_PERCENT;
                    //当前任务
                    if (newNode.nodeData.nodeState == "1" || newNode.nodeData.nodeState == "2" || newNode.nodeData.nodeState == "5" || newNode.nodeData.nodeState == "10") {
                        if (newNode.nodeData.nodeState == "2" && newNode.nodeData.taskPercent)
                            el('tdSubCurTask').innerHTML = newNode.nodeData.nodeName + "(" + newNode.nodeData.taskPercent + "%)";
                        else
                            el('tdSubCurTask').innerHTML = newNode.nodeData.nodeName;
                    }
                }
            }
        }
        else {
            jetsennet.ui.Windows.close("subflow-show-win");
        }
        gWorkflowViewSub.render();
    }
}

//终止子流程
function stopSubWorkflow() {
    jetsennet.confirm("确定终止当前流程?", function () {
    	var param = new HashMap();
        param.put("procExecId",gCurrentSubProcExecId);
        var sResult = RUNDAO.execute("stopFlow", param);
        if(sResult.errorCode==0){
        	jetsennet.message('操作成功!');
            jetsennet.ui.Windows.close("subflow-show-win");
        }
        return true;
    });
}

//结束工作流
function stopWorkflow(procexecId) {
	var procExecIds = jetsennet.Crud.getCheckIds(procexecId, "chk_Proc");
	if(procExecIds.length==0){
		jetsennet.alert("请选择要结束的流程!");
		return;
	}
	var procExecIdArray = [];
	var flag = true;
	var stopFlag = true;
	for ( var i = 0; i < procExecIds.length; i++) {
		if(procExecIds[i].split("@")[1]==10||procExecIds[i].split("@")[1]==11){
			flag = false;
			break;
		}
		if(procExecIds[i].split("@")[0]==procExecIds[i].split("@")[2]){
			stopFlag = false;
			break;
		}
		procExecIdArray.push(procExecIds[i].split("@")[0]);
	}
	if(!stopFlag){
		procExecIdArray = [];
		jetsennet.alert("默认策略流程不能终止,请重新选择!");
		return;
	}
	if(!flag){
		procExecIdArray = [];
		jetsennet.alert("已结束的流程不能终止,请重新选择!");
		return;
	}
    jetsennet.confirm("确定终止所选流程?", function () {
        var param = new HashMap();
        param.put("procExecId",procExecIdArray.join(","));
        var sResult = RUNDAO.execute("stopFlow", param);
        if(sResult.errorCode==0){
        	jetsennet.message('操作成功!');
		    loadProcessExec();
		    jetsennet.ui.Windows.close("task-show-win");
        }
        return true;
    });
}

//启动工作流
function startWorkflow(procexecId) {
    jetsennet.confirm("确定启动当前流程?", function () {
    	var param = new HashMap();
        param.put("procExecId",procexecId || gCurrentProcExec.procExecId);
        var sResult = RUNDAO.execute("startFlow", param);
        if(sResult.errorCode==0){
        	jetsennet.message('操作成功!');
		    loadProcessExec();
		    jetsennet.ui.Windows.close("task-show-win");
        }
        return true;
    });
}
//暂停工作流
function pauseWorkflow(procexecId) {
    jetsennet.confirm("确定暂停当前流程?", function () {
    	var param = new HashMap();
        param.put("procExecId",procexecId || gCurrentProcExec.procExecId);
        var sResult = RUNDAO.execute("pauseFlow", param);
        if(sResult.errorCode==0){
        	jetsennet.message('操作成功!');
		    loadProcessExec();
		    jetsennet.ui.Windows.close("task-show-win");
        }
        return true;
    });
}

function bindDropdownList(con, obj, tableName, valField, txtField) {
    var handing = ["请选择~"];
    if (obj != null && obj[tableName] != null) {
        var len = obj[tableName].length;
        if (len) {
            for (var i = 0; i < len; i++) {
                handing.push(obj[tableName][i][txtField] + "~" + obj[tableName][i][valField]);
            }
        }
        else {
            handing.push(obj[tableName][txtField] + "~" + obj[tableName][valField]);
        }
    }
    con.setAttribute("handing", handing.join("|"));
}

//结束工作流
function deleteWorkflow(procexecId) {
	var procExecIds = jetsennet.Crud.getCheckIds(procexecId, "chk_Proc");
	if(procExecIds.length==0){
		jetsennet.alert("请选择要删除的流程!");
		return;
	}
	var procExecIdArray = [];
	var flag = true;
	for ( var i = 0; i < procExecIds.length; i++) {
		if(procExecIds[i].split("@")[1]==0||procExecIds[i].split("@")[1]==1||procExecIds[i].split("@")[1]==2||procExecIds[i].split("@")[1]==5||procExecIds[i].split("@")[1]==100){
			flag = false;
			break;
		}
		procExecIdArray.push(procExecIds[i].split("@")[0]);
	}
	if(!flag){
		procExecIdArray = [];
		jetsennet.alert("未结束的的流程不能删除,请重新选择!");
		return;
	}
    jetsennet.confirm("确定删除所选流程?", function () {
        var params = new HashMap();
        params.put("className", "ProcLogBusiness");
        params.put("deleteIds", procExecIdArray.join(","));
        var sResult = MTCDAO.execute("commonObjDelete",params);
        if(sResult.errorCode==0){
        	jetsennet.message('操作成功!');
		    loadProcessExec();
        }
        return true;
    });
}

/**
 * 标记已经选上的
 */
var haveCheckedIds = [];
var _noteChecked = function () {
	var values = jetsennet.form.getCheckedValues("chk_Proc");
	haveCheckedIds = values;
};

/**
 * 重新选取
 */
var _reChecked = function () {
	if(haveCheckedIds.length>0)
	{
		$.each($(".jetsen-grid-body [name='chk_Proc']"), function(){
			if(haveCheckedIds.contains($(this).val()))
			{
				this.checked = true;
			}
		});
		haveCheckedIds = [];
	}
};

Array.prototype.in_array = function (e) {
    for (i = 0; i < this.length; i++) {
        if (this[i] == e)
            return true;
    }
    return false;
};  