//=============================================================================
//数据工厂,大型数据编辑的解决方案 ，在深层次数据编辑上有欠缺
//xiaomin  20090608 整理自原jetsen编目工厂
//2012-03-14 更改焦点输入样式，radio 和 check 去掉onclick中的only xml 改赋值方式
//v1.1.0.1 增加bindcondition,增加multirecord

jetsennet.addLoadedUri(jetsennet.getloadUri("xdata"));
jetsennet.importCss("xdata");
jetsennet.registerNamespace("jetsennet.XDatas");

//当前实例
jetsennet.XDatas.current = null;
jetsennet.XDatas.customProcess = {};

jetsennet.XData = function (container) {
    //容器
    this.container = container ? el(container) : document.body;
    //数据结构
    this.dataViewPath = "";
    this.dataSchema = "";
    this.xmlData = null;
    this.xslData = null;
    //同步
    this.async = true;
    this.serviceUrl = "";

    //只读显示
    this.readonly = false;
    //显示标记
    this.viewMark = false;
    //标记
    this.marks = [];

    this.loadMethodName = "cmpGetObjectData";
    this.deleteMethodName = "cmpDeleteObjectData";
    this.saveMethodName = "cmpSaveObjectData";
    this.getDataMethodName = "cmpGetTableData";

    this.onerror = null;
    //数据加载完毕,通常用于数据改变，显示改变的处理
    this.ondataload = null;
    //显示加载完毕
    this.onload = null;
    //编辑改变
    this.onchange = null;
    //保存前
    this.onbeforesave = null;
    //保存后
    this.onsave = null;
    //删除前
    this.onbeforedelete = null;
    //删除后
    this.ondelete = null;
};
//抛出异常
jetsennet.XData.prototype.raiseError = function (ex) {
    if (jQuery.isFunction(this.onerror)) {
        this.onerror(ex);
    }
    else {
        throw ex;
    }
};
/**
获取数据
xdata只是提供一种标准的获取数据的方式
并不限制数据的其它来源,删除，保存也是如此
*/
jetsennet.XData.prototype.load = function (serivceUrl, methodName, arguments, async) {
    var owner = this;

    var ws = new jetsennet.Service(serivceUrl ? serivceUrl : owner.serviceUrl);
    ws.async = async != null ? async : this.async;
    ws.oncallback = function (ret) {
        owner.xmlData = new jetsennet.XmlDoc();
        owner.xmlData.loadXML(ret.resultVal);

        owner.xslData = new jetsennet.XmlDoc();
        owner.xslData.loadXML(ret.resultVal);

        if (jQuery.isFunction(owner.ondataload))
            owner.ondataload(ret.resultVal);

        owner.render(ret.resultVal);

        if (jQuery.isFunction(owner.onload))
            owner.onload(ret.resultVal);
    };
    ws.onerror = function (ex) {
        owner.raiseError(ex);
    };
    ws.call(methodName ? methodName : owner.loadMethodName, arguments);
};
jetsennet.XData.prototype.loadXml = function (xmlString) {
    var owner = this;
    owner.xmlData = new jetsennet.XmlDoc();
    owner.xmlData.loadXML(xmlString);

    owner.xslData = new jetsennet.XmlDoc();
    owner.xslData.loadXML(xmlString);

    if (jQuery.isFunction(owner.ondataload)) {
        owner.ondataload(xmlString);
    }

    owner.render(xmlString);

    if (jQuery.isFunction(owner.onload)) {
        owner.onload(xmlString);
    }
};
/**
删除
提供onbeforedelete接口用于删除前的判断
提供ondelete接口用于删除后的处理
*/
jetsennet.XData.prototype.remove = function (serivceUrl, methodName, arguments, async) {
    var owner = this;

    if (jQuery.isFunction(owner.onbeforedelete)) {
        if (!this.onbeforedelete(arguments)) {
            return false;
        }
    }

    var ws = new jetsennet.Service(serivceUrl ? serivceUrl : owner.serviceUrl);
    ws.async = async != null ? async : this.async;
    ws.oncallback = function (ret) {
        if (owner.ondelete && typeof owner.ondelete == "function")
            owner.ondelete(ret.resultVal);
    };
    ws.onerror = function (ex) {
        owner.raiseError(ex);
    };
    ws.call(methodName ? methodName : owner.deleteMethodName, arguments);
};
/**
保存
保存前首先检测数据的正确性
提供onbeforesave接口用于保存前的判断
提供onsave接口用于保存后的处理
*/
jetsennet.XData.prototype.save = function (serivceUrl, methodName, arguments, async) {
    var owner = this;

    if (!jetsennet.form.validate(jetsennet.form.getElements(owner.container), true)) {
        owner.raiseError(jetsennet.form.validateResult);
        return false;
    }

    if (jQuery.isFunction(owner.onbeforesave)) {
        if (!this.onbeforesave(arguments)) {
            return false;
        }
    }

    var success = true;

    var ws = new jetsennet.Service(serivceUrl ? serivceUrl : owner.serviceUrl);
    ws.async = async != null ? async : this.async;
    ws.oncallback = function (ret) {
        if (jQuery.isFunction(owner.onsave)) {
            owner.onsave(ret.resultVal);
        }
    };
    ws.onerror = function (ex) {
        owner.raiseError(ex);
        success = false;
    };
    ws.call(methodName ? methodName : owner.saveMethodName, arguments);

    return success;
};
/**
转换
转换是显示数据的最重要部分
会对数据作一些特殊处理，如缺省值，特殊控件
只读时的处理
*/
jetsennet.XData.prototype.render = function (result) {
    this.viewMark = false;
    this.marks = [];
    this.container.innerHTML = jetsennet.xml.transformXML(this.dataXmlUrl, this.xmlData);
    var inputs = jetsennet.form.getElements(this.container, false, false);

    for (var i = inputs.length - 1; i >= 0; i--) {
        inputs[i].ref_xd = this;

        if (!this.readonly) {
            this.setDefaultValue(inputs[i]);
        }

        //级联优先,需要从最末端取值
        var xtype = inputs[i].getAttribute("xtype");
        if (xtype == "SelectDropdown"
            && attributeOf(inputs[i], "iscascade", "") == "1"
            && attributeOf(inputs[i], "binding", "") == "") {

            this.setCascadeControlValue(inputs[i]);
        }

        //如果是筛选框或者单选按钮，先创建
        if (xtype == "CheckBox") {
            this.createCheckBoxControl(inputs[i]);
        }
        else if (xtype == "RadioButton") {
            this.createRadioControl(inputs[i]);
        }
    }

    for (var i = 0; i < inputs.length; i++) {

        var xtype = inputs[i].getAttribute("xtype");
        if (xtype == "Mark") {
            this.marks.push(inputs[i]);
        }
        else {
            var customProcess = inputs[i].getAttribute("customprocess");

            if (customProcess != null && jetsennet.XDatas.customProcess[customProcess] != null) {
                //自定义处理优先
                jetsennet.XDatas.customProcess[customProcess](inputs[i], "onload");
            }
            else {
                this.setControlValue(inputs[i], xtype);
            }

            //如果只读，控件值可能被隐藏
            //加上title属性
            if (this.readonly) {
                inputs[i].readOnly = true;
                inputs[i].setAttribute("title", inputs[i].value);
                if (inputs[i].tagName == "INPUT") {
                    jetsennet.util.setClassName(inputs[i], "xdata-input");
                }
            }
        }
    }

    var tables = this.container.getElementsByTagName("table");
    for (var i = 0; i < tables.length; i++) {
        if (tables[i].getAttribute("tablename") || tables[i].getAttribute("binding")) {
            tables[i].ref_xd = this;

            //只读移除表格行删除按钮
            if (this.readonly) {
                var rows = valueOf(tables[i].tBodies[0], "rows", []);

                for (var r = 0; r < rows.length; r++) {
                    var oldCells = rows[r].cells;
                    var lastTd = oldCells[oldCells.length - 1];
                    if (lastTd.className == "xdata-deletetd") {
                        lastTd.innerHTML = "";
                    }
                }
            }
        }
    }
};
//=============================================================================
//设定缺省值
//=============================================================================
jetsennet.XData.prototype.setDefaultValue = function (element) {
    var sControl = el(element);
    if (sControl && sControl.value == "") {
        var initValue = sControl.getAttribute("default");

        if (initValue && initValue != "") {
            var binding = sControl.getAttribute("binding");

            if (binding && binding != "" && this.xmlData && this.xmlData.documentElement) {

                if (this.xmlData.documentElement.selectSingleNode(binding) != null) {
                    return;
                }

                //多列编辑不需要默认值，也无法用默认值
                var isInRepeat = xd_isControlInRepeatTable(sControl);
                if (!isInRepeat) {
                    if (initValue == "SYS_DATE")
                        sControl.value = new Date().toDateString();
                    else if (initValue == "SYS_TIME")
                        sControl.value = new Date().toTimeString();
                    else if (initValue == "CURRENT_USER")
                        sControl.value = valueOf(jetsennet.Application.userInfo, "UserName", "");
                    else if (initValue == "CURRENT_USERID")
                        sControl.value = valueOf(jetsennet.Application.userInfo, "UserId", "");
                    else if (initValue == "SYS_DATETIME")
                        sControl.value = new Date().toDateTimeString();
                    else
                        sControl.value = initValue;

                    xd_setFieldValue(sControl, sControl.value, true);
                }
            }
        }
    }
};
//设置控件值
jetsennet.XData.prototype.setControlValue = function (control, xtype) {
    xtype = xtype ? xtype : control.getAttribute("xtype");

    if (xtype == "AutoLearn")
        this.setAutoLearnValue(control);
    else if (xtype == "SelectDropdown" || xtype == "AutoComplete") {
        this.setSelectDropDownValue(control);
    }
    else if (xtype == "SelectTree") {
        this.setTreeListValue(control);
    }
    else if (xtype == "DateSelector") {
        this.setDateTimeValue(control);
    }
    else if (xtype == "Duration" || xtype == "Time" || xtype == "Frame") {
        this.setTimeValue(control, xtype);
    }
};

