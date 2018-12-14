/**
添加流程类型
*/
function newBindObject() {
	if(gFlowView.isChanged){
    	jetsennet.confirm("确定是否保存当前流程配置?",function() {
    		saveProcess();
    		newBindObjectState();
    		return true;
    	},{oncancel:function() {
    		initActConfig();
    		newBindObjectState();
    		return true;
    		}
    	});
	}else{
		newBindObjectState();
	}
}


function newBindObjectState(){
	var areaElements = jetsennet.form.getElements('divBindObject');
    jetsennet.form.resetValue(areaElements);
    jetsennet.form.clearValidateState(areaElements);
    el('txt_OBJ_TYPE').disabled = false;
    var window = new jetsennet.ui.Window("new-objtype");
    jQuery.extend(window, { windowStyle: 1, submitBox: true, cancelBox: true, maximizeBox: false, minimizeBox: false, size: { width: 410, height: 0 }, showScroll: false, title: "新增流程类型" });
    window.controls = ["divBindObject"];
    window.onsubmit = function () {
        if (jetsennet.form.validate(areaElements, true)) {
            var bindObject =
            {
            		PROC_TYPE: el("txt_OBJ_TYPE").value,
            		TYPE_NAME: el("txt_OBJ_NAME").value,
            		OBJ_TYPE : 0
            };
            var params = new HashMap();
            params.put("className", "ProcessTypeBusiness");
            params.put("saveXml", jetsennet.xml.serialize(bindObject, "WFM_PROCESSTYPE"));
            var sResult = MTCDAO.execute("commonObjInsert",params);
            if(sResult.errorCode==0){
            	jetsennet.message("新建成功！");
			    jetsennet.ui.Windows.close("new-objtype");
			    gCurrentProcess = null;
                loadProcess();
            }
        }
    };
    window.showDialog();
} 


function editBindObject(keyId,name) {
    var areaElements = jetsennet.form.getElements('divBindObject');
    jetsennet.form.resetValue(areaElements);
    jetsennet.form.clearValidateState(areaElements);
    
    el("txt_OBJ_TYPE").value = keyId;
    el("txt_OBJ_NAME").value = name.substring(0,name.lastIndexOf("["));
    el('txt_OBJ_TYPE').disabled = true;

    var window = new jetsennet.ui.Window("update-objtype");
    jQuery.extend(window, { windowStyle: 1, submitBox: true, cancelBox: true, maximizeBox: false, minimizeBox: false, size: { width: 410, height: 0 }, showScroll: false, title: "编辑流程类型" });
    window.controls = ["divBindObject"];
    window.onsubmit = function () {
        if (jetsennet.form.validate(areaElements, true)) {
            var bindObject =
            {
            		PROC_TYPE: el("txt_OBJ_TYPE").value,
            		TYPE_NAME: el("txt_OBJ_NAME").value,
            		OBJ_TYPE : 0
            };
            var params = new HashMap();
            params.put("className", "ProcessTypeBusiness");
            params.put("updateXml", jetsennet.xml.serialize(bindObject, "WFM_PROCESSTYPE"));
            params.put("isFilterNull", true);
            var sResult = MTCDAO.execute("commonObjUpdateByPk",params);
            if(sResult.errorCode==0){
            	jetsennet.message("更新成功！");
			    jetsennet.ui.Windows.close("update-objtype");
			    gCurrentProcessType.name = el("txt_OBJ_NAME").value + "[" + el("txt_OBJ_TYPE").value + "]";
			    loadProcess();
            }
        }
    };
    window.showDialog();
}


function initObjType(){
	var conditions = [];
	var sResult = MTCDAO.query("commonXmlQuery", "CMOBJ_TYPE", "CMP_OBJTYPE", null, null, conditions, "CMOBJ_TYPE,TYPE_NAME");
	var objs = jetsennet.xml.toObject(sResult.resultVal, "Record");
	jetsennet.ui.DropDownList["txtCmpObjType"].clear();
    if (objs && objs.length > 0) {
        for (var i = 0; i < objs.length; i++) {
            jetsennet.ui.DropDownList["txtCmpObjType"].appendItem({ text: objs[i].TYPE_NAME, value: objs[i].CMOBJ_TYPE });
        }
        jetsennet.ui.DropDownList["txtCmpObjType"].setSelectedIndex(0);
    }
}


