jetsennet.require([ "gridlist", "crud","pagebar", "window", "bootstrap/moment", "bootstrap/daterangepicker","autocomplete","datepicker",
                    "menu","tabpane", "jetsentree","flowview", "accordion","pageframe"]);
jetsennet.importCss(["bootstrap/daterangepicker-bs3" ]);

	var sysObj={};

/*===========================系统======================================================================================================================*/
	var sysColumns = [{ fieldName: "SYS_ID", width: 30, align: "center", isCheck: 1, checkName: "chkSys"},
	               { fieldName: "SYS_CODE", sortField: "SYS_CODE", width: "10%", align: "center", name: "系统代号"},
	               { fieldName: "SYS_NAME", sortField: "SYS_NAME", width: "25%", align: "center", name: "系统名称"},
	               { fieldName: "STR_1", sortField: "STR_1", width: "15%", align: "center", name: "类型",format: function(val,vals){
	            	   if(val != ""){
		            	   	var types = queryClassType(val);
		           			var name = "";
		           			if(types[0].CLASS_TYPE == "-1"){
		           				name =  types[0].CLASS_NAME;
		           			}else{
		           				name = gCWWordDoc.documentElement.selectSingleNode("Record[CW_ID='" + types[0].CLASS_NAME + "']").selectSingleNode("CW_NAME").text;
		           			}
		           			return name;
	            	   }else return "";
	               }},
	               { fieldName: "STR_2", sortField: "STR_2", width: "15%", align: "center", name: "单位",format: function(val,vals){
	            	   if(val != ""){
	            		   var types = queryClassType(val);
		           			var name = "";
		           			if(types[0].CLASS_TYPE == "-1"){
		           				name =  types[0].CLASS_NAME;
		           			}else{
		           				name = gCWWordDoc.documentElement.selectSingleNode("Record[CW_ID='" + types[0].CLASS_NAME + "']").selectSingleNode("CW_NAME").text;
		           			}
		           			return name;   
	            	   }else return "";
	            	   	
	               }},
	               { fieldName: "STR_3", sortField: "STR_3", width: "15%", align: "center", name: "地点",format: function(val,vals){
	            	   if(val != ""){
	            		   var types = queryClassType(val);
		           			var name = "";
		           			if(types[0].CLASS_TYPE == "-1"){
		           				name =  types[0].CLASS_NAME;
		           			}else{
		           				name = gCWWordDoc.documentElement.selectSingleNode("Record[CW_ID='" + types[0].CLASS_NAME + "']").selectSingleNode("CW_NAME").text;
		           			}
		           			return name;   
	            	   }else return "";
	               }},
	               { fieldName: "SYS_DESC", sortField: "SYS_DESC", width: "20%", align: "center", name: "描述"},
	               { fieldName: "SYS_ID", width: 45, align: "center", name: "编辑", format: function(val,vals){
	                   return jetsennet.Crud.getEditCell("gSysCrud.edit('" + val + "')");
	               }},
	               { fieldName: "SYS_ID", width: 45, align: "center", name: "删除", format: function(val,vals){
	                   return jetsennet.Crud.getDeleteCell("gSysCrud.remove('" + val + "')");
	               }}];
	var gSysCrud = $.extend(new jetsennet.Crud("divCollecList", sysColumns, "divCollecPage"), {
		dao : IPSDAO,
		keyId : "SYS_ID",
		tableName : "DMA_APPSYSTEM",
		name : "采集系统",
		className : "jetsennet.jdma.schema.DmaAppsystem",
		cfgId : "divSysDialog",
		checkId : "chkSys",
		addDlgOptions : {size : {width : 534, height :0}},
	    editDlgOptions : {size : {width : 534, height :0}},
		onAddInit : function() {
			loadLables();
		},
		onAddValid : function() {
			return _checkFuncExist();
	     },
		onAddGet : function() {
		return {
			SYS_NAME : el("txt_SysName").value,
			SYS_TYPE : 200,//0是未知、1是采集系统、 2是数据处理系统
			SYS_CODE : el("txt_SysCode").value,
			SYS_DESC : el("txt_sysDesc").value,
			STR_1 : el("hidBusTypeOptionId").value,
			STR_2 : el("hidUnitOptionId").value,
			STR_3 : el("hidLocationOptionId").value,
			STATE :0, 
		    CREATE_USER : jetsennet.application.userInfo.UserName,
   		    CREATE_USERID : jetsennet.application.userInfo.UserId
		};
		},
		onAddSuccess : function(obj){
//			jetsennet.message("新建成功！");
	    },
		onEditInit : function() {
			loadLables();
		},
		onEditSet : function(obj) {
			
			el("txt_SysName").value = obj.SYS_NAME;
			el("txt_sysDesc").value = obj.SYS_DESC;
			el("txt_SysCode").value = obj.SYS_CODE;
			var busClassId = obj.STR_1;
			if(busClassId != ""){
				var busType = queryClassType(busClassId);
	   			var busTypeName = "";
	   			var singleClass = busType[0].CLASS_TYPE;
	   			if(singleClass == "-1"){
	   				singleClass = busType[0].CLASS_DESC;
	   				busTypeName =  busType[0].CLASS_NAME;
	   			}else{
	   				singleClass = busClassId;
	   				busTypeName = gCWWordDoc.documentElement.selectSingleNode("Record[CW_ID='" + busType[0].CLASS_NAME + "']").selectSingleNode("CW_NAME").text;
	   			}
	   			el("busTypeOptions").value=busTypeName;
	   			el("hidBusTypeOptionId").value=singleClass;
			}
   			
			var unitClassId = obj.STR_2;
   			if(unitClassId != ""){
   				var unit = queryClassType(unitClassId);
   	   			var unitName = "";
   	   			var unitClass = unit[0].CLASS_TYPE;
   	   			if(unitClass == "-1"){
   	   				unitClass = unit[0].STR_2;
   	   				unitName =  unit[0].CLASS_NAME;
   	   			}else{
   	   				unitClass = unitClassId;
   	   				unitName = gCWWordDoc.documentElement.selectSingleNode("Record[CW_ID='" + unit[0].CLASS_NAME + "']").selectSingleNode("CW_NAME").text;
   	   			}
   	   			el("unitOptions").value=unitName;
   	   			el("hidUnitOptionId").value=unitClass;
   			}
   			
   			var locClassId = obj.STR_3;
   			if(locClassId != ""){
   				var loc = queryClassType(locClassId);
   	   			var locName = "";
   	   			var locClass = loc[0].CLASS_TYPE;
   	   			if(locClass == "-1"){
   	   				locClass = loc[0].CLASS_DESC;
   	   				locName =  loc[0].CLASS_NAME;
   	   			}else{
   	   				locClass = locClassId;
   	   				locName = gCWWordDoc.documentElement.selectSingleNode("Record[CW_ID='" + loc[0].CLASS_NAME + "']").selectSingleNode("CW_NAME").text;
   	   			}
   	   			el("locationOptions").value=locName;
   	   			el("hidLocationOptionId").value=locClass;
   			}
		
		},
		onEditValid : function(id, obj) {
			return _checkFuncExist(id);
	    },
		onEditGet : function(id) {
		return {
			SYS_ID : id,
			SYS_CODE : el("txt_SysCode").value,
			SYS_NAME : el("txt_SysName").value,
			SYS_DESC : el("txt_sysDesc").value,
			STR_1 : el("hidBusTypeOptionId").value,
			STR_2 : el("hidUnitOptionId").value,
			STR_3 : el("hidLocationOptionId").value,
		};
		},
		onEditSuccess : function (obj){
			gDeviceCrud.search([[ "SYS_ID", obj.SYS_ID, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String ]]);
//			jetsennet.message("编辑成功！");
		},
		onRemoveValid : function(objs){
			var funcs = IPSDAO.queryObjs("commonXmlQuery", "SERVICE_ID", "DMA_WEBSERVICE", null, null, [ [ "SYS_ID", objs.join(","), jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.In, jetsennet.SqlParamType.String ] ], "SERVICE_ID");
		    if (funcs) {
		    	jetsennet.warn("该系统下有服务，请先删除服务！");
		    	return false;
		    }else return true;
		},
		onRemoveSuccess : function(ids){
//			jetsennet.message("删除成功！");
		}
	});
