jetsennet.require([ "pagebar","pageframe", "window", "bootstrap/moment",
                    "bootstrap/daterangepicker","autocomplete", "datepicker","jetsentree"]);
jetsennet.importCss("bootstrap/daterangepicker-bs3");
	
	//所有分类类别的名字
	var gClassTypeNames;
	//所有分类类别下的叶子节点
	var gSubClassDoc = new jetsennet.XmlDoc();
	//所有当前节点下的叶子节点
	var gSubClassItemDoc = new jetsennet.XmlDoc();
	//当前的分类类别的ID
	var gType;
	//所有数据字典的项
	var gCWWordDoc = new jetsennet.XmlDoc();
	//父类的名字
	var pName;
	//当前的分类对象
	var classObjJosn={};
	//分类树对象
	var gClassTypeTree;
	//当前分类的子节点列表
	var parentId = [];
	//需要删除的所有分类ID
	var classIds = [];
	var subId;
	//选中左侧树的ID
	var pId;

/**
 * 页面初始化
 */
function pageInit() {
	 /*jQuery("#divPageFrame").
	 	pageFrame({ 
	 		showSplit :false,
	 	//	minSize: { width: bodyWidth>1100?1100:bodyWidth, height: 300},
	 		splitType: 1,
	 		layout: [40, {layout : [ 200, {splitType: 1, layout : [  35, "auto" ,35]} ]} ]
	 	
	 	}).sizeBind(window);*/
	 
	 jetsennet.ui.DropDownList.initOptions("sysClassOptions", true);
     jetsennet.ui.DropDownList.initOptions("ctrlClassOptions", true);
     
     //加载系统级的分类类别下拉框
     loadSysClassType();
   //给新建分类时弹出框的数据字典赋值 
	 setValueCWWord();
	 //加载数据字典的所有项
	 loadCWWord();
	 
     //系统级分类下拉框的onchanged事件
     jetsennet.ui.DropDownList["sysClassOptions"].onchanged= function (item){
    	 var value = item.value;
    	 var classTypeConditions = [];
    	 	classTypeConditions.push(["t.CLASS_TYPE", "-1", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
    	 	classTypeConditions.push(["t.PARENT_ID", value, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
    	 if(value != "-1"){
    		 el("divClassSelect").style.display="";
        	 el("divSysClassList").style.display="none";
             el("divSysClassPage").style.display="none";
        	 el("divClassTypeList").style.display="";
             el("divClassTypePage").style.display="";
             el("divClassList").style.display="none";
             el("divClassPage").style.display="none";
             el("divTree").innerHTML="";
             el("ctrlClassOptions").innerHTML="";
             el("divClassTypeList").innerHTML="";
             el("divClassTypePage").innerHTML="";
             
             //加载二级下拉框的分类类别
        	 loadCtrlClassType(value);
        	 
        	//分类类别下拉框的onchanged事件
             jetsennet.ui.DropDownList["ctrlClassOptions"].onchanged= function (item){
            	 pName=item.text;
            	 var val = item.value;
            	 //加载该分类类别下的所有子项
            	 loadSubClass(val);
            	 
            	 if(val != "-1"){
            		 el("divSysClassList").style.display="none";
                     el("divSysClassPage").style.display="none";
                	 el("divClassTypeList").style.display="none";
                     el("divClassTypePage").style.display="none";
                     el("divClassList").style.display="";
                     el("divClassPage").style.display="";
                     el("divClassPage").innerHTML="";
                     el("divClassList").innerHTML="";
            		 createClassTree(val,"divTree","clickeTreeItem");
            		//选择分类类别默认加载grid
            		 var conditions = [];
            		    conditions.push([ "CLASS_TYPE", val, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric ]);
            		    conditions.push([ "PARENT_ID", "0", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal]);
            		    conditions.push([ "OBJ_TYPE", 0, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal,jetsennet.SqlParamType.Numeric]);
            		 gSubClassCrud.search(conditions);
            		 
            		 //创建 新建-修改 弹出框的树
            		 createDialogTree(jetsennet.ui.DropDownList["ctrlClassOptions"].selectedValue,"divSubTree","dialogSetValue");
            	 }else{
            		 el("divSysClassList").style.display="none";
                     el("divSysClassPage").style.display="none";
                	 el("divClassTypeList").style.display="";
                     el("divClassTypePage").style.display="";
                     el("divClassList").style.display="none";
                     el("divClassPage").style.display="none";
                     el("divTree").innerHTML="";
                     el("divClassTypeList").innerHTML="";
                     el("divClassTypePage").innerHTML="";
            		 gClassTypeCrud.search(classTypeConditions);
            	 }
             };
             gClassTypeCrud.search(classTypeConditions);
    	 }else{
	    	 el("divClassSelect").style.display="none";
	    	 el("divClassTypeList").style.display="none";
             el("divClassTypePage").style.display="none";
	    	 el("divSysClassList").style.display="";
		     el("divSysClassPage").style.display="";
		     el("divClassList").style.display="none";
             el("divClassPage").style.display="none";
             el("divTree").innerHTML="";
             el("divSysClassList").innerHTML="";
             el("divSysClassPage").innerHTML="";
		     gSysClassCrud.load();
    	 }
     };
     
     el("divSysClassList").style.display="";
     el("divSysClassPage").style.display="";
     el("divClassTypeList").style.display="none";
     el("divClassTypePage").style.display="none";
     el("divClassList").style.display="none";
     el("divClassPage").style.display="none";
     el("divTree").innerHTML="";
     el("divSysClassList").innerHTML="";
     el("divSysClassPage").innerHTML="";
     
     gSysClassCrud.load();
};

/**
 *给新建分类时弹出框的数据字典赋值 
 */
function setValueCWWord(){
	 //加载数据字典类别以及名称下拉列表
    jetsennet.ui.DropDownList.initOptions("cw_Word_Type", true);
    jetsennet.ui.DropDownList.initOptions("cw_Word_Name", true);
    jetsennet.ui.DropDownList["cw_Word_Type"].onchanged = function (item) {
     	jetsennet.ui.DropDownList["cw_Word_Name"].clear();
     	if(item.value == "-1"){
     		return;
     	}
     	el( "cw_Word_Name").style.display= "";
     	loadCtrlWord("cw_Word_Name",item.code);
     };
     loadCtrlWord("cw_Word_Type");
//	    el( "cw_Word_Name").style.display= "";
    
    jetsennet.ui.DropDownList["cw_Word_Name"].onchanged = function (item) {
     	if(item.value == "-1"){
//	     		el( "ddlDataClassName2").style.display= "none";
     		return;
     	}
     	el("ctrlWordCode").value=item.code;
     };
}

/*================================系统分类GridList====================================================================================================================*/
	var gSysClassColumns = [ 
	                         { fieldName: "CLASS_ID", width: 30, align: "center", isCheck: 1, checkName: "chkSysClass"},
	                         { fieldName: "CLASS_TYPE", sortField: "CLASS_TYPE", width:100, align: "center", name: "系统编号"},
	                         { fieldName: "CLASS_NAME", sortField: "CLASS_NAME", width:"100%", align: "center", name: "名称"},
	                         { fieldName: "CLASS_DESC", sortField: "CLASS_DESC", width:200, align: "center", name: "描述"},
	                         { fieldName: "CLASS_ID", width: 45, align: "center", name: "编辑", format: function(val,vals){
	                             return jetsennet.Crud.getEditCell("gSysClassCrud.edit('" + val + "')");
	                         }}
	                       ];
	 var gSysClassCrud = $.extend(new jetsennet.Crud("divSysClassList", gSysClassColumns, "divSysClassPage", "ORDER BY t.CLASS_ID ASC"), {
	     dao : IPSDAO,
	     keyId : "CLASS_ID",
	     tableName : "IPS_CTRLCLASS",
	     resultFields : "t.CLASS_TYPE,t.CLASS_NAME,t.CLASS_ID,t.CLASS_DESC",
	     conditions : [["t.CLASS_LAYER","-1",jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]],
	     name : "系统分类类别",
	     checkId : "chkSysClass",
	     cfgId : "divSysCtrlClass",
	     className : "jetsennet.ips.schema.IpsCtrlclass",
	     editDlgOptions : {size : {width : 510, height : 250}},
	     onEditInit : function() {
	         el('txt_Sys_ID').disabled = true;
	     },
	     onEditValid : function(id, obj) {
		        return true;
		    },
	     onEditSet : function(obj) {
	         el("txt_Sys_ID").value = valueOf(obj, "CLASS_TYPE", "");
	         el("hidClassId").value = valueOf(obj, "CLASS_ID", "");
	         el("txt_Sys_Name").value = valueOf(obj, "CLASS_NAME", "");
	         el("txt_Sys_Desc").value = valueOf(obj, "CLASS_DESC", "");
	     },
	     onEditGet : function(id) {
	         return {
	             CLASS_ID : el("hidClassId").value,
	             CLASS_TYPE : el("txt_Sys_ID").value,
	             CLASS_NAME : el("txt_Sys_Name").value,
	             CLASS_DESC : el("txt_Sys_Desc").value
	         };
	     },
	     onEditSuccess : function(obj) {
	    	 jetsennet.message("编辑成功！");
	     }
	 });
 /*===============================分类类型的GridList==================================================================================================================*/	 
	 var gClassTypeColumns = [ 
	                         { fieldName: "CLASS_ID", width: 30, align: "center", isCheck: 1, checkName: "chkClassType"},
	                         { fieldName: "CLASS_DESC", sortField: "CLASS_DESC", width:100, align: "center", name: "类型编号"},
	                         { fieldName: "CLASS_NAME", sortField: "CLASS_NAME", width:"100%", align: "center", name: "名称"},
	                         { fieldName: "STR_1", sortField: "STR_1", width:200, align: "center", name: "状态",format: function(val, vals){
		                        	var state;
		                         	switch(parseInt(val,10)){
		                         	  case 0:
		                         		 state="启用";
		                         		  break;
		                         	  case 1:
		                         		 state="停用";
		                         		  break;
		                               default:
		                            	   state="未知-"+val;
		                                   break;
		                         	}
		                         	return state;
	                         	}
	                         },
	                         { fieldName: "CLASS_ID", width: 45, align: "center", name: "编辑", format: function(val,vals){
	                             return jetsennet.Crud.getEditCell("gClassTypeCrud.edit('" + val + "')");
	                         }},
	                         { fieldName: "CLASS_ID", width:45, align: "center", name: "删除", format: function(val,vals){
	                        	var value= "'"+val+"'";
	                         	return '<span style="cursor:pointer;" onclick="gClassTypeCrud.remove(' + value + ')"><img src="images/cel_del.png"></img></span>';
	                         }}
	                       ];
	 var gClassTypeCrud = $.extend(new jetsennet.Crud("divClassTypeList", gClassTypeColumns, "divClassTypePage", "ORDER BY t.CREATE_TIME ASC"), {
	     dao : IPSDAO,
	     keyId : "CLASS_ID",
	     tableName : "IPS_CTRLCLASS",
	     resultFields : "t.CLASS_TYPE,t.CLASS_NAME,t.CLASS_ID,t.CLASS_DESC,t.STR_1",
	     name : "分类类别",
	     checkId : "chkClassType",
	     cfgId : "divCtrlClassType",
	     className : "jetsennet.ips.schema.IpsCtrlclass",
	     addDlgOptions : {size : {width : 510, height : 250}},
	     editDlgOptions : {size : {width : 510, height : 250}},
	     onAddInit : function() {
	         el('txt_ClassType_ID').disabled = false;
	     },
	     onAddValid : function() {
	    	 var sResult = IPSDAO.query("commonXmlQuery", "CLASS_ID", "IPS_CTRLCLASS", null, null, [["CLASS_DESC", el("txt_ClassType_ID").value, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String]], "CLASS_ID");
	    	 var objs = jetsennet.xml.toObject(sResult.resultVal, "Record");
	    	 if($.isEmptyObject(objs)){
	    		 return true;
	    	 }else{
	    		 jetsennet.message("该类型编号已存在，请您重新输入！",{reference:el("txt_ClassType_ID"),position:3}); 
	    		 return false ;
	    	 };
	     },
	     onAddGet : function() {
	         return {
	        	 CLASS_DESC : el("txt_ClassType_ID").value,
	        	 CLASS_NAME : el("txt_ClassType_Name").value,
	        	 STR_1 : el("txt_ClassType_State").value,
	        	 PARENT_ID : jetsennet.ui.DropDownList["sysClassOptions"].selectedValue,
	        	 CLASS_TYPE : -1,
	        	 OBJ_TYPE : 0
	         };
	     },
	     onAddSuccess : function(){
	    	 loadCtrlClassType(jetsennet.ui.DropDownList["sysClassOptions"].selectedValue);
	    	 jetsennet.message("新建成功！");
	     },
	     onEditInit : function() {
	    	 el('txt_ClassType_ID').disabled = true;
	     },
	     onEditValid : function(id, obj) {
		        return true;
		    },
	     onEditSet : function(obj) {
	    	 el("hidClassTypeId").value = valueOf(obj, "CLASS_ID", "");
	         el("txt_ClassType_ID").value = valueOf(obj, "CLASS_DESC", "");
	         el("txt_ClassType_Name").value = valueOf(obj, "CLASS_NAME", "");
	         el("txt_ClassType_State").value = valueOf(obj, "STR_1", "");
	     },
	     onEditGet : function(id) {
	         return {
	             CLASS_ID : el("hidClassTypeId").value,
	             CLASS_DESC : el("txt_ClassType_ID").value,
	             CLASS_NAME : el("txt_ClassType_Name").value,
	             STR_1 : el("txt_ClassType_State").value
	         };
	     },
	     onEditSuccess : function(obj) {
	    	 jetsennet.message("编辑成功！");
	    	 loadCtrlClassType(jetsennet.ui.DropDownList["sysClassOptions"].selectedValue);
	     },
	     onRemoveSuccess : function(ids){
	    	 jetsennet.message("删除成功！");
	    	 loadCtrlClassType(jetsennet.ui.DropDownList["sysClassOptions"].selectedValue);
	     }
	 });
/*================================分类类别下的子GridList====================================================================================================================*/
	var gSubClassColumns = [ 
	                         { fieldName: "CLASS_ID", width: 30, align: "center", isCheck: 1, checkName: "chkClass"},
//	                         { fieldName: "CLASS_TYPE", sortField: "CLASS_TYPE", width:100, align: "center", name: "分类编号"},
	                         { fieldName: "CLASS_NAME,VIEW_NAME,CLASS_LAYER", sortField: "CLASS_NAME", width:"100%", align: "center", name: "名称",format: function(val, vals){
		                        	if(vals[2] == "-1"){
		                        		return "";
		                        	}else{
		                        		return gCWWordDoc.documentElement.selectSingleNode("Record[CW_ID='" + vals[0] + "']").selectSingleNode("CW_NAME").text;
		                        	}
	                         	}	 
	                         },
	                         { fieldName: "CREATE_TIME", sortField: "CREATE_TIME", width:200, align: "center", name: "创建时间"},
	                         { fieldName: "CLASS_DESC", sortField: "CLASS_DESC", width:200, align: "center", name: "描述"},
	                         { fieldName: "CLASS_ID", width: 45, align: "center", name: "编辑", format: function(val,vals){
	                             return jetsennet.Crud.getEditCell("gSubClassCrud.edit('" + val + "')");
	                         }},
	                         { fieldName: "CLASS_ID", width:45, align: "center", name: "删除", format: function(val,vals){
	                        	 	var value= "'"+val+"'";
		                         	return '<span style="cursor:pointer;" onclick="gSubClassCrud.remove(' + value + ')"><img src="images/cel_del.png"></img></span>';
		                         }}
	                         
	                       ];
	 var gSubClassCrud = $.extend(new jetsennet.Crud("divClassList", gSubClassColumns, "divClassPage", "ORDER BY t.CREATE_TIME ASC"), {
	     dao : IPSDAO,
	     keyId : "CLASS_ID",
	     tableName : "IPS_CTRLCLASS",
	     resultFields : "t.*",
	     name : "分类",
	     checkId : "chkClass",
	     cfgId : "divCtrlClass",
	     className : "jetsennet.ips.schema.IpsCtrlclass",
	     addDlgOptions : {size : {width : 534, height : 329}},
	     editDlgOptions : {size : {width : 534, height : 329}},
	     onAddInit : function() {
	         el('txt_ClassType').disabled = true;
	         el('txt_ClassType').value = el("ctrlClassOptions").value;
	         el("cw_Word_Type").style.border="1px #CCC solid"; 
	         el("cw_Word_Name").style.border="1px #CCC solid";
	     },
	     onAddValid : function() {
	    	return subClassValid();
	     },
	     onAddGet : function() {
	         return {
	        	 CLASS_TYPE : jetsennet.ui.DropDownList["ctrlClassOptions"].selectedValue,
	        	 PARENT_ID :  el("hidDialogTreeId").value,
	        	 CLASS_NAME : jetsennet.ui.DropDownList["cw_Word_Name"].selectedValue,
	        	 CLASS_DESC : el("txt_Class_Desc").value,
	        	 VIEW_NAME : jetsennet.ui.DropDownList["cw_Word_Type"].selectedValue,
	        	 OBJ_TYPE : 0
	         };
	     },
	     onAddSuccess : function(){
	    	 jetsennet.message("新建成功！");
	    	 successFresh();
	     },
	     onEditInit : function() {
	    	 el('txt_ClassType').disabled = true;
	     },
	     onEditSet : function(obj) {
	    	 
	    	var className =  valueOf(obj, "CLASS_NAME", "");
	    	var classType =  valueOf(obj, "VIEW_NAME", "");
	    	classObjJosn.cwWordName = gCWWordDoc.documentElement.selectSingleNode("Record[CW_ID='" + className + "']").selectSingleNode("CW_NAME").text;// classObjJosn.cwWordName;;
         	classObjJosn.cwWordNameId = className;
         	classObjJosn.cwWordType = gCWWordDoc.documentElement.selectSingleNode("Record[CW_ID='" + classType + "']").selectSingleNode("CW_NAME").text;
         	classObjJosn.cwWordTypeId = classType;
         	jetsennet.ui.DropDownList["cw_Word_Type"].selectedValue = classType;
         	jetsennet.ui.DropDownList["cw_Word_Name"].selectedValue = className;
         	
	    	 el("hidDialogTreeId").value = pId;
	         el("txt_ClassType").value = el("ctrlClassOptions").value;
	         el("txt_Parent_Class").value = pName;
	         el("cw_Word_Type").value = classObjJosn.cwWordType;
	         el("cw_Word_Name").value = classObjJosn.cwWordName;
	         el("txt_Class_Desc").value = valueOf(obj, "CLASS_DESC", "");;
	     },
	     onEditValid : function(id, obj) {
	    	 return subClassValid(id);
		 },
	     onEditGet : function(id) {
	    	 var selectedType = jetsennet.ui.DropDownList["cw_Word_Type"].selectedValue;
	    	 var selectedName = jetsennet.ui.DropDownList["cw_Word_Name"].selectedValue;
	    	/* if(selectedType == "-1"){
	    		 selectedType = classObjJosn.cwWordTypeId;
	    	 }
	    	 if(selectedName =="-1"){
	    		 selectedName = classObjJosn.cwWordNameId;
	    	 }*/
	         return {
	             CLASS_ID : id,
	             VIEW_NAME : selectedType,
	             CLASS_NAME : selectedName,
	             CLASS_DESC : el("txt_Class_Desc").value
	         };
	     },
	     onEditSuccess : function(obj){
	    	 jetsennet.message("编辑成功！");
	    	 successFresh();
	     },
	     onRemoveSuccess : function(ids){
	    	 jetsennet.message("删除成功！");
	    	 successFresh();
	     }
	 });
	 
/**
 * 加载系统级的分类类别下拉框
 */
function loadSysClassType(){
	var conditions = [];
	conditions.push(["CLASS_LAYER", "-1", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
	var sResult = IPSDAO.query("commonXmlQuery", "CLASS_ID", "IPS_CTRLCLASS", null, null, conditions, "CLASS_TYPE,CLASS_NAME,CLASS_ID,CLASS_DESC");
	var objs = jetsennet.xml.toObject(sResult.resultVal, "Record");
    jetsennet.ui.DropDownList["sysClassOptions"].clear();
    jetsennet.ui.DropDownList["sysClassOptions"].appendItem({ text: '------请选择系统分类类型------', value: -1 });
    if (objs && objs.length > 0) {
        for (var i = 0; i < objs.length; i++) {
            jetsennet.ui.DropDownList["sysClassOptions"].appendItem({ text: objs[i].CLASS_NAME, value: objs[i].CLASS_TYPE });
        }
        jetsennet.ui.DropDownList["sysClassOptions"].setSelectedIndex(0);
    };
}

/**
 * 加载二级下拉框的分类类别
 */
function loadCtrlClassType(type){
	
	if(type == "-1"){
		return;
	}
	var conditions = [];
	conditions.push(["PARENT_ID", type, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
	conditions.push(["CLASS_TYPE", "-1", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
	var sResult = IPSDAO.query("commonXmlQuery", "CLASS_ID", "IPS_CTRLCLASS", null, null, conditions, "CLASS_DESC,CLASS_NAME");
	var objs = jetsennet.xml.toObject(sResult.resultVal, "Record");
    jetsennet.ui.DropDownList["ctrlClassOptions"].clear();
    jetsennet.ui.DropDownList["ctrlClassOptions"].appendItem({ text: '--------请选择分类类别--------', value: -1 });
    gClassTypeNames = {};
    if (objs && objs.length > 0) {
        for (var i = 0; i < objs.length; i++) {
        	var keyName = "key"+objs[i].CLASS_DESC;
        	gClassTypeNames[keyName] = objs[i].CLASS_NAME;
            jetsennet.ui.DropDownList["ctrlClassOptions"].appendItem({ text: objs[i].CLASS_NAME, value: objs[i].CLASS_DESC });
        }
        jetsennet.ui.DropDownList["ctrlClassOptions"].setSelectedIndex(0);
    }
}

/**
 * 创建 新增-修改 弹出框的分类树
 */
function createDialogTree(TreeType,divId,functions){
	//重新刷新gSubClassDoc。
	loadSubClass(TreeType);
	el(divId).innerHTML="";
	var keyName = "key" + TreeType;
	var gDialogTree = new jetsennet.ui.Tree("class-type-tree"+divId);
	var subClassItem =new jetsennet.ui.TreeItem(gClassTypeNames[keyName],
			"javascript:"+functions+"(0,'"+gClassTypeNames[keyName]+"');", null, null, {
				ID : 0
			});
	subClassItem.addItem(new jetsennet.ui.TreeItem("", "", "", null, null));
	subClassItem.onopen = function() {
		var _owner = this;
		_owner.clear();
		createSubTree(_owner.treeParam.ID,gDialogTree,functions);
		_owner.isRenderItem = false;
		_owner.renderItem();
	};
	
//	subClassItem.onselect = function (index) { el('SubClass').value = subClassItem.getItemByIndex(index).treeText; };
	
	gDialogTree.addItem(subClassItem);
	gDialogTree.render(divId);
}

/**
 * 创建分类树
 */
function createClassTree(TreeType,divId,functions){
	el(divId).innerHTML="";
	var keyName = "key" + TreeType;
	gClassTypeTree = new jetsennet.ui.Tree("class-type-tree"+divId);
	var subClassItem =new jetsennet.ui.TreeItem(gClassTypeNames[keyName],
			"javascript:"+functions+"(0,'"+gClassTypeNames[keyName]+"');", null, null, {
				ID : 0
			});
	subClassItem.addItem(new jetsennet.ui.TreeItem("", "", "", null, null));
	subClassItem.onopen = function() {
		var _owner = this;
		_owner.clear();
		createSubTree(_owner.treeParam.ID,gClassTypeTree,functions);
		_owner.isRenderItem = false;
		_owner.renderItem();
	};
	
//	subClassItem.onselect = function (index) { el('SubClass').value = subClassItem.getItemByIndex(index).treeText; };
	gClassTypeTree.addItem(subClassItem);
	gClassTypeTree.render(divId);
}

/**
 * 创建子分类树
 * @param id
 * @param gClassTypeTree
 * @param functions
 */
function createSubTree(id,gClassTypeTree,functions) {
	var treeNode = gClassTypeTree.getItem(function(item) {
		if (item.treeParam && item.treeParam.ID == id)
			return true;
		return false;
	}, true);
	treeNode.clear();
	var parentList = gSubClassDoc.documentElement
			.selectNodes("//Record[PARENT_ID=0 and OBJ_TYPE = 0 ]");// 第0层
	for ( var i = 0; i < parentList.length; i++) {
//		var name = parentList[i].selectSingleNode("CLASS_NAME").text;
		var name = gCWWordDoc.documentElement.selectSingleNode("Record[CW_ID='" + parentList[i].selectSingleNode("CLASS_NAME").text + "']").selectSingleNode("CW_NAME").text;
		var id = parentList[i].selectSingleNode("CLASS_ID").text;
			subId=id;
		
		var clipItem = new jetsennet.ui.TreeItem(name,
				"javascript:"+functions+"('" + id + "','"+name+"');", null, null, {
					ID : id,
					Name : name,
					ParentId : 0,
					ParentName : "",
					Type : 0
				});
		clipItem.addItem(new jetsennet.ui.TreeItem("", "", "", null, null));
		clipItem.onopen = function() {
			this.clear();
			if (this.treeItems.length == 0) {
//				this.isOpen = false;
				// alert("无子项");
			}
			createSubTreeItem(this.treeParam.ID,gClassTypeTree,functions);
			this.isRenderItem = false;
			this.renderItem();
		};
		treeNode.addItem(clipItem);
	}
	
	treeNode.isOpen = true;
	treeNode.isRenderItem = false;
	treeNode.renderItem();
}

/**
 * 创建子分类树的项
 * @param id
 * @param gClassTypeTree
 * @param functions
 */
function createSubTreeItem(id,gClassTypeTree,functions) {
	//加载该分类节点下的所有子项
	loadSubItemClass(id);
	
	var treeNode = gClassTypeTree.getItem(function(item) {
		if (item.treeParam && item.treeParam.ID == id)
			return true;
		return false;
	}, true);
	treeNode.clear();
	var parentList = gSubClassItemDoc.documentElement.selectNodes("Record");
	for ( var i = 0; i < parentList.length; i++) {
		var name = gCWWordDoc.documentElement.selectSingleNode("Record[CW_ID='" + parentList[i].selectSingleNode("CLASS_NAME").text + "']").selectSingleNode("CW_NAME").text;
		var id = parentList[i].selectSingleNode("CLASS_ID").text;
			subId=id;
		
		var clipItem = new jetsennet.ui.TreeItem(name,
				"javascript:"+functions+"('" + id + "','"+name+"');", null, null, {
					ID : id,
					Name : name,
					ParentId : 0,
					ParentName : "",
					Type : 0
				});
		clipItem.addItem(new jetsennet.ui.TreeItem("", "", "", null, null));
		clipItem.onopen = function() {
			this.clear();
			if (this.treeItems.length == 0) {
				// alert("无子项");
			}
			createSubTreeItem(this.treeParam.ID,gClassTypeTree,functions);
			this.isRenderItem = false;
			this.renderItem();
		};
		treeNode.addItem(clipItem);
	}
	
	treeNode.isOpen = true;
	treeNode.isRenderItem = false;
	treeNode.renderItem();
}

/**
 * 加载数据字典名称
 * @param divIds   DIV的Id
 * @param ctrlWordId  受控词码
 */
function loadCtrlWord(divIds,ctrlWordId){
	
	jetsennet.ui.DropDownList[divIds].clear();
	
	var conditions = [];
	if(ctrlWordId){
		conditions.push(["CW_TYPE", ctrlWordId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
    	jetsennet.ui.DropDownList[divIds].appendItem({ text: '请选择数据字典名称', value: "-1"  });
	}else{
		conditions.push(["CW_TYPE", "-1", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
		jetsennet.ui.DropDownList[divIds].appendItem({ text: '请选择数据字典类别', value: "-1" });
	}
	
	var sResult = IPSDAO.query("commonXmlQuery", "CW_ID", "IPS_CTRLWORD", null, null, conditions, "t.*");
	var objs = jetsennet.xml.toObject(sResult.resultVal, "Record");
//	var objs = jQuery.parseJSON(sResult.resultVal).Records.Record;
//	var objs = sResult.resultVal;

	if (objs && objs.length > 0) {
        for (var i = 0; i < objs.length; i++) {
       	 jetsennet.ui.DropDownList[divIds].appendItem({ text: objs[i].CW_NAME, value: objs[i].CW_ID, code: objs[i].CW_CODE });
        }
    }
	jetsennet.ui.DropDownList[divIds].setSelectedIndex(0);
}

/**
 * 显示功能树
 * @param {String} hideTree 树id
 * @param {String} relate 相对位置控件id
 */
function popHiddenTree(hideTree, relate) {
    var relateWid = $("#" + relate.id).css("width").replace("px", "");
    var minWidth = $("#" + hideTree.id).attr("minWidth").replace("px", "");
    var width = relateWid > minWidth ? relateWid : minWidth;
    $("#" + hideTree.id).css("width", width);
    jetsennet.popup(hideTree, {
        reference : relate
    });
}

/**
 * 点击左边树加载对应的gridList
 * @param id
 * @param name
 */
function clickeTreeItem(id,name){
	el("hidDialogTreeId").value=id;
	el("txt_Parent_Class").value=name;
	el("divClassList").innerHTML="";
	el("divClassPage").innerHTML="";
	pName=name;
	pId = id;
	var conditions = [];
	    conditions.push([ "CLASS_TYPE", jetsennet.ui.DropDownList["ctrlClassOptions"].selectedValue, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric ]);
	    conditions.push([ "PARENT_ID", id, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal]);
	    //避免与基础脚本中的 数据源分类和数据采集系统记录ClassType的冲突
	    conditions.push([ "OBJ_TYPE", 0, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal,jetsennet.SqlParamType.Numeric]);
	gSubClassCrud.search(conditions);
}

/**
 * 给添加-修改弹出框的点击树赋值
 * @param id
 * @param name
 */
function dialogSetValue(id,name){
	el("hidDialogTreeId").value=id;
	el("txt_Parent_Class").value=name;
}

/**
 * 添加分类
 */
function addClass(){
	var value = jetsennet.ui.DropDownList["ctrlClassOptions"].selectedValue;
	if(value == "-1"){
   	 jetsennet.alert("请先选择分类类别！");
   	 return;
	}
	
	gSubClassCrud.add();
	//创建 新建-修改 弹出框的树
	 createDialogTree(value,"divSubTree","dialogSetValue");
}

function addClassType(){
	if(jetsennet.ui.DropDownList["sysClassOptions"].selectedValue == "-1"){
		jetsennet.alert("请先选择系统分类！");
	   	 return;
	 }
	gClassTypeCrud.add();
}

/**
 * 加载该分类类别下的所有子项
 */
function loadSubClass(cType){
	gType = cType;
	if(cType == "-1"){
		return;
	}
	var conditions = [];
	conditions.push(["CLASS_TYPE", cType, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
	var sResult = IPSDAO.query("commonXmlQuery", "CLASS_ID", "IPS_CTRLCLASS", null, null, conditions, "CLASS_ID,CLASS_NAME,OBJ_TYPE,CLASS_DESC,PARENT_ID,CLASS_TYPE,CLASS_LAYER,VIEW_NAME,STR_1");
//	var Result = jetsennet.xml.toObject(sResult.resultVal, "Record");
//	var Result = jetsennet.xml.serialize(sResult.resultVal,"RecordSet");
	gSubClassDoc.loadXML(sResult.resultVal);
	
}

/**
 * 加载该分类节点下的所有子项
 */
function loadSubItemClass(parentId){
	var conditions = [];
	conditions.push(["PARENT_ID", parentId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal]);
	conditions.push(["CLASS_TYPE", jetsennet.ui.DropDownList["ctrlClassOptions"].selectedValue, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
	var sResult = IPSDAO.query("commonXmlQuery", "CLASS_ID", "IPS_CTRLCLASS", null, null, conditions, "CLASS_ID,CLASS_NAME,OBJ_TYPE,CLASS_DESC,PARENT_ID,CLASS_TYPE,CLASS_LAYER,VIEW_NAME,STR_1");
//	var Result = jetsennet.xml.toObject(sResult.resultVal, "Record");
//	var Result = jetsennet.xml.serialize(sResult.resultVal,"RecordSet");
	gSubClassItemDoc.loadXML(sResult.resultVal);
	
}

/**
 * 加载数据字典的所有项
 */
function loadCWWord(){
	var sResult = IPSDAO.query("commonXmlQuery", "CW_ID", "IPS_CTRLWORD", null, null, [], "t.*");
//	var Result = jetsennet.xml.toObject(sResult.resultVal, "Record");
//	var Result = jetsennet.xml.serialize(sResult.resultVal,"RecordSet");
	gCWWordDoc.loadXML(sResult.resultVal);
}

/**
 * 检查功能是否存在
 * @returns {Boolean}
 * @private
 */
function _checkFuncExist() {
    var funcs = IPSDAO.queryObjs("commonXmlQuery", "CLASS_ID", "IPS_CTRLCLASS", null, null, [ [ "CLASS_ID", -1, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.NotEqual, jetsennet.SqlParamType.Numeric ] ], "CLASS_ID");
    if (funcs) {
        var id = el("txt_ID").value;
        for (var i = 0; i < funcs.length; i++) {
            if (id == funcs[i].ID) {
                jetsennet.alert("该功能编号已被使用！");
                return true;
            }
        }
    }
    return false;
}

/**
 * 删除分类类别
 */
function deleteClassType(){
	parentId = [];
	classIds = [];
	jetsennet.confirm("确定删除?", function () {
		var ids = jetsennet.form.getCheckedValues("chkClassType");
		if(ids != ""){
			for(var i=0;i<ids.length;i++){
				var id = ids[i];
				var desc = IPSDAO.queryObjs("commonXmlQuery", "CLASS_ID", "IPS_CTRLCLASS", null, null, [[ "CLASS_ID", id, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String ]], "CLASS_DESC");
				classIds.push(id);
				var conditions = [];
				conditions.push([ "OBJ_TYPE", 0, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal,jetsennet.SqlParamType.Numeric]);
				conditions.push([ "CLASS_TYPE", desc[0].CLASS_DESC, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String ] );
				conditions.push([ "PARENT_ID", "0", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String ] );
				var objs = IPSDAO.queryObjs("commonXmlQuery", "CLASS_ID", "IPS_CTRLCLASS", null, null, conditions, "CLASS_ID");
				if(objs){
					for(var j=0;j<objs.length;j++){
						var obj = objs[j].CLASS_ID;
						parentId.push(obj);
						classIds.push(obj);
						deleteClassAll();
					};
				};
			};
			var params = new HashMap();
		    params.put("className", "jetsennet.ips.schema.IpsCtrlclass");
		    params.put("deleteIds", classIds.join(","));
		    var result = IPSDAO.execute("commonObjDelete", params);
		    if (result && result.errorCode == 0) {
		    	
		    	jetsennet.message("删除成功！");
		    	var classType = jetsennet.ui.DropDownList["sysClassOptions"].selectedValue;
		    	loadCtrlClassType(classType);
		    	 var classTypeConditions = [];
		    	 	classTypeConditions.push(["t.CLASS_TYPE", "-1", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
		    	 	classTypeConditions.push(["t.PARENT_ID", classType, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
		    	 	gClassTypeCrud.search(classTypeConditions);
		    };
		}else{
			jetsennet.warn("请您勾选分类类别！");
		}
		return true;
	});
}

/**
 * 级联删除分类
 */
function deleteClass(){
	parentId = [];
	classIds = [];
//	var a = gSubClassCrud.getCheckIds(null,"chkClassType");
	//分开判断是否选中 防止历史勾选的记录也被删掉
	var sysDisplay = el("divSysClassList").style.display;
	if(sysDisplay == ""){
		jetsennet.warn("提示：系统分类类别不允许删除！");
		return;
	};
	var classTypeDisplay = el("divClassTypeList").style.display;
	if(classTypeDisplay == "none"){
		jetsennet.form.uncheckAllItems("chkClassType");
	}
	var classDisplay = el("divClassList").style.display;
	if(classDisplay == "none"){
		jetsennet.form.uncheckAllItems("chkClass");
	}
	var idType = jetsennet.form.getCheckedValues("chkClassType");
	var ids = jetsennet.form.getCheckedValues("chkClass");
	if(idType == "" && ids == ""){
		jetsennet.warn("请您勾选分类！");
		return;
	};
	jetsennet.confirm("确定删除?", function () {
//			var ids = jetsennet.form.getCheckedValues("chkClass");
			if(ids != ""){
				for(var i=0;i<ids.length;i++){
					var id = ids[i];
					parentId.push(id);
					classIds.push(id);
					deleteClassAll();
				};
				var params = new HashMap();
			    params.put("className", "jetsennet.ips.schema.IpsCtrlclass");
			    params.put("deleteIds", classIds.join(","));
			    var result = IPSDAO.execute("commonObjDelete", params);
			    if (result && result.errorCode == 0) {
			    	jetsennet.message("删除成功！");
			    	successFresh();
			    	//选择分类类别默认加载grid
            		 var conditions = [];
            		    conditions.push([ "CLASS_TYPE", jetsennet.ui.DropDownList["ctrlClassOptions"].selectedValue, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric ]);
            		    conditions.push([ "PARENT_ID", "0", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal]);
            		    conditions.push([ "OBJ_TYPE", 0, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal,jetsennet.SqlParamType.Numeric]);
            		 gSubClassCrud.search(conditions);
			    };
			}
			if(idType != ""){
				for(var i=0;i<idType.length;i++){
					var id = idType[i];
					var desc = IPSDAO.queryObjs("commonXmlQuery", "CLASS_ID", "IPS_CTRLCLASS", null, null, [[ "CLASS_ID", id, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String ]], "CLASS_DESC");
					classIds.push(id);
					var conditions = [];
					conditions.push([ "OBJ_TYPE", 0, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal,jetsennet.SqlParamType.Numeric]);
					conditions.push([ "CLASS_TYPE", desc[0].CLASS_DESC, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String ] );
					conditions.push([ "PARENT_ID", "0", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String ] );
					var objs = IPSDAO.queryObjs("commonXmlQuery", "CLASS_ID", "IPS_CTRLCLASS", null, null, conditions, "CLASS_ID");
					if(objs){
						for(var j=0;j<objs.length;j++){
							var obj = objs[j].CLASS_ID;
							parentId.push(obj);
							classIds.push(obj);
							deleteClassAll();
						};
					};
				};
				var params = new HashMap();
			    params.put("className", "jetsennet.ips.schema.IpsCtrlclass");
			    params.put("deleteIds", classIds.join(","));
			    var result = IPSDAO.execute("commonObjDelete", params);
			    if (result && result.errorCode == 0) {
			    	
			    	jetsennet.message("删除成功！");
			    	var classType = jetsennet.ui.DropDownList["sysClassOptions"].selectedValue;
			    	loadCtrlClassType(classType);
			    	 var classTypeConditions = [];
			    	 	classTypeConditions.push(["t.CLASS_TYPE", "-1", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
			    	 	classTypeConditions.push(["t.PARENT_ID", classType, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
			    	 	gClassTypeCrud.search(classTypeConditions);
			    };
			}
			return true;
	    });
}

/**
 * 级联删除中所有的classId项
 */
function deleteClassAll(){
	 var objs = IPSDAO.queryObjs("commonXmlQuery", "CLASS_ID", "IPS_CTRLCLASS", null, null, [ [ "PARENT_ID", parentId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.In, jetsennet.SqlParamType.String ] ], "CLASS_ID");
	 if(objs){
		 parentId = [];
		 for (var i = 0; i < objs.length; i++) {
	    	var	pId = objs[i].CLASS_ID;
			parentId.push(pId);
			classIds.push(pId);
	     }
		 deleteClassAll();
     }
}

/**
 * 
 * 对增删改完成后的 刷新
 * 
 * 添加刷新受控词集合 解决添加分类页面卡死问题
 * Eidt by JiJie.LianG 2015.06.30
 */
function successFresh(){
	loadCWWord();
	var val = jetsennet.ui.DropDownList["ctrlClassOptions"].selectedValue;
	 if (el("hidDialogTreeId").value == "0") {
		 	loadSubClass(val);
			createSubTree(el("hidDialogTreeId").value,gClassTypeTree,"clickeTreeItem");
		} else {
			createSubTreeItem(el("hidDialogTreeId").value,gClassTypeTree,"clickeTreeItem");
			//重新刷新 新增-修改 弹出框的树
			createDialogTree(val,"divSubTree","dialogSetValue");
		}
}

/**
 * 验证表单
 * @param id
 * @returns {Boolean}
 */
function subClassValid(id){
	 var cwNameValid = true;
	 var cwTypeValid = true;
	 if(jetsennet.ui.DropDownList["cw_Word_Type"].selectedValue =="-1"){
 		 el("cw_Word_Type").style.border="1px #936 solid";
 		cwTypeValid = false;
	 }else{
		 el("cw_Word_Type").style.border="1px #CCC solid"; 
	 }
	 var cwName = jetsennet.ui.DropDownList["cw_Word_Name"].selectedValue;
	 if(cwName == "-1"){
		 el("cw_Word_Name").style.border="1px #936 solid";
		 cwNameValid = false;
	 }else{
		 var className = el("hidDialogTreeId").value;
		 var conditions = [];
		 if(typeof(id) != "undefined"){
			 conditions.push(["CLASS_ID", id, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.NotEqual, jetsennet.SqlParamType.String]);
		 }
		 if(className == 0){
			 conditions.push(["CLASS_TYPE", jetsennet.ui.DropDownList["ctrlClassOptions"].selectedValue, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
		 }
		 conditions.push(["PARENT_ID", className, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String]);
		 conditions.push(["CLASS_NAME", cwName, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String]);
		 var sResult = IPSDAO.queryObjs("commonXmlQuery", "CLASS_ID", "IPS_CTRLCLASS", null, null, conditions, "CLASS_ID");
		 if(!sResult){
			 el("cw_Word_Name").style.border="1px #CCC solid";
		 }else{
			 el("cw_Word_Name").style.border="1px #936 solid";
			 jetsennet.message("该名称已存在，请您重新选择！",{reference:el("cw_Word_Name"),position:3}); 
    		 cwNameValid = false;
		 }
	 }
	 return cwNameValid && cwTypeValid;
}



