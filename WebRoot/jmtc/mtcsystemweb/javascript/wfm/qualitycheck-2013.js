var currentVideoId;
var currentAudioId;
var videoParamIdArray = [{"id":"0","paramName":"Y","showName":"亮度阀值","defaultValue":"24","type":"input","disabled":"disabled","maxValue":"32","minValue":"16"},
                       {"id":"6","paramName":"M","showName":"水平分块大小","defaultValue":"8","type":"input","disabled":"disabled","maxValue":"16","minValue":"1"},
                       {"id":"7","paramName":"N","showName":"垂直分块大小","defaultValue":"8","type":"input","disabled":"disabled","maxValue":"16","minValue":"1"},
                       {"id":"8","paramName":"K","showName":"块内随机抽样个数","defaultValue":"8","type":"input","disabled":"disabled","maxValue":"256","minValue":"1"},
                       {"id":"9","paramName":"偏差","showName":"偏差范围","defaultValue":"18","type":"input","disabled":"disabled","maxValue":"45","minValue":"0"},
                       {"id":"16","paramName":"检测块数","showName":"检测块数","defaultValue":"20","type":"input","maxValue":"100","minValue":"1"},
                       {"id":"13","paramName":"相似程度","showName":"相似度","defaultValue":"65","type":"input","maxValue":"100","minValue":"50"},
                       {"id":"14","paramName":"偏色程度","showName":"偏色程度","defaultValue":"5","type":"input","maxValue":"100","minValue":"0"},
                       {"id":"15","paramName":"差异程度","showName":"差异程度","defaultValue":"25","type":"input","maxValue":"100","minValue":"0"},
                       {"id":"17","paramName":"幅型比","showName":"幅型比","defaultValue":"589840","type":"input","maxValue":"1000000","minValue":"200"},
                       {"id":"rgbunit","paramName":"","showName":"单位","type":"radiobutton","value":"percent,mv"},
                       {"id":"yrange","paramName":"Y分量超标","showName":"Y有效范围","defaultValue":"-1,103","type":"range","disabled":"disabled","maxValue":"114","minValue":"-14"},
                       {"id":"urange","paramName":"U分量超标","showName":"U有效范围","defaultValue":"16,240","type":"range","disabled":"disabled","maxValue":"255","minValue":"0"},
                       {"id":"vrange","paramName":"V分量超标","showName":"V有效范围","defaultValue":"16,240","type":"range","disabled":"disabled","maxValue":"255","minValue":"0"},
                       {"id":"rrange","paramName":"R分量超标","showName":"R有效范围","defaultValue":"-5,105","type":"range","disabled":"disabled","maxValue":"112","minValue":"-14"},
                       {"id":"grange","paramName":"G分量超标","showName":"G有效范围","defaultValue":"-5,105","type":"range","disabled":"disabled","maxValue":"112","minValue":"-14"},
                       {"id":"brange","paramName":"B分量超标","showName":"B有效范围","defaultValue":"-5,105","type":"range","disabled":"disabled","maxValue":"112","minValue":"-14"},
                       {"id":"ycrange","paramName":"YC超标","showName":"YC有效范围","defaultValue":"-31,114","type":"range","disabled":"disabled","maxValue":"135","minValue":"-40"},
                       {"id":"samplestyle","paramName":"抽样方式","showName":"抽样方式","defaultValue":"0","type":"select","handing":"固定抽样检测~0|自定义抽样检测~1","disabled":"disabled"},
                       {"id":"mode","paramName":"检测模式","showName":"检测模式","defaultValue":"1","type":"select","handing":"严格~0|一般~1|宽松~2|自定义~3"},
                       {"id":"time","paramName":"时长阀值","showName":"时长阀值","defaultValue":"3","type":"input","disabled":"disabled","maxValue":"5","minValue":"1","unit":"帧"}];

var videoParamArray = [{"name":"黑场检测","paramName":"黑场","value":"blackfield","param":["mode","time","0","samplestyle","6","7","8"],"id":"0"},
                       {"name":"蓝底检测","paramName":"蓝底","value":"bluekey","param":["mode","time","9","samplestyle","6","7","8"],"id":"1"},
                       {"name":"绿底检测","paramName":"绿底","value":"greenkey","param":["mode","time","9","samplestyle","6","7","8"],"id":"2"},
                       {"name":"单色检测","paramName":"单色彩场","value":"singlecolor","param":["mode","time","9","samplestyle","6","7","8"],"id":"3"},
                       {"name":"彩条检测","paramName":"彩条","value":"colourbar","param":["time","9"],"id":"4"},
                       {"name":"特定图像","paramName":"特定图像","value":"specificphoto","param":["time"],"id":"5"},
                       {"name":"夹帧检测","paramName":"夹帧","value":"clipframes","param":["time","13"],"id":"8"},
                       {"name":"静帧检测","paramName":"静帧","value":"staticframe","param":["mode","time","9","samplestyle","6","7","8"],"id":"7"},
                       {"name":"花屏检测","paramName":"花屏","value":"flowerscreen","param":["time","16"],"id":"28"},
                       {"name":"黑白检测","paramName":"黑白照片检测","value":"blackwhite","param":["time"],"id":"19"},
                       {"name":"偏色检测","paramName":"偏色检测","value":"colourcastcheck","param":["time","14"],"id":"18"},
                       {"name":"跳帧检测","paramName":"跳帧检测","value":"frameskipcheck","param":["time","15"],"id":"20"},
                       {"name":"幅型检测","paramName":"幅型检测","value":"signvuecheck","param":["time","17","0"],"id":"16"},
                       {"name":"YC检测","paramName":"YC超标","value":"yccheck","param":["mode","time","ycrange","samplestyle","6","7","8"],"id":"15"},
                       {"name":"RGB检测","paramName":"RGB分量超标","value":"rgbcheck","param":["mode","rgbunit","rrange","grange","brange","time","samplestyle","6","7","8"],"id":"12"},
                       {"name":"YUV检测","paramName":"YUV分量超标","value":"yuvcheck","param":["mode","rgbunit","yrange","urange","vrange","time","samplestyle","6","7","8"],"id":"9"},
                       {"name":"马赛克检测","paramName":"马赛克","value":"mosaiccheck","param":["time","16"],"id":"6"}
                       ];

var audioParamIdArray = [{"id":"0","paramName":"低电平阈值","showName":"低电平阀值","type":"input","defaultValue":"-48","unit":"dBFS","maxValue":"-48","minValue":"-100" },
                         {"id":"1","paramName":"峰值阈值","showName":"峰值阈值","type":"input","defaultValue":"0","unit":"dBTP","maxValue":"0","minValue":"-24"},
                         {"id":"2","paramName":"百分比","showName":"百分比","type":"input","defaultValue":"50","maxValue":"100","minValue":"1"},
                         {"id":"3","paramName":"平均响度阈值","showName":"平均响度阈值","type":"input","defaultValue":"-24","maxValue":"-20","minValue":"-100","unit":"LKFS"},
                         {"id":"4","paramName":"短时响度阈值","showName":"短时响度阈值","type":"input","defaultValue":"-16","maxValue":"-10","minValue":"-100","unit":"LKFS"},
                         {"id":"5","paramName":"音量阈值","showName":"音量阈值","type":"input","defaultValue":"-6","maxValue":"0","minValue":"-20","unit":"dBFS"},
                         {"id":"7","paramName":"最小频率","showName":"最小频率","type":"input","defaultValue":"20","maxValue":"1000","minValue":"0","unit":"HZ"},
                         {"id":"8","paramName":"最大频率","showName":"最大频率","type":"input","defaultValue":"20000","maxValue":"20000","minValue":"18000","unit":"HZ"},
                         {"id":"6","paramName":"音量阈值","showName":"可听音量","type":"input","defaultValue":"-40.0","maxValue":"0.0","minValue":"-60.0","unit":"dBFS"},
                         {"id":"9","paramName":"偏移电平","showName":"偏移电平","type":"input","defaultValue":"0.1","maxValue":"0.5","minValue":"0.0"},
                         {"id":"10","paramName":"最大相关程度","showName":"最大相关程度","type":"input","defaultValue":"1.0","maxValue":"1.0","minValue":"0.0"},
                         {"id":"11","paramName":"最小相关程度","showName":"最小相关程度","type":"input","defaultValue":"0.1","maxValue":"1.0","minValue":"0.0"},
                         {"id":"time","paramName":"时间阀值","showName":"时长阀值","defaultValue":"5","type":"input","maxValue":"10","minValue":"1","unit":"秒"}];

var audiosParamArray = [{"name":"电平过低检测","paramName":"低电平","value":"levellowcheck","param":["time","0"],"id":"21"},
                       {"name":"立体声反相检测","paramName":"立体声反相","value":"stereocheck","param":["time","2"],"id":"22"},
                       {"name":"真峰值超标检测","paramName":"真峰值超标","value":"peaklevelscheck","param":["time","1"],"id":"23"},
                       {"name":"音量过高检测","paramName":"音量超标","value":"volumehighcheck","param":["time","5"],"id":"25"},
                       {"name":"响度超标检测","paramName":"响度超标","value":"loudlesscheck","param":["3","4"],"id":"24"},
                       {"name":"电平偏移检测","paramName":"电平偏移","value":"levelshiftcheck","param":["time","9"],"id":"27"},
                       {"name":"相关性检测","paramName":"相关性检测","value":"dependencycheck","param":["time","11","10"],"id":"29"},
                       {"name":"不可听检测","paramName":"不可听检测","value":"inaudibilitycheck","param":["time","7","8","6"],"id":"26"}];
//计审定制
var items;
var gQualityPane;
function showQualityCheckActConfig(node) {
    if (node.nodeParam.actType == 2 || node.nodeParam.actType == 3) {
    	var param = new HashMap();
        param.put("actId", node.nodeParam.actId);
        var sResult = WFMDAO.execute("getActConfig", param);
        items = jetsennet.xml.deserialize(sResult.resultVal, { igoreAttribute: false }).item;
    }
    handingArray = [];
    initVaribale();
    renderQualityCheckActConfig(items, node);
    renderQualityCheckInit();
    el('txtConfigName').value = node.nodeParam.name;
    setActParameterQualityCheck(items, node);
    var dialog = new jetsennet.ui.Window("act-config");
    jQuery.extend(dialog, { windowStyle: 1, submitBox: gCurrentProcess.procState!=0?false:true, cancelBox:gCurrentProcess.procState!=0?false:true, maximizeBox: false, minimizeBox: false, 
    	size: { width: 700, height: 0 }, showScroll: false, title: "参数配置" });
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
    		node.nodeParam.parameter = getQualityCheckActParameter(items, node);
    		
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
    if(gCurrentProcess.procState==0){
    	dialog.attachButtons = [{ text: "加载", clickEvent: function () { loadAutoQcTemplate(); } }, 
    	                        { text: "恢复默认", clickEvent: function () { resumeAutoQc(); } }];
    }
    dialog.showDialog();
    initInputDisabled();
}


/**
 * 上层html
 * @param items
 * @param node
 * @return
 */
