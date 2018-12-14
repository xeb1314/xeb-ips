jetsennet.require("window");
jetsennet.importCss([ "bootstrap/bootstrap" ]);
/**
 页面初始化
 */
function pageInit() {
    jetsennet.handlerAutoLogin(); //    处理自动登录
    $(document).bind("keydown", function(e){
        if (e.keyCode == 13) {
            doLogin();
        }
    });
    //  获取cookie中的登录名
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


