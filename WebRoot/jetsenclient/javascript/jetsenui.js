// lixiaomin 2012-03-08
//=============================================================================
// Jetsen UI
//=============================================================================
jetsennet.addLoadedUri(jetsennet.getloadUri("jetsenui"));
jetsennet.importCss("jetsenui");

jetsennet.registerNamespace("jetsennet.ui");

/**鱼眼效果*/
jetsennet.ui.Fisheye = function (container, options) {
    var owner = this;
    this.container = el(container);
    this.options = jQuery.extend({ itemWidth: 80, maxWidth: 50, proximity: 100, textTag: "", itemTag: "span", control: null, pos: jetsennet.util.getPosition(this.container, 0) }, options);
    this.options.items = jQuery(this.options.control).children(this.options.itemTag).each(function (item) {
        if (this.parentNode == owner.options.control)
            return true;
    });

    if (!jetsennet.util.isNullOrEmpty(owner.options.textTag)) {
        jQuery.each(this.options.items, function () {
            this.onmouseover = jetsennet.bindFunction(this, function () {
                jQuery(owner.options.textTag, this).css("display", "block");
            });
        });
        jQuery.each(this.options.items, function () {
            this.onmouseout = jetsennet.bindFunction(this, function () {
                jQuery(owner.options.textTag, this).hide();
            });
        });
    }

    jQuery(window).resize(function () {
        owner.options.pos = jetsennet.util.getPosition(owner.container, 0);
    });

    jQuery(document).mousemove(
		function (e) {
		    var pointer = jetsennet.util.getMousePosition();
		    var toAdd = 0;
		    if (owner.options.align && owner.options.align == 'center')
		        var posx = pointer.left - owner.options.pos.left - (owner.container.offsetWidth - owner.options.itemWidth * owner.options.items.length) / 2 - owner.options.itemWidth / 2;
		    else if (owner.options.align && owner.options.align == 'right')
		        var posx = pointer.left - owner.options.pos.left - owner.container.offsetWidth + owner.options.itemWidth * owner.options.items.length;
		    else
		        var posx = pointer.left - owner.options.pos.left;
		    var posy = Math.pow(pointer.top - owner.options.pos.top - owner.container.offsetHeight / 2, 2);

		    jQuery.each(owner.options.items,
				function (nr) {
				    distance = Math.sqrt(
						Math.pow(posx - nr * owner.options.itemWidth, 2)
						+ posy
					);
				    distance -= owner.options.itemWidth / 2;

				    distance = distance < 0 ? 0 : distance;
				    distance = distance > owner.options.proximity ? owner.options.proximity : distance;
				    distance = owner.options.proximity - distance;

				    extraWidth = owner.options.maxWidth * distance / owner.options.proximity;

				    jQuery(this).css({ "width": owner.options.itemWidth + extraWidth, "left": owner.options.itemWidth * nr + toAdd });
				    toAdd += extraWidth;
				}
			);
		    owner.refresh(toAdd);
		}
	);
    jQuery.each(this.options.items,
		function (i) {
		    jQuery(this).css({ "width": owner.options.itemWidth, "left": owner.options.itemWidth * i });
		});

    this.refresh = function (toAdd) {
        if (this.options.align)
            if (this.options.align == 'center')
                this.options.control.style.left = (this.container.offsetWidth - this.options.itemWidth * this.options.items.length) / 2 - toAdd / 2 + 'px';
            else if (this.options.align == 'left')
                this.options.control.style.left = -toAdd / this.options.items.length + +'px';
            else if (this.options.align == 'right')
                this.options.control.style.left = (this.container.offsetWidth - this.options.itemWidth * this.options.items.length) - toAdd / 2 + 'px';

        this.options.control.style.width = this.options.itemWidth * this.options.items.length + toAdd + 'px';
    };

    this.refresh(0);
};
jetsennet.fisheye = function (container, options) {
    new jetsennet.ui.Fisheye(container, options);
};

