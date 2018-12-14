//=============================================================================
// liming 2014-06-16 
//=============================================================================
jetsennet.addLoadedUri(jetsennet.getloadUri("tabpane"));

jetsennet.ui.TabPane = function (head, content, isPills, isFocus, isNotFade) {
	/**
	 * 必须参数
	 */
    this.head = $(head);				//	一个ul列表
    this.content = $(content);
    /**
     * 可选参数
     */
    var index = 0;
    if (isPills) {
        index = isPills > 1 ? isPills : 1;
    }
    this.classNames = [["nav", "nav-tabs"], ["nav", "nav-pills"], ["nav", "nav-lines"]][index];
    this.isFocus = isFocus ? true : false ; 									//	是否是焦点型页签	
    this.isNotFade = isNotFade ? true : false ;									//	不蒙板显示效果
    this.selectedIndex = -1;
    this.confirmMsg = "是否切换页签？";//confirm确认语句
    /**
     * 私有参数
     */
    this.timer;
    /**
     * 方法
     */
    this.checkstopchanged = null;//插件不为该事件做同步,该方法用于检查是否停止页签改变
    this.ontabpageselected = null;
    this.ontabpagechanged = null;
    this.init();
};

/**
 * 初始化
 */
jetsennet.ui.TabPane.prototype.init = function () {
	
    this.tabHeads = this.head.children("li");
    this.tabPages = this.content.children();
    this.pageCount = this.tabHeads.length;
    //	设置样式
    for(var i=0; i<this.classNames.length; i++){
    	this.head.addClass(this.classNames[i]);
    }
    this.content.addClass("tab-content");
    
    var owner = this ;
    for (var i = 0; i < this.pageCount; i++) {
    	
    	$(this.tabPages[i]).addClass("tab-pane");
        if(!this.isNotFade){
        	$(this.tabPages[i]).addClass("fade") ;
        }
    	var pageId = $(this.tabPages[i]).attr("id");
    	pageId = pageId ? pageId : ("tab"+i) ;
    	
    	$(this.tabHeads[i]).attr("index", i);
    	$(this.tabHeads[i]).html("<a href='#"+pageId+"' data-toggle='tab' title='" + $(this.tabHeads[i]).text() + "'>" + $(this.tabHeads[i]).html() + "</a>");
        
        if (this.isFocus)
        {
        	$(this.tabHeads[i]).mouseover(function (e) {
        	    jetsennet.hidePopups();
        		owner.doTabChange(this);
                e.stopPropagation();
                return false;
        	});
        }
        else
        {
        	$(this.tabHeads[i]).click(function (e) {
                jetsennet.hidePopups();
                owner.doTabChange(this);
                e.stopPropagation();
                return false;
        	});
        }
    }
};

/**
 * 校验是否可以切换tab以前
 * @param e
 */
jetsennet.ui.TabPane.prototype.doTabChange = function(element) {
	
	if($(element).hasClass("disabled"))
	{
		return ;
	}
	var isDirectChange = true;
	if(jQuery.isFunction(this.checkstopchanged))
	{
		isDirectChange = this.checkstopchanged(this.selectedIndex, $(element).attr("index"));
	}
	if(!isDirectChange)
	{
		var owner = this;
		jetsennet.confirm(this.confirmMsg, function(){
			owner.select($(element).attr("index"));
			this.close();
		});
	}
	else
	{
		this.select($(element).attr("index")); 
	}
}

/**
 * 添加一个页签
 * @param title
 * @param content
 * @param isdisabled
 */
jetsennet.ui.TabPane.prototype.addTabPage = function (title, content, isdisabled) {
	
	var tab = jQuery("<li>" + title + "</li>", {}).appendTo(this.head) ;
	if(isdisabled)
	{
		tab.addClass("disabled");
	}
	content.appendTo(this.content) ;
       
    this.init();
    this.select(this.selectedIndex);
    
};

jetsennet.ui.TabPane.prototype.removeTabPage = function (index) {
	
    if (this.pageCount <= 1)
        return;
    if (index < 0 || index > this.pageCount - 1)
        return;
    
    $(this.tabHeads[index]).remove();
    $(this.tabPages[index]).remove();
    this.init();
    this.select(this.selectedIndex);
};

jetsennet.ui.TabPane.prototype.removeTabPageByName = function (pageName) {
	
	this.head.children("[pagename = "+pageName+"]").remove();
	this.content.children("[pagename = "+pageName+"]").remove();
	
    this.init();
    this.select(0);
};

jetsennet.ui.TabPane.prototype.select = function (index) {
    if (index < 0 || index > this.pageCount - 1) 
    {
        if (this.selectedIndex >= 0)
            index = this.selectedIndex;
        else
            return;
    }
    
    this.head.children().removeClass("active");
    this.content.children().removeClass("active");
    if(!this.isNotFade)
    {
    	this.content.children().removeClass("in");
    }
    
    $(this.tabHeads[index]).removeClass("disabled");
    $(this.tabHeads[index]).addClass("active");
    $(this.tabPages[index]).addClass("active");
    if(!this.isNotFade)
    {
    	$(this.tabPages[index]).addClass("in");
    }
    
    this.onSelect(index, $(this.tabHeads[index]).attr("pagename"));
};

jetsennet.ui.TabPane.prototype.onSelect = function (index, pagename) 
{
	if (this.ontabpageselected)
    { 
		this.ontabpageselected(index, pagename);
    }
	if (this.selectedIndex != index) 
    {
		this.selectedIndex = index;
        if (this.ontabpagechanged)
        { 
        	this.ontabpagechanged(index, pagename);
        }
    }
};



	