function loadProcessType(){
	var sqlQuery1 = new jetsennet.SqlQuery();
    var queryTable1 = jetsennet.createQueryTable("WFM_PROCESSTYPE", "o");
    $.extend(sqlQuery1, { IsPageResult: 0, QueryTable: queryTable1, ResultFields: "PROC_TYPE,TYPE_NAME" });

    var param1 = new HashMap();
    param1.put("queryXml", sqlQuery1.toXml());
    var sResult1 = MTCDAO.execute("commonXmlQuery", param1);
    var objs = jetsennet.xml.toObject(sResult1.resultVal, "Record");
    jetsennet.ui.DropDownList["txtObjType"].clear();
    if (objs && objs.length > 0) {
        for (var i = 0; i < objs.length; i++) {
            jetsennet.ui.DropDownList["txtObjType"].appendItem({ text: objs[i].TYPE_NAME+"["+objs[i].PROC_TYPE+"]", value: objs[i].PROC_TYPE,title: objs[i].TYPE_NAME+"["+objs[i].PROC_TYPE+"]" });
        }
    }
}


/**
添加流程
*/
function newWorkflow() {
	if(gFlowView.isChanged){
    	jetsennet.confirm("确定是否保存当前流程配置?",function() {
    		saveProcess();
    		newWorkflowState();
    		return true;
    	},{oncancel:function() {
    		initActConfig();
    		newWorkflowState();
    		return true;
    		}
    	});
	}else{
		newWorkflowState();
	}
}


function newWorkflowState(){
	el("txtProcessName").value = "";
	el("txtProcessDesc").value = "";
	
	jetsennet.ui.DropDownList.initOptions("txtObjType");
	loadProcessType();
	if(gCurrentProcessType){
	    jetsennet.ui.DropDownList["txtObjType"].setValue(gCurrentProcessType.typeId);
	}else{
	    jetsennet.ui.DropDownList["txtObjType"].setValue(0);
	}
	var areaElements = jetsennet.form.getElements('divProcess');
	jetsennet.form.clearValidateState(areaElements);
    var dialog = new jetsennet.ui.Window("new-object-win");
    $.extend(dialog, { submitBox: true, cancelBox: true, windowStyle: 1, maximizeBox: false, minimizeBox: false, size: { width: 410, height: 0 }, showScroll: false, title: "新建流程" });
    dialog.controls = ["divProcess"];
    dialog.onsubmit = function () {
        if (jetsennet.validate(areaElements, true)) {
            if (jetsennet.util.isNullOrEmpty(el("txtProcessName").value)) {
                jetsennet.alert("请输入流程名称!");
                return false;
            }
            var flowInfo = {};
            flowInfo.PROC_NAME = el("txtProcessName").value.trim();
            flowInfo.PROC_DESC = el("txtProcessDesc").value;
            flowInfo.PROC_TYPE= attributeOf(el("txtObjType"), "selectedValue", "");
            flowInfo.OBJ_TYPE= attributeOf(el("txtCmpObjType"), "selectedValue", "");
            flowInfo.FLOW_TYPE = "0";
            if (flowInfo.PROC_TYPE== "") {
                jetsennet.alert("请选择流程类型!");
                return;
            }
            flowInfo.PROC_STATE = 0;

            var params = new HashMap();
            params.put("className", "ProcessBusiness");
            params.put("saveXml", jetsennet.xml.serialize(flowInfo, "FlowInfo"));
            var sResult = WFMDAO.execute("commonObjInsert",params,{error:function(msg){jetsennet.error(msg);}});
            if(sResult.errorCode==0){
            	jetsennet.message("新建成功！");
            	gFlowView.clearView();
                gCurrentProcess = null;
                loadProcess();
                gCurrentProcessType = {};
                currentTreeId = "process_"+sResult.resultVal;
    			leftMenuTree.$.linetree.selectId = currentTreeId;
    			//open设为true
    			var treeArray = leftMenuTree.treeData;
    			for ( var i = 0; i < treeArray.length; i++) {
					if(treeArray[i].id=="processType_"+flowInfo.PROC_TYPE){
						treeArray[i].open = true;
					}
				}
				processChanged(sResult.resultVal,flowInfo.PROC_TYPE, flowInfo.FLOW_TYPE, flowInfo.PROC_STATE, flowInfo.PROC_NAME, flowInfo.PROC_DESC,flowInfo.OBJ_TYPE);
                jetsennet.ui.Windows.close("new-object-win");
            }
        }
    };
    dialog.showDialog();
}


