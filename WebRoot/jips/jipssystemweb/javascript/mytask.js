jetsennet.require([ "pagebar", "window", "bootstrap/moment", "bootstrap/daterangepicker","autocomplete","datepicker","datetime",
                    "menu","tabpane", "jetsentree","flowview", "accordion","pageframe","scrollpane","echarts/esl"]);
jetsennet.importCss(["bootstrap/daterangepicker-bs3" ]);

var gFlowView;
var gCurrentProcess;
//tree对应任务类型(任务视角)
var treeParamId;
//点击当前tree的ID
var classID;
//分类类别的doc
var gClassTypeDoc = new jetsennet.XmlDoc();
var gPane;
var gLoadInterVal;
var gTaskStatusInterVal;
var gCurrentProcExec = {};
var gProcexecView;

var gTaskCrud;
var gCurDate = new Date();
var gLastWeekDate;
var gLastMonthDate;
var gDataSourceCrud;
var gDataSourceColumns;

/*==============任务列表分页==================================================*/
var pTaskInfo = new jetsennet.ui.PageBar("taskListPage");
pTaskInfo.onpagechange = function () {
};
pTaskInfo.orderBy = " ORDER BY T.CREATE_TIME DESC";
pTaskInfo.currentPage = 1;
pTaskInfo.pageSize = 20;
pTaskInfo.onupdate = function () {
//el('divTaskPage').innerHTML = this.render();
};
var gTaskGridList = new jetsennet.ui.GridList();
gTaskGridList.ondatasort = function(sortfield, desc) {
	pTaskInfo.setOrderBy(sortfield, desc);
};

