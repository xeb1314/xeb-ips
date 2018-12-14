//=============================================================================
//  Default.htm Pgae
//=============================================================================
jetsennet.valideLogin();	
jetsennet.correctIndexPage();
jetsennet.require([ "window", "bootstrap/bootstrap"]);
jetsennet.importCss(["bootstrap/bootstrap"]);

$(function() {    
    createNavigation();	//	生成导航
    initToolbar();// 初始化工具栏
    MyApp.init();//	布局
});

function initToolbar()
{
	var toolbar = new ToolBar(true);
	var barItem = new BarItem("", "images/toolbarimg/message.png", 9, 150);
	barItem.setHeader("您有6条未读消息...");
	barItem.addMenu(new BarMenu("CPU利用率过高", "images/toolbarimg/Liming.png", "JustNow", "中央大厅机房,主机IP：192.168.8.180", function(){alert("跳转到指定报警!");}));
	barItem.addMenu(new BarMenu("IP冲突", "images/toolbarimg/Liming.png", "2 Minute", "中央大厅机房,主机IP：192.168.8.180", function(){alert("跳转到指定报警!");}));
	barItem.addMenu(new BarMenu("CPU利用率过高", "images/toolbarimg/Liming.png", "JustNow", "中央大厅机房,主机IP：192.168.8.180", function(){alert("跳转到指定报警!");}));
	barItem.addMenu(new BarMenu("CPU利用率过高", "images/toolbarimg/Liming.png", "JustNow", "中央大厅机房,主机IP：192.168.8.180", function(){alert("跳转到指定报警!");}));
	barItem.addMenu(new BarMenu("IP冲突", "images/toolbarimg/Liming.png", "2 Minute", "中央大厅机房,主机IP：192.168.8.180", function(){alert("跳转到指定报警!");}));
	barItem.addMenu(new BarMenu("CPU利用率过高", "images/toolbarimg/Liming.png", "JustNow", "中央大厅机房,主机IP：192.168.8.180", function(){alert("跳转到指定报警!");}));
	barItem.addMenu(new BarMenu("CPU利用率过高", "images/toolbarimg/Liming.png", "JustNow", "中央大厅机房,主机IP：192.168.8.180", function(){alert("跳转到指定报警!");}));
	barItem.addMenu(new BarMenu("IP冲突", "images/toolbarimg/Liming.png", "2 Minute", "中央大厅机房,主机IP：192.168.8.180", function(){alert("跳转到指定报警!");}));
	barItem.addMenu(new BarMenu("CPU利用率过高", "images/toolbarimg/Liming.png", "JustNow", "中央大厅机房,主机IP：192.168.8.180", function(){alert("跳转到指定报警!");}));
	barItem.setFooter(new BarMenu("<span style='display:block; text-align:center;'>查看全部告警<p>", null, null, null, function(){alert("跳转到告警列表页面!");}));
	toolbar.addItem(barItem, true);
	toolbar.render().addClass("pull-right").css({"margin-right":"50px"}).appendTo($("#mytoolbar"));
}

/**
 * 创建导航
 * @param userFunctions
 */
function createNavigation(){
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
    var uFunctions = Data.format(serializeDatas, "PARENT_ID", "ID", "0");
    NavigationUtil.show(uFunctions, $("#mynavigation"));
}

/**
 * 打开页面
 * @param url
 * @param id
 */
function showContent(url, id){
	$('#JetsenMain').attr("src", "../../../" + url);
}

/**
 * 退出
 */
function doLogout(){
	jetsennet.logout();
}
