jetsennet.require([ "gridlist", "pagebar", "window", "bootstrap/moment","bootstrap/daterangepicker", "crud","autocomplete", 
                    "datepicker", "menu", "tabpane","flowview"]);
    jetsennet.importCss("bootstrap/daterangepicker-bs3");
        var gLoadInterVal;
        var gTaskStatusInterVal;
        var gTaskListInterVal;
        var gCurrentProcExec = {};
        var gFlowView;
        var gCurrentTaskId = null;
        var gTaskPage = new jetsennet.ui.PageBar();
        
        var gSelectFlowAct;
        var gFlowActArr;
        
        gTaskPage.pageSize = 20;
        gTaskPage.orderBy = "ORDER BY t.START_TIME DESC";
        gTaskPage.currentPage = 1;
        gTaskPage.onpagechange = function () {
            loadTask();
        };
        gTaskPage.onupdate = function () {
            el('divPage').innerHTML = this.render();
        };
        var gTaskGridList = new jetsennet.ui.GridList();
        gTaskGridList.ondatasort = function(sortfield, desc) {
        	gTaskPage.setOrderBy(sortfield, desc);
        };
        
        var gSqlCollection;
        var gSqlQuery = new jetsennet.SqlQuery();
        var gQueryTable = jetsennet.createQueryTable("WFM_TASKEXEC", "t");
        gQueryTable.addJoinTable(jetsennet.createJoinTable("WFM_PROCEXEC", "f", "t.PROCEXEC_ID=f.PROCEXEC_ID", jetsennet.TableJoinType.Inner));
        gQueryTable.addJoinTable(jetsennet.createJoinTable("WFM_PROCACT", "c", "t.PROCACT_ID = c.PROCACT_ID AND f.PROC_VER = c.PROC_VER", jetsennet.TableJoinType.Inner));
        gQueryTable.addJoinTable(jetsennet.createJoinTable("WFM_ACTIVITY", "d", "c.ACT_ID = d.ACT_ID", jetsennet.TableJoinType.Inner));
        jQuery.extend(gSqlQuery, { IsPageResult: 1, KeyId: "TASK_ID", PageInfo: gTaskPage, QueryTable: gQueryTable, 
        ResultFields: "t.TASK_ID,t.PROCEXEC_ID,t.PROC_TYPE ,t.OBJ_ID,t.EXECUTE_USER,t.TASK_STATE,t.START_TIME,t.END_TIME,t.TASK_PERCENT,t.TASK_DESC,f.OBJ_NAME,f.PROC_ID,f.START_USER,f.PROC_STATE,f.START_TIME as CREATE_TIME,c.PROCACT_NAME,d.ACT_CLASS" });
        var gPane;
        var gCurDate = new Date();
        var gLastWeekDate = null;
        function pageInit() {
//        	var bodyWidthStr = jQuery("#divPageFrame").css("width");
//        	var bodyWidth = parseInt(bodyWidthStr.substring(0,bodyWidthStr.length-2));
//        	jQuery("#divPageFrame").pageFrame({ showSplit :false,minSize: { width: bodyWidth>1100?1100:bodyWidth, height: 300},splitType: 1,layout: [200, {splitType: 1, layout: [45, "auto"]}, 35]}).sizeBind(window);
        	
        	jQuery("#txtStartTime").pickDate();
        	jQuery("#txtEndTime").pickDate();
            jetsennet.ui.DropDownList.initOptions("txtProcess", true);
            jetsennet.ui.DropDownList.initOptions("labCurrentTask", true);
            gLastWeekDate = new Date(gCurDate.getTime() - 6 * 24 * 3600 * 1000);
            el('txtStartTime').value = new Date().toDateString(); 
            el('txtEndTime').value = new Date().toDateString(); 
            gPane = new jetsennet.ui.TabPane(el('tabPane'), el('tabPage'));
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
			initWfView();  
            loadProcess();
            loadActivity();
            searchTask();
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
        }

