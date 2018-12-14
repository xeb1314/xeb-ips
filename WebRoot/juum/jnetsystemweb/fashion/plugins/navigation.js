
/**导航**/
Navigation = function(){
	this.items = [];
};

Navigation.prototype.addAccordMenuItem = function(item, active){
	if(item)
	{
		item.isRootItem = true;
		item.isActive = active;
		this.items.push(item);
	}
};

Navigation.prototype.render = function(){
	
	var navigate = jQuery("<div>", {}).attr("class", "page-sidebar navbar-collapse collapse");
	var menu = jQuery("<ul>", {}).addClass("page-sidebar-menu").appendTo(navigate);
	//收缩条
	var header = jQuery("<li>", {}).addClass("sidebar-toggler-wrapper").appendTo(menu);
	jQuery("<div>", {}).addClass("sidebar-toggler").appendTo(header);
	jQuery("<div>", {}).addClass("clearfix").appendTo(header);
	
	for(var i=0; i<this.items.length; i++)
	{
		this.items[i].render().appendTo(menu);
	}
	return navigate;
};

/**菜单项**/
MenuItem = function(name, icon, isfonticon, link, tip, tipcolor) {
	
	this.name = name;
	this.icon = icon;
	this.isfonticon = isfonticon?true:false;
	this.link = link;
	this.tip = tip;
	this.tipcolor = tipcolor;
	this.subItems = [];
	this.isRootItem = false;
	this.isActive = false;
	
};

MenuItem.prototype.addSubItem = function(subItem) {
	
	if(subItem)
	{
		subItem.isRootItem = false;
		subItem.isActive = false;
		this.subItems.push(subItem);
	}
};

MenuItem.prototype.render = function() {
	
	var li = jQuery("<li>", {}).addClass("navigate-item");
	var link = jQuery("<a>", {}).attr("href", this.link ? this.link : "javascript:void(0);").appendTo(li);
	if(this.icon)
	{
		if(this.isfonticon)
		{
			jQuery("<i>", {}).addClass("navigate-item-img").addClass("fa").addClass(this.icon).appendTo(link);
		}
		else
		{
			jQuery("<img>", {}).addClass("navigate-item-img").attr("src", this.icon).attr("alt", "").appendTo(link);
		}
	}
	
	var name = jQuery("<span>", {}).text(this.name).appendTo(link);
	
	var arrow = jQuery("<span>", {}).addClass("up-down-icon").appendTo(link) ;
	if(this.subItems.length > 0)
	{
		arrow.addClass("arrow");
	}
	
	if(this.tip)
	{
		var tip = jQuery("<span>", {}).addClass("badge").addClass("navigate-badge").text(this.tip).appendTo(link);
		if(this.tipcolor)
		{
			tip.css("background", this.tipcolor);
		}
	}
	
	if(this.isRootItem)
	{
		li.addClass("navigate-root-item");
		name.addClass("title");
		if(this.isActive)
		{
			li.addClass("active");
			arrow.addClass("open");
		}
	}
	
	if(this.subItems.length>0)
	{
		var ul = jQuery("<ul>", {}).addClass("sub-menu").appendTo(li);
		for(var i=0; i<this.subItems.length; i++)
		{
			this.subItems[i].render().appendTo(ul);
		}
	}
	return li;
};

/**
 * 导航栏工具
 */
var NavigationUtil = (function(){
	
	var IMG_PATH = "images/functionimg/";//图标路径
	var defImg = "default.png";//默认图标
	
	/**
	 * 转换成菜单
	 * @param item
	 * @returns {MenuItem}
	 */
	var _setUpMenuItem = function (item){
		var icon = IMG_PATH + (item.getparam("img")||defImg);
		var link = "";
		if(item.childs.length<1)
		{
			link = "javascript:showContent('"+item.URL+"');";
			icon = "";
		}
		var tip = item.getparam("tip");
		var tipcolor = item.getparam("tipcolor");
		
		var menu =  new MenuItem(item.NAME, icon, false, link, tip, tipcolor);
		$.each(item.childs, function(){
			menu.addSubItem(_setUpMenuItem(this));
		})
		return menu;
	}
	
	return {
		show: function(uFunctions, container){
			if(uFunctions && uFunctions.length>0)
			{
				var navigation = new Navigation();
				var isActive = true;
				for(var i=0; i<uFunctions.length; i++)
				{
					var menu = _setUpMenuItem(uFunctions[i]);
					navigation.addAccordMenuItem(menu, isActive);
					isActive = false;
				}
				navigation.render().appendTo(container);
			}
		}
	};
}());