/**
 * 选中系统列表中的行事件
 */
gSysCrud.grid.onrowclick = function(item){
	sysRowsClick(item);
};	
/*===========================设备======================================================================================================================*/
	var deviceColumns = [{ fieldName: "SERVICE_ID", width: 30, align: "center", isCheck: 1, checkName: "chkDevice"},
	                     { fieldName: "SERVICE_NAME", sortField: "SERVICE_NAME", width: "10%", align: "center", name: "服务名称"},
	                     { fieldName: "SERVICE_CODE", sortField: "SERVICE_CODE", width: "6%", align: "center", name: "服务代号"},
	                     { fieldName: "INT_1", sortField: "INT_1", width: "10%", align: "center", name: "服务类型",format: function(val, vals){
	                        	var state;
	                         	switch(parseInt(val,10)){
	                         	  case 801:
	                         		 state="邮件下载";
	                         		  break;
	                         	  case 802:
	                         		 state="口令字下载";
	                         		  break;
	                         	  case 803:
	                         		 state="身份认证下载";
	                         		  break;
	                         	  case 80801:
	                         		 state="IP数据下载1";
	                         		  break;
	                         	 case 80802:
	                         		 state="IP数据下载2";
	                         		  break;
	                         	  case 809:
	                         		 state="摆渡机摆渡";
	                         		  break;
	                              default:
	                            	   state="未知-"+val;
	                                   break;
	                         	}
	                         	return state;
                         	}
                         },
                         { fieldName: "STATE", sortField: "STATE", width: "10%", align: "center", name: "服务状态",format: function(val, vals){
	                        	var state;
	                         	switch(parseInt(val,10)){
	                         	  case 0:
	                         		 state="未运行";
	                         		  break;
	                         	  case 1:
	                         		 state="停止";
	                         		  break;
	                         	  case 2:
	                         		 state="运行中";
	                         		  break;
	                         	  case 10:
	                         		 state="故障";
	                         		  break;
	                              default:
	                            	   state="未知-"+val;
	                                   break;
	                         	}
	                         	return state;
                         	}
                         },
                         { fieldName: "SERVICE_URL", sortField: "SERVICE_URL", width: "26%", align: "center", name: "通信地址"},
                         { fieldName: "CREATE_USER", sortField: "CREATE_USER", width: "7%", align: "center", name: "创建人"},
                         { fieldName: "CREATE_TIME", sortField: "CREATE_TIME", width: "13%", align: "center", name: "创建时间"},
                         { fieldName: "SERVICE_DESC", sortField: "SERVICE_DESC", width: "18%", align: "center", name: "服务描述"},
                         { fieldName: "SERVICE_ID", width: 45, align: "center", name: "编辑", format: function(val,vals){
                            return jetsennet.Crud.getEditCell("gDeviceCrud.edit('" + val + "')");
                         }},
                         { fieldName: "SERVICE_ID", width: 45, align: "center", name: "删除", format: function(val,vals){
                            return jetsennet.Crud.getDeleteCell("gDeviceCrud.remove('" + val + "')");
                         }}];
	var gDeviceCrud = $.extend(new jetsennet.Crud("divDeviceList", deviceColumns, "divDevicePage"), {
	    dao : IPSDAO,
	    keyId : "SERVICE_ID",
	    tableName : "DMA_WEBSERVICE",
	    name : "采集服务",
	    className : "jetsennet.jdma.schema.DmaWebservice",
	    cfgId : "divDeviceDialog",
	    checkId : "chkDevice",
	    addDlgOptions : {size : {width : 534, height :0}},
	    editDlgOptions : {size : {width : 534, height :0}},
	    onAddInit : function() {
	    	el("txt_DeviceToSys").value = sysObj.sysName;
	    },
	    onAddValid : function() {
	         return true;
	     },
	    onAddGet : function() {
	        return {
	        	SYS_ID : sysObj.sysId,
	        	SERVICE_NAME : el("txt_DeviceName").value,
	        	SERVICE_CODE : el("txt_DeviceCode").value,
	        	INT_1 : el("txt_SERVICE_TYPE").value,
	            STATE : 0,
	            SERVICE_URL : el("txt_ServiceUrl").value,
	            SERVICE_DESC : el("txt_DeviceDesc").value,
	 		   	CREATE_USER : jetsennet.application.userInfo.UserName,
	    		CREATE_USERID : jetsennet.application.userInfo.UserId
	        };
	    },
	    onAddSuccess : function(obj){
//	    	jetsennet.message("新建成功！");
//	    	gCWCrud.conditions = [[ "t.CW_TYPE", obj.CW_TYPE, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric ]];
	    },
	    onEditInit : function() {
	    	el("txt_DeviceToSys").value = sysObj.sysName;
	    },
	    onEditSet : function(obj) {
	    	el("txt_DeviceCode").value = obj.SERVICE_CODE;
	        el("txt_DeviceName").value = obj.SERVICE_NAME;
	        el("txt_ServiceUrl").value = obj.SERVICE_URL;
	        el("txt_DeviceDesc").value = obj.SERVICE_DESC;
	        el("txt_SERVICE_TYPE").value = obj.INT_1;
	    },
	    onEditValid : function(id, obj) {
	        return true;
	    },
	    onEditGet : function(id) {
	        return {
	        	SERVICE_ID : id,
	        	SERVICE_NAME : el("txt_DeviceName").value,
	        	SERVICE_CODE : el("txt_DeviceCode").value,
	        	SERVICE_URL : el("txt_ServiceUrl").value,
	        	SERVICE_DESC : el("txt_DeviceDesc").value,
	        	INT_1 : el("txt_SERVICE_TYPE").value
	        };
	    },
	    onEditSuccess : function (obj){
//			jetsennet.message("编辑成功！");
		},
		onRemoveSuccess : function(ids){
//			jetsennet.message("删除成功！");
		}
	});

