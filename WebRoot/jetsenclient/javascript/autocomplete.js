// xiaomin 2008-12-26  
//=============================================================================
// jetsennet AutoComplete;
//=============================================================================
/*
var autoComplete = jQuery("#txt_AutoComplete").autoComplete();
//var autoComplete = jQuery.extend(new jetsennet.ui.AutoComplete(),{control:el('txt_AutoComplete')});
autoComplete.appendItem({text:"123456",value:"123456"});
autoComplete.appendItem({text:"adfefedf",value:"5645"});
autoComplete.sortItems();
*/
jetsennet.addLoadedUri(jetsennet.getloadUri("autocomplete"));
jetsennet.importCss("jetsenui");

/**
提供全局访问控件的方法
*/
jetsennet.ui.AutoCompletes = jetsennet.ui.DropDownList = {};
/**
初始化控件选项
*/
jetsennet.ui.DropDownList.initOptions = function (instanceName, emptyCreate) {
    var sControl = el(instanceName);
    if (jetsennet.ui.AutoCompletes[instanceName] == null) {
        var handing = sControl.getAttribute("handing");
        if (handing || emptyCreate) {

            var autoCon = jQuery.extend(new jetsennet.ui.AutoComplete(instanceName), {
                control: sControl, eventType: 99, maxDisplayItems: 0, showMatchItem: false, scaleDisplay: false, colorMatchItem: false, selectedValue: attributeOf(sControl, "selectedvalue", "")
            });
            autoCon.size.maxHeight = 200;

            handing = handing ? handing : "";
            var arr = handing.split("|");
            for (var i = 0; i < arr.length; i++) {
                var valueHtml = arr[i].split("~");
                autoCon.appendItem({ text: valueHtml[0], value: valueHtml[1] , title: valueHtml[2]});
            }
            if (arr.length > 10) {
                autoCon.size.height = 200;
            }
            return true;
        }
    }
    return false;
};
/**
显示控件,如果控件未初始化，会先初始化
*/
jetsennet.ui.DropDownList.show = function (txtContorl) {
    var sControl = el(txtContorl);
    if (sControl == null)
        return;

    var instanceName = sControl.id;

    if (jetsennet.ui.AutoCompletes[instanceName] == null) {
        if (jetsennet.ui.DropDownList.initOptions(instanceName))
            jetsennet.ui.AutoCompletes[instanceName].handleEvent();
    }
    else {
        jetsennet.ui.AutoCompletes[instanceName].handleEvent();
    }
};

jetsennet.ui.AutoComplete = function (instanceName) {
    this.dataItems = [];
    this.currentItems = null;
    this.maxDisplayItems = 20;              //项的最大显示数
    this.textFieldName = "text";
    this.valueFieldName = "value";
    this.extendFieldName = "extend";
    this.emptyDisplay = true;               //当文本框值为空是是否显示 
    this.hasItems = false;
    this.position = -1;
    this.allowEmpty = false;
    this.showExtendInfo = false;            //显示扩展信息
    this.extendInfoSize = 80;
    this.colorMatchItem = true;
    this.showMatchItem = true;              //仅显示匹配列表
    this.eventType = 0;                     //事件类型 0：点击事件，99：忽略按键事件
    this.fontSize = 14;                     //字体大小(px)
    this.fontScale = 3;                     //缩放级别
    this.scaleDisplay = false;              //缩放显示，放大镜效果
    this.selectedValue = "";                //选中值	
    this.initialed = false;
    this.size = {};
    this.onchanged = null;
    this.control = null;

    instanceName = instanceName ? instanceName : "AutoComplete";
    jetsennet.ui.AutoCompletes[instanceName] = this;
    this.instance = this;
};
/**
根据索引来设定当前选项 - 不建议使用
*/
jetsennet.ui.AutoComplete.prototype.setSelectedIndex = function (index) {
    if (this.dataItems.length <= index)
        return;

    var oldValue = this.selectedValue;
    this.selectedValue = this.dataItems[index].value;

    if (this.control != null) {
        this.control.value = this.dataItems[index]["text"];
        this.control.setAttribute("selectedvalue", this.selectedValue);
    }

    //改变事件
    if (oldValue != this.selectedValue && jQuery.isFunction(this.onchanged)) {
        this.onchanged(this.dataItems[index]);
    }
};

