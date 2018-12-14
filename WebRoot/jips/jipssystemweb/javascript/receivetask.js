jetsennet.require([ "gridlist", "pagebar", "window", "bootstrap/moment", "bootstrap/daterangepicker", "crud","autocomplete","datepicker",
                    "menu","tabpane", "jetsentree","flowview", "accordion","pageframe"]);
jetsennet.importCss("bootstrap/daterangepicker-bs3");

var gFunction;
var pJobInfo = new jetsennet.ui.PageBar("jobListPage");
pJobInfo.onpagechange = function () {
    loadJob();
};
pJobInfo.orderBy = " ORDER BY CREATE_TIME DESC";
pJobInfo.onupdate = function () {
    el('divJobPage').innerHTML = this.render();
};
pJobInfo.currentPage = 1;
//pJobInfo.pageSize = 7;
var gJobGridList = new jetsennet.ui.GridList();
gJobGridList.ondatasort = function(sortfield, desc) {
	pJobInfo.setOrderBy(sortfield, desc);
};

var pTaskInfo = new jetsennet.ui.PageBar("taskListPage");
pTaskInfo.onpagechange = function () {
    loadTask();
};
pTaskInfo.currentPage = 1;
pTaskInfo.orderBy = " ORDER BY CREATE_TIME DESC";
pTaskInfo.onupdate = function () {
    el('divTaskPage').innerHTML = this.render();
};
var gTaskGridList = new jetsennet.ui.GridList();
gTaskGridList.ondatasort = function(sortfield, desc) {
	pTaskInfo.setOrderBy(sortfield, desc);
};

var gSqlQuery;
var gCurDate = new Date();
var gLastWeekDate = null;

var gCurJob;
var gCurTask;

function pageInit() {
	jQuery("#divPageFrame").pageFrame({ 
		showSplit :false,minSize: { 
			width: 900, height: 0
			},splitType: 1,layout: 
			[{splitType: 1, layout: [45, 'auto', 35]},{splitType: 1, layout: [45, "auto",35]}]
		}).sizeBind(window);
	loadJob();
}

//------------工作-------------------
/**
*加载 工作列表
*/
function loadJob() {
//    el('divJobList').innerHTML = "";
//    pJobInfo.currentPage = 1;
    var sqlCollection = new jetsennet.SqlConditionCollection();
    gSqlQuery = new jetsennet.SqlQuery();
    var queryTable = jQuery.extend(new jetsennet.QueryTable(), { TableName: "IPS_JOB", AliasName: "J" });
    jQuery.extend(gSqlQuery, { IsPageResult: 1, PageInfo : pJobInfo ,OrderString: pJobInfo.orderBy,
        ResultFields: "J.*",
        QueryTable: queryTable, 
        Conditions: sqlCollection
    });
	
	var param = new HashMap();
    param.put("queryXml", gSqlQuery.toXml());
    param.put("startPageNum", pJobInfo.currentPage-1);
    param.put("pageSize", pJobInfo.pageSize);
    var sResult = IPSDAO.execute("commonQueryForPage", param);
    var xmlDoc = new jetsennet.XmlDoc();
//    xmlDoc.loadXML(sResult.resultVal.replaceAll("Records","RecordSet"));
    xmlDoc.loadXML(sResult.resultVal);
    var count = xmlDoc.documentElement.getAttribute("TotalCount");
    el('divJobList').innerHTML = jetsennet.xml.transform("xslt/cmsjob.xsl",xmlDoc);
    gJobGridList.bind(el("divJobList"), el("tabJob"));
    pJobInfo.setRowCount(count);
}