function renderQualityCheckActConfig(items, node){
    var contents = [];
    contents.push('<table border="0" cellpadding="0" cellspacing="0" class="table-info" id="tab_mideaInfo" width="100%">');
    contents.push('<colgroup>');
    contents.push('<col style="width:142px;" />');
    contents.push('<col style="width:191px;" />');
    contents.push('<col width="width:20px;" />');
    contents.push('<col style="width:142px;" />');
    contents.push('<col style="width:191px;"/>');
    contents.push('<col width="width:20px;" />');
    contents.push('</colgroup>');

    //节点名称
    contents.push('<tr>');
    contents.push('<td style="width:142px;"><label for="txtConfigName" class="control-label">名称:</label></td><td colSpan="2" style="width:221px;"><div class="input-group input-group-sm"><input id="txtConfigName" type="text" class="form-control input-sm" style="width:100%" validatetype="NotEmpty,maxlength" maxlength="20"/><span class="input-group-addon" style="color: Red">*</span></div></td>');
    contents.push('<td style="width:363px;" colSpan="3"></td>');
    contents.push('</tr>');

    showQualityCheckActTable(items,contents);
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
}

function showQualityCheckActTable(items,contents){
	if (items) {
		var index = 0;
        items = items.length ? items : [items];
        for (var i = 0; i < items.length; i++) {
        	if(valueOf(items[i], "@visible", "")&&valueOf(items[i], "@visible", "")=="true"){
        		contents.push('<div style="display:none;">'+createControl(items[i])+"</div>");
        	}else{
        		if (index == 0) {
                    contents.push('<tr>');
                    index = 0;
                }
        		index++;
        		if (valueOf(items[i], "@desc", "")) {
        			contents.push('<td><label for="txtConfig' + items[i]["@name"] + '" class="control-label">' + valueOf(items[i], "@desc", "") + ':</label></td>');
        			var colspan = valueOf(items[i], "@allowVariable", "")=="true"?'1':"2";
        			contents.push('<td colSpan='+colspan+'>');
        			contents.push(createControl(items[i]));
        			contents.push('</td>');
        			if(valueOf(items[i], "@allowVariable", "")=="true"){
        				contents.push('<td>');
            			var variableStr = gCurrentProcess.procState==0?'<span class="glyphicon glyphicon-th" style="cursor:pointer;" title="变量设置" onclick="loadVariable(\'txtConfig' + items[i]["@name"] + '\');"></span>':'';
            			contents.push(variableStr);
            			contents.push('</td>');
            		}
        		}
        		if(items.length==1){
        			contents.push('<td colSpan="3"></td>');
        		}
        		if (index==2||i==items.length-1) {
                    contents.push('</tr>');
                    index = 0;
                }
        	}
        }
    }
}

/**
 * tab页签
 * @return
 */
function renderQualityCheckInit(){
    var assignQualityDivArray = [];	
	assignQualityDivArray.push('<ul class="nav nav-tabs" id="myTab">');
	assignQualityDivArray.push('<li id="qualityPaneVideo">视频计审</li>');
	assignQualityDivArray.push('<li id="qualityPaneAudio">音频计审</li>');
	assignQualityDivArray.push('</ul>');
	
	assignQualityDivArray.push('<div id="mypage">');
	assignQualityDivArray.push('<div id="qualityPageVideo">');
	assignQualityDivArray.push('<table border="0" cellspacing="0" cellpadding="0" width="97%">');
	assignQualityDivArray.push('<tr><td valign="top"><div style="padding: 10px;height:460px;" id="qualityDivVideo">');
	assignQualityDivArray.push('</div></td></tr>');
	assignQualityDivArray.push('</table></div>');
	
	assignQualityDivArray.push('<div id="qualityPageAudio">');
	assignQualityDivArray.push('<table border="0" cellspacing="0" cellpadding="0" width="97%">');
	assignQualityDivArray.push('<tr><td valign="top"><div style="padding: 10px;height:460px;" id="qualityDivAudio">');
	assignQualityDivArray.push('</div></td></tr>');
	assignQualityDivArray.push('</table></div>');
	assignQualityDivArray.push('</div>');
	jQuery("#divActConfig").append(assignQualityDivArray.join(''));
	gQualityPane = new jetsennet.ui.TabPane(el('myTab'), el('mypage'));
	gQualityPane.select(0);
	gQualityPane.ontabpageselected = function (index) {
    	jetsennet.hidePopups();
    };
	showVideoHtml();
	showAudioHtml();
}


/**
 * 生成视频计审菜单
 * @return
 */
function showVideoHtml(){
	var videoHtml = [];
	videoHtml.push('<table border="0" cellpadding="0" cellspacing="0" class="table-info-5" id="tab_videoInfo" width="685px">');
	videoHtml.push('<tr style="height:350px;">');
	videoHtml.push('<td style="width:165px;">');
	videoHtml.push('<table border="0" style="height:100%;" cellpadding="0" cellspacing="0" class="table-info-5" id="tab_qualityInfo" width="100%">');
	videoHtml.push('<tr>');
	videoHtml.push('<td style="BORDER-RIGHT: #000000 1px solid;"><label><input style="vertical-align: middle;" id="allvideo_checkBox" type="checkbox" onclick="selectCheckBox(1);"/>&nbsp;&nbsp;&nbsp;&nbsp;<span style="vertical-align: middle;">全选/反选</span></label></td>');
    videoHtml.push('</tr>');
	for ( var i = 0; i < videoParamArray.length; i++) {
    	videoHtml.push('<tr>');
    	videoHtml.push('<td style="BORDER-RIGHT: #000000 1px solid;"><label><input style="vertical-align: middle;" id="txtConfig_'+videoParamArray[i].value+'_checkBox" type="checkbox"/>&nbsp;&nbsp;&nbsp;&nbsp;<span style="vertical-align: middle;cursor:pointer;" id="txtConfig_'+videoParamArray[i].value+'_span" onclick="showVideoInfoTable('+videoParamArray[i].id+')">'+videoParamArray[i].name+'</span></label></td>');
        videoHtml.push('</tr>');
    }
	videoHtml.push('</table>');
	videoHtml.push('</td>');
	videoHtml.push('<td style="width:400px;vertical-align:top"><div id="videoInfoTd" style="height:100%">');
	videoHtml.push('</div></td>');
	videoHtml.push('</tr>');
    videoHtml.push('</table>');
	jQuery("#qualityDivVideo").append(videoHtml.join(''));
	for ( var i = 0; i < videoParamArray.length; i++) {
		showVideoInfoTable(videoParamArray[i].id);
	}
	showVideoInfoTable(videoParamArray[0].id);
}


function selectCheckBox(index){
	if(index==1){
		if(el('allvideo_checkBox').checked){
			$('#tab_videoInfo input[type="checkbox"]').each(function () {
				this.checked = true;
			});
		}else{
			$('#tab_videoInfo input[type="checkbox"]').each(function () {
				this.checked = false;
			});
		}
	}else if(index==2){
		if(el('allaudio_checkBox').checked){
			$('#tab_audioInfo input[type="checkbox"]').each(function () {
				this.checked = true;
			});
		}else{
			$('#tab_audioInfo input[type="checkbox"]').each(function () {
				this.checked = false;
			});
		}
	}
}


/**
 * 视频计审根据左侧菜单 右侧显示html变化
 * @param id
 * @return
 */
function showVideoInfoTable(id){
	currentVideoId = id;
	var array;
	var value = "";
	for ( var i = 0; i < videoParamArray.length; i++) {
		if(videoParamArray[i].id==id){
			value = videoParamArray[i].value;
			array = videoParamArray[i].param;
		}
	}
	jQuery("#tab_qualityInfo span").each(function(){
		if(this.id=="txtConfig_"+value+"_span"){
			jQuery("#"+this.id).attr("style", "background-color: #BBBBBB;vertical-align: middle;cursor:pointer;");
		}else{
			jQuery("#"+this.id).attr("style", "vertical-align: middle;cursor:pointer;");
		}
	});
	jQuery("#videoInfoTd table").each(function(){
		if(this.id=="tab_Video_"+id){
			el("tab_Video_"+id).style.display = "";
		}else{
			el(this.id).style.display = "none";
		}
	});
	if(el("tab_Video_"+id)){
		return;
	}
	var videoTdHtml = [];
	videoTdHtml.push('<table border="0" cellpadding="0" cellspacing="0" class="table-info" id="tab_Video_'+id+'" width="100%">');
	videoTdHtml.push('<colgroup>');
	videoTdHtml.push('<col width="120px;" />');
	videoTdHtml.push('<col width="auto" />');
	videoTdHtml.push('</colgroup>');
	
	if(array){
		for ( var j = 0; j < array.length; j++) {
			showSetHtml(array[j],videoTdHtml,value);
		}
	}
	videoTdHtml.push('</table>');
	jQuery("#videoInfoTd").append(videoTdHtml.join(''));
	if(handingArray.length>0){
		for ( var i = 0; i < handingArray.length; i++) {
			if(el(handingArray[i])){
				var array = handingArray[i].split("_");
				var videoItemId = array[array.length-1];
				var defaultValue = "";
				var handingStr = "";
				for ( var j = 0; j < videoParamIdArray.length; j++) {
					if(videoParamIdArray[j].id == videoItemId){
						handingStr = videoParamIdArray[j].handing;
						defaultValue = videoParamIdArray[j].defaultValue;
					}
				}
				if(!attributeOf(el(handingArray[i]), "handing", "")){
					el(handingArray[i]).setAttribute("handing", handingStr);
					jetsennet.ui.DropDownList.initOptions(handingArray[i]);
			        jetsennet.ui.DropDownList[handingArray[i]].onchanged = function (item) {
			            changeValue(item.value);
			        };
					setQualityCheckValue(handingArray[i],{},defaultValue);
				}
			}
		}
	}
}


/**
 * 根据左侧音频菜单 显示右侧对应的html
 * @param id
 * @return
 */
function showAudioInfoTable(id){
	currentAudioId = id;
	var array;
	var value = "";
	for ( var i = 0; i < audiosParamArray.length; i++) {
		if(audiosParamArray[i].id==id){
			value = audiosParamArray[i].value;
			array = audiosParamArray[i].param;
		}
	}
	jQuery("#tab_qualityAudioInfo span").each(function(){
		if(this.id=="txtConfig_"+value+"_span"){
			jQuery("#"+this.id).attr("style", "background-color: #BBBBBB;vertical-align: middle;cursor:pointer;");
		}else{
			jQuery("#"+this.id).attr("style", "vertical-align: middle;cursor:pointer;");
		}
	});
	jQuery("#audioInfoTd table").each(function(){
		if(this.id=="tab_Audio_"+id){
			el("tab_Audio_"+id).style.display = "";
		}else{
			el(this.id).style.display = "none";
		}
	});
	if(el("tab_Audio_"+id)){
		return;
	}
	var audioTdHtml = [];
	audioTdHtml.push('<table border="0" cellpadding="0" cellspacing="0" class="table-info-5" id="tab_Audio_'+id+'" width="100%">');
	audioTdHtml.push('<colgroup>');
	audioTdHtml.push('<col width="120px;" />');
	audioTdHtml.push('<col width="auto" />');
	audioTdHtml.push('</colgroup>');
	
	if(array){
		for ( var j = 0; j < array.length; j++) {
			showAudioSetHtml(array[j],audioTdHtml,value);
		}
	}
	audioTdHtml.push('</table>');
	jQuery("#audioInfoTd").append(audioTdHtml.join(''));
	if(handingArray.length>0){
		for ( var i = 0; i < handingArray.length; i++) {
			if(el(handingArray[i])){
				var array = handingArray[i].split("_");
				var videoItemId = array[array.length-1];
				var defaultValue = "";
				var handingStr = "";
				for ( var j = 0; j < videoParamIdArray.length; j++) {
					if(videoParamIdArray[j].id == videoItemId){
						handingStr = videoParamIdArray[j].handing;
						defaultValue = videoParamIdArray[j].defaultValue;
					}
				}
				if(!attributeOf(el(handingArray[i]), "handing", "")){
					el(handingArray[i]).setAttribute("handing", handingStr);
					jetsennet.ui.DropDownList.initOptions(handingArray[i]);
			        jetsennet.ui.DropDownList[handingArray[i]].onchanged = function (item) {
			            changeValue(item.value);
			        };
					setQualityCheckValue(handingArray[i],{},defaultValue);
				}
			}
		}
	}

}