//设定日期值
jetsennet.XData.prototype.setDateTimeValue = function (element) {
    var sControl = el(element);
    if (sControl && sControl.value != ""
        && (sControl.value.length == 19
        || sControl.value.indexOf("T") > 9)) {
        var datevalue = sControl.value;
        sControl.value = datevalue.substr(0, 10);
    }
};
//设定时间值
jetsennet.XData.prototype.setTimeValue = function (element, xType) {
    var control = el(element);
    if (control && control.value != "") {
        var datevalue = control.value;

        if (xType == "Duration") {
            control.value = jetsennet.util.convertLongToTime(datevalue, 1000);
        }
        else if (xType == "Time") {
            var tempValue = jetsennet.util.convertLongToTime(datevalue, 1000);
            control.value = tempValue.substring(0, 8);
        }
        else if (xType == "Frame") {
            control.value = jetsennet.util.convertLongToTime(datevalue, 25);
        }
    }
};
//设定自学习控件值
jetsennet.XData.prototype.setAutoLearnValue = function (element) {
    var sControl = el(element);
    if (sControl.value == "")
        return;

    var fieldName = sControl.getAttribute("keyfieldname");
    var displayFieldName = sControl.getAttribute("dspfieldname");
    var tableName = sControl.getAttribute("tablename");

    //	  var sqlQuery = new jetsennet.SqlQuery();
    //    var queryTable = jetsennet.createQueryTable(tableName,"");
    //    jQuery.extend(sqlQuery,{IsPageResult:0,KeyId:"",PageInfo:null,QueryTable:queryTable,ResultFields:fieldName+","+displayFieldName,TopRows:1});
    //    var condition = new jetsennet.SqlConditionCollection();
    //    condition.SqlConditions.push(jetsennet.SqlCondition.create(fieldName,sControl.value,jetsennet.SqlLogicType.And,jetsennet.SqlRelationType.Equal,jetsennet.SqlParamType.String));
    //    sqlQuery.Conditions = condition;

    var ws = new jetsennet.Service(sControl.ref_xd.serviceUrl);
    ws.async = false;
    ws.oncallback = function (ret) {
        var xmlDoc = new jetsennet.XmlDoc();
        xmlDoc.loadXML(ret.resultVal);

        var keyNode = xmlDoc.documentElement.selectSingleNode("//" + fieldName);
        var displayNode = xmlDoc.documentElement.selectSingleNode("//" + displayFieldName);
        sControl.value = valueOf(displayNode, "text", "");

        var xmlTable = xd_getControlTableXmlDom(sControl.ref_xd, sControl, tableName);
        xmlTable.setAttribute("action", "none");

        var field = xmlTable.selectSingleNode(fieldName);
        if (field == null) {
            field = sControl.ref_xd.xmlData.createElement(fieldName);
            field.text = valueOf(keyNode, "text", "");
            xmlTable.appendChild(field);
        }
    };
    ws.call(sControl.ref_xd.getDataMethodName, [
        tableName,
        fieldName + "=" + sControl.value,
        fieldName + "," + displayFieldName,
        1, ""]);
    //ws.call(sControl.ref_xd.getDataMethodName,[sqlQuery.toXml()]);
};
/**
设定级联控件值
级联控件是由后面的控件开始往前面依次设值的，
故此方法用于查找当前控件后面的值(此时后面的值已处理)
*/
jetsennet.XData.prototype.setCascadeControlValue = function (sControl) {
    var parentNextControl = sControl.parentNode.nextSibling;

    if (parentNextControl && !parentNextControl.getElementsByTagName) {
        parentNextControl = parentNextControl.nextSibling;
    }

    if (!parentNextControl || !parentNextControl.getElementsByTagName)
        return;

    var nodes = parentNextControl.getElementsByTagName("input");
    var owner = this;

    if (nodes.length > 0 && nodes[0].getAttribute("xtype") == "SelectDropdown") {
        var currentValue = nodes[0].value;

        if (currentValue && currentValue != "") {

            var cascadeFieldName = sControl.getAttribute("cascadefieldname");
            var valueFieldName = sControl.getAttribute("keyfieldname");
            var tableName = sControl.getAttribute("tablename");

            var ws = new jetsennet.Service(sControl.ref_xd.serviceUrl);
            ws.async = false;
            ws.displayLoading = false;
            ws.cacheLevel = 2;
            ws.oncallback = function (ret) {
                var xmlDoc = new jetsennet.XmlDoc();
                xmlDoc.loadXML(ret.resultVal);

                var dataNode = xmlDoc.selectSingleNode("RecordSet/Record[" + valueFieldName + "='" + currentValue + "']");
                if (dataNode) {
                    var value = valueOf(dataNode.selectSingleNode(cascadeFieldName), "text", "");
                    if (value != "0" && value != "-1") {
                        sControl.value = value;
                        //被联动的条件
                        nodes[0].setAttribute("condition", cascadeFieldName + "=" + sControl.value);
                    }
                    else {
                        sControl.value = currentValue;
                        owner.getNextCascadeControlValue(nodes[0], cascadeFieldName);
                    }
                }
            };
            ws.onerror = function (ex) { owner.raiseError(ex); };
            ws.call(sControl.ref_xd.getDataMethodName, [
                tableName,
                valueFieldName + "=" + currentValue,
                valueFieldName + "," + cascadeFieldName,
                0, ""]);
        }
    }
};
jetsennet.XData.prototype.getNextCascadeControlValue = function (sControl, cascadeFieldName) {
    var parentNextControl = sControl.parentNode.nextSibling;

    if (parentNextControl && !parentNextControl.getElementsByTagName) {
        parentNextControl = parentNextControl.nextSibling;
    }

    if (parentNextControl && parentNextControl.getElementsByTagName) {
        var nodes = parentNextControl.getElementsByTagName("input");

        if (nodes.length > 0 && nodes[0].getAttribute("xtype") == "SelectDropdown") {
            sControl.value = nodes[0].value;
            sControl.setAttribute("condition", attributeOf(nodes[0], "condition", ""));
            this.getNextCascadeControlValue(nodes[0], cascadeFieldName);
            return;
        }
    }

    sControl.setAttribute("condition", sControl.value.length > 0 ? cascadeFieldName + "=" + sControl.value : "1=2");
    sControl.value = "";
};
/**
设定下拉框值
仅查找当前值，并不生成下拉数据
当非静态数据时，文字与值字段相等则不作处理
*/
jetsennet.XData.prototype.setSelectDropDownValue = function (element) {
    var sControl = el(element);
    if (sControl.value == "") {
        return;
    }

    var owner = this;
    var currentValue = sControl.value;
    var handing = sControl.getAttribute("handing");
    if (handing && handing != "") {
        var arrTemp = handing.split("|");
        for (var i = 0; i < arrTemp.length; i++) {
            var item = arrTemp[i].split("~");
            if (currentValue == item[1]) {
                sControl.value = item[0];
                sControl.setAttribute("hiddenvalue", item[1]);
                return true;
            }
        }
    }
    else {
        var tableName = sControl.getAttribute("tablename");
        var valueFieldName = sControl.getAttribute("keyfieldname");
        var displayFieldName = sControl.getAttribute("dspfieldname");
        if (valueFieldName == displayFieldName) {
            //xd_setRules(sControl);
            return;
        }

        var keyType = sControl.getAttribute("keyfieldtype");
        var condition = valueFieldName + "=";
        if (keyType == "string") {
            condition += "'" + sControl.value + "'";
        }
        else {
            condition += sControl.value;
        }

        var ws = new jetsennet.Service(sControl.ref_xd.serviceUrl);
        ws.async = false;
        ws.displayLoading = false;
        ws.cacheLevel = 2;
        ws.oncallback = function (ret) {
            var xmlDoc = new jetsennet.XmlDoc();
            xmlDoc.loadXML(ret.resultVal);
            var dataNode = xmlDoc.selectSingleNode("RecordSet/Record[" + valueFieldName + "='" + currentValue + "']");

            if (dataNode) {
                sControl.value = valueOf(dataNode.selectSingleNode(xd_getTrueFieldName(displayFieldName)), "text", "");
                sControl.setAttribute("hiddenvalue", dataNode.selectSingleNode(xd_getTrueFieldName(valueFieldName)).text);
                //如果触发规则，被联动项被清空
                //			    if( sControl.getAttribute("condition") )
                //			    {
                //				    xd_setRules(sControl);
                //			    }
            }
            else {
                sControl.value = "";
                sControl.setAttribute("hiddenvalue", "");
            }
        };
        var fields = valueFieldName + ',' + displayFieldName;
        ws.onerror = function (ex) { owner.raiseError(ex); };
        ws.call(sControl.ref_xd.getDataMethodName, [tableName, condition, fields, 0, ""]);
    }
};
/**
设定树控件值
仅查找当前值，并不生成树数据
文字与值字段相等则不作处理
*/
jetsennet.XData.prototype.setTreeListValue = function (element) {
    var sControl = el(element);
    if (sControl.value == "")
        return;

    var owner = this;
    var tableName = sControl.getAttribute("tablename");
    var valueFieldName = sControl.getAttribute("keyfieldname");
    var displayFieldName = sControl.getAttribute("dspfieldname");
    var displayTreeFieldName = sControl.getAttribute("treedspfieldname");
    if (displayTreeFieldName == null || displayTreeFieldName == "") {
        displayTreeFieldName = displayFieldName;
    }

    if (valueFieldName == displayFieldName) {
        xd_setRules(sControl);
        return;
    }

    var keyType = sControl.getAttribute("keyfieldtype");
    var condition = valueFieldName + "=";
    if (keyType == "string") {
        condition += "'" + sControl.value + "'";
    }
    else {
        condition += sControl.value;
    }
    //扩展信息 
    var extend = sControl.getAttribute("extendfieldname");
    extend = extend ? extend : "";
    var fields = valueFieldName + ',' + displayFieldName;
    if (displayTreeFieldName != displayFieldName) {
        fields += ',' + displayTreeFieldName;
    }
    if (extend.length > 0) {
        fields += ',' + extend;
    }

    var ws = new jetsennet.Service(sControl.ref_xd.serviceUrl);
    ws.async = false;
    ws.displayLoading = false;
    ws.cacheLevel = 2;
    ws.oncallback = function (ret) {
        var xmlDoc = new jetsennet.XmlDoc();
        xmlDoc.loadXML(ret.resultVal);

        var valueDom = xmlDoc.selectSingleNode("RecordSet/Record[" + valueFieldName + "='" + sControl.value + "']");

        if (valueDom) {
            sControl.value = valueOf(valueDom.selectSingleNode(xd_getTrueFieldName(displayFieldName)),
                "text",
                valueOf(valueDom.selectSingleNode(xd_getTrueFieldName(displayTreeFieldName)), "text", ""));

            sControl.setAttribute("hiddenvalue", valueOf(valueDom.selectSingleNode(xd_getTrueFieldName(valueFieldName)), "text", ""));

            if (extend.length > 0) {
                sControl.setAttribute("extend", valueOf(valueDom.selectSingleNode(extend), "text", ""));
            }

            xd_setRules(sControl);
        }
        else {
            sControl.value = "";
            sControl.setAttribute("hiddenvalue", "");
        }
    };
    ws.onerror = function (ex) { owner.raiseError(ex); };
    ws.call(sControl.ref_xd.getDataMethodName, [tableName, condition, fields, 0, ""]);
};
//编目标记相关
jetsennet.XData.prototype.displayMark = function () {
    var marklen = this.marks.length;
    for (var i = 0; i < marklen; i++) {
        this.marks[i].style.display = this.viewMark ? "none" : "";
    }
    this.viewMark = !this.viewMark;
};
//显示编目标记
jetsennet.XData.prototype.showMark = function (markIds) {
    var marklen = this.marks.length;
    for (var i = 0; i < marklen; i++) {
        var binding = this.marks[i].getAttribute("binding");
        if (binding && binding != "") {

            for (var j = 0; j < markIds.length; j++) {
                if (markIds[j] == binding) {
                    this.marks[i].style.display = "";
                    this.marks[i].setAttribute("show", "1");
                    jetsennet.util.setClassName(this.marks[i], "xdata-mark");
                }
            }
        }
    }
};
//重设编目标记
jetsennet.XData.prototype.resetMark = function () {
    var marklen = this.marks.length;
    for (var i = 0; i < marklen; i++) {
        this.marks[i].setAttribute("show", "0");
        jetsennet.util.setClassName(this.marks[i], "xdata-mark-gray");
    }
};
//获取标记
jetsennet.XData.prototype.getMarks = function () {
    var results = [];
    var marklen = this.marks.length;
    for (var i = 0; i < marklen; i++) {
        if (this.marks[i].getAttribute("show") == "1")
            results.push(this.marks[i].getAttribute("binding"));
    }
    return results;
};
//创建筛选框
jetsennet.XData.prototype.createCheckBoxControl = function (sControl) {
    var container = sControl.parentNode;
    var splitChar = sControl.getAttribute("splitchar");
    var controlValues = sControl.value.length > 0 ? sControl.value.split(splitChar ? splitChar : ",") : [];
    var groupName = sControl.getAttribute("groupname");
    var handing = sControl.getAttribute("handing");
    var binding = sControl.getAttribute("binding");
    sControl.style.display = "none";

    if (handing) {
        var arr = handing.split("|");
        for (var i = 0; i < arr.length; i++) {
            var valueHtml = arr[i].split("~");
            valueHtml[1] = jetsennet.util.trim(valueHtml[1]);
            var checked = false;
            for (var j = 0; j < controlValues.length; j++) {
                if (controlValues[j] == valueHtml[1])
                    checked = true;
            }

            var checkBox = document.createElement("INPUT");
            checkBox.type = "checkbox";
            checkBox.name = groupName;

            if (sControl.ref_xd.readonly) {
                checkBox.onclick = function () { jetsennet.cancelEvent() };
            }
            else {
                checkBox.onclick = function () { xd_onclick(sControl); };
            }

            checkBox.defaultChecked = checked;
            checkBox.checked = checked;
            checkBox.value = valueHtml[1];
            container.appendChild(checkBox);
            checkBox.ref_xd = sControl.ref_xd;
            var textControl = document.createElement("SPAN");
            textControl.innerHTML = valueHtml[0] + " ";
            container.appendChild(textControl);
        }
        return;
    }

    var tableName = sControl.getAttribute("tablename");
    var valueFieldName = sControl.getAttribute("keyfieldname");
    var displayFieldName = sControl.getAttribute("dspfieldname");
    var condition = sControl.getAttribute("condition");
    if (!tableName)
        return;
    condition = condition ? condition : "";

    var ws = new jetsennet.Service(sControl.ref_xd.serviceUrl);
    ws.async = false;
    ws.displayLoading = false;
    ws.cacheLevel = 2;
    ws.oncallback = function (ret) {
        var xmlDoc = new jetsennet.XmlDoc();
        xmlDoc.loadXML(ret.resultVal);

        var tables = xmlDoc.selectNodes("RecordSet/Record");

        for (var i = 0; i < tables.length; i++) {
            var itemValue = valueOf(tables[i].selectSingleNode(valueFieldName), "text", "");
            var checked = false;
            for (var j = 0; j < controlValues.length; j++) {
                if (controlValues[j] == itemValue)
                    checked = true;
            }
            var checkBox = document.createElement("INPUT");
            checkBox.type = "checkbox";
            checkBox.name = groupName;

            if (sControl.ref_xd.readonly) {
                checkBox.onclick = function () { jetsennet.cancelEvent() };
            }
            else {
                checkBox.onclick = function () { xd_onclick(sControl); };
            }

            checkBox.defaultChecked = checked;
            checkBox.checked = checked;
            checkBox.value = itemValue;
            checkBox.ref_xd = sControl.ref_xd;
            container.appendChild(checkBox);
            var textControl = document.createElement("SPAN");
            textControl.innerHTML = valueOf(tables[i].selectSingleNode(displayFieldName), "text", "") + " ";
            container.appendChild(textControl);
        }
    };
    ws.onerror = function (ex) { sControl.ref_xd.raiseError(ex); };
    ws.call(sControl.ref_xd.getDataMethodName, [tableName, condition, valueFieldName + ',' + displayFieldName, 0, ""]);
};
//创建单选按钮
jetsennet.XData.prototype.createRadioControl = function (sControl) {
    var container = sControl.parentNode;
    var controlValue = sControl.value;
    var groupName = sControl.getAttribute("groupname");
    var handing = sControl.getAttribute("handing");
    var binding = sControl.getAttribute("binding");
    var relation = attributeOf(sControl, "relation", "");
    var checkFirst = attributeOf(sControl, "checkFirst", ""); //是否选中首个选项
    sControl.style.display = "none";

    if (handing) {
        var arr = handing.split("|");
        for (var i = 0; i < arr.length; i++) {
            var valueHtml = arr[i].split("~");
            valueHtml[1] = jetsennet.util.trim(valueHtml[1]);
            var checked = (i == 0 && checkFirst.toLowerCase() == "true") ? true : false;

            if (controlValue == valueHtml[1]) {
                checked = true;
            }

            var radioButton;
            //保证IE6和7下能选中值
            if (IS_IE6 || IS_IE7) {
                var html = "<input type='radio' value='" + valueHtml[1] + "' name='" + groupName + "'";
                if (checked == true)
                    html += " checked=true />";
                html += " />";
                radioButton = document.createElement(html);
            } else {
                radioButton = document.createElement("INPUT");
                radioButton.type = sControl.ref_xd.readonly ? "checkbox" : "radio";
                radioButton.name = groupName;
                radioButton.checked = checked;
                radioButton.value = valueHtml[1];
            }

            radioButton.ref_xd = sControl.ref_xd;
            if (sControl.ref_xd.readonly) {
                radioButton.onclick = function () { jetsennet.cancelEvent() };
            }
            else {
                radioButton.onclick = function () { xd_onclick(sControl); };
            }

            container.appendChild(radioButton);
            var textControl = document.createElement("SPAN");
            textControl.innerHTML = valueHtml[0] + " ";
            container.appendChild(textControl);

            if (checked) {
                xd_onclick(sControl);
            }
        }
        return;
    }

    var tableName = sControl.getAttribute("tablename");
    var valueFieldName = sControl.getAttribute("keyfieldname");
    var displayFieldName = sControl.getAttribute("dspfieldname");
    var condition = sControl.getAttribute("condition");
    if (!tableName)
        return;
    condition = condition ? condition : "";

    var ws = new jetsennet.Service(sControl.ref_xd.serviceUrl);
    ws.async = false;
    ws.displayLoading = false;
    ws.cacheLevel = 2;
    ws.oncallback = function (ret) {
        var xmlDoc = new jetsennet.XmlDoc();
        xmlDoc.loadXML(ret.resultVal);

        var tables = xmlDoc.selectNodes("RecordSet/Record");

        for (var i = 0; i < tables.length; i++) {
            var itemValue = valueOf(tables[i].selectSingleNode(valueFieldName), "text", "");
            var checked = (i == 0 && checkFirst.toLowerCase() == "true") ? true : false;
            if (controlValue == itemValue) {
                checked = true;
            }
            var radioButton;
            if (IS_IE6 || IS_IE7) {
                var html = "<input type='radio' value='" + itemValue + "' name='" + groupName + "' ";
                if (checked == true)
                    html += " checked=true ";
                html += " />";

                radioButton = document.createElement(html);
            } else {
                radioButton = document.createElement("INPUT");
                radioButton.type = sControl.ref_xd.readonly ? "checkbox" : "radio";
                radioButton.name = groupName;
                radioButton.value = itemValue;
                radioButton.checked = checked;
            }

            radioButton.ref_xd = sControl.ref_xd;
            if (sControl.ref_xd.readonly) {
                radioButton.onclick = function () { jetsennet.cancelEvent(); };
            } else {
                radioButton.onclick = function () { xd_onclick(sControl); };
            }
            container.appendChild(radioButton);

            var textControl = document.createElement("SPAN");
            textControl.innerHTML = valueOf(tables[i].selectSingleNode(displayFieldName), "text", "") + " ";
            container.appendChild(textControl);

            if (checked) {
                xd_onclick(sControl);
            }
        }
    };
    ws.onerror = function (ex) { sControl.ref_xd.raiseError(ex); };
    ws.call(sControl.ref_xd.getDataMethodName, [tableName, condition, valueFieldName + ',' + displayFieldName, 0, ""]);
};
/**
将控件转换为只读
在此仅是将input转换为span显示
*/
jetsennet.XData.prototype.convertToViewControl = function (control) {
    var inputs = control ? [control] : jetsennet.form.getElements(this.container, false, false);
    var n = inputs.length;
    for (var i = 0; i < n; i++) {
        var xtype = inputs[i].getAttribute("xtype");
        if (xtype != "CheckBox" && xtype != "RadioButton") {
            var container = inputs[i].parentNode;
            var controlValue = inputs[i].value;
            var viewControl = document.createElement("SPAN");
            viewControl.innerHTML = controlValue;
            container.appendChild(viewControl);
            inputs[i].style.display = "none";
        }
    }
};
/**
提供一个获取所有控件的接口
*/
jetsennet.XData.prototype.foreachControl = function (fun) {

    var inputs = jetsennet.form.getElements(this.container, false, false);
    var n = inputs.length;
    for (var i = 0; i < n; i++) {
        if (!fun(inputs[i]))
            return;
    }
};






