/*gDeviceCrud.grid.oncontextmenu = function(objs){
	var menu = $.extend(new jetsennet.ui.Menu(), { menuWidth: 120 });
	menu.addItem($.extend(
		new jetsennet.ui.MenuItem("测试服务"), 
		{ 
			onclick: function () 
			{ 
				var obj ={
						SRC_CODE: objs.SYS_ID,
						MSG_TYPE : "http",
						DST_CODE:objs.SERVICE_ID,
						SysName:sysObj.sysName,
						DevName:objs.DEV_NAME,
						DST_URL:objs.SERVICE_URL	
						SRC_CODE: objs.SYS_ID,
//						MSG_TYPE : "http",
						DST_CODE:objs.SERVICE_CODE,
						SysName:sysObj.sysName,
						DevName:objs.SERVICE_NAME,
						REQUEST_TIME : new Date().toDateTimeString(),
						ACTION_NAME:objs.SERVICE_URL	
					};
					var params = new HashMap();
//				    params.put("className", "IpsCommmsg");
				    params.put("saveXml", jetsennet.xml.serialize(obj, "DMA_WEBINVOKE"));
				    var result = IPSDAO.execute("commonDeviceMessage", params);
				    if (result && result.errorCode == 0) {
				    	 jetsennet.message("通信成功！");
				    }
				}, 
			icon: "images/edit.png" 
		}));
	menu.render("divRightMenu").popup();
};*/


