//lixiaomin
//=============================================================================
// user validate,user info
//=============================================================================
jetsennet.addLoadedUri(jetsennet.getloadUri("user"));
//cookie项
jetsennet.UserCookieItems = ["UserId", "LoginId", "UserName", "UserToken", "ColumnId", "HomePath", "UserType", "RightLevel", "UserGroups", "UserRoles", "NewPageTheme", "NewPageStyle", "AreaId", "CheckinType"];

jetsennet.UserProfile = function () {
    this.__typeName = "jetsennet.UserProfile";
    //UserId
    this.UserId = "";
    //LoginId
    this.LoginId = "";
    //UserName
    this.UserName = "";
    //UserToken
    this.UserToken = "";
    //ColumnId
    this.ColumnId = "";
    this.UserGroups = "";
    this.UserRoles = "";
    //PersonId
    this.PersonId = "";
    //RightLevel
    this.RightLevel = "0";
    //UserType
    this.UserType = "0";
    //UserPath
    this.HomePath = "";
    //LoginTime
    this.LoginTime = new Date().toDateString();
    //PageInfo
    this.PageInfo = "";
    this.PageTheme = "";
    this.PageStyle = "";

    this.AreaId = "";
    this.CheckinType = "";
};
jetsennet.UserProfile.prototype.toXml = function () {
    var arrXml = [];
    arrXml.push("<UP>");
    arrXml.push("<UI>" + this.UserId + "</UI>");
    this.LoginId != null ? arrXml.push("<LI>" + jetsennet.xml.xmlEscape(this.LoginId) + "</LI>") : void (0);
    this.UserName != null ? arrXml.push("<UN>" + jetsennet.xml.xmlEscape(this.UserName) + "</UN>") : void (0);
    this.UserToken != null ? arrXml.push("<TK>" + jetsennet.xml.xmlEscape(this.UserToken) + "</TK>") : void (0);
    this.ColumnId != null ? arrXml.push("<CI>" + this.ColumnId + "</CI>") : void (0);
    this.UserGroups != null ? arrXml.push("<UG>" + this.UserGroups + "</UG>") : void (0);
    this.UserRoles != null ? arrXml.push("<UR>" + this.UserRoles + "</UR>") : void (0);
    this.PersonId != null ? arrXml.push("<PI>" + jetsennet.xml.xmlEscape(this.PersonId) + "</PI>") : void (0);
    this.UserType != null ? arrXml.push("<UT>" + this.UserType + "</UT>") : void (0);
    this.HomePath != null ? arrXml.push("<HP>" + jetsennet.xml.xmlEscape(this.HomePath) + "</HP>") : void (0);
    this.PageInfo != null ? arrXml.push("<PA>" + jetsennet.xml.xmlEscape(this.PageInfo) + "</PA>") : void (0);
    this.RightLevel != null ? arrXml.push("<RL>" + this.RightLevel + "</RL>") : void (0);
    this.PageTheme != null ? arrXml.push("<NPT>" + this.PageTheme + "</NPT>") : void (0);
    this.PageStyle != null ? arrXml.push("<NPS>" + this.PageStyle + "</NPS>") : void (0);
    this.AreaId != null ? arrXml.push("<AR>" + this.AreaId + "</AR>") : void (0);
    this.CheckinType != null ? arrXml.push("<CT>" + this.CheckinType + "</CT>") : void (0);
    arrXml.push("</UP>");
    return arrXml.join(""); //jetsennet.xml.serialize(this,"UserProfile");
};
jetsennet.UserProfile.prototype.fromXml = function (xmlString) {

    var userObj = jetsennet.xml.deserialize(xmlString);
    userObj = userObj.UserProfile||userObj;

    this.UserId = valueOf(userObj, "UserId", valueOf(userObj, "UI", ""));
    this.LoginId = valueOf(userObj, "LoginId", valueOf(userObj, "LI", ""));
    this.UserName = valueOf(userObj, "UserName", valueOf(userObj, "UN", ""));
    this.UserToken = valueOf(userObj, "UserToken", valueOf(userObj, "TK", ""));
    this.ColumnId = valueOf(userObj, "ColumnId", valueOf(userObj, "CI", ""));
    this.UserGroups = valueOf(userObj, "UserGroups", valueOf(userObj, "UG", ""));
    this.UserRoles = valueOf(userObj, "UserRoles", valueOf(userObj, "UR", ""));
    this.PersonId = valueOf(userObj, "PersonId", valueOf(userObj, "PI", ""));
    this.UserType = valueOf(userObj, "UserType", valueOf(userObj, "UT", "0"));
    this.UserPath = valueOf(userObj, "HomePath", valueOf(userObj, "HP", ""));
    this.PageInfo = valueOf(userObj, "PageInfo", valueOf(userObj, "PA", ""));
    this.RightLevel = valueOf(userObj, "RightLevel", valueOf(userObj, "RL", "0"));
    var userParam = valueOf(userObj, "UserParam","");
    if(userParam)
    {
    	 var paramDoc = new jetsennet.XmlDoc();
         paramDoc.loadXML(userParam);
         if(paramDoc!=null && paramDoc.documentElement)
         {
             this.PageTheme = valueOf(paramDoc.documentElement.selectSingleNode("PageTheme"), "text", "")||jetsennet["DEFAULT_THEME"];
             this.PageStyle = valueOf(paramDoc.documentElement.selectSingleNode("PageStyle"), "text", "")||jetsennet["DEFAULT_STYLE"];
         }
    }
    else
    {
    	this.PageTheme = valueOf(userObj, "NPT", "")||jetsennet["DEFAULT_THEME"];
    	this.PageStyle = valueOf(userObj, "NPS", "")||jetsennet["DEFAULT_STYLE"];
    }
    if(jetsennet["CUSTOM_STYLES"] && jetsennet["CUSTOM_STYLES"].length>0 && !jetsennet["CUSTOM_STYLES"].contains(this.PageStyle)) 
    {
        this.PageStyle = jetsennet["DEFAULT_STYLE"];
    }
    if(jetsennet["CUSTOM_THEMES"] && jetsennet["CUSTOM_THEMES"].length>0 && !jetsennet["CUSTOM_THEMES"].contains(this.PageTheme)) 
    {
        this.PageTheme = jetsennet["DEFAULT_THEME"];
    }
    this.AreaId = valueOf(userObj, "AreaId", valueOf(userObj, "AR", ""));
    this.CheckinType = valueOf(userObj, "CheckinType", valueOf(userObj, "CT", ""));
};

