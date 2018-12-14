jetsennet.require(["window"]);
var gMenuMouseOverTime;
var gMenuMouseOutTime;
var gCopyRights =
{
    "copyRight": "@",
    "year": new Date().getFullYear(),
    "company": "北京捷成世纪科技股份有限公司",
    "show": function () {
        return this.copyRight + this.year + this.company;
    }
};

/**
* 初始化导航栏
*/
function initNav() {
    //获取权限
    jetsennet.request(jetsennet.appPath + "../../user", { command: "getUserFunction", userId: jetsennet.application.userInfo.UserId },
	 function (sResult) {
	     var navMenu = jQuery.parseJSON(sResult).roles;

	     if (navMenu.length > 0) {
	         //组织innerHTML
	         var menuHtml = [];
	         menuHtml.push('<ul class="nav_n">');

	         jQuery.each(navMenu, function (i, item) {
	             //拼装一级菜单
	             menuHtml.push('<li>');
	             menuHtml.push('<span class="nav_01">');
	             menuHtml.push('<a href="' + createPageUrl(item.param, item.id) + '">');
	             menuHtml.push('<div class="nav-' + (i + 1) + '"><span>');
	             menuHtml.push(item.name);
	             menuHtml.push('</span></div></a></span>');

	             var subNav = item.roles;

	             if (subNav) {
	                 menuHtml.push('<div class="kind_menu" style="left: 0px;">');
	                 //目前只支持两层菜单
	                 jQuery.each(subNav, function (j, subItem) {
	                     //拼装二级菜单
	                     menuHtml.push('<a href="' + createPageUrl(subItem.param, subItem.id) + '" id="' + subItem.id + '">');
	                     menuHtml.push(subItem.name);
	                     menuHtml.push('</a>');
	                 })
	                 menuHtml.push('</div>');
	             }
	             menuHtml.push('</li>');
	         })
	         menuHtml.push('</ul><div class="r"></div>');

	         //修改DOM
	         jQuery("#nav").html(menuHtml.join(''));


	         // 导航效果
	         var id = jetsennet.queryString("sysid");
	         if (id) {
	             jQuery("#" + id).addClass("rrg selected");
	             jQuery("#" + id).parents("li").addClass("nav_lishw");
	             jQuery(".nav_lishw > .nav_01 > a").addClass("sele");
	             jQuery(".nav_lishw > .kind_menu").show();
	         }
	         else {
	             jQuery(".nav_n > li:first").addClass("nav_lishw");
	             jQuery(".nav_lishw > .nav_01 > a").addClass("sele");
	             jQuery(".nav_lishw > .kind_menu > a:first").addClass("rrg selected");
	             jQuery(".nav_lishw > .kind_menu").show();
	         }
	         jQuery("#nav li").hover(function () {
	             clearTimeout(gMenuMouseOutTime);
	             gMenuMouseOverTime = setTimeout(jetsennet.bindFunction(this, function () {
	                 jQuery("#nav li .nav_01 .sele").removeClass("sele");
	                 jQuery(this).find(".nav_01 > a").addClass("sele");
	                 jQuery(".kind_menu").hide();
	                 jQuery(this).find(".kind_menu").show();
	             }), 500);

	         }, function () {
	             clearTimeout(gMenuMouseOverTime);
	             gMenuMouseOutTime = setTimeout(jetsennet.bindFunction(this, function () {
	                 jQuery(this).find(".nav_01 > a").removeClass("sele");
	                 jQuery(this).find(".kind_menu").hide();
	                 jQuery(".nav_lishw > .nav_01 > a").attr("class", "sele");
	                 jQuery(".nav_lishw > .kind_menu").show();
	             }), 1000);
	         });
	         jQuery(".nav_lishw > .kind_menu > a").hover(function () {
	             jQuery(".nav_lishw > .kind_menu > .rrg").removeClass("rrg");
	             jQuery(this).addClass("rrg");
	         }, function () {
	             jQuery(this).removeClass("rrg");
	             jQuery(".nav_lishw > .kind_menu > .selected").addClass("rrg");
	         });
	     }
	     else {
	         jQuery("divMenu").html("");
	     }
	 }, function (ex) { alert(ex); }, {});


    jQuery(".quit").click(function () {
        logout();
    });
    jQuery(".set_1").click(function () {
        modifyPassword();
    });

    jQuery("#divLoginName").text(jetsennet.application.userInfo.UserName);

    jQuery("#footer > .copyright").html(gCopyRights.show()); //版权信息
}

