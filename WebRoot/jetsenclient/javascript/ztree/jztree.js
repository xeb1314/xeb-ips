var ZSPLIT = "_";

/**
 * 查询结果级有父子关系的树显示(用于单表有父子字段的结构)
 * @param xml 待解析的xml
 * @param id 字段Id
 * @param parentId 字段父Id
 * @param name 显示字段名
 * @param treeId  显示树Id
 * @param onclickEvent 单击事件
 * @param isCheck 是否显示复选框
 * @param oncheckEvent 复选框事件
 * @param onRightClick 右键菜单事件
 * @param iconSkinField 图标字段（不同数据类型，不同图标）
 * @param fistLevelBySelf 自己维护所有分组节点
 * @param rootIds 根节点id数组
 * @param params 自定义属性
 */
function createTree(xml,id,parentId,name,treeId,onclickEvent,check,oncheckEvent,onRightClick,iconSkinField,fistLevelBySelf, rootIds){
	
	var nodeIdArr = [] ; 
	
	var xmlDoc = new jetsennet.XmlDoc();
	xmlDoc.loadXML(xml);
	var elements = xmlDoc.documentElement.selectNodes("Record");
	var nodes = [];
	if (elements != null) {
		if(!fistLevelBySelf){
			var parentNode = {id:"0",pId:"-1",name:"所有分组",open:true};
			nodes.push(parentNode);
			nodeIdArr.push(parentNode.id);
		}
		for ( var i = 0; i < elements.length; i++) {
			var element = elements[i];
			var  classParentId = jetsennet.util.trim(element.selectSingleNode(parentId).text);
			var classId = jetsennet.util.trim(element.selectSingleNode(id).text);
			var className = jetsennet.util.trim(element.selectSingleNode(name).text);//valueOf(ooxml, "text", "");
			var jsonObj = {};
			jsonObj.id = classId;
			jsonObj.pId = classParentId;
			jsonObj.name = className;
			jsonObj.sylltype = 1;//提纲类型 0:学科 1:教材体系目录 2:知识点目录 7:教材体系目录 6:知识点
			jsonObj.sectionid = 3001;//学段
			jsonObj.courseid = 2003;//课程
//			if(params && params.length){
//				
//			}
			if(iconSkinField){//添加css自定义小图标
				var iconSkinClass = jetsennet.util.trim(element.selectSingleNode(iconSkinField).text);
				jsonObj.iconSkin = iconSkinClass;
			}
			//填充当条记录的其他附加属性ATTR:<Record><ID>1</PARENT_ID><ID>0</PARENT_ID><NAME>名称</NAME><ATTR1>1</ATTR1><ATTR2>1</ATTR2></Record>
			var childNodes = element.childNodes;
			for(var c=0; c<childNodes.length; c++){
				var nodeName = childNodes[c].nodeName;
				var nodeValue = childNodes[c].text;
				if(!(nodeName in jsonObj)){//如果其他属性名称与id，pId，name重复，则跳过
					//jsonObj.nodeName = nodeValue;//动态添加属性名不能用.的方式
					jsonObj[nodeName] = nodeValue;
				}
			}
			nodes.push(jsonObj);
			nodeIdArr.push(jsonObj.id);
//			jsonStr = '{id:"'+classId+'",pId:"'+classParentId+'",name:"'+className+'"}';
//			treeNode.push(eval("("+jsonStr+")"));
		}
	}
	
	var treeNodes = [] ;
	var rootIdArr = null ;
	if(!fistLevelBySelf){
		//rootIdArr = [-1] ;
	}else if(rootIds && rootIds.length>0){
		rootIdArr = rootIds ;
	}
	
	if(rootIdArr && rootIdArr.length>0){
		var j = nodes.length;
		while(j--){
			var node = nodes[j] ;
	        if(rootIdArr.contains(node.pId) || nodeIdArr.contains(node.pId))
	        {
	        	treeNodes.push(node);
	        	continue ;
	        }
		}
	}else{
		treeNodes = nodes ;
	}
	
	var setting = {
			//view: {selectedMulti: true},
			//edit: {enable: true,showRemoveBtn: true,showRenameBtn: false},
			check: {
				enable: check
			},
			data: {keep: {parent:true,leaf:true},simpleData: {enable: true}},
			callback: {
				onClick: onclickEvent, //节点点击事件
				onCheck: oncheckEvent,
				onRightClick: onRightClick
			}
	};
	el(treeId).innerHTML = "";
	$(document).ready(function(){
		$.fn.zTree.init($("#"+treeId), setting, treeNodes); //初始化树
	});
	return $.fn.zTree.getZTreeObj(treeId);
}