/**获取准确可用的模板**/
jetsennet.getPageStyle = function () {
    var style = jetsennet.util.cookie("NewPageStyle")||jetsennet["DEFAULT_STYLE"] ;
    if(jetsennet["CUSTOM_STYLES"] && jetsennet["CUSTOM_STYLES"].length>0 && !jetsennet["CUSTOM_STYLES"].contains(style)) 
    {
        style = jetsennet["DEFAULT_STYLE"];
    }
    return style;
};

/**获取准确可用的样式**/
jetsennet.getPageTheme = function () {
    var theme = jetsennet.util.cookie("NewPageTheme")||jetsennet["DEFAULT_THEME"] ;
    if(jetsennet["CUSTOM_THEMES"] && jetsennet["CUSTOM_THEMES"].length>0 && !jetsennet["CUSTOM_THEMES"].contains(theme)) 
    {
        theme = jetsennet["DEFAULT_THEME"];
    }
    return theme;
};

/**跳到登录页**/
jetsennet.gotoLogin = function (style) {
    var mystyle = style||jetsennet.getPageStyle() ;
    var defaultLoginUrl = "juum/jnetsystemweb/"+mystyle+"/login.htm";
    if(jetsennet["AUTH_TYPE"]=="local")
    {
        window.top.location = jetsennet.getWebRoot() + defaultLoginUrl;
    }
    else if(jetsennet["AUTH_TYPE"]=="center")
	{
		window.top.location = jetsennet["AUTH_URL"] + defaultLoginUrl;
	}
    else if(jetsennet["AUTH_TYPE"]=="sso")
    {
        var param = "url="+ window.top.location.href;
        window.top.location = jetsennet["AUTH_URL"] + defaultLoginUrl + "?" + param;
    }
};

