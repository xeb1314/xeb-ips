jetsennet.require(["gridlist", "window", "menu", "bootstrap/bootstrap", "jquery/jquery.slimscroll"]);
jetsennet.importCss(["bootstrap/bootstrap", "jetsen"]);

var gToolBox = new jetsennet.ui.ToolBox();
gToolBox.addItem(jQuery.extend(new jetsennet.ui.ToolBoxItem("taskview", "调度视图"), { icon: "images/task-view.png", onclick: function () {
	if(ServerView.isWorkerView())
	{
		ServerView.showDetails(ServerView.VIEW_TYPE_TASK);
	}
} }));
gToolBox.addItem(jQuery.extend(new jetsennet.ui.ToolBoxItem("workerview", "全况视图"), { icon: "images/actor-view.png", onclick: function () {
	if(!ServerView.isWorkerView())
	{
		ServerView.showDetails(ServerView.VIEW_TYPE_WORKER);
	}
} }));

MTCDAO.async = true;//所有请求均改为异步处理的方式
var gServers = [];	//用于保存所有的调度器

//缓存删除任务id
var _delTaskIdArray = [];
$(function(){
	if(jetsennet.util.cookie("_delTaskIds")){
		var _delTaskIds = jetsennet.util.cookie("_delTaskIds");
		_delTaskIdArray = _delTaskIds.split(",");
	}
});

$(function(){
	
	gToolBox.render("divButtons");
	refreshGlobalView();
	jQuery(window).resize(function(){
		if(ServerView.isWorkerView())
		{
		    WorkerView.resize();
		}
    });
});

/**
* 刷新全局视图
*/
function refreshGlobalView() {
    
	MyTimer.stopGlobalTimer();//关闭全局定时器
	
    MTCDAO.queryObjs({
    	method: 	"commonXmlQuery",
    	keyId:		"SERVER_ID",
    	tableName:	"MTC_SERVER",
    	tabAliasName:	"t",
    	resultFields: "t.*",
    	options: 	{
    		success: function (result) {
    			if(result && result.length>0)
    			{
    				gServers = result;
    				ServerView.showTree();
    				ServerView.showDetails();
    				MyTimer.startGlobalTimer();//启动全局定时器
    			}
    			else
    			{
    				jetsennet.message("调度服务器没有成功注册!");
    			}
    		},
    		error: function(e){
    			jetsennet.error("左侧列表加载出错!" + e);
    		}
    	}
    });
}

/**
 * 页面定时器
 */
var MyTimer = (function(){
	
	var _INTERVAL_GLOBAL = 1000 * 6;  	// 全局轮询间隔
	var _INTERVAL_PARTIAL = 1000 * 3;  	// 局部轮询间隔
	var _DELAY_TIME = 60;			// 布局延迟时间
	
	var _globalTimer = null;    		// 整体定时器
	var _partialTimer = null;   		// 局部定时器
	
	return {
		
		/**
		 * 停止全局定时器
		 */
		stopGlobalTimer: function () {
			window.clearTimeout(_globalTimer);
		    window.clearTimeout(_partialTimer);
		},
		
		/**
		 * 开启全局定时器
		 */
		startGlobalTimer: function () {
			_globalTimer = window.setTimeout(function(){
				refreshGlobalView();
	    	}, _INTERVAL_GLOBAL);
		},
		
		/**
		 * 停止局部定时器
		 */
		stopPartialTimer: function () {
			window.clearTimeout(_partialTimer);
		},
		
		/**
		 * 开启局部定时器
		 */
		startPartialTimer: function () {
			_partialTimer = window.setTimeout(function(){
				ServerView.showDetails();
			}, _INTERVAL_PARTIAL);
		}
	};
}());

/**
 * 操作处理者
 */
