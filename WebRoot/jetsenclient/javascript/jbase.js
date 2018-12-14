// lixiaomin 2008/05/16
//=============================================================================
// Jetsen Javascript Base
// 2011-11-11 将命名空间由JetsenWeb改为jetsennet
// 2012-03-10 cookie的默认options改为path:"/",添加jetsennet.cancelBubble功能，添加jetsennet.xml.htmlEscape方法
// 2012-05-15 修改popup时position=2的位置问题
// 2012-10-16 v1.1.0.1 更改验证 maxvalue时的错误
// 2012-11-07 v1.1.0.2 更改验证 maxvalue时的提示
// 2013-01-21 v1.1.0.3 tooltip增加移出清除功能
// 2013-10-18 v1.1.0.3 修改firefox下xml2obj处理出错问题
//=============================================================================
//http://www.zhangjingwei.com/jspacker/index.php 压缩工具
/*
引用基础脚本
<script language="javascript" src="../../../jetsenclient/javascript/jbase.js" apppath="../" theme="default" apptype="0"></script>
apppath String  为相对应用程式根目录,可略，默认为"";
theme   String  样式,可省略，默认为default
apptype Integer 0:默认，1：加载附加，不加载application.js，2：不加载附加，不加载application.js


//=========================================================================================================
引入脚本：
引入框架内的webservice.js
jetsennet.require("webservice");

引入子项目的脚本application.js ,跟引用jetsen.js时设的apppath有关,apppath设定子项目相对根目录
jetsennet.require("#application");

引入url脚本
jetsennet.require("script/application.js",true);

引入样式：
框架内的控件样式将自动引用，如果要自定样式，在项目中覆盖即可
如果没有在引入jetsen.js时设定theme,则为引用缺省的themes/default/..
jetsennet.importCss("style");

其它使用方式同引用脚本

//=========================================================================================================
字符串的操作：

jetsennet.util.trim("string");
jetsennet.util.isNullOrEmpty("string");
jetsennet.util.padLeft("string");
jetsennet.util.padRight("string");
jetsennet.util.right("string",1);
jetsennet.util.left("string",1);
jetsennet.util.isEmail("string");
jetsennet.util.isUrl("string");
jetsennet.util.trimStart("string","str");
jetsennet.util.trimEnd("string","ing");
jetsennet.util.parseInt("12345",0);

String增强
"string".equal("String"); ==>true;
"string".getBytes();

//=========================================================================================================
日期增强：
new Date().toDateString(); => "2008-08-08";
new Date().toTimeString(); => "08:08:08";
new Date().toDateTimeString();=>"2008-08-08 08:08:08"

//=========================================================================================================
URL查询
http://www.jetsen.com.cn?ID=1
jetsennet.queryString("ID");

//=========================================================================================================
cookie
get
jetsennet.cookie("coookieName");
set
jetsennet.cookie("coookieName",cookieValue);
*/
Function.__typeName = 'Function';
Object.__typeName = 'Object';
Boolean.__typeName = 'Boolean';
Date.__typeName = 'Date';
Number.__typeName = 'Number';
RegExp.__typeName = 'RegExp';
Array.__typeName = 'Array';
String.__typeName = 'String';
Error.__typeName = 'Error';

if (!window) {
    this.window = this;
}
window.jetsennet = Function;
var jetsennet = {};

//navigator type
var __navigator = navigator.userAgent.toLowerCase();
var IS_SAFARI = __navigator.indexOf("safari") > -1;
var IS_MAC = __navigator.indexOf("macintosh") > -1;
var IS_IE = __navigator.indexOf("msie") > -1 || __navigator.indexOf("trident") > -1;
var IS_WINDOWS = __navigator.indexOf("windows") > -1;
var IS_IE6 = (IS_IE && (__navigator.indexOf("msie 6") > -1));
var IS_IE7 = (IS_IE && (__navigator.indexOf("msie 7") > -1));
var IS_IE8 = (IS_IE && (__navigator.indexOf("msie 8") > -1));
var IS_IE11_PLUS = __navigator.indexOf("trident") > -1 && __navigator.indexOf("msie") < 0;

jetsennet.isDebug = false;
jetsennet.currentTheme = "jsnet";
jetsennet.pageTheme = "";
jetsennet.initiated = false;

jetsennet.baseUrl = null;
jetsennet.baseThemeUrl = null;

jetsennet.appPath = "";
jetsennet.appType = 0;

jetsennet.__loadedUrls = [];
jetsennet.__cacheList = [];
jetsennet.__queryCollection = null;
jetsennet.__webRoot = null;
jetsennet.__tempCssList = [];

/**
以ID获取DOM对象，如果参数本身为DOM对象则直接返回
*/
function el(element) {
    if (typeof element == 'string') {
        return document.getElementById(element);
    }
    else {
        return element;
    }
};
/*
获取对象的成员值
*/
function valueOf(obj, property, defaultValue) {
    if (typeof obj == 'string') {
        obj = el(obj);
    }
    if (obj == null) {
        return defaultValue;
    }
    property = property ? property : "value";
    var val = obj[property];
    return val == null ? defaultValue : val;
};
/*
获取成员的属性值
*/
function attributeOf(obj, property, defaultValue) {
    if (typeof obj == 'string') {
        obj = el(obj);
    }
    if (obj == null) {
        return defaultValue;
    }
    property = property ? property : "value";
    var val = obj.getAttribute(property);
    return val == null ? defaultValue : val;
};
/**
执行脚本
*/
jetsennet.eval = function (code) {
    if (IS_IE) {
        if (IS_IE11_PLUS) {
            window.eval(code);
        }
        else {
            execScript(code);
        }
    } else {
        window.eval(code);
    }
};
/**
获取事件
*/
jetsennet.getEvent = function () {
    if (IS_IE) {
        return window.event;
    }
    var func = jetsennet.getEvent.caller;
    var count = 0;
    while (func != null) {
        var arg0 = func.arguments[func.arguments.length - 1];
        if (arg0) {
            if ((arg0.constructor == Event || arg0.constructor == MouseEvent)
|| (typeof (arg0) == "object" && arg0.preventDefault && arg0.stopPropagation)) {
                return arg0;
            }
        }
        func = func.caller;
        count++;
        if (count > 50) {
            break;
        }
    }
    return null;
};
/**
取消事件
事件分为两部分，一个是事件是否冒泡，另一个是当前事件的返回值
@option returnValue : true:正常返回
*/
jetsennet.cancelEvent = function (returnValue) {
    var ev = jetsennet.getEvent();
    if (ev != null) {
        ev.cancelBubble = true;
        if (ev.stopPropagation) {
            ev.stopPropagation();
        }
        if (!returnValue) {
            ev.returnValue = false;
            if (ev.preventDefault) {
                ev.preventDefault();
            }
        }
    }
};
/**
取消事件冒泡
*/
jetsennet.cancelBubble = function () {
    var ev = jetsennet.getEvent();
    if (ev != null) {
        ev.cancelBubble = true;
        if (ev.stopPropagation) {
            ev.stopPropagation();
        }
        if ("click".equal(ev.type)) {
            jetsennet.hidePopups();
        }
    }
};
/**
生成一个函数,主要在于函数的调用方
@param Mix object 函数的调用方
@param Function fun 函数
@options arguments
*/
jetsennet.bindFunction = function (object, fun) {
    var args = Array.prototype.slice.call(arguments).slice(2);
    return function (e) {
        return fun.apply(object, args);
    };
};
/**
短时间触发多次的处理
*/
jetsennet.throttle = function (fn, delay, mustRunDelay) {
    var timer = null;
    var start;
    return function () {
        var context = this, args = arguments, curr = new Date();
        clearTimeout(timer);
        if (!start) {
            start = curr;
        }
        if (curr - start >= (mustRunDelay || valueOf(jetsennet, "THROTTLE_MUST_DELAY", 5000))) {
            start = curr;
            fn.apply(context, args);
        }
        else {
            timer = setTimeout(function () {
                start = curr;
                fn.apply(context, args);
            }, delay || valueOf(jetsennet, "THROTTLE_DELAY", 300));
        }
    };
};
/**
按键事件
@param Function fn 事件函数
@param Interger keycode 键值
*/
jetsennet.keyEvent = function (fn, keycode) {
    keycode = keycode == null ? 13 : keycode;
    if (fn != null && jetsennet.getEvent().keyCode == keycode) {
        if (typeof fn == "function") {
            fn();
        }
        else {
            jetsennet.eval(fn);
        }
    }
};
/**
注册命名空间
*/
jetsennet.registerNamespace = function (namespacePath) {
    var rootObject = window;
    var namespaceParts = namespacePath.split('.');

    for (var i = 0; i < namespaceParts.length; i++) {
        var currentPart = namespaceParts[i];
        var ns = rootObject[currentPart];
        if (!ns) {
            rootObject[currentPart] = new Object();
            ns = rootObject[currentPart];
        }
        rootObject = ns;
    }
};
/**
创建对象
@param String className 类名
@option JSON property 属性
*/
jetsennet.create = function (/*classString*/className, /*json*/property) {
    var obj;
    eval("obj = new " + className + "()");
    if (!obj) {
        return null;
    }
    for (var p in property) {
        //safari event not to setter
        //if (!(IS_SAFARI && p == "event"))
        obj[p] = property[p];
    }
    return obj;
};
/**
获取基础路径
*/
jetsennet.getBaseUrl = function () {
    if (document && document.getElementsByTagName) {
        var scripts = document.getElementsByTagName("script");
        var rePkg = /jbase\.js(\W|$)/i;
        for (var i = 0; i < scripts.length; i++) {
            var src = scripts[i].getAttribute("src");
            if (!src) { continue; }
            var m = src.match(rePkg);
            if (m) {
                jetsennet.baseUrl = src.substring(0, m.index);
                jetsennet.appPath = scripts[i].getAttribute("apppath");
                jetsennet.appPath = jetsennet.appPath ? jetsennet.appPath : "";
                jetsennet.appType = scripts[i].getAttribute("apptype");
                jetsennet.appType = jetsennet.appType ? parseInt(jetsennet.appType) : 0;
                jetsennet.pageTheme = scripts[i].getAttribute("theme");
                break;
            }
        }
    }
};