var g_xd_autocomplete_cotrol = null;
var g_xd_blurControl = null;

//=============================================================================
//事件
//=============================================================================
function xd_onkeydown(sControl) { };
function xd_onkeyup(sControl) {
    if (sControl && sControl.ref_xd && sControl.ref_xd.readonly)
        return;

    var xtype = sControl.getAttribute("xtype");
    if (xtype == "AutoLearn") {
        if (event.keyCode == 9 || event.keyCode == 13 || event.keyCode == 40 || event.keyCode == 39 || event.keyCode == 38 || event.keyCode == 37) {
            return;
        }
        else {
            xd_getDataList(sControl, "AutoLearn");
        }
    }
};
function xd_onmousedown(sControl) { };
function xd_onmouseup(sControl) { };
function xd_oncontextmenu(sControl) { };
function xd_onpaste(sControl) { };
function deleteImg_onmouseover(obj) { };
function deleteImg_onmouseout(obj) { };

function xd_onfocus(sControl) {
    if (sControl && sControl.ref_xd) {

        if (sControl.ref_xd.readonly)
            return;

        if (xd_isControlInRepeatTable(sControl)) {
            var tbl_tr = sControl.parentNode.parentNode;
            var tdList = tbl_tr.childNodes;

            for (var i = 0; i < tdList.length; i++) {
                var inputCtrl = tdList[i].firstChild;
                if (inputCtrl && inputCtrl.style) {
                    var className = inputCtrl.className;
                    inputCtrl.className = className + " xdata-focus";
                }
            }
        }
        else {
            var className = sControl.className;
            sControl.className = className + " xdata-focus";
        }
    }
};
function xd_onblur(sControl) {
    if (sControl && sControl.ref_xd) {
        if (sControl.ref_xd.readonly)
            return;
        g_xd_blurControl = sControl;

        if (xd_isControlInRepeatTable(g_xd_blurControl)) {
            var tbl_tr = g_xd_blurControl.parentNode.parentNode;
            var tdList = tbl_tr.childNodes;

            for (var i = 0; i < tdList.length; i++) {
                var inputCtrl = tdList[i].firstChild;
                if (inputCtrl && inputCtrl.style) {
                    var classNames = valueOf(inputCtrl, "className", "").split(" ");
                    inputCtrl.className = classNames[0];
                }
            }
        }
        else {
            var classNames = valueOf(sControl, "className", "").split(" ");
            sControl.className = classNames[0];
        }
        jetsennet.form.validate([g_xd_blurControl]);
    }
};
function xd_onclick(sControl) {
    if (sControl && sControl.ref_xd && sControl.ref_xd.readonly)
        return;

    var xtype = sControl.getAttribute("xtype");

    if (xtype == "DateSelector" || xtype == "Date") {
        jetsennet.pickDate(sControl);
        event.cancelBubble = true;
        return false;
    }
    else if (xtype == "DateTime") {
        jetsennet.pickDate(sControl, true);
        event.cancelBubble = true;
        return false;
    }
    else if (xtype == "AutoLearn" || xtype == "SelectDropdown" || xtype == "AutoComplete") {
        xd_getDataList(sControl, xtype);
    }
    else if (xtype == "SelectTree") {
        xd_getDataTree(sControl);
    }
    else if (xtype == "Mark") {
        if (sControl.getAttribute('show') == '0') {
            sControl.className = 'xdata-mark';
            sControl.setAttribute('show', '1');
        }
        else {
            sControl.className = 'xdata-mark-gray';
            sControl.setAttribute('show', '0');
        }
    }
    else if (xtype == "UploadFile") {
        xd_uploadFile(sControl);
    }
    else if (xtype == "CheckBox" || xtype == "RadioButton") {
        var values = jetsennet.form.getCheckedValues(sControl.getAttribute("groupname"));
        if (values.length == 0) {
            var controls = sControl.parentNode.getElementsByTagName("INPUT");
            for (var c = 0; c < controls.length; c++) {
                if (controls[c].checked == true) {
                    values.push(controls[c].value);
                }
            }
        }
        xd_setFieldValue(sControl, values.join(","));
    }
};
function xd_onchange(sControl) {
    var customProcess = sControl.getAttribute("customprocess");
    if (customProcess != null && jetsennet.XDatas.customProcess[customProcess] != null) {
        jetsennet.XDatas.customProcess[customProcess](sControl, "onchange");
        return;
    }

    var xtype = sControl.getAttribute("xtype");
    if (xtype != "SelectDropdown" && xtype != "SelectTree" && xtype != "AutoComplete" && xtype != "AutoLearn") {
        xd_setFieldValue(sControl, sControl.value);
    }
};
function xd_tab_click(label) {
    jetsennet.util.tabpaneEvent(label);
};