var Operator = (function(){
	
	var _formatUrl = function(ip, port) {
		return 'http://' + ip + ':' + port;
	};
	
	return {
		
		/**
		 * 删除Task
		 */
		removeTask: function(taskID) {
			jetsennet.confirm("确认删除该任务吗？", function () {
				var param = new HashMap();
				param.put("taskId", taskID);
				MTCDAO.execute("deleteTask", param, {
					success: function (result) {
						_delTaskIdArray.push(taskID);
//						jetsennet.message("任务删除成功！");
						ServerView.showDetails();
					}, 
					error: function(e){
						jetsennet.error("任务删除失败！" + e);
					}
				});
				return true;
			});
		},
		
		/**
		 * 停止worker
		 */
		stopWorker: function(workerID, actorID, ip, port,actorUrl) {
			jetsennet.confirm("确认停止吗？", function () {
				var param = new HashMap();
				param.put("workerID", workerID);
				param.put("actorID", actorID);
				param.put("actorURL", actorUrl?actorUrl:_formatUrl(ip, port));
				MTCDAO.execute("stopWorker", param, {
					success: function (result) {
						jetsennet.message("操作成功,请等待执行器停止！");
						ServerView.showDetails();
					}, 
					error: function(e){
						jetsennet.error("停止执行器失败！" + e);
					}
				});
				return true;
			});
		},
		
		/**
		 * 启动worker
		 */
		startWorker: function(workerID, actorID, ip, port,actorUrl) {
			var param = new HashMap();
			param.put("workerID", workerID);
			param.put("actorID", actorID);
			param.put("actorURL", actorUrl?actorUrl:_formatUrl(ip, port));
			MTCDAO.execute("startWorker", param, {
				success: function (result) {
					jetsennet.message("操作成功,请等待执行器启动！");
					ServerView.showDetails();
				}, 
				error: function (e) {
					jetsennet.error("启动执行器失败！" + e);
				}
			});
		},
		
		/**
		 * 停止actor
		 */
		stopActor: function(actorId, ip, port) {
			var param = new HashMap();
			param.put("actorID",actorId);
			param.put("actorURL", _formatUrl(ip, port));
			MTCDAO.execute("stopActor", param, {
				success: function (result) {
					jetsennet.message("操作成功,请等待调度器停止！");
					refreshGlobalView();
				}, 
				error: function (e) {
					jetsennet.error("停止调度器失败！" + e);
				}
			});
		},
		
		/**
		 * 开启actor
		 */
		startActor: function(actorId, ip, port) {
			
			var param = new HashMap();
			param.put("actorID",actorId);
			param.put("actorURL", _formatUrl(ip, port));
			MTCDAO.execute("startActor", param, {
				success: function (result) {
					jetsennet.message("操作成功,请等待调度器启动！");
					refreshGlobalView();
				}, 
				error: function (e) {
					jetsennet.error("启动调度器失败！" + e);
				}
			});
		}
	};
}());

/**
 * 调度器视图
 */