/**
引用脚本
@param mix moduleName 可以为字符串，字符数组
@option bool isUrl 是否url地址
*/
jetsennet.require = function (/*String*/moduleName, isUrl) {

    if (typeof moduleName == "object") {
        for (var i = 0; i < moduleName.length; i++) {
            jetsennet.require(moduleName[i], isUrl);
        }
        return;
    }
    if (moduleName == "") {
        return;
    }
    var uri = isUrl ? moduleName : jetsennet.getloadUri(moduleName, 0);
    for (var i = 0; i < jetsennet.__loadedUrls.length; i++) {
        if (jetsennet.__loadedUrls[i] == uri) {
            return;
        }
    }

    jQuery.ajax(uri, { async: false,
        success: function (result) {
            if (jetsennet.util.isNullOrEmpty(result) || result.charAt(0) == "<") {
                return;
            }
            try { 
            	jetsennet.eval(result); 
            }
            catch (e) { alert(e); }
        },
        dataType: "text", mimeType: "text/xml", error: function (obj, ex) { throw ex; }
    });

    jetsennet.addLoadedUri(uri);
};
/**
引用样式
@param mix moduleName 可以为字符串，字符数组
@option bool isUrl 是否url地址
*/
jetsennet.importCss = function (/*String*/moduleName, /*bool*/isUrl) {

    if (!jetsennet.initiated) {
        jetsennet.__tempCssList.push({ moduleName: moduleName, isUrl: isUrl });
        return;
    }

    if (typeof moduleName == "object") {
        for (var i = 0; i < moduleName.length; i++) {
            jetsennet.importCss(moduleName[i], isUrl);
        }
        return;
    }
    if (moduleName == "") {
        return;
    }
    var uri = isUrl ? moduleName : jetsennet.getloadUri(moduleName, 1);
    for (var i = 0; i < jetsennet.__loadedUrls.length; i++) {
        if (jetsennet.__loadedUrls[i] == uri) {
            return;
        }
    }

    var head = document.getElementsByTagName('head').item(0);
    var css = document.createElement('link');
    css.href = uri;
    css.rel = 'stylesheet';
    css.type = 'text/css';
    head.appendChild(css);
    jetsennet.addLoadedUri(uri);
};
/**
将url添加至已加载中
*/
jetsennet.addLoadedUri = function (/*string*/uri) {
    var len = jetsennet.__loadedUrls.length;
    for (var i = 0; i < len; i++) {
        if (jetsennet.__loadedUrls[i] == uri) {
            return;
        }
    }
    jetsennet.__loadedUrls.push(uri);
};
/**
获取加载的全路径
*/
jetsennet.getloadUri = function (/*String*/moduleName, /*0,1*/resourceType) {
    var relpath = moduleName;//.split(".").join("/");
    var uri = "";
    var path = (resourceType == 1 ? jetsennet.baseThemeUrl : jetsennet.baseUrl);
    if (relpath.charAt(0) == '/' || relpath.match(/^\w+:/)) {
        path = "";
    }
    else if (relpath.charAt(0) == '#') {
        relpath = relpath.substr(1);
        path = jetsennet.appPath + (resourceType == 1 ? "style/" : "javascript/");
    }

    uri = path + relpath + (resourceType == 1 ? '.css' : '.js');

    return uri;//.toLowerCase();
};
/**
缓存数据
@param String key
@option Mix val
*/
jetsennet.cache = function (/*string*/key, /*object*/val) {
    var count = jetsennet.__cacheList.length;
    if (arguments.length == 1) {
        for (var i = 0; i < count; i++) {
            if (jetsennet.__cacheList[i].key == key) {
                return jetsennet.__cacheList[i].value;
            }
        }
        return null;
    }
    else {
        for (var i = 0; i < count; i++) {
            if (jetsennet.__cacheList[i].key == key) {
                jetsennet.__cacheList[i].value = val;
                return;
            }
        }
        jetsennet.__cacheList.push({ key: key, value: val });
    }
};
//=============================================================================
// http 请求
//=============================================================================
jetsennet.request = function (url, data, callback, onerror, options) {
    jQuery.ajax(url,
        jQuery.extend(jQuery.extend({ "type": "POST" }, options),
            {
                data: jQuery.extend(data, { token: valueOf(jetsennet.application.userInfo, "UserToken", "") }),
                success: function (result) {
                    if (result && result.errorCode == 0) {
                        if (jQuery.isFunction(callback)) {
                            callback(result.resultVal);
                        }
                    }
                    else {
                        var errorName = valueOf(valueOf(jetsennet, "ERROR_CODE", null), result.errorCode, null);
                        if (!jetsennet.util.isNullOrEmpty(errorName)) {
                            result.errorString = errorName;
                            if (jetsennet.alertAndCall) {
                                jetsennet.alertAndCall(result.errorString, "jetsennet.gotoLogin();")
                            }
                            else {
                                alert(result.errorString);
                                jetsennet.gotoLogin();
                            }
                            return;
                        }

                        if (jQuery.isFunction(onerror)) {
                            onerror(result.errorString);
                        }
                    }
                },
                dataType: "json",
                error: function (obj, ex, info) {
                    if (jQuery.isFunction(onerror)) {
                        onerror((typeof ex == "string" && ex == "error") ? info : ex);
                    }
                }
            }
        )
    );
};

//=========================================================
// javascript extend Array object
//===========================================================
Array.prototype.contains = function(obj, isCompareType) {
    var i = this.length;
    if(isCompareType){
    	while (i--) {
    		if (this[i] === obj) {
    			return true;
    		}
    	}
    }else{
    	while (i--) {
    		if (this[i] == obj) {
    			return true;
    		}
    	}
    }
    return false;
};

/**
extend Date object new Date().toDateString();
*/
Date.prototype.toDateString = function (bCh) {
    var month = this.getMonth() + 1;
    var day = this.getDate();
    if (month < 10) {
        month = "0" + month;
    }
    if (day < 10) {
        day = "0" + day;
    }
    return jetsennet.util.padLeft(this.getFullYear(), 4, '0') + (bCh ? '年' : '-') + month + (bCh ? '月' : '-') + day + (bCh ? '日' : '');
};
Date.prototype.toTimeString = function () {
    return jetsennet.util.padLeft(this.getHours(), 2, '0') + ":" + jetsennet.util.padLeft(this.getMinutes(), 2, '0') + ":" + jetsennet.util.padLeft(this.getSeconds(), 2, '0');
};
Date.prototype.toDateTimeString = function () {
    var month = this.getMonth() + 1;
    var day = this.getDate();
    if (month < 10) {
        month = "0" + month;
    }
    if (day < 10) {
        day = "0" + day;
    }
    return jetsennet.util.padLeft(this.getFullYear(), 4, '0') + '-' + month + '-' + day + " " + jetsennet.util.padLeft(this.getHours(), 2, '0') + ":" + jetsennet.util.padLeft(this.getMinutes(), 2, '0') + ":" + jetsennet.util.padLeft(this.getSeconds(), 2, '0');
};
//=============================================================================
//javascript extend String object
//=============================================================================
String.prototype.getBytes = function () {
    var cArr = this.match(/[^\x00-\xff]/ig);
    return this.length + (cArr == null ? 0 : cArr.length);
};
String.prototype.toInteger = function () {
    return parseInt(this);
};
String.prototype.toFloat = function () {
    return parseFloat(this);
};
String.prototype.equal = function (str) {
    if (str == null) return false;
    return this.toLowerCase() == str.toLowerCase();
};
String.prototype.toRegExp = function () {
    return this.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)")
    .replace(/\[/g, "\\[").replace(/\]/g, "\\]").replace(/\*/g, "\\*")
    .replace(/\?/g, "\\?").replace(/\./g, "\\.").replace(/\+/g, "\\+");
};
String.prototype.replaceAll = function (s1, s2) {
    return this.replace(new RegExp(s1, "gmi"), s2);
};
String.prototype.trim = function () {
    return this.replace(/(^\s*)|(\s*$)/g, "");
};
//=============================================================================
// jetsennet.Url
//=============================================================================
jetsennet.Url = function (url) {
    this.url = url ? url : new String(window.location.toString());
};
jetsennet.Url.prototype.getUrl = function () {
    return this.url;
};
jetsennet.Url.prototype.removeSearch = function (/*string*/key) {
    if (key == null && key == "") {
        return this.url;
    }
    var tempItems = this.getQueryItems();
    var search = "";
    for (var i = 0; i < tempItems.length; i++) {
        if (tempItems[i].name != key) {
            search += "&" + tempItems[i].name + "=" + escape(tempItems[i].value);
        }
    }
    search = (search.length > 0) ? "?" + search.substring(1) : "";
    this.url = this.getNoQueryUrl() + search;
    return this.url;
};
jetsennet.Url.prototype.getQueryItems = function () {
    var tempQItems = [];

    var queryString = this.getQueryString();
    if (queryString == null || queryString == "") {
        return tempQItems;
    }

    var tempArr = queryString.split("&");
    for (i = 0; i < tempArr.length; i++) {
        if (tempArr[i] == "") {
            continue;
        }
        var temp = tempArr[i].split("=");
        var str1 = temp[0];
        var str2 = unescape(temp[1]);
        tempQItems.push({ "name": str1, "value": str2 });
    }
    return tempQItems;
};
jetsennet.Url.prototype.getQueryString = function () {
    var tempArr = this.url.split("\?");
    if (tempArr && tempArr.length == 2) {
        return tempArr[1];
    }
    return "";
};
jetsennet.Url.prototype.getNoQueryUrl = function () {
    var tempArr = this.url.split("\?");
    return tempArr[0];
};

/**
url查询字符串
test.htm?id=5; 
jetsennet.queryString("id")=="5"
jetsennet.queryString("other")==""
*/
jetsennet.queryString = function (/*string*/name) {
    if (jetsennet.__queryCollection == null) {
        jetsennet.__queryCollection = new jetsennet.Url().getQueryItems();
        return "";
    }
    if (name == null) {
        return "";
    }
    for (var i = 0; i < jetsennet.__queryCollection.length; i++) {
        if (name.equal(jetsennet.__queryCollection[i].name)) {
            return jetsennet.__queryCollection[i].value;
        }
    }
    return "";
};

//=============================================================================
// type mapping
//=============================================================================
jetsennet.registerNamespace("jetsennet.application");

//兼容大小写
jetsennet.Application = jetsennet.application;

jetsennet.getPortalServiceUrl = function () {
    if (jetsennet["PORTAL_SERVICE"])
        return jetsennet.appPath + "../../services/" + jetsennet["PORTAL_SERVICE"] + "?wsdl";
    else
        return null;
};
jetsennet.getWebRoot = function () {
    if (jetsennet.__webRoot == null) {
        jetsennet.__webRoot = jetsennet.appPath + "../../";
    }
    return jetsennet.__webRoot;
};

