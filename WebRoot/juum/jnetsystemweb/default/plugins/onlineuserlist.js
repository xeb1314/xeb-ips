/**
 * author 李明
 * 在线用户列表插件
 * @param $
 */
var OnLineUser = (function(){
    
    var _render = function(id, users) {
        if(users && users.length > 0) {
            if($("#"+id).length==0) {
                jQuery('<ul class="toolboxplugin onlineuserlist"></ul>').attr("id", id).appendTo("body");
            }
            var el = $("#"+id);
            el.empty();
            $.each(users, function(){
                var u = this;
                jQuery('<li><img src="images/user/default.png"/>'+this.UserName+'</li>').click(function(){
                    _sendMsg(id, u);
                }).appendTo(el);
            });
            WindowUtil.show(el, {height: "300px"});
        };
    };
    
    var _sendMsg = function(id, user) {
        var me = jetsennet.getUserInfo();
        if(me.UserToken == user.UserToken) {
            jetsennet.message("不能推送消息给自己!");
            return false;
        }
        if($("#"+id + "-msgbox").length == 0) {
            jQuery('<div style="display:none;height:100%;"><textarea class="form-control" validatetype="NotEmpty" style="height:100%;width:100%"></textarea></div>').attr("id", id + "-msgbox").appendTo("body");
        }
        var areaElements = jetsennet.form.getElements(id + "-msgbox");
        jetsennet.resetValue(areaElements);
        jetsennet.clearValidateState(areaElements);
        
        var dialog = new jetsennet.ui.Window("send-msg-dialog");
        jQuery.extend(dialog, {
            title : "To "+user.UserName,
            size : {
                width : 500,
                height : 250
            },
            maximizeBox : false,
            minimizeBox : false,
            submitBox : true,
            cancelBox : true,
            showScroll : false,
            controls : [ id + "-msgbox" ],
        });
        dialog.onsubmit = function() {
            if (!jetsennet.form.validate(areaElements, true)) {
                jetsennet.message("推送消息不能为空！");
                return false;
            }
            UUMPUSHER.sendMsg("USERMSG", [user.UserToken], $("#"+id + "-msgbox").children().val());
            dialog.close();
        };
        dialog.showDialog();
    };
    
    return {
        list: function(id) {
            if(WindowUtil.isShow($("#"+id))) {
                jetsennet.cancelBubble();
                return ;
            }
            var params = new HashMap();
            params.put("loginName", "") ;
            UUMDAO.execute("uumGetOnlineUsers", params, {success: function(result){
                var users = jetsennet.xml.toObject(result, "UserProfile");
                _render(id, users);
            }}) ;
        }
    };
}());