//拖拽
jetsennet.ui.Drag = function (options) {
    this.currentX = this.currentY = 0;

    this.fm = jetsennet.bindFunction(this, this.move);
    this.fs = jetsennet.bindFunction(this, this.stop);

    this.handle = null;
    this.container = null;
    this.dragClone = false;             //拖拽复本
    this.dragNone = false;              //不改变本身位置，仅在dragClone时有效
    this.dragControl = null;
    this.absoluteDrag = true;           //绝对拖拽
    this.lock = false;
    this.limit = false;
    this.onstart = function () { };
    this.onmove = function () { };
    this.onstop = function () { };

    this.limitOptions = { container: null, left: 0, right: 9999, top: 0, bottom: 9999, lockX: false, lockY: false };
    options.limitOptions = jQuery.extend(this.limitOptions, options.limitOptions);
    jQuery.extend(this, options);

    if (this.handle == null) {
        this.handle = this.drag;
    }

    jQuery(this.handle).mousedown(jetsennet.bindFunction(this, this.start));
};
jetsennet.ui.Drag.prototype = {
    //准备拖动
    start: function () {
        var evt = jetsennet.getEvent();
        //jetsennet.cancelEvent();

        if (this.lock) {
            return;
        }

        //记录鼠标相对拖放对象的位置
        var scrollSize = { width: 0, height: 0 };
        if (this.limit && !!this.limitOptions.container) {
            scrollSize = jetsennet.util.getScrolls(this.limitOptions.container);
        }

        var offset = this.absoluteDrag ? jetsennet.util.getPosition(this.drag, 0) : jQuery(this.drag).position();

        if (this.dragClone) {
            this.dragControl = jQuery(this.drag).clone().appendTo(this.drag.parentNode)[0];
        }
        else {
            this.dragControl = this.drag;
        }

        this.onstart();

        jQuery(this.dragControl).css({ position: "absolute" }).show();

        if (this.absoluteDrag) {
            jQuery(this.dragControl).appendTo("body");
        }

        this.position = { top: offset.top, left: offset.left };

        this.currentX = evt.clientX - this.position.left + scrollSize.width;
        this.currentY = evt.clientY - this.position.top + scrollSize.height;

        this.repair();

        jQuery(document).mousemove(this.fm);
        jQuery(document).mouseup(this.fs);

        if (IS_IE) {
            this.handle.setCapture();
        }
    },
    //修正范围
    repair: function () {
        if (this.limit) {
            //修正错误范围参数
            this.limitOptions.right = Math.max(this.limitOptions.right, this.limitOptions.left + this.dragControl.offsetWidth);
            this.limitOptions.bottom = Math.max(this.limitOptions.bottom, this.limitOptions.top + this.dragControl.offsetHeight);
            //如果有容器必须设置position为relative或absolute来相对或绝对定位，并在获取offset之前设置
            !this.limitOptions.container || jetsennet.util.getCurrentStyle(this.limitOptions.container).position == "relative"
                || jetsennet.util.getCurrentStyle(this.limitOptions.container).position == "absolute"
                || (this.limitOptions.container.style.position = "relative");
        }
    },
    //拖动
    move: function () {
        var evt = jetsennet.getEvent();
        //判断是否锁定
        if (this.lock) { this.stop(); return; };
        //清除选择
        window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
        //设置移动参数
        var scrollSize = { width: 0, height: 0 };
        if (!!this.limitOptions.container) {
            scrollSize = jetsennet.util.getScrolls(this.limitOptions.container);
        }

        var iLeft = evt.clientX - this.currentX + scrollSize.width, iTop = evt.clientY - this.currentY + scrollSize.height;

        //设置范围限制
        if (this.limit) {
            //设置范围参数
            var mxLeft = this.limitOptions.left, mxRight = this.limitOptions.right,
                mxTop = this.limitOptions.top, mxBottom = this.limitOptions.bottom;
            //如果设置了容器，再修正范围参数
            if (!!this.limitOptions.container) {
                var addSize = this.absoluteDrag ? jetsennet.util.getPosition(this.limitOptions.container, 0) : { left: 0, top: 0 };
                //var addSize = { left: 0, top: 0 };
                mxLeft = Math.max(mxLeft, 0) + addSize.left;
                mxTop = Math.max(mxTop, 0) + addSize.top;
                mxRight = Math.min(mxRight, Math.max(this.limitOptions.container.scrollWidth, this.limitOptions.container.offsetWidth)) + addSize.left;
                mxBottom = Math.min(mxBottom, Math.max(this.limitOptions.container.scrollHeight, this.limitOptions.container.offsetHeight)) + addSize.top;
            };
            //修正移动参数
            iLeft = Math.max(Math.min(iLeft, mxRight - jQuery(this.dragControl).outerWidth(true)), mxLeft);
            iTop = Math.max(Math.min(iTop, mxBottom - jQuery(this.dragControl).outerHeight(true)), mxTop);
        };

        //设置位置，并修正margin       
        if (!(this.limit && this.limitOptions.lockX)) { this.position.left = iLeft; this.dragControl.style.left = this.position.left + "px"; }
        if (!(this.limit && this.limitOptions.lockY)) { this.position.top = iTop; this.dragControl.style.top = this.position.top + "px"; }
        //附加程序
        this.onmove(this.position);
    },
    //停止拖动
    stop: function () {
        jetsennet.cancelEvent();
        //移除事件
        jQuery(document).unbind("mousemove", this.fm);
        jQuery(document).unbind("mouseup", this.fs);

        if (this.dragClone) {
            jQuery(this.dragControl).remove();

            if (!this.dragNone) {
                if (jetsennet["EFFECTS_ENABLE"]) {
                    jQuery(this.drag).stop(true, true).animate({ left: this.position.left, top: this.position.top });
                }
                else {
                    this.drag.style.left = this.position.left + "px";
                    this.drag.style.top = this.position.top + "px";
                }
            }
        }
        //附加程序
        this.onstop(this.position);

        if (IS_IE) {
            this.handle.releaseCapture();
        }
    }
};
jQuery.fn.draggable = function (options) {
    var size = this.size();

    if (size == 0) {
        return null;
    }
    if (size > 1) {
        var result = [];
        for (var s = 0; s < size; s++) {
            result.push(jQuery(this[s]).draggable(options));
        }
        return result;
    }
    else {
        options.drag = this[0];
        return new jetsennet.ui.Drag(options);
    }
};

//改变大小
jetsennet.ui.Region = function (options) {
    this.region = null; //缩放对象
    this._fun = function () { }; //缩放执行程序
    this.onresize = function () { };
    this.onsizechanged = function () { };

    //事件对象(用于绑定移除事件)
    this.fr = jetsennet.bindFunction(this, this.resize);
    this.fs = jetsennet.bindFunction(this, this.stop);

    this.limitOptions = { container: null, top: 0, left: 0, right: 9999, bottom: 9999, minWidth: 0, minHeight: 0, maxWidth: 9999, maxHeight: 9999, scale: false };
    options.limitOptions = jQuery.extend(this.limitOptions, options.limitOptions);
    jQuery.extend(this, options);

    //比例缩放   
    this.ratio = 1;

    //this.region.style.position = "absolute";
    !this.limitOptions.container || jetsennet.util.getCurrentStyle(this.limitOptions.container).position == "relative" || (this.limitOptions.container.style.position = "relative");
};

