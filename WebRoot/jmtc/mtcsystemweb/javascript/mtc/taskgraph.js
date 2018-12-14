//var gMtcTaskTypes={};//任务类型
var gTaskTypeData = { title: "任务执行状况统计(按数量/单位条)", types: [], typesnum: [] ,sum: 100};
var gWorkerTypeData = { title: "执行器使用统计(按时间/单位秒)", types: [], typesnum: [],sum: 100 };

jetsennet.require([ "gridlist", "pagebar", "window", "bootstrap/moment", "bootstrap/daterangepicker", "crud","autocomplete", "datepicker","tabpane"]);
jetsennet.importCss("bootstrap/daterangepicker-bs3");
jetsennet.require("flotr2/flotr2");	

var gSqlCollection;
var gSqlQuery = new jetsennet.SqlQuery();
var gQueryTable = jetsennet.createQueryTable("MTC_TASKLOG", "T");
jQuery.extend(gSqlQuery, { IsPageResult: 0, QueryTable: gQueryTable, 
ResultFields:"T.TASK_ID,T.PARENT_ID,T.TASK_NAME,T.TASK_TYPE,T.TASK_ACTOR,T.TASK_WORKER,T.START_TIME,T.END_TIME,T.TASK_STATE" });


function pageInit()
{
   jetsennet.ui.DropDownList.initOptions("txt_taskType", true);
   loadMtcTaskType();
   var currentDate = new Date().getTime();
   el('txtStartTime').value = new Date(currentDate-30*24*3600*1000).toDateString(); 
   el('txtEndTime').value = new Date().toDateString();
   loadTaskGraph();
}


/**
 * 加载受控类别
 */