function newJob()
{
	var areaElements = jetsennet.form.getElements('divJob');
	jetsennet.form.resetValue(areaElements);
	jetsennet.form.clearValidateState(areaElements);

    var dialog = new jetsennet.ui.Window("new-object-win");
    $.extend(dialog, { submitBox: true, cancelBox: true, windowStyle: 1, maximizeBox: false, minimizeBox: false, size: { width: 410, height: 0 }, showScroll: false, title: "创建工作" });
    dialog.controls = ["divJob"];
    dialog.onsubmit = function () {
        if (jetsennet.validate(areaElements, true)) {
            if (jetsennet.util.isNullOrEmpty(el("txt_JOB_NAME").value)) {
                jetsennet.alert("请输入工作名称!");
                return false;
            }
            
            var conditions = [];
            conditions.push(['JOB_NAME', el('txt_JOB_NAME').value.trim(), jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Like]);
            var sResult = IPSDAO.query('commonXmlQuery', 'JOB_ID', 'IPS_JOB', null, null, conditions, 'JOB_ID');
            var objs = jetsennet.xml.toObject(sResult.resultVal, 'Record');
            if (objs.length > 0) {
                jetsennet.alert('工作名称已经存在，请重新输入!');
                return;
            }
            
            var jobInfo = {};
            jobInfo.JOB_NAME = el("txt_JOB_NAME").value;
            jobInfo.JOB_DESC = el("txt_JOB_DESC").value;
            jobInfo.CREATE_USER = jetsennet.application.userInfo.UserName;
            jobInfo.CREATE_USERID = jetsennet.application.userInfo.UserId;
            jobInfo.CREATE_TIME = new Date().toDateTimeString();

			var params = new HashMap();
            params.put("className", "IpsJobBusiness");
            params.put("saveXml", jetsennet.xml.serialize(jobInfo, "JobInfo"));
            var sResult = IPSDAO.execute("commonObjInsert",params);
            if(sResult && sResult.errorCode==0){
            	jetsennet.message("创建成功！");
                loadJob();
                jetsennet.ui.Windows.close("new-object-win");
            }else{
            	jetsennet.message("创建失败！");
            }
        }
    };
    dialog.showDialog();
}

/**
 * 

function editJob(obj)
{
	if(obj == null)
	{
		jetsennet.alert("请选中工作!");
		return;
	}
	
	var areaElements = jetsennet.form.getElements('divJob');
	jetsennet.form.resetValue(areaElements);
	jetsennet.form.clearValidateState(areaElements);
		
	el("txt_JOB_NAME").value = obj.getAttribute("jobName");
	el("txt_JOB_DESC").value = obj.getAttribute("jobDesc");

	var dialog = new jetsennet.ui.Window("new-object-win");
    $.extend(dialog, { submitBox: true, cancelBox: true, windowStyle: 1, maximizeBox: false, minimizeBox: false, size: { width: 410, height: 0 }, showScroll: false, title: "编辑工作" });
    dialog.controls = ["divJob"];
    dialog.onsubmit = function () {
		if (jetsennet.form.validate(areaElements, true)) {
			var jobInfo = {};
			jobInfo.JOB_ID = obj.getAttribute("jobId");
            jobInfo.JOB_NAME = el("txt_JOB_NAME").value;
            jobInfo.JOB_DESC = el("txt_JOB_DESC").value;
            jobInfo.UPDATE_USER = jetsennet.application.userInfo.UserName;
            jobInfo.UPDATE_USERID = jetsennet.application.userInfo.UserId;
            jobInfo.UPDATE_TIME = new Date().toDateTimeString();
            jobInfo.CREATE_USER = obj.getAttribute("createUser");
            jobInfo.CREATE_USERID = obj.getAttribute("createUserId");
            jobInfo.CREATE_TIME = obj.getAttribute("createTime");
            
            var params = new HashMap();
            params.put("className", "IpsJobBusiness");
            params.put("updateXml", jetsennet.xml.serialize(jobInfo, "JobInfo"));
            var sResult = IPSDAO.execute("commonObjUpdateByPk",params);
            if(sResult && sResult.errorCode==0){
            	jetsennet.message("编辑成功！");
                loadJob();
                jetsennet.ui.Windows.close("new-object-win");
            }else{
            	jetsennet.message("编辑失败！");
            }
		}	
	};
	dialog.showDialog();
}
 */