/**
 * 音频右侧table里面的text属性
 * @param item
 * @param audioTdHtml
 * @param videoType
 * @return
 */
function showAudioSetHtml(item,audioTdHtml,videoType){
	for ( var i = 0; i < audioParamIdArray.length; i++) {
		if(item==audioParamIdArray[i].id){
			var value = audioParamIdArray[i].defaultValue?audioParamIdArray[i].defaultValue:"";//默认值
			var validateTypeStr = "";
			var minvalue = "";
			var maxvalue = "";
			var validateType = "";
			var unit = "";
			if(audioParamIdArray[i].maxValue){
				validateTypeStr += ",maxvalue";
				maxvalue = 'maxvalue='+audioParamIdArray[i].maxValue+'';
			}
			if(audioParamIdArray[i].minValue){
				validateTypeStr += ",minvalue";
				minvalue = 'minvalue='+audioParamIdArray[i].minValue+'';
			}
			if(audioParamIdArray[i].unit){
				unit = ''+audioParamIdArray[i].unit+'';
			}
			if(validateTypeStr){
				validateType = 'validatetype = NotEmpty,Int'+validateTypeStr+'';
			}
			var disabled = audioParamIdArray[i].disabled?"disabled":"";
			if(videoType=="peaklevelscheck"){
				if(item=="time"){
					value = "100";
					unit = '毫秒';
					maxvalue = 'maxvalue=1000';
					minvalue = 'minvalue=10';
				}
			}else if(videoType=="volumehighcheck"){
				if(item=="time"){
					value = "2";
					unit = '秒';
					maxvalue = 'maxvalue=5';
					minvalue = 'minvalue=1';
				}
			}else if(videoType=="levelshiftcheck"){
				if(item=="9"){
					validateType = 'validatetype = NotEmpty,money,maxvalue,maxvalue=';
				}else if(item=="time"){
					value = "2";
					unit = '秒';
					maxvalue = 'maxvalue=5';
					minvalue = 'minvalue=1';
				}
			}else if(videoType=="dependencycheck"){
				if(item=="10"||item=="11"){
					validateType = 'validatetype = NotEmpty,money,maxvalue,maxvalue=';
				}else if(item=="time"){
					value = "2";
					unit = '秒';
					maxvalue = 'maxvalue=99';
					minvalue = 'minvalue=0';
				}
			}else if(videoType=="inaudibilitycheck"){
				if(item=="7"||item=="8"||item=="6"){
					validateType = 'validatetype = NotEmpty,money,maxvalue,maxvalue=';
				}else if(item=="time"){
					value = "2";
					unit = '秒';
					maxvalue = 'maxvalue=99';
					minvalue = 'minvalue=0';
				}
			}
			var str = (minvalue + "~" + maxvalue).replace("minvalue=", "").replace("maxvalue=", "");
			var title = 'title='+str+'';
			audioTdHtml.push('<tr><td><label for="txtCode" class="control-label">'+audioParamIdArray[i].showName+':</label></td>');
			audioTdHtml.push('<td>');
			if(audioParamIdArray[i].type=="input"){
				audioTdHtml.push('<input id="txtConfig_' + videoType + '_'+item+'" type="text" value="'+value+'" '+validateType+' '+minvalue+' '+maxvalue+' '+title+' class="form-control input-sm" '+disabled+'/>&nbsp;'+unit+'<span style="color: Red">*</span>');
			}else if(audioParamIdArray[i].type=="select"){
				if(!handingArray.in_array("txtConfig_"+videoType+"_"+item)){
					handingArray.push("txtConfig_"+videoType+"_"+item);
				}
				audioTdHtml.push('<label style="position: relative; font-weight: normal; margin-bottom: 0;width:80%;"><input id="txtConfig_' + videoType + '_'+item+'" onclick="jetsennet.ui.DropDownList.show(this)" readonly class="form-control input-sm" '+disabled+' style="width:100%;"/><i class="fa fa-lg fa-caret-down" style="position: absolute;top: 10px;right: 10px;"></i></label>');
			}else if(audioParamIdArray[i].type=="range"){
				var defaultValues = audioParamIdArray[i].defaultValue;
				audioTdHtml.push('<input id="txtConfig_' + videoType + '_'+item+'_start" type="text" value="'+defaultValues.split(",")[0]+'" '+validateType+' '+minvalue+' '+maxvalue+' '+title+' class="form-control input-sm" style="width:87px;" '+disabled+'/>');
				audioTdHtml.push('&nbsp;到&nbsp;');
				audioTdHtml.push('<input id="txtConfig_' + videoType + '_'+item+'_end" type="text" value="'+defaultValues.split(",")[1]+'" '+validateType+' '+minvalue+' '+maxvalue+' '+title+' class="form-control input-sm" style="width:87px;" '+disabled+'/>');
			}else if(audioParamIdArray[i].type=="radiobutton"){
				var radiovalue = audioParamIdArray[i].value;
				audioTdHtml.push('<input name="txtConfig_' + videoType + '_'+item+'" type="radio" class="checkboxMid" value="'+radiovalue.split(",")[0]+'" checked onclick="changeRgbDefaultValue(this)"/><span class="checkboxMid">百分比&nbsp;&nbsp;&nbsp;&nbsp;</span>');
				audioTdHtml.push('<input name="txtConfig_' + videoType + '_'+item+'" type="radio" class="checkboxMid" value="'+radiovalue.split(",")[1]+'" onclick="changeRgbDefaultValue(this)"/><span class="checkboxMid">毫伏</span>');
			}
			audioTdHtml.push('</td></tr>');
		}
	}
}

var handingArray = [];
/**
 * 视频计审 右侧table里面的text属性
 * @param item
 * @param videoTdHtml
 * @param videoType
 * @return
 */
function showSetHtml(item,videoTdHtml,videoType){
	for ( var i = 0; i < videoParamIdArray.length; i++) {
		if(item==videoParamIdArray[i].id){
			var value = videoParamIdArray[i].defaultValue?videoParamIdArray[i].defaultValue:"";//默认值
			var validateTypeStr = "";
			var minvalue = "";
			var maxvalue = "";
			var validateType = "";
			var unit = "";
			if(videoParamIdArray[i].maxValue){
				validateTypeStr += ",maxvalue";
				maxvalue = 'maxvalue='+videoParamIdArray[i].maxValue+'';
			}
			if(videoParamIdArray[i].minValue){
				validateTypeStr += ",minvalue";
				minvalue = 'minvalue='+videoParamIdArray[i].minValue+'';
			}
			if(videoParamIdArray[i].unit){
				unit = ''+videoParamIdArray[i].unit+'';
			}
			if(validateTypeStr){
				validateType = 'validatetype = NotEmpty,Int'+validateTypeStr+'';
			}
			var disabled = videoParamIdArray[i].disabled?"disabled":"";
			if(videoType=="colourbar"){
				if(item=="9"){
					validateType = 'validatetype = NotEmpty,Int,maxvalue,maxvalue=';
					maxvalue = 'maxvalue=16';
					minvalue = 'minvalue=0';
					value = "8";
				}
				disabled = "";
			}else if(videoType=="clipframes"||videoType=="blackwhite"||videoType=="colourcastcheck"||videoType=="specificphoto"){
				disabled = "";
			}else if(videoType=="flowerscreen"||videoType=="mosaiccheck"||videoType=="frameskipcheck"||videoType=="signvuecheck"){
				if(item=="time"){
					value = "1";
				}
				disabled = "";
			}
			var str = (minvalue + "~" + maxvalue).replace("minvalue=", "").replace("maxvalue=", "");
			var title = 'title='+str+'';
			videoTdHtml.push('<tr><td><label for="txtConfig_' + videoType + '_'+item+'" class="ccontrol-label">'+videoParamIdArray[i].showName+':</label></td>');
			videoTdHtml.push('<td>');
			if(videoParamIdArray[i].type=="input"){
				videoTdHtml.push('<input id="txtConfig_' + videoType + '_'+item+'" type="text" value="'+value+'" '+validateType+' '+minvalue+' '+maxvalue+' '+title+'  class="form-control input-sm" '+disabled+'/>&nbsp;'+unit+'<span style="color: Red">*</span>');
			}else if(videoParamIdArray[i].type=="select"){
				if(!handingArray.in_array("txtConfig_"+videoType+"_"+item)){
					handingArray.push("txtConfig_"+videoType+"_"+item);
				}
				videoTdHtml.push('<label style="position: relative; font-weight: normal; margin-bottom: 0;width:80%;"><input id="txtConfig_' + videoType + '_'+item+'" onclick="jetsennet.ui.DropDownList.show(this)" readonly class="form-control input-sm" '+disabled+' style="width:100%;"/><i class="fa fa-lg fa-caret-down" style="position: absolute;top: 10px;right: 10px;"></i></label>');
			}else if(videoParamIdArray[i].type=="range"){
				var defaultValues = videoParamIdArray[i].defaultValue;
				videoTdHtml.push('<input id="txtConfig_' + videoType + '_'+item+'_start" type="text" value="'+defaultValues.split(",")[0]+'" '+validateType+' '+minvalue+' '+maxvalue+' '+title+' class="form-control input-sm" style="width:132px;" '+disabled+'/>');
				videoTdHtml.push('<span style="float:left;vertical-align: middle;">&nbsp;到&nbsp;</span>');
				videoTdHtml.push('<input id="txtConfig_' + videoType + '_'+item+'_end" type="text" value="'+defaultValues.split(",")[1]+'" '+validateType+' '+minvalue+' '+maxvalue+' '+title+' class="form-control input-sm" style="width:132px;" '+disabled+'/>');
			}else if(videoParamIdArray[i].type=="radiobutton"){
				var radiovalue = videoParamIdArray[i].value;
				videoTdHtml.push('<input name="txtConfig_' + videoType + '_'+item+'" type="radio" class="checkboxMid" value="'+radiovalue.split(",")[0]+'" checked onclick="changeRgbDefaultValue(this)"/><span class="checkboxMid">百分比&nbsp;&nbsp;&nbsp;&nbsp;</span>');
				videoTdHtml.push('<input name="txtConfig_' + videoType + '_'+item+'" type="radio" class="checkboxMid" value="'+radiovalue.split(",")[1]+'" onclick="changeRgbDefaultValue(this)"/><span class="checkboxMid">毫伏</span>');
			}
			videoTdHtml.push('</td></tr>');
		}
	}
}

/**
 * 显示音频html
 * @return
 */
