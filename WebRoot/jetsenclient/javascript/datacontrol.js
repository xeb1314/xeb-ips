/**
数据控件，基类
*/
jetsennet.ui.BaseControl = function (control, xdata) {
    this.control = control;
    this.xdata = xdata;
    this.config = {};
};
/**
设置控件缺省值
*/
jetsennet.ui.BaseControl.prototype.setDefaultValue = function () {
    var controlValue = this.control.value;

    if (jetsennet.util.isNullOrEmpty(controlValue)) {
        var initValue = this.control.getAttribute("default");

        if (!jetsennet.util.isNullOrEmpty(initValue)) {

            if (initValue == "SYS_DATE") {
                this.control.value = new Date().toDateString();
            }
            else if (initValue == "SYS_TIME") {
                this.control.value = new Date().toTimeString();
            }
            else if (initValue == "CURRENT_USER") {
                this.control.value = valueOf(jetsennet.Application.userInfo, "UserName", "");
            }
            else if (initValue == "CURRENT_USERID") {
                this.control.value = valueOf(jetsennet.Application.userInfo, "UserId", "");
            }
            else if (initValue == "SYS_DATETIME") {
                this.control.value = new Date().toDateTimeString();
            }
            else {
                this.control.value = initValue;
            }

            xd_setFieldValue(sControl, sControl.value, true);
        }
    }
};
/**
如果只读，控件值可能被隐藏,加上title属性
*/
jetsennet.ui.BaseControl.prototype.setReadonly = function () {
    this.control.readOnly = true;
    this.control.setAttribute("title", this.control.value);

    if (this.control.tagName == "INPUT") {
        jetsennet.util.setClassName(this.control, "xdata-input");
    }
};
/**
格式化控件值
*/
jetsennet.ui.BaseControl.prototype.formatValue = function () {

};
/**
创建控件
*/
jetsennet.ui.BaseControl.prototype.createControl = function () {

};
jetsennet.ui.BaseControl.prototype.render = function () {

    this.createControl();
    this.setDefaultValue();

    var customProcess = this.config.customProcess;

    if (customProcess != null && jetsennet.XDatas.customProcess[customProcess] != null) {
        //自定义处理优先
        jetsennet.XDatas.customProcess[customProcess](this.control, "onload");
    }

    this.formatValue();

    if (this.xdata.readonly) {
        this.setReadonly();
    }
};
/**
InputControl
*/
jetsennet.ui.InputControl = function () {
    this.controlType = "Input";
};
jetsennet.ui.InputControl.prototype = new jetsennet.ui.BaseControl();
/**
DateControl
*/
jetsennet.ui.DateControl = function () {
    this.controlType = "Date";
};
jetsennet.ui.DateControl.prototype = new jetsennet.ui.BaseControl();
jetsennet.ui.DateControl.prototype.formatValue = function () {
    this.control.value = this.control.value.substr(0, 10);
};
jetsennet.ui.DateControl.prototype.createControl = function () {
    jQuery(this.control).pickDate();
};
/**
DateTimeControl
*/
jetsennet.ui.DateTimeControl = function () {
    this.controlType = "DateTime";
};
jetsennet.ui.DateTimeControl.prototype = new jetsennet.ui.BaseControl();
jetsennet.ui.DateTimeControl.prototype.formatValue = function () {
    this.control.value = this.control.value.substr(0, 19);
};
jetsennet.ui.DateTimeControl.prototype.createControl = function () {
    jQuery(this.control).pickDate(true);
};
/**
TimeControl
*/
jetsennet.ui.TimeControl = function () {
    this.controlType = "Time";
};
jetsennet.ui.TimeControl.prototype = new jetsennet.ui.BaseControl();
jetsennet.ui.TimeControl.prototype.formatValue = function () {
    if (this.control.value == "") return;
    var tempValue = jetsennet.util.convertLongToTime(this.control.value, 1000);
    this.control.value = tempValue.substring(0, 8);
};
jetsennet.ui.TimeControl.prototype.createControl = function () {
    jQuery(this.control).focus(function(){});
};
/**
DurationControl
*/
jetsennet.ui.DurationControl = function () {
    this.controlType = "Duration";
};
jetsennet.ui.DurationControl.prototype = new jetsennet.ui.BaseControl();
jetsennet.ui.DurationControl.prototype.formatValue = function () {
    if (this.control.value == "") return;
    var tempValue = jetsennet.util.convertLongToTime(this.control.value, 1000);
    this.control.value = tempValue.substring(0, 8);
};
jetsennet.ui.DurationControl.prototype.createControl = function () {
    jQuery(this.control).focus(function(){});
};
/**
FrameControl
*/
jetsennet.ui.FrameControl = function () {
    this.controlType = "Frame";
};
jetsennet.ui.FrameControl.prototype = new jetsennet.ui.BaseControl();
jetsennet.ui.FrameControl.prototype.formatValue = function () {
    if (this.control.value == "") return;
    this.control.value = jetsennet.util.convertLongToTime(this.control.value, 25);
};
jetsennet.ui.FrameControl.prototype.createControl = function () {
    jQuery(this.control).focus(function(){});
};
/**
SelectControl
*/
jetsennet.ui.SelectControl = function () {
    this.controlType = "Select";
};
jetsennet.ui.SelectControl.prototype = new jetsennet.ui.BaseControl();
jetsennet.ui.SelectControl.prototype.createControl = function () {
    jQuery(this.control).click(function () {
        jetsennet.require("autocomplete");
        jetsennet.hidePopups();
        if (g_xd_autocomplete_cotrol) {
            g_xd_autocomplete_cotrol.dispose();
        }

        g_xd_autocomplete_cotrol = jQuery.extend(new jetsennet.ui.AutoComplete(), { control: sControl, instanceId: "xdata_autocomplete", eventType: 99,
            showMatchItem: false, maxDisplayItems: 0, allowEmpty: true, size: {height:200,width:0}
        });

        g_xd_autocomplete_cotrol.onchanged = function (item) {
            var oldValue = sControl.getAttribute("hiddenvalue");
            if (oldValue != item.value) {
                sControl.setAttribute("hiddenvalue", item.value);
                sControl.setAttribute("extend", valueOf(item, "extend", ""));

                var customProcess = sControl.getAttribute("customprocess");
                if (customProcess != null && jetsennet.XDatas.customProcess[customProcess] != null) {
                    jetsennet.XDatas.customProcess[customProcess](sControl, "onchange");
                    return;
                }
                else {
                    xd_setFieldValue(sControl, item.value, true);
                    sControl.value = item.text;
                }
            }
        };

        if (sControl.getAttribute("itemnotempty") != "true") {
            g_xd_autocomplete_cotrol.appendItem({ text: "", value: "" });
        }

        if (options.handing) {
            var arr = options.handing.split("|");
            for (var i = 0; i < arr.length; i++) {
                var valueHtml = arr[i].split("~");
                g_xd_autocomplete_cotrol.appendItem({ text: valueHtml[0], value: valueHtml[1], extend: (valueHtml.length > 2 ? valueHtml[2] : "") });
            }           
           
            g_xd_autocomplete_cotrol.handleEvent();
            return;
        }           
      
        var fields = options.valueField + ',' + options.viewField;
        if (options.extendField != "" && fields.indexOf(options.extendField) < 0) {
            fields += ',' + options.extendField;
        }

        var xmlDoc = this.getData(options.tableName, options.condition, fields, 0, "");
        var tables = xmlDoc.selectNodes("RecordSet/Record");       

        for (var i = 0; i < tables.length; i++) {
            var itemValue = valueOf(tables[i].selectSingleNode(options.valueField), "text", "");
            var extend = "";
            if (options.extendField != "") {
                extend = valueOf(tables[i].selectSingleNode(options.extendField), "text", "");
            }

            g_xd_autocomplete_cotrol.appendItem(
                { text: valueOf(tables[i].selectSingleNode(options.viewField), "text", ""),
                    value: itemValue, extend: extend
                });
        }

        g_xd_autocomplete_cotrol.handleEvent();
    });
};
jetsennet.ui.SelectControl.prototype.getData = function (tableName, condition, fields, records, orderString) {
    var ws = jQuery.extend(new jetsennet.Service(this.xdata.serviceUrl),
            { async: false, displayLoading: false, cacheLevel: 2, onerror: function (ex) { this.xdata.raiseError(ex); } });
    ws.oncallback = function (result) {
        var xmlDoc = new jetsennet.XmlDoc();
        xmlDoc.loadXML(result.resultVal);
        return xmlDoc;
    };
    ws.call(this.xdata.getDataMethodName, [tableName, condition, fields, records, orderString]);
};
jetsennet.ui.SelectControl.prototype.formatValue = function () {
    var currentValue = this.control.value;
    if (currentValue == "") return;

    var options = jQuery.extend({}, this.config);

    //配置选项
    if (options.handing && options.handing != "") {
        var arrTemp = options.handing.split("|");
        for (var i = 0; i < arrTemp.length; i++) {
            var item = arrTemp[i].split("~");
            if (currentValue == item[1]) {
                this.control.value = item[0];
                this.control.setAttribute("hiddenvalue", item[1]);
                return true;
            }
        }
    }
    //从数据库读取
    else {
        if (options.valueField == options.viewField) {
            return;
        }

        var condition = options.valueField + "=" + (options.keyDataType == "string" ? "'" + currentValue + "'" : currentValue);
        var fields = options.valueField + ',' + options.viewField;

        var xmlDoc = this.getData(options.tableName, condition, fields, 0, "");
        var dataNode = xmlDoc.selectSingleNode("RecordSet/Record[" + options.valueField + "='" + currentValue + "']");

        if (dataNode) {
            this.control.value = valueOf(dataNode.selectSingleNode(options.viewField), "text", "");
            this.control.setAttribute("hiddenvalue", dataNode.selectSingleNode(options.valueField).text);
        }
        else {
            this.control.value = "";
            this.control.setAttribute("hiddenvalue", "");
        }
}
};
/**
TreeControl
*/
jetsennet.ui.TreeControl = function () {
    this.controlType = "Tree";
};
jetsennet.ui.TreeControl.prototype = new jetsennet.ui.BaseControl();
jetsennet.ui.TreeControl.prototype.formatValue = function () {
    var currentValue = this.control.value;
    if (currentValue == "") return;

    var options = jQuery.extend({}, this.config);
};
/**
AutoCompleteControl
*/
jetsennet.ui.AutoCompleteControl = function () {
    this.controlType = "AutoComplete";
};
jetsennet.ui.AutoCompleteControl.prototype = new jetsennet.ui.BaseControl();
/**
CheckControl
*/
jetsennet.ui.CheckControl = function () {
    this.controlType = "Check";
};
jetsennet.ui.CheckControl.prototype = new jetsennet.ui.BaseControl();
jetsennet.ui.CheckControl.prototype.createControl = function () {
    var container = this.contorl.parentNode;
    var options = this.config;
    var currentValue = this.control.value;

    var controlValues = currentValue.length > 0 ? currentValue.split(options.splitChar ? options.splitChar : ",") : [];
    var binding = sControl.getAttribute("binding");
    this.control.style.display = "none";

    //配置选项
    if (options.handing) {
        var arr = options.handing.split("|");
        for (var i = 0; i < arr.length; i++) {
            var valueHtml = arr[i].split("~");
            valueHtml[1] = jetsennet.util.trim(valueHtml[1]);
            var checked = false;
            for (var j = 0; j < controlValues.length; j++) {
                if (controlValues[j] == valueHtml[1])
                    checked = true;
            }

            this.createCheckBox(options.group, valueHtml[1], valueHtml[0], checked, container);
        }
        return;
    }

    //从数据库读取选项
    var ws = jQuery.extend(new jetsennet.Service(this.xdata.serviceUrl),
            { async: false, displayLoading: false, cacheLevel: 2, onerror: function (ex) { this.xdata.raiseError(ex); } });
    ws.oncallback = function (ret) {
        var xmlDoc = new jetsennet.XmlDoc();
        xmlDoc.loadXML(ret.resultVal);
        var tables = xmlDoc.selectNodes("RecordSet/Record");

        for (var i = 0; i < tables.length; i++) {
            var itemValue = valueOf(tables[i].selectSingleNode(options.valueField), "text", "");
            var checked = false;
            for (var j = 0; j < controlValues.length; j++) {
                if (controlValues[j] == itemValue) {
                    checked = true;
                }
            }
            this.createCheckBox(options.group, itemValue, valueOf(tables[i].selectSingleNode(options.viewField), "text", ""), checked, container);
        }
    };
    ws.call(this.xdata.getDataMethodName, [options.tableName, options.condition, options.valueField + ',' + options.viewField, 0, ""]);
};
jetsennet.ui.CheckControl.prototype.createCheckBox = function (group, value, text, checked, container) {
    var checkBox = jQuery("<input type='checkbox'>", { name: group, value: value }).appendTo(container);

    if (this.xdata.readonly) {
        checkBox.click(function () { jetsennet.cancelEvent() });
    }
    else {
        checkBox.click(function () {
            var values = jetsennet.form.getCheckedValues(this.name);
            if (values.length == 0) {
                var controls = this.parentNode.getElementsByTagName("INPUT");
                for (var c = 0; c < controls.length; c++) {
                    if (controls[c].checked == true) {
                        values.push(controls[c].value);
                    }
                }
            }
            xd_setFieldValue(this.control, values.join(","));        
        });
    }

    checkBox[0].defaultChecked = checked;
    checkBox[0].checked = checked;
    jQuery("<span>").html(text + " ").appendTo(container);
};
/**
RadioControl
*/
jetsennet.ui.RadioControl = function () {
    this.controlType = "Radio";
};
jetsennet.ui.RadioControl.prototype = new jetsennet.ui.BaseControl();
jetsennet.ui.RadioControl.prototype.createControl = function () {
    var container = this.contorl.parentNode;
    var options = this.config;
    var currentValue = this.control.value;

    var controlValues = currentValue.length > 0 ? currentValue.split(options.splitChar ? options.splitChar : ",") : [];
    var binding = sControl.getAttribute("binding");
    this.control.style.display = "none";

    //配置选项
    if (options.handing) {
        var arr = options.handing.split("|");
        for (var i = 0; i < arr.length; i++) {
            var valueHtml = arr[i].split("~");
            valueHtml[1] = jetsennet.util.trim(valueHtml[1]);
            var checked = false;
            for (var j = 0; j < controlValues.length; j++) {
                if (controlValues[j] == valueHtml[1])
                    checked = true;
            }

            this.createRadio(options.group, valueHtml[1], valueHtml[0], checked, container);
        }
        return;
    }

    //从数据库读取选项
    var ws = jQuery.extend(new jetsennet.Service(this.xdata.serviceUrl),
            { async: false, displayLoading: false, cacheLevel: 2, onerror: function (ex) { this.xdata.raiseError(ex); } });
    ws.oncallback = function (ret) {
        var xmlDoc = new jetsennet.XmlDoc();
        xmlDoc.loadXML(ret.resultVal);
        var tables = xmlDoc.selectNodes("RecordSet/Record");

        for (var i = 0; i < tables.length; i++) {
            var itemValue = valueOf(tables[i].selectSingleNode(options.valueField), "text", "");
            var checked = false;
            for (var j = 0; j < controlValues.length; j++) {
                if (controlValues[j] == itemValue) {
                    checked = true;
                }
            }
            this.createRadio(options.group, itemValue, valueOf(tables[i].selectSingleNode(options.viewField), "text", ""), checked, container);
        }
    };
    ws.call(this.xdata.getDataMethodName, [options.tableName, options.condition, options.valueField + ',' + options.viewField, 0, ""]);
};
jetsennet.ui.RadioControl.prototype.createRadio = function (group, value, text, checked, container) {
    var radio = jQuery("<input type='radio'>", { name: group, value: value }).appendTo(container);

    if (this.xdata.readonly) {
        radio.click(function () { jetsennet.cancelEvent() });
    }
    else {
        radio.click(function () {
            var values = jetsennet.form.getCheckedValues(this.name);
            if (values.length == 0) {
                var controls = this.parentNode.getElementsByTagName("INPUT");
                for (var c = 0; c < controls.length; c++) {
                    if (controls[c].checked == true) {
                        values.push(controls[c].value);
                    }
                }
            }
            xd_setFieldValue(this.control, values.join(","));
        });
    }

    radio[0].defaultChecked = checked;
    radio[0].checked = checked;
    jQuery("<span>").html(text + " ").appendTo(container);
};
/**
CascadeControl
*/
jetsennet.ui.CascadeControl = function () {
    this.controlType = "Cascade";
};
jetsennet.ui.CascadeControl.prototype = new jetsennet.ui.BaseControl();