jetsennet.require("window");
jetsennet.importCss([ "bootstrap/bootstrap" ]);
/**
 页面初始化
 */
function pageInit() {

	jetsennet.handlerAutoLogin(); //	处理自动登录

	//	监听回车事件，当IE版本为高版本的时候存在bug
	if (jQuery.isFunction(document.attachEvent)) {
		document.attachEvent("onkeydown", keyDown);
	} else if (jQuery.isFunction(document.addEventListener)) {
		document.addEventListener("keydown", keyDown, false);

	}

//	if (IS_IE) {
//		document.attachEvent("onkeydown", keyDown);
//	} else {
//		document.addEventListener("keydown", keyDown, false);
//	}

	//	获取cookie中的登录名
	if (jetsennet.util.isNullOrEmpty(jetsennet.util.cookie("UserLoginId"))) {
		el('txtUserName').focus();
	} else {
		el('txtUserName').value = jetsennet.util.cookie("UserLoginId");
		el('txtPassword').focus();
	}
}

function doLogin()
{
	var userName = el("txtUserName").value ;
	var password = el("txtPassword").value ;
	jetsennet.login(userName, password);
}


function keyDown() {
	if (jetsennet.getEvent().keyCode == 13) {
		doLogin();
	}
}
