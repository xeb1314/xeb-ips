var resultXml = "";
var ruleIndex = 0;
var gAssignsPane;
/**
加载用于任务指派的数据
*/
function loadAssignData() {
    var sResult = WFMDAO.execute("getTaskAssignRule");
    resultXml = sResult.resultVal;
    var obj = jetsennet.xml.toObject(sResult.resultVal);
    showTabPane(obj);
    initRuleContent(obj);
}


/**
 * 显示内容
 * @param obj
 * @return
 */
function initRuleContent(obj){
	if (obj == null || obj["ruleItem"] == null)
        return;
	
	var objRuleItemArray = obj["ruleItem"].length?obj["ruleItem"]:[obj["ruleItem"]];
	for ( var i = 0; i < objRuleItemArray.length; i++) {
		if (objRuleItemArray[i].VIEWTYPE=="1") 
		{
        	jetsennet.ui.DropDownList.initOptions("txtAssignRule"+objRuleItemArray[i].TYPE);
        	bindDropdownList(el("txtAssignRule"+objRuleItemArray[i].TYPE), obj, "item"+objRuleItemArray[i].TYPE, "ID", "NAME");
		}
		else if (objRuleItemArray[i].VIEWTYPE=="2")
		{
        	showTreeContent(obj,objRuleItemArray[i].TYPE);
		}
    }
}


/**
 * 显示标签
 * @param obj
 * @return
 */
function showTabPane(obj){
	if (obj == null || obj["ruleItem"] == null)
        return;
	
	var objRuleItemArray = obj["ruleItem"];
	var assignRuleDivArray = [];
	for ( var i = 0; i < objRuleItemArray.length; i++) 
	{
		var checked = "";
		if(i==0){
			checked = "checked";
		}
		assignRuleDivArray.push('<input type="radio" name="assignType" value='+objRuleItemArray[i].TYPE+' class="checkboxMid" '+checked+' onclick="changeTextContent('+objRuleItemArray[i].TYPE+','+i+')"/><span class="checkboxMid">&nbsp;&nbsp;'+objRuleItemArray[i].NAME+'&nbsp;&nbsp;&nbsp;&nbsp;</span>');
	}
	$("#controlAssignDiv").html(assignRuleDivArray.join(''));
	assignRuleDivArray = [];
	for ( var i = 0; i < objRuleItemArray.length; i++) 
	{
		var displayStr = 'style="display: none;"';
		if(i==0){
			displayStr = '';
		}
		if(objRuleItemArray[i].VIEWTYPE=="1")
		{
			assignRuleDivArray.push('<div id="div_'+objRuleItemArray[i].TYPE+'" '+displayStr+'><label class="col-sm-2 control-label">'+objRuleItemArray[i].NAME+'：</label><div class="input-group input-group-sm col-sm-7"><label style="position: relative; font-weight: normal; margin-bottom: 0;width:100%;"><input id="txtAssignRule'+objRuleItemArray[i].TYPE+'" class="form-control input-sm" onclick="jetsennet.ui.DropDownList.show(this)" readonly/><i class="fa fa-lg fa-caret-down" style="position: absolute;top: 10px;right: 10px;z-index:10;"></i></label></div></div>');
		}
		else if(objRuleItemArray[i].VIEWTYPE=="2")
		{
			assignRuleDivArray.push('<div id="div_'+objRuleItemArray[i].TYPE+'" '+displayStr+'><input type="hidden" id="hidTreeId'+objRuleItemArray[i].TYPE+'"/>');
			assignRuleDivArray.push('<label class="col-sm-2 control-label">'+objRuleItemArray[i].NAME+'：</label><div class="col-sm-7"><input id="txtAssignRule'+objRuleItemArray[i].TYPE+'" style="width: 255px;" onclick="jetsennet.popup(el(\'divFunctionTree'+objRuleItemArray[i].TYPE+'\'),{reference:this})" class="form-control input-sm"/></div>');
			jQuery("body").append('<div id="divFunctionTree'+objRuleItemArray[i].TYPE+'" style="display: none; width: 255px; height: 250px; overflow: auto;" class="jetsen-tree-divc"></div></div>');
		}
		else
		{
			assignRuleDivArray.push('<div id="div_'+objRuleItemArray[i].TYPE+'" '+displayStr+'><label class="col-sm-2 control-label">'+objRuleItemArray[i].NAME+'：</label><div class="col-sm-7"><input id="txtAssignRule'+objRuleItemArray[i].TYPE+'" class="form-control input-sm"/></div></div>');
		}
	}
	$("#assignSetDiv").html(assignRuleDivArray.join(''));
}