/**
 * 将没有父子关系的记录按字段名称，以树形结构显示(用于多表无父子字段，仅依靠结果集的字段建树 的结构) id组成方式 第一级ID+ZSPLIT+第二级ID+ZSPLIT+第三级ID+ZSPLIT+.....第N级ID  比如0_3,0_3_5,0_3_5_7  0_4,0_4_6,0_4_6_8
 * @param xml 待解析的xml
 * @param array 显示树结构的数组，如：[["DOMAIN_CODE","DOMAIN_NAME"],["DEVTYPE_ID","DEVTYPE_NAME"],["MANU_ID","MANU_NAME"]];即：第一级节点：DOMAIN_CODE，显示名称：DOMAIN_NAME，第二级节点：DEVTYPE_ID...
 * @param treeId  显示树Id
 * @param onclickEvent 单击事件
 * @param isCheck 是否显示复选框
 * @param oncheckEvent 复选框事件
 * @param onRightClick 右键菜单事件
 */
function createTreeByField(xml,array,treeId,onclickEvent,isCheck,oncheckEvent,onRightClick){
	var allIdMap = new HashMap();
	var treeNode = [];
	var parentNode = {id:"0",pId:"-1",name:"所有分组",open:true};
	treeNode.push(parentNode);
	var xmlDoc = new jetsennet.XmlDoc();
	xmlDoc.loadXML(xml);
	for(var i=0; i<array.length; i++){
//		var domainJson = '{id:"'+"domain_"+obj.DOMAIN_CODE+'",pId:"'+0+'",name:"'+obj.DOMAIN_NAME+'"}';
		var nodes = xmlDoc.getElementsByTagName(array[i][0]);//第i级树的id值
		if(nodes && nodes.length>0){
			for(var n=0;n<nodes.length;n++){
				if(nodes[n].text){
					var jsonStr;
					var id = "";
					var pId = "";
					if(i==0){//第一级父节点为全部
						id = nodes[n].text;
						pId = 0;
					}else{
						for(var j=0; j<i; j++){
							pId += nodes[n].parentNode.selectSingleNode(array[j][0]).text+ZSPLIT;
						}
						id = pId+nodes[n].text;
						if(pId.indexOf(ZSPLIT)>0)
							pId = pId.substring(0,pId.lastIndexOf(ZSPLIT));
					}
					jsonStr = '{id:"'+id+'",pId:"'+pId+'",name:"'+nodes[n].parentNode.selectSingleNode(array[i][1]).text+'",type:"'+array[i][0]+'"}';
					if(!allIdMap.containsKey(id)){//如果有重复则不再往里面放
						allIdMap.put(id, null);
						treeNode.push(eval("("+jsonStr+")"));	
					}
				}
			}
		}
	}
	var setting = {
//			view: {selectedMulti: true},
//			edit: {enable: true,showRemoveBtn: true,showRenameBtn: false},
			check: {enable: isCheck},
			data: {keep: {parent:true,leaf:true},simpleData: {enable: true}},
			callback: {
				onClick: onclickEvent, //节点点击事件
				onCheck: oncheckEvent,
				onRightClick: onRightClick
			}
	};
	el(treeId).innerHTML = "";
	$(document).ready(function(){
		$.fn.zTree.init($("#"+treeId), setting, treeNode); //初始化树
	});
	return $.fn.zTree.getZTreeObj(treeId);
}
/**
 * 将没有父子关系的记录按字段名称，以树形结构显示(用于多表无父子字段，仅依靠结果集的字段建树 的结构)，id组成方式 树级+当前节点ID（这种方式不支持同一个节点在不同树分支下显示的情况）   比如0_3,0_5,7_24
 * @param xml 待解析的xml
 * @param array 显示树结构的数组，如：[["DOMAIN_CODE","DOMAIN_NAME"],["DEVTYPE_ID","DEVTYPE_NAME"],["MANU_ID","MANU_NAME"]];即：第一级节点：DOMAIN_CODE，显示名称：DOMAIN_NAME，第二级节点：DEVTYPE_ID...
 * @param treeId  显示树Id
 * @param onclickEvent 单击事件
 * @param isCheck 是否显示复选框
 * @param oncheckEvent 复选框事件
 * @param onRightClick 右键菜单事件
 * @deprecated  //该方法不支持同一级别有相同ID的情况
 */
