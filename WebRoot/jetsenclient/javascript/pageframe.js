// lixiaomin 2013-03-22
//=============================================================================
jetsennet.addLoadedUri(jetsennet.getloadUri("pageframe"));
jetsennet.importCss("jetsenui");

var PAGEFRAME_SPLIT_MOVE_ID = "div-pageframe-split-move";

jetsennet.ui.FrameControlBase = function (conId) {
    this.controlId = conId;
    this.size = { width: 0, height: 0 };
    this.minSize = { width: 0, height: 0 };
    this.maxSize = { width: 0, height: 0 };
    this.currentSize = { width: 0, height: 0 };
    this.prevSize = { width: 0, height: 0 };
    this.prevPos = { top: 0, left: 0 };
    this.position = { top: 0, left: 0 };
    this.title = "";
    this.showTitle = false;
    this.titleHeight = 20;
    this.isInit = false;
};
/**创建隐藏按钮*/
jetsennet.ui.FrameControlBase.prototype.renderHideButton = function (parentFrame, parentControl) {

    if (!parentFrame)
        return;

    if (this.enableHide) {

        var hbtnTop = 0;
        var hbtnLeft = 1;
        var curHideBtnStyle = parentFrame.hideButtonStyle;

        //如果是隐藏按钮显示在分隔条中间的风格
        if (curHideBtnStyle == 1) {
            var siPos = parentFrame.splitItem.position;
            var siSize = parentFrame.splitItem.size;
            hbtnTop = Math.max(0, parentFrame.splitType == 0 ? siPos.top + parseInt((siSize.height - 10) / 2) : siPos.top);
            hbtnLeft = Math.max(0, parentFrame.splitType == 1 ? siPos.left + parseInt((siSize.width - 10) / 2) : siPos.left);
        }
        else {
            hbtnTop = this.position.top + 2;
            hbtnLeft = this.position.left + Math.max(1, (parentFrame.splitType == 0 && this.hide ? this.hideSize : this.size.width) - 16);
        }

        var control_hide_control = jQuery("#" + parentFrame.controlId + "_hide_control");
        var isHide = this.isPanel ? jetsennet.ui.PageFrames[this.panelControlId].hide : this.hide;

        if (control_hide_control.size() == 0) {
            control_hide_control = jQuery("<div>", {
                id: parentFrame.controlId + "_hide_control"
            })
            .click(function () {
                var item = jetsennet.ui.PageFrames[this.getAttribute("controlid")];
                item.hide = item.hide ? false : true;
                if (!item.hide) {
                    item.size = { width: item.prevSize.width, height: item.prevSize.height };
                }

                var pitem = jetsennet.ui.PageFrames[item.parentControlId];
                while (pitem.parentControlId != null && (pitem.size.width == 0 || pitem.size.height == 0)) {
                    pitem = jetsennet.ui.PageFrames[pitem.parentControlId];
                }

                pitem.render();

                if (item.onstatechanged) {
                    item.onstatechanged(item.hide);
                }

            }).appendTo(parentControl).attr("controlid", this.isPanel ? this.panelControlId : this.controlId);
        }

        if (control_hide_control[0].parentNode != parentControl[0]) {
            parentControl.append(control_hide_control);
        }

        //一个PageFrame的两个Item不应该都有隐藏按钮
        if (curHideBtnStyle == 0) {
            control_hide_control.addClass(parentFrame.splitType == 0 ?
                (isHide ? "jetsen-pageframe-hidebtn-1-0" : "jetsen-pageframe-hidebtn-0-0")
                : (isHide ? "jetsen-pageframe-hidebtn-3-0" : "jetsen-pageframe-hidebtn-2-0"));
        }
        else {
            if (parentFrame.fixControlIndex == 0) {
                control_hide_control.addClass(parentFrame.splitType == 0 ?
                (isHide ? "jetsen-pageframe-hidebtn-1-1" : "jetsen-pageframe-hidebtn-0-1")
                : (isHide ? "jetsen-pageframe-hidebtn-2-1" : "jetsen-pageframe-hidebtn-3-1"));
            }
            else {
                control_hide_control.addClass(parentFrame.splitType == 0 ?
                (isHide ? "jetsen-pageframe-hidebtn-0-1" : "jetsen-pageframe-hidebtn-1-1")
                : (isHide ? "jetsen-pageframe-hidebtn-3-1" : "jetsen-pageframe-hidebtn-2-1"));
            }
        }

        control_hide_control.css("top", hbtnTop).css("left", hbtnLeft).show();
    }
};
//私有
jetsennet.ui.FrameControlBase.prototype.hideControl = function () {
    jQuery("#" + this.controlId).hide();
    jQuery("#" + this.controlId + "_title").hide();
    //    if (this.controls) {
    //        for (var i = 0; i < this.controls.length; i++) {
    //            this.controls[i].hideControl();
    //        }
    //    }
};
//私有
jetsennet.ui.FrameControlBase.prototype.getAttachWidth = function (frameObj) {
    //return frameObj.outerWidth(true) - frameObj.innerWidth();
    var edgeSize = jetsennet.util.getControlEdgeSize(frameObj[0]);
    return edgeSize.marginWidth;//edgeSize.left + edgeSize.right;
};
//私有
jetsennet.ui.FrameControlBase.prototype.getAttachHeight = function (frameObj) {
    //return frameObj.outerHeight(true) - frameObj.innerHeight();
    var edgeSize = jetsennet.util.getControlEdgeSize(frameObj[0]);
    return edgeSize.marginHeight;//edgeSize.top + edgeSize.bottom;
};
//私有
jetsennet.ui.FrameControlBase.prototype.getAbsWidth = function (frameObj, width) {
    //可能宽度不受限
    if (width == 0)
        return 0;

    if (valueOf(this.minSize, "width", 0) != 0 && width < this.minSize.width) {
        width = this.minSize.width;
    }
    if (valueOf(this.maxSize, "width", 0) != 0 && width > this.maxSize.width) {
        width = this.maxSize.width;
    }

    var temp = width - this.getAttachWidth(frameObj);
    return temp < 1 ? 1 : temp;
};
//私有
jetsennet.ui.FrameControlBase.prototype.getAbsHeight = function (frameObj, height) {
    //可能高度不受限
    if (height == 0)
        return 0;

    if (valueOf(this.minSize, "height", 0) != 0 && height < this.minSize.height) {
        height = this.minSize.height;
    }
    if (valueOf(this.maxSize, "height", 0) != 0 && height > this.maxSize.height) {
        height = this.maxSize.height;
    }

    var temp = height - this.getAttachHeight(frameObj);
    return temp < 1 ? 1 : temp;
};
//私有
jetsennet.ui.FrameControlBase.prototype.getWidth = function (width) {
    //可能没有control.id,controlId兼容dom
    var attchWidth = this.getAttachWidth(jQuery(el(this.controlId)));
    if (this.minSize != null) {
        attchWidth = attchWidth < this.minSize.width ? this.minSize.width : (attchWidth + 1);
    }

    if (width < attchWidth) {
        return attchWidth;
    }

    if (this.maxSize != null && this.maxSize.width > this.minSize.width) {
        if (width > this.maxSize.width)
            return this.maxSize.width;
    }
    return width;
};
//私有
jetsennet.ui.FrameControlBase.prototype.getHeight = function (height) {
    var minSize = this.getAttachHeight(jQuery(el(this.controlId)));

    if (this.minSize != null) {
        minSize = minSize < this.minSize.height ? this.minSize.height : (minSize + 1);
    }

    if (height < minSize) {
        return minSize;
    }

    if (this.maxSize != null && this.maxSize.height > this.minSize.height) {
        if (height > this.maxSize.height)
            return this.maxSize.height;
    }
    return height;
};
//jetsennet.ui.PageSplit;
jetsennet.ui.PageSplit = function (controlId) {
    this.__typeName = "jetsennet.ui.PageSplit";
    this.controlId = controlId;
    this.title = "";
    this.hide = true;
};
jetsennet.ui.PageSplit.prototype = new jetsennet.ui.FrameControlBase();
/**
呈现控件
由父级调用
*/
jetsennet.ui.PageSplit.prototype.render = function () {
    var thisControl = jQuery("#" + this.controlId);

    if (this.hide) {
        thisControl.hide();
        return;
    }

    if (thisControl.size() == 0) {
        thisControl = jQuery("<div>", { id: this.controlId });
    }

    thisControl.show();

    var parentFrame = jetsennet.ui.PageFrames[this.parentControlId];
    var parentControl = jQuery("#" + parentFrame.controlId);

    thisControl.unbind("click").click(function (e) { e.stopPropagation(); });

    if (this.enableResize) {
        thisControl.unbind("mousedown").mousedown(function (e) {
            parentFrame.splitControlDown(e);
            jQuery(document).mousemove(jetsennet.ui.PageFrame.onMouseMove);
            jQuery(document).mouseup(jetsennet.ui.PageFrame.onMouseUp);

        }).css("cursor", parentFrame.splitType == 0 ? "e-resize" : "s-resize");
    }
    else {
        thisControl.unbind("mousedown").mousedown(function (e) { return false; }).css("cursor", "default");
    }

    var className = parentFrame.splitType == 0 ? "jetsen-pageframe-split-0" : "jetsen-pageframe-split-1";
    if (!thisControl.hasClass(className)) {
        thisControl.addClass(className);
    }

    thisControl.appendTo(parentControl);

    if (this.title && this.title.length > 0) {
        var titleCon = (this.title.length < 20) ? jQuery("#" + this.title) : jQuery(this.title);
        jQuery(titleCon).appendTo(thisControl);
    }

    var width = this.size.width;
    var height = this.size.height;
    if (width == 0) {
        width = this.getItemWidth(parentFrame);
    }
    if (height == 0) {
        height = this.getItemHeight(parentFrame);
    }

    thisControl.css({ left: this.position.left, top: this.position.top }).innerWidth(width).innerHeight(height);
};
jetsennet.ui.PageSplit.prototype.getItemHeight = function (item) {

    if (item.__typeName == "jetsennet.ui.PageFrame") {

        if (item.size.height == 0) {
            var max = 0;
            if (item.splitType == 0) {
                for (var i = 0; i < item.controls.length; i++) {
                    max = Math.max(max, this.getItemHeight(item.controls[i]));
                }
            }
            else {
                if (item.hide) {
                    return item.hideSize;
                }

                for (var i = 0; i < item.controls.length; i++) {
                    max = max + this.getItemHeight(item.controls[i]);
                }

                max += item.showSplit ? item.splitSize : 0;
            }
            return max;
        }
        else {
            return item.hide ? item.hideSize : item.size.height;
        }
    }
    else {

        if (item.hide) {
            return item.hideSize;
        }

        if (item.size.height == 0) {
            return el(item.controlId).offsetHeight + (item.showTitle ? item.titleHeight : 0);
        }
        else {
            return item.size.height;
        }
    }
};
jetsennet.ui.PageSplit.prototype.getItemWidth = function (item) {

    if (item.__typeName == "jetsennet.ui.PageFrame") {
        if (item.size.width == 0) {
            var max = 0;
            if (item.splitType == 1) {
                for (var i = 0; i < item.controls.length; i++) {
                    max = Math.max(max, this.getItemWidth(item.controls[i]));
                }
            }
            else {
                if (item.hide) {
                    return item.hideSize;
                }

                for (var i = 0; i < item.controls.length; i++) {
                    max = max + this.getItemWidth(item.controls[i]);
                }
            }
            return max;
        }
        else {
            return item.hide ? item.hideSize : item.size.width;
        }
    }
    else {
        if (item.hide) {
            return item.hideSize;
        }

        if (item.size.width == 0) {
            return el(item.controlId).offsetWidth;
        }
        else {
            return item.size.width;
        }
    }
};