// 初始化界面
function initWfView() {

    //初始化流程视图
    gFlowView = new jetsennet.ui.WfView(el("divDesign"), 742, 380);
    gFlowView.isDesignMode = false;
    gFlowView.showStartEndNode = false;
    gFlowView.enableScale = false;
    gFlowView.align = "left-middle";
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
}

//加载流程类型
function loadProcess() {
    var collection = [];
    collection.push(["PROC_STATE", "0,1", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.NotIn, jetsennet.SqlParamType.Numeric]);
    var objs = WFMDAO.queryObjs("commonXmlQuery", "PROC_ID", "WFM_PROCESS", null, null,collection, "PROC_ID,PROC_NAME,PROC_STATE","Order By PROC_TYPE,PROC_STATE");
    if (objs && objs.length > 0) {
        jetsennet.ui.DropDownList["txtProcess"].clear();
        jetsennet.ui.DropDownList["txtProcess"].appendItem({ text: '所有流程', value: "-1" });
        for (var i = 0; i < objs.length; i++) {
            if (objs[i].PROC_STATE == "0" || objs[i].PROC_STATE == "1") {
                continue;
            }
            jetsennet.ui.DropDownList["txtProcess"].appendItem({ text: objs[i].PROC_NAME, value: objs[i].PROC_ID });
        }
        jetsennet.ui.DropDownList["txtProcess"].setSelectedIndex(0);
    }
    
    jetsennet.ui.DropDownList["txtProcess"].onchanged=function(){
    	gSelectFlowAct={};
    	var procId = jetsennet.ui.DropDownList["txtProcess"].selectedValue;
    	var procSelect=false;
    	if(procId!="-1"){
    		var vJointables=[["WFM_PROCESS", "B", "B.PROC_ID=A.PROC_ID", jetsennet.TableJoinType.Left]];
        	var collection = [["B.PROC_ID",procId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]];
        	var ActIDS=WFMDAO.queryObjs("commonXmlQuery", "ACT_ID", "WFM_PROCACT", "A", vJointables,collection, "ACT_ID","ORDER BY ACT_ID");
        	
        	if(ActIDS&&ActIDS.length>0){
        		for(var i=0;i<ActIDS.length;i++){
        			var actid=ActIDS[i].ACT_ID;
        			gSelectFlowAct[actid]=ActIDS[i];
        		}
        	}
        	procSelect=true;
    	}
    	
    	loadActivity(procSelect);
    };
}

//切换工作流程，刷新流程节点列表
function loadActivity(procSelect) {
	var actId = jetsennet.ui.DropDownList["labCurrentTask"].selectedValue;
	actId=actId?actId:"-1";
    jetsennet.ui.DropDownList["labCurrentTask"].clear();
    if(!gFlowActArr){
    	var collection = [];
    	collection.push(["t.ACT_TYPE", "1,2,3", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.In, jetsennet.SqlParamType.Numeric]);
    	gFlowActArr = WFMDAO.queryObjs("commonXmlQuery", "ACT_ID", "WFM_ACTIVITY", "t", null,collection,"t.ACT_NAME,t.ACT_ID");    	
    }
    
    if (gFlowActArr && gFlowActArr.length > 0) {
        jetsennet.ui.DropDownList["labCurrentTask"].clear();
        jetsennet.ui.DropDownList["labCurrentTask"].appendItem({ text: '所有节点', value: "-1" });

        for (var i = 0; i < gFlowActArr.length; i++) {
        	if(procSelect&&!gSelectFlowAct[gFlowActArr[i].ACT_ID]){
        		if(actId==gFlowActArr[i].ACT_ID){
        			actId="-1";
        		}
        		continue;
        	}
        	
            jetsennet.ui.DropDownList["labCurrentTask"].appendItem({ text: gFlowActArr[i].ACT_NAME, value: gFlowActArr[i].ACT_ID });
        }
        jetsennet.ui.DropDownList["labCurrentTask"].setValue(actId);
    }
}

