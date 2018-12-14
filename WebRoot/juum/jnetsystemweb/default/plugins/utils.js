/**
 * 浏览器被点击事件，跨iframe，跨域
 */
var BrowserClick = (function(){
    var _interval = null;
    var _func = null;
    var _el = null;
    var _unbind = false;
    
    $(document).bind("click", function(){
        if(!_unbind) {
            if(_el) {
                var x1 = _el[0].offsetLeft;
                var x2 = x1 + _el[0].clientWidth;
                var y1 = _el[0].offsetTop;
                var y2 = y1 + _el[0].clientHeight;
                var x = window.event.clientX;
                var y = window.event.clientY;
                if(!(x>x1 && x<x2 && y>y1 && y<y2)) {
                    _call();
                }
            } else {
                _call();
            }
        }
    });
    
    var _check = function() {
        var activeElement = document.activeElement;
        if(activeElement){
            $("iframe").each(function() {
                if(activeElement === this) {
                    _call();
                    return false;
                }
            });
        }
    };
    
    var _call = function() {
        if(_func && jQuery.isFunction(_func))
            _func.apply();
        BrowserClick.clear();
    };
    
    return {
        doCheck: function(func, el) {
            if(_el && _el!=el)
                _call();
//            jQuery(document.activeElement).blur();
            _unbind = false;
            _func = func;
            _el = el;
            if(_interval == null) {
                _interval = setInterval(function() { 
                    _check();
                }, 200);
            }
        },
        clear: function() {
            if(_interval) {
                clearInterval(_interval);
                _interval = null;
            }
            _unbind = true;
            _el = null;
            _func = null;
            jQuery(document.activeElement).blur();
        }
    };
}());

/**
 * 窗口展现(动画效果)，如果窗口失去焦点，将隐藏窗口，跨iframe跨域
 */
var WindowUtil = (function() {
    return {
        show: function(el, params) {
            if(el.is(":hidden")) {
                $(el).show();
                if(params) {
                    $(el).animate(params, "slow", '', function(){
                        BrowserClick.doCheck(function(){
                            WindowUtil.hide(el);
                        }, el);
                    });
                }
            }
        },
        
        hide: function(el){
            $(el).animate({height:"0px"}, "slow", '', function(){
                $(el).hide();
            });
        },
        
        isShow: function(el) {
            if(el && $(el).length>0 && !$(el).is(":hidden")) {
                return true;
            } else {
                return false;
            }
        }
    };
}());