var ServerView = (function() {
	
	var _currentManager = null;	// 当前manager
	var _currentServer = null;	// 当前调度服务器
	var _currentViewType = 1;	// 当前视图
	
	/**
	 * 生成树节点
	 */
	var _genTreeNode = function(node, item, badge){
		
		//图片前缀
		var icon = item.SERVER_TYPE==1 ? "manager" : "actor";
		//添加状态
		if(gWorkerStates[item.WORK_STATE])
		{
			icon +=  "_" + gWorkerStates[item.WORK_STATE]["NAME"];
		}
		else
		{
			icon +=  "_default";
		}
		//构造全路径
		icon = "images/" + icon + ".png";
		
		var link = jQuery("<a>", {}).appendTo(node);
		jQuery("<img>", {}).attr("src", icon).load(function(){
			if(badge)
			{
				var leftPosition = $(this).position().left + $(this).width() - 15;
				jQuery("<span>", {}).addClass("badge").text(badge).css({"left" : leftPosition}).appendTo(link);
			}
		}).appendTo(link);
		jQuery("<span>"+item.HOST_IP+"</span>", {}).appendTo(link);
		$(node).data("item", item);
	};
	
	/**
	 * 绑定actor操作菜单
	 */
	var _bindActortmenu = function(node, item) {
        if(item.WORK_STATE == 10)//停止
        {
        	jQuery("<i>", {}).addClass("fa fa-play-circle-o").attr("title", "启动").click(function(){
        		Operator.startActor(item.HOST_IP, item.HOST_IP, item.HOST_PORT);
        	}).appendTo(node);
        }else
        {
        	jQuery("<i>", {}).addClass("fa fa-pause").attr("title", "停止").click(function(){
        		Operator.stopActor(item.HOST_IP, item.HOST_IP, item.HOST_PORT);
        	}).appendTo(node);
        }
	};
	
	/**
	 * 设置当前actor
	 */
	var _selectActor = function(item, node) {
		//如果点击的服务器改变，内容区域置为空
		if(_currentServer&&_currentServer.SERVER_ID!=item.SERVER_ID){
			$("#divGrid").empty();
		}
		_currentServer = item;
		if(item.SERVER_TYPE == ServerView.SERVER_TYPE_MANAGER)
		{
			$("#managertree").find("li.selected").removeClass("selected");
		}
		$("#managertree").find("ul").find("li.selected").removeClass("selected");
		$(node).addClass("selected");
	};
	
	/**
	 * 判断指定的server是否存在
	 */
	var _isServerExist = function(server) {
	    if(server)
	    {
	    	for(var i=0; i<gServers.length; i++)
	    	{
	    		if(gServers[i].SERVER_ID == server.SERVER_ID)
	    		{
	    			return gServers[i]; 
	    		}
	    	}
	    }
	    return null;
	};
	
	
	return {
		
		/**
		 * 展示树
		 */
		showTree: function() {
			
			$("#managertree li").remove();//清空树
			//	manager节点
		    var liManager = jQuery("<li>", {}).appendTo("#managertree").click(function(e){
		    	MyTimer.stopPartialTimer();
		    	_selectActor(_currentManager, this);
    			ServerView.showDetails();
    			e.stopPropagation();
		    });
		    //	actor列表
		    var ulActors = jQuery("<ul>", {});
		    //	刷新前正在查看的server
		    var lstServer = _isServerExist(_currentServer);
		    var domNode = null;
		    var continueFlag = false;
		    $.each(gServers, function(i, item){
		    	if (this.SERVER_TYPE == ServerView.SERVER_TYPE_MANAGER && this.WORK_MODE == "1") {
		    		continueFlag = true;
		    	}
		    });
		    if(!continueFlag){
		    	return;
		    }
		    $.each(gServers, function(i, item){
		    	if (this.SERVER_TYPE == ServerView.SERVER_TYPE_MANAGER && this.WORK_MODE == "1") {
		    		_currentManager = this;
		    		$("#manageName").text(this.SERVER_NAME + " ("+ (this.SET_MODE == "1"?"工作模式-主":"工作模式-备") +")");
		    		_genTreeNode(liManager, this);
		    		
		    		if(!lstServer){
		    			lstServer = this;
		    			domNode = liManager;
		    		}else if(lstServer.SERVER_ID == this.SERVER_ID){
		    			domNode = liManager;
		    		}
		    	}
		    	else if(this.SERVER_TYPE == ServerView.SERVER_TYPE_ACTOR) {
		    		
		    		var node =  jQuery("<li>", {}).appendTo(ulActors).click(function(e){
		    			MyTimer.stopPartialTimer();
		    			_selectActor(item, this);
		    			ServerView.showDetails();
		    			e.stopPropagation();
		    		});
		    		_genTreeNode(node, this);
		    		_bindActortmenu(node, this);
		    		
		    		if(lstServer && lstServer.SERVER_ID == this.SERVER_ID){
		    			domNode = node;
		    		}
		    	}
		    });
		    _selectActor(lstServer, domNode);
		    ulActors.appendTo(liManager);
		},
		
		/**
		 * 显示明细
		 *		 
		 */
		showDetails: function(type) {
			
			_currentViewType = type ? type : _currentViewType;
			if(_currentServer)
			{
				$("#serverName").text(_currentServer.SERVER_NAME+"("+_currentServer.HOST_IP+")");
				if(_currentServer.SERVER_TYPE == ServerView.SERVER_TYPE_MANAGER)
				{
					gToolBox.displayItems(["taskview"], true);
				}
				else if(_currentServer.SERVER_TYPE == ServerView.SERVER_TYPE_ACTOR)
				{
					gToolBox.displayItems(["taskview"], false);
				}
				if (_currentViewType == ServerView.VIEW_TYPE_TASK && _currentServer.SERVER_TYPE == ServerView.SERVER_TYPE_MANAGER) 
				{
					MyTimer.stopPartialTimer();//关闭局部定时器
					$(".viewSelect").removeClass("viewSelect");
					$(gToolBox.getItem("taskview").control).addClass("viewSelect");
					TaskView.createTaskView();
				}
				else  
				{
					MyTimer.stopPartialTimer();//关闭局部定时器
					$(".viewSelect").removeClass("viewSelect");
					$(gToolBox.getItem("workerview").control).addClass("viewSelect");
					WorkerView.createWorkerView();
				}
			}
			else
			{
				jetsennet.message("请指定调度服务器!");
			}
		},
		
		/**
		 * 是否是worker视图
		 */
		isWorkerView: function() {
			return _currentViewType == ServerView.VIEW_TYPE_WORKER;
		},
		
		/**
		 * 获取当前的调度器
		 */
		getCurrentServer: function() {
			return _currentServer;
		},
		
		VIEW_TYPE_TASK: 1,
		VIEW_TYPE_WORKER: 2,
		
		SERVER_TYPE_MANAGER: 1,
		SERVER_TYPE_ACTOR: 2
		
	};
	
}());