function showAudioHtml(){
	var audioHtml = [];
	audioHtml.push('<table border="0" cellpadding="0" cellspacing="0" class="table-info-5" id="tab_audioInfo" width="685px">');
	audioHtml.push('<tr style="height:210px;">');
	audioHtml.push('<td style="width:165px;height:200px;">');
	audioHtml.push('<table border="0" style="height:100%;" cellpadding="0" cellspacing="0" class="table-info-5" id="tab_qualityAudioInfo" width="100%">');
	audioHtml.push('<tr>');
	audioHtml.push('<td style="BORDER-RIGHT: #000000 1px solid;"><label><input style="vertical-align: middle;" id="allaudio_checkBox" type="checkbox" onclick="selectCheckBox(2);"/>&nbsp;&nbsp;&nbsp;&nbsp;<span style="vertical-align: middle;">全选/反选</span></label></td>');
	audioHtml.push('</tr>');
	for ( var i = 0; i < audiosParamArray.length; i++) {
    	audioHtml.push('<tr>');
    	audioHtml.push('<td style="BORDER-RIGHT: #000000 1px solid;"><label><input style="vertical-align: middle;" id="txtConfig_'+audiosParamArray[i].value+'_checkBox" type="checkbox"/>&nbsp;&nbsp;&nbsp;&nbsp;<span style="vertical-align: middle;cursor:pointer;" id="txtConfig_'+audiosParamArray[i].value+'_span" onclick="showAudioInfoTable('+audiosParamArray[i].id+')">'+audiosParamArray[i].name+'</span></label></td>');
        audioHtml.push('</tr>');
    }
	audioHtml.push('</table>');
	audioHtml.push('</td>');
	audioHtml.push('<td style="width:400px;vertical-align:top;"><div id="audioInfoTd" style="height:100%">');
	audioHtml.push('</div></td>');
	audioHtml.push('</tr>');
    audioHtml.push('</table>');
	jQuery("#qualityDivAudio").append(audioHtml.join(''));
	for ( var j = 0; j < audiosParamArray.length; j++) {
		showAudioInfoTable(audiosParamArray[j].id);
	}
	showAudioInfoTable(audiosParamArray[0].id);
}


/**
 * 设值
 * @param items
 * @param node
 * @return
 */
function setActParameterQualityCheck(items, node){

	var options = {igoreAttribute:false,attributeFlag:"@",valueFlag:"$",trueValue:"true",falseValue:"false"};
    var params = jQuery.extend({}, jetsennet.xml.deserialize(node.nodeParam.parameter,options));
    if (items) {
    	if(items.length>1){
    		for (var i = 0; i < items.length; i++) {
            	var name = items[i]["@name"];
            	var source = items[i]["@source"];
            	if (source == SOURCE_CUSTOM || source == SOURCE_DB || source == SOURCE_VAR) {
            		setQualityCheckValue(items[i]["@name"],params,items[i]["@deafult"]);
            	}else{
            		if(params[name]){
                		var paramValue = params[name].$;
                		el("txtConfig" + name).value = allVarNameArray.in_array(paramValue.replace("@", "")) ? (paramValue.replace("@", "")) : paramValue;
                	}
            	}
            }
    	}
    	else{
        	var name = items["@name"];
        	var source = items["@source"];
        	if (source == SOURCE_CUSTOM || source == SOURCE_DB || source == SOURCE_VAR) {
        		setQualityCheckValue(items["@name"],params,items["@deafult"]);
        	}else{
        		if(params[name]){
            		var paramValue = params[name].$;
            		el("txtConfig" + name).value = allVarNameArray.in_array(paramValue.replace("@", "")) ? (paramValue.replace("@", "")) : paramValue;
            	}
        	}
    	}
	}
    setQualityCheck(params);
}

function setQualityCheckValue(name,params,defaultValue){
	var handing = "";
	if(el("txtConfig" + name)){
		handing = attributeOf(el("txtConfig" + name), "handing", "");
	}else{
		handing = attributeOf(el(name), "handing", "");
	}
    var handsources = handing.split("|");
    jQuery.each(handsources, function (j) {
        var sourceItem = handsources[j].split("~");
        if(sourceItem[1] == defaultValue && !params[name]){
        	if(el("txtConfig" + name)){
        		jetsennet.ui.DropDownList["txtConfig" + name].selectedValue = sourceItem[1];
        		el("txtConfig" + name).value = sourceItem[0];
        	}else{
        		jetsennet.ui.DropDownList[name].selectedValue = sourceItem[1];
        		el(name).value = sourceItem[0];
        	}
        }
        if (params[name]&&sourceItem[1] == params[name].$) {
        	if(el("txtConfig" + name)){
        		jetsennet.ui.DropDownList["txtConfig" + name].selectedValue = sourceItem[1];
        		el("txtConfig" + name).value = sourceItem[0];
        	}else{
        		jetsennet.ui.DropDownList[name].selectedValue = sourceItem[1];
        		el(name).value = sourceItem[0];
        	}
        }
    });
}


/**
 * 下拉框onchange事件 改变对应的文本内容 以及disabled状态
 * @param item
 * @return
 */
function changeValue(itemValue,currentSetVideoId){
	if(currentSetVideoId){
		currentVideoId = currentSetVideoId;
	}
	var currentValue = "";
	if(currentVideoId=="0"){
		currentValue = "blackfield";
		if(itemValue=="0"){
			el("txtConfig_blackfield_0").value = 18;
			el("txtConfig_blackfield_0").disabled = "disabled";
		}else if(itemValue=="1"){
			el("txtConfig_blackfield_0").value = 24;
			el("txtConfig_blackfield_0").disabled = "disabled";
		}else if(itemValue=="2"){
			el("txtConfig_blackfield_0").value = 32;
			el("txtConfig_blackfield_0").disabled = "disabled";
		}else if(itemValue=="3"){
			el("txtConfig_blackfield_0").value = 24;
			el("txtConfig_blackfield_0").disabled = "";
		}
	}else if(currentVideoId=="1"){
		currentValue = "bluekey";
		if(itemValue=="0"){
			el("txtConfig_bluekey_9").value = 8;
			el("txtConfig_bluekey_9").disabled = "disabled";
		}else if(itemValue=="1"){
			el("txtConfig_bluekey_9").value = 18;
			el("txtConfig_bluekey_9").disabled = "disabled";
		}else if(itemValue=="2"){
			el("txtConfig_bluekey_9").value = 32;
			el("txtConfig_bluekey_9").disabled = "disabled";
		}else if(itemValue=="3"){
			el("txtConfig_bluekey_9").value = 18;
			el("txtConfig_bluekey_9").disabled = "";
		}
	}else if(currentVideoId=="2"){
		currentValue = "greenkey";
		if(itemValue=="0"){
			el("txtConfig_greenkey_9").value = 8;
			el("txtConfig_greenkey_9").disabled = "disabled";
		}else if(itemValue=="1"){
			el("txtConfig_greenkey_9").value = 18;
			el("txtConfig_greenkey_9").disabled = "disabled";
		}else if(itemValue=="2"){
			el("txtConfig_greenkey_9").value = 32;
			el("txtConfig_greenkey_9").disabled = "disabled";
		}else if(itemValue=="3"){
			el("txtConfig_greenkey_9").value = 18;
			el("txtConfig_greenkey_9").disabled = "";
		}
	}else if(currentVideoId=="3"){
		currentValue = "singlecolor";
		if(itemValue=="0"){
			el("txtConfig_singlecolor_9").value = 8;
			el("txtConfig_singlecolor_9").disabled = "disabled";
		}else if(itemValue=="1"){
			el("txtConfig_singlecolor_9").value = 18;
			el("txtConfig_singlecolor_9").disabled = "disabled";
		}else if(itemValue=="2"){
			el("txtConfig_singlecolor_9").value = 32;
			el("txtConfig_singlecolor_9").disabled = "disabled";
		}else if(itemValue=="3"){
			el("txtConfig_singlecolor_9").value = 18;
			el("txtConfig_singlecolor_9").disabled = "";
		}
	}else if(currentVideoId=="7"){
		currentValue = "staticframe";
		if(itemValue=="0"){
			el("txtConfig_staticframe_9").value = 8;
			el("txtConfig_staticframe_9").disabled = "disabled";
		}else if(itemValue=="1"){
			el("txtConfig_staticframe_9").value = 18;
			el("txtConfig_staticframe_9").disabled = "disabled";
		}else if(itemValue=="2"){
			el("txtConfig_staticframe_9").value = 32;
			el("txtConfig_staticframe_9").disabled = "disabled";
		}else if(itemValue=="3"){
			el("txtConfig_staticframe_9").value = 18;
			el("txtConfig_staticframe_9").disabled = "";
		}
	}else if(currentVideoId=="15"){
		currentValue = "yccheck";
		if(itemValue=="3"){
			el("txtConfig_yccheck_ycrange_start").disabled = "";
			el("txtConfig_yccheck_ycrange_end").disabled = "";
		}else{
			el("txtConfig_yccheck_ycrange_start").value = "10";
			el("txtConfig_yccheck_ycrange_end").value = "114";
			el("txtConfig_yccheck_ycrange_start").disabled = "disabled";
			el("txtConfig_yccheck_ycrange_end").disabled = "disabled";
		}
	}else if(currentVideoId=="12"){
		currentValue = "rgbcheck";
		if(itemValue=="3"){
			el("txtConfig_rgbcheck_rrange_start").disabled = "";
			el("txtConfig_rgbcheck_brange_start").disabled = "";
			el("txtConfig_rgbcheck_grange_start").disabled = "";
			el("txtConfig_rgbcheck_rrange_end").disabled = "";
			el("txtConfig_rgbcheck_brange_end").disabled = "";
			el("txtConfig_rgbcheck_grange_end").disabled = "";
		}else{
			var selectradio = $("input[name='txtConfig_rgbcheck_rgbunit']").filter(":checked");
			if(selectradio.val()=="mv"){
				el("txtConfig_rgbcheck_rrange_start").value = "-35";
				el("txtConfig_rgbcheck_brange_start").value = "-35";
				el("txtConfig_rgbcheck_grange_start").value = "-35";
				el("txtConfig_rgbcheck_rrange_end").value = "735";
				el("txtConfig_rgbcheck_brange_end").value = "735";
				el("txtConfig_rgbcheck_grange_end").value = "735";
			}else{
				el("txtConfig_rgbcheck_rrange_start").value = "-5";
				el("txtConfig_rgbcheck_brange_start").value = "-5";
				el("txtConfig_rgbcheck_grange_start").value = "-5";
				el("txtConfig_rgbcheck_rrange_end").value = "105";
				el("txtConfig_rgbcheck_brange_end").value = "105";
				el("txtConfig_rgbcheck_grange_end").value = "105";
			}
			el("txtConfig_rgbcheck_rrange_start").disabled = "disabled";
			el("txtConfig_rgbcheck_brange_start").disabled = "disabled";
			el("txtConfig_rgbcheck_grange_start").disabled = "disabled";
			el("txtConfig_rgbcheck_rrange_end").disabled = "disabled";
			el("txtConfig_rgbcheck_brange_end").disabled = "disabled";
			el("txtConfig_rgbcheck_grange_end").disabled = "disabled";
		}
	}else if(currentVideoId=="9"){
		currentValue = "yuvcheck";
		if(itemValue=="3"){
			el("txtConfig_yuvcheck_yrange_start").disabled = "";
			el("txtConfig_yuvcheck_yrange_end").disabled = "";
			el("txtConfig_yuvcheck_urange_start").disabled = "";
			el("txtConfig_yuvcheck_urange_end").disabled = "";
			el("txtConfig_yuvcheck_vrange_start").disabled = "";
			el("txtConfig_yuvcheck_vrange_end").disabled = "";
		}else{
			el("txtConfig_yuvcheck_yrange_start").disabled = "disabled";
			el("txtConfig_yuvcheck_yrange_end").disabled = "disabled";
			el("txtConfig_yuvcheck_urange_start").disabled = "disabled";
			el("txtConfig_yuvcheck_urange_end").disabled = "disabled";
			el("txtConfig_yuvcheck_vrange_start").disabled = "disabled";
			el("txtConfig_yuvcheck_vrange_end").disabled = "disabled";
			el("txtConfig_yuvcheck_urange_start").value = "16";
			el("txtConfig_yuvcheck_urange_end").value = "240";
			el("txtConfig_yuvcheck_vrange_start").value = "16";
			el("txtConfig_yuvcheck_vrange_end").value = "240";
			var selectradio = $("input[name='txtConfig_yuvcheck_rgbunit']").filter(":checked");
			if(selectradio.val()=="mv"){
				el("txtConfig_yuvcheck_yrange_start").value = "-7";
				el("txtConfig_yuvcheck_yrange_end").value = "721";
			}else{
				el("txtConfig_yuvcheck_yrange_start").value = "-1";
				el("txtConfig_yuvcheck_yrange_end").value = "103";
			}
		}
	}
	if(itemValue=="0"){
		if(el("txtConfig_"+currentValue+"_time")){
			el("txtConfig_"+currentValue+"_time").value = 1;
			el("txtConfig_"+currentValue+"_time").disabled = "disabled";
		}
		if(el("txtConfig_"+currentValue+"_samplestyle")){
			jetsennet.ui.DropDownList["txtConfig_"+currentValue+"_samplestyle"].selectedValue = 0;
			el("txtConfig_"+currentValue+"_samplestyle").value = "固定抽样检测";
		}
		if(el("txtConfig_"+currentValue+"_6")){
			el("txtConfig_"+currentValue+"_6").value = 1;
			el("txtConfig_"+currentValue+"_6").disabled = "disabled";
		}
		if(el("txtConfig_"+currentValue+"_7")){
			el("txtConfig_"+currentValue+"_7").value = 1;
			el("txtConfig_"+currentValue+"_7").disabled = "disabled";
		}
		if(el("txtConfig_"+currentValue+"_8")){
			el("txtConfig_"+currentValue+"_8").value = 1;
			el("txtConfig_"+currentValue+"_8").disabled = "disabled";
		}
	}else if(itemValue=="1"){
		if(el("txtConfig_"+currentValue+"_time")){
			el("txtConfig_"+currentValue+"_time").value = 3;
			el("txtConfig_"+currentValue+"_time").disabled = "disabled";
		}
		if(el("txtConfig_"+currentValue+"_samplestyle")){
			jetsennet.ui.DropDownList["txtConfig_"+currentValue+"_samplestyle"].selectedValue = 0;
			el("txtConfig_"+currentValue+"_samplestyle").value = "固定抽样检测";
		}
		if(el("txtConfig_"+currentValue+"_6")){
			el("txtConfig_"+currentValue+"_6").value = 8;
			el("txtConfig_"+currentValue+"_6").disabled = "disabled";
		}
		if(el("txtConfig_"+currentValue+"_7")){
			el("txtConfig_"+currentValue+"_7").value = 8;
			el("txtConfig_"+currentValue+"_7").disabled = "disabled";
		}
		if(el("txtConfig_"+currentValue+"_8")){
			el("txtConfig_"+currentValue+"_8").value = 8;
			el("txtConfig_"+currentValue+"_8").disabled = "disabled";
		}
	}else if(itemValue=="2"){
		if(el("txtConfig_"+currentValue+"_time")){
			el("txtConfig_"+currentValue+"_time").value = 5;
			el("txtConfig_"+currentValue+"_time").disabled = "disabled";
		}
		if(el("txtConfig_"+currentValue+"_samplestyle")){
			jetsennet.ui.DropDownList["txtConfig_"+currentValue+"_samplestyle"].selectedValue = 0;
			el("txtConfig_"+currentValue+"_samplestyle").value = "固定抽样检测";
		}
		if(el("txtConfig_"+currentValue+"_6")){
			el("txtConfig_"+currentValue+"_6").value = 16;
			el("txtConfig_"+currentValue+"_6").disabled = "disabled";
		}
		if(el("txtConfig_"+currentValue+"_7")){
			el("txtConfig_"+currentValue+"_7").value = 16;
			el("txtConfig_"+currentValue+"_7").disabled = "disabled";
		}
		if(el("txtConfig_"+currentValue+"_8")){
			el("txtConfig_"+currentValue+"_8").value = 16;
			el("txtConfig_"+currentValue+"_8").disabled = "disabled";
		}
	}else if(itemValue=="3"){
		if(el("txtConfig_"+currentValue+"_time")){
			el("txtConfig_"+currentValue+"_time").value = 3;
			el("txtConfig_"+currentValue+"_time").disabled = "";
		}
		if(el("txtConfig_"+currentValue+"_samplestyle")){
			jetsennet.ui.DropDownList["txtConfig_"+currentValue+"_samplestyle"].selectedValue = 1;
			el("txtConfig_"+currentValue+"_samplestyle").value = "自定义抽样检测";
		}
		if(el("txtConfig_"+currentValue+"_6")){
			el("txtConfig_"+currentValue+"_6").value = 8;
			el("txtConfig_"+currentValue+"_6").disabled = "";
		}
		if(el("txtConfig_"+currentValue+"_7")){
			el("txtConfig_"+currentValue+"_7").value = 8;
			el("txtConfig_"+currentValue+"_7").disabled = "";
		}
		if(el("txtConfig_"+currentValue+"_8")){
			el("txtConfig_"+currentValue+"_8").value = 4;
			el("txtConfig_"+currentValue+"_8").disabled = "";
		}
	}
}