//搜索任务
function searchTask() {
    if(illegalityTime(el("txtStartTime").value, el("txtEndTime").value)){
    	jetsennet.alert("开始时间不能大于结束时间！");
		return;
	}
    gSqlCollection = new jetsennet.SqlConditionCollection();
    var procId = jetsennet.ui.DropDownList["txtProcess"].selectedValue;
    if (procId != -1) {
        gSqlCollection.add(jetsennet.SqlCondition.create("f.PROC_ID", procId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric));
    }
    var procactId = jetsennet.ui.DropDownList["labCurrentTask"].selectedValue;
    if (procactId != -1) {
        gSqlCollection.add(jetsennet.SqlCondition.create("t.ACT_ID", procactId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric));
    }
    if (el('txtObjName').value != "") {
        gSqlCollection.add(jetsennet.SqlCondition.create("f.OBJ_NAME", el('txtObjName').value, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.ILike, jetsennet.SqlParamType.String));
    }
    if (el('txtStartTime').value != "") {
        gSqlCollection.add(jetsennet.SqlCondition.create("t.START_TIME", el('txtStartTime').value + " 00:00:00", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Than, jetsennet.SqlParamType.DateTime));
    }
    if (el('txtEndTime').value != "") {
        gSqlCollection.add(jetsennet.SqlCondition.create("t.START_TIME", el('txtEndTime').value + " 23:59:59", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Less, jetsennet.SqlParamType.DateTime));
    }

    var stateVal = jetsennet.form.getCheckedValues("chkState");
    var checkStateVal = "," + stateVal + ",";

    if (stateVal != "" && checkStateVal.indexOf(",-1,") < 0) {
        gSqlCollection.add(jetsennet.SqlCondition.create("t.TASK_STATE", stateVal, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.In, jetsennet.SqlParamType.Numeric));
    }

    gSqlCollection.add(jetsennet.SqlCondition.create("d.ACT_TYPE", "1,2,3", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.In, jetsennet.SqlParamType.Numeric));
    gTaskPage.currentPage = 1;
    loadTask();
}



var columns = [{ fieldName: "TASK_ID,TASK_STATE", width: 40, align: "center", isCheck: 1, checkName: "chk_Task", format:function(val, vals){
    return vals[0] + "," + vals[1];
		}},
		{ fieldName: "OBJ_NAME", sortField: "OBJ_NAME",width: "100%", align: "left", name: "任务名称"},
		{ fieldName: "PROCACT_NAME", sortField: "PROCACT_NAME", width: 180, align: "left", name: "任务节点"},
		{ fieldName: "EXECUTE_USER", sortField: "EXECUTE_USER", width: 100, align: "left", name: "执行者", format:function(val, vals){
		    return val||"--";
		}},
		{ fieldName: "START_TIME", sortField: "t.START_TIME", width: 150, align: "center", name: "任务执行开始时间",format:function(val, vals){
			 return val||"--";
		}},
		{ fieldName: "END_TIME,TASK_STATE", sortField: "t.END_TIME", width: 150, align: "center", name: "任务执行结束时间",format:function(val, vals){
			if(vals[1]==3||vals[1]==6){
				return val;
			}
			return "--";
		}},
		{ fieldName: "TASK_STATE,TASK_PERCENT", sortField: "TASK_STATE", width: 100, align: "center", name: "任务状态",format:function(val, vals){
		    if(val == 0) {
		        return "<font style=\"color:#388fc8\">未就绪</font>";
		    }
		    if(val == 1) {
		        return "<font style=\"color:#faa827\">等待</font>";
		    }
		    if(val == 2) {
		    	return "执行中";
		    }
		    if(val == 3) {
		    	return "<font style=\"color:#aeb1ae\">结束</font>";
		    }
		    if(val == 4) {
		        return "<font style=\"color:#0d8612\">打回</font>";
		    }
		    if(val == 5) {
		        return "<font style=\"color:red\">被打回</font>";
		    }
		    if(val == 6) {
		        return "<font style=\"color:#f8fa3e\">强制结束</font>";
		    }
		    if(val == 7) {
		        return "<font style=\"color:fc2a3e\">暂停</font>";
		    }
		    if(val == 10) {
		    	return "<font style=\"color:#fc2a3e\">错误</font>";
		    }
		    return val;
		}},
		{ fieldName: "TASK_DESC", sortField: "TASK_DESC", width: 250, align: "left", title:true, name: "状态描述",format: function(val,vals){
			return val||"--";
		}},
		{ fieldName: "TASK_ID", width: 80, align: "center", name: "流程查看", format: function(val,vals){
		    return "<img style=\"cursor:pointer;\" src=\"../images/cel_info.png\" title=\"查看\" " +
		    		"onclick=\"viewProcess('"+vals[0]+"')\"></img>" ;
		}}];