function pageInit() {
	
	/*jQuery("#divPageFrame").pageFrame({ 
		showSplit :false,minSize: { 
			width: 900, height: 0
			},splitType: 0,layout:[
				{size: {width : 320,height : 0},splitType: 1, layout: [35, 'auto']},
				{splitType: 1, layout: [
					{splitType: 1, layout: [35,'auto', 30]},
				 	{splitType: 1, layout: [35,'auto', 30]}
					]
				}
	]}).sizeBind(window);*/
	
	jetsennet.ui.DropDownList.initOptions("classTreeOptions", true);
	 jetsennet.ui.DropDownList.initOptions("busTypeOptionsType", true);
	 jetsennet.ui.DropDownList.initOptions("unitOptionsType", true);
	 jetsennet.ui.DropDownList.initOptions("locationOptionsType", true);
	 
	//加载数据源类别下拉框
	loadSelectType("classTreeOptions","20","-------------请选择分类类别------------");
	
	 //分类类别下拉框的onchanged事件
    jetsennet.ui.DropDownList["classTreeOptions"].onchanged= function (item){
   	 var val = item.value;
   	 if(val != "-1"){
   		 //加载该分类类别下所有子项
   		 loadSubClass(val);
   		 //创建采集分类树
   		 createClassTree(val,"divClassTree","loadCollecSys");
   	 }else{
   		 el("divClassTree").innerHTML="";
   		 el("divDeviceList").innerHTML="";
   		 el("divDevicePage").innerHTML="";
   		var conditions = [];
   	    conditions.push([ "SYS_TYPE", "200", jetsennet.SqlLogicType.Or, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String ]);
   	    gSysCrud.search(conditions);
   	 }
    };
	loadCWWord();
	var conditions = [];
    conditions.push([ "SYS_TYPE", "200", jetsennet.SqlLogicType.Or, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String ]);
    gSysCrud.search(conditions);
    var objItems =  gSysCrud.grid.objItems;
    if(objItems.length>0){
    	//默认选择行事件
    	sysRowsClick(objItems[0]);
        //默认渲染第一行
        gSysCrud.grid.selectRow(0);
    }
    
}

