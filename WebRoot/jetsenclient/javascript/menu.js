/**
jetsennet.ui.Menu 菜单 jetsennet.ui.ToolBox 工具条控件
lixiaomin
2012-03-01 toolbox 添加onrender方法，用于解决自定义render
2012-05-14 toolbox 添加showMoreItem功能，用于工具条显示不下的处理
*/

jetsennet.addLoadedUri(jetsennet.getloadUri("menu"));
jetsennet.importCss("jetsenui");

//=============================================================================
// jetsennet.ui.Menu
//=============================================================================
jetsennet.ui.Menu = function () {
    this.__typeName = "jetsennet.ui.Menu";
    this.items = [];
    this.width = 150;
    this.className = "jetsen-menu";
};
/**
添加菜单项
*/
jetsennet.ui.Menu.prototype.addItem = function (item) {
    item.parent = this;
    this.items.push(item);
    return this;
};
/**
隐藏菜单
*/
jetsennet.ui.Menu.prototype.hide = function () {
    for (var i = 0; i < this.items.length; i++) {
        this.items[i].hideSubMenu();
    }
};
/**
生成菜单
*/
jetsennet.ui.Menu.prototype.render = function (controlId) {
    if (this.items.length > 0) {
        var menuControl = jQuery("<div>", {}).css({ width: this.width }).addClass(this.className).appendTo("body");
        for (var i = 0; i < this.items.length; i++) {
            this.items[i].parent = this;
            menuControl.append(jQuery(this.items[i].render()));
        }

        if (controlId) {
            if (el(controlId) != null) {
                jQuery(el(controlId)).remove();
            }

            menuControl.attr("id", controlId);
        }

        return menuControl;
    }
    return null;
};

/**
MenuItem
@param String menuName
@param String action
*/
jetsennet.ui.MenuItem = function (menuName, action) {
    this.__typeName = "jetsennet.ui.MenuItem";
    this.menuName = menuName;
    this.action = action;
    this.width = 150;
    this.target = null;
    this.icon = null;
    this.items = [];
    this.menuParam = {};
    this.className = "jetsen-menu-item";
    this.onclick = null;

    this.subMenuId = "";
    this.control = null;
};
/**
添加菜单子项
*/
jetsennet.ui.MenuItem.prototype.addItem = function (item) {
    item.parent = this;
    this.items.push(item);
    return this;
};
jetsennet.ui.MenuItem.prototype.render = function () {

    var uiOwner = this;
    var width = this.parent.width;
    var menuControl = jQuery("<div>", {}).css({ width: width }).addClass(this.className)
    .click(function () {
        if (jQuery.isFunction(uiOwner.onclick))
            uiOwner.onclick();
    })
    .mouseover(function () {
        this.className = uiOwner.className + "hover";
        uiOwner.showSubMenu();
    })
    .mouseout(function () {
        this.className = uiOwner.className;
    });

    var menuIcon = jQuery("<div>", {}).css( { 'float': "left", 'width': 30 } ).appendTo(menuControl);

    if (!jetsennet.util.isNullOrEmpty(this.icon)) {
        menuIcon.html("<img src='" + this.icon + "' border='0'/>");
    }
    var menuLabel = jQuery("<div>", {}).css({ 'float': "right", 'width': (width - 30) }).appendTo(menuControl).html(
        jetsennet.util.isNullOrEmpty(this.action) ?
        "<a>" + this.menuName + "</a>"
        : "<a " + this.getAction() + " " + this.getTarget() + " style=\"width:100%;display:block;\">" + this.menuName + "</a>");

    //如果有子菜单，更换为带子菜单指示的样式
    if (this.items.length > 0) {
        menuLabel.addClass("jetsen-menu-pitem");

        var obj = this.parent;
        var className = "";
        while (obj != null) {
            className = obj.className;
            obj = obj.parent;
        }

        var subMenuControl = jQuery("<div>", { id: jetsennet.util.Guid.NewGuid().toString() }).addClass(className)
            .css({ display: "none", width: this.width }).appendTo("body");

        for (var i = 0; i < this.items.length; i++) {
            if (jetsennet.util.isNullOrEmpty(this.items[i].menuName))
                continue;
            this.items[i].parent = this;
            subMenuControl.append(this.items[i].render());
        }
        this.subMenuId = subMenuControl[0].id;
    }
    this.control = menuControl[0];
    return menuControl;
};
jetsennet.ui.MenuItem.prototype.getAction = function () {
    if (jetsennet.util.isNullOrEmpty(this.action)) {
        return "onclick='jetsennet.cancelEvent()'"; //href='javascript:void(0)'
    }
    else if (jetsennet.util.left(this.action, 10).equal("javascript")) {
        return "onclick='" + this.action + "'";
    }
    else
        return "href='" + this.action + "'";
};
jetsennet.ui.MenuItem.prototype.getTarget = function () {
    if (jetsennet.util.isNullOrEmpty(this.target))
        return "";
    else
        return "target='" + this.target + "'";
};
/**
显示菜单
*/
jetsennet.ui.MenuItem.prototype.showSubMenu = function () {
    if (this.parent && this.parent.items) {
        for (var i = 0; i < this.parent.items.length; i++) {
            this.parent.items[i].hideSubMenu();
        }
    }
    if (jetsennet.util.isNullOrEmpty(this.subMenuId))
        return;

    var subControl = el(this.subMenuId);
    if (subControl == null)
        return;
    jetsennet.popup(subControl, { reference: this.control, position: 2, showOthers: true});
};
/**
隐藏菜单
*/
jetsennet.ui.MenuItem.prototype.hideSubMenu = function () {
    for (var i = 0; i < this.items.length; i++) {
        this.items[i].hideSubMenu();
    }

    if (jetsennet.util.isNullOrEmpty(this.subMenuId))
        return;

    var subControl = el(this.subMenuId);
    if (subControl == null)
        return;

    jetsennet.hide(subControl);
};

