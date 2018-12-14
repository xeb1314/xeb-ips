//lixiaomin
//=============================================================================
// jetsennet.UI.Player
//=============================================================================	 
jetsennet.addLoadedUri(jetsennet.getloadUri("player"));
jetsennet.registerNamespace("jetsennet.ui");
//jetsennet.require("jplayer/jquery.jplayer");
//jetsennet.require("iviewer/jquery.iviewer");
jetsennet.ui.Players = {};
var gSysConfigs = {};
//playerType 1Video,2Audio,3Media,4Apple,5CheckPlayer,8VLC,20:pic, 21:pic-js, 31:doc-flexpaper,100:EmptyPlayer, 110:html5-video, 120:html5-audio
jetsennet.ui.createPlayer = function(con,playerType,playName)
{ 
    con = con?con:document.body;
    playerType = playerType?parseInt(playerType):0;
    if(playerType==1 || playerType==2){
    	playerType = (IS_IE)?playerType:(navigator.userAgent.toLowerCase().indexOf("windows")>=0?3:4);
    }        
    
    var player;
    if(playerType == 1)
    {
        player = new jetsennet.ui.McmPlayer(con);
    }
    else if(playerType == 2)
    {
        player =  new jetsennet.ui.AcmPlayer(con);
    }
    else if(playerType == 3)
    {
        player =  new jetsennet.ui.MediaPlayer(con);
    }
    else if(playerType == 4)
    {
        player =  new jetsennet.ui.ApplePlayer(con);
    }
    else if(playerType == 5)
    {
        player =  new jetsennet.ui.CheckPlayer(con);
    }
    else if(playerType == 8)
    {
        player = new jetsennet.ui.VlcPlayer(con);
    }
    else if(playerType == 20)
    {
        player =  new jetsennet.ui.PicPlayer(con);
    }
    else if(playerType == 21)
    {
        player =  new jetsennet.ui.PicJsPlayer(con);
    }
    else if(playerType == 31)
    {
        player =  new jetsennet.ui.DocFlexPlayer(con);
    }
    else if(playerType == 100)
    {
        player =  new jetsennet.ui.EmptyPlayer(con);
    }
    else if(playerType == 110)
    {
    	player =  new jetsennet.ui.html5VideoPlayer(con);
    }
    else if(playerType == 120)
    {
    	player =  new jetsennet.ui.html5AudioPlayer(con);
    }
    else
    {
        player = new jetsennet.ui.McmPlayer(con);
    }
    
    player.playerType = playerType;
    playName = playName?playName:"jetsenPlayer";
    jetsennet.ui.Players[playName] = player;
    return player;
};
//媒资播放器===================================================================
jetsennet.ui.MamPlayerBase = function()
{
    this.frameRate = 25;
    this.container = document.body; 
    this.player = null;   
};
jetsennet.ui.MamPlayerBase.prototype.setUrl = function(filePaths)
{
	if(!filePaths)
	{      
		this.player.OpenFile("");
		this.player.CloseFile();
	}
	else
	{	
	    var arrUrl = filePaths.split(';');
        filePaths = replaceMamRoot(arrUrl[0],gSysConfigs);
		if(this.player.GetPlayFile().toLowerCase()!= filePaths.toLowerCase())
		{
			this.player.OpenFile(filePaths);
			this.frameRate=this.player.GetFrameRate();     				
		}
	}
	return true;
};
jetsennet.ui.MamPlayerBase.prototype.play = function(){this.player.Play();};

jetsennet.ui.MamPlayerBase.prototype.cmBatchImport = function(xmlData){	return this.player.cmBatchImport(xmlData);};

jetsennet.ui.MamPlayerBase.prototype.pause = function(){this.player.Pause();};
jetsennet.ui.MamPlayerBase.prototype.closeFile = function(){this.player.CloseFile();};
jetsennet.ui.MamPlayerBase.prototype.seekTo = function(framePosition)
{	
	this.pause();	
	this.player.SeekTo(framePosition);
};
jetsennet.ui.MamPlayerBase.prototype.setPaths = function(paths)
{
	this.CurrentPaths = paths;
	var tempObjXml = new jetsennet.XmlDoc();
	tempObjXml.loadXML(paths);
	this.Objtype = tempObjXml.documentElement.getAttribute("type");//获取对象类型//1  视频编目  2 音频编目 3 图片编目 
};
jetsennet.ui.MamPlayerBase.prototype.getFileInfo = function(fileInfo){try{return this.player.GetPlayFileInfo(fileInfo);}catch(ex){return "";}};
jetsennet.ui.MamPlayerBase.prototype.getMediaInfo = function(fileInfo){try{return this.player.GetMediaInfo(fileInfo);}catch(ex){return "";}};
jetsennet.ui.MamPlayerBase.prototype.openFileDialog = function(){return this.player.OpenFileDialog();};
jetsennet.ui.MamPlayerBase.prototype.openSingleFileDialog = function(){return this.player.openSingleFileDialog();};
jetsennet.ui.MamPlayerBase.prototype.getDiskFreeSpace = function(diskPath){try{return this.player.GetDiskFreeSpace(diskPath);}catch(ex){return 0;}};
jetsennet.ui.MamPlayerBase.prototype.grabFrame = function(filePath){this.player.grabFrame(0,filePath,1,0,0);};
jetsennet.ui.MamPlayerBase.prototype.getPosition = function(){return this.player.GetPosition();};
jetsennet.ui.MamPlayerBase.prototype.setInOutPoint = function(inPoint, outPoint){this.player.SetCtrlRange(inPoint, outPoint);};
jetsennet.ui.MamPlayerBase.prototype.getInPoint = function(){return this.player.GetInPoint();};
jetsennet.ui.MamPlayerBase.prototype.getOutPoint = function(){ return this.player.GetOutPoint();};
jetsennet.ui.MamPlayerBase.prototype.getDuration = function(isPoint){var inPoint = this.getInPoint();var outPoint = this.getOutPoint();return ( outPoint - inPoint + 1);};
jetsennet.ui.MamPlayerBase.prototype.setSize = function(width,height){return null;};

//视频播放器===================================================================
jetsennet.ui.McmPlayer = function(con)
{
   this.container = con?con:document.body;
};
jetsennet.ui.McmPlayer.prototype = new jetsennet.ui.MamPlayerBase();

jetsennet.ui.McmPlayer.prototype.initPlayer = function(fileName)
{
    fileName = fileName?fileName:"";
    this.container.innerHTML = '<object id="mcmplayer" name="xplayer" width="100%" height="100%" classid="clsid:8996D56A-6465-4F63-91E1-36EC63ACFB15" ></object>';
    this.player = el("mcmplayer");
};

jetsennet.ui.McmPlayer.prototype.grabFrame = function(filePath,pos){
	pos = pos ? pos :0;
	this.player.grabFrame(pos,filePath,1,0,0);
};

