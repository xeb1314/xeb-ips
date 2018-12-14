var gActivityControl = {}; //存放控件id，类型
//加载节点配置项=======================================================================
function loadActivityItems(node) {
    jetsennet.request(jetsennet.appPath + "../../wfmsystem", { command: "getActConfig", fileName: "activity_" + node.nodeParam.actId + ".xml" },
	function (result) {
	    var objs = jQuery.parseJSON(result).Record;
	    showActivityItems(objs, node);
	},
	function (ex) { jetsennet.error(ex); }, { async: false });
}

//组装配置项=======================================================================
function renderActivityItems(objs) {
    gActivityControl = {}; //清空
    jQuery('#divActivityBoby').html('');
    var activityBodyHTML = [];
    //div
    for (var i in objs) {
        //一个div下放一个table
        var divId = 'ac_div' + i;
        activityBodyHTML.push('<div id="' + divId + '">');
        activityBodyHTML.push('<table id="' + divId + '_table" border="0" cellpadding="0" cellspacing="0" class="table-info"');
        activityBodyHTML.push('<colgroup><col class="width-5w" /><col width="200px" /><col class="width-6w" /><col width="auto" /></colgroup>');
        var trList = objs[i];
        //一个div下所有行
        for (var j in trList) {
            //一行放两个控件
            var trId = divId + '_tr_' + j;
            activityBodyHTML.push('<tr id="' + trId + '">');
            var itemList = trList[j];
            for (var k in itemList) {
                var item = itemList[k];
                var chineseName = valueOf(item, 'chineseName', '');
                var englishName = valueOf(item, 'englishName', '');
                var display = valueOf(item, 'display', '');
                var type = valueOf(item, 'type', '');
                gActivityControl[englishName] = type;

                //一个控件的情况合并后面的列
                if (itemList.length == 1) {
                    if (display == 'true') {
                        activityBodyHTML.push('<td class="field-head"><span id="name_span_' + englishName + '">' + chineseName + '：</span></td>');
                        activityBodyHTML.push('<td colspan="3"><span id="ctrl_span_' + englishName + '">' + getFormControl(item) + '</span></td>');
                    }
                    else {
                        activityBodyHTML.push('<td class="field-head"><span style="display:none;" id="name_span_' + englishName + '">' + chineseName + '：</span></td>');
                        activityBodyHTML.push('<td colspan="3"><span style="display:none;" id="ctrl_span_' + englishName + '">' + getFormControl(item) + '</span></td>');
                    }

                }
                else {
                    if (display == 'true') {
                        activityBodyHTML.push('<td class="field-head"><span id="name_span_' + englishName + '">' + chineseName + '：</span></td>');
                        activityBodyHTML.push('<td><span id="ctrl_span_' + englishName + '">' + getFormControl(item) + '</span></td>');
                    }
                    else {
                        activityBodyHTML.push('<td class="field-head"><span style="display:none;" id="name_span_' + englishName + '">' + chineseName + '：</span></td>');
                        activityBodyHTML.push('<td><span style="display:none;" id="ctrl_span_' + englishName + '">' + getFormControl(item) + '</span></td>');
                    }

                }
            }

            activityBodyHTML.push('</tr>');
        }
        activityBodyHTML.push('</table>');
        activityBodyHTML.push('</div>');
    }

    jQuery('#divActivityBoby').html(activityBodyHTML.join(''));
}
//获取控件html
function getFormControl(item) {
    var chineseName = valueOf(item, 'chineseName', '');
    var englishName = valueOf(item, 'englishName', '');
    var type = valueOf(item, 'type', '');
    var cssClass = valueOf(item, 'cssClass', '');
    var readonly = valueOf(item, 'readonly', '');
    var defaultValue = valueOf(item, 'defaultValue', '');
    var initData = item.initData;
    var validate = item.validate;
    var _event = item.event;

    if (type == 'text') {
        return getTextControl(englishName, validate, defaultValue, readonly, _event, cssClass);
    }
    else if (type == 'password') {
        return getPasswordControl(englishName, validate, defaultValue, readonly, cssClass);
    }
    else if (type == 'select') {
        return getSelectControl(englishName, initData, defaultValue, _event, cssClass);
    }
    else if (type == 'file') {
        return getFileControl(englishName, validate, defaultValue, _event, readonly, cssClass);
    }
    else if (type == 'button') {
        return getButtonControl(englishName, chineseName, _event, cssClass);
    }
    else if (type == 'checkbox') {
        return getCheckboxControl(englishName, initData, defaultValue, _event, cssClass);
    }
    else if (type == 'radio') {
        return getRadioControl(englishName, initData, defaultValue, _event, cssClass);
    }
    else if (type == 'textarea') {
        return getTextareaControl(englishName, validate, defaultValue, readonly, cssClass);
    }
    else if (type == 'hidden') {
        return getHiddenControl(englishName, validate, defaultValue);
    }
}
function getCssClass(defaultCss, newCssClass) {
    return (newCssClass == undefined || newCssClass == '') ? defaultCss : newCssClass;
}
//text=======================================================================
function getTextControl(englishName, validate, defaultValue, readonly, _event, cssClass) {
    var control = '<input id="' + englishName + '" type="text" class="' + getCssClass("input2", cssClass) + '"';
    control = control + getValidateType(validate);
    control = control + ' value="' + defaultValue + '" ' + getReadonly(readonly) + addEvents(_event) + '/>';
    return control;
}
//password=======================================================================
function getPasswordControl(englishName, validate, defaultValue, readonly, cssClass) {
    var control = '<input id="' + englishName + '" type="password" class="' + getCssClass("input2", cssClass) + '"';
    control = control + getValidateType(validate);
    control = control + ' value="' + defaultValue + '" ' + getReadonly(readonly) + '/>';
    return control;
}
//file=======================================================================
function getFileControl(englishName, validate, defaultValue, _event, readonly, cssClass) {
    var control = '<input id="' + englishName + '" type="file" class="' + getCssClass("file", cssClass) + '"';
    control = control + getValidateType(validate);
    control = control + ' value="' + defaultValue + '" ' + getReadonly(readonly) + addEvents(_event) + '/>';
    return control;
}
//button=======================================================================
function getButtonControl(englishName, chineseName, _event, cssClass) {
    var control = '<input id="' + englishName + '" type="button" class="' + getCssClass("", cssClass) + '"';
    control = control + ' value="' + chineseName + '"' + addEvents(_event) + '/>';
    return control;
}
//textarea=======================================================================
function getTextareaControl(englishName, validate, defaultValue, readonly, cssClass) {
    var control = '<textarea id="' + englishName + '" class="' + getCssClass("textarea2", cssClass) + '"';
    control = control + getValidateType(validate);
    control = control + ' value="' + defaultValue + '" ' + getReadonly(readonly) + '/>';
    return control;
}
//hidden=======================================================================
function getHiddenControl(englishName, validate, defaultValue) {
    var control = '<input id="' + englishName + '" type="hidden"';
    control = control + getValidateType(validate);
    control = control + ' value="' + defaultValue + '"/>';
    return control
}
//radio=======================================================================
function getRadioControl(englishName, initData, defaultValue, _event) {
    var control = [];

    for (var i in initData) {
        var optionName = valueOf(initData[i], 'text', '');
        var optionValue = valueOf(initData[i], 'value', '');
        if (defaultValue == optionValue) {
            control.push('<input type="radio" checked="checked" name="' + englishName + '" value="' + optionValue + '" ' + addEvents(_event) + '>&nbsp;' + optionName + '&nbsp;&nbsp;&nbsp;');
        }
        else {
            control.push('<input type="radio" name="' + englishName + '" value="' + optionValue + '" ' + addEvents(_event) + '>&nbsp;' + optionName + '&nbsp;&nbsp;&nbsp;');
        }

    }

    return control.join('');
}
//checkbox=======================================================================
function getCheckboxControl(englishName, initData, defaultValue, _event) {
    var control = [];

    for (var i in initData) {
        var optionName = valueOf(initData[i], 'text', '');
        var optionValue = valueOf(initData[i], 'value', '');
        if (defaultValue == optionValue) {
            control.push('<input type="checkbox" checked="checked" name="' + englishName + '" value="' + optionValue + '" ' + addEvents(_event) + '>&nbsp;' + optionName + '&nbsp;&nbsp;&nbsp;');
        }
        else {
            control.push('<input type="checkbox" name="' + englishName + '" value="' + optionValue + '" ' + addEvents(_event) + '>&nbsp;' + optionName + '&nbsp;&nbsp;&nbsp;');
        }
    }

    return control.join('');
}
//select=============================================================
function getSelectControl(englishName, initData, defaultValue, _event, cssClass) {
    var control = [];
    control.push('<select id="' + englishName + '" class="' + getCssClass("_select", cssClass) + '"' + addEvents(_event) + '>');
    for (var i in initData) {
        var optionName = valueOf(initData[i], 'text', '');
        var optionValue = valueOf(initData[i], 'value', '');
        if (defaultValue == optionValue) {
            control.push('<option selected="selected" value="' + optionValue + '">' + optionName + '</option>');
        }
        else {
            control.push('<option value="' + optionValue + '">' + optionName + '</option>');
        }

    }
    control.push('</select>');
    return control.join('');
}
//readonly============================================================================
function getReadonly(readonly) {
    if (readonly == 'true') {
        return 'readonly="readonly"';
    }
    else {
        return '';
    }
}
//添加事件=======================================================================
function addEvents(_event) {
    var eventArr = [];
    for (var i in _event) {
        var eventName = valueOf(_event[i], 'text', '');
        var functionStr = valueOf(_event[i], 'value', '');
        var functionName = 'fn_' + eventName;
        //为控件注册事件
        eventArr.push(eventName + '="javascript:' + functionName + '();" ');
        //动态添加事件代码
        var functionStr = 'function ' + functionName + '(){' + functionStr + '}';
        try {
            jetsennet.eval(functionStr, "JavaScript");
        }
        catch (e) {
            alert('控件事件注册失败，请使用ie浏览器查看!');
            return;
        }
    }
    return eventArr.join('');
}
//处理验证类型=======================================================================
function getValidateType(validate) {
    var validatetype = ' validatetype="';
    var empty = true; //允许空
    var types = []; //放所有验证类型
    var values = []; //放相关默认值
    for (var i in validate) {
        var text = valueOf(validate[i], 'text', '');
        var value = valueOf(validate[i], 'value', '');
        if (text == 'notempty') {
            empty = false;
        }
        else if (text == 'maxlength') {
            if (value != '') {
                values.push(' maxlength="' + value + '" ');
            }
        }
        else if (text == 'minlength') {
            if (value != '') {
                values.push(' minlength="' + value + '" ');
            }
        }
        else if (text == 'maxvalue') {
            if (value != '') {
                values.push(' maxvalue="' + value + '" ');
            }
        }
        else if (text == 'minvalue') {
            if (value != '') {
                values.push(' minvalue="' + value + '" ');
            }
        }

        types.push(text + ',');
    }
    types = types.join('');
    types = types.substring(0, types.length - 1);
    validatetype = validatetype + types + '" ' + values;

    return validatetype;
}
//参数配置=======================================================================
function showActivityItems(objs, node) {
    //渲染配置项
    renderActivityItems(objs);

    //赋值
    setItemValue(node.nodeParam);

    var areaElements = jetsennet.form.getElements('divActivity');
    jetsennet.form.clearValidateState(areaElements);
    var dialog = new jetsennet.ui.Window("new-object-activity");
    jQuery.extend(dialog, { submitBox: true, cancelBox: true, windowStyle: 1, maximizeBox: false, minimizeBox: false, size: { width: 660, height: 0 }, showScroll: false, title: "参数配置" });
    dialog.controls = ["divActivity"];
    dialog.onsubmit = function () {
        if (jetsennet.validate(areaElements, true)) {
            /**重命名*/
            var actName = el('txt_ActNodeName').value.trim();
            if (actName != "") {
                node.setNodeName(actName);

                //如果是已使用的流程，直接更新名称
                if (!editable) {
                    jetsennet.request(
	                		jetsennet.appPath + "../../wfmsystem",
	            	    	{ command: "update", objType: "WFM_PROCACT_NAME", objXml: jetsennet.xml.serialize({ PROCACT_ID: flowInfo.dbId, PROCACT_NAME: flowInfo.text.attr("text") }, "Request") },
	            			function (result) {
	            			},
	            		    function (ex) { jetsennet.error(ex); },
	            		    { async: false }
	            	);
                }
            }

            //获取值
            getItemValue(node.nodeParam);

            //如果是已使用的流程，直接更新名称
            if (!editable) {
                jetsennet.request(
	            		jetsennet.appPath + "../../wfmsystem",
	        	    	{ command: "update", objType: "WFM_PROCACT_PARAM", objXml: jetsennet.xml.serialize({ PROCACT_ID: flowInfo.dbId, ACT_PARAM: flowInfo.param }, "ActParam") },
	        			function (result) {
	        			},
	        		    function (ex) { jetsennet.error(ex); },
	        		    { async: false }
	        	);
            }

            jetsennet.message("保存成功");
            dialog.close();
        }
    };
    dialog.showDialog();

}
//获取配置项值=======================================================================
function getItemValue(nodeParam) {
    var objs = {};
    jQuery.each(gActivityControl, function (id) {
        var type = gActivityControl[id];

        if (type == 'text' || type == 'password' || type == 'textarea' || type == 'file' || type == 'hidden') {
            objs[id] = el(id).value;
        }
        else if (type == 'select') {
            objs[id] = $('#' + id + ' option:selected').val();
        }
        else if (type == 'checkbox' || type == 'radio') {
            var checkValue = '';
            $('input[name=' + id + ']').each(function () {
                if (this.checked) {
                    checkValue += this.value + ',';
                }
            });
            objs[id] = checkValue.substring(0, checkValue.lastIndexOf(','));

        }

    });
    //迁移
    if (nodeParam.actId == "501") {
        var execMode = document.getElementsByName("ExecMode")[0].checked ? 10 : 0;
        objs['ExecMode'] = execMode;
    }

    nodeParam.parameter = jetsennet.xml.serialize(objs, 'param');
}
//为配置项设置具体的值=======================================================================
function setItemValue(nodeParam) {
    /**配置参数*/
    var paramString = valueOf(nodeParam, "parameter", "");

    if (paramString == '') {
        el('txt_ActNodeName').value = '';
        return;
    }

    var paramDoc = new jetsennet.XmlDoc();
    paramDoc.loadXML(paramString);

    /**节点名称*/
    el('txt_ActNodeName').value = nodeParam.name;

    jQuery.each(gActivityControl, function (id) {
        var type = gActivityControl[id];

        if (type == 'text' || type == 'password' || type == 'textarea' || type == 'file' || type == 'hidden') {
            el(id).value = valueOf(paramDoc.selectSingleNode("Record/" + id + ""), "text", "");
        }
        else if (type == 'select') {
            $('#' + id + ' option').each(function () {
                if (this.value == valueOf(paramDoc.selectSingleNode("Record/" + id + ""), "text", "")) {
                    this.selected = true;
                }
            });
        }
        else if (type == 'checkbox' || type == 'radio') {
            var chkValue = valueOf(paramDoc.selectSingleNode("Record/" + id + ""), "text", "");
            chkValue = chkValue.split(',');
            var chkObj = {};
            jQuery.each(chkValue, function (i, value) {
                chkObj[value] = value;
            });
            $('input[name=' + id + ']').each(function () {
                if (chkObj[this.value]) {

                    this.click();
                    this.checked = true;
                }
                else {
                    this.checked = false;
                }
            });
        }
    });
}