//设置触发对象
jetsennet.ui.Region.prototype.set = function (resize, side) {
    var resize = el(resize), fun;
    if (!resize) return;
    //根据方向设置
    switch (side.toLowerCase()) {
        case "up":
            fun = this.up;
            break;
        case "down":
            fun = this.down;
            break;
        case "left":
            fun = this.left;
            break;
        case "right":
            fun = this.right;
            break;
        case "left-up":
            fun = this.leftUp;
            break;
        case "right-up":
            fun = this.rightUp;
            break;
        case "left-down":
            fun = this.leftDown;
            break;
        case "right-down":
        default:
            fun = this.rightDown;
    };
    //设置触发对象
    jQuery(resize).mousedown(jetsennet.bindFunction(this, this.start, fun));

    return this;
};
//准备缩放
jetsennet.ui.Region.prototype.start = function (fun, touch) {
    //防止冒泡(跟拖放配合时设置)
    var e = jetsennet.getEvent();
    jetsennet.cancelEvent();

    //获取边框宽度
    this.controlSize = jetsennet.util.getControlEdgeSize(this.region);

    //设置执行程序
    this._fun = fun;
    //样式参数值
    var regionObj = jQuery(this.region);
    var offset = regionObj.position();
    this._styleWidth = regionObj.innerWidth();
    this._styleHeight = regionObj.innerHeight();
    this._styleLeft = offset.left;
    this._styleTop = offset.top;

    //四条边定位坐标
    this._sideLeft = e.clientX - this._styleWidth;
    this._sideRight = e.clientX + this._styleWidth;
    this._sideUp = e.clientY - this._styleHeight;
    this._sideDown = e.clientY + this._styleHeight;
    //top和left定位参数
    this._fixLeft = this._styleLeft + this._styleWidth;
    this._fixTop = this._styleTop + this._styleHeight;

    //缩放比例
    if (this.limit && this.limitOptions.scale) {
        //设置比例
        this.ratio = Math.max(this.ratio, 0) || this._styleWidth / this._styleHeight;
        //left和top的定位坐标
        this._scaleLeft = this._styleLeft + this._styleWidth / 2;
        this._scaleTop = this._styleTop + this._styleHeight / 2;
    };
    //范围限制
    if (this.limit) {
        //设置范围参数
        var mxLeft = this.limitOptions.left, mxRight = this.limitOptions.right, mxTop = this.limitOptions.top, mxBottom = this.limitOptions.bottom;

        //如果设置了容器，再修正范围参数
        if (!!this.limitOptions.container) {
            mxLeft = Math.max(mxLeft, 0);
            mxTop = Math.max(mxTop, 0);
            mxRight = Math.min(mxRight, jQuery(this.limitOptions.container).innerWidth());
            mxBottom = Math.min(mxBottom, jQuery(this.limitOptions.container).innerHeight());
        };

        //根据最小值再修正
        mxRight = Math.max(mxRight, mxLeft + (this.limitOptions.minWidth) + this.controlSize.borderWidth);
        mxBottom = Math.max(mxBottom, mxTop + (this.limitOptions.minHeight) + this.controlSize.borderHeight);


        //由于转向时要重新设置所以写成function形式
        this._mxSet = function () {
            this._mxRightWidth = Math.min(mxRight - this._styleLeft - this.controlSize.borderWidth - this.controlSize.marginWidth, this.limitOptions.maxWidth);
            this._mxDownHeight = Math.min(mxBottom - this._styleTop - this.controlSize.borderHeight - this.controlSize.marginHeight, this.limitOptions.maxHeight);
            this._mxUpHeight = Math.min(Math.max(this._fixTop - mxTop, this.limitOptions.minHeight), this.limitOptions.maxHeight);
            this._mxLeftWidth = Math.min(Math.max(this._fixLeft - mxLeft, this.limitOptions.minWidth), this.limitOptions.maxWidth);
        };
        this._mxSet();

        //有缩放比例下的范围限制
        if (this.limitOptions.scale) {
            this._mxScaleWidth = Math.min(this._scaleLeft - mxLeft, mxRight - this._scaleLeft - this.controlSize.borderWidth) * 2;
            this._mxScaleHeight = Math.min(this._scaleTop - mxTop, mxBottom - this._scaleTop - this.controlSize.borderHeight) * 2;
        };
    };

    jQuery(document).bind("mousemove", this.fr);
    jQuery(document).bind("mouseup", this.fs);
    if (IS_IE) {
        this.region.setCapture();
    }
};
//缩放
jetsennet.ui.Region.prototype.resize = function () {
    var e = jetsennet.getEvent();
    //清除选择
    window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
    //执行缩放程序
    this._fun(e);
    //设置样式，变量必须大于等于0否则ie出错
    jQuery(this.region).innerHeight(this._styleHeight).innerWidth(this._styleWidth).css({ top: this._styleTop, left: this._styleLeft });
    //附加程序
    this.onresize();
};
//缩放程序
//上
jetsennet.ui.Region.prototype.up = function (e) {
    this.repairY(this._sideDown - e.clientY, this._mxUpHeight);
    this.repairTop();
    this.turnDown(this.down);
};
//下
jetsennet.ui.Region.prototype.down = function (e) {
    this.repairY(e.clientY - this._sideUp, this._mxDownHeight);
    this.turnUp(this.up);
};
//右
jetsennet.ui.Region.prototype.right = function (e) {
    this.repairX(e.clientX - this._sideLeft, this._mxRightWidth);
    this.turnLeft(this.left);
};
//左
jetsennet.ui.Region.prototype.left = function (e) {
    this.repairX(this._sideRight - e.clientX, this._mxLeftWidth);
    this.repairLeft();
    this.turnRight(this.right);
};
//右下
jetsennet.ui.Region.prototype.rightDown = function (e) {
    this.repairAngle(
		e.clientX - this._sideLeft, this._mxRightWidth,
		e.clientY - this._sideUp, this._mxDownHeight
	);
    this.turnLeft(this.leftDown) || this.limitOptions.scale || this.turnUp(this.rightUp);
};
//右上
jetsennet.ui.Region.prototype.rightUp = function (e) {
    this.repairAngle(
		e.clientX - this._sideLeft, this._mxRightWidth,
		this._sideDown - e.clientY, this._mxUpHeight
	);
    this.repairTop();
    this.turnLeft(this.leftUp) || this.limitOptions.scale || this.turnDown(this.rightDown);
};
//左下
jetsennet.ui.Region.prototype.leftDown = function (e) {
    this.repairAngle(
		this._sideRight - e.clientX, this._mxLeftWidth,
		e.clientY - this._sideUp, this._mxDownHeight
	);
    this.repairLeft();
    this.turnRight(this.rightDown) || this.limitOptions.scale || this.turnUp(this.leftUp);
};
//左上
jetsennet.ui.Region.prototype.leftUp = function (e) {
    this.repairAngle(
		this._sideRight - e.clientX, this._mxLeftWidth,
		this._sideDown - e.clientY, this._mxUpHeight
	);
    this.repairTop();
    this.repairLeft();
    this.turnRight(this.rightUp) || this.limitOptions.scale || this.turnDown(this.leftDown);
};
//修正程序
//水平方向
jetsennet.ui.Region.prototype.repairX = function (iWidth, mxWidth) {
    iWidth = this.repairWidth(iWidth, mxWidth);
    if (this.limitOptions.scale) {
        var iHeight = this.repairScaleHeight(iWidth);
        if (this.limit && iHeight > this._mxScaleHeight) {
            iHeight = this._mxScaleHeight;
            iWidth = this.repairScaleWidth(iHeight);
        } else if (this.limit && iHeight < this.limitOptions.minHeight) {
            var tWidth = this.repairScaleWidth(this.limitOptions.minHeight);
            if (tWidth < mxWidth) { iHeight = this.limitOptions.minHeight; iWidth = tWidth; }
        }
        this._styleHeight = iHeight;
        this._styleTop = this._scaleTop - iHeight / 2;
    }
    this._styleWidth = iWidth;
};
//垂直方向
jetsennet.ui.Region.prototype.repairY = function (iHeight, mxHeight) {
    iHeight = this.repairHeight(iHeight, mxHeight);
    if (this.limitOptions.scale) {
        var iWidth = this.repairScaleWidth(iHeight);
        if (this.limit && iWidth > this._mxScaleWidth) {
            iWidth = this._mxScaleWidth;
            iHeight = this.repairScaleHeight(iWidth);
        } else if (this.limit && iWidth < this.limitOptions.minWidth) {
            var tHeight = this.repairScaleHeight(this.limitOptions.minWidth);
            if (tHeight < mxHeight) { iWidth = this.minWidth; iHeight = tHeight; }
        }
        this._styleWidth = iWidth;
        this._styleLeft = this._scaleLeft - iWidth / 2;
    }
    this._styleHeight = iHeight;
};
//对角方向
jetsennet.ui.Region.prototype.repairAngle = function (iWidth, mxWidth, iHeight, mxHeight) {
    iWidth = this.repairWidth(iWidth, mxWidth);
    if (this.limitOptions.scale) {
        iHeight = this.repairScaleHeight(iWidth);
        if (this.limit && iHeight > mxHeight) {
            iHeight = mxHeight;
            iWidth = this.repairScaleWidth(iHeight);
        } else if (this.limit && iHeight < this.limitOptions.minHeight) {
            var tWidth = this.repairScaleWidth(this.limitOptions.minHeight);
            if (tWidth < mxWidth) { iHeight = this.limitOptions.minHeight; iWidth = tWidth; }
        }
    } else {
        iHeight = this.repairHeight(iHeight, mxHeight);
    }
    this._styleWidth = iWidth;
    this._styleHeight = iHeight;
};
//top
jetsennet.ui.Region.prototype.repairTop = function () {
    this._styleTop = this._fixTop - this._styleHeight;
};
//left
jetsennet.ui.Region.prototype.repairLeft = function () {
    this._styleLeft = this._fixLeft - this._styleWidth;
};
//height
jetsennet.ui.Region.prototype.repairHeight = function (iHeight, mxHeight) {
    iHeight = Math.min(this.limit ? mxHeight : iHeight, iHeight);
    iHeight = Math.max(this.limit ? this.limitOptions.minHeight : iHeight, iHeight, 0);
    return iHeight;
};
//width
jetsennet.ui.Region.prototype.repairWidth = function (iWidth, mxWidth) {
    iWidth = Math.min(this.limit ? mxWidth : iWidth, iWidth);
    iWidth = Math.max(this.limit ? this.limitOptions.minWidth : iWidth, iWidth, 0);
    return iWidth;
};
//比例高度
jetsennet.ui.Region.prototype.repairScaleHeight = function (iWidth) {
    return Math.max(Math.round((iWidth + this.contorlSize.borderWidth) / this.ratio - this.contorlSize.borderHeight), 0);
};
//比例宽度
jetsennet.ui.Region.prototype.repairScaleWidth = function (iHeight) {
    return Math.max(Math.round((iHeight + this.contorlSize.borderHeight) * this.ratio - this.contorlSize.borderWidth), 0);
};
//转向程序
//转右
jetsennet.ui.Region.prototype.turnRight = function (fun) {
    if (!((this.limit && this.limitOptions.minWidth > 0) || this._styleWidth)) {
        this._fun = fun;
        this._sideLeft = this._sideRight;
        this.limit && this._mxSet();
        return true;
    }
};
//转左
jetsennet.ui.Region.prototype.turnLeft = function (fun) {
    if (!((this.limit && this.limitOptions.minWidth > 0) || this._styleWidth)) {
        this._fun = fun;
        this._sideRight = this._sideLeft;
        this._fixLeft = this._styleLeft;
        this._styleLeft = this._styleLeft + this.controlSize.marginLeft;
        this.limit && this._mxSet();
        return true;
    }
};
//转上
jetsennet.ui.Region.prototype.turnUp = function (fun) {
    if (!((this.limit && this.limitOptions.minHeight > 0) || this._styleHeight)) {
        this._fun = fun;
        this._sideDown = this._sideUp;
        this._fixTop = this._styleTop;
        this._styleTop = this._styleTop + this.controlSize.marginTop;
        this.limit && this._mxSet();
        return true;
    }
};
//转下
jetsennet.ui.Region.prototype.turnDown = function (fun) {
    if (!((this.limit && this.limitOptions.minHeight > 0) || this._styleHeight)) {
        this._fun = fun;
        this._sideUp = this._sideDown;
        this.limit && this._mxSet();
        return true;
    }
};
//停止缩放
jetsennet.ui.Region.prototype.stop = function () {

    jetsennet.cancelEvent();

    jQuery(document).unbind("mousemove", this.fr);
    jQuery(document).unbind("mouseup", this.fs);

    if (IS_IE) {
        this.region.releaseCapture();
    }

    //附加程序
    this.onsizechanged();
};