/**
 * RGB YUV检测中 radio单位改变 对应的值和max min改变
 * @param obj
 * @return
 */
function changeRgbDefaultValue(obj){
	var name = obj.name;
	var value = obj.value;
	if(name){
		var currentCheck = name.split("_")[1];
		if(value=="mv"){
			if(el("txtConfig_"+currentCheck+"_rrange_start")){
				el("txtConfig_"+currentCheck+"_rrange_start").value = "-35";
				el("txtConfig_"+currentCheck+"_rrange_start").setAttribute("maxvalue","797");
				el("txtConfig_"+currentCheck+"_rrange_start").setAttribute("minvalue","-100");
				el("txtConfig_"+currentCheck+"_rrange_start").setAttribute("title","-100~797");
			}
			if(el("txtConfig_"+currentCheck+"_brange_start")){
				el("txtConfig_"+currentCheck+"_brange_start").value = "-35";
				el("txtConfig_"+currentCheck+"_brange_start").setAttribute("maxvalue","797");
				el("txtConfig_"+currentCheck+"_brange_start").setAttribute("minvalue","-100");
				el("txtConfig_"+currentCheck+"_brange_start").setAttribute("title","-100~797");
			}
			if(el("txtConfig_"+currentCheck+"_grange_start")){
				el("txtConfig_"+currentCheck+"_grange_start").value = "-35";
				el("txtConfig_"+currentCheck+"_grange_start").setAttribute("maxvalue","797");
				el("txtConfig_"+currentCheck+"_grange_start").setAttribute("minvalue","-100");
				el("txtConfig_"+currentCheck+"_grange_start").setAttribute("title","-100~797");
			}
			if(el("txtConfig_"+currentCheck+"_rrange_end")){
				el("txtConfig_"+currentCheck+"_rrange_end").value = "735";
				el("txtConfig_"+currentCheck+"_rrange_end").setAttribute("maxvalue","797");
				el("txtConfig_"+currentCheck+"_rrange_end").setAttribute("minvalue","-100");
				el("txtConfig_"+currentCheck+"_rrange_end").setAttribute("title","-100~797");
			}
			if(el("txtConfig_"+currentCheck+"_brange_end")){
				el("txtConfig_"+currentCheck+"_brange_end").value = "735";
				el("txtConfig_"+currentCheck+"_brange_end").setAttribute("maxvalue","797");
				el("txtConfig_"+currentCheck+"_brange_end").setAttribute("minvalue","-100");
				el("txtConfig_"+currentCheck+"_brange_end").setAttribute("title","-100~797");
			}
			if(el("txtConfig_"+currentCheck+"_grange_end")){
				el("txtConfig_"+currentCheck+"_grange_end").value = "735";
				el("txtConfig_"+currentCheck+"_grange_end").setAttribute("maxvalue","797");
				el("txtConfig_"+currentCheck+"_grange_end").setAttribute("minvalue","-100");
				el("txtConfig_"+currentCheck+"_grange_end").setAttribute("title","-100~797");
			}
			if(el("txtConfig_"+currentCheck+"_yrange_start")){
				el("txtConfig_"+currentCheck+"_yrange_start").value = "-7";
				el("txtConfig_"+currentCheck+"_yrange_start").setAttribute("maxvalue","800");
				el("txtConfig_"+currentCheck+"_yrange_start").setAttribute("minvalue","-100");
				el("txtConfig_"+currentCheck+"_yrange_start").setAttribute("title","-100~800");
			}
			if(el("txtConfig_"+currentCheck+"_yrange_end")){
				el("txtConfig_"+currentCheck+"_yrange_end").value = "721";
				el("txtConfig_"+currentCheck+"_yrange_end").setAttribute("maxvalue","800");
				el("txtConfig_"+currentCheck+"_yrange_end").setAttribute("minvalue","-100");
				el("txtConfig_"+currentCheck+"_yrange_end").setAttribute("title","-100~800");
			}
		}else{
			if(el("txtConfig_"+currentCheck+"_rrange_start")){
				el("txtConfig_"+currentCheck+"_rrange_start").value = "-5";
				el("txtConfig_"+currentCheck+"_rrange_start").setAttribute("maxvalue","112");
				el("txtConfig_"+currentCheck+"_rrange_start").setAttribute("minvalue","-14");
				el("txtConfig_"+currentCheck+"_rrange_start").setAttribute("title","-14~112");
			}
			if(el("txtConfig_"+currentCheck+"_brange_start")){
				el("txtConfig_"+currentCheck+"_brange_start").value = "-5";
				el("txtConfig_"+currentCheck+"_brange_start").setAttribute("maxvalue","112");
				el("txtConfig_"+currentCheck+"_brange_start").setAttribute("minvalue","-14");
				el("txtConfig_"+currentCheck+"_brange_start").setAttribute("title","-14~112");
			}
			if(el("txtConfig_"+currentCheck+"_grange_start")){
				el("txtConfig_"+currentCheck+"_grange_start").value = "-5";
				el("txtConfig_"+currentCheck+"_grange_start").setAttribute("maxvalue","112");
				el("txtConfig_"+currentCheck+"_grange_start").setAttribute("minvalue","-14");
				el("txtConfig_"+currentCheck+"_grange_start").setAttribute("title","-14~112");
			}
			if(el("txtConfig_"+currentCheck+"_rrange_end")){
				el("txtConfig_"+currentCheck+"_rrange_end").value = "105";
				el("txtConfig_"+currentCheck+"_rrange_end").setAttribute("maxvalue","112");
				el("txtConfig_"+currentCheck+"_rrange_end").setAttribute("minvalue","-14");
				el("txtConfig_"+currentCheck+"_rrange_end").setAttribute("title","-14~112");
			}
			if(el("txtConfig_"+currentCheck+"_brange_end")){
				el("txtConfig_"+currentCheck+"_brange_end").value = "105";
				el("txtConfig_"+currentCheck+"_brange_end").setAttribute("maxvalue","112");
				el("txtConfig_"+currentCheck+"_brange_end").setAttribute("minvalue","-14");
				el("txtConfig_"+currentCheck+"_brange_end").setAttribute("title","-14~112");
			}
			if(el("txtConfig_"+currentCheck+"_grange_end")){
				el("txtConfig_"+currentCheck+"_grange_end").value = "105";
				el("txtConfig_"+currentCheck+"_grange_end").setAttribute("maxvalue","112");
				el("txtConfig_"+currentCheck+"_grange_end").setAttribute("minvalue","-14");
				el("txtConfig_"+currentCheck+"_grange_end").setAttribute("title","-14~112");
			}
			if(el("txtConfig_"+currentCheck+"_yrange_start")){
				el("txtConfig_"+currentCheck+"_yrange_start").value = "-1";
				el("txtConfig_"+currentCheck+"_yrange_start").setAttribute("maxvalue","114");
				el("txtConfig_"+currentCheck+"_yrange_start").setAttribute("minvalue","-14");
				el("txtConfig_"+currentCheck+"_yrange_start").setAttribute("title","-14~114");
			}
			if(el("txtConfig_"+currentCheck+"_yrange_end")){
				el("txtConfig_"+currentCheck+"_yrange_end").value = "103";
				el("txtConfig_"+currentCheck+"_yrange_end").setAttribute("maxvalue","114");
				el("txtConfig_"+currentCheck+"_yrange_end").setAttribute("minvalue","-14");
				el("txtConfig_"+currentCheck+"_yrange_end").setAttribute("title","-14~114");
			}
		}
	}
}

