// lixiaomin 2008/06/14
/**
Jetsen UI Accordion
由多个子项组成一个Accordion
子项由标题和内容组成
只显示一个子项，当显示一个子项时其它子项关闭
2012-03-06 更改显示上下移动按钮

jQuery("#divAccordion").accordion({actionTag:"img",showMultiItem:true,fixSize:false});

var accordion = new jetsennet.ui.Accordion(el("divContainer"),{speed:200});
accordion.addItem("标题1","内容1<br>内容2");	
accordion.addItem("标题2","内容1<br>内容2");	
accordion.showItem(0);
*/
jetsennet.addLoadedUri(jetsennet.getloadUri("accordion"));
jetsennet.importCss("jetsenui");

/**
Accordion
@param Element container
@option Integer speed
*/
jetsennet.ui.Accordion = function (/*element*/container, /*{}*/options) {
    this.__typeName = "jetsennet.ui.Accordion";
    this.container = container ? container : document.body;
    this.options = jQuery.extend({ speed: 200 }, options);
    this.items = [];
    this.edgeSize = { left: 0, right: 0, top: 0, bottom: 0 };
    this.className = "jetsen-accrodion";

    if (jetsennet.util.isNullOrEmpty(this.container.className)) {
        jetsennet.util.setClassName(this.container, this.className);
    }

    this.selectedIndex = 0;
    this.fixSize = true;
    this.showScroll = false;
    this.direction = 1;
    this.showMultiItem = false;
    this.isCreated = false;
    this.isInit = false;
    this.loSlideItem = null;
    this.lbSlideing = false;  //正在滚动

    //Event
    this.onstatechanged = null;
    this.onselectedindexchanged = null;
};

/**
显示指定的子项-公有方法 
*/
jetsennet.ui.Accordion.prototype.showItem = function (index) {

    var itemCount = this.items.length;

    this.init();

    if (!this.isCreated) {
        for (var i = 0; i < itemCount; i++) {
            this.createItem(i);
        }
        this.isCreated = true;
    }

    if (this.moving)
        return;

    if (this.fixSize) {
        this.buttonContainer.hide();
    }

    this.moving = true;
    var owner = this;
    var currentSize = this.direction == 1 ? this.edgeSize.top : this.edgeSize.left;

    for (var i = 0; i < itemCount; i++) {

        var currentItem = this.items[i];
        var itemControl = jQuery(this.items[i].control);
        var controls = itemControl.children();
        //var edgeSize = jetsennet.util.getControlEdgeSize(controls[0]);
        var itemSize = this.direction == 1 ? parseInt(jQuery(controls[0]).outerHeight(true))// + edgeSize.marginTop + edgeSize.marginBottom
        : parseInt(jQuery(controls[0]).outerWidth(true)); // + edgeSize.marginLeft + edgeSize.marginRight;

        if (i == index) {

            if (currentItem.isOpen == 1 && this.showMultiItem) {
                this.selectedIndex = -1;
                currentItem.isOpen = 0;
                controls[0].className = this.className + '-close';

                itemControl.stop(true, true).animate(
                    this.direction == 1 ? { top: currentSize, height: itemSize} : { left: currentSize, width: itemSize },
                    this.options.speed, null, function () {
                        owner.moving = false;
                        //alert(jQuery(".noneclass")[0].outerHTML);
                    });
            }
            else {

                controls[0].className = this.className + '-open';
                var cSize = this.fixSize ? owner.contentSize : parseInt(this.direction == 1 ? jQuery(controls[1]).outerHeight(true) : jQuery(controls[1]).outerWidth(true));
                var cEdgeSize = jetsennet.util.getControlEdgeSize(controls[1]);
                jQuery(controls[1]).css(this.direction == 1 ? { height: cSize - cEdgeSize.top - cEdgeSize.bottom} : { width: cSize - cEdgeSize.left - cEdgeSize.right });

                itemControl.stop(true, true)
                .animate(
                    this.direction == 1 ? { height: itemSize + cSize, top: currentSize} : { width: itemSize + cSize, left: currentSize },
                    this.options.speed, null, function () {
                        owner.moving = false;
                        //alert(jQuery(".noneclass")[0].outerHTML);
                    }
                );


                if (this.fixSize) {
                    this.loSlideItem = controls[1];
                    this.buttonContainer.show();

                    var btnLeft = this.direction == 1 ? (this.width - parseInt(this.upButton[0].offsetWidth) - 5) : currentSize + itemSize;
                    var btnTop = this.direction == 1 ? currentSize + itemSize : this.height - parseInt(this.downButton[0].offsetHeight) - 5;
                    this.upButton.css({ left: btnLeft, top: btnTop });

                    btnLeft = this.direction == 1 ? (this.width - parseInt(this.upButton[0].offsetWidth) - 5) : currentSize + owner.contentSize;
                    btnTop = this.direction == 1 ? currentSize + itemSize + owner.contentSize - parseInt(this.downButton[0].offsetHeight) - 5 : this.height - parseInt(this.downButton[0].offsetHeight) - 5;
                    this.downButton.css({ left: btnLeft,
                        top: btnTop
                    });
                }

                currentItem.isOpen = 1;
                this.selectedIndex = index;
                currentSize += cSize;

                if (jQuery.isFunction(owner.onselectedindexchanged)) {
                    owner.onselectedindexchanged(owner.selectedIndex);
                }
            }
        }
        else {
            var cSize = 0;

            if (!this.showMultiItem || this.fixSize) {
                currentItem.isOpen = 0;
                controls[0].className = this.className + '-close';
            }
            else if (currentItem.isOpen == 1) {
                cSize = parseInt(this.direction == 1 ? jQuery(controls[1]).outerHeight(true) : jQuery(controls[1]).outerWidth(true));
                currentSize += cSize;
            }

            itemControl.stop(true, true)
            .animate(
                this.direction == 1 ? { height: itemSize + cSize, top: currentSize - cSize} : { width: itemSize + cSize, left: currentSize - cSize },
                this.options.speed, null, function () { owner.moving = false; });
        }

        currentSize += itemSize;
    }

    if (jQuery.isFunction(this.onstatechanged)) {
        this.onstatechanged();
    }
};
/**
添加子项-公有方法
*/
jetsennet.ui.Accordion.prototype.addItem = function (title, content) {
    this.items[this.items.length] = { title: title, content: content };
    return this;
};
/**
刷新控件-公有方法
重新创建控件，一般用于内容的改变或者显示区域的大小改变时
*/
jetsennet.ui.Accordion.prototype.refresh = function () {
    if (this.container.style.display == "none")
        return;

    if (!this.isCreated)
        return;

    this.checkSize();

    if (this.width == 0 || this.height == 0)
        return;

    var itemCount = this.items.length;
    for (var i = 0; i < itemCount; i++) {
        if (typeof this.items[i].content == "object" && this.items[i].content.innerHTML) {
            document.body.appendChild(this.items[i].content);
        }
        else {
            this.items[i].content = this.items[i].control.childNodes[1].innerHTML;
        }
        this.container.removeChild(this.items[i].control);
        this.items[i].isOpen = 0;
    }

    if (this.fixSize) {
        this.buttonContainer.appendTo("body");
    }

    this.container.innerHTML = "";
    this.checkSize();

    if (this.fixSize) {
        this.buttonContainer.appendTo(this.container).hide();
    }

    for (var i = 0; i < itemCount; i++) {
        this.createItem(i);
    }

    this.showItem(i);
};