//=============================================================================
// jetsennet.ui.CheckMenuItem
//=============================================================================
jetsennet.ui.CheckMenuItem = function (menuName) {
    this.__typeName = "jetsennet.ui.CheckMenuItem";
    this.menuName = menuName;
    this.width = 150;
    this.control = null;
    this.menuParam = {};
    this.oncheckchanged = null;
    this.checked = false;
    this.checkValue = null;
    this.className = "jetsen-menu-item";
};

jetsennet.ui.CheckMenuItem.prototype.render = function () {
    var uiOwner = this;
    var width = this.parent.width;

    var menuControl = jQuery("<div>", {}).addClass(this.className).css({ width: width }).appendTo("body").click(function () {
        jetsennet.cancelEvent(true);
    }).mouseover(function () {
        this.className = uiOwner.className + "hover";
        uiOwner.showSubMenu();
    }).mouseout(function () {
        this.className = uiOwner.className;
    });
    var menuIcon = jQuery("<div>", {}).css({ "float": "left", width: 30 }).appendTo(menuControl);
    var menuLabel = jQuery("<div>", {}).css({ "float": "right", width: width - 30 }).appendTo(menuControl).html("<span>" + this.menuName + "</span>");

    var menuCheck = jQuery("<span class='jetsen-checkbox " + (this.checked ? "checked" : "") + "'/>").click(function () {
        $(this).toggleClass("checked");
        uiOwner.checked = $(this).hasClass("checked");
        uiOwner.checkChanged();
        jetsennet.cancelEvent(true);
    }).appendTo(menuIcon);

    this.control = menuControl[0];
    return menuControl;
};
jetsennet.ui.CheckMenuItem.prototype.checkChanged = function () {
    if (jQuery.isFunction(this.oncheckchanged))
        this.oncheckchanged();
};
/**
显示菜单
*/
jetsennet.ui.CheckMenuItem.prototype.showSubMenu = function () {
    if (this.parent && this.parent.items) {
        for (var i = 0; i < this.parent.items.length; i++) {
            this.parent.items[i].hideSubMenu();
        }
    }
};
/**
隐藏菜单
*/
jetsennet.ui.CheckMenuItem.prototype.hideSubMenu = function () { };

//=============================================================================
// jetsennet.ui.MenuSplit
//=============================================================================	 
jetsennet.ui.MenuSplit = function () {
    this.__typeName = "jetsennet.ui.MenuSplit";
    this.menuName = "MenuSplit";
};
jetsennet.ui.MenuSplit.prototype.render = function () {
    var menuControl = jQuery("<div>", {}).addClass("jetsen-menu-split").css({ width: this.parent.width }).append(jQuery("<div>", {}));
    return menuControl;
};
jetsennet.ui.MenuSplit.prototype.hideSubMenu = function () {
};