/**
生成页面地址
*/
function createPageUrl(pageUrl, fId) {

    if (!jetsennet.util.isNullOrEmpty(pageUrl) && pageUrl != "#") {

        if (jetsennet.util.left(pageUrl, 4) != "http") {
            pageUrl = jetsennet.appPath + "../../" + pageUrl;
        }

        var queryString = jetsennet.getValideQueryString(getSubUrl(pageUrl));

        if (pageUrl.indexOf('?') >= 0) {
            pageUrl += "&" + queryString;
        }
        else {
            pageUrl += "?" + queryString;
        }

        pageUrl += "&sysid=" + fId;
    }
    else {
        pageUrl = "javascript:void(0)";
    }
    return pageUrl;
}
/**
获取部分路径地址
*/
function getSubUrl(url) {
    var tempArr = url.split("\?");
    tempArr = tempArr[0].split("/");
    return tempArr[tempArr.length - 2] + "/" + tempArr[tempArr.length - 1];
};

/**
* 登出 
*/
function logout() {
    jetsennet.logout();
}

/**
* 
* 修改密码
*/
function modifyPassword() {
    var userTable = [];
    userTable.push('<table cellpadding="0" cellspacing="0" class="table-info" style="width: 98%;height: 100%" border="0">');
    userTable.push('<colgroup><col class="width-4w" /><col class="width-input" /></colgroup>');
    userTable.push('<tr><td class="field-head">用户名：</td><td><input type="text" id="txt_UserName" disabled="disabled" class="input16"/></td></tr>');
    userTable.push('<tr><td class="field-head"> 旧密码：</td><td><input type="password" id="txt_Password" validatetype="NotEmpty,maxlength" class="input16" maxlength="50" /><span style="color: Red">*</span></td></tr>');
    userTable.push('<tr><td class="field-head"> 新密码：</td><td><input type="password" id="txt_NewPassword" validatetype="NotEmpty,maxlength" class="input16" maxlength="50" /><span style="color: Red">*</span></td></tr>');
    userTable.push('<tr><td class="field-head"> 确认密码：</td><td><input type="password" id="txt_ConfirmPassword" validatetype="NotEmpty,maxlength" class="input16" maxlength="50" /><span style="color: Red">*</span></td></tr>');
    userTable.push('</table>');
    var passwdDiv = document.createElement('div');
    passwdDiv.setAttribute('id', 'divPasswd');
    passwdDiv.style.display = 'none';
    passwdDiv.innerHTML = userTable.join('');
    document.body.appendChild(passwdDiv);

    var areaElements = jetsennet.form.getElements('divPasswd');

    jetsennet.form.resetValue(areaElements);
    jetsennet.form.clearValidateState(areaElements);

    el('txt_UserName').value = jetsennet.application.userInfo.UserName;
    var dialog = jQuery.extend(new jetsennet.ui.Window("modifyPasswd"),
        { title: "修改密码", submitBox: true, cancelBox: true, size: { width: 300, height: 0 }, maximizeBox: false, minimizeBox: false, windowStyle: 1 });
    dialog.controls = ["divPasswd"];
    dialog.onsubmit = function () {

        if (jetsennet.form.validate(areaElements, true)) {
            if (el('txt_NewPassword').value != el('txt_ConfirmPassword').value) {
                jetsennet.alert('确认密码与新密码不一致，请重新输入！');
                return;
            }

            jetsennet.request(jetsennet.appPath + "../../user", { command: "modifyPassword", userId: jetsennet.application.userInfo.LoginId, oldPasswd: el('txt_Password').value, newPasswd: el('txt_NewPassword').value },
	        function (sResult) {
	            jetsennet.message("修改密码成功！");
	            dialog.close();

	        }, function (ex) { jetsennet.error(ex); }, { async: false });

        }
    };
    dialog.showDialog();
}
/**
* 表格点击对选中行着色
* @param {Object} tableId
* @param {Object} trobj
*/
function setTrBgColor(tableId, trobj) {
    jQuery("#" + tableId + " tr").css({ "background-color": "" });
    jQuery(trobj).css({ "background-color": "#494848" });
}


/**
 * 是否为非法开始时间和结束时间
 * @param startTime
 * @param endTime
 * @return
 */
function illegalityTime(startDate, endDate){
	if(startDate&&endDate){
		var startTime = new Date(Date.parse(startDate.replace(/-/g,   "/"))).getTime();
		var endTime = new Date(Date.parse(endDate.replace(/-/g,   "/"))).getTime();
		if(startTime>endTime){
			jetsennet.alert("开始时间不能大于结束时间!");
			return true;
		}else{
			return false;
		}
	}else{
		return false;
	}
}