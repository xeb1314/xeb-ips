//=============================================================================
//  Default.htm Pgae
//=============================================================================
jetsennet.valideLogin();    
jetsennet.correctIndexPage();   
jetsennet.require(["window", "bootstrap/bootstrap", "jqueryui/jquery-ui", "jquery/jquery.slimscroll", "jquery/jquery.md5"]);
jetsennet.importCss(["bootstrap/bootstrap", "jetsen"]);
var UUMDAO = new jetsennet.DefaultDal("UUMSystemService", null, true);
var funcMap = new HashMap();
var SYSTEM_CODE_JUUM = 20;

/**
 * 加载皮肤
 */
function loadSkinAndTemplate() {
    
    UUMDAO.queryObjs({
        method:     "commonXmlQuery",
        keyId:      "CW_ID",
        tableName:  "NET_CTRLWORD",
        conditions: [["CW_SYS", SYSTEM_CODE_JUUM, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric],
                     ["CW_TYPE", "2001,2002", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.In, jetsennet.SqlParamType.Numeric]],
        resultFields: "CW_NAME,CW_CODE,CW_TYPE",
        options:    {
            success: function (result) {
                var len = result.length;
                for (var i = 0; i < len; i++) {
                    if(result[i].CW_TYPE == 2002)
                    {
                        jQuery("<option>"+result[i].CW_NAME+"</option>", {}).attr("value", result[i].CW_CODE).appendTo($("#ddl_PageTheme"));
                    }else{
                        jQuery("<option>"+result[i].CW_NAME+"</option>", {}).attr("value", result[i].CW_CODE).appendTo($("#ddl_PageStyle"));
                    }
                }
            }
        }
    });
}

function showUserInfo () 
{
    var areaElements = jetsennet.form.getElements("editMyInfoDialog");
    jetsennet.resetValue(areaElements);
    jetsennet.clearValidateState(areaElements);
    
    var user = jetsennet.getUserInfo();
    el("txt_USER_NAME").value = valueOf(user, "UserName", "");
    var oldTheme = el('ddl_PageTheme').value = valueOf(user, "PageTheme", jetsennet["DEFAULT_THEME"]);
    var oldStyle = el('ddl_PageStyle').value = valueOf(user, "PageStyle", jetsennet["DEFAULT_STYLE"]);
    
    var dialog = new jetsennet.ui.Window("user-info-edit-dialog");
    jQuery.extend(dialog, {
        title : "个人资料",
        size : {
            width : 500,
            height : 250
        },
        maximizeBox : false,
        minimizeBox : false,
        submitBox : true,
        cancelBox : true,
        showScroll : false,
        controls : [ "editMyInfoDialog" ],
    });
    dialog.onsubmit = function() {
        if (!jetsennet.form.validate(areaElements, true)) {
            jetsennet.message("输入不符合规则，带*的为必填项！");
            return false;
        }
        var obj = {
            ID : jetsennet.Application.userInfo.UserId,
            USER_NAME : el('txt_USER_NAME').value,
            APP_PARAM : jetsennet.xml.serialize({
                PageTheme : (el('ddl_PageTheme').value||jetsennet["DEFAULT_THEME"]),
                PageStyle : (el('ddl_PageStyle').value||jetsennet["DEFAULT_STYLE"])
            }, "Param"),
        };
        var params = new HashMap();
        params.put("userInfo", jetsennet.xml.serialize(obj, "User"));
        UUMDAO.execute("uumModifyUserInfo", params, {success: function(result){
            jetsennet.message("资料修改成功！");
            dialog.close();
            user.UserName = el('txt_USER_NAME').value;
            user.PageTheme = el('ddl_PageTheme').value||jetsennet["DEFAULT_THEME"];
            user.PageStyle = el('ddl_PageStyle').value||jetsennet["DEFAULT_STYLE"];
            jetsennet.setUserInfo(user);
            if(oldTheme != user.PageTheme || oldStyle != user.PageStyle) {
                document.location.reload();
            }
        }, error: function(ex){
            jetsennet.error("资料修改失败！可能原因：" + ex);
        }});
    };
    dialog.showDialog();
}

