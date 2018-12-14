//控件数据来源
var SOURCE_CUSTOM = 1;
var SOURCE_DB = 2;
var SOURCE_VAR = 3;
var viarable_result = [];

/**
显示节点配置
*/
function showActConfig(node) {
    var items;
    if (node.nodeParam.actType == 2 || node.nodeParam.actType == 3) {
    	var param = new HashMap();
        param.put("actId", node.nodeParam.actId);
        var sResult = WFMDAO.execute("getActConfig", param);
        if(sResult.resultVal){
        	items = jetsennet.xml.deserialize(sResult.resultVal, { igoreAttribute: false }).item;
        }
    }
    initVaribale();
    renderActConfig(items, node);
    if (el('hiddenProcId')) {
        el('hiddenProcId').value = node.nodeParam.id;
    }
    el('txtConfigName').value = jetsennet.xml.xmlUnescape(node.nodeParam.name);
    addActParameter(items,node);
    setActParameter(items, node);

    var dialog = new jetsennet.ui.Window("act-config");
    jQuery.extend(dialog, { windowStyle: 1, submitBox: gCurrentProcess.procState!=0?false:true, cancelBox: gCurrentProcess.procState!=0?false:true, maximizeBox: false, minimizeBox: false, 
    	size: { width: 530, height: 0 }, showScroll: false, title: "参数配置" });
    dialog.controls = ["divActConfig"];
    dialog.onsubmit = function () {
    	if(gCurrentProcess.procState!=0){
    		dialog.close();
    		return;
    	}
    	var areaElements = jetsennet.form.getElements('divActConfig');
    	if (jetsennet.form.validate(areaElements, true)) {
    		if(node.nodeParam.actId=="531"){
    			var startArray = el("txtConfigscanTimeStart").value.split(":");
    			var endArray = el("txtConfigscanTimeEnd").value.split(":");
    			var startSecond = parseInt(startArray[0])*3600 + parseInt(startArray[1])*60 + parseInt(startArray[2]);
    			var endSecond = parseInt(endArray[0])*3600 + parseInt(endArray[1])*60 + parseInt(endArray[2]);
    			if(startSecond>endSecond){
    				jetsennet.alert("扫描开始时间不能大于结束时间！");
    				return;
    			}
    			var intervar = parseInt(el("txtConfigscanInterval").value);
    			if(intervar>endSecond-startSecond){
    				jetsennet.alert("扫描间隔不能大于扫描总时间！");
    				return;
    			}
    		}
    		/**重命名*/
    		var actName = el('txtConfigName').value;
    		gFlowView.isChanged = true;
    		if (actName != node.nodeParam.name) {
    			node.nodeParam.name =jetsennet.xml.htmlEscape(actName);
    			node.setNodeName(jetsennet.xml.htmlEscape(actName));
    			jQuery(node.control).attr("title",jetsennet.xml.xmlUnescape(actName));
    		}
    		
    		//获取值
    		node.nodeParam.parameter = getActParameter(items, node);
    		
    		if (el('templateImportName') && el('templateImportName').value) {
    			var suffix = el('templateImportName').value.substring(el('templateImportName').value.lastIndexOf(".")+1,el('templateImportName').value.length);
    			el('hiddenSuffix').value = "package";
    			if(suffix.toLowerCase()!="tpl"){
    				jetsennet.alert("导入模板格式错误！");
    				return;
    			}
    			el('templateImport').submit();
    			jetsennet.message("导入模板中，请稍后！");
    			setTimeout(function(){	
    				$.ajax({
    	        		url:"../../../templateImport",
    	        		cache:false, 
    	        		data:{type:"1"},
    	        		success:function(data){
    	        			node.nodeParam.id = parseInt(data);
    	        		},
    	        		error:function(){
    	        		}
    				}); 
    				jetsennet.message("导入成功！");
    				dialog.close();
    	    	}, 1500);
    		}else{
    			dialog.close();
    		}
    	}
    };
    dialog.showDialog();
    initInputDisabled();
}