jetsennet.ui.PageFrames = {};
//=============================================================================
// jetsennet.ui.PageFrame
//=============================================================================
jetsennet.ui.PageFrame = function (conId) {
    this.__typeName = "jetsennet.ui.PageFrame";
    this.size = { width: 0, height: 0 };

    this.controlId = conId;
    this.splitType = 0;         //0 左右分隔; 1:上下分隔
    this.controls = [];         //可允许包含一个或两个PageFrame或PageItem
    this.splitItem = null;
    this.fixControlIndex = 0;   //需要固定大小的控件索引

    this.position = { top: 0, left: 0 };
    this.showSplit = true;      //显示分隔条
    this.enableResize = true;   //允许改变大小
    this.hide = false;
    this.enableHide = false;    //允许隐藏
    this.hideButtonStyle = 0;   //隐藏按钮样式
    this.splitSize = 3;         //分隔条大小
    this.splitTitle = "";       //自定义分隔条 
    this.hideSize = 18;         //隐藏时大小

    jetsennet.ui.PageFrames[this.controlId] = this;
};
jetsennet.ui.PageFrame.prototype = new jetsennet.ui.FrameControlBase();
/**
添加子项，可以为PageFrame或PageItem
*/
jetsennet.ui.PageFrame.prototype.addControl = function (con) {
    this.controls.push(con);
    return this;
};
/**
绑定大小
*/
jetsennet.ui.PageFrame.prototype.sizeBind = function (con) {
    var windowResized = function (con) {
        var size = { width: jQuery(con).width(), height: jQuery(con).height() };
        this.size = { width: size.width, height: size.height };
        this.resize();
    };
    jQuery(con).resize(jetsennet.bindFunction(this, jetsennet.throttle(windowResized), con));
    windowResized.apply(this, arguments);
    return this;
};
/**
改变大小
当改变的大小相对值很小时，不作处理
*/
jetsennet.ui.PageFrame.prototype.resize = function () {
    if (Math.abs(this.size.width - this.currentSize.width) < 10 && Math.abs(this.size.height - this.currentSize.height) < 10) {
        return;
    }
    this.render();
};
/**
呈现控件,方法只用于控件的顶级，顶级呈现时完成所有子项的呈现
*/
jetsennet.ui.PageFrame.prototype.render = function () {

    var isInit = this.isInit;

    if (this.isInit)
        this.prevSize = { width: this.currentSize.width, height: this.currentSize.height };
    else {
        this.isInit = true;
        this.prevSize = { width: this.size.width, height: this.size.height };
    }
    this.currentSize = { width: this.size.width, height: this.size.height };

    var controlsCount = this.controls.length;
    var isOnlyOneControl = controlsCount == 1;
    if (controlsCount > 2) {
        alert("开发者错误，PageFrame不能包含多于两个子项!");
        return;
    }
    if (this.fixControlIndex != 0 && this.fixControlIndex != 1)
        this.fixControlIndex = 0;

    var owner = this;
    var subItem1 = jQuery.extend(this.controls[0], { controlIndex: 0 });
    var subItem2 = isOnlyOneControl ? null : jQuery.extend(this.controls[1], { controlIndex: 1 });
    if (this.splitItem == null) {
        this.splitItem = new jetsennet.ui.PageSplit(this.controlId + "_split");
        this.splitItem.parentControlId = this.controlId;
    }

    var thisControl = jQuery("#" + this.controlId);
    var hideControl = jQuery("#" + this.controlIdOfHide);
    var titleControl = jQuery("#" + this.controlId + "_title");
    var parentControl = null;

    if (thisControl.size() == 0) {
        thisControl = jQuery("<div>", { id: this.controlId }).appendTo("body");
    }

    var parentFrame = jetsennet.ui.PageFrames[this.parentControlId];
    if (parentFrame) {
        parentControl = jQuery("#" + parentFrame.controlId);
        if (thisControl[0].parentNode != parentControl[0])
            parentControl.append(thisControl);
    }

    if (thisControl[0].className == null || thisControl[0].className == "")
        thisControl.addClass("jetsen-pageframe");

    thisControl.css("position", "absolute");

    //对于IE来说，当PageFrame为PanelItem时，改变内大小重新render，onclick重新给值将对事件产生变华
    if (!isInit) {
        thisControl.click(function (e) {

            if (owner.controls[0] && owner.controls[0].__typeName == "jetsennet.ui.PagePanel") {

                if (owner.controls[0].hide) {
                    //e.stopPropagation();
                    owner.controls[0].render();
                }
            }

            if (owner.controls[1] && owner.controls[1].__typeName == "jetsennet.ui.PagePanel") {

                if (owner.controls[1].hide) {
                    //e.stopPropagation();
                    owner.controls[1].render();
                }
            }
        });
    }

    var absSize = { width: this.getAbsWidth(thisControl, this.size.width), height: this.getAbsHeight(thisControl, this.size.height) };
    var parentSplitType = valueOf(parentFrame, "splitType", 0);

    //是否隐藏
    if (this.hide) {
        if (this.controlIdOfHide != null) {

            if (hideControl.size() == 1) {

                var absWidth = this.getAbsWidth(hideControl, parentFrame.splitType == 0 ? this.hideSize : this.size.width);
                var absHeight = this.getAbsHeight(hideControl, parentFrame.splitType == 1 ? this.hideSize : this.size.height);

                hideControl.css({ "display": "", "position": "absolute",
                    "left": this.position.left,
                    "top": this.position.top,
                    "width": absWidth,
                    "height": absHeight
                });

                if (hideControl[0].parentNode != parentControl[0])
                    parentControl.appendChild(hideControl);
            }
        }

        thisControl.hide();
        hideControl.hide();

        this.splitItem.hide = true;
        this.splitItem.render();
        this.renderHideButton(parentFrame, parentControl);
        return;
    }
    else {
        if (this.controlIdOfHide != null) {
            var hideControl = jQuery(this.controlIdOfHide);
            if (hideControl != null) {
                hideControl.css("display ", "none");
            }
        }

        thisControl.show();
        titleControl.show();
    }

    if (this.fixControlIndex != 0) {
        subItem1.hide = false;
        subItem1.enableHide = false;
    }
    if (subItem2 && this.fixControlIndex != 1) {
        subItem2.hide = false;
        subItem2.enableHide = false;
    }

    //子项大小
    var usedVal = 0;
    var isShowSplit = !isOnlyOneControl && this.showSplit && (!(subItem1.__typeName == "jetsennet.ui.PagePanel" && subItem1.hide)
        && !(subItem2.__typeName == "jetsennet.ui.PagePanel" && subItem2.hide));
    var splitVal = isShowSplit ? this.splitSize : 0;
    //边缘大小
    var edgeSize = jetsennet.util.getControlEdgeSize(thisControl[0]);
    var edgeTop = edgeSize.paddingTop;
    var edgeLeft = edgeSize.paddingLeft;

    thisControl.css({ "left": this.position.left, "top": this.position.top });

    if (absSize.width > 0) {
        thisControl.css({ width: absSize.width });
    }
    else {
        thisControl.css({ "overflow": "visible" });
    }

    if (absSize.height > 0) {
        thisControl.css({ height: absSize.height });
    }
    else {
        thisControl.css({ "overflow": "visible" });
    }

    //显示标题栏
    if (this.showTitle && this.titleHeight > 0) {

        if (titleControl.size() == 0) {
            titleControl = jQuery("<div>", { id: this.controlId + "_title" }).addClass("jetsen-pageframe-title").attr("controlid", this.controlId);
        }

        if (this.title != null && jQuery.type(this.title) != "string") {
            titleControl.append(this.title);
        }
        else if (!(this.title == null || this.title == "")) {
            var titleElement = null;
            if (this.title.length < 30) {
                titleElement = jQuery("#" + this.title);
            }

            if (titleElement == null || titleElement.size() == 0) {
                titleControl.html(this.title);
            }
            else {
                titleElement.appendTo(titleControl);
            }
        }

        titleControl.appendTo(thisControl);

        if (this.isPanel && this.isPanelEnableDrag) {
            titleControl.unbind("mousedown").mousedown(function (e) {
                //titleControl.onselectstart = function () { return false; };
                jetsennet.ui.PagePanel.onMouseDown(e, this.getAttribute("controlid"));
                jQuery(document).mousemove(jetsennet.ui.PagePanel.onMouseMove);
                jQuery(document).mouseup(jetsennet.ui.PagePanel.onMouseUp);
            });
        }

        //titleControl.style.zIndex = 99;
        titleControl.css({ "top": edgeTop, "left": edgeLeft, height: this.getAbsHeight(titleControl, this.titleHeight) });
        if (absSize.width > 0) {
            titleControl.css({ width: this.getAbsWidth(titleControl, absSize.width) });
        }

        edgeTop = edgeTop + this.titleHeight;
        if (absSize.height > 0) {
            absSize.height = absSize.height - this.titleHeight;
        }
    }

    if (!isOnlyOneControl && (subItem1.hide || subItem2.hide)) {
        //如果有其中一子项隐藏
        //把隐藏子项设为隐藏大小，另一子项布全局(减去隐藏大小和分隔条)
        if (subItem1.hide) {
            this.splitType == 0 ? subItem1.size.height = absSize.height : subItem1.size.width = absSize.width;
            //subItem1.size = { width: this.splitType == 0 ? subItem1.size.width : absSize.width, height: this.splitType == 1 ? subItem1.size.height : absSize.height };
            subItem2.size = { width: this.splitType == 0 ? Math.max(0, absSize.width - subItem1.hideSize - splitVal) : absSize.width, height: this.splitType == 1 ? Math.max(0, absSize.height - subItem1.hideSize - splitVal) : absSize.height };
            subItem2.position = { left: this.splitType == 0 ? subItem1.hideSize + splitVal : edgeLeft, top: this.splitType == 0 ? edgeTop : (edgeTop + subItem1.hideSize + splitVal) };
            subItem1.position = { left: edgeLeft, top: edgeTop };
        }
        else {
            this.splitType == 0 ? subItem2.size.height = absSize.height : subItem2.size.width = absSize.width;
            //subItem2.size = { width: this.splitType == 0 ? subItem2.size.width : absSize.width, height: this.splitType == 1 ? subItem2.size.height : absSize.height };
            subItem1.size = { width: this.splitType == 0 ? Math.max(0, absSize.width - subItem2.hideSize - splitVal) : absSize.width, height: this.splitType == 1 ? Math.max(0, absSize.height - subItem2.hideSize - splitVal) : absSize.height };
            subItem1.position = { left: edgeLeft, top: edgeTop };
            subItem2.position = { left: this.splitType == 0 ? subItem1.size.width + splitVal : edgeLeft, top: this.splitType == 0 ? edgeTop : (edgeTop + subItem1.size.height + splitVal) };
        }

        //this.splitItem.hide = true;
        this.splitItem.enableResize = false;
    }
    else {
        this.splitItem.enableResize = this.enableResize;

        //如果没有隐藏项，则取固定项的大小作为已用大小
        if (this.splitType == 0) {
            var widthVal = this.controls[this.fixControlIndex].size.width;
            if (jetsennet.util.right(widthVal, 1) == "%") {
                this.controls[this.fixControlIndex].size.width = parseInt(absSize.width * parseFloat(jetsennet.util.left(widthVal, widthVal.length - 1)) * 0.01);
            }
            usedVal = this.controls[this.fixControlIndex].size.width;
            if (absSize.width > 0 && usedVal > absSize.width) {
                this.controls[this.fixControlIndex].size.width = absSize.width;
                usedVal = absSize.width;
            }
        }
        else {
            var heightVal = this.controls[this.fixControlIndex].size.height;
            if (jetsennet.util.right(heightVal, 1) == "%") {
                this.controls[this.fixControlIndex].size.height = parseInt(absSize.height * parseFloat(jetsennet.util.left(heightVal, heightVal.length - 1)) * 0.01);
            }
            usedVal = this.controls[this.fixControlIndex].size.height;
            if (absSize.height > 0 && usedVal > absSize.height) {
                this.controls[this.fixControlIndex].size.height = absSize.height;
                usedVal = absSize.height;
            }
        }

        var newVal = 0;
        if (this.splitType == 0) {
            //可能宽度不受限
            if (absSize.width > 0) {
                newVal = absSize.width - usedVal - splitVal;
                newVal = newVal < 1 ? 1 : newVal;
            }
            //this.splitItem.size = { width: splitVal, height: absSize.height };
        }
        else {
            //可能高度不受限
            if (absSize.height > 0) {
                newVal = absSize.height - usedVal - splitVal;
                newVal = newVal < 1 ? 1 : newVal;
            }
            //this.splitItem.size = { height: splitVal, width: absSize.width };
        }

        subItem1.position = { left: edgeLeft, top: edgeTop };
        if (!isOnlyOneControl) {
            subItem2.position = { left: edgeLeft, top: edgeTop };
        }

        if (this.splitType == 0) {
            subItem1.size.height = absSize.height;
            subItem1.size.width = this.fixControlIndex == 0 ? subItem1.size.width : newVal;
            if (!isOnlyOneControl) {
                subItem1.position = { left: edgeLeft, top: edgeTop };
                subItem2.size.height = absSize.height;
                subItem2.size.width = this.fixControlIndex == 1 ? subItem2.size.width : newVal;
                subItem2.position = { top: edgeTop, left: subItem1.size.width + splitVal + edgeLeft };
            }
            else {
                //仅有一子项，子项居中
                subItem1.position = { left: edgeLeft + parseInt(newVal / 2), top: edgeTop };
            }
        }
        else {
            subItem1.size.width = absSize.width;
            subItem1.size.height = this.fixControlIndex == 0 ? subItem1.size.height : newVal;
            if (!isOnlyOneControl) {
                subItem1.position = { left: edgeLeft, top: edgeTop };
                subItem2.size.width = absSize.width;
                subItem2.size.height = this.fixControlIndex == 1 ? subItem2.size.height : newVal;
                subItem2.position = { top: subItem1.size.height + splitVal + edgeTop, left: edgeLeft };
            }
            else {
                //仅有一子项，子项居中
                subItem1.position = { left: edgeLeft, top: edgeTop + parseInt(newVal / 2) };
            }
        }
    }

    if (isShowSplit) {
        this.splitItem.hide = false;
        this.splitItem.position = this.splitType == 0 ? { left: (this.splitType == 0 && subItem1.hide ? subItem1.hideSize : subItem1.size.width) + edgeLeft, top: edgeTop }
         : { left: edgeLeft, top: (this.splitType == 1 && subItem1.hide ? subItem1.hideSize : subItem1.size.height) + edgeTop };
        this.splitItem.title = this.splitTitle;

        if (this.splitType == 0) {
            this.splitItem.size = { width: splitVal, height: absSize.height };
        }
        else {
            this.splitItem.size = { height: splitVal, width: absSize.width };
        }
    }
    else {
        this.splitItem.hide = true;
    }

    subItem1.parentControlId = this.controlId;
    subItem1.render();

    if (!isOnlyOneControl) {
        subItem2.parentControlId = this.controlId;
        subItem2.render();
    }

    this.splitItem.render();

    this.renderHideButton(parentFrame, parentControl);

    titleControl = null;
    parentControl = null;
    titleControl = null;
    hideCotrol = null;
};

