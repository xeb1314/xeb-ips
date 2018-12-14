var mediaInfoArray= [];
var videoInfoArray = [];
var audioInfoArray = [];


//媒体信息定制
function showMideaInfoActConfig(node) {
    var items;
    if (node.nodeParam.actType == 2 || node.nodeParam.actType == 3) {
    	var param = new HashMap();
        param.put("actId", node.nodeParam.actId);
        var sResult = WFMDAO.execute("getActConfig", param);
        items = jetsennet.xml.deserialize(sResult.resultVal, { igoreAttribute: false }).item;
    }
    initMideaInfoArray(items);
    initVaribale();
    renderMideaInfoActConfig(items, node);
    
    el('txtConfigName').value = node.nodeParam.name;
    setActParameterMediaInfo(items, node);

    var dialog = new jetsennet.ui.Window("act-config");
    jQuery.extend(dialog, { windowStyle: 1, submitBox: gCurrentProcess.procState!=0?false:true, cancelBox:gCurrentProcess.procState!=0?false:true, maximizeBox: false, minimizeBox: false, 
    	size: { width: 730, height: 0 }, showScroll: false, title: "参数配置" });
    dialog.controls = ["divActConfig"];
    dialog.onsubmit = function () {
    	if(gCurrentProcess.procState!=0){
    		dialog.close();
    		return;
    	}
    	var areaElements = jetsennet.form.getElements('divActConfig');
    	if (jetsennet.form.validate(areaElements, true)) {
    		/**重命名*/
    		var actName = el('txtConfigName').value;
    		gFlowView.isChanged = true;
    		if (actName != node.nodeParam.name) {
    			node.nodeParam.name = actName;
    			node.setNodeName(actName);
    			jQuery(node.control).attr("title",actName);
    			//如果是已使用的流程，直接更新名称
    			if (!gFlowView.isDesignMode) {
    				var params = new HashMap();
    	            params.put("className", "ProcactBusiness");
    	            params.put("updateXml",  jetsennet.xml.serialize({ PROCACT_ID: node.nodeParam.id, PROCACT_NAME: actName }, "Request"));
    	            params.put("isFilterNull", true);
    	            var sResult = WFMDAO.execute("commonObjUpdateByPk",params);
    				if(sResult.errorCode==0){
    					gFlowView.isChanged = false;
    				}
    			}
    		}
    		
    		//获取值
    		node.nodeParam.parameter = getActParameterMediaInfo(items, node);
    		
    		//如果是已使用的流程，直接更新参数
    		if (!gFlowView.isDesignMode) {
    			var params = new HashMap();
	            params.put("className", "ProcactBusiness");
	            params.put("updateXml",  jetsennet.xml.serialize({ PROCACT_ID: node.nodeParam.id, ACT_PARAM: node.nodeParam.parameter }, "ActParam"));
	            params.put("isFilterNull", true);
	            var sResult = WFMDAO.execute("commonObjUpdateByPk",params);
	            if(sResult.errorCode==0){
	            	gFlowView.isChanged = false;
					jetsennet.message("保存成功");
				}
    		}
    		dialog.close();
    	}
    };
    dialog.showDialog();
    initInputDisabled();
}


function renderMideaInfoActConfig(items, node){
    var contents = [];
    contents.push('<table border="0" cellpadding="0" cellspacing="0" class="table-info-5" id="tab_mideaInfo" width="715px">');
    contents.push('<colgroup>');
    contents.push('<col width="130px" />');
    contents.push('<col width="auto" />');
    contents.push('<col width="20px;" />');
    contents.push('<col width="150px;"/>');
    contents.push('<col width="auto" />');
    contents.push('<col width="20px;" />');
    contents.push('</colgroup>');

    //节点名称
    contents.push('<tr>');
    contents.push('<td width="150px;"><label for="txtConfigName" class="control-label">名称:</label></td><td width="200px;"><div class="input-group input-group-sm"><input id="txtConfigName" type="text" class="form-control input-sm" style="width:100%;" validatetype="NotEmpty,maxlength" maxlength="20"/><span class="input-group-addon" style="color: Red">*</span></div></td><td width="20px;"></td><td width="150px;"></td><td width="200px;"></td><td width="20px;"></td>');
    contents.push('</tr>');

    showMideaInfoActTable(mediaInfoArray,contents);
    contents.push('</table>');
    showHtmlInfo(videoInfoArray,contents);
	showHtmlInfo(audioInfoArray,contents);
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
    initSelectValue(items);
}


