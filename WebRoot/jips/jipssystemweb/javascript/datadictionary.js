jetsennet.require(["pageframe", "window", "gridlist", "pagebar","autocomplete","bootstrap/daterangepicker", "crud","bootstrap/moment","datepicker"]);
jetsennet.importCss("bootstrap/daterangepicker-bs3");	

var gCurDate = new Date();
var gLastWeekDate;
/*//删除用的当前子项
var subIds = [];*/
//删除所有项的ID集合
var dicIds = [];
/*===========================数据字典类别======================================================================================================================*/
	var typeColumns = [{ fieldName: "CW_ID", width: 30, align: "center", isCheck: 1, checkName: "chkType"},
	               { fieldName: "CW_CODE", sortField: "CW_CODE", width: "10%", align: "center", name: "字典码"},
	               { fieldName: "CW_NAME", sortField: "CW_NAME", width: "15%", align: "center", name: "名称"},
	               { fieldName: "STR_1", sortField: "STR_1", width: "10%", align: "center", name: "类别标识"},
	               { fieldName: "CW_DESC", sortField: "CW_DESC", width: "45%", align: "center", name: "描述"},
	               { fieldName: "CREATE_USER", sortField: "CREATE_USER", width: "10%", align: "center", name: "创建用户"},
                   { fieldName: "CREATE_TIME", sortField: "CREATE_TIME", width: "10%", align: "center", name: "创建时间"},
	               { fieldName: "CW_ID", width: 45, align: "center", name: "编辑", format: function(val,vals){
	                   return jetsennet.Crud.getEditCell("gTypeCrud.edit('" + val + "')");
	               }},
	               { fieldName: "CW_ID", width: 45, align: "center", name: "删除", format: function(val,vals){
	                   return jetsennet.Crud.getDeleteCell("gTypeCrud.remove('" + val + "')");
	               }}];
	var gTypeCrud = $.extend(new jetsennet.Crud("divDataDictionaryTypeList", typeColumns, "divDataDictionaryTypePage","ORDER BY CREATE_TIME DESC"), {
		dao : IPSDAO,
		keyId : "CW_ID",
		tableName : "IPS_CTRLWORD",
//		insertMethodName : "commonCtrlWrodInsert",
		name : "数据字典类别",
		className : "jetsennet.ips.schema.IpsCtrlword",
		cfgId : "divCtrlwordType",
		checkId : "chkType",
		onAddInit : function() {
		},
		onAddValid : function() {
			return validateCtrlWordType();
	     },
		onAddGet : function() {
		return {
		   CW_TYPE : -1,
		   CW_NAME : el("txt_CTRLWORD_TYPE_NAME").value,
		   STR_1 : el("txt_CTRLWORD_COLUMN").value,
		   CW_DESC : el("txt_DESCRIPTION_TYPE").value,
		   CW_CODE : el("txt_CTRLWORD_CODE_TYPE").value,
		   CREATE_USER : jetsennet.application.userInfo.UserName,
   		   CREATE_USERID : jetsennet.application.userInfo.UserId
		};
		},
		onAddSuccess : function(obj){
			loadCtrlWordType("ctrlWordOptions","------请选择数据字典类别------");
	    },
		onEditInit : function() {
		},
		onEditSet : function(obj) {
		el("txt_CTRLWORD_TYPE_NAME").value = obj.CW_NAME;
		el("txt_CTRLWORD_COLUMN").value = obj.STR_1;
		el("txt_DESCRIPTION_TYPE").value = obj.CW_DESC;
		el("txt_CTRLWORD_CODE_TYPE").value = obj.CW_CODE;
		},
		onEditValid : function(id, obj) {
	        return validateCtrlWordType(id);
	    },
		onEditGet : function(id) {
		return {
		   CW_ID : id,
		   CW_CODE : el("txt_CTRLWORD_CODE_TYPE").value,
		   CW_NAME: el("txt_CTRLWORD_TYPE_NAME").value,
		   STR_1 : el("txt_CTRLWORD_COLUMN").value,
		   CW_DESC: el("txt_DESCRIPTION_TYPE").value
		};
		},
		onEditSuccess : function(obj){
			loadCtrlWordType("ctrlWordOptions","------请选择数据字典类别------");
		},
		directRemove : function(ids) {
			var sResult = IPSDAO.query("commonXmlQuery", "CW_ID", "IPS_CTRLWORD", null, null, [[ "t.CW_ID", ids, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal ]], "CW_CODE");
			var obj = jetsennet.xml.toObject(sResult.resultVal, "Record");
			var ssResult = IPSDAO.query("commonXmlQuery", "CW_ID", "IPS_CTRLWORD", null, null, [[ "t.CW_TYPE", obj[0].CW_CODE, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric ]], "CW_TYPE");
			var object = jetsennet.xml.toObject(ssResult.resultVal, "Record");
			if($.isEmptyObject(object)){
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
			}else{
			    jetsennet.alert("请先删除子类!");
			}
			return true;
		},
		onRemoveSuccess : function(ids){
			loadCtrlWordType("ctrlWordOptions","------请选择数据字典类别------");
		}
	});