//验证数据
//不能重复
jetsennet.validateOptions.push({ name: "xdata_notrepeat", onvalidate: function (element) {
    return xd_validate(element, "notrepeat");
}, message: "不能重复"
});
jetsennet.validateOptions.push({ name: "xdata_notemptyrecord", onvalidate: function (element) {
    return xd_validate(element, "notemptyrecord");
}, message: "不能为空"
});

function xd_validate(sControl, validatetype) {
    if (sControl == null || sControl.ref_xd == null || validatetype == null)
        return true;

    var curValidateString = validatetype.toLowerCase();
    switch (curValidateString) {
        case "notrepeat":
            //不能重复
            var repeatcondition = attributeOf(sControl, "repeatcondition", "");
            if (repeatcondition == "") {
                break;
            }
            var fieldValues = ",";
            var fields = sControl.ref_xd.xmlData.documentElement.selectNodes(repeatcondition);
            if (fields.length > 1) {
                for (var i = 0; i < fields.length; i++) {
                    if (fieldValues.indexOf("," + valueOf(fields[i], "text", "") + ",") >= 0)
                        return false;

                    fieldValues += fields[i].text + ",";
                }
            }
            break;
        case "notemptyrecord":
            //必须有记录行
            var binding = attributeOf(sControl, "binding", "");
            var arrBind = binding.split("/");
            var tableName = arrBind.slice(0, arrBind.length - 1).join("/");
            var tableCtrl = xd_getParentNodeByTag(sControl, "TABLE");
            var tableType = attributeOf(tableCtrl, "condition", "");
            var tableCondition = tableType != "" ? " and " + tableType : "";
            if (sControl.ref_xd.xmlData.documentElement.selectSingleNode(tableName + "[@action!='delete'" + tableCondition + "]") == null) {
                return false;
            }
            break;
    }
    return true;
};
function xd_setRules(sControl) {
    var rules = sControl.getAttribute("rules");
    if (rules) {
        rules = rules.replace(/\bthis\b/g, "sControl");
        rules = jetsennet.xml.xslUnescape(rules);
        rules = jetsennet.xml.xmlUnescape(rules);
        rules = jetsennet.xml.xmlUnescape(rules);
        eval(rules);
    }

    //级联菜单
    var xtype = sControl.getAttribute("xtype");
    if (xtype == "SelectDropdown") {
        var iscascade = sControl.getAttribute("iscascade");
        if (iscascade == "1") {
            var hidValue = sControl.getAttribute('hiddenvalue');
            //注释是因为三级联动有影响
            //	        if(hidValue && hidValue!="")
            //	        {
            var parentNextControl = sControl.parentNode.nextSibling;
            if (!parentNextControl.getElementsByTagName) {
                parentNextControl = parentNextControl.nextSibling;
            }
            if (!parentNextControl || !parentNextControl.getElementsByTagName)
                return;

            var nodes = parentNextControl.getElementsByTagName("input");

            if (nodes.length > 0 && nodes[0].getAttribute("xtype") == "SelectDropdown") {
                var cascadeFieldName = sControl.getAttribute("cascadefieldname");
                nodes[0].setAttribute("condition", cascadeFieldName + "=" + (hidValue ? hidValue : "-1000"));
                xd_setFieldValue(nodes[0], "");
            }
            //	        }
        }
    }
};
function xd_getTrueFieldName(fieldName) {
    if (fieldName.indexOf(" ") > 0) {
        return fieldName.substring(fieldName.lastIndexOf(" ") + 1);
    }
    return fieldName;
};
//=============================================================================
//取得数据列表
//=============================================================================
function xd_getDataList(sControl, sType) {
    jetsennet.require("autocomplete");

    jetsennet.hidePopups();

    if (g_xd_autocomplete_cotrol)
        g_xd_autocomplete_cotrol.dispose();

    if (sType == "SelectDropdown" || sType == "AutoLearn") {
        g_xd_autocomplete_cotrol = new jetsennet.ui.AutoComplete(sControl, "xdata_autocomplete", 99);
        g_xd_autocomplete_cotrol.showMatchItem = false;
    }
    else {
        g_xd_autocomplete_cotrol = new jetsennet.ui.AutoComplete(sControl, "xdata_autocomplete", 1);
    }

    var sControlWidth = jetsennet.util.getControlSize(sControl).viewWidth;
    g_xd_autocomplete_cotrol.maxDisplayItems = 0;
    if (sControlWidth < 100) {
        g_xd_autocomplete_cotrol.setSize(100, null);
    }
    g_xd_autocomplete_cotrol.allowEmpty = true;
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

    var handing = sControl.getAttribute("handing");
    if (handing && (sType == "SelectDropdown" || sType == "AutoComplete")) {
        var arr = handing.split("|");
        for (var i = 0; i < arr.length; i++) {
            var valueHtml = arr[i].split("~");
            g_xd_autocomplete_cotrol.appendItem({ text: valueHtml[0], value: valueHtml[1], extend: (valueHtml.length > 2 ? valueHtml[2] : "") });
        }
        if (arr.length > 10) {
            g_xd_autocomplete_cotrol.setSize(null, 200);
        }
        if (sType == "AutoComplete")
            g_xd_autocomplete_cotrol.sortItems();
        g_xd_autocomplete_cotrol.handleEvent();
        return;
    }

    var tableName = sControl.getAttribute("tablename");
    var valueFieldName = sControl.getAttribute("keyfieldname");
    var displayFieldName = sControl.getAttribute("dspfieldname");
    var condition = sControl.getAttribute("condition");
    //扩展信息 
    var extendFieldName = sControl.getAttribute("extendfieldname");
    extendFieldName = extendFieldName ? extendFieldName : "";

    if (!tableName)
        return;
    condition = condition ? condition : "";

    var isSeries = false;
    if (sType == "AutoLearn") {
        if (condition != "") {
            condition += " AND ";
        }
        condition += displayFieldName + " LIKE '" + sControl.value.replace(/ /gm, "").replace(/'/gm, "''") + "%' ";
    }

    var fields = valueFieldName + ',' + displayFieldName;
    if (extendFieldName != "" && fields.indexOf(extendFieldName) < 0) {
        fields += ',' + extendFieldName;
    }

    var ws = new jetsennet.Service(sControl.ref_xd.serviceUrl);
    ws.async = false;
    ws.displayLoading = false;
    if (sType == "AutoLearn") {
        ws.cacheLevel = 1;
        isSeries = true;
    }
    else if (sType == "SelectDropdown" || sType == "AutoComplete") {
        ws.cacheLevel = 2;
    }
    ws.oncallback = function (ret) {
        var xmlDoc = new jetsennet.XmlDoc();
        xmlDoc.loadXML(ret.resultVal);

        var tables = xmlDoc.selectNodes("RecordSet/Record");
        var trueValueField = xd_getTrueFieldName(valueFieldName);
        var trueTextField = xd_getTrueFieldName(displayFieldName);
        var trueExtendTextField = xd_getTrueFieldName(extendFieldName);

        for (var i = 0; i < tables.length; i++) {
            var itemValue = valueOf(tables[i].selectSingleNode(trueValueField), "text", "");
            var extend = "";
            if (trueExtendTextField) {
                extend = valueOf(tables[i].selectSingleNode(trueExtendTextField), "text", "");
            }

            g_xd_autocomplete_cotrol.appendItem(
                { text: valueOf(tables[i].selectSingleNode(trueTextField), "text", ""),
                    value: itemValue, extend: extend
                });
        }
        if (tables.length > 10) {
            g_xd_autocomplete_cotrol.setSize(null, 200);
        }
        if (sType == "AutoComplete")
            g_xd_autocomplete_cotrol.sortItems();
        g_xd_autocomplete_cotrol.handleEvent();
    };
    ws.onerror = function (ex) { sControl.ref_xd.raiseError(ex); };
    ws.call(sControl.ref_xd.getDataMethodName, [tableName, condition, fields, isSeries ? 30 : 0, ""]);
};
//处理子树
function xd_add_subtree(xmlDoc, treeItem, displayFieldName, displayTreeFieldName,
    valueFieldName, parentFieldName, tipFieldName, extendFieldName, parentValue) {

    var nodes = xmlDoc.documentElement.selectNodes("Record[" + parentFieldName + "=" + parentValue + "]");
    for (var i = 0; i < nodes.length; i++) {

        var treeParam = { value: valueOf(nodes[i].selectSingleNode(valueFieldName), "text", ""),
            text: valueOf(nodes[i].selectSingleNode(displayFieldName), "text", valueOf(nodes[i].selectSingleNode(displayTreeFieldName), "text", ""))
        };

        if (extendFieldName != null && extendFieldName != "") {
            treeParam.extend = valueOf(nodes[i].selectSingleNode(extendFieldName), "text", "");
        }

        var subItem = new jetsennet.ui.TreeItem(
            valueOf(nodes[i].selectSingleNode(displayTreeFieldName), "text", ""),
            null,
            valueOf(nodes[i].selectSingleNode(tipFieldName == "" ? displayFieldName : tipFieldName), "text", ""), null, treeParam);

        treeItem.addItem(subItem);
        xd_add_subtree(xmlDoc, subItem, displayFieldName, displayTreeFieldName, valueFieldName, parentFieldName, tipFieldName, extendFieldName, treeParam.value);
    }
};
//加载树内容
function xd_getDataTree(sControl) {
    jetsennet.require("jetsentree");

    jetsennet.hidePopups();

    var tableName = sControl.getAttribute("tablename");
    var valueFieldName = sControl.getAttribute("keyfieldname");
    var displayFieldName = sControl.getAttribute("dspfieldname");
    var displayTreeFieldName = sControl.getAttribute("treedspfieldname");

    if (!displayTreeFieldName) {
        displayTreeFieldName = displayFieldName;
    }
    var parentFieldName = sControl.getAttribute("parentfieldname");
    var condition = sControl.getAttribute("condition");
    condition = condition ? condition : "";
    //提示信息
    var tipFieldName = sControl.getAttribute("tipfieldname");
    tipFieldName = tipFieldName ? tipFieldName : "";
    //扩展信息 
    var extendFieldName = sControl.getAttribute("extendfieldname");
    extendFieldName = extendFieldName ? extendFieldName : "";

    var treeIdName = sControl.getAttribute("xtype");
    treeIdName += "_";
    treeIdName += tableName;
    treeIdName += "_";
    treeIdName += valueFieldName;
    treeIdName += "_";
    treeIdName += displayFieldName;
    treeIdName += "_";
    treeIdName += condition.replace(/[^0-9a-z]/g, "");
    treeIdName += "_";
    treeIdName += parentFieldName;

    var currentTree = jetsennet.ui.Trees[treeIdName];
    if (currentTree) {
        currentTree.unselect(currentTree.selectedIndex);
        currentTree.onselect = function (e) {
            var item = currentTree.getItemByIndex(e);
            sControl.setAttribute("hiddenvalue", item.treeParam.value);
            if (item.treeParam["extend"] != null) {
                sControl.setAttribute("extend", item.treeParam["extend"]);
            }
            xd_setFieldValue(sControl, item.treeParam.value);
            sControl.value = item.treeParam.text;
            jetsennet.ui.PopupBehavior.hideControl(el(treeIdName));
        };
        jetsennet.ui.PopupBehavior.popControl(el(treeIdName), sControl, 1);
        return;
    }

    currentTree = new jetsennet.ui.Tree(treeIdName);
    currentTree.onselect = function (e) {
        var item = currentTree.getItemByIndex(e);
        sControl.setAttribute("hiddenvalue", item.treeParam.value);
        if (item.treeParam["extend"] != null) {
            sControl.setAttribute("extend", item.treeParam["extend"]);
        }
        xd_setFieldValue(sControl, item.treeParam.value);
        sControl.value = item.treeParam.text;
        jetsennet.ui.PopupBehavior.hideControl(el(treeIdName));
    };

    var ws = new jetsennet.Service(sControl.ref_xd.serviceUrl);
    ws.async = false;
    ws.cacheLevel = 2;
    ws.displayLoading = false;
    ws.oncallback = function (ret) {
        var xmlDoc = new jetsennet.XmlDoc();
        xmlDoc.loadXML(ret.resultVal);
        var nodes = xmlDoc.documentElement.selectNodes("Record[" + parentFieldName + "=0]");
        var trueValueField = xd_getTrueFieldName(valueFieldName);
        var trueTextField = xd_getTrueFieldName(displayFieldName);
        var trueTreeTextField = xd_getTrueFieldName(displayTreeFieldName);
        var trueExtendTextField = xd_getTrueFieldName(extendFieldName);

        for (var i = 0; i < nodes.length; i++) {
            var treeParam = {
                value: valueOf(nodes[i].selectSingleNode(trueValueField), "text", ""),
                text: valueOf(nodes[i].selectSingleNode(trueTextField), "text", valueOf(nodes[i].selectSingleNode(trueTreeTextField), "text", ""))
            };

            if (treeParam.value != "0") {

                if (trueExtendTextField != null && trueExtendTextField != "") {
                    treeParam.extend = valueOf(nodes[i].selectSingleNode(trueExtendTextField), "text", "");
                }

                var treeItem = new jetsennet.ui.TreeItem(
                    valueOf(nodes[i].selectSingleNode(trueTreeTextField), "text", ""),
                    null,
                    valueOf(nodes[i].selectSingleNode(tipFieldName == "" ? trueTextField : tipFieldName), "text", ""), null, treeParam);

                currentTree.addItem(treeItem);
                xd_add_subtree(xmlDoc, treeItem, trueTextField, trueTreeTextField, trueValueField, parentFieldName, tipFieldName, trueExtendTextField, treeParam.value);
            }
        }
    };
    var fields = valueFieldName + ',' + displayFieldName + ',' + parentFieldName;
    if (displayTreeFieldName != displayFieldName) {
        fields += ',' + displayTreeFieldName;
    }
    if (tipFieldName != "") {
        fields += ',' + tipFieldName;
    }
    if (extendFieldName != "" && fields.indexOf(extendFieldName) < 0) {
        fields += ',' + extendFieldName;
    }

    ws.onerror = function (ex) { sControl.ref_xd.raiseError(ex); };
    ws.call(sControl.ref_xd.getDataMethodName, [tableName, condition, fields, 0, ""]);

    var sControl1 = currentTree.render();
    if (sControl1) {
        var sControlWidth = parseInt(sControl.offsetWidth);
        var treeControl = document.createElement("DIV");
        treeControl.className = "jetsen-tree-divc";
        treeControl.style.width = (sControlWidth > 200 ? sControlWidth : 200) + "px";
        treeControl.style.height = "200px";
        treeControl.id = treeIdName;
        treeControl.onclick = function () { jetsennet.cancelEvent(); };
        treeControl.appendChild(sControl1);
        document.body.appendChild(treeControl);
        jetsennet.ui.PopupBehavior.popControl(treeControl, sControl, 1);
    }
};
var gXDataUploadData = {};
function xd_uploadFile(control) {
    var binding = control.getAttribute("binding");
    var requestPaath = control.getAttribute("requestpath");
    var uploadPath = control.getAttribute("uploadpath");
    var arrBind = binding.split("/");
    var table = xd_getControlTableXmlDom(control.ref_xd, control);
    var field = table.selectSingleNode(arrBind[arrBind.length - 1]);

    var uploadContainer = el("xdata-upload-container");
    if (uploadContainer == null) {
        uploadContainer = document.createElement("DIV");
        uploadContainer.id = "xdata-upload-container";
        uploadContainer.style.display = "none";
        document.body.appendChild(uploadContainer);
    }

    var uploadfile = valueOf(field, "text", "");
    if (uploadfile == "") {
        alert("请选择文件!");
        return;
    }
    uploadContainer.innerHTML = '<form action="' + "fileupload.ashx" + '" id="xdata-upload-form" method="post" enctype="multipart/form-data"  target="xdata-upload-frame">' +
	    '<input type="hidden" name="xdata-txtfilepath" value="' + uploadPath + '"/>' +
	    '<iframe name="xdata-upload-frame" style="display: none"></iframe></form>';

    var parentCon = control.parentNode;
    var layer = 0;
    var flag = false;
    while (parentCon && layer < 5) {
        var controls = parentCon.getElementsByTagName("input");

        for (var i = 0; i < controls.length; i++) {
            if (controls[i].type == "file") {
                gXDataUploadData.displayControl = controls[i].parentNode;
                controls[i].name = "xdata-upload-file";
                el('xdata-upload-form').appendChild(controls[i]);
                gXDataUploadData.displayControl.innerHTML = jetsennet.util.getFileName(uploadfile);
                flag = true;
                break;
            }
        }
        if (flag)
            break;
        parentCon = parentCon.parentNode;
        layer++;
    }
    if (flag) {
        gXDataUploadData.control = control;
        el('xdata-upload-form').submit();
    }
};
function xd_uploadCallback(result) {
    var imgObj = jetsennet.xml.toObject(result);
    if (imgObj.ErrorCode != "0") {
        gXDataUploadData.displayControl.innerHTML = gXDataUploadData.displayControl.innerHTML + (imgObj.ErrorString);
        return;
    }

    var binding = gXDataUploadData.control.getAttribute("binding");
    var requestPaath = gXDataUploadData.control.getAttribute("requestpath");
    var uploadPath = gXDataUploadData.control.getAttribute("uploadpath");
    var arrBind = binding.split("/");
    var table = xd_getControlTableXmlDom(gXDataUploadData.control.ref_xd, gXDataUploadData.control);
    var field = table.selectSingleNode(arrBind[arrBind.length - 1]);
    field.text = uploadPath + "/" + imgObj.File;
    gXDataUploadData.displayControl.innerHTML = gXDataUploadData.displayControl.innerHTML + " 上传成功";
    //alert(table.xml);
}
//=============================================================================
//删除RepeatTable的行
//=============================================================================
function xd_deleteRepeatTableRow(img) {
    var checkIndex = 0;
    var curNode = img;
    var deleteTrNode = null;

    while (curNode && checkIndex < 10) {

        if (deleteTrNode == null && curNode.tagName == "TR")
            deleteTrNode = curNode;

        if (curNode.tagName == "TABLE")
            break;

        curNode = curNode.parentNode;
        checkIndex++;
    }

    var table = curNode;
    if (table.ref_xd.readonly || !confirm("确定删除?")) {
        return;
    }

    var tableName = table.getAttribute("tablename");
    if (tableName == null || tableName == "") {
        tableName = table.getAttribute("binding");
    }

    var tableXmlDom = xd_getControlTableXmlDom(table.ref_xd, img, tableName);
    if (tableXmlDom.getAttribute("action") == "insert") {
        tableXmlDom.parentNode.removeChild(tableXmlDom); //delete xml
    }
    else {
        tableXmlDom.setAttribute("action", "delete");
    }

    deleteTrNode.parentNode.removeChild(deleteTrNode);

    //多主键需要添加oldValue属性
    var bingtablepks = table.getAttribute("bindpk");
    var arrPK = bingtablepks.split(",");
    for (var pk = 0; pk < arrPK.length; pk++) {
        var tempField = tableXmlDom.selectSingleNode(arrPK[pk]);

        if (tempField == null) {
            continue;
        }
        if (tempField.getAttribute("oldValue") == null || tempField.getAttribute("oldValue") == "") {
            tempField.setAttribute("oldValue", tempField.text);
        }
    }

    if (table.ref_xd.onchange && typeof table.ref_xd.onchange == "function") {
        table.ref_xd.onchange(table);
    }
};
/**
处理字段的表格条件
先从字段控件的bindcondition取
如果没有从表格的condition取
**/
function xd_dealBindingCondition(tableNode, sControl) {

    var tableCondition = sControl.getAttribute("bindcondition");
    if (tableCondition == null || tableCondition == "") {

        var tableCtrl = xd_getParentNodeByTag(sControl, "TABLE");
        if (tableCtrl) {
            tableCondition = tableCtrl.getAttribute("condition");
        }
    }

    if (tableCondition != null) {
        var tableConditionArr = tableCondition.split("=");
        if (tableConditionArr.length == 2) {

            var tableClassValue = jetsennet.util.trimEnd(jetsennet.util.trimStart(tableConditionArr[1], "'"), "'");
            var tableClassNode = tableNode.ownerDocument.createElement(tableConditionArr[0]);
            tableClassNode.text = tableClassValue;
            tableNode.appendChild(tableClassNode);
        }
    }
};

function xd_isControlInRepeatTable(sControl) {
    var checkIndex = 0;
    var curNode = sControl.parentNode;
    while (curNode && curNode.getAttribute && checkIndex < 10) {
        if (curNode.getAttribute("xtype") == "RepeatTable")
            return true;
        curNode = curNode.parentNode;
        checkIndex++;
    }
    return false;
};


//=============================================================================
// XML 内容操作
//=============================================================================

//根据输入修改xml
function xd_setFieldValue(sControl, sValue, onlyXml) {
    if (!onlyXml) {
        sControl.value = sValue;
    }

    var binding = sControl.getAttribute("binding");
    var xtype = sControl.getAttribute("xtype");

    if (binding) {
        var arrBind = binding.split("/");
        var table = xd_getControlTableXmlDom(sControl.ref_xd, sControl);
        var field = table.selectSingleNode(arrBind[arrBind.length - 1]);
        var isInRepeat = xd_isControlInRepeatTable(sControl);
        var multiRecord = true;

        if (isInRepeat) {
            multiRecord = sControl.parentNode.parentNode.parentNode.parentNode.getAttribute("multirecord") != "0";
        }

        if (!field) {
            field = sControl.ref_xd.xmlData.createElement(arrBind[arrBind.length - 1]);
            table.appendChild(field);
        }


        //RepeatTable自动增加新行
        if (isInRepeat && multiRecord) {
            //控件所在行没有下一行，则添加											
            var tr = sControl.parentNode.parentNode;
            var isNext = true;
            var next = tr;
            while (isNext) {
                next = next.nextSibling;
                if (next == null) {
                    isNext = false;
                    break;
                }

                if (next.tagName) {
                    break;
                }
            }
            if (!isNext) {//!tr.nextSibling

                var oldCells = tr.cells;
                var lastTd = oldCells[oldCells.length - 1];
                if (lastTd.className != "xdata-deletetd") {
                    lastTd = tr.ownerDocument.createElement("td");
                    lastTd.className = "xdata-deletetd";
                    tr.appendChild(lastTd);
                }
                lastTd.innerHTML = '<div class="xdata-deleteimg" onclick="xd_deleteRepeatTableRow(this);"></div>';

                var newTR = tr.cloneNode(true);
                newTR.setAttribute("condition", "");
                tr.parentNode.appendChild(newTR);

                newTR.cells[newTR.cells.length - 1].innerHTML = "<div class='xdata-appendimg'></div>";

                var forms = jetsennet.form.getElements(newTR, false, false);

                for (var i = 0; i < forms.length; i++) {
                    if (forms[i].getAttribute("xtype") != "UploadFile") {
                        forms[i].value = "";
                        try { forms[i].setAttribute("hiddenvalue", ""); } catch (e) { }
                        forms[i].ref_xd = sControl.ref_xd;

                        var classNames = valueOf(forms[i], "className", "").split(" ");
                        forms[i].className = classNames[0];

                        //if (sControl.ref_xd.editorBgColor)
                        //    forms[i].style.backgroundColor = "";
                    }

                    //设缺省值毫无意义，因为需要改变xml才起作用,而改变xml将造成不断新增				
                    //sControl.ref_xd.setDefaultValue(forms[i]);
                }

                var inputs = tr.getElementsByTagName("INPUT");
                for (var i = 0; i < inputs.length; i++) {
                    var sHidValidate = inputs[i].getAttribute("hiddenvalidatestring");
                    if (sHidValidate && sHidValidate != "") {
                        inputs[i].setAttribute("validatestring", sHidValidate);
                    }
                }
            }
        }

        //多主键需要添加oldValue属性
        if (isInRepeat && table.getAttribute("action") == "none") {
            var repTable = sControl.parentNode.parentNode.parentNode.parentNode;
            var bingtablepks = repTable.getAttribute("bindpk");
            var arrPK = bingtablepks.split(",");
            for (var iPK = 0; iPK < arrPK.length; iPK++) {
                var tempField = table.selectSingleNode(arrPK[iPK]);
                if (tempField == null) {
                    continue;
                }
                if (tempField.getAttribute("oldValue") == null || tempField.getAttribute("oldValue") == "") {
                    tempField.setAttribute("oldValue", tempField.text);
                }
            }
        }

        xd_setRules(sControl);

        field.text = (typeof sValue == "string") ? sValue.replace(/\"/g, "\'").replace(/[•]/img, "·") : sValue; //"&middot;"

        xd_SetSearchRelation(sControl, field, sValue);

        if (xtype == "DateSelector" && field.text != "" && field.text.length == 10) {
            field.text += " " + new Date().toTimeString();
        }
        else if (xtype == "Duration") {
            field.text = jetsennet.util.convertTimeToLong(sValue, 1000);
        }
        else if (xtype == "Time") {
            field.text = jetsennet.util.convertTimeToLong(sValue, 1000);
        }
        else if (xtype == "Frame") {
            field.text = jetsennet.util.convertTimeToLong(sValue, 25);
        }

        var curAction = table.getAttribute("action");
        if (curAction == null || curAction == "") {
            table.setAttribute("action", "insert");
        }
        else if (curAction == "none") {
            table.setAttribute("action", "update");
        }

        //同步绑定
        xd_SyncBinding(sControl, field.text);
        //文字绑定
        xd_TextBinding(sControl, sControl.value);
        //扩展绑定
        xd_ExtendBinding(sControl);

        //触发改变事件
        if (sControl.ref_xd.xmlData.documentElement.selectNodes("*[@action!='none']").length > 0) {
            if (sControl.ref_xd.onchange && typeof sControl.ref_xd.onchange == "function")
                sControl.ref_xd.onchange(sControl);
        }
    }
    else {
        //仅用于引用绑定	
        xd_setRules(sControl);
        //同步绑定
        var flagSync = xd_SyncBinding(sControl, sValue);
        //文字绑定
        var flagText = xd_TextBinding(sControl, sControl.value);
        //扩展绑定
        var flagExtend = xd_ExtendBinding(sControl);

        //触发改变事件
        if ((flagSync || flagText) && sControl.ref_xd.xmlData.documentElement.selectNodes("*[@action!='none']").length > 0) {
            if (sControl.ref_xd.onchange && typeof sControl.ref_xd.onchange == "function")
                sControl.ref_xd.onchange(sControl);
        }
    }
};
//值同步绑定
function xd_SyncBinding(sControl, value) {
    var sync_binding = sControl.getAttribute("sync_binding");
    if (!sync_binding)
        return;

    var arrSync = sync_binding.split("/");
    var tablenameSync = arrSync.slice(0, arrSync.length - 1).join("/");
    var fieldNameSync = arrSync[arrSync.length - 1];
    var xmlTable = xd_getControlTableXmlDom(sControl.ref_xd, sControl, tablenameSync);
    var xmlField = xmlTable.selectSingleNode(fieldNameSync);
    if (!xmlField) {
        xmlField = sControl.ref_xd.xmlData.createElement(fieldNameSync);
        xmlTable.appendChild(xmlField);
    }
    xmlField.text = value;

    xd_SetSearchRelation(sControl, xmlField, value);

    if (xmlTable.getAttribute("action") == "none") {
        xmlTable.setAttribute("action", "update");
    }
    return true;
};
//文本同步绑定
function xd_TextBinding(sControl, value) {
    var text_binding = sControl.getAttribute("text_binding");
    if (!text_binding)
        return;
    var arrText = text_binding.split("/");
    var tablenameText = arrText.slice(0, arrText.length - 1).join("/");
    var fieldNameText = arrText[arrText.length - 1];
    var xmlTable = xd_getControlTableXmlDom(sControl.ref_xd, sControl, tablenameText);
    var xmlField = xmlTable.selectSingleNode(fieldNameText);
    if (!xmlField) {
        xmlField = sControl.ref_xd.xmlData.createElement(fieldNameText);
        xmlTable.appendChild(xmlField);
    }
    xmlField.text = value;

    if (xmlTable.getAttribute("action") == "none") {
        xmlTable.setAttribute("action", "update");
    }
    return true;
};
//扩展同步绑定
function xd_ExtendBinding(sControl) {
    var extend_binding = sControl.getAttribute("extend_binding");
    if (!extend_binding)
        return;

    var extendValue = sControl.getAttribute("extend");
    if (extendValue == null)
        return;

    var arrText = extend_binding.split("/");
    var tablenameExtend = arrText.slice(0, arrText.length - 1).join("/");
    var fieldNameExtend = arrText[arrText.length - 1];
    var xmlTable = xd_getControlTableXmlDom(sControl.ref_xd, sControl, tablenameExtend);
    var xmlField = xmlTable.selectSingleNode(fieldNameExtend);
    if (!xmlField) {
        xmlField = sControl.ref_xd.xmlData.createElement(fieldNameExtend);
        xmlTable.appendChild(xmlField);
    }
    xmlField.text = extendValue;

    sControl.ref_xd.foreachControl(function (control) {
        var xtype = control.getAttribute("xtype");
        var binding = control.getAttribute("binding");
        if (binding == extend_binding) {
            control.value = extendValue;
            sControl.ref_xd.setControlValue(control);
            return false;
        }
        return true;
    });

    if (xmlTable.getAttribute("action") == "none") {
        xmlTable.setAttribute("action", "update");
    }
    return true;
};
//设置搜索条件
function xd_SetSearchRelation(sControl, field, sValue) {
    var relation = sControl.getAttribute("relation");
    var xtype = sControl.getAttribute("xtype");
    switch (relation) {
        case "1":
            field.setAttribute("than", (xtype == "DateSelector" && sValue != "") ? sValue + " 00:00:00" : sValue);
            break;
        case "2":
            field.setAttribute("less", (xtype == "DateSelector" && sValue != "") ? sValue + " 23:59:59" : sValue);
            break;
        case "3":
            field.setAttribute("thanequal", (xtype == "DateSelector" && sValue != "") ? sValue + " 00:00:00" : sValue);
            break;
        case "4":
            field.setAttribute("lessequal", (xtype == "DateSelector" && sValue != "") ? sValue + " 23:59:59" : sValue);
            break;
        case "100":
            field.setAttribute("keyfieldname", sControl.getAttribute("keyfieldname"));
            field.setAttribute("parentfieldname", sControl.getAttribute("parentfieldname"));
            field.setAttribute("tablename", sControl.getAttribute("tablename"));
            break;
    }
    relation ? field.setAttribute("relation", relation) : void (0);
}
//获得控件绑定对应的表节点
function xd_findControlTableXmlDom(xd, sControl, tableName) {
    var binding = tableName ? tableName + "/NONE" : sControl.getAttribute("binding");
    var arrBind = binding.split("/");

    if (!tableName) {
        tableName = arrBind.slice(0, arrBind.length - 1).join("/");
    }

    var xmlTable = null;
    var isInRepeat = xd_isControlInRepeatTable(sControl);

    xmlTable = xd.xmlData.documentElement.selectSingleNode(tableName + "[@action!='delete']");

    if (isInRepeat && xmlTable != null) {
        xmlTable = null;
        var tr = xd_getParentNodeByTag(sControl, "TR");
        var condition = tr.getAttribute("condition");

        if (condition && condition != "") {
            xmlTable = xd.xmlData.documentElement.selectSingleNode(tableName + "[@action!='delete' and " + condition + "]");
        }
    }
    return xmlTable;
};
//获得控件绑定对应的表节点,如果为空则新建;
function xd_getControlTableXmlDom(xd, sControl, tableName) {
    var binding = tableName ? tableName + "/NONE" : sControl.getAttribute("binding");
    var arrBind = binding.split("/");

    if (!tableName) {
        tableName = arrBind.slice(0, arrBind.length - 1).join("/");
    }

    var xmlTable = null;
    var xmlParentTable = null;
    var isInRepeat = xd_isControlInRepeatTable(sControl);
    var tr = xd_getParentNodeByTag(sControl, "TR");
    var refCondition = attributeOf(tr, "refcondition", "");
    var condition = attributeOf(tr, "condition", "");
    var bindCondition = attributeOf(tr, "bindcondition", "");

    //行的条件
    if (bindCondition && bindCondition != "") {
        xmlTable = xd.xmlData.documentElement.selectSingleNode(tableName + "[@action!='delete' and " + bindCondition + "]");
    }
    else if (condition && condition != "") {
        xmlTable = xd.xmlData.documentElement.selectSingleNode(tableName + "[@action!='delete' and " + condition + "]");
    }

    //父节点，在多层级中有用
    if (refCondition && refCondition != "") {
        xmlParentTable = xd.xmlData.documentElement.selectSingleNode(arrBind.slice(0, arrBind.length - 2).join("/") + "[" + refCondition + "]");
    }
    else if (arrBind.length > 2) {
        xmlParentTable = xd.xmlData.documentElement.selectSingleNode(arrBind.slice(0, arrBind.length - 2).join("/"));
    }

    if ((bindCondition == null || bindCondition == "") && !isInRepeat && xmlTable == null) {
        xmlTable = xd.xmlData.documentElement.selectSingleNode(tableName + "[@action!='delete']");
    }

    if (xmlTable == null) {
        //创建记录行
        xmlTable = xd.xmlData.createElement(arrBind[arrBind.length - 2]);
        xmlTable.setAttribute("action", "insert");

        if (xmlParentTable == null) {
            xd.xmlData.documentElement.appendChild(xmlTable);
        }
        else {
            xmlParentTable.appendChild(xmlTable);
        }

        //处理绑定过滤条件
        xd_dealBindingCondition(xmlTable, sControl);
    }
    if (isInRepeat) {
        //重新设定行的标识，以免数据更改无法读取
        var filterId = jetsennet.util.Guid.NewGuid().toString();
        xmlTable.setAttribute("RowFilter", filterId);
        tr.setAttribute("condition", "@RowFilter='" + filterId + "'");
    }

    return xmlTable;
};
//取父级节点中指定标签节点
function xd_getParentNodeByTag(element, tagName) {
    var checkIndex = 0;
    var retNode = null;
    var curNode = element;
    while (curNode && checkIndex < 10) {
        if (curNode.tagName == tagName) {
            retNode = curNode;
            break;
        }
        curNode = curNode.parentNode;
        checkIndex++;
    }
    return retNode;
};
//根据绑定值取控件
function xd_getControlByBinding(xPath, xd) {
    var inputs = jetsennet.form.getElements(xd.container, false, false);
    var n = inputs.length;
    for (var i = 0; i < n; i++) {
        if (inputs[i].getAttribute("binding") == xPath) {
            return inputs[i];
        }
    }
    return null;
};
//=============================================================================
// 扩展
//=============================================================================
//处理分类控制复分类
function dealClassControlCondition(control, i) {
    if (!i)
        i = 0;
    var parentTr = control.parentNode.parentNode.childNodes;
    var aimObj = parentTr[i].firstChild;
    if (aimObj && control.value != "") {
        var condition = aimObj.getAttribute("condition");
        aimObj.setAttribute('condition', 'TYPE IN (' + control.getAttribute("extend") + ')');
        if (aimObj.getAttribute('hiddenvalue')) {
            aimObj.value = "";
        }
    }
};
//使下一控件可用
function EnableNextCtrl(control, i) {
    if (!i) {
        i = control.parentNode.cellIndex + 1;
    }
    var parentTr = control.parentNode.parentNode.childNodes;
    var aimObj = parentTr[i].firstChild;
    if (aimObj) {
        aimObj.disabled = false;
    }
};