/**
 * 任务视图处理器
 */
var TaskView = (function(){
	
	var _haveCheckedIds = [];
	var _orderByStr = "ORDER BY t.TASK_STATE DESC,TASK_NAME";
	
	var _columns = [/*{ fieldName: "TASK_ID", width: 40, align: "center", isCheck: 1, checkName: "chkTask"},*/
                    { fieldName: "TASK_NAME", sortField: "TASK_NAME", width: "100%", align: "left", name: "任务名称"},
                    { fieldName: "TASK_TYPE", sortField: "TASK_TYPE", width: 120, align: "left", name: "任务类型", format:function(val, vals){
                    	if(val&&gTaskTyps[val])
                    	{
                    		return gTaskTyps[val];
                    	}
                    	else
                    	{
                    		return "未知";
                    	}
                    }},
                    { fieldName: "TASK_STATE,TASK_PERCENT", sortField: "TASK_STATE", width: 135, align: "center", name: "任务状态", format:function(val, vals){
                    	val = gTaskStates[val]["DESC"]||"未知状态";
                    	if(vals[1] && vals[1]>=0 && vals[1]<=100 && vals[0]!=1&&vals[0]!=2)
                    	{
                    		val += "(" + vals[1] + "%)";
                    	}
                    	return val;
                    }},
                    { fieldName: "TASK_LEVEL", sortField: "TASK_LEVEL", width: 55, align: "center", name: "优先级"},
                    { fieldName: "START_TIME,TASK_STATE", sortField: "START_TIME", width: 140, align: "center", name: "任务开始时间",format:function(val, vals){
                    	if(vals[1]<=2){
                    		return "--";
                    	}
                    	return val;
                    }},
                    { fieldName: "TASK_ACTOR,TASK_STATE", sortField: "TASK_ACTOR", width: 100, align: "center", name: "执行器",format:function(val, vals){
                    	if(vals[1]<=2){
                    		return "--";
                    	}
                    	return val;
                    }},
                    { fieldName: "TASK_ID", width: 45, align: "center", name: "操作", format: function(val,vals){
//                    	return "<i class=\"fa fa-times\" style=\"color: red; font-size: 16px; cursor:pointer;\" onclick=\"Operator.removeTask('"+val+"')\"></i>" ;
                    	return "<div id=\"operTask_"+val+"\"><img style=\"cursor:pointer;\" src=\"images/cel_del.png\" title=\"删除任务\" onclick=\"Operator.removeTask('"+val+"')\"></img></div>" ;
                    }}];
	
	var _grid = jQuery.createGridlist("divGrid", _columns); //表格对象，自动生成
	_grid.ondatasort = function(sortfield, desc)
	{
		_orderByStr = "ORDER BY t." + sortfield + (desc?" DESC":" ASC"); 
		if(sortfield=="START_TIME"){
			_orderByStr = "ORDER BY t.TASK_STATE DESC,t." + sortfield + (desc?" DESC":" ASC"); 
		}
		ServerView.showDetails();
	};
	
	/**
	 * 标记已经选上的
	 */
	var _noteChecked = function () {
		if($(".jetsen-checkbox.checked[name='chkTask']").length>0)
		{
			_haveCheckedIds = [];
			$.each($(".jetsen-checkbox.checked[name='chkTask']"), function(){
				_haveCheckedIds.push($(this).attr("value"));
			});
		}
	};
	
	var _noteDelTask = function (resultXml) {
		var objs = jetsennet.xml.toObject(resultXml, "Record");
		if(_delTaskIdArray.length>0&&objs){
			var extendTaskIds = [];
			for ( var i = 0; i < objs.length; i++) {
				if(_delTaskIdArray.contains(objs[i].TASK_ID))
				{
					extendTaskIds.push(objs[i].TASK_ID);
					$("#operTask_"+objs[i].TASK_ID).html("删除中...");
				}
			}
			jetsennet.util.cookie("_delTaskIds",extendTaskIds.join(","));
		}
	};
	
	/**
	 * 重新选取
	 */
	var _reChecked = function () {
		if(_haveCheckedIds.length>0)
		{
			$.each($(".jetsen-checkbox[name='chkTask']"), function(){
				if(_haveCheckedIds.contains($(this).attr("value")))
				{
					$(this).addClass("checked");
				}
			});
			_haveCheckedIds = [];
		}
	};
	
	return {
		
		/**
		 * 任务视图
		 */
		createTaskView : function () {
//			_noteChecked();
			
			var currentServer = ServerView.getCurrentServer(); 
			var cons = [];
			cons.push(["t.TASK_STATE", "2,100,101", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.In, jetsennet.SqlParamType.Numeric]);
			if(currentServer.SERVER_TYPE == ServerView.SERVER_TYPE_ACTOR)
			{
				cons.push(["t.TASK_ACTOR", currentServer.HOST_IP, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String]);
			}
			MTCDAO.query({
				method: 	"commonXmlQuery",
		    	keyId:		"TASK_ID",
		    	tableName:	"MTC_TASKEXEC",
		    	tabAliasName:	"t",
		    	conditions: cons,
		    	resultFields: "TASK_NAME,TASK_TYPE,TASK_STATE,TASK_PERCENT,TASK_LEVEL,START_TIME,TASK_ACTOR,TASK_ID",
		    	orderBy: _orderByStr,
		    	options: 	{
		    		success: function (resultXml) {
		    			if(resultXml)
		    			{
		    				_grid.enableRemPosition=true;
		    				_grid.renderXML(resultXml);
//		    				_reChecked();
		    				_noteDelTask(resultXml);
		    				MyTimer.startPartialTimer();//开启局部定时器
		    			}
		    		},
		    		error: function(e){
		    			jetsennet.error("创建调度视图失败!" + e);
		    			MyTimer.startPartialTimer();//开启局部定时器
		    		}
		    	}
			});
		}
	};
	
}());