function createTreeByFieldWithSimpleId(xml,array,treeId,onclickEvent,isCheck,oncheckEvent,onRightClick){
	var allIdMap = new HashMap();
	var treeNode = [];
	var parentNode = {id:"0",pId:"-1",name:"所有分组",open:true};
	treeNode.push(parentNode);
	var xmlDoc = new jetsennet.XmlDoc();
	xmlDoc.loadXML(xml);
	for(var i=0; i<array.length; i++){
//		var domainJson = '{id:"'+"domain_"+obj.DOMAIN_CODE+'",pId:"'+0+'",name:"'+obj.DOMAIN_NAME+'"}';
		var nodes = xmlDoc.getElementsByTagName(array[i][0]);//第i级树的id值
		if(nodes && nodes.length>0){
			for(var n=0;n<nodes.length;n++){
				if(nodes[n].text){
					var jsonStr;
					var id = i+ZSPLIT+nodes[n].text;
					var pId;
					if(i==0){//第一级父节点为全部
						pId = 0;
					}else{
						pId = (i-1)+ZSPLIT+nodes[n].parentNode.selectSingleNode(array[i-1][0]).text;
					}
					jsonStr = '{id:"'+id+'",pId:"'+pId+'",name:"'+nodes[n].parentNode.selectSingleNode(array[i][1]).text+'",type:"'+array[i][0]+'"}';
					var mapKey = id+pId+"";
					if(!allIdMap.containsKey(mapKey)){//如果有重复则不再往里面放
						allIdMap.put(mapKey, null);
						treeNode.push(eval("("+jsonStr+")"));	
					}
				}
			}
		}
	}
	var setting = {
//			view: {selectedMulti: true},
//			edit: {enable: true,showRemoveBtn: true,showRenameBtn: false},
			check: {enable: isCheck},
			data: {keep: {parent:true,leaf:true},simpleData: {enable: true}},
			callback: {
				onClick: onclickEvent, //节点点击事件
				onCheck: oncheckEvent,
				onRightClick: onRightClick
			}
	};
	el(treeId).innerHTML = "";
	$(document).ready(function(){
		$.fn.zTree.init($("#"+treeId), setting, treeNode); //初始化树
	});
}
/**
 * 通过id获取树节点
 * @param treeId
 * @param nodeId
 */
function getTreeNodeById(treeId,nodeId){
	var treeObj = $.fn.zTree.getZTreeObj(treeId);
	if(treeObj && nodeId){
		return treeObj.getNodeByParam("id",nodeId);
	}
	return null;
}

function getTreeNode(treeId){
	var zTree = $.fn.zTree.getZTreeObj(treeId);//获取tree
	var nodes = zTree.getSelectedNodes(); //获取选中的节点
	var treeNode =nodes[0];//获取选中的第一个节点
	//var treeNodeId = treeNode["id"];//获取id值
	//var treeName = treeNode["name"];//获取name值
	return treeNode;
}

//获取选中节点的父节点
function getTreeNodes(treeId){
	var zTree = $.fn.zTree.getZTreeObj(treeId);//获取tree
	var nodes = zTree.getSelectedNodes(); //获取选中的节点
	var cacheNodeId = "";
	var cacheNodeName = "";
	
	var selectNodeId = "";
	var selectNodeName = "";
	
	var cacheData = [];
	
	if (nodes.length > 0) {
		var selectNode = nodes[0];
		selectNodeId = selectNode["id"];
		selectNodeName = selectNode["name"];
		
		cacheNodeId += selectNodeId+"~";
		cacheNodeName +=selectNodeName+"~";
		
		var pNode  = selectNode.getParentNode();//直接父亲节点
		cacheNodeId = pNode["id"]+"~"+cacheNodeId;
		cacheNodeName = pNode["name"]+"~"+cacheNodeName;
		
		while(!!pNode) {
				pNode  = pNode.getParentNode();//查找父亲节点
				if(pNode!=null){
					//alert("pNode:"+pNode["id"]+"-----"+pNode["name"]);
					cacheNodeId = pNode["id"]+"~"+cacheNodeId;
					cacheNodeName = pNode["name"]+"~"+cacheNodeName;
				}
		}
		alert("getTreeNodes（）：cacheNodeId:"+cacheNodeId);
		alert("getTreeNodes（）：cacheNodeName:"+cacheNodeName);
		cacheData.push(selectNodeId);
		cacheData.push(selectNodeName);
		cacheData.push(cacheNodeId.substring(0, cacheNodeId.length-1));
		cacheData.push(cacheNodeName.substring(0, cacheNodeName.length-1));
		//cacheData = selectNodeId+":"+selectNodeName+":"+cacheNodeId.substring(0, cacheNodeId.length-1)+":"+cacheNodeName.substring(0, cacheNodeName.length-1);
	}
	
	return cacheData;
}

/**
 * 点击树节点，返回已经复选的节点
 * @param treeId 树控件ID
 * @returns 节点组
 */
function getTreeCheckedNode(treeId){
	var zTree = $.fn.zTree.getZTreeObj(treeId);//获取tree
	var nodes = zTree.getCheckedNodes(true); //获取选中的节点
	//var treeNode =nodes[0];//获取选中的第一个节点
	//var treeNodeId = treeNode["id"];//获取id值
	//var treeName = treeNode["name"];//获取name值
	return nodes;
}

/**
 * 获得所有的已经选择的复选框的ID
 * @param treeId
 * @returns {String}
 */