/**
生成节点配置页面
*/
var controlValueArray = [];
var controlArray = [];
function renderActConfig(items, node) {
	var nameReadOnly = node.nodeParam.actClass=="2201004"?"disabled":"";  //流程控制节点
    array = [];
    var contents = [];
    contents.push('<div class="form-horizontal mg-lg">');
    //节点名称
    contents.push('<div class="form-group">');
    contents.push('<label for="txtConfigName" class="col-sm-4 control-label">名称：</label>');
    contents.push('<div class="col-sm-7" style="padding-right:3px"><div class="input-group input-group-sm"><input type="text" class="form-control input-sm" id="txtConfigName" validatetype="NotEmpty,maxlength" maxlength="40" '+nameReadOnly+'/><span class="input-group-addon" style="color: Red">*</span></div></div><div class="col-sm-1"></div>');
    contents.push('</div>');
    
    if (node.nodeParam.actId == 5200 || node.nodeParam.actId == 5400 || node.nodeParam.actId == 5201) {
    	contents.push('<div class="form-group">');
    	contents.push('<label for="txtTemplateName" class="col-sm-4 control-label">模板名称:</label>');
    	contents.push('<div class="col-sm-7" style="padding-right:3px"><input id="txtTemplateName" type="text" class="form-control input-sm" style="width:100%;" disabled="disabled"/></div>');
    	contents.push('</div>');
    }
    
    controlValueArray = []; //保存待显示的
    controlArray = [];   //保存受控制的item
    if (items) {
    	for (var i = 0; i < items.length; i++) {
    		if(valueOf(items[i], "@controlValue", "")){
    			controlValueArray.push(items[i]);
    		}
    		if(valueOf(items[i], "@controlFlag", "")){
    			controlArray.push(items[i]);
    		}
    	}
    }
    arrayRomove(controlValueArray,items);
    showActTable(items,contents);

    if (node.nodeParam.actType == 14 || node.nodeParam.actType == 11 || node.nodeParam.actType == 10) {
        contents.push('<div class="form-group">');
        contents.push('<label for="txtConfigCondition" class="col-sm-4 control-label">条件：</label>');
        contents.push('<div class="col-sm-7" style="padding-right:3px"><input id="txtConfigCondition" type="text" class="form-control" disabled="disabled"/></div>');
        var condpge = gCurrentProcess.procState==0?'<span class="glyphicon glyphicon-cog" style="cursor: pointer;" title="条件设置" onclick="loadConditionVariable();"></span>':'';
    	contents.push('<div class="col-sm-1" style="padding-left:2px;padding-top:9px;">'+condpge+'</div>');
        contents.push('</div>');
    }
    if (node.nodeParam.actId == 5200 || node.nodeParam.actId == 5400 || node.nodeParam.actId == 5201) {
        contents.push('<div class="form-group">');
        contents.push('<label for="templateImportName" class="col-sm-4 control-label">参数模板：</label><div class="col-sm-7" style="padding-right:3px">');
        contents.push('<form action="../../../templateImport" method="post" id="templateImport" target="hiddenframe" enctype="multipart/form-data"><input type="file" id="templateImportName" name="templateImportName" onkeydown="return false" onpaste="return false"  class="form-control input-sm" style="width:100%;"/><input type="hidden" id="hiddenProcId" name="hiddenProcId" value=""/><input type="hidden" id="hiddenSuffix" name="hiddenSuffix" value=""/></form>');
        contents.push('</div><div class="col-sm-1"></div>');
        contents.push('</div>');
    }
    contents.push('</div>');
    el("divActConfig").innerHTML = contents.join("");

    $("#divActConfig").find("input").each(function () {
    	if(this.className=="form-control input-sm class2"){
    		var handing = [];
    		if (array.length > 0) {
    			for (var i = 0; i < array.length; i++) {
    				if (array[i].name == this.id) {
    					jetsennet.ui.DropDownList.initOptions(this.id, true);
    					jetsennet.ui.DropDownList[this.id].clear();
    					var arrs = array[i].value;
    					for ( var j = 0; j < arrs.length; j++) {
    						jetsennet.ui.DropDownList[this.id].appendItem({ text:arrs[j].split("~")[0], value: arrs[j].split("~")[1],title:arrs[j].split("~")[0] });
    					}
    					handing = array[i].value;
    				}
    			}
    		}
    		this.setAttribute("handing", handing.join("|"));
//    		jetsennet.ui.DropDownList.initOptions(this.id);
    		if(this.id=="txtConfignameFilter"){
    			jetsennet.ui.DropDownList[this.id].onchanged = function(item){
    				changeSelectValue(item.value,"txtConfignameFilter");
    		    };
    		}
    	}
    });
    if (node.nodeParam.actId == 5200 || node.nodeParam.actId == 5400 || node.nodeParam.actId == 5201) {
    	initTemplateName(node.nodeParam.id);
    }
    //addVaribaleSelect();
}

//自定义项 显示为空
function addEventDist(obj){
	$("body").find(".jetsen-autocomplete-mouseout").each(function(){
		if($(this).attr("title")=="自定义项"){
			$(this).click(function () {
		        obj.value = "";
		    });
		}
	});
}