//私有方法
jetsennet.ui.Accordion.prototype.init = function () {

    if (this.isInit)
        return;

    if (this.fixSize) {

        jQuery(this.container).css({overflow : "hidden","position": "absolute" });
        var owner = this;

        if (this.buttonContainer == null) {
            this.buttonContainer = jQuery("<div>", {}).addClass(this.className + "-btndiv").appendTo("body");

            this.upButton = jQuery("<i class='fa fa-angle-double-up'>")
                        .mouseout(function () { owner.lbSlideing = true; })
                        .mouseover(function () { owner.lbSlideing = false; owner.slideUp(); })
                        .appendTo(this.buttonContainer);

            this.downButton = jQuery("<i class='fa fa-angle-double-down'>")
                        .mouseout(function () { owner.lbSlideing = true; })
                        .mouseover(function () { owner.lbSlideing = false; owner.slideDown(); })
                        .appendTo(this.buttonContainer);

            if (this.container.firstChild) {
                this.container.insertBefore(this.buttonContainer[0], this.container.firstChild);
            }
            else {
                this.container.appendChild(this.buttonContainer[0]);
            }
        }

        this.buttonContainer.hide();
    }
    this.checkSize();
    this.isInit = true;
};
jetsennet.ui.Accordion.prototype.checkSize = function () {
    //if (this.fixSize) {
    this.edgeSize = jetsennet.util.getControlEdgeSize(this.container);
    this.width = this.container.offsetWidth - this.edgeSize.left - this.edgeSize.right;
    this.height = this.container.offsetHeight - this.edgeSize.top - this.edgeSize.bottom;
    this.contentSize = this.direction == 1 ? this.height : this.width;
    //}
};
//私有方法
jetsennet.ui.Accordion.prototype.createItem = function (i) {

    var owner = this;
    var itemControl = jQuery("<div>").addClass(this.className + this.direction + "-item").css({ position: "absolute", "overflow": "hidden" }).appendTo("body");

    var conTitle = jQuery("<div>", {}).css({ "overflow": "hidden", position: "absolute" })
        .addClass(this.className + '-close')
        .html(this.items[i].title == null ? "　" : this.items[i].title)
        .click(function () { owner.showItem(this.itemIndex); })
        .appendTo(itemControl);
    conTitle[0].itemIndex = i;

    var edgeSize = jetsennet.util.getControlEdgeSize(conTitle[0]);
    var itemSize = 0;

    var conContent = jQuery("<div>", {}).addClass(this.className + '-content')
        .css({ overflow: "hidden", position: "absolute", left: 0, top: 0 })
        .appendTo(itemControl);

    if (this.direction == 1) {
        itemSize = parseInt(conTitle.outerHeight(true));
        conContent.css({ top: itemSize, width: this.width});
        itemControl.css({ top: i * itemSize + this.edgeSize.top, width: this.width, height: itemSize });
        conTitle.css({ width: this.width});
    }
    else {
        itemSize = parseInt(conTitle.outerWidth(true));
        itemControl.css({ left: i * itemSize + this.edgeSize.left, width: itemSize, height: this.height });
        conContent.css({ height: this.height, left: itemSize });
        conTitle.css({ height: this.height});
    }

    if (typeof this.items[i].content == "object" && this.items[i].content.innerHTML)
        conContent[0].appendChild(this.items[i].content);
    else
        conContent.html(this.items[i].content == null ? "　" : this.items[i].content);

    this.container.appendChild(itemControl[0]);
    this.items[i].control = itemControl[0];

    this.contentSize -= itemSize;

    if (this.contentSize < 25)
        this.contentSize = 25;
};
//私有方法 
jetsennet.ui.Accordion.prototype.slideDown = function () {
    var owner = this;

    if (this.loSlideItem.scrollHeight - this.loSlideItem.offsetHeight > 2) {
        this.loSlideItem.scrollTop += 2;
        if (!this.lbSlideing && this.loSlideItem.scrollTop < this.loSlideItem.scrollHeight)
            setTimeout(function () { owner.slideDown(); }, 1);
    }
    else if (this.loSlideItem.scrollWidth - this.loSlideItem.offsetWidth >2) {
        this.loSlideItem.scrollLeft += 2;
        if (!this.lbSlideing && this.loSlideItem.scrollLeft < this.loSlideItem.scrollWidth)
            setTimeout(function () { owner.slideDown(); }, 1);
    }
    
};
//私有方法 
jetsennet.ui.Accordion.prototype.slideUp = function () {
    var owner = this;

    if (this.loSlideItem.scrollHeight - this.loSlideItem.offsetHeight > 2) {
        this.loSlideItem.scrollTop -= 2;
        if (!this.lbSlideing && this.loSlideItem.scrollTop > 0)
            setTimeout(function () { owner.slideUp(); }, 1);
    }
    else if (this.loSlideItem.scrollWidth - this.loSlideItem.offsetWidth > 2) {
        this.loSlideItem.scrollLeft -= 2;
        if (!this.lbSlideing && this.loSlideItem.scrollLeft > 0)
            setTimeout(function () { owner.slideUp(); }, 1);
    }
};