//=============================================================================
// jetsennet.ui.ToolBox
//=============================================================================
jetsennet.ui.ToolBox = function (container) 
{

    this.container = el(container);
    this.items = [];
    this.itemWidth = 55;
    this.clearContainer = true;
    this.textAlign = "right";
    this.isRender = false;
    this.showMoreItem = true;
    this.timeoutId = null;
    this.className = "jetsen-toolbox";
    this.btnsize = 0 ;						/**工具栏按钮的尺寸，分为0、1、2三种级别**/
    this.onrender = null;
    
    this.outItems = [] ;		/**用来记录所有越界的项**/
};
//添加项
jetsennet.ui.ToolBox.prototype.addItem = function (item) {
    item.parent = this;
    this.items.push(item);
    if (this.isRender) {
        var subControl = item.render();
        jQuery(this.container).append(subControl);
        this.refresh();			/**添加完成之后，可能会有超出的情况，这个时候就需要刷新**/
    }
    return this;
};
//显示项
jetsennet.ui.ToolBox.prototype.displayItems = function (array, display) 
{
    if (array == null || array.length == null)
        return;

    var pValue = (display == true || display == "inline") ? "inline" : "none";

    jQuery.each(array, function (owner) {
        var dItemId = this + "";
        jQuery.each(owner.items, function (i) {
            if (this.itemId == dItemId) {
            	this.changeDisplay(pValue);
            }
        });
    }, [this]);
};

//禁用项
jetsennet.ui.ToolBox.prototype.disableItems = function (array, disable) {
    if (array == null || array.length == null)
        return;

    jQuery.each(array, function (owner) {
        var dItemId = this + "";
        jQuery.each(owner.items, function (i) {
            if (this.itemId == dItemId) {
                this.disabled = disable;
                this.refreshStyle();
            }
        });
    }, [this]);
};
//禁用所有项
jetsennet.ui.ToolBox.prototype.disableAllItems = function (disable) {
    jQuery.each(this.items, function (i) {
        this.disabled = disable;
        this.refreshStyle();
    });
};
//是否禁用
jetsennet.ui.ToolBox.prototype.isDisabled = function (itemId) {
    for (var i = 0; i < this.items.length; i++) {
        if (this.items[i].itemId == itemId) {
            return this.items[i].disabled;
        }
    }
    return false;
};
//是否可用
jetsennet.ui.ToolBox.prototype.isEnabled = function (itemId) {
    for (var i = 0; i < this.items.length; i++) {
        if (this.items[i].itemId == itemId) {
            return !this.items[i].disabled && this.items[i].control.style.display != "none";
        }
    }
    return false;
};
//是否存在
jetsennet.ui.ToolBox.prototype.hasItem = function (itemId) {
    for (var i = 0; i < this.items.length; i++) {
        if (this.items[i].itemId == itemId) {
            return true;
        }
    }
    return false;
};
//获取项
jetsennet.ui.ToolBox.prototype.getItem = function (itemId) {
    var item = null;
    jQuery.each(this.items, function () {
        if (this.itemId == itemId) {
            item = this;
            return false;
        }
    });
    return item;
};

jetsennet.ui.ToolBox.prototype.setWidth = function (width) {
    this.container.style.width = width + "px";
    this.refresh();
};

