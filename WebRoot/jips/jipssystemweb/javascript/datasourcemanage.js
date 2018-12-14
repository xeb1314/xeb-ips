jetsennet.require([ "pagebar","pageframe", "window", "bootstrap/moment",
                    "bootstrap/daterangepicker","autocomplete", "datepicker","jetsentree","ztree/jquery.ztree.all-3.5", "ztree/jztree"]);
jetsennet.importCss("bootstrap/daterangepicker-bs3");
jetsennet.importCss("ztree/zTreeStyle");

/**
 * 页面初始化
 */
function pageInit() {
	/* jQuery("#divPageFrame").
	 	pageFrame({ 
	 		showSplit :false,
	 	//	minSize: { width: bodyWidth>1100?1100:bodyWidth, height: 300},
	 		layout : [ 300, {splitType: 1, layout : [  200, 42, "auto" , 35]} ]
//	 		layout : [ 300, {splitType: 1, layout : [  200, {splitType: 1, layout : [50, "auto" , 35]}]} ]
	 	}).sizeBind(window);*/
	 
	 jQuery("#txtStartTime").pickDate();
 	 jQuery("#txtEndTime").pickDate();
	 gLastWeekDate = new Date(gCurDate.getTime() - 6 * 24 * 3600 * 1000);
     /*el('txtStartTime').value = gLastWeekDate.toDateString();
     el('txtEndTime').value = gCurDate.toDateString();*/
     
     jQuery("input[name='chkState'][value='-1']").click(function () {
         var checked = this.checked;
         jQuery("input[name='chkState'][value!='-1']").each(function () { this.checked = checked; });
     });
     jQuery("input[name='chkState'][value!='-1']").click(function () {
         jQuery("input[name='chkState'][value='-1']").attr("checked", false);
     });
	 
	 jetsennet.ui.DropDownList.initOptions("dataManageOptions", true);
	 //加载数据源类别下拉框
	 loadSelectType("dataManageOptions","10","-------------请选择分类类别------------");
	 
	 //分类类别下拉框的onchanged事件
     jetsennet.ui.DropDownList["dataManageOptions"].onchanged= function (item){
    	 var val = item.value;
    	 if(val != "-1"){
    		 //加载该分类类别下所有子项
    		 loadSubClass(val);
    		 //创建数据源分类树
    		 createClassTree(val,"divDataSourceTree","loadDataSource");
    	 }else{
    		 el("divDataSourceTree").innerHTML="";
    		 el("divDataSourceList").innerHTML="";
    		 el("divDataSourcePage").innerHTML="";
    	 }
     };
	 
	 //访问方式
	 jetsennet.ui.DropDownList.initOptions("lableSelectDSType", true);
	 jetsennet.ui.DropDownList.initOptions("lableSelectState", true);
	 
     //加载数据字典所有的项
     loadCWWord();
     //如果是系统管理员角色查询所有数据源
     if(isSystem()){
    	 gDataSourceCrud.load();
     }else{
    	var condition = [];
   		condition.push(["a.GROUP_ID", queryGroupIdByUserId(), jetsennet.SqlLogicType.Or, jetsennet.SqlRelationType.In]);
  		condition.push(["d.STATE", "0", jetsennet.SqlLogicType.Or, jetsennet.SqlRelationType.In]);
  		gDataSourceCrud.search(condition);
    	 
     }
 	
};

/**
 * 检索数据源
 */
function searchDataSource(){
    el('divDataSourceList').innerHTML = "";
    el('divDataSourcePage').innerHTML = "";
    
    var conditions = [];
    if(illegalityTime(el("txtStartTime").value, el("txtEndTime").value)){
		return;
	}
    var name = el('txtNameQuery').value.replace(/\s/ig,'');
    if (name) {
    	conditions.push(["d.DS_NAME", name, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Like]);
    }
    if (el('txtStartTime').value != "") {
    	conditions.push(["d.CREATE_TIME", el('txtStartTime').value + " 00:00:00", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Than, jetsennet.SqlParamType.DateTime]);
    }
    if (el('txtEndTime').value != "") {
    	conditions.push(["d.CREATE_TIME", el('txtEndTime').value + " 23:59:59", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Less, jetsennet.SqlParamType.DateTime]);
    }
    var param = el('txtPathQuery').value.replace(/\s/ig,'');
    if (param) {
    	conditions.push(["d.STR_1", param, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Like]);
    }
    var stateVal = jetsennet.form.getCheckedValues("chkState");
    //如果是系统管理员角色查询所有数据源
    if(isSystem()){
    	 if (stateVal != "") {
    		 conditions.push(["d.STATE", stateVal, jetsennet.SqlLogicType.Or, jetsennet.SqlRelationType.In, jetsennet.SqlParamType.Numeric]);
    	 }else{
    		 conditions.push(["d.STATE", -1, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.In, jetsennet.SqlParamType.Numeric]); 
    	 }
    }else{
    	if (stateVal != ""){
	        var stateIndex = stateVal.indexOf("1");
	    	if(stateIndex != -1){
	    		stateVal.splice(stateIndex,1);
	    		conditions.push(["a.GROUP_ID", queryGroupIdByUserId(), jetsennet.SqlLogicType.Or, jetsennet.SqlRelationType.In]);
	    	}
			conditions.push(["d.STATE", stateVal, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.In, jetsennet.SqlParamType.Numeric]);
    	}else{
    		conditions.push(["d.STATE", -1, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.In, jetsennet.SqlParamType.Numeric]);
    	}
    }
    gDataSourceCrud.search(conditions);
};
