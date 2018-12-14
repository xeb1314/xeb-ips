//直接导入模板进行转码
function showTranscodeConfigByImport(node) {
    var items;
    if (node.nodeParam.actType == 2 || node.nodeParam.actType == 3) {
    	var param = new HashMap();
        param.put("actId", node.nodeParam.actId);
        var sResult = WFMDAO.execute("getActConfig", param);
        items = jetsennet.xml.deserialize(sResult.resultVal, { igoreAttribute: false }).item;
    }
    initVaribale();
    renderActConfigTranscode(items, node);
    if (el('hiddenProcId')) {
        el('hiddenProcId').value = node.nodeParam.id;
    }
    el('txtConfigName').value = node.nodeParam.name;
    setActParameterTrans(items, node);
    var dialog = new jetsennet.ui.Window("act-config");
    jQuery.extend(dialog, { windowStyle: 1, submitBox: gCurrentProcess.procState!=0?false:true, cancelBox: gCurrentProcess.procState!=0?false:true, maximizeBox: false, minimizeBox: false, 
    	size: { width: 710, height: 0 }, showScroll: false, title: "参数配置" });
    dialog.controls = ["divActConfig"];
    dialog.onsubmit = function () {
    	if(gCurrentProcess.procState!=0){
    		dialog.close();
    		return;
    	}
    	if($("#txtConfigsourceGroupType").val()==$("#txtConfigdestGroupType").val()){
    		jetsennet.alert("源文件组和目标文件组不可相同！");
    		return;
    	}
    	var areaElements = jetsennet.form.getElements('divActConfig');
    	if (jetsennet.form.validate(areaElements, true)) {
    		if(el("txtConfigStationPath").value){
    			var huddix = el('txtConfigStationPath').value.substring(el('txtConfigStationPath').value.lastIndexOf(".")+1,el('txtConfigStationPath').value.length);
    			if(huddix.toLowerCase()!="tga"&&huddix.toLowerCase()!="png"&&huddix.toLowerCase()!="jpg"&&huddix.toLowerCase()!="bmp"){
    				jetsennet.alert("台标路径文件格式不正确！");
    				return;
    			}
    		}
    		
    		if(el('txtTemplateName').value=="" && el('templateImportName') && el('templateImportName').value==""){
    			jetsennet.alert("请先导入转码模板！");
				return;
    		}
    		/**重命名*/
    		var actName = el('txtConfigName').value;
    		gFlowView.isChanged = true;
    		if (actName != node.nodeParam.name) {
    			node.nodeParam.name = actName;
    			node.setNodeName(actName);
    			jQuery(node.control).attr("title",actName);
    		}
    		
    		//获取值
    		node.nodeParam.parameter = getActParameterTrans(items, node);
    		//如果是已使用的流程，直接更新参数
    		
    		//台标同步
    		if(el("txtConfigStationPath").value){
    			$.ajax({
	        		url:"../../../StationPathImport",
	        		cache:false, 
	        		data:{"stationPath":el("txtConfigStationPath").value,"oldStationPath":el("hidStationPath").value},
	        		success:function(data){
	        			if(data){
	        				jetsennet.alert("台标路径无法访问！");
	        				return;
	        			}
	        			transTemImport(node,dialog);
	        		},
	        		error:function(){}
				}); 
    		}else{
    			transTemImport(node,dialog);
    		}
    		
    	}
    };
    dialog.showDialog();
    initInputDisabled();
}


var transTemImport = function(node,dialog){
	if (el('templateImportName') && el('templateImportName').value) {
		var suffix = el('templateImportName').value.substring(el('templateImportName').value.lastIndexOf(".")+1,el('templateImportName').value.length);
		el('hiddenSuffix').value = "transcode";
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
        			jetsennet.message("导入成功！");
        		},
        		error:function(){
        		}
			}); 
			dialog.close();
    	}, 2000);
	}else{
		dialog.close();
	}
};



