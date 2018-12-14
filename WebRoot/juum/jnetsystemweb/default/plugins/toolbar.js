/**下拉菜单**/
var BarMenu = (function(){
    
    var _menuHeight = 300;
    
    var _renderMenu = function(params) {
        var ul = jQuery('<ul class="dropdown-menu jetsen-dropdown-menu jetsen-dropdown-menu-'+params.direction+'">');
        if(params.header) {
            jQuery('<li class="jetsen-dropdown-menu-header">'+params.header+'</li>').appendTo(ul);
        }
        if(params.content && params.content.length>0) {
            var lst = jQuery('<ul class="dropdown-menu-list">').appendTo(jQuery('<li>').appendTo(ul));
            jQuery.each(params.content, function(){
                _renderItem(this).appendTo(lst);
            });
            _menuHeight = params.height||_menuHeight;
            $(function(){
                $(lst).slimScroll({
                    height: _menuHeight
                });
            });
        }
        if(params.footer)
        {
            _renderItem(params.footer).addClass("jetsen-dropdown-menu-footer").appendTo(ul);
        }
        return ul;
    };
    
    var _renderItem = function(item){
        var li = jQuery('<li class="jetsen-dropdown-menu-item">');
        var link = jQuery('<a>').appendTo(li).css("cursor", "pointer");
        if(item.icon){
            jQuery('<span class="jetsen-dropdown-menu-item-icon"><img src="'+item.icon+'" /></span>').appendTo(link);
        }
        var row = jQuery('<span><span class="jetsen-dropdown-menu-item-name">'+item.name+'</span></span>').appendTo(link);
        if(item.tip){
            jQuery('<span class="jetsen-dropdown-menu-item-tip">'+item.tip+'</span>').appendTo(row);
        }
        if(item.desc){
            jQuery('<span class="jetsen-dropdown-menu-item-desc">'+item.desc+'</span>').appendTo(link);
        }
        if(jQuery.isFunction(item.func))
        {
            li.click(function(){ item.func(item);});
        }
        return li;
    };
    
    return {
        render: function(params){
            if(WindowUtil.isShow($("#"+params.id))) {
                jetsennet.cancelBubble();
                return ;
            }
            $("#"+params.id).remove();
            var ul = _renderMenu(params);
            if(params.relate) {
                var relate = $(params.relate)[0];
                var pos = jetsennet.util.getPosition(relate);
                pos.left = pos.left - (231 - 40);
                pos.top = pos.top + $(relate).height()/2 + 5;
                pos.position = "absolute";
                jQuery(ul).attr("id", params.id).css(pos).appendTo("body");
            }
            else
            {
                jQuery(ul).attr("id", params.id).css({position:"absolute"}).appendTo("body");
            }
            WindowUtil.show(ul, {height: (_menuHeight+75)+"px"});
        }
    };
}());