function loadMtcTaskType() 
{
	var conditions = [];
	conditions.push(["CW_TYPE", "2301", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
	var sResult = MTCDAO.query("commonXmlQuery", "CW_ID", "NET_CTRLWORD", null, null, conditions, "CW_ID,CW_NAME,CW_CODE,CW_DESC");
	var objs = jetsennet.xml.toObject(sResult.resultVal, "Record");
	jetsennet.ui.DropDownList["txt_taskType"].clear();
	if (objs && objs.length > 0) {
        for (var i = 0; i < objs.length; i++) {
            jetsennet.ui.DropDownList["txt_taskType"].appendItem({ text: objs[i].CW_NAME, value: objs[i].CW_CODE });
        }
        jetsennet.ui.DropDownList["txt_taskType"].setSelectedIndex(0);
    }
	
    var conditions = new jetsennet.SqlConditionCollection();
    conditions.add(jetsennet.SqlCondition.create("CW_TYPE", "2301", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric));
    var sqlQuery = new jetsennet.SqlQuery();
    jQuery.extend(sqlQuery, { IsPageResult: 0, KeyId: "CW_ID", PageInfo: null, Conditions: conditions, ResultFields: "CW_ID,CW_NAME,CW_CODE,CW_DESC",
        QueryTable: jQuery.extend(new jetsennet.QueryTable(), { TableName: "NET_CTRLWORD" })
    });
}

/**
 * 获取数据
 * @return {TypeName} 
 */
function loadTaskGraph()
{
	if (el('txtStartTime').value == "") 
	{
		jetsennet.alert('请选择开始时间！');
		return;
    }
    if (el('txtEndTime').value == "") 
    {
    	jetsennet.alert('请选择结束时间！');
		return;
    }
    if(illegalityTime(el("txtStartTime").value, el("txtEndTime").value)){
		return;
	}
    var conditions =
	{
		TASK_TYPE:jetsennet.ui.DropDownList["txt_taskType"].selectedValue,
		START_TIME:el('txtStartTime').value + " 00:00:00",
		END_TIME:el('txtEndTime').value + " 23:59:59"
	}
    var param = new HashMap();
    param.put("objXml", jetsennet.xml.serialize(conditions,'condition'));
    var sResult = MTCDAO.execute("mtcGetTaskStatistics", param);
    var obj = jQuery.parseJSON(sResult.resultVal);
    var task = obj.task;
    var worker = obj.worker;
    if(task.typesnum.length == 0 || worker.typesnum.length == 0)
	{
		jetsennet.message("找不到数据！");
		jQuery('#taskGraph').html('');
		return ;
	}
    var div = [];
    div.push('<div id="taskTypeBar" style="width: 400px; height: 400px; margin: 10px 10px;border: 0px; background: #F0FFFF;float: left"></div>');
    div.push('<div id="workerTypeBar" style="width: 400px; height: 400px; margin: 10px 10px;border: 0px; background: #F0FFFF;float: right;"></div>');
    jQuery('#taskGraph').html(div.join(''));
    drawTaskgraph(task);
   	drawWorkergraph(worker);
}

/**
 * 渲染任务图表
 * @param {Object} task
 */
function drawTaskgraph(task)
{
    for(var i in task.typesnum)
	{
		task.typesnum[i] = parseInt(task.typesnum[i],10);
	}
    gTaskTypeData.types = task.types;
    gTaskTypeData.typesnum = task.typesnum;
    gTaskTypeData.sum =  valueOf(task,'sum',0);

   loadimage(el('taskTypeBar'),gTaskTypeData);
}

/**
 * 渲染执行器图表
 * @param {Object} worker
 */
function drawWorkergraph(worker)
{
    for(var i in worker.typesnum)
	{
		worker.typesnum[i] = parseInt(worker.typesnum[i],10);
	}
    gWorkerTypeData.types = worker.types;
    gWorkerTypeData.typesnum = worker.typesnum;
    gWorkerTypeData.sum =  valueOf(worker,'sum',0);
    
    loadimage(el('workerTypeBar'),gWorkerTypeData);
}

function  loadimage(container, jsonObj)
{
	if (navigator.appVersion.indexOf("MSIE") != -1 && parseFloat(navigator.appVersion.split("MSIE")[1]) < 9)
	{
		jetsennet.require(["flotr2/base64","flotr2/excanvas"]);
	}

	basic_pie(container, jsonObj);
}

/**
 * 饼图
 * @param {Object} container
 * @param {Object} jsonObj
 * @return {TypeName} 
 */
function basic_pie(container, jsonObj) {

	var datas = [];
	var tracks = [];
	for (var i = 0; i < jsonObj.types.length; i++) {
		var data = { data: [[i, jsonObj.typesnum[i]]], label: jsonObj.types[i],
			pie: {
				explode: 10
			}
		};
		datas.push(data);
		tracks.push(jsonObj.types[i]);
	}

	Flotr.defaultOptions.fontColor = '#ffffff';
	var graph;
	
	graph = Flotr.draw(container, datas,
	 {
		 grid: {
			 verticalLines: false,
			 horizontalLines: false,
			 color: '#000000',
			 backgroundColor: '#082E54',
			 outlineWidth:0
		 },
		 xaxis: { showLabels: false },
		 yaxis: { showLabels: false },
		 pie: {
			 show: true,
			 //htmlText: false,
			 sizeRatio:0.5
		 },         
		 mouse: { track: true,relative:true,
			 trackFormatter: function (o) { return tracks[parseInt(o.x)] + ":" + parseInt(o.y); }
		 },
		 legend: {             
			 position: 'tw',
			 show: true,          
			 HtmlText: true,
			 noColumns: 4,
			 noRows: 1,//仅限position首字母为t时可用
			 margin: 0,
			 //labelBoxHeight: 5,
			 //labelBoxWidth: 8,
			 //labelBoxBorderColor: '#454545',
	         //backgroundColor: '#454545',
			 backgroundOpacity: 0   //0=全透明
		 },
		 title: jsonObj.title ,
		 subtitle: "总数为:" + jsonObj.sum,
		 ieBackgroundColor: '#ffffff'
		 //ieBackgroundColor: '#76B8BE'
		 });
 }