/**
编辑流程
*/
function editWorkflow(procId, objType, procType, procName, procDesc,objDataType) {
	if(gCurrentProcessType&&gCurrentProcessType.typeId){
		editBindObject(gCurrentProcessType.typeId,gCurrentProcessType.name);
		return;
	}
    var procInfo = procId == null ? gCurrentProcess : { procId: procId, objType: objType, procType: procType, procName: procName, procDesc: procDesc,objDataType:objDataType };
    if (procInfo == null)
        return;
    loadProcessType();
    el("txtProcessName").value = procInfo.procName;
    el("txtProcessDesc").value = procInfo.procDesc=="undefined"?"":procInfo.procDesc;
    jetsennet.ui.DropDownList.initOptions("txtObjType");
    setTimeout(function(){jetsennet.ui.DropDownList["txtObjType"].setValue(procInfo.objType);},0);
    jetsennet.ui.DropDownList.initOptions("txtCmpObjType");
    jetsennet.ui.DropDownList["txtCmpObjType"].setValue(procInfo.objDataType);

    var areaElements = jetsennet.form.getElements('divProcess');
    jetsennet.form.clearValidateState(areaElements);
    var dialog = new jetsennet.ui.Window("edit-object-win");
    $.extend(dialog, { submitBox: true, cancelBox: true, windowStyle: 1, maximizeBox: false, minimizeBox: false, size: { width: 410, height: 0 }, showScroll: false, title: "编辑流程" });
    dialog.controls = ["divProcess"];
    dialog.onsubmit = function () {
        if (jetsennet.validate(areaElements, true)) {
            if (jetsennet.util.isNullOrEmpty(el("txtProcessName").value)) {
                jetsennet.alert("请输入流程名称!");
                return false;
            }
            var flowInfo = {};
            flowInfo.PROC_ID = procInfo.procId;
            flowInfo.PROC_NAME = el("txtProcessName").value.trim();
            flowInfo.PROC_DESC = el("txtProcessDesc").value;
            flowInfo.PROC_TYPE= attributeOf(el("txtObjType"), "selectedValue", "");
            flowInfo.OBJ_TYPE= attributeOf(el("txtCmpObjType"), "selectedValue", "");
            if (flowInfo.PROC_TYPE== "" || flowInfo.PROC_TYPE== "0") {
                jetsennet.alert("请选择流程类型!");
                return;
            }
            flowInfo.PROC_STATE = null;

            var params = new HashMap();
            params.put("className", "ProcessBusiness");
            params.put("updateXml", jetsennet.xml.serialize(flowInfo, "FlowInfo"));
            params.put("isFilterNull", true);
            var sResult = WFMDAO.execute("commonObjUpdateByPk",params,{error:function(msg){jetsennet.error(msg);}});

            if(sResult.errorCode==0){
            	jetsennet.message("编辑成功！");
                gCurrentProcess = null;
                loadProcess();
                jetsennet.ui.Windows.close("edit-object-win");
            }
        }
    };
    dialog.showDialog();
}
/**
删除流程
*/
function deleteWorkflow() {
	var confimStr = "确定删除?";
	if(!gCurrentProcessType.typeId&&!gCurrentProcess){
		jetsennet.alert("请选择要删除的类型或流程！");
		return;
	}
	if(gCurrentProcessType.typeId&&gCurrentProcessType.procIds){
		jetsennet.alert("请先删除该类型下的流程！");
		return;
	}
    jetsennet.confirm(confimStr, function () {
    	var params = new HashMap();
    	if(gCurrentProcessType.typeId){
    		params.put("className", "ProcessTypeBusiness");
    	    params.put("deleteIds", gCurrentProcessType.typeId);
    	}else{
    		params.put("className", "ProcessBusiness");
    		params.put("deleteIds", gCurrentProcess.procId);
    	}
        var sResult = WFMDAO.execute("commonObjDelete",params);
        if(sResult.errorCode==0){
        	jetsennet.message("删除成功！");
        	currentTreeId = "";
        	gFlowView.isChanged = false;
        	gFlowView.clearView();
        	gCurrentProcessType = {};
            gCurrentProcess = null;
            loadProcess();
        }else{
        	jetsennet.error("删除失败，"+sResult.errorString);
        }
        return true;
    });
}