//html5 video player
var videoPlayerHtml = '<div class="jp-type-single" style=" background:#111111;">'+
					 '  <div id="jquery_jplayer_1" class="jp-jplayer"></div>'+
					 '  <div class="jp-gui">'+
					 '    <div class="jp-video-play" style=" background:#111111;">'+
					 '      <a href="javascript:;" class="jp-video-play-icon">播放</a>'+
					 '    </div>'+
					 '    <div class="jp-interface">'+
					 '      <div class="time_bg" id="realTime" style ="display:none;"></div>'+
					 '      <div class="time_rd" id="inpoint" style ="display:none;"></div>'+
					 '      <div class="time_cd" id="outpoint" style ="display:none;"></div>'+
					 '      <div class="jp-progress"><div class="jp-seek-bar" id="playBar"><div class="jp-play-bar"></div></div></div>'+
					 '      <div class="jp-current-time"></div>'+
					 '      <div class="jp-duration"></div>'+
					 '      <div class="jp-controls-holder">'+
					 '        <ul class="jp-controls">'+
					 '          <li><a href="javascript:;" class="left01" id="goHead">到头部</a></li>'+
					 '          <li><a href="javascript:;" class="left02" id="goInPoint">到入点</a></li>'+
					 '          <li><a href="javascript:;" class="left03" id="setInPoint">打入点</a></li>'+
					 '          <li><a href="javascript:;" class="jp-play">播放</a></li>'+
					 '          <li><a href="javascript:;" class="jp-pause">停止</a></li>'+
					 '          <li><a href="javascript:;" class="right03" id="setOutPoint">打出点</a></li>'+
					 '          <li><a href="javascript:;" class="right02" id="goOutPoint">到出点</a></li>'+
					 '          <li><a href="javascript:;" class="right01" id="goTail">到尾部</a></li>'+
					 '        </ul>'+
					 '        <ul class="jp-toggles">'+
					 '          <li><a href="javascript:;" class="jp-mute" title="mute">静音</a></li>'+
					 '          <li><a href="javascript:;" class="jp-unmute" title="mute">取消静音</a></li>'+
					 '          <li><a href="javascript:;" class="jp-full-screen" title="full screen">全屏</a></li>'+
					 '          <li><a href="javascript:;" class="jp-restore-screen" title="restore screen">退出全屏</a></li>'+
					 '        </ul>'+
					 '        <div class="jp-volume-bar"><div class="jp-volume-bar-value"></div></div>'+
					 '      </div>'+
					 '    </div>'+
					 '  </div>'+
					 '  <div class="jp-no-solution">该浏览器不支持HTML5播放器，请升级您的浏览器或更换播放器!</div>'+
					 '</div>';
jetsennet.ui.html5VideoPlayer = function(con){
	this.container = con?con:document.body;
	this.inPoint = 0;
	this.outPoint = 0;
};
jetsennet.ui.html5VideoPlayer.prototype.initPlayer = function(){
	jetsennet.importCss("jplayer/jplayer");
	jetsennet.require("jplayer/jquery.jplayer");	
	$(this.container).addClass("jp-video");
	$(this.container).html(videoPlayerHtml);
	//this.container.innerHTML = videoPlayerHtml;
	this.player = $("#jquery_jplayer_1");
	var self = this;
	self.ready = false;
	this.player.jPlayer({
		ready : function(){self.ready = true;},
		swfPath : jetsennet.baseUrl + "jplayer/",
		supplied : "m4v",
		smoothPlayBar : true,
		keyEnabled : false,
		preload : true,
		timeFormat : {
			showFrame : true,
			frameRate : 25
		},
		resize: function(event){
			self.inPoint>0? self.setInPoint(self.inPoint):"";
			self.outPoint>0? self.setOutPoint(self.outPoint):"";
		}
	});	
	
	$("#goHead").bind("click",function(){
		self.seekTo(0);
	});
	
	
	$("#goTail").bind("click",function(){
		self.seekTo(self.player.data('jPlayer').status.duration);
	});
	
	$("#setInPoint").bind("click",function(){
		self.setInPoint(self.player.data('jPlayer').status.currentTime);		
	});
	
	$("#setOutPoint").bind("click",function(){
		self.setOutPoint(self.player.data('jPlayer').status.currentTime);		
	});
	
	$("#goInPoint").bind("click",function(){
		self.inPoint>0?self.seekTo(self.inPoint):"";		
	});
	
	$("#goOutPoint").bind("click",function(){
		self.outPoint>0?self.seekTo(self.outPoint):"";	
	});
	
	$("#playBar").mousemove(function(e){
		var width = self.player.width();
		var time = e.offsetX/width *self.player.data('jPlayer').status.duration;
		time = $.jPlayer.convertTime(time); 
		var postion = e.offsetX>(width-66)? width-66 : e.offsetX-33;
		postion = postion<33?0:postion;
		$("#realTime").html("<a>"+time+"</a>").css("left",postion+"px").show();
	}).mouseout(function(e){
		$("#realTime").hide();
	});
	
};
jetsennet.ui.html5VideoPlayer.prototype.setUrl = function(filePath){
	if(arguments.length==0){
		alert("请传入播放文件路径！");
		return false;
	}
	if(this.ready){
		this.player.jPlayer("setMedia",{
			m4v : filePath
		}).jPlayer("load");
	}else{
		this.player.bind($.jPlayer.event.ready,function(event){
			$(this).jPlayer("setMedia",{
				m4v : filePath
			}).jPlayer("load");
		});
	}
};

//秒
jetsennet.ui.html5VideoPlayer.prototype.seekTo = function(position){
	this.player.jPlayer("pause",position);
};

jetsennet.ui.html5VideoPlayer.prototype.getInPoint = function(){
	return this.inPoint;
};

jetsennet.ui.html5VideoPlayer.prototype.getOutPoint = function(){
	return this.outPoint;
};

jetsennet.ui.html5VideoPlayer.prototype.setInPoint = function(inPoint){
	if(inPoint<=0){
		alert("入点须大于0");
		return false;
	}
	this.inPoint = inPoint;
	var width = $("#jquery_jplayer_1").width();
	var postion = this.inPoint/this.player.data('jPlayer').status.duration*width-3;
	$("#inpoint").css("left",postion+"px").show();
	if(this.inPoint>=this.outPoint){ //设置入点>=出点时，将出点置空
		this.outPoint = 0;
		$("#outpoint").hide();
	}
};

jetsennet.ui.html5VideoPlayer.prototype.setOutPoint = function(outPoint){
	var duration = this.player.data('jPlayer').status.duration;
	if(outPoint>=duration){
		alert("出点须小于总时长");
		return false;
	}
	this.outPoint = outPoint;
	var width = $("#jquery_jplayer_1").width();
	var postion = this.outPoint/duration*width-6;
	$("#outpoint").css("left",postion+"px").show();
	if(this.outPoint<=this.inPoint){ //设置出点<=入点时，将入点置空
		this.inPoint =0;
		$("#inpoint").hide();
	}
};

jetsennet.ui.html5VideoPlayer.prototype.closeFile = function(){
	this.player.jPlayer("clearMedia");
};


jetsennet.ui.html5VideoPlayer.prototype.play = function(position){
	arguments.length==1? this.player.jPlayer("play",position):this.player.jPlayer("play",this.player.data('jPlayer').status.currentTime);
};

jetsennet.ui.html5VideoPlayer.prototype.pause = function(position){
	arguments.length==1? this.player.jPlayer("pause",position):this.player.jPlayer("pause",this.player.data('jPlayer').status.currentTime);
};

jetsennet.ui.html5VideoPlayer.prototype.getCurrentTime = function(){
	return this.player.data('jPlayer').status.currentTime;
};