/**
 * 从ui上获取值
 * @param items
 * @param node
 * @return
 */
function getQualityCheckActParameter(items, node) {
    var params = {};
    if (items) {
    	if(items.length>1){
    		for (var i = 0; i < items.length; i++) {
    			var name = items[i]["@name"];
    			var source = items[i]["@source"];
    			if (source == SOURCE_CUSTOM || source == SOURCE_DB || source == SOURCE_VAR) {
    				if(el("txtConfig" + items[i]["@name"])){
    					params[name] = jetsennet.ui.DropDownList["txtConfig"+items[i]["@name"]].selectedValue;
    				}
    			}else{
    				params[name] = allVarNameArray.in_array(el("txtConfig" + name).value) ? ("@" + el("txtConfig" + name).value) : el("txtConfig" + name).value;
    			}
    		}
    	}else{
    		var name = items["@name"];
			var source = items["@source"];
			if (source == SOURCE_CUSTOM || source == SOURCE_DB || source == SOURCE_VAR) {
				if(el("txtConfig" + items["@name"])){
					params[name] = jetsennet.ui.DropDownList["txtConfig"+items["@name"]].selectedValue;
				}
			}else{
				params[name] = allVarNameArray.in_array(el("txtConfig" + name).value) ? ("@" + el("txtConfig" + name).value) : el("txtConfig" + name).value;
			}
    	}
    }
    var paramXmlArray = [];
    paramXmlArray.push('<root>');
    //视频param
    paramXmlArray.push('<video auto="0" bottom="0" fps="25.000000" left="0" right="0" scan="1" tcount="4" top="0">');
    for ( var i = 0; i < videoParamArray.length; i++) {
    	var value = videoParamArray[i].value;
    	var id = videoParamArray[i].id;
    	var enable = el("txtConfig_"+value+"_checkBox").checked?"1":"0";
    	var mode = el("txtConfig_"+value+"_mode")?jetsennet.ui.DropDownList["txtConfig_"+value+"_mode"].selectedValue:"4";
    	var name = videoParamArray[i].paramName;
    	var rgbyuvArray = [];
    	var nums = "";
    	if(value=="blackfield"){
    		 nums="4"; 
    	}
    	else if(value=="bluekey"){
    		nums="7"; 
    	}
    	else if(value=="greenkey"){
    		nums="7"; 
    	}
    	else if(value=="singlecolor"){
    		nums="4"; 
    	}
    	else if(value=="colourbar"){
    		nums="1"; 
    	}
    	else if(value=="specificphoto"){
    		nums="0"; 
    	}
    	else if(value=="clipframes"){
    		nums="2"; 
    	}
    	else if(value=="staticframe"){
    		nums="4"; 
    	}
    	else if(value=="flowerscreen"){
    		nums="1"; 
    	}
    	else if(value=="blackwhite"){
    		nums="0"; 
    	}
    	else if(value=="colourcastcheck"){
    		nums="1"; 
    	}
    	else if(value=="frameskipcheck"){
    		nums="1"; 
    	}
    	else if(value=="signvuecheck"){
    		nums="2"; 
    	}
    	else if(value=="yccheck"){
    		nums="5"; 
    	}
    	else if(value=="rgbcheck"){
    		rgbyuvArray = ["r","g","b"];
    		nums="5"; 
    	}
    	else if(value=="yuvcheck"){
    		rgbyuvArray = ["y","u","v"];
    		nums="5"; 
    	}
    	else if(value=="mosaiccheck"){
    		nums="1"; 
    	}
    	var paramIdArray = videoParamArray[i].param;
    	if(rgbyuvArray.length==0){
    		paramXmlArray.push('<item enable="'+enable+'" id="'+id+'" mode="'+mode+'" name="'+name+'" nums="'+nums+'">');
    		if(value=="bluekey"){
    			paramXmlArray.push('<param id="0" value="32.000000">Y</param>');
    			paramXmlArray.push('<param id="1" value="240.000000">U</param>');
    			paramXmlArray.push('<param id="2" value="118.000000">V</param>');
    		}else if(value=="greenkey"){
    			paramXmlArray.push('<param id="0" value="172.000000">Y</param>');
    			paramXmlArray.push('<param id="1" value="42.000000">U</param>');
    			paramXmlArray.push('<param id="2" value="27.000000">V</param>');
    		}else if(value=="clipframes"){
    			paramXmlArray.push('<param id="12" value="3.000000">F</param>');
    		}
    		for ( var j = 0; j < paramIdArray.length; j++) {
    			var paramvalue = "";
    			if(paramIdArray[j]=="time"){
    				var timevalue = el("txtConfig_"+value+"_time").value;
    				paramXmlArray.push('<time value="'+timevalue+'"/>');
    			}else if(paramIdArray[j]=="0"){
    				paramvalue = el("txtConfig_"+value+"_0").value + ".000000";
    				paramXmlArray.push('<param id="0" value="'+paramvalue+'">Y</param>');
    			}else if(paramIdArray[j]=="6"){
    				paramvalue = el("txtConfig_"+value+"_6").value + ".000000";
    				paramXmlArray.push('<param id="6" value="'+paramvalue+'">M</param>');
    			}else if(paramIdArray[j]=="7"){
    				paramvalue = el("txtConfig_"+value+"_7").value + ".000000";
    				paramXmlArray.push('<param id="7" value="'+paramvalue+'">N</param>');
    			}else if(paramIdArray[j]=="8"){
    				paramvalue = el("txtConfig_"+value+"_8").value + ".000000";
    				paramXmlArray.push('<param id="8" value="'+paramvalue+'">K</param>');
    			}else if(paramIdArray[j]=="9"){
    				paramvalue = el("txtConfig_"+value+"_9").value + ".000000";
    				paramXmlArray.push('<param id="9" value="'+paramvalue+'">偏差</param>');
    			}else if(paramIdArray[j]=="13"){
    				paramvalue = el("txtConfig_"+value+"_13").value + ".000000";
    				paramXmlArray.push('<param id="13" value="'+paramvalue+'">相似程度</param>');
    			}else if(paramIdArray[j]=="16"){
    				paramvalue = el("txtConfig_"+value+"_16").value + ".000000";
    				paramXmlArray.push('<param id="16" value="'+paramvalue+'">检测块数</param>');
    			}else if(paramIdArray[j]=="14"){
    				paramvalue = el("txtConfig_"+value+"_14").value + ".000000";
    				paramXmlArray.push('<param id="14" value="'+paramvalue+'">偏色程度</param>');
    			}else if(paramIdArray[j]=="15"){
    				paramvalue = el("txtConfig_"+value+"_15").value + ".000000";
    				paramXmlArray.push('<param id="15" value="'+paramvalue+'">差异程度</param>');
    			}else if(paramIdArray[j]=="17"){
    				paramvalue = el("txtConfig_"+value+"_17").value + ".000000";
    				paramXmlArray.push('<param id="17" value="'+paramvalue+'">幅型比</param>');
    			}else if(paramIdArray[j]=="ycrange"){
    				var min = el("txtConfig_"+value+"_ycrange_start").value + ".000000";
    				var max = el("txtConfig_"+value+"_ycrange_end").value + ".000000";
    				paramXmlArray.push('<param id="10" value="'+min+'">最小值</param>');
    				paramXmlArray.push('<param id="11" value="'+max+'">最大值</param>');
    			}
    		}
    		paramXmlArray.push("</item>");
    	}else{
    		for ( var k = 0; k < rgbyuvArray.length; k++) {
    			if(rgbyuvArray[k]=="r"){
    				id = "12";
    				name = "R分量超标";
    			}else if(rgbyuvArray[k]=="g"){
    				id = "13";
    				name = "G分量超标";
    			}else if(rgbyuvArray[k]=="b"){
    				id = "14";
    				name = "B分量超标";
    			}else if(rgbyuvArray[k]=="y"){
    				id = "9";
    				name = "Y分量超标";
    			}else if(rgbyuvArray[k]=="u"){
    				id = "10";
    				name = "U分量超标";
    			}else if(rgbyuvArray[k]=="v"){
    				id = "11";
    				name = "V分量超标";
    			}
    			paramXmlArray.push('<item enable="'+enable+'" id="'+id+'" mode="'+mode+'" name="'+name+'" nums="'+nums+'">');
    			for ( var j = 0; j < paramIdArray.length; j++) {
    				var paramvalue = "";
    				if(paramIdArray[j]=="time"){
    					var timevalue = el("txtConfig_"+value+"_time").value;
    					paramXmlArray.push('<time value="'+timevalue+'"/>');
    				}else if(paramIdArray[j]=="6"){
    					paramvalue = el("txtConfig_"+value+"_6").value + ".000000";
    					paramXmlArray.push('<param id="6" value="'+paramvalue+'">M</param>');
    				}else if(paramIdArray[j]=="7"){
    					paramvalue = el("txtConfig_"+value+"_7").value + ".000000";
    					paramXmlArray.push('<param id="7" value="'+paramvalue+'">N</param>');
    				}else if(paramIdArray[j]=="8"){
    					paramvalue = el("txtConfig_"+value+"_8").value + ".000000";
    					paramXmlArray.push('<param id="8" value="'+paramvalue+'">K</param>');
    				}else if(paramIdArray[j]=="yrange"&&rgbyuvArray[k]=="y"){
    					var min = el("txtConfig_"+value+"_yrange_start").value + ".000000";
    					var max = el("txtConfig_"+value+"_yrange_end").value + ".000000";
    					paramXmlArray.push('<param id="10" value="'+min+'">最小值</param>');
    					paramXmlArray.push('<param id="11" value="'+max+'">最大值</param>');
    				}else if(paramIdArray[j]=="urange"&&rgbyuvArray[k]=="u"){
    					var min = el("txtConfig_"+value+"_urange_start").value + ".000000";
    					var max = el("txtConfig_"+value+"_urange_end").value + ".000000";
    					paramXmlArray.push('<param id="10" value="'+min+'">最小值</param>');
    					paramXmlArray.push('<param id="11" value="'+max+'">最大值</param>');
    				}else if(paramIdArray[j]=="vrange"&&rgbyuvArray[k]=="v"){
    					var min = el("txtConfig_"+value+"_vrange_start").value + ".000000";
    					var max = el("txtConfig_"+value+"_vrange_end").value + ".000000";
    					paramXmlArray.push('<param id="10" value="'+min+'">最小值</param>');
    					paramXmlArray.push('<param id="11" value="'+max+'">最大值</param>');
    				}else if(paramIdArray[j]=="rrange"&&rgbyuvArray[k]=="r"){
    					var min = el("txtConfig_"+value+"_rrange_start").value + ".000000";
    					var max = el("txtConfig_"+value+"_rrange_end").value + ".000000";
    					paramXmlArray.push('<param id="10" value="'+min+'">最小值</param>');
    					paramXmlArray.push('<param id="11" value="'+max+'">最大值</param>');
    				}else if(paramIdArray[j]=="grange"&&rgbyuvArray[k]=="g"){
    					var min = el("txtConfig_"+value+"_grange_start").value + ".000000";
    					var max = el("txtConfig_"+value+"_grange_end").value + ".000000";
    					paramXmlArray.push('<param id="10" value="'+min+'">最小值</param>');
    					paramXmlArray.push('<param id="11" value="'+max+'">最大值</param>');
    				}else if(paramIdArray[j]=="brange"&&rgbyuvArray[k]=="b"){
    					var min = el("txtConfig_"+value+"_brange_start").value + ".000000";
    					var max = el("txtConfig_"+value+"_brange_end").value + ".000000";
    					paramXmlArray.push('<param id="10" value="'+min+'">最小值</param>');
    					paramXmlArray.push('<param id="11" value="'+max+'">最大值</param>');
    				}
    			}
    			paramXmlArray.push("</item>");
			}
    	}
	}
    paramXmlArray.push('</video>');
    //音频param
    paramXmlArray.push('<audio fps="25.000000" freqs="0">');
    for ( var i = 0; i < audiosParamArray.length; i++) {
    	var value = audiosParamArray[i].value;
    	var name = audiosParamArray[i].paramName;
    	var id = audiosParamArray[i].id;
    	var enable = el("txtConfig_"+value+"_checkBox").checked?"1":"0";
    	var paramarry = audiosParamArray[i].param;
    	var nums = paramarry.length;
    	if(paramarry.in_array("time")){
    		nums = paramarry.length - 1;
    	}
    	paramXmlArray.push('<item enable="'+enable+'" id="'+id+'" name="'+name+'" nums="'+nums+'">');
    	if(value == "loudlesscheck"){
    		paramXmlArray.push('<time value="0.000000"/>');
    	}
    	for ( var j = 0; j < paramarry.length; j++) {
    		var paramvalue = "";
    		if(paramarry[j]=="time"){
    			var timevalue = el("txtConfig_"+value+"_time").value + ".000000";
    			if(value != "peaklevelscheck"){
    				timevalue = parseInt(el("txtConfig_"+value+"_time").value)*1000 + ".000000";
    			}
				paramXmlArray.push('<time value="'+timevalue+'"/>');
			}
    		for ( var k = 0; k < audioParamIdArray.length; k++) {
    			if(paramarry[j]==audioParamIdArray[k].id&&paramarry[j]!="time"){
    				var pointArray = el("txtConfig_"+value+"_"+paramarry[j]).value.split(".");
    				var suffix = ".000000";
    				if(pointArray[1]){
    					if(pointArray[1].length>=6){
    						suffix = pointArray[1];
    					}else{
    						suffix = "";
    						for ( var m = 0; m < 6-pointArray[1].length; m++) {
    							suffix += "0";
							}
    					}
    				}
    				paramvalue = el("txtConfig_"+value+"_"+paramarry[j]).value + suffix;
    				paramXmlArray.push('<param id="'+paramarry[j]+'" value="'+paramvalue+'">'+audioParamIdArray[k].paramName+'</param>');
    			}
			}
		}
    	paramXmlArray.push('</item>');
	}
    paramXmlArray.push('</audio>');
    paramXmlArray.push('</root>');
	return jetsennet.xml.serialize(params, "param").replace("</param>",paramXmlArray.join('')+"</param>");
}

