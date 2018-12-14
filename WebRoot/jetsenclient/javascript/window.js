//lixiaomin
//=============================================================================
// jetsennet.ui.Window;
// Window只负责窗口的外层容器，并不处理窗口内容，这意味着销毁窗口后内容仍然存在
// 窗口并不是复制内容的副本而是直接引用，这使得两个窗口引用相同的内容会使内容出
// 现在最后引用的窗口上
// 窗口的模态是通过遮掩层来实现，如果不显示遮掩层，模态毫无意义
// 遮掩层的意义不仅在于模态，还用于提高窗口的层次级别

//2012-03-21 修改窗口的状态变更时的位置问题(有时出现在0,0)
//=============================================================================	 
jetsennet.addLoadedUri(jetsennet.getloadUri("window"));
jetsennet.importCss("jetsenui");

//global dialog================================================================
jetsennet.ui.Windows = new jetsennet.util.ArrayList();
jetsennet.ui.Windows.close = function (strId) {
    var window = jetsennet.ui.Windows.getById(strId);
    if (window != null) {
        window.close();
        window = null;
    }
};
//设置窗口状态
jetsennet.ui.Windows.setState = function (strId, stateType) {
    var window = jetsennet.ui.Windows.getById(strId);
    if (window != null) {
        window.setState(stateType);
    }
};
//获取最大显示层级
jetsennet.ui.Windows.getMaxIndex = function () {
    var zIndex = 500;
    var len = jetsennet.ui.Windows.getCount();
    for (var i = 0; i < len; i++) {
        zIndex = Math.max(zIndex, jetsennet.ui.Windows.getAt(i).zIndex);
    }
    return zIndex;
};
//获取窗口
jetsennet.ui.Windows.getById = function (strId) {
    var len = jetsennet.ui.Windows.getCount();
    for (var i = 0; i < len; i++) {
        if (jetsennet.ui.Windows.getAt(i).windowId == strId) {
            return jetsennet.ui.Windows.getAt(i);
        }
    }
    return null;
};
//窗口按键处理
jetsennet.ui.Windows.onkeydown = function () {
    var evt = jetsennet.getEvent();
    if (evt.keyCode == 13) {
        var target = evt.srcElement ? evt.srcElement : evt.target;
        if (target.type != "textarea" && target.type != "button") {
            var len = jetsennet.ui.Windows.getCount();
            if (len && len > 0) {
                var window = jetsennet.ui.Windows.getAt(len - 1);
                if (window && window.windowStyle != 2 && !window.cancelKeyEvent) {
                    window.submitWindow();
                    jetsennet.cancelEvent();
                }
            }
        }
    }
    if (evt.keyCode == 27) {
        var len = jetsennet.ui.Windows.getCount();
        if (len && len > 0) {
            var window = jetsennet.ui.Windows.getAt(len - 1);
            if (window && window.windowStyle != 2 && !window.cancelKeyEvent) {
                window.cancelWindow();
                jetsennet.cancelEvent();
            }
        }
    }
};
/**
添加页面的按键事件，以用于捕获窗口事件
*/
jQuery(document).keydown(jetsennet.ui.Windows.onkeydown);