//html5 audio player
var audioPlayerHtml = '<div class="jp-type-single" style=" background:#111111;">'+
					 '  <div id="jquery_jplayer_1" class="jp-jplayer"></div>'+
					 '  <div class="jp-gui">'+
					 '    <div class="jp-video-play" style=" background:#111111;">'+
					 '      <a href="javascript:;" class="jp-video-play-icon">播放</a>'+
					 '    </div>'+
					 '    <div class="jp-interface">'+
					 '      <div class="time_bg" id="realTime" style ="display:none;"></div>'+
					 '      <div class="time_rd" id="inpoint" style ="display:none;"></div>'+
					 '      <div class="time_cd" id="outpoint" style ="display:none;"></div>'+
					 '      <div class="jp-progress"><div class="jp-seek-bar" id="playBar"><div class="jp-play-bar"></div></div></div>'+
					 '      <div class="jp-current-time"></div>'+
					 '      <div class="jp-duration"></div>'+
					 '      <div class="jp-controls-holder">'+
					 '        <ul class="jp-controls">'+
					 '          <li><a href="javascript:;" class="left01" id="goHead">到头部</a></li>'+
					 '          <li><a href="javascript:;" class="left02" id="goInPoint">到入点</a></li>'+
					 '          <li><a href="javascript:;" class="left03" id="setInPoint">打入点</a></li>'+
					 '          <li><a href="javascript:;" class="jp-play">播放</a></li>'+
					 '          <li><a href="javascript:;" class="jp-pause">停止</a></li>'+
					 '          <li><a href="javascript:;" class="right03" id="setOutPoint">打出点</a></li>'+
					 '          <li><a href="javascript:;" class="right02" id="goOutPoint">到出点</a></li>'+
					 '          <li><a href="javascript:;" class="right01" id="goTail">到尾部</a></li>'+
					 '        </ul>'+
					 '        <ul class="jp-toggles">'+
					 '          <li><a href="javascript:;" class="jp-mute" title="mute">静音</a></li>'+
					 '          <li><a href="javascript:;" class="jp-unmute" title="mute">取消静音</a></li>'+
					 '          <li style="visibility:hidden"><a href="javascript:;" class="jp-full-screen" title="full screen">全屏</a></li>'+
					 '          <li style="visibility:hidden"><a href="javascript:;" class="jp-restore-screen" title="restore screen">退出全屏</a></li>'+
					 '        </ul>'+
					 '        <div class="jp-volume-bar"><div class="jp-volume-bar-value"></div></div>'+
					 '      </div>'+
					 '    </div>'+
					 '  </div>'+
					 '  <div class="jp-no-solution">该浏览器不支持HTML5播放器，请升级您的浏览器或更换播放器!</div>'+
					 '</div>';
jetsennet.ui.html5AudioPlayer = function(con){
	this.container = con?con:document.body;
	this.inPoint = 0;
	this.outPoint = 0;
};
jetsennet.ui.html5AudioPlayer.prototype.initPlayer = function(){	
	jetsennet.importCss("jplayer/jplayer");
	jetsennet.require("jplayer/jquery.jplayer");
	
	$(this.container).addClass("jp-video");
	$(this.container).html(audioPlayerHtml);
	//this.container.innerHTML = audioPlayerHtml;
	this.player = $("#jquery_jplayer_1");
	var self = this;
	self.ready = false;
	this.player.jPlayer({
		ready : function(){ self.ready =true;},
		swfPath : jetsennet.baseUrl + "jplayer/",
		supplied : "mp3",
		smoothPlayBar : true,
		keyEnabled : false,
		preload : true,
		timeFormat : {
			showFrame : false
		},
		resize: function(event){
			self.inPoint>0? self.setInPoint(self.inPoint):"";
			self.outPoint>0? self.setOutPoint(self.outPoint):"";
		}
	});	
	
	$("#goHead").bind("click",function(){
		self.seekTo(0);
	});
	
	
	$("#goTail").bind("click",function(){
		self.seekTo(self.player.data('jPlayer').status.duration);
	});
	
	$("#setInPoint").bind("click",function(){
		self.setInPoint(self.player.data('jPlayer').status.currentTime);		
	});
	
	$("#setOutPoint").bind("click",function(){
		self.setOutPoint(self.player.data('jPlayer').status.currentTime);		
	});
	
	$("#goInPoint").bind("click",function(){
		self.inPoint>0?self.seekTo(self.inPoint):"";		
	});
	
	$("#goOutPoint").bind("click",function(){
		self.outPoint>0?self.seekTo(self.outPoint):"";	
	});
	
	$("#playBar").mousemove(function(e){
		var width = self.player.width();
		var time = e.offsetX/width *self.player.data('jPlayer').status.duration;
		time = $.jPlayer.convertTime(time); 
		var postion = e.offsetX>(width-66)? width-66 : e.offsetX-33;
		postion = postion<33?0:postion;
		$("#realTime").html("<a>"+time+"</a>").css("left",postion+"px").show();
	}).mouseout(function(e){
		$("#realTime").hide();
	});
};
jetsennet.ui.html5AudioPlayer.prototype.setUrl = function(filePath,imgPath){
	if(arguments.length==0){
		alert("请传入播放文件路径！");
		return false;
	}
	if(this.ready){
		this.player.jPlayer("setMedia",{
			mp3 : filePath
		}).jPlayer("load");
	}else{
		this.player.bind($.jPlayer.event.ready,function(event){
			$(this).jPlayer("setMedia",{
				mp3 : filePath
			}).jPlayer("load");
		});
	}
	
	imgPath = imgPath?imgPath:(jetsennet.baseThemeUrl + "jplayer/audio.jpg");
	this.player.css('background-image','url('+imgPath+')').css('background-repeat','no-repeat').css('background-position','center');
};

//秒
jetsennet.ui.html5AudioPlayer.prototype.seekTo = function(position){
	this.player.jPlayer("pause",position);
};

jetsennet.ui.html5AudioPlayer.prototype.getInPoint = function(){
	return this.inPoint;
};

jetsennet.ui.html5AudioPlayer.prototype.getOutPoint = function(){
	return this.outPoint;
};

jetsennet.ui.html5AudioPlayer.prototype.setInPoint = function(inPoint){
	if(inPoint<=0){
		alert("入点须大于0");
		return false;
	}
	this.inPoint = inPoint;
	var width = $("#jquery_jplayer_1").width();
	var postion = this.inPoint/this.player.data('jPlayer').status.duration*width-3;
	$("#inpoint").css("left",postion+"px").show();
	if(this.inPoint>=this.outPoint){ //设置入点>=出点时，将出点置空
		this.outPoint = 0;
		$("#outpoint").hide();
	}
};

jetsennet.ui.html5AudioPlayer.prototype.setOutPoint = function(outPoint){
	var duration = this.player.data('jPlayer').status.duration;
	if(outPoint>=duration){
		alert("出点须小于总时长");
		return false;
	}
	this.outPoint = outPoint;
	var width = $("#jquery_jplayer_1").width();
	var postion = this.outPoint/duration*width-6;
	$("#outpoint").css("left",postion+"px").show();
	if(this.outPoint<=this.inPoint){ //设置出点<=入点时，将入点置空
		this.inPoint =0;
		$("#inpoint").hide();
	}
};

jetsennet.ui.html5AudioPlayer.prototype.closeFile = function(){
	this.player.jPlayer("clearMedia");
};


jetsennet.ui.html5AudioPlayer.prototype.play = function(position){
	arguments.length==1? this.player.jPlayer("play",position):this.player.jPlayer("play",this.player.data('jPlayer').status.currentTime);
};

jetsennet.ui.html5AudioPlayer.prototype.pause = function(position){
	arguments.length==1? this.player.jPlayer("pause",position):this.player.jPlayer("pause",this.player.data('jPlayer').status.currentTime);
};

jetsennet.ui.html5AudioPlayer.prototype.getCurrentTime = function(){
	return this.player.data('jPlayer').status.currentTime;
};
//音频播放器===================================================================
jetsennet.ui.AcmPlayer = function(con)
{    
    this.container = con?con:document.body;
    this.frameRate = 1000;
};
jetsennet.ui.AcmPlayer.prototype = new jetsennet.ui.MamPlayerBase();

jetsennet.ui.AcmPlayer.prototype.initPlayer = function(fileName)
{
    fileName = fileName?fileName:"";
    this.container.innerHTML = '<object id="acmplayer" name="xplayer" width="100%" height="100%" classid="clsid:ae38d52e-5219-4e4b-bb14-24f0ce3dff86"  viewastext="viewastext"><param name="autostart" value="0" /><param name="uimode" value="full" /><param name="stretchToFit" value="true" /></object>';
    this.player = el("acmplayer");
};
//jetsennet.ui.AcmPlayer.prototype.setInOutPoint = function(inPoint, outPoint){this.player.SetCtrlRange(inPoint, outPoint);};
jetsennet.ui.AcmPlayer.prototype.seekTo = function(millsecond){this.pause();this.player.SeekTo(millsecond);};