function changeTextContent(type,index){
	ruleIndex = index;
	$("#assignSetDiv").children().each(function(){
		if(this.id=="div_"+type){
			el(this.id).style.display = "";
		}else{
			el(this.id).style.display = "none";
		}
	});
}


function showTreeContent(obj,type){
	if (obj == null || obj["item"+type] == null)
        return;
    gFunction = obj["item"+type].length ? obj["item"+type] : [obj["item"+type]];

    var funTree = new jetsennet.ui.Tree("function-rule"+type);
    var len = gFunction.length;

    for (var i = 0; i < len; i++) {
        if ((gFunction[i].PARENT_ID==null || gFunction[i].PARENT_ID == "" || gFunction[i].PARENT_ID == "0") && gFunction[i].ID != "0") {
            var treeItem = new jetsennet.ui.TreeItem(gFunction[i].NAME);
            treeItem.onclick = function () { jetsennet.cancelEvent(); };
            funTree.addItem(treeItem);
            buildFunctionTree(treeItem, gFunction, gFunction[i].ID, gFunction[i].NAME,type);
        }
    }

    funTree.render("divFunctionTree"+type);
}


function buildFunctionTree(treeItem, treeValue, parentId, pName,type) {
    for (var i = 0; i < treeValue.length; i++) {
        if (treeValue[i].PARENT_ID == parentId) {
            var subTreeItem = new jetsennet.ui.TreeItem(treeValue[i].NAME, "javascript:setFunctionId(" + treeValue[i].ID + ",'" + pName + "-" + treeValue[i].NAME + "',"+type+")");
            subTreeItem = buildFunctionTree(subTreeItem, treeValue, treeValue[i].ID, treeValue[i].NAME,type);
            treeItem.addItem(subTreeItem);
        }
    }
    return treeItem;
}
function setFunctionId(id, name,type) {
    el('txtAssignRule'+type).value = name;
    el('hidTreeId'+type).value = id;
}