jQuery.fn.resizable = function (options) {
    options.region = this[0];
    return new jetsennet.ui.Region(options);
};

/**
//PopupBehavior 一种用于弹出控件的基础包装
*/
jetsennet.registerNamespace("jetsennet.ui.PopupBehavior");

jetsennet.ui.PopupBehavior.controls = new jetsennet.util.ArrayList();

jetsennet.ui.PopupBehavior.initialized = false;

jetsennet.hidePopups = function () {
    var evt = jetsennet.getEvent();
    if (IS_MAC && evt.button != 0) {
        return;
    }

    var popLength = jetsennet.ui.PopupBehavior.controls.getCount();

    for (var i = 0; i < popLength; i++) {
        jetsennet.hide(el(jetsennet.ui.PopupBehavior.controls.getAt(i)));
    }
    jetsennet.ui.PopupBehavior.controls = null;
    jetsennet.ui.PopupBehavior.controls = new jetsennet.util.ArrayList();

    jQuery(document).unbind("click", jetsennet.hidePopups);
    jetsennet.ui.PopupBehavior.initialized = false;
};

jetsennet.ui.PopupBehavior.init = function () {
    if (jetsennet.ui.PopupBehavior.initialized)
        return;
    jQuery(document).click(jetsennet.hidePopups);
    jetsennet.ui.PopupBehavior.initialized = true;
};

