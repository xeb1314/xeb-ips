jetsennet.require([ "pagebar", "window", "bootstrap/moment", "bootstrap/daterangepicker","autocomplete","datepicker",
                    "menu","tabpane", "jetsentree","flowview", "accordion","pageframe"]);
jetsennet.importCss("bootstrap/daterangepicker-bs3");

var gFunction;

var gTaskTemplateFlowView;
var gCurrentTemplateProcess;

var gFlowView;
var gCurrentProcess;
var gCurrentProcessType;
var gXmlData;
var gToolBox;
var gAssignType = -1;
var gWorkflow;
var currentIndex;
//全局 当前选中任务列表对象
var gSelTaskObj;
//全局 当前选中数据源列表对象
var gSelDataObj;

//当前选中的 gFlowView - Node  12.09
var gSelNode;

/**
 * 任务列表分页个数
 */
var taskPageSize = 4;

var isProcess = true;


/**
 * 数据源-输入节点集合
 * 输入节点是否允许绑定拖入的数据源，在此Map中维护
 */
var DSInMap = new HashMap();
DSInMap.put("800","邮件数据源_Excel");
DSInMap.put("801","邮件数据源_EML");
DSInMap.put("812","文本数据源");
DSInMap.put("815","IP数据源");
DSInMap.put("808","话音数据源");
DSInMap.put("811","传真数据源");
DSInMap.put("816","文本数据源");

/**
 * 数据源-输入和输出节点为同一个节点
 * 包含输入和输出为同一个节点的数据源，在此Map中维护
 */
var DSInOutMap = new HashMap();
DSInOutMap.put("802","口令数据源");
DSInOutMap.put("803","身份数据源");

/**
 * 数据源-输出节点集合
 * 输出节点是否允许绑定拖入的数据源，在此Map中维护
 */
var ExtDBMap = new HashMap();
ExtDBMap.put("890","邮件入库");
ExtDBMap.put("891","文件入库");
ExtDBMap.put("892","话音入库");
ExtDBMap.put("893","传真入库");
ExtDBMap.put("896","新时代邮件入库");

/**
 * 数据源类型--文件
 */
var DS_TYPE_FILE = "10";
/**
 * 数据源类型--数据库表
 */
var DS_TYPE_TABLE = "20";

var urlId = null;

function pageInit() {
	//{size: {width : 320,height : 0},splitType: 1, layout: [60, 'auto']}
	jQuery("#divPageFrame").pageFrame({ 
		showSplit :false,minSize: { 
			width: 900, height: 0
			},splitType: 1,layout: 
				[{size: {width : 0,height : '30%'},splitType: 1, layout: [35, 'auto', 30]},//240
				{size: {width : 0,height : '40%'},splitType: 1, layout: [35, 'auto']},//200
				{size: {width : 0,height : '30%'},splitType: 0, layout: [280,{splitType: 1, layout: [35, 'auto', 35]}]
				}]
		}).sizeBind(window);
	
	gDataSourceCrud.pageBar.onpagechange = function () {
		loadDataSourceListByRole();
//		gDataSourceCrud.load();
		//如果是系统管理员角色查询所有数据源  update by  xueenbin 20160411
	     /*if(isSystem()){
	    	 gDataSourceCrud.load();
	     }else{
	    	var condition = [];
	   		condition.push(["a.GROUP_ID", queryGroupIdByUserId(), jetsennet.SqlLogicType.Or, jetsennet.SqlRelationType.In]);
	  		condition.push(["d.STATE", "0", jetsennet.SqlLogicType.Or, jetsennet.SqlRelationType.In]);
	  		gDataSourceCrud.search(condition);
	    	 
	     }*/
    };
	
	//datasource.js 回调逻辑
	callback = function (){
		//加载 数据源列表 拖拽事件
	    jQuery("#divDataSourceList-tab-body").find(".jetsen-grid-body-inner").draggable({
	    	handle: el('selected'),
	        limit: false,
	        absoluteDrag: true,
	        dragClone: true,
	        dragNone: true,
	        limitOptions: { container: el('divDesign') },
	        onstart: function (pos) {
	//        	jQuery(this.dragControl).appendTo("body");
	        },
	        onstop: function (pos) {
	        	var mousePos = jetsennet.util.getMousePosition();
	            if (gFlowView.isDesignMode && jetsennet.util.isInPosition(mousePos, el("divDesignPanel")))
	            {
	            	if(gSelNode == null)
	            	{
	            		jetsennet.alert("请选中节点后再尝试此操作！");
	            		return;
	            	}
	            	if(gSelDataObj == null)return;
	            	if(gSelDataObj.STATE == "2")
	            	{
	            		jetsennet.alert("当前数据源："+gSelDataObj.DS_NAME+" 需申请使用权限！");
	            		return;
	            	}
	            	var nodeId = gSelDataObj.DS_ID;
	            	//节点ID 与 数据源类型一致
//	            	var nodeData = {id: -1, actId: gSelDataObj.DS_CLASS, name: gSelDataObj.DS_NAME, actType: "3", dataId: nodeId};
//	    			gFlowView.addNodeByType(nodeData.actType, nodeData);
//					gFlowView.render();
					
					//数据源参数
					var _dsPath = gSelDataObj.STR_1;
					
					//当前流程的节点集合
					var nodes = gFlowView.workflowNode.childNodes;
					var _flag = false;
					for(var i=0; i < nodes.length; i++)
					{
						if(bindingNode(nodes[i]))
						{
							_flag = true;
							break;
						}
					}
					if(!_flag)jetsennet.alert("当前流程不能处理此类数据源！");
					gSelNode = null;
	            }
	        },
	        onmove: function (pos) {
	        	if (!gFlowView.isDesignMode) {
	                jQuery(this.dragControl).css({ "cursor": "not-allowed" });
	            }
	        }
	    });
	}
	
	//数据源类别
	jetsennet.ui.DropDownList.initOptions("txtClass", true);
	//加载数据源类别下拉框
	loadSelectType("txtClass","10","--请选择分类类别--");
	jetsennet.ui.DropDownList["txtClass"].onchanged = function (item) {
		if(item.value == "-1")
		{
			//清空Div
			el("divDataTree").innerHTML="";
			el("divDataSourceList").innerHTML="";
			el("divDataSourcePage").innerHTML="";
			return;
		}
		//加载该分类类别下所有子项
		loadSubClass(item.value);
		//创建数据源分类树
		createClassTree(item.value,"divDataTree","loadDataSource");
	};
	
	//加载数据字典所有的项
	loadCWWord();
	
	//先加载数据源 再加载 initWfView() 数据源列表可拖拽
	//gDataSourceCrud.load();
	//如果是系统管理员角色查询所有数据源  update by  xueenbin 20160411
	loadDataSourceListByRole();
    /*if(isSystem()){
   	 gDataSourceCrud.load();
    }else{
   	var condition = [];
  		condition.push(["a.GROUP_ID", queryGroupIdByUserId(), jetsennet.SqlLogicType.Or, jetsennet.SqlRelationType.In]);
 		condition.push(["d.STATE", "0", jetsennet.SqlLogicType.Or, jetsennet.SqlRelationType.In]);
 		gDataSourceCrud.search(condition);
   	 
    }*/
	
	/**
	 * 选中数据源列表一行，赋值gSelDataObj
	 */
	gDataSourceCrud.grid.onrowclick = function(item){
		gSelDataObj = item;
	}
	
	//加载流程展现框
	initWfView();
	
	//跳转 任务ID
	urlId = jetsennet.queryString("id");
	//任务后加载，不然任务列表也会拖拽
	loadTask(urlId);
	
	jetsennet.ui.DropDownList.initOptions("txt_TASK_TEMPLATE", true);
	
	//访问方式
	jetsennet.ui.DropDownList.initOptions("lableSelectDSType", true);
	jetsennet.ui.DropDownList.initOptions("lableSelectState", true);
}

/**
 * 初始化 流程展现
 */
function initWfView()
{
	//创建任务 模版展现
	gTaskTemplateFlowView = new jetsennet.ui.WfView(el("divTemplate"));//140 ,"900","100%"
    gTaskTemplateFlowView.isDesignMode = false;
    gTaskTemplateFlowView.render();
    
	
	gFlowView = new jetsennet.ui.WfView(el("divDesign"));//,"900","100"
    gFlowView.isDesignMode = false;
    gFlowView.onnodeconfig = function (node) {
        showParamConfig(node);
    };
    gFlowView.onnodedblclick = function (node) {
        showParamConfig(node);
    };
    gFlowView.onnodeassign = function (node) {
        taskAssign(node);
    };
    gFlowView.onnodemousedown = function (node) {
        gSelNode = node;
    };
    //指定流程展现放大或者缩小比例
//    jetsennet.ui.WfConfig.nodeSize = { width: jetsennet.ui.WfConfig.nodeSize.width * (1.331), height: jetsennet.ui.WfConfig.nodeSize.height * (1.331) };
    gFlowView.render();
}

/**
 * 初始化 新建任务：流程模版 和 编辑任务：流程模版
 * 
 * 修改 创建任务和编辑任务 流程模板不能完全显示
 * Edit by JiJie.LianG 2015-07-01
 */
function initTaskTemplateDropDown(title,divheight)
{
	jetsennet.ui.DropDownList["txt_TASK_TEMPLATE"].clear();
    jetsennet.ui.DropDownList["txt_TASK_TEMPLATE"].appendItem({ text: '-选择流程模版-', value: -1 });
    
    var objs = loadProcessTemplate();
    if (objs && objs.length > 0) {
        for (var i = 0; i < objs.length; i++) {
            jetsennet.ui.DropDownList["txt_TASK_TEMPLATE"].appendItem({ text: objs[i].PROC_NAME, value: objs[i].PROC_ID });
        }
        jetsennet.ui.DropDownList["txt_TASK_TEMPLATE"].setSelectedIndex(0);
    }
    
    el("divTemplate").style.display = "none";
	jetsennet.ui.DropDownList["txt_TASK_TEMPLATE"].onchanged = function (item) {
		renderDivTask(title,item.value,divheight);
	}
}

jetsennet.Crud.prototype.search4PageSize = function(conditions, subConditions) {
    this.conditions = conditions;
    this.subConditions = subConditions;
    if (this.pageBar) {
        this.pageBar.currentPage = 1;
//        this.pageBar.pageSize = taskPageSize;
    }
    this.load();
};

/**
 * 加载 数据处理任务
 */