function showActTable(items,contents){
	if (items) {
        items = items.length ? items : [items];
        
        //配置参数
        var flag = false;
        for (var i = 0; i < items.length; i++) {
        	var display = "";
        	if(valueOf(items[i], "@visible", "")&&valueOf(items[i], "@visible", "")=="true"){
        		display = 'style="display: none;"';
        	}
        	if(!flag||valueOf(items[i], "@source", "")!=4){
        		flag = false;
        		contents.push('<div class="form-group" '+display+'>');
        	}
            if (valueOf(items[i], "@desc", "")) {
            	if(valueOf(items[i], "@source", "")==4){
            		if(valueOf(items[i], "@allowInput", "")=="true"){
            			var unit = items[i]["@unit"]?'<span>'+items[i]["@unit"]+'</span>':'';
                    	var variableStr = gCurrentProcess.procState==0&&items[i]["@allowVariable"]&&items[i]["@allowVariable"]=="true"?'<span class="glyphicon glyphicon-th" style="cursor:pointer;" title="变量设置" onclick="loadVariable(\'txtConfig' + items[i]["@name"] + '\');"></span>':"";
            			contents.push('<label class="col-sm-4 control-label">');
            			contents.push(createCheckBoxControl(items[i]) + '<span class="checkboxMid">'+valueOf(items[i], "@desc", "")+'：</span>');
            			contents.push('</label>');
            			contents.push('<div class="col-sm-7" style="padding-right:3px">');
            			contents.push(createInputControl(items[i]));
            			contents.push('</div><div class="col-sm-1" style="padding-left:2px;padding-top:8px;">'+unit+variableStr+'</div>');
            		}else{
            			if(flag){
            				contents.push('<label class="control-label col-sm-6">'+createCheckBoxControl(items[i])+'<span class="checkboxMid">'+valueOf(items[i], "@desc", "")+'</span></label>');
            				flag = false;
            			}else{
            				contents.push('<label class="control-label col-sm-4" style="padding-right:25px;">'+createCheckBoxControl(items[i])+'<span class="checkboxMid">'+valueOf(items[i], "@desc", "")+'</span></label>');
            				flag = true;
            			}
            		}
                }else{
                	var unit = items[i]["@unit"]?'<span>'+items[i]["@unit"]+'</span>':'';
                	var variableStr = gCurrentProcess.procState==0&&items[i]["@allowVariable"]&&items[i]["@allowVariable"]=="true"?'<span class="glyphicon glyphicon-th" style="cursor:pointer;" title="变量设置" onclick="loadVariable(\'txtConfig' + items[i]["@name"] + '\');"></span>':"";
                	contents.push('<label for="txtConfig' + valueOf(items[i], "@name", "")+ '" class="col-sm-4 control-label">'+valueOf(items[i], "@desc", "")+'：</label>');
                	contents.push('<div class="col-sm-7" style="padding-right:3px">');
                	contents.push(createControl(items[i]));
                	contents.push('</div><div class="col-sm-1" style="padding-left:2px;padding-top:8px;">'+unit+variableStr+'</div>');
                }
            }
            if(!flag||valueOf(items[i], "@source", "")!=4){
            	contents.push('</div>');
            }
        }
    }
}


function initTemplateName(procId){
	 var sqlQuery = new jetsennet.SqlQuery();
	 var queryTable = jetsennet.createQueryTable("WFM_ACTPARAM");
	 jQuery.extend(sqlQuery, { IsPageResult: 0, QueryTable: queryTable, ResultFields: "TEMPLATE_NAME,PROCACT_ID" });
	 
	 var conditions = new jetsennet.SqlConditionCollection();
	 conditions.add(jetsennet.SqlCondition.create("PROCACT_ID", procId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric));
	 conditions.add(jetsennet.SqlCondition.create("PARAM_TYPE", 10, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric));
	 sqlQuery.Conditions = conditions;
	 
	 var param = new HashMap();
	 param.put("queryXml", sqlQuery.toXml());
	 var sResult = MTCDAO.execute("commonXmlQuery", param);
	 var records = jetsennet.xml.toObject(sResult.resultVal, "Record");
	 if (records&&el('txtTemplateName')) {
		 el('txtTemplateName').value = records[0].TEMPLATE_NAME;
	 }
}

/**
创建配置项的控件
*/
function createControl(item) {
    if (jetsennet.util.isNullOrEmpty(item["@name"])) {
        return "";
    }
    else if (item["@dataType"] == "text") {
        return createTextControl(item);
    }
    else if (item["@source"] == SOURCE_CUSTOM || item["@source"] == SOURCE_DB || item["@source"] == SOURCE_VAR) {
        return createSelectControl(item);
    }
    else if (item["@source"] == 5) {
        return createDateControl(item);
    }
    else {
        return createInputControl(item);
    }
}


function createDateControl(item){
	var control = '';
	if(item["@filed"]){
		var array = item["@filed"].split(",");
		control += '<input type="text" id="txtConfig' + item["@name"] + array[0] + '" onfocus="new jetsennet.ui.TimeEditor(this,3)" class="input-sm"  value="00:00:00" style="width:134px;border: 1px solid #cccccc;"/>';
		control += '<span>&nbsp;至&nbsp;</span>';
		control += '<input type="text" id="txtConfig' + item["@name"] + array[1] +  '" onfocus="new jetsennet.ui.TimeEditor(this,3)" class="input-sm" value="23:59:59" style="width:134px;border: 1px solid #cccccc;"/>';
	}else{
		control += '<input type="text" id="txtConfig' + item["@name"] + '" onfocus="new jetsennet.ui.TimeEditor(this,3)" class="form-control input-sm" value="23:59:59"/>';
	}
	return control;
	
}