var gTaskGridList = jQuery.createGridlist("divList", columns); //表格对象，自动生成
gTaskGridList.ondatasort = function(sortfield, desc) {
	gTaskPage.setOrderBy(sortfield, desc);
};


//加载任务列表
function loadTask() {
    if (gLoadInterVal != null)
        window.clearTimeout(gLoadInterVal);

    $('chk_Task-all').checked = false;
    _noteChecked();
    gSqlQuery.OrderString = gTaskPage.orderBy;
    gSqlQuery.Conditions = gSqlCollection;

    var param = new HashMap();
    param.put("queryXml", gSqlQuery.toXml());
    param.put("startPageNum", (gTaskPage.currentPage - 1));
    param.put("pageSize", gTaskPage.pageSize);
    var sResult = MTCDAO.execute("commonQueryForPage", param);
    var xmlDoc = new jetsennet.XmlDoc();
    xmlDoc.loadXML(sResult.resultVal);
    var count = xmlDoc.documentElement.getAttribute("TotalCount");
    gTaskGridList.renderXML(xmlDoc);
    gTaskPage.setRowCount(count);
    _reChecked();
    gLoadInterVal = window.setTimeout(function(){
    	gTaskGridList.enableRemPosition=true;
    	loadTask();
    }, 30000);
}