function loadTask(id)
{
	el('divDesign').innerHTML = "";
	gSelTaskObj = null;
	gCurrentProcess = null;
	
	var conditions = [];
	
	/**
	 * 工作管理页面 跳转至 数据处理页面
	 * 根据以TASK_ID为条件查询，达到定位效果
	 * Add by JiJie.LianG 2015-07-22
	 */
	 //----------跳转定位
	if(!jetsennet.util.isNullOrEmpty(id)){
		conditions.push([ "t.TASK_ID", id, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String ]);
	}
	
	//----------任务名称检索
	var value = el('txtTaskName').value.replace(/\s/ig,'');
	if(value){
		conditions.push([ "t.TASK_NAME", value, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Like, jetsennet.SqlParamType.String ]);
	}
	
    conditions.push([ "t.TASK_TYPE", "10", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric ]);
	gTaskCrud.search4PageSize(conditions);
	
	//判断是否存在数据 Add by JiJie.LianG 2015-07-22
	if(gTaskCrud.grid.objItems.length > 0)
	{
		//默认渲染第一行
	    gTaskCrud.grid.selectRow(0);
	    //渲染第一行对应的 工作流
	    renderFlowDiv(gTaskCrud.grid.objItems[0]);
	}
}

//==================IPS_TASK==========================

var gTaskColumns = [{ fieldName: "TASK_ID", width: 30, align: "center", isCheck: 1, checkName: "chkTask"},
                    { fieldName: "TASK_NAME", sortField: "TASK_NAME", width:"100%", align: "left", name: "任务名称"},
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
                    { fieldName: "PROC_NAME", sortField: "PROC_NAME", width:160, align: "center", name: "流程模版"},
                    { fieldName: "CREATE_TIME", sortField: "t.CREATE_TIME", width:160, align: "center", name: "创建时间"},
                    { fieldName: "UPDATE_TIME", sortField: "t.UPDATE_TIME", width:160, align: "center", name: "修改时间"},
                    { fieldName: "TASK_ID", width: 45, align: "center", name: "编辑", format: function(val,vals){
                    	return jetsennet.Crud.getEditCell("editTaskById('" + val + "')");
//                         return jetsennet.Crud.getEditCell("gTaskCrud.edit('" + val + "')");
                     }},
                    { fieldName: "TASK_ID,PROC_ID", width:45, align: "center", name: "删除", format: function(val,vals){
//                        return '<span style="cursor:pointer;" onclick="gTaskCrud.remove('+"'"+ val + "'"+')"><img src="images/cel_del.png"></img></span>';
						return '<span style="cursor:pointer;" onclick="delTaskById('+"'"+ vals + "'"+')"><img src="images/cel_del.png"></img></span>';
                      }}
                    ];

