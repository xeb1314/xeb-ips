/**
 * 在线用户管理
 * @author LiMing	2014-7-04 17:36:07
 */
jetsennet.require(["gridlist"]);

//查询条件
var conditions = [] ;
//表格列
var columns = [{ fieldName: "UserToken", width: 30, align: "center", isCheck: 1, checkName: "chkUserToken"},
                    { fieldName: "LoginId", sortField: "LoginId", width: "25%", align: "left", name: "登录名称"},
                    { fieldName: "UserName", sortField: "UserName", width: "25%", align: "left", name: "用户名称"},
                    { fieldName: "LoginTime", sortField: "LoginTime", width: "25%", align: "left", name: "登录时间"},
                    { fieldName: "RequestIP", sortField: "RequestIP", width: "25%", align: "center", name: "IP地址"},
                    { fieldName: "UserToken", width: 45, align: "center", name: "踢出", format: function(val,vals){
                    	return "<span class=\"glyphicon glyphicon-remove\" " +
                    			"style=\"color: red;cursor:pointer;\" onclick=\"logoutUser('"+val+"')\"></span>" ;
                    }}];
var gridlist = $.createGridlist("divContent", columns);	//表格对象，自动生成
gridlist.dateItemName = "UserProfile";

function searchOnlineUser()
{
	var params = new HashMap();
	params.put("loginName", el("txt_LOGIN_NAME").value) ;
	var result = UUMDAO.execute("uumGetOnlineUsers", params) ;
	if (result && result.errorCode == 0) 
	{
		gridlist.renderXML(result.resultVal);
	}
}

function logoutUser(userToken)
{
	var checkTokens = [] ;
	if(!userToken)
	{
		checkTokens = jetsennet.form.getCheckedValues("chkUserToken");
		if (checkTokens.length == 0) {
			jetsennet.alert("请至少选择一个在线用户！");
			return;
		}
	}
	else
	{
		checkTokens.push(userToken);
	}
    jetsennet.confirm("确定踢出指定用户？", function() {
    	var params = new HashMap();
    	params.put("userTokens", checkTokens.join(",")) ;
    	var result = UUMDAO.execute("uumTripoutUser", params) ;
    	if (result && result.errorCode == 0) 
    	{
    		searchOnlineUser();
    	}
    	return true ;
    });
}