function showMideaInfoActTable(mediaInfoArray,contents){
	if(mediaInfoArray){
		var index = 0;
		for (var i = 0; i < mediaInfoArray.length; i++) {
			if(valueOf(mediaInfoArray[i], "@visible", "")&&valueOf(mediaInfoArray[i], "@visible", "")=="true"){
        		contents.push('<div style="display:none;">'+createControl(mediaInfoArray[i])+"</div>");
        	}else{
        		if (index == 0) {
                    contents.push('<tr>');
                    index = 0;
                }
        		if(!valueOf(mediaInfoArray[i], "@desc", "")){
        			continue;
        		}
                index++;
                if(valueOf(mediaInfoArray[i], "@desc", "")){
                	if(valueOf(mediaInfoArray[i], "@source", "")==4){
                		if(valueOf(mediaInfoArray[i], "@allowInput", "")=="true"){
                			contents.push('<td>');
                			contents.push('<label class="control-label">'+createCheckBoxControl(mediaInfoArray[i]) + '<span class="checkboxMid">&nbsp;&nbsp;'+ valueOf(mediaInfoArray[i], "@desc", "")+':</span></label>');
                			contents.push('</td>');
                			contents.push('<td>');
                			contents.push(createInputControl(mediaInfoArray[i]));
                			contents.push('</td><td></td>');
                		}else{
                			contents.push('<td colspan="3">');
                			contents.push('<label  class="control-label">'+createCheckBoxControl(mediaInfoArray[i]) + '<span class="checkboxMid">&nbsp;&nbsp;'+ valueOf(mediaInfoArray[i], "@desc", "")+'</span></label>');
                			contents.push('</td>');
                		}
                	}else if(valueOf(mediaInfoArray[i], "@source", "")){
                		contents.push('<td><label class="control-label">' + valueOf(mediaInfoArray[i], "@desc", "") + ':</label></td>');
                		contents.push('<td>');
                		contents.push(createControl(mediaInfoArray[i]));
                		contents.push('</td><td>');
                		if(valueOf(mediaInfoArray[i], "@allowVariable", "")=="true"){
                			var variableStr = gCurrentProcess.procState==0?'<span class="glyphicon glyphicon-th" style="cursor:pointer;padding-left:2px;" title="变量设置" onclick="loadVariable(\'txtConfig' + mediaInfoArray[i]["@name"] + '\');"></span>':'';
                			contents.push(variableStr);
                		}
                		contents.push('</td>');
                	}else{
                		var validateType = '';
                		if(valueOf(mediaInfoArray[i], "@allowEmpty", "")=="false"){
                			validateType = 'validatetype="NotEmpty"';
                		}
                		contents.push('<td><label class="control-label"><input id="txtConfig' + valueOf(mediaInfoArray[i], "@name", "") + 'CheckBox" type="checkbox" class="checkboxMid"/><span class="checkboxMid">&nbsp;&nbsp;'+ valueOf(mediaInfoArray[i], "@desc", "") +':</span></label></td>');
                		contents.push('<td>');
                		contents.push('<input id="txtConfig' + valueOf(mediaInfoArray[i], "@name", "") + '" '+validateType+' readonly class="form-control input-sm" style="width:100%;" />');
                		contents.push('</td>');
                		contents.push('<td>');
                		var variableStr = gCurrentProcess.procState==0?'<span class="glyphicon glyphicon-th" style="cursor:pointer;padding-left:2px;" title="变量设置" onclick="loadVariable(\'txtConfig' + mediaInfoArray[i]["@name"] + '\');"></span>':'';
                		contents.push(variableStr);
                		contents.push('</td>');
                	}
                }else{
                	contents.push('<td colspan="3"></td>');
                }
                if (index==2||i==mediaInfoArray.length-1) {
                    contents.push('</tr>');
                    index=0;
                }
        	}
        }
	}
}