var gTaskCrud = $.extend(new jetsennet.Crud("divTaskList", gTaskColumns,"divTaskPage", "ORDER BY t.CREATE_TIME DESC"), {
			    dao : IPSDAO,
			    tableName : "IPS_TASK",
			    keyId:"TASK_ID",
			    cfgId :"divTask",
			    resultFields : "t.*,p.PROC_NAME",
			    joinTables: [ [ "WFM_PROCESS", "p", "t.PROCTEMPLATE_ID=p.PROC_ID", jetsennet.TableJoinType.Left ] ],
			    name : "任务",
			    checkId : "chkTask",
			    className : "jetsennet.ips.schema.IpsTask",//      IpsTaskBusiness  jetsennet.ips.schema.IpsTask
			    addDlgOptions : {size : {width : 800, height : 500}},
			    editDlgOptions : {size : {width : 800, height : 500}},
			    onAddInit: function(){
			    	//模版下拉
			    	initTaskTemplateDropDown(gTaskCrud.msgAdd + gTaskCrud.name);
			    },
			    add : function() {
				    var $this = this;
				    var dialog = jetsennet.Crud.getConfigDialog(this.msgAdd + this.name, this.cfgId, this.addDlgOptions);
				    if (this.onAddInit) {
				        this.onAddInit();
				    }
				    dialog.onsubmit = function() {
				        var areaElements = jetsennet.form.getElements($this.cfgId);
				        if (!jetsennet.form.validate(areaElements, true)) {
				            return false;
				        }
				        if ($this.onAddValid && !$this.onAddValid()) {
				            return false;
				        }
				        var obj = $this.onAddGet();
				        return $this.directAdd(obj);
				    };
				    dialog.sizeChanged = function(size) {
						var size = size ? { width: size.width, height: size.height} : { width: this.windowControl.offsetWidth, height: this.windowControl.offsetHeight };
					    var _currentStyle = jetsennet.util.getCurrentStyle(this.windowControl);
					    this.currentStyle.width = size.width;
					    this.currentStyle.height = size.height;
					
					    var height = size.height - jetsennet.util.parseInt(_currentStyle.borderTopWidth, 0) - jetsennet.util.parseInt(_currentStyle.borderBottomWidth, 0);
					
					    var titleHeight = this.windowStyle == 2 ? 0 : this.titleControl.offsetHeight;
					    var buttonHeight = (this.submitBox || this.cancelBox || this.attachButtons.length > 0) ? this.buttonControl.offsetHeight : 0;
					    var contentHeight = height - titleHeight - buttonHeight;
					    if (contentHeight <= 1)
					        contentHeight = 1;
					    this.contentControl.style.height = contentHeight + "px";
					    this.currentStyle.contentHeight = contentHeight;
					   
					   	//清空当前模版流程
						gCurrentTemplateProcess = null;
						renderDivTask(gTaskCrud.msgAdd + gTaskCrud.name,jetsennet.ui.DropDownList["txt_TASK_TEMPLATE"].selectedValue,'500');
				    };
				    dialog.showDialog();
				},
			    onAddValid : function() {
			    	//点击确定时，验证逻辑
			    	//验证 任务名称 是否重复
			    	if(_checkNameExist(el("txt_TASK_NAME").value))
			    	{
			    		return false;
			    	}
			        return true;
			        
			    },
			    onAddGet : function() {
			    	//点击确定后，数据库Insert之前 处理逻辑
			    	
			    	//选定模版，复制模版到新流程并且更新 IPS_TASK表PROC_ID字段
			    	if(jetsennet.ui.DropDownList["txt_TASK_TEMPLATE"].selectedValue != "-1")
			    	{
			    		
			    		var objs = loadProcessTemplate(jetsennet.ui.DropDownList["txt_TASK_TEMPLATE"].selectedValue);
						if (objs && objs.length > 0) {
							for (var i = 0; i < objs.length; i++) {
								gCurrentProcess = null;
								processChanged(objs[i].PROC_ID, objs[i].PROC_TYPE, objs[i].FLOW_TYPE, objs[i].PROC_STATE, objs[i].PROC_NAME, objs[i].PROC_DESC,objs[i].OBJ_TYPE);
							}
						}
						
			    		var flowInfo = {};
					    flowInfo.PROC_NAME = el("txt_TASK_NAME").value+"_流程";
					    flowInfo.PROC_DESC = "任务：" + el("txt_TASK_NAME").value + " 对应的流程";
					    flowInfo.PROC_TYPE= "11";//数据处理流程 "11"
					    flowInfo.OBJ_TYPE= gCurrentProcess.objDataType;//存储对象 "1"
					    flowInfo.FLOW_TYPE = gCurrentProcess.procType;//"0"
					    flowInfo.PROC_STATE = 0;
					    
					    var params = new HashMap();
					    params.put("className", "ProcessBusiness");
					    params.put("saveXml", jetsennet.xml.serialize(flowInfo, "FlowInfo"));
					    var sResult = WFMDAO.execute("commonObjInsert",params);
					    if(sResult.errorCode==0){
					    	var params1 = new HashMap();
					        params1.put("processXml", getProcessXml(sResult.resultVal));
					        var sResult1 = WFMDAO.execute("saveProcess",params1);
					        if(sResult1.errorCode==0){
					            gCurrentProcess = null;
					            //IPS_TASK表PROC_ID字段，存任务对应的流程ID
						       	return {
						                TASK_NAME: el("txt_TASK_NAME").value,
							            TASK_DESC: el("txt_TASK_DESC").value,
							            CLASS_ID: "0",
							            CREATE_USER: jetsennet.application.userInfo.UserName,
							            CREATE_USERID: jetsennet.application.userInfo.UserId,
							            TASK_TYPE: "10",
							            TASK_STATE: "100",
							            PROCTEMPLATE_ID: jetsennet.ui.DropDownList["txt_TASK_TEMPLATE"].selectedValue,
							            PROC_ID: sResult.resultVal
							        };
					        }else{
				        		jetsennet.message(gTaskCrud.msgAdd + gTaskCrud.name +": "+el("txt_TASK_NAME").value+" 对应流程失败！");
				        		return;
				        	}
					    }else{
					    	jetsennet.error(sResult.errorString);
					    	return;
					    }
			    	}
			    	else
			    	{
			    		//创建空流程 返回ProcId
				    	var flowInfo = {};
				        flowInfo.PROC_NAME = el("txt_TASK_NAME").value+"_流程";
				        flowInfo.PROC_DESC = "任务：" + el("txt_TASK_NAME").value + " 对应的流程";
				        flowInfo.PROC_TYPE= "11";//数据处理流程
				        flowInfo.OBJ_TYPE= "1";//存储对象
				        flowInfo.FLOW_TYPE = "0";
				        flowInfo.PROC_STATE = 0;
				
				        var params = new HashMap();
				        params.put("className", "ProcessBusiness");
				        params.put("saveXml", jetsennet.xml.serialize(flowInfo, "FlowInfo"));
				        var sResult = WFMDAO.execute("commonObjInsert",params);
				        if(sResult.errorCode==0){
				        	//IPS_TASK表PROC_ID字段，存任务对应的流程ID
				        	return {
				                TASK_NAME: el("txt_TASK_NAME").value,
					            TASK_DESC: el("txt_TASK_DESC").value,
					            CLASS_ID: "0",
					            CREATE_USER: jetsennet.application.userInfo.UserName,
					            CREATE_USERID: jetsennet.application.userInfo.UserId,
					            TASK_TYPE: "10",
					            TASK_STATE: "100",
					            PROCTEMPLATE_ID: jetsennet.ui.DropDownList["txt_TASK_TEMPLATE"].selectedValue,
					            PROC_ID: sResult.resultVal
					        };
				        }else{
				        	jetsennet.message(gTaskCrud.msgAdd + gTaskCrud.name +": "+el("txt_TASK_NAME").value+" 对应流程失败！");
				        	return;
				        }
			    	}
			    },
			    onAddSuccess:function(item){
			    	jetsennet.message(gTaskCrud.msgAdd + gTaskCrud.name + "成功！");
			    	el('divDesign').innerHTML = "";
			    	gSelTaskObj = null;
			    },
			    edit : function(id) {
			    	
			    	if(!valTaskById(id,"编辑"))return;
			    	
				    var $this = this;
				    var checkIds = this.onGetCheckId ? this.onGetCheckId(id, this.checkId) : jetsennet.Crud.getCheckIds(id, this.checkId);
				    if (checkIds.length != 1) {
				        jetsennet.alert("请选择一个要" + this.msgEdit + "的" + this.name + "！");
				        return;
				    }
				    
				    var dialog = jetsennet.Crud.getConfigDialog(this.msgEdit + this.name, this.cfgId, this.editDlgOptions);
				    if (this.onEditInit) {
				        this.onEditInit(checkIds[0]);
				    }
				    
				    var oldObj = null;
				    if (this.onEditSet) {
				        var conditions = [ [ this.keyId, checkIds[0], jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String ] ];
				        oldObj = this.dao.queryObj(this.objQueryMethodName, this.keyId, this.tableName, this.tabAliasName, null, conditions);
				        if (oldObj) {
				            this.onEditSet(oldObj);
				        }
				    }
				    
				    dialog.onsubmit = function() {
				        var areaElements = jetsennet.form.getElements($this.cfgId);
				        if (!jetsennet.form.validate(areaElements, true)) {
				            return false;
				        }
				        if ($this.onEditValid && !$this.onEditValid(checkIds[0], oldObj)) {
				            return false;
				        }
				        var obj = $this.onEditGet(checkIds[0], $this.oldObj);
				        return $this.directEdit(obj);
				    };
				    
				    dialog.sizeChanged = function(size) {
						var size = size ? { width: size.width, height: size.height} : { width: this.windowControl.offsetWidth, height: this.windowControl.offsetHeight };
					    var _currentStyle = jetsennet.util.getCurrentStyle(this.windowControl);
					    this.currentStyle.width = size.width;
					    this.currentStyle.height = size.height;
					
					    var height = size.height - jetsennet.util.parseInt(_currentStyle.borderTopWidth, 0) - jetsennet.util.parseInt(_currentStyle.borderBottomWidth, 0);
					
					    var titleHeight = this.windowStyle == 2 ? 0 : this.titleControl.offsetHeight;
					    var buttonHeight = (this.submitBox || this.cancelBox || this.attachButtons.length > 0) ? this.buttonControl.offsetHeight : 0;
					    var contentHeight = height - titleHeight - buttonHeight;
					    if (contentHeight <= 1)
					        contentHeight = 1;
					    this.contentControl.style.height = contentHeight + "px";
					    this.currentStyle.contentHeight = contentHeight;
					   
					   	//清空当前模版流程
						gCurrentTemplateProcess = null;
						renderDivTask(gTaskCrud.msgEdit + gTaskCrud.name,jetsennet.ui.DropDownList["txt_TASK_TEMPLATE"].selectedValue,'500');
				    };
				    dialog.showDialog();
				},
				onEditInit:function(){
					initTaskTemplateDropDown(gTaskCrud.msgEdit + gTaskCrud.name,"500");
			    },
			    onEditSet : function(obj) {
			    	//赋值
			    	el("txt_TASK_NAME").value=valueOf(obj,"TASK_NAME","");
			    	el("txt_TASK_DESC").value=valueOf(obj,"TASK_DESC","");
			    	//定位 模版下拉选项 
			    	var objs = jetsennet.ui.DropDownList["txt_TASK_TEMPLATE"].dataItems;
					if(objs != null && objs.length !=0)
					{
						for(var i=0; i< objs.length; i++)
						{
							if(objs[i].value == valueOf(obj,"PROCTEMPLATE_ID",""))
							{
								jetsennet.ui.DropDownList["txt_TASK_TEMPLATE"].setSelectedIndex(i);
								break;
							}
						}
					}
			    	
			    },
			    onEditValid : function(id,obj) {
			        if (el("txt_TASK_NAME").value != valueOf(obj, "TASK_NAME", "") && _checkNameExist(el("txt_TASK_NAME").value)) {
			            return false;
			        }
			        if(gSelTaskObj == null)return false;
			        //已有模版-->空模版
			    	if((gSelTaskObj.PROCTEMPLATE_ID != "-1" && gSelTaskObj.PROCTEMPLATE_ID != "") && jetsennet.ui.DropDownList["txt_TASK_TEMPLATE"].selectedValue == "-1")
			    	{
			    		jetsennet.alert("任务已绑定模版，不能切换为空模版！");
			    		return false;
			    	}
			        return true;
			    },
			    onEditGet : function(id) {
			    	//没有更改模版
			    	if(gSelTaskObj.PROCTEMPLATE_ID == jetsennet.ui.DropDownList["txt_TASK_TEMPLATE"].selectedValue)
			    	{
			    		return {
				        	TASK_ID: id,
				        	TASK_NAME: el("txt_TASK_NAME").value,
				            TASK_DESC: el("txt_TASK_DESC").value,
				            UPDATE_USER: jetsennet.application.userInfo.UserName,
				            UPDATE_USERID: jetsennet.application.userInfo.UserId,
				            UPDATE_TIME: new Date().toDateTimeString()
				        };
			    	}
			    	else
			    	{
			    		//已有模版-->新模版 || 空模版-->新模版
			    		
			    		if(!gCurrentProcess){
			    			return saveProcessTemplate(id);
			    		}else{
				    		//先删除 当前任务对应的流程
				    		var params = new HashMap();
							params.put("className", "ProcessBusiness");
							params.put("deleteIds", gCurrentProcess.procId);
						    var sResult = WFMDAO.execute("commonObjDelete",params);
						    if(sResult.errorCode==0){
						        gCurrentProcess = null;
						        return saveProcessTemplate(id);
						   
						    }else{
						    	jetsennet.message("删除流程失败！");
						    	return null;
						    }
			    		}
			    	}
			    },
			    directEdit : function(obj) {
			    	//任务对象
			    	if(obj != null)
			    	{
			    		var params = new HashMap();
					    params.put("className", this.className);
					    params.put("updateXml", jetsennet.xml.serialize(obj, this.tableName));
					    params.put("isFilterNull", true);
					    var result = this.dao.execute(this.updateMethodName, params);
					    if (result && result.errorCode == 0) {
					        if (this.onEditSuccess) {
					            this.onEditSuccess(obj);
					        }
					        this.load();
					        return true;
					    }
			    	}
			    	else return false;
				},
			    onEditSuccess : function(){
			    	jetsennet.message(gTaskCrud.msgEdit + gTaskCrud.name + "成功！");
			    	el('divDesign').innerHTML = "";
			    	gSelTaskObj = null;
			    },
			    directRemove : function(ids)
			    {
			    	
			    	var values = ids.split(",");
			    	if(values.length > 0 )
			    	{
			    		var objs = searchIpsTaskById(ids);
			    		var procIds = "";
			    		if (objs && objs.length > 0) {
			    			var flag = true;
							for (var i = 0; i < objs.length; i++) {
								//没有绑定 PROC_ID情况 直接跳过 Add by JiJie.LianG 2015-07-16
								if(objs[i]["PROC_ID"] == "")continue;
								
								var ipsParams = new HashMap();
								ipsParams.put("className", "IpsTaskBusiness");
								ipsParams.put("deleteIds", objs[i]["PROC_ID"]);
								var ipsResult = IPSDAO.execute("commonObjDeleteNew",ipsParams);
								 
								var params = new HashMap();
								params.put("className", "ProcessBusiness");
								params.put("deleteIds", objs[i]["PROC_ID"]);
							    var sResult = WFMDAO.execute("commonObjDelete",params);
							    if(sResult.errorCode != 0){
							    	flag = false;
							    	jetsennet.message("删除流程失败！");
						    		break;
							    }
							}
							if(flag)
							{
								gCurrentProcess = null;
						        var params = new HashMap();
							    params.put("className", this.className);
							    params.put("deleteIds", ids);
							   var result = this.dao.execute(this.deleteMethodName, params);
							    if (result && result.errorCode == 0) {
							        if (this.onRemoveSuccess) {
							            this.onRemoveSuccess(ids);
							        }
							        this.load();
							    }
						        return true;
							}else return false;
						}
			    	}
			    },
			    onRemoveSuccess : function()
			    {
			    	el('divDesign').innerHTML = "";
			    	gSelTaskObj = null;
			    }
			});
/**
 * 工作列表选中一行事件
 */
gTaskCrud.grid.onrowclick = function(item)
{
	//重复选中同一行直接返回
	if(gSelTaskObj == item)return;
	
	if(gFlowView.isChanged)
	{
		jetsennet.confirm("确定是否保存当前流程配置?",
			function() {
				saveTaskProcess();
				gFlowView.clearView();
				renderFlowDiv(item);
				return true;
			},{oncancel:function() {
				gFlowView.isChanged = false;
				gFlowView.clearView();
				renderFlowDiv(item);
				return true;
				}
			}
		);
	}else{
		renderFlowDiv(item);
	}
};

/**
 * 保存任务选中的流程模板
 * @param id
 * @returns
 */