var gFramePageSplitMouseDown = false;
var gFramePageSplitMoveElement = null;
var gFramePageSplitMoveData = null;     //[controlId]
jetsennet.ui.PageFrame.onMouseMove = function (e) {

    if (gFramePageSplitMouseDown) {
        if (gFramePageSplitMoveData) {
            jetsennet.ui.PageFrames[gFramePageSplitMoveData[0]].splitControlMove(e);
        }
    }
};
jetsennet.ui.PageFrame.onMouseUp = function (e) {
    if (gFramePageSplitMouseDown) {

        if (gFramePageSplitMoveData) {
            jetsennet.ui.PageFrames[gFramePageSplitMoveData[0]].splitControlUp(e);
            $(window).resize();		/**派发一个window改变的大小，为了方便其它对象监听div改变的大小**/
        }

        gFramePageSplitMouseDown = false;
        gFramePageSplitMoveData = null;
        jQuery(document).unbind("mousemove", jetsennet.ui.PageFrame.onMouseMove);
        jQuery(document).unbind("mouseup", jetsennet.ui.PageFrame.onMouseUp);
    }
};
//私有
jetsennet.ui.PageFrame.prototype.splitControlDown = function (e) {
    e.stopPropagation();
    gFramePageSplitMouseDown = true;
    gFramePageSplitMoveData = [this.controlId];
};
//私有
jetsennet.ui.PageFrame.prototype.splitControlUp = function (e) {

    var moveObj = jQuery("#" + PAGEFRAME_SPLIT_MOVE_ID);
    if (moveObj.size() == 1) {
        moveObj.hide();
    }
    if (this.checkMove()) {
        var renditem = this;
        while (renditem.parentControlId != null && (renditem.size.width == 0 || renditem.size.height == 0)) {
            renditem = jetsennet.ui.PageFrames[renditem.parentControlId];
        }
        renditem.render();
    }
};
//私有
jetsennet.ui.PageFrame.prototype.splitControlMove = function (e) {

    window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();

    var moveObj = jQuery("#" + PAGEFRAME_SPLIT_MOVE_ID);
    if (moveObj.size() == 0) {
        moveObj = jQuery("<div>", { id: PAGEFRAME_SPLIT_MOVE_ID }).appendTo("body")
            .css({ position: "absolute", display: "none" })
            .addClass("jetsen-pageframe-move")
            .click(function (e) { e.stopPropagation(); });
        // moveObj.css(zIndex,1000);
    }

    if (!moveObj.hasClass("jetsen-pageframe-move")) {
        moveObj.addClass("jetsen-pageframe-move");
    }

    moveObj.css({ display: "" });

    var controlObj = jQuery("#" + this.controlId);
    controlObj.append(moveObj);

    var scrollSize = { width: controlObj.scrollLeft(), height: controlObj.scrollTop() }; //jetsennet.util.getScrolls(jQuery(this.controlId).parentNode);

    var winScroll = { width: jQuery(window).scrollLeft(), height: jQuery(window).scrollTop() };
    scrollSize = { width: scrollSize.width - winScroll.width, height: scrollSize.height - winScroll.height };

    if (this.splitType == 0) {
        moveObj.css({ "top": 0, "cursor": "e-resize" }).innerHeight(this.size.height).innerWidth(5);

        var tempWidth = e.pageX + scrollSize.width;
        var leftWidth = tempWidth - controlObj.offset().left;
        if (leftWidth < 1)
            return;

        //有可能宽度不受限
        leftWidth = (leftWidth > this.size.width && this.size.width > 0) ? this.size.width - 5 : leftWidth;

        if (this.fixControlIndex == 0) {
            this.controls[this.fixControlIndex].size.width = this.controls[this.fixControlIndex].getWidth(leftWidth);
            moveObj.css({ left: this.controls[this.fixControlIndex].size.width });
        }
        else {
            this.controls[this.fixControlIndex].size.width = this.controls[this.fixControlIndex].getWidth(this.size.width - leftWidth);
            moveObj.css({ left: this.size.width - this.controls[this.fixControlIndex].size.width });
        }
    }
    else {
        moveObj.css({ "left": 0, "cursor": "s-resize" }).innerHeight(5).innerWidth(this.size.width);

        var tempHeight = e.pageY + scrollSize.height;
        var topHeight = tempHeight - controlObj.offset().top; //jetsennet.util.getPosition(jQuery(this.controlId), 0).top;
        if (topHeight < 10)
            return;

        //有可能高度不受限
        topHeight = (topHeight > this.size.height && this.size.height > 0) ? this.size.height - 5 : topHeight;

        if (this.fixControlIndex == 0) {
            this.controls[this.fixControlIndex].size.height = this.controls[this.fixControlIndex].getHeight(topHeight);
            moveObj.css({ top: this.controls[this.fixControlIndex].size.height });
        }
        else {
            this.controls[this.fixControlIndex].size.height = this.controls[this.fixControlIndex].getHeight(this.size.height - topHeight);
            moveObj.css({ top: this.size.height - this.controls[this.fixControlIndex].size.height });
        }
    }
};
//私有
jetsennet.ui.PageFrame.prototype.checkMove = function () {
    var size11 = this.controls[0].size;
    var size12 = this.controls[0].currentSize;

    var size21 = this.controls[1].size;
    var size22 = this.controls[1].currentSize;
    if (Math.abs(size11.width - size12.width) < 5 && Math.abs(size11.height - size12.height) < 5 && Math.abs(size21.width - size22.width) < 5 && Math.abs(size21.height - size22.height) < 5)
        return false;

    return true;
};

