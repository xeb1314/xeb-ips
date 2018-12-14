jetsennet.require([ "gridlist", "pagebar", "pageframe","window", "bootstrap/moment", "bootstrap/daterangepicker", "crud","autocomplete",
                    "datepicker","window", "menu","tabpane", "jetsentree","flowview", "accordion","timeeditor","vue/vueutil","vue/vue"]);
jetsennet.importCss("bootstrap/daterangepicker-bs3");
    var gFlowView;
    var gCurrentProcess;
    var gCurrentProcessType;
    var gXmlData;
    var gFunction;
    var gAssignType = -1;
    var gWorkflow;
    var currentIndex;
    var widthArray = [];
    
    function pageInit() {
    	var bodyWidth = jQuery("#divPageFrame").css("width");
//    	jQuery("#divPageFrame").pageFrame({minSize: { width: parseInt(bodyWidth.substring(0,bodyWidth.length-2)), height: 300},layout : [ {size:{width:350, height:0}, splitType: 1, layout: [45, {splitType: 0, layout: [76 ,"auto"]}]}, {splitType: 1, layout: [45,175, "auto"]} ] }).sizeBind(window);
    	var heightCountStr = $("#designPanelDiv").css("height");
    	var heightCounts = heightCountStr.substring(0,heightCountStr.length-2);
//    	$("#divDesign").css("height",(parseInt(heightCounts)-46-175)+"px");
    	jetsennet.ui.DropDownList.initOptions("txtCmpObjType", true);
    	jetsennet.ui.DropDownList.initOptions('txtObjType', true);
    	initWfView();
    	initObjType();
    	loadProcess();
    	initStoreBox();
    }


// 初始化界面
function initWfView() {
    //初始化流程视图
    gFlowView = new jetsennet.ui.WfView(el("divDesign"));
    gFlowView.isDesignMode = false;
//    gFlowView.autoScroll = true;
    gFlowView.reportScroll = true;
    gFlowView.onnodeconfig = function (node) {
        showParamConfig(node);
    };
    gFlowView.onnodedblclick = function (node) {
        showParamConfig(node);
    };
    gFlowView.onnodeassign = function (node) {
        taskAssign(node);
    };
    gFlowView.render();
    
    // 初始化流程节点
    var sqlQuery = new jetsennet.SqlQuery();
    var queryTable = jetsennet.createQueryTable("WFM_ACTIVITY", "a");
    queryTable.addJoinTable(jetsennet.createJoinTable("NET_CTRLWORD", "c", "c.CW_ID=a.ACT_CLASS", jetsennet.TableJoinType.Left));
    jQuery.extend(sqlQuery, { IsPageResult: 0, QueryTable: queryTable, ResultFields: "ACT_ID,ACT_NAME,ACT_TYPE,ACT_CLASS,c.CW_NAME,ACT_DESC,ACT_ICON",OrderString:"ORDER BY ACT_CLASS" });
    var condition = new jetsennet.SqlConditionCollection();
    condition.SqlConditions.push(jetsennet.SqlCondition.create("ACT_ID", "10001", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.NotEqual, jetsennet.SqlParamType.Numeric));
    sqlQuery.Conditions = condition;
    
    var param = new HashMap();
    param.put("queryXml", sqlQuery.toXml());
    var sResult = MTCDAO.execute("commonXmlQuery", param);
    var objs = jetsennet.xml.toObject(sResult.resultVal, "Record");
    bindingActivity(objs);
    
    //节点可拖拽
    jQuery('.dragDiv').draggable({
        handle: el('divDrag'),
        limit: true,
        absoluteDrag: true,
        dragClone: true,
        dragNone: true,
        limitOptions: { container: el('divDesign') },
        onstart: function (pos) {
            $(this.dragControl).css({ "top": -100, "left": -100 });
            jQuery(this.dragControl).appendTo("body");
        },
        onstop: function (pos) {
        	if(gCurrentProcess==null){
        		return;
        	}
            //document.style.cursor = "default";
            var mousePos = jetsennet.util.getMousePosition();
            if (gFlowView.isDesignMode && jetsennet.util.isInPosition(mousePos, el("divDesign"))) {
                var nodeData = { id: -1, actId: this.drag.getAttribute("actId"),actClass:this.drag.getAttribute("actClass"), name: this.drag.getAttribute("actName"), actType: this.drag.getAttribute("actType") };
                var newnode = gFlowView.addNodeByType(nodeData.actType, nodeData, mousePos);
                addNodeParam(newnode);
            }
        },
        onmove: function (pos) {
            if (!gFlowView.isDesignMode) {
                jQuery(this.dragControl).css({ "cursor": "not-allowed" });
            }
        }
    });
}