function editJob()
{
	if(gCurJob == null)
	{
		jetsennet.alert("请选择一个要编辑的工作!");
		return;
	}
	
	var areaElements = jetsennet.form.getElements('divJob');
	jetsennet.form.resetValue(areaElements);
	jetsennet.form.clearValidateState(areaElements);
		
	el("txt_JOB_NAME").value = gCurJob.jobName;
	el("txt_JOB_DESC").value = gCurJob.jobDesc;

	var dialog = new jetsennet.ui.Window("new-object-win");
    $.extend(dialog, { submitBox: true, cancelBox: true, windowStyle: 1, maximizeBox: false, minimizeBox: false, size: { width: 410, height: 0 }, showScroll: false, title: "编辑工作" });
    dialog.controls = ["divJob"];
    dialog.onsubmit = function () {
		if (jetsennet.form.validate(areaElements, true)) {
			var jobInfo = {};
			jobInfo.JOB_ID = gCurJob.jobId;
            jobInfo.JOB_NAME = el("txt_JOB_NAME").value;
            jobInfo.JOB_DESC = el("txt_JOB_DESC").value;
            jobInfo.UPDATE_USER = jetsennet.application.userInfo.UserName;
            jobInfo.UPDATE_USERID = jetsennet.application.userInfo.UserId;
            jobInfo.UPDATE_TIME = new Date().toDateTimeString();
            jobInfo.CREATE_USER = gCurJob.createUser;
            jobInfo.CREATE_USERID = gCurJob.createUserId;
            jobInfo.CREATE_TIME = gCurJob.createTime;
            
            var params = new HashMap();
            params.put("className", "IpsJobBusiness");
            params.put("updateXml", jetsennet.xml.serialize(jobInfo, "JobInfo"));
            var sResult = IPSDAO.execute("commonObjUpdateByPk",params);
            if(sResult && sResult.errorCode==0){
            	jetsennet.message("编辑成功！");
                loadJob();
                jetsennet.ui.Windows.close("new-object-win");
            }else{
            	jetsennet.message("编辑失败！");
            }
		}	
	};
	dialog.showDialog();
}

function delJob(jobId)
{
	var checkIds = jobId ? [jobId] : jetsennet.form.getCheckedValues("chk-Job");
    if (checkIds.length == 0) {
        jetsennet.alert("请选择要删除的工作！");
        return;
    }
    
     
    for(var i=0; i < checkIds.length; i++ )
    {
    	if(_checkTaskByJobId(checkIds[i]))return;
    }
    
    /**
     *
    var sqlCollection = new jetsennet.SqlConditionCollection();
    gSqlQuery = new jetsennet.SqlQuery();
    var queryTable = jQuery.extend(new jetsennet.QueryTable(), { TableName: "IPS_TASK", AliasName: "T" });
    jQuery.extend(gSqlQuery, { IsPageResult: 0, PageInfo : null , ResultFields: "T.*",
        QueryTable: queryTable, Conditions: sqlCollection
    });
	
	var param = new HashMap();
    param.put("queryXml", gSqlQuery.toXml());
    var sResult = IPSDAO.execute("queryTaskXmlByJobId", param);
    
	var xmlDoc = new jetsennet.XmlDoc();
    xmlDoc.loadXML(sResult.resultVal.replaceAll("Records","RecordSet"));
    var nodes = xmlDoc.documentElement.selectNodes("Record");
    if(nodes && nodes.length != 0)
    {
    	jetsennet.alert("当前工作下有任务，不能删除!");
    	return;
    }
    *
    * */
    
	jetsennet.confirm("确定删除所选工作?", function () {
        var params = new HashMap();
        params.put("className", "IpsJobBusiness");
        params.put("deleteIds", checkIds.join(","));
        var sResult = IPSDAO.execute("commonObjDelete",params);
        if(sResult.errorCode==0){
        	jetsennet.message('操作成功!');
		    loadJob();
        }
        return true;
    });
}