/**
jetsennet.ui.PageItem
PageItem是控件的最末端节点
*/
jetsennet.ui.PageItem = function (conId) {
    this.__typeName = "jetsennet.ui.PageItem";
    this.controlId = valueOf(conId, "id", conId) || conId;
    this.size = { width: 0, height: 0 };
    this.position = { top: 0, left: 0 };
    this.onresize = null;
    this.hide = false;
    this.hideSize = 18;
    this.controlIdOfHide = null;
    this.enableHide = false;
    this.onstatechanged = null;
    jetsennet.ui.PageFrames[this.controlId] = this;
};
jetsennet.ui.PageItem.prototype = new jetsennet.ui.FrameControlBase();
/**
呈现控件
由父级调用
*/
jetsennet.ui.PageItem.prototype.render = function () {

    /**
    如果是已初始化，上一大小是存的当前大小(当前大小和给定大小可能有差距)
    */
    var isInit = this.isInit;
    if (this.isInit) {
        this.prevSize = { width: this.currentSize.width, height: this.currentSize.height };
    }
    else {
        this.isInit = true;
        this.prevSize = { width: this.size.width, height: this.size.height };
    }
    this.currentSize = { width: this.size.width, height: this.size.height };

    var parentFrame = jetsennet.ui.PageFrames[this.parentControlId];
    //兼容control无ID情形
    var controlDom = el(this.controlId);
    var thisControl = jQuery(controlDom);
    var parentControl = jQuery("#" + parentFrame.controlId);
    var titleControl = jQuery("#" + valueOf(controlDom, "id", "") + "_title");
    var hideControl = jQuery("#" + this.controlIdOfHide);

    if (this.hide) {

        if (!(this.controlIdOfHide == null || this.controlIdOfHide == "")) {
            if (hideControl.size() > 0) {

                var absWidth = this.getAbsWidth(hideControl, parentFrame.splitType == 0 ? this.hideSize : this.size.width);
                var absHeight = this.getAbsHeight(hideControl, parentFrame.splitType == 1 ? this.hideSize : this.size.height);

                hideControl.css({ "display": "",
                    position: "absolute",
                    left: this.position.left,
                    top: this.position.top,
                    width: absWidth,
                    height: absHeight
                });

                if (hideControl[0].parentNode != parentControl[0])
                    parentControl.append(hideControl);
            }
        }
        thisControl.hide();
        titleControl.hide();
    }
    else {

        if (thisControl.size() == 0) {
            thisControl = jQuery("<div>", { id: this.controlId }).appendTo("body");
        }
        if (thisControl[0].parentNode != parentControl[0]) {
            parentControl.append(thisControl);
        }

        thisControl.show();
        titleControl.show();
        jQuery("#" + this.controlIdOfHide).hide();

        if (thisControl[0].className == null || thisControl[0].className == "") {
            thisControl.addClass("jetsen-pageframe-pageitem");
        }

        //不受限可能为0,受限的最少为1;
        var absWidth = this.getAbsWidth(thisControl, this.size.width);
        var absHeight = this.getAbsHeight(thisControl, this.size.height);
        var positionTop = this.position.top;
        thisControl.css("position", "absolute");

        var edgeSize = jetsennet.util.getControlEdgeSize(thisControl[0]);

        //显示标题栏
        if (this.showTitle && this.titleHeight > 0) {

            if (titleControl.size() == 0) {
                titleControl = jQuery("<div>", { id: this.controlId + "_title" }).attr("controlid", this.controlId).addClass("jetsen-pageframe-title");
            }
            if (this.title != null && jQuery.type(this.title) != "string") {
                titleControl.append(this.title);
            }
            else if (!(this.title == null || this.title == "")) {
                var titleElement = null;
                if (this.title.length < 30) {
                    titleElement = jQuery("#" + this.title);
                }

                if (titleElement == null || titleElement.size() == 0) {
                    titleControl.html(this.title);
                }
                else {
                    titleElement.appendTo(titleControl);
                }
            }
            parentControl.append(titleControl);

            if (this.isPanel && this.isPanelEnableDrag) {
                titleControl.unbind("mousedown").mousedown(function (e) {
                    //titleControl.selectstart(function () { return false; });
                    jetsennet.ui.PagePanel.onMouseDown(e, this.getAttribute("controlid"));

                    jQuery(document).mousemove(jetsennet.ui.PagePanel.onMouseMove);
                    jQuery(document).mouseup(jetsennet.ui.PagePanel.onMouseUp);
                });
            }

            //titleControl.style.zIndex = 99;
            titleControl.css({ height: this.getAbsHeight(titleControl, this.titleHeight),
                top: positionTop + edgeSize.marginTop,
                left: this.position.left + edgeSize.marginLeft, "position": "absolute"
            });

            if (absWidth > 0) {
                titleControl.css({ width: this.getAbsWidth(titleControl, this.size.width - edgeSize.marginLeft - edgeSize.marginRight) });
            }

            positionTop = positionTop + this.titleHeight;
            if (absHeight > 0) {
                absHeight = absHeight - this.titleHeight;
            }
        }

        if (jetsennet["EFFECTS_ENABLE"]) {
            var owner = this;
            thisControl.stop(true, true);
            if (Math.abs(this.prevPos.left - this.position.left) > 50) {
                thisControl.css({ left: this.position.left - 100 });
            }
            if (Math.abs(this.prevPos.top - positionTop) > 50) {
                thisControl.css({ top: positionTop - 100 });
            }
            thisControl.animate({ left: this.position.left, top: positionTop }, "fast");
        }
        else {
            thisControl.css({ left: this.position.left, top: positionTop });
        }

        if (absWidth > 0) {
            thisControl.css({ width: absWidth });
        }
        if (absHeight > 0) {
            thisControl.css({ height: absHeight });
        }

        if (jQuery.isFunction(this.onresize)) {
            this.onresize(this.size);
        }
    }

    this.renderHideButton(parentFrame, parentControl);

    this.prevPos = { top: positionTop, left: this.position.left };

    titleControl = null;
    parentControl = null;
    titleControl = null;
    hideCotrol = null;
};