function showHtmlInfo(array,contents){
	if (array) {
		var tableId= "id=tab_audio";
		if(valueOf(array[0], "@type", "")=="2"){
			tableId= "id=tab_video";
		}
		contents.push('<table border="0" cellpadding="0" cellspacing="0" class="table-info-5" width="715px" '+tableId+'>');
	    contents.push('<colgroup>');
	    contents.push('<col width="130px" />');
	    contents.push('<col width="auto" />');
	    contents.push('<col width="20px;" />');
	    contents.push('<col width="150px;"/>');
	    contents.push('<col width="auto" />');
	    contents.push('<col width="20px;" />');
	    contents.push('</colgroup>');

	    //节点名称
	    contents.push('<tr>');
	    if(valueOf(array[0], "@type", "")=="2"){
	    	contents.push('<td width="150px;"><label class="control-label">视频流信息</label></td><td width="200px;"><input id="txtConfigVideo" readonly onclick="jetsennet.ui.DropDownList.show(this)" class="form-control input-sm" style="width:100%;" /></td><td width="20px;"></td><td width="150px;"></td><td width="200px;"></td><td width="20px;"></td>');
	    }else{
	    	contents.push('<td width="150px;"><label class="control-label">音频流信息</label></td><td width="200px;"><input id="txtConfigAudio" readonly onclick="jetsennet.ui.DropDownList.show(this)" class="form-control input-sm" style="width:100%;"/></td><td colspan="2"><input type="button" class="button" id="audioButton" value="保存音频流1" onclick="saveAudio();"/></td><td width="200px;"></td><td width="20px;"></td>');
	    }
	    contents.push('</tr>');

        var isNext = false;
        for (var i = 0; i < array.length; i++) {

            if (!isNext) {
                contents.push('<tr>');
            }
            if (valueOf(array[i], "@allowCheckbox", "")) {
            	contents.push('<td><label class="control-label">'+ valueOf(array[i], "@desc", "") +':</label></td>');
            }else{
            	contents.push('<td><label class="control-label"><input id="txtConfig' + valueOf(array[i], "@name", "") + 'CheckBox" type="checkbox" class="checkboxMid"/><span class="checkboxMid">&nbsp;&nbsp;'+ valueOf(array[i], "@desc", "") +':</span></label></td>');
            }
            contents.push('<td>');
            contents.push('<label style="position: relative; font-weight: normal; margin-bottom: 0;width:100%">');
            contents.push('<input id="txtConfig' + valueOf(array[i], "@name", "") + '" onclick="jetsennet.ui.DropDownList.show(this)" readonly class="form-control input-sm" style="width:100%;"/>');
            contents.push('<i class="fa fa-lg fa-caret-down" style="position: absolute;top: 10px;right: 10px;"></i></label>');
            contents.push('</td>');
            contents.push('<td>');
//        	if(valueOf(array[0], "@type", "")=="2"){
//        		var variableStr = '<span class="glyphicon glyphicon-th" title="变量设置" onclick="loadVariable(txtConfig' + array[i]["@name"] + ');"></span>';
//        		contents.push(variableStr);
//        	}
        	contents.push('</td>');
            if (isNext || i == array.length - 1 || (i < array.length - 1 && isDoubleSize(array[i + 1]))) {
                contents.push('</tr>');
                isNext = false;
            }
            else {
                isNext = true;
            }
        }
        contents.push('</table>');
    }
}


/**
 * 初始化媒体信息数组
 * @return
 */
function initMideaInfoArray(items){
	mediaInfoArray= [];
	videoInfoArray = [];
	audioInfoArray = [];
	if (items) {
        items = items.length ? items : [items];
        for (var i = 0; i < items.length; i++) {
            if (valueOf(items[i], "@type", "")=="1") {
            	mediaInfoArray.push(items[i]);
            }else if(valueOf(items[i], "@type", "")=="2"){
    			videoInfoArray.push(items[i]);
    		}else if(valueOf(items[i], "@type", "")=="3"){
    			audioInfoArray.push(items[i]);
    		}
        }
    }
}

/**
 * 初始化select的下拉值
 * @return
 */