/**
 * 回显UI窗口的值
 * @param params
 * @return
 */
function setQualityCheck(params){
	if(params&&params.root){
		var videoDataArray = params.root.video.item;
		var audioDataArray = params.root.audio.item;
	    //视频数据显示
		for ( var i = 0; i < videoDataArray.length; i++) {
			var enable = videoDataArray[i]["@enable"];
			var itemId = videoDataArray[i]["@id"];
			var mode = videoDataArray[i]["@mode"];
			var paramitem = videoDataArray[i].param;
			var timeValue = videoDataArray[i].time["@value"];
			setVideoValue(enable,itemId,mode,paramitem,timeValue);
		}
		setVideoValue(videoDataArray[0]["@enable"],videoDataArray[0]["@id"],videoDataArray[0]["@mode"],videoDataArray[0].param,videoDataArray[0].time["@value"]);
		//音频数据显示
		for ( var i = 0; i < audioDataArray.length; i++) {
			var enable = audioDataArray[i]["@enable"];
			var itemId = audioDataArray[i]["@id"];
			var paramitem = audioDataArray[i].param;
			var timeValue = audioDataArray[i].time["@value"];
			setAudioValue(enable,itemId,paramitem,timeValue);
		}
	}
}


/**
 * 设置视频计审
 * @param enable
 * @param id
 * @return
 */
function setVideoValue(enable,id,mode,paramitem,time){
	for ( var i = 0; i < videoParamArray.length; i++) {
		if(videoParamArray[i].id==id){
			el("txtConfig_"+videoParamArray[i].value+"_checkBox").checked = enable=="1"?"checked":"";
			if(mode!="4"){
				setVideoSelectValue("txtConfig_"+videoParamArray[i].value+"_mode",mode);
//				if(mode=="3"){
					changeValue(mode,id);
//				}
			}
			el("txtConfig_"+videoParamArray[i].value+"_time").value = time;
			if(paramitem){
				if(paramitem.length){
					for ( var j = 0; j < paramitem.length; j++) {
						var paramId = paramitem[j]["@id"];
						var paramValue = paramitem[j]["@value"];
						if(id=="15"){
							if(paramId=="10"){
								el("txtConfig_"+videoParamArray[i].value+"_ycrange_start").value = paramValue.split(".")[0];
							}else if(paramId=="11"){
								el("txtConfig_"+videoParamArray[i].value+"_ycrange_end").value = paramValue.split(".")[0];
							}
						}else if(id=="9"){
							if(paramId=="10"){
								el("txtConfig_"+videoParamArray[i].value+"_yrange_start").value = paramValue.split(".")[0];
							}else if(paramId=="11"){
								el("txtConfig_"+videoParamArray[i].value+"_yrange_end").value = paramValue.split(".")[0];
							}
						}else if(id=="10"){
							if(paramId=="10"){
								el("txtConfig_"+videoParamArray[i].value+"_urange_start").value = paramValue.split(".")[0];
							}else if(paramId=="11"){
								el("txtConfig_"+videoParamArray[i].value+"_urange_end").value = paramValue.split(".")[0];
							}
						}else if(id=="11"){
							if(paramId=="10"){
								el("txtConfig_"+videoParamArray[i].value+"_vrange_start").value = paramValue.split(".")[0];
							}else if(paramId=="11"){
								el("txtConfig_"+videoParamArray[i].value+"_vrange_end").value = paramValue.split(".")[0];
							}
						}else if(id=="12"){
							if(paramId=="10"){
								el("txtConfig_"+videoParamArray[i].value+"_rrange_start").value = paramValue.split(".")[0];
							}else if(paramId=="11"){
								el("txtConfig_"+videoParamArray[i].value+"_rrange_end").value = paramValue.split(".")[0];
							}
						}else if(id=="13"){
							if(paramId=="10"){
								el("txtConfig_"+videoParamArray[i].value+"_grange_start").value = paramValue.split(".")[0];
							}else if(paramId=="11"){
								el("txtConfig_"+videoParamArray[i].value+"_grange_end").value = paramValue.split(".")[0];
							}
						}else if(id=="14"){
							if(paramId=="10"){
								el("txtConfig_"+videoParamArray[i].value+"_brange_start").value = paramValue.split(".")[0];
							}else if(paramId=="11"){
								el("txtConfig_"+videoParamArray[i].value+"_brange_end").value = paramValue.split(".")[0];
							}
						}
						if(el("txtConfig_"+videoParamArray[i].value+"_"+paramId)){
							el("txtConfig_"+videoParamArray[i].value+"_"+paramId).value = paramValue.split(".")[0];
						}
					}
				}else{
					var paramId = paramitem["@id"];
					var paramValue = paramitem["@value"];
					if(el("txtConfig_"+videoParamArray[i].value+"_"+paramId)){
						el("txtConfig_"+videoParamArray[i].value+"_"+paramId).value = paramValue.split(".")[0];
					}
				}
			}
		}
	}
}

/**设置音频计审
 * @param enable
 * @param id
 * @return
 */
function setAudioValue(enable,id,paramitem,time){
	for ( var i = 0; i < audiosParamArray.length; i++) {
		if(audiosParamArray[i].id==id){
			el("txtConfig_"+audiosParamArray[i].value+"_checkBox").checked = enable=="1"?"checked":"";
			if(time!="0.000000"&&el("txtConfig_"+audiosParamArray[i].value+"_time")){
				if(audiosParamArray[i].value=="peaklevelscheck"){
					el("txtConfig_"+audiosParamArray[i].value+"_time").value = time.split(".")[0];
				}else{
					el("txtConfig_"+audiosParamArray[i].value+"_time").value = parseInt(time.split(".")[0])/1000;
				}
			}
			if(paramitem){
				if(paramitem.length){
					for ( var j = 0; j < paramitem.length; j++) {
						var paramId = paramitem[j]["@id"];
						var paramValue = paramitem[j]["@value"];
						if(el("txtConfig_"+audiosParamArray[i].value+"_"+paramId)){
							if(paramValue.indexOf(".000000")>-1){
								el("txtConfig_"+audiosParamArray[i].value+"_"+paramId).value = paramValue.split(".")[0];
							}else{
								el("txtConfig_"+audiosParamArray[i].value+"_"+paramId).value = paramValue.substring(0,paramValue.length-5);
							}
						}
					}
				}else{
					var paramId = paramitem["@id"];
					var paramValue = paramitem["@value"];
					if(el("txtConfig_"+audiosParamArray[i].value+"_"+paramId)){
						if(paramValue.indexOf(".000000")>-1){
							el("txtConfig_"+audiosParamArray[i].value+"_"+paramId).value = paramValue.split(".")[0];
						}else{
							el("txtConfig_"+audiosParamArray[i].value+"_"+paramId).value = paramValue.substring(0,paramValue.length-5);
						}
					}
				}
			}
		}
	}
}


