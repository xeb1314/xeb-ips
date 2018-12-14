
/***
 * 引用该js的注意事项：
 * 		初始化需要加载：为新建-修改 数据源弹出窗使用(弹出框用到的htm中的div也得赋值一下)
 * 			jetsennet.ui.DropDownList.initOptions("lableNamesType1", true);
 *			jetsennet.ui.DropDownList.initOptions("lableNamesType2", true);
 *	 		jetsennet.ui.DropDownList.initOptions("lableNamesType3", true);
 *	 		jetsennet.ui.DropDownList.initOptions("lableNamesType4", true);
 *	 		jetsennet.ui.DropDownList.initOptions("lableNamesType5", true);
 *	 		jetsennet.ui.DropDownList.initOptions("lableSelectState", true);
 * 		加载数据字典(该函数在class.js中) 因为分类树显示的名称都是从数据字典中取的
 * 			loadCWWord();
 * 													
 * 												Notes By xueenbin 2014-11-19 
 */
var gCurDate = new Date();
var gLastWeekDate;
//修改前的授权用户ID
var beforeGrantId="";
//var classLables = [];
//标签项的值
var labelInfos = [];
//弹出窗名称
var dialogName;
//数据源状态，控制弹出窗的高度
var isChanged = false;
//当前编辑的数据源ID
var dsId;

var existDivIds = [];
var isUpdate = false;
//标识是否为添加 Add by JiJie.LianG 2015.10.12
var isAdd = false;
//用户组树对象 Add by JiJie.LianG 2015.10.15
var gGroupTree = null;

var gCurrCheckId = [];

var gSelDsLabelObj

callback = function(){};