/*===========================数据字典======================================================================================================================*/
	var columns = [{ fieldName: "CW_ID", width: 30, align: "center", isCheck: 1, checkName: "chkWord"},
	                        { fieldName: "CW_CODE", sortField: "CW_CODE", width: "10%", align: "center", name: "字典码"},
	                        { fieldName: "CW_NAME", sortField: "CW_NAME", width: "15%", align: "center", name: "名称"},
	                        { fieldName: "CW_DESC", sortField: "CW_DESC", width: "55%", align: "center", name: "描述"},
	                        { fieldName: "CREATE_USER", sortField: "CREATE_USER", width: "10%", align: "center", name: "创建用户"},
	                        { fieldName: "CREATE_TIME", sortField: "CREATE_TIME", width: "10%", align: "center", name: "创建时间"},
	                        { fieldName: "CW_ID", width: 45, align: "center", name: "编辑", format: function(val,vals){
	                            return jetsennet.Crud.getEditCell("gCWCrud.edit('" + val + "')");
	                        }},
	                        { fieldName: "CW_ID", width: 45, align: "center", name: "删除", format: function(val,vals){
	                            return jetsennet.Crud.getDeleteCell("gCWCrud.remove('" + val + "')");
	                        }}];
	var gCWCrud = $.extend(new jetsennet.Crud("divDataDictionaryList", columns, "divDataDictionaryPage", "ORDER BY CREATE_TIME DESC"), {
	    dao : IPSDAO,
	    keyId : "CW_ID",
	    tableName : "IPS_CTRLWORD",
//	    insertMethodName : "commonCtrlWrodInsert",
	    name : "数据字典",
	    className : "jetsennet.ips.schema.IpsCtrlword",
	    cfgId : "divCtrlword",
	    checkId : "chkWord",
	    onAddInit : function() {
	    	loadCtrlWordType("ctrlWordTypes","------请选择数据字典类别------");
	    	selectOptionsName("ctrlWordTypes",jetsennet.ui.DropDownList["ctrlWordOptions"].selectedValue);
	    },
	    onAddValid : function() {
	        return validateCtrlWord();
	    },
	    onAddGet : function() {
	        return {
	        	CW_TYPE: jetsennet.ui.DropDownList["ctrlWordTypes"].selectedValue,
	            CW_NAME: el("txt_CTRLWORD_NAME").value,
	            CW_DESC: el("txt_DESCRIPTION").value,
	            CW_CODE : el("txt_CTRLWORD_CODE").value,
	 		   	CREATE_USER : jetsennet.application.userInfo.UserName,
	    		CREATE_USERID : jetsennet.application.userInfo.UserId
	        };
	    },
	    onAddSuccess : function(obj){
	    	gCWCrud.conditions = [[ "t.CW_TYPE", obj.CW_TYPE, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric ]];
	    },
	    onEditInit : function() {
	    	loadCtrlWordType("ctrlWordTypes","------请选择数据字典类别------");
	    },
	    onEditSet : function(obj) {
	    	selectOptionsName("ctrlWordTypes",obj.CW_TYPE);
	        el("txt_CTRLWORD_NAME").value = obj.CW_NAME;
	        el("txt_DESCRIPTION").value = obj.CW_DESC;
	        el("txt_CTRLWORD_CODE").value = obj.CW_CODE;
	    },
	    onEditValid : function(id, obj) {
	    	return validateCtrlWord(id);
	    },
	    onEditGet : function(id) {
	        return {
	            CW_ID : id,
	            CW_CODE : el("txt_CTRLWORD_CODE").value,
	            CW_TYPE : jetsennet.ui.DropDownList["ctrlWordTypes"].selectedValue,
	            CW_NAME: el("txt_CTRLWORD_NAME").value,
	            CW_DESC: el("txt_DESCRIPTION").value,
	        };
	    },
	    onEditSuccess : function(obj){
//			loadCtrlWordType("ctrlWordOptions","------请选择数据字典类别------");
	    	gCWCrud.conditions = [[ "t.CW_TYPE", obj.CW_TYPE, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric ]];
		}
	});

