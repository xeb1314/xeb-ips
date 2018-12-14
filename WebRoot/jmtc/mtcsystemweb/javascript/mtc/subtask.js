
var gSubTaskLoadTime = 5000; //子任务刷新时间 
var gSubTaskInterval;
        
var gsubTaskPage = new jetsennet.ui.PageBar("subtask");
gsubTaskPage.pageSize = 20;
gsubTaskPage.orderBy = " ORDER BY CREATE_TIME DESC";
gsubTaskPage.onpagechange = function () { getSubTaskList(gCurrentTaskId); };
gsubTaskPage.onupdate = function () {
    el('subTaskPage').innerHTML = this.render();
};
       
/**
* 获取子任务
* @param {Object} parentId
*/
var gSubTaskGridList = new jetsennet.ui.GridList("divSubTask");
function getSubTaskList(parentId,isLog) {
	if(gSubTaskInterval){
		window.clearTimeout(gSubTaskInterval);
	}
    var conditions = new jetsennet.SqlConditionCollection();
    conditions.add(jetsennet.SqlCondition.create("PARENT_ID", parentId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String));

    var sqlQuery = new jetsennet.SqlQuery();
    sqlQuery.OrderString = 'ORDER BY CREATE_TIME DESC';
    jQuery.extend(sqlQuery, { IsPageResult: 1, KeyId: "TASK_ID", PageInfo: gsubTaskPage, Conditions: conditions, ResultFields: "TASK_ID,TASK_NAME,TASK_TYPE,TASK_STATE,CREATE_TIME,TASK_LEVEL,TASK_PERCENT,END_TIME,STATE_DESC,TASK_ACTOR",
        QueryTable: jQuery.extend(new jetsennet.QueryTable(), { TableName: isLog ? "MTC_TASKLOG" : "MTC_TASKEXEC" })
    });

    var param = new HashMap();
    param.put("queryXml", sqlQuery.toXml());
    param.put("startPageNum", (gsubTaskPage.currentPage - 1));
    param.put("pageSize", gsubTaskPage.pageSize);
    var sResult = MTCDAO.execute("commonQueryForPage", param);
    
    var xmlDoc = new jetsennet.XmlDoc();
    xmlDoc.loadXML(sResult.resultVal);
    var count = xmlDoc.documentElement.getAttribute("TotalCount");
    var nodes = xmlDoc.documentElement.selectNodes("Record");
    for ( var i = 0; i < nodes.length; i++) {
    	var taskType = valueOf(nodes[i].selectSingleNode("TASK_TYPE"),"text", "");
    	if (taskType != null) {
    		nodes[i].selectSingleNode("TASK_TYPE").text = gMtcTaskTypes[taskType] || taskType;
        }
    }
    el('divSubList').innerHTML = jetsennet.xml.transform(isLog ? "../xslt/mtc/subtasklog.xslt" : "../xslt/mtc/subtasklist.xslt", xmlDoc);
    gSubTaskGridList.bind(el("divSubList"), el("tabTasklog"));
    gsubTaskPage.setRowCount(count);
    
    if(isLog){
    	gSubTaskInterval = setTimeout("getSubTaskList('" + parentId + "','"+isLog+"');", gSubTaskLoadTime);
    }else{
    	gSubTaskInterval = setTimeout("getSubTaskList('" + parentId + "');", gSubTaskLoadTime);
    }

}
/**
* 获取子任务
* @param {Object} parentId
*/
function getSubTaskLogList(parentId) {
    getSubTaskList(parentId, true);
}

/**
* 查看子任务
* @param {Object} parentId
*/
function viewSubTask(parentId,isLog) {
    gCurrentTaskId = parentId;

    if (isLog) {
        getSubTaskLogList(parentId);
    }
    else {
        getSubTaskList(parentId);
    }

    var dialog = new jetsennet.ui.Window("subtask-window");
    jQuery.extend(dialog, { submitBox: false, cancelBox: false, maximizeBox: false, showScroll: false, windowStyle: 1, minimizeBox: false, title: "子任务信息" });
    dialog.size = { width: 900, height: 450 };
    dialog.controls = ["divSubTask"];
    dialog.onclosed = function () {
        window.clearTimeout(gSubTaskInterval);
    };
    dialog.showDialog();
}
/**
 * 查看子任务
 * @param {Object} parentId
 */
function viewSubTaskLog(parentId) {
    viewSubTask(parentId,true);
}