/**
布局面板，一个面板包含n个子项
*/
jetsennet.ui.PagePanel = function (conId) {
    this.__typeName = "jetsennet.ui.PagePanel";
    this.controlId = conId;
    this.controls = [];
    this.hide = false;
    this.hideSize = 25;
    this.enableDrag = true;
    this.currentControlId = null;
    this.onpanelrender = null;
    jetsennet.ui.PageFrames[conId] = this;
};
jetsennet.ui.PagePanel.prototype = new jetsennet.ui.FrameControlBase();

jetsennet.ui.PagePanel.prototype.render = function () {
    //this.hidePanelItems();
    var isInit = this.isInit;
    if (this.isInit)
        this.prevSize = { width: this.currentSize.width, height: this.currentSize.height };
    else {
        this.isInit = true;
        this.prevSize = { width: this.size.width, height: this.size.height };
    }

    this.currentSize = { width: this.size.width, height: this.size.height };
    var thisControl = jQuery("#" + this.controlId);
    if (thisControl.size() == 0) {
        thisControl = jQuery("<div>", { id: this.controlId }).appendTo("body");
    }

    var parentFrame = jetsennet.ui.PageFrames[this.parentControlId];
    var parentControl = jQuery("#" + parentFrame.controlId);

    if (thisControl[0].className == null || thisControl[0].className == "") {
        thisControl.addClass("jetsen-pageframe-pagepanel");
    }

    if (thisControl[0].parentNode != parentControl[0]) {
        parentControl.append(thisControl);
    }

    thisControl.show();

    //设定子项大小
    for (var i = 0; i < this.controls.length; i++) {

        var panelItem = this.controls[i];
        panelItem.hide = false;
        panelItem.enableHide = this.enableHide;
        panelItem.controlIndex = 0;
        panelItem.parentControlId = this.parentControlId;
        panelItem.isPanel = true;
        panelItem.isPanelEnableDrag = this.enableDrag;
        panelItem.panelControlId = this.controlId;

        if (parentFrame.splitType == 0) {
            panelItem.size.height = this.size.height;
            if (!this.hide)
                panelItem.size.width = this.size.width - this.hideSize;

            if (this.controlIndex == 0) {
                panelItem.position = { left: this.position.left + this.hideSize, top: this.position.top };
            }
            else {
                panelItem.position = { left: this.position.left + (this.hide ? 0 - panelItem.size.width : 0), top: this.position.top };
            }
        }
        else {
            panelItem.size.width = this.size.width;
            if (!this.hide) {
                panelItem.size.height = this.size.height - this.hideSize;
            }

            if (this.controlIndex == 0) {
                panelItem.position = { left: this.position.left, top: this.position.top + this.hideSize };
            }
            else {
                panelItem.position = { left: this.position.left, top: this.position.top + (this.hide ? 0 - panelItem.size.height : 0) };
            }
        }
    }

    /**提供控制面板的绘制接口，以实现丰富的自定义显示*/
    if (jQuery.isFunction(this.onpanelrender)) {
        this.onpanelrender(thisControl);
    }
    else {
        thisControl.html("").attr("controlid", this.controlId);

        if (this.enableDrag) {
            thisControl.unbind("mouseover").mouseover(function () {
                if (gFramePanelItemMouseDown) {
                    gFramePanelItemMoveData[3] = this.getAttribute("controlid");
                }
            }).unbind("mouseout").mouseout(function () {
                if (gFramePanelItemMouseDown) {
                    gFramePanelItemMoveData[3] = null;
                }
            });
        }

        var owner = this;

        /**创建控制按钮*/
        for (var i = 0; i < this.controls.length; i++) {

            var panelItem = this.controls[i];

            jQuery("<img>", { id: panelItem.controlId + "_tool",
                src: panelItem.icon,
                "controlid": panelItem.controlId,
                "panelcontrolid": this.controlId
            })
            .appendTo(thisControl)
            .addClass("jetsen-pageframe-toolitem")
            .mouseover(function () {
                var controlId = this.getAttribute("controlid");
                var panelItem = jetsennet.ui.PageFrames[controlId];
                if (!(panelItem.overIcon == null || panelItem.overIcon == "")) {
                    this.src = panelItem.overIcon;
                }
                else {
                    this.className = "jetsen-pageframe-toolitem-over";
                }
            }).mouseout(function () {
                var controlId = this.getAttribute("controlid");
                var panelItem = jetsennet.ui.PageFrames[controlId];
                var isOverIcon = !(panelItem.overIcon == null || panelItem.overIcon == "");

                var panelControlId = this.getAttribute("panelcontrolid");
                if (valueOf(jetsennet.ui.PageFrames[panelControlId], "currentControlId", null) != controlId) {
                    if (isOverIcon)
                        this.src = panelItem.icon;
                    else
                        this.className = "jetsen-pageframe-toolitem";
                }
                else {
                    if (isOverIcon)
                        this.src = panelItem.overIcon;
                    else
                        this.className = "jetsen-pageframe-toolitem-selected";
                }
            }).click(function (e) { owner.showPanelItem(this.getAttribute("controlid")); e.stopPropagation(); });
            //            .mouseover(jetsennet.throttle(function () { 
            //                owner.showPanelItem(this.getAttribute("controlid")); }, 1000, 2000));
        }
    }

    /**跟停靠方向有关*/
    var absWidth = this.getAbsWidth(thisControl, (this.hide && parentFrame.splitType == 0) ? this.hideSize : this.size.width);
    if (parentFrame.splitType == 0) {
        thisControl.css({ width: this.hideSize });
    }
    else if (absWidth > 0) {
        thisControl.css({ width: absWidth });
    }

    var absHeight = this.getAbsHeight(thisControl, (this.hide && parentFrame.splitType == 1) ? this.hideSize : this.size.height);

    if (parentFrame.splitType == 1) {
        if (this.controlIndex == 0) {
            thisControl.css({ "left": this.position.left, "top": this.position.top }).innerHeight(this.hideSize);
        }
        else {
            thisControl.css({ "left": this.position.left, "top": this.position.top + absHeight - this.hideSize }).innerHeight(this.hideSize);
        }
    }
    else if (absHeight > 0) {
        thisControl.innerHeight(absHeight);
        if (this.controlIndex == 0) {
            thisControl.css({ "left": this.position.left, "top": this.position.top }).innerHeight(absHeight);
        }
        else {
            thisControl.css({ "left": this.position.left + absWidth - this.hideSize, "top": this.position.top }).innerHeight(absHeight);
        }
    }

    thisControl.css({ "position": "absolute" });
    this.showPanelItem(this.hide ? "none" : null);
};

