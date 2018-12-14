//直接导入模板进行转码
function showMXFFileCreate(node) {
    var items;
    if (node.nodeParam.actType == 2 || node.nodeParam.actType == 3) {
    	var param = new HashMap();
        param.put("actId", node.nodeParam.actId);
        var sResult = WFMDAO.execute("getActConfig", param);
        items = jetsennet.xml.deserialize(sResult.resultVal, { igoreAttribute: false }).item;
    }
    initVaribale();
    renderActConfigMxfCreate(items, node);
    if (el('hiddenProcId')) {
        el('hiddenProcId').value = node.nodeParam.id;
    }
    el('txtConfigName').value = node.nodeParam.name;
    setActParameterMxfCreate(items, node);
    var dialog = new jetsennet.ui.Window("act-config");
    jQuery.extend(dialog, { windowStyle: 1, submitBox: gCurrentProcess.procState!=0?false:true, cancelBox: gCurrentProcess.procState!=0?false:true, maximizeBox: false, minimizeBox: false, 
    	size: { width: 530, height: 0 }, showScroll: false, title: "参数配置" });
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
    		if(el('txtTemplateName').value=="" && el('templateImportName') && el('templateImportName').value==""){
    			jetsennet.alert("请先导入MXF模板！");
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
    		node.nodeParam.parameter = getActParametermxfCreate(items, node);
    		//如果是已使用的流程，直接更新参数
    		
    		mxfCreateTemImport(node,dialog);
    	}
    };
    dialog.showDialog();
    initInputDisabled();
}


var mxfCreateTemImport = function(node,dialog){
	if (el('templateImportName') && el('templateImportName').value) {
		var suffix = el('templateImportName').value.substring(el('templateImportName').value.lastIndexOf(".")+1,el('templateImportName').value.length);
		el('hiddenSuffix').value = "mxffile";
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



function renderActConfigMxfCreate(items, node) {
    array = [];
    var contents = [];
    contents.push('<div class="form-horizontal mg-lg">');
    //节点名称
    contents.push('<div class="form-group">');
    contents.push('<label for="txtConfigName" class="col-sm-4 control-label">名称：</label>');
    contents.push('<div class="col-sm-7" style="padding-right:3px"><div class="input-group input-group-sm"><input type="text" class="form-control input-sm" id="txtConfigName" validatetype="NotEmpty,maxlength" maxlength="40"/><span class="input-group-addon" style="color: Red">*</span></div></div><div class="col-sm-1"></div>');
    contents.push('</div>');
    
	contents.push('<div class="form-group">');
	contents.push('<label for="txtTemplateName" class="col-sm-4 control-label">模板名称:</label>');
	contents.push('<div class="col-sm-7" style="padding-right:3px"><input id="txtTemplateName" type="text" class="form-control input-sm" style="width:100%;" disabled="disabled"/></div>');
	contents.push('</div>');


	showActTable(items,contents);
	contents.push('<div class="form-group">');
    contents.push('<label for="templateImportName" class="col-sm-4 control-label">参数模板：</label><div class="col-sm-7" style="padding-right:3px">');
    contents.push('<form action="../../../templateImport" method="post" id="templateImport" target="hiddenframe" enctype="multipart/form-data"><input type="file" id="templateImportName" name="templateImportName" onkeydown="return false" onpaste="return false"  class="form-control input-sm" style="width:100%;"/><input type="hidden" id="hiddenProcId" name="hiddenProcId" value=""/><input type="hidden" id="hiddenSuffix" name="hiddenSuffix" value=""/></form>');
    contents.push('</div><div class="col-sm-1"></div>');
    contents.push('</div>');
    
    contents.push('</div>');
    
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
    initTemplateName(node.nodeParam.id);
}



function setActParameterMxfCreate(items, node){
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
}



function getActParametermxfCreate(items, node) {
    var params = {};
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
    return jetsennet.xml.serialize(params, "param");
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