/**
 * 新增设备
 */
function addDevice(){
	
	if($.isEmptyObject(sysObj)){
		jetsennet.alert("请先选择服务所属采集系统！");
	}else gDeviceCrud.add();
	
}


/**
 * 点击树加载对应的采集系统
 * @param classId
 * @param className
 */
function loadCollecSys(classId,className){
	sysObj={};
	el("divCollecList").innerHTML="";
	el("divCollecPage").innerHTML="";
	el("divDeviceList").innerHTML="";
	el("divDevicePage").innerHTML="";
	
	var conditions = [];
    conditions.push([ "STR_1", classId, jetsennet.SqlLogicType.Or, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String ]);
    conditions.push([ "STR_2", classId, jetsennet.SqlLogicType.Or, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String ]);
    conditions.push([ "STR_3", classId, jetsennet.SqlLogicType.Or, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String ]);
    gSysCrud.search(conditions);
}

/**
 * 对新建-修改弹出框中的标签项类别以及类别对应树的加载
 */
function loadLables(){
	loadSelectType("busTypeOptionsType","20","-----请选择分类类别-----");
	loadSelectType("unitOptionsType","20","-----请选择分类类别-----");
	loadSelectType("locationOptionsType","20","-----请选择分类类别-----");
	
	//分类类别下拉框的onchanged事件
    jetsennet.ui.DropDownList["busTypeOptionsType"].onchanged= function (item){
    	var val = item.value;
   	 	if(val != "-1"){
	   		//加载该分类类别下所有子项
	   		loadSubClass(val);
	   		//创建数据源分类树
	   		createClassTree(val,"divSubTree1","setValueLable1");
   	 	}
    };
    //分类类别下拉框的onchanged事件
    jetsennet.ui.DropDownList["unitOptionsType"].onchanged= function (item){
    	var val = item.value;
   	 	if(val != "-1"){
	   		//加载该分类类别下所有子项
	   		loadSubClass(val);
	   		//创建数据源分类树
	   		createClassTree(val,"divSubTree2","setValueLable2");
   	 	}
    };
    //分类类别下拉框的onchanged事件
    jetsennet.ui.DropDownList["locationOptionsType"].onchanged= function (item){
    	var val = item.value;
   	 	if(val != "-1"){
	   		//加载该分类类别下所有子项
	   		loadSubClass(val);
	   		//创建数据源分类树
	   		createClassTree(val,"divSubTree3","setValueLable3");
   	 	}
    };
}

/**
 * 新建-修改 点击tree时 输入框 赋值
 * @param id 树ID
 * @param name 树Name
 */
function setValueLable1(id,name){
	el("hidBusTypeOptionId").value=id;
	el("busTypeOptions").value=name;
}

/**
 * 新建-修改 点击tree时 输入框 赋值
 * @param id 树ID
 * @param name 树Name
 */
function setValueLable2(id,name){
	el("hidUnitOptionId").value=id;
	el("unitOptions").value=name;
	
}

/**
 * 新建-修改 点击tree时 输入框 赋值
 * @param id 树ID
 * @param name 树Name
 */
function setValueLable3(id,name){
	el("hidLocationOptionId").value=id;
	el("locationOptions").value=name;
}

/**
 * 验证系统编号是否重复
 * @returns {Boolean}
 */
function _checkFuncExist(id){
    var conditions=[];
	if(typeof(id) != "undefined"){
		conditions.push([ "t.SYS_ID", id, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.NotEqual, jetsennet.SqlParamType.String ]);
	}
	var subConditions = [];
	subConditions.push([ [ "SYS_CODE", el("txt_SysCode").value, jetsennet.SqlLogicType.Or, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String ],
	                     [ "SYS_NAME", el("txt_SysName").value, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String ]
	                    ]);
	var funcs = IPSDAO.queryObjs("commonXmlQuery", "SYS_ID", "DMA_APPSYSTEM", null, null,conditions, "SYS_ID",null,null,subConditions);
    if (funcs) {
    	jetsennet.warn("该系统名称或者代号已被使用！");
    	return false;
    }else return true;
}

/**
 *默认选中系统列表的行
 * @param item
 */
function sysRowsClick(item){
	sysObj.sysId = item.SYS_ID;
	sysObj.sysName = item.SYS_NAME;
	
	var conditions = [];
	conditions.push([ "SYS_ID", item.SYS_ID, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String ]);
	gDeviceCrud.search(conditions);
}