/**
根据选项值来设定当前选项 - 不建议使用
*/
jetsennet.ui.AutoComplete.prototype.setValue = function (value) {

    var oldValue = this.selectedValue;
    this.selectedValue = "";

    if (this.control != null) {
        this.control.value = "";
    }

    var len = this.dataItems.length;
    for (var i = 0; i < len; i++) {
        if (this.dataItems[i]["value"] == value) {
            this.selectedValue = value;

            if (this.control != null) {
                this.control.value = this.dataItems[i]["text"];
                this.control.setAttribute("selectedvalue", this.selectedValue);
            }

            //改变事件
            if (oldValue != value && jQuery.isFunction(this.onchanged)) {
                this.onchanged(this.dataItems[i]);
            }
            break;
        }
    }
};
/**
根据选项文本来设定当前选项 - 不建议使用
*/
jetsennet.ui.AutoComplete.prototype.setText = function (txtValue) {
    if (txtValue == null || txtValue == "")
        return;

    var values = [];
    var currentValue = this.selectedValue;
    this.selectedValue = "";

    if (this.control != null) {
        this.control.value = "";
    }

    var len = this.dataItems.length;
    for (var i = 0; i < len; i++) {
        if (this.dataItems[i]["text"] == txtValue) {
            if (currentValue == this.dataItems[i]["value"]) {
                this.selectedValue = currentValue;
                if (this.control != null) {
                    this.control.setAttribute("selectedvalue", this.selectedValue);
                    this.control.value = txtValue;
                }
                break;
            }
            else {
                values.push(i);
            }
        }
    }
    if (this.selectedValue == "") {
        if (values.length > 0) {
            this.selectedValue = this.dataItems[values[0]].value;
            if (this.control != null) {
                this.control.setAttribute("selectedvalue", this.selectedValue);
                this.control.value = txtValue;
            }

            //改变事件
            if (this.onchanged && jQuery.isFunction(this.onchanged)) {
                this.onchanged(this.dataItems[values[0]]);
            }
        }
    }
};
jetsennet.ui.AutoComplete.prototype.getItemCount = function () {
    return this.dataItems.length;
};
/**
根据数据源添加数据项
数据源的每项都应该提供textFieldName,valueFieldName属性
*/
jetsennet.ui.AutoComplete.prototype.bindData = function (dataSource, textFieldName, valueFieldName) {
    if (dataSource) {
        var itemLength = dataSource.length;
        for (var i = 0; i < itemLength; i++) {
            this.dataItems.push({ text: dataSource[i][textFieldName], value: dataSource[i][valueFieldName] })
        }
        this.dataItems.sort(this.basicCompare);
    }
    return this;
};
/**追加项*/
jetsennet.ui.AutoComplete.prototype.appendItem = function (item) {
    this.dataItems.push(item);
    return this;
};
/**数据项排序*/
jetsennet.ui.AutoComplete.prototype.sortItems = function () {
    this.dataItems.sort(this.basicCompare);
    return this;
};
jetsennet.ui.AutoComplete.prototype.clear = function () {
    if (this.listControl)
        this.listControl.innerHTML = "";

    this.currentItems = [];
    this.dataItems = [];
    this.hasItems = false;
    return this;
};
jetsennet.ui.AutoComplete.prototype.handleEvent = function () {

    var evt = jetsennet.getEvent();
    var srcElement = IS_IE ? evt.srcElement : evt.target;
    var evtCode = evt.keyCode ? evt.keyCode : evt.which;
    this.initialize(srcElement);

    if (this.dataItems == null || this.dataItems.length == 0) {
        jetsennet.hide(this.listControl);
        return;
    }

    if (srcElement == null || (srcElement.tagName != 'INPUT' && srcElement.getAttribute('type') != 'text'))
        return;

    if ((evtCode == 38 || evtCode == 40 || evtCode == 13)) {
        this.instance.handleKey(evt);
        return;
    }

    var curValue = srcElement.value;
    var itemLength = this.dataItems.length;
    var curLength = this.dataItems.length;
    var firstChar = jetsennet.util.left(curValue, 1).toLowerCase();
    var maxIndex = this.maxDisplayItems == 0 ? 1000 : this.maxDisplayItems;
    var startPos = 0;
    var endPos = itemLength;

    if (!this.showMatchItem || firstChar == "") {
        this.clearDisplay();

        this.position = -1;

        if (firstChar == "") {
            this.selectedValue = "";
        }
        if (this.emptyDisplay || firstChar != "") {
            var displayIndex = 0;
            for (var i = startPos; i < endPos && displayIndex <= maxIndex; i++) {
                this.instance.createItem(this.dataItems[i], displayIndex, srcElement);
                displayIndex++;
                this.hasItems = true;
            }
        }
    }
    else {
        //清空控件
        this.clearDisplay();

        var tempChar = jetsennet.util.left(this.dataItems[parseInt(curLength / 2)].text, 1).toLowerCase();
        var flag = false;
        var index = 0;

        while (!flag || index >= itemLength) {
            if (tempChar > firstChar) {
                endPos = startPos + parseInt(curLength / 2);
            }
            else if (tempChar < firstChar) {
                startPos = startPos + parseInt(curLength / 2);
            }
            else {
                var curPos = startPos + parseInt(curLength / 2);

                //开始索引号
                startPos = curPos;
                while (firstChar == tempChar) {
                    startPos = startPos - 50;
                    if (startPos <= 0) {
                        startPos = 0;
                        break;
                    }
                    tempChar = jetsennet.util.left(this.dataItems[startPos].text, 1).toLowerCase();
                }

                //结束索引号
                endPos = curPos;
                tempChar = jetsennet.util.left(this.dataItems[endPos].text, 1).toLowerCase();
                while (firstChar == tempChar) {
                    endPos = endPos + 50;
                    if (endPos >= itemLength) {
                        endPos = itemLength;
                        break;
                    }
                    tempChar = jetsennet.util.left(this.dataItems[endPos].text, 1).toLowerCase();
                }
                flag = true;
            }
            if (endPos == 0 || curLength < 5)
                break;
            curLength = endPos - startPos;
            tempChar = jetsennet.util.left(this.dataItems[startPos + parseInt(curLength / 2)].text, 1).toLowerCase();

            index++;
        }

        var valueReg = new RegExp("^" + this.getRegValue(curValue) + "", "i");
        var displayIndex = 0;
        this.position = -1;

        for (var i = startPos; i < endPos && displayIndex <= maxIndex; i++) {
            if (curValue == "" || valueReg.test(this.dataItems[i].text)) {
                this.instance.createItem(this.dataItems[i], displayIndex, srcElement);
                displayIndex++;
                this.hasItems = true;
            }
        }
    }

    if (this.hasItems) {
        this.setScale();
    }

    if (this.instance) {

        if (this.hasItems) {
            var width = valueOf(this.size, "width", 0);
            if (width == 0) {
                var edgeSize = jetsennet.util.getControlEdgeSize(this.listControl);
                var controlWidth = jetsennet.util.getControlSize(srcElement).viewWidth;
                this.listControl.style.width = Math.max(1, controlWidth - edgeSize.left - edgeSize.right) + "px";
            }

            jetsennet.popup(this.listControl, { reference: srcElement, position: 1 });
        }
        else {
            jetsennet.hide(this.listControl);
        }
    }
};
/**初始化*/
jetsennet.ui.AutoComplete.prototype.initialize = function () {

    if (!this.initialed) {
        this.initialed = true;

        if (this.control != null) {
            if (this.eventType == 0) {
                this.control.onclick = function () { jetsennet.ui.AutoCompletes[instanceName].handleEvent(); };
            }
            if (this.eventType != 99) {
                this.control.onkeyup = function () { jetsennet.ui.AutoCompletes[instanceName].handleEvent(); };
            }
        }

        var container = jQuery("<div>", {}).css({ display: "none", position: "absolute", overflow: "auto", overflowX: "hidden" }).addClass("jetsen-autocomplete-divc").appendTo("body");
        this.listControl = container[0];

        var edgeSize = jetsennet.util.getControlEdgeSize(this.listControl);
        var height = valueOf(this.size, "height", 0);
        var maxHeight = valueOf(this.size, "maxHeight", 0);
        var width = valueOf(this.size, "width", 0);

        if (height > 0 && this.maxDisplayItems == 0) {
            this.listControl.style.height = Math.max(20, height - edgeSize.top - edgeSize.bottom) + "px";
        }
        if (maxHeight > 0) {
            container.css("max-height", maxHeight + "px");
        }
        if (width > 0) {
            this.listControl.style.width = Math.max(1, width - edgeSize.left - edgeSize.right) + "px";
        }
    }
};