var gDataSourceColumns=[ { fieldName: "DS_ID", width: 30, align: "center", isCheck: 1, checkName: "chkDS"},
	                     { fieldName: "DS_NAME", sortField: "DS_NAME", width:'20%', align: "center", name: "名称"},
	                     { fieldName: "STR_1", sortField: "STR_1", width:"30%", align: "center", name: "参数"},//12.09
	                     { fieldName: "DS_TYPE", sortField: "DS_TYPE", width:'7%', align: "center", name: "访问方式",format: function(val, vals){
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
                         { fieldName: "DS_CLASS", sortField: "DS_CLASS", width:'5%', align: "center", name: "类型",format: function(val, vals){
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
                         { fieldName: "STATE", sortField: "STATE", width:'6%', align: "center", name: "状态",format: function(val, vals){
	                        	var state;
	                         	switch(parseInt(val,10)){
	                         	  case 0:
	                         		 state="公共";
	                         		  break;
	                         	  case 1:
	                         		 state="指派单位";
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
                         { fieldName: "CREATE_USER", sortField: "CREATE_USER", width:'7%', align: "center", name: "创建用户"},
                         { fieldName: "CREATE_TIME", sortField: "CREATE_TIME", width:'12%', align: "center", name: "创建时间"},
                         { fieldName: "DS_DESC", sortField: "DS_DESC", width:'auto', align: "center", name: "描述"},
                         { fieldName: "DS_ID,STR_1,STATE", width: 70, align: "center", name: "标签管理", format: function(val,vals){
                        	 return '<span style="cursor:pointer;" onclick="initLabelManager(\''+vals[0]+'\');"><img src="images/cel_info.png"/></span>';
                         }},
                         { fieldName: "DS_ID", width: 45, align: "center", name: "编辑", format: function(val,vals){
                             return jetsennet.Crud.getEditCell("gDataSourceCrud.edit('" + val + "')");
                         }},
                         { fieldName: "DS_ID", width:45, align: "center", name: "删除", format: function(val,vals){
                        	var value= "'"+val+"'";
                         	return '<span style="cursor:pointer;" onclick="gDataSourceCrud.remove(' + value + ')"><img src="images/cel_del.png"></img></span>';
                         }}
                         ];
	var gDataSourceCrud = $.extend(new jetsennet.Crud("divDataSourceList", gDataSourceColumns, "divDataSourcePage", "ORDER BY d.CREATE_TIME DESC"), {
		dao : IPSDAO,
		keyId : "d.DS_ID",
		tabAliasName : "d",
		tableName : "IPS_DATASOURCE",
		joinTables : [ 
		                [ "IPS_DATATOGROUP", "a", "a.DS_ID=d.DS_ID", jetsennet.TableJoinType.Left ]
		    		 ],
		keyId : "DS_ID",
		resultFields : "distinct (d.DS_ID),d.DS_NAME,d.CREATE_TIME,d.CREATE_USER,d.DB_TYPE,d.DS_CLASS,d.DS_DESC,d.DS_PARAM,d.DS_TYPE,d.STATE,d.STR_1,d.STR_3",
		name : "数据源",
		checkId : "chkDS",
		cfgId : "divDataSourceDialog",
		className : "jetsennet.ips.schema.IpsDatasource",
		addDlgOptions : {size : {width : 600, height :0}},
	    editDlgOptions : {size : {width : 600, height :0}},
	    load : function(){
	    	if (!this.grid) {
		        return;
		    }
		    var result = this.query(this.conditions, this.subConditions);
		    if (result && result.resultVal) {
		        this.grid.renderXML(result.resultVal);
		        //添加回调逻辑
		        callback();
		    }
	    },
	    onAddInit : function() {
	    	jetsennet.ui.DropDownList["lableSelectDSType"].setSelectedIndex(0);
	    	jetsennet.ui.DropDownList["lableSelectState"].setSelectedIndex(0);
	    	isUpdate = false;
	    	dialogName = "新建";
	    	initdialog(dialogName);
	    	el("txt_DataSourceName").style.border="1px #CCC solid";
	    	dsId = null;
	    },
	    add : function() {
	        var $this = this;
	        var dialog = jetsennet.Crud.getConfigDialog(this.msgAdd + this.name, this.cfgId, this.addDlgOptions);
	        if (this.onAddInit) {
	        	isAdd = true;
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
	        dialog.showDialog();
	        isAdd = false;
	    },
	    onAddGet : function() {
//	    	var cwIds = [];
	    	var objs = {
    			DS_NAME : el("txt_DataSourceName").value,
	    		STR_1 : el("txt_SourcePath").value,
//	    		STR_2 : cwIds.join(),
	    		DS_CLASS : el("txt_DataSourceType").value,
	    		STATE : jetsennet.ui.DropDownList["lableSelectState"].selectedValue,
	    		DS_DESC : el("txt_DataSourceDesc").value,
	    		DS_TYPE : jetsennet.ui.DropDownList["lableSelectDSType"].selectedValue,//15.04.10 el("txt_DSType").value
	    		DS_PARAM : "-1",
	    		CREATE_USER : jetsennet.application.userInfo.UserName,
	    		CREATE_USERID : jetsennet.application.userInfo.UserId,
	    		USER_ID : getUserId(),
	    	};
	    	if(jetsennet.ui.DropDownList["lableSelectDSType"].selectedValue == "20"){
	    		objs.DB_TYPE = el("txt_DbType").value;
	    	}else{
	    		objs.DB_TYPE = "";
	    	}
	    	return objs;
	    },
	    directAdd : function (obj){
	    	var params = new HashMap();
	    	var objXml = [];
	    	/*var cwIds = [];
	    	for(var i=0;i<labelInfos.length;i++){
	    		cwIds.push(labelInfos[i].word);
	    	}*/
	    	//数据源表信息
	    	objXml.push("<TABLES><TABLE CLASS_NAME='IpsDatasource'><DS_NAME>"+obj.DS_NAME+"</DS_NAME><STR_1>"+obj.STR_1+"</STR_1><DS_CLASS>"+obj.DS_CLASS+"</DS_CLASS><STATE>"+obj.STATE+"</STATE><DS_DESC>"+obj.DS_DESC+"</DS_DESC><DS_TYPE>"+obj.DS_TYPE+"</DS_TYPE>"
	    		+"<DS_PARAM>"+obj.DS_PARAM+"</DS_PARAM><CREATE_USER>"+obj.CREATE_USER+"</CREATE_USER><CREATE_USERID>"+obj.CREATE_USERID+"</CREATE_USERID>");
	    	if(typeof(obj.DB_TYPE) == "undefined"){
	    		objXml.push("</TABLE>");
	    	}else{
	    		objXml.push("<DB_TYPE>"+obj.DB_TYPE+"</DB_TYPE></TABLE>");
	    	}
	    	if(obj.STATE == "1"){
	    		//数据源指派用户
		    	var userId = obj.USER_ID;
		    	if(userId.length>0){
		    		for(var i=0; i<userId.length;i++){
		        		objXml.push("<TABLE CLASS_NAME='IpsDatatogroup'><DS_ID ref-field='IpsDatasource.DS_ID'></DS_ID><GROUP_ID>"+userId[i]+"</GROUP_ID></TABLE>");
		        	};
		    	}
	    	}
	    	objXml.push("</TABLES>");
	    	params.put("saveXml", objXml.join(""));
	    		var result = this.dao.execute("commonObjsInsert", params);
	    	if (result && result.errorCode == 0) {
	    	    if (this.onAddSuccess) {
	    	        this.onAddSuccess(obj);
	    	    }
	    	    this.load();
	    	    return true;
	    	}
	    },
	    onAddSuccess : function(obj){
	    	this.load();
	    },
	    onEditInit : function() {
	    	dialogName = "编辑";
	    	initdialog(dialogName);
	    	el("txt_DataSourceName").style.border="1px #CCC solid";
	    },
	    onEditValid : function(id,obj){
	    	if(el("txt_SourcePath").value != valueOf(obj, "STR_1", "") && typeof(isProcess) != "undefined" && obj.DS_TYPE == "10"){
	    		// add By xueenbin 20160505
				var processTask = IPSDAO.queryObjs("commonXmlQuery", "TASK_ID", "IPS_TASK", null, null,
						[
						 ["DS_ID", obj.DS_ID, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String ],
						 ["TASK_TYPE", "10", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric ]
						], "TASK_STATE");
				if(processTask == null){
					return true;
				}
				if(processTask.length>1){
						jetsennet.alert("该数据源绑定了两个任务,请确保一个数据源绑定一个数据处理任务");
						return false;
				}else{
					if(processTask[0].TASK_STATE !=="11"){
		    		//获取数据源对应的任务流程。
		    		var params = new HashMap();
		    		params.put("dsId", obj.DS_ID);
		    		var result = IPSDAO.execute("queryProcessByDS", params);
		    		if (result && result.errorCode == 0) {
		    			var ssResult = jetsennet.xml.toObject(result.resultVal, "Record");
		    			var dsPath = "";
		    			//遍历流程节点，修改扫描节点的act_param
		    			for(var c=0;c<ssResult.length;c++){
			    			if(DSInMap.containsKey(ssResult[c].ACT_ID) && gCurrentProcess.procState != "11"){
			    				var param = ssResult[c].ACT_PARAM;
			    	    		var actParam = jetsennet.xml.deserialize(param);
			    	    		//通过字符串截取而不是序列化xml这样做的的目的是序列化的xml中的元素属性项去会删除，如 是否扫描子目录中的参数会有个switch="on"的属性。
			    	    		if(!jetsennet.util.isNullOrEmpty(actParam.dsID)){
			    	    			var start = param.substring(0,param.indexOf("<scanPath>")+10);
			    	    			var end = param.substring(param.indexOf("</scanPath>"),param.length);
			    	    			if(!jetsennet.util.isNullOrEmpty(start)|| start != "-1"){
			    	    				dsPath = start+el("txt_SourcePath").value+end;
			    	    			}
			    	    		}
			    	    		//修改数据源对应的处理任务的扫描节点的参数
			    	    		if(!jetsennet.util.isNullOrEmpty(dsPath)){
				    	    		var param = new HashMap();
				    	    		param.put("procactId", ssResult[c].PROCACT_ID);
				    	    		param.put("actParam", dsPath);
				    	    		var returnState = IPSDAO.execute("updateActParamByDS", param);
				    	    		if(returnState && returnState.errorCode == 0){
				    	    			gTaskCrud.load();
				    	    			return true;
				    	    		}
				    	    	}
			    			}
		    			}
		    		}
		    	}else{
		    		jetsennet.alert("该数据源绑定的任务正在运行，请先停止任务，再做修改！");
		    		return false;
		    	}
			}
	    	} else return true;
	    },
	    onEditSet : function(obj) {
	    	dsId =  valueOf(obj, "DS_ID", "");
    		
	    	el("txt_DataSourceName").value = valueOf(obj, "DS_NAME", "");
	    	el("txt_SourcePath").value = valueOf(obj, "STR_1", "");
	    	el("txt_DataSourceType").value = valueOf(obj, "DS_CLASS", "");
	    	el("txt_DataSourceDesc").value = valueOf(obj, "DS_DESC", "");
	    	var state = valueOf(obj, "STATE", "");
	    	//根据状态判断是否有授权用户，有则显示，没有不显示
	    	if(state == "1"){
	    		el("gratFunToUsers").style.display="";
	    		var conditions = [];
	    		conditions.push(["d.DS_ID", dsId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal]);
	    		beforeGrantId = userList("selMember",conditions);
	    		isChanged = true;
	    	}
	    	//是否显示 数据库类型
	    	el("dbType").style.display="none";
	    	var dsType = valueOf(obj, "DS_TYPE", "");
	    	//访问方式为 数据库表-20 显示 数据库类型
	    	if(dsType == "20"){
	    		el("dbType").style.display="";
	    		el("txt_DbType").value = valueOf(obj, "DB_TYPE", "");
	    	}
	    	//访问方式赋值
	    	var dsTypeItem = jetsennet.ui.DropDownList["lableSelectDSType"].dataItems;
			for(var h=0;h<dsTypeItem.length;h++){
				if(dsTypeItem[h].value == dsType){
					el("lableSelectDSType").value = dsTypeItem[h].text;
					jetsennet.ui.DropDownList["lableSelectDSType"].selectedValue = dsTypeItem[h].value;
				}
			}
			//给状态栏赋值
	    	var stateItem = jetsennet.ui.DropDownList["lableSelectState"].dataItems;
			for(var h=0;h<stateItem.length;h++){
				if(stateItem[h].value == state){
					el("lableSelectState").value = stateItem[h].text;
					jetsennet.ui.DropDownList["lableSelectState"].selectedValue = stateItem[h].value;
				}
			}
	    },
	    onEditGet : function(id) {
	    	var object = {  	
    			DS_ID : id,
	        	DS_NAME : el("txt_DataSourceName").value,
	    		STR_1 : el("txt_SourcePath").value,
//	    		STR_2 : cwIds.join(),
	    		DS_CLASS : el("txt_DataSourceType").value,
	    		STATE : jetsennet.ui.DropDownList["lableSelectState"].selectedValue,
	    		DS_DESC : el("txt_DataSourceDesc").value,
	    		UPDATE_USER : jetsennet.application.userInfo.UserName,
	    		UPDATE_USERID : jetsennet.application.userInfo.UserId,
	    		DS_TYPE : jetsennet.ui.DropDownList["lableSelectDSType"].selectedValue,//15.04.10 el("txt_DSType").value
	    		UPDATE_TIME: new Date().toDateTimeString(),
		    };
	    	//访问方式是否为 数据库表-20
	    	if(jetsennet.ui.DropDownList["lableSelectDSType"].selectedValue == "20"){
	    		object.DB_TYPE = el("txt_DbType").value;
	    	}else{
	    		object.DB_TYPE = "";
	    	}
	    	return object;
	    },
	    onEditSuccess : function(obj){
	    	//删除之前的组
	    	if(beforeGrantId != ""){
	    		var userParams = new HashMap();
		    	var userXml=[];
		    		userXml.push("<TABLE TABLE_NAME='IPS_DATATOGROUP'><SqlWhereInfo><DS_ID ParamType='String' RelationType='Equal' LogicType='And'>"+obj.DS_ID+"</DS_ID>" +
		    				"<GROUP_ID ParamType='Numeric' RelationType='In' LogicType='And'>"+beforeGrantId+"</GROUP_ID></SqlWhereInfo></TABLE>");
		    	userParams.put("deleteXml", userXml.join(""));
		    	IPSDAO.execute("commonObjDeleteByCondition", userParams);
	    	}
	    	if(obj.STATE == "1"){
	    		//新增加的组
	    		var afterUserIds = getUserId();
		    	if(afterUserIds.length>0){
		    		var uParams = new HashMap();
		    		var uIds = [];
		    			uIds.push("<TABLES>");
		    		for(var j=0;j<afterUserIds.length;j++){
		    			uIds.push("<TABLE CLASS_NAME='IpsDatatogroup'><DS_ID>"+obj.DS_ID+"</DS_ID><GROUP_ID>"+afterUserIds[j]+"</GROUP_ID></TABLE>");
		    		}
		    		uIds.push("</TABLES>");
		    		uParams.put("saveXml", uIds.join(""));
			    	IPSDAO.execute("commonObjsInsert", uParams);
		    	}
	    	}
	    },
	    directRemove : function(ids){
	    	var params = new HashMap();
	    	var _delXml=[];
	    	_delXml.push("<TABLES>");
	    	
	    	var _conditions = [];
			_conditions.push([ "DS_ID", ids, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.In, jetsennet.SqlParamType.String ]);
			var _dsLabels = IPSDAO.queryObjs("commonXmlQuery", "ID", "IPS_DATATSOURCELABEL", null, null,_conditions, "ID");
			if(_dsLabels && _dsLabels.length>0){
				var _dsLabelIds="";
				for(var i=0; i< _dsLabels.length; i++)
				{
					if(i == 0)
					{
						_dsLabelIds = _dsLabels[i].ID;
					}else _dsLabelIds += ","+_dsLabels[i].ID;
				}
				if(_dsLabelIds != "")
				{
					//删除 IPS_DSLABELTOUSERGROUP--标签对应的组权限 Add by JiJie.LianG 2015.10.27
					_delXml.push("<TABLE TABLE_NAME='IPS_DSLABELTOUSERGROUP'><SqlWhereInfo><DS_LABELID ParamType='String' RelationType='In' LogicType='And'>"+_dsLabelIds+"</DS_LABELID></SqlWhereInfo></TABLE>");
				}
				//删除 IPS_DATATSOURCELABEL--数据源标签关系表 Add by JiJie.LianG 2015.10.27
				_delXml.push("<TABLE TABLE_NAME='IPS_DATATSOURCELABEL'><SqlWhereInfo><DS_ID ParamType='String' RelationType='In' LogicType='And'>"+ids+"</DS_ID></SqlWhereInfo></TABLE>");
			}
			_delXml.push("<TABLE TABLE_NAME='IPS_DATASOURCE'><SqlWhereInfo><DS_ID ParamType='String' RelationType='In' LogicType='And'>"+ids+"</DS_ID></SqlWhereInfo></TABLE>");	    	

			var sResult = IPSDAO.query("commonXmlQuery", "DS_ID", "IPS_DATATOGROUP", null, null, _conditions, "DS_ID");
	    	var ssResult = jetsennet.xml.toObject(sResult.resultVal, "Record");
	    	if(!$.isEmptyObject(ssResult)){
	    		_delXml.push("<TABLE TABLE_NAME='IPS_DATATOGROUP'><SqlWhereInfo><DS_ID ParamType='String' RelationType='In' LogicType='And'>"+ids+"</DS_ID></SqlWhereInfo></TABLE>");
	    	}
			_delXml.push("</TABLES>"); 
	    	params.put("deleteXml", _delXml.join(""));
    		var result = IPSDAO.execute("commonObjsDeleteByCondition", params);
	    	if (result && result.errorCode == 0) {
    	        if (this.onRemoveSuccess) {
    	            this.onRemoveSuccess(ids);
    	        }
    	        this.load();
    	    }
    	    return true;
	    }
 });

/**
 * 根据条件查找数据源
 */
function searchDSList(){
	 var conditions = [];
	    var value = el('txtDSName').value.replace(/\s/ig,'');
	    if (value) {
	    	conditions.push(["d.DS_NAME", value, jetsennet.SqlLogicType.Or, jetsennet.SqlRelationType.Like, jetsennet.SqlParamType.String ]);
	    	conditions.push(["d.STR_1", value, jetsennet.SqlLogicType.Or, jetsennet.SqlRelationType.Like, jetsennet.SqlParamType.String]);
	    }
	    gDataSourceCrud.search(conditions);

}

/**
 * 递归 向上追溯该数据源的所有父分类的层级关系
 * @param id
 * @param obj
 * @returns
 */
function backSuper(id,obj){
	var conditions = [];
	conditions.push([ "CLASS_ID", id, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String ]);
	var objs = IPSDAO.queryObjs("commonXmlQuery", "CLASS_ID", "IPS_CTRLCLASS", null, null,conditions, "CLASS_TYPE,CLASS_NAME,CLASS_DESC,PARENT_ID");
	var classType = objs[0].CLASS_TYPE;
	if(classType != '-1'){
		//受控词ID
		obj.CW_IDS.push(objs[0].CLASS_NAME);
		var parentId = objs[0].PARENT_ID;
		if(parentId != '0'){
			backSuper(parentId,obj);
		}else{
			obj.TYPE = objs[0].CLASS_TYPE;
		}
	}else{
		//分类类别
		obj.TYPE = objs[0].CLASS_DESC;
	}
	return obj;
}

/**
 * 初始化指派用户、数据库类型和数据字典类别
 */
function initdialog(titleType){
	el("gratFunToUsers").style.display="none";
    el("selMember").options.length=0;
	jetsennet.ui.DropDownList["lableSelectState"].onchanged= function (item){
	   	var val = item.value;
	   	if(val != "-1"){
			if(val == "1"){
				el("gratFunToUsers").style.display="";
				isChanged = true;
				controlDisplay(titleType+"数据源_content",100,false);
			}else{
			    el("gratFunToUsers").style.display="none";
				if(isChanged){
					controlDisplay(titleType+"数据源_content",100,true);
				}
				isChanged = false;
			}
	   	 }
	    };
    //数据库类型
    el("dbType").style.display="none";
    jetsennet.ui.DropDownList["lableSelectDSType"].onchanged= function (item){
    	if(isAdd)return;
    	var val = item.value;
   	 	if(val != "-1"){
   	 		if(val == "20"){
   	 			el("dbType").style.display="";
   	 			controlDisplay(titleType+"数据源_content",50,false);
   		 	}else{
   			 	el("dbType").style.display="none";
   			 	controlDisplay(titleType+"数据源_content",50,true);
   		 	}
   		 }
    };
}

/**
 * 控制隐藏或显示时弹出窗的高度大小
 * @param divId
 * @param max
 * @param isNone
 */
function controlDisplay(divId,max,isNone){
	var object = $("#"+divId);
	var contentHeight = object.css("height");
	var contentHeightInt = contentHeight.substring(0,contentHeight.length-2);
	if(!isNone){
		object.css("height",parseInt(contentHeightInt)+max+"px");
	}else{
		object.css("height",parseInt(contentHeightInt)-max+"px");
	}
}

/**
 * 新增-修改操作   验证名称是否重复
 */
function validateName(){
	var conditions = [];
    	conditions.push(["t.DS_NAME", el("txt_DataSourceName").value, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String]);
    	if(dsId){
    		conditions.push(["t.DS_ID", dsId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.NotEqual, jetsennet.SqlParamType.String]);
    	}
	var sResult = IPSDAO.query("commonXmlQuery", "DS_ID", "IPS_DATASOURCE", "t", null, conditions, "t.DS_ID");
    var objs = jetsennet.xml.toObject(sResult.resultVal, "Record");
    if(objs){
    	el("txt_DataSourceName").style.border="1px #936 solid";
    	jetsennet.message("该名称已存在，请您重新输入！",{reference:el("txt_DataSourceName"),position:3});
    }else{
    	el("txt_DataSourceName").style.border="1px #CCC solid";
    }
}

//======================数据权限分发==============
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
 * 数据权限分发
 * Add by JiJie.LianG 2015.10.14
 */
function dataAccess(){
	clearRadio(["dataLable"]);
//	$("input[name='dataLable'][default='179']").attr("checked",true);
	$("input[name='dataLable']").get(0).checked = true;
	el('ddlDataLableVal').value=$("input[name=dataLable]:checked").val();
	el('txtSearchName').value="";
	
	var id;
	gCurrCheckId = gDataSourceCrud.onGetCheckId ? gDataSourceCrud.onGetCheckId(id, gDataSourceCrud.checkId) : jetsennet.Crud.getCheckIds(id, gDataSourceCrud.checkId);
    if(gCurrCheckId.length != 1) {
        jetsennet.alert("请选择一个要分配数据权限的数据源！");
        return;
    }
    var _dsObj = getDataSourceByDsId();
    if(_dsObj == null || _dsObj.DS_TYPE != 20)
    {
    	jetsennet.alert("请选择数据库数据源再操作！");
        return;
    }
	
	dataAccessPageInit();
	searchSelectLableData();
	
//	var dialog = new jetsennet.ui.Window("数据权限分发");
//    jQuery.extend(dialog, {
//        title : "数据权限分发",
//        size : {
//            width : 700,
//            height : 0
//        },
//        submitBox : true,
//        cancelBox : true,
//        maximizeBox : false,
//        minimizeBox : false,
//        showScroll : false,
//        controls : [ "divDataAccess" ]
//    }, {});
	var dialog = jetsennet.Crud.getConfigDialog("数据权限分发", "divDataAccess", {size : {width : 700, height :0}});
	dialog.onsubmit = function() {
//		if(getGroupIds(gGroupTree) == null)
//		{
//			jetsennet.alert("请选中组再提交！")
//			return;
//		}
		if(!gSelDsLabelObj)
		{
			jetsennet.alert("请选中标签再提交！")
			return;
		}
		if(saveDataAccess(gSelDsLabelObj.ID,getGroupIds(gGroupTree)))
		{
			jetsennet.message("操作成功!");
		}else{
			jetsennet.message("操作失败!");
		}
	};
	dialog.showDialog();
}

/**
 * 页面加载完之后执行
 * Add by JiJie.LianG 2015.10.15
 */
function dataAccessPageInit() {
    loadGroupTree();
}

/**
 * radio切换Func
 * Add by JiJie.LianG 2015.10.15
 */
function radioFunc(val){
	el('ddlDataLableVal').value=val;
	//重置分组树
	loadGroupTree();
	//重置标签搜索框
	el("txtSearchName").value = "";
	//初始化标签列表
	searchSelectLableData();
}

/**
 * 加载分组树===================
 * Add by JiJie.LianG 2015.10.16
 */
function loadGroupTree(type) {
    var result = UUMDAO.query("commonXmlQuery", "ID", "UUM_USERGROUP", null, null, null, "ID,NAME,TYPE,PARENT_ID", "Order By PARENT_ID", null, null);
    if (result && result.errorCode == 0) {
        gGroupTree = createTree(result.resultVal, "ID", "PARENT_ID", "NAME", "divUserGroupContent", null, true, null, null, null, true, [type?"0":"-1"]);
        //TODO:导致Radio样式有问题
//        gGroupTree.expandAll(true);

//		expandTree(gGroupTree,gGroupTree.getNodes(),true);
//        expandTree(gGroupTree,true);
    }
}

/**
 * 标签========================
 * Add by JiJie.LianG 2015.10.16
 */
var gSelectLableColumns = [{fieldName : "CW_NAME",sortField : "CW_NAME",width : "25%",align : "center",name : "标签名称"}, 
	    					{fieldName : "CW_DESC",sortField : "CW_DESC",width : "75%",align : "left",name : "标签描述"}];

 //SELECT * FROM IPS_DATATSOURCELABEL H INNER JOIN (SELECT R.CW_ID,R.CW_TYPE,C.STR_1 FROM IPS_CTRLWORD R LEFT JOIN IPS_CTRLWORD C ON R.CW_TYPE = C.CW_CODE WHERE R.CW_TYPE NOT IN ('-1') AND C.STR_1 IS NOT NULL) K ON H.CW_IDS = K.CW_ID WHERE H.DS_ID = '
var gLableCrud = $.extend(new jetsennet.Crud("divSelectLableList", gSelectLableColumns, "divSelectLablePage", "order by c.CW_CODE"), {
    dao : IPSDAO,
    tableName : "IPS_DATATSOURCELABEL",
    name : "标签",
    joinTables : [["IPS_CTRLWORD", "c", "c.CW_ID=t.CW_IDS", jetsennet.TableJoinType.Inner]],
    resultFields : "t.ID,t.DS_ID,t.CW_IDS,t.TYPE,c.CW_ID,c.CW_NAME,c.CW_CODE,c.CW_DESC,c.CW_TYPE"
});
gLableCrud.grid.ondoubleclick = null;
gLableCrud.grid.onrowclick = function(item)
{
	//重复选中同一行直接返回
	if(gSelDsLabelObj == item)return;
	gSelDsLabelObj = item;
	loadGroupTree();
	renderGroupTree(gSelDsLabelObj.ID,gGroupTree,true);
};

/**
 * 查询数据源所属标签
 * Add by JiJie.LianG 2015.10.16
 */
function searchSelectLableData() {
//	var cwType = getRadioValue("divLableClass");
	var cwType = el('ddlDataLableVal').value;
//	var cwType = $("input[name=dataLable]:checked").val();
    var conditions = [];
    el('txtSearchName').value = jetsennet.util.trim(el('txtSearchName').value);
    if (el('txtSearchName').value != "") {
        conditions.push([ "c.CW_NAME", el('txtSearchName').value, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Like, jetsennet.SqlParamType.String ]);
    }
    conditions.push([ "c.CW_TYPE", cwType, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric ]);
    conditions.push([ "t.DS_ID",gCurrCheckId[0], jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String ]);
    gLableCrud.search(conditions);
}

/**
 * 保存数据源标签和组
 * Add by JiJie.LianG 2015.10.19
 * 当 groupIds 为 null 时,清空当前所选 标签对应的数据权限
 * Add by JiJie.LianG 2015.10.27
 */
function saveDataAccess(dsLabelId,groupIds){
	if(groupIds != null){
		var params = new HashMap();
		params.put("dsLabelId", dsLabelId);
		params.put("groupIds", groupIds);
		var result = IPSDAO.execute("insertGroup2DsLabel", params);
		if (result && result.errorCode == 0) {
			return true;
		}
		return false;
	}else{
		//清空当前所选 标签对应的数据权限
		var delParams = new HashMap();
		var _delXml=[];
		_delXml.push("<TABLES>");
		//删除IPS_DSLABELTOUSERGROUP--标签对应的用户权限 Add by JiJie.LianG 2015.10.27
		_delXml.push("<TABLE TABLE_NAME='IPS_DSLABELTOUSERGROUP'>");
		_delXml.push("<SqlWhereInfo>");
		_delXml.push("<DS_LABELID ParamType='String' RelationType='In' LogicType='And'>"+dsLabelId+"</DS_LABELID>");
		_delXml.push("</SqlWhereInfo></TABLE>");
		_delXml.push("</TABLES>");
		delParams.put("deleteXml", _delXml.join(""));
		var result = IPSDAO.execute("commonObjsDeleteByCondition", delParams);
		if (result && result.errorCode == 0) {
			return true;
		}
        return false;
	}
	
}

/**
 * 获取组ID，多个','分隔
 * Add by JiJie.LianG 2015.10.19
 */
function getGroupIds(functionTree){
	var userFunctionIds = "";
	var i = 0;
	if(functionTree){
		var checkedNodes= functionTree.getCheckedNodes(true);//获得选中节点集合
		if (checkedNodes && checkedNodes.length>0){
			for (i = 0; i < checkedNodes.length; i++) {
				if(i==0)
				{
					userFunctionIds = checkedNodes[i]["id"]
				}else{
					userFunctionIds += ","+checkedNodes[i]["id"];
				}
			}
			return userFunctionIds;
		}
	}
	return null;
}

/**
 * 根据IPS_DSLABELTOUSERGROUP表 DS_LABELID 将所分配组选中
 * Add by JiJie.LianG 2015.10.19
 */
function renderGroupTree(dsLabelId,functionTree,isCheck){
	var conditions = [];
	conditions.push([ "DS_LABELID", dsLabelId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String ]);
	var objs = IPSDAO.queryObjs("commonXmlQuery", "DS_LABELID", "IPS_DSLABELTOUSERGROUP", null, null,conditions, "GROUP_ID");
	if(objs && objs.length>0){
		if(functionTree){
			for(var i=0;i<objs.length;i++){
				node = functionTree.getNodeByParam("id",objs[i].GROUP_ID);
				if (node) {
					node.checked = isCheck;
					functionTree.updateNode(node);
				}
			}
		}
	}
}
//TODO:待解决 zTree展开 导致页面radio样式失效
function expandTree(functionTree,nodes,flag)
{
	if(functionTree){
		for(var i=0;i<nodes.length;i++)
		{
			nodes[i]
		}
	}
}

/**
 * 数据权限类型
 * 获取Radio值
 * Add by JiJie.LianG 2015.10.20
 */
function getRadioValue(pId)
{
	var radioObjs = jetsennet.form.getElements(pId);
	for(var i=0;i<radioObjs.length;i++)
	{
		if(radioObjs[i].checked)
		{
			return radioObjs[i].value;
		}
	}
	jetsennet.error("获取数据权限类型失败!");
	return;
}

/**
 * 根据数据源ID或者当前选中的gCurrCheckId 查询数据源对象
 * Add by JiJie.LianG 2015.10.21
 */
function getDataSourceByDsId(id)
{
	var _dsId;
	if(id)
	{
		_dsId = id;
	}else _dsId = gCurrCheckId[0];
	
	var conditions = [];
	conditions.push([ "DS_ID", _dsId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String ]);
	var objs = IPSDAO.queryObjs("commonXmlQuery", "DS_ID", "IPS_DATASOURCE", null, null,conditions, "*");
	if(objs)
	{
		return objs[0];
	}
	return null;
}
//======================数据权限分发==============

//======================labelManager==============
//select e.CW_CODE,t.ID,t.DS_ID,t.TYPE,t.CW_IDS,e.CW_ID,e.CW_TYPE,e.CW_NAME,e.CW_DESC from IPS_DATATSOURCELABEL t left join IPS_CTRLWORD e on t.CW_IDS = e.CW_ID or t.TYPE = e.CW_CODE where t.DS_ID = '0D41AFF2-A4FD-412D-B211-A3422A34002C' group by e.CW_CODE  
//select distinct p.cw_code,p.DS_ID from (select t.ID,t.DS_ID,t.TYPE,t.CW_IDS,e.CW_ID,e.CW_TYPE,e.CW_NAME,e.CW_CODE,e.CW_DESC from IPS_DATATSOURCELABEL t left join IPS_CTRLWORD e on t.CW_IDS = e.CW_ID or t.TYPE = e.CW_CODE where t.DS_ID = '0D41AFF2-A4FD-412D-B211-A3422A34002C') p
//select * from IPS_DATATSOURCELABEL where DS_ID = '0D41AFF2-A4FD-412D-B211-A3422A34002C'
//select t.ID,t.DS_ID,t.TYPE,t.CW_IDS,e.CW_ID,e.CW_TYPE,e.CW_NAME,e.CW_CODE,e.CW_DESC from IPS_DATATSOURCELABEL h left join IPS_CTRLWORD e on h.CW_IDS = e.CW_ID or h.TYPE = e.CW_CODE where h.DS_ID = '0D41AFF2-A4FD-412D-B211-A3422A34002C'
var columns = [{ fieldName: "CW_NAME", sortField: "CW_NAME", width: 150, align: "left", name: "标签名称"},
                { fieldName: "CW_DESC", sortField: "CW_DESC", width: 'auto', align: "left", name: "标签描述"},
//                { fieldName: "CW_CODE,CW_TYPE", width: 45, align: "center", name: "编辑", format: function(val,vals){
//                	if(vals[1] == "-1")return;
//                    if(vals[1]!=0 && vals[1]!="0") {
//                        return jetsennet.Crud.getEditCell("gLabelManagerCrud.edit('" + val + "')");
//                    }
//                }},
                { fieldName: "CW_ID,CW_TYPE", width: 45, align: "center", name: "删除", format: function(val,vals){
                	if(vals[1] == "-1")return;
                    return jetsennet.Crud.getDeleteCell("delDsLabelByDsIdAndCWIDs('" + val + "')");
                }}];

var gLabelManagerCrud = $.extend(new jetsennet.Crud("divLabelContent", columns, "divLabelPage"), {
  dao : IPSDAO,
  tableName : "IPS_DATATSOURCELABEL",
  name : "标签",
  pageQueryMethodName: "dsLabelsQueryForPage"
});
gLabelManagerCrud.grid.ondoubleclick = null;

/**
 * 初始化--标签管理
 * Add by JiJie.LianG 2015.10.23
 */
function initLabelManager(dsId){
	var id;
	if(dsId)
	{
		gCurrCheckId[0] = dsId;
	}else{
		gCurrCheckId = gDataSourceCrud.onGetCheckId ? gDataSourceCrud.onGetCheckId(id, gDataSourceCrud.checkId) : jetsennet.Crud.getCheckIds(id, gDataSourceCrud.checkId);
		if(gCurrCheckId.length != 1) {
	        jetsennet.alert("请选择一个数据源！");
	        return;
	    }
	}
	
	var dialog = jetsennet.Crud.getConfigDialog("标签管理", "divLabelManager", {size : {width : 600, height :0}});
	dialog.submitBox = false;
    dialog.cancelBox = false;
	dialog.showDialog();
	
	jetsennet.ui.DropDownList.initOptions("lableNamesType1", true);
	//加载数据字典类别
	loadCtrlWord("lableNamesType1");
	jetsennet.ui.DropDownList["lableNamesType1"].setSelectedIndex(0);
	
	selectTag();
}

/**
 * 查询-标签集合 Add by JiJie.LianG 2015.10.26
 */
function selectTag(){
	
	//重置标签类型和标签项样式
	el("lableNamesType1").style.border="1px #CCC solid";
    el("lableName_lableNamesType1").style.border="1px #CCC solid";
    
	var cwType = jetsennet.ui.DropDownList["lableNamesType1"].selectedValue;
	var cwId = "";
	var cwName = "";
	if(cwType != "-1"){
		cwId = jetsennet.ui.AutoCompletes["lableName_lableNamesType1"].selectedValue;
		if(cwId != "")
		{
			cwName = el("lableName_lableNamesType1").value;
		}
	}
	
	gLabelManagerCrud.grid.parentId = -1;
	gLabelManagerCrud.grid.idField = "CW_CODE";
	gLabelManagerCrud.grid.parentField = "CW_TYPE";
	gLabelManagerCrud.grid.treeControlIndex = 0;
	gLabelManagerCrud.grid.treeOpenAll = true;
	
	var conditions = [];
    conditions.push([ "t.DS_ID",gCurrCheckId[0], jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String ]);
    if(cwType != "-1")
    {
    	conditions.push([ "t.CW_TYPE",cwType, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String ]);
    	gLabelManagerCrud.grid.parentId = cwType;
    	gLabelManagerCrud.grid.treeControlIndex = -1;
    }
    if(cwName != "")
    {
    	conditions.push([ "t.CW_NAME",cwName, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Like, jetsennet.SqlParamType.String ]);
    }
	gLabelManagerCrud.search(conditions);
}

/**
 * 标签管理-新增标签
 * Add by Jijie.LianG 2015.10.26
 */
function addTag(){
	//重置标签类型和标签项样式
	el("lableNamesType1").style.border="1px #CCC solid";
    el("lableName_lableNamesType1").style.border="1px #CCC solid";
    
	var cwType = jetsennet.ui.DropDownList["lableNamesType1"].selectedValue;
	var cwId = "";
	var cwName = "";
	if(cwType == "-1"){
		//标签类型样式--红
		el("lableNamesType1").style.border="1px #936 solid";
		jetsennet.alert("标签类型不能为空!");
		return;
	}else{
		cwId = jetsennet.ui.AutoCompletes["lableName_lableNamesType1"].selectedValue;
		if(cwId == "")
		{
			//标签项样式--红
			el("lableName_lableNamesType1").style.border="1px #936 solid";
			jetsennet.message("标签项不能为空!");
			return;
		}
		
		var _dsLabelObj = getDsLabelByDsIdAndCWIDs(gCurrCheckId[0],cwId);
		if(_dsLabelObj != null)
		{
			cwName = el("lableName_lableNamesType1").value;
			el("lableName_lableNamesType1").style.border="1px #936 solid";
			jetsennet.message("标签项为：'"+cwName+"' 已存在!");
			return;
		}
		
		var _dsObj = getDataSourceById(gCurrCheckId[0]);
		var _cwInDs = false;
		var _str2;
		if(_dsObj != null){
			_str2 = _dsObj.STR_2.split(",");
			if(_str2.length>0)
			{
				for(var i=0; i<_str2.length; i++)
				{
					if(_str2[i] == cwId){
						_cwInDs = true;//IPS_DATASOURCE STR_2字段中存在当前标签CW_ID Add by JiJie.LianG 2015.10.27
					}
				}
			}
		}
		
		//---------IPS_DATATSOURCELABEL 新增 Add by JiJie.LianG 2015.10.23
		var params = new HashMap();
		var objXml = [];
		objXml.push("<TABLES>");
		objXml.push("<TABLE CLASS_NAME='IPS_DATATSOURCELABEL'><DS_ID>"+gCurrCheckId[0]+"</DS_ID><TYPE>"+cwType+"</TYPE><CW_IDS>"+cwId+"</CW_IDS></TABLE>");
		objXml.push("</TABLES>");
		params.put("className", "jetsennet.ips.schema.IpsDatatsourcelabel");
		params.put("saveXml", objXml.join(""));
    	var result = IPSDAO.execute("commonObjsInsert", params);
    	if (result && result.errorCode == 0) {
    		if(_cwInDs){
    			jetsennet.message("添加标签项成功!");
	    		jetsennet.ui.DropDownList["lableNamesType1"].setSelectedIndex(0);
	    		selectTag();
    		}else{
    			//_cwInDs--IPS_DATASOURCE STR_2 字段有值 将新的标签加入 STR_2 字段 Add by JiJie.LianG 2015.10.27
	    		var dsInfo = {};
				dsInfo.DS_ID = _dsObj.DS_ID;
				if(_dsObj.STR_2 == "")
				{
					dsInfo.STR_2 = cwId;
				}else {
					dsInfo.STR_2 = _dsObj.STR_2 + "," + cwId;
				}
	            
	            var params = new HashMap();
	            params.put("className", "IpsDataSourceBusiness");
	            params.put("updateXml", jetsennet.xml.serialize(dsInfo, "dsInfo"));
	            params.put("isFilterNull", true);
	            var sResult = IPSDAO.execute("commonObjUpdateByPk",params);
	            if(sResult && sResult.errorCode==0){
	            	jetsennet.message("添加标签项成功!");
		    		jetsennet.ui.DropDownList["lableNamesType1"].setSelectedIndex(0);
		    		selectTag();
	            }else{
	            	jetsennet.message("添加IPS_DATASOURCE STR_2 失败!");
	            }
    		}
    	}else jetsennet.message("添加标签项失败!");
	}
}

/**
 * 根据数据源ID和数据字典CWID 删除IPS_DATATSOURCELABEL
 * Add by JiJie.LianG 2015.10.26
 */
function delDsLabelByDsIdAndCWIDs(_cwIds){
	jetsennet.confirm("确定删除当前标签项?", function() {
		var delParams = new HashMap();
		var _delXml=[];
		_delXml.push("<TABLES>");
		
		var _dsLabelObj = getDsLabelByDsIdAndCWIDs(gCurrCheckId[0],_cwIds);
		if(_dsLabelObj != null)
		{
			//删除IPS_DSLABELTOUSERGROUP--标签对应的用户权限 Add by JiJie.LianG 2015.10.27
			_delXml.push("<TABLE TABLE_NAME='IPS_DSLABELTOUSERGROUP'>");
			_delXml.push("<SqlWhereInfo>");
			_delXml.push("<DS_LABELID ParamType='String' RelationType='In' LogicType='And'>"+_dsLabelObj.ID+"</DS_LABELID>");
			_delXml.push("</SqlWhereInfo></TABLE>");
		}
		_delXml.push("<TABLE TABLE_NAME='IPS_DATATSOURCELABEL'>");
		_delXml.push("<SqlWhereInfo>");
		_delXml.push("<DS_ID ParamType='String' RelationType='Equal' LogicType='And'>"+gCurrCheckId[0]+"</DS_ID>")
		_delXml.push("<CW_IDS ParamType='String' RelationType='Equal' LogicType='And'>"+_cwIds+"</CW_IDS>")
		_delXml.push("</SqlWhereInfo></TABLE>");
		_delXml.push("</TABLES>");
		delParams.put("deleteXml", _delXml.join(""));
		var result = IPSDAO.execute("commonObjsDeleteByCondition", delParams);
		if (result && result.errorCode == 0) {
			jetsennet.message("删除标签项成功!");
			selectTag();
		}
        return true;
    });
}

/**
 * 根据数据源ID和数据字典CWID查询是否存在标签项
 * Add By JiJie.LianG 2015.10.26
 */
function getDsLabelByDsIdAndCWIDs(_dsId,_cwIds){
	var conditions = [];
	conditions.push([ "DS_ID", _dsId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String ]);
	conditions.push([ "CW_IDS", _cwIds, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String ]);
	var objs = IPSDAO.queryObjs("commonXmlQuery", "ID", "IPS_DATATSOURCELABEL", null, null,conditions, "*");
	if(objs)
	{
		return objs[0];
	}
	return null;
}

/**
 * 根据ID获取数据源对象
 * Add by JiJie.LianG 2015.10.27
 */
function getDataSourceById(_dsId){
	var conditions = [];
	conditions.push([ "DS_ID", _dsId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String ]);
	var objs = IPSDAO.queryObjs("commonXmlQuery", "DS_ID", "IPS_DATASOURCE", null, null,conditions, "*");
	if(objs)
	{
		return objs[0];
	}
	return null;
}
//======================labelManager==============

function openDeskTop(filePath){ 
	var params = new HashMap();
	params.put("filePath", filePath);
	var result = IPSDAO.execute("openDeskTop", params);
	if(result != 0){
		jetsennet.error("文件路径不存在!");
	}
}
//选择授权用户配置项
//选择用户表格配置
var gSelectUserColumns = [ 
    {fieldName : "ID,NAME",width : 30,align : "center",isCheck : 1,checkName : "chk_SelectUser",format : function(val, vals) {
        return vals[0] + "," + vals[1];
    }}, 
    {fieldName : "NAME",sortField : "NAME",width : "55%",align : "left",name : "单位名称"}, 
	{fieldName : "DESCRIPTION",width : "40%",align : "center",name : "描述"} 
    ];

Layoutit("#divSelectUser", {vLayout: ["auto", 35]});
var gUserCrud = $.extend(new jetsennet.Crud("divSelectUserList", gSelectUserColumns, "divSelectUserPage", "order by t.ID"), {
    dao : UUMDAO,
    tableName : "UUM_USERGROUP",
    name : "用户组",
    checkId : "chk_SelectUser",
    conditions : [["TYPE", "0", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal]]
});	
gUserCrud.grid.ondoubleclick = null;
gUserCrud.grid.parentId = 24;
gUserCrud.grid.idField = "ID";
gUserCrud.grid.parentField = "PARENT_ID";
gUserCrud.grid.treeControlIndex = 1;
gUserCrud.grid.treeOpenAll = true;

/*function replacese(chars,tochar){
	return this.replace(new RegExp(chars, "ig"),tochar);
};*/

/**
 * 提交 新建-修改 授权用户的初始化
 */
function getUserId (){
	var userIds=[];
	var len = el("selMember").options;
		for (var i = 0; i < len.length; i++) {
			userIds.push(len[i].value);
	    }
    return userIds;
}

/**
 * 根据用户Id获取用户所属组 add by  xueenbin 20160408
 * @returns {Array}
 */
function queryGroupIdByUserId(){
	var Result = IPSDAO.query("commonXmlQuery", "u.USER_ID,u.GROUP_ID", "UUM_USERTOGROUP", "u", null, [["u.USER_ID", jetsennet.application.userInfo.UserId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal]], "u.GROUP_ID");
 	var ssResult = jetsennet.xml.toObject(Result.resultVal, "Record");
 	var groups = [];
 	if(!$.isEmptyObject(ssResult)){
 		for(var j=0;j<ssResult.length;j++){
 			groups.push(ssResult[j].GROUP_ID);
 		}
 	}
 	return groups;
}

/**
 * 根据用户Id获取用户所属角色 add by  xueenbin 20160411
 * @returns {Array}
 */
function isSystem(){
	var Result = IPSDAO.query("commonXmlQuery", "u.USER_ID,u.ROLE_ID", "UUM_USERTOROLE", "u", null, [["u.USER_ID", jetsennet.application.userInfo.UserId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal]], "u.ROLE_ID");
 	var ssResult = jetsennet.xml.toObject(Result.resultVal, "Record");
 	var isSys = false;
 	if(!$.isEmptyObject(ssResult)){
 		for(var j=0;j<ssResult.length;j++){
 			if(ssResult[j].ROLE_ID == 1){
 				isSys = true;
 			}
 		}
 	}
 	return isSys;
}