jetsennet.popup = function (/*Element*/element, /*{reference,position,showOthers,direction}*/props) {

    var thisControl = jQuery(element);
    if (thisControl.size() == 0) {
        return;
    }

    var options = jQuery.extend({}, props);
    jetsennet.cancelEvent(true);
    if (!options.showOthers) {
        jetsennet.hidePopups();//fix:多个弹出对象的bug
    }
    jetsennet.ui.PopupBehavior.init();
    jetsennet.hide(thisControl[0]);

    thisControl.appendTo("body").css({ display: "block", position: "absolute", top: 0, left: 0 });
    var controlPos;

    if (options.reference) {
        controlPos = jetsennet.util.getPosition(options.reference, options.position ? options.position : 1);
    }
    else {
        var evt = jetsennet.getEvent();
        if (evt && options.direction) {
            var evtPos = jetsennet.util.getMousePosition();
            controlPos = { left: evtPos.left, top: evtPos.top - thisControl[0].offsetHeight - 2};
        } else if (evt && !options.position) {
            var evtPos = jetsennet.util.getMousePosition();
            controlPos = { left: evtPos.left, top: evtPos.top };
        } else {
            /**
            如果有准确位置显示在准确位置
            否则显示在屏幕中央
            */
            if (options.position && options.position.left && options.position.top)
                controlPos = { left: options.position.left, top: options.position.top };
            else
                controlPos = jetsennet.util.getCenterScreenPosition(thisControl[0]);
        }
    }

    var viewSize = jetsennet.util.getWindowViewSize();
    /**
    当前位置+控件宽度大于可视窗大小时，左移控件宽度
    左移时，如果有相对控件，则根据情况再左移或右移
    */
    if (controlPos.left + thisControl[0].offsetWidth > viewSize.width) {
        controlPos.left = controlPos.left - thisControl[0].offsetWidth;
        if (options.reference && (options.position == null || options.position == 1)) {
            controlPos.left += jetsennet.util.getControlSize(options.reference).viewWidth;
        }
        else if (options.reference && position == 2) {
            controlPos.left -= jetsennet.util.getControlSize(options.reference).viewWidth;
        }
    }
    if (controlPos.top + thisControl[0].offsetHeight > viewSize.height) {
        controlPos.top = controlPos.top - thisControl[0].offsetHeight - 2;
        if (options.reference && (options.position == null || options.position == 1)) {
            controlPos.top -= jetsennet.util.getControlSize(options.reference).viewHeight;
        }
    }
    controlPos.top = controlPos.top < 0 ? 0 : controlPos.top;
    controlPos.left = controlPos.left < 0 ? 0 : controlPos.left;

    thisControl.css({ top: (controlPos.top + 1), left: (controlPos.left), zIndex: 60000 });

    var layerFrame = document.createElement("iframe");
    jQuery.extend(layerFrame.style, { zIndex: 50000, opacity: 0, filter: "Alpha(Opacity=0)" });
    layerFrame.frameBorder = 2;
    layerFrame.scrolling = "no";
    layerFrame.id = jetsennet.util.Guid.NewGuid().toString();
    jQuery(layerFrame).css({ width: thisControl[0].offsetWidth, height: thisControl[0].offsetHeight,
        top: controlPos.top + 1, left: controlPos.left, position: "absolute"
    }).appendTo("body");

    thisControl.attr("popframeid", layerFrame.id);

    if (!thisControl[0].id) {
        thisControl[0].id = jetsennet.util.Guid.NewGuid().toString();
    }

    jetsennet.ui.PopupBehavior.controls.add(thisControl[0].id);

    if (jetsennet["EFFECTS_ENABLE"]) {
        thisControl.stop(true, true).hide().fadeIn();
    }
};