/**
append a new PageItem
*/
jetsennet.ui.PagePanel.prototype.addPanelItem = jetsennet.ui.PagePanel.prototype.addControl = function (pageItem) {

    this.controls[this.controls.length] = pageItem;
    return this;
};
/**
remvoe a PageItem
*/
jetsennet.ui.PagePanel.prototype.removePanelItem = function (pageItem) {

    var itemControlId = typeof pageItem == "string" ? pageItem : pageItem.controlId;
    if (!itemControlId)
        return;

    var newControls = [];
    for (var i = 0; i < this.controls.length; i++) {
        if (this.controls[i].controlId != itemControlId)
            newControls.push(this.controls[i]);
        else {
            this.controls[i].hideControl();
        }
    }
    this.controls = newControls;

    return this;
};

jetsennet.ui.PagePanel.prototype.showPanelItem = function (controlId) {

    controlId = controlId ? controlId : this.currentControlId;
    this.currentControlId = null;

    this.hidePanelItems();

    if (this.controls.length == 0)
        return;

    var panelItem = null;
    if (controlId) {
        for (var i = 0; i < this.controls.length; i++) {
            if (this.controls[i].controlId == controlId)
                panelItem = this.controls[i];
        }
    }

    if (!panelItem) {
        if (this.hide)
            return;
        else {
            panelItem = this.controls[0];
        }
    }

    this.currentControlId = panelItem.controlId;
    if (!(panelItem.overIcon == null || panelItem.overIcon == "")) {
        jQuery("#" + this.currentControlId + "_tool").attr("src", panelItem.overIcon);
    }
    else {
        jQuery("#" + this.currentControlId + "_tool").removeClass().addClass("jetsen-pageframe-toolitem-selected");
    }

    panelItem.render();

    var itemControl = jQuery("#" + panelItem.controlId);
    var titleControl = jQuery("#" + panelItem.controlId + "_title");

    if (this.hide) {
        itemControl.css("zIndex", 99).unbind("click").click(function (e) { e.stopPropagation(); });

        if (titleControl) {
            titleControl.css("zIndex", 0).unbind("click").click(function (e) { e.stopPropagation(); });
        }
    }
    else {
        itemControl.css("zIndex", 0).unbind("click").click(function (e) { });
        if (titleControl) {
            titleControl.css("zIndex", "0").unbind("click").click(function (e) { });
        }
    }
};
jetsennet.ui.PagePanel.prototype.hideControl = function () {
    jQuery("#" + this.controlId).hide();
    jQuery("#" + this.controlId + "_title").hide();

    for (var i = 0; i < this.controls.length; i++) {
        this.controls[i].hideControl();
    }
};
jetsennet.ui.PagePanel.prototype.hidePanelItems = function () {
    for (var i = 0; i < this.controls.length; i++) {
        var panelItem = this.controls[i];
        panelItem.hideControl();

        if (!(panelItem.overIcon == null || panelItem.overIcon == "")) {
            jQuery("#" + panelItem.controlId + "_tool").attr("src", panelItem.icon);
        }
        else {
            jQuery("#" + panelItem.controlId + "_tool").removeClass().addClass("jetsen-pageframe-toolitem");
        }
    }

    jQuery("#" + this.parentControlId + "_hide_control").hide();
};