function renderActConfigTranscode(items, node) {
    array = [];
    var contents = [];
    contents.push('<table border="0" cellpadding="0" cellspacing="0" class="table-info" width="695px">');
    contents.push('<colgroup>');
    contents.push('<col width="120px" />');
    contents.push('<col width="200px;" />');
    contents.push('<col width="20px;" />');
    contents.push('<col width="140px;"/>');
    contents.push('<col width="auto" />');
    contents.push('<col width="20px;" />');
    contents.push('</colgroup>');

    //节点名称
    var flag = false;
    if (items) {
    	for (var i = 0; i < items.length; i++) {
    		if(valueOf(items[i], "@name", "")=="templateName"){
    			flag = true;
    		}
    	}
    }
    if(flag){
    	contents.push('<tr>');
        contents.push('<td><label for="txtConfigName" class="control-label">名称:</label></td><td colspan="5"><div class="input-group input-group-sm"><input id="txtConfigName" type="text" class="form-control input-sm" style="width:100%;" validatetype="NotEmpty,maxlength" maxlength="20"/><span class="input-group-addon" style="color: Red">*</span></div></td>');
        contents.push('</tr>');
    }else{
    	contents.push('<tr>');
        contents.push('<td><label for="txtConfigName" class="control-label">名称:</label></td><td><div class="input-group input-group-sm"><input id="txtConfigName" type="text" class="form-control input-sm" style="width:100%;" validatetype="NotEmpty,maxlength" maxlength="20"/><span class="input-group-addon" style="color: Red">*</span></div></td><td></td>');
        contents.push('<td><label for="txtTemplateName" class="control-label">模板名称:</label></td><td><input id="txtTemplateName" type="text" class="form-control input-sm" style="width:100%;" disabled="disabled"/></td>');
        contents.push('<td></td></tr>');
        
        contents.push('<tr>');
        contents.push('<td><label for="templateImportName" class="control-label">模板路径:</label></td><td colspan="5"><form action="../../../templateImport" method="post" id="templateImport" target="hiddenframe" enctype="multipart/form-data"><input type="file" id="templateImportName" name="templateImportName" onkeydown="return false" onpaste="return false"  class="form-control input-sm" style="width:100%;height:31px;"/><input type="hidden" id="hiddenProcId" name="hiddenProcId" value=""/><input type="hidden" id="hiddenSuffix" name="hiddenSuffix" value=""/></form></td>');
        contents.push('</tr>');
    }
    
    showActTableTranscode(items,contents);

    showTranSetHtml(contents);
    contents.push('</table>');
    
    
    el("divActConfig").innerHTML = contents.join("");
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
    	}
    });
    initSelectTranValue();
    initTemplateName(node.nodeParam.id);
}

function showActTableTranscode(items,contents){
	if (items) {
        items = items.length ? items : [items];
		var index = 0;
		for (var i = 0; i < items.length; i++) {
        	if(valueOf(items[i], "@visible", "")&&valueOf(items[i], "@visible", "")=="true"){
        		contents.push('<div style="display:none;">'+createControl(items[i])+"</div>");
        	}else{
        		if (index == 0) {
                    contents.push('<tr>');
                    index = 0;
                }
        		index++;
        		contents.push('<td><label for="txtConfig' + items[i]["@name"] + '" class="control-label">' + valueOf(items[i], "@desc", "") + ':</label></td>');
        		if (isDoubleSize(items[i])) {
        			contents.push('<td colspan="4">');
        		}
        		else {
        			contents.push('<td>');
        		}
        		var validateType = '';
        		if(valueOf(items[i], "@allowEmpty", "")=="false"){
        			validateType = 'validatetype="NotEmpty"';
        		}
        		contents.push(createControl(items[i]));
        		contents.push('</td>');
        		var variableStr = gCurrentProcess.procState==0&&items[i]["@allowVariable"]&&items[i]["@allowVariable"]=="true"?'<span class="glyphicon glyphicon-th" style="cursor:pointer;" title="变量设置" onclick="loadVariable(\'txtConfig' + items[i]["@name"] + '\');"></span>':"";
        		contents.push('<td><div style="padding-left:0px;width:100%;">'+variableStr+'</div></td>');
        		if (index==2||i==items.length-1) {
                    contents.push('</tr>');
                    index = 0;
                }
        	}
        }
    }
}