jetsennet.hide = function (/*Element*/element) {

    var thisControl = el(element);
    if (thisControl == null)
        return;

    var backControl = el(attributeOf(thisControl, "popframeid", ""));
    if (backControl != null) {
        backControl.parentNode.removeChild(backControl);
    }

    if (jetsennet["EFFECTS_ENABLE"]) {
        jQuery(thisControl).stop(true, true).fadeOut();
    }
    else {
        jQuery(thisControl).hide();
    }
};

jQuery.fn.popup = function (options) {
    jetsennet.popup(this, options);
    return this;
};

jQuery.fn.hidepop = function () {
    jetsennet.hide(this[0]);
    return this;
};

/*
jetsennet.ui.ToolTip;lixiaomin 2008-05-28 提示控件
<a href="#" onmouseover="jetsennet.tooltip('',this)" onmouseout="jetsennet.hidetip()">test</a>
<a href="#" onmouseover="jetsennet.tooltip('<br>', this)" onmouseout="jetsennet.hidetip()">test</a>
<a href="#" onmouseover="jetsennet.tooltip('<marquee></marquee>',this)" onmouseout="jetsennet.hidetip()">test</a>
*/
jetsennet.registerNamespace("jetsennet.ui.ToolTip");
jetsennet.tooltip = function (/*msg-content*/msg, extprops) {

    if (jetsennet.util.isNullOrEmpty(msg))
        return;

    window.clearTimeout(jetsennet.tooltip.timeoutId);
    var thisWidth = msg.length * 18;
    if (thisWidth > 300) {
        thisWidth = 300;
    } else if (thisWidth < 80) {
        thisWidth = 80;
    }
    var props = jQuery.extend({ instanceId: "jetsen-tooltip-control", width: thisWidth, reference: null, position: 1, offset: { width: 0, height: 0 }, connector: true, align: "middle", timeout: 0, closeBox: false }, extprops);

    if (props.width) thisWidth = props.width;

    var tooltipControl = jQuery("#" + props.instanceId);
    if (tooltipControl.size() == 0) {
        tooltipControl = jQuery("<div>", { id: props.instanceId })
        .appendTo("body")
        .css("position", "absolute")
        .mouseover(function () { window.clearTimeout(jetsennet.tooltip.timeoutId); })
        .mouseout(function () { if (!jetsennet.util.isMouseInPosition(el(props.instanceId + '-msgcontrol'))) { jetsennet.hidetip(this.id); } });
    }

    var contents = ['<IFRAME id="' + props.instanceId + '-frmcontrol" style="Z-INDEX:1;FILTER:Alpha(Opacity=\'0\');LEFT:0px;WIDTH:1px; POSITION:absolute;TOP:15px;HEIGHT:1px;border:none;" src=\'javascript:""\'></IFRAME>'];
    contents.push('<div id="' + props.instanceId + '-msgcontrol" style="left: 0px;top: 0px;width:100%" ><div class="jetsen-tooltip-container" >');
    contents.push(msg);
    contents.push("</div>");
    contents.push('<div class="jetsen-tooltip-connector"></div>');
    if (props.closeBox) {
        contents.push('<div class="jetsen-tooltip-close" onclick="jetsennet.hidetip(\'' + props.instanceId + '\')"></div>');
    }
    contents.push('</div>');

    tooltipControl.css({ display: "block", zIndex: 1000000, width: thisWidth }).html(contents.join(""));

    var thisPosition = { left: 0, top: 0 };

    var referenceProps = { height: 0, width: 0 };
    if (props.reference) {
        referenceProps = { height: props.reference.offsetHeight, width: props.reference.clientWidth };
        thisPosition = jetsennet.util.getPosition(props.reference, 1);
    }
    else if (props.position && props.position.left != null) {
        thisPosition = { left: props.position.left, top: props.position.top };
    }
    else {
        thisPosition = jetsennet.util.getCenterScreenPosition(tooltipControl[0]);
    }
    var viewSize = jetsennet.util.getWindowViewSize();
    var positionClass = "jetsen-tooltip-above";

    if (props.reference) {
        positionClass = "jetsen-tooltip-below";
        if (props.position != null) {
            if (props.position == 0) {
                /**显示在控件上方*/
                positionClass = "jetsen-tooltip-above";
                thisPosition.top = thisPosition.top - referenceProps.height - tooltipControl[0].offsetHeight - 10;
            }
            else if (props.position == 2) {
                /**显示在控件左边*/
                positionClass = "jetsen-tooltip-left";
                thisPosition.left = thisPosition.left - thisWidth - 10;
                thisPosition.top = thisPosition.top - referenceProps.height;
            }
            else if (props.position == 3) {
                /**显示在控件右边*/
                positionClass = "jetsen-tooltip-right";
                thisPosition.left = thisPosition.left + referenceProps.width;
                thisPosition.top = thisPosition.top - referenceProps.height;
            }

            thisPosition = { top: thisPosition.top + props.offset.height, left: thisPosition.left + props.offset.width };
        }
        else {
            if ((thisWidth + thisPosition.left) > viewSize.width) {
                thisPosition.left = thisPosition.left - thisWidth - 10;
                positionClass = "jetsen-tooltip-left";
                thisPosition.top = thisPosition.top - referenceProps.height;

                thisPosition = { top: thisPosition.top - props.offset.height, left: thisPosition.left - props.offset.width };
            }
            else if ((tooltipControl.offsetHeight + thisPosition.top + 10) > viewSize.height) {
                thisPosition.top = thisPosition.top - tooltipControl.offsetHeight - referenceProps.height - 10;
                positionClass = "jetsen-tooltip-above";

                thisPosition = { top: thisPosition.top - props.offset.height, left: thisPosition.left - props.offset.width };
            }
            else {
                thisPosition = { top: thisPosition.top + props.offset.height, left: thisPosition.left + props.offset.width };
            }
        }
        tooltipControl.css({ left: thisPosition.left, top: thisPosition.top });
    }
    else if ("center".equal(props.align)) {
        tooltipControl.css({ left: thisPosition.left, top: 5 });
    }
    else if ("right".equal(props.align)) {
        tooltipControl.css({ left: (viewSize.width - thisWidth - 5), top: 5 });
    }
    else {
        tooltipControl.css({ left: thisPosition.left, top: thisPosition.top });
    }

    if (IS_IE) {
        var widthExtend = (props.connector && (positionClass == "jetsen-tooltip-left" || positionClass == "jetsen-tooltip-right")) ? 14 : 0;
        var heightExtend = props.connector && (positionClass == "jetsen-tooltip-above" || positionClass == "jetsen-tooltip-below") ? 14 : 0;
        jQuery("#" + props.instanceId + '-frmcontrol').css({ width: thisWidth + widthExtend, height: tooltipControl.offsetHeight + heightExtend });
    }

    jQuery("#" + props.instanceId + "-msgcontrol").removeClass().addClass("jetsen-tooltip" + (props.connector ? " " + positionClass : "")); // +" jetsen-tooltip-filter";


    //firefox下 setTimeout会传一参数，故需要在外层包一个function
    if (props.timeout && props.timeout > 0) {

        var timeoutFun = jetsennet.bindFunction(props.instanceId, function () { jetsennet.hidetip(this + ""); });
        jetsennet.tooltip.timeoutId = window.setTimeout(timeoutFun, props.timeout);
    }

    if (jetsennet["EFFECTS_ENABLE"]) {
        tooltipControl.stop(true, true).hide().fadeIn();
    }
};
jetsennet.hidetip = function (tipId, timeout) {

    if (timeout && timeout != 0) {
        var timeoutFun = tipId ? jetsennet.bindFunction(tipId, function () { jetsennet.hidetip(this + ""); }) : function () { jetsennet.hidetip(); };
        jetsennet.tooltip.timeoutId = window.setTimeout(timeoutFun, timeout);
        return;
    }

    var tooltipControl = jQuery(tipId ? el(tipId) : "#jetsen-tooltip-control");

    if (jetsennet["EFFECTS_ENABLE"]) {
        tooltipControl.stop(true, true).fadeOut();
    }
    else {
        tooltipControl.hide();
    }
};
jetsennet.message = function (msg, props) {
    jetsennet.tooltip("<div class=\"jetsen-message\" onmouseout=\"jetsennet.cancelEvent();\">" + msg + "</div>",
        jQuery.extend({ connector: false, align: "middle", timeout: 1000, width: ((msg && msg.length < 10) ? 150 : 250) }, props));
};