var gFramePanelItemMouseDown = false;
var gFramePanelItemMoveElement = null;
var gFramePanelItemMoveData = null;     //[el,x,controlId,controlId]

jetsennet.ui.PagePanel.onMouseDown = function (e, controlId) {

    gFramePanelItemMouseDown = true;
    gFramePanelItemMoveData = null;
    gFramePanelItemMoveData = [e.target, e.pageX, controlId, null];
};
jetsennet.ui.PagePanel.onMouseMove = function (e) {

    var x = e.pageX;
    var y = e.pageY;

    if (gFramePanelItemMouseDown && Math.abs(gFramePanelItemMoveData[1] - x) > 5) {
        if (!gFramePanelItemMoveElement) {
            gFramePanelItemMoveElement = jQuery("<div>", {})
            .append(gFramePanelItemMoveData[0].innerText)
            .appendTo("body")
            .css({ width: 200, height: 200 })
            .addClass('jetsen-pageframe-move');
        }

        gFramePanelItemMoveElement.css("top", y - 10).css("left", x + 10);
        jQuery(document.body).css("cursor", 'move');
    }
};
jetsennet.ui.PagePanel.onMouseUp = function (e) {

    if (gFramePanelItemMouseDown) {
        gFramePanelItemMouseDown = false;
        jQuery(document.body).css("cursor", 'default');

        if (gFramePanelItemMoveData && gFramePanelItemMoveData[3]) {

            var sourcePanelItem = jetsennet.ui.PageFrames[gFramePanelItemMoveData[2]];

            if (sourcePanelItem.panelControlId != gFramePanelItemMoveData[3]) {
                var sourcePanel = jetsennet.ui.PageFrames[sourcePanelItem.panelControlId];
                var destPanel = jetsennet.ui.PageFrames[gFramePanelItemMoveData[3]];
                destPanel.addPanelItem(sourcePanelItem);
                sourcePanel.removePanelItem(sourcePanelItem);
                sourcePanel.render();
                destPanel.render();
            }
        }

        if (gFramePanelItemMoveElement) {

            gFramePanelItemMoveElement[0].parentNode.removeChild(gFramePanelItemMoveElement[0]);
            gFramePanelItemMoveElement = null;
        }

        gFramePanelItemMoveData = null;
        jQuery(document).unbind("mousemove", jetsennet.ui.PagePanel.onMouseMove);
        jQuery(document).unbind("mouseup", jetsennet.ui.PagePanel.onMouseUp);
    }
};
/**
页面快速布局
@option PageFrame 的属性
@param [] layout 布局的分隔宽度或高度值，数组长度对应于子节点的长度 [100,200,"auto"]
当数组元素为复杂类型时，格式等同于options
[100,200,{layout:[100,200,"auto"]},"auto"]
用于显示标题的标签:titleTag
是否PagePanel:isPanel
*/
jQuery.fn.pageFrame = function (options) {

    var size = this.size();

    if (size == 0) {
        return null;
    }

    if (size > 1) {
        var result = [];
        for (var s = 0; s < size; s++) {
            result.push(jQuery(this[s]).pageFrame(options));
        }
        return result;
    }
    else {
        var layout = options.layout;
        if (jetsennet.util.isNullOrEmpty(this[0].id)) {
            this[0].id = new jetsennet.util.Guid.newGuid().toString();
        }

        var pageFrame = null;

        if (options.isPanel) {
            pageFrame = jQuery.extend(jQuery.extend(new jetsennet.ui.PagePanel(this[0].id),
                    { size: { width: "50%", height: "50%"} }), options);
        }
        else {
            pageFrame = jQuery.extend(jQuery.extend(new jetsennet.ui.PageFrame(this[0].id),
                { showSplit: false, size: { width: "50%", height: "50%"} }), options);
        }

        var children = this.children();
        var currentFrame = pageFrame;

        for (var i = 0; i < children.length; i++) {

            var curLayout = layout.length > i ? layout[i] : "auto";

            //有layout说明是个PageFrame或PagePanel
            if (valueOf(curLayout, "layout") != null) {
                currentFrame.addControl(jQuery(children[i]).pageFrame(curLayout));
            }
            else {
                if (jetsennet.util.isNullOrEmpty(children[i].id)) {
                    children[i].id = new jetsennet.util.Guid.newGuid().toString();
                }
                var pageItem = jQuery.extend(new jetsennet.ui.PageItem(children[i]), { size: { width: "50%", height: "50%"} });

                //大小
                if (curLayout != "auto") {
                    pageItem.size = { width: curLayout, height: curLayout };
                    if (currentFrame.controls.length == 1) {
                        currentFrame.fixControlIndex = 1;
                    }
                }
                else {
                    if (currentFrame.controls.length == 0) {
                        currentFrame.fixControlIndex = 1;
                    }
                }

                //标题
                if (valueOf(options, "titleTag", "") != "") {
                    var titles = jQuery(children[i]).children(options.titleTag);
                    if (titles.size() > 0) {
                        jQuery.extend(pageItem, { showTitle: true, title: titles[0] });
                    }
                }

                currentFrame.addControl(pageItem);
            }

            if (options.isPanel) {
                jQuery(children[i]).appendTo("body");
                jQuery.extend(currentFrame.controls[currentFrame.controls.length - 1], { icon: children[i].getAttribute("icon") });
            }
            else if (i < layout.length - 2) {
                //对于大小不确定的加总没有意义
                var totalSize = 0;
                for (var j = i + 1; j < layout.length; j++) {
                    var temp = valueOf(layout[j], "layout") != null ? 0 : (jetsennet.util.right(layout[j], 1) == "%" ? 0 : (layout[j] == "auto" ? 0 : layout[j]));
                    totalSize += temp;
                }

                var subFrame = jQuery.extend(jQuery.extend(
                    new jetsennet.ui.PageFrame(this[0].id + "-" + (i + 1)),
                        { size: { width: "50%", height: "50%" }, showSplit: false }), options);
                if (totalSize != 0) {
                    subFrame.size = { width: totalSize, height: totalSize };
                }

                currentFrame.addControl(subFrame);
                currentFrame = subFrame;
            }
        }

        return pageFrame;
    }
};