//拖动节点 加载节点默认配置
function addNodeParam(node){
	var items;
    if (node.nodeParam.actType == 2 || node.nodeParam.actType == 3) {
    	var param = new HashMap();
        param.put("actId", node.nodeParam.actId);
        var sResult = WFMDAO.execute("getActConfig", param);
        if(sResult.resultVal){
        	items = jetsennet.xml.deserialize(sResult.resultVal, { igoreAttribute: false }).item;
        }
    }
    node.nodeParam.parameter = getAllDropNodeParam(items, node);
}

//得到默认配置
function getAllDropNodeParam(items,node){
	var params = {};
    var str = "";
    var controlItemArray = [];
    var controlValueItemArray = [];
    //保存默认受控制的item
    if(items){
        items = items.length ? items : [items];
        for (var i = 0; i < items.length; i++) {
        	if(valueOf(items[i], "@controlFlag", "")){
        		controlItemArray.push(items[i]);
        	}
        }
        for (var i = 0; i < items.length; i++) {
        	if(valueOf(items[i], "@controlValue", "")){
        		var controlItemName = items[i]["@controlValue"].split("~")[0];
        		var controlItemValue = items[i]["@controlValue"].split("~")[1].split("_");
        		jQuery.each(controlItemArray, function (j) {
    				if(controlItemArray[j]["@name"]==controlItemName&&controlItemValue.in_array(controlItemArray[j]["@deafult"])){
    					controlValueItemArray.push(items[i]["@name"]);
    				}
        		});
        	}
        }
    }
    if(items){
        items = items.length ? items : [items];
        for (var i = 0; i < items.length; i++) {
            var name = items[i]["@name"];
            var source = items[i]["@source"];
            var deafult = items[i]["@deafult"];
            var deafultValue = items[i]["@deafultValue"];
            var controlValue = items[i]["@controlValue"];
            if (jetsennet.util.isNullOrEmpty(name)) {
                continue;
            }
            if(controlValue&&!controlValueItemArray.in_array(name)){
            	continue;
            }
            if(source==4){
            	var value = "";
            	if(deafultValue){
            		value = deafultValue;
            	}else{
            		if(deafult=="true"){
            			value = "true";
            		}else{
            			value = "false";
            		}
            	}
            	str += jetsennet.xml.serialize({"@switch":deafult=="true"?"on":"off",$:value},name);
            }else if(source==5){
            	if(items[i]["@filed"]){
            		var filed = items[i]["@filed"].split(",");
            		for ( var k = 0; k < filed.length; k++) {
            			if(deafult){
            				params[name+filed[k]] = deafult.split(",")[k];
            			}else{
            				params[name+filed[k]] = "";
            			}
					}
            	}else{
            		params[name] = deafult;
            	}
            }else {
            	params[name] = deafult;
            }
        }
    }
    return jetsennet.xml.serialize(params, "param").replace("</param>",str+"</param>");
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
    else if(node.nodeParam.actId == "5210"){  //mxf导出
    	showMXFFileExport(node);
    }
    else if(node.nodeParam.actId == "5209"){  //mxf生成
    	showMXFFileCreate(node);
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
流程列表
*/
function loadProcess() {
    var sqlQuery = new jetsennet.SqlQuery();
    var queryTable = jetsennet.createQueryTable("WFM_PROCESS", "p");
    queryTable.addJoinTable(jetsennet.createJoinTable("WFM_PROCESSTYPE", "o", "p.PROC_TYPE=o.PROC_TYPE", jetsennet.TableJoinType.Right));
    
    $.extend(sqlQuery, { IsPageResult: 0, QueryTable: queryTable, pInfo: null, OrderString:"ORDER BY o.PROC_TYPE",
    	ResultFields: "p.PROC_ID,p.PROC_NAME,p.PROC_TYPE,p.FLOW_TYPE,p.PROC_STATE,p.PROC_DESC,o.TYPE_NAME,o.PROC_TYPE AS TYPE_ID,p.OBJ_TYPE" });

    var param = new HashMap();
    param.put("queryXml", sqlQuery.toXml());
    var sResult = MTCDAO.execute("commonXmlQuery", param);
    var objs = jetsennet.xml.toObject(sResult.resultVal, "Record");
    bindingProcess(objs);
}


/**
 * 返回指定长度的字符串
 * @param str
 * @param len
 * @return
 */
function cutstr(str,len)
{
	var str_length = 0;
	var str_len = 0;
	str_cut = new String();
	str_len = str.length;
	for(var i = 0;i<str_len;i++)
	{
		a = str.charAt(i);
		str_length++;
		if(escape(a).length > 4)
		{
			//中文字符的长度经编码之后大于4
			str_length++;
		}
		str_cut = str_cut.concat(a);
		if(str_length>=len)
		{
			str_cut = str_cut.concat("...");
			return str_cut;
		}
	}
	//如果给定字符串小于指定长度，则返回源字符串；
	if(str_length<len){
		return  str;
	}
}

// 流程节点
function bindingActivity(records) {
    if (records == null || records.length == 0) {
        return;
    }
    widthArray = [];
    var actId, actType, actClass,className,longName, actDesc;
    var actTypeList = {};
    var actTypeName = {};
    for (var i = 0; i < records.length; i++) {
        actId = records[i].ACT_ID;
        actType = records[i].ACT_TYPE;
        actName = records[i].ACT_NAME;
        actClass = records[i].ACT_CLASS;

        if(actClass == null || actClass == "" ||actClass == "0")
        {
            actClass = "-1";
            actTypeName["-1"] = "流程节点";
        }

        if (!actTypeList[actClass]) {
            actTypeList[actClass] = [];
            actTypeName[actClass] = records[i].CW_NAME;
        }

        actTypeList[actClass].push(createActItem(actId, actName, actType,actClass));
    }
    var actHtmlContentTabPan = [];
    var count = 0;
    jQuery.each(actTypeName, function (item,itemName) {       
    	count++;
    });
    var width = "100px";
    if(count>10){
    	width = (100/count)+"%";
    }
    jQuery.each(actTypeName, function (item,itemName) {       
    	actHtmlContentTabPan.push('<li style="width:'+width+';text-align:center;white-space: nowrap;overflow: hidden;">'+itemName+'</li>');
    });
    el("tabPane").innerHTML = actHtmlContentTabPan.join('');
    
    var actHtmlContent = [];
    var count = 0;
    jQuery.each(actTypeName, function (item,itemName) {        
        var content = actTypeList[item];
        widthArray.push(content.length*100);
        actHtmlContent.push("<div id='contentDiv_"+count+"' style='width:" +content.length*100+ "px;position: relative;left:0px;top:20px;'>" + content.join("") + "</div>");
        count++;
    });
    
    el("tabPage").innerHTML = actHtmlContent.join('');
    gWorkflow = new jetsennet.ui.TabPane(el('tabPane'), el('tabPage'), 2, false);
    gWorkflow.select(0);
    gWorkflow.ontabpageselected = function (index) {
    	currentIndex = index;
    };
}

function createActItem(actId, actName, actType,actClass) {
    return "&nbsp;&nbsp;&nbsp;<div class=\"img-rounded wf-tasknode wf-act-" + actId + " dragDiv\" title="+jetsennet.xml.htmlEscape(actName)+" style=\"width:80px;height:80px;display:inline-block;margin-right:2px;word-wrap:normal\" actId="
    + actId + " actType=" + actType + " actClass="+actClass+" actName=\"" + jetsennet.xml.htmlEscape(actName) + "\"><div style=\"position:absolute;bottom:10px;text-align:center;width:80px;color: white;overflow: hidden; text-overflow:ellipsis;white-space:nowrap;\">"
    + jetsennet.xml.htmlEscape(actName) + "</div></div>";
}
//流程改变事件 objDataType数据存储对象
function processChanged(procId, objType, procType, procState, procName, procDesc,objDataType) {
//	gWorkflow.select(0);
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

function bindDropdownList(con, obj, tableName, valField, txtField) {
    var handing = ["请选择~"];
    if (obj != null && obj[tableName] != null) {
        var len = obj[tableName].length;
        if (len) {
            for (var i = 0; i < len; i++) {
                handing.push(obj[tableName][i][txtField] + "~" + obj[tableName][i][valField]);
            }
        }
        else {
            handing.push(obj[tableName][txtField] + "~" + obj[tableName][valField]);
        }
    }
    con.setAttribute("handing", handing.join("|"));
}

// 获取流程xml
function getProcessXml(procId) {

    var processXml = [];
    processXml.push('<process version="2.1">');
    processXml.push('<processId>' + (procId || gCurrentProcess.procId) + '</processId>');
    processXml.push('<processName>' + jetsennet.xml.xmlEscape(gCurrentProcess.procName) + '</processName>');
    processXml.push('<processType>' + gCurrentProcess.objType + '</processType>');
    processXml.push('<objType>' + gCurrentProcess.objType + '</objType>');
    processXml.push('<description>' + jetsennet.xml.xmlEscape(gCurrentProcess.procDesc) + '</description>');

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
        processXml.push('<name>' + jetsennet.xml.xmlEscape(valueOf(childParam, "name", "")) + '</name>');
        processXml.push('<actId>' + childParam.actId + '</actId>');
        processXml.push('<actClass>' + childParam.actClass + '</actClass>');
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

// 设置流程xml
function setProcessXml(processXml) {
    gFlowView.clearView();
    var flowObj = jetsennet.xml.deserialize(processXml);
    gFlowView.workflowNode = gFlowView.createNodesByObject(flowObj);
    gFlowView.render();
}

/**
 * 初始化左右按钮
 */
function initStoreBox(){
	$("#chevronLeft").mousedown(function(){
		var countWidth = widthArray[currentIndex];
		var divwidth = $("#tabPage").css("width");
	    var showAreaWidth = parseInt(divwidth.substring(0,divwidth.length-2))-80;
		if(showAreaWidth - countWidth >= 0){
			return ;
		}
		$("#contentDiv_"+currentIndex).animate({
            left: 0
        }, "slow", '', function(){
        	$("#contentDiv_"+currentIndex).stop();
        });
	});
	
	$("#chevronRight").mousedown(function(){
		var countWidth = widthArray[currentIndex];
		var divwidth = $("#divActList").css("width");
	    var showAreaWidth = parseInt(divwidth.substring(0,divwidth.length-2))-80;
	    var overWidth = showAreaWidth - countWidth;
		if(overWidth >= 0){
			return ;
		}
		$("#contentDiv_"+currentIndex).animate({
			left: overWidth+50
        }, "slow", '', function(){
        	$("#contentDiv_"+currentIndex).stop();
        });
	});
	//鼠标起来 停止
	$("#chevronLeft, #chevronRight").mouseup(function(){
		$("#contentDiv_"+currentIndex).stop();
	});
}

function plusWorkflow(type){
	if(type=="plus"){
		gFlowView.enableScale = true;
	}else{
		gFlowView.enableScale = false;
	}
}