function createCheckBoxControl(item){
    var control = '<input id="txtConfig' + item["@name"] + 'CheckBox" type="checkbox" class="checkboxMid"/>&nbsp;&nbsp;';
    return control;
}


function createInputControl(item) {
	var validateTypeStr = ""; //校验
	var validateType = ""; 
	var minvalue = "";
	var maxvalue = "";
	var maxlength = "";
	var minlength = "";
	var onblur = "";
	if(item["@title"]){
		onblur = 'title = '+item["@title"]+'';
	}
	if(item["@allowEmpty"]=="false"){
		validateTypeStr += "NotEmpty,";
	}
	if(item["@dataType"]=="int"){
		validateTypeStr += "Int,";
	}
	if(item["@maxLength"]){
		validateTypeStr += "maxlength,";
		maxlength = 'maxlength='+item["@maxLength"]+'';
	}
	if(item["@minLength"]){
		validateTypeStr += "minlength,";
		minlength = 'minlength='+item["@maxLength"]+'';
	}
	if(item["@minValue"]){
		validateTypeStr += "minvalue,";
		minvalue = 'minvalue='+item["@minValue"]+'';
	}
	if(item["@maxValue"]){
		validateTypeStr += "maxvalue,";
		maxvalue = 'maxvalue='+item["@maxValue"]+'';
	}
	if(validateTypeStr){
		validateType = 'validatetype='+validateTypeStr.substring(0, validateTypeStr.length-1)+'';
	}
	var value = item["@deafult"]?item["@deafult"]:"";//默认值
	if(item["@source"]==4){
		value = item["@deafultValue"]?item["@deafultValue"]:"";//默认值
	}
	var spanred = item["@allowEmpty"]=="false"?'<span class="input-group-addon" style="color: Red">*</span>':''; //红标
	var control = "";
    if (item["@name"] == "Name") {
        control = '<div class="input-group input-group-sm"><input id="txtConfig' + item["@name"] + '" type="text" value="'+value+'" '+validateType+' class="form-control"/>'+spanred+'</div>';
    } else {
    	if(item["@allowEmpty"]=="false"){
    		control = '<div class="input-group input-group-sm"><input id="txtConfig' + item["@name"] + '" type="text" value="'+value+'" '+validateType+' '+minvalue+' '+maxvalue+' '+maxlength+' '+minlength+' '+onblur+' class="form-control"/>'+spanred+'';
    		control += "</div>";
    	}else{
    		control = '<input id="txtConfig' + item["@name"] + '" type="text" value="'+value+'" '+validateType+' '+minvalue+' '+maxvalue+' '+maxlength+' '+minlength+' '+onblur+' class="form-control input-sm"/>'+spanred+'';
    	}
    }
    return control;
}

function createTextControl(item) {
    var control = '<textarea class="form-control textarea" id="txtConfig' + item["@name"] + '" rows="3"></textarea>';
    return control;
}

function createSelectControl(item) {
	var validateType = item["@allowEmpty"]=="false"?'validatetype="NotEmpty"':'';
	var spanred = item["@allowEmpty"]=="false"?'<span class="input-group-addon" style="color: Red">*</span>':'';
	var onblur = "";
	if(item["@title"]){
		onblur = 'title = '+item["@title"]+'';
	}
    var options = [];
    if (item["@source"] == SOURCE_CUSTOM) {
        var sources = item["@sourceString"].split("|");
        jQuery.each(sources, function (i) {
            var sourceItem = sources[i].split("~");
            options.push({ name: sourceItem[0], value: sourceItem[1] });
        });
    }
    else if (item["@source"] == SOURCE_DB) {

        var sqlQuery = new jetsennet.SqlQuery();
        var queryTable = jetsennet.createQueryTable(item["@sourceTable"]);
        jQuery.extend(sqlQuery, { IsPageResult: 0, QueryTable: queryTable, ResultFields: item["@keyField"] + "," + item["@nameField"] });

        if (!jetsennet.util.isNullOrEmpty(item["@typeField"])) {
            var conditions = new jetsennet.SqlConditionCollection();
            conditions.add(jetsennet.SqlCondition.create(item["@typeField"], item["@typeValue"], jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.In, jetsennet.SqlParamType.Numeric));
            sqlQuery.Conditions = conditions;
        }

        var param = new HashMap();
        param.put("queryXml", sqlQuery.toXml());
        var sResult = MTCDAO.execute("commonXmlQuery", param);
        var records = jetsennet.xml.toObject(sResult.resultVal, "Record");
        if (records) {
            for (var i = 0, len = records.length; i < len; i++) {
                options.push({ name: records[i][item["@nameField"]], value: records[i][item["@keyField"]] });
            }
        }
    }
    else if (item["@source"] == SOURCE_VAR) {
    	if(viarable_result&&viarable_result.length>0){
    		var records = viarable_result; 
            for (var i = 0, len = records.length; i < len; i++) {
                options.push({ name: records[i]["VAR_DESC"] + records[i]["VAR_NAME"], value: records[i]["VAR_NAME"] });
            }
    	}
    }
    
    var control = [];
    if(item["@name"]=="nameFilter"){
    	control.push('<div class="input-group input-group-sm" style="width:100%"><label style="position: relative; font-weight: normal; margin-bottom: 0;width:100%;"><input id="txtConfig' + item["@name"] + '" '+validateType+' onclick="jetsennet.ui.DropDownList.show(this);addEventDist(this);" class="form-control input-sm class2" style="width:100%;" '+onblur+' readonly="readonly"/><i class="fa fa-lg fa-caret-down" style="position: absolute;top: 10px;right: 10px;z-index:10;"></i></label>'+spanred+'</div>');
    }else{
    	control.push('<div class="input-group input-group-sm" style="width:100%"><label style="position: relative; font-weight: normal; margin-bottom: 0;width:100%;"><input id="txtConfig' + item["@name"] + '" '+validateType+' onclick="jetsennet.ui.DropDownList.show(this)" class="form-control input-sm class2" style="width:100%;" '+onblur+' readonly="readonly"/><i class="fa fa-lg fa-caret-down" style="position: absolute;top: 10px;right: 10px;z-index:10;"></i></label>'+spanred+'</div>');
    }
    bindingObjectSelect("txtConfig" + item["@name"], options);
    return control.join('');
}