function initSelectValue(items){
	var handingStr = "";
	var handing = [];
	if(viarable_result&&viarable_result.length>0){
		var records = viarable_result; 
        for (var i = 0, len = records.length; i < len; i++) {
        	handing.push(records[i]["VAR_NAME"].replace("@", "") + "~" + records[i]["VAR_NAME"]);
        }
	}
	handingStr = handing.join("|");
	for(var i=0;i<items.length; i++){
		if(!valueOf(items[i], "@source", "")&&valueOf(items[i], "@name", "")){
			el("txtConfig"+valueOf(items[i], "@name", "")).setAttribute("handing", handingStr);
			jetsennet.ui.DropDownList.initOptions("txtConfig"+valueOf(items[i], "@name", ""));
		}
	}
	el("txtConfigVideo").setAttribute("handing", "视频流1~1");
	el("txtConfigAudio").setAttribute("handing", "音频流1~1|音频流2~2|音频流3~3|音频流4~4|音频流5~5|音频流6~6|音频流7~7|音频流8~8");
	jetsennet.ui.DropDownList.initOptions("txtConfigVideo");
	jetsennet.ui.DropDownList.initOptions("txtConfigAudio");
    el("txtConfigVideo").value = "视频流1";
    el("txtConfigAudio").value = "音频流1";
	jetsennet.ui.DropDownList["txtConfigVideo"].selectedValue = 1;
	jetsennet.ui.DropDownList["txtConfigAudio"].selectedValue = 1;
	jetsennet.ui.DropDownList["txtConfigAudio"].onchanged = function (item) {
		changeAudioValue(item.value);
    };
}

var audioParamArray = [];
function changeAudioValue(audioIndex){
	var areaElements = jetsennet.form.getElements('tab_audio');
	jetsennet.form.clearValidateState(areaElements);
	el("audioButton").value = "保存音频流"+audioIndex;
	if(audioParamArray.length>0){
		if(audioParamArray[audioIndex-1]){
			jetsennet.ui.DropDownList["txtConfigaudio_pid"].selectedValue = audioParamArray[audioIndex-1].audio_pid;
			jetsennet.ui.DropDownList["txtConfigaudio_fourcc"].selectedValue = audioParamArray[audioIndex-1].audio_fourcc;
			jetsennet.ui.DropDownList["txtConfigaudio_bitPerSample"].selectedValue = audioParamArray[audioIndex-1].audio_bitPerSample;
			jetsennet.ui.DropDownList["txtConfigaudio_channels"].selectedValue = audioParamArray[audioIndex-1].audio_channels;
			jetsennet.ui.DropDownList["txtConfigaudio_bitRate"].selectedValue = audioParamArray[audioIndex-1].audio_bitRate;
			jetsennet.ui.DropDownList["txtConfigaudio_freq"].selectedValue = audioParamArray[audioIndex-1].audio_freq;
			jetsennet.ui.DropDownList["txtConfigaudio_bitRateMode"].selectedValue = audioParamArray[audioIndex-1].audio_bitRateMode;
			jetsennet.ui.DropDownList["txtConfigaudio_samples"].selectedValue = audioParamArray[audioIndex-1].audio_samples;
			el("txtConfigaudio_pid").value = audioParamArray[audioIndex-1].audio_pid?audioParamArray[audioIndex-1].audio_pid.replace("@",""):"";
			el("txtConfigaudio_fourcc").value = audioParamArray[audioIndex-1].audio_fourcc?audioParamArray[audioIndex-1].audio_fourcc.replace("@",""):"";
			el("txtConfigaudio_bitPerSample").value = audioParamArray[audioIndex-1].audio_bitPerSample?audioParamArray[audioIndex-1].audio_bitPerSample.replace("@",""):"";
			el("txtConfigaudio_channels").value = audioParamArray[audioIndex-1].audio_channels?audioParamArray[audioIndex-1].audio_channels.replace("@",""):"";
			el("txtConfigaudio_bitRate").value = audioParamArray[audioIndex-1].audio_bitRate?audioParamArray[audioIndex-1].audio_bitRate.replace("@",""):"";
			el("txtConfigaudio_freq").value = audioParamArray[audioIndex-1].audio_freq?audioParamArray[audioIndex-1].audio_freq.replace("@",""):"";
			el("txtConfigaudio_bitRateMode").value = audioParamArray[audioIndex-1].audio_bitRateMode?audioParamArray[audioIndex-1].audio_bitRateMode.replace("@",""):"";
			el("txtConfigaudio_samples").value = audioParamArray[audioIndex-1].audio_samples?audioParamArray[audioIndex-1].audio_samples.replace("@",""):"";
			
			el("txtConfigaudio_pidCheckBox").checked = audioParamArray[audioIndex-1].audio_pid_checkbox;
			el("txtConfigaudio_fourccCheckBox").checked = audioParamArray[audioIndex-1].audio_fourcc_checkbox;
			el("txtConfigaudio_bitPerSampleCheckBox").checked = audioParamArray[audioIndex-1].audio_bitPerSample_checkbox;
			el("txtConfigaudio_channelsCheckBox").checked = audioParamArray[audioIndex-1].audio_channels_checkbox;
			el("txtConfigaudio_bitRateCheckBox").checked = audioParamArray[audioIndex-1].audio_bitRate_checkbox;
			el("txtConfigaudio_freqCheckBox").checked = audioParamArray[audioIndex-1].audio_freq_checkbox;
			el("txtConfigaudio_bitRateModeCheckBox").checked = audioParamArray[audioIndex-1].audio_bitRateMode_checkbox;
			el("txtConfigaudio_samplesCheckBox").checked = audioParamArray[audioIndex-1].audio_samples_checkbox;
		}else{
			clearform();
		}
	}
}