//查看流程=====================================================================
//PROCEXEC_ID,PROC_ID,OBJ_NAME,START_USER,CREATE_TIME,PROC_TYPE,OBJ_ID,PROC_STATE
//procExecId, procId, objName, createUser, createTime, objType, objId, procState
function viewProcess(taskId) {
	var procExecId,procId, objName, createUser, createTime, objType, objId, procState,procVer;
	var queryTableView;
	var sqlQueryView = new jetsennet.SqlQuery();
	var sqlCollectionView = new jetsennet.SqlConditionCollection();
	sqlCollectionView.add(jetsennet.SqlCondition.create("t.TASK_ID", taskId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String));
    queryTableView = jetsennet.createQueryTable("WFM_TASKEXEC", "t");
    queryTableView.addJoinTable(jetsennet.createJoinTable("WFM_PROCEXEC", "f", "t.PROCEXEC_ID=f.PROCEXEC_ID", jetsennet.TableJoinType.Inner));
    jQuery.extend(sqlQueryView, { IsPageResult: 0, QueryTable: queryTableView, Conditions: sqlCollectionView, 
    ResultFields: "t.PROCEXEC_ID,t.PROC_TYPE ,t.OBJ_ID,f.OBJ_NAME,f.PROC_ID,f.START_USER,f.PROC_STATE,f.START_TIME,f.PROC_VER" });
    
    var paramc = new HashMap();
    paramc.put("queryXml", sqlQueryView.toXml());
    var resultc = MTCDAO.execute("commonXmlQuery", paramc);
    var records = jetsennet.xml.toObject(resultc.resultVal, "Record");
    if (records && records.length) {
    	procExecId = records[0].PROCEXEC_ID; 
    	procId = records[0].PROC_ID; 
    	objName = records[0].OBJ_NAME;
    	createUser = records[0].START_USER;
    	createTime = records[0].START_TIME;
    	objType = records[0].PROC_TYPE;
    	objId = records[0].OBJ_ID;
    	procState = records[0].PROC_STATE;
    	procVer = records[0].PROC_VER;
    }
	gPane.select(0);
    gCurrentProcExecId = procExecId;
    gCurrentProcExec = { procExecId: procExecId, procId: procId,procState:procState,procVer:procVer};
    el('processList').innerHTML = "";
    //检视工作流    
    var dialog = new jetsennet.ui.Window("task-show-win");
    $.extend(dialog, { submitBox: false, cancelBox: false, windowStyle: 1,maximizeBox: false, minimizeBox: false, showScroll: false, size: { width: 750, height: 500 }, title: "查看流程  -【"+jetsennet.xml.htmlEscape(objName)+"】" });
    if(procState=="0"||procState=="5"){
    	jQuery.extend(dialog, { attachButtons: [{ text: "启动流程", clickEvent: function () { startWorkflow(procExecId); } }]});
    }else if(procState=="1"||procState=="2"){
    	var attButtonArray = [];
    	if(procExecId!=objId){
    		attButtonArray = [{ text: "终止流程", clickEvent: function () { stopWorkflow(procExecId); } },
             { text: "暂停流程", clickEvent: function () { pauseWorkflow(procExecId); } }];
        }else{
        	attButtonArray = [{ text: "暂停流程", clickEvent: function () { pauseWorkflow(procExecId); } }];
        }
    	jQuery.extend(dialog, { attachButtons: attButtonArray});
    }
    dialog.controls = ["divDialog"];
    dialog.onclosed = function () {
        if (gTaskStatusInterVal != null)
            window.clearTimeout(gTaskStatusInterVal);
        if (gTaskListInterVal != null)
        	window.clearTimeout(gTaskListInterVal);
        gTaskGridList.enableRemPosition=true;
        loadTask();
    };
    dialog.showDialog();
  
    if (gLoadInterVal != null)
        window.clearTimeout(gLoadInterVal);

//    seachProcessRecords();
    loadProceeActivity();
}

//加载流程节点
function loadProceeActivity() {
	var param = new HashMap();
    param.put("procId", gCurrentProcExec.procId);
    param.put("procVer", gCurrentProcExec.procVer);
    var sResult = WFMDAO.execute("getProcess", param);
    if(sResult.errorCode==0){
    	setProcessXml(sResult.resultVal);
        getTaskStatus();
    }
}

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
    	gTaskStatusInterVal = window.setTimeout(getTaskStatus, 5000);
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

function showTaskMenu(node, isSubFlow) {

    if (node && node.nodeParam&& gCurrentProcExec.procState!=11 && gCurrentProcExec.procState!=5) {
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

//        if ((nodeState == 1 || nodeState == 2 || nodeState == 10) && node.nodeParam.actId == 9101) {
//            taskMenu.addItem(jQuery.extend(new jetsennet.ui.MenuItem("查看子流程"),
//            { onclick: jetsennet.bindFunction(this, function () { viewSubFlow(gCurrentTaskId, nodeState == 10 ? true : false); }) }));
//        }

        if (taskMenu.items.length > 0) {
            taskMenu.render("menuTask").popup({direction:1});
        }
    }
}


//结束工作流
function stopWorkflow(procexecId) {
    jetsennet.confirm("确定终止当前流程?", function () {
    	var param = new HashMap();
        param.put("procExecId",procexecId || gCurrentProcExec.procExecId);
        var sResult = RUNDAO.execute("stopFlow", param);
        if(sResult.errorCode==0){
        	actionCallback();
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
        	actionCallback();
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
        	actionCallback();
        }
        return true;
    });
}