function changeSelectValue(selectValue,id){
	if(id){
		if(selectValue){
			$('#'+id).attr("title",selectValue);
			if(!$('#'+id).attr("readonly")){
				$('#'+id).attr("readonly","readonly");
				$('#'+id).blur(); 
			}
		}else{
			$('#'+id).removeAttr("readonly");
			el(id).value = "";
			$('#'+id).attr("title","以英文分号隔开，不区分大小写，如：*.mxf;*.mov;*.ts");
			setTimeout(function(){
				el(id).select();
			}, 0);
		}
	}else{
		if(el('txtConfigmd5CountCheckBox')){
			if(selectValue=="0"){
				$('#txtConfigmd5CountCheckBox').removeAttr("disabled");
			}else{
				el('txtConfigmd5CountCheckBox').checked = false;
				$('#txtConfigmd5CountCheckBox').attr("disabled","disabled");
			}
		}
	}
}


/**
将参数值设置在UI上
*/
function setActParameter(items, node) {
	var options = {igoreAttribute:false,attributeFlag:"@",valueFlag:"$",trueValue:"true",falseValue:"false"};
    var params = jQuery.extend({}, jetsennet.xml.deserialize(node.nodeParam.parameter,options));
    if (items) {
        items = items.length ? items : [items];

        for (var i = 0; i < items.length; i++) {
            var name = items[i]["@name"];
            var source = items[i]["@source"];
            var defaultValue = items[i]["@deafult"];

            if (jetsennet.util.isNullOrEmpty(name)) {
                continue;
            }

            if (source == SOURCE_CUSTOM || source == SOURCE_DB || source == SOURCE_VAR) {
                var handing = attributeOf(el("txtConfig" + name), "handing", "");
                var handsources = handing.split("|");
                var count = 0;
                jQuery.each(handsources, function (j) {
                    var sourceItem = handsources[j].split("~");
                    if(sourceItem[1] == defaultValue && !params[name]){
                    	jetsennet.ui.DropDownList["txtConfig" + name].selectedValue = sourceItem[1];
                        el("txtConfig" + name).value = sourceItem[0];
                    }
                    if (params[name]) {
                    	if(sourceItem[1] == params[name].$){
                    		jetsennet.ui.DropDownList["txtConfig" + name].selectedValue = sourceItem[1];
                    		el("txtConfig" + name).value = sourceItem[0];
                    		if(name=="nameFilter"){
                    			$("#txtConfig" + name).attr("title",sourceItem[1]);
                    		}
                    	}else{
                    		count++;
                    	}
                    }
                });
                if(count==handsources.length){
                	el("txtConfig" + name).value = params[name].$?params[name].$:"";
                	if(name=="nameFilter"){
                		$("#txtConfig" + name).attr("title",el("txtConfig" + name).value);
                		$("#txtConfig" + name).removeAttr("readonly");
                	}
                }
                jQuery.each(controlArray, function (k) {
            		if(controlArray[k]["@name"]==name){
            			jetsennet.ui.DropDownList["txtConfig" + name].onchanged = function(item){
                        	showHidHtml(controlArray[k]["@name"],item.value,items);
                        };
            		}
                });
            }
            else if(source == 4){
            	if(defaultValue=="true"){
            		el("txtConfig" + name+"CheckBox").checked = defaultValue=="true"?true:false;
            	}
            	if(params[name]){
            		el("txtConfig" + name+"CheckBox").checked = valueOf(params[name], "@switch", "")=="on"?true:false;
            		if(el("txtConfig" + name)){
            			el("txtConfig" + name).value = params[name].$?params[name].$:"";
            		}
            	}
            }
            else if(source == 5){
            	if(items[i]["@filed"]){
            		var filed = items[i]["@filed"].split(',');
            		for ( var k = 0; k < filed.length; k++) {
            			if(params[name + filed[k]]){
            				var paramValue = params[name + filed[k]].$;
            				el("txtConfig" + name + filed[k]).value = allVarNameArray.in_array(paramValue.replace("@", "")) ? (paramValue.replace("@", "")) : paramValue;
            			}
            		}
            	}else{
            		if(params[name]){
            			var paramValue = params[name].$;
            			el("txtConfig" + name).value = allVarNameArray.in_array(paramValue.replace("@", "")) ? (paramValue.replace("@", "")) : paramValue;
            		}
            	}
            }
            else {
            	if(params[name]&&params[name].$){
            		var paramValue = params[name].$;
            		el("txtConfig" + name).value = allVarNameArray.in_array(paramValue.replace("@", "")) ? (paramValue.replace("@", "")) : paramValue;
            		if(name=="scanPath"){
            			$("#txtConfig" + name).attr("title",el("txtConfig" + name).value);
            		}
            	}
            }
            if(node.nodeParam.actId=="5001"&&name=="execMode"){
            	changeSelectValue(jetsennet.ui.DropDownList["txtConfigexecMode"].selectedValue);
            }
        }
    }

    if (node.nodeParam.actType == 14 || node.nodeParam.actType == 11 || node.nodeParam.actType == 10) {
        if (params["Condition"]&&params["Condition"].$) {
            var newArray = [];
            var array = params["Condition"].$.split("and");
            for (var i = 0; i < array.length; i++) {
                if (array[i] && array[i].trim()) {
                    newArray.push(array[i].trim().replace("@", ""));
                }
            }
            el("txtConfigCondition").value = newArray.join(" and ");
        } else {
            el("txtConfigCondition").value = params["Condition"]?params["Condition"].$:"";
        }
        $("#txtConfigCondition").attr({title:el("txtConfigCondition").value});
    }

    /**
    el("txtConfigOnStart").value = valueOf(params, "OnStart", "");
    el("txtConfigOnFinished").value = valueOf(params, "OnFinished", "");
    el("txtConfigOnReturned").value = valueOf(params, "OnReturned", "");
    el("txtConfigOnPushback").value = valueOf(params, "OnPushback", "");
    **/
}