//Media播放器===================================================================
jetsennet.ui.MediaPlayer = function(con)
{    
    this.frameRate = 25;
    this.container = con?con:document.body;
    this.player = null;     
};

jetsennet.ui.MediaPlayer.prototype.initPlayer = function(fileName)
{
    fileName = fileName?fileName:"";
    this.container.innerHTML = '<object id="mediaplayer" name="xplayer" width="100%" height="100%" classid="clsid:6bf52a52-394a-11d3-b153-00c04f79faa6" type="application/x-oleobject" viewastext="viewastext"><param name="autostart" value="0" /><param name="uimode" value="full" /><param name="stretchToFit" value="true" /><param name="filename"   value="'+fileName+'"> </object>';
    this.player = el("mediaplayer");
};

jetsennet.ui.MediaPlayer.prototype.setUrl = function(filePaths)
{
    if(!IS_IE && this.player.controls==null)
        return;
    this.pause();
    
    filePaths = filePaths?filePaths:"";

    if (filePaths!="")
    {
        var arrUrl = filePaths.split(';');
	    filePaths = arrUrl[0];
    }
    
	if(filePaths=="" || !jetsennet.isIE())
	{          
		this.initPlayer(filePaths);		
	}
	else
	{	
	    filePaths = replaceMamRoot(filePaths,gSysConfigs);
		if(this.player.Url.toLowerCase()!= filePaths.toLowerCase())
		{
			this.player.Url = filePaths;    //Media Player
        }
	}
	return true;
};
jetsennet.ui.MediaPlayer.prototype.play = function(){this.player.controls.play();};
jetsennet.ui.MediaPlayer.prototype.openFileDialog = function(){this.player.OpenFileDialog();};
jetsennet.ui.MediaPlayer.prototype.openSingleFileDialog = function(){this.player.OpenFileDialog();};
jetsennet.ui.MediaPlayer.prototype.closeFile = function(){};
jetsennet.ui.MediaPlayer.prototype.getDiskFreeSpace = function(diskPath){return 10;};
jetsennet.ui.MediaPlayer.prototype.grabFrame = function(){return null;};
jetsennet.ui.MediaPlayer.prototype.getPosition = function(){return this.player.controls.currentPosition*this.frameRate;};
jetsennet.ui.MediaPlayer.prototype.pause = function(){this.player.controls.stop();};
jetsennet.ui.MediaPlayer.prototype.seekTo = function(millsecond)
{
	if(this.player.openState!=13)
	{  //13 open state
		this.play();      
		if(this.player.openState!=6)
		{   //6 open but no flow state		   
			//setTimeout('jetsennet.ui.Players[\"jetsenPlayer\"].seekTo(\"'+hmsfOrFrameCount+'\");',500);			   
		}		
	}
	else
	{
		if(this.player.playState == 3)
		{  //3 play state
			this.pause();
		}
	}
	this.player.controls.currentPosition = parseInt(millsecond/this.frameRate); 
};
jetsennet.ui.MediaPlayer.prototype.setInOutPoint = function(inPoint, outPoint){/*会出错this.player.SetCtrlRange(inPoint, outPoint);*/};
jetsennet.ui.MediaPlayer.prototype.getInPoint = function()
{
    try
    {
        return this.player.GetInPoint();
        
    }
    catch(ex)
    {
        return 0;
    }
};
jetsennet.ui.MediaPlayer.prototype.getOutPoint = function()
{
    try
    {
        return this.player.GetOutPoint();        
    }
    catch(ex)
    {
        return 0;
    }
};
jetsennet.ui.MediaPlayer.prototype.getDuration = function(isPoint){
    try
    {
        var inPoint = this.getInPoint();
        var outPoint = this.getOutPoint();
        return ( outPoint - inPoint + 1);  // 实长 = 出点 - 入点 + 1         
    }
    catch(ex)
    {
        return 0;
    }
};
jetsennet.ui.MediaPlayer.prototype.setSize = function(width,height){return null;};
jetsennet.ui.MediaPlayer.prototype.getMediaInfo = function(){return "";};
jetsennet.ui.MediaPlayer.prototype.getFileInfo = function(){return "";};