jetsennet.ui.AutoComplete.prototype.dispose = function () {

    this.dataItems = [];
    this.currentItems = null;
    this.onchanged = null;
    jQuery(this.listControl).hidepop().html("").remove();

};
/**
按键事件
*/
jetsennet.ui.AutoComplete.prototype.handleKey = function (e) {
    var evtCode = e.keyCode ? e.keyCode : e.which;
    var srcElement = e.srcElement;
    var l = this.listControl.childNodes.length;

    if (evtCode == 40) {
        if (this.position < l && this.position >= 0)
            this.listControl.childNodes[this.position].className = "jetsen-autocomplete-mouseout";

        (this.position >= l - 1) ? this.position = 0 : this.position++;
        this.listControl.childNodes[this.position].className = "jetsen-autocomplete-mouseover";
    }
    else if (evtCode == 38) {
        if (this.position < l && this.position >= 0)
            this.listControl.childNodes[this.position].className = "jetsen-autocomplete-mouseout";

        this.position-- <= 0 ? this.position = this.listControl.childNodes.length - 1 : "";
        this.listControl.childNodes[this.position].className = "jetsen-autocomplete-mouseover";
    }
    else if (evtCode == 13) {
        if (this.position >= 0 && this.listControl.childNodes[this.position]) {

            var oldValue = this.selectedValue;
            var itemText = this.currentItems[this.position][this.textFieldName];
            this.selectedValue = this.currentItems[this.position][this.valueFieldName];

            jetsennet.hide(this.listControl);

            if (srcElement != null) {
                srcElement.setAttribute("selectedvalue", this.selectedValue);
                srcElement.value = itemText;
                srcElement.focus();
            }

            if (oldValue != this.selectedValue && jQuery.isFunction(this.onchanged)) {
                this.onchanged(this.currentItems[this.position]);
            }

            this.position = -1;
        }
    }
    this.setScale();
};
//私有方法 
jetsennet.ui.AutoComplete.prototype.itemClick = function (itemindex, srcElement) {

    itemindex = parseInt(itemindex);
    if (this.currentItems.length < itemindex)
        return;

    var oldValue = this.selectedValue;
    var itemText = this.currentItems[itemindex][this.textFieldName];
    this.position = itemindex;
    this.selectedValue = this.currentItems[itemindex][this.valueFieldName];

    jetsennet.hide(this.listControl);

    srcElement.setAttribute("selectedvalue", this.selectedValue);
    srcElement.value = itemText;
    srcElement.focus();

    if (document.selection) {
        var rng = srcElement.createTextRange();
        rng.moveStart('character', itemText.length);
        rng.collapse(true);
        rng.select();
    }

    if (oldValue != this.selectedValue && jQuery.isFunction(this.onchanged)) {
        this.onchanged(this.currentItems[itemindex]);
    }
};
//私有方法 
jetsennet.ui.AutoComplete.prototype.basicCompare = function compare(n1, n2) {
    //return n1.value.localeCompare(n2.value);
    if (n1.text.toLowerCase() < n2.text.toLowerCase())
        return -1;
    if (n2.text.toLowerCase() < n1.text.toLowerCase())
        return 1;
    return 0;
};
//私有方法 
jetsennet.ui.AutoComplete.prototype.createItem = function (item, index, srcElement) {
    var owner = this;
    this.currentItems.push(item);
    var controlValue = srcElement.value;
    var displayText = jetsennet.util.isNullOrEmpty(item.text) ? "&nbsp;" : item.text;
    var extendInfo = valueOf(item, this.extendFieldName, "");

    var divItem = jQuery("<div>", {}).addClass("jetsen-autocomplete-mouseout")
    .mouseover(function () {
        var l = owner.listControl.childNodes.length;
        if (owner.position < l && owner.position >= 0) {
            owner.listControl.childNodes[owner.position].className = "jetsen-autocomplete-mouseout";
        }
        var index = this.getAttribute("itemindex");
        owner.position = index;
        this.className = "jetsen-autocomplete-mouseover";
        owner.setScale(index);
    })
    .mouseout(function () { this.className = "jetsen-autocomplete-mouseout"; })
    .click(function () { owner.itemClick(this.getAttribute("itemindex"), srcElement); })
    .css({ "lineHeight": "180%" }).appendTo(this.listControl);
    if (item.title) {
        divItem.attr("title", item.title);
    }
    divItem[0].setAttribute("itemindex", index);


    if (controlValue) {
        //设定控件值
        if (this.selectedValue == "" && displayText == controlValue) {
            this.selectedValue = item.value;
            this.position = index;
            if (this.onchanged && jQuery.isFunction(this.onchanged)) {
                this.onchanged(this.currentItems[this.position]);
            }
        }

        displayText = jetsennet.xml.htmlEscape(displayText);
        var textTemp = displayText;
        if (this.colorMatchItem) {
            var textReg = new RegExp("(" + this.getRegValue(controlValue) + ")", "i");
            textTemp = displayText.replace(textReg, "<span class='jetsen-autocomplete-matchtext'>$1</span>");
        }

        divItem.html(!this.showExtendInfo ?
            textTemp : "<table style='width:100%;table-layout:fixed'><tr><td>" + textTemp + "</td><td align='right' width='" +
                            this.extendInfoSize + "px' class='jetsen-autocomplete-extendinfo'>" + extendInfo + "</td></tr><table>");
    }
    else {
        displayText = jetsennet.xml.htmlEscape(displayText);
        divItem.html(!this.showExtendInfo ?
            displayText : "<table style='width:100%;table-layout:fixed'><tr><td>" + displayText + "</td><td align='right' width='" +
                            this.extendInfoSize + "px' class='jetsen-autocomplete-extendinfo'>" + extendInfo + "</td></tr><table>");
    }
};
jetsennet.ui.AutoComplete.prototype.clearDisplay = function () {
    jQuery(this.listControl).html("");
    this.currentItems = [];
    this.hasItems = false;
};
//私有方法
jetsennet.ui.AutoComplete.prototype.setScale = function (curIndex) {
    var owner = this;
    if (owner.scaleDisplay) {
        var index = parseInt(curIndex != null ? curIndex : owner.position);
        if (owner.currentItems.length <= index || index < 0)
            return;

        for (var i = index; i >= 0; i--) {
            if (jetsennet.util.trim(owner.currentItems[i][owner.textFieldName]) == "")
                continue;
            var size = owner.fontSize + ((i > (index - 4)) ? (4 - (index - i)) * owner.fontScale - owner.fontScale : 0);
            size = size < 0 ? 1 : size;
            owner.listControl.childNodes[i].style.fontSize = size + "px";
        }

        for (var i = index; i < owner.currentItems.length; i++) {
            if (jetsennet.util.trim(owner.currentItems[i][owner.textFieldName]) == "")
                continue;
            var size = owner.fontSize + ((i < (index + 4)) ? (4 - (i - index)) * owner.fontScale - owner.fontScale : 0);
            size = size < 0 ? 1 : size;
            owner.listControl.childNodes[i].style.fontSize = size + "px";
        }
    }
};
//私有方法
jetsennet.ui.AutoComplete.prototype.getRegValue = function (val) {
    if (val != "") {
        val = val.toRegExp();
    }
    return val;
};

/**
快捷方式
@Option AutoComplete的属性
*/
jQuery.fn.autoComplete = function (options) {

    if (this.size() == 0) {
        return null;
    }

    var autoComplete = jQuery.extend(new jetsennet.ui.AutoComplete(valueOf(options, "instanceId", "")), options);
    this.click(function () { autoComplete.handleEvent(); }).keyup(function () { autoComplete.handleEvent(); });

    return autoComplete;
};