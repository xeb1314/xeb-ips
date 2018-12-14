jetsennet.require([ "gridlist", "pagebar", "window", "bootstrap/moment","syntaxhighlighter/shcore2","syntaxhighlighter/shBrushXml",
                    "bootstrap/daterangepicker", "crud","autocomplete", "datepicker","tabpane"]);
jetsennet.importCss("bootstrap/daterangepicker-bs3");

var gTaskLoadTime = 10000; //任务刷新时间 
var gTaskInterval;
var gCurrentTaskId;
        
var columns = [{ fieldName: "TASK_NAME", sortField: "TASK_NAME",title:true,width: "100%", align: "left", name: "任务名称"},
               { fieldName: "TASK_TYPE", sortField: "TASK_TYPE", width: 150, align: "left", name: "任务类型"},
               { fieldName: "TASK_STATE,TASK_PERCENT", sortField: "TASK_STATE", width: 100, align: "left", name: "任务状态", format:function(val, vals){
                   if(val==0||val==1||val==2){
                       return "新任务";
                   }
                   if(val==100){
                       var str = "执行中";
                       if(vals[1]!=0){
                           str += "("+vals[1]+"%)";
                       }
                       return str;
                   }
                   if(val==101){
                       return "执行中(异常)";
                   }
                   if(val==200){
                       return "成功";
                   }
                   if(val==210||val==220||val==230||val==240||val==250||val==500){
                       return "<font color='red'>失败</font>";
                   }
                   return val;
               }},
               { fieldName: "CREATE_TIME", sortField: "CREATE_TIME", width: 150, align: "center", name: "任务接收时间"},
               { fieldName: "START_TIME,TASK_STATE", sortField: "START_TIME", width: 150, align: "center", name: "任务执行开始时间",format:function(val, vals){
                   if(vals[1]==1||vals[1]==2){
                       return "--";
                   }
                   return val||"--";
               }},
               { fieldName: "END_TIME,TASK_STATE", sortField: "END_TIME", width: 150, align: "center", name: "任务执行结束时间",format:function(val, vals){
                   if(vals[1]==200||vals[1]==210){
                       return val;
                   }
                   return "--";
               }},
               { fieldName: "STATE_DESC,TASK_STATE", sortField: "STATE_DESC", width: 200, align: "left",title:true, name: "任务状态描述信息",format:function(val, vals){
                   return val||"--";
               }},
               { fieldName: "TASK_LEVEL,TASK_ID,TASK_STATE,PARENT_ID", sortField: "TASK_LEVEL", width: 80, align: "left", name: "优先级",format:function(val, vals){
            	   if(vals[2]<100&&vals[3]==""){
                       return val + "&nbsp;&nbsp;&nbsp;<img style=\"cursor:pointer;\" src=\"../images/cel_config.png\" title=\"优先级设置\" " +
                       "onclick=\"setTaskLevel('"+vals[1]+"','"+vals[0]+"')\"></img>" ;
                   }
                   return val;
               }},
               /*{ fieldName: "EXEC_MODE,TASK_STATE,TASK_ID", width: 60, align: "center", name: "子任务",format:function(val, vals){
            	   if(vals[0]==10){
                       if(vals[1]<100){
                           return "<img style=\"cursor:pointer;\" src=\"../images/cel_info.png\" title=\"子任务\" " +
                           "onclick=\"viewSubTask('"+vals[2]+"')\"></img>" ;
                       }else{
                    	   return "<img style=\"cursor:pointer;\" src=\"../images/cel_info.png\" title=\"子任务\" " +
                           "onclick=\"viewSubTaskLog('"+vals[2]+"')\"></img>" ;
                       }
            	   }
                   return "--";
               }},*/
               { fieldName: "TASK_STATE,TASK_ID", width: 45, align: "center", name: "详情", format: function(val,vals){
                   if(val<=100){
                       return "<img style=\"cursor:pointer;\" src=\"../images/cel_info.png\" title=\"查看\" " +
                       "onclick=\"viewTask('"+vals[1]+"')\"></img>" ;
                   }else{
                       return "<img style=\"cursor:pointer;\" src=\"../images/cel_info.png\" title=\"查看\" " +
                       "onclick=\"viewTasklog('"+vals[1]+"')\"></img>" ;
                   }
               }}];