/**
 * 页面初始化
 */
function pageInit() {
//	jQuery("#divPageFrame").pageFrame({showSplit :false,splitType: 1,layout:[130,45, "auto", 35]}).sizeBind(window);
	//初始化查询条
	jQuery("#txtStartTime").pickDate();
	jQuery("#txtEndTime").pickDate();
	/*gLastWeekDate = new Date(gCurDate.getTime() - 6 * 24 * 3600 * 1000);
    el('txtStartTime').value = gLastWeekDate.toDateString();
    el('txtEndTime').value = gCurDate.toDateString();*/
    
	jetsennet.ui.DropDownList.initOptions("ctrlWordOptions", true);
	jetsennet.ui.DropDownList.initOptions("ctrlWordTypes", true);
	jetsennet.ui.DropDownList["ctrlWordOptions"].onchanged= function (item){
   	 var val = item.value;
   	 if(val != "-1"){
   		el("divDataDictionaryTypeList").style.display = "none";
   		el("divDataDictionaryTypePage").style.display = "none";
   		el("divDataDictionaryList").style.display = "";
   		el("divDataDictionaryPage").style.display = "";
   		
   		gCWCrud.conditions = [[ "t.CW_TYPE", val, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric ]];
   		gCWCrud.load();
   	 }else{
   		el("divDataDictionaryTypeList").style.display = "";
   		el("divDataDictionaryTypePage").style.display = "";
   		el("divDataDictionaryList").style.display = "none";
   		el("divDataDictionaryPage").style.display = "none";
   	 }
    };
    
    gTypeCrud.search([[ "t.CW_TYPE", "-1", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric ]]);
    loadCtrlWordType("ctrlWordOptions","------请选择数据字典类别------");
}

/**
 * 根据条件查询字典
 */
function searchDic(){
	el("divDataDictionaryTypeList").style.display = "none";
	el("divDataDictionaryTypePage").style.display = "none";
	el("divDataDictionaryList").style.display = "";
	el("divDataDictionaryPage").style.display = "";
	var conditions = [];
    
    if (el("txtStartTime").value != '') {
    	conditions.push(["CREATE_TIME", el("txtStartTime").value + " 00:00:00", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.ThanEqual, jetsennet.SqlParamType.DateTime]);						
    }
    if (el("txtEndTime").value != '') {
    	conditions.push(["CREATE_TIME", el("txtEndTime").value + " 23:59:59", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.LessEqual, jetsennet.SqlParamType.DateTime]);						
    }
    if (el("txtKeyWord").value != '') {
    	conditions.push(["CW_NAME", el("txtKeyWord").value , jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Like]);						
    }
    gCWCrud.search(conditions);
}


/**
 * 添加数据字典类别
 */
function addDataDictionary(){
	if(jetsennet.ui.DropDownList["ctrlWordOptions"].selectedValue == "-1"){
		jetsennet.alert("请先请选择数据字典类别！");
	   	 return;
	 }
	gCWCrud.add();
}

/**
 *根据下拉框的id找到name并赋值
 * @param divId
 */
function selectOptionsName(divId,id){
	var stateItem = jetsennet.ui.DropDownList[divId].dataItems;
	for(var h=0;h<stateItem.length;h++){
		if(stateItem[h].value == id){
			el(divId).value = stateItem[h].text;
			jetsennet.ui.DropDownList[divId].selectedValue = stateItem[h].value;
		}
	}
}
/**
 * 查询列表
 */
function searchWord() {
    var conditions = [];
    if (el('ddl_Type').value != "") {
        conditions.push([ "t.CW_TYPE", el("ddl_Type").value, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric ]);
    }
    gCWCrud.search(conditions);
}

/**
 * 加载数据字典类别
 */