/**是否登录**/
jetsennet.isLogin = function () {
    return false;
};

/**校验用户是否登录,没有登录的将跳转到登录页面**/
jetsennet.validateLogin = jetsennet.valideLogin = function () {
    var userInfo = jetsennet.getUserInfo();
    jetsennet.setUserInfo(userInfo);
    if (userInfo != null && userInfo.UserId && userInfo.LoginId) 
    {
        if (!jetsennet.util.isNullOrEmpty(userInfo.PageInfo)) 
        {
            if (new String(window.location.toString()).toLowerCase().indexOf(userInfo.PageInfo.toLowerCase()) < 0) 
            {                
                jetsennet.gotoLogin();
            }
        }
        return true;
    }
    else 
    {
        jetsennet.gotoLogin();
    }
};

/**获取用户信息**/
jetsennet.getUserInfo = function () {
   var userInfo = jetsennet.getQueryUserInfo();
    if (userInfo != null) {
        return userInfo;
    }
    userInfo = new jetsennet.UserProfile();
    for (var i = 0; i < jetsennet.UserCookieItems.length; i++) {
        var name = jetsennet.UserCookieItems[i];
        if(name == "NewPageTheme") {
            userInfo["PageTheme"] = jetsennet.util.cookie(name);
        } else if(name == "NewPageStyle") {
            userInfo["PageStyle"] = jetsennet.util.cookie(name);
        }  else {
            userInfo[name] = jetsennet.util.cookie(name);
        }
    }
    return userInfo;
};

/**从请求从得到用户信息**/
jetsennet.getQueryUserInfo = function (i) {
    var userToken = jetsennet.queryString("token");/**此token参数，携带了用户信息,见方法getValideQueryString**/
    if (!jetsennet.util.isNullOrEmpty(userToken)) {
        userToken = jetsennet.util.base64StringToUTF8(userToken);
        var userInfo = new jetsennet.UserProfile();
        userInfo.fromXml(userToken);
        return userInfo;
    }
    return null;
};

/**设置用户信息,并且将用户信息设置到cookie**/
jetsennet.setUserInfo = function (/*jetsennet.UserProfile*/userInfo) {
    for (var i = 0; i < jetsennet.UserCookieItems.length; i++) {
        var name = jetsennet.UserCookieItems[i];
        jetsennet.util.cookie(name, null);
        if (userInfo) {            
            var value;
            if(name == "NewPageTheme") {
                value = userInfo["PageTheme"];
            } else if(name == "NewPageStyle") {
                value = userInfo["PageStyle"];
            } else {
                value = userInfo[name];
            }
            jetsennet.util.cookie(name, value, { expires: 1 }); //,{ expires:0.5});
        }
    }
    jetsennet.application.userInfo = userInfo;
};

/**在页面请求中追加用户信息**/
jetsennet.getValideQueryString = function (page) {
    var queryString = "";
    var userInfo = jetsennet.application.userInfo;
    var userToken = "";
    if (userInfo != null) {
        userInfo.PageInfo = page ? page : "";
        userToken = escape(jetsennet.util.utf8ToBase64String(userInfo.toXml()));
    }
    queryString = "token=" + userToken;
    return queryString;
};

/**
当调用服务方法需要Soap Header时，从此处读取值 
以满足多种语言生成的服务需要(主要是命名空间)
*/
jetsennet.application.soapHeaderReader = function (itemName, itemType, methodName, location) {
    var itemValue = "";
    switch (itemName) {
        case "UserId":
        case "userId":
            itemValue = jetsennet.application.userInfo.UserId;
            break;
        case "LoginId":
        case "loginId":
            itemValue = jetsennet.application.userInfo.LoginId;
            break;
        case "UserToken":
        case "userToken":
            itemValue = jetsennet.application.userInfo.UserToken;
            break;
    }
    if (itemValue == null || itemValue == "")
        return jetsennet.Service.getMethodDefaultParamValue(itemType);
    return itemValue;
};

jetsennet.application.userInfo = jetsennet.getUserInfo();