/**
 * 执行器视图处理器
 */
var WorkerView = (function(){
	
	var _isNew = true;
	var _top = "";
	var _trcls = "odd";
	var _curList = null;
	
	var _trCount = 0;
	var _TR_HEIGHT = 30;
	
	var actorIdObj = {};  //存储actorId与actorUrl对应关系 方便在manager全况视图操作worker
	/**
	 * 生成actor视图
	 */
	var _renderView = function(arr) {
		
		_isNew = true;
		_trCount = 0;
		
		if($("#divGrid").find(".slimScrollBar").length>0) {
		    _top = $("#divGrid").find(".gridbody")[0].scrollTop + "px";
		}
		var myGrid = jQuery("<ul>", {}).addClass("ul-worker-view");
		var title = {type:"任务类型", worker:[{
			workerName:"Worker名称", 
			taskName:"任务名称",
			taskPercent:"任务状态",
			taskStartTime:"任务执行开始时间",
			operate:"操作"}]};
		var head = jQuery("<table>", {}).attr("cellspacing", "0").attr("cellpadding", "0").appendTo(jQuery("<li>", {}).addClass("head").appendTo(myGrid));
		_genRecord(title, head, "未知项", true);
		$("#divGrid").html("").removeClass("jetsen-grid");
		$(myGrid).appendTo("#divGrid");
		
		_trcls = "odd";
		_curList = jQuery("<table>", {}).attr("cellspacing", "0").attr("cellpadding", "0").appendTo(jQuery("<div>", {}).addClass("gridbody").appendTo(jQuery("<li>", {}).addClass("body").appendTo(myGrid)));
		$.each(arr, function(i, item){
			_genRecord(item, _curList, "--");
		});
		
		WorkerView.resize();
	};
	
	/**
	 * 拆分描述信息
	 */
	var _parseDesc = function(w) {
		
		w.taskName = w.stateDesc; 
		if(w.stateDesc && w.stateDesc.lastIndexOf("]") == (w.stateDesc.length-1))
		{
			var percent = w.stateDesc.substring(w.stateDesc.lastIndexOf("[") + 1, w.stateDesc.lastIndexOf("]"));
			if(percent && percent.lastIndexOf("%") == (percent.length-1))
			{
				var num = percent.substring(0, percent.lastIndexOf("%"));
				if (num.length>0 && !isNaN(Number(num)))
				{
					w.taskPercent = "(" + percent + ")";
					w.taskName = w.stateDesc.substring(0, w.stateDesc.lastIndexOf("[")) ;
				}
			}
		}
	};
	
	/**
	 * 生成条目
	 */
	var _genRecord = function(item, table, blank, isHead){
		
		var tType = null;
		$.each(item.worker, function(i, w){
			
			if(!isHead)
			{
				_parseDesc(w);
			}
			_trCount ++ ;
			var tr = jQuery("<tr>", {}).addClass(item.cls||"").addClass(_trcls).appendTo(table);
			_trcls = _trcls=="odd" ? "even" : "odd";
			//	类型
			if(i == 0){
				var tTypeVal = isHead ? item.type : (item.type&&gTaskTyps[item.type] ? gTaskTyps[item.type] : "未知");
				tType = jQuery("<td>", {}).addClass("td-task-type").append(jQuery("<div>", {}).text(tTypeVal||blank).attr("title", tTypeVal||blank)).appendTo(tr);  
			}else{
				$(tType).attr("rowspan", i+1);
			}
			//	work名称
			var wName = jQuery("<div>", {}).attr("title", w.workerName||blank).appendTo(jQuery("<td>", {}).addClass("td-worker-name").appendTo(tr));
			if(!isHead){
				jQuery("<img>", {}).attr("src", "images/workstate/w-"+gWorkerStates[w.workerState]["NAME"]+".gif").appendTo(wName);
			}
			jQuery("<span>", {}).text(w.workerName||blank).appendTo(wName);
			//	task名称
			jQuery("<td>", {}).addClass("td-task-name").append(jQuery("<div>", {}).text(w.taskName||blank).attr("title", w.taskName||blank)).appendTo(tr);
			//	state
			var tStateVal = ((isHead ? "" : gWorkerStates[w.workerState]["DESC"])+ (w.taskPercent||""))||blank ;
			jQuery("<td>", {}).addClass("td-task-state").append(jQuery("<div>", {}).text(tStateVal).attr("title", tStateVal||blank)).appendTo(tr);
			//	开始时间
			var taskStartTime = (w.workerState=="3" || isHead)?w.taskStartTime:blank;
			jQuery("<td>", {}).addClass("td-task-stime").append(jQuery("<div>", {}).text(taskStartTime||blank).attr("title", taskStartTime||blank)).appendTo(tr);
			//	操作
			if(isHead) {
				jQuery("<td>", {}).addClass("td-task-oper").append(jQuery("<div>", {}).text(w.operate||blank)).appendTo(tr);
			}
			else{
				
				var oper = jQuery("<div>", {}).appendTo(jQuery("<td>", {}).addClass("td-task-oper").appendTo(tr));
				var actor = ServerView.getCurrentServer();
				var img = jQuery("<img>", {}).appendTo(oper);
				if(w.workerState==10){
					img.attr("title", "启动").attr("src", "images/cel_start.png").click(function(){
						var actorUrl = "";
						if(actor.SERVER_TYPE == ServerView.SERVER_TYPE_MANAGER){
							actorUrl = actorIdObj[w.actorID];
						}
						Operator.startWorker(w.workerID, actor.HOST_IP, actor.HOST_IP, actor.HOST_PORT,actorUrl);
					});
				}
				else{
					img.attr("title", "停止worker").attr("src", "images/cel_pause.png").click(function(){
						var actorUrl = "";
						if(actor.SERVER_TYPE == ServerView.SERVER_TYPE_MANAGER){
							actorUrl = actorIdObj[w.actorID];
						}
						Operator.stopWorker(w.workerID, actor.HOST_IP, actor.HOST_IP, actor.HOST_PORT,actorUrl);
					});
				}
			}
			//	空白
			jQuery("<td>", {}).addClass("td-blank").appendTo(tr);
		});
	};
	
	/**
	 * 填充空行
	 */
	var _fillBlank = function() {
		
		var gap = ($("#divGrid").height() / _TR_HEIGHT) - _trCount;
		if(gap >= 1)
		{
			var blank = {type:"", cls:"blank", worker:[{
				workerName:"", 
				taskName:"",
				taskPercent:"",
				taskStartTime:"",
				operate:""}]};
			while(gap>=1)
			{
				_genRecord(blank, _curList, "", true);
				gap--;
			}
		}
	};
	
	/**
	 * 重设滚动条
	 */
	var _resetScrollBar = function() {
		
		var barHeight = $("#divGrid").height() - _TR_HEIGHT ;
		
		var list = $("#divGrid").find("div.gridbody"); 
		if(!_isNew)
		{
			list.slimScroll({
				destroy: true
			});
			list.removeAttr('style');
		}
		
		setTimeout(function(){
	        list.slimScroll({
	            size: '7px',
	            color: '#a1b2bd',
	            opacity: .3,
	            height: barHeight
	        });
		    if(_isNew) {
		        list.slimScroll({ scrollTo: _top });
		        _isNew = false;
		    }
		}, 10);
	};
	
	/**
	 * 统一列宽
	 */
	var _unifyColumnWidth = function(relate, follow) {
		
		relate = relate||$("#divGrid").find("li.body").find("tr")[0];
		follow = follow||$("#divGrid").find("li.head").find("tr")[0];
		$.each($(relate).children(), function(i, item){
			$($(follow).children()[i]).width($(item).width());
		});
	};
	
	return {
		
		/**
		执行器视图
		*/
		createWorkerView: function() {
			
//			var currentActor = ServerView.getCurrentServer();
//			var actorList = [{ 
//				id: currentActor.HOST_IP, 
//				url: 'http://' + currentActor.HOST_IP + ':' + currentActor.HOST_PORT }];
//		    param.put("serverType", currentActor.SERVER_TYPE);
//		    param.put("serverId", currentActor.SERVER_ID);
//		    param.put("actorList", jetsennet.xml.serialize(currentActor, "ACTOR"));
		    
		    var param = new HashMap();
		    param.put("serverXML", jetsennet.xml.serialize(ServerView.getCurrentServer(), "SERVER"));
		    
		    var mtcDAO = new jetsennet.DefaultDal("MTCSystemService","HTTP_JQUERY","true","POST","xml");
		    mtcDAO.execute("getServerWorkerState", param, {
		    	server: ServerView.getCurrentServer(),
				success: function (result) {
					if(result)
					{
						MyTimer.startPartialTimer();//开启局部定时器
						var resultObj = jQuery.parseJSON(result);
						var workerList = resultObj.workerList;
						
//						if(workerList&&workerList.length>0){							
//							jQuery.each(workerList,function(index,item){
//								var newWorkerList = [];
//								jQuery.each(item.worker,function(w,worker){
//									if(worker.workerState!=10){
//										newWorkerList.push(worker);	
//									}									
//								});
//								item.worker=newWorkerList;
//							});
//						}
						if(workerList&&workerList.length>0){
							jQuery.each(resultObj,function(actorId,actorObj){
								if(actorId&&actorId!="workerList"){
									actorIdObj[actorId] = actorObj.actorURL;
								}
							});
							_renderView(workerList);
						}else if(this.server.SERVER_ID==ServerView.getCurrentServer().SERVER_ID){
							$("#divGrid").html("");
						}
					}
				}, 
				error: function(e) {
//					jetsennet.error("创建全况视图失败!" + e);
					$("#divGrid").html("");
					MyTimer.startPartialTimer();//开启局部定时器
				}
			});
		},
		
		/**
		 * 重置布局
		 */
		resize: function(){
			_trCount = _trCount - $(_curList).find("tr.blank").length;
			$(_curList).find("tr.blank").remove();
			_fillBlank();
			_resetScrollBar();
			_unifyColumnWidth();
		}
		
	};
}());