/**
 * 校验当前工作是否存在任务
 */
function _checkTaskByJobId(id){
	var tasks = IPSDAO.queryObjs("commonXmlQuery", "TASK_ID", "IPS_TASK", null, null, [[ "JOB_ID", id, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String ]], "TASK_ID");
    if (tasks&&tasks.length>0) {
		jetsennet.alert("当前工作下有任务，不能删除！");
		return true;
    }
    return false;
}

function selJob(row)
{
	el("txt_JOB_ID").value = row.getAttribute("jobId");
	
	gCurJob = null;
	gCurJob = {
		jobId : row.getAttribute("jobId"),
		jobName : row.getAttribute("jobName"),
		jobDesc : row.getAttribute("jobDesc"),
		createUser : row.getAttribute("createUser"),
		createUserId : row.getAttribute("createUserId"),
		createTime : row.getAttribute("createTime")
	}
	loadTask();
}

//------------任务-------------------
function loadTask() {
	var jobId = el("txt_JOB_ID").value;
    el('divTaskList').innerHTML = "";
    
    var queryTable = jQuery.extend(new jetsennet.QueryTable(), { TableName: "IPS_TASK", AliasName: "T" });
    var sqlCollection = new jetsennet.SqlConditionCollection();
    sqlCollection.add(jetsennet.SqlCondition.create("T.JOB_ID", jobId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal));
    gSqlQuery = new jetsennet.SqlQuery();
    jQuery.extend(gSqlQuery, { IsPageResult: 1, PageInfo : pTaskInfo ,OrderString: pTaskInfo.orderBy,
        ResultFields: "T.*",
        QueryTable: queryTable, Conditions: sqlCollection
    });
	
	var param = new HashMap();
  /*  param.put("queryXml", gSqlQuery.toXml());
    var sResult = IPSDAO.execute("queryTaskXmlForPage", param);*/
	    param.put("queryXml", gSqlQuery.toXml());
	    param.put("startPageNum", pTaskInfo.currentPage-1);
	    param.put("pageSize", pTaskInfo.pageSize);
	    var sResult = IPSDAO.execute("commonQueryForPage", param);
    var xmlDoc = new jetsennet.XmlDoc();
//    xmlDoc.loadXML(sResult.resultVal.replaceAll("Records","RecordSet"));
    xmlDoc.loadXML(sResult.resultVal);
    var count = xmlDoc.documentElement.getAttribute("TotalCount");
    el('divTaskList').innerHTML = jetsennet.xml.transform("xslt/cmstask.xsl",xmlDoc);
    gTaskGridList.bind(el("divTaskList"), el("tabTask"));
    pTaskInfo.setRowCount(count);
}

function newTask()
{
	if(typeof(gCurJob) == "undefined"){
		jetsennet.warn("请先选中任务对应的一个工作！");
		return;
	}
	var areaElements = jetsennet.form.getElements('divTask');
	jetsennet.form.resetValue(areaElements);
	jetsennet.form.clearValidateState(areaElements);

    var dialog = new jetsennet.ui.Window("new-object-win");
    $.extend(dialog, { submitBox: true, cancelBox: true, windowStyle: 1, maximizeBox: false, minimizeBox: false, size: { width: 410, height: 0 }, showScroll: false, title: "创建任务" });
    dialog.controls = ["divTask"];
    dialog.onsubmit = function () {
        if (jetsennet.validate(areaElements, true)) {
            if (jetsennet.util.isNullOrEmpty(el("txt_TASK_NAME").value)) {
                jetsennet.alert("请输入任务名称!");
                return false;
            }
            var taskInfo = {};
            taskInfo.TASK_NAME = el("txt_TASK_NAME").value;
            taskInfo.TASK_DESC = el("txt_TASK_DESC").value;
            taskInfo.TASK_STATE = 100;
            taskInfo.JOB_ID = el("txt_JOB_ID").value;
            taskInfo.CLASS_ID = "0";
            taskInfo.CREATE_USER = jetsennet.application.userInfo.UserName;
            taskInfo.CREATE_USERID = jetsennet.application.userInfo.UserId;
            taskInfo.CREATE_TIME = new Date().toDateTimeString();
            taskInfo.TASK_TYPE = el("txt_TASK_TYPE").value;

			var params = new HashMap();
            params.put("className", "IpsTaskBusiness");
            params.put("saveXml", jetsennet.xml.serialize(taskInfo, "TaskInfo"));
            var sResult = IPSDAO.execute("commonObjInsert",params);
            if(sResult && sResult.errorCode==0){
            	jetsennet.message("创建成功！");
                loadTask();
                jetsennet.ui.Windows.close("new-object-win");
            }else{
            	jetsennet.message("创建失败！");
            }
        }
    };
    dialog.showDialog();
}