/**
 * 增加受控制的控件
 * @param items
 * @param node
 * @return
 */
function addActParameter(items, node){
	var contrArray = [];
	var itemNew = [];
	if(node.nodeParam.parameter){
		//从数据库初始值显示
		var params = jQuery.extend({}, jetsennet.xml.deserialize(node.nodeParam.parameter));
		for(var obj in params){
			jQuery.each(controlValueArray, function (i) {
				if(controlValueArray[i]["@name"]==obj){
					items.push(controlValueArray[i]);
					itemNew.push(controlValueArray[i]);
					if(contrArray.length>0){
						if(!contrArray.in_array(controlValueArray[i]["@controlValue"])){
							contrArray.push(controlValueArray[i]["@controlValue"]);
						}
					}else{
						contrArray.push(controlValueArray[i]["@controlValue"]);
					}
				}
			});
		}
	}else{
		if (items) {
			//从配置文件初始值显示
	        items = items.length ? items : [items];
	        for (var i = 0; i < items.length; i++) {
	            var name = items[i]["@name"];
	            var defaultValue = items[i]["@deafult"];
	            jQuery.each(controlValueArray, function (j) {
	            	var array = controlValueArray[j]["@controlValue"].split("~")[1].split("_"); 
	            	if(controlValueArray[j]["@controlValue"].split("~")[0]==name&&array.in_array(defaultValue)){
	            		items.push(controlValueArray[j]);
						itemNew.push(controlValueArray[j]);
						if(contrArray.length>0){
							if(!contrArray.in_array(controlValueArray[j]["@controlValue"])){
								contrArray.push(controlValueArray[j]["@controlValue"]);
							}
						}else{
							contrArray.push(controlValueArray[j]["@controlValue"]);
						}
	            	}
	            });
	        }
		}
	}
	if(contrArray.length>0){
		jQuery.each(contrArray, function (j) {
			var newArray = [];
			for ( var k = 0; k < itemNew.length; k++) {
				if(contrArray[j]==itemNew[k]["@controlValue"]){
					newArray.push(itemNew[k]);
				}
			}
			if(newArray.length>0){
				showExtendHtml(newArray,contrArray[j].split("~")[0],contrArray[j].split("~")[1]);
			}
		});
	}
}


/**
 * 显示和隐藏table
 * @param name
 * @param value
 * @return
 */
