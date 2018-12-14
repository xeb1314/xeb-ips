/**
时码编辑控件
lixiaomin 2010-06-30

规范化用户输入的内容，使之符合时码的规范
可规范00:00:00:00,00:00:00:000,00:00:00格式
无法输入超过24小时的时码
*/
jetsennet.registerNamespace("jetsennet.ui.TimeEditor");
jetsennet.addLoadedUri(jetsennet.getloadUri("timeeditor"));

jetsennet.ui.TimeEditor = function (control, editType) {
    if (control == null)
        return;

    var initialized = control.getAttribute("timeditinitialized");
    if (initialized == "1")
        return;

    this.control = control;
    this.editType = editType ? editType : 1;
    this.defaultValue = "00:00:00:00";
    this.maxValueLength = 12;

    this.init();
};

jetsennet.ui.TimeEditor.prototype.init = function () {
    switch (this.editType) {
        case 1:
            this.defaultTime = "00:00:00:00";
            this.maxValueLength = 11;
            break;
        case 2:
            this.defaultTime = "00:00:00:000";
            this.maxValueLength = 12;
            break;
        case 3:
            this.defaultTime = "00:00:00";
            this.maxValueLength = 8;
            break;
    };
    var owner = this;
    jQuery(this.control).keydown(function () { owner.keyDown(); }).blur(function () { owner.blur(); });

    if (this.control.value == "")
        this.control.value = this.defaultTime;

    this.control.setAttribute("timeditinitialized", "1");
    this.control.setAttribute("timeditvalue", this.control.value)
};
jetsennet.ui.TimeEditor.prototype.keyDown = function () {
    var evt = jetsennet.getEvent();
    var keyCode = evt.keyCode || evt.which;

    // 9:table  16:shift  37-40 方向键
    if (keyCode == 9 || keyCode == 16 || keyCode == 17 || keyCode == 18 || keyCode == 38 || keyCode == 40 || keyCode == 37 || keyCode == 39 || keyCode == 13)
        return true;

    if ((keyCode > 47) && (keyCode < 58))
        this.renderControl(keyCode - 48);

    if ((keyCode > 95) && (keyCode < 106))
        this.renderControl(keyCode - 96);

    else if ((keyCode == 8))    //backspace
        this.renderControl(11);

    else if ((keyCode == 46))   //delete
        this.renderControl(10);

    else if ((keyCode == 32))   //space
        this.renderControl(0);

    jetsennet.cancelEvent();
    return false;
};
jetsennet.ui.TimeEditor.prototype.blur = function () {
    var oldValue = this.control.getAttribute("timeditvalue");
    if (oldValue != null && oldValue != this.control.value) {
        this.control.setAttribute("timeditvalue", this.control.value);
        try { this.control.fireEvent("onchange"); } catch (e) { }
    }
};
jetsennet.ui.TimeEditor.prototype.renderControl = function (keyNumber) {
    var cursorPosition = this.getCursorPositon();
    var controlValue = this.control.value.trim();
    var inputNumber = keyNumber;

    if (keyNumber == 11) {
        cursorPosition = cursorPosition - 1;
        inputNumber = 0;
        if (cursorPosition == 2 || cursorPosition == 5 || cursorPosition == 8)
            cursorPosition = cursorPosition - 1;
    }
    else if (keyNumber == 10) {
        inputNumber = 0;
    }
    else {
        if (cursorPosition == 2 || cursorPosition == 5 || cursorPosition == 8)
            cursorPosition = cursorPosition + 1;
    }

    switch (cursorPosition) {
        case 0:
            if (inputNumber > 2)
                return;
            //            var nextValue = parseInt(controlValue.substring(1,2));
            //            if (inputNumber>2 || (inputNumber==2 && nextValue!=0 && nextValue>3)) 
            //                return;      
            break;
        case 1:
            var prevValue = parseInt(controlValue.substring(0, 1));
            if (prevValue == 2 && inputNumber > 3)
                return;
            break;
        case 3:
        case 6:
            if (inputNumber > 5)
                return;
            break;
        case 9:
            var nextValue = parseInt(controlValue.substring(10, 11));
            if (this.editType == 1) {
                if (inputNumber > 2 || (inputNumber == 2 && nextValue != 0 && nextValue > 4))
                    return;
            }
            else if (this.editType == "3") {
                return;
            }
            break;
        case 10:
            var prevValue = parseInt(controlValue.substring(9, 10));
            if (this.editType == 1) {
                if (prevValue == 2 && inputNumber > 4)
                    return;
            }
            else if (this.editType == 3)
                return;
            break;
    }
    var tempValue = controlValue.substring(0, cursorPosition) + inputNumber + controlValue.substring(cursorPosition + 1, controlValue.length);
    if (cursorPosition == 0 && inputNumber == 2) {
        var nextValue = parseInt(tempValue.substring(1, 2));
        if (nextValue != 0 && nextValue > 3) {
            tempValue = "20" + tempValue.substring(2, tempValue.length);
        }
    }

    if (tempValue.length <= this.maxValueLength)
        this.control.value = tempValue;

    if (this.control.value.length > this.maxValueLength) {
        this.control.value = this.control.value.substring(0, this.maxValueLength);
    }

    var reg = new RegExp("([01][0-9]|[2][0123]):([012345][0-9]):([012345][0-9])([0-9][0-9][0-9]?)?", "i");
    if (!reg.test(this.control.value)) {
        this.control.value = this.defaultTime;
    }

    if (keyNumber != 10 && keyNumber != 11) {
        if (cursorPosition == 1 || cursorPosition == 4 || cursorPosition == 7)
            this.setCursorPositon(cursorPosition + 2);
        else
            this.setCursorPositon(cursorPosition + 1);
    }
    else {
        this.setCursorPositon(cursorPosition);
    }
};
//获取光标位置
jetsennet.ui.TimeEditor.prototype.getCursorPositon = function () {
    var evt = jetsennet.getEvent();
    var obj = evt.target || evt.srcElement;
    var pos;
    if (document.selection) {
        if (obj.tagName != undefined && obj.tagName == 'INPUT') {
            s = document.selection.createRange();
            s.setEndPoint("EndToStart", obj.createTextRange());
            var pos = s.text.length;
        }
        else {
            var rng = obj.createTextRange();
            rng.moveToPoint(evt.x, evt.y);
            rng.moveStart("character", -obj.value.length);
            pos = rng.text.length;
        }
    }
    else {
        pos = obj.selectionStart;
    }
    return pos;
};
//设置光标
jetsennet.ui.TimeEditor.prototype.setCursorPositon = function (index) {
    var evt = jetsennet.getEvent();
    var obj = evt.target || evt.srcElement;
    var pos;
    if (document.selection) {
        var rng = obj.createTextRange();
        //rng.moveToPoint(_evt.x,_evt.y);           
        rng.moveStart("character", -obj.value.length);
        rng.moveStart('character', index);
        rng.collapse(true);
        rng.select();
    }
    else {
        obj.selectionStart = index;
        obj.selectionEnd = index;
    }
};

jQuery.fn.timeEditor = function (options) {
    return new jetsennet.ui.TimeEditor(this[0], valueOf(options,"editType",1));
};