function loadCtrlWordType(divId,textName) {
    var conditions = [];
    conditions.push(["CW_TYPE", "-1", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
    var sResult = WFMDAO.query("commonXmlQuery", "CW_ID", "IPS_CTRLWORD", null, null,conditions, "CW_ID,CW_NAME,CW_CODE,CW_DESC");
    var objs = jetsennet.xml.toObject(sResult.resultVal, "Record");
    
    jetsennet.ui.DropDownList[divId].clear();
    jetsennet.ui.DropDownList[divId].appendItem({ text: textName, value: -1 });
    gClassTypeNames = {};
    if (objs && objs.length > 0) {
        for (var i = 0; i < objs.length; i++) {
            jetsennet.ui.DropDownList[divId].appendItem({ text: objs[i].CW_NAME, value: objs[i].CW_CODE });
        }
        jetsennet.ui.DropDownList[divId].setSelectedIndex(0);
    }
    
    /*if (objs && objs.length > 0) {
        for (var i = 0; i < objs.length; i++) {
        	jQuery("<option>"+objs[i].CW_NAME+"</option>", {}).attr("value", objs[i].CW_CODE).appendTo($("#ddl_Type"));
        	jQuery("<option>"+objs[i].CW_NAME+"</option>", {}).attr("value", objs[i].CW_CODE).appendTo($("#ddl_CTRLWORD_TYPE"));
        }
    }*/
}

/**
 * 删除数据字典类别
 */
function deleteDicType(){
	dicIds = [];
	jetsennet.confirm("确定删除?", function () {
		var ids = jetsennet.form.getCheckedValues("chkType");
		if(ids != ""){
			for(var i=0;i<ids.length;i++){
				var id = ids[i];
				dicIds.push(id);
				var objs = IPSDAO.queryObjs("commonXmlQuery", "CW_ID", "IPS_CTRLWORD", null, null, [ [ "CW_ID", id, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.In, jetsennet.SqlParamType.String ] ], "CW_CODE");
				if(objs){
					deleteDicAll(objs[0].CW_CODE);
				 }
				
			};
			var params = new HashMap();
		    params.put("className", "jetsennet.ips.schema.IpsCtrlword");
		    params.put("deleteIds", dicIds.join(","));
		    var result = IPSDAO.execute("commonObjDelete", params);
		    if (result && result.errorCode == 0) {
		    	jetsennet.message("删除成功！");
		    	loadCtrlWordType("ctrlWordOptions","------请选择数据字典类别------");
		        if(jetsennet.ui.DropDownList["ctrlWordOptions"].selectedValue != "-1"){
		        	 gCWCrud.load();
		        }else{
			        gTypeCrud.conditions = [[ "t.CW_TYPE", "-1", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric ]];
			        gTypeCrud.load();
		        };
		    };
		}else{
			jetsennet.warn("请您勾选字典类别！");
		}
		return true;
    });
}

/**
 * 删除数据字典
 */
function deleteDic(){
	/*if(idType == "" && ids == ""){
		jetsennet.warn("请您勾选字典！");
		return;
	};*/
	//分开判断是否选中 防止历史勾选的记录也被删掉
	var dicTypeDisplay = el("divDataDictionaryTypeList").style.display;
	if(dicTypeDisplay == "none"){
		jetsennet.form.uncheckAllItems("chkType");
	}
	var dicDisplay = el("divDataDictionaryList").style.display;
	if(dicDisplay == "none"){
		jetsennet.form.uncheckAllItems("chkWord");
	}
	var idType = jetsennet.form.getCheckedValues("chkType");
	var ids = jetsennet.form.getCheckedValues("chkWord");
	if(idType == "" && ids == ""){
		jetsennet.warn("请您勾选字典！");
		return;
	};
	jetsennet.confirm("确定删除?", function () {
//		var ids = jetsennet.form.getCheckedValues("chkWord");
		if(ids != ""){
			var params = new HashMap();
		    params.put("className", "jetsennet.ips.schema.IpsCtrlword");
		    params.put("deleteIds", ids.join(","));
		    var result = IPSDAO.execute("commonObjDelete", params);
		    if (result && result.errorCode == 0) {
		    	gCWCrud.conditions = [[ "t.CW_TYPE", jetsennet.ui.DropDownList["ctrlWordOptions"].selectedValue, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric ]];
		   		gCWCrud.load();
		   		jetsennet.form.uncheckAllItems("chkWord");
		    };
		}
		if(idType != ""){
			for(var i=0;i<idType.length;i++){
				var id = idType[i];
				dicIds.push(id);
				var objs = IPSDAO.queryObjs("commonXmlQuery", "CW_ID", "IPS_CTRLWORD", null, null, [ [ "CW_ID", id, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.In, jetsennet.SqlParamType.String ] ], "CW_CODE");
				if(objs){
					deleteDicAll(objs[0].CW_CODE);
				 }
				
			};
			var params = new HashMap();
		    params.put("className", "jetsennet.ips.schema.IpsCtrlword");
		    params.put("deleteIds", dicIds.join(","));
		    var result = IPSDAO.execute("commonObjDelete", params);
		    if (result && result.errorCode == 0) {
		    	jetsennet.message("删除成功！");
		    	loadCtrlWordType("ctrlWordOptions","------请选择数据字典类别------");
		        
		        gTypeCrud.conditions = [[ "t.CW_TYPE", "-1", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric ]];
		        gTypeCrud.load();
		        jetsennet.form.uncheckAllItems("chkType");
		    };
		}
		return true;
    });
}

/**
 * 级联删除中所有的subId项
 */
function deleteDicAll(subIds){
	 var objs = IPSDAO.queryObjs("commonXmlQuery", "CW_ID", "IPS_CTRLWORD", null, null, [ [ "CW_TYPE", subIds, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.In, jetsennet.SqlParamType.String ] ], "CW_ID");
	 if(objs){
		 for (var i = 0; i < objs.length; i++) {
			dicIds.push(objs[i].CW_ID);
	     }
     }
}

/**
 * 数据字典类别的验证
 * @param id
 * @returns {Boolean}
 */
function validateCtrlWordType(id){
	var nameRepeat = false;
	var codeRepeat = false;
	var conditions = [];
	var cwName = el("txt_CTRLWORD_TYPE_NAME").value;
	var cwCode = el("txt_CTRLWORD_CODE_TYPE").value;
	if(typeof(id) != "undefined"){
		conditions.push([ "CW_ID", id, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.NotEqual, jetsennet.SqlParamType.String ]);
	}
	var subConditions = [];
	subConditions.push([ "CW_NAME", cwName, jetsennet.SqlLogicType.Or, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String ]);
	subConditions.push([ "CW_CODE", cwCode, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric ]);
	var objs = IPSDAO.queryObjs("commonXmlQuery", "CW_ID", "IPS_CTRLWORD", null, null, conditions, "CW_ID,CW_NAME,CW_CODE",null,null,subConditions);
	if(objs){
		for(var i=0;i<objs.length;i++){
			if(cwName == objs[i].CW_NAME){
				el("txt_CTRLWORD_TYPE_NAME").style.border="1px #936 solid";
				nameRepeat = true;
			}
			if(cwCode == objs[i].CW_CODE){
				el("txt_CTRLWORD_CODE_TYPE").style.border="1px #936 solid";
				codeRepeat = true;
			}
		}
		if(nameRepeat){
			jetsennet.message("该名称已存在，请您重新输入！",{reference:el("txt_CTRLWORD_TYPE_NAME"),position:3});
		}
    	if(codeRepeat){
    		jetsennet.message("该编号已存在，请您重新输入！",{reference:el("txt_CTRLWORD_CODE_TYPE"),position:3});
    	}
    	
	}else{
		el("txt_CTRLWORD_CODE_TYPE").style.border="1px #CCC solid";
		el("txt_CTRLWORD_TYPE_NAME").style.border="1px #CCC solid";
	};
	return !nameRepeat && !codeRepeat;
}

/**
 * 数据字典的验证
 * @param id
 * @returns {Boolean}
 */
function validateCtrlWord(id){
	var nameRepeat = false;
	var codeRepeat = false;
	var conditions = [];
	var cwName = el("txt_CTRLWORD_NAME").value;
	var cwCode = el("txt_CTRLWORD_CODE").value;
	if(typeof(id) != "undefined"){
		conditions.push([ "CW_ID", id, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.NotEqual, jetsennet.SqlParamType.String ]);
	}
	var subConditions = [];
	subConditions.push([ "CW_NAME", cwName, jetsennet.SqlLogicType.Or, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String ]);
	subConditions.push([ "CW_CODE", cwCode, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric ]);
	var objs = IPSDAO.queryObjs("commonXmlQuery", "CW_ID", "IPS_CTRLWORD", null, null, conditions, "CW_ID,CW_NAME,CW_CODE",null,null,subConditions);
	if(objs){
		for(var i=0;i<objs.length;i++){
			if(cwName == objs[i].CW_NAME){
				el("txt_CTRLWORD_NAME").style.border="1px #936 solid";
				nameRepeat = true;
			}
			if(cwCode == objs[i].CW_CODE){
				el("txt_CTRLWORD_CODE").style.border="1px #936 solid";
				codeRepeat = true;
			}
		}
		if(nameRepeat){
			jetsennet.message("该名称已存在，请您重新输入！",{reference:el("txt_CTRLWORD_NAME"),position:3});
		}
    	if(codeRepeat){
    		jetsennet.message("该编号已存在，请您重新输入！",{reference:el("txt_CTRLWORD_CODE"),position:3});
    	}
    	
	}else{
		el("txt_CTRLWORD_CODE").style.border="1px #CCC solid";
		el("txt_CTRLWORD_NAME").style.border="1px #CCC solid";
	};
	return !nameRepeat && !codeRepeat;
}