/**
 * 
 
function editTask(obj)
{
	if(obj == null)
	{
		jetsennet.alert("请选中工作!");
		return;
	}
	
	var areaElements = jetsennet.form.getElements('divTask');
	jetsennet.form.resetValue(areaElements);
	jetsennet.form.clearValidateState(areaElements);
		
	el("txt_TASK_NAME").value = obj.getAttribute("taskName");
	el("txt_TASK_DESC").value = obj.getAttribute("taskDesc");

	var dialog = new jetsennet.ui.Window("new-object-win");
    $.extend(dialog, { submitBox: true, cancelBox: true, windowStyle: 1, maximizeBox: false, minimizeBox: false, size: { width: 410, height: 0 }, showScroll: false, title: "编辑工作" });
    dialog.controls = ["divTask"];
    dialog.onsubmit = function () {
		if (jetsennet.form.validate(areaElements, true)) {
			var taskInfo = {};
			taskInfo.TASK_ID = obj.getAttribute("taskId");
			taskInfo.TASK_NAME = el("txt_TASK_NAME").value;
            taskInfo.TASK_DESC = el("txt_TASK_DESC").value;
            taskInfo.JOB_ID = el("txt_JOB_ID").value;
            taskInfo.CLASS_ID = obj.getAttribute("classId");
            taskInfo.CREATE_USER = obj.getAttribute("createUser");
            taskInfo.CREATE_USERID = obj.getAttribute("createUserId");
            taskInfo.CREATE_TIME = obj.getAttribute("createTime");
            taskInfo.TASK_TYPE = obj.getAttribute("taskType");
            taskInfo.UPDATE_USER = jetsennet.application.userInfo.UserName;
            taskInfo.UPDATE_USERID = jetsennet.application.userInfo.UserId;
            taskInfo.UPDATE_TIME = new Date().toDateTimeString();
            
            var params = new HashMap();
            params.put("className", "IpsTaskBusiness");
            params.put("updateXml", jetsennet.xml.serialize(taskInfo, "TaskInfo"));
            var sResult = IPSDAO.execute("commonObjUpdateByPk",params);
            if(sResult && sResult.errorCode==0){
            	jetsennet.message("编辑成功！");
                loadTask();
                jetsennet.ui.Windows.close("new-object-win");
            }else{
            	jetsennet.message("编辑失败！");
            }
		}	
	};
	dialog.showDialog();
}
*/