var gIPSTaskColumns = [{ fieldName: "TASK_ID", width: 30, align: "center", isCheck: 1, checkName: "chkTask"},
                   { fieldName: "TASK_NAME", sortField: "TASK_NAME", width:"100%", align: "left", name: "任务名称"},
                   { fieldName: "UPDATE_TIME", sortField: "t.UPDATE_TIME", width:160, align: "center", name: "执行时间"},
                   { fieldName: "TASK_STATE", sortField: "TASK_STATE", width:80, align: "center", name: "任务状态",format: function(val,vals){
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
                   { fieldName: "TASK_DESC", sortField: "t.TASK_DESC", width:160, align: "center", name: "描述"}
                   ];
var gIPSTaskCrud = $.extend(new jetsennet.Crud("divProcexecTaskList", gIPSTaskColumns,"divProcexecTaskPage", "ORDER BY t.UPDATE_TIME DESC"), {
   dao : IPSDAO,
   tableName : "IPS_TASK",
   keyId:"TASK_ID",
   cfgId :"divTask",
   resultFields : "t.*",
   name : "任务",
   className : "jetsennet.ips.schema.IpsTask",//      IpsTaskBusiness  jetsennet.ips.schema.IpsTask
   edit : function(id){}
	});

function pageInit() {
	
	new jetsennet.ui.TabPane(el('tabPane'), el('tabPage')).select(1);
//	gPane = new jetsennet.ui.TabPane(el('tabPane2'), el('tabPage2'));
	
	jQuery("#divPageFrame").pageFrame({ 
		showSplit :false,
		minSize: { 
			width: 900, height: 0
			},
		splitType: 1,layout:[40,'auto']
	}).sizeBind(window);
	jQuery("#divDSPageFrame").pageFrame({ 
		showSplit :false,minSize: { 
			width: 900, height: 0
			},splitType: 1, layout: [
					{size: {width : 0,height : 200},splitType: 1, layout: [35, 'auto', 30]},
					{size: {width : 0,height : 280},splitType: 0, layout: [35, 'auto']},
				 	{splitType: 0, layout: [500,{splitType: 1, layout: [35, 'auto']}]},
	]}).sizeBind(window);
	jQuery("#divTaskPageFrame").pageFrame({ 
		showSplit :false,minSize: { 
			width: 900, height: 0
			},splitType: 0,layout:[
				{size: {width : 310,height : 0},splitType: 1, layout: [35, 'auto']},
				{splitType: 1, layout: [
					{splitType: 1, layout: [35, 'auto', 35]},490
//				 	{splitType: 1, layout: [35, 'auto']},
//					200,35,'auto'
					]
				}
	]}).sizeBind(window);
	
	el('txtCollocTime').value = gCurDate.toDateString()+" - "+gCurDate.toDateString();
	$('#txtCollocTime').daterangepicker(jQuery.extend({ opens : "right"}, dataPickerOptions),true);
    
	var dataPickerOption = { 
		      ranges : { 
		        '今天' : [ moment(), moment()], 
		        '昨天' : [ moment().subtract('days', 1), moment().subtract('days', 1) ], 
		        '最近一周' : [ moment().subtract('days', 6), moment() ], 
		        '最近一月' : [ moment().subtract('days', 29), moment() ],
		        '本月' : [ moment().startOf('month'), moment().endOf('month') ], 
		        '上月' : [ moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month') ] 
		      }, 
		      format: 'YYYY-MM-DD', 
		      startDate: new Date(new Date().getTime() - 30 * 24 * 3600 * 1000), 
		      endDate: new Date(),
		      showDropdowns: true, 
		      separator:' - ', 
		      clearBtn: true,
		      locale: { 
		        applyLabel: '确定',
		        cancelLabel: '取消', 
		        fromLabel: '从', 
		        toLabel: '到', 
		        customRangeLabel: '其他', 
		        daysOfWeek: ['日', '一', '二', '三', '四', '五','六'], 
		        monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'], 
		        firstDay: 0 
		      } 
		};
	
	//初始化采集统计周期时间
	el('txtCollocTotalTime').value = new Date(gCurDate.getTime() - 30 * 24 * 3600 * 1000).toDateString()+" - "+gCurDate.toDateString();
	$('#txtCollocTotalTime').daterangepicker(jQuery.extend({ opens : "right"}, dataPickerOption),true);
	//初始化数据处理统计周期时间
	el('txtprocessTotalTime').value = new Date(gCurDate.getTime() - 6 * 24 * 3600 * 1000).toDateString()+" - "+gCurDate.toDateString();
	$('#txtprocessTotalTime').daterangepicker(jQuery.extend({ opens : "right"}, dataPickerOption),true);
	
    jQuery("input[name='chkState'][value='-1']").click(function () {
	    var checked = this.checked;
	    jQuery("input[name='chkState'][value!='-1']").each(function () { this.checked = checked; });
    });
    createTree4Task("divTaskTree");
    
	loadCWWord();
	initWfView();
	initProcexecView();
	internalData();
	//默认选中任务视角的tree事件
	if(treeParamId == 10){
		window.setTimeout(defaultLoadProccessTask,10);
//		 defaultLoadProccessTask();
	}
//	el("searchProcess").style.display = "none";
}

/**
 * 初始化 流程展现
 */
function initWfView(){
	gFlowView = new jetsennet.ui.WfView(el("divDesign"),"750","140");
    gFlowView.isDesignMode = false;
    gFlowView.render();
}

/**
 * 创建左侧数据源tree
 */
function createTree4Ds(cType,divId,functions,isSearchData){
	
	var gClassTypeTree = new jetsennet.ui.Tree("class-type-tree"+divId);
	var itemA = new jetsennet.ui.TreeItem('内部数据源',
			"javascript:"+functions[0]+"(-1,'内部数据源');", null, null, {
				ID : -1
			});
	itemA.addItem(new jetsennet.ui.TreeItem("", "", "", null, null));
	itemA.onopen = function() {
		var _owner = this;
		_owner.clear();
		loadClassTypeDoc(this.treeParam.ID,'10');
		createSubTree4MyTask(_owner.treeParam.ID,gClassTypeTree,functions[0],isSearchData,'10');
		_owner.isRenderItem = false;
		_owner.renderItem();
	};
	
	var itemB = new jetsennet.ui.TreeItem('外部数据源',
			"javascript:"+functions[1]+"(-2,'外部数据源');", null, null, {
				ID : -2
			});	
	itemB.addItem(new jetsennet.ui.TreeItem("", "", "", null, null));
	itemB.onopen = function() {
		var _owner = this;
		_owner.clear();
		loadClassTypeDoc("-1",'20');
		createSubTree4MyTask(_owner.treeParam.ID,gClassTypeTree,functions[1],isSearchData,'20');
		_owner.isRenderItem = false;
		_owner.renderItem();
	};
	
	gClassTypeTree.addItem(itemA);
	gClassTypeTree.addItem(itemB);
	gClassTypeTree.render(divId);
}

/**
 * 创建左侧任务tree
 */
function createTree4Task(divId){
	collectTask();
	
	var tree = new jetsennet.ui.Tree("codetree");
	var item1 = new jetsennet.ui.TreeItem('数据处理任务', null, null, null, {ID : 10});
	item1.addItem(new jetsennet.ui.TreeItem("", "", "", null, null));
	//初始化页面默认加载数据处理任务
	treeParamId=item1.treeParam.ID;
	item1.onclick = function ()
	{	
		el("processTotalDivId").style.display = "";
		defaultLoadProccessTask(item1.treeParam.ID);
	};
	var item2 = new jetsennet.ui.TreeItem('数据采集任务', null, null, null, {ID : 20});
	item2.addItem(new jetsennet.ui.TreeItem("", "", "", null, null));
	item2.onclick = function () {
		el("processTotalDivId").style.display = "none";
		el("searchProcess").style.display = "none";
		el("searchColloc").style.display = "";
		el("totalName").style.display = "none";
		el("colocTotalDivId").style.display = "";
		el("divProcexecTaskList").style.display = "none";
   		el("divProcexecTaskPage").style.display = "none";
   		el("divDataCollocList").style.display = "";
   		el("divDataCollocPage").style.display = "";
		treeParamId=item2.treeParam.ID;
//		gTaskCrud.load();
		/*var conditions = [];
	    conditions.push(['t.TASK_STATE', '11', jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
	    conditions.push(['t.TASK_TYPE', '20', jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
		gTaskCrud.search(conditions);*/
		// 清除统计图表
		require('echarts').init(el("main")).clear();
		// 加载运行中的任务
		searchTask();
		// 停止页面自动刷新
		window.clearTimeout(totalInterVal);
	};
	tree.addItem(item1);
    tree.addItem(item2);
    tree.render(divId);
    if(treeParamId == 10){
    	item1.select();
    }
}

/**
 * 初始化页面默认加载数据处理任务
 * @param id 树子项的ID
 */
function defaultLoadProccessTask(){
	el("searchProcess").style.display = "";
	el("searchColloc").style.display = "none";
	el("colocTotalDivId").style.display = "none";
	el("totalName").style.display = "";
	el("divDataCollocList").style.display = "none";
	el("divDataCollocPage").style.display = "none";
	el("divProcexecTaskList").style.display = "";
	el("divProcexecTaskPage").style.display = "";
	
	el("processTotalDivId").style.display = "";
//	treeParamId=id;
//	procexecTask(treeParamId);
	/*if(isTrue){
		//清除统计图表
		require('echarts').init(el("main")).setOption({});
	}*/
	
	//加载运行中的任务
	execTask();
	//停止页面自动刷新
	window.clearTimeout(totalInterVal);
}

/**
 * 采集任务列表
 */
function collectTask() {
	var columns = [
		{fieldName: 'TASK_NAME', sortField: 'TASK_NAME', width: '100%', align: 'left', name: '任务名称'},
		{fieldName: 'TASK_STATE', sortField: 'TASK_STATE', width: 80, align: 'center', name: '任务状态', format: function(val, vals) {
			var stateName;
			switch(parseInt(val, 10)) {
			  case 100:
				  stateName = '未运行';
				  break;
			  case 11:
				  stateName = '运行中';
				  break;
			  default:
				  stateName = '未知-' + val;
			      break;
			}
			return stateName;
		}},
		{ fieldName: "AMOUNT",sortField: 'AMOUNT', width:100, align: "center", name: "返回量",format: function(val,vals){
        		return Number(val).toFixed(2);
        }},
		{fieldName: 'CREATE_TIME', sortField: 'CREATE_TIME', width: 160, align: 'center', name: '开始执行时间'},
		{fieldName: 'TASK_DESC', sortField: 'TASK_DESC', width: 400, align: 'center', name: '任务描述'}];
//,"ORDER BY t.CREATE_TIME DESC"
	gTaskCrud = $.extend(new jetsennet.Crud('divDataCollocList', columns, 'divDataCollocPage'), {
	    dao: IPSDAO,
	    tableName : 'IPS_TASK',
	    keyId:'TASK_ID',
	    cfgId :'divTask',
	    pageQueryMethodName : "collocTaskQueryForPage",
	    resultFields : "t.TASK_ID,SUM(g.AMOUNT) AS AMOUNT",
	    groupFields :  "t.TASK_ID",
	    	//"distinct (t.TASK_ID),t.TASK_NAME,t.TASK_STATE,t.CREATE_TIME,t.TASK_DESC",
	    joinTables: [ 
	                 [ "IPS_GATHTERSTAT", "g", "t.TASK_ID=g.TASK_ID", jetsennet.TableJoinType.Left ]
	    			],
	    /*conditions:[
	                ["t.TASK_TYPE", "20",jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric],
	                ['t.TASK_STATE', '11', jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric],
	                ["g.STAT_TIME", $('#txtCollocTime').data('daterangepicker').startDate.format('YYYY-MM-DD'), jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Than, jetsennet.SqlParamType.DateTime],
	                ["g.STAT_TIME", $('#txtCollocTime').data('daterangepicker').endDate.format('YYYY-MM-DD') + " 23:59:59", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Less, jetsennet.SqlParamType.DateTime],
	                [ "g.AMOUNT", 0,jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.NotEqual, jetsennet.SqlParamType.Numeric]
	                ],*/
	    name: '任务',
	    className: 'jetsennet.ips.schema.IpsTask'
	});
	gTaskCrud.grid.onrowclick = function (obj, el) {
		var loading = jQuery("<span>").attr("id", "loading-rending-icon1").addClass("jetsen-grid-loading-icon").appendTo("#divTaskCountDown");
		collectTaskToCount(obj['TASK_ID'],obj['TASK_NAME']);
		loading.css("display", "none");
    };
    gTaskCrud.pageBar.pageSize = 5; 
}

/**
 * 加载分类4 我的任务
 */
function loadClassTypeDoc(ccType,parentId){
	var conditions = [];
	if(ccType == "-1")
	{
		conditions.push(["STR_1", "0", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal]);
	}
	conditions.push(["PARENT_ID", parentId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal]);
	conditions.push(["CLASS_TYPE", ccType, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
	var sResult = IPSDAO.query("commonXmlQuery", "CLASS_ID", "IPS_CTRLCLASS", null, null, conditions, "CLASS_ID,CLASS_NAME,CLASS_DESC,PARENT_ID,CLASS_TYPE,CLASS_LAYER,VIEW_NAME,STR_1");
	gClassTypeDoc.loadXML(sResult.resultVal);
}

/**
 * 加载分类的子分类-第3级树 4 我的任务
 */
function createSubTree4MyTask(id,gClassTypeTree,functions,isSearchData,parentId) {
	treeNode = gClassTypeTree.getItem(function(item) {
		if (item.treeParam && item.treeParam.ID == id)
			return true;
		return false;
	}, true);
	treeNode.clear();
	var parentList = gClassTypeDoc.documentElement
			.selectNodes("Record[PARENT_ID="+parentId+"]");// 第0层
	var name="";
	for ( var i = 0; i < parentList.length; i++) {
		if(parentList[i].selectSingleNode("CLASS_TYPE").text != "-1"){
			name = gCWWordDoc.documentElement.selectSingleNode("Record[CW_ID='" + parentList[i].selectSingleNode("CLASS_NAME").text + "']").selectSingleNode("CW_NAME").text;
		}else{
			name = parentList[i].selectSingleNode("CLASS_NAME").text;			
		}
		var id = parentList[i].selectSingleNode("CLASS_ID").text;
		
			subId=id;
		
		var clipItem = new jetsennet.ui.TreeItem(name,
				"javascript:"+functions+"('" + id + "','"+name+"');", null, null, {
					ID : id,
					Name : name,
					ParentId : 0,
					ParentName : "",
					Type : 0,
					DescId : parentList[i].selectSingleNode("CLASS_DESC").text,
					ClassType : parentList[i].selectSingleNode("CLASS_TYPE").text
				});
		
		clipItem.addItem(new jetsennet.ui.TreeItem("", "", "", null, null));
		clipItem.onopen = function() {
			this.clear();
			if(this.treeParam.ClassType == '-1')
			{
				loadClassTypeDoc(this.treeParam.DescId,this.treeParam.ParentId);
				createSubTree4MyTask(this.treeParam.ID,gClassTypeTree,functions,isSearchData,this.treeParam.ParentId);
			}else
			{
				createSubTreeItem(this.treeParam.ID,gClassTypeTree,functions);
			}
			this.isRenderItem = false;
			this.renderItem();
			if (this.treeItems.length == 0) {
			}
		};
		treeNode.addItem(clipItem);
	}
	treeNode.isOpen = true;
	treeNode.isRenderItem = false;
	treeNode.renderItem();
}
/**
 * 加载数据源列表
 * @param classId
 * @param className
 */
function internalData(){
	gDataSourceColumns=[ { fieldName: "DS_ID", width: 30, align: "center", isCheck: 1, checkName: "chkDS"},
		                     { fieldName: "DS_NAME", sortField: "DS_NAME", width:200, align: "center", name: "名称"},
		                     { fieldName: "STR_1", sortField: "STR_1", width:"100%", align: "center", name: "参数"},//12.09
		                     { fieldName: "DS_TYPE", sortField: "DS_TYPE", width:80, align: "center", name: "访问方式",format: function(val, vals){
		                        	var type;
		                         	switch(parseInt(val,10)){
		                         	  case 10:
		                         		 type="文件";
		                         		  break;
		                         	  case 20:
		                         		 type="数据库表";
		                         		  break;
		                               default:
		                            	   type="其他-"+val;
		                                   break;
		                         	}
		                         	return type;
	                         	}
	                         },
	                         { fieldName: "DS_CLASS", sortField: "DS_CLASS", width:50, align: "center", name: "类型",format: function(val, vals){
		                        	var type;
		                         	switch(parseInt(val,10)){
		                         	  case 801:
		                         		 type="邮件";
		                         		  break;
		                         	  case 802:
		                         		 type="口令";
		                         		  break;
		                         	  case 803:
		                         		 type="认证";
		                         		  break;
		                         	  case 808:
		                         		 type="话音";
		                         		  break;
		                         	  case 810:
		                         		 type="文件";
		                         		  break;
		                         	  case 811:
		                         		 type="传真";
		                         		  break;
		                         	  case 812:
		                         		 type="文本";
		                         		  break;
		                         	  case 815:
		                         		 type="IP";
		                         		  break;
		                               default:
		                            	   type="未知-"+val;
		                                   break;
		                         	}
		                         	return type;
	                         	}
	                         },
	                         { fieldName: "STATE", sortField: "STATE", width:80, align: "center", name: "状态",format: function(val, vals){
		                        	var state;
		                         	switch(parseInt(val,10)){
		                         	  case 0:
		                         		 state="公共";
		                         		  break;
		                         	  case 1:
		                         		 state="指派用户";
		                         		  break;
		                         	  case 2:
		                         		 state="未分配";
		                         		  break;
		                               default:
		                            	   state="未知-"+val;
		                                   break;
		                         	}
		                         	return state;
	                         	}
	                         },
	                         { fieldName: "CREATE_USER", sortField: "CREATE_USER", width:80, align: "center", name: "创建用户"},
	                         { fieldName: "CREATE_TIME", sortField: "CREATE_TIME", width:130, align: "center", name: "创建时间"},
	                         { fieldName: "DS_DESC", sortField: "DS_DESC", width:200, align: "center", name: "描述"},
	                         { fieldName: "DS_ID,STR_1,STATE", width:45, align: "center", name: "详情", format: function(val,vals){
	                        	 var pathReplace = vals[1].indexOf("\\");
	                        	 var path = vals[1];
	                        	 var isReplace = false;
	                        	 if(pathReplace>0){
	                        		 path = vals[1].replace(/\\/g,"/"); 
	                        		 isReplace = true;
	                        	 }
	                        	 return '<span onclick="viewLabelDetail(\''+vals[0]+'\',\''+path+'\',\''+vals[2]+'\','+isReplace+');"><img src="images/cel_info.png"/></span>';
	                         }}
//	                         { fieldName: "DS_ID", width: 45, align: "center", name: "编辑", format: function(val,vals){
//	                             return jetsennet.Crud.getEditCell("gDataSourceCrud.edit('" + val + "')");
//	                         }},
//	                         { fieldName: "DS_ID", width:45, align: "center", name: "删除", format: function(val,vals){
//	                        	var value= "'"+val+"'";
//	                         	return '<span style="cursor:pointer;" onclick="gDataSourceCrud.remove(' + value + ')"><img src="images/cel_del.png"></img></span>';
//	                         }}
	                         ];
	gDataSourceCrud = $.extend(new jetsennet.Crud("divDataSourceList", gDataSourceColumns, "divDataSourcePage", "ORDER BY t.CREATE_TIME DESC"), {
		dao : IPSDAO,
		tableName : "IPS_DATASOURCE",
		keyId : "DS_ID",
		resultFields : "t.*",
		name : "数据源",
		checkId : "chkDS",
//		cfgId : "divDataSourceDialog",
		className : "jetsennet.ips.schema.IpsDatasource",
		addDlgOptions : {size : {width : 600, height :0}},
	    editDlgOptions : {size : {width : 600, height :0}},
	});
	gDataSourceCrud.pageBar.pageSize = 5; 
}

/**
 * 数据源详情
 */
function viewLabelDetail(values,sourcePath,state){
	el("txtSourcePathDetail").value = "";
	el("lableClassDetails").options.length = 0;
	el("lableUserDetails").options.length = 0;
	/*================根据数据源ID去用户表里查找数据源所有用户并在弹出窗详情中显示=========================================================================================================**/
	if(state == "1"){
		el("userDisplay").style.display = "";
		var condition = [];
		condition.push(["d.DS_ID", values, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.In]);
		userList("lableUserDetails",condition);
		isDisplay = true;
	}else{
		el("userDisplay").style.display = "none";
		isDisplay = false;
	}
	/*==================详情弹出窗=========================================================================================================**/
	var dialogHeight = 300;
	if(isDisplay){
		dialogHeight = 450;
	}
	var dialog = new jetsennet.ui.Window("detail-window"+jetsennet.util.Guid.newGuid().toString());
    jQuery.extend(dialog, { submitBox: false, cancelBox: false, maximizeBox: false, showScroll: false, windowStyle: 1, minimizeBox: false, title: "详情" });
    dialog.size = { width: 400, height: dialogHeight };
    dialog.controls = ["divLabelDetail"];
    dialog.showDialog();
    el("txtSourcePathDetail").value=sourcePath;
    /*==================根据数据源存的分类ID，找出分类名称(名称是从数据字典里取的)=========================================================================================================**/
	var conditions = [];
	conditions.push(["DS_ID", dsId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.In]);
	var sResult = IPSDAO.query("commonXmlQuery", "ID", "IPS_DATATSOURCELABEL", null, null, conditions, "CW_IDS,TYPE");
	var objs = jetsennet.xml.toObject(sResult.resultVal, "Record");
	if(objs){
		for ( var i = 0; i < objs.length; i++) {
			var value = objs[i].CW_IDS;
			var type = gCWWordDoc.documentElement.selectSingleNode("Record[CW_CODE=" + objs[i].TYPE + "]").selectSingleNode("CW_NAME").text;
			var name = gCWWordDoc.documentElement.selectSingleNode("Record[CW_ID='" + value + "']").selectSingleNode("CW_NAME").text;
			selectAddItem("lableClassDetails",value,type+"=====>"+name);
		}	
	}
}

/**
 * 内部数据源中 数据源对应的任务
 * @param obj
 */
function dsToTask(obj){
	el('divTaskList').innerHTML = "";
	el("divDesign").innerHTML = "";
    var sqlCollection = new jetsennet.SqlConditionCollection();
    sqlCollection.add(jetsennet.SqlCondition.create("T.DS_ID", obj.getAttribute("dsId"), jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String));
    
    var gSqlQuery = new jetsennet.SqlQuery();
    var queryTable = jQuery.extend(new jetsennet.QueryTable(), { TableName: "IPS_TASK", AliasName: "T" });
//    queryTable.addJoinTable(jetsennet.createJoinTable("WFM_PROCESS", "P", "T.PROCTEMPLATE_ID=P.PROC_ID", jetsennet.TableJoinType.Left));
    
    jQuery.extend(gSqlQuery, { IsPageResult: 1, PageInfo : pTaskInfo ,OrderString: pTaskInfo.orderBy,
    	//,P.PROC_NAME
        ResultFields: "T.*",
        QueryTable: queryTable, Conditions: sqlCollection
    });
	
	var param = new HashMap();
    param.put("queryXml", gSqlQuery.toXml());
    param.put("startPageNum", pTaskInfo.currentPage-1);
    param.put("pageSize", pTaskInfo.pageSize);
    var sResult = IPSDAO.execute("commonQueryForPage", param);
    var xmlDoc = new jetsennet.XmlDoc();
    xmlDoc.loadXML(sResult.resultVal);
    var count = xmlDoc.documentElement.getAttribute("TotalCount");
    el('divTaskList').innerHTML = jetsennet.xml.transform("xslt/dstotask.xsl",xmlDoc);
    gTaskGridList.bind(el("divTaskList"), el("tabTask"));
    pTaskInfo.setRowCount(count);
    taskTotal(obj.getAttribute("dsId"));
}

//数据源ID
var taskTotalDsId;
function taskTotal(dsId){
	if(typeof(dsId) != "undefined"){
		taskTotalDsId = dsId;
	}

	//获取任务名称及ID
	var taskResult = IPSDAO.query("commonXmlQuery", "TASK_ID", "IPS_TASK", "t",null, 
			[["t.DS_ID", taskTotalDsId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String]
    ], "t.TASK_ID,t.TASK_NAME,t.TASK_TYPE,t.PROC_ID");
	
	var taskObjs = jetsennet.xml.toObject(taskResult.resultVal, "Record");
	if(taskObjs){
		var option
		var xAxisData=[];
	    var handleCount=[];
	    var failCounts=[];
	    var totalCount = [];
	    var collocInfo = {};
	    var processInfo = {};
	    for(var i=0;i<taskObjs.length;i++){
	    	var taskType = taskObjs[i].TASK_TYPE;
	    	var taskId = taskObjs[i].TASK_ID;
			if(taskType == "20"){
		    		var total = totalCollectTask2(taskId);
		    		if(total == ""){
		    			total = 0;
		    		}
		    		collocInfo.name = taskObjs[i].TASK_NAME;
		    		collocInfo.number = parseInt(total);
			}else if(taskType == "10"){
				processInfo.taskId = taskId;
				processInfo.procId = taskObjs[i].PROC_ID;
			}
	    }
	    if(!$.isEmptyObject(collocInfo)){
	    	//数据采集统计信息
		    xAxisData.push(collocInfo.name);
			handleCount.push(collocInfo.number);
			failCounts.push(0);
			totalCount.push(collocInfo.number);
			if($.isEmptyObject(processInfo)){
				option = optionObj(xAxisData,handleCount,failCounts,totalCount);
			}
	    }
	    if(!$.isEmptyObject(processInfo)){
	    	//统计数据处理信息 
			option = totalTask(processInfo.taskId,processInfo.procId,xAxisData,handleCount,failCounts,totalCount);
	    }
		require('echarts').init(el("divtotalPic")).setOption(option, true);
	}else{
		require('echarts').init(el("divtotalPic")).setOption({});
	}
}




/**
 *内部数据源中 任务对应的流程 
 * @param obj
 */
function taskToProces(taskObjs,isDefault){
	var taskType="";
	var procId="";
	if(isDefault){
		for(var j=0;j<taskObjs.length;j++){
			taskType = taskObjs[j].TASK_TYPE;
			if(taskType =="10"){
				procId = taskObjs[j].PROC_ID;
				break;
			}
		}
	}else{
		taskType = taskObjs.getAttribute("taskType");
		procId = taskObjs.getAttribute("procId");
	}
	
	if(taskType =="10"){
		var objs = loadProcessTemplate(procId);
		if (objs && objs.length > 0) {
			for (var i = 0; i < objs.length; i++) {
				gCurrentProcess = null;
				processChanged(objs[i].PROC_ID, objs[i].PROC_TYPE, objs[i].FLOW_TYPE, objs[i].PROC_STATE, objs[i].PROC_NAME, objs[i].PROC_DESC,objs[i].OBJ_TYPE);
			}
		}
		else el('divDesign').innerHTML = "";
	}else if(taskType="20"){
		el('divDesign').innerHTML = "";
	}
}

/**
 * 获取流程模版
 */
function loadProcessTemplate(id) {
	
	var sqlQuery = new jetsennet.SqlQuery();
    var queryTable = jetsennet.createQueryTable("WFM_PROCESS", "p");
    jQuery.extend(sqlQuery, { IsPageResult: 0, QueryTable: queryTable, ResultFields: "p.*" });
    var condition = new jetsennet.SqlConditionCollection();
    if(id != null)
    {
    	condition.SqlConditions.push(jetsennet.SqlCondition.create("PROC_ID", id, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric));
    }
    else
    {
    	condition.SqlConditions.push(jetsennet.SqlCondition.create("PROC_TYPE", "10", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric));
    }
    sqlQuery.Conditions = condition;
    
     var param = new HashMap();
    param.put("queryXml", sqlQuery.toXml());
    var sResult = IPSDAO.execute("commonXmlQuery", param);
    var objs = jetsennet.xml.toObject(sResult.resultVal, "Record");
    return objs;
}

/**
 * 流程改变事件 objDataType数据存储对象
 */
function processChanged(procId, objType, procType, procState, procName, procDesc,objDataType) {
    if (gCurrentProcess != null && procId == gCurrentProcess.procId) {
        gCurrentProcess = { procId: procId, objType: objType, procType: procType, procState: procState, procName: procName, procDesc: procDesc,objDataType:objDataType };
        return;
    }

    gCurrentProcess = { procId: procId, objType: objType, procType: procType, procState: procState, procName: procName, procDesc: procDesc,objDataType:objDataType };

    var param = new HashMap();
    param.put("procId",procId);
    var result = WFMDAO.execute("getProcess", param);
    if(result.errorCode==0){
    	setProcessXml(result.resultVal);
    }
}

//设置流程xml
function setProcessXml(processXml) {

    gFlowView.clearView();
    var flowObj = jetsennet.xml.deserialize(processXml);
    gFlowView.workflowNode = gFlowView.createNodesByObject(flowObj);
    gFlowView.render();
    
    var heightCountStr = $("#divDesignPanelRight").css("height");
	var heightCounts = heightCountStr.substring(0,heightCountStr.length-2);
	$("#divDesign").css("height",(parseInt(heightCounts)-80)+"px");
}

/**
 * 数据处理对应的运行中总任务
 */
function execTask(){
	
	var conditions = [];
	var value = jetsennet.util.trim(el('txtTaskName').value);
	if(value){
		conditions.push(['t.TASK_NAME', value, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Like, jetsennet.SqlParamType.String]);
	}
	conditions.push(['t.TASK_STATE', '11', jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
	conditions.push(['t.TASK_TYPE', '10', jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
	
	gIPSTaskCrud.pageBar.pageSize = 20; 
	gIPSTaskCrud.search(conditions);
	gIPSTaskCrud.grid.onrowclick = function(obj,tr){
		procTaskToCount(obj.TASK_ID,obj.PROC_ID);
	};
	
	var objItems = gIPSTaskCrud.grid.objItems;
    if(objItems.length>0){
    	//默认选择行事件
    	procTaskToCount(objItems[0].TASK_ID,objItems[0].PROC_ID);
        //默认渲染第一行
    	gIPSTaskCrud.grid.selectRow(0);
    }
}


/**
 * 数据处理对应的运行中的任务
 */
/**function procexecTask(taskType){
	if (gLoadInterVal != null)
        window.clearTimeout(gLoadInterVal);
    el('divTaskList').innerHTML = "";
	el('divProcexecTaskList').innerHTML = "";
    gTaskPage.currentPage = 1;
    var gSqlCollection = new jetsennet.SqlConditionCollection();
    
    var gSqlQuery = new jetsennet.SqlQuery();
    gSqlCollection.add(jetsennet.SqlCondition.create("t.TASK_STATE", "2", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.In, jetsennet.SqlParamType.Numeric));
    gSqlCollection.add(jetsennet.SqlCondition.create("d.ACT_TYPE", "1,2,3", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.In, jetsennet.SqlParamType.String));
   // gSqlCollection.add(jetsennet.SqlCondition.create("k.TASK_TYPE", taskType, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.In, jetsennet.SqlParamType.Numeric));
    
    var gQueryTable = jetsennet.createQueryTable("WFM_TASKEXEC", "t");
    gQueryTable.addJoinTable(jetsennet.createJoinTable("WFM_PROCEXEC", "f", "t.PROCEXEC_ID=f.PROCEXEC_ID", jetsennet.TableJoinType.Inner));
  //  gQueryTable.addJoinTable(jetsennet.createJoinTable("IPS_TASK", "k", "f.PROC_ID=k.PROC_ID", jetsennet.TableJoinType.Left));
    gQueryTable.addJoinTable(jetsennet.createJoinTable("WFM_PROCACT", "c", "t.PROCACT_ID = c.PROCACT_ID", jetsennet.TableJoinType.Inner));
    gQueryTable.addJoinTable(jetsennet.createJoinTable("WFM_ACTIVITY", "d", "c.ACT_ID = d.ACT_ID", jetsennet.TableJoinType.Inner));
    jQuery.extend(gSqlQuery, { IsPageResult: 1, KeyId: "TASK_ID", PageInfo: gTaskPage, QueryTable: gQueryTable, 
    ResultFields: "t.TASK_ID,t.PROCEXEC_ID,t.PROC_TYPE ,t.OBJ_ID,t.EXECUTE_USER,t.TASK_STATE,t.START_TIME,t.END_TIME,t.TASK_PERCENT,t.TASK_DESC,f.OBJ_NAME,f.PROC_ID,f.START_USER,f.PROC_STATE,f.START_TIME as CREATE_TIME,c.PROCACT_NAME" });

	gSqlQuery.OrderString = gTaskPage.orderBy;
    gSqlQuery.Conditions = gSqlCollection;

    var param = new HashMap();
    param.put("queryXml", gSqlQuery.toXml());
    var sResult = MTCDAO.execute("commonQueryForPage", param);
    var xmlDoc = new jetsennet.XmlDoc();
    xmlDoc.loadXML(sResult.resultVal.replaceAll("Records","RecordSet"));
    var count = xmlDoc.documentElement.getAttribute("TotalCount");
    var retVal = jetsennet.xml.transform("xslt/task.xsl", xmlDoc);
    if (!jetsennet.util.isNullOrEmpty(retVal)) {
        el('divProcexecTaskList').innerHTML = retVal;
        gProcexecTaskGridList.bind(el("divProcexecTaskList"), el("tabTask"));
        gTaskPage.setRowCount(count);
    }
    gLoadInterVal = window.setTimeout(procexecTask, 30000);
}
**/

//查看流程=====================================================================
function viewProcess(procExecId, procId, objName, createUser, createTime, objType, objId, procState) {
	gPane.select(0);
  gCurrentProcExecId = procExecId;
  gCurrentProcExec = { procExecId: procExecId, procId: procId };
  el('processList').innerHTML = "";
  //检视工作流    
  var dialog = new jetsennet.ui.Window("task-show-win");
  $.extend(dialog, { submitBox: false, cancelBox: false, windowStyle: 1,maximizeBox: false, minimizeBox: false, showScroll: false, size: { width: 750, height: 0 }, title: "查看流程" });
  if(procState=="0"||procState=="5"){
  	jQuery.extend(dialog, { attachButtons: [{ text: "启动流程", clickEvent: function () { startWorkflow(procExecId); } }]});
  }else if(procState=="1"||procState=="2"){
  	jQuery.extend(dialog, { attachButtons: [{ text: "终止流程", clickEvent: function () { stopWorkflow(procExecId); } },
  	                                        { text: "暂停流程", clickEvent: function () { pauseWorkflow(procExecId); } }]});
  }
  dialog.controls = ["divDialog"];
  dialog.onclosed = function () {
      if (gTaskStatusInterVal != null)
          window.clearTimeout(gTaskStatusInterVal);
//      procexecTask();
      execTask();
  };
  dialog.showDialog();

  if (gLoadInterVal != null)
      window.clearTimeout(gLoadInterVal);

  seachProcessRecords();

  loadProceeActivity();

}

//加载流程节点
function loadProceeActivity() {
	var param = new HashMap();
  param.put("procId", gCurrentProcExec.procId);
  var sResult = WFMDAO.execute("getProcess", param);
  if(sResult.errorCode==0){
	  setProcexecXml(sResult.resultVal);
      getTaskStatus();
  }
}

function getTaskStatus() {

  if (gTaskStatusInterVal != null)
      window.clearTimeout(gTaskStatusInterVal);

  var sqlQuery = new jetsennet.SqlQuery();
  var queryTable = jetsennet.createQueryTable("WFM_TASKEXEC", "t");
  jQuery.extend(sqlQuery, { IsPageResult: 0, QueryTable: queryTable, ResultFields: "PROCACT_ID,TASK_STATE,TASK_PERCENT, TASK_DESC" });
  var sqlCollection = new jetsennet.SqlConditionCollection();
  sqlCollection.add(jetsennet.SqlCondition.create("PROCEXEC_ID", gCurrentProcExec.procExecId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String));
  sqlCollection.add(jetsennet.SqlCondition.create("ACT_ID", 10000, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Less, jetsennet.SqlParamType.Numeric));
  sqlQuery.Conditions = sqlCollection;

  var param = new HashMap();
  param.put("queryXml", sqlQuery.toXml());
  var sResult = MTCDAO.execute("commonXmlQuery", param);
  var records = jetsennet.xml.toObject(sResult.resultVal, "Record");
  if(records.length>0){
  	for (var i = 0; i < records.length; i++) {
          var node = gProcexecView.getNodeByNodeId(records[i].PROCACT_ID);
          if (node != null) {
              jQuery.extend(node.nodeParam, { id: records[i].PROCACT_ID, taskId: records[i].TASK_ID, state: records[i].TASK_STATE, progress: records[i].TASK_PERCENT || 0, stateDesc: records[i].TASK_DESC });
              node.refreshNodeStatus();
          }
      }
  }
  gTaskStatusInterVal = window.setTimeout(getTaskStatus, 5000);
};

//查找流程记录
var gGridList = new jetsennet.ui.GridList();
function seachProcessRecords() {
  var sqlQuery = new jetsennet.SqlQuery();
  var queryTable = jQuery.extend(new jetsennet.QueryTable(), { TableName: "WFM_TASKOVER", AliasName: "T1" });
  queryTable.addJoinTable(jetsennet.createJoinTable("WFM_ACTIVITY", "T2", "T1.ACT_ID = T2.ACT_ID", jetsennet.TableJoinType.Left));

  var sqlCollection = new jetsennet.SqlConditionCollection();
  sqlCollection.add(jetsennet.SqlCondition.create("PROCEXEC_ID", gCurrentProcExecId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String));
  jQuery.extend(sqlQuery, { IsPageResult: 0, Conditions: sqlCollection, QueryTable: queryTable, 
  	ResultFields: "T2.LONG_NAME,T1.EXECUTE_USER,T1.OLD_STATE,T1.OVER_STATE,T1.START_TIME,T1.END_TIME",OrderString: "Order By T1.END_TIME DESC" });

  var param = new HashMap();
  param.put("queryXml", sqlQuery.toXml());
  var sResult = MTCDAO.execute("commonXmlQuery", param);
  var xmlDoc = new jetsennet.XmlDoc();
  xmlDoc.loadXML(sResult.resultVal);//.replaceAll("Records","RecordSet")
  el('processList').innerHTML = jetsennet.xml.transform("xslt/processrecords.xsl", xmlDoc);
  gGridList.bind(el("processList"), el("processTab"));
}

//初始化界面
function initProcexecView() {

    //初始化流程视图
	gProcexecView = new jetsennet.ui.WfView(el("divProcDesign"), 742, 300);
	gProcexecView.isDesignMode = false;
	gProcexecView.showStartEndNode = false;
	gProcexecView.align = "left-middle";
	gProcexecView.onnodemouseover = function (node) {
        if (node && node.nodeParam && node.nodeParam.stateDesc) {
            jetsennet.tooltip(node.nodeParam.stateDesc, { reference: node.control, position: 1 });
        }
    };
    gProcexecView.onnodemouseout = function (node) {
        jetsennet.hidetip();
    };   
    gProcexecView.render();
}

//设置流程xml
function setProcexecXml(processXml) {

	gProcexecView.clearView();
    var flowObj = jetsennet.xml.deserialize(processXml);
    gProcexecView.workflowNode = gProcexecView.createNodesByObject(flowObj);
    gProcexecView.render();
}

/**
 * 根据任务名称查找任务
 */
function searchTask(){
	var loading = jQuery("<span>").attr("id", "loading-rending-count").addClass("jetsen-grid-loading-icon").appendTo("body");
	if(treeParamId == "10"){
		execTask();
	}else if(treeParamId == "20"){
		if(el("searchProcess").style.display == ""){
			var conditions = [];
			var value = jetsennet.util.trim(el('txtTaskName').value);
			if(value){
				conditions.push([ "t.TASK_NAME", value, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Like, jetsennet.SqlParamType.String ]);
			}
		    conditions.push(['t.TASK_STATE', '11', jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
		    conditions.push(['t.TASK_TYPE', '20', jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
			gTaskCrud.search(conditions);
		}
		if(el("searchColloc").style.display == ""){
			var conditions = [];
			var value = jetsennet.util.trim(el('txtTaskCollocName').value);
			if(value){
				conditions.push([ "t.TASK_NAME", value, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Like, jetsennet.SqlParamType.String ]);
			}
			conditions.push(['t.TASK_STATE', '11', jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
		    conditions.push([ "t.TASK_TYPE", "20", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric ]);
		    /*if(illegalityTime(el("txtStartTime").value, el("txtEndTime").value)){
				return;
			}*/
		    /*if (el('txtCollocStartTime').value != "") {
		    	conditions.push(["g.STAT_TIME", el('txtCollocStartTime').value + " 00:00:00", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Than, jetsennet.SqlParamType.DateTime]);
		    }
		    if (el('txtCollocEndTime').value != "") {
		    	conditions.push(["g.STAT_TIME", el('txtCollocEndTime').value + " 23:59:59", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Less, jetsennet.SqlParamType.DateTime]);
		    }*/
		    
		    if ($('#txtCollocTime').val()) {
		        conditions.push([ "g.STAT_TIME", $('#txtCollocTime').data('daterangepicker').startDate.format('YYYY-MM-DD'), jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.ThanEqual, jetsennet.SqlParamType.DateTime ]);
		        conditions.push([ "g.STAT_TIME", $('#txtCollocTime').data('daterangepicker').endDate.format('YYYY-MM-DD') + " 23:59:59", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.LessEqual, jetsennet.SqlParamType.DateTime ]);
		    }
		    
		    var stateVal = jetsennet.form.getCheckedValues("chkResult");
		    if (stateVal != "") {
		    	 conditions.push([ "g.AMOUNT", 0,jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.NotEqual, jetsennet.SqlParamType.Numeric]);
		    }
		    gTaskCrud.search(conditions);
		    var objItems =  gTaskCrud.grid.objItems;
		    if(objItems.length>0){
		    	//默认选择行事件
		    	collectTaskToCount(objItems[0].TASK_ID,objItems[0].TASK_NAME);
		        //默认渲染第一行
		        gTaskCrud.grid.selectRow(0);
		    }
		    
		}
	}else{
		jetsennet.warn("请先选择左侧分类树！");
		return;
	}
	loading.css("display", "none");
}

/**
 * 根据条件查找数据源
 */
function searchDSList(){
	 var conditions = [];
	    var value = el('txtDSName').value.replace(/\s/ig,'');
	    if (value) {
	    	conditions.push(["t.DS_NAME", value, jetsennet.SqlLogicType.Or, jetsennet.SqlRelationType.Like, jetsennet.SqlParamType.String ]);
	    	conditions.push(["t.STR_1", value, jetsennet.SqlLogicType.Or, jetsennet.SqlRelationType.Like, jetsennet.SqlParamType.String]);
	    }
	    gDataSourceCrud.search(conditions);

}

/**
 * 默认选中任务列表的行事件
 * @param dsId
 */
function dsRowClick(dsId){
	el('divTaskList').innerHTML = "";
	el("divDesign").innerHTML = "";
	//加载任务
    var sqlCollection = new jetsennet.SqlConditionCollection();
    sqlCollection.add(jetsennet.SqlCondition.create("T.DS_ID", dsId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String));
    
    var gSqlQuery = new jetsennet.SqlQuery();
    var queryTable = jQuery.extend(new jetsennet.QueryTable(), { TableName: "IPS_TASK", AliasName: "T" });
    
    jQuery.extend(gSqlQuery, { IsPageResult: 1, PageInfo : pTaskInfo ,OrderString: pTaskInfo.orderBy,
        ResultFields: "T.*",
        QueryTable: queryTable, Conditions: sqlCollection
    });
	
	var param = new HashMap();
    param.put("queryXml", gSqlQuery.toXml());
    param.put("startPageNum", pTaskInfo.currentPage-1);
    param.put("pageSize", pTaskInfo.pageSize);
    var sResult = IPSDAO.execute("commonQueryForPage", param);
    var xmlDoc = new jetsennet.XmlDoc();
    xmlDoc.loadXML(sResult.resultVal);
    var count = xmlDoc.documentElement.getAttribute("TotalCount");
    el('divTaskList').innerHTML = jetsennet.xml.transform("xslt/dstotask.xsl",xmlDoc);
    gTaskGridList.bind(el("divTaskList"), el("tabTask"));
    pTaskInfo.setRowCount(count);
    var objItems =  jetsennet.xml.toObject(sResult.resultVal, "Record");
    if(objItems){
    	//默认选择行事件
    	taskToProces(objItems,true);
    	//默认渲染第一行
    	gTaskGridList.selectRow(0);
    }
	//统计图表
    taskTotal(dsId);
}

/**
 * 加载数据源视角页面
 */
function onDSView(){
	gDataSourceCrud.load();
	var objItems =  gDataSourceCrud.grid.objItems;
    if(objItems.length>0){
    	//默认选择行事件
    	dsRowClick(objItems[0].DS_ID);
        //默认渲染第一行
    	gDataSourceCrud.grid.selectRow(0);
    }
    
	gDataSourceCrud.grid.onrowclick = function(obj,td){
		dsRowClick(obj.DS_ID);
	};
}