/**
保存流程
*/
function saveProcess() {
	if(gCurrentProcessType.typeId){
		return;
	}
	if(gCurrentProcess.procState=="0"){
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
	}else{
		jetsennet.alert("编辑状态可以保存！");
		return;
	}
}
/**
导出流程
*/
function exportWorkflow() {
	if(gCurrentProcessType.typeId){
		jetsennet.alert("请选择要导出的流程！");
		return;
	}
	if(gFlowView.isChanged){
    	jetsennet.confirm("确定是否保存当前流程配置?",function() {
    		saveProcess();
    		exportWorkflowState();
    		return true;
    	},{oncancel:function() {
    		initActConfig();
    		exportWorkflowState();
    		return true;
    		}
    	});
	}else{
		exportWorkflowState();
	}
}


function isIE() { //ie?  
	if (!!window.ActiveXObject || "ActiveXObject" in window)  
		return true;  
	else  
		return false;  
}  


function exportWorkflowState(){
	el("isIE").value = isIE();
	el('procId').value = gCurrentProcess.procId;
    el('frmExport').submit();
}
/**
导入流程
*/
function importWorkflow() {
	if(gFlowView.isChanged){
    	jetsennet.confirm("确定是否保存当前流程配置?",function() {
    		saveProcess();
    		importWorkflowState();
    		return true;
    	},{oncancel:function() {
    		initActConfig();
    		importWorkflowState();
    		return true;
    		}
    	});
	}else{
		importWorkflowState();
	}
}


function importWorkflowState(){
	var file = el("fileImport");
    if (file.outerHTML) {
        file.outerHTML = file.outerHTML;
    }
    else {
        file.value = '';
    }
    var dialog = new jetsennet.ui.Window("import-object-win");
    $.extend(dialog, { submitBox: true, cancelBox: true, windowStyle: 1, maximizeBox: false, minimizeBox: false, size: { width:500, height: 0 }, showScroll: false, title: "导入工作流程" });
    dialog.controls = ["divImport"];
    dialog.onsubmit = function () {
        if (el('fileImport').value == "") {
            jetsennet.alert("请选择要导入的XML文件!");
            return;
        }
        var hides = el('fileImport').value.substring(el('fileImport').value.lastIndexOf(".")+1);
        if(hides&&hides.toLowerCase()=="xml"){
        	el('frmImport').submit();
        }else{
        	jetsennet.alert("请导入XML文件!");
        	return;
        }
    };
    dialog.showDialog();
    dialog.adjustSize();
}


function importDone() {
    jetsennet.message("导入成功！");
    loadProcess();
    jetsennet.ui.Windows.close("import-object-win");
}
/**
复制流程
*/
function copyProcess() {
	if(gCurrentProcessType.typeId){
		return;
	}
	if(gFlowView.isChanged){
    	jetsennet.confirm("确定是否保存当前流程配置?",function() {
    		saveProcess();
    		copyProcessState();
    		return true;
    	},{oncancel:function() {
    		initActConfig();
    		copyProcessState();
    		return true;
    		}
    	});
	}else{
		copyProcessState();
	}
}