function getTreeCheckedNodes(treeId){
	var treeObj = $.fn.zTree.getZTreeObj(treeId);
	var treeCheckId = "";
	if(treeObj){
		var checkedNodes= treeObj.getCheckedNodes(true);//获得选中节点集合
		if (checkedNodes && checkedNodes.length>0){
			for (var i = 0; i < checkedNodes.length; i++) {
				treeCheckId += checkedNodes[i]["id"]+",";
			}
			alert("treeCheckId:"+treeCheckId);
			return treeCheckId;
		}
	}
}

/**
 * 通过树ID获取树单击选中的节点
 * @param treeId 树ID
 */
function getTreeSelectedNodes(treeId){
	var treeObj = $.fn.zTree.getZTreeObj(treeId);
	if(treeObj){
		return treeObj.getSelectedNodes()[0];
	}
	return null;
}


/**
 * 树的选中节点的ID值遍历
 * @param functionTree 树对象
 */
function getItem(functionTree){
	var userFunctionIds = "";
	var i = 0;
	if(functionTree){
		var checkedNodes= functionTree.getCheckedNodes(true);//获得选中节点集合
		if (checkedNodes && checkedNodes.length>0){
			for (i = 0; i < checkedNodes.length; i++) {
				userFunctionIds += checkedNodes[i]["id"]+",";
			}
			return userFunctionIds;
		}
	}
	return null;
}/**
 * 树的选中节点的check值设定为false
 * @param functionTree 树对象
 */
function setCheckFalse(functionTree,isCheck ){
	if(functionTree){
		var checkedNodes= functionTree.getCheckedNodes(true);//获得选中节点集合
		//清空复选框选中的状态
		if (checkedNodes && checkedNodes.length>0){
			for (var j = 0; j < checkedNodes.length; j++) {
				checkedNodes[j].checked = isCheck;
				functionTree.updateNode(checkedNodes[j]);
			}
		}
	}
}
/**
 * 树的选中节点check值设定为true
 * @param functionTree 树对象
 * @param xml          待解析的xml
 * @param funcId       角色功能ID
 * @param isCheck      check选框的值设定
 */
function setCheckTrue(functionTree,xml,funcId,isCheck){
	if (functionTree){
		var node;
		var xmlDoc = new jetsennet.XmlDoc();
		xmlDoc.loadXML(xml);
		var elements = xmlDoc.documentElement.selectNodes("Record");
		//设置复选框选中的状态
		if (elements && elements.length > 0){
			for ( var i = 0; i < elements.length; i++) {
				var  functionId = jetsennet.util.trim(elements[i].selectSingleNode(funcId).text);
				node = functionTree.getNodeByParam("id",functionId);
				if (node) {
					node.checked = isCheck;
					functionTree.updateNode(node);
				}
			}
		}
	}
}
/**
 * 展开树节点
 * @param treeId 树ID
 * @param nodeId 待展开节点ID
 * @param onclickEvent 节点点击触发的事件（模拟点击节点）
 */
function expandTreeNode(treeId,nodeId,onclickEvent){
	var treeObj = $.fn.zTree.getZTreeObj(treeId);
	if(treeObj && nodeId){
		var node = treeObj.getNodeByParam("id",nodeId);
		if(node){
			treeObj.selectNode(node);
			if(onclickEvent){
				onclickEvent();
			}
		}
	}
}
/**
 * check树节点选中，不级联选中
 * @param treeId 树ID
 * @param nodeIds 待展开节点ID集合
 * @param oncheckEvent checkbox点击触发事件
 */
function checkTreeNode0(treeId,nodeIds,oncheckEvent){
	var treeObj = $.fn.zTree.getZTreeObj(treeId);
	if(treeObj && nodeIds && nodeIds.length>0){
		for(var n=0; n<nodeIds.length; n++){
			var node = treeObj.getNodeByParam("id",nodeIds[n]);
			if(node){
				treeObj.selectNode(node);//展开checked节点
				treeObj.checkNode(node);//选中checked节点
			}
		}
		if(oncheckEvent){
			oncheckEvent();
		}
	}
}

/**
 * check树节点
 * @param treeId 树ID
 * @param nodeIds 待展开节点ID集合
 * @param oncheckEvent checkbox点击触发事件
 */
function checkTreeNode(treeId,nodeIds,oncheckEvent){
	var treeObj = $.fn.zTree.getZTreeObj(treeId);
	if(treeObj && nodeIds && nodeIds.length>0){
		for(var n=0; n<nodeIds.length; n++){
			var node = treeObj.getNodeByParam("id",nodeIds[n]);
			if(node){
				treeObj.checkNode(node, true, true, true);
				treeObj.selectNode(node);
			}
			/*var node = treeObj.getNodeByParam("id",nodeIds[n]);
			if (node) {
				node.checked = true;
				treeObj.updateNode(node);
			}*/
		}
	}
	
}