//Apple播放器===================================================================
jetsennet.ui.ApplePlayer = function(con)
{   
    this.frameRate = 25;
    this.container = con?con:document.body;
    this.player = null; 
    this.slider = {};   //播放器滚动条
    this.playtime=null; //显示播放时间
    this.frameRate = 25;  
    this.sliderInterval=null;  //setInterval 时间句柄
    this.sleep=1000;
    this.playingState=false; //设置播放状态
	this.setSliderState=false;
	this.playFile = "";
};
jetsennet.ui.ApplePlayer.prototype.initPlayer = function(fileName)
{ 
    fileName = fileName?fileName:"";
    var _baseThemeUrl=jetsennet.baseThemeUrl;

    var _height=this.container.clientHeight ?this.container.clientHeight-80:252;
    var contentHtml = [];     
    contentHtml.push("<div style='width: 100%;height: 100%;background-color: Black;border:0px solid #999;LETTER-SPACING: 0px;LINE-HEIGHT: 0px;overflow:hidden;background:white; '>"); 
    contentHtml.push("<div style='width:100%;height:" + _height+ "px;background-color: black;' id='div_xplayer' name='div_xplayer' align='center'></div>");
    
    jetsennet.require(["js_datetime","js_slider"]);
    contentHtml.push("<div style='min-height: 80px;' id='jetsen-player-control'>");
    contentHtml.push("<div style='width:100%; height:4px'></div><div style='width: 100%; background-color: lightgrey; height: 20px;'>");
    contentHtml.push("    <div class='slider' id='slider-1' tabindex='1' style='width: 99%; height: 14px; float: right'>");
    contentHtml.push("            <input class='slider-input' id='slider-input-1' name='slider-input-1' /></div></div>");
    contentHtml.push("    <div align='center' style='width: 100%; background-color: lightgrey; background-image: url(" + _baseThemeUrl  + "images/playimages/back.gif);");
    contentHtml.push("       min-height: 54px; height: 60px; '>");
    contentHtml.push("     <div style='float: none;'>");
    contentHtml.push("          <img style='cursor: pointer' align='absmiddle' src='" + _baseThemeUrl  + "images/playimages/gohead.gif' id='imgGoHead' onclick=jetsennet.ui.Players['jetsenPlayer'].goHead() title='到头部'>");
    contentHtml.push("          <img style='cursor: pointer' align='absmiddle' src='" + _baseThemeUrl  + "images/playimages/goinpoint.gif' id='Img3' onclick=jetsennet.ui.Players['jetsenPlayer'].goToinPoint() title='到入点'>");
    contentHtml.push("          <img style='cursor: pointer' align='absmiddle' src='" + _baseThemeUrl  + "images/playimages/previous.gif' id='imgPrevious' onclick=jetsennet.ui.Players['jetsenPlayer'].previous() title='快退'>");
    contentHtml.push("          <img style='cursor: pointer' align='absmiddle' src='" + _baseThemeUrl  + "images/playimages/play.gif' id='imgPlayOrPause' onclick=jetsennet.ui.Players['jetsenPlayer'].play()  title='播放'>");
    contentHtml.push("          <input type='text' id='txt_time' value='00:00:00:00' style='width: 70px; text-align: center;height: 16px; border-bottom-style: none; background-color: Black; color: #ffffff;' readonly>");
    contentHtml.push("          <img style='cursor: pointer' align='absmiddle' src='" + _baseThemeUrl  + "images/playimages/next.gif' id='imgNext' onclick=jetsennet.ui.Players['jetsenPlayer'].next()   title='快进'>");
    contentHtml.push("          <img style='cursor: pointer' align='absmiddle' src='" + _baseThemeUrl  + "images/playimages/gooutpoint.gif' id='Img4' onclick=jetsennet.ui.Players['jetsenPlayer'].goTooutPoint()  title='到出点'>");
    contentHtml.push("          <img style='cursor: pointer' align='absmiddle' src='" + _baseThemeUrl  + "images/playimages/gotail.gif' id='imgGoTail' onclick=jetsennet.ui.Players['jetsenPlayer'].goTail()  title='到尾部'><br />");
    contentHtml.push("          <div style='float: left'>");
    contentHtml.push("          <div style='float: left'>");
    contentHtml.push("              <img align='absmiddle' src='" + _baseThemeUrl  + "images/playimages/cliplength1.gif' id='Img5'>");
    contentHtml.push("              <input type='text' id='txt_AP_SumFrames' value='00:00:00:00' style='width: 70px;text-align: center; height: 16px; border-bottom-style: none; background-color: Black;color: #ffffff;'  title='总时长度' readonly>");
    contentHtml.push("              <img style='cursor: pointer' align='absmiddle' src='" + _baseThemeUrl  + "images/playimages/SetInPoint.gif' id='Img1' onclick=jetsennet.ui.Players['jetsenPlayer'].setinPoint()  title='设置入点'>");
    contentHtml.push("		        <input type='text' id='txt_AP_InPoint' value='00:00:00:00' style='width: 70px;text-align: center; height: 14px; border-bottom-style: none; background-color: Black;color: #ffffff;'  title='入点位置' readonly>");
    contentHtml.push("           </div>");
    contentHtml.push("          <div style='float: right'>");
    contentHtml.push("              <img style='cursor: pointer' align='absmiddle' src='" + _baseThemeUrl  + "images/playimages/setoutpoint.gif' id='Img2' onclick=jetsennet.ui.Players['jetsenPlayer'].setoutPoint()  title='设置出点' readonly>");
    contentHtml.push("              <input type='text' id='txt_AP_OutPoint' value='00:00:00:00' style='width: 70px; text-align: center;height: 14px; border-bottom-style: none; background-color: Black; color: #ffffff;'  title='出点位置' readonly>");
    contentHtml.push("              <img align='absmiddle' src='" + _baseThemeUrl  + "images/playimages/cliplength.gif'id='Img6'>");
    contentHtml.push("              <input type='text' id='txt_AP_DURATION' value='00:00:00:00' style='width: 70px; text-align: center;height: 14px; border-bottom-style: none; background-color: Black; color: #ffffff;' title='素材长度' readonly>");
    contentHtml.push("          </div>");
    contentHtml.push("      </div>");
    contentHtml.push("  </div>");
    contentHtml.push("</div></div>"); 
           
    this.container.innerHTML = contentHtml.join("");
    this.slider = new jetsennet.ui.Slider(el('slider-1'), el('slider-input-1'));
    this.slider.setMinimum(0);
	
	if(IS_SAFARI)
	{
//        var xplayer = document.createElement("embed");
//        xplayer.type = "video/quicktime";
//        xplayer.id = "xplayer";
//        xplayer.src = "default.mp4";
//        xplayer.style.width ="100%";
//        xplayer.style.height ="100%";	
//        xplayer.autoplay = "no";
//        xplayer.showlog = "false";
//        xplayer.loop = "no";
//        xplayer.toolbar = "no";	
//        el('div_xplayer').appendChild(xplayer);//controller="true" autostart="false" autoplay="true"  showlogo="false" scale="tofit"
	      el('div_xplayer').innerHTML = '<object  type="video/quicktime" id="xplayer" ><embed src="none.mp4" type="video/quicktime"  enablejavascript="true"  postdomevents="true" width="100%" height="100%" /></object>';
    }
    else
    {
        var xplayer = document.createElement("embed");
        xplayer.type = "application/jnet-player-plugin";
	    xplayer.id = "xplayer";
        xplayer.style.width ="100%";
        xplayer.style.height ="100%";	
        xplayer.autostart = "no";
	    xplayer.autoplay = "no";
	    xplayer.loop = "no";
	    xplayer.toolbar = "yes";	  
	    el('div_xplayer').appendChild(xplayer);
	}
	
    this.player = el("xplayer");	   
    this.playtime=el("txt_time");    
    var _slider = this.slider;
    var _player=this.player;
    var _owner = this;
    
    if (fileName!="")
    {
      this.setUrl(fileName);
    }    
	
    this.slider.onchange = function ()
    {
        if (this.setSliderState){
	        return;
        }
        var s_index= parseInt(_slider.getValue());  
        var xplayer_time= _owner.getPosition(); 
        var diff = 10;//IS_SAFARI?1500:10;
        if (Math.abs(s_index- xplayer_time)>=diff || _owner.playingState==false )
        {      
            _owner.pause();
            _owner.seekTo(s_index);				
            _owner.playtime.value=jetsennet.util.convertLongToTime(s_index,_owner.frameRate);    
            if(_owner.playingState)
            {	_owner.playingState=false;
                _owner.setShowImg();
            }
        }
    };  
    if(IS_SAFARI)
	{
	    if(this.sliderInterval!=null)
	    {
	        window.clearInterval(this.sliderInterval);
	    }
        this.sliderInterval=setInterval(function(){_owner.refurbishSlider();},this.sleep/this.frameRate );///this.frameRate   
    }  
};
jetsennet.ui.ApplePlayer.prototype.setSize = function(width,height)
{  
    this.player.style.width ="100%";
    el('div_xplayer').style.height =(height-80) +"px";	
    this.player.style.height =(height-80) +"px";
};
jetsennet.ui.ApplePlayer.prototype.setUrl = function(url)
{  
    this.playFile = url;
    if(IS_SAFARI)
    {
        this.stop();
        this.player.SetURL(url);        		
		
		el('txt_AP_InPoint').value="00:00:00:00";
	    el('txt_AP_SumFrames').value="00:00:00:00";
	    el('txt_AP_DURATION').value="00:00:00:00";
	    el('txt_AP_OutPoint').value="00:00:00:00";
	    this.playtime.value="00:00:00:00";
		this.playingState=false;		
		this.slider.setValue(0);		
        return;
    }
	if(!url)
	{      
	    this.stop();
		this.player.OpenFile("");
		this.player.CloseFile();
		this.slider.setValue(0);   
		el('txt_AP_SumFrames').value="00:00:00:00";
		el('txt_AP_OutPoint').value="00:00:00:00";
		el('txt_AP_DURATION').value="00:00:00:00";
		el('txt_AP_InPoint').value="00:00:00:00";
		this.player.title="";		
	}
	else
	{	
		if (url.trim().substring(0,1)!="<" )
        {
			if ( url.trim().substring(0,1)!="/")
			{
				 url=replaceMamRoot(url,gSysConfigs);
			}		   
		    url=url.replaceAll("\\\\","/" );
		}
		else
		{
		    var _url = this.getPlayFile();
		    if(_url && _url!="")
		        url = _url;
		}         
		this.slider.setValue(0);   
		
		this.player.title=url;
		var remsg=this.player.OpenFile(url);
		
		if (!remsg) {	
			el('txt_AP_SumFrames').value="00:00:00:00";
			el('txt_AP_OutPoint').value="00:00:00:00";
			el('txt_AP_DURATION').value="00:00:00:00";
			el('txt_AP_InPoint').value="00:00:00:00";				
			return false;
		}
		this.frameRate=this.player.GetFrameRate();  
		var _SumFrames=this.getSumFrames();
					
		el('txt_AP_SumFrames').value=jetsennet.util.convertLongToTime(_SumFrames ,this.frameRate);
		el('txt_AP_InPoint').value="00:00:00:00"; 			
		el('txt_AP_OutPoint').value=jetsennet.util.convertLongToTime(_SumFrames-1 ,this.frameRate); 
		el('txt_AP_DURATION').value=jetsennet.util.convertLongToTime(_SumFrames ,this.frameRate); 
		
		this.playtime.value="00:00:00:00";
		this.playingState=false;
		this.slider.setMaximum(_SumFrames);
	}
	return true;
};
jetsennet.ui.ApplePlayer.prototype.refurbishSlider =function ()
{
    var duration = this.getSumFrames();
    if(IS_SAFARI)
    {
//        var control = el('jetsen-player-control');
//        if(control)
//        {
//            if(duration==0)
//            {
//                control.style.display = "none";
//            }
//            else
//            {
//                control.style.display = "";
//            }
//        }
    }
    
    if (this.playing())  //滑动滚动条
    {  
        var duration=parseInt(duration);
        this.slider.setMinimum(0);
        if(IS_SAFARI)
        {
            this.slider.setMaximum(duration);              
            el('txt_AP_DURATION').value=jetsennet.util.convertLongToTime(duration ,this.frameRate); 
            el('txt_AP_OutPoint').value=jetsennet.util.convertLongToTime(duration ,this.frameRate); 
            el('txt_AP_SumFrames').value=jetsennet.util.convertLongToTime(duration ,this.frameRate);      
        }
        var position = this.getPosition();
        this.playtime.value= jetsennet.util.convertLongToTime(position,this.frameRate); //jetsennet.util.convertLongToTime(duration).substring(0,8);
        this.slider.setValue(position);
        if (duration>1 && Math.abs(duration-position)<0.5) {
            this.playingState=false;
	        this.setShowImg();	
	    }	
    }
    else if ( this.playingState  )
    {
		 this.playtime.value= jetsennet.util.convertLongToTime(duration,this.frameRate);
		 this.playingState=false;
		 this.setShowImg();	
    }
};
jetsennet.ui.ApplePlayer.prototype.play = function()
{	
    var _owner = this;    
    
    if(this.getPlayFile()=="") {       
        return;    
    }         
    
    if (this.playing()){
        this.pause();  //停止
        return;
    }
    
    var duration = this.getSumFrames();
	if (duration>0 && duration==this.getPosition())
	{  //已经播放到最后1帧        
		this.seekTo(0);		
	}
	
    this.playingState=true;
    //this.player.Play(); //播放
    el("xplayer").Play();
    this.setShowImg();  
	   
	if(!IS_SAFARI)
	{
	    if(this.sliderInterval!=null)
	    {
	        window.clearInterval(this.sliderInterval);
	    }
        this.sliderInterval=setInterval(function(){_owner.refurbishSlider();},this.sleep/this.frameRate );///this.frameRate   
    }
};