jetsennet.ui.ToolBox.prototype.render = function (controlId) {

    var container = jQuery(this.container);

    if (container.size() == 0) {
        if (controlId) {
            if (el(controlId) != null) {
                container = jQuery(el(controlId));
            }
            else {
                container = jQuery("<div>").attr("id", controlId);
            }
        }
        else {
            container = jQuery("<div>");
        }

        this.container = container[0];
    }
    
    jQuery(this.container).addClass("btn-toolbar").addClass(this.className);
    

    if (jQuery.isFunction(this.onrender)) {
        this.onrender();
    }
    else {
        if (this.clearContainer) {
            container.html("");
        }
        if (this.items.length > 0) {
            this.container.onselectstart = function () { return false; };
            for (var i = 0; i < this.items.length; i++) {
                this.items[i].parent = this;
                var subControl = this.items[i].render();
                if (subControl) {
                    container.append(subControl);
                }
            }

            if (jetsennet.util.isNullOrEmpty(this.container.className))
                container.addClass(this.className);

            this.refresh();
        }
    }
    this.isRender = true;

    return container;
};
jetsennet.ui.ToolBox.prototype.refresh = function () {

    var cSize = jetsennet.util.getControlSize(this.container);
    
	this.displayItems(this.outItems, true);/**显示所有因越界而隐藏的**/
	this.outItems = [] ;

    if (this.showMoreItem && cSize.offsetHeight > 0 && cSize.scrollHeight - cSize.offsetHeight > 5) {
        var moreControl = this.moreControl;
        if (moreControl == null) {
            moreControl = jQuery("<div>", {}).addClass(this.className + "-moreitem");
            this.moreControl = moreControl;
            this.container.insertBefore(moreControl[0], this.container.firstChild);
        }
        moreControl.css({ left: cSize.clientWidth + cSize.left - 5 });

        var contanierPosition = jetsennet.util.getPosition(this.container, 0).top + this.container.offsetHeight / 2;
        var moreMenu = jQuery.extend(new jetsennet.ui.Menu(), { width: this.itemWidth * 2 });
        
        var owner = this;
        jQuery.each(this.items, function () {
        	if (!this.disabled && jetsennet.util.getPosition(this.control, 0).top > contanierPosition) {
        		var menuItem = jQuery.extend(new jetsennet.ui.MenuItem(this.itemName), { onclick: this.onclick, icon: this.icon, menuParam: this.menuParam });
        		owner.cloneMenuItems(this, menuItem);
        		moreMenu.addItem(menuItem);
        		owner.outItems.push(this.itemId);		/**记录下所有越界项**/
        	}
        });
        this.displayItems(this.outItems, false);
        
        this.moreControl[0].onclick = jetsennet.bindFunction(owner, function () {
            jQuery('#div-toolbox-moreitem').hidepop().remove();
            if (moreMenu.items.length > 0) {
                moreMenu.render().attr("id", 'div-toolbox-moreitem').popup({ reference: this.container, position: 3 });
            }
        });
        this.moreControl[0].onmouseover = jetsennet.bindFunction(owner, function () { this.moreControl[0].className = this.className + "-moreitem-over"; });
        this.moreControl[0].onmouseout = jetsennet.bindFunction(owner, function () { this.moreControl[0].className = this.className + "-moreitem"; });
    }
    else {
        if (this.moreControl) {
            this.moreControl[0].parentNode.removeChild(this.moreControl[0]);
            this.moreControl = null;
        }
    }
};
/**
私有,用于clone菜单
*/
jetsennet.ui.ToolBox.prototype.cloneMenuItems = function (sMenu, dMenu) {
    var owner = this;
    jQuery.each(sMenu.items, function () {
        //未实现CheckMenuItem
        var item = jQuery.extend(new jetsennet.ui.MenuItem(),
            { menuName: this.menuName, icon: this.icon, action: this.action, target: this.target, description: this.description, menuParam: this.menuParam, onclick: this.onclick });
        owner.cloneMenuItems(this, item);
        dMenu.items.push(item);
    });
};
//=============================================================================
// jetsennet.ui.MenuItem
//=============================================================================
jetsennet.ui.ToolBoxItem = function (itemId, itemName) {
    this.itemId = itemId;
    this.icon = "";			/**自定义图标**/
    this.glyph = "";		/**glyphicons图标**/
    this.overIcon = "";
    this.itemName = itemName ? itemName : "";
    this.onclick = null;
    this.width = 150;
    this.description = null;
    this.items = [];
    this.menuParam = {};
    this.disabled = false;

    this.subMenuId = "";
    this.control = null;
};
/**
添加工具菜单项
@param MenuItem item
*/
jetsennet.ui.ToolBoxItem.prototype.addItem = function (item) {
    item.parent = this;
    this.items.push(item);
    return this;
};

jetsennet.ui.ToolBoxItem.prototype.changeDisplay = function (display) {
	if(display == true || display == "inline")
	{
		jQuery(this.control).show();
	}else{
		jQuery(this.control).hide();
	}
};