function copyProcessState(){
	var params = new HashMap();
    params.put("procName", gCurrentProcess.procName);
    params.put("procType", gCurrentProcess.objType);
    var sResult = WFMDAO.execute("getNewProcessName",params);
    if(sResult.errorCode==0){
    	el('txtCopyFlowName').value = sResult.resultVal;
    }else{
    	el('txtCopyFlowName').value = gCurrentProcess.procName;
    }
    var dialog = new jetsennet.ui.Window("copy-object-win");
    $.extend(dialog, { submitBox: true, cancelBox: true, windowStyle: 1, maximizeBox: false, minimizeBox: false, size: { width: 450, height: 0 }, showScroll: false, title: "复制工作流程" });
    dialog.controls = ["divCopyProcess"];
    dialog.onsubmit = function () {

        if (jetsennet.validate([el('txtCopyFlowName')])) {
            var flowInfo = {};
            flowInfo.PROC_NAME = el('txtCopyFlowName').value;
            flowInfo.PROC_DESC = gCurrentProcess.procDesc;
            flowInfo.PROC_TYPE = gCurrentProcess.objType;
            flowInfo.FLOW_TYPE = gCurrentProcess.procType;
            flowInfo.OBJ_TYPE = gCurrentProcess.objDataType;
            flowInfo.PROC_STATE = 0;
            
            var params = new HashMap();
            params.put("className", "ProcessBusiness");
            params.put("saveXml", jetsennet.xml.serialize(flowInfo, "FlowInfo"));
            var sResult = WFMDAO.execute("commonObjInsert",params);
            if(sResult.errorCode==0){
            	var params1 = new HashMap();
                params1.put("processXml", getProcessXml(sResult.resultVal)+",copy");
                var sResult1 = WFMDAO.execute("saveProcess",params1);
                if(sResult1.errorCode==0){
                	jetsennet.message("复制成功！");
                    gCurrentProcess = null;
                    loadProcess();
                    jetsennet.ui.Windows.close("copy-object-win");
                }
            }
        }
    };
    dialog.showDialog();
}

/**
激活流程
*/
function activeProcess(state) {
	if(gCurrentProcessType.typeId){
		return;
	}
    if (gCurrentProcess.procState == state) {
        return;
    }
    if((gCurrentProcess.procState==10||gCurrentProcess.procState==11)&&state==0){
    	jetsennet.alert("请先取消激活！");
    	return;
    }
    if(gCurrentProcess.procState==0&&state==100){
    	jetsennet.alert("请先激活！");
    	return;
    }
    if(state==12){
    	if(gCurrentProcess.procState!=10){
        	jetsennet.alert("只有缺省状态才能取消缺省！");
        	return;
        }
    	state=11;
    }
    if(gFlowView.isChanged){
    	jetsennet.confirm("确定是否保存当前流程配置?",function() {
    		saveProcess();
    		activeProcessState(state);
    		return true;
    	},{oncancel:function() {
    		activeProcessState(state);
    		initActConfig();
    		return true;
    		}
    	});
	}else{
		activeProcessState(state);
//		initActConfig();
	}
}

/**
 * 流程状态变更
 * @param state
 */
function activeProcessState(state){
	var params = new HashMap();
    params.put("procId", gCurrentProcess.procId);
    params.put("objType", gCurrentProcess.objType);
    params.put("state", state);
    var sResult = WFMDAO.execute("activeProcess",params);
    if(sResult.errorCode==0){
		jetsennet.message("操作成功!");
		loadProcess();
		var param = new HashMap();
        param.put("procId", gCurrentProcess.procId);
        var sResult1 = WFMDAO.execute("getProcess",param);
        if(sResult1.errorCode==0){
        	setProcessXml(sResult1.resultVal);
        }
    }else{
    	jetsennet.error("操作失败!"+sResult.errorString);
    }
}


