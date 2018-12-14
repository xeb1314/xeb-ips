var TempDefault = {};

/**
 * 版权信息
 */
TempDefault.name = "Jetsen媒体工作流平台";
if(new String(window.location.toString()).toLowerCase().lastIndexOf("index.htm")>0)
{
	TempDefault.right = "copyright      @2010-2015 北京捷成世纪科技股份有限公司          版本:V2.1.4";
	
	/**
	 * 应要求，顶部的布局宽度可以改变。 各个系统的logo大小可能不一致，各个系统的定制信息栏目个数可能不一样
	 */
	TempDefault.layout = {topLeft: 300, topRight:260};
	
	/**
	 * 右上方信息栏
	 * 
	 * 提示:可配置项title、css、img||font||content、badge、func
	 *      title、badge的取值可以是字符串，数字，也可以是方法。
	 *      当配置方法的时候，只需指定方法名称（不要用引号），该方法接收参数node（栏目的dom对象）
	 *      图标可以是图片也可以是字体（字体只支持Font-Awesome）
	 * img: "images/mainframe/message.PNG", font: "fa fa-envelope-o"
	 * font: "fa fa-question-circle"
	 */
	TempDefault.messagebox=[{title:"个人资料", img: "images/mainframe/user.PNG", func: showUserInfo},
	                        {title:"修改密码" , content: jetsennet.Application.userInfo.UserName, css: {"min-width": "50px", "max-width": "80px"}, func: changePassword},
	                        /*{title:"消息", img: "images/mainframe/message.PNG", badge: initBadge, hover: true, func: showMessage},
                        {title:"帮助", img: "images/mainframe/help.PNG", badge: 1,  func: showHelp},*/
	                        {title:"退出", font: "fa fa-sign-out", func: doLogout}];
	
	/*function showMessage(node)
{
    if(WindowUtil.isShow($("#my-message-list"))) {
        jetsennet.cancelBubble();
        return ;
    }
    if($("#my-message-list").length==0) {
        var barItem = new BarItem();
        barItem.height = 260;
        barItem.setHeader("您有6条未读消息...");
        barItem.addMenu(new BarMenu("CPU利用率过高", "images/user/default.png", "JustNow", "中央大厅机房,主机IP：192.168.8.180", function(){alert("跳转到指定报警!");}));
        barItem.addMenu(new BarMenu("IP冲突", "images/user/default.png", "2 Minute", "中央大厅机房,主机IP：192.168.8.180", function(){alert("跳转到指定报警!");}));
        barItem.addMenu(new BarMenu("CPU利用率过高", "images/user/default.png", "JustNow", "中央大厅机房,主机IP：192.168.8.180", function(){alert("跳转到指定报警!");}));
        barItem.addMenu(new BarMenu("CPU利用率过高", "images/user/default.png", "JustNow", "中央大厅机房,主机IP：192.168.8.180", function(){alert("跳转到指定报警!");}));
        barItem.addMenu(new BarMenu("IP冲突", "images/user/default.png", "2 Minute", "中央大厅机房,主机IP：192.168.8.180", function(){alert("跳转到指定报警!");}));
        barItem.addMenu(new BarMenu("CPU利用率过高", "images/user/default.png", "JustNow", "中央大厅机房,主机IP：192.168.8.180", function(){alert("跳转到指定报警!");}));
        barItem.addMenu(new BarMenu("CPU利用率过高", "images/user/default.png", "JustNow", "中央大厅机房,主机IP：192.168.8.180", function(){alert("跳转到指定报警!");}));
        barItem.addMenu(new BarMenu("IP冲突", "images/user/default.png", "2 Minute", "中央大厅机房,主机IP：192.168.8.180", function(){alert("跳转到指定报警!");}));
        barItem.addMenu(new BarMenu("CPU利用率过高", "images/user/default.png", "JustNow", "中央大厅机房,主机IP：192.168.8.180", function(){alert("跳转到指定报警!");}));
        barItem.setFooter(new BarMenu("<span style='display:block; text-align:center;'>查看全部告警<p>", null, null, null, function(){alert("跳转到告警列表页面!");}));
        var el = barItem.rendMenu().attr("id","my-message-list").appendTo("body");
        el.css({position:"absolute",right:"10px",top:"40px",height:"0px"});
    }
    WindowUtil.show($("#my-message-list"), {height: "335px"});
}
function showHelp(node)
{
    alert("相关帮助");
}
function initBadge(node)
{
    return 18;
}*/
	
	/**
	 * 右下方工具栏
	 * 
	 * 配置参照messagebox，可配置项：title、css、font||img、func
	 */
	TempDefault.toolbox=[/*{title: "我的任务", font: "fa fa-tasks", func: showTasks},
                     {title: "系统配置", font: "fa fa-cog", func: sysConfig},
                     {title: "在线用户", font: "fa fa-users", func: showUsers},*/
	                     {title: "日期时间", font: "fa fa-calendar", func: showDate}];
	
	/*function showTasks()
{
    alert("我的任务");
}
function sysConfig()
{
    alert("系统配置");
}
function showUsers()
{
    OnLineUser.list("divOnlineUserList");
}*/
	function showDate()
	{
		CalendarWidget.render("divCalendarWidget");
	}
}