var gTaskGridList = jQuery.createGridlist("divList", columns, "taskPage", 
       "ORDER BY CREATE_TIME DESC,TASK_STATE DESC,TASK_LEVEL DESC", function(){ loadTaskList(); }); //表格对象，自动生成
gTaskGridList.parentId = "";
gTaskGridList.idField = "TASK_ID";
gTaskGridList.parentField = "PARENT_ID";
gTaskGridList.treeControlIndex = 0;
gTaskGridList.treeOpenLevel = 1;

var gTaskPage = gTaskGridList.getPageBar();
gTaskGridList.ondatasort = function(sortfield, isDesc){
    gTaskPage.orderBy = "ORDER BY " + sortfield + (isDesc?" DESC":" ASC"); 
    loadTaskList();
};        
        
      
var gPane;
var gCurDate = new Date();
var gLastWeekDate = null;
var sqlQuery = new jetsennet.SqlQuery();

function pageInit() {
	jQuery("#txtStartTime").pickDate();
	jQuery("#txtEndTime").pickDate();
    jetsennet.ui.DropDownList.initOptions("txt_taskType", true);
    gPane = new jetsennet.ui.TabPane(el('tabPane'), el('tabPage'));
    loadCtrlWordType();
    gLastWeekDate = new Date(gCurDate.getTime() - 6 * 24 * 3600 * 1000);
    el('txtStartTime').value = gLastWeekDate.toDateString();
    el('txtEndTime').value = gCurDate.toDateString();
    getTaskList();
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

/**
* 获取任务列表
* 根据状态来判断是否联合查询历史表
*/
function getTaskList() {
	if(illegalityTime(el("txtStartTime").value, el("txtEndTime").value)){
		jetsennet.alert("开始时间不能大于结束时间！");
		return;
	}
    var conditions = new jetsennet.SqlConditionCollection();
    conditions.add(jetsennet.SqlCondition.create("PARENT_ID", null, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.IsNull, jetsennet.SqlParamType.String));
    if (jetsennet.ui.DropDownList["txt_taskType"].selectedValue != -1) {
        conditions.add(jetsennet.SqlCondition.create("TASK_TYPE", jetsennet.ui.DropDownList["txt_taskType"].selectedValue, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric));
    }

    if (el('txt_taskName').value != '') {
        conditions.add(jetsennet.SqlCondition.create("TASK_NAME", el('txt_taskName').value, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Like, jetsennet.SqlParamType.String));
    }
    if (el("txtStartTime").value != '') {
        conditions.add(jetsennet.SqlCondition.create("CREATE_TIME", el("txtStartTime").value + " 00:00:00", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.ThanEqual, jetsennet.SqlParamType.DateTime));
    }
    if (el("txtEndTime").value != '') {
        conditions.add(jetsennet.SqlCondition.create("CREATE_TIME", el("txtEndTime").value + " 23:59:59", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.LessEqual, jetsennet.SqlParamType.DateTime));
    }

    var stateVal = jetsennet.form.getCheckedValues("chkState");
    var checkStateVal = "," + stateVal + ",";
   
    if (stateVal!="" && checkStateVal.indexOf(",-1,") < 0) {
    	if(checkStateVal.indexOf(",1,")>-1){
    		stateVal += ",0,2";
    	}
    	if(checkStateVal.indexOf(",210,")>-1){
    		stateVal += ",220,230,240,250,500";
    	}
        conditions.add(jetsennet.SqlCondition.create("TASK_STATE", stateVal, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.In, jetsennet.SqlParamType.Numeric));
    }
    if (stateVal=="" || checkStateVal.indexOf(",-1,") >= 0 || checkStateVal.indexOf(",200,") >= 0 || checkStateVal.indexOf(",210,") >= 0 || checkStateVal.indexOf(",220,") >= 0) {

        var peSqlQuery = new jetsennet.SqlQuery();
        var peQueryTable = jQuery.extend(new jetsennet.QueryTable(), { TableName: "MTC_TASKEXEC", AliasName: "TE" });
        jQuery.extend(peSqlQuery, { ResultFields: "PARENT_ID,TASK_ID,TASK_NAME,TASK_TYPE,TASK_STATE,CREATE_TIME,START_TIME,END_TIME,TASK_LEVEL,TASK_PERCENT,EXEC_MODE,STATE_DESC", IsPageResult: 0, QueryTable: peQueryTable });

        var plSqlQuery = new jetsennet.SqlQuery();
        var plQueryTable = jQuery.extend(new jetsennet.QueryTable(), { TableName: "MTC_TASKLOG", AliasName: "TL" });
        jQuery.extend(plSqlQuery, { ResultFields: "PARENT_ID,TASK_ID,TASK_NAME,TASK_TYPE,TASK_STATE,CREATE_TIME,START_TIME,END_TIME,TASK_LEVEL,TASK_PERCENT,EXEC_MODE,STATE_DESC", IsPageResult: 0, QueryTable: plQueryTable });

        peSqlQuery.UnionQuery = new jetsennet.UnionQuery(plSqlQuery, jetsennet.QueryUnionType.Union);

        queryTable = jQuery.extend(new jetsennet.QueryTable(), { TableName: peSqlQuery.toXml(), AliasName: "T" });
    }
    else {
        queryTable = jQuery.extend(new jetsennet.QueryTable(), { TableName: "MTC_TASKEXEC", AliasName: "T" });
    }
    gTaskPage.currentPage = 1;
    jQuery.extend(sqlQuery, { IsPageResult: 1, KeyId: "TASK_ID",
        ResultFields: "PARENT_ID,TASK_ID,TASK_NAME,TASK_TYPE,TASK_STATE,CREATE_TIME,START_TIME,END_TIME,TASK_LEVEL,TASK_PERCENT,EXEC_MODE,STATE_DESC",
        QueryTable: queryTable, Conditions: conditions, PageInfo: gTaskPage, OrderString: " ORDER BY CREATE_TIME DESC,TASK_STATE ASC,TASK_LEVEL DESC"
    });
    loadTaskList();
}

function loadTaskList(){
	if(gTaskInterval){
		window.clearTimeout(gTaskInterval);
	}
	
	jQuery.extend(sqlQuery, { PageInfo: gTaskPage, OrderString: gTaskPage.orderBy });
	
	var param = new HashMap();
    param.put("queryXml", sqlQuery.toXml());
    param.put("startPageNum", (gTaskPage.currentPage - 1));
    param.put("pageSize", gTaskPage.pageSize);
    var sResult = MTCDAO.execute("commonQueryForPage", param);
    
    if(sResult.resultVal!=""){
	    var xmlDoc = new jetsennet.XmlDoc();
	    xmlDoc.loadXML(sResult.resultVal);
	    var nodes = xmlDoc.documentElement.selectNodes("Record");
	    var subtaskParentId = [];
	    var subtasklogParentId = [];
	    for ( var i = 0; i < nodes.length; i++) {
	    	var taskId = valueOf(nodes[i].selectSingleNode("TASK_ID"),"text", "");
	    	var execMode = valueOf(nodes[i].selectSingleNode("EXEC_MODE"),"text", "");
	    	var taskState = parseInt(valueOf(nodes[i].selectSingleNode("TASK_STATE"),"text", ""));
	    	if(execMode=="10" || execMode=="30"){
	    		taskState>100?subtasklogParentId.push(taskId):subtaskParentId.push(taskId);
	    	}
	    }
	    if(subtaskParentId.length>0){
		    var subXmlDoc = new jetsennet.XmlDoc();
		    subXmlDoc.loadXML(loadSubTaskList(subtaskParentId.join(","),false));
		    var subNodes = subXmlDoc.documentElement.selectNodes("Record");
		    for ( var i = 0; i < subNodes.length; i++) {
		    	xmlDoc.documentElement.appendChild(subNodes[i]);
		    }
	    }
	    if(subtasklogParentId.length>0){
		    var subXmlDoc = new jetsennet.XmlDoc();
		    subXmlDoc.loadXML(loadSubTaskList(subtasklogParentId.join(","),true));
		    var subNodes = subXmlDoc.documentElement.selectNodes("Record");
		    for ( var i = 0; i < subNodes.length; i++) {
		    	xmlDoc.documentElement.appendChild(subNodes[i]);
		    }
	    }
	    
	    nodes = xmlDoc.documentElement.selectNodes("Record");
	    for ( var i = 0; i < nodes.length; i++) {
	    	var taskType = valueOf(nodes[i].selectSingleNode("TASK_TYPE"),"text", "");
	    	if (taskType != null) {
	    		nodes[i].selectSingleNode("TASK_TYPE").text = gMtcTaskTypes[taskType] || taskType;
	        }
	    }
	    gTaskGridList.renderXML(xmlDoc);
    }
    gTaskInterval = setTimeout(function(){
    	gTaskGridList.enableRemPosition=true;
    	loadTaskList();
    }, gTaskLoadTime);
}


function loadSubTaskList(parentId,isLog){
	var conditions = new jetsennet.SqlConditionCollection();
    conditions.add(jetsennet.SqlCondition.create("PARENT_ID", parentId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.In, jetsennet.SqlParamType.String));

    var subSqlQuery = new jetsennet.SqlQuery();
    subSqlQuery.OrderString = 'ORDER BY TASK_NAME';
    jQuery.extend(subSqlQuery, { IsPageResult: 0, KeyId: "TASK_ID", PageInfo: null, Conditions: conditions, ResultFields: "TASK_ID,PARENT_ID,TASK_NAME,TASK_TYPE,TASK_STATE,CREATE_TIME,TASK_LEVEL,TASK_PERCENT,START_TIME,END_TIME,STATE_DESC,TASK_ACTOR",
        QueryTable: jQuery.extend(new jetsennet.QueryTable(), { TableName: isLog?"MTC_TASKLOG":"MTC_TASKEXEC" })
    });

    var subParam = new HashMap();
    subParam.put("queryXml", subSqlQuery.toXml());
    var subResult = MTCDAO.execute("commonXmlQuery", subParam);
    return subResult.resultVal;
}

/**
* 
* 详情查看
*/
function viewTask(taskId,isLog) {
	gPane.select(0);
	$("#resultTabPane").css("display","none");
	$("#resultxmlContent").css("display","none");
    var conditions = new jetsennet.SqlConditionCollection();
    conditions.add(jetsennet.SqlCondition.create("TASK_ID", taskId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String));
    
    var sqlQuery = new jetsennet.SqlQuery();
    jQuery.extend(sqlQuery, { IsPageResult: 0, KeyId: "TASK_ID", PageInfo: null, Conditions: conditions, ResultFields: "TASK_ID,TASK_NAME,TASK_GROUP,TASK_STATE,TASK_TYPE,TASK_LEVEL,APP_OBJSOURCE,APP_OBJTYPE,APP_OBJID,TASK_ACTOR,CREATE_USER,CREATE_TIME,END_TIME,STATE_DESC,TASK_XML",
        QueryTable: jQuery.extend(new jetsennet.QueryTable(), { TableName: isLog ? "MTC_TASKLOG" : "MTC_TASKEXEC" })
    });
    
    var param = new HashMap();
    param.put("queryXml", sqlQuery.toXml());
    var sResult = MTCDAO.execute("commonXmlQuery", param);
    var result = jetsennet.xml.toObject(sResult.resultVal, "Record");
    if(!result){
    	var sqlQuery1 = new jetsennet.SqlQuery();
    	jQuery.extend(sqlQuery1, { IsPageResult: 0, KeyId: "TASK_ID", PageInfo: null, Conditions: conditions, ResultFields: "TASK_ID,TASK_NAME,TASK_GROUP,TASK_STATE,TASK_TYPE,TASK_LEVEL,APP_OBJSOURCE,APP_OBJTYPE,APP_OBJID,TASK_ACTOR,CREATE_USER,CREATE_TIME,END_TIME,STATE_DESC,TASK_XML",
            QueryTable: jQuery.extend(new jetsennet.QueryTable(), { TableName: "MTC_TASKLOG"})
        });
    	var param1 = new HashMap();
        param1.put("queryXml", sqlQuery1.toXml());
        sResult = MTCDAO.execute("commonXmlQuery", param1);
        result = jetsennet.xml.toObject(sResult.resultVal, "Record");
    }
    var xmlDoc = new jetsennet.XmlDoc();
    xmlDoc.loadXML(sResult.resultVal);
    var nodes = xmlDoc.documentElement.selectNodes("Record");
    for ( var i = 0; i < nodes.length; i++) {
    	var taskType = valueOf(nodes[i].selectSingleNode("TASK_TYPE"),"text", "");
    	if (taskType != null) {
    		nodes[i].selectSingleNode("TASK_TYPE").text = gMtcTaskTypes[taskType] || taskType;
        }
    }
    el('taskxmlContentInDiv').innerHTML = '<textarea id="txtTaskXml" name="txtTaskXml" readonly="readonly" class="xml"></textarea>';
    var taskXml = '';
    if (result) {
    	var task = result[0];
    	if(task.TASK_STATE==200){
    		$("#resultTabPane").css("display","");
    		$("#resultxmlContent").css("display","");
    		showResultXml(taskId);  //显示结果xml
    	}
    	addTaskConten(task,xmlDoc);
    	taskXml = valueOf(task, "TASK_XML", "");
    	el('txtTaskXml').innerHTML = jetsennet.xml.htmlEscape(taskXml);
    }
    el('LogDetail').innerHTML = jetsennet.xml.transform("../xslt/mtc/taskdetail.xslt", xmlDoc);
    
    dp.sh.HighlightAll("txtTaskXml", false /* optional */, false /* optional */, false /* optional */, false /* optional */, false /* optional */);

    var dialog = new jetsennet.ui.Window("detail-window");
    jQuery.extend(dialog, { submitBox: false, cancelBox: false, maximizeBox: false, showScroll: false, windowStyle: 1, minimizeBox: false, title: "任务详细信息" });
    dialog.size = { width: 800, height: 0 };
    dialog.controls = ["divTaskDetail"];
    dialog.onclosed = function () {
        if (gTaskInterval)
            window.clearTimeout(gTaskInterval);
        gTaskGridList.enableRemPosition=true;
        loadTaskList();
    };
    dialog.showDialog();
    if(gTaskInterval){
		window.clearTimeout(gTaskInterval);
	}
}


/**
 * 显示结果xml
 * @param taskId
 */
function showResultXml(taskId){
	var conditions = new jetsennet.SqlConditionCollection();
    conditions.add(jetsennet.SqlCondition.create("TASK_ID", taskId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String));
	var sqlQuery1 = new jetsennet.SqlQuery();
	jQuery.extend(sqlQuery1, { IsPageResult: 0, KeyId: "RESULT_ID", PageInfo: null, Conditions: conditions, ResultFields: "RESULT_XML",
        QueryTable: jQuery.extend(new jetsennet.QueryTable(), { TableName: "MTC_TASKRESULT"})
    });
	var param1 = new HashMap();
    param1.put("queryXml", sqlQuery1.toXml());
    sResult = MTCDAO.execute("commonXmlQuery", param1);
    var result = jetsennet.xml.toObject(sResult.resultVal, "Record");
    var htmlArray = [];
    if (result) {
    	for ( var i = 0; i < result.length; i++) {
    		htmlArray.push('<textarea id="txtTaskXml'+i+'" name="txtTaskXml'+i+'" readonly="readonly" class="xml" style="width:100%;height:100%;"></textarea>');
    		if(i>10){
    			htmlArray.push("未显示所有结果信息");
    			break;
    		}
		}
    	
    	el('taskResultxmlContentInDiv').innerHTML = htmlArray.join('');
    	
    	for ( var j = 0; j < result.length; j++) {
    		var curResultVal = result[j].RESULT_XML;
    		if(curResultVal.indexOf("UQCFilePath")>-1){
    			var param2 = new HashMap();
    		    param2.put("UQCXml", curResultVal);
    		    var UQCResult = MTCDAO.execute("getUQCResult", param2);
    		    if(UQCResult.resultVal){
    		    	var resultHtml = UQCResult.resultVal;
    		    	var maxLen = result.length<5?2000:500;
    		    	
    		    	if(resultHtml.length>maxLen)
    		    	{
    		    		resultHtml = resultHtml.substring(0,maxLen);
    		    		resultHtml = resultHtml.substring(0,resultHtml.lastIndexOf(">")+1)+"...";
    		    	}
    		    	el('txtTaskXml'+j).innerHTML = resultHtml;
    		    }else{    		    	
    		    	el('txtTaskXml'+j).innerHTML = jetsennet.xml.htmlEscape(curResultVal);        			
    		    }    		    
    		}else{
    			var resultHtml = curResultVal;
    			var maxLen = result.length<5?2000:500;
    			
		    	if(resultHtml.length>maxLen)
		    	{
		    		resultHtml = resultHtml.substr(0,maxLen);
		    		resultHtml = resultHtml.substr(0,resultHtml.lastIndexOf(">")+1)+"...";
		    	}
    			el('txtTaskXml'+j).innerHTML = resultHtml;
    		}
    		dp.sh.HighlightAll("txtTaskXml"+j, false /* optional */, false /* optional */, false /* optional */, false /* optional */, false /* optional */);
    		if(j>10){break;}
		}
    }else{
    	htmlArray.push('<textarea id="txtTaskXmlNo" name="txtTaskXmlNo" readonly="readonly" class="xml"></textarea>');
    	el('taskResultxmlContentInDiv').innerHTML = htmlArray.join('');
    	el('txtTaskXmlNo').innerHTML = '';
    	dp.sh.HighlightAll("txtTaskXmlNo", false /* optional */, false /* optional */, false /* optional */, false /* optional */, false /* optional */);
    }
}


/**
* 
* 详情查看
*/
function viewTasklog(taskId) {
    viewTask(taskId,true);    
}

/**
* 
* 设定优先级
*/
function setTaskLevel(taskId,taskLevel,sub) {
    var areaElements = jetsennet.form.getElements('divLevel');
    jetsennet.form.clearValidateState(areaElements);
    
    jetsennet.ui.DropDownList.initOptions("txt_taskLevel");
	jetsennet.ui.DropDownList["txt_taskLevel"].setValue(taskLevel);
	    
    var dialog = new jetsennet.ui.Window("new-object-win");
    jQuery.extend(dialog, { submitBox: true, cancelBox: true, maximizeBox: false, minimizeBox: false, size: { width: 450, height: 0 }, title: "调整优先级", showScroll: false, windowStyle: 1 });
    dialog.controls = ["divLevel"];
    dialog.onsubmit = function () {
        if (jetsennet.form.validate(areaElements, true)) {
        	var param = new HashMap();
            param.put("taskId", taskId);
            param.put("taskLevel", attributeOf(el('txt_taskLevel'), "selectedvalue", "10"));
            var sResult = MTCDAO.execute("modifyTaskLevel", param);
            if(sResult.errorCode==0){
            	jetsennet.message('修改成功！');
		         dialog.close();
		         sub == undefined || sub == null ? loadTaskList() : getSubTaskList(gCurrentTaskId);
            }else{
            	jetsennet.message("操作失败!");
            }
        }
    };
    dialog.showDialog();
}

/**
* 
* 删除任务
*/
function deleteTask(taskId, sub) {
    jetsennet.confirm("确定删除吗？", function () {
    	var param = new HashMap();
        param.put("taskId", taskId);
        var sResult = MTCDAO.execute("deleteTask", param);
        if(sResult.errorCode==0){
        	 jetsennet.message('删除成功！');
	         sub == undefined || sub == null ? getTaskList() : getSubTaskList(gCurrentTaskId);
        }else{
        	jetsennet.message("操作失败!");
        }
        return true;
    });
}

/**
 * 手动下发任务
 */
function addTaskExec(){
	var areaElements = jetsennet.form.getElements('divAddTask');
    jetsennet.resetValue(areaElements);
    jetsennet.clearValidateState(areaElements);

    var dialog = new jetsennet.ui.Window("add-window");
    jQuery.extend(dialog, { submitBox: true, cancelBox: true, maximizeBox: false, minimizeBox: false, windowStyle: 1, showScroll: false, title: "添加任务" });
    dialog.size = { width: 500, height: 0 };
    dialog.controls = ["divAddTask"];
    dialog.onsubmit = function () {
        if (jetsennet.validate(areaElements, true)) {
        	var params = new HashMap();
            params.put("className", "TaskExecBusiness");
            params.put("saveXml", el("txtAddTaskXml").value);
            var sResult = MTCDAO.execute("commonObjInsert",params);
            if(sResult.errorCode==0){
            	jetsennet.message("新建成功！");
            	jetsennet.ui.Windows.close("add-window");
            	getTaskList();
            }
        }
    };
    dialog.showDialog();

    el("txtAddTaskXml").value = "";
}