/**
快捷方式
@Option Accordion的属性
@Option actionTag 事件的标签名
*/
jQuery.fn.accordion = function (options) {

    var size = this.size();

    if (size == 0) {
        return null;
    }
    if (size > 1) {
        var result = [];
        for (var s = 0; s < size; s++) {
            result.push(jQuery(this[s]).accordion(options));
        }
        return result;
    }
    else {

        this.css({ "position": "absolute" });
        var children = this.children();
        var aControl = jQuery.extend(new jetsennet.ui.Accordion(this[0]), jQuery.extend({ fixSize: false, isCreated: true }, options));

        for (var i = 0; i < children.length; i++) {
            var itemControl = jQuery(children[i]).css({ "position": "absolute", "overflow": "hidden" });

            var subChildren = itemControl.children();
            var title = jQuery(subChildren[0]).css({ "position": "absolute" })
            .addClass(aControl.className + '-close');

            var actionControl = null;
            if (valueOf(options, "actionTag", "") != "") {
                actionControl = jQuery(options.actionTag, title);
            }

            if (actionControl.size() > 0) {
                title.css({ cursor: "default" });
                actionControl.click(function () { aControl.showItem(this.itemIndex); }).css({ cursor: "pointer" })[0].itemIndex = i;
            }
            else {
                title.click(function () { aControl.showItem(this.itemIndex); })[0].itemIndex = i;
            }

            var edgeSize = jetsennet.util.getControlEdgeSize(subChildren[0]);
            var itemSize = aControl.direction == 1 ? (parseInt(subChildren[0].offsetHeight) + edgeSize.marginTop + edgeSize.marginBottom)
            : (parseInt(subChildren[0].offsetWidth) + edgeSize.marginLeft + edgeSize.marginRight);

            var content = subChildren[1];
            jQuery(content).addClass(aControl.className + '-content');

            if (aControl.direction == 1) {
                jQuery(content).css({ position: "absolute", left: 0, top: itemSize });
                itemControl.css({ left: 0, top: itemSize, width: "100%" });
            }
            else {
                jQuery(content).css({ position: "absolute", left: itemSize, top: 0 });
                itemControl.css({ left: itemSize, top: 0, height: "100%" });
            }

            aControl.items[aControl.items.length] = { title: title.html(), content: content, control: children[i] };
        }

        aControl.showItem(-1);

        return aControl;
    }
};