function saveProcessTemplate(id){
    //加载当前选中模版
    var objs = loadProcessTemplate(jetsennet.ui.DropDownList["txt_TASK_TEMPLATE"].selectedValue);
	if (objs && objs.length > 0) {
		for (var i = 0; i < objs.length; i++) {
			gCurrentProcess = null;
			//gCurrentProcess 赋值
			processChanged(objs[i].PROC_ID, objs[i].PROC_TYPE, objs[i].FLOW_TYPE, objs[i].PROC_STATE, objs[i].PROC_NAME, objs[i].PROC_DESC,objs[i].OBJ_TYPE);
		}
	}
	
	//创建先流程
	var flowInfo = {};
    flowInfo.PROC_NAME = el("txt_TASK_NAME").value+"_流程"+gCurrentProcess.procName;
    flowInfo.PROC_DESC = "任务：" + el("txt_TASK_NAME").value + " 对应的流程";
    flowInfo.PROC_TYPE= "11";//数据处理流程 "11"
    flowInfo.OBJ_TYPE= gCurrentProcess.objDataType;//存储对象 "1"
    flowInfo.FLOW_TYPE = gCurrentProcess.procType;//"0"
    flowInfo.PROC_STATE = 0;
    
    //Insert 新流程
    var params = new HashMap();
    params.put("className", "ProcessBusiness");
    params.put("saveXml", jetsennet.xml.serialize(flowInfo, "FlowInfo"));
    var sResult = WFMDAO.execute("commonObjInsert",params);
    if(sResult.errorCode==0){
    	//保存 流程中节点配置内容
    	var params1 = new HashMap();
        params1.put("processXml", getProcessXml(sResult.resultVal));
        var sResult1 = WFMDAO.execute("saveProcess",params1);
        if(sResult1.errorCode==0){
            gCurrentProcess = null;
            //IPS_TASK表PROC_ID字段，存任务对应的流程ID
            return {
		        	TASK_ID: id,
		        	TASK_NAME: el("txt_TASK_NAME").value,
		            TASK_DESC: el("txt_TASK_DESC").value,
		            PROC_ID: sResult.resultVal,
		            PROCTEMPLATE_ID: jetsennet.ui.DropDownList["txt_TASK_TEMPLATE"].selectedValue,
		            UPDATE_USER: jetsennet.application.userInfo.UserName,
		            UPDATE_USERID: jetsennet.application.userInfo.UserId
//		            UPDATE_TIME: new Date().toDateTimeString()
		        };
        }else{
    		jetsennet.message(gTaskCrud.msgEdit + gTaskCrud.name +": "+el("txt_TASK_NAME").value+" 对应流程失败！");
    		return null;
    	}
    }
}

/**
 * 初始化 流程模版下拉
 */
function _initTaskDlg(){
//	if(el("txt_TASK_TEMPLATE").options.length==0){
//		jetsennet.Crud.initItems("txt_TASK_TEMPLATE",taskProcTemplate);
//	}
}



//==================IPS_DATASOURCE==========================

function loadDataSource(classId)
{
	var conditions = [];
    conditions.push([ "d.STR_2", classId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Like, jetsennet.SqlParamType.String ]);
//    gDataSourceCrud.search(conditions);
  //如果是系统管理员角色查询所有数据源  update by  xueenbin 20160411
    loadDataSourceListByRole();
    /*if(isSystem()){
   	 gDataSourceCrud.search(conditions);
    }else{
    	conditions.push(["a.GROUP_ID", queryGroupIdByUserId(), jetsennet.SqlLogicType.Or, jetsennet.SqlRelationType.In]);
    	conditions.push(["d.STATE", "0", jetsennet.SqlLogicType.Or, jetsennet.SqlRelationType.In]);
 		gDataSourceCrud.search(conditions);
   	 
    }*/
}


//==================IPS相关==========================
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

function _checkNameExist(taskName){
	var tasks = IPSDAO.queryObjs("commonXmlQuery", "TASK_ID", "IPS_TASK", null, null, [[ "TASK_NAME", taskName, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String ],[ "TASK_TYPE", "10", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]], "TASK_ID,TASK_NAME");
    if (tasks&&tasks.length>0) {
    	jetsennet.alert("任务名称已被使用！");
    	return true;
    }
    return false;
}

function copySelTemplate(procId,taskName)
{
	var flowInfo = {};
    flowInfo.PROC_NAME = el("txt_TASK_NAME").value+"_流程";
    flowInfo.PROC_DESC = "任务：" + el("txt_TASK_NAME").value + " 对应的流程";
    flowInfo.PROC_TYPE= gCurrentProcess.objType;//数据处理流程 "11"
    flowInfo.OBJ_TYPE= gCurrentProcess.objDataType;//存储对象 "1"
    flowInfo.FLOW_TYPE = gCurrentProcess.procType;//"0"
    flowInfo.PROC_STATE = 0;
    
    var params = new HashMap();
    params.put("className", "ProcessBusiness");
    params.put("saveXml", jetsennet.xml.serialize(flowInfo, "FlowInfo"));
    var sResult = WFMDAO.execute("commonObjInsert",params);
    if(sResult.errorCode==0){
    	var params1 = new HashMap();
        params1.put("processXml", getProcessXml(sResult.resultVal));
        var sResult1 = WFMDAO.execute("saveProcess",params1);
        if(sResult1.errorCode==0){
            gCurrentProcess = null;
        }
    }
}

/**
 * 绑定模版 
 */
function bindingTask()
{
	if(gSelTaskObj == null)
	{
		jetsennet.alert("请选中任务！");
		return;
	}
	if(gSelTaskObj.PROCTEMPLATE_ID != "")
	{
		jetsennet.alert("任务："+gSelTaskObj.TASK_NAME+" 存在模版，请先删除模版再绑定！");
		return;
	}
	
	var flowNode = gFlowView.workflowNode;
	var childNodes = flowNode.childNodes;
	var childCount = childNodes.length;
	var hasData = false;
	var _dataId;
    if (childCount != 0)
    {
    	for (var i = 0; i < childCount; i++) 
	    {
	    	var child = childNodes[i];
	        var childParam = child.nodeParam;
				if(childParam.actId == "531")
				{
					if(typeof(childParam.dataId) == "undefined")break;
					hasData = true;
					_dataId = childParam.dataId;
					break;
				}
	    }
	    if(!hasData)
	    {
	    	jetsennet.alert("流程中没有数据源不能被绑定！");
	    	return;
	    }
    }else{
    	jetsennet.alert("空流程模版不能被绑定！");
    	return;
    }
	var templateId = gCurrentProcess.procId;
	
	var params = new HashMap();
    params.put("processXml", getProcessXml(gSelTaskObj.PROC_ID));
    var sResult = WFMDAO.execute("saveProcess",params);
    if(sResult && sResult.errorCode==0)
    {
    	gSelTaskObj.PROCTEMPLATE_ID = templateId;
    	gSelTaskObj.UPDATE_USER = jetsennet.application.userInfo.UserName;
    	gSelTaskObj.UPDATE_USERID = jetsennet.application.userInfo.UserId;
//    	gSelTaskObj.UPDATE_TIME = new Date().toDateTimeString();
    	gSelTaskObj.DS_ID = _dataId;
    	
    	var params1 = new HashMap();
        params1.put("className", "IpsTaskBusiness");
        params1.put("updateXml", jetsennet.xml.serialize(gSelTaskObj, "TaskInfo"));
        var sResult1 = IPSDAO.execute("commonObjUpdateByPk",params1);
        if(sResult1 && sResult1.errorCode==0){
        	jetsennet.message("绑定成功！");
            gTaskCrud.load();
        }else{
        	jetsennet.message("绑定失败！");
        }
    }
}

//==================wfm相关==========================
//模版改变事件
function templateProcessChanged(procId, objType, procType, procState, procName, procDesc,objDataType) {
    gTaskTemplateFlowView.isDesignMode = false;

    if (gCurrentTemplateProcess != null && procId == gCurrentTemplateProcess.procId) {
        gCurrentTemplateProcess = { procId: procId, objType: objType, procType: procType, procState: procState, procName: procName, procDesc: procDesc,objDataType:objDataType };
        return;
    }

    gCurrentTemplateProcess = { procId: procId, objType: objType, procType: procType, procState: procState, procName: procName, procDesc: procDesc,objDataType:objDataType };

    var param = new HashMap();
    param.put("procId",procId);
    var result = WFMDAO.execute("getProcess", param);
    if(result.errorCode==0){
    	setTemplateProcessXml(result.resultVal);
    }
}