function showHidHtml(name,value,items){
	var itemsNew = [];
	var idTitile = "";
	jQuery.each(controlValueArray, function (i) {
		var array = controlValueArray[i]["@controlValue"].split("~")[1].split("_");
		if(controlValueArray[i]["@controlValue"].indexOf(name+"~")>-1&&!array.in_array(value)){
			if(el("table_"+controlValueArray[i]["@controlValue"].split("~")[0] + "_" + controlValueArray[i]["@controlValue"].split("~")[1])){
				removeItem(controlValueArray[i],items);
			}
		}
    });
	jQuery.each(controlValueArray, function (i) {
		var array = controlValueArray[i]["@controlValue"].split("~")[1].split("_");
		if(controlValueArray[i]["@controlValue"].indexOf(name+"~")>-1&&array.in_array(value)){
			if(!items.in_array(controlValueArray[i])){
				items.push(controlValueArray[i]);
				itemsNew.push(controlValueArray[i]);
			}
			idTitile = controlValueArray[i]["@controlValue"].split("~")[1];
		}else if(controlValueArray[i]["@controlValue"].indexOf(name+"~")>-1&&!array.in_array(value)){
			if(el("table_"+controlValueArray[i]["@controlValue"].split("~")[0] + "_" + controlValueArray[i]["@controlValue"].split("~")[1])){
				var count = jQuery("#table_"+controlValueArray[i]["@controlValue"].split("~")[0] + "_" + controlValueArray[i]["@controlValue"].split("~")[1]).find(".form-group").length;
				if(el("act-config_content")){
					el("act-config_content").style.height = el("act-config_content").clientHeight - 43*count + "px";
				}
				jQuery("#table_"+controlValueArray[i]["@controlValue"].split("~")[0] + "_" + controlValueArray[i]["@controlValue"].split("~")[1]).remove();
			}
		}
    });
	showExtendHtml(itemsNew,name,idTitile);
}


function showExtendHtml(itemsNew,name,value){
	if(el("table_"+name+"_"+value)){
		return;
	}
	var contentsNew = [];
	if(itemsNew.length>0){
		contentsNew.push('<form class="form-horizontal mg-lg" id="table_'+name+'_'+value+'">');
		showActTable(itemsNew, contentsNew);
		contentsNew.push("</form>");
		jQuery("#divActConfig").append(contentsNew.join(''));
		var count = itemsNew.length; 
		if(el("act-config_content")){
			el("act-config_content").style.height = el("act-config_content").clientHeight + 43*count + "px";
		}
		$("#divActConfig").find("input").each(function () {
			if(this.className=="form-control input-sm class2"){
				var handing = [];
				if (array.length > 0) {
					for (var i = 0; i < array.length; i++) {
						if (array[i].name == this.id) {
							handing = array[i].value;
						}
					}
				}
				
				this.setAttribute("handing", handing.join("|"));
				jetsennet.ui.DropDownList.initOptions(this.id);
				if(this.id=="txtConfigexecMode"){
	    			jetsennet.ui.DropDownList[this.id].onchanged = function(item){
	    				changeSelectValue(item.value);
	    		    };
	    		}
			}
		});
	}
}


/**
从UI上获取参数值
*/
function getActParameter(items, node) {
    var params = {};
    var str = "";
    if (items) {
        items = items.length ? items : [items];
        for (var i = 0; i < items.length; i++) {
            var name = items[i]["@name"];
            var source = items[i]["@source"];

            if (jetsennet.util.isNullOrEmpty(name)) {
                continue;
            }

            if (source == SOURCE_CUSTOM || source == SOURCE_DB || source == SOURCE_VAR) {
                var handing = attributeOf(el("txtConfig" + name), "handing", "");
                var handsources = handing.split("|");
                var count = 0;
                jQuery.each(handsources, function (j) {
                    var sourceItem = handsources[j].split("~");
                    if (sourceItem[0] == el("txtConfig" + name).value) {
                        params[name] = sourceItem[1];
                    } else {
                        count++;
                    }
                });
                if (count == handsources.length) {
                    params[name] = el("txtConfig" + name).value;
                }
            }
            else if(source==4){
            	var value = "";
            	if(el("txtConfig" + name)){
            		value = el("txtConfig" + name).value;
            	}else{
            		if(el("txtConfig" + name + "CheckBox").checked){
            			value = "true";
            		}else{
            			value = "false";
            		}
            	}
            	str += jetsennet.xml.serialize({"@switch":el("txtConfig" + name + "CheckBox").checked?"on":"off",$:value},name);
            }
            else if(source==5){
            	if(items[i]["@filed"]){
            		var filed = items[i]["@filed"].split(",");
            		for ( var k = 0; k < filed.length; k++) {
            			params[name+filed[k]] = allVarNameArray.in_array(el("txtConfig" + name+filed[k]).value) ? ("@" + el("txtConfig" + name+filed[k]).value) : el("txtConfig" + name+filed[k]).value;
					}
            	}else{
            		params[name] = allVarNameArray.in_array(el("txtConfig" + name).value) ? ("@" + el("txtConfig" + name).value) : el("txtConfig" + name).value;
            	}
            }
            else {
                params[name] = allVarNameArray.in_array(el("txtConfig" + name).value) ? ("@" + el("txtConfig" + name).value) : el("txtConfig" + name).value;
            }
        }
    }
    if (node.nodeParam.actType == 14 || node.nodeParam.actType == 11 || node.nodeParam.actType == 10) {
        if (el("txtConfigCondition").value) {
            var newArray = [];
            var array = el("txtConfigCondition").value.split("and");
            for (var i = 0; i < array.length; i++) {
                if (array[i]) {
                    newArray.push("@" + array[i].trim());
                }
            }
            params["Condition"] = newArray.join(" and ");
        } else {
            params["Condition"] = el("txtConfigCondition").value;
        }
    }

    /**
    params["OnStart"] = el("txtConfigOnStart").value;
    params["OnFinished"] = el("txtConfigOnFinished").value;
    params["OnReturned"] = el("txtConfigOnReturned").value;
    params["OnPushback"] = el("txtConfigOnPushback").value;
    **/
    return jetsennet.xml.serialize(params, "param").replace("</param>",str+"</param>");
}