function getFunctionNameById(id) {
	if(gFunction==null){
		return;
	}
    for (var i = 0; i < gFunction.length; i++) {
        if (gFunction[i].ID == id) {
            return gFunction[i].NAME;
        }
    }
    return "";
}
/**
任务指派
*/
function taskAssign(node) {
	
    if (!resultXml) {
        loadAssignData();
    }
    
    if(!resultXml){
    	return;
    }
    var areaElements = jetsennet.form.getElements('divAssignRule');
    jetsennet.form.clearValidateState(areaElements);

    var dialog = new jetsennet.ui.Window("edit-rule-win");
    jQuery.extend(dialog, { submitBox: true, cancelBox: true, windowStyle: 1, maximizeBox: false, minimizeBox: false, size: { width: 500, height: 250 },
        title: "任务指派『" + node.nodeParam.name + "』"
    });
    dialog.controls = ["divAssignRule"];
    dialog.onsubmit = function () {
        if (jetsennet.form.validate(areaElements, true)&&resultXml) {
        	var obj = jetsennet.xml.toObject(resultXml);
        	if (obj == null || obj["ruleItem"] == null)
        		return;
        	var objRuleItemArray = obj["ruleItem"];
        	var aRule = { assignType: objRuleItemArray[ruleIndex].TYPE, assignObjId: "",assignParam:"" };
            switch (parseInt(objRuleItemArray[ruleIndex].VIEWTYPE)) {
                case 1:
                    aRule.assignObjId = attributeOf(el("txtAssignRule"+objRuleItemArray[ruleIndex].TYPE), "selectedValue", "");
                    break;
                case 0:
                    aRule.assignObjId = el("txtAssignRule"+objRuleItemArray[ruleIndex].TYPE).value;
                    break;
                case 2:
                    aRule.assignObjId =  el('hidTreeId'+objRuleItemArray[ruleIndex].TYPE).value;
                    break;
                default:
                    return false;
            }

            if (aRule.assignObjId == "" || aRule.assignObjId == "0") {
                jetsennet.alert("请选择规则!");
                return false;
            }

            node.nodeParam.assignRule = aRule;
            //如果是已使用的流程，直接更新规则
            if (!gFlowView.isDesignMode) {
                var assignData = jetsennet.xml.serialize({ "PROCACT_ID": node.nodeParam.id,
                    "ASSIGN_TYPE": aRule.assignType,
                    "ASSIGN_OBJID": aRule.assignObjId,
                    "ASSIGN_PARAM": aRule.assignParam
                }, "AssignRule");

                var params = new HashMap();
	            params.put("className", "TaskAssignRuleBusiness");
	            params.put("updateXml",  assignData);
	            params.put("isFilterNull", true);
	            var sResult = WFMDAO.execute("commonObjUpdateByPk",params);
	            if(sResult.errorCode==0){
	            	jetsennet.message("保存成功");
        		    gFlowView.isChanged = true;
        		    jetsennet.ui.Windows.close("edit-rule-win");
	            }else{
	            	jetsennet.message("保存失败");
	            }
            }
            else {
                jetsennet.ui.Windows.close("edit-rule-win");
            }
        }
    };
    dialog.showDialog();
    initDailogValue(node);
}

function initDailogValue(node){
    if(resultXml){
    	var obj = jetsennet.xml.toObject(resultXml);
    	if (obj == null || obj["ruleItem"] == null)
            return;
    	var objRuleItemArray = obj["ruleItem"];
    	for ( var i = 0; i < objRuleItemArray.length; i++) {
    		if (objRuleItemArray[i].VIEWTYPE=="1") {
    			jetsennet.ui.DropDownList.initOptions("txtAssignRule"+objRuleItemArray[i].TYPE);
    			jetsennet.ui.DropDownList["txtAssignRule"+objRuleItemArray[i].TYPE].setValue("");
    		}else if (objRuleItemArray[i].VIEWTYPE=="2"){
    			el('txtAssignRule'+objRuleItemArray[i].TYPE).value = "";
    		    el('hidTreeId'+objRuleItemArray[i].TYPE).value = "";
    		}else{
    			el('txtAssignRule'+objRuleItemArray[i].TYPE).value = "";
    		}
    		if (node.nodeParam.assignRule != null) {
    			var tempRule = node.nodeParam.assignRule;
    			if(tempRule.assignType==objRuleItemArray[i].TYPE){
    				if (objRuleItemArray[i].VIEWTYPE=="1") {
    	    			jetsennet.ui.DropDownList.initOptions("txtAssignRule"+objRuleItemArray[i].TYPE);
    	    			jetsennet.ui.DropDownList["txtAssignRule"+objRuleItemArray[i].TYPE].setValue(tempRule.assignObjId);
    	    		}else if (objRuleItemArray[i].VIEWTYPE=="2"){
    	    			el('txtAssignRule'+objRuleItemArray[i].TYPE).value = getFunctionNameById(tempRule.assignObjId);
    	    		    el('hidTreeId'+objRuleItemArray[i].TYPE).value = tempRule.assignObjId;
    	    		}else{
    	    			el('txtAssignRule'+objRuleItemArray[i].TYPE).value = tempRule.assignObjId;
    	    		}
    				changeTextContent(objRuleItemArray[i].TYPE,i);
    				$("input[type='radio']").each(function(){
    					if($(this).val()==tempRule.assignType){
    						this.checked = true;
    					}
    				});
    			}
    			tempRule = null;
    		}
        }
    }
}