function saveAudio(){
	var audioIndex = jetsennet.ui.DropDownList["txtConfigAudio"].selectedValue;
	var areaElements = jetsennet.form.getElements('tab_audio');
	jetsennet.form.clearValidateState(areaElements);
	if (jetsennet.form.validate(areaElements, true)) {
		var audioParam = {
				audio_pid:jetsennet.ui.DropDownList["txtConfigaudio_pid"].selectedValue?jetsennet.ui.DropDownList["txtConfigaudio_pid"].selectedValue:"",
				audio_fourcc:jetsennet.ui.DropDownList["txtConfigaudio_fourcc"].selectedValue?jetsennet.ui.DropDownList["txtConfigaudio_fourcc"].selectedValue:"",
				audio_bitPerSample:jetsennet.ui.DropDownList["txtConfigaudio_bitPerSample"].selectedValue?jetsennet.ui.DropDownList["txtConfigaudio_bitPerSample"].selectedValue:"",
				audio_channels:jetsennet.ui.DropDownList["txtConfigaudio_channels"].selectedValue?jetsennet.ui.DropDownList["txtConfigaudio_channels"].selectedValue:"",
				audio_bitRate:jetsennet.ui.DropDownList["txtConfigaudio_bitRate"].selectedValue?jetsennet.ui.DropDownList["txtConfigaudio_bitRate"].selectedValue:"",
				audio_freq:jetsennet.ui.DropDownList["txtConfigaudio_freq"].selectedValue?jetsennet.ui.DropDownList["txtConfigaudio_freq"].selectedValue:"",
				audio_bitRateMode:jetsennet.ui.DropDownList["txtConfigaudio_bitRateMode"].selectedValue?jetsennet.ui.DropDownList["txtConfigaudio_bitRateMode"].selectedValue:"",
				audio_samples:jetsennet.ui.DropDownList["txtConfigaudio_samples"].selectedValue?jetsennet.ui.DropDownList["txtConfigaudio_samples"].selectedValue:"",
				audio_pid_checkbox: el("txtConfigaudio_pidCheckBox").checked,
				audio_fourcc_checkbox: el("txtConfigaudio_fourccCheckBox").checked,
				audio_bitPerSample_checkbox:el("txtConfigaudio_bitPerSampleCheckBox").checked,
				audio_channels_checkbox:el("txtConfigaudio_channelsCheckBox").checked,
				audio_bitRate_checkbox:el("txtConfigaudio_bitRateCheckBox").checked,
				audio_freq_checkbox:el("txtConfigaudio_freqCheckBox").checked,
				audio_bitRateMode_checkbox:el("txtConfigaudio_bitRateModeCheckBox").checked,
				audio_samples_checkbox:el("txtConfigaudio_samplesCheckBox").checked,
				};
		if(audioParamArray[audioIndex-1]){
			audioParamArray[audioIndex-1] = audioParam;
		}else{
			audioParamArray.push(audioParam);
		}
	}
}