function changePassword ()
{
    var areaElements = jetsennet.form.getElements("editMyPwdDialog");
    jetsennet.resetValue(areaElements);
    jetsennet.clearValidateState(areaElements);
    
    var dialog = new jetsennet.ui.Window("user-change-password-dialog");
    jQuery.extend(dialog, {
        title : "修改个人密码",
        size : {
            width : 500,
            height : 250
        },
        maximizeBox : false,
        minimizeBox : false,
        submitBox : true,
        cancelBox : true,
        showScroll : false,
        controls : ["editMyPwdDialog"],
    });
    dialog.onsubmit = function() {
        if (!jetsennet.form.validate(areaElements, true)) {
            jetsennet.message("输入不符合规则，带*的为必填项！");
            return false;
        }
        if(el("txt_USER_NEW_PWD").value != el("txt_USER_NEW_CHK_PWD").value){
            jetsennet.message("新密码和确认密码不一致！请重新输入！");
            return false;
        }
        var params = new HashMap();
        params.put("userId", jetsennet.Application.userInfo.UserId);
        params.put("oldPWD", jQuery.md5(el('txt_USER_OLD_PWD').value));
        params.put("newPWD", jQuery.md5(el('txt_USER_NEW_PWD').value));
        UUMDAO.execute("uumUserModifyPWD", params, {success: function(result){
            jetsennet.message("密码修改成功！请重新登录!");
            dialog.close();
            setTimeout(function(){
                jetsennet.gotoLogin();
            }, 500);
        }, error: function(ex){
            jetsennet.error("密码修改失败！可能原因：" + ex);
        }});
    };
    dialog.showDialog();
}


/**
 * 初始化函数
 */
function pageInit(){
    
    $("#loginName").text(jetsennet.Application.userInfo.UserName);
    $("#loginName").attr("title", jetsennet.Application.userInfo.UserName);
    
    MyApp.initMessageBox();
    MyApp.initToolBox();
    MyApp.initStoreBox(persistStores);
    
    MyApp.initLayout();
    MyApp.showIframe({ID:"main", NAME:"我的首页", URL:"main.htm"}, true);
    initPage();
    
    jQuery(window).resize(function(){
        windowResized();
    });
    
    /**加载样式**/
    loadSkinAndTemplate();
}

/**
 * 布局
 */
function windowResized()
{
    MyApp.initLayout();
}

/**
 * 生成导航
 */
function initPage()
{
    var datas = Data.get();
    if (!datas || datas.length<1)
    {                           
        jetsennet.alert("您没有任何权限!");
        return ;
    }
    
    var serializeDatas = new Array();
    $.each(datas, function(){
        serializeDatas.push(Data.serialize(this));
    });
    
    var userFunctions = Data.format(serializeDatas, "PARENT_ID", "ID", "0");
    MyApp.initNavigation(userFunctions);
    MyApp.initStoreConfig(userFunctions);
    
    $.each(serializeDatas, function(){
        funcMap.put(this.ID, this);
    });
    
    initStoreLst();//初始化收藏栏列表
    initStoreConfig();
}

/**
 * 初始化收藏栏
 */
function initStoreLst()
{
    var params = new HashMap();
    params.put("userId", jetsennet.Application.userInfo.UserId);
    UUMDAO.execute("uumGetUserStore", params, {success: function(result){
        if(result)
        {
            var funcs = eval(result);
            $.each(funcs, function(){
                if(funcMap.containsKey(this.ID))
                {
                    var item = funcMap.get(this.ID);
                    item.DIS_NAME = this.NAME;
                    MyApp.genStoreItem(item);
                }
            });
        }
    }});
}

/**
 * 刷新收藏栏
 * @param funcIds
 */
function persistStores(funcs)
{
    var items = new Array();
    $.each(funcs, function(){
        items.push("{ID:\""+this.ID+"\", NAME: \""+(this.DIS_NAME||this.NAME)+"\"}");
    });
    var params = new HashMap();
    params.put("userId", jetsennet.Application.userInfo.UserId);
    params.put("stores", "["+items.join(",")+"]");
    UUMDAO.execute("uumUpateUserStore", params);
}

/**
 * 初始化收藏栏配置
 */
function initStoreConfig() {
    
    $("#storeConfig").click(function(){
        $("#myModal").modal({
            backdrop: 'static',
            keyboard: false
        });
    });
    
    $("#myModal").on('show.bs.modal', function (e) {
        MyApp.openStoreConfig();
    });
    
    $(".btnCancleSaveConfig").click(function(){
        if(!MyApp.isStoresChanged())
        {
            $('#myModal').modal('hide');
        }
        else
        {
            jetsennet.confirm("修改未保存，确定取消？", function(){
                $('#myModal').modal('hide');
                return true;
            });
        }
    });
    
    $("#btnSaveConfig").click(function(){
        MyApp.saveStoreConfig();
        $('#myModal').modal('hide');
    });
}

/**
 * 关闭选项卡
 */
function closeTarget(type){
    MyApp.closeTarget(type);
    $("#ul-tab-list").hide();
}

/**
 * 退出
 */
function doLogout(node){
    jetsennet.logout();
}

jetsennet.xml.htmlUnescape = function(text){
    
    if (text == null) {
        return "";
    }
    return text.toString().replace("&lt;", "<")
        .replace("&gt;", ">");
};