//=============================================================================
//非IE浏览器的增强,在使用非IE浏览器的时候自动加载
//=============================================================================
if (!IS_IE) {
    Element.prototype.getXml = function (node) {
        var oNode = (node == null) ? this : node;
        if (this.ownerDocument.getXml) {
            return this.ownerDocument.getXml(oNode);
        }
        else { throw "For XML Elements Only"; }
    };
    Element.prototype.getText = function (node) {
        var oNode = (node == null) ? this : node;
        if (this.ownerDocument.getText) {
            return this.ownerDocument.getText(oNode);
        }
        else { throw "For XML Elements Only"; }
    };
    // prototying the Element
    Element.prototype.selectNodes = function (cXPathString) {
        if (this.ownerDocument.selectNodes) {
            return this.ownerDocument.selectNodes(cXPathString, this);
        }
        else { throw "For XML Elements Only"; }
    };
    // prototying the Element
    Element.prototype.selectSingleNode = function (cXPathString) {
        if (this.ownerDocument.selectSingleNode) {
            return this.ownerDocument.selectSingleNode(cXPathString, this);
        }
        else { throw "For XML Elements Only"; }
    };
    Document.prototype.__defineGetter__("xml", function () {
        return ((new XMLSerializer()).serializeToString(this));
    });
    // xml text
    Element.prototype.__defineGetter__("text", function () {
        return this.textContent;
    });
    Element.prototype.__defineSetter__("text", function (sValue) {
        if (this.firstChild && (this.firstChild.nodeType == 3 || this.firstChild.nodeType == 4)) {
            this.firstChild.nodeValue = sValue;
        } else if (!this.firstChild) {
            var _textNode = this.ownerDocument.createTextNode(sValue);
            this.appendChild(_textNode);
        }
    });
    Element.prototype.__defineGetter__("xml", function () {
        if (this.nodeType == 9) {
            return ((new XMLSerializer()).serializeToString(this));
        } else {
            var doc = (new DOMParser()).parseFromString('<tId_df_FGD_dop/>', "text/xml");
            doc.documentElement.appendChild(this.cloneNode(true));
            var re = ((new XMLSerializer()).serializeToString(doc));
            re = re.replace('<tId_df_FGD_dop>', '').replace('</tId_df_FGD_dop>', '');
            return re;
        }
    });

    if (window.HTMLElement) {
        HTMLElement.prototype.__defineSetter__("outerHTML", function (sHTML) {
            var r = this.ownerDocument.createRange();
            r.setStartBefore(this);
            var df = r.createContextualFragment(sHTML);
            this.parentNode.replaceChild(df, this);
            return sHTML;
        });

        HTMLElement.prototype.__defineGetter__("outerHTML", function () {
            var attr;
            var attrs = this.attributes;
            var str = "<" + this.tagName.toLowerCase();
            for (var i = 0; i < attrs.length; i++) {
                attr = attrs[i];
                if (attr.specified)
                    str += " " + attr.name + '="' + attr.value + '"';
            }
            if (!this.canHaveChildren)
                return str + ">";
            return str + ">" + this.innerHTML + "</" + this.tagName.toLowerCase() + ">";
        });

        HTMLElement.prototype.__defineGetter__("canHaveChildren", function () {
            switch (this.tagName.toLowerCase()) {
                case "area":
                case "base":
                case "basefont":
                case "col":
                case "frame":
                case "hr":
                case "img":
                case "br":
                case "input":
                case "isindex":
                case "link":
                case "meta":
                case "param":
                    return false;
            }
            return true;

        });
        HTMLElement.prototype.__defineGetter__("innerText",
                function () {
                    var anyString = "";
                    var childS = this.childNodes;
                    for (var i = 0; i < childS.length; i++) {
                        if (childS[i].nodeType == 1)
                            anyString += childS[i].tagName == "BR" ? '\n' : childS[i].innerText;
                        else if (childS[i].nodeType == 3)
                            anyString += childS[i].nodeValue;
                    }
                    return anyString;
                }
            );
        HTMLElement.prototype.__defineSetter__("innerText",
                function (sText) {
                    this.textContent = sText;
                }
            );
        HTMLElement.prototype.fireEvent = function (sEventName) {
            var e = document.createEvent("HTMLEvents");
            e.initEvent(sEventName.toString().replace(/on/, ""), false, false);
            this.dispatchEvent(e);
        };

        //2012-06-05
        //window.constructor.prototype.__defineGetter__("event", jetsennet.getEvent);

        Event.prototype.__defineSetter__("returnValue", function (b) {
            if (!b) this.preventDefault();
            return b;
        });
        Event.prototype.__defineSetter__("cancelBubble", function (b) {
            if (b) this.stopPropagation();
            return b;
        });
        Event.prototype.__defineGetter__("srcElement", function () {
            var node = this.target;
            while (node.nodeType != 1) node = node.parentNode;
            return node;
        });
        Event.prototype.__defineGetter__("fromElement", function () {
            var node;
            if (this.type == "mouseover")
                node = this.relatedTarget;
            else if (this.type == "mouseout")
                node = this.target;
            if (!node) return;
            while (node.nodeType != 1) node = node.parentNode;
            return node;
        });
        Event.prototype.__defineGetter__("toElement", function () {
            var node;
            if (this.type == "mouseout")
                node = this.relatedTarget;
            else if (this.type == "mouseover")
                node = this.target;
            if (!node) return;
            while (node.nodeType != 1) node = node.parentNode;
            return node;
        });
        Event.prototype.__defineGetter__("offsetX", function () {
            return this.layerX;
        });
        Event.prototype.__defineGetter__("offsetY", function () {
            return this.layerY;
        });
    }
    /**
    2012-06-05
    Object.prototype.transformNode = function (sXsltObj) {
    var xslt = new XSLTProcessor();
    xslt.importStylesheet(sXsltObj);
    var outerHTMLObj = xslt.transformToFragment(this, document);
    var divEl = document.createElement("div");
    divEl.appendChild(outerHTMLObj);
    var outerHTML = divEl.innerHTML;
    return outerHTML;
    };
    
    Object.prototype.attachEvent = function (sEventName, sFuncitonName) {
    this.addEventListener(sEventName.toString().replace(/on/, ""), sFuncitonName, false);
    };    

    Object.prototype.selectNodes = function (sExpr) {
    if (typeof XPathEvaluator == "undefined") {
    throw "selectNodes not defined";
    }

    var xpe = new XPathEvaluator();
    var ownerDocument = this.ownerDocument == null ? this.documentElement : this.ownerDocument.documentElement;

    try {
    var nsResolver = xpe.createNSResolver(ownerDocument);
    var result = xpe.evaluate(sExpr, this, nsResolver, 0, null);
    }
    catch (ex) {
    return ["there is an error when using xpath "];
    }

    var found = [];
    while (res = result.iterateNext())
    found.push(res);

    return found;
    };
    Object.prototype.selectSingleNode = function (sExpr) {
    var obj = this.selectNodes(sExpr);
    if (obj && obj.length > 0)
    return obj[0];
    else
    return null;
    };
    
    Object.prototype.setProperty = function () { };
    */
}

//=============================================================================
// jetsennet.xml
//=============================================================================
jetsennet.registerNamespace("jetsennet.xml");

