jetsennet.require("jquery/jquery.md5");

/** 处理自动登录 */
jetsennet.handlerAutoLogin = function() {
	// 查询页面URL参数
	var userName = jetsennet.queryString("id");
	var password = jetsennet.queryString("pw");
	if (!jetsennet.util.isNullOrEmpty(userName) && !jetsennet.util.isNullOrEmpty(password)) {
		autoLogin = true;
		var pageUrl = jetsennet.queryString("url");
		jetsennet.login(userName, password, escape(pageUrl));
	}
};

/**
 * 用户登录
 * 
 * @param userName
 * @param password
 * @param autoDefaultPage
 *            登录成功之后跳转的页面
 */
jetsennet.login = function(userName, password, autoDefaultPage) {

	var name = jetsennet.util.trim(userName);
	var pass = jetsennet.util.trim(password);
	if (jetsennet.util.isNullOrEmpty(name)) {
		jetsennet.alert("请输入用户名！");
		return;
	}
	if (jetsennet.util.isNullOrEmpty(pass)) {
		jetsennet.alert("请输入密码！");
		return;
	}
	var map = new HashMap();
	map.put("loginId", name);
	map.put("password", jQuery.md5(pass));
	var result = new jetsennet.DefaultDal(jetsennet["PORTAL_SERVICE"]).execute("uumUserLogin", map);
	if (result && result.resultVal && result.errorCode == 0) {
		jetsennet.registerUser(result.resultVal, autoDefaultPage);
	}
};

jetsennet.registerUser = function(xml, autoDefaultPage) {
	var userInfoXmlDoc = new jetsennet.XmlDoc();
	userInfoXmlDoc.loadXML(xml);
	var userInfo = new jetsennet.UserProfile();
	userInfo.fromXml(userInfoXmlDoc);
	if (userInfoXmlDoc) {
		// 设置用户信息
	    jetsennet.setUserInfo(userInfo);
	    // 保存用户的登录信息，供下次登录时使用
	    jetsennet.util.cookie("UserLoginId", userInfo.LoginId, {expires : 7});
	    jetsennet.util.cookie("NewUserPageStyle", userInfo.PageStyle, {expires : 7});
		// 设置跳转页
	    var url = "../" + jetsennet.getPageStyle() + "/index.htm";
	    if(autoDefaultPage && !jetsennet.util.isNullOrEmpty(autoDefaultPage)) 
	    {
	        url = autoDefaultPage;
	    }
	    window.status = ("登陆成功 ！欢迎您，" + userInfo.UserName);
        window.location = url;
	} else {
		jetsennet.alert("登陆异常！");
	}
};

/** 用户登出* */
jetsennet.logout = function() {
	// 退出后台方法
	new jetsennet.DefaultDal(jetsennet["PORTAL_SERVICE"]).execute("uumLogout");
	// 获取当前模板
	var style = jetsennet.getPageStyle();
	// 清空用户信息
	jetsennet.setUserInfo();
	// 跳转到登录页
	jetsennet.gotoLogin(style);
};

/**校验首页**/
jetsennet.correctIndexPage = function() {
	
	var style = jetsennet.getPageStyle();
	if(style)
	{
		var url = window.top.location.href;
		var arr1 = url.split("\?");   
		var arr2 = arr1[0].split("/");
		var pageStyle = arr2[arr2.length-2];
		if(style != pageStyle)
		{
			arr2[arr2.length-2] = style;
			var newUrl = arr2.join("/");
			if(arr1.length>1)
			{
				newUrl += "?" + arr1[1];
			}
			window.top.location = newUrl;
		}
	}
};