function clearform(){
	el("txtConfigaudio_pid").value = "";
	el("txtConfigaudio_fourcc").value = "";
	el("txtConfigaudio_bitPerSample").value = "";
	el("txtConfigaudio_channels").value = "";
	el("txtConfigaudio_bitRate").value = "";
	el("txtConfigaudio_freq").value = "";
	el("txtConfigaudio_bitRateMode").value = "";
	el("txtConfigaudio_samples").value = "";
	el("txtConfigaudio_pidCheckBox").checked = false;
	el("txtConfigaudio_fourccCheckBox").checked = false;
	el("txtConfigaudio_bitPerSampleCheckBox").checked = false;
	el("txtConfigaudio_channelsCheckBox").checked = false;
	el("txtConfigaudio_bitRateCheckBox").checked = false;
	el("txtConfigaudio_freqCheckBox").checked = false;
	el("txtConfigaudio_bitRateModeCheckBox").checked = false;
	el("txtConfigaudio_samplesCheckBox").checked = false;
	jetsennet.ui.DropDownList["txtConfigaudio_pid"].selectedValue = "";
	jetsennet.ui.DropDownList["txtConfigaudio_fourcc"].selectedValue = "";
	jetsennet.ui.DropDownList["txtConfigaudio_bitPerSample"].selectedValue = "";
	jetsennet.ui.DropDownList["txtConfigaudio_channels"].selectedValue = "";
	jetsennet.ui.DropDownList["txtConfigaudio_bitRate"].selectedValue = "";
	jetsennet.ui.DropDownList["txtConfigaudio_freq"].selectedValue = "";
	jetsennet.ui.DropDownList["txtConfigaudio_bitRateMode"].selectedValue = "";
	jetsennet.ui.DropDownList["txtConfigaudio_samples"].selectedValue = "";
	
}

function getActParameterMediaInfo(items, node){
	var params = {};
	var str = "";
	for(var i=0;i<items.length; i++){
		if(items[i]["@type"]=="1"||items[i]["@type"]=="2"){
			var name = items[i]["@name"];
	    	var source = items[i]["@source"];
	    	if(name){
	    		if(items[i]["@allowCheckbox"]){
	    			if (source == SOURCE_CUSTOM || source == SOURCE_DB || source == SOURCE_VAR) {
	    				params[items[i]["@name"]] = jetsennet.ui.DropDownList["txtConfig"+items[i]["@name"]].selectedValue;
	    			}else{
	    				params[name] = allVarNameArray.in_array(el("txtConfig" + name).value) ? ("@" + el("txtConfig" + name).value) : el("txtConfig" + name).value;
	    			}
	    		}else{
	    			var value = "";
	    			if(el("txtConfig" + items[i]["@name"])){
	    				if (source == SOURCE_CUSTOM || source == SOURCE_DB || source == SOURCE_VAR) {
	    					value = jetsennet.ui.DropDownList["txtConfig"+items[i]["@name"]].selectedValue;
	    				}else{
	    					value = allVarNameArray.in_array(el("txtConfig" + name).value) ? ("@" + el("txtConfig" + name).value) : el("txtConfig" + name).value;
	    				}
	    			}else{
	            		if(el("txtConfig" + items[i]["@name"] + "CheckBox").checked){
	            			value = "true";
	            		}else{
	            			value = "false";
	            		}
	            	}
	    			str += jetsennet.xml.serialize({"@switch":el("txtConfig" + items[i]["@name"] + "CheckBox")&&el("txtConfig" + items[i]["@name"] + "CheckBox").checked?"on":"off",$:value},items[i]["@name"]);
	    		}
	    	}
		}
	}
	for ( var j = 0; j < audioParamArray.length; j++) {
		str += jetsennet.xml.serialize({"@switch":audioParamArray[j].audio_pid_checkbox?"on":"off",$:audioParamArray[j].audio_pid},"audio_pid_"+(j+1));
		str += jetsennet.xml.serialize({"@switch":audioParamArray[j].audio_fourcc_checkbox?"on":"off",$:audioParamArray[j].audio_fourcc},"audio_fourcc_"+(j+1));
		str += jetsennet.xml.serialize({"@switch":audioParamArray[j].audio_bitPerSample_checkbox?"on":"off",$:audioParamArray[j].audio_bitPerSample},"audio_bitPerSample_"+(j+1));
		str += jetsennet.xml.serialize({"@switch":audioParamArray[j].audio_channels_checkbox?"on":"off",$:audioParamArray[j].audio_channels},"audio_channels_"+(j+1));
		str += jetsennet.xml.serialize({"@switch":audioParamArray[j].audio_bitRate_checkbox?"on":"off",$:audioParamArray[j].audio_bitRate},"audio_bitRate_"+(j+1));
		str += jetsennet.xml.serialize({"@switch":audioParamArray[j].audio_freq_checkbox?"on":"off",$:audioParamArray[j].audio_freq},"audio_freq_"+(j+1));
		str += jetsennet.xml.serialize({"@switch":audioParamArray[j].audio_bitRateMode_checkbox?"on":"off",$:audioParamArray[j].audio_bitRateMode},"audio_bitRateMode_"+(j+1));
		str += jetsennet.xml.serialize({"@switch":audioParamArray[j].audio_samples_checkbox?"on":"off",$:audioParamArray[j].audio_samples},"audio_samples_"+(j+1));
	}
	return jetsennet.xml.serialize(params, "param").replace("</param>",str+"</param>");
}