function showTranSetHtml(contents){
	//台标
    contents.push('<tr>');
    contents.push('<td><label for="txtConfigStationPath" class="control-label">台标路径:</label></td><td colspan="5"><input id="txtConfigStationPath" type="text" title="仅限于tga、png、jpg、bmp后缀文件" class="form-control input-sm" style="width:100%;"/><input type="hidden" id="hidStationPath">');
    contents.push('</td>');
    contents.push('</tr>');
    
    contents.push('<tr>');
    contents.push('<td><label for="txtConfigXOffset" class="control-label">X偏移:</label></td><td><input id="txtConfigXOffset" class="form-control input-sm" style="width:100%" validatetype="Int,minvalue,maxvalue" minvalue="0" maxvalue="1920" type="text"/></td><td>px</td>');
    contents.push('<td><label for="txtConfigYOffset" class="control-label">Y偏移:</label></td><td><input id="txtConfigYOffset" class="form-control input-sm" style="width:100%" validatetype="Int,minvalue,maxvalue" minvalue="0" maxvalue="1080" type="text"/></td><td>px</td>');
    contents.push('</tr>');
    
    //MXF

    contents.push('<tr>');
    contents.push('<td><label class="control-label"><input id="txtConfigAFDCheckBox" type="checkbox" class="checkboxMid"/><span class="checkboxMid">&nbsp;AFD:</span></label></td>');
    contents.push('<td><label style="position: relative; font-weight: normal; margin-bottom: 0;width:100%"><input id="txtConfigAFD"  onclick="jetsennet.ui.DropDownList.show(this)" readonly class="form-control input-sm" style="width:100%"/><i class="fa fa-lg fa-caret-down" style="position: absolute;top: 10px;right: 10px;"></i></label></td><td></td>');
    contents.push('<td><label class="control-label"><input id="txtConfigANCCheckBox" class="checkboxMid" type="checkbox"/><span class="checkboxMid">&nbsp;ANC Stream</span></label></td><td>&nbsp;</td>');
    contents.push('<td></td></tr>');
}


/**
 * 初始化下拉框
 * @return
 */
function initSelectTranValue(){
	el("txtConfigAFD").setAttribute("handing", " 上变换PillarBox(左右加边)模式~PillarBox|上变换FullWidth(上下裁边)模式~FullWidth|上变换Stretch（拉伸）模式~Stretch模式|下变换LetterBox(上下加边)模式~LetterBox|下变换EdgeCrop(左右裁边)模式~EdgeCrop|下变换Squeeze（压缩）模式~Squeeze模式");
	jetsennet.ui.DropDownList.initOptions("txtConfigAFD");	
}