jetsennet.ui.ApplePlayer.prototype.stop = function()
{  
    if(this.getPlayFile()=="") return; 
	this.player.Stop();  //停止
	this.playingState=false;
	this.setShowImg();	
};

jetsennet.ui.ApplePlayer.prototype.closeFile = function()
{  
    if(IS_SAFARI)
    {
        this.player.Stop();
        this.player.SetURL("");
        return;
    }
    
	this.player.CloseFile();  //停止
	this.slider.setValue(0);  
	this.playingState=false;
	this.setShowImg();	
};

jetsennet.ui.ApplePlayer.prototype.pause = function()
{ 
    if(this.getPlayFile()=="") return; 
    if(IS_SAFARI)
    {
        this.player.Stop();
    }
    else
    {
	    this.player.Pause();  //暂停
	}
	this.playingState=false;
	this.setShowImg();	
};

jetsennet.ui.ApplePlayer.prototype.getPlayFile = function(){if(IS_SAFARI) return this.playFile;return this.player.GetPlayFile();};
jetsennet.ui.ApplePlayer.prototype.fullscreen = function(){return null;};
jetsennet.ui.ApplePlayer.prototype.seekTo = function(framePosition)
{        
	if(this.getPlayFile()=="") return; 	
	//this.pause();
	
	this.setSliderState=true;		
	this.playingState=false;
	this.setShowImg();		
	
	if(IS_SAFARI)
	    this.player.SetTime(framePosition*1000);
	else
	    this.player.SeekTo(framePosition);
	
	this.slider.setValue(framePosition);	
	this.playtime.value= jetsennet.util.convertLongToTime(framePosition ,this.frameRate);	

	this.setSliderState=false;
};
jetsennet.ui.ApplePlayer.prototype.setPaths = function(paths)
{    
	this.CurrentPaths = paths;
	var tempObjXml = new jetsennet.XmlDoc();
	tempObjXml.loadXML(paths);
	this.Objtype = 	tempObjXml.documentElement.getAttribute("type");//获取对象类型//1  视频编目  2 音频编目 3 图片编目 
};
jetsennet.ui.ApplePlayer.prototype.getFileInfo = function(el)
{    
    if(this.getPlayFile()=="") return; 
    try
    {
        return this.player.GetPlayFileInfo(el);
    }
    catch(ex)
    {
        return "";
    }
};
jetsennet.ui.ApplePlayer.prototype.getMediaInfo = function(el)
{
    try
    { 
        return this.player.GetMediaInfo(el);
    }
    catch(ex)
    {
        return ex;
    }
};
jetsennet.ui.ApplePlayer.prototype.openFileDialog = function(){return this.player.OpenFileDialog();};
jetsennet.ui.ApplePlayer.prototype.openSingleFileDialog = function(){return this.player.openSingleFileDialog();};
jetsennet.ui.ApplePlayer.prototype.grabFrame = function(filePath)
{	
	this.player.grabFrame(0,filePath,1,0,0);
};
jetsennet.ui.ApplePlayer.prototype.getPosition = function(){if(IS_SAFARI){ return this.player.GetTime()/1000;};return this.player.GetPosition();};
jetsennet.ui.ApplePlayer.prototype.setInOutPoint = function(inPoint, outPoint)
{    	
	this.setSliderState=true;
	if(!IS_SAFARI)
        this.player.SetInOutPoint(inPoint, outPoint); 
    else
    {
//        this.player.SetStartTime(inPoint*1000);
//        this.player.SetEndTime(outPoint*1000);
    }   
     el('txt_AP_InPoint').value= jetsennet.util.convertLongToTime(inPoint ,this.frameRate); 
     el('txt_AP_OutPoint').value=jetsennet.util.convertLongToTime(outPoint  ,this.frameRate); 
     el('txt_AP_DURATION').value=jetsennet.util.convertLongToTime(outPoint- inPoint  ,this.frameRate);  

    this.playingState=false;
	this.setShowImg();	
	this.setSliderState=false;

};
jetsennet.ui.ApplePlayer.prototype.getInPoint = function()
{
    try
    {
        return jetsennet.util.convertTimeToLong(el('txt_AP_InPoint').value,this.frameRate);//this.player.GetInPoint();        
    }
    catch(ex)
    {
        return 0;
    }
};
jetsennet.ui.ApplePlayer.prototype.getOutPoint = function()
{
    try
    {
        return jetsennet.util.convertTimeToLong(el('txt_AP_OutPoint').value,this.frameRate);// this.player.GetOutPoint();        
    }
    catch(ex)
    {
        return 0;
    }
};
jetsennet.ui.ApplePlayer.prototype.getDuration = function()
{
    if(IS_SAFARI) return this.player.GetDuration()/1000;
    try
    {
        var inPoint = this.getInPoint();
        var outPoint = this.getOutPoint();
        return ( outPoint - inPoint + 1);  // 实长 = 出点 - 入点 + 1         
    }
    catch(ex)
    {
        return 0;
    }
};
jetsennet.ui.ApplePlayer.prototype.getSumFrames = function(){if(IS_SAFARI){ var duration =  this.player.GetDuration();return duration/1000;}return this.player.GetSumFrames();};
jetsennet.ui.ApplePlayer.prototype.goHead = function(){this.seekTo(0);};
jetsennet.ui.ApplePlayer.prototype.goTail = function(){this.seekTo(this.getSumFrames());};
jetsennet.ui.ApplePlayer.prototype.previous = function()
{  
    //快退 4秒为一个快退
    var position= this.getPosition();
    if (position>0 && position-4*this.frameRate >0 ){
		this.seekTo( position - (4 * this.frameRate) );  
	}else {
	    this.seekTo(0);	
	}
};
jetsennet.ui.ApplePlayer.prototype.next = function()
{  
    //快进
    var position= this.getSumFrames();
	var toPosition =this.getPosition() + 4*this.frameRate;
    if (position >toPosition)
    {
		this.seekTo( toPosition);  
	}  
	else
	{
	    this.seekTo(position);	
	}  
};