/*! Copyright (c) 2013 Brandon Aaron (http://brandonaaron.net)
* Licensed under the MIT License (LICENSE.txt).
*
* Thanks to: http://adomas.org/javascript-mouse-wheel/ for some pointers.
* Thanks to: Mathias Bank(http://www.mathias-bank.de) for a scope bug fix.
* Thanks to: Seamus Leahy for adding deltaX and deltaY
*
* Version: 3.1.3
*
* Requires: 1.2.2+
*/
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS style for Browserify
        module.exports = factory;
    } else {
        // Browser globals
        factory(jQuery);
    }
} (function ($) {

    var toFix = ['wheel', 'mousewheel', 'DOMMouseScroll', 'MozMousePixelScroll'];
    var toBind = 'onwheel' in document || document.documentMode >= 9 ? ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'];
    var lowestDelta, lowestDeltaXY;

    if ($.event.fixHooks) {
        for (var i = toFix.length; i; ) {
            $.event.fixHooks[toFix[--i]] = $.event.mouseHooks;
        }
    }

    $.event.special.mousewheel = {
        setup: function () {
            if (this.addEventListener) {
                for (var i = toBind.length; i; ) {
                    this.addEventListener(toBind[--i], handler, false);
                }
            } else {
                this.onmousewheel = handler;
            }
        },

        teardown: function () {
            if (this.removeEventListener) {
                for (var i = toBind.length; i; ) {
                    this.removeEventListener(toBind[--i], handler, false);
                }
            } else {
                this.onmousewheel = null;
            }
        }
    };

    $.fn.extend({
        mousewheel: function (fn) {
            return fn ? this.bind("mousewheel", fn) : this.trigger("mousewheel");
        },

        unmousewheel: function (fn) {
            return this.unbind("mousewheel", fn);
        }
    });


    function handler(event) {
        var orgEvent = event || window.event,
            args = [].slice.call(arguments, 1),
            delta = 0,
            deltaX = 0,
            deltaY = 0,
            absDelta = 0,
            absDeltaXY = 0,
            fn;
        event = $.event.fix(orgEvent);
        event.type = "mousewheel";

        // Old school scrollwheel delta
        if (orgEvent.wheelDelta) { delta = orgEvent.wheelDelta; }
        if (orgEvent.detail) { delta = orgEvent.detail * -1; }

        // New school wheel delta (wheel event)
        if (orgEvent.deltaY) {
            deltaY = orgEvent.deltaY * -1;
            delta = deltaY;
        }
        if (orgEvent.deltaX) {
            deltaX = orgEvent.deltaX;
            delta = deltaX * -1;
        }

        // Webkit
        if (orgEvent.wheelDeltaY !== undefined) { deltaY = orgEvent.wheelDeltaY; }
        if (orgEvent.wheelDeltaX !== undefined) { deltaX = orgEvent.wheelDeltaX * -1; }

        // Look for lowest delta to normalize the delta values
        absDelta = Math.abs(delta);
        if (!lowestDelta || absDelta < lowestDelta) { lowestDelta = absDelta; }
        absDeltaXY = Math.max(Math.abs(deltaY), Math.abs(deltaX));
        if (!lowestDeltaXY || absDeltaXY < lowestDeltaXY) { lowestDeltaXY = absDeltaXY; }

        // Get a whole value for the deltas
        fn = delta > 0 ? 'floor' : 'ceil';
        delta = Math[fn](delta / lowestDelta);
        deltaX = Math[fn](deltaX / lowestDeltaXY);
        if (lowestDeltaXY != 0) {
            deltaY = Math[fn](deltaY / lowestDeltaXY);
        }
        else {
            deltaY = delta;
        }

        // Add event and delta to the front of the arguments
        args.unshift(event, delta, deltaX, deltaY);

        return ($.event.dispatch || $.event.handle).apply(this, args);
    }
}));