jetsennet.ui.Window = function (windowId) {
    if (windowId == null || windowId == "") {
        alert("创建窗口时必须指定窗口标识号!");
        return;
    }

    if (jetsennet["EFFECTS_ENABLE"]) {
        jQuery("#" + windowId).stop(true, true);
    }

    var existWindow = jetsennet.ui.Windows.getById(windowId);
    if (existWindow != null)
        return existWindow;

    this.__typeName = "jetsennet.ui.Window";
    this.isClose = false;
    this.isDialog = false;

    this.size = { width: 0, height: 0, minHeight: 0, maxHeight: 0};
    this.position = null;
    this.windowState = 0;               //Normal:0;Maximized:1;Minimized:2
    this.windowStyle = 0;               //Sizable:0;Fixed:1;None:2 
    this.enableMove = true;
    this.maximizeBox = true;
    this.minimizeBox = true;
    this.closeBox = true;               //关闭按钮
    this.submitBox = false;             //确定按钮
    this.cancelBox = false;             //取消按钮
    this.showScroll = true;             //显示滚动条
    this.limit = true;                  //限制在body区域内拖动
    this.title = null;
    this.controls = [];
    this.currentStyle = { top: 0, left: 0, width: 0, height: 0 };
    this.zIndex = 1;
    this.minStatePosition = 3;          //none:0;LeftUp:1;RightUp:2;LeftDown:3;RightDown:4;
    this.minStateSize = { width: 200, height: 45 };
    this.cancelKeyEvent = false;        //取消按键事件(ESC,ENTER)
    this.attachButtons = [];            //附加按钮 [{text:,clickEvent:}...}]

    this.timeout = null;
    this.ontimeout = null;
    this.onclosed = null;
    this.onloaded = null;
    this.oncancel = null;
    this.onresize = null;
    this.onsubmit = null;
    this.timeoutId = null;

    this.resizeFunction = null;
    this.dragFunction = null;

    this.okButtonText = "确定";
    this.cancelButtonText = "取消";

    this.windowId = windowId;

    jetsennet.ui.Windows.add(this);
    this.zIndex = jetsennet.ui.Windows.getMaxIndex() + 501;
};
jetsennet.ui.Window.prototype.setState = function (state) {
    this.windowState = state;
    this.render();
    if (this.onresize) {
        this.onresize({ width: this.currentStyle.width, height: this.currentStyle.height, contentHeight: this.currentStyle.contentHeight });
    }
    jQuery.extend(this.dragFunction, { lock: this.windowState == 1 });
    if (this.windowState != 2) {
        this.mouseDown();
    }
};
jetsennet.ui.Window.prototype.getPosition = function () {
    if (this.position == null) {
        var _p = jetsennet.util.getCenterScreenPosition(this.windowControl);
        this.position = { left: _p.left, top: _p.top };
    }
    return this.position;
};
//显示非模态窗口
jetsennet.ui.Window.prototype.show = function () {
    this.isDialog = false;
    this.render();
};
//显示模态窗口
jetsennet.ui.Window.prototype.showDialog = function () {
    this.isDialog = true;
    this.render();
};
//设置窗口标题
jetsennet.ui.Window.prototype.setTitle = function (title) {
    jQuery("#" + this.windowId + "_title_text").html(title);
    jQuery("#" + this.windowId + "_title_text").attr("title", title);
};
/**
调整窗口大小
*/
jetsennet.ui.Window.prototype.resize = function (size) {
    if (size) {
        this.size = { width: size.width, height: size.height };
        jQuery(this.windowControl).css({ width: this.size.width, height: this.size.height });
    }
    else {
        this.size = { width: this.windowControl.offsetWidth, height: this.windowControl.offsetHeight };
    }
    this.sizeChanged(this.size);
    if (this.onresize) {
        this.onresize({ width: this.size.width, height: this.size.height, contentHeight: this.currentStyle.contentHeight });
    }
};
/**
调整窗口大小，以使窗口自适应
*/
jetsennet.ui.Window.prototype.adjustSize = function () {
    var scrollHeight = this.contentControl.scrollHeight;
    var scrollWidth = this.contentControl.scrollWidth;
    var offsetHeight = this.contentControl.offsetHeight;
    var offsetWidth = this.contentControl.offsetWidth;
    if (scrollHeight != offsetHeight || scrollWidth != offsetWidth) {
        var titleHeight = this.windowStyle == 2 ? 0 : this.titleControl.offsetHeight;
        var buttonHeight = (this.submitBox || this.cancelBox || this.attachButtons.length > 0) ? this.buttonControl.offsetHeight : 0;

        jQuery(this.windowControl).css({ width: Math.max(scrollWidth, offsetWidth), height: (Math.max(scrollHeight, offsetHeight) + titleHeight + buttonHeight) });
        this.resize(); //{width:Math.max(scrollWidth,offsetWidth),height:Math.max(scrollHeight,offsetHeight)+titleHeight+buttonHeight});
    }
};
jetsennet.ui.Window.prototype.render = function () {
    var owner = this;
    this.isClose = false;

    this.renderWindow();

    try {
        //document.activeElement.blur(); Fixbug：点中body时blur窗口会隐藏
        $(this.windowControl).focus();
    } catch (e) { }

    this.sizeChanged();
    if (this.size.width == 0 || this.size.height == 0) {
        this.size = { width: this.currentStyle.width, height: this.currentStyle.height };
    }

    if (this.timeout) {
        this.timeoutId = window.setTimeout(function () { owner.close(); }, this.timeout);
    }

    if (this.onloaded && typeof this.onloaded == "function") {
        this.onloaded();
    }
};
//=================================================================================================
// 绘制窗口
//=================================================================================================
jetsennet.ui.Window.prototype.renderWindow = function () {
    var owner = this;
    var windowControl = jQuery("#" + this.windowId);
    if (windowControl.size() == 0) {
        windowControl = jQuery("<div>", { id: this.windowId }).appendTo("body").css({ zIndex: owner.zIndex }).mousedown(jetsennet.bindFunction(owner, owner.mouseDown));
    }
    windowControl.addClass("jetsen-window").css({ overflow: "hidden" });
    this.windowControl = windowControl[0];

    var top = null;
    var left = null;
    var height = null;
    var width = null;
    var viewSize = { width: (this.size.width > 0 ? this.size.width : 450), height: (this.size.height > 0 ? this.size.height : 0) };

    viewSize = this.windowState == 0 ? viewSize : (this.windowState == 1) ? jetsennet.util.getWindowViewSize() : this.minStateSize;

    windowControl.css({ width: viewSize.width });
    if (viewSize.height > 0) {
        windowControl.css({ height: viewSize.height });
    }

    this.renderBackLayer();
    this.renderTitle();
    this.renderContent();
    this.renderButton();

    if (this.windowState == 0) {
        if (this.getPosition().left != null) {
            left = this.getPosition().left;
            top = this.getPosition().top < 0 ? 0 : this.getPosition().top;
        }
    }
    else {
        if (this.windowState == 1) {
            left = 0; top = 0;
        }
        else {
            if (this.minStatePosition == 0) {
                left = this.getPosition().left;
                top = this.getPosition().top < 0 ? 0 : this.getPosition().top;
            }
            else {
                viewSize = this.windowState == 1 ? viewSize : jetsennet.util.getWindowViewSize();
                if (this.minStatePosition == 1) {
                    left = 1; top = 1;
                }
                else if (this.minStatePosition == 2) {
                    left = viewSize.width - this.minStateSize.width; top = 1;
                }
                else if (this.minStatePosition == 3) {
                    left = 1; top = viewSize.height - this.minStateSize.height - 1;
                }
                else {
                    left = viewSize.width - this.minStateSize.width - 1; top = viewSize.height - this.minStateSize.height - 1;
                }
            }
        }
    }
    this.currentStyle = { top: top, left: left, width: viewSize.width, height: viewSize.height };

    windowControl.css({ left: left, top: top });
};
//=================================================================================================
// 标题栏
//=================================================================================================
jetsennet.ui.Window.prototype.renderTitle = function () {
    var owner = this;
    if (this.windowStyle != 2) {
        var titleControl = jQuery("#" + this.windowId + "_title");
        if (titleControl.size() == 0) {
            titleControl = jQuery("<div>", { id: this.windowId + "_title" }).addClass("jetsen-window-title").css({ overflow: "hidden" });

            if (this.enableMove) {
                this.dragFunction = null;
                this.dragFunction = new jetsennet.ui.Drag({ 
                    drag: this.windowControl, 
                    handle: titleControl[0], 
                    limit: this.limit,
                    limitOptions: {
                        container: this.limit ? document.body : null,
                    },
                    onstart: function () { jetsennet.hidePopups(); },
                    onstop: function () { owner.positionChanged(); }
                });
            }
        }
        titleControl.css({ cursor: (this.windowState == 1 || !this.enableMove) ? "default" : "move" });
        this.titleControl = titleControl[0];
        this.windowControl.appendChild(this.titleControl);

        if (this.maximizeBox) {
            this.titleControl.ondblclick = function () {
                if (owner.windowState == 1) {
                    owner.setState(0);
                }
                else {
                    owner.setState(1);
                }
            };
        }
        var _buttonMin = "";
        var _buttonMax = "";
        var _buttonClose = "";
        if (this.windowState == 0) {
            if (this.minimizeBox)
                _buttonMin = this.createStateBoxTag(2, "min.gif");
            if (this.maximizeBox)
                _buttonMax = this.createStateBoxTag(1, "max.gif");
        }
        else if (this.windowState == 1) {
            if (this.minimizeBox)
                _buttonMin = this.createStateBoxTag(2, "min.gif");
            if (this.maximizeBox)
                _buttonMax = this.createStateBoxTag(0, "reset.gif");
        }
        else if (this.windowState == 2) {
            if (this.minimizeBox)
                _buttonMin = this.createStateBoxTag(0, "reset.gif");
            if (this.maximizeBox)
                _buttonMax = this.createStateBoxTag(1, "max.gif");
        }
        if (this.closeBox) {
            _buttonClose = "<img class='window-btn-3' onclick=\"jetsennet.ui.Windows.close('" + this.windowId + "');jetsennet.cancelEvent();\" src='" + jetsennet.baseThemeUrl + "images/dialog/close.gif' onmousedown='jetsennet.cancelEvent();' border=0 align=absmiddle style='cursor:pointer'/>";
        }
        titleControl.html("<div onselectstart=\"return false\" id=\"" + this.windowId + "_title_text\" class=\"jetsen-window-title-left\">" +
	                ((jetsennet.util.isNullOrEmpty(this.title)) ? "" : this.title) + "&nbsp;</div><div style=\"position:absolute;\"  class=\"jetsen-window-title-right\">" +
	                _buttonMin + _buttonMax + _buttonClose + "</div>");
        jQuery("#" + this.windowId + "_title_text").attr("title", (jetsennet.util.isNullOrEmpty(this.title) ? "" : this.title));
    }
};
//创建窗口按钮-私有
jetsennet.ui.Window.prototype.createStateBoxTag = function (type, icon) {
    return "<img class='window-btn-" + type + "' onclick=\"jetsennet.ui.Windows.setState('" + this.windowId + "'," + type + ");jetsennet.cancelEvent();\" src='" + jetsennet.baseThemeUrl + "images/dialog/" + icon + "' onmousedown='jetsennet.cancelEvent();' border=0 align=absmiddle style='cursor:pointer'/>";
};
//=================================================================================================
// 内容
//=================================================================================================
jetsennet.ui.Window.prototype.renderContent = function () {
    var contentControl = jQuery("#" + this.windowId + "_content");
    if (contentControl.size() == 0) {
        contentControl = jQuery("<div>", { id: this.windowId + "_content" }).addClass("jetsen-window-content").css({ overflow: this.showScroll ? "auto" : "hidden" });
        if (this.size.minHeight > 0) {
            contentControl.css({"min-height": this.size.minHeight + "px"});
        }
        if (this.size.maxHeight > 0) {
            contentControl.css({"max-height": this.size.maxHeight + "px"});
        }        
    }
    this.contentControl = contentControl[0];
    this.windowControl.appendChild(this.contentControl);

    for (var i = 0; i < this.controls.length; i++) {
        var control = el(this.controls[i]);
        if (control) {
            control.style.display = "";
            this.contentControl.appendChild(control);
        }
    }

    this.windowState == 2 ? contentControl.hide() : contentControl.show();
};
//=================================================================================================
// 按钮
//=================================================================================================
jetsennet.ui.Window.prototype.renderButton = function () {
    var _owner = this;
    if (this.submitBox || this.cancelBox || this.attachButtons.length>0) {
        var buttonControl = jQuery("#" + this.windowId + "_button");
        if (buttonControl.size() == 0) {
            buttonControl = jQuery("<div>", { id: this.windowId + "_button" }).addClass("jetsen-window-bottom");
        }
        this.buttonControl = buttonControl[0];
        buttonControl.html("");
        if (this.windowState == 2){
        	buttonControl.hide();
        }else{//最小化隐藏，恢复后需要重新设置display属性
        	buttonControl.show();
        }

        for (var i = 0; i < this.attachButtons.length; i++) {
            jQuery("<span>", {}).html("&nbsp;").appendTo(buttonControl);

            jQuery("<input type='button'>",
                {}).attr("value", this.attachButtons[i].text).addClass("btn btn-primary btn-sm").appendTo(buttonControl).click(this.attachButtons[i].clickEvent);
        }

        if (this.submitBox) {
            jQuery("<span>", {}).html("&nbsp;").appendTo(buttonControl);

            jQuery("<input type='button'>",
                {}).attr("value", this.okButtonText).addClass("btn btn-primary btn-sm").appendTo(buttonControl).click(function () { _owner.submitWindow(this); });
        }

        if (this.cancelBox) {
            jQuery("<span>", {}).html("&nbsp;").appendTo(buttonControl);

            jQuery("<input type='button'>",
                {}).attr("value", this.cancelButtonText).addClass("btn btn-default btn-sm").appendTo(buttonControl).click(function () { _owner.cancelWindow(); });

        }

        jQuery("<span>", {}).html("&nbsp;").appendTo(buttonControl);
        this.windowControl.appendChild(this.buttonControl);
    }
    var resizeControl = jQuery("#" + this.windowId + "_resize");
    if (this.windowState != 2) {
        if (this.windowStyle != 1 && this.windowStyle != 2) {
            if (resizeControl.size() == 0) {
                resizeControl = jQuery("<div>", { id: this.windowId + "_resize" }).css({ position: "absolute", bottom: 0, right: 0 })
                    .html("<img src='" + jetsennet.baseThemeUrl + "images/dialog/resize.gif' border=0 align=absmiddle style='cursor:se-resize'/>");
                this.resizeFunction = new jetsennet.ui.Region({ region: this.windowControl, limit: true,
                    limitOptions: { minHeight: 80, minWidth: 150 }, onsizechanged: function () { _owner.resize(); }
                }).set(resizeControl[0], "right-down");
            }
            this.windowControl.appendChild(resizeControl[0]);
            this.windowState == 1 ? resizeControl.hide() : resizeControl.show();
        }
    }
    else if (this.windowState != 1) {
        resizeControl.hide();
    }
};
//=================================================================================================
// 模态遮掩层
//=================================================================================================
jetsennet.ui.Window.prototype.renderBackLayer = function () {
    if (this.isDialog) {
        var layerControl = jQuery("#" + this.windowId + "_frame");
        if (layerControl.size() == 0) {
            layerControl = jQuery("<div>", { id: this.windowId + "_frame" }).addClass("jetsen-window-back").appendTo("body").css({ "zIndex": this.zIndex - 1 });
            //解决拖动异常的bug,iframe会导致拖动异常 jQuery("<iframe>", {}).addClass("jetsen-window-back").appendTo(layerControl)[0].frameBorder = 0;
            this.layerControl = layerControl[0];
        }
        layerControl.show();
    }
};
jetsennet.ui.Window.prototype.removeBackLayer = function () {
    var layerControl = el(this.windowId + "_frame");
    if (layerControl) {
        layerControl.style.display = "none";
        //document.body.appendChild(layerControl);
        document.body.removeChild(layerControl);
        layerControl = null;
    }
    this.layerControl = null;
};
jetsennet.ui.Window.prototype.cancelWindow = function () {
    var bSuccess = true;
    if (this.oncancel && typeof this.oncancel == "function") {
        bSuccess = this.oncancel();
    }
    if (bSuccess) {
        this.close();
    }
};
jetsennet.ui.Window.prototype.submitWindow = function (btn) {
    var bSuccess = true;
    if (this.onsubmit && typeof this.onsubmit == "function") {
        $(btn).addClass("disabled");
        bSuccess = this.onsubmit();
        $(btn).removeClass("disabled");
    }
    if (bSuccess) {
        this.close();
    }
};
//=================================================================================================
// 关闭
//=================================================================================================
jetsennet.ui.Window.prototype.close = function () {
    if (this.isClose) {
        return;
    }
    this.removeBackLayer();
    if (this.timeoutId != null) {
        window.clearTimeout(this.timeoutId);
    }
    if (this.ontimeout) {
        var _eval = this.ontimeout;
        (typeof _eval == "function") ? _eval() : jetsennet.eval(_eval);
        this.ontimeout = null;
    };

    var len = jetsennet.ui.Windows.getCount();
    for (var i = 0; i < len; i++) {
        var dialog = jetsennet.ui.Windows.getAt(i);
        if (dialog.windowId == this.windowId) {

            if (jetsennet["EFFECTS_ENABLE"]) {
                jetsennet.ui.Windows.removeAt(i);
                jQuery("#" + this.windowId).stop(true, true).fadeOut(null, function () {
                    dialog.dispose();
                });
            }
            else {
                dialog.dispose();
                jetsennet.ui.Windows.removeAt(i);
            }
            break;
        }
    }

    this.isClose = true;
    //关闭所有弹出层
    jetsennet.hidePopups();

    if (this.onclosed != null) {
        this.onclosed();
    }
};
jetsennet.ui.Window.prototype.dispose = function () {
    this.resizeFunction = null;
    this.dragFunction = null;

    for (var i = 0; i < this.controls.length; i++) {
        var control = el(this.controls[i]);
        if (control) {
            control.style.display = "none";
            document.body.appendChild(control);
        }
    }
    document.body.removeChild(this.windowControl);
    this.titleControl = null;
    this.buttonControl = true;
    this.contentControl = null;
    this.windowControl = null;
};
jetsennet.ui.Window.prototype.sizeChanged = function (size) {
    var size = size ? { width: size.width, height: size.height} : { width: this.windowControl.offsetWidth, height: this.windowControl.offsetHeight };
    var _currentStyle = jetsennet.util.getCurrentStyle(this.windowControl);
    this.currentStyle.width = size.width;
    this.currentStyle.height = size.height;

    var height = size.height - jetsennet.util.parseInt(_currentStyle.borderTopWidth, 0) - jetsennet.util.parseInt(_currentStyle.borderBottomWidth, 0);

    var titleHeight = this.windowStyle == 2 ? 0 : this.titleControl.offsetHeight;
    var buttonHeight = (this.submitBox || this.cancelBox || this.attachButtons.length > 0) ? this.buttonControl.offsetHeight : 0;
    var contentHeight = height - titleHeight - buttonHeight;
    if (contentHeight <= 1)
        contentHeight = 1;
    this.contentControl.style.height = contentHeight + "px";
    this.currentStyle.contentHeight = contentHeight;
};
jetsennet.ui.Window.prototype.positionChanged = function () {
    this.position = { top: parseInt(this.windowControl.style.top), left: parseInt(this.windowControl.style.left) };
    this.currentStyle.top = this.position.top;
    this.currentStyle.left = this.position.left;
};
jetsennet.ui.Window.prototype.mouseDown = function () {
    if (this.isDialog)
        return;
    var zIndex = jetsennet.ui.Windows.getMaxIndex();
    this.zIndex = zIndex + 10;
    this.windowControl.style.zIndex = this.zIndex;
};