function actionCallback() {
    jetsennet.message('操作成功!');
    jetsennet.ui.Windows.close("task-show-win");
}

//查找流程记录
var gGridList = new jetsennet.ui.GridList();
function seachProcessRecords() {
	if (gTaskListInterVal != null)
        window.clearTimeout(gTaskListInterVal);
	
    var sqlQuery = new jetsennet.SqlQuery();
    var queryTable = jQuery.extend(new jetsennet.QueryTable(), { TableName: "WFM_TASKOVER", AliasName: "T1" });
//    queryTable.addJoinTable(jetsennet.createJoinTable("WFM_ACTIVITY", "T2", "T1.ACT_ID = T2.ACT_ID", jetsennet.TableJoinType.Left));
    queryTable.addJoinTable(jetsennet.createJoinTable("WFM_PROCACT", "T2", "T1.PROCACT_ID = T2.PROCACT_ID", jetsennet.TableJoinType.Left));

    var sqlCollection = new jetsennet.SqlConditionCollection();
    sqlCollection.add(jetsennet.SqlCondition.create("PROCEXEC_ID", gCurrentProcExecId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String));
    jQuery.extend(sqlQuery, { IsPageResult: 0, Conditions: sqlCollection, QueryTable: queryTable, 
    	ResultFields: "T2.PROCACT_NAME AS ACT_NAME,T1.EXECUTE_USER,T1.OLD_STATE,T1.OVER_STATE,T1.START_TIME,T1.END_TIME",OrderString: "Order By T1.END_TIME DESC" });

    var param = new HashMap();
    param.put("queryXml", sqlQuery.toXml());
    var sResult = MTCDAO.execute("commonXmlQuery", param);
    var xmlDoc = new jetsennet.XmlDoc();
    xmlDoc.loadXML(sResult.resultVal);
    el('processList').innerHTML = jetsennet.xml.transform("../xslt/wfm/processrecords.xsl", xmlDoc);
    gGridList.bind(el("processList"), el("processTab"));
    
    gTaskListInterVal = window.setTimeout(seachProcessRecords, 5000);
}