var conditionArray = [];
//加载条件变量 初始化条件变量
function loadConditionVariable() {
    conditionArray = [];
    if (el("txtConfigCondition").value) {
        conditionArray = el("txtConfigCondition").value.trim().split("and");
    }
    var window = new jetsennet.ui.Window("show-variable");
    jQuery.extend(window, { submitBox: true, cancelBox: true, okButtonText: "保存", cancelButtonText: "取消", maximizeBox: false, minimizeBox: false, windowStyle: 1, size: { width: 560, height: 450 }, showScroll: false, title: "条件设置" });
    jQuery.extend(window, { attachButtons: [{ text: "添加条件", clickEvent: function () { loadVariable(); } }]});
    window.controls = ["divConditionVariableWin"];
    window.onsubmit = function () {
        el("txtConfigCondition").value = conditionArray.join(" and ").trim();
        $("#txtConfigCondition").attr({title:el("txtConfigCondition").value});
        jetsennet.ui.Windows.close("show-variable");
    };
    window.showScroll = true;
    window.showDialog();
    showConditionVariableTable();
}

//显示条件变量列表
var gCondGridList = new jetsennet.ui.GridList("divVariableConditionList");
gCondGridList.enableMultiSelect = false;
gCondGridList.enableMultiRow = false;
gCondGridList.onselect = function(rows, objs) {
	currentIndex = rows[0];
};
function showConditionVariableTable() {
    var sResultXml = ["<RecordSet>"];
    for (var i = 0; i < conditionArray.length; i++) {
        var variableName = "";
        var variableType = "";
        var variableValue = "";
        var operate = "";
        for (var j = 0; j < sysbol.length; j++) {
            if (conditionArray[i].indexOf(sysbol[j]) > 0) {
                variableName = conditionArray[i].split(sysbol[j])[0].trim();
                variableValue = conditionArray[i].split(sysbol[j])[1].trim();
                operate = sysbol[j];
                if (!isNaN(variableValue)) {
                    variableType = 1;
                } else {
                    reg = /^(\d{4})-(\d{2})-(\d{2})$/g;
                    if (reg.test(variableValue))//判断日期格式符合YYYY-MM-DD
                    {
                        variableType = 2;
                    } else {
                    	if(variableValue.startWith("'")){
                    		variableValue = variableValue.substring(1, variableValue.length - 1).trim();
                    	}
                        variableType = 0;
                    }
                }
            }
        }
        sResultXml.push(jetsennet.xml.serialize({VAR_NAME:variableName,VAR_VALUE:variableValue,VAR_TYPE:variableType,OPERATE:operate},"Record"));  
    }
    sResultXml.push("</RecordSet>");
    el('divVariableConditionList').innerHTML = jetsennet.xml.transform("../xslt/wfm/variablecondition.xslt", sResultXml.join(''));
    gCondGridList.bind(el("divVariableConditionList"), el("tabFlowCondition"));
}

function isDoubleSize(item) {}

var array = [];
function bindingObjectSelect(objId, obj) {
    var handing = [];
    if (obj != null) {
        var len = obj.length;
        for (var i = 0; i < len; i++) {
            handing.push(obj[i].name + "~" + obj[i].value);
        }
    }
    array.push({ name: objId, value: handing });
}

Array.prototype.in_array = function (e) {
    for (i = 0; i < this.length; i++) {
        if (this[i] == e)
            return true;
    }
    return false;
};  


String.prototype.startWith=function(str){
	if(str==null||str==""||this.length==0||str.length>this.length)
		return false;
	if(this.substr(0,str.length)==str)
		return true;
	else
		return false;
	return true;
};

/**
 * 删除数组里面的所有元素
 * @param array
 * @param items
 * @return
 */
function arrayRomove(array,items){
	if(array.length>0){
    	for ( var i = 0; i < items.length; i++) {
    		for ( var j = 0; j < array.length; j++) {
    			if(items[i]==array[j])
    				items.remove(i);
    		}
		}
    }
}

/**
 * 删除数组里面单个元素
 * @param element
 * @param items
 * @return
 */
function removeItem(element,items){
	for ( var i = 0; i < items.length; i++) {
		if(items[i]==element)
			items.remove(i);
	}
}
