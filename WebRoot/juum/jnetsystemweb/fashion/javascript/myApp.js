var MyApp = function () {

	/**基础参数**/
    var _isRTL = false;	//	导航栏是否在右侧
    var isIE8 = false;		
    var isIE9 = false;
    var isIE10 = false;

    var sidebarWidth = 215;	//	导航栏展开时候的宽度
    var sidebarCollapsedWidth = 40;	//	导航栏收缩时候的宽度

    // 颜色集合
    var layoutColorCodes = {
        'blue': '#4b8df8',
        'red': '#e02222',
        'green': '#35aa47',
        'purple': '#852b99',
        'grey': '#555555',
        'light-grey': '#fafafa',
        'yellow': '#ffb848'
    };

    //	获得窗体宽高
    var _getViewPort = function () {
        var e = window, a = 'inner';
        if (!('innerWidth' in window)) {
            a = 'client';
            e = document.documentElement || document.body;
        }
        return {
            width: e[a + 'Width'],
            height: e[a + 'Height']
        };
    };

    // 初始化函数,标识IE版本
    var handleInit = function () {

        isIE8 = !! navigator.userAgent.match(/MSIE 8.0/);
        isIE9 = !! navigator.userAgent.match(/MSIE 9.0/);
        isIE10 = !! navigator.userAgent.match(/MSIE 10.0/);

        if (isIE10) {
            jQuery('html').addClass('ie10'); // detect IE10 version
        }
        
        if (isIE10 || isIE9 || isIE8) {
            jQuery('html').addClass('ie'); // detect IE10 version
        }
    };
    
    //	计算中间区域高度
    var _calculateMiddleViewportHeight = function () {
        var height = _getViewPort().height - $('.header').outerHeight();
        if ($('body').hasClass("page-footer-fixed")) {
        	height = height - $('.footer').outerHeight();
        }
        return height;
    };
    
    //	控制内容区域的大小
    var handleSidebarAndContentHeight = function () {
    	
    	var height = _calculateMiddleViewportHeight();
    	$('.page-content').css("height", height);
    	if($(".page-content").children(":visible").height() != (height-45))
    	{
    		$(".page-content").children(":visible").height(height-45);
    	}
    };
    
    //	移除掉导航栏的滚动条	
    var removeScrollerFromNavigation = function() {
    	
    	var menu = $('.page-sidebar-menu');
    	if (menu.parent('.slimScrollDiv').size() === 1) { 
            menu.slimScroll({
                destroy: true
            });
            menu.removeAttr('style');
            $('.page-sidebar').removeAttr('style');
        }
    };
    
    //	重建导航栏滚动条
    var rebuildNavigationScroller = function(options) {
    	
    	removeScrollerFromNavigation();
    	options = options ? options : {};
        $('.page-sidebar-menu').slimScroll(jQuery.extend({
            size: '7px',
            color: '#a1b2bd',
            opacity: .3,
            position: _isRTL ? 'left' : 'right',
            height: _calculateMiddleViewportHeight(),
            allowPageScroll: false,
            disableFadeOut: false
        }, options));
    };
    
    //	为导航栏生成滚动条
    var handleFixedSidebar = function () {

    	rebuildNavigationScroller();
        handleSidebarAndContentHeight();
    };
    
    // 窗体大小改变事件
    var handleResponsiveOnResize = function () {
        var resize;
        if (isIE8) {
            var currheight;
            $(window).resize(function () {
                if (currheight == document.documentElement.clientHeight) {
                    return; 
                }
                if (resize) {
                    clearTimeout(resize);
                }
                resize = setTimeout(function () {
                	handleSidebarAndContentHeight();             
                	rebuildNavigationScroller(); 
                }, 50);                 
                currheight = document.documentElement.clientHeight; 
            });
        } else {
            $(window).resize(function () {
                if (resize) {
                    clearTimeout(resize);
                }
                resize = setTimeout(function () {
                	handleSidebarAndContentHeight();             
                	rebuildNavigationScroller(); 
                }, 50); 
            });
        }
    };

    // 处理导航栏菜单的点击事件
    var handleSidebarMenu = function () {
        jQuery('.page-sidebar').off("click", 'li > a').on('click', 'li > a', function (e) {
            
        	if($('.page-sidebar-menu').hasClass("isSliding"))
        	{
        		return false;
        	}
        	
        	$(".page-sidebar-menu ul.sub-menu").each(function(){
        		var dis = $(this).css("display");
        		if(dis)
        		{
        			$(this).attr("style", "display:"+dis);
        		}
        		else
        		{
        			$(this).removeAttr(style);
        		}
        	});
        	
        	var isOpening = $(this).parent().hasClass("open") ;
        	var slideSpeed = 200;
            var scrolPoint = $(this).position().top;
            
            /**获取所有的兄弟li节点**/
            var parentLi = $(this).parent().parent();
            parentLi.children('li.open, li.active').children('a').children('.arrow').removeClass('open');
            parentLi.children('li.open, li.active').children('.sub-menu').slideUp(slideSpeed);
            parentLi.children('li.open').removeClass('open');
            
            if ($(this).next().hasClass('sub-menu') == false) {
            	$('.page-sidebar-menu').find(".active").removeClass('active');
        		$(this).parents(".navigate-item").addClass("active");
                return;
            }
            
            $('.page-sidebar-menu').addClass("isSliding");
            if (isOpening) {
                jQuery('.arrow', jQuery(this)).removeClass("open");
                $(this).parent().removeClass("open");
                $(this).next().slideUp(slideSpeed, function () {
                    if ($('body').hasClass('page-sidebar-closed') == false) {
                    	$('.page-sidebar-menu').slimScroll({
                    		'scrollTo': scrolPoint
                    	});
                    }
                    $('.page-sidebar-menu').removeClass("isSliding");
                });
            } else {
            	var root = $(this).parents(".navigate-root-item");
                jQuery('.arrow', jQuery(this)).addClass("open");
                $(this).parent().addClass("open");
                $(this).next().slideDown(slideSpeed, function () {
                    if ($('body').hasClass('page-sidebar-closed') == false) {
                    	$('.page-sidebar-menu').slimScroll({
                    		'scrollTo': scrolPoint
                    	});
                    }
                    else
                    {
                    	createSubMenuScroller(root.find(".sub-menu:first"));
                    }
                    $('.page-sidebar-menu').removeClass("isSliding");
                });
            }
            return false;
        });
    };

    // 处理固定导航栏菜单的焦点事件
    var handleFixedSidebarHoverable = function () {
        if ($('body').hasClass('page-sidebar-fixed') === false) {
            return;
        }

        $('.page-sidebar').off('mouseenter').on('mouseenter', function () {
            var body = $('body');

            if ((body.hasClass('page-sidebar-closed') === false || body.hasClass('page-sidebar-fixed') === false) || $(this).hasClass('page-sidebar-hovering')) {
                return;
            }

            body.removeClass('page-sidebar-closed').addClass('page-sidebar-hover-on');

            if (body.hasClass("page-sidebar-reversed")) {
                $(this).width(sidebarWidth);
            } else {
                $(this).addClass('page-sidebar-hovering');
                $(this).animate({
                    width: sidebarWidth
                }, 400, '', function () {
                    $(this).removeClass('page-sidebar-hovering');
                });
            }
        });

        $('.page-sidebar').off('mouseleave').on('mouseleave', function () {
            var body = $('body');

            if ((body.hasClass('page-sidebar-hover-on') === false || body.hasClass('page-sidebar-fixed') === false) || $(this).hasClass('page-sidebar-hovering')) {
                return;
            }

            if (body.hasClass("page-sidebar-reversed")) {
                $('body').addClass('page-sidebar-closed').removeClass('page-sidebar-hover-on');
                $(this).width(sidebarCollapsedWidth);
            } else {
                $(this).addClass('page-sidebar-hovering');
                $(this).animate({
                    width: sidebarCollapsedWidth
                }, 400, '', function () {
                    $('body').addClass('page-sidebar-closed').removeClass('page-sidebar-hover-on');
                    $(this).removeClass('page-sidebar-hovering');
                });
            }
        });
    };
    
    //	生成submenu滚动条
    var createSubMenuScroller = function(submenu) {
    	
    	if(submenu.size() === 0)
    	{
    		return ;
    	}
    	
    	var genScroller = function(menu){
    		
    		var height = _getViewPort().height - $(menu).parent().position().top - $(menu).parent().height() - $('.header').outerHeight() - 38;
        	
        	if($(menu).height() < height)
        	{
        		return ;
        	}
        	var inner = null;
        	if(menu.children('.slimScrollDiv').size() === 1) {
        		inner = menu.children('.slimScrollDiv').children(":first");
        		inner.slimScroll({
                    destroy: true
                });
        		inner.removeAttr('style');
        	}else
        	{
        		var lis = menu.children();
        		inner = $("<div>", {}).appendTo(menu);
        		lis.appendTo(inner);
        	}
        	inner.slimScroll({
                size: '7px',
                color: '#a1b2bd',
                opacity: .3,
                position: _isRTL ? 'left' : 'right',
                height: height
            });
    	};
    	
    	if(submenu.height() === 0)
    	{
    		setTimeout(function(){
    			genScroller(submenu);
    		}, 10);
    	}
    	else
    	{
    		genScroller(submenu);
    	}
    };

    //	卸载submenu的滚动条
    var destorySubMenuScroller = function(submenu) {
    	
    	if(submenu.size() === 0)
    	{
    		return ;
    	}
    	if(submenu.children('.slimScrollDiv').size() === 1) {
    		var inner = submenu.children('.slimScrollDiv').children(":first");
    		inner.slimScroll({
                destroy: true
            });
    		inner.children().appendTo(submenu);
    		inner.remove();
    	}
    };
    
    //	处理默认导航栏的焦点事件
    var handleDefaultSidebarHoverable = function () {
        if ($('body').hasClass('page-sidebar-fixed') === true) {
            return;
        }

        $('.page-sidebar-menu > li').off('mouseenter').on('mouseenter', function () {
        	if (($("body").hasClass('page-sidebar-closed') === false || $("body").hasClass('page-sidebar-fixed') === true)) {
                return;
            }
        	removeScrollerFromNavigation();
        	createSubMenuScroller($(this).find('.sub-menu:first'));
        });
        
        $('.page-sidebar-menu > li').off('mouseleave').on('mouseleave', function () {
        	
        	if (($("body").hasClass('page-sidebar-closed') === false || $("body").hasClass('page-sidebar-fixed') === true)) {
                return;
            }
        	destorySubMenuScroller($(this).find('.sub-menu:first'));
        });
    };
    
    // 注册导航栏的收缩和展现事件
    var handleSidebarToggler = function () {
    	
        $('.page-sidebar').on('click', '.sidebar-toggler', function (e) {
            var body = $('body');
            var sidebar = $('.page-sidebar');

            if ((body.hasClass("page-sidebar-hover-on") && body.hasClass('page-sidebar-fixed')) || sidebar.hasClass('page-sidebar-hovering')) {
                body.removeClass('page-sidebar-hover-on');
                sidebar.css('width', '').hide().show();
                handleSidebarAndContentHeight();
                rebuildNavigationScroller();
                e.stopPropagation();
                return;
            }

            if (body.hasClass("page-sidebar-closed")) {
                body.removeClass("page-sidebar-closed");
                if (body.hasClass('page-sidebar-fixed')) {
                    sidebar.css('width', '');
                }
                rebuildNavigationScroller();
            } else {
                body.addClass("page-sidebar-closed");
            }
            handleSidebarAndContentHeight();
        });
    };

    //	处理样式
    var handleTheme = function () {

        var panel = $('.theme-panel');
        $("body").addClass("page-header-fixed");
        $(".header").addClass("navbar-fixed-top");
        $('.layout-option', panel).val($('body').hasClass('page-boxed') ? "boxed" : "fluid");
        $('.sidebar-option', panel).val($('body').hasClass('page-sidebar-fixed') ? "fixed" : "default");
        $('.sidebar-pos-option', panel).val($('body').hasClass('page-sidebar-reversed') ? 'right' : 'left');
        $('.footer-option', panel).val($('body').hasClass('page-footer-fixed') ? "show" : "hide");

        var _resetLayout = function () {
            $("body").
            removeClass("page-boxed").
            removeClass("page-sidebar-fixed").
            removeClass("page-sidebar-reversed").
            addClass("page-header-fixed").
            addClass("page-footer-fixed");
            //	固定头部
            $(".header").addClass("navbar-fixed-top");
            //	全屏显示
            $('.header > .header-inner').removeClass("container");
            var pageContainer = $('.page-container').parent(".container") ;
            if(pageContainer.size() == 1)
            {
            	$('.page-container').insertAfter('body > .clearfix');
            	pageContainer.remove();
            }
            //	显示底部
            $("#mypagefooter").fadeIn(400);
        };

        var setLayout = function () {

            var layoutOption = $('.layout-option', panel).val();
            var sidebarOption = $('.sidebar-option', panel).val();
            var sidebarPosOption = $('.sidebar-pos-option', panel).val();
            var footerOption = $('.footer-option', panel).val();

            _resetLayout(); 

            if (layoutOption === "boxed") {
                $("body").addClass("page-boxed");

                $('.header > .header-inner').addClass("container");
                var pageContainer =  $('<div class="container"></div>').insertAfter('body > .clearfix');
                $('.page-container').appendTo(pageContainer);
            }

            if (sidebarOption === 'fixed') {
                $("body").addClass("page-sidebar-fixed");
            } else {
                $("body").removeClass("page-sidebar-fixed");
            }

            if (sidebarPosOption === 'right') {
            	$("body").addClass("page-sidebar-reversed");
            	_isRTL = true;
            } else {
            	$("body").removeClass("page-sidebar-reversed");
            	_isRTL = false;
            }
            var callbackFunc = function(){
            	handleSidebarAndContentHeight();       
            	rebuildNavigationScroller(); 
            	handleFixedSidebarHoverable();
            	handleDefaultSidebarHoverable();
            };
            if (footerOption === 'hide') {
            	$("body").removeClass("page-footer-fixed");
            	$("#mypagefooter").fadeOut(400, callbackFunc);
            }
            else
            {
            	callbackFunc();
            }
        };

        var setColor = function (color) {
            $('#style_color').attr("href", "assets/css/themes/" + color + ".css");
        };

        $('.toggler', panel).click(function () {
            $(this).toggleClass("open");
            $('.theme-panel > .theme-options').toggle();            
        });

        $('.theme-colors > ul > li', panel).click(function () {
            var color = $(this).attr("data-style");
            setColor(color);
            $('ul > li', panel).removeClass("current");
            $(this).addClass("current");
        });

        $('.layout-option, .header-option, .sidebar-option, .footer-option, .sidebar-pos-option', panel).change(setLayout);
    };
    
    var handleHideFooter = function() {
    	
    	var callbackFunc = function(){
        	handleSidebarAndContentHeight();       
        	rebuildNavigationScroller(); 
        	handleFixedSidebarHoverable();
        	handleDefaultSidebarHoverable();
        	$('.footer-option', $('.theme-panel')).val("hide");
        };
    	
    	jQuery('.footer').on('click', '.go-hide', function (e) {
    		$("body").removeClass("page-footer-fixed");
        	$("#mypagefooter").fadeOut(400, callbackFunc);
        });
    };

    return {

        init: function () {
        	
            handleInit(); // 初始化，校验浏览器版本
            handleResponsiveOnResize(); // 注册窗体大小改变事件    
            handleSidebarAndContentHeight(); // 初始化导航栏和内容块的大小

            rebuildNavigationScroller(); // 控制固定导航栏滚动条
            handleFixedSidebarHoverable(); // 控制固定导航栏的焦点获得与丧失事件 
            handleDefaultSidebarHoverable();
            handleSidebarMenu(); // 导航栏点击事件
            handleSidebarToggler(); // 控制导航栏的收缩和显示        
            handleTheme(); // 注册样式控制
            handleHideFooter();// 注册状态栏隐藏事件
        }
    };

}();