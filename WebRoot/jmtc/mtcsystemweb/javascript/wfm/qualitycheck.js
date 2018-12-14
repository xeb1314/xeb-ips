//计审定制
var items;
var gQualityPane;
var templateContent = "";  //记录初始模板内容
function showQualityCheckActConfig(node) {
    if (node.nodeParam.actType == 2 || node.nodeParam.actType == 3) {
    	var param = new HashMap();
        param.put("actId", node.nodeParam.actId);
        var sResult = WFMDAO.execute("getActConfig", param);
        items = jetsennet.xml.deserialize(sResult.resultVal, { igoreAttribute: false }).item;
    }
    templateContent = "";
    initVaribale();
    renderQualityCheckActConfig(items, node);
    renderQualityCheckInit();
    jetsennet.ui.DropDownList.initOptions("txtConfigtemplateName", true);
    initQcTemplateName();
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
    	if(!el('txtConfigtemplateName').value){
    		jetsennet.alert("请先保存当前模板配置或者选择已存在的模板！");
    		return;
    	}
    	var areaElements = jetsennet.form.getElements('tab_mideaInfo');
    	if (jetsennet.form.validate(areaElements, true)) {
    		/**重命名*/
    		var actName = el('txtConfigName').value;
    		gFlowView.isChanged = true;
    		if (actName != node.nodeParam.name) {
    			node.nodeParam.name = actName;
    			node.setNodeName(actName);
    			jQuery(node.control).attr("title",actName);
    		}
    		
    		var paramData = getTemParamData();
    		if(templateContent!=""&&paramData!=templateContent){
    			jetsennet.confirm("确定是否保存当前模板配置?",function() {
    				if(saveAutoQcTemplate(node,"1")){
    					node.nodeParam.parameter = getQualityCheckActParameter(items, node);
    					dialog.close();
    				}
    				return true;
    			},{oncancel:function() {
    				node.nodeParam.parameter = getQualityCheckActParameter(items, node);
            		dialog.close();
    				return true;
    			}
    			});
    		}else{
    			//获取值
        		node.nodeParam.parameter = getQualityCheckActParameter(items, node);
        		dialog.close();
    		}
    	}
    };
    if(gCurrentProcess.procState==0){
    	dialog.attachButtons = [{ text: "保存模板", clickEvent: function () { saveAutoQcTemplate(node); } }];
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
    		if(this.id!="txtConfigtemplateName"){
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
        			if(valueOf(items[i], "@source", "")=="10"){
        				var validateType = items[i]["@allowEmpty"]=="false"?'validatetype="NotEmpty"':'';
        				var spanred = items[i]["@allowEmpty"]=="false"?'<span class="input-group-addon" style="color: Red">*</span>':'';
        				contents.push('<div class="input-group input-group-sm" style="width:100%"><label style="position: relative; font-weight: normal; margin-bottom: 0;width:100%;"><input id="txtConfig' + items[i]["@name"] + '" '+validateType+' onclick="jetsennet.ui.DropDownList.show(this)" class="form-control input-sm class2" style="width:100%;" readonly="readonly"/><i class="fa fa-lg fa-caret-down" style="position: absolute;top: 10px;right: 10px;z-index:10;"></i></label>'+spanred+'</div>');
        			}else{
        				contents.push(createControl(items[i]));
        			}
        			contents.push('</td>');
        			if(valueOf(items[i], "@allowVariable", "")=="true"){
        				contents.push('<td>');
            			var variableStr = gCurrentProcess.procState==0?'<span class="glyphicon glyphicon-th" style="cursor:pointer;" title="变量设置" onclick="loadVariable(\'txtConfig' + items[i]["@name"] + '\');"></span>':'';
            			contents.push(variableStr);
            			contents.push('</td>');
            		}
        		}
        		if((i==items.length-1)&&(items.length%2==1)){
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
	assignQualityDivArray.push('<li>视音频检测</li>');
	assignQualityDivArray.push('<li>MXF检测</li>');
	assignQualityDivArray.push('</ul>');
	
	assignQualityDivArray.push('<div id="mypage">');
	assignQualityDivArray.push('<div>');
	assignQualityDivArray.push('<table border="0" cellspacing="0" cellpadding="0" width="97%">');
	assignQualityDivArray.push('<tr><td valign="top"><div style="padding-top: 3px;height:394px;" id="qualityContentDiv">');
	assignQualityDivArray.push('</div></td></tr>');
	assignQualityDivArray.push('</table></div>');
	
	assignQualityDivArray.push('<div>');
	assignQualityDivArray.push('<table border="0" cellspacing="0" cellpadding="0" width="97%">');
	assignQualityDivArray.push('<tr><td valign="top"><div style="padding-top: 3px;height:394px;" id="MxfContentDiv">');
	assignQualityDivArray.push('</div></td></tr>');
	assignQualityDivArray.push('</table></div>');
	assignQualityDivArray.push('</div>');
	jQuery("#divActConfig").append(assignQualityDivArray.join(''));
	gQualityPane = new jetsennet.ui.TabPane(el('myTab'), el('mypage'));
	gQualityPane.select(0);
	gQualityPane.ontabpageselected = function (index) {
    	jetsennet.hidePopups();
    };
    showVideoHtml();  //显示视音频检测内容 
    showMxfHtml();    //显示MXF检测内容
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
            	if (source == SOURCE_CUSTOM || source == SOURCE_DB || source == SOURCE_VAR || source == "10") {
            		if(source == "10"&&params[name]&&params[name].$){
            			$('#txtConfigtemplateName').attr("title",params[name].$);
            			jetsennet.ui.DropDownList["txtConfigtemplateName"].selectedValue = params[name].$;
            			el("txtConfigtemplateName").value = params[name].$;
            			loadQcContent(el("txtConfigtemplateName").value);
            		}else{
            			setQualityCheckValue(items[i]["@name"],params,items[i]["@deafult"]);
            		}
            	}else{
            		if(params[name]){
                		var paramValue = params[name].$;
                		if(paramValue){
                			el("txtConfig" + name).value = allVarNameArray.in_array(paramValue.replace("@", "")) ? (paramValue.replace("@", "")) : paramValue;
                		}
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
 * 初始化技审模板
 */
function initQcTemplateName(procactId){
	var sqlQuery = new jetsennet.SqlQuery();
    var queryTable = jetsennet.createQueryTable("WFM_ACTPARAM", "a");
    queryTable.addJoinTable(jetsennet.createJoinTable("WFM_PROCACT", "c", "c.PROCACT_ID=a.PROCACT_ID", jetsennet.TableJoinType.Left));
    jQuery.extend(sqlQuery, { IsPageResult: 0, QueryTable: queryTable, ResultFields: "DISTINCT a.TEMPLATE_NAME",OrderString:"ORDER BY a.TEMPLATE_NAME asc" });
    var condition = new jetsennet.SqlConditionCollection();
    condition.SqlConditions.push(jetsennet.SqlCondition.create("c.ACT_ID", "5400", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric));
    if(procactId){
    	condition.SqlConditions.push(jetsennet.SqlCondition.create("c.PROCACT_ID", procactId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric));
    }
    sqlQuery.Conditions = condition;
    
    var param = new HashMap();
    param.put("queryXml", sqlQuery.toXml());
    var sResult = MTCDAO.execute("commonXmlQuery", param);
    var objs = jetsennet.xml.toObject(sResult.resultVal, "Record");
    if(procactId){
    	if(objs&&objs.length>0){
        	jetsennet.ui.DropDownList["txtConfigtemplateName"].selectedValue = objs[0].TEMPLATE_NAME;
    		el("txtConfigtemplateName").value = objs[0].TEMPLATE_NAME;
        	return;
        }else{
        	//如果还没保存的流程节点则默认加载模板
        	var sqlQuery = new jetsennet.SqlQuery();
            var queryTable = jetsennet.createQueryTable("WFM_ACTPARAM", "a");
            jQuery.extend(sqlQuery, { IsPageResult: 0, QueryTable: queryTable, ResultFields: "a.TEMPLATE_NAME"});
            var condition = new jetsennet.SqlConditionCollection();
            condition.SqlConditions.push(jetsennet.SqlCondition.create("a.PROCACT_ID", procactId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric));
            sqlQuery.Conditions = condition;
            var param = new HashMap();
            param.put("queryXml", sqlQuery.toXml());
            var sResult = MTCDAO.execute("commonXmlQuery", param);
            var objsNew = jetsennet.xml.toObject(sResult.resultVal, "Record");
            if(objsNew&&objsNew.length>0){
            	jetsennet.ui.DropDownList["txtConfigtemplateName"].appendItem({ text: objsNew[0].TEMPLATE_NAME, value: objsNew[0].TEMPLATE_NAME,title:objsNew[0].TEMPLATE_NAME });
            	jetsennet.ui.DropDownList["txtConfigtemplateName"].selectedValue = objsNew[0].TEMPLATE_NAME;
        		el("txtConfigtemplateName").value = objsNew[0].TEMPLATE_NAME;
            	return;
            }
        }
    }
	if(objs&&objs.length>0){
		jetsennet.ui.DropDownList["txtConfigtemplateName"].clear();
		for (var i = 0; i < objs.length; i++) {
			jetsennet.ui.DropDownList["txtConfigtemplateName"].appendItem({ text: objs[i].TEMPLATE_NAME, value: objs[i].TEMPLATE_NAME,title:objs[i].TEMPLATE_NAME });
		}
        jetsennet.ui.DropDownList["txtConfigtemplateName"].onchanged = function(item){
        	$('#txtConfigtemplateName').attr("title",item.value);
    		loadQcContent(item.value);
        };
	}
}

/**
 * 加载模板内容
 */
function loadQcContent(templateName){
	var param = new HashMap();
    param.put("templateName", templateName);
    var sResult = WFMDAO.execute("getQcTemplateConfig", param);
    if(sResult.errorCode==0&&sResult.resultVal){
    	templateContent = sResult.resultVal;
    	showContentAndMxfInfo(sResult.resultVal);
    }
}


/**
 * 设置音视频 mxf内容
 * @param templateInfo
 */
function showContentAndMxfInfo(templateInfo){
	$("#qualityContentDiv").html("");
	showVideoHtml();
	var contentxmlDoc = new jetsennet.XmlDoc();
	contentxmlDoc.async = false;
	contentxmlDoc.loadXML(templateInfo);
    var contentNode = contentxmlDoc.selectSingleNode("CheckTemplates/QualityCheck");
    var videoNode;var audioNode;
    if(contentNode){
    	videoNode = contentNode.selectSingleNode("Video");
    	audioNode = contentNode.selectSingleNode("Audio");
    }
    var mxfNode = contentxmlDoc.selectSingleNode("CheckTemplates/MXFCheck");
    var fileFormatCheckNode;var dnxHDChildNode;var avcIntraChildNode; var mpeg2LongGopChildNode;
    if(mxfNode){
    	fileFormatCheckNode = mxfNode.selectSingleNode("FileFormatCheck");
    	dnxHDChildNode = mxfNode.selectSingleNode("CodecCheck/DNxHD");
    	avcIntraChildNode = mxfNode.selectSingleNode("CodecCheck/AVCIntra");
    	mpeg2LongGopChildNode = mxfNode.selectSingleNode("CodecCheck/Mpeg2LongGop");
    }
    $.each($(".jetsen-checkbox[name='chk_codetree_LeftMxfContentTree']"), function(){
		$(this).removeClass("checked");
	});
    if(fileFormatCheckNode&&fileFormatCheckNode.childNodes.length>0){
    	for ( var i = 0; i < mxfParamArray.length; i++) {
    		if(mxfParamArray[i].type=="10"){
    			var fileFormatChildNode = fileFormatCheckNode.selectSingleNode(mxfParamArray[i].value);
    			if(fileFormatChildNode){
    				$.each($(".jetsen-checkbox[name='chk_codetree_LeftMxfContentTree']"), function(){
						if(mxfParamArray[i].id == $(this).attr("value"))
						{
							$(this).click();
						}
					});
    			}
    		}
    	}
    }
    if(dnxHDChildNode&&dnxHDChildNode.childNodes.length>0){
    	for ( var i = 0; i < mxfParamArray.length; i++) {
    		if(mxfParamArray[i].type=="11"){
    			var childNode = dnxHDChildNode.selectSingleNode(mxfParamArray[i].value);
    			if(childNode){
    				$.each($(".jetsen-checkbox[name='chk_codetree_LeftMxfContentTree']"), function(){
    					if(mxfParamArray[i].id == $(this).attr("value"))
						{
							$(this).click();
						}
					});
    			}
    		}
    	}
    }
    if(avcIntraChildNode&&avcIntraChildNode.childNodes.length>0){
    	for ( var i = 0; i < mxfParamArray.length; i++) {
    		if(mxfParamArray[i].type=="12"){
    			var childNode = avcIntraChildNode.selectSingleNode(mxfParamArray[i].value);
    			if(childNode){
    				$.each($(".jetsen-checkbox[name='chk_codetree_LeftMxfContentTree']"), function(){
    					if(mxfParamArray[i].id == $(this).attr("value"))
						{
    						$(this).click();
						}
					});
    			}
    		}
    	}
    }
    if(mpeg2LongGopChildNode&&mpeg2LongGopChildNode.childNodes.length>0){
    	for ( var i = 0; i < mxfParamArray.length; i++) {
    		if(mxfParamArray[i].type=="13"){
    			var childNode = mpeg2LongGopChildNode.selectSingleNode(mxfParamArray[i].value);
    			if(childNode){
    				$.each($(".jetsen-checkbox[name='chk_codetree_LeftMxfContentTree']"), function(){
    					if(mxfParamArray[i].id == $(this).attr("value"))
						{
    						$(this).click();
						}
					});
    			}
    		}
    	}
    }
    if(videoNode&&videoNode.childNodes.length>0){
    	for ( var i = 0; i < videoAudiosParamArray.length; i++) {
			if(videoAudiosParamArray[i].type=="1"){
				var videoChildNode = videoNode.selectSingleNode(videoAudiosParamArray[i].value);
				var paramName = videoAudiosParamArray[i].value;
				var paramArray = videoAudiosParamArray[i].param;
				if(videoChildNode){
					if(paramName=="Aspect"){
						for ( var j = 0; j < paramArray.length; j++) {
							if(paramArray[j]!="Percent"){
								el("txtConfig_" + paramName + "_"+paramArray[j]).value = valueOf(videoChildNode.selectSingleNode("AspectAll/"+paramArray[j]), "text", "");
							}else{
								el("txtConfig_" + paramName + "_"+paramArray[j]).value = valueOf(videoChildNode.selectSingleNode("AspectAll/UpBotP"), "text", "");
							}
						}
					}else if(paramName=="YUV"){
						for ( var j = 0; j < paramArray.length; j++) {
							if(paramArray[j]=="Y_Bit8"){
								el("txtConfig_" + paramName + "_"+paramArray[j]+"_start").value = valueOf(videoChildNode.selectSingleNode("Y/MinBit8"), "text", "");
								el("txtConfig_" + paramName + "_"+paramArray[j]+"_end").value = valueOf(videoChildNode.selectSingleNode("Y/MaxBit8"), "text", "");
							}else if(paramArray[j]=="UV_Bit8"){
								el("txtConfig_" + paramName + "_"+paramArray[j]+"_start").value = valueOf(videoChildNode.selectSingleNode("UV/MinBit8"), "text", "");
								el("txtConfig_" + paramName + "_"+paramArray[j]+"_end").value = valueOf(videoChildNode.selectSingleNode("UV/MaxBit8"), "text", "");
							}else if(paramArray[j]=="Y_Bit10"){
								el("txtConfig_" + paramName + "_"+paramArray[j]+"_start").value = valueOf(videoChildNode.selectSingleNode("Y/MinBit10"), "text", "");
								el("txtConfig_" + paramName + "_"+paramArray[j]+"_end").value = valueOf(videoChildNode.selectSingleNode("Y/MaxBit10"), "text", "");
							}else if(paramArray[j]=="UV_Bit10"){
								el("txtConfig_" + paramName + "_"+paramArray[j]+"_start").value = valueOf(videoChildNode.selectSingleNode("UV/MinBit10"), "text", "");
								el("txtConfig_" + paramName + "_"+paramArray[j]+"_end").value = valueOf(videoChildNode.selectSingleNode("UV/MaxBit10"), "text", "");
							}else{
								el("txtConfig_" + paramName + "_"+paramArray[j]).value = valueOf(videoChildNode.selectSingleNode("UV/"+paramArray[j]), "text", "");
							}
						}
					}else if(paramName=="RGB"){
						for ( var j = 0; j < paramArray.length; j++) {
							if(paramArray[j]=="RGB_Bit8"){
								el("txtConfig_" + paramName + "_"+paramArray[j]+"_start").value = valueOf(videoChildNode.selectSingleNode("MinBit8"), "text", "");
								el("txtConfig_" + paramName + "_"+paramArray[j]+"_end").value = valueOf(videoChildNode.selectSingleNode("MaxBit8"), "text", ""); 
							}else if(paramArray[j]=="RGB_Bit10"){
								el("txtConfig_" + paramName + "_"+paramArray[j]+"_start").value = valueOf(videoChildNode.selectSingleNode("MinBit10"), "text", "");  
								el("txtConfig_" + paramName + "_"+paramArray[j]+"_end").value = valueOf(videoChildNode.selectSingleNode("MaxBit10"), "text", "");
							}else{
								el("txtConfig_" + paramName + "_"+paramArray[j]).value = valueOf(videoChildNode.selectSingleNode(paramArray[j]), "text", "");
							}
						}
					}else if(paramName=="Level"){
						var whiteLevelNode = videoChildNode.selectSingleNode("WhiteLevel");
						paramArray = ["Y","Percent","Duration"];
						if(whiteLevelNode&&whiteLevelNode.text){ 
							for ( var j = 0; j < paramArray.length; j++) {
								el("txtConfig_WhiteLevel_"+paramArray[j]).value = valueOf(whiteLevelNode.selectSingleNode(paramArray[j]), "text", "");
							}
							$.each($(".jetsen-checkbox[name='chk_codetree_LeftContentTree']"), function(){
								if("8" == $(this).attr("value"))
								{
									$(this).addClass("checked");
								}
							});
						}
						var blackLevelNode = videoChildNode.selectSingleNode("BlackLevel");
						if(blackLevelNode&&blackLevelNode.text){ 
							for ( var j = 0; j < paramArray.length; j++) {
								el("txtConfig_BlackLevel_"+paramArray[j]).value = valueOf(blackLevelNode.selectSingleNode(paramArray[j]), "text", "");
							}
							$.each($(".jetsen-checkbox[name='chk_codetree_LeftContentTree']"), function(){
								if("9" == $(this).attr("value"))
								{
									$(this).addClass("checked");
								}
							});
						}
					}else{
						for ( var j = 0; j < paramArray.length; j++) {
							el("txtConfig_" + paramName + "_"+paramArray[j]).value = valueOf(videoChildNode.selectSingleNode(paramArray[j]), "text", "");
						} 
					}
					$.each($(".jetsen-checkbox[name='chk_codetree_LeftContentTree']"), function(){
						if(videoAudiosParamArray[i].id == $(this).attr("value")&&paramArray)
						{
							$(this).click();
						}
					});
				}
			}
		}
    }
    if(audioNode&&audioNode.childNodes.length>0){
    	for ( var i = 0; i < videoAudiosParamArray.length; i++) {
			if(videoAudiosParamArray[i].type=="2"){
				var audioChildNode = audioNode.selectSingleNode(videoAudiosParamArray[i].value);
				var paramName = videoAudiosParamArray[i].value;
				var paramArray = videoAudiosParamArray[i].param;
				if(audioChildNode){
					//响度
					if(paramName=="Loudness"){
						var avgLoudnessNode = audioChildNode.selectSingleNode("AvgLoudness");
						var shtLoudnessNode = audioChildNode.selectSingleNode("ShtLoudness");
						var momLoudnessNode = audioChildNode.selectSingleNode("MomLoudness");
						var avgLoudnessParamArray = ["AvgLoudness"];
						paramArray = ["Level","Duration"];
						if(avgLoudnessNode&&avgLoudnessNode.text){ 
							for ( var j = 0; j < avgLoudnessParamArray.length; j++) {
								el("txtConfig_AvgLoudness_"+avgLoudnessParamArray[j]+"_start").value = valueOf(avgLoudnessNode.selectSingleNode("Min"), "text", "");
								el("txtConfig_AvgLoudness_"+avgLoudnessParamArray[j]+"_end").value = valueOf(avgLoudnessNode.selectSingleNode("Max"), "text", "");
							}
							$.each($(".jetsen-checkbox[name='chk_codetree_LeftContentTree']"), function(){
								if("104" == $(this).attr("value"))
								{
									$(this).addClass("checked");
								}
							});
						}
						if(shtLoudnessNode&&shtLoudnessNode.text){
							for ( var j = 0; j < paramArray.length; j++) {
								el("txtConfig_ShtLoudness_"+paramArray[j]).value = valueOf(shtLoudnessNode.selectSingleNode(paramArray[j]), "text", "");
							} 
							$.each($(".jetsen-checkbox[name='chk_codetree_LeftContentTree']"), function(){
								if("105" == $(this).attr("value"))
								{
									$(this).addClass("checked");
								}
							});
						}
						if(momLoudnessNode&&momLoudnessNode.text){
							for ( var j = 0; j < paramArray.length; j++) {
								el("txtConfig_MomLoudness_"+paramArray[j]).value = valueOf(momLoudnessNode.selectSingleNode(paramArray[j]), "text", "");
							} 
							$.each($(".jetsen-checkbox[name='chk_codetree_LeftContentTree']"), function(){
								if("114" == $(this).attr("value"))
								{
									$(this).addClass("checked");
								}
							});
						}
					}else if(paramName=="StereoCorrelation"){
						var invertPhaseNode = audioChildNode.selectSingleNode("InvertPhase");
						var samePhaseNode = audioChildNode.selectSingleNode("SamePhase");
						var invertPhaseParamArray = ["Duration"];
						var samePhaseParamArray = ["Percent"];
						var checkflag = false;
						if(invertPhaseNode&&invertPhaseNode.text){
							for ( var j = 0; j < invertPhaseParamArray.length; j++) {
								el("txtConfig_InvertPhase_"+invertPhaseParamArray[j]).value = valueOf(invertPhaseNode.selectSingleNode(invertPhaseParamArray[j]), "text", "");
							} 
							$.each($(".jetsen-checkbox[name='chk_codetree_LeftContentTree']"), function(){
								if("107" == $(this).attr("value"))
								{
									checkflag = true;
									$(this).addClass("checked");
								}
							});
						}
						if(samePhaseNode&&samePhaseNode.text){
							for ( var j = 0; j < samePhaseParamArray.length; j++) {
								el("txtConfig_SamePhase_"+samePhaseParamArray[j]).value = valueOf(samePhaseNode.selectSingleNode(samePhaseParamArray[j]), "text", "");
							} 
							$.each($(".jetsen-checkbox[name='chk_codetree_LeftContentTree']"), function(){
								if("108" == $(this).attr("value")||(checkflag&&"106" == $(this).attr("value")))
								{
									$(this).addClass("checked");
								}
							});
						}
					}else if(paramName=="StereoRelation"){
						var negRelationNode = audioChildNode.selectSingleNode("NegRelation");
						var posRelation = audioChildNode.selectSingleNode("PosRelation");
						var unRelation = audioChildNode.selectSingleNode("UnRelation");
						paramArray = ["Threshold","Duration"];
						var unRelationParamArray = ["UnRelation","Duration"];
						if(negRelationNode&&negRelationNode.text){
							for ( var j = 0; j < paramArray.length; j++) {
								el("txtConfig_NegRelation_"+paramArray[j]).value = valueOf(negRelationNode.selectSingleNode(paramArray[j]), "text", "");
							} 
							$.each($(".jetsen-checkbox[name='chk_codetree_LeftContentTree']"), function(){
								if("110" == $(this).attr("value"))
								{
									$(this).addClass("checked");
								}
							});
						}
						if(posRelation&&posRelation.text){
							for ( var j = 0; j < paramArray.length; j++) {
								el("txtConfig_PosRelation_"+paramArray[j]).value = valueOf(posRelation.selectSingleNode(paramArray[j]), "text", "");
							} 
							$.each($(".jetsen-checkbox[name='chk_codetree_LeftContentTree']"), function(){
								if("111" == $(this).attr("value"))
								{
									$(this).addClass("checked");
								}
							});
						}
						if(unRelation&&unRelation.text){
							for ( var j = 0; j < unRelationParamArray.length; j++) {
								if(unRelationParamArray[j]=="UnRelation"){
									el("txtConfig_UnRelation_"+unRelationParamArray[j]+"_start").value = valueOf(unRelation.selectSingleNode("Min"), "text", "");
									el("txtConfig_UnRelation_"+unRelationParamArray[j]+"_end").value = valueOf(unRelation.selectSingleNode("Max"), "text", "");
								}else{
									el("txtConfig_UnRelation_"+unRelationParamArray[j]).value = valueOf(unRelation.selectSingleNode(unRelationParamArray[j]), "text", "");
								}
							} 
							$.each($(".jetsen-checkbox[name='chk_codetree_LeftContentTree']"), function(){
								if("112" == $(this).attr("value"))
								{
									$(this).addClass("checked");
								}
							});
						}
					}else{
						for ( var j = 0; j < paramArray.length; j++) {
							el("txtConfig_" + paramName + "_"+paramArray[j]).value = valueOf(audioChildNode.selectSingleNode(paramArray[j]), "text", "");
						} 
					}
					$.each($(".jetsen-checkbox[name='chk_codetree_LeftContentTree']"), function(){
						if(videoAudiosParamArray[i].id == $(this).attr("value")&&paramArray)
						{
							$(this).click();
						}
					});
				}
			}
		}
    }
}


/**
 * 生成视频计审菜单
 * @return
 */
function showVideoHtml(){
	var videoHtml = [];
	videoHtml.push('<div id="LeftContentTree" style="height:100%;width:185px;BORDER-RIGHT: #000000 1px solid;vertical-align:top;float:left;overflow-y:auto;"></div>');
	videoHtml.push('<div id="RightContent" style="height:100%;width:480px;float:left;"></div>');
	jQuery("#qualityContentDiv").append(videoHtml.join(''));
	var contenttree = showContentTree("LeftContentTree",videoAudiosParamArray);  //视音频检测左侧树
	contenttree.select("codetree_LeftContentTree-0-0");   //默认选中第一个节点
	for ( var i = 0; i < videoAudiosParamArray.length; i++) {
		showContentInfoTable(videoAudiosParamArray[i].id);
	}
	showContentInfoTable(videoAudiosParamArray[1].id);
}


function showMxfHtml(){
	var mxfHtml = [];
	mxfHtml.push('<div id="LeftMxfContentTree" style="height:100%;width:100%;BORDER-RIGHT: #000000 1px solid;vertical-align:top;float:left;overflow-y:auto;"></div>');
//	mxfHtml.push('<div id="RightMxfContent" style="height:100%;width:210px;float:left;"></div>');
	jQuery("#MxfContentDiv").append(mxfHtml.join(''));
	var contenttree = showContentTree("LeftMxfContentTree",mxfParamArray);  //mxf检测左侧树
	contenttree.select("codetree_LeftMxfContentTree-0-0");   //默认选中第一个节点
//	for ( var i = 0; i < mxfParamArray.length; i++) {
//		showContentInfoTable(mxfParamArray[i].id);
//	}
}


/**
 * 左侧树  obj存放  contentArray受控数组 showContentTree("LeftContentTree",videoAudiosParamArray)
 */ 
function showContentTree(obj,contentArray){ 
	var lefttree = new jetsennet.ui.Tree("codetree_"+obj); 
	for ( var i = 0; i < contentArray.length; i++) {
		if(contentArray[i].parentId=="-1"){
			var treeItem = new jetsennet.ui.TreeItem(contentArray[i].name,"javascript:selectControlContent(" + contentArray[i].id+","+contentArray[i].type+")");
            treeItem.fileIcon = 'fa';
            treeItem.openIcon = 'fa fa-minus';
            treeItem.closeIcon = 'fa fa-plus';
            treeItem.showCheck = true; 
            treeItem.checkValue = contentArray[i].id;  
            treeItem.isOpen = true;     
            if(contentArray[i].type=="10"||contentArray[i].type=="11"||contentArray[i].type=="12"||contentArray[i].type=="13"){
            	treeItem.checked = true;
            }
            lefttree.addItem(treeItem);
            buildContentTree(treeItem, contentArray, contentArray[i].id, contentArray[i].name);
		}
	}
	lefttree.render(obj);
	return lefttree;
}

function buildContentTree(treeItem, contentArray, parentId, pName){
	for (var i = 0; i < contentArray.length; i++) {
        if (contentArray[i].parentId == parentId) {
            var subTreeItem = new jetsennet.ui.TreeItem(contentArray[i].name,"javascript:selectControlContent(" + contentArray[i].id+","+contentArray[i].type+")");
            subTreeItem.fileIcon = 'fa';
            subTreeItem.openIcon = 'fa fa-minus';
            subTreeItem.closeIcon = 'fa fa-plus';
            subTreeItem.showCheck = true; 
            subTreeItem.checkValue = contentArray[i].id;  
            subTreeItem.isOpen = true;
            if(contentArray[i].enable&&contentArray[i].enable=="enable"){
            	subTreeItem.checked = true;
            }
            subTreeItem = buildContentTree(subTreeItem, contentArray, contentArray[i].id, contentArray[i].name);
            treeItem.addItem(subTreeItem);
        }
    }
    return treeItem;
}


function showContentInfoTable(id){
	var paramArray;
	var value = "";
	for ( var i = 0; i < videoAudiosParamArray.length; i++) {
		if(videoAudiosParamArray[i].id==id){
			value = videoAudiosParamArray[i].value;
			paramArray = videoAudiosParamArray[i].param;
		}
	}
	jQuery("#RightContent table").each(function(){
		if(this.id=="tab_Content_"+id){
			el("tab_Content_"+id).style.display = "";
		}else{
			el(this.id).style.display = "none";
		}
	});
	if(!paramArray){
		return;
	}
	if(el("tab_Content_"+id)){
		return;
	}
	var videoTdHtml = [];
	videoTdHtml.push('<table border="0" cellpadding="0" cellspacing="0" class="table-info" id="tab_Content_'+id+'" width="100%">');
	videoTdHtml.push('<colgroup>');
	videoTdHtml.push('<col width="140px;" />');
	videoTdHtml.push('<col width="auto" />');
	videoTdHtml.push('<col width="40px;" />');
	videoTdHtml.push('</colgroup>');
	if(paramArray){
		for ( var j = 0; j < paramArray.length; j++) {
			showVideoAutioContentHtml(paramArray[j],videoTdHtml,value);
		}
	}
	videoTdHtml.push('</table>');
	jQuery("#RightContent").append(videoTdHtml.join(''));
}


function showVideoAutioContentHtml(item,videoTdHtml,videoType){
	for ( var i = 0; i < videoAudiosIdParamArray.length; i++) {
		if(item==videoAudiosIdParamArray[i].name){
			var value = videoAudiosIdParamArray[i].defaultValue?videoAudiosIdParamArray[i].defaultValue:"";//默认值
			var validateTypeStr = "";
			var minvalue = "";
			var maxvalue = "";
			var validateType = "";
			var unit = "";
			var showName = videoAudiosIdParamArray[i].showName;
			if(videoAudiosIdParamArray[i].maxValue){
				validateTypeStr += ",maxvalue";
				maxvalue = 'maxvalue='+videoAudiosIdParamArray[i].maxValue+'';
			}
			if(videoAudiosIdParamArray[i].minValue){
				validateTypeStr += ",minvalue";
				minvalue = 'minvalue='+videoAudiosIdParamArray[i].minValue+'';
			}
			if(videoAudiosIdParamArray[i].unit){
				unit = ''+videoAudiosIdParamArray[i].unit+'';
			}
			if(validateTypeStr){
				validateType = 'validatetype = NotEmpty,Int'+validateTypeStr+'';
			}
			if(videoAudiosIdParamArray[i].name == "Percent"||videoAudiosIdParamArray[i].name=="NegRelation"||videoAudiosIdParamArray[i].name=="UnRelation"){
				validateType = 'validatetype = NotEmpty,money'+validateTypeStr+'';
			}
			if(videoType=="StaticFrame"){
				if(videoAudiosIdParamArray[i].name=="Percent"){
					maxvalue = 'maxvalue=100';
					minvalue = 'minvalue=99.5';
					value = "99.6";
				}else if(videoAudiosIdParamArray[i].name=="Duration"){
					maxvalue = 'maxvalue=100';
					minvalue = 'minvalue=2';
					value = "25";
				}
			}
			if(videoType=="Aspect"){
				if(videoAudiosIdParamArray[i].name=="Percent"){
					value = "99.6";
				}
			}
			if(videoType=="WhiteLevel"){
				if(videoAudiosIdParamArray[i].name=="Y"){
					value = "600";
				}
			}
			if(videoType=="MixFrame"){
				if(videoAudiosIdParamArray[i].name=="Duration"){
					value = "5";
				}
			}
			if(videoType=="YUV"||videoType=="RGB"){
				if(videoAudiosIdParamArray[i].name=="Percent"){
					maxvalue = 'maxvalue=2.0';
					minvalue = 'minvalue=0.1';
					value = "1";
				}
			}
            //音频
			if(videoType=="Silence"){
				if(videoAudiosIdParamArray[i].name=="Duration"){
					maxvalue = 'maxvalue=200';
					minvalue = 'minvalue=1';
					value = "125";
				}
			}
			if(videoType=="ShtLoudness"||videoType=="MomLoudness"){
				if(videoAudiosIdParamArray[i].name=="Duration"){
					maxvalue = 'maxvalue=200';
					minvalue = 'minvalue=25';
					value = "75";
				}
			}
			if(videoType=="InvertPhase"||videoType=="NegRelation"||videoType=="PosRelation"||videoType=="UnRelation"){
				if(videoAudiosIdParamArray[i].name=="Duration"){
					maxvalue = 'maxvalue=200';
					minvalue = 'minvalue=25';
					value = "25";
				}
			}
			if(videoType=="SamePhase"){
				if(videoAudiosIdParamArray[i].name=="Percent"){
					maxvalue = 'maxvalue=100';
					minvalue = 'minvalue=95';
					value = "98.3";
				}
			}
			if(videoType=="PosRelation"){
				if(videoAudiosIdParamArray[i].name=="Threshold"){
					value = "0.9";
				}
			}
			if(videoType=="PeakLevel"&&videoAudiosIdParamArray[i].name=="Level"){
				showName = "峰值阀值";
				maxvalue = 'maxvalue=-6';
				minvalue = 'minvalue=-10';
				value = "-6";
				unit = "dBFS";
			}
			if(videoType=="TruePeakLevel"&&videoAudiosIdParamArray[i].name=="Level"){
				showName = "真峰值阀值";
				maxvalue = 'maxvalue=-2';
				minvalue = 'minvalue=-10';
				value = "-2";
				unit = "dBTP";
			}
			if((videoType=="MomLoudness"||videoType=="ShtLoudness")&&videoAudiosIdParamArray[i].name=="Level"){
				showName = "响度阈值";
				maxvalue = 'maxvalue=-20';
				minvalue = 'minvalue=-26';
				value = "-21";
				unit = "LKFS";
			}
			var str = (minvalue + "~" + maxvalue).replace("minvalue=", "").replace("maxvalue=", "");
			var title = 'title='+str+'';
			
			videoTdHtml.push('<tr><td><label class="control-label">'+showName+':</label></td>');
			videoTdHtml.push('<td>');
			if(videoAudiosIdParamArray[i].type=="input"){
				videoTdHtml.push('<div class="input-group input-group-sm"><input id="txtConfig_' + videoType + '_'+item+'" type="text" value="'+value+'" '+validateType+' '+minvalue+' '+maxvalue+' '+title+'  class="form-control input-sm"/><span class="input-group-addon" style="color: Red">*</span></div>');
			}else if(videoAudiosIdParamArray[i].type=="range"){
				var defaultValues = videoAudiosIdParamArray[i].defaultValue;
				videoTdHtml.push('<input id="txtConfig_' + videoType + '_'+item+'_start" type="text" value="'+defaultValues.split(",")[0]+'" '+validateType+' '+minvalue+' '+maxvalue+' '+title+' class="form-control input-sm" style="width:137px;"/>');
				videoTdHtml.push('<span style="float:left;vertical-align: middle;">&nbsp;--&nbsp;</span>');
				videoTdHtml.push('<input id="txtConfig_' + videoType + '_'+item+'_end" type="text" value="'+defaultValues.split(",")[1]+'" '+validateType+' '+minvalue+' '+maxvalue+' '+title+' class="form-control input-sm" style="width:137px;"/>');
			}
			videoTdHtml.push('</td><td>'+unit+'</td></tr>');
		}
	}
}


function selectControlContent(treeId,type){
	//视音频检测
	if(type=="1"||type=="2"){
		showContentInfoTable(treeId);
	}else{
		//Mxf检测 
		
	}
}


function saveMxfCheck(paramXmlArray){
	paramXmlArray.push('<MXFCheck version="1.0">');
	var checkL = $(".jetsen-checkbox.checked[name='chk_codetree_LeftMxfContentTree']");
	paramXmlArray.push('<FileFormatCheck>');
	if(checkL.length>0){
		var HeaderMetaDataSetStrArr = [];
		for ( var i = 0; i < mxfParamArray.length; i++) {
			$.each(checkL, function(){
				var paramId = $(this).attr("value");
				if(mxfParamArray[i].type=="10"&&paramId==mxfParamArray[i].id&&mxfParamArray[i].parentId=="0"&&mxfParamArray[i].value!="HeaderMetaDataSet"){
					paramXmlArray.push(jetsennet.xml.serialize("",mxfParamArray[i].value));
				}
				if(mxfParamArray[i].type=="10"&&paramId==mxfParamArray[i].id&&mxfParamArray[i].parentId=="36"){
					HeaderMetaDataSetStrArr.push(mxfParamArray[i].value);
				}
				if(mxfParamArray[i].type=="10"&&paramId==mxfParamArray[i].id&&mxfParamArray[i].parentId=="0"&&mxfParamArray[i].value=="HeaderMetaDataSet"){
					var list = {};
					for ( var k = 0; k < HeaderMetaDataSetStrArr.length; k++) {
						list[HeaderMetaDataSetStrArr[k]] = "";
					}
					paramXmlArray.push(jetsennet.xml.serialize(list,mxfParamArray[i].value));
				}
			});
		}
	}
	paramXmlArray.push('</FileFormatCheck>');
	paramXmlArray.push('<CodecCheck>');
	if(checkL.length>0){
		paramXmlArray.push('<DNxHD>');
		$.each(checkL, function(){
			var paramId = $(this).attr("value");
			for ( var i = 0; i < mxfParamArray.length; i++) {
				if(mxfParamArray[i].type=="11"&&paramId==mxfParamArray[i].id&&mxfParamArray[i].parentId=="200"){
					paramXmlArray.push(jetsennet.xml.serialize("",mxfParamArray[i].value));
					break;
				}
			}
		});
		paramXmlArray.push('</DNxHD>');
		paramXmlArray.push('<AVCIntra>');
		$.each(checkL, function(){
			var paramId = $(this).attr("value");
			for ( var i = 0; i < mxfParamArray.length; i++) {
				if(mxfParamArray[i].type=="12"&&paramId==mxfParamArray[i].id&&mxfParamArray[i].parentId=="300"){
					paramXmlArray.push(jetsennet.xml.serialize("",mxfParamArray[i].value));
					break;
				}
			}
		});
		paramXmlArray.push('</AVCIntra>');
		paramXmlArray.push('<Mpeg2LongGop>');
		$.each(checkL, function(){
			var paramId = $(this).attr("value");
			for ( var i = 0; i < mxfParamArray.length; i++) {
				if(mxfParamArray[i].type=="13"&&paramId==mxfParamArray[i].id&&mxfParamArray[i].parentId=="500"){
					paramXmlArray.push(jetsennet.xml.serialize("",mxfParamArray[i].value));
					break;
				}
			}
		});
		paramXmlArray.push('</Mpeg2LongGop>');
	}
	paramXmlArray.push('</CodecCheck>');
	paramXmlArray.push('</MXFCheck>');
}

function saveQualityCheck(paramXmlArray){
	paramXmlArray.push('<QualityCheck version="1.0">');
	var checkL = $(".jetsen-checkbox.checked[name='chk_codetree_LeftContentTree']");
	//视频param
	paramXmlArray.push('<Video bottom="0" left="0" right="0" top="0">');
	var levelArray = [];   //电平
	var loudnessArray = [];  //响度
	var stereoCorrelationArray = []; //立体声相位
	var stereoRelationArray = []; //相关性
	if(checkL.length>0){
		$.each(checkL, function(){
			var paramId = $(this).attr("value");
			for ( var i = 0; i < videoAudiosParamArray.length; i++) {
				if(videoAudiosParamArray[i].type=="1"&&videoAudiosParamArray[i].param){
					if(paramId==videoAudiosParamArray[i].id){
						var paramName = videoAudiosParamArray[i].value;
						var paramArray = videoAudiosParamArray[i].param;
						//幅型
						if(paramName=="Aspect"){
							var Aspectlist = {};
							for ( var j = 0; j < paramArray.length; j++) {
								if(paramArray[j]!="Percent"){
									Aspectlist[paramArray[j]] = el("txtConfig_" + paramName + "_"+paramArray[j])?el("txtConfig_" + paramName + "_"+paramArray[j]).value:"0";
								}else{
									Aspectlist["UpBotP"] = el("txtConfig_" + paramName + "_"+paramArray[j]).value;
									Aspectlist["LeftRightP"] = el("txtConfig_" + paramName + "_"+paramArray[j]).value;
								}
							}
							paramXmlArray.push(jetsennet.xml.serialize({ AspectAll:[Aspectlist] , AspectNafd:[Aspectlist] , AspectAfd:[Aspectlist]},paramName));
							break;
						}
						//YUV
						if(paramName=="YUV"){
							var ylist = {};
							var uvlist = {};
							for ( var j = 0; j < paramArray.length; j++) {
								if(paramArray[j]=="Y_Bit8"){
									ylist["MinBit8"] = el("txtConfig_" + paramName + "_"+paramArray[j]+"_start").value;
									ylist["MaxBit8"] = el("txtConfig_" + paramName + "_"+paramArray[j]+"_end").value;
								}else if(paramArray[j]=="UV_Bit8"){
									uvlist["MinBit8"] = el("txtConfig_" + paramName + "_"+paramArray[j]+"_start").value;
									uvlist["MaxBit8"] = el("txtConfig_" + paramName + "_"+paramArray[j]+"_end").value;
								}else if(paramArray[j]=="Y_Bit10"){
									ylist["MinBit10"] = el("txtConfig_" + paramName + "_"+paramArray[j]+"_start").value;
									ylist["MaxBit10"] = el("txtConfig_" + paramName + "_"+paramArray[j]+"_end").value;
								}else if(paramArray[j]=="UV_Bit10"){
									uvlist["MinBit10"] = el("txtConfig_" + paramName + "_"+paramArray[j]+"_start").value;
									uvlist["MaxBit10"] = el("txtConfig_" + paramName + "_"+paramArray[j]+"_end").value;
								}else{
									ylist[paramArray[j]] = el("txtConfig_" + paramName + "_"+paramArray[j])?el("txtConfig_" + paramName + "_"+paramArray[j]).value:"0";
									uvlist[paramArray[j]] = el("txtConfig_" + paramName + "_"+paramArray[j])?el("txtConfig_" + paramName + "_"+paramArray[j]).value:"0";
								}
							}
							paramXmlArray.push(jetsennet.xml.serialize({ "Y":[ylist] , "UV":[uvlist]},paramName));
							break;
						}
						//RGB
						if(paramName=="RGB"){
							var rgblist = {};
							for ( var j = 0; j < paramArray.length; j++) {
								if(paramArray[j]=="RGB_Bit8"){
									rgblist["MinBit8"] = el("txtConfig_" + paramName + "_"+paramArray[j]+"_start").value;
									rgblist["MaxBit8"] = el("txtConfig_" + paramName + "_"+paramArray[j]+"_end").value;
								}else if(paramArray[j]=="RGB_Bit10"){
									rgblist["MinBit10"] = el("txtConfig_" + paramName + "_"+paramArray[j]+"_start").value;
									rgblist["MaxBit10"] = el("txtConfig_" + paramName + "_"+paramArray[j]+"_end").value;
								}else{
									rgblist[paramArray[j]] = el("txtConfig_" + paramName + "_"+paramArray[j])?el("txtConfig_" + paramName + "_"+paramArray[j]).value:"0";
								}
							}
							paramXmlArray.push(jetsennet.xml.serialize(rgblist,paramName));
							break;
						}
						//Level
						if(paramName=="WhiteLevel"){ 
							var whitelist = {};
							for ( var j = 0; j < paramArray.length; j++) {
								whitelist[paramArray[j]] = el("txtConfig_" + paramName + "_"+paramArray[j])?el("txtConfig_" + paramName + "_"+paramArray[j]).value:"0";
							} 
							levelArray.push(jetsennet.xml.serialize(whitelist,paramName));
							break;
						}
						if(paramName=="BlackLevel"){
							var blacklist = {};
							for ( var j = 0; j < paramArray.length; j++) {
								blacklist[paramArray[j]] = el("txtConfig_" + paramName + "_"+paramArray[j])?el("txtConfig_" + paramName + "_"+paramArray[j]).value:"0";
							} 
							jetsennet.xml.serialize(blacklist,paramName);
							levelArray.push(jetsennet.xml.serialize(blacklist,paramName));
							break;
						}
						var list = {};
						for ( var j = 0; j < paramArray.length; j++) {
							list[paramArray[j]] = el("txtConfig_" + paramName + "_"+paramArray[j])?el("txtConfig_" + paramName + "_"+paramArray[j]).value:"0";
						} 
						paramXmlArray.push(jetsennet.xml.serialize(list,paramName));
						break;
					}
				}
			}
		});
		if(levelArray.length>0){
			paramXmlArray.push("<Level>");
			for ( var i = 0; i < levelArray.length; i++) {
				paramXmlArray.push(levelArray[i]);
			}
			paramXmlArray.push("</Level>");
		}
	}
	paramXmlArray.push('</Video>');
	//音频
	paramXmlArray.push('<Audio>');
	if(checkL.length>0){
		$.each(checkL, function(){
			var paramId = $(this).attr("value");
			for ( var i = 0; i < videoAudiosParamArray.length; i++) {
				if(videoAudiosParamArray[i].type=="2"&&videoAudiosParamArray[i].param){
					if(paramId==videoAudiosParamArray[i].id){
						var paramName = videoAudiosParamArray[i].value;
						var paramArray = videoAudiosParamArray[i].param;
						if(paramName=="AvgLoudness"){
							var avglist = {};
							for ( var j = 0; j < paramArray.length; j++) {
								if(paramArray[j]=="AvgLoudness"){
									avglist["Min"] = el("txtConfig_" + paramName + "_"+paramArray[j]+"_start").value;
									avglist["Max"] = el("txtConfig_" + paramName + "_"+paramArray[j]+"_end").value;
								}else{
									avglist[paramArray[j]] = el("txtConfig_" + paramName + "_"+paramArray[j])?el("txtConfig_" + paramName + "_"+paramArray[j]).value:"0";
								}
							}
							loudnessArray.push(jetsennet.xml.serialize(avglist,paramName));
							break;
						}
						if(paramName=="ShtLoudness"||paramName=="MomLoudness"){
							var shtlist = {};
							for ( var j = 0; j < paramArray.length; j++) {
								shtlist[paramArray[j]] = el("txtConfig_" + paramName + "_"+paramArray[j])?el("txtConfig_" + paramName + "_"+paramArray[j]).value:"0";
							} 
							loudnessArray.push(jetsennet.xml.serialize(shtlist,paramName));
							break;
						}
						if(paramName=="InvertPhase"||paramName=="SamePhase"){
							var list = {};
							for ( var j = 0; j < paramArray.length; j++) {
								list[paramArray[j]] = el("txtConfig_" + paramName + "_"+paramArray[j])?el("txtConfig_" + paramName + "_"+paramArray[j]).value:"0";
							} 
							stereoCorrelationArray.push(jetsennet.xml.serialize(list,paramName));
							break;
						}
						if(paramName=="UnRelation"){
							var unlist = {};
							for ( var j = 0; j < paramArray.length; j++) {
								if(paramArray[j]=="UnRelation"){
									unlist["Min"] = el("txtConfig_" + paramName + "_"+paramArray[j]+"_start").value;
									unlist["Max"] = el("txtConfig_" + paramName + "_"+paramArray[j]+"_end").value;
								}else{
									unlist[paramArray[j]] = el("txtConfig_" + paramName + "_"+paramArray[j])?el("txtConfig_" + paramName + "_"+paramArray[j]).value:"0";
								}
							}
							stereoRelationArray.push(jetsennet.xml.serialize(unlist,paramName));
							break;
						}
						if(paramName=="NegRelation"||paramName=="PosRelation"){
							var list = {};
							for ( var j = 0; j < paramArray.length; j++) {
								list[paramArray[j]] = el("txtConfig_" + paramName + "_"+paramArray[j])?el("txtConfig_" + paramName + "_"+paramArray[j]).value:"0";
							} 
							stereoRelationArray.push(jetsennet.xml.serialize(list,paramName));
							break;
						}
						var list = {};
						for ( var j = 0; j < paramArray.length; j++) {
							list[paramArray[j]] = el("txtConfig_" + paramName + "_"+paramArray[j])?el("txtConfig_" + paramName + "_"+paramArray[j]).value:"0";
						} 
						paramXmlArray.push(jetsennet.xml.serialize(list,paramName));
						break;
					}
				}
			}
		});
		if(loudnessArray.length>0){
			paramXmlArray.push("<Loudness>");
			for ( var i = 0; i < loudnessArray.length; i++) {
				paramXmlArray.push(loudnessArray[i]);
			}
			paramXmlArray.push("</Loudness>");
		}
		if(stereoCorrelationArray.length>0){
			paramXmlArray.push("<StereoCorrelation>");
			for ( var i = 0; i < stereoCorrelationArray.length; i++) {
				paramXmlArray.push(stereoCorrelationArray[i]);
			}
			paramXmlArray.push("</StereoCorrelation>");
		}
		if(stereoRelationArray.length>0){
			paramXmlArray.push("<StereoRelation>");
			for ( var i = 0; i < stereoRelationArray.length; i++) {
				paramXmlArray.push(stereoRelationArray[i]);
			}
			paramXmlArray.push("</StereoRelation>");
		}
	}
	paramXmlArray.push('</Audio>');
	paramXmlArray.push('</QualityCheck>');
}

/**
 * 保存模板内容
 */
function saveAutoQcTemplate(node,type){
	var flag = false;
	var areaElements = jetsennet.form.getElements('mypage');
	if (jetsennet.form.validate(areaElements, true)) {
		var param = new HashMap();
		var temInfo = getTemParamData();
		param.put("procactId", node.nodeParam.id);
		param.put("templateData", temInfo);
		param.put("templateName", el("txtConfigtemplateName").value);
	    var sResult = WFMDAO.execute("saveTemplate", param);
	    if(sResult.errorCode==0){
	    	node.nodeParam.id = sResult.resultVal;
	    	templateContent = temInfo;
	    	if(!type){
	    		jetsennet.alert("保存模板成功！");
	    	}
	    	initQcTemplateName();  //重新加载下拉
	    	initQcTemplateName(node.nodeParam.id);  //给下拉框赋值
	    	flag = true;
	    }
	}
	return flag;
}


/**
 * 得到配置的模板内容
 * @returns
 */
function getTemParamData(){
	var paramXmlArray = [];
	paramXmlArray.push('<CheckTemplates version="1.0">');
	saveMxfCheck(paramXmlArray);
	saveQualityCheck(paramXmlArray);
	paramXmlArray.push('</CheckTemplates>');
	return paramXmlArray.join('');
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
    return jetsennet.xml.serialize(params, "param");
}