function setVideoSelectValue(name,value){
	var handing = attributeOf(el(name), "handing", "");
    var handsources = handing.split("|");
    jQuery.each(handsources, function (j) {
        var sourceItem = handsources[j].split("~");
        if(sourceItem[1] == value){
        	jetsennet.ui.DropDownList[name].selectedValue = sourceItem[1];
        	el(name).value = sourceItem[0];
        } 
    });
}

/**
 * 加载xml计审模板
 * @return
 */
function loadAutoQcTemplate(){
//	var fileInput = el("autoQcTemplateName");
//    var fileInputNew = fileInput.cloneNode();
//    fileInput.replaceNode(fileInputNew);
//    
	var dialog = new jetsennet.ui.Window("load-template-dialog");
    jQuery.extend(dialog, { windowStyle: 1, submitBox: true, cancelBox: true, maximizeBox: false, minimizeBox: false, 
    	size: { width: 600, height: 0 }, showScroll: false, title: "导入计审模板" });
    dialog.controls = ["divLoadTemplate"];
    dialog.onsubmit = function () {
    	if (el('autoQcTemplateName').value == "") {
            jetsennet.alert("请选择要导入的模板文件!");
            return;
        }
    	var suffix = el('autoQcTemplateName').value.substring(el('autoQcTemplateName').value.lastIndexOf(".")+1);
    	if(suffix.toLowerCase()!="tpl"){
    		jetsennet.alert("请导入tpl后缀的文件!");
            return;
    	}
    	el("autoAcTemImport").submit();
    	setTimeout(function(){
    		$.ajax({
        		url:"../../../AutoQcTemplateImport",
        		cache:false, 
        		data:{type:"1"},
        		success:function(data){
        			if(data){
        				var options = {igoreAttribute:false,attributeFlag:"@",valueFlag:"$",trueValue:"true",falseValue:"false"};
        				var params = jQuery.extend({}, jetsennet.xml.deserialize("<param>"+data.substring(data.indexOf("<root>"))+"</param>",options));
        				if(params&&params.root){
        					setQualityCheck(params);
        				}else{
        					jetsennet.alert("不是标准的技审模板，请重新导入！");
        				}
        			}
        		},
        		error:function(){
        			jetsennet.alert("不是标准的技审模板，请重新导入！");
        		}
        	}); 
    		dialog.close();
    	},2000);
    }; 
    dialog.showDialog();
}

/**
 * 恢复默认
 * @return
 */
function resumeAutoQc(){
	var paramStr = [];
	paramStr.push('<param><root><video auto="0" bottom="0" fps="25.000000" left="0" right="0" scan="1" tcount="4" top="0">');
		paramStr.push('<item enable="0" id="0" mode="1" name="黑场" nums="4"><time value="3"/><param id="0" value="24.000000">Y</param>');
		paramStr.push('<param id="6" value="8.000000">M</param><param id="7" value="8.000000">N</param><param id="8" value="8.000000">K</param>');
		paramStr.push('</item><item enable="0" id="1" mode="1" name="蓝底" nums="7"><param id="0" value="32.000000">Y</param>');
		paramStr.push('<param id="1" value="240.000000">U</param><param id="2" value="118.000000">V</param><time value="3"/>');
		paramStr.push('<param id="9" value="18.000000">偏差</param><param id="6" value="8.000000">M</param>');
		paramStr.push('<param id="7" value="8.000000">N</param><param id="8" value="8.000000">K</param></item>');
		paramStr.push('<item enable="0" id="2" mode="1" name="绿底" nums="7"><param id="0" value="172.000000">Y</param>');
		paramStr.push('<param id="1" value="42.000000">U</param><param id="2" value="27.000000">V</param><time value="3"/>');
		paramStr.push('<param id="9" value="18.000000">偏差</param><param id="6" value="8.000000">M</param>');
		paramStr.push('<param id="7" value="8.000000">N</param><param id="8" value="8.000000">K</param></item>');
		paramStr.push('<item enable="0" id="3" mode="1" name="单色彩场" nums="4"><time value="3"/><param id="9" value="18.000000">偏差</param>');
		paramStr.push('<param id="6" value="8.000000">M</param><param id="7" value="8.000000">N</param><param id="8" value="8.000000">K</param>');
		paramStr.push('</item><item enable="0" id="4" mode="4" name="彩条" nums="1"><time value="3"/><param id="9" value="8.000000">偏差</param>');
		paramStr.push('</item><item enable="0" id="5" mode="4" name="特定图像" nums="0"><time value="3"/></item>');
		paramStr.push('<item enable="0" id="8" mode="4" name="夹帧" nums="2"><param id="12" value="3.000000">F</param><time value="3"/>');
		paramStr.push('<param id="13" value="65.000000">相似程度</param></item><item enable="0" id="7" mode="1" name="静帧" nums="4">');
		paramStr.push('<time value="3"/><param id="9" value="18.000000">偏差</param><param id="6" value="8.000000">M</param>');
		paramStr.push('<param id="7" value="8.000000">N</param><param id="8" value="8.000000">K</param></item>');
		paramStr.push('<item enable="0" id="28" mode="4" name="花屏" nums="1"><time value="1"/><param id="16" value="20.000000">检测块数</param>');
		paramStr.push('</item><item enable="0" id="19" mode="4" name="黑白照片检测" nums="0"><time value="3"/></item>');
		paramStr.push('<item enable="0" id="18" mode="4" name="偏色检测" nums="1"><time value="3"/><param id="14" value="5.000000">偏色程度</param>');
		paramStr.push('</item><item enable="0" id="20" mode="4" name="跳帧检测" nums="1"><time value="1"/><param id="15" value="25.000000">');
		paramStr.push('差异程度</param></item><item enable="0" id="16" mode="4" name="幅型检测" nums="2"><time value="1"/>');
		paramStr.push('<param id="17" value="589840.000000">幅型比</param><param id="0" value="24.000000">Y</param></item>');
		paramStr.push('<item enable="0" id="15" mode="1" name="YC超标" nums="5"><time value="3"/><param id="10" value="-31.000000">最小值</param>');
		paramStr.push('<param id="11" value="114.000000">最大值</param><param id="6" value="8.000000">M</param><param id="7" value="8.000000">');
		paramStr.push('N</param><param id="8" value="8.000000">K</param></item><item enable="0" id="12" mode="1" name="R分量超标" nums="5">');
		paramStr.push('<param id="10" value="-5.000000">最小值</param><param id="11" value="105.000000">最大值</param><time value="3"/>');
		paramStr.push('<param id="6" value="8.000000">M</param><param id="7" value="8.000000">N</param><param id="8" value="8.000000">');
		paramStr.push('K</param></item><item enable="0" id="13" mode="1" name="G分量超标" nums="5"><param id="10" value="-5.000000">最小值</param>');
		paramStr.push('<param id="11" value="105.000000">最大值</param><time value="3"/><param id="6" value="8.000000">M</param>');
		paramStr.push('<param id="7" value="8.000000">N</param><param id="8" value="8.000000">K</param></item>');
		paramStr.push('<item enable="0" id="14" mode="1" name="B分量超标" nums="5"><param id="10" value="-5.000000">最小值</param>');
		paramStr.push('<param id="11" value="105.000000">最大值</param><time value="3"/><param id="6" value="8.000000">M</param>');
		paramStr.push('<param id="7" value="8.000000">N</param><param id="8" value="8.000000">K</param></item>');
		paramStr.push('<item enable="0" id="9" mode="1" name="Y分量超标" nums="5"><param id="10" value="-1.000000">最小值</param>');
		paramStr.push('<param id="11" value="103.000000">最大值</param><time value="3"/><param id="6" value="8.000000">M</param>');
		paramStr.push('<param id="7" value="8.000000">N</param><param id="8" value="8.000000">K</param></item>');
		paramStr.push('<item enable="0" id="10" mode="1" name="U分量超标" nums="5"><param id="10" value="16.000000">最小值</param>');
		paramStr.push('<param id="11" value="240.000000">最大值</param><time value="3"/><param id="6" value="8.000000">M</param>');
		paramStr.push('<param id="7" value="8.000000">N</param><param id="8" value="8.000000">K</param></item>');
		paramStr.push('<item enable="0" id="11" mode="1" name="V分量超标" nums="5"><param id="10" value="16.000000">最小值</param>');
		paramStr.push('<param id="11" value="240.000000">最大值</param><time value="3"/><param id="6" value="8.000000">M</param>');
		paramStr.push('<param id="7" value="8.000000">N</param><param id="8" value="8.000000">K</param></item>');
		paramStr.push('<item enable="0" id="6" mode="4" name="马赛克" nums="1"><time value="1"/><param id="16" value="20.000000">检测块数</param>');
		paramStr.push('</item></video><audio fps="25.000000" freqs="0"><item enable="0" id="21" name="低电平" nums="1">');
		paramStr.push('<time value="5000.000000"/><param id="0" value="-48.000000">低电平阈值</param></item>');
		paramStr.push('<item enable="0" id="22" name="立体声反相" nums="1"><time value="5000.000000"/><param id="2" value="50.000000">百分比</param>');
		paramStr.push('</item><item enable="0" id="23" name="真峰值超标" nums="1"><time value="100.000000"/><param id="1" value="0.000000">峰值阈值');
		paramStr.push('</param></item><item enable="0" id="25" name="音量超标" nums="1"><time value="2000.000000"/>');
		paramStr.push('<param id="5" value="-6.000000">音量阈值</param></item><item enable="0" id="24" name="响度超标" nums="2">');
		paramStr.push('<time value="0.000000"/><param id="3" value="-24.000000">平均响度阈值</param><param id="4" value="-16.000000">短时响度阈值');
		paramStr.push('</param></item><item enable="0" id="27" name="电平偏移" nums="1"><time value="2000.000000"/>');
		paramStr.push('<param id="9" value="0.100000">偏移电平</param></item><item enable="0" id="29" name="相关性检测" nums="2">');
		paramStr.push('<time value="2000.000000"/><param id="11" value="0.100000">最小相关程度</param><param id="10" value="1.000000">最大相关程度');
		paramStr.push('</param></item><item enable="0" id="26" name="不可听检测" nums="3"><time value="2000.000000"/>');
		paramStr.push('<param id="7" value="20.000000">最小频率</param><param id="8" value="20000.000000">最大频率</param>');
		paramStr.push('<param id="6" value="-40.000000">音量阈值</param></item></audio></root></param>');
	var options = {igoreAttribute:false,attributeFlag:"@",valueFlag:"$",trueValue:"true",falseValue:"false"};
    var params = jQuery.extend({}, jetsennet.xml.deserialize(paramStr.join(''),options));
    if (items) {
        for (var i = 0; i < items.length; i++) {
        	setQualityCheckValue(items[i]["@name"],"",items[i]["@deafult"]);
        }
	}
    setQualityCheck(params);
}