function testProcess(){
	if(gCurrentProcess.procState!=10&&gCurrentProcess.procState!=11){
    	jetsennet.alert("只有激活和缺省状态的流程可以试用！");
    	return;
    }
	var areaElements = jetsennet.form.getElements('divtestObject');
    jetsennet.form.resetValue(areaElements);
    jetsennet.form.clearValidateState(areaElements);
    FileDomOperate.initFilePathDom();
    jetsennet.ui.DropDownList.initOptions("saveFileGroup");
	jetsennet.ui.DropDownList["saveFileGroup"].setValue(1);
    var window = new jetsennet.ui.Window("test-objtype");
    jQuery.extend(window, { windowStyle: 1, submitBox: true, cancelBox: true, maximizeBox: false, minimizeBox: false, size: { width: 530, height: 0 }, showScroll: false, title: "试用文件配置" });
    jQuery.extend(window, { attachButtons: [{ text: "添加路径", clickEvent: function () { FileDomOperate.addFilePathDom(); } }]});
    window.controls = ["divtestObject"];
    window.onsubmit = function () {
    	areaElements = jetsennet.form.getElements('divtestObject');
        if (jetsennet.form.validate(areaElements, true)) {
        	var fileNamesArray = $("input[name='saveFilePath']");
        	var filepathArr = [];
        	for ( var i = 0; i < fileNamesArray.length; i++) {
        		filepathArr.push($(fileNamesArray[i]).val());
			}
        	var testProcessXml = {
        		GROUP_TYPE: jetsennet.ui.DropDownList["saveFileGroup"].selectedValue ,
        		OBJCM_TYPE: gCurrentProcess.objDataType,
        		PROC_TYPE:gCurrentProcess.procType,
        		OBJ_TYPE:gCurrentProcess.objType,
        		PROC_ID:gCurrentProcess.procId,
        		PROC_NAME:gCurrentProcess.procName,
        		FILE_PATHS: [{FILE_PATH:filepathArr}]
        	};
        	var params = new HashMap();
            params.put("testProcXml", jetsennet.xml.serialize(testProcessXml, "TEST_PROCESS"));
            var sResult = WFMDAO.execute("createTestProc",params);
            if(sResult.errorCode==0){
            	jetsennet.message("操作成功!");
            	jetsennet.ui.Windows.close("test-objtype");
            }
        }
    };
    window.showDialog();
}


function initInputDisabled(){
	if(gCurrentProcess.procState!=0){
    	var inputlist = $("#divActConfig").find("*");
    	$.each($(inputlist),function(i,item){
    		$(item).attr("disabled","disabled");
    	});
    }
}

/**
 * 取消之后初始化配置
 */
function initActConfig(){
	var param = new HashMap();
    param.put("procId", gCurrentProcess.procId);
    var sResult1 = WFMDAO.execute("getProcess",param);
    if(sResult1.errorCode==0){
    	setProcessXml(sResult1.resultVal);
    }
}

//试用 弹出框 对文件路径的添加和删除
var FileDomOperate = (function(){
	return{
		//添加
		addFilePathDom: function() {
			var appendhtml = [];
			appendhtml.push('<div class="form-group" name="add-filepath"><label class="col-sm-4 control-label">文件路径：</label><div class="col-sm-7" style="padding-right:3px">');
			appendhtml.push('<div class="input-group input-group-sm"><input name="saveFilePath" type="text" validatetype="NotEmpty,maxlength" maxlength="300" class="form-control" />');
			appendhtml.push('<span class="input-group-addon" style="color: Red" disabled="disabled">*</span></div></div><div class="col-sm-1" style="padding-left:3px">');
			appendhtml.push('<span style="cursor:pointer;" onclick="FileDomOperate.delFilePathDom(this);" title="删除"><img src="../images/cel_del.png" style="height:18px;"/></span></div></div>');
			$("#filepathinit").after(appendhtml.join(''));
			var contentHeight = $("#test-objtype_content").css("height");
			var contentHeightInt = contentHeight.substring(0,contentHeight.length-2);
			$("#test-objtype_content").css("height",parseInt(contentHeightInt)+45+"px");
		},
		//删除
		delFilePathDom: function(obj) {
			$(obj.parentNode.parentNode).remove();
			var contentHeight = $("#test-objtype_content").css("height");
			var contentHeightInt = contentHeight.substring(0,contentHeight.length-2);
			$("#test-objtype_content").css("height",parseInt(contentHeightInt)-45+"px");
		},
		initFilePathDom: function(){
			$("div[name='add-filepath']").remove();
		}
	};
}());