function setActParameterTrans(items, node){
	var options = {igoreAttribute:false,attributeFlag:"@",valueFlag:"$",trueValue:"true",falseValue:"false"};
    var params = jQuery.extend({}, jetsennet.xml.deserialize(node.nodeParam.parameter,options));
	if (items) {
        items = items.length ? items : [items];
        for (var i = 0; i < items.length; i++) {
        	var defaultValue = valueOf(items[i], "@deafult", "");
        	var name = items[i]["@name"];
        	var source = items[i]["@source"];
        	if (source == SOURCE_CUSTOM || source == SOURCE_DB || source == SOURCE_VAR) {
        		var handing = attributeOf(el("txtConfig" + name), "handing", "");
        		var handsources = handing.split("|");
        		jQuery.each(handsources, function (j) {
        			var sourceItem = handsources[j].split("~");
        			if(sourceItem[1] == defaultValue && !params[name]){
        				jetsennet.ui.DropDownList["txtConfig" + name].selectedValue = sourceItem[1];
        				el("txtConfig" + name).value = sourceItem[0];
        			}
        			if (params[name]&&sourceItem[1] == params[name].$) {
        				jetsennet.ui.DropDownList["txtConfig" + name].selectedValue = sourceItem[1];
        				el("txtConfig" + name).value = sourceItem[0];
        			}
        		});
        	}else{
        		if(params[name]&&params[name].$){
            		var paramValue = params[name].$;
            		el("txtConfig" + name).value = allVarNameArray.in_array(paramValue.replace("@", "")) ? (paramValue.replace("@", "")) : paramValue;
            	}
        	}
        }
	}
	el("txtConfigStationPath").value = params["stationPath"]&&params.stationPath.$?params.stationPath.$:"";
	el("hidStationPath").value = el("txtConfigStationPath").value;
    el("txtConfigXOffset").value = params["xOffset"]&&params.xOffset.$?params.xOffset.$:"";
    el("txtConfigYOffset").value = params.yOffset&&params.yOffset.$?params.yOffset.$:"";
    setAFDValue("AFD",params);
    el("txtConfigANCCheckBox").checked = params["ANC"]&&valueOf(params["ANC"], "@switch", "")=="on"?true:false;
}


function setAFDValue(name,params){
	var handing = attributeOf(el("txtConfig" + name), "handing", "");
    var handsources = handing.split("|");
    jQuery.each(handsources, function (j) {
        var sourceItem = handsources[j].split("~");
        if (params[name]&&sourceItem[1] == params[name].$) {
            jetsennet.ui.DropDownList["txtConfig" + name].selectedValue = sourceItem[1];
            el("txtConfig" + name).value = sourceItem[0];
        }
    });
    if(el("txtConfig" + name+"CheckBox")){
    	el("txtConfig" + name+"CheckBox").checked = valueOf(params[name], "@switch", "")=="on"?true:false;
    }
} 


function getActParameterTrans(items, node) {
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
                jQuery.each(handsources, function (j) {
                    var sourceItem = handsources[j].split("~");
                    if (sourceItem[0] == el("txtConfig" + name).value) {
                        params[name] = sourceItem[1];
                    } 
                });
            }else{
            	params[name] = allVarNameArray.in_array(el("txtConfig" + name).value) ? ("@" + el("txtConfig" + name).value) : el("txtConfig" + name).value;
            }
        }
    }
    params["stationPath"] = el("txtConfigStationPath").value;
    params["xOffset"] = el("txtConfigXOffset").value;
    params["yOffset"] = el("txtConfigYOffset").value;
    str += jetsennet.xml.serialize({"@switch":el("txtConfigAFDCheckBox").checked?"on":"off",$:jetsennet.ui.DropDownList["txtConfigAFD"].selectedValue},"AFD");
    str += jetsennet.xml.serialize({"@switch":el("txtConfigANCCheckBox").checked?"on":"off",$:el("txtConfigANCCheckBox").checked?"true":"false"},"ANC");
  
    return jetsennet.xml.serialize(params, "param").replace("</param>",str+"</param>");
}


function getVal(obj){
	el("txtConfigStationPath").value = obj.value;
	var Sys = {}; 
	var ua = navigator.userAgent.toLowerCase(); 
	
	var s; 
	(s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1] : 
	(s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1] : 
	(s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1] : 
	(s = ua.match(/opera.([\d.]+)/)) ? Sys.opera = s[1] : 
	(s = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] : 0;
	if(Sys.ie<="6.0"){
		el("txtConfigStationPath").value = obj.value;
	}else if(Sys.ie>="7.0"){
		obj.select();
		el("txtConfigStationPath").value = document.selection.createRange().text;
	}
}