function editTask()
{
	if(gCurTask == null)
	{
		jetsennet.alert("请选中任务!");
		return;
	}
	
	var areaElements = jetsennet.form.getElements('divTask');
	jetsennet.form.resetValue(areaElements);
	jetsennet.form.clearValidateState(areaElements);
		
	el("txt_TASK_NAME").value = gCurTask.taskName;
	el("txt_TASK_DESC").value = gCurTask.taskDesc;
	el("txt_TASK_TYPE").value = gCurTask.taskType;

	var dialog = new jetsennet.ui.Window("new-object-win");
    $.extend(dialog, { submitBox: true, cancelBox: true, windowStyle: 1, maximizeBox: false, minimizeBox: false, size: { width: 410, height: 0 }, showScroll: false, title: "编辑任务" });
    dialog.controls = ["divTask"];
    dialog.onsubmit = function () {
		if (jetsennet.form.validate(areaElements, true)) {
			var taskInfo = {};
			taskInfo.TASK_ID = gCurTask.taskId;
			taskInfo.TASK_NAME = el("txt_TASK_NAME").value;
            taskInfo.TASK_DESC = el("txt_TASK_DESC").value;
            taskInfo.JOB_ID = el("txt_JOB_ID").value;
            taskInfo.CLASS_ID = gCurTask.classId;
            taskInfo.CREATE_USER = gCurTask.createUser;
            taskInfo.CREATE_USERID = gCurTask.createUserId;
            taskInfo.CREATE_TIME = gCurTask.createTime;
            taskInfo.TASK_TYPE = el("txt_TASK_TYPE").value;
            taskInfo.UPDATE_USER = jetsennet.application.userInfo.UserName;
            taskInfo.UPDATE_USERID = jetsennet.application.userInfo.UserId;
            taskInfo.UPDATE_TIME = new Date().toDateTimeString();
            
            var params = new HashMap();
            params.put("className", "IpsTaskBusiness");
            params.put("updateXml", jetsennet.xml.serialize(taskInfo, "TaskInfo"));
            var sResult = IPSDAO.execute("commonObjUpdateByPk",params);
            if(sResult && sResult.errorCode==0){
            	jetsennet.message("编辑成功！");
                loadTask();
                jetsennet.ui.Windows.close("new-object-win");
            }else{
            	jetsennet.message("编辑失败！");
            }
		}	
	};
	dialog.showDialog();
}

function delTask(taskId)
{
	var checkIds = taskId ? [taskId] : jetsennet.form.getCheckedValues("chk-Task");
    if (checkIds.length == 0) {
        jetsennet.alert("请选择要删除的任务！");
        return;
    }
    
	jetsennet.confirm("确定删除所选任务?", function () {
        var params = new HashMap();
        params.put("className", "IpsTaskBusiness");
        params.put("deleteIds", checkIds.join(","));
        var sResult = IPSDAO.execute("commonObjDelete",params);
        if(sResult.errorCode==0){
        	jetsennet.message('操作成功!');
		    loadTask();
        }
        return true;
    });
}

/**
 * 任务跳转
 * @param taskId
 */
function locationTask(taskId) {
 	var checkIds = taskId ? [taskId] : jetsennet.form.getCheckedValues('chk-Task');
    if (checkIds.length == 0) {
        jetsennet.alert("请选择要跳转的任务！");
        return;
    }
    
    if (checkIds.length != 1) {
        jetsennet.alert("请选择一个要跳转的任务！");
        return;
    }
    
    var href = '',
    	name = '',
    	identify = '',
    	id = checkIds[0],
    	type = $('#trTask' + id).attr('taskType');
    
    if (type === '10') {
    	href = 'dataprocess.htm?id=' + id;
    	name = '数据处理';
    	identify = '143';
    } else if (type === '20') {
    	href = 'datacollection.htm?id=' + id;
    	name = '数据采集';
    	identify = '142';
    }
    window.parent.MyApp.showIframe({ID: identify, NAME: name, URL: href}, true);
}

function selTask(row)
{
	gCurTask = null;
	gCurTask = {	
		taskId : row.getAttribute("taskId"),
		taskName : row.getAttribute("taskName"),
		taskDesc : row.getAttribute("taskDesc"),
		taskType : row.getAttribute("taskType"),
		classId : row.getAttribute("classId"),
		createUser : row.getAttribute("createUser"),
		createUserId : row.getAttribute("createUserId"),
		createTime : row.getAttribute("createTime")
	};
}
