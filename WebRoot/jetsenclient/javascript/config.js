//=============================================================================
//系统配置
//=============================================================================
if (!window.jetsennet) 
{ 
	var jetsennet = {};
} 
jetsennet["IS_DEBUG"] = false;
jetsennet["DEFAULT_JS_LOAD"] = ["webservice", "sql", "jetsenui", "window", "hashmap", "defaultdal", "user"];
jetsennet["EFFECTS_ENABLE"] = false;
jetsennet["SHOW_UNKNOW_EXCEPTION"] = true;
jetsennet["ERROR_CODE"] = {
    "50": "用户验证失败，请重新登录",
    "99": "对不起，您没有权限",
    "100": "产品未授权"
};

jetsennet["CUSTOM_THEMES"] = ["blue","jsnet"];
jetsennet["DEFAULT_THEME"] = "blue";
jetsennet["CUSTOM_STYLES"] = ["default"];
jetsennet["DEFAULT_STYLE"] = "default";
jetsennet["PORTAL_SERVICE"] = "UUMSystemService";
jetsennet["AUTH_TYPE"] = "local";//local本地校验模式、center用户中心模式、sso单点登录模式
jetsennet["AUTH_URL"] = "http://sso.jetsen.com/sso/";//center和sso模式下的远程校验地址