jetsennet.ui.ApplePlayer.prototype.setinPoint = function()
{  
     if(this.getPlayFile()=="") return; 
    //设置入点   
    var position=this.getPosition();
    var outponit=jetsennet.util.convertTimeToLong( el('txt_AP_OutPoint').value,this.frameRate) + 1;  
	if (position>=outponit)
	{
		return;
	}

    this.setInOutPoint(position,outponit);
	this.playtime.value= jetsennet.util.convertLongToTime(position,this.frameRate);	
	this.slider.setValue(position);
};

jetsennet.ui.ApplePlayer.prototype.setoutPoint = function()
{  
    if(this.getPlayFile()=="") return; 
    //设置出点
    var _Position=this.getPosition();
    var _inponit=jetsennet.util.convertTimeToLong( el('txt_AP_InPoint').value,this.frameRate);
	if (_inponit>=_Position)
	{
		return;
	}
    this.setInOutPoint(_inponit,_Position);
	this.playtime.value= jetsennet.util.convertLongToTime(_Position,this.frameRate);
	this.slider.setValue(_Position);
};

jetsennet.ui.ApplePlayer.prototype.goToinPoint = function()
{ 
   if(this.getPlayFile()=="") return; 
   this.seekTo(jetsennet.util.convertTimeToLong( el('txt_AP_InPoint').value,this.frameRate) );	
};
jetsennet.ui.ApplePlayer.prototype.goTooutPoint = function()
{
   if(this.getPlayFile()=="") return; 
   this.seekTo(jetsennet.util.convertTimeToLong( el('txt_AP_OutPoint').value,this.frameRate));	
};
jetsennet.ui.ApplePlayer.prototype.getDiskFreeSpace = function (diskPath)
{
    return 10;
};
jetsennet.ui.ApplePlayer.prototype.setShowImg = function()
{
    if (this.playing()){
		el('imgPlayOrPause').src=jetsennet.baseThemeUrl + "images/playimages/stop.gif";
		el('imgPlayOrPause').title="暂停";
    }else{
		el('imgPlayOrPause').src=jetsennet.baseThemeUrl + "images/playimages/play.gif";
		el('imgPlayOrPause').title="播放";    
    }
};
jetsennet.ui.ApplePlayer.prototype.playing = function()
{  
    var position = this.getPosition();
    var duration = this.getSumFrames();
	if (this.playingState && position==(duration-1)  || duration<=0 ){
	    this.playingState==false;		
	}
	return this.playingState;
};

// 计审播放器===================================================================
jetsennet.ui.CheckPlayer = function(con)
{    
    this.frameRate = 25;
    this.container = con?con:document.body;
    this.player = null; 
};
jetsennet.ui.CheckPlayer.prototype.initPlayer = function(fileName)
{
    fileName = fileName?fileName:"";
    this.player = document.createElement("OBJECT");
    this.player.id = "xplayer";
    this.player.style.width ="100%";
    this.player.style.height ="100%";
    this.player.classid ="CLSID:98557C70-1E7B-4D55-A832-F328881E5D1E";
    this.container.appendChild(this.player);
    //this.container.innerHTML =  '<object id="xplayer" style="width:100%;height:100%;" classid="CLSID:98557C70-1E7B-4D55-A832-F328881E5D1E"></object>';
    this.player = el("xplayer");
};
jetsennet.ui.CheckPlayer.prototype.setUrl = function(fileName)
{
   if(!fileName)
	{      
		this.player.OpenFile("");
	//	this.player.CloseFile();
	}
	else
	{	
	   fileName=replaceMamRoot(fileName,gSysConfigs);
	   this.player.OpenFile(fileName);
	}
	return true;
};
jetsennet.ui.CheckPlayer.prototype.setUrl3 = function(filePath,startTime,endTime)
{
    if(!filePath)
	{      
		this.player.OpenFile("");	
	}
	else
	{	
	   fileName=replaceMamRoot(filePath,gSysConfigs);
	   this.player.OpenFile3(filePath,startTime,endTime);
	}
	return true;
};
jetsennet.ui.CheckPlayer.prototype.play = function(){};
jetsennet.ui.CheckPlayer.prototype.stop = function(){};
jetsennet.ui.CheckPlayer.prototype.pause = function(){};
jetsennet.ui.CheckPlayer.prototype.setSize = function(width,height){};
jetsennet.ui.CheckPlayer.prototype.closeFile = function(){};

//图片前端播放器=================================================================
jetsennet.ui.PicJsPlayer = function(con)
{
	this.container = con?con:document.body;
    this.player = null; 
};
jetsennet.ui.PicJsPlayer.prototype.initPlayer = function(){
	jetsennet.importCss("iviewer/jquery.iviewer");
	jetsennet.require("iviewer/jquery.iviewer");	
	$(this.container).html('<div id="iviewer" style="width:100%; height:100%; border:1px solid black; position:relative;"></div>');
	this.player = $("#iviewer");
	this.player.iviewer();
};
jetsennet.ui.PicJsPlayer.prototype.setUrl = function(filePath){
	if(arguments.length==0){
		alert("请传入图片文件路径！");
		return false;
	}
	this.player.iviewer("loadImage",filePath);
};
jetsennet.ui.PicJsPlayer.prototype.closeFile = function(){
	this.player.iviewer("destroy");
};
// 图片播放器===================================================================
//PIC播放器===================================================================
jetsennet.ui.PicPlayer = function(con)
{
	this.frameRate = 25;
    this.container = con?con:document.body;
    this.player = null;   
};
jetsennet.ui.PicPlayer.prototype.initPlayer = function(fileName)
{
    fileName = fileName?fileName:"";
    this.container.innerHTML = '<object id="PicPlayer" name="xplayer" width="100%" height="100%" classid="clsid:146FE5BF-341C-45B8-BA05-74AC0865D928" ></object>';
    this.player = el("PicPlayer");
};
jetsennet.ui.PicPlayer.prototype.setUrl = function(filePaths)
{
	if(!filePaths)
	{      
		this.player.ImageOpen("");
		this.player.ImageClose();
	}
	else
	{	
	    var arrUrl = filePaths.split(';');
        filePaths = replaceMamRoot(arrUrl[0],gSysConfigs);
		this.player.ImageOpen(filePaths);
	}
	return true;
};
jetsennet.ui.PicPlayer.prototype.closeFile = function(){this.player.ImageClose();};
jetsennet.ui.PicPlayer.prototype.setPaths = function(paths)
{
	this.CurrentPaths = paths;
	var tempObjXml = new JetsenWeb.XmlDoc();
	tempObjXml.loadXML(paths);
	this.Objtype = tempObjXml.documentElement.getAttribute("type");//获取对象类型//1  视频编目  2 音频编目 3 图片编目 
};
jetsennet.ui.PicPlayer.prototype.getFileInfo = function(fileInfo){try{return this.player.ImageInfo(fileInfo);}catch(ex){return "";}};
jetsennet.ui.PicPlayer.prototype.getMediaInfo = function(fileInfo){try{return this.player.GAM_ImageMetaData(fileInfo);}catch(ex){return "";}};
jetsennet.ui.PicPlayer.prototype.openFileDialog = function(){return this.player.ImageOpenFileDialog();};
jetsennet.ui.PicPlayer.prototype.getDiskFreeSpace = function(diskPath){try{return this.player.ImageGetDiskFreeSpace(diskPath);}catch(ex){return 0;}};
jetsennet.ui.PicPlayer.prototype.setSize = function(width,height){return null;};
jetsennet.ui.PicPlayer.prototype.ImageSaveAs = function( srcFilePath, dstFilePath, nWidth, nHeigth){try{return this.player.ImageSaveAs( srcFilePath, dstFilePath, nWidth, nHeigth);}catch(ex){return 0;}};