/*
* mouseenter / mouseleave events on the main element
* also scrollstart / scrollstop - @James Padolsey : http://james.padolsey.com/javascript/special-scroll-events-for-jquery/
*/
(function () {

    var special = jQuery.event.special,
        uid1 = 'D' + (+new Date()),
        uid2 = 'D' + (+new Date() + 1);

    special.scrollstart = {
        setup: function () {

            var timer,
                handler = function (evt) {

                    var _self = this,
                        _args = arguments;

                    if (timer) {
                        clearTimeout(timer);
                    } else {
                        evt.type = 'scrollstart';
                        (jQuery.event.dispatch || jQuery.event.handle).apply(_self, _args);
                    }

                    timer = setTimeout(function () {
                        timer = null;
                    }, special.scrollstop.latency);
                };

            jQuery(this).bind('scroll', handler).data(uid1, handler);
        },
        teardown: function () {
            jQuery(this).unbind('scroll', jQuery(this).data(uid1));
        }
    };

    special.scrollstop = {
        latency: 300,
        setup: function () {

            var timer,
                    handler = function (evt) {

                        var _self = this,
                        _args = arguments;

                        if (timer) {
                            clearTimeout(timer);
                        }

                        timer = setTimeout(function () {
                            timer = null;
                            evt.type = 'scrollstop';
                            (jQuery.event.dispatch || jQuery.event.handle).apply(_self, _args);

                        }, special.scrollstop.latency);
                    };

            jQuery(this).bind('scroll', handler).data(uid2, handler);

        },
        teardown: function () {
            jQuery(this).unbind('scroll', jQuery(this).data(uid2));
        }
    };

})();