jetsennet.warn = function (message, property) {
    var control = jQuery("#jetsen-warn-control");
    var control_message = jQuery("#jetsen-warn-control-message");
    if (control.size() == 0) {
        control = jQuery("<div>", { id: "jetsen-warn-control" }).css({ padding: 20 }).appendTo("body");
        var img = jQuery("<img>", { src: jetsennet.baseThemeUrl + 'images/dialog/icon-warning.gif', align: "left" }).css({ boder: 0, margin: "20px 20px 0 20px", width:61, height:61 }).appendTo(control);
        control_message = jQuery("<p>", { id: "jetsen-warn-control-message" }).css({"padding-top":40}).appendTo(control);
    }
    control_message.html(message);

    var window = jQuery.extend(new jetsennet.ui.Window("jetsen-warn"), {
        title: "信息提示",
        size: { width: 450, minHeight: 150 },
        windowStyle: 1,
        maximizeBox: false,
        minimizeBox: false,
        submitBox: true
    });

    if (property)
        jQuery.extend(window, property);
    window.controls = ["jetsen-warn-control"];
    window.showDialog();
};
jetsennet.error = function (message, property) {

    var control = jQuery("#jetsen-error-control");
    var control_message = jQuery("#jetsen-error-control-message");
    if (control.size() == 0) {
        control = jQuery("<div>", { id: "jetsen-error-control" }).css({ padding: 20 }).appendTo("body");
        var img = jQuery("<img>", { src: jetsennet.baseThemeUrl + 'images/dialog/icon-error.gif', align: "left" }).css({ boder: 0, margin: "20px 20px 0 20px", width:61, height:61 }).appendTo(control);
        control_message = jQuery("<p>", { id: "jetsen-error-control-message" }).css({"padding-top":40}).appendTo(control);
    }
    control_message.html(message);

    var window = jQuery.extend(new jetsennet.ui.Window("jetsen-error"), {
        title: "信息提示",
        size: { width: 450, minHeight: 150 },
        windowStyle: 1,
        maximizeBox: false,
        minimizeBox: false,
        submitBox: true
    });

    if (property)
        jQuery.extend(window, property);
    window.controls = ["jetsen-error-control"];
    window.showDialog();
};
jetsennet.alert = function (message, property) {
    var control = jQuery("#jetsen-alert-control");
    var control_message = jQuery("#jetsen-alert-control-message");
    if (control.size() == 0) {
        control = jQuery("<div>", { id: "jetsen-alert-control" }).css({ padding: 20 }).appendTo("body");
        var img = jQuery("<img>", { src: jetsennet.baseThemeUrl + 'images/dialog/icon-info.gif', align: "left" }).css({ boder: 0, margin: "20px 20px 0 20px", width:61, height:61 }).appendTo(control);
        control_message = jQuery("<p>", { id: "jetsen-alert-control-message" }).css({"padding-top":40}).appendTo(control);
    }
    control_message.html(message);

    var window = jQuery.extend(new jetsennet.ui.Window("jetsen-alert"), {
        title: "信息提示",
        size: { width: 450, minHeight: 150 },
        windowStyle: 1,
        maximizeBox: false,
        minimizeBox: false,
        submitBox: true
    });

    if (property)
        jQuery.extend(window, property);
    window.controls = ["jetsen-alert-control"];
    window.showDialog();
};
jetsennet.alertAndCall = function (message, script, property) {
    var control = jQuery("#jetsen-alertandcall-control");
    var control_message = jQuery("#jetsen-alertandcall-control-message");
    if (control.size() == 0) {
        control = jQuery("<div>", { id: "jetsen-alertandcall-control" }).css({ padding: 20 }).appendTo("body");
        var img = jQuery("<img>", { src: jetsennet.baseThemeUrl + 'images/dialog/icon-info.gif', align: "left" }).css({ boder: 0, margin: "20px 20px 0 20px", width:61, height:61 }).appendTo(control);
        control_message = jQuery("<p>", { id: "jetsen-alertandcall-control-message" }).css({"padding-top":40}).appendTo(control);
    }
    control_message.html(message);

    var window = jQuery.extend(new jetsennet.ui.Window("jetsen-alertandcall"), {
        title: "信息提示",
        size: { width: 450, minHeight: 150 },
        windowStyle: 1,
        maximizeBox: false,
        minimizeBox: false,
        submitBox: true,
        timeout: 1500,
        ontimeout: script
    });

    if (property)
        jQuery.extend(window, property);
    window.controls = ["jetsen-alertandcall-control"];
    window.showDialog();
};
jetsennet.confirm = function (message, onsubmit, property) {
    var control = jQuery("#jetsen-confirm-control");
    var control_message = jQuery("#jetsen-confirm-control-message");
    if (control.size() == 0) {
        control = jQuery("<div>", { id: "jetsen-confirm-control" }).css({ padding: 20 }).appendTo("body");
        var img = jQuery("<img>", { src: jetsennet.baseThemeUrl + 'images/dialog/icon-question.gif', align: "left" }).css({ boder: 0, margin: "20px 20px 0 20px", width:61, height:61 }).appendTo(control);
        control_message = jQuery("<p>", { id: "jetsen-confirm-control-message" }).css({"padding-top":40}).appendTo(control);
    }
    control_message.html(message);

    var window = jQuery.extend(new jetsennet.ui.Window("jetsen-confirm"), {
        title: "信息提示",
        size: { width: 450, minHeight: 150 },
        windowStyle: 1,
        maximizeBox: false,
        minimizeBox: false,
        submitBox: true,
        cancelBox: true,
        onsubmit: onsubmit
    });
    if (property)
        jQuery.extend(window, property);
    window.controls = ["jetsen-confirm-control"];
    window.showDialog();
};

/**
只支持单个，取第一个(多个无意义)
*/
jQuery.fn.showDialog = function (options) {
    var windowId = this.size() > 0 ? this[0].id : null;
    options = jQuery.extend({ isDialog: true, windowId: "window-" + windowId, controls: [windowId], maximizeBox: false, minimizeBox: false, windowStyle: 1 }, options);
    jQuery.extend(new jetsennet.ui.Window(options.windowId), options).render();
};
/**
只支持单个，取第一个(多个无意义)
*/
jQuery.fn.closeDialog = function (windowId) {
    var instanceId = windowId ? windowId : (this.size() > 0 ? "window-" + this[0].id : null);
    jetsennet.ui.Windows.close(instanceId);
};