jetsennet.xml.xslEscape = function (text) {
    return text.toString().replace(/\}/ig, "&rdkh;")
		.replace(/\{/ig, "&ldkh;");
};
jetsennet.xml.xslUnescape = function (text) {
    return text.toString().replace(/&rdkh;/ig, "}")
		.replace(/&ldkh;/ig, "{");
};
jetsennet.xml.htmlEscape = function (text) {
    if (text == null) {
        return "";
    }
    return text.toString().replace(/</ig, "&lt;")
        .replace(/>/ig, "&gt;");
};
jetsennet.xml.xmlEscape = function (sXml) {
    if (sXml == null) {
        return "";
    }
    return sXml.toString().replace(/&/ig, "&amp;")
		.replace(/</ig, "&lt;")
        .replace(/>/ig, "&gt;")
        .replace(/"/ig, "&quot;")
        .replace(/[•]/img, "·"); //"&amp;middot;"    
};
jetsennet.xml.xmlUnescape = function (sXml) {
    if (sXml == null) {
        return "";
    }
    return sXml.toString().replace(/&apos;/ig, "'")
        .replace(/&quot;/ig, "\"")
        .replace(/&gt;/ig, ">")
        .replace(/&lt;/ig, "<")
        .replace(/&amp;/ig, "&");
};
jetsennet.xml.xhtmlEscape = function (sXml) {
    sXml = sXml.replace(/&nbsp/gm, " ");
    return sXml.replace(/<[^<>]+>/gm, function (nodeHtml) {
        if (nodeHtml.indexOf("/>") > -1 || nodeHtml.indexOf("</") > -1) {
            return nodeHtml.toLowerCase();
        }

        //fix string has quot 's attribute.
        nodeHtml = nodeHtml.replace(/\w+="{1}[^"]*"{1}/gm, function (nodeAtt) {
            var n = nodeAtt.indexOf('=');
            var arrName = nodeAtt.substring(0, n);
            var attValue = nodeAtt.substring(n + 2, nodeAtt.length - 1);
            attValue = jetsennet.xml.xmlEscape(attValue);
            return arrName.toLowerCase() + '="' + attValue + '"';
        });

        //fix not has quot 's attribute.
        nodeHtml = nodeHtml.replace(/ \w+=[^"> ]+/gm, function (nodeAtt) {
            var n = nodeAtt.indexOf('=');
            var attName = nodeAtt.substring(0, n + 1);
            var attValue = nodeAtt.substr(n + 1);
            attValue = jetsennet.xml.xmlEscape(attValue);
            return attName.toLowerCase() + '"' + attValue + '"';
        });

        var nodeName;
        nodeHtml = nodeHtml.replace(/<\w+/gm, function (nn) {
            nn = nn.toLowerCase();
            nodeName = nn.substr(1);
            return nn;
        });

        if (nodeName == "input" || nodeName == "hr" || nodeName == "br" || nodeName == "img") {
            if (nodeHtml.substr(nodeHtml.length - 2) != "/>") {
                nodeHtml = nodeHtml.substr(0, nodeHtml.length - 1) + "/>";
            }
        }

        return nodeHtml;
    }
    );
};
jetsennet.xml.transform = jetsennet.xml.transformXML = function (/*string*/filepath, /*string*/xmlVal, params) {

    if (xmlVal == null)
        return "";
    var resultXml = xmlVal;
    if (typeof xmlVal == 'string') {
        if (xmlVal == "") {
            return "";
        }
        resultXml = new jetsennet.XmlDoc();
        resultXml.loadXML(xmlVal);
    }

    if (resultXml.documentElement) {
        var xslt = filepath;
        if (typeof filepath == 'string') {
            xslt = jetsennet.cache(filepath);
            if (xslt == null || !xslt.documentElement) {
                xslt = new jetsennet.XmlDoc();
                xslt.async = false;
                xslt.load(filepath);
                if (xslt.documentElement == null) {
                    alert("加载文件:" + jetsennet.util.getFileName(filepath) + " 失败");
                    return "";
                }

                jetsennet.cache(filepath, xslt);
            }
        }

        if (params && params.length) {
            if (window.ActiveXObject !== undefined) {
                xslt.setProperty("SelectionNamespaces", "xmlns:xsl='http://www.w3.org/1999/XSL/Transform'");
            }
            for (var i = 0; i < params.length; i++) {
                if (params[i].name == null || params[i].name == "") {
                    continue;
                }
                var param = xslt.documentElement.selectSingleNode("xsl:param[@name='" + params[i].name + "']");
                if (param != null) {
                    xslt.documentElement.removeChild(param);
                }
                if (IS_IE) {
                    param = xslt.createNode(1, "xsl:param", "http://www.w3.org/1999/XSL/Transform");
                }
                else {
                    param = xslt.createElement("xsl:param");
                }
                param.text = params[i].value;
                param.setAttribute("name", params[i].name);
                xslt.documentElement.insertBefore(param, xslt.documentElement.firstChild);
            }

            if (!IS_IE) {
                xslt.loadXML(xslt.documentElement.xml);
            }
        }
        //        if(IS_IE){
        return jetsennet.xml.xmlUnescape(resultXml.transformNode(xslt));
        //        }else{
        //            var xslProc = new XSLTProcessor();
        //            xslProc.importStylesheet(xslt);            
        //            var ret =  xslProc.transformToFragment(resultXml, document);  
        //            var oSerializer = new XMLSerializer();
        //            return oSerializer.serializeToString(ret);         
        //        }
    }
    return "";
};
jetsennet.xml.getXml = function (oNode) {
    if (oNode == null) {
        return null;
    }
    if (IS_IE) {
        return oNode.xml;
    } else {
        return oNode.getXml();
    }
};
jetsennet.xml.getText = function (oNode, itemName) {
    if (oNode == null) {
        return null;
    }
    if (itemName) {
        return jQuery(oNode.selectSingleNode(itemName)).text();
    }
    //    if (IS_IE) {
    //        return oNode.text;
    //    } else {
    //        return oNode.getText();
    //    }
    return jQuery(oNode).text();
};
jetsennet.xml.setText = function (oNode, text, itemName) {

    if (oNode == null) {
        return;
    }

    if (itemName) {
        var itemNode = oNode.selectSingleNode(itemName);
        if (itemNode == null) {
            itemNode = oNode.ownerDocument.createElement(itemName);
            oNode.appendChild(itemNode);
        }
        itemNode.text = text;
    }
    else {
        oNode.text = text;
    }
};
jetsennet.xml.getFirstChild = function (oNode) {
    if (!oNode || oNode.childNodes.length == 0) {
        return null;
    }
    if (IS_IE || oNode.childNodes[0].nodeName != "#text") {
        return oNode.childNodes[0];
    } else {
        return oNode.childNodes[1];
    }
};
/**
//<item>1</item>  
jetsennet.xml.serialize(1,"item");  
//@开头表示属性，$表示值  
//<item type="1">value</item>  
jetsennet.xml.serialize({"@type":1,$:"value"},"item");  
//数组直接列表出现，没有父节点  
//<item><item>1</item><item>2</item><item>3</item></item>  
jetsennet.xml.serialize([1,2,3],"item");  
//<result type="1">  
//  <name>title</name>  
//  <value>val</value>  
//  <item>1</item>  
//  <item>2</item>  
//  <item><left>1</left><top>1</top></item>  
//</result> 
jetsennet.xml.serialize({  
"@type":"1"  
name:"title",  
value:"val",  
item:[1,2,{left:1,top:1}]},"result");
*/
jetsennet.xml.serialize = function (obj, options) {

    if (options != null && typeof options == "string") {
        options = { rootName: options };
    }

    options = jQuery.extend({ rootName: "root",
        igoreAttribute: false, //忽略属性
        attributeFlag: "@",    //属性标志 
        valueFlag: "$",        //值标志 
        trueValue: "true",
        falseValue: "false"
    }, options);

    var isSimpleType = function (typeName) {
        if (typeName == "string" || typeName == "number" || typeName == "boolean") {
            return true;
        }
    };
    var getSimpleValue = function (nodeValue) {
        if (typeof nodeValue == "boolean") {
            return (nodeValue ? options.trueValue : options.falseValue);
        }
        else {
            return nodeValue;
        }
    };
    var arrXml = [];
    arrXml.push("<" + options.rootName);

    if (!options.igoreAttribute) {
        for (var p in obj) {
            if (p.charAt(0) == options.attributeFlag) {
                if (obj[p] != null) {
                    var attrName = jetsennet.util.trimStart(p, options.attributeFlag.toRegExp()); //"\@"

                    arrXml.push(" " + attrName + "=\"");
                    arrXml.push(jetsennet.xml.xmlEscape(
                    isSimpleType(typeof obj[p]) ? getSimpleValue(obj[p])
                        : jetsennet.xml.serialize(obj[p], jQuery.extend(jQuery.extend({}, options), { rootName: attrName }))
                        )
                    );
                    arrXml.push("\"");
                }
            }
        }
    }
    arrXml.push(">");

    if (isSimpleType(typeof obj)) {
        arrXml.push(jetsennet.xml.xmlEscape(getSimpleValue(obj)));
    }
    else {

        for (var p in obj) {
            var nodeName = (obj.length && obj.pop && obj.push) ? options.rootName : p;
            if (!options.igoreAttribute && p.charAt(0) == options.attributeFlag) {
                continue;
            }
            var nodeValue = "";
            var nodeType = typeof obj[p];
            if (nodeType == "function" || p.charAt(0) == "_") {
                continue;
            }
            else if (obj[p] == null) {

            }
            else if (p == options.valueFlag) {
                nodeValue = jetsennet.xml.xmlEscape(getSimpleValue(obj[p]));
            }
            else if (isSimpleType(nodeType)) {
                nodeValue = "<" + nodeName + ">" + jetsennet.xml.xmlEscape(getSimpleValue(obj[p])) + "</" + nodeName + ">";
            }
            else if (nodeType == "object") {
                if (obj[p].toXml) {
                    nodeValue = obj[p].toXml();
                }
                else if (obj[p].length && obj[p].pop && obj[p].push) {
                    for (var i = 0; i < obj[p].length; i++) {
                        var nodeItem = obj[p][i];
                        if (nodeItem.toXml) {
                            nodeValue += nodeItem.toXml();
                        }
                        else if (isSimpleType(typeof nodeItem)) {
                            nodeValue += "<" + nodeName + ">" + jetsennet.xml.xmlEscape(getSimpleValue(nodeItem)) + "</" + nodeName + ">";
                        }
                        else {
                            nodeValue += jetsennet.xml.serialize(nodeItem,
                                jQuery.extend(jQuery.extend({}, options), { rootName: nodeName }));
                        }
                    }
                }
                else {
                    nodeValue = jetsennet.xml.serialize(obj[p],
                        jQuery.extend(jQuery.extend({}, options), { rootName: nodeName }));
                }
            }
            arrXml.push(nodeValue);
        }
    }

    arrXml.push("</" + options.rootName + ">");
    return arrXml.join("");
};
/**
xml对象化
*/
jetsennet.xml.deserialize = jetsennet.xml.toObject = function (xmlString, options) {

    if (xmlString == null)
        return null;

    var rootElement = xmlString;
    if (typeof xmlString == 'string') {
        if (xmlString == "") {
            return null;
        }
        var xmlDoc = new jetsennet.XmlDoc();
        xmlDoc.async = false;
        xmlDoc.loadXML(xmlString);
        rootElement = xmlDoc.documentElement;
    }
    else {
        rootElement = rootElement.documentElement ? rootElement.documentElement : rootElement;
    }

    if (options != null && typeof options == "string") {
        options = { arrayName: options };
    }

    options = jQuery.extend({ igoreAttribute: true, attributeFlag: "@", valueFlag: "$" }, options);

    if (rootElement) {
        var obj = jetsennet.xml._toObject(rootElement, options);

        if (options.arrayName && options.arrayName != "") {
            if (obj && obj[options.arrayName]) {
                obj = (obj[options.arrayName].push && obj[options.arrayName].pop) ? obj[options.arrayName] : [obj[options.arrayName]];
            }
            else {
                obj = null;
            }
        }
        return obj;
    };
    return null;
};
jetsennet.xml._toObject = function (xml, options) {

    if (xml == null) {
        return null;
    }

    var obj = new Object();

    if (!options.igoreAttribute) {
        jQuery.each(xml.attributes, function (i, attr) {
            obj[options.attributeFlag + attr.name] = attr.value;
        });
    }

    var xmlNodeLen = jQuery(xml).children().length;//xml.childNodes.length;
    if (xmlNodeLen == 0) {
    	if(xml.nodeType == 1) {
    		var nodeText = jQuery(xml).text();
            if (!jetsennet.util.isNullOrEmpty(nodeText)) {
                if (options.igoreAttribute) {
                    return nodeText;
                }
                else {
                    obj[options.valueFlag] = nodeText;
                }
            }
            else {
                return options.igoreAttribute ? "" : obj;
            }
    	}
        return options.igoreAttribute ? "" : obj;
    }

    for (var i = 0; i < xmlNodeLen; i++) {
        var curNode = jQuery(xml).children()[i];//xml.childNodes[i];
        if (curNode.nodeType == 1) {
            //            var curObj = null;
            //            var firstNode = jetsennet.xml.getFirstChild(curNode);
            //            if (curNode.childNodes.length > 0 && firstNode && firstNode.nodeType && firstNode.nodeType == 1) {
            //                curObj = jetsennet.xml._toObject(curNode);
            //            }
            //            else {
            //                curObj = jetsennet.xml.getText(curNode);
            //            }
            var curObj = jetsennet.xml._toObject(curNode, options);

            if (curObj != null) {
                var propertyName = IS_IE ? curNode.baseName : curNode.localName;//curNode.nodeName;
                if (obj[propertyName]) {
                    if (obj[propertyName].push && obj[propertyName].pop) {
                        obj[propertyName].push(curObj);
                    }
                    else {
                        var oldObject = obj[propertyName];
                        obj[propertyName] = new Array();
                        obj[propertyName].push(oldObject);
                        obj[propertyName].push(curObj);
                    }
                }
                else {
                    obj[propertyName] = curObj;
                }
            }
            else {
                return null;
            }
        }
        else {
            var nodeText = jQuery(curNode).text();
            if (!jetsennet.util.isNullOrEmpty(nodeText)) {
                if (options.igoreAttribute) {
                    return nodeText;
                }
                else {
                    obj[options.valueFlag] = nodeText;
                }
            }
            else {
                return options.igoreAttribute ? "" : obj;
            }
        }

    }
    return obj;
};
//=============================================================================
// jetsennet.XmlDoc
//=============================================================================
jetsennet.XmlDoc = function () {
    this.__typeName = "jetsennet.XmlDoc";
    var tXmlDoc = {};
    if (window.ActiveXObject !== undefined) {
        var tMsXmlDomType = ["Msxml2.DOMDocument.6.0", "Msxml2.DOMDocument.5.0", "Msxml2.DOMDocument.4.0", "Msxml2.DOMDocument.3.0", "MSXML2.DOMDocument", "MSXML.DOMDocument", "Microsoft.XMLDOM"];
        for (var i = 0; i < tMsXmlDomType.length; i++) {
            try {
                tXmlDoc = new ActiveXObject(tMsXmlDomType[i]);
                tXmlDoc.setProperty("SelectionLanguage", "XPath");
                break;
            }
            catch (ex) { }
        }
    }
    else if (document.implementation && document.implementation.createDocument) {
        tXmlDoc = document.implementation.createDocument("", "", null);
        // for safari,opera
        if (!tXmlDoc.load) {
            tXmlDoc.async = true;
            tXmlDoc.hp = new XMLHttpRequest();
            if (tXmlDoc.hp.overrideMimeType) {
                tXmlDoc.hp.overrideMimeType("text/xml"); //Mozilla
            }
            tXmlDoc.onload = function () { };
            tXmlDoc.hp.hpOwner = tXmlDoc;

            tXmlDoc.hp.load = function (sUrl) {
                if (this.hpOwner.async) {
                    this.hpOwner.hp.onreadystatechange = function () {
                        if (this.readyState == 4) {
                            var result = this.responseXML;

                            while (this.hpOwner.hasChildNodes()) {
                                this.hpOwner.removeChild(this.hpOwner.lastChild);
                            }
                            for (var i = 0; i < result.childNodes.length; i++) {
                                this.hpOwner.appendChild(this.hpOwner.importNode(result.childNodes[i], true));
                            }
                            this.hpOwner.onload = 1; alert(this.hpOwner.onload);
                            if (this.hpOwner.onload)	   //safari no onload   
                                this.hpOwner.onload(result);
                        }
                    };
                }
                try {
                    this.open("GET", sUrl, this.hpOwner.async);
                    this.send(null);
                }
                catch (ex) {
                    //throw "you can't connect the page using different domain,if you not config the Server-Side code";
                }
                if (!this.hpOwner.async) {
                    var result = this.responseXML;

                    while (this.hpOwner.hasChildNodes()) {
                        this.hpOwner.removeChild(this.hpOwner.lastChild);
                    }
                    for (var i = 0; i < result.childNodes.length; i++) {
                        this.hpOwner.appendChild(this.hpOwner.importNode(result.childNodes[i], true));
                    }
                }
            };
            tXmlDoc.load = function (sUrl) {
                tXmlDoc.hp.load(sUrl);
            };
        }
        // apply to ie
        tXmlDoc.onreadystatechange = function () { };
        //tXmlDoc.readyState = 4;  // because other browers not this property
        tXmlDoc.onload = function (s) {
            if (tXmlDoc.hp) {
                var result = s;
                while (this.hasChildNodes()) {
                    this.removeChild(this.lastChild);
                }
                for (var i = 0; i < result.childNodes.length; i++) {
                    this.appendChild(this.importNode(result.childNodes[i], true));
                }
            }
            this.readyState = 4;
            this.onreadystatechange(s);
        };

        tXmlDoc.getXml = function (node) {
            var oNode = (node == null) ? this : node;
            if (IS_IE) {
                return oNode.xml;
            } else {
                var oSerializer = new XMLSerializer();
                return oSerializer.serializeToString(oNode);
            }
        };
        tXmlDoc.getText = function (node) {
            var oNode = (node == null) ? this : node;
            if (IS_IE) {
                return oNode.text;
            } else {
                var sText = "";
                for (var i = 0; i < oNode.childNodes.length; i++) {
                    if (oNode.childNodes[i].hasChildNodes()) {
                        sText += this.getText(oNode.childNodes[i]);
                    } else {
                        sText += oNode.childNodes[i].nodeValue;
                    }
                }
                return sText;
            }
        };
        if (document.implementation.hasFeature("XPath", "3.0")) {
            // prototying the XMLDocument
            tXmlDoc.selectNodes = function (cXPathString, xNode) {
                if (!xNode) { xNode = this; }
                var oNSResolver = this.createNSResolver(this.documentElement);
                var aItems = this.evaluate(cXPathString, xNode, oNSResolver,
                           XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                var aResult = [];
                for (var i = 0; i < aItems.snapshotLength; i++) {
                    aResult[i] = aItems.snapshotItem(i);
                }
                return aResult;
            };
            // prototying the XMLDocument
            tXmlDoc.selectSingleNode = function (cXPathString, xNode) {
                if (!xNode) { xNode = this; }
                var xItems = this.selectNodes(cXPathString, xNode);
                if (xItems.length > 0) {
                    return xItems[0];
                } else {
                    return null;
                }
            };
        };
        //apply load xml string funciton
        tXmlDoc.loadXML = function (s) {
            var doc2 = (new DOMParser()).parseFromString(s, "text/xml");
            var roottag = doc2.documentElement;
            if ((roottag.tagName == "parserError") || (roottag.namespaceURI == "http://www.mozilla.org/newlayout/xml/parsererror.xml")) {
                var sourceText = roottag.lastChild.firstChild.nodeValue;
                throw ("load XML by string happen error,error detail:\n" + roottag.firstChild.nodeValue + "\n" + sourceText);
                return false;
            }
            while (this.hasChildNodes()) {
                this.removeChild(this.lastChild);
            }
            for (var i = 0; i < doc2.childNodes.length; i++) {
                this.appendChild(this.importNode(doc2.childNodes[i], true));
            }
            this.onreadystatechange();
        };
    }
    if (!tXmlDoc) {
        throw ("Can not create xml doc object!");
    }

    if (!IS_IE) {
        tXmlDoc.transformNode = function (sXsltObj) {
            var xslt = new XSLTProcessor();
            xslt.importStylesheet(sXsltObj);
            var outerHTMLObj = xslt.transformToFragment(this, document);
            var divEl = document.createElement("div");
            divEl.appendChild(outerHTMLObj);
            var outerHTML = divEl.innerHTML;
            return outerHTML;
        };
        tXmlDoc.setProperty = function () { };
    }
    return tXmlDoc;
};

//=============================================================================
// jetsennet.util
//=============================================================================	 
jetsennet.registerNamespace("jetsennet.util");

/**
去除前后空格
*/
jetsennet.util.trim = function (str) {
    if (str == null)
        return "";

    str = String(str);
    var reg = /^\s*/;
    str = str.replace(reg, "");
    reg = /\s*$/;
    str = str.replace(reg, "");
    return str;
};
/**
去除后空格
*/
jetsennet.util.trimEnd = function (str, reg) {
    if (str == null)
        return "";

    str = String(str);
    reg = reg ? reg : "\s";
    var newReg = new RegExp("" + reg + "$", "i");
    str = str.replace(newReg, "");
    return str;
};
/**
去除前空格
*/
jetsennet.util.trimStart = function (str, reg) {
    if (str == null)
        return "";

    reg = reg ? reg : "\s";
    str = String(str);
    var newReg = new RegExp("^" + reg + "", "i");
    str = str.replace(newReg, "");
    return str;
};
/**
是否空或""
*/
jetsennet.util.isNullOrEmpty = function (str) {
    return jetsennet.util.trim(str) == "" ? true : false;
};
/**
填充左边
*/
jetsennet.util.padLeft = function (str, len, c) {
    var padChar = (c && c.length > 0) ? c.charAt(0) : " ";
    var resultVal = new String(str);
    while (resultVal.length < len) {
        resultVal = padChar + resultVal;
    }
    return resultVal;
};
/**
填充右边
*/
jetsennet.util.padRight = function (str, len, c) {
    var padChar = (c && c.length > 0) ? c.charAt(0) : " ";
    var resultVal = new String(str);
    while (resultVal.length < len) {
        resultVal = resultVal + padChar;
    }
    return resultVal;
};
/**
取右边指定个数字串
*/
jetsennet.util.right = function (str, len) {
    if (jetsennet.util.isNullOrEmpty(str))
        return "";

    var resultVal = new String(str);
    if (resultVal.length <= len) {
        return resultVal;
    }
    return resultVal.substring(resultVal.length - len);
};
/**
取左边指定个数字串
*/
jetsennet.util.left = function (str, len) {
    if (jetsennet.util.isNullOrEmpty(str))
        return "";

    var resultVal = new String(str);
    if (resultVal.length <= len) {
        return resultVal;
    }
    return resultVal.substring(0, len);
};
jetsennet.util.isEmail = function (/*string*/email) {
    if (jetsennet.util.isNullOrEmpty(email))
        return false;

    var reg = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;
    return (email.search(reg) != -1);
};
jetsennet.util.isUrl = function (/*string*/url) {
    if (jetsennet.util.isNullOrEmpty(url))
        return false;

    var reg = /^(http(s)?:\/\/)?([\w-]+\.)+[\w-]+(:\d+)?(\/[\w- .\/?%&=#]*)?$/i;
    return (url.search(reg) != -1);
};
jetsennet.util.isInt = function (str) {
    if (jetsennet.util.isNullOrEmpty(str))
        return false;
    var number = "0123456789";
    for (var i = 0; i < str.length; i++) {
        if (i == 0 && (str.charAt(0) == "-" || str.charAt(0) == "+"))
            continue;
        if (number.indexOf(str.charAt(i)) == -1) {
            return false;
        }
    }
    return true;
};
jetsennet.util.isABCAndN = function (/*string*/str) {
    if (jetsennet.util.isNullOrEmpty(str))
        return false;
    var ABC = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-";
    for (var i = 0; i < str.length; i++) {
        if (ABC.indexOf(str.charAt(i)) == -1) {
            return false;
        }
    }
    return true;
};
/**
格式化文件名称，去除特殊字符
*/
jetsennet.util.formatFileName = function (/*string*/fileName) {
    if (fileName == null)
        return "";
    return new String(fileName).replace(/[\\|\/|\||\?|\:|\*|\<|\>|\"]/g, "");
};
/**
格式化文件路径，将/\统一成一种
*/
jetsennet.util.formatFilePath = function (/*string*/filePath, /*bool*/isApplePath) {
    if (filePath == null)
        return "";
    return isApplePath ? new String(filePath).replace(/\\/g, "/") : new String(filePath).replace(/\//g, "\\");
};
/**
获取文件路径
*/
jetsennet.util.getFilePath = function (/*string*/filePath, /*bool*/removeEndSplitChar) {
    if (filePath == null)
        return "";
    filePath = new String(filePath);
    if (filePath.lastIndexOf(".") < 0)
        return filePath;
    var index = filePath.lastIndexOf("/");
    if (index < 0)
        index = filePath.lastIndexOf("\\");
    if (index > 0) {
        index = (removeEndSplitChar == null || removeEndSplitChar == true) ? index : (index + 1);
        return filePath.substr(0, index);
    }
    return filePath;
};
/**
获取文件名
*/
jetsennet.util.getFileName = function (/*string*/filePath) {
    if (filePath == null)
        return "";
    filePath = new String(filePath);
    if (filePath.lastIndexOf(".") < 0)
        return "";
    var index = filePath.lastIndexOf("/");
    if (index < 0)
        index = filePath.lastIndexOf("\\");
    if (index >= 0)
        return filePath.substr(index + 1);
    return filePath;
};
/**
替换文件路径,文件路径的格式以目的路径格式为准
*/
jetsennet.util.replacePath = function (fileName, replacePath, destPath) {
    if (jetsennet.util.isNullOrEmpty(replacePath) || jetsennet.util.isNullOrEmpty(fileName) || destPath == null)
        return fileName;

    var bAppleSourcePath = fileName.lastIndexOf("/") >= 0;
    var bAppleDestPath = destPath.lastIndexOf("/") >= 0;
    var lowcaseFileName = jetsennet.util.formatFilePath(fileName, true).toLowerCase();
    var lowcaseReplacePath = jetsennet.util.formatFilePath(replacePath, true).toLowerCase();

    if (lowcaseFileName.indexOf(lowcaseReplacePath) >= 0) {
        fileName = jetsennet.util.formatFilePath(fileName, true);
        fileName = fileName.replace(new RegExp(lowcaseReplacePath, "img"), destPath);
        fileName = jetsennet.util.formatFilePath(fileName, bAppleDestPath)
    }
    return fileName;
};
jetsennet.util.convertTimeToLong = function (timestamp, frameRate) {
    if (timestamp == null || timestamp.indexOf(":") < 0)
        return timestamp;
    frameRate = frameRate ? frameRate : 25;
    try {
        var aTime = timestamp.split(":");
        var result = 0;

        for (var i = 0; i < aTime.length; i++) {
            if (i < 3)
                result += parseInt(aTime[i], 10) * frameRate * Math.pow(60, 2 - i);
            else
                result += parseInt(aTime[i], 10);
        }
        return parseInt(result);
    }
    catch (ex) {
        return 0;
    }
};
jetsennet.util.convertLongToTime = function (frames, frameRate, ignoreFrame) {
    frameRate = frameRate ? frameRate : 25;

    var m = frames / (3600 * frameRate);
    m = m < 1 ? 0 : parseInt(m);
    var m1 = String(m);
    if (m1.length == 1) {
        m1 = "0" + m1;
    }
    var n = parseInt((frames / (60 * frameRate)) % 60);
    var n1 = String(n);
    if (n1.length == 1) {
        n1 = "0" + n1;
    }
    var x = parseInt((frames / frameRate) % 60);
    var x1 = String(x);
    if (x1.length == 1) {
        x1 = "0" + x1;
    }
    var y = parseInt(frames % frameRate);
    var y1 = String(y);
    if (y1.length == 1) {
        y1 = "0" + y1;
    }
    if (y1.length == 2 && frameRate == 1000) {
        y1 = "0" + y1;
    }
    var result = m1 + ":" + n1 + ":" + x1;
    if (!ignoreFrame)
        result += ":" + y1;
    return result;
};
jetsennet.util.displayElements = function (items, bDisplay) {
    for (var i = 0; i < items.length; i++) {
        var item = el(items[i]);
        if (item) {
            item.style.display = bDisplay ? "" : "none";
        }
    }
};
jetsennet.util.clearElements = function (items) {
    for (var i = 0; i < items.length; i++) {
        var item = el(items[i]);
        if (item && item.innerHTML) {
            item.innerHTML = "";
        }
    }
};
jetsennet.util.setClassName = function (element, cssName) {
    var obj = el(element);
    if (obj == null || cssName == null)
        return;
    if (obj.className != cssName)
        obj.className = cssName;
};
/*
<div class="jetsen-tabs">
<ul class="jetsen-tabul">
<li class="jetsen-tabon" onclick="jetsennet.util.tabpaneEvent(this);">题名/主题</li>   
</ul>
<div class="jetsen-tab">
<div class="jetsen-tabbodyon"></div>
</div>
*/
jetsennet.util.tabpaneEvent = function (itemElement, contentElement, cssNameHead) {
    var cssNameHead = cssNameHead ? cssNameHead : "jetsen-tab";
    var currentItem = (typeof itemElement == "String") ? el(itemElement) : itemElement;
    var tabHead = currentItem.parentNode;
    var tabpanel = tabHead.parentNode;
    var tabBody = contentElement ? el(contentElement) : tabHead.nextSibling;

    while (tabBody != null && tabBody.innerHTML == null) {
        tabBody = tabBody.nextSibling;
    }

    if (tabpanel == null || tabBody == null)
        return;

    for (var i = 0; i < tabHead.childNodes.length; i++) {
        if (tabHead.childNodes[i] == currentItem) {
            jetsennet.util.setClassName(tabHead.childNodes[i], cssNameHead + "on");
            jetsennet.util.setClassName(tabBody.childNodes[i], cssNameHead + "bodyon");
        }
        else {
            jetsennet.util.setClassName(tabHead.childNodes[i], cssNameHead + "off");
            jetsennet.util.setClassName(tabBody.childNodes[i], cssNameHead + "bodyoff");
        }
    }
};
jetsennet.util.parseInt = function (val, defaultVal) {
    if (val == null || val == "")
        return defaultVal;

    var resultVal = parseInt(val);
    return isNaN(resultVal) ? defaultVal : resultVal;
};
jetsennet.util.isMouseInPosition = function (refElement) {
    var mPos = jetsennet.util.getMousePosition();
    return jetsennet.util.isInPosition(mPos, refElement);
};
jetsennet.util.isInPosition = function (mPos, refElement) {
    var leftTop = jetsennet.util.getPosition(refElement, 0);
    var rightBottom = jetsennet.util.getPosition(refElement, 3);

    return mPos.left >= leftTop.left && mPos.left < rightBottom.left &&
    mPos.top >= leftTop.top && mPos.top < rightBottom.top;
};
jetsennet.util.getMousePosition = function () {
    var evt = jetsennet.getEvent();
    evt = jQuery.event.fix(evt);//用jquery解决跨浏览器问题
    return { left: evt.pageX, top: evt.pageY };
};
//0 left ,top
//1 left ,bottom
//2 right,top
//3 right,bottom
jetsennet.util.getPosition = function (refElement, /*0,1,2,3*/position) {
    var elm = $(refElement ? refElement : document.body);
    var top = elm.offset().top;//用jquery解决跨浏览器问题
    var left = elm.offset().left;
    var isLeft = (position == 0 || position == 1);
    var isTop = (position == 0 || position == 2);
    if (!isLeft) {
        left += elm.outerWidth();
    }
    if (!isTop) {
        top += elm.outerHeight();
    }
    var controlPos = {top:top, left:left};
    return controlPos;
};
jetsennet.util.getScrolls = function (refElement, includeSelf) {
    var curElement = refElement ? refElement : document.body;
    var width = 0;
    var height = 0;
    for (var el = includeSelf ? curElement : curElement.parentNode; el; el = el.parentNode) {
        if (el.scrollLeft) {
            width = width + el.scrollLeft;
        }
        if (refElement && el.tagName == "BODY") {
            break;
        }
    }
    for (var el = includeSelf ? curElement : curElement.parentNode; el; el = el.parentNode) {
        if (el.scrollTop) {
            height = height + el.scrollTop;
        }

        if (refElement && el.tagName == "BODY") {
            break;
        }
    }
    return { "width": width, "height": height };
};
jetsennet.util.getWindowViewSize = function () {
    var height = 768, width = 1024;
    var initCon = document.body;
    for (var el = initCon; el; el = el.parentNode) {
        if (el.clientHeight > 0) {
            height = el.scrollTop + el.clientHeight;
        }
    }
    for (var el = initCon; el; el = el.parentNode) {
        if (el.clientWidth > 0) {
            width = el.scrollLeft + el.clientWidth;
        }
    }
    return { "height": height, "width": width };
};
jetsennet.util.getWindowSize = function () {
    var height = 768, width = 1024;
    var initCon = document.body;
    for (var el = initCon; el; el = el.parentNode) {
        if (el.clientHeight > 0) {
            height = el.scrollHeight > el.clientHeight ? el.scrollHeight : el.clientHeight;
        }
    }
    for (var el = initCon; el; el = el.parentNode) {
        if (el.clientWidth > 0) {
            width = el.scrollWidth > el.clientWidth ? el.scrollWidth : el.clientWidth;
        }
    }
    return { "height": height, "width": width };
};
jetsennet.util.getWindowScrollSize = function () {
    var height = 0, width = 0;
    var initCon = document.body;

    for (var el = initCon; el; el = el.parentNode) {
        if (el.clientHeight > 0) {
            height += el.scrollTop;
        }
    }
    for (var el = initCon; el && el.clientWidth > 0; el = el.parentNode) {
        if (el.clientWidth > 0) {
            width += el.scrollLeft;
        }
    }
    return { "height": height, "width": width };
};
jetsennet.util.getCenterScreenPosition = function (/*Element*/con) {
    var el, _top = 100, _left = 100;
    var initCon = document.body;
    for (var el = initCon; el; el = el.parentNode) {
        if (el.clientHeight > 0) {
            _top = el.scrollTop + (el.clientHeight - con.offsetHeight) / 2;
        }
    }
    for (var el = initCon; el; el = el.parentNode) {
        if (el.clientWidth > 0) {
            _left = el.scrollLeft + (el.clientWidth - con.offsetWidth) / 2;
        }
    }
    return { "left": parseInt(_left), "top": parseInt(_top) };
};
//当前样式
jetsennet.util.getCurrentStyle = function (element) {
    if (element.currentStyle) {
        return element.currentStyle;
    }
    else if (document.defaultView) {
        return document.defaultView.getComputedStyle(element, null);
    }
    return null;
};
//边缘大小
jetsennet.util.getControlEdgeSize = function (element) {
    element = el(element);
    if (element == null)
        return { top: 0, left: 0, right: 0, bottom: 0 };

    var bTop = 0, bBottom = 0, mTop = 0, mBottom = 0, pTop = 0, pBottom = 0;
    var bLeft = 0, bRight = 0, mLeft = 0, mRight = 0, pLeft = 0, pRight = 0;
    var currentStyle = jetsennet.util.getCurrentStyle(element);

    bTop = jetsennet.util.parseInt(currentStyle.borderTopWidth, 0);
    bBottom = jetsennet.util.parseInt(currentStyle.borderBottomWidth, 0);
    mTop = jetsennet.util.parseInt(currentStyle.marginTop, 0);
    mBottom = jetsennet.util.parseInt(currentStyle.marginBottom, 0);
    pTop = jetsennet.util.parseInt(currentStyle.paddingTop, 0);
    pBottom = jetsennet.util.parseInt(currentStyle.paddingBottom, 0);

    bLeft = jetsennet.util.parseInt(currentStyle.borderLeftWidth, 0);
    bRight = jetsennet.util.parseInt(currentStyle.borderRightWidth, 0);
    mLeft = jetsennet.util.parseInt(currentStyle.marginLeft, 0);
    mRight = jetsennet.util.parseInt(currentStyle.marginRight, 0);
    pLeft = jetsennet.util.parseInt(currentStyle.paddingLeft, 0);
    pRight = jetsennet.util.parseInt(currentStyle.paddingRight, 0);

    return {
        paddingLeft: pLeft,
        marginLeft: mLeft,
        borderLeft: bLeft,
        paddingRight: pRight,
        marginRight: mRight,
        borderRight: bRight,
        paddingTop: pTop,
        marginTop: mTop,
        borderTop: bTop,
        paddingBottom: pBottom,
        marginBottom: mBottom,
        borderBottom: bBottom,
        top: bTop + mTop + pTop,
        left: bLeft + mLeft + pLeft,
        right: bRight + mRight + pRight,
        bottom: bBottom + mBottom + pBottom,
        borderWidth: bLeft + bRight,
        borderHeight: bTop + bBottom,
        marginWidth: mLeft + mRight,
        marginHeight: mTop + mBottom
    };
};
jetsennet.util.getControlSize = function (element) {

    element = el(element);
    if (element == null)
        return { top: 0, left: 0, right: 0, bottom: 0, offsetWidth: 0, offsetHeight: 0, innerWidth: 0, innerHeight: 0, clientWidth: 0, clientHeight: 0, viewWidth: 0, viewHeight: 0 };
    var size = { offsetWidth: element.offsetWidth, offsetHeight: element.offsetHeight, clientWidth: element.clientWidth, clientHeight: element.clientHeight, scrollHeight: element.scrollHeight, scrollWidth: element.scrollWidth };
    jQuery.extend(size, jetsennet.util.getControlEdgeSize(element));
    size.innerWidth = Math.max(size.offsetWidth - (size.left + size.right), 0);
    size.innerHeight = Math.max(size.offsetHeight - (size.top + size.bottom), 0);
    size.viewWidth = size.clientWidth + (size.borderLeft + size.borderRight);
    size.viewHeight = size.clientHeight + (size.borderTop + size.borderBottom);
    return size;
};
/**
* @example jetsennet.util.cookie('the_cookie', 'the_value', { expires: 7, path: '/', domain: 'jetsen.com', secure: true });
* @example jetsennet.util.cookie('the_cookie', 'the_value');
* @example jetsennet.util.cookie('the_cookie', null); 
* @example jetsennet.util.cookie('the_cookie');
*/
jetsennet.util.cookie = function (name, value, options) {

    if (typeof value != 'undefined') { // name and value given, set cookie
        options = jQuery.extend({ path: "/" }, options);
        if (value === null || value == "") {
            value = '';
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toGMTString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toGMTString(); // use expires attribute, max-age is not supported by IE            
        }

        var path = options.path ? '; path=' + (options.path) : '';
        var domain = options.domain ? '; domain=' + (options.domain) : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else { // only name given, get cookie
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jetsennet.util.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue ? cookieValue : "";
    }
};
/*
Array moveArray(....)
moveArray([0,1,2,3],1,2)=>[0,1,2,3] 
moveArray([0,1,2,3],1,3)=>[0,2,1,3]
moveArray([0,1,2,3],1,0)=>[1,0,2,3]
*/
jetsennet.util.moveArray = function (/*Array*/array, /*int*/oIndex, /*int*/nIndex, /*bool*/isInertAfter) {
    if (oIndex == nIndex) {
        return array;
    }
    var newArray = new Array();
    if (isInertAfter && nIndex == -1) { newArray.push(array[oIndex]); }
    for (var i = 0; i < array.length; i++) {
        if (i == oIndex) { continue; }
        if (!isInertAfter) {
            if (i == nIndex) { newArray.push(array[oIndex]); }
            newArray.push(array[i]);
        }
        else {
            newArray.push(array[i]);
            if (i == nIndex) { newArray.push(array[oIndex]); }
        }
    }
    if (!isInertAfter && nIndex == array.length) { newArray.push(array[oIndex]); }
    return newArray;
};
//=============================================================================
// jetsennet.util.Guid
//-----------------------------------------------------------------------------
jetsennet.util.Guid = function (b) {

    this.__typeName = "jetsennet.util.Guid";
    this.bytes = new Array;
    // bytes array have different order as represented in hex string.
    this.byteOrder = [3, 2, 1, 0, 5, 4, 7, 6, 8, 9, 10, 11, 12, 13, 14, 15];
    //---------------------------------------------------------
    // METHOD: ToString.
    //---------------------------------------------------------
    this.ToString = function (format) {
        // Format (default is D):
        // N: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
        // D: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
        // B: {xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx}
        // P: (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
        format = format ? format : "D";
        var addHyphens = ("DBP".indexOf(format) > -1);
        var guid = new String;
        for (var i = 0; i < 16; i++) {
            if (addHyphens) {
                guid += (i == 4 || i == 6 || i == 8 || i == 10 ? "-" : "");
            }
            var pos = this.byteOrder[i];
            guid += this.numberToHex(this.bytes[pos]);
        }
        if (format == "B") { guid = "{" + guid + "}"; }
        if (format == "P") { guid = "(" + guid + ")"; }
        return guid;
    };
    this.toString = this.ToString;
    this.numberToHex = function (value) {
        var hex = ((value <= 0xF) ? "0" : "");
        hex += value.toString(16);
        return hex;
    };
    this.initialize = function () {
        this.bytes = new Array();
        // Create guid by type of value.
        var a0 = arguments[0];
        switch (typeof (a0)) {
            case "null":
            case "undefined":
                for (var i = 0; i < 16; i++) this.bytes.push(0);
                break;
            case "object":
                // Get first 16 elements of array as bytes.
                for (var i = 0; i < 16; i++) {
                    this.bytes.push(a0[i]);
                }
                break;
            default:
                break;
        }
    };
    this.initialize.apply(this, arguments);
};
jetsennet.util.Guid.newGuid = jetsennet.util.Guid.NewGuid = function () {

    var bytes = new Array();
    for (var i = 0; i < 16; i++) {
        var dec = Math.floor(Math.random() * 0xFF);
        bytes.push(dec);
    }
    var guid = new jetsennet.util.Guid(bytes);
    return guid;
};

//=============================================================================
// jetsennet.util.ArrayList
//=============================================================================
jetsennet.util.ArrayList = function () {
    this.__typeName = "jetsennet.util.ArrayList";
    this.aList = []; //initialize with an empty array
};
jetsennet.util.ArrayList.prototype.getCount = function () {
    return this.aList.length;
};
jetsennet.util.ArrayList.prototype.add = function (object) {
    return this.aList.push(object); //Object are placed at the end of the array
};
jetsennet.util.ArrayList.prototype.getAt = function (index) //Index must be a number
{
    var m_count = this.aList.length;
    if (index > -1 && index < m_count) {
        return this.aList[index];
    }
    else {
        return undefined; //Out of bound array, return undefined
    }
};
jetsennet.util.ArrayList.prototype.clear = function () {
    this.aList = [];
};
jetsennet.util.ArrayList.prototype.removeAt = function (index) // index must be a number
{
    var m_count = this.aList.length;
    if (m_count > 0 && index > -1 && index < this.aList.length) {
        switch (index) {
            case 0:
                this.aList.shift();
                break;
            case m_count - 1:
                this.aList.pop();
                break;
            default:
                var head = this.aList.slice(0, index);
                var tail = this.aList.slice(index + 1);
                this.aList = head.concat(tail);
                break;
        }
    }
};
jetsennet.util.ArrayList.prototype.insert = function (object, index) {
    var m_count = this.aList.length;
    var m_returnValue = -1;
    if (index > -1 && index <= m_count) {
        switch (index) {
            case 0:
                this.aList.unshift(object);
                m_returnValue = 0;
                break;
            case m_count:
                this.aList.push(object);
                m_returnValue = m_count;
                break;
            default:
                var head = this.aList.slice(0, index);
                var tail = this.aList.slice(index);
                tail.unshift(object);
                this.aList = head.concat(tail);
                m_returnValue = index;
                break;
        }
    }
    return m_returnValue;
};
jetsennet.util.ArrayList.prototype.indexOf = function (object, startIndex) {
    var m_count = this.aList.length;
    var m_returnValue = -1;
    if (startIndex > -1 && startIndex < m_count) {
        var i = startIndex;
        while (i < m_count) {
            if (this.aList[i] == object) {
                m_returnValue = i;
                break;
            }
            i++;
        }
    }
    return m_returnValue;
};
jetsennet.util.ArrayList.prototype.lastIndexOf = function (object, startIndex) {
    var m_count = this.aList.length;
    var m_returnValue = -1;

    if (startIndex > -1 && startIndex < m_count) {
        var i = m_count - 1;
        while (i >= startIndex) {
            if (this.aList[i] == object) {
                m_returnValue = i;
                break;
            }

            i--;
        }
    }
};

jetsennet.util.Base64Array = function () {
    this.S = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    this.CA = new Array();
    this.IA = new Array();
    this.initializeClass = function () {
        var c = new String;
        for (var i = 0; i < this.S.length; i++) {
            c = this.S.charAt(i);
            this.CA[i] = c;
            this.IA[c] = i;
        }
    };
    this.initializeClass();
};
/// <param type="byte[]" name="b">An array of 8-bit unsigned integers.</param>
/// <param type="bool" name="wrap">Wrap base64 string with '\r\n' separator.</param>
jetsennet.util.toBase64String = function (b, wrap) {
    var B64 = new jetsennet.util.Base64Array();
    // Check special case
    var bLen = (b) ? b.length : 0;
    if (bLen == 0) { return new Array(0); }
    // Length of even 24-bits.
    var eLen = Math.floor(bLen / 3) * 3;
    // Returned character count.
    var cCnt = ((bLen - 1) / 3 + 1) << 2;
    var dLen = cCnt + (wrap ? (cCnt - 1) / 76 << 1 : 0); // Length of returned array
    var dArr = new Array(dLen);
    // Encode even 24-bits.
    for (var s = 0, d = 0, cc = 0; s < eLen; ) {
        // Copy next three bytes into lower 24 bits of int, paying attension to sign.
        var i = (b[s++] & 0xff) << 16 | (b[s++] & 0xff) << 8 | (b[s++] & 0xff);
        // Encode the int into four chars.
        dArr[d++] = B64.CA[(i >>> 18) & 0x3f];
        dArr[d++] = B64.CA[(i >>> 12) & 0x3f];
        dArr[d++] = B64.CA[(i >>> 6) & 0x3f];
        dArr[d++] = B64.CA[i & 0x3f];
        // Add optional line separator as specified in RFC 2045.
        if (wrap && ++cc == 19 && d < dLen - 2) {
            dArr[d++] = '\r';
            dArr[d++] = '\n';
            cc = 0;
        }
    }
    // Pad and encode last bits if source isn't even 24 bits.
    var left = bLen - eLen; // 0 - 2.
    if (left > 0) {
        // Prepare the int.
        var i = ((b[eLen] & 0xff) << 10) | (left == 2 ? ((b[bLen - 1] & 0xff) << 2) : 0);
        // Set last four chars.
        dArr[dLen - 4] = B64.CA[i >> 12];
        dArr[dLen - 3] = B64.CA[(i >>> 6) & 0x3f];
        dArr[dLen - 2] = (left == 2) ? B64.CA[i & 0x3f] : '=';
        dArr[dLen - 1] = '=';
    }
    return dArr.join("");
};
///<param type="string" name="s">A string.</param>
///<param type="bool" name="fix">Fix base64 string by removing all ilegal chars.</param>
jetsennet.util.fromBase64String = function (s, fix) {
    var B64 = new jetsennet.util.Base64Array();
    // Check special case
    if (fix) {
        // Remove illegal chars
        var regex = new RegExp("[^" + B64.S + "]", "g");
        s = s.replace(regex, "");
    }
    var sLen = s.length;
    if (sLen == 0) return new Array(0);
    // Start and end index after trimming.
    var sIx = 0, eIx = sLen - 1;
    // Get the padding count (=) (0, 1 or 2).
    var pad = s.charAt(eIx) == '=' ? (s.charAt(eIx - 1) == '=' ? 2 : 1) : 0;  // Count '=' at end.
    // Content count including possible separators.
    var cCnt = eIx - sIx + 1;
    var sepLn = (s.charAt(76) == '\r') ? (cCnt / 78) : 0;
    var sepCnt = sLen > 76 ? (sepLn << 1) : 0;
    // The number of decoded bytes.
    var len = ((cCnt - sepCnt) * 6 >> 3) - pad;
    // Preallocate byte[] of exact length.
    var bytes = new Array(len);
    // Decode all but the last 0 - 2 bytes.
    var d = 0;
    var eLen = Math.floor(len / 3) * 3;
    for (var cc = 0; d < eLen; ) {
        // Assemble three bytes into an var from four "valid" characters.
        var i = B64.IA[s.charAt(sIx++)] << 18 |
			B64.IA[s.charAt(sIx++)] << 12 |
			B64.IA[s.charAt(sIx++)] << 6 |
			B64.IA[s.charAt(sIx++)];
        // Add the bytes
        bytes[d++] = (i >> 16);
        bytes[d++] = ((i & 0xFFFF) >> 8);
        bytes[d++] = (i & 0xFF);
        // If line separator, jump over it.
        if (sepCnt > 0 && ++cc == 19) {
            sIx += 2;
            cc = 0;
        }
    }
    if (d < len) {
        // Decode last 1-3 bytes (incl '=') into 1-3 bytes.
        var i = 0;
        for (var j = 0; sIx <= (eIx - pad); j++) {
            i |= B64.IA[s.charAt(sIx++)] << (18 - j * 6);
        }
        for (var r = 16; d < len; r -= 8) {
            var cropBits = Math.pow(2, r + 8) - 1;
            bytes[d++] = ((i & cropBits) >> r);
        }
    }
    return bytes;
};
jetsennet.util.UTF8Encoder = function () {
    //---------------------------------------------------------
    // Public properties.
    this.Type = "jetsennet.util.UTF8Encoder";
    //---------------------------------------------------------
    // Private properties.
    var me = this;
    //---------------------------------------------------------
    this.getBytes = function (s) {
        /// <summary>
        /// Get array of bytes.
        /// </summary>
        var bytes = new Array();
        var c = new Number;
        for (var i = 0; i < s.length; i++) {
            c = s.charCodeAt(i);
            // Convert char code to bytes.
            if (c < 0x80) {
                bytes.push(c);
            } else if (c < 0x800) {
                bytes.push(0xC0 | c >> 6);
                bytes.push(0x80 | c & 0x3F);
            } else if (c < 0x10000) {
                bytes.push(0xE0 | c >> 12);
                bytes.push(0x80 | c >> 6 & 0x3F);
                bytes.push(0x80 | c & 0x3F);
            } else if (c < 0x200000) {
                bytes.push(0xF0 | c >> 18);
                bytes.push(0x80 | c >> 12 & 0x3F);
                bytes.push(0x80 | c >> 6 & 0x3F);
                bytes.push(0x80 | c & 0x3F);
            } else {
                // If char is unknown then push "?".
                bytes.push(0x3F);
            }
        }
        return bytes;
    };
    //---------------------------------------------------------
    this.getString = function (bytes) {
        /// <summary>
        /// Get string from array of bytes.
        /// </summary>
        var s = new String;
        var b = new Number;
        var b1 = new Number;
        var b2 = new Number;
        var b3 = new Number;
        var b4 = new Number;
        var bE = new Number;
        var ln = bytes.length;
        for (var i = 0; i < ln; i++) {
            b = bytes[i];
            if (b < 0x80) {
                // Char represended by 1 byte.
                s += (b > 0) ? String.fromCharCode(b) : "";
            } else if (b < 0xC0) {
                // Byte 2,3,4 of unicode char.
            } else if (b < 0xE0) {
                // Char represended by 2 bytes.
                if (ln > i + 1) {
                    b1 = (b & 0x1F); i++;
                    b2 = (bytes[i] & 0x3F);
                    bE = (b1 << 6) | b2;
                    s += String.fromCharCode(bE);
                }
            } else if (b < 0xF0) {
                // Char represended by 3 bytes.
                if (ln > i + 2) {
                    b1 = (b & 0xF); i++;
                    b2 = (bytes[i] & 0x3F); i++;
                    b3 = (bytes[i] & 0x3F);
                    bE = (b1 << 12) | (b2 << 6) | b3;
                    s += String.fromCharCode(bE);
                }
            } else if (b < 0xF8) {
                // Char represended by 4 bytes.
                if (ln > i + 3) {
                    b1 = (b & 0x7); i++;
                    b2 = (bytes[i] & 0x3F); i++;
                    b3 = (bytes[i] & 0x3F); i++;
                    b4 = (bytes[i] & 0x3F);
                    bE = (b1 << 18) | (b2 << 12)(b3 << 6) | b4;
                    s += String.fromCharCode(bE);
                }
            } else {
                s += "?";
            }
        }
        return s;
    };
    //---------------------------------------------------------
    this.initializeClass = function () {
    };
    this.initializeClass();
};

// Make it static.
jetsennet.util.UTF8 = new jetsennet.util.UTF8Encoder();

jetsennet.util.utf8ToBase64String = function (s) {
    var bytes = jetsennet.util.UTF8.getBytes(s);
    return jetsennet.util.toBase64String(bytes);
};

jetsennet.util.base64StringToUTF8 = function (s) {
    var bytes = jetsennet.util.fromBase64String(s);
    return jetsennet.util.UTF8.getString(bytes);
};

//=============================================================================
// jetsennet.form.validate
//=============================================================================	 
jetsennet.registerNamespace("jetsennet.form");
jetsennet.form.validateResult = 0;
jetsennet.form.validateErrorBorderColor = "#993366";
jetsennet.form.validateErrorBgColor = ""; //"#ffe4e1";

/**
验证
只列出一些简单的验证，使用时进行扩展
name:验证类型，写在input的validatetype属性中
onvalidate:验证方法
message:验证提示
*/
jetsennet.validateOptions = [
    { name: "notempty", onvalidate: function (element) { return !jetsennet.util.isNullOrEmpty(element.value.trim()); }, message: "不能为空值" },
    { name: "datetime,date", onvalidate: function (element) {
        jetsennet.require("datetime");
        return jetsennet.util.isNullOrEmpty(element.value) || jetsennet.DateTime.isDate(element.value);
    }, message: "必须为日期(yyyy-MM-dd)"
    },
    { name: "integer,int", onvalidate: function (element, val) { return jetsennet.util.isNullOrEmpty(val) || jetsennet.util.isInt(val); }, message: "必须为整数" },
    { name: "uinteger", onvalidate: function (element, val) { return jetsennet.util.isNullOrEmpty(val) || /^\d*$/.test(val); }, message: "必须为无符号的整数" },
    { name: "double,float,money,numeric", onvalidate: function (element, val) { return jetsennet.util.isNullOrEmpty(val) || /^-?\d*\.?\d*$/.test(val); }, message: "必须为数字" },
    { name: "hhmmssff,hh:mm:ss:ff", onvalidate: function (element, val) { return jetsennet.util.isNullOrEmpty(val) || /^(\d{2}(:\d{2}){3}\d?)?$/.test(val); }, message: "必须为时码格式(hh:mm:ss:ff)" },
    { name: "hh:mm:ss", onvalidate: function (element, val) { return jetsennet.util.isNullOrEmpty(val) || /^(\d{2}(:\d{2}){2})?$/.test(val); }, message: "必须为时间格式(hh:mm:ss)" },
    { name: "email", onvalidate: function (element, val) { return jetsennet.util.isNullOrEmpty(val) || /^(\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*){0,1}$/.test(val); }, message: "必须为有效的电子邮件格式" },
    { name: "abcandn", onvalidate: function (element, val) { return jetsennet.util.isNullOrEmpty(val) || jetsennet.util.isABCAndN(val); }, message: "必须为字母数字或下划线中继符" },
    { name: "notsymbol", onvalidate: function (element, val) { return jetsennet.util.isNullOrEmpty(val) || new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]").test(val) == false; }, message: "不能包含特殊符号" },
    { name: "illegal", onvalidate: function (element, val) { return jetsennet.util.isNullOrEmpty(val) || /[<>\\&]+/.test(val) == false; }, message: "非法字符><\\&" },
    { name: "maxlength", onvalidate: function (element, val) { var maxlen = attributeOf(element, "maxlength", 0); this.message = "不能超过" + maxlen + "个字"; return val.length <= parseInt(maxlen); }, message: "" },
    { name: "minlength", onvalidate: function (element, val) { var minlen = attributeOf(element, "minlength", 0); this.message = "不能少于" + minlen + "个字"; return val.length >= parseInt(minlen); }, message: "" },
    { name: "maxvalue", onvalidate: function (element, val) { var maxval = attributeOf(element, "maxvalue", 0); this.message = "必须小于等于" + maxval; return jetsennet.util.isNullOrEmpty(val) || (/^-?\d*\.?\d*$/.test(val) && parseFloat(val) <= parseFloat(maxval)); }, message: "" },
    { name: "minvalue", onvalidate: function (element, val) { var minval = attributeOf(element, "minvalue", 0); this.message = "必须大于等于" + minval; return jetsennet.util.isNullOrEmpty(val) || (/^-?\d*\.?\d*$/.test(val) && parseFloat(val) >= parseFloat(minval)); }, message: "" },
    { name: "filename", onvalidate: function (element, val) { return jetsennet.util.isNullOrEmpty(val) || /[\\|\/|\||\?|\:|\*|\<|\>|\"]/.test(val) == false; }, message: "不能包含字符\\/|?:*<>\"" },
    //add by xueenbin 20150519
    { name: "url", onvalidate: function (element, val) { return jetsennet.util.isNullOrEmpty(val) || /^(http(s)?:\/\/)?(2[0-4]\d|25[0-5]|[01]?\d\d?)\.(2[0-4]\d|25[0-5]|[01]?\d\d?)\.(2[0-4]\d|25[0-5]|[01]?\d\d?)\.(2[0-4]\d|25[0-5]|[01]?\d\d?)\:(\d+){3,}$/.test(val); }, message: "url格式错误！(http://127.0.0.1:888)" },
    //Add by JiJie.LianG 2015-07-02
    { name: "filenameext", onvalidate: function(element, val) {return jetsennet.util.isNullOrEmpty(val) || new RegExp("[\\\\`~!@#$^&*()=|{}':;',\\[\\].<>/?？~！@#￥……&*|{}‘；’'。，、]").test(val) == false; }, message: "不能包含字符 [`~!@#$^&*()=|{}':;',\\[\\].<>\/?~！@#￥……&*|{}‘；’'。，、 ]" },
    //add by xueenbin 20150710
    { name: "removespaces", onvalidate: function (element, val) { return jetsennet.util.isNullOrEmpty(val) || /^[^\s]+$/.test(val); },message: "不允许有空格！"}
];
jetsennet.validate = jetsennet.form.validate = function (elements, bValidateAll) {
    jetsennet.form.validateResult = 0;

    if (elements == null || elements.length == 0)
        return true;

    var validateErrors = [];
    var bValidate = true;
    var elementsLength = elements.length;

    for (var i = 0; i < elementsLength; i++) {
        var element = el(elements[i]);
        if (element) {
            var controlValue = element.value.replace(/\r\n/img, "");
            var isValidate = true;
            var validateMsg = "";
            var validateType = attributeOf(element, "validatetype", attributeOf(element, "validatestring", ""));

            if (validateType != "") {
                var validateArr = validateType.split(',');
                for (var j = 0; j < validateArr.length; j++) {
                    if (validateArr[j] == "")
                        continue;
                    var curValidateString = validateArr[j].toLowerCase();
                    var hasMatchItem = false;

                    jQuery.each(jetsennet.validateOptions, function (i) {
                        var vitems = this.name.split(",");
                        for (var vi = 0; vi < vitems.length; vi++) {

                            if (curValidateString.equal(vitems[vi])) {
                                isValidate = this.onvalidate(element, controlValue);
                                hasMatchItem = true;
                                break;
                            }
                        }
                        if (!isValidate) {
                            validateMsg = this.message;
                            return false;
                        }
                        if (hasMatchItem) {
                            return false;
                        }
                    });

                    //验证列表中未找到时，有可能为一个函数
                    if (!hasMatchItem) {
                        var srcipts = [];
                        var escapeValue = controlValue.replace(/\n/img, " ").replace(/\'/img, "jsquot;").replace(/\\/mg, "\\\\");
                        srcipts.push("var __validateStr = new String('" + escapeValue + "').replace(/jsquot;/img,\"'\");");

                        if (validateArr[j].indexOf("(") > 0) {
                            if (validateArr[j].indexOf(".") == 0) {
                                srcipts.push("var __validate = __validateStr" + jetsennet.xml.xmlUnescape(validateArr[j]));
                                jetsennet.eval(srcipts.join(""));
                            }
                            else {
                                jetsennet.eval("var __validate = " + validateArr[j]);
                            }
                        }
                        else {
                            srcipts.push("var __validate = false;try{__validate=" + validateArr[j] + "(__validateStr);}catch(e){}");
                            jetsennet.eval(srcipts.join(""));
                        }

                        isValidate = __validate;
                        if (!isValidate) {
                            validateMsg = attributeOf(element, "errormsg", "");
                        }
                    }
                    if (!isValidate)
                        break;
                }
            }
            if (!isValidate) {

                if (attributeOf(element, "isvalidateerror", "") != "1") {
                    element.setAttribute("isvalidateerror", "1");
                    var oldColor = element.style.borderColor;
                    var oldBgColor = element.style.backgroundColor;
                    element.setAttribute("validatebordercolor", (oldColor && oldColor != jetsennet.form.validateErrorBorderColor) ? oldColor : "");
                    element.setAttribute("validatebgcolor", (oldBgColor && oldBgColor != jetsennet.form.validateErrorBgColor) ? oldBgColor : "");
                    element.style.borderColor = jetsennet.form.validateErrorBorderColor;
                    element.style.backgroundColor = jetsennet.form.validateErrorBgColor;
                }

                element.title = validateMsg;

                if (!bValidateAll) {
                    jetsennet.form.validateResult = validateMsg;
                    return false;
                }
                else {
                    validateErrors.push(attributeOf(element, "vmessage", "") + "" + validateMsg);
                }
                bValidate = false;
            }
            else {
                jetsennet.form.clearValidateState([element]);
            }
        }
    }
    var results = "";
    for (var i = 0; i < validateErrors.length; i++) {
        if (results.indexOf(validateErrors[i]) < 0)
            results += validateErrors[i] + "\r\n";
    }
    jetsennet.form.validateResult = bValidate ? 0 : results;
    return bValidate;
};
//清除表单元素的验证状态
jetsennet.clearValidateState = jetsennet.form.clearValidateState = function (elements) {
    if (elements == null || elements.length == 0)
        return;
    var elementsLength = elements.length;
    for (var i = 0; i < elementsLength; i++) {
        var element = el(elements[i]);
        if (attributeOf(element, "isvalidateerror", "") == "1") {
            element.setAttribute("isvalidateerror", "0");
            element.title = "";
            element.style.borderColor = attributeOf(element, "validatebordercolor", "");
            element.style.backgroundColor = attributeOf(element, "validatebgcolor", "");
        }
    }
};
//重设表单元素的值
jetsennet.resetValue = jetsennet.form.resetValue = function (elements) {
    if (elements == null || elements.length == 0)
        return true;
    var elementsLength = elements.length;
    for (var i = 0; i < elementsLength; i++) {
        var element = el(elements[i]);
        if (element && element.type != "button") {
            element.value = attributeOf(element, "default", "");
        }
    }
};
//获取区域内的表单元素
jetsennet.form.getElements = function (sAreaId, elementTypes) {
    var returnArr = new Array();
    var area = el(sAreaId);

    if (area == null)
        return returnArr;

    var formElements = elementTypes ? elementTypes : ["input", "select", "textarea", "button"];

    for (var i = 0; i < formElements.length; i++) {
        var els = area.getElementsByTagName(formElements[i]);
        for (var j = 0; j < els.length; j++) {
            returnArr.push(els[j]);
        }
    }
    return returnArr;
};
//选择所有项
jetsennet.form.checkAllItems = function (objName, isCheck) {
    var objs = $("[name='" + objName + "']");
    objs.each(function(index, element) {
        if (element.tagName == "SPAN") {
            if (isCheck) {
                $(element).addClass("checked");
            } else {
                $(element).removeClass("checked");
            }
        } else {
            element.checked = isCheck;
        }
    });
};
jetsennet.form.uncheckAllItems = function (objName) {
    var objs = $("[name='" + objName + "']");
    objs.each(function(index, element) {
        if (element.tagName == "SPAN") {
            $(element).removeClass("checked");
        } else {
            element.checked = !element.checked;
        }
    });
};
//获取选择项的值
jetsennet.form.getCheckedValues = function (objName) {
    var retArray = [];
    var objs = $("[name='" + objName + "']");
    objs.each(function(index, element) {
        if (element.tagName == "SPAN") {
            var ck = $(element);
            if (ck.hasClass("checked")) {
                retArray.push(ck.attr("value"));
            }
        } else {
            if (element.checked == true) {
                retArray.push(element.value);
            }
        }
    });
    return retArray;
};

//=================================================================================================
//初始化
//=================================================================================================
jetsennet.getBaseUrl();
jetsennet.queryString();

if (jetsennet.appType != 2) {
    jetsennet.require("config");
    jetsennet.isDebug = jetsennet["IS_DEBUG"];
    jQuery.each(jetsennet["DEFAULT_JS_LOAD"], function () { jetsennet.require(this.toString()); });
}

/**
样式路径
*/
jetsennet.currentTheme = jetsennet["DEFAULT_THEME"] ? jetsennet["DEFAULT_THEME"] : jetsennet.currentTheme;
var userTheme = valueOf(jetsennet.application.userInfo, "PageTheme", "");
if (userTheme != "") {
    jetsennet.currentTheme = userTheme;
}
if (jetsennet.pageTheme && jetsennet.pageTheme != "") {
    jetsennet.currentTheme = jetsennet.pageTheme;
}
jetsennet.baseThemeUrl = jetsennet.baseUrl + "../themes/" + jetsennet.currentTheme + "/";

if (jetsennet.appType == 0) {
    try { 
    	jetsennet.require("#application"); 
    } catch (e) { 
    	alert("system can't load application.js!" + e); 
    }
}

jetsennet.initiated = true;
jQuery.each(jetsennet.__tempCssList, function () { jetsennet.importCss(this.moduleName, this.isUrl); });