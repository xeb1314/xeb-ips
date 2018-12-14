/**
 * @author 李明
 * 这是为了实现浏览器工具栏风格的导航栏而定制的一个jquery插件，
 * 风格基于bootstrap，效果可参考IE浏览器的工具栏。
 * @param $
 * @param a
 */
(function($, a) {
    var op = null;
    var active = false;
    $.fn.dropdownCtrl = function(evt) {
        return this.each(function() {
            var l = $(this).parent();
            l.click(function(e){
                e.stopPropagation();
                if(l == op) {
                    op.removeClass("open");
                    active = false;
                    op = null;
                    BrowserClick.clear();
                } else {
                    l.addClass("open");
                    active = true;
                    op = l;
                    BrowserClick.doCheck(function(){
                        if(op)
                            op.removeClass("open");
                        active = false;
                        op = null;
                    }, l);
                }
            });
            l.mouseenter(function(e){
                e.stopPropagation();
                if(!active || op == l) {
                    return ;
                }
                if(op)
                    op.removeClass("open");
                l.addClass("open");
                op = l;
            });
            l.find(".dropdown-menu").click(function(e){
                e.stopPropagation();
                if(op)
                    op.removeClass("open");
                active = false;
                op = null;
            });
        });
    };
})(jQuery, this);


