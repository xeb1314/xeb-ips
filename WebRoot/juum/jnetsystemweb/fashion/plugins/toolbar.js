/**
 *工具栏
 */
ToolBar = function(isFocusDrop)
{
	this.isFocusDropMenu = isFocusDrop?true:false;	/**是否聚焦显示菜单栏**/
	this.items = [];
};

/**
 * 添加单元格
 */
ToolBar.prototype.addItem = function(barItem, isRenderLeft){
	if(isRenderLeft)
	{
		barItem.directionclass = "jetsen-dropdown-menu-left";
	}
	this.items.push(barItem);
};

/**
 * 工具栏生成
 */
ToolBar.prototype.render = function(){
	
	var ul = jQuery("<ul>", {}).addClass("nav").addClass("jetsen-navbar").addClass("navbar-nav");
	
	if(this.items && this.items.length>0)
	{
		for(var i=0; i<this.items.length; i++)
		{
			this.items[i].render(this.isFocusDropMenu).appendTo(ul);
		}
	}
	return ul;
};

/**
 * 工具栏单元格
 */
BarItem = function(name, icon, tip, height)
{
	this.name = name?name:"";
	this.icon = icon;
	this.tip = tip;
	this.height = height;/**固定高度**/
	this.func;/**单元格被点击时的处理函数**/
	
	/**私有变量，直接设置不保存正确**/
	this.directionclass = "jetsen-dropdown-menu-right";
	this.header;
	this.content = [];
	this.footer;
};

/**设置菜单顶部**/
BarItem.prototype.setHeader = function(str){
	if(str)
	{
		this.header = jQuery("<li>", {}).addClass("jetsen-dropdown-menu-header").html(str);
	}
};

/**设置菜单底部**/
BarItem.prototype.setFooter = function(barMenu){
	if(barMenu)
	{
		this.footer = barMenu;
	}
};

/**
 * 添加一个菜单项
 */
BarItem.prototype.addMenu = function(barMenu){
	if(barMenu)
	{
		this.content.push(barMenu);
	}
};

/**工具栏单元格生成**/
BarItem.prototype.render = function(isFocusDropMenu){
	
	var owner = this; 
	var li = jQuery("<li>", {}).addClass("dropdown").addClass("jetsen-navbar-item");
	var link = jQuery("<a>", {}).attr("href", "javascript:void(0);")
	.attr("data-toggle", "dropdown")
	.attr("data-hover","dropdown")
	.attr("data-close-others", "true")
	.addClass("dropdown-toggle").appendTo(li);
	
	if(isFocusDropMenu)
	{
		$(function(){
			$(link).dropdownHover();
		});
	}
		
	if(this.icon)
	{
		var span = jQuery("<span>", {}).addClass("jetsen-toolbar-item-icon").appendTo(link);
		jQuery("<img>", {}).attr("src", this.icon).attr("alt", "").appendTo(span);
	}
	if(this.name)
	{
		jQuery("<span>", {}).addClass("jetsen-toolbar-item-name").html(this.name).appendTo(link);
	}
	if(this.tip)
	{
		jQuery("<span>", {}).addClass("badge").addClass("badge-info").text(this.tip).appendTo(link);
	}
	
	if(this.header || this.content.length>0 || this.footer)
	{
		var ul = jQuery("<ul>", {}).addClass("dropdown-menu").addClass("jetsen-dropdown-menu").addClass(this.directionclass).appendTo(li);
		if(this.header)
		{
			this.header.appendTo(ul);
		}
		if(this.content.length>0)
		{
			var container = jQuery("<li>", {}).appendTo(ul);
			var innerUl = jQuery("<ul>", {}).attr("class", "dropdown-menu-list").appendTo(container);
			for(var i=0; i<this.content.length; i++)
			{
				this.content[i].render().appendTo(innerUl);
			}
			if(this.height)
			{
				$(function(){
					$(innerUl).slimScroll({
				        height: owner.height
				    });
				});
			}
		}
		if(this.footer)
		{
			this.footer.render().addClass("jetsen-dropdown-menu-footer").appendTo(ul);
		}	
	}
	if(jQuery.isFunction(this.func))
	{
		li.click(function(){ owner.func(owner);});
	}
	return li;
};

/**
 * 工具栏单元格菜单项
 */
BarMenu = function(name, icon, tip, desc, func)
{
	this.name = name?name:"";
	this.icon = icon;
	this.tip = tip;
	this.desc = desc;
	
	this.func = func;/**菜单被点击触发的方法**/
};

/**
 * 菜单项生成
 */
BarMenu.prototype.render = function()
{
	var li = jQuery("<li>", {}).addClass("jetsen-dropdown-menu-item");
	var link = jQuery("<a>", {}).attr("href", "javascript:void(0);").appendTo(li);
	if(this.icon){
		var span = jQuery("<span>", {}).addClass("jetsen-dropdown-menu-item-icon").appendTo(link);
		jQuery("<img>", {}).attr("src", this.icon).attr("alt", "").appendTo(span);
	}
	var row = jQuery("<span>", {}).css("display", "block").appendTo(link);
	jQuery("<span>", {}).addClass("jetsen-dropdown-menu-item-name").html(this.name).appendTo(row);
	if(this.tip){
		jQuery("<span>", {}).addClass("jetsen-dropdown-menu-item-tip").text(this.tip).appendTo(row);
	}
	if(this.desc){
		jQuery("<span>", {}).addClass("jetsen-dropdown-menu-item-desc").html(this.desc).appendTo(link);
	}
	if(jQuery.isFunction(this.func))
	{
		var owner = this; 
		li.click(function(){ owner.func(owner);});
	}
	return li;
};
