//重新执行任务
function reexecTasks(taskId) {
	var taskIds = jetsennet.Crud.getCheckIds(taskId, "chk_Task");
    if(taskIds.length==0){
		jetsennet.alert("请选择要重新执行的任务!");
		return;
	}
    var valueArray = [];
	var flag = true;
	for ( var i = 0; i < taskIds.length; i++) {
		if(taskIds[i].split(",")[1]!=5&&taskIds[i].split(",")[1]!=10){
			flag = false;
			break;
		}
		valueArray.push(taskIds[i].split(",")[0]);
	}
	if(!flag){
		valueArray = [];
		jetsennet.alert("只有被打回、错误状态可以进行重复执行操作,请重新选择!");
		return;
	}
    if(valueArray.length>0){
    	var param = new HashMap();
        param.put("taskId",valueArray.join(","));
        param.put("resetNote","");
        param.put("processUser",jetsennet.Application.userInfo.UserName);
        param.put("processUserId",jetsennet.Application.userInfo.LoginId);
        var sResult = RUNDAO.execute("resetTask", param);
        if(sResult.errorCode==0){
        	jetsennet.message('操作成功!');
        }
        loadTask();
    }
}
//打回任务
function backTasks(taskId) {
	var taskIds = jetsennet.Crud.getCheckIds(taskId, "chk_Task");
    if(taskIds.length==0){
		jetsennet.alert("请选择要打回的任务!");
		return;
	}
    var valueArray = [];
	var flag = true;
	for ( var i = 0; i < taskIds.length; i++) {
		if(taskIds[i].split(",")[1]!=1&&taskIds[i].split(",")[1]!=5&&taskIds[i].split(",")[1]!=10&&taskIds[i].split(",")[1]!=7){
			flag = false;
			break;
		}
		valueArray.push(taskIds[i].split(",")[0]);
	}
	if(!flag){
		valueArray = [];
		jetsennet.alert("只有等待、被打回、暂停、错误状态可以进行打回操作,请重新选择!");
		return;
	}
	var areaElements = jetsennet.form.getElements('divTaskBack');
    jetsennet.form.resetValue(areaElements);
    jetsennet.form.clearValidateState(areaElements);
    var dialog = new jetsennet.ui.Window("task-back-win");
    jQuery.extend(dialog, { submitBox: true, cancelBox: true, windowStyle: 1, maximizeBox: false, minimizeBox: false, size: { width: 440, height: 0 }, showScroll: false, title: "打回任务" });
    dialog.controls = ["divTaskBack"];
    dialog.onsubmit = function () {
    	if (jetsennet.form.validate(areaElements, true)) {
    		if(valueArray.length>0){
    	    	var param = new HashMap();
    	        param.put("taskId",valueArray.join(","));
    	        param.put("backTaskId","");
    	        param.put("backNote",el('txtBackDesc').value);
    	        param.put("processUser",jetsennet.Application.userInfo.UserName);
    	        param.put("processUserId",jetsennet.Application.userInfo.LoginId);
    	        var sResult = RUNDAO.execute("pushBackTask", param);
    	        if(sResult.errorCode==0){
    	        	jetsennet.message('操作成功!');
    	        	jetsennet.ui.Windows.close("task-back-win");  
    	        }
    	        loadTask();
    	    }
    	};
    };
    dialog.showDialog();
}
//跳过当前任务
function commitTasks(taskId) {
    var taskIds = jetsennet.Crud.getCheckIds(taskId, "chk_Task");
    if(taskIds.length==0){
		jetsennet.alert("请选择要跳过的任务!");
		return;
	}
    var valueArray = [];
	var flag = true;
	for ( var i = 0; i < taskIds.length; i++) {
		if(taskIds[i].split(",")[1]!=1&&taskIds[i].split(",")[1]!=5&&taskIds[i].split(",")[1]!=10&&taskIds[i].split(",")[1]!=7){
			flag = false;
			break;
		}
		valueArray.push(taskIds[i].split(",")[0]);
	}
	if(!flag){
		valueArray = [];
		jetsennet.alert("只有等待、被打回、暂停、错误状态可以进行跳过操作,请重新选择!");
		return;
	}
    if(valueArray.length>0){
    	var param = new HashMap();
        param.put("taskId",valueArray.join(","));
        param.put("commitNote","");
        param.put("processUser",jetsennet.Application.userInfo.UserName);
        param.put("processUserId",jetsennet.Application.userInfo.LoginId);
        var sResult = RUNDAO.execute("commitTask", param);
        if(sResult.errorCode==0){
        	jetsennet.message('操作成功!');
        }
        loadTask();
    }
}

// 设置流程xml
function setProcessXml(processXml) {

    gFlowView.clearView();
    var flowObj = jetsennet.xml.deserialize(processXml);
    gFlowView.workflowNode = gFlowView.createNodesByObject(flowObj);
    gFlowView.render();
}

/**
 * 标记已经选上的
 */
var haveCheckedIds = [];
var _noteChecked = function () {
	var values = jetsennet.form.getCheckedValues("chk_Task");
	haveCheckedIds = values;
};

/**
 * 重新选取
 */
var _reChecked = function () {
	if(haveCheckedIds.length>0)
	{
		$.each($(".jetsen-grid-body [name='chk_Task']"), function(){
			if(haveCheckedIds.contains($(this).val()))
			{
				this.checked = true;
			}
		});
		haveCheckedIds = [];
	}
};