//流程改变事件 objDataType数据存储对象
function processChanged(procId, objType, procType, procState, procName, procDesc,objDataType) {
    if (procState != "0" && procState != "1") {
        gFlowView.isDesignMode = false;
    }
    else {
        gFlowView.isDesignMode = true;
    }

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

// 获取流程xml
function getProcessXml(procId) {

    var processXml = [];
    processXml.push('<process version="2.1">');
    processXml.push('<processId>' + (procId || gCurrentProcess.procId) + '</processId>');
    processXml.push('<processName>' + gCurrentProcess.procName + '</processName>');
    processXml.push('<processType>' + gCurrentProcess.objType + '</processType>');
    processXml.push('<objType>' + gCurrentProcess.objType + '</objType>');
    processXml.push('<description>' + gCurrentProcess.procDesc + '</description>');

    var flowNode = gFlowView.workflowNode;
    processXml = getChildsXml(processXml, flowNode.childNodes);

    processXml.push('</process>');

    return processXml.join('');
}

function getChildsXml(processXml, childNodes) {
    var childCount = childNodes.length;

    if (childCount == 0)
        return processXml;

    processXml.push('<flowActivities>');

    for (var i = 0; i < childCount; i++) {

        var child = childNodes[i];
        var childParam = child.nodeParam;

        processXml.push('<flowActivity>');
        processXml.push('<flowActId>' + childParam.id + '</flowActId>');
        processXml.push('<name>' + valueOf(childParam, "name", "") + '</name>');
        processXml.push('<actId>' + childParam.actId + '</actId>');
        processXml.push('<actType>' + childParam.actType + '</actType>');
        processXml.push('<parameter>' + jetsennet.xml.xmlEscape(childParam.parameter) + '</parameter>');

        if (childParam.assignRule) {
            processXml.push('<assignRule>');
            processXml.push('<assignType>' + childParam.assignRule.assignType + '</assignType>');
            processXml.push('<assignObjId>' + childParam.assignRule.assignObjId + '</assignObjId>');
            processXml.push('<assignParam>' + jetsennet.xml.xmlEscape(childParam.assignRule.assignParam) + '</assignParam>');
            processXml.push('</assignRule>');
        }

        if (child.childNodes != null) {
            processXml = getChildsXml(processXml, child.childNodes);
        }

        processXml.push('</flowActivity>');
    }
    processXml.push('</flowActivities>');

    return processXml;
}

/**
 * 设置模版流程XML
 * 
 * 修改 创建任务和编辑任务 流程模板不能完全显示
 * Edit by JiJie.LianG 2015-07-01
 */
function setTemplateProcessXml(processXml) {

    gTaskTemplateFlowView.clearView();
    var flowObj = jetsennet.xml.deserialize(processXml);
    gTaskTemplateFlowView.workflowNode = gTaskTemplateFlowView.createNodesByObject(flowObj);
    gTaskTemplateFlowView.render();
    
//    el("divTemplate").style.height="180px";
	var heightCountStr = $("#divTask").css("height");
	var heightCounts = heightCountStr.substring(0,heightCountStr.length-2);
	$("#divTemplate").css("height",(parseInt(heightCounts)-55-55)+"px");
	
	
}

/**
 * 设置流程xml
 * 
 * 修改 创建任务和编辑任务 流程模板不能完全显示
 * Edit by JiJie.LianG 2015-07-01
 */
function setProcessXml(processXml) {

    gFlowView.clearView();
    var flowObj = jetsennet.xml.deserialize(processXml);
    //数据源扫描路径修改时，任务对应节点参数同步修改。--add by xueenbin 20160411
    /*var flowObjs = flowObj.flowActivities.flowActivity;
    for(var i=0;i<flowObjs.length;i++){
    	//判断如果是扫描节点修改scanpath
    	if(flowObjs[i].actType == 3 && gCurrentProcess.procState != "11"){
    		var actParam = jetsennet.xml.deserialize(flowObjs[i].parameter);
    		if(!jetsennet.util.isNullOrEmpty(actParam.dsID)){
    			var Result = IPSDAO.query("commonXmlQuery", "t.DS_ID", "IPS_DATASOURCE", "t", null, [["t.DS_ID", actParam.dsID, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal]], "t.STR_1");
        	 	var ssResult = jetsennet.xml.toObject(Result.resultVal, "Record");
        	 	actParam.scanPath=ssResult[0].STR_1;
        	 	flowObjs[i].parameter = jetsennet.xml.serialize(actParam);
    		}
    		//这样解析是因为是否扫描子目录元素有个属性<scanSub switch=\"on\">
    		var param = flowObjs[i].parameter;
    		var actParam = jetsennet.xml.deserialize(param);
    		if(!jetsennet.util.isNullOrEmpty(actParam.dsID)){
    			var Result = IPSDAO.query("commonXmlQuery", "t.DS_ID", "IPS_DATASOURCE", "t", null, [["t.DS_ID", actParam.dsID, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal]], "t.STR_1");
        	 	var ssResult = jetsennet.xml.toObject(Result.resultVal, "Record");
    			var start = param.substring(0,param.indexOf("<scanPath>")+10);
    			var end = param.substring(param.indexOf("</scanPath>"),param.length);
    			if(!jetsennet.util.isNullOrEmpty(start)|| start != "-1"){
        			flowObjs[i].parameter = start+ssResult[0].STR_1+end;
    			}
    			gFlowView.isChanged = true;
    		}
    		
    	}
    }*/
    gFlowView.workflowNode = gFlowView.createNodesByObject(flowObj);
    gFlowView.render();
    
//    el("divDesign").style.height="100%";
    
    var heightCountStr = $("#divDesignPanel").css("height");
	var heightCounts = heightCountStr.substring(0,heightCountStr.length-2);
	$("#divDesign").css("height",(parseInt(heightCounts)-40)+"px");
}

/**
显示参数配置
*/
function showParamConfig(node) {
    if (node.nodeParam.actId == "5212") {  //媒体信息
    	showMideaInfoActConfig(node);
    } 
    else if(node.nodeParam.actId == "5200"){  //转码
    	showTranscodeConfigByImport(node);
    }
    else if(node.nodeParam.actId == "5400"){  //计审
    	showQualityCheckActConfig(node);
    }
    else 
    {
        showActConfig(node);
    }
}

/**
 * 将 数据源 进行整理，统一由dsInMap和dsInOutMap维护
 * 方便新增数据源类型，其他方法需要多处修改。
 * Add by JiJie.LianG 2015-06-09
 * 
 * 添加 空流程验证
 * 允许保存程空流程--后续根据业务需要做调整
 * Add by JiJie.LianG 2015.07.30
 * 
 * 保存数据时添加 gSelTaskObj 是否为空验证
 * Add by JiJie.LianG 2015.09.16
 */
//保存任务
function saveTaskProcess() {
	if(!gSelTaskObj)return;
	if(gSelTaskObj.TASK_STATE == "11")
	{
		jetsennet.error("运行中的任务无法保存！");
		return;
	}
	if(gCurrentProcess == null)
	{
		jetsennet.error("流程不存在无法保存！");
		return;
	}
	
	var flowNode = gFlowView.workflowNode;
	var childNodes = flowNode.childNodes;
	var childCount = childNodes.length;
	//任务是否绑定了数据源 标示
	var hasData = false;
	//数据源ID
	var _dataId;
    if (childCount != 0)
    {
    	//遍历流程中的节点
    	for (var i = 0; i < childCount; i++) 
	    {
	    	var child = childNodes[i];
	        var childParam = child.nodeParam;
				if(DSInMap.containsKey(childParam.actId) || DSInOutMap.containsKey(childParam.actId))
				{
					var actParam = jetsennet.xml.deserialize(childParam.parameter);
					//当前节点是否绑定了数据源
					if(typeof(actParam.dsID) == "undefined")break;
					var obj= {};
					obj.DS_ID = actParam.dsID;
					obj.STR_1 = actParam.scanPath;
					var params1 = new HashMap();
			        params1.put("className", "IpsDatasource");
			        params1.put("updateXml", jetsennet.xml.serialize(obj));
			        var sResult1 = IPSDAO.execute("commonObjUpdateByPk",params1);
			        if(sResult1 && sResult1.errorCode==0){
//			        	jetsennet.message("修改数据源成功！");
			        	loadDataSourceListByRole();
			        }else{
			        	jetsennet.message("修改数据源失败！");
			        }
					hasData = true;
					_dataId = actParam.dsID;
					break;
				}
	    }
	    if(hasData)
	    {
			var params = new HashMap();
		    params.put("processXml", getProcessXml());
		    var sResult = WFMDAO.execute("saveProcess",params);
		    if(sResult && sResult.errorCode==0)
		    {
		    	gSelTaskObj.UPDATE_USER = jetsennet.application.userInfo.UserName;
		    	gSelTaskObj.UPDATE_USERID = jetsennet.application.userInfo.UserId;
//		    	gSelTaskObj.UPDATE_TIME = new Date().toDateTimeString();   不确定到底要不要记录时间
		    	gSelTaskObj.DS_ID = _dataId;
		    	
		    	var params1 = new HashMap();
		        params1.put("className", "IpsTaskBusiness");
		        params1.put("updateXml", jetsennet.xml.serialize(gSelTaskObj, "TaskInfo"));
		        var sResult1 = IPSDAO.execute("commonObjUpdateByPk",params1);
		        if(sResult1 && sResult1.errorCode==0){
		        	jetsennet.message("保存成功！");
		            var param = new HashMap();
			        param.put("procId", gCurrentProcess.procId);
			        var sResult1 = WFMDAO.execute("getProcess",param);
			        if(sResult1.errorCode==0){
			        	setProcessXml(sResult1.resultVal);
			        }
			        loadTask();
		            
		        }else{
		        	jetsennet.message("保存失败！");
		        }
		    }
	    }
	    else
	    {
	    	var params = new HashMap();
		    params.put("processXml", getProcessXml());
		    var sResult = WFMDAO.execute("saveProcess",params);
		    if(sResult.errorCode==0){
		    	jetsennet.message("保存成功！");
		    	var param = new HashMap();
		        param.put("procId", gCurrentProcess.procId);
		        var sResult1 = WFMDAO.execute("getProcess",param);
		        if(sResult1.errorCode==0){
		        	setProcessXml(sResult1.resultVal);
		        }
		    }else{
		    	jetsennet.message("保存失败！");
		    }
	    }
    }else {
//    	gFlowView.isChanged = false;
//		gFlowView.clearView();
		//允许保存程空流程--后续根据业务需要做调整 Add by JiJie.LianG 2015.07.30
		var params = new HashMap();
	    params.put("processXml", getProcessXml());
	    var sResult = WFMDAO.execute("saveProcess",params);
	    if(sResult.errorCode==0){
	    	jetsennet.message("保存成功！");
	    	var param = new HashMap();
	        param.put("procId", gCurrentProcess.procId);
	        var sResult1 = WFMDAO.execute("getProcess",param);
	        if(sResult1.errorCode==0){
	        	setProcessXml(sResult1.resultVal);
	        }
	    }else{
	    	jetsennet.message("保存失败！");
	    }
    }
}

/**
 * 运行任务 --激活
 * 
 * 运行任务时，验证当前任务是否存在流程。
 * Add by JiJie.LianG 2015.07.30
 */
function activeTaskProcess(state) {
	if(!gSelTaskObj)
	{
		jetsennet.error("请先选中任务再进行操作！");
		return;
	}
	if(gCurrentProcess == null)
	{
		jetsennet.error("流程不存在，请先绑定流程模板！");
		return;
	}
	if(gFlowView.isChanged){
		jetsennet.alert("请先保存当前任务！");
		return;
	}
    if (gCurrentProcess.procState == state) {
        return;
    }
    if(gCurrentProcess.procState==0 && state==100){
    	jetsennet.alert("请先启动任务！");
    	return;
    }
    if(state == 11)
    {
		/**
		 * 启动任务对应的流程时，验证当前任务是否存在流程。
		 * Add by JiJie.LianG 2015.07.30
		 */
		if(gSelTaskObj.PROC_ID == "")
		{
			jetsennet.error("当前流程为空，不能启动！请先绑定流程模板！");
			return;
		}
		var fileDsId,dbDsId = "";
		var nodes = gFlowView.workflowNode.childNodes;
		for(var i=0; i < nodes.length; i++)
		{
			//输入数据源-文件数据源
			if(DSInMap.containsKey(nodes[i].nodeParam.actId))
			{
				var item = jetsennet.xml.deserialize(nodes[i].nodeParam.parameter);
				if(typeof(item.dsID) != "undefined" && !jetsennet.util.isNullOrEmpty(item.dsID))
				{
					fileDsId = item.dsID;
				}else {
					jetsennet.message("文件数据源: '"+nodes[i].nodeParam.name+"' 参数: dsID 未绑定!");
					return;
				}
			}else if(ExtDBMap.containsKey(nodes[i].nodeParam.actId)){
				var item = jetsennet.xml.deserialize(nodes[i].nodeParam.parameter);
				if(typeof(item.dsID) != "undefined" && !jetsennet.util.isNullOrEmpty(item.dsID))
				{
					dbDsId = item.dsID;
				}else {
					jetsennet.message("数据库数据源: '"+nodes[i].nodeParam.name+"' 参数: dsID 未绑定!");
					return;
				}
			}else if(nodes[i].nodeType == jetsennet.ui.WfNodeType.ParallelNode){//并行流程
				var _sequenceNodes = nodes[i].childNodes;
				for(var k=0; k<_sequenceNodes.length; k++){
					var _taskNodes = _sequenceNodes[k].childNodes;
					for(var j=0; j< _taskNodes.length; j++){
						if(ExtDBMap.containsKey(_taskNodes[j].nodeParam.actId))
						{
							var item = jetsennet.xml.deserialize(_taskNodes[j].nodeParam.parameter);
							if(typeof(item.dsID) != "undefined" && !jetsennet.util.isNullOrEmpty(item.dsID))
							{
								if(jetsennet.util.isNullOrEmpty(dbDsId)){
									dbDsId = item.dsID;
								}else{
									dbDsId +=","+item.dsID;
								}
							}else {
								jetsennet.message("数据库数据源: '"+_taskNodes[j].nodeParam.name+"' 参数: dsID 未绑定!");
								return;
							}
						}
					}
				}
			}
		}
		if(!jetsennet.util.isNullOrEmpty(fileDsId) && !jetsennet.util.isNullOrEmpty(dbDsId))
		{
			var dbDsIds = dbDsId.split(",");
			if(dbDsIds.length>1)
			{
				for(var i=0; i<dbDsIds.length; i++){
					extendsDsLable(fileDsId,dbDsIds[i]);
				}
			}else extendsDsLable(fileDsId,dbDsId);
		}
		//流程中没有 节点的情况，jwfm接口会判定为 ‘不是有效的流程’，不在业务层做验证。
    }
    //根据 激活 || 取消激活 || 编辑  更新数据库状态
    var params = new HashMap();
    params.put("procId", gCurrentProcess.procId);
    params.put("objType", gCurrentProcess.objType);
    params.put("state", state);
    var sResult = WFMDAO.execute("activeProcess",params);
    if(sResult.errorCode==0){
    	if(state==100){
    		//将流程状态改为 编辑 Add by JiJie.LianG 2015-07-21
    		activeTaskProcess(0);
    		
    		if(deleteProcess(gSelTaskObj.PROC_ID)){
            	//停止任务--取消激活 state=100
            	var taskInfo = {};
				taskInfo.TASK_ID = gSelTaskObj.TASK_ID;
				taskInfo.TASK_NAME = gSelTaskObj.TASK_NAME;
	            taskInfo.CLASS_ID = gSelTaskObj.CLASS_ID;
	            taskInfo.CREATE_USER = gSelTaskObj.CREATE_USER;
	            taskInfo.CREATE_USERID = gSelTaskObj.CREATE_USERID;
	            taskInfo.CREATE_TIME = gSelTaskObj.CREATE_TIME;
	            taskInfo.TASK_TYPE = gSelTaskObj.TASK_TYPE;
	            taskInfo.PROC_ID = gSelTaskObj.PROC_ID;
	            taskInfo.PROCTEMPLATE_ID = gSelTaskObj.PROCTEMPLATE_ID;
	            taskInfo.TASK_STATE = state;
	            taskInfo.UPDATE_USER = jetsennet.application.userInfo.UserName;
	            taskInfo.UPDATE_USERID = jetsennet.application.userInfo.UserId;
//		            taskInfo.UPDATE_TIME = new Date().toDateTimeString();
	            
	            var params = new HashMap();
	            params.put("className", "IpsTaskBusiness");
	            params.put("updateXml", jetsennet.xml.serialize(taskInfo, "TaskInfo"));
	            params.put("isFilterNull", true);
	            var sResult = IPSDAO.execute("commonObjUpdateByPk",params);
	            if(sResult && sResult.errorCode==0){
	            	jetsennet.message("操作成功！");
	            	gCurrentProcess = null;
	            }else{
	            	jetsennet.message("操作失败！");
	            }
    		}
            loadTask();
    	}else if(state==11){
    		//启动任务--激活 state=11
    		var taskInfo = {};
			taskInfo.TASK_ID = gSelTaskObj.TASK_ID;
			taskInfo.TASK_NAME = gSelTaskObj.TASK_NAME;
            taskInfo.CLASS_ID = gSelTaskObj.CLASS_ID;
            taskInfo.CREATE_USER = gSelTaskObj.CREATE_USER;
            taskInfo.CREATE_USERID = gSelTaskObj.CREATE_USERID;
            taskInfo.CREATE_TIME = gSelTaskObj.CREATE_TIME;
            taskInfo.TASK_TYPE = gSelTaskObj.TASK_TYPE;
            taskInfo.PROC_ID = gSelTaskObj.PROC_ID;
            taskInfo.PROCTEMPLATE_ID = gSelTaskObj.PROCTEMPLATE_ID;
            taskInfo.TASK_STATE = state;
            taskInfo.UPDATE_USER = jetsennet.application.userInfo.UserName;
            taskInfo.UPDATE_USERID = jetsennet.application.userInfo.UserId;
//            taskInfo.UPDATE_TIME = new Date().toDateTimeString();
            
            var params = new HashMap();
            params.put("className", "IpsTaskBusiness");
            params.put("updateXml", jetsennet.xml.serialize(taskInfo, "TaskInfo"));
            params.put("isFilterNull", true);
            var sResult = IPSDAO.execute("commonObjUpdateByPk",params);
            if(sResult && sResult.errorCode==0){
            	jetsennet.message("操作成功！");
            	gCurrentProcess = null;
            }else{
            	jetsennet.message("编辑失败！");
            }
            loadTask();
    	}
    }
}

/**
605      * 根据条件删除数据 多表
606      * @param xml
607      * <TABLES>
608      *  <TABLE TABLE_NAME='DMP_SERVICEINFO'>
609      *      <SqlWhereInfo>"
610      *          <SERVICE_CODE ParamType='String' RelationType='Equal' LogicType='And'>110000G02</SERVICE_CODE>
611      *      </SqlWhereInfo>
612      *  </TABLE>"
613      *  <TABLE TABLE_NAME='DMP_SIGNAL'>
614      *      <SqlWhereInfo>"
615      *          <SERVICE_CODE ParamType='String' RelationType='Equal' LogicType='And'>110000G02</SERVICE_CODE>
616      *          <WHEREINFO>"
617      *              <SIGNAL_NAME ParamType='String' RelationType='Equal' LogicType='And'>ll</SIGNAL_NAME
618      *              <SIGNAL_TYPE ParamType='Numeric' RelationType='Equal' LogicType='And'>8</SIGNAL_TYPE>
619      *          </WHEREINFO>
620      *      </SqlWhereInfo>
621      *  </TABLE>
622      * </TABLES>
623      * @throws Exception
624      */
function deleteProcess(procId){
	var deleteXml = "<TABLE TABLE_NAME='WFM_PROCLOG'><SqlWhereInfo><PROC_ID ParamType='Int' RelationType='Equal' LogicType='And'>"+procId+"</PROC_ID></SqlWhereInfo></TABLE>";
	var params = new HashMap();
	params.put("deleteXml", deleteXml);
	var result = IPSDAO.execute("commonObjDeleteByCondition", params);
	if (result && result.errorCode == 0) {
//		activeTaskProcess(100);
		return true;
	}else return false;

}

/**
 * 拖拽数据源，自动匹配数据源参数
 */
function showDSActConfig(node)
{
	var items;
    if (node.nodeParam.actType == 2 || node.nodeParam.actType == 3) {
    	var param = new HashMap();
        param.put("actId", node.nodeParam.actId);
        var sResult = WFMDAO.execute("getActConfig", param);
        items = jetsennet.xml.deserialize(sResult.resultVal, { igoreAttribute: false }).item;
    }
    initVaribale();
    renderActConfig(items, node);
    if (el('hiddenProcId')) {
        el('hiddenProcId').value = node.nodeParam.id;
    }

//    el('txtConfigName').value = gSelDataObj.DS_NAME;
	el('txtConfigName').value = node.nodeParam.name;
    addActParameter(items,node);
    setDSActParameter(items,node);

    var dialog = new jetsennet.ui.Window("act-config");
    jQuery.extend(dialog, { windowStyle: 1, submitBox: true, cancelBox: true, maximizeBox: false, minimizeBox: false, 
    	size: { width: 530, height: 0 }, showScroll: false, title: "参数配置" });
    dialog.controls = ["divActConfig"];
    dialog.onsubmit = function () {
    	var areaElements = jetsennet.form.getElements('divActConfig');
    	if (jetsennet.form.validate(areaElements, true)) {
    		/**重命名*/
    		var actName = el('txtConfigName').value;
    		gFlowView.isChanged = true;
    		if (actName != node.nodeParam.name) {
    			node.nodeParam.name = actName;
    			node.setNodeName(actName);
    			
    			//如果是已使用的流程，直接更新名称
    			if (!gFlowView.isDesignMode) {
    				var params = new HashMap();
    	            params.put("className", "ProcactBusiness");
    	            params.put("updateXml",  jetsennet.xml.serialize({ PROCACT_ID: node.nodeParam.id, PROCACT_NAME: actName }, "Request"));
    	            params.put("isFilterNull", true);
    	            var sResult = WFMDAO.execute("commonObjUpdateByPk",params);
    				if(sResult.errorCode==0){
    					gFlowView.isChanged = false;
    				}
    			}
    		}
    		
    		//获取值
    		node.nodeParam.parameter = getActParameter(items, node);
    		
    		//如果是已使用的流程，直接更新参数
    		if (!gFlowView.isDesignMode) {
    			var params = new HashMap();
	            params.put("className", "ProcactBusiness");
	            params.put("updateXml",  jetsennet.xml.serialize({ PROCACT_ID: node.nodeParam.id, ACT_PARAM: node.nodeParam.parameter }, "ActParam"));
	            params.put("isFilterNull", true);
	            var sResult = WFMDAO.execute("commonObjUpdateByPk",params);
	            if(sResult.errorCode==0){
	            	gFlowView.isChanged = false;
					jetsennet.message("保存成功");
				}
    		}
    		
    		if (el('templateImportName') && el('templateImportName').value) {
    			el('hiddenSuffix').value = el('templateImportName').value.substring(el('templateImportName').value.lastIndexOf(".")+1,el('templateImportName').value.length);
    			if(el('hiddenSuffix').value.toLowerCase()!="tpl"){
    				jetsennet.alert("导入模板格式错误！");
    				return;
    			}
    			el('templateImport').submit();
    			gFlowView.isChanged = false;
    			jetsennet.message("导入成功！");
    		}
    		dialog.close();
    	}
    };
    dialog.showDialog();
}

/**
 * 模版参数节点赋值
 * 针对拖拽数据源的参数，同模版绑定
 * 订制字段包括：dsID、scanPath、HMWTable
 * Add by JiJie.LianG
 */
function setDSActParameter(items, node, dsPath)
{
	var options = {igoreAttribute:false,attributeFlag:"@",valueFlag:"$",trueValue:"true",falseValue:"false"};
    var params = jQuery.extend({}, jetsennet.xml.deserialize(node.nodeParam.parameter,options));
    if (items) {
        items = items.length ? items : [items];

        for (var i = 0; i < items.length; i++) {
        	
        	
            var name = items[i]["@name"];
            var source = items[i]["@source"];
            var defaultValue = items[i]["@deafult"];

            if (jetsennet.util.isNullOrEmpty(name)) {
                continue;
            }

            if (source == SOURCE_CUSTOM || source == SOURCE_DB || source == SOURCE_VAR) {
                var handing = attributeOf(el("txtConfig" + name), "handing", "");
                var handsources = handing.split("|");
                jQuery.each(handsources, function (j) {
                    var sourceItem = handsources[j].split("~");
                    if(sourceItem[1] == defaultValue && !params[name]){
                    	jetsennet.ui.DropDownList["txtConfig" + name].selectedValue = sourceItem[1];
                        el("txtConfig" + name).value = sourceItem[0];
                    }
                    if (params[name]&&sourceItem[1] == params[name].$) {
                        jetsennet.ui.DropDownList["txtConfig" + name].selectedValue = sourceItem[1];
                        el("txtConfig" + name).value = sourceItem[0];
                    }
                });
                jQuery.each(controlArray, function (k) {
            		if(controlArray[k]["@name"]==name){
            			jetsennet.ui.DropDownList["txtConfig" + name].onchanged = function(item){
                        	showHidHtml(controlArray[k]["@name"],item.value,items);
                        }
            		}
                });
            }
            else if(source == 4){
            	if(defaultValue=="true"){
            		el("txtConfig" + name+"CheckBox").checked = defaultValue=="true"?true:false;
            	}
            	if(params[name]){
            		el("txtConfig" + name+"CheckBox").checked = valueOf(params[name], "@switch", "")=="on"?true:false;
            		if(el("txtConfig" + name)){
            			el("txtConfig" + name).value = params[name].$;
            		}
            	}
            }
            else if(source == 5){
            	if(items[i]["@filed"]){
            		var filed = items[i]["@filed"].split(',');
            		for ( var k = 0; k < filed.length; k++) {
            			if(params[name + filed[k]]){
            				var paramValue = params[name + filed[k]].$;
            				el("txtConfig" + name + filed[k]).value = allVarNameArray.in_array(paramValue.replace("@", "")) ? (paramValue.replace("@", "")) : paramValue;
            			}
            		}
            	}else{
            		if(params[name]){
            			var paramValue = params[name].$;
            			el("txtConfig" + name).value = allVarNameArray.in_array(paramValue.replace("@", "")) ? (paramValue.replace("@", "")) : paramValue;
            		}
            	}
            }
            else {
            	/**
            	 * 订制字段--拖拽时给如下几个字段赋值
            	 * Edit by JiJie.LianG
            	 * 2015-01-22
            	 */
            	if(name == "dsID")
            	{
            		//绑定数据源ID 为流程节点使用
            		var paramValue = gSelDataObj.DS_ID;
            		el("txtConfig" + name).value = allVarNameArray.in_array(paramValue.replace("@", "")) ? (paramValue.replace("@", "")) : paramValue;
            	}else if(name == "scanPath"){//如果为数据源路径 直接赋值
            		//当遍历节点参数，遇到 数据源类型为 数据库表(20)这一类的数据，默认取原始值 15.01.22
//            		if(params[name]){
            			if(gSelDataObj.DS_TYPE == "20"){
		            		var paramValue = params[name].$;
		            		if(typeof(paramValue) == "undefined")
		            		{
		            			continue;
		            		}
	            			el("txtConfig" + name).value = allVarNameArray.in_array(paramValue.replace("@", "")) ? (paramValue.replace("@", "")) : paramValue;
	            		}else{
	            			var paramValue = gSelDataObj.STR_1;
	    					el("txtConfig" + name).value = allVarNameArray.in_array(paramValue.replace("@", "")) ? (paramValue.replace("@", "")) : paramValue;
	            		}
//            		}
            	}else if(name == "HMWTable"){//如果为数据源存储表 直接赋值 12.09
            		//当遍历节点参数，遇到 数据源类型为 文件(10)这一类的数据，默认取原始值 15.01.22
//            		if(params[name]){
            			if(gSelDataObj.DS_TYPE == "10"){
		            		var paramValue = params[name].$;
		            		if(typeof(paramValue) == "undefined")
		            		{
		            			continue;
		            		}
	            			el("txtConfig" + name).value = allVarNameArray.in_array(paramValue.replace("@", "")) ? (paramValue.replace("@", "")) : paramValue;
	            		}else{
	            			var paramValue = gSelDataObj.STR_1;
	        				el("txtConfig" + name).value = allVarNameArray.in_array(paramValue.replace("@", "")) ? (paramValue.replace("@", "")) : paramValue;
	            		}
//            		}
            	}else if(name == "dsName"){//如果为数据源存储表 直接赋值 12.09
            		
            		var paramValue = gSelDataObj.DS_NAME;
            		el("txtConfig" + name).value = allVarNameArray.in_array(paramValue.replace("@", "")) ? (paramValue.replace("@", "")) : paramValue;
            		
            	}else if(name == "procUser"){//如果为处理用户 直接赋值 12.09
            		
            		var paramValue = jetsennet.application.userInfo.UserId;
            		el("txtConfig" + name).value = allVarNameArray.in_array(paramValue.replace("@", "")) ? (paramValue.replace("@", "")) : paramValue;
            		
            	}else if(name == "procCode"){//如果为任务代码 直接赋值 12.09
            		
            		var paramValue = gSelTaskObj.TASK_ID;
            		el("txtConfig" + name).value = allVarNameArray.in_array(paramValue.replace("@", "")) ? (paramValue.replace("@", "")) : paramValue;
            	}
            	else
            	{
            		if(params[name]){
	            		var paramValue = params[name].$;
	            		if(typeof(paramValue) == "undefined")
	            		{
	            			continue;
	            		}
	            		el("txtConfig" + name).value = allVarNameArray.in_array(paramValue.replace("@", "")) ? (paramValue.replace("@", "")) : paramValue;
	            	}
            	}
            }
        }
    }

    if (node.nodeParam.actType == 14 || node.nodeParam.actType == 11 || node.nodeParam.actType == 10) {
        if (params["Condition"]&&params["Condition"].$) {
            var newArray = [];
            var array = params["Condition"].$.split("and");
            for (var i = 0; i < array.length; i++) {
                if (array[i] && array[i].trim()) {
                    newArray.push(array[i].trim().replace("@", ""));
                }
            }
            el("txtConfigCondition").value = newArray.join(" and ");
        } else {
            el("txtConfigCondition").value = params["Condition"]?params["Condition"].$:"";
        }
        $("#txtConfigCondition").attr({title:el("txtConfigCondition").value});
    }
}

/**
 * 根据任务名称查找任务
 */
function searchTask(){
	
	var conditions = [];
//	var value = jetsennet.util.trim(el('txtTaskName').value);
	var value = el('txtTaskName').value.replace(/\s/ig,'');
	if(value){
		conditions.push([ "t.TASK_NAME", value, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Like, jetsennet.SqlParamType.String ]);
	}
    conditions.push([ "t.TASK_TYPE", "10", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric ]);
	gTaskCrud.search4PageSize(conditions);
	
}

/**
 * 绑定节点值
 * Add by JiJie.LianG 2015-06-19
 */
function bindingNode(node){
	var _flag = false;
	if(node.className == "wf-tasknode")
	{
		_flag = renderBinding(node);
	}else if(node.className == "wf-containernode")
	{
		for(var i = 0; i < node.childNodes.length; i++)
		{
			if(!_flag)
			{
				if(bindingNode(node.childNodes[i]))
				{
					_flag = true;
					break;
				}
			}else break;
		}
	}
	return _flag;
}

/**
 * 渲染节点值
 * Add by JiJie.LianG 2015-06-24
 */
function renderBinding(nodeItem)
{
	var _flag = false;
	/**
	 * 将 数据源 进行整理，统一由dsInMap和dsInOutMap维护
	 * 添加入库集合 ExtDBMap 维护
	 * 方便新增数据源类型，其他方法需要多处修改。
	 * Add by JiJie.LianG 2015-06-09
	 */
	//验证当前流程是否包含所选节点
	if(gSelNode.nodeParam.actId == nodeItem.nodeParam.actId)
	{
		//区分当前拖拽数据源属于哪种类型源
		if(DSInMap.containsKey(gSelDataObj.DS_CLASS))
		{
			//是否为文件
			if(gSelDataObj.DS_TYPE == DS_TYPE_FILE)
			{
				if(DSInMap.containsKey(gSelNode.nodeParam.actId))
				{
					//类型相同
					if(gSelNode.nodeParam.actId == gSelDataObj.DS_CLASS)
					{
						nodeItem.nodeParam.name = gSelDataObj.DS_NAME;
					    nodeItem.nodeParam.dataId = gSelDataObj.DS_ID;
					    
						showDSActConfig(nodeItem);
						_flag = true;
					}else if((gSelNode.nodeParam.actId == '800')&&(gSelDataObj.DS_CLASS == "801")){//800-邮件Excel文件格式 当所选节点为800，被拖拽数据源为邮件数据源(801)时，当作邮件的一种处理 Edit by JiJie.LianG 2015-08-20
						nodeItem.nodeParam.name = gSelDataObj.DS_NAME;
					    nodeItem.nodeParam.dataId = gSelDataObj.DS_ID;
					    
						showDSActConfig(nodeItem);
						_flag = true;
					}else if((gSelNode.nodeParam.actId == '816')&&(gSelDataObj.DS_CLASS == "812")){//816文本扩展数据源  add by  xueenbin 20160324
						nodeItem.nodeParam.name = gSelDataObj.DS_NAME;
					    nodeItem.nodeParam.dataId = gSelDataObj.DS_ID;
					    
						showDSActConfig(nodeItem);
						_flag = true;
					}
				}
			}else if(gSelDataObj.DS_TYPE == DS_TYPE_TABLE)//是否为数据库表
			{
				if(ExtDBMap.containsKey(gSelNode.nodeParam.actId))
				{
					showDSActConfig(nodeItem);
					_flag = true;
				}
				//TODO: 可以考虑根据选中数据源类型，限定是否可以入不同类型的库
			}
		}else if(DSInOutMap.containsKey(gSelDataObj.DS_CLASS) && DSInOutMap.containsKey(gSelNode.nodeParam.actId))
		{
			/**
			 * 既有输入又有输出的情况
			 */
			 //所选节点类型和拖拽类型是否一致
			if(gSelNode.nodeParam.actId == gSelDataObj.DS_CLASS)
			{
				if(gSelDataObj.DS_TYPE == DS_TYPE_FILE)
				{
					nodeItem.nodeParam.name = gSelDataObj.DS_NAME;
			    
					showDSActConfig(nodeItem);
					_flag = true;
				}else if(gSelDataObj.DS_TYPE == DS_TYPE_TABLE){
					showDSActConfig(nodeItem);
					_flag = true;
				}
			}
		}
	}
	return _flag;
}

/**
 * 渲染 流程展现 Div
 */
function renderFlowDiv(item)
{
	//选中的任务对象
	gSelTaskObj = item;
	
	if(item.PROC_ID =="")
	{
		el('divDesign').innerHTML = "";
		jetsennet.message("任务："+item.TASK_NAME+" 流程为空!");
		gCurrentProcess = null;
		return;
	}
	var objs = loadProcessTemplate(item.PROC_ID);
	if (objs && objs.length > 0) {
		for (var i = 0; i < objs.length; i++) {
			gCurrentProcess = null;
			processChanged(objs[i].PROC_ID, objs[i].PROC_TYPE, objs[i].FLOW_TYPE, objs[i].PROC_STATE, objs[i].PROC_NAME, objs[i].PROC_DESC,objs[i].OBJ_TYPE);
		}
	}
	else el('divDesign').innerHTML = "";
}

/**
 * 渲染 任务Div弹窗大小
 */
function renderDivTask(title,value,divheight)
{
	if(value == "-1")
	{
		//清空当前模版流程
		gCurrentTemplateProcess = null;
		
		el("divTemplate").style.display = "none";
		return;
	}
	
	el("divTemplate").style.display = "";
	if(el(title+'_content'))
	{
		//弹出Div
		var heightCountStr = $("#"+title).css("height");
		var heightCounts = heightCountStr.substring(0,heightCountStr.length-2);
		//内容部分
		$("#"+title+'_content').css("height",(parseInt(heightCounts)-45-50)+"px");
		//自定义
		$("#divTask").css("height",(parseInt(heightCounts)-45-50)+"px");
	}else{
		$("#divTask").css("height",(parseInt(divheight)-45-50)+"px");
	}
	
	var objs = loadProcessTemplate(value);
	if (objs && objs.length > 0) {
		for (var i = 0; i < objs.length; i++) {
			templateProcessChanged(objs[i].PROC_ID, objs[i].PROC_TYPE, objs[i].FLOW_TYPE, objs[i].PROC_STATE, objs[i].PROC_NAME, objs[i].PROC_DESC,objs[i].OBJ_TYPE);
		}
	}
}

/**
 * 根据ID查询IPS_TASK
 * Add by JiJie.LianG 2015-07-15
 */
function searchIpsTaskById(ids)
{
	var sqlQuery = new jetsennet.SqlQuery();
    var queryTable = jetsennet.createQueryTable("IPS_TASK", "p");
    jQuery.extend(sqlQuery, { IsPageResult: 0, QueryTable: queryTable, ResultFields: "p.*"});
    var condition = new jetsennet.SqlConditionCollection();
	condition.SqlConditions.push(jetsennet.SqlCondition.create("TASK_ID", ids, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.In, jetsennet.SqlParamType.String));
    sqlQuery.Conditions = condition;
    
	var param = new HashMap();
    param.put("queryXml", sqlQuery.toXml());
    var sResult = IPSDAO.execute("commonXmlQuery", param);
    var objs = jetsennet.xml.toObject(sResult.resultVal, "Record");
    return objs;
}

/**
 * 创建任务
 * Add by JiJie.LianG 2015-07-22
 */
function createTask()
{
	if(gSelTaskObj)
	{
		if(gFlowView.isChanged)
		{
			jetsennet.confirm("确定是否保存当前流程配置?",
				function() {
					saveTaskProcess();
					gFlowView.clearView();
					renderFlowDiv(gSelTaskObj);
					gTaskCrud.add();
					return true;
				},{oncancel:function() {
					gFlowView.isChanged = false;
					gFlowView.clearView();
					renderFlowDiv(gSelTaskObj);
					gTaskCrud.add();
					return true;
					}
				}
			);
		}else gTaskCrud.add();
	}else gTaskCrud.add();
}

/**
 * 编辑任务
 * Add by JiJie.LianG 2015-07-22
 */
function editTask()
{
	var _checkId = "";
	var _objs = gTaskCrud.onGetCheckId("",gTaskCrud.checkId);
	if(!jetsennet.util.isNullOrEmpty(_objs))
	{
		if(_objs.length == 1)
		{
			_checkId = _objs[0];
		}
	}
	
	if(!jetsennet.util.isNullOrEmpty(gSelTaskObj))
	{
		if(!jetsennet.util.isNullOrEmpty(_checkId))
		{
			if(_checkId == gSelTaskObj.TASK_ID)
			{
				if(gSelTaskObj.TASK_STATE == 11)
				{
					jetsennet.alert("运行中的任务无法编辑，请先停止任务！");
					return;
				}
			}else {
				jetsennet.alert("请确保勾选项和所选条目一致，再进行此操作！");
				return;
			}
		}
		
		if(gFlowView.isChanged)
		{
			jetsennet.confirm("确定是否保存当前流程配置?",
				function() {
					saveTaskProcess();
					gFlowView.clearView();
					renderFlowDiv(gSelTaskObj);
					gTaskCrud.edit();
					return true;
				},{oncancel:function() {
					gFlowView.isChanged = false;
					gFlowView.clearView();
					renderFlowDiv(gSelTaskObj);
					gTaskCrud.edit();
					return true;
					}
				}
			);
		}else gTaskCrud.edit();
	}
}

/**
 * 任务条目 编辑按钮
 * 根据任务ID编辑任务
 * Add by JiJie.LianG 2015-07-22
 */
function editTaskById(id)
{
	if(!valTaskById(id,"编辑"))return;
	
	if(gFlowView.isChanged)
	{
		jetsennet.confirm("确定是否保存当前流程配置?",
			function() {
				saveTaskProcess();
				gFlowView.clearView();
				renderFlowDiv(gSelTaskObj);
				gTaskCrud.edit(id);
				return true;
			},{oncancel:function() {
				gFlowView.isChanged = false;
				gFlowView.clearView();
				renderFlowDiv(gSelTaskObj);
				gTaskCrud.edit(id);
				return true;
				}
			}
		);
	}else gTaskCrud.edit(id);
}

/**
 * 任务名称 搜索框+验证流程
 * Add by JiJie.LianG 2015-07-22
 */
function loadTaskByValChange()
{
	if(gFlowView.isChanged)
	{
		jetsennet.confirm("确定是否保存当前流程配置?",
			function() {
				saveTaskProcess();
				gFlowView.clearView();
				renderFlowDiv(gSelTaskObj);
				loadTask();
				return true;
			},{oncancel:function() {
				gFlowView.isChanged = false;
				gFlowView.clearView();
				renderFlowDiv(gSelTaskObj);
				loadTask();
				return true;
				}
			}
		);
	}else loadTask();
}

/**
 * 根据TaskID删除任务
 * Add by JiJie.LianG 2015-07-30
 */
function delTaskById(id)
{
	var arrId = new Array();
	arrId = id.split(",");
	var isDel = true;
	if(!jetsennet.util.isNullOrEmpty(arrId))
	{
		isDel = valTaskById(arrId[0],"删除");
		if(isDel)
		{
			gTaskCrud.remove(id);
		}
	}else jetsennet.error("TASK_ID为空或不存在！");
	
}

/**
 * 验证该任务是否可以编辑或删除
 * Add by JiJie.LianG 2015-08-11
 */
function valTaskById(id,desc){
	if(!jetsennet.util.isNullOrEmpty(gSelTaskObj) && gSelTaskObj.TASK_ID == id)
	{
		if(gSelTaskObj.TASK_STATE == 11)
		{
			jetsennet.alert("运行中的任务无法"+desc+"，请先停止任务！");
			return false;
		}
	}else{
		if(!jetsennet.util.isNullOrEmpty(id))
		{
			var objs = searchIpsTaskById(id);
			if(objs && objs.length > 0)
			{
				for(var i = 0; i < objs.length; i++)
				{
					if(objs[i]["TASK_STATE"] == 11)
					{
						jetsennet.alert("运行中的任务无法"+desc+"，请先停止任务！");
						return false;
					}
				}
			}else {
				jetsennet.error("任务对象不存在或为空！");
				return false;
			}
		}
	}
	return true;
}

/**
 * 继承数据源标签
 * Add by JiJie.LianG 2015.10.12
 */
function extendsDsLable(fileDsId,dbDsId){
	var params = new HashMap();
     params.put("fileDsId", fileDsId);
     params.put("dbDsId", dbDsId);
     var result = IPSDAO.execute("extendsDsLable", params);
     if (result && result.errorCode == 0) {
     	return true;
     }
     return false;
}

/**
 * 根据角色加载数据源列表
 */
function loadDataSourceListByRole(){
	if(isSystem()){
	   	 gDataSourceCrud.load();
	    }else{
	   	var condition = [];
	  		condition.push(["a.GROUP_ID", queryGroupIdByUserId(), jetsennet.SqlLogicType.Or, jetsennet.SqlRelationType.In]);
	 		condition.push(["d.STATE", "0", jetsennet.SqlLogicType.Or, jetsennet.SqlRelationType.In]);
	 		gDataSourceCrud.search(condition);
	   	 
	    }
}