function setActParameterMediaInfo(items, node){

	var options = {igoreAttribute:false,attributeFlag:"@",valueFlag:"$",trueValue:"true",falseValue:"false"};
    var params = jQuery.extend({}, jetsennet.xml.deserialize(node.nodeParam.parameter,options));
    for ( var j = 0; j < mediaInfoArray.length; j++) {
    	var name = mediaInfoArray[j]["@name"];
    	if(name){
    		var source = mediaInfoArray[j]["@source"];
    		if (source == SOURCE_CUSTOM || source == SOURCE_DB || source == SOURCE_VAR) {
    			setValue(mediaInfoArray[j]["@name"],params,mediaInfoArray[j]["@deafult"]);
    		}else if(source=="4"){
    			if(el("txtConfig" + name+"CheckBox")){
    				if(valueOf(params[name], "@switch", "")){
    					el("txtConfig" + name+"CheckBox").checked = valueOf(params[name], "@switch", "")=="on"?true:false;
    				}else{
    					el("txtConfig" + name+"CheckBox").checked = mediaInfoArray[j]["@deafult"]=="true"?true:false;
    				}
    			}
    			if(el("txtConfig" + name)){
    				if(params[name]){
        				var paramValue = params[name].$;
        				el("txtConfig" + name).value = allVarNameArray.in_array(paramValue.replace("@", "")) ? (paramValue.replace("@", "")) : paramValue;
        			}
    			}
    		}
    		else{
    			if(params[name]){
    				var paramValue = params[name].$;
    				if(el("txtConfig" + name+"CheckBox")){
    					el("txtConfig" + name+"CheckBox").checked = valueOf(params[name], "@switch", "")=="on"?true:false;
    				}
    				if(paramValue){
    					el("txtConfig" + name).value = allVarNameArray.in_array(paramValue.replace("@", "")) ? (paramValue.replace("@", "")) : paramValue;
    				}
    			}
    		}
    	}
	}
    for ( var k = 0; k < videoInfoArray.length; k++) {
    	setValue(videoInfoArray[k]["@name"],params,videoInfoArray[k]["@deafult"]);
	}
    audioParamArray = [];
    var audioCount = 0;
    for(var obj in params){
    	if(obj.split("_").length>2&&obj.indexOf("audio_fourcc")>-1){
    		var index = obj.substring(obj.length-2,obj.length);
    		audioCount++;
    	}
    }
    for ( var m = 1; m < audioCount + 1 ; m++) {
    	var audioParam = {
    			audio_pid:params["audio_pid_"+m].$,
				audio_fourcc:params["audio_fourcc_"+m].$,
				audio_bitPerSample:params["audio_bitPerSample_"+m].$,
				audio_channels:params["audio_channels_"+m].$,
				audio_bitRate:params["audio_bitRate_"+m].$,
				audio_freq:params["audio_freq_"+m].$,
				audio_bitRateMode:params["audio_bitRateMode_"+m].$,
				audio_samples:params["audio_samples_"+m].$,
				audio_pid_checkbox: valueOf(params["audio_pid_"+m], "@switch", "")=="on"?true:false,
				audio_fourcc_checkbox: valueOf(params["audio_fourcc_"+m], "@switch", "")=="on"?true:false,
				audio_bitPerSample_checkbox:valueOf(params["audio_bitPerSample_"+m], "@switch", "")=="on"?true:false,
				audio_channels_checkbox:valueOf(params["audio_channels_"+m], "@switch", "")=="on"?true:false,
				audio_bitRate_checkbox:valueOf(params["audio_bitRate_"+m], "@switch", "")=="on"?true:false,
				audio_freq_checkbox:valueOf(params["audio_freq_"+m], "@switch", "")=="on"?true:false,
				audio_bitRateMode_checkbox:valueOf(params["audio_bitRateMode_"+m], "@switch", "")=="on"?true:false,
				audio_samples_checkbox:valueOf(params["audio_samples_"+m], "@switch", "")=="on"?true:false,
				};
			audioParamArray.push(audioParam);
    }
    if(audioParamArray[0]){
    	jetsennet.ui.DropDownList["txtConfigaudio_pid"].selectedValue = audioParamArray[0].audio_pid;
    	jetsennet.ui.DropDownList["txtConfigaudio_fourcc"].selectedValue = audioParamArray[0].audio_fourcc;
    	jetsennet.ui.DropDownList["txtConfigaudio_bitPerSample"].selectedValue = audioParamArray[0].audio_bitPerSample;
    	jetsennet.ui.DropDownList["txtConfigaudio_channels"].selectedValue = audioParamArray[0].audio_channels;
    	jetsennet.ui.DropDownList["txtConfigaudio_bitRate"].selectedValue = audioParamArray[0].audio_bitRate;
    	jetsennet.ui.DropDownList["txtConfigaudio_freq"].selectedValue = audioParamArray[0].audio_freq;
    	jetsennet.ui.DropDownList["txtConfigaudio_bitRateMode"].selectedValue = audioParamArray[0].audio_bitRateMode;
    	jetsennet.ui.DropDownList["txtConfigaudio_samples"].selectedValue = audioParamArray[0].audio_samples;
    	el("txtConfigaudio_pid").value = audioParamArray[0].audio_pid?audioParamArray[0].audio_pid.replace("@",""):"";
    	el("txtConfigaudio_fourcc").value = audioParamArray[0].audio_fourcc?audioParamArray[0].audio_fourcc.replace("@",""):"";
    	el("txtConfigaudio_bitPerSample").value = audioParamArray[0].audio_bitPerSample?audioParamArray[0].audio_bitPerSample.replace("@",""):"";
    	el("txtConfigaudio_channels").value = audioParamArray[0].audio_channels?audioParamArray[0].audio_channels.replace("@",""):"";
    	el("txtConfigaudio_bitRate").value = audioParamArray[0].audio_bitRate?audioParamArray[0].audio_bitRate.replace("@",""):"";
    	el("txtConfigaudio_freq").value = audioParamArray[0].audio_freq?audioParamArray[0].audio_freq.replace("@",""):"";
    	el("txtConfigaudio_bitRateMode").value = audioParamArray[0].audio_bitRateMode?audioParamArray[0].audio_bitRateMode.replace("@",""):"";
    	el("txtConfigaudio_samples").value = audioParamArray[0].audio_samples?audioParamArray[0].audio_samples.replace("@",""):"";
    	el("txtConfigaudio_pidCheckBox").checked = audioParamArray[0].audio_pid_checkbox;
    	el("txtConfigaudio_fourccCheckBox").checked = audioParamArray[0].audio_fourcc_checkbox;
    	el("txtConfigaudio_bitPerSampleCheckBox").checked = audioParamArray[0].audio_bitPerSample_checkbox;
    	el("txtConfigaudio_channelsCheckBox").checked = audioParamArray[0].audio_channels_checkbox;
    	el("txtConfigaudio_bitRateCheckBox").checked = audioParamArray[0].audio_bitRate_checkbox;
    	el("txtConfigaudio_freqCheckBox").checked = audioParamArray[0].audio_freq_checkbox;
    	el("txtConfigaudio_bitRateModeCheckBox").checked = audioParamArray[0].audio_bitRateMode_checkbox;
    	el("txtConfigaudio_samplesCheckBox").checked = audioParamArray[0].audio_samples_checkbox;
    }
}

function setValue(name,params,defaultValue){
	var handing = attributeOf(el("txtConfig" + name), "handing", "");
    var handsources = handing.split("|");
    jQuery.each(handsources, function (j) {
        var sourceItem = handsources[j].split("~");
        if(sourceItem[1] == defaultValue){
        	jetsennet.ui.DropDownList["txtConfig" + name].selectedValue = sourceItem[1];
            el("txtConfig" + name).value = sourceItem[0];
        }
        if (params[name]&&sourceItem[1] == params[name].$) {
            jetsennet.ui.DropDownList["txtConfig" + name].selectedValue = sourceItem[1];
            el("txtConfig" + name).value = sourceItem[0];
        }
    });
    if(el("txtConfig" + name+"CheckBox")){
    	el("txtConfig" + name+"CheckBox").checked = valueOf(params[name], "@switch", "")=="on"?true:false;
    }
}