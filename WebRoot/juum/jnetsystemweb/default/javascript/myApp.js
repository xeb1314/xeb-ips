jetsennet.require(["layoutit"]);
var MyApp = (function () {

    /**基础参数**/
//    var TOP_LEFT_WIDTH = TempDefault.layout.topLeft;
//    var TOP_SPACER_WIDTH = "1";
//    var TOP_RIGHT_WIDTH = TempDefault.layout.topRight;
//    var BOTTOM_LEFT_WIDTH = "71";
    
    var Min_Width = 1000;
    var Min_Height = 100;
    
    /**
     * 私有变量，标识当前处于激活状态的Iframe编号
     */
    var gActiveIndex = 0;
    var iframes = {};
    var toolbox_expand_width = 0;
    
    /**
     * 收藏栏参数
     */
    var myStores = new HashMap();   /**id, jquery-node**/
    var newStoreItem = null;
    
    var updateStores = new HashMap(); /**id, jquery-node**/
    var isModifyStores = false;
    
    var IMG_PATH = "images/functionimg/";
    var persistStoreFunc;//持久化收藏栏方法
    
    var defImg = "default.png";
    
    //  获得窗体宽高
    var _getViewPort = function () {
        var e = window, a = 'inner';
        if (!('innerWidth' in window)) {
            a = 'client';
            e = document.documentElement || document.body;
        }
        
        return {
            width: Math.max(e[a + 'Width'], Min_Width),
            height: Math.max(e[a + 'Height'], Min_Height)
        };
    };
    
    //  获取占用宽度，此宽度包含了border、margin
    var _getOuterWidth = function (ele) {
        var size = jetsennet.util.getControlSize($(ele)[0]);
        return size.marginWidth + size.offsetWidth;
    };
    
    //  设置占用宽度，此宽度包含了border、margin
    var _setOuterWidth = function (ele, tWidth) {
        var size = jetsennet.util.getControlSize($(ele)[0]);
        $(ele).css({ width: tWidth - size.marginWidth });
    };
    
    //  获取占用高度,此高度包含了border、margin
    var _getOuterHeight = function (ele) {
        var size = jetsennet.util.getControlSize($(ele)[0]);
        return size.marginHeight + size.offsetHeight;
    };
    
    //  设置占用高度，此高度包含了border、margin
    var _setOuterHeight = function (ele, tHeight) {
        var size = jetsennet.util.getControlSize($(ele)[0]);
        $(ele).css({ height: tHeight - size.marginHeight });
    };
    
    //  布局顶部
    var _layoutTop = function () {
//        var size = _getViewPort();
//        _setOuterWidth($("#divTopLeft"), TOP_LEFT_WIDTH);
//        _setOuterWidth($("#divTopSpacer"), TOP_SPACER_WIDTH);
//        _setOuterWidth($("#divTopRight"), TOP_RIGHT_WIDTH);
//        var midWidth = size.width - _getOuterWidth($("#divTopLeft")) - _getOuterWidth($("#divTopSpacer")) - _getOuterWidth($("#divTopRight"));
//        _setOuterWidth($("#divTopMiddle"), midWidth);
        
        var btngrps =  $("#divTopMiddle").children(".btn-group");
        if(btngrps.length>0) {
            var btnEdgeWidth = 0;
            $("#divTopMiddle").children(".btn-group").each(function(){
                var edgesize = jetsennet.util.getControlEdgeSize(this);
                btnEdgeWidth += edgesize.marginWidth + edgesize.borderWidth;
                edgesize = jetsennet.util.getControlEdgeSize($(this).children("button")[0]);
                btnEdgeWidth += edgesize.marginWidth + edgesize.borderWidth;
            });
            var maxWidth = ($("#divTopMiddle").width() - btnEdgeWidth)/btngrps.length;
            $(btngrps).children("button").css("max-width", maxWidth);
        }
    };
    
    //  布局底部
    var _layoutBottom = function () {
//        var size = _getViewPort();
//        _setOuterHeight($("#divBottom"), size.height - _getOuterHeight($("#divTop")));
//        _setOuterHeight($("#divBottomLeft"), $("#divBottom").height());
//        _setOuterHeight($("#divBottomRight"), $("#divBottom").height());
//        var storeHeight = $("#divBottomLeft").height() - _getOuterHeight($("#storeConfig")) - _getOuterHeight($("#storeUp")) - _getOuterHeight($("#storeDown"));
//        _setOuterHeight($("#store"), storeHeight);
//        $("#ulStore").css({"min-height":$("#store").height()});
//        
//        _setOuterWidth($("#divBottomLeft"), BOTTOM_LEFT_WIDTH);
//        _setOuterWidth($("#divBottomRight"), size.width - _getOuterWidth($("#divBottomLeft")));
//        _setOuterWidth($("#divToolbox"), size.width - _getOuterWidth($("#divBottomLeft")));
//        _setOuterHeight($("#divIframeContainer"), $("#divBottomRight").height() - _getOuterHeight($("#divToolbox")));
        
        $(".iframeWindow").each(function(){
            _setOuterHeight($(this), $("#divIframeContainer").height());
        });
    };
    
    //  布局工具栏
    var _layoutToolBox = function (refresh) {

        var tabWidth = 0;
        $("#ul-tabs").children("li").each(function(){
            tabWidth += _getOuterWidth($(this));
            var edge = jetsennet.util.getControlEdgeSize(this);
            tabWidth += edge.borderWidth;
        });
        var gap = tabWidth + _getOuterWidth($("#div-right")) + _getOuterWidth($("#ul-tools")) - $("#divToolbox").width();
        if(gap > 0) {
            if(refresh) {
                _setOuterWidth($("#ul-tabs"), $("#divToolbox").width() - _getOuterWidth($("#ul-tools")) - _getOuterWidth($("#div-right")) - 10);
            }
        } else {
            if(tabWidth + _getOuterWidth($("#div-right"))/2 < $("#divToolbox").width()/2) {
                _setOuterWidth($("#ul-tabs"), ($("#divToolbox").width()-_getOuterWidth($("#div-right")))/2);
            } else {
                _setOuterWidth($("#ul-tabs"), tabWidth);
            }
        }   
        
        if(gActiveIndex && iframes[gActiveIndex])
        {
            var pPosition = jetsennet.util.getPosition($("#ul-tabs")[0], 0);
            var cPosition = jetsennet.util.getPosition($(iframes[gActiveIndex].TABNODE)[0], 0);
            if (cPosition.top > pPosition.top) {
                $("#ul-tabs")[0].insertBefore($(iframes[gActiveIndex].TABNODE)[0], $("#ul-tabs li")[1]);
            }
        }
    };
    
    //  激活Iframe
    var _activeIframe = function (index) {
        
        if(gActiveIndex === index)
        {
            return true;
        }
        
        $(".active-iframe").removeClass("active-iframe");
        //  隐藏当前iframe
        if(gActiveIndex && iframes[gActiveIndex])
        {
            $(iframes[gActiveIndex].IFRAME).hide();
        }
        
        //  打开新iframe
        if(iframes[index])
        {
            $(iframes[index].TABNODE).addClass("active-iframe");
            $(iframes[index].IFRAME).show();
            gActiveIndex = index;
            _layoutToolBox();
            return true;
        }
        return false;
    };
    
    //  关闭Iframe
    var _closeIframe = function (index) {
        if(iframes[index])
        {
            $(iframes[index].TABNODE).remove();
            $(iframes[index].IFRAME).remove();
        }
        var flag = 0, lstProp = 0, nxtProp = 0;
        if(gActiveIndex === index)
        {
            for(var prop in iframes)
            {
                if(iframes.hasOwnProperty(prop))
                {
                    nxtProp = prop;
                    if(flag)
                    {
                        break;
                    }
                    flag = prop === index;
                    if(!flag)
                    {
                        lstProp = prop;
                    }
                }
            }
        }
        delete iframes[index];
        if(gActiveIndex === index)
        {
            if(lstProp)
            {
                _activeIframe(lstProp);
            }
            else if(nxtProp)
            {
                _activeIframe(nxtProp);
            }
        } else {
            _layoutToolBox();
        }
    };
    
    /**
     * 创建收藏栏节点
     * @param item
     * @returns
     */
    var _createStoreItem = function(item) {
        var node = jQuery("<li>", {}).attr("title", item.NAME).hover(function(){
            var img = (item.getparam("img")||defImg).replace(".", "-hover.");
            $(this).find("img").attr("src", IMG_PATH + img);
        }, function(){
            $(this).find("img").attr("src", IMG_PATH + (item.getparam("img")||defImg));
        }).click(function(){
            if(!$(this).data("isDragging")) {
                MyApp.showIframe(item);
            }
        });
        var ul = jQuery("<ul>", {}).addClass("ul-store-item").appendTo(node);
        var li = jQuery("<li>", {}).css({"height":"40px", "padding-top":"5px"}).appendTo(ul);
        jQuery("<img>", {}).appendTo(li).attr("src", IMG_PATH + (item.getparam("img")||defImg));
        jQuery("<li>"+(item.DIS_NAME||item.NAME)+"</li>", {}).css("height", "20px").appendTo(ul);
        return node;
    };
    
    /**
     * 创建我的收藏配置项
     */
    var _createMyStoreConfigItem = function(item) {
        
        var node = jQuery("<li>", {}).dblclick(function(){
//            _removeMyStoreItem(item, this);
        }).appendTo("#ulMyFunctions");
        
        var icon = jQuery("<span>", {}).addClass("col-md-1 icon").appendTo(node);//图标
        jQuery("<img>", {}).attr("src", IMG_PATH+(item.getparam("img")||defImg)).appendTo(icon);
        
        jQuery("<span>"+item.NAME+"</span>", {}).addClass("col-md-5").appendTo(node);//名称
        
        var disname = jQuery("<span>", {}).addClass("col-md-5").dblclick(function(){
            return false;
        }).appendTo(node);//显示名称
        var content = jQuery("<c>"+(item.DIS_NAME||item.NAME)+"</c>", {}).click(function(){
            var cnt = this;
            $(cnt).hide();
            $(txtInput).fadeIn(500, function(){
                $(txtInput).val($(cnt).text());
                $(txtInput).focus();
            });
        }).appendTo(disname);
        var txtInput = jQuery("<input>", {}).attr("type", "text").attr("value", item.DIS_NAME||item.NAME).css("display", "none").mouseout(function(){
            $(this).fadeOut(500, function(){
                if($(this).val() != $(content).text())
                {
                    isModifyStores = true;
                }
                $(content).text($(this).val()||(item.DIS_NAME||item.NAME));
                $(content).show();
            });
        }).keyup(function(){
            this.value = this.value.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/,'');
        }).appendTo(disname);
        
        var btns = jQuery("<span>", {}).addClass("col-md-1 btns").appendTo(node);//按钮组
        jQuery("<i>", {}).addClass("fa fa-times").click(function(){
            if(!node.data("isDragging")) {
                _removeMyStoreItem(item, node);
            }
        }).dblclick(function(){return false;}).appendTo(btns);
        
        updateStores.put(item.ID, node);
        node.data("item", item);
        return node;
    };
    
    /**
     * 创建菜单项
     */
    var _createMenuItem = function(userFunction, myOptions, dragOptions) {
        
        var li = jQuery("<li>", {}).append(jQuery("<a>"+userFunction.NAME+"</a>"));
        if(userFunction.childs && userFunction.childs.length>0)
        {
            if(myOptions.hide) {
                $(li).addClass("hideMe");
            }
            var ul = jQuery("<ul>", {}).appendTo(li);
            $.each(userFunction.childs, function(){
                _createMenuItem(this, $.extend(myOptions, {hide: false}), dragOptions).appendTo(ul);
            });
        }
        else
        {
            $(li).addClass("leafed");
            $(li).attr("id", (myOptions.keyPrefix||"UnknowKeyPreFix") + "-" + userFunction.ID);
            $(li).data("item", userFunction);
            $(li).draggable($.extend({
                distance: 10,
                revert: "invalid",
                cursor: "move", 
                cursorAt: { top: 20, left: 20 },
                iframeFix: true,
                appendTo: 'body',
                zIndex: 9999,
                opacity: 0.8,
                containment: "parent"
            }, dragOptions));
            
            $(li).bind("click", function(){
                if(jQuery.isFunction(myOptions.click)){
                    myOptions.click(userFunction);
                }
            }).bind("dblclick", function(){
                if(jQuery.isFunction(myOptions.dblClick)){
                    myOptions.dblClick(userFunction);
                }
            }).bind("mouseover", function(){
                if(jQuery.isFunction(myOptions.hoverIn)){
                    myOptions.hoverIn(userFunction);
                }
            }).bind("mouseleave", function(){
                if(jQuery.isFunction(myOptions.hoverOut)){
                    myOptions.hoverOut(userFunction);
                }
            });
        }
        return li;
    };
    
    /**
     * 获取当前的收藏栏选项，返回一个有序的数组
     */
    var _getCurrentStores = function() {
        var arr = new Array();
        $("#ulStore>li").each(function(){
            arr.push($(this).data("item"));
        });
        return arr;
    };
    
    /**
     * 移除收藏项
     */
    var _removeMyStoreItem = function(item, node) {
        isModifyStores = true;
        $("#store-item-"+item.ID).removeClass("exists").draggable( "enable" );;
        updateStores.remove(item.ID);
        node.remove();
    };
    
    return {
        
        /**
         * 初始化布局
         */
        initLayout: function () {
            _layoutTop();
            _layoutBottom();
            _layoutToolBox(true);
        },
        
        /**
         * 初始化信息栏
         */
        initMessageBox: function() {
            
            if(TempDefault.messagebox && TempDefault.messagebox.length>0)
            {
                $.each(TempDefault.messagebox, function(){
                    
                    var boxItem = this;
                    var name = jQuery.isFunction(this.title) ? this.title() : this.title;
                    var li = jQuery("<li>", {}).attr("title", (name||"")).appendTo("#msgBox");
                    if(jQuery.isFunction(boxItem.func)) {
                        $(li).click(function(){
                            boxItem.func(this);
                        });
                        if(boxItem.hover) {
                            $(li).bind("mouseenter", function(){
                                boxItem.func(this);
                            });
                        } 
                    }
                    
                    if(this.css)
                    {
                        li.css(this.css);
                    }
                    if(this.img)
                    {
                        jQuery("<img>", {}).attr("src", this.img).load(function(){
                            $(this).css({"margin-top": -this.height/2, "margin-left": -this.width/2});
                        }).appendTo(li);
                    }
                    else if(this.font)
                    {
                        jQuery("<i>", {}).addClass(this.font).appendTo(li);
                    }
                    else
                    {
                        var cont = this.content||name;
                        jQuery("<span>"+(cont||"未知")+"</span>", {}).appendTo(li);
                    }
                    if(this.badge)
                    {
                        if(jQuery.isFunction(this.badge))
                        {
                            jQuery("<span>"+this.badge(li)+"</span>", {}).addClass("badge").appendTo(li);
                        }
                        else
                        {
                            jQuery("<span>"+this.badge+"</span>", {}).addClass("badge").appendTo(li);
                        }
                    }
                    this.DOMNODE = li;
                });
            }
        },
        
        /**
         * 初始化工具栏
         */
        initToolBox: function () {
            
            if(TempDefault.right) {
                jQuery("#div-right").text(TempDefault.right);
            }
            if(TempDefault.toolbox && TempDefault.toolbox.length>0)
            {
                //收缩按钮
                jQuery("<li>", {}).addClass("tbox-btn").appendTo($("#ul-tools")).bind("click", function(){
                    MyApp.hideToolbox();
                }).append(jQuery("<i>", {}).addClass("fa fa-arrow-right"));
                //工具列表
                $.each(TempDefault.toolbox, function(){
                    
                    var boxItem = this;
                    var li = jQuery("<li>", {}).hover(function(){
                        $(this).find("i").hide();
                        $(this).find("img").hide();
                        $(this).find("span").show();
                    }, function(){
                        $(this).find("span").hide();
                        $(this).find("i").show();
                        $(this).find("img").show();
                    }).click(function(){
                        if(jQuery.isFunction(boxItem.func))
                        {
                            boxItem.func(this);
                        }
                    }).appendTo($("#ul-tools"));
                    if(this.css)
                    {
                        li.css(this.css);
                    }
                    var name = jQuery.isFunction(this.title) ? this.title() : this.title;
                    if(this.font)
                    {
                        jQuery("<i>", {}).addClass(this.font).appendTo(li);
                        jQuery("<span>"+(name||"未知")+"</span>", {}).appendTo(li).hide();
                    }
                    else if(this.img)
                    {
                        jQuery("<img>", {}).attr("src", this.img).appendTo(li);
                        jQuery("<span>"+(name||"未知")+"</span>", {}).appendTo(li).hide();
                    }
                    else
                    {
                        jQuery("<span>"+(name||"未知")+"</span>", {}).appendTo(li);
                    }
                });
                
                toolbox_expand_width = $("#ul-tools").width();
            }
        },
        
        /**
         * 初始化收藏夹
         */
        initStoreBox: function(func) {
            
            persistStoreFunc = func;
            
            $(".ul-bottom-left").bind("mouseover", function(){
                if($("#chevronUp").is(":hidden") || $("#chevronDown").is(":hidden"))
                {
                    var isOver = $("#ulStore").height() - $("#store").height();
                    if(isOver > 0)
                    {
                        $("#chevronUp").fadeIn(400);
                        $("#chevronDown").fadeIn(400);
                    }
                }
            }).bind("mouseleave", function(){
                $("#chevronUp").fadeOut(400);
                $("#chevronDown").fadeOut(400);
            });
            
            $("#chevronUp").mousedown(function(){
                if($("#store").height() - $("#ulStore").height() >= 0){
                    return ;
                }
                $("#ulStore").animate({
                    top: 0
                }, "slow", '', function(){
                    $("#ulStore").stop();
                });
            });
            
            $("#chevronDown").mousedown(function(){
                var overHeight = $("#store").height() - $("#ulStore").height();
                if(overHeight >= 0){
                    return ;
                }
                $("#ulStore").animate({
                    top: overHeight
                }, "slow", '', function(){
                    $("#ulStore").stop();
                });
            });
            
            $("#chevronUp, #chevronDown").mouseup(function(){
                $("#ulStore").stop();
            });
            
            $("#ulStore").sortable({
//                distance: 10,
//                delay: 500,
                containment: "parent",
                revert: true,
                tolerance: "pointer",
                over: function(e, u) {
                    $(this).addClass("ul-store-focus");
                },
                out: function(e, u) {
                    $(this).removeClass("ul-store-focus");
                },
                beforeStop: function(e, u) {
                    newStoreItem = u.helper.data("item");
                },
                update: function(e, u) {
                    if(newStoreItem)
                    {
                        var node ;
                        if(myStores.containsKey(newStoreItem.ID))
                        {
                            node = myStores.get(newStoreItem.ID);
                        }
                        else
                        {
                            node = MyApp.genStoreItem(newStoreItem);
                        }
                        u.item.replaceWith(node);
                    }
                    persistStoreFunc(_getCurrentStores());
                },
                activate: function(e, u) {
                    $(u.item).data("isDragging", true);
                },
                deactivate: function(e, u) {
                    $(u.item).data("isDragging", false);
                }
            });
            
        },
        
        /**
         * 添加收藏项
         */
        genStoreItem: function(item) {
            var node = _createStoreItem(item).appendTo($("#ulStore"));
            myStores.put(item.ID, node);
            node.data("item", item);
            return node;
        },
        
        /**
         * 初始化收藏栏配置
         */
        initStoreConfig: function(uFunctions){
            
            var helperFunc = function(e){
                var uFunction = $(e.currentTarget).data("item");
                var p = jQuery("<p>"+uFunction.NAME+"</p>", {}).css({"background": "#7D9DE8", 
                      "height": "30px",
                      "width": "200px",
                      "color": "#FFFFFF",
                      "line-height": "30px",
                      "z-index": "9999",
                      "text-align": "center"});
                p.data("item", uFunction);
                return p;
            };
            var startFunc = function(e, u){
                $("#ulMyFunctions").addClass("focus");
            };
            var stopFunc = function(e, u){
                $("#ulMyFunctions").removeClass("focus");
            };
            var dblclickFunc = function(uFunction){
                if(!updateStores.containsKey(uFunction.ID))
                {
                    _createMyStoreConfigItem(uFunction);
                    $("#store-item-"+uFunction.ID).addClass("exists").draggable( "disable" );
                }
            }; 
            var overFunc = function(uFunction) {
                if(updateStores.containsKey(uFunction.ID))
                {
                    updateStores.get(uFunction.ID).addClass("active");
                }
            };
            var outFunc = function(uFunction) {
                if(updateStores.containsKey(uFunction.ID))
                {
                    updateStores.get(uFunction.ID).removeClass("active");
                }
            };
            
            $.each(uFunctions, function(){
                var li = jQuery("<li>", {}).appendTo("#ulAllFunctions");
                jQuery("<a>"+this.NAME+"</a>", {}).appendTo(li);
                if(this.childs && this.childs.length>0)
                {
                    var ul = jQuery("<ul>", {}).appendTo(li);
                    $.each(this.childs, function(){
                        _createMenuItem(this, {
                            keyPrefix : "store-item",
                            dblClick :  dblclickFunc,
                            hoverIn : overFunc,
                            hoverOut : outFunc
                        }, {
                            delay : 100,
                            connectToSortable : "#ulMyFunctions",
                            helper : helperFunc,
                            start : startFunc,
                            stop : stopFunc
                        }).appendTo(ul);
                    });
                }
            });
            
            $("#ulMyFunctions").sortable({
                revert: 200,
                placeholder: "ui-state-highlight",
                tolerance: "pointer",
                over: function(e, u) {
                    u.helper.css("z-index", "9999");
                },
                beforeStop: function(e, u) {
                    newStoreItem = u.helper.data("item");
                    $("#store-item-"+newStoreItem.ID).addClass("exists").draggable( "disable" );
                },
                update: function(e, u) {
                    if(newStoreItem)
                    {
                        var node ;
                        if(updateStores.containsKey(newStoreItem.ID))
                        {
                            node = updateStores.get(newStoreItem.ID);
                        }
                        else
                        {
                            node = _createMyStoreConfigItem(newStoreItem);
                        }
                        u.item.replaceWith(node);
                    }
                    isModifyStores = true;
                },
                activate: function(e, u) {
                    $(u.item).data("isDragging", true);
                },
                deactivate: function(e, u) {
                    $(u.item).data("isDragging", false);
                }
            });
            
            $("#ulAllFunctions").slimScroll({
                height: 450,
                size: 5,
                color: '#D5D5D5'
            });
            $("#ulMyFunctions").slimScroll({
                height: 400,
                size: 5,
                color: '#D5D5D5'
            });
        },
        
        /**
         * 弹出收藏栏配置框之前
         */
        openStoreConfig: function() {
            isModifyStores = false;
            $("#ulMyFunctions").html("");
            updateStores = new HashMap();
            $("li.exists").removeClass("exists").draggable( "enable" );
            var arr = _getCurrentStores();
            $.each(arr, function(){
                _createMyStoreConfigItem(this);
                $("#store-item-"+this.ID).addClass("exists").draggable( "disable" );
            });
        },

        /**
         * 判断收藏夹是否有更新
         */
        isStoresChanged: function() {
            return isModifyStores;
        },
        
        /**
         * 保存收藏栏配置
         */
        saveStoreConfig: function() {
            
            if(MyApp.isStoresChanged())
            {
                $("#ulStore").html("");
                myStores = new HashMap();
                
                var items = new Array();
                $("#ulMyFunctions>li").each(function(){
                    var item = $(this).data("item");
                    item.DIS_NAME = $(this).find("c").text();
                    MyApp.genStoreItem(item);
                    items.push(item);
                });
                persistStoreFunc(items);//持久化收藏栏
            }
        },
        
        /**
         * 初始化导航栏
         */
        initNavigation: function(uFunctions) {
            
            var helperFunc = function(e){
                var uFunction = $(e.currentTarget).data("item");
                var p = jQuery("<p>"+uFunction.NAME+"</p>", {}).css({"background": "#7D9DE8", 
                      "height": "40px",
                      "width": "200px",
                      "color": "#FFFFFF",
                      "line-height": "40px",
                      "font-weight": "bold",
                      "text-align": "center"});
                p.data("item", uFunction);
                return p;
            };
            var startFunc = function(e, u, uFunction){
                $("#store").addClass("li-store-focus");
            };
            var stopFunc = function(e, u, uFunction){
                $("#store").removeClass("li-store-focus");
            };
            var clickFunc = function(uFunction){
                MyApp.showIframe(uFunction);
            };
            
            if(uFunctions && uFunctions.length > 0) {
                $.each(uFunctions, function(){
                    var div = jQuery("<div>", {}).addClass("btn-group").appendTo("#divTopMiddle");
                    var btn = jQuery("<button>"+this.NAME+"</button>", {}).attr("title", this.NAME)
                    .addClass("btn btn-default dropdown-toggle").attr("type", "button").attr("data-toggle", "dropdown").appendTo(div);
                    if(this.childs && this.childs.length>0)
                    {
                        var ul = jQuery("<ul>", {}).addClass("dropdown-menu").appendTo(div);
                        $.each(this.childs, function(hide){
                            _createMenuItem(this, {
                                hide : hide,
                                click :  clickFunc
                            }, {
                                delay : 500,
                                connectToSortable : "#ulStore",
                                helper : helperFunc,
                                start : startFunc,
                                stop : stopFunc
                            }).appendTo(ul);
                        }, [this.childs.length==1]);
                    }
                    $(btn).dropdownCtrl();
                });
            }
            
            _layoutTop();
        },
        
        /**
         * 显示iframe
         */
        showIframe: function(item, isNotRemove) {
            
            var exist = _activeIframe(item.ID);
            if (exist)
            {
                if(IS_IE)
                {
                    $(iframes[gActiveIndex].IFRAME)[0].contentWindow.location.reload() ;
                }
                else
                {
                    $(iframes[gActiveIndex].IFRAME).remove();
                    var iframe = jQuery("<iframe>", {}).addClass("iframeWindow").attr("frameborder", "0").attr("scrolling", "auto").appendTo($("#divIframeContainer"));
                    $(iframe)[0].contentWindow.location = item.URL;
                    _setOuterHeight($(iframe), $("#divIframeContainer").height());
                    iframes[gActiveIndex].IFRAME = iframe;
                }
                return;
            }
            
            var tabItem = jQuery("<li>" + item.NAME + "</li>", {}).appendTo($("#ul-tabs")).click(function(e){
                _activeIframe(item.ID);
//                e.stopPropagation();
            });
            if(!isNotRemove)
            {
                jQuery("<i>", {}).addClass("fa fa-times").appendTo(tabItem).click(function(e){
                    _closeIframe(item.ID);
                    e.stopPropagation();
                });
            }
            
            var iframe = jQuery("<iframe>", {}).addClass("iframeWindow").attr("frameborder", "0").attr("scrolling", "auto").appendTo($("#divIframeContainer"));
            $(iframe)[0].contentWindow.location = item.URL;
            _setOuterHeight($(iframe), $("#divIframeContainer").height());
            iframes[item.ID] = {};
            iframes[item.ID].IFRAME = iframe;
            iframes[item.ID].TABNODE = tabItem;
            _activeIframe(item.ID);
        },
        
        /**
         * 隐藏工具栏
         */
        hideToolbox: function() {
            
            var hideWidth = _getOuterWidth($(".tbox-btn"));
            $("#ul-tools").animate({
                width: hideWidth
            }, 400, '', function(){
                _layoutToolBox(true);
                $("#ul-tools li.tbox-btn i").removeClass("fa-arrow-right").addClass("fa-arrow-left");
                $("#ul-tools li.tbox-btn").unbind("click");
                $("#ul-tools li.tbox-btn").bind("click", function(){
                    MyApp.showToolbox();
                });
            });
        },
        
        /**
         * 显示工具栏
         */
        showToolbox: function() {
            $("#ul-tools").animate({
                width: toolbox_expand_width
            }, 400, '', function(){
                _layoutToolBox(true);
                $("#ul-tools li.tbox-btn i").removeClass("fa-arrow-left").addClass("fa-arrow-right");
                $("#ul-tools li.tbox-btn").unbind("click");
                $("#ul-tools li.tbox-btn").bind("click", function(){
                    MyApp.hideToolbox();
                });
            });
        }
    };
}());