//文稿播放器flexpaper
jetsennet.ui.DocFlexPlayer = function(con){
    this.container = con?con:document.body;
    this.player = $(this.container);
};

jetsennet.ui.DocFlexPlayer.prototype.initPlayer = function(){
	jetsennet.require("flexpaper/flexpaper");
	this.config = {
            Scale : 1,
            ZoomTransition : 'easeOut',
            ZoomTime : 0.5,
            ZoomInterval : 0.2,
            FitPageOnLoad : false,
            FitWidthOnLoad : false,
            FullScreenAsMaxWindow : false,
            ProgressiveLoading : true,
            MinZoomSize : 0.2,
            MaxZoomSize : 2,
            SearchMatchAll : false,
            InitViewMode : 'Portrait',
            RenderingOrder : 'flash',
            StartAtPage : '',
            ViewModeToolsVisible : true,
            ZoomToolsVisible : true,
            NavToolsVisible : true,
            CursorToolsVisible : true,
            SearchToolsVisible : true,
            WMode : 'window',
            localeChain: 'zh_CN',
            jsDirectory: jetsennet.baseUrl + 'flexpaper/'
        };
};
jetsennet.ui.DocFlexPlayer.prototype.setUrl = function(filePaths){
	if(arguments.length==0){
		alert("请传入文稿文件路径！");
		return false;
	}
	var config = $.extend({},this.config,{SWFFile:filePaths});
	this.player.FlexPaperViewer({config:config});
};

jetsennet.ui.DocFlexPlayer.prototype.closeFile = function(){
	this.player.FlexPaperViewer({config:this.config});
};

//空播放器===================================================================
jetsennet.ui.EmptyPlayer = function(con)
{    
    this.frameRate = 25;
    this.player = {}; 
    this.player.CloseFile = function(){};
};
jetsennet.ui.EmptyPlayer.prototype.initPlayer = function(){};
jetsennet.ui.EmptyPlayer.prototype.setUrl = function(){};
jetsennet.ui.EmptyPlayer.prototype.play = function(){};
jetsennet.ui.EmptyPlayer.prototype.stop = function(){};
jetsennet.ui.EmptyPlayer.prototype.pause = function(){};
jetsennet.ui.EmptyPlayer.prototype.setPaths = function(){};
jetsennet.ui.EmptyPlayer.prototype.getDiskFreeSpace = function(){return 100;};
jetsennet.ui.EmptyPlayer.prototype.getMediaInfo = function(){return "";};
jetsennet.ui.EmptyPlayer.prototype.getFileInfo = function(){return "";};
jetsennet.ui.EmptyPlayer.prototype.openFileDialog = function(){this.player.OpenFileDialog();};
jetsennet.ui.EmptyPlayer.prototype.openSingleFileDialog = function(){this.player.OpenFileDialog();};


//苹果系统和windows 系统mam路径替换
function replaceMamRoot(filepath,sysConfigs)
{    
	if (sysConfigs==null ) 
	    return filepath;

	for (var i=0;i<4;i++)
	{
		if (sysConfigs["MamMacRoot" + i] && sysConfigs["MamWinRoot" + i])
		{
			
		   if (IS_MAC)
		   {
				filepath = jetsennet.util.replacePath(filepath,sysConfigs["MamWinRoot" + i],sysConfigs["MamMacRoot" + i]); 				
		   }
		   else
		   {
		        filepath = jetsennet.util.replacePath(filepath,sysConfigs["MamMacRoot" + i],sysConfigs["MamWinRoot" + i]); 
		   }
		}
	}
	return filepath;
};

//VLC播放器===================================================================
jetsennet.ui.VlcPlayer = function (con) {
    this.frameRate = 25;
    this.container = con ? con : document.body;
    this.player = null;
};

jetsennet.ui.VlcPlayer.prototype.initPlayer = function (fileName) {
    fileName = fileName ? fileName : "";
    this.container.innerHTML = '<object id="vlcplayer" name="xplayer" width="100%" height="100%" classid="clsid:7FCC2FCC-35CB-4E7D-B960-EF38A466048C" type="application/x-oleobject" viewastext="viewastext"></object>';
    this.player = el("vlcplayer");
};
jetsennet.ui.VlcPlayer.prototype.setUrl = function (filePaths) {
    if (filePaths == null || filePaths == "") {
        this.player.ClearPlayList();
        this.player.Stop();
        return;
    }
    this.player.ClearPlayList();
    this.player.Stop();
    this.player.AddMedia(filePaths);
};

jetsennet.ui.VlcPlayer.prototype.addUrl = function (filePaths) {
    if (filePaths == null || filePaths == "") {
        this.player.ClearPlayList();
        this.player.Stop();
        return;
    }
    this.player.AddMedia(filePaths);
};

jetsennet.ui.VlcPlayer.prototype.play = function(){this.player.Play();};
jetsennet.ui.VlcPlayer.prototype.openFileDialog = function(){this.player.OpenFileDialog();};
jetsennet.ui.VlcPlayer.prototype.openSingleFileDialog = function(){this.player.OpenFileDialog();};
jetsennet.ui.VlcPlayer.prototype.closeFile = function(){};
jetsennet.ui.VlcPlayer.prototype.getDiskFreeSpace = function(diskPath){return 10;};
jetsennet.ui.VlcPlayer.prototype.grabFrame = function(){return null;};
jetsennet.ui.VlcPlayer.prototype.getPosition = function(){return 0;};
jetsennet.ui.VlcPlayer.prototype.pause = function(){this.player.Pause();};
jetsennet.ui.VlcPlayer.prototype.seekTo = function (millsecond) {};
jetsennet.ui.VlcPlayer.prototype.setInOutPoint = function (inPoint, outPoint) { /*会出错this.player.SetCtrlRange(inPoint, outPoint);*/
	var startTime = jetsennet.util.convertLongToTime(inPoint); //将帧转换为时间
	var endTime = jetsennet.util.convertLongToTime(outPoint); 
	startTime = jetsennet.util.convertTimeToLong(startTime,1); //将时间转换为妙
	endTime = jetsennet.util.convertTimeToLong(endTime,1); 
	this.player.PlayAt(startTime,endTime);
};
jetsennet.ui.VlcPlayer.prototype.getInPoint = function () { };
jetsennet.ui.VlcPlayer.prototype.getOutPoint = function () { return 0; };
jetsennet.ui.VlcPlayer.prototype.getDuration = function () { return 0; };
jetsennet.ui.VlcPlayer.prototype.setSize = function (width, height) { return null; };
jetsennet.ui.VlcPlayer.prototype.getMediaInfo = function () { return ""; };
jetsennet.ui.VlcPlayer.prototype.getFileInfo = function () { return ""; };