jetsennet.ui.ToolBoxItem.prototype.refreshStyle = function () {
	var btns = jQuery(this.control).children() ; 
    if (this.disabled){
    	jQuery(btns).attr("disabled", "disabled") ;
    }
    else{
    	jQuery(btns).removeAttr("disabled");
    }
    
    if(this.parent.btnsize == 0){
    	jQuery(this.control).attr("class", "btn-group btn-group-xs");
    }else if(this.parent.btnsize == 1){
    	jQuery(this.control).attr("class", "btn-group btn-group-sm");
    }else if(this.parent.btnsize == 2){
    	jQuery(this.control).attr("class", "btn-group");
    }else{
    	jQuery(this.control).attr("class", "btn-group btn-group-lg");
    }
    
};
/*
生成工具栏项
返回jQuery对象
*/
jetsennet.ui.ToolBoxItem.prototype.render = function () {

    var textString = this.itemName ;
    var gapString = "&nbsp;" ;
    var imgString = "" ;
    if(this.icon){                  
    	imgString = "<img border=0 src='" + this.icon + "' style='height: 18px;margin-top: -3px;'/>" ;
    }else{
    	imgString = "<span class='glyphicon "+this.glyph+"'></span>" ;
    }
    var btnString = "<button type='button' class='btn btn-default'>" + imgString + gapString + textString + "</button>" ;
    if(this.parent.textAlign != "right"){
    	btnString = "<button type='button' class='btn btn-default'>" + textString + gapString + imgString + "</button>" ;
    }
    var btn = jQuery(btnString, {}) ;
    
    var toolControl = jQuery("<div>", {});
    if (this.description) {
        toolControl.attr("title", this.description);
    }
    
    btn.appendTo(toolControl) ;
    var owner = this;
    if (this.items.length > 0) {
    	
    	var dropDownBtn = jQuery("<button type='button' class='btn btn-default'><span class='caret'/>&nbsp;</button>"); 
    	dropDownBtn.appendTo(toolControl);
    	dropDownBtn.click(function () {
            if (owner.disabled)
                return;
            jetsennet.cancelEvent();
            owner.showSubMenu();
        });

    	/**生成下拉菜单**/
        var subMenuControl = jQuery("<div>", { id: jetsennet.util.Guid.NewGuid().toString() }).addClass("jetsen-menu").css({ display: "none" }).appendTo("body");
        for (var i = 0; i < this.items.length; i++) {
            if (jetsennet.util.isNullOrEmpty(this.items[i].menuName))
                continue;
            this.items[i].parent = this;
            subMenuControl.append(this.items[i].render());
        }
        this.subMenuId = subMenuControl[0].id;
    }

    this.control = toolControl[0];
    this.refreshStyle();
    this.assignEvent();
    return toolControl;
};
jetsennet.ui.ToolBoxItem.prototype.assignEvent = function () {

    if (!this.control)
        return;
    
    var btn = jQuery(this.control).children()[0] ; 

    var owner = this;
    jQuery(btn).click(function () {
        if (owner.disabled)
            return;
        if (jQuery.isFunction(owner.onclick))
            owner.onclick();
    }).mouseover(function () {

        if (owner.disabled)
            return;
        /**如果没有设置获得焦点需要替换的图片**/
        if (jetsennet.util.isNullOrEmpty(owner.overIcon)) {
            return;
        }
        
        /**通过自定义图片生成**/
        if(owner.icon)
        {
        	var itemIcons = jQuery("img", btn);
            if (itemIcons.size() > 0) {
                itemIcons[0].src = owner.overIcon;
            }
        }
        /**通过glyph图标生成**/
        else
        {
        	var spans = jQuery("span", btn);
        	if(spans.size()>0)
        	{
        		var tempImg = jQuery("<img border=0 src='" + owner.overIcon + "' class='glyphicon' />") ;
            	tempImg.insertBefore(jQuery(span[0]));
            	jQuery(span[0]).remove();
        	}
        }
    }).mouseout(function () {

        if (owner.disabled)
            return;

        if (jetsennet.util.isNullOrEmpty(owner.overIcon)) {
            return;
        }
        /**通过自定义图片生成**/
        if(owner.icon)
        {
        	var itemIcons = jQuery("img", btn);
            if (itemIcons.size() > 0) {
                itemIcons[0].src = owner.icon;
            }
        }
        /**通过glyph图标生成**/
        else
        {
        	var imgs = jQuery("img", btn);
        	if(imgs.size()>0)
        	{
        		var tempSpan = jQuery("<span class='glyphicon "+owner.glyph+"'></span>") ;
        		tempSpan.insertBefore(jQuery(imgs[0]));
            	jQuery(imgs[0]).remove();
        	}
        }
    });
};
/**
显示菜单
*/
jetsennet.ui.ToolBoxItem.prototype.showSubMenu = function () {
	/**隐藏所有，再打开指定**/
    if (this.parent && this.parent.items) {
        for (var i = 0; i < this.parent.items.length; i++) 
        {
            this.parent.items[i].hideSubMenu();
        }
    }
    jetsennet.popup(el(this.subMenuId), { reference: this.control, position: 1, showOthers: true });
};
/**
隐藏菜单
*/
jetsennet.ui.ToolBoxItem.prototype.hideSubMenu = function () {
    for (var i = 0; i < this.items.length; i++) {
        this.items[i].hideSubMenu();
    }
    jetsennet.hide(this.subMenuId);
};