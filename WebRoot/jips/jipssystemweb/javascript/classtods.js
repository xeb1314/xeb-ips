
	//当前分类类别ID
	var gccType;
	//所有分类类别的名字
	var gClassTypeNames;
	//所有分类类别下的叶子节点
	var gSubClassDoc = new jetsennet.XmlDoc();
	//所有数据字典的项
	var gCWWordDoc = new jetsennet.XmlDoc();
	//所有当前节点下的叶子节点
	var gSubClassItemDoc = new jetsennet.XmlDoc();
	//控制数据源详情弹出框的高度
	var isDisplay = true;
	var divLabelId;
	var controlObj;

/**
 * 加载下拉框的数据字典类别
 * @param divId
 */
function loadCtrlWord(divId){
//	gccType = type;
	var conditions = [];
	conditions.push(["CW_TYPE", "-1", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
	var sResult = IPSDAO.query("commonXmlQuery", "CW_ID", "IPS_CTRLWORD", null, null, conditions, "CW_NAME,CW_CODE");
	var objs = jetsennet.xml.toObject(sResult.resultVal, "Record");
    jetsennet.ui.DropDownList[divId].clear();
    jetsennet.ui.DropDownList[divId].appendItem({ text: "请选择...", value: -1 });
//    gClassTypeNames = {};
    if (objs && objs.length > 0) {
        for (var i = 0; i < objs.length; i++) {
//        	var keyName = "key"+objs[i].CW_CODE;
//        	gClassTypeNames[keyName] = objs[i].CLASS_NAME;
            jetsennet.ui.DropDownList[divId].appendItem({ text: objs[i].CW_NAME, value: objs[i].CW_CODE });
        }
        jetsennet.ui.DropDownList[divId].setSelectedIndex(0);
    }
  //分类类别下拉框的onchanged事件
    jetsennet.ui.DropDownList[divId].onchanged= function (item){
    	var val = item.value;
   	 	if(val != "-1"){
   	 		loadControlWord(divId,val);
   	 	}else{
   	 		//清空input值 Add by JiJie.LianG 2015.10.26
   	 		el("lableName_"+divId).value = "";
   	 		jetsennet.ui.DropDownList["lableName_"+divId].clear();
   	 	}
    };
}

/**
 * 加载下拉框的分类类别
 * @param divId
 * @param type 10是数据源分类树,20是采集系统分类树
 * @param textName 初始化下拉框默认显示的名称
 */
function loadSelectType(divId,type,textName){
	gccType = type;
	if(type == "-1"){
		return;
	}
	var conditions = [];
	conditions.push(["STR_1", "0", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
	conditions.push(["PARENT_ID", type, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
	conditions.push(["CLASS_TYPE", "-1", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
	var sResult = IPSDAO.query("commonXmlQuery", "CLASS_ID", "IPS_CTRLCLASS", null, null, conditions, "CLASS_DESC,CLASS_NAME");
	var objs = jetsennet.xml.toObject(sResult.resultVal, "Record");
    jetsennet.ui.DropDownList[divId].clear();
    jetsennet.ui.DropDownList[divId].appendItem({ text: textName, value: -1 });
    gClassTypeNames = {};
    if (objs && objs.length > 0) {
        for (var i = 0; i < objs.length; i++) {
        	var keyName = "key"+objs[i].CLASS_DESC;
        	gClassTypeNames[keyName] = objs[i].CLASS_NAME;
            jetsennet.ui.DropDownList[divId].appendItem({ text: objs[i].CLASS_NAME, value: objs[i].CLASS_DESC });
        }
        jetsennet.ui.DropDownList[divId].setSelectedIndex(0);
    }
}

/**
 * 初始化标签项
 * @param divId
 */
function loadControlWord(divId,type){
	//编辑时 判断divId是否已初始化。
	var index = existDivIds.indexOf(divId);
	if(divLabelId != divId){
		// 防止初始化2遍组件有bug。
		if(!isUpdate || isUpdate && index == -1){
			controlObj = jQuery("#lableName_"+divId).autoComplete({instanceId : "lableName_"+divId, showExtendInfo : false, maxDisplayItem:2, size:{height:150,width:0}});
		}
	}
	
	el("lableName_"+divId).value = "";
	var conditions = [];
	conditions.push(["CW_TYPE", type, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
	var sResult = IPSDAO.query("commonXmlQuery", "CW_ID", "IPS_CTRLWORD", null, null, conditions, "CW_NAME,CW_ID");
	var objs = jetsennet.xml.toObject(sResult.resultVal, "Record");
//		controlObj.clear();
	jetsennet.ui.DropDownList["lableName_"+divId].clear();
//	jetsennet.ui.DropDownList[divId].clear();
    if (objs && objs.length > 0) {
        for (var i = 0; i < objs.length; i++) {
        	jetsennet.ui.DropDownList["lableName_"+divId].appendItem({ text: objs[i].CW_NAME, value: objs[i].CW_ID});
        }
    }else{
//    	control.appendItem({ text: "" , value: "-2"});
    }
    jetsennet.ui.DropDownList["lableName_"+divId].sortItems();
	/*jQuery("#"+labelName).click(function(){
		control.handleEvent();
	}).keyup(function(){ control.handleEvent();});*/
	divLabelId = divId;
}

/**
 * 加载该分类类别下的所有子项
 * @param cType 选中当前分类类别
 */
function loadSubClass(cType){
	if(cType == "-1"){
		return;
	}
	var conditions = [];
	conditions.push(["CLASS_TYPE", cType, jetsennet.SqlLogicType.Or, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
	conditions.push(["CLASS_TYPE", "-1", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
	var sResult = IPSDAO.query("commonXmlQuery", "CLASS_ID", "IPS_CTRLCLASS", null, null, conditions, "CLASS_ID,CLASS_NAME,CLASS_DESC,PARENT_ID,CLASS_TYPE,CLASS_LAYER,VIEW_NAME,STR_1");
	gSubClassDoc.loadXML(sResult.resultVal);
	
}

/**
 * 加载数据字典的所有项
 */
function loadCWWord(){
	var sResult = IPSDAO.query("commonXmlQuery", "CW_ID", "IPS_CTRLWORD", null, null, [], "t.*");
	gCWWordDoc.loadXML(sResult.resultVal);
}

/**
 * 加载该分类节点下的所有子项
 * @param parentId 父节点
 */
function loadSubItemClass(parentId){
	var conditions = [];
	conditions.push(["PARENT_ID", parentId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal]);
	conditions.push(["CLASS_TYPE", gccType, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
	var sResult = IPSDAO.query("commonXmlQuery", "CLASS_ID", "IPS_CTRLCLASS", null, null, conditions, "CLASS_ID,CLASS_NAME,CLASS_DESC,PARENT_ID,CLASS_TYPE,CLASS_LAYER,VIEW_NAME,STR_1");
	gSubClassItemDoc.loadXML(sResult.resultVal);
	
}



/**
 * 创建数据源分类树
 */
function createClassTree(TreeType,divId,functions){
	
	el(divId).innerHTML="";
	var keyName = "key" + TreeType;
	var gClassTypeTree = new jetsennet.ui.Tree("class-type-tree"+divId);
	
	var classId = gSubClassDoc.documentElement.selectNodes("//Record[CLASS_TYPE=-1 and CLASS_DESC="+TreeType+"]")[0].selectSingleNode("CLASS_ID").text;
	var subClassItem =new jetsennet.ui.TreeItem(gClassTypeNames[keyName],
			"javascript:"+functions+"('"+classId+"','"+gClassTypeNames[keyName]+"');", null, null, {
				ID : classId
			});
	subClassItem.addItem(new jetsennet.ui.TreeItem("", "", "", null, null));
	subClassItem.onopen = function() {
		var _owner = this;
		_owner.clear();
		createSubTree(_owner.treeParam.ID,gClassTypeTree,functions,TreeType);
		_owner.isRenderItem = false;
		_owner.renderItem();
	};
	gClassTypeTree.addItem(subClassItem);
	gClassTypeTree.render(divId);
}

/**
 * 创建类别下子分类树的项
 * @param id
 * @param gClassTypeTree
 * @param functions
 * @param treeType   选中当前分类类别
 */
function createSubTree(id,gClassTypeTree,functions,treeType) {
	gccType = treeType;
	treeNode = gClassTypeTree.getItem(function(item) {
		if (item.treeParam && item.treeParam.ID == id)
			return true;
		return false;
	}, true);
	treeNode.clear();
	var parentList = gSubClassDoc.documentElement
			.selectNodes("Record[PARENT_ID=0]");// 第0层
	for ( var i = 0; i < parentList.length; i++) {
		var name = gCWWordDoc.documentElement.selectSingleNode("Record[CW_ID='" + parentList[i].selectSingleNode("CLASS_NAME").text + "']").selectSingleNode("CW_NAME").text;
		var id = parentList[i].selectSingleNode("CLASS_ID").text;
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
			createSubTreeItem(this.treeParam.ID,gClassTypeTree,functions);
			this.isRenderItem = false;
			this.renderItem();
			if (this.treeItems.length == 0) {
				// alert("无子项");
			}
		};
		treeNode.addItem(clipItem);
	}
	treeNode.isOpen = true;
	treeNode.isRenderItem = false;
	treeNode.renderItem();
}

/**
 * 创建该子分类树下所有的项
 * @param id	节点ID
 * @param gClassTypeTree  树对象
 * @param functions		点击树的函数
 */
function createSubTreeItem(id,gClassTypeTree,functions) {
	//加载该分类节点下的所有子项
	loadSubItemClass(id);
	
	treeNode = gClassTypeTree.getItem(function(item) {
		if (item.treeParam && item.treeParam.ID == id)
			return true;
		return false;
	}, true);
	treeNode.clear();
	var parentList = gSubClassItemDoc.documentElement.selectNodes("Record");
	for ( var i = 0; i < parentList.length; i++) {
		var name = gCWWordDoc.documentElement.selectSingleNode("Record[CW_ID='" + parentList[i].selectSingleNode("CLASS_NAME").text + "']").selectSingleNode("CW_NAME").text;
		var id = parentList[i].selectSingleNode("CLASS_ID").text;
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
			createSubTreeItem(this.treeParam.ID,gClassTypeTree,functions);
			this.isRenderItem = false;
			this.renderItem();
			if (this.treeItems.length == 0) {
				// alert("无子项");
			}
		};
		treeNode.addItem(clipItem);
	}
	treeNode.isOpen = true;
	treeNode.isRenderItem = false;
	treeNode.renderItem();
}

/**
 * 往select中添加Item
 * @param selectId   select divId
 * @param value		id
 * @param name		显示的名称
 */
function selectAddItem(selectId,value,name){
	 var elm = el(selectId);
	    var len = elm.options.length;
	    for (var i = 0; i < len; i++) {
	        if (elm.options[i].value == value) {
	            return;
	        }
	    }
	    var objNewOption = document.createElement("option");
	    objNewOption.value = value;
	    objNewOption.innerHTML = name;
	    elm.options.add(objNewOption);
}

/**
 * 给弹出框授权用户赋值
 * @param condition
 */
function userList(divId,condition){
	var beforeGrantID = "";
	var jointables = [["UUM_USERGROUP", "u", "u.ID=d.GROUP_ID", jetsennet.TableJoinType.Inner]];
	var Result = IPSDAO.query("commonXmlQuery", "d.DS_ID", "IPS_DATATOGROUP", "d", jointables, condition, "u.NAME,u.ID");
	var ssResult = jetsennet.xml.toObject(Result.resultVal, "Record");
	if(!$.isEmptyObject(ssResult)){
		el(divId).options.length=0;
		for(var j=0;j<ssResult.length;j++){
			var name = ssResult[j].NAME;
			var value = ssResult[j].ID;
			selectAddItem(divId,value,name);
			if (beforeGrantID != "")
				beforeGrantID += ",";
			beforeGrantID += value;
		}
	}
	return beforeGrantID;
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
 * 通过分类ID查找该分类对象
 */
function queryClassType(classId){
	var conditions = [];
	conditions.push(["CLASS_ID", classId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.In]);
	var sResult = IPSDAO.query("commonXmlQuery", "CLASS_ID", "IPS_CTRLCLASS", null, null, conditions, "CLASS_TYPE,CLASS_NAME,CLASS_DESC");
		return jetsennet.xml.toObject(sResult.resultVal, "Record");
}

/**
 * 数据源详情
 */
function viewLabelDetail(dsId,sourcePath,state,isReplace){
	
	el("txtSourcePathDetail").value = "";
	el("lableClassDetails").options.length = 0;
	el("lableUserDetails").options.length = 0;
	/*================根据数据源ID去用户表里查找数据源所有用户并在弹出窗详情中显示=======================**/
	if(state == "1"){
		var condition = [];
		el("userDisplay").style.display = "";
		condition.push(["d.DS_ID", dsId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.In]);
		userList("lableUserDetails",condition);
		isDisplay = true;
	}else{
		el("userDisplay").style.display = "none";
		isDisplay = false;
	}
	/*==================详情弹出窗=========================================**/
	var dialogHeight = 300;
	if(isDisplay){
		dialogHeight = 450;
	}
	var dialogName = "detail-window"+jetsennet.util.Guid.newGuid().toString();
	var dialog = new jetsennet.ui.Window(dialogName);
    jQuery.extend(dialog, { submitBox: false, cancelBox: false, maximizeBox: false, showScroll: false, windowStyle: 1, minimizeBox: false, title: "详情" });
    dialog.size = { width: 450, height: dialogHeight };
    dialog.controls = ["divLabelDetail"];
    dialog.showDialog();
	if(isReplace){
		el("txtSourcePathDetail").value=sourcePath.replaceAll("/","\\");
	}else{
		el("txtSourcePathDetail").value=sourcePath;
	}
    
    /*==================根据数据源ID，找出标签项(名称是从数据字典里取的)==================**/
	var conditions = [];
	conditions.push(["DS_ID", dsId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.In]);
	var sResult = IPSDAO.query("commonXmlQuery", "ID", "IPS_DATATSOURCELABEL", null, null, conditions, "CW_IDS,TYPE");
	var objs = jetsennet.xml.toObject(sResult.resultVal, "Record");
	for ( var i = 0; i < objs.length; i++) {
		var value = objs[i].CW_IDS;
		var type = gCWWordDoc.documentElement.selectSingleNode("Record[CW_CODE=" + objs[i].TYPE + "]").selectSingleNode("CW_NAME").text;
		var name = gCWWordDoc.documentElement.selectSingleNode("Record[CW_ID='" + value + "']").selectSingleNode("CW_NAME").text;
		selectAddItem("lableClassDetails",value,type+"=====>"+name);
	}
}

/**
 * 加载数据源列表  
 * @param classId  点击当前数据源分类树的分类ID
 * @param className 点击当前数据源分类树的分类名称
 */
function loadDataSource(classId,className){
	var obj = {};
	obj.CW_IDS = [];
	var cwIds = backSuper(classId,obj);
	var ids = cwIds.CW_IDS;
	if(ids){
		var conditions = [];
        conditions.push([ "d.STR_2", ids.join(), jetsennet.SqlLogicType.Or, jetsennet.SqlRelationType.Like, jetsennet.SqlParamType.String ]);
        conditions.push([ "d.STR_2", ids.reverse().join(), jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Like, jetsennet.SqlParamType.String ]);
        gDataSourceCrud.search(conditions);
	}
}

