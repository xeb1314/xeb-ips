var gDetailInterval = 5000;       //刷新时间
var gDetailIntervalTime = null;   //局部定时器
var gActor = {};
/**
* 获取actor列表
*/
function getActorList() {
	var conditions = [];
	conditions.push(["SERVER_TYPE", "2", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
	var sResult = MTCDAO.query("commonXmlQuery", "SERVER_ID", "MTC_SERVER", null, null, conditions, "SERVER_ID,SERVER_NAME,HOST_IP,HOST_PORT," +
    "HOST_NAME,SERVER_TYPE,WORK_MODE,WORK_STATE,STATE_DESC,UPDATE_TIME,CREATE_USER,CREATE_TIME,FIELD_1 AS SRCID");
	var objs = jetsennet.xml.toObject(sResult.resultVal, "Record");
    jetsennet.ui.DropDownList["txt_actor"].clear();
    if (objs && objs.length > 0) {
        for (var i = 0; i < objs.length; i++) {
            jetsennet.ui.DropDownList["txt_actor"].appendItem(
           { text: objs[i].SERVER_NAME, value: objs[i].SERVER_ID, ip: objs[i].HOST_IP, port: objs[i].HOST_PORT, name: objs[i].SERVER_NAME, state: objs[i].WORK_STATE });
        }
    }
    jetsennet.ui.DropDownList["txt_actor"].setSelectedIndex(0);
}

/**
* 
* 组装actor信息，actor，worker信息分别显示
* 避免页面因请求数据异常而卡顿
*/
function showActorView(ip, port, name, state) {


    gActor.ip = ip;
    gActor.port = port;
    gActor.name = name;
    gActor.state = state;

    var actorsHtml = [];

    actorsHtml.push('<div class="cantent01 clf" id="divActor_' + ip.replace(/\./img, "_") + '">');
    actorsHtml.push('<div class="cantent_1 clf">');
    actorsHtml.push('<div class="title"><div class="dess"><p>' + name + '</p></div>');
    actorsHtml.push('</div>');
    actorsHtml.push('<div class="content">');
    actorsHtml.push('<div class="actor-left">');
    actorsHtml.push('<div class="actor-logo"><span>执行器</span></div>');
    actorsHtml.push('<div id="actorControl"></div>');
    actorsHtml.push('<div class="actor-name">' + ip + ':' + port + '</div>');
    actorsHtml.push('<div class="actor-state"></div>');
    actorsHtml.push('<div class="actor-progress-1"><div class="ss_3">CPU</div><div class="ss_4"></div><div class="percent-1"></div></div>');
    actorsHtml.push('<div class="actor-progress-2"><div class="ss_3">内存</div><div class="ss_4"></div><div class="percent-1"></div></div>');
    actorsHtml.push('</div>');
    actorsHtml.push('<div class="actor-right" id="divWorkerView">');
    actorsHtml.push('</div>');
    actorsHtml.push('</div>');
    actorsHtml.push('</div>');
    actorsHtml.push('</div>');


    el('divContent').innerHTML = actorsHtml.join('');

    //worker信息
    showWorkerView(ip, port);

}
//======================================================================================
//显示actor信息,worker列表状态信息，任务执行情况
function showWorkerView() {

    window.clearTimeout(gDetailIntervalTime);
    var param = new HashMap();
    param.put("id", gActor.ip);
    param.put("url", 'http://' + gActor.ip + ':' + gActor.port);
    var sResult = MTCDAO.execute("getActorState", param);
    if(sResult.errorCode==0){
	    var actor = jQuery.parseJSON(sResult.resultVal);
	    if (actor) {
	    	actor.ip = gActor.ip;
	    	actor.port = gActor.port;
	    	var actorCPU = valueOf(actor, "usedCPU", 0);
	    	var actorMemory = valueOf(actor, "usedMemory", 0);
	    	var actorState = valueOf(actor, "actorState", 0);
	    	
	    	if (actorState == 10) {
	    		if (jQuery(".cantent_1 > .content > .actor-left > #actorControl").hasClass('actor-start')) {
	    			jQuery(".cantent_1 > .content > .actor-left > #actorControl").removeClass('actor-start');
	    		}
	    		jQuery(".cantent_1 > .content > .actor-left > #actorControl").addClass('actor-start');
	    		jQuery(".cantent_1 > .content > .actor-left > #actorControl").click(function () {
	    			startActor(gActor.ip, gActor.ip, gActor.port);
	    		});
	    		
	    	}
	    	else {
	    		if (jQuery(".cantent_1 > .content > .actor-left > #actorControl").hasClass('actor-stop')) {
	    			jQuery(".cantent_1 > .content > .actor-left > #actorControl").removeClass('actor-stop');
	    		}
	    		jQuery(".cantent_1 > .content > .actor-left > #actorControl").addClass('actor-stop');
	    		jQuery(".cantent_1 > .content > .actor-left > #actorControl").click(function () {
	    			stopActor(gActor.ip, gActor.ip, gActor.port);
	    		});
	    	}
	    	
	    	jQuery(".cantent_1 > .content > .actor-left > #actorControl").css({ 'display': 'block' });
	    	jQuery('#divWorkerView').html(showWorker(actor));
	    	jQuery(".cantent_1 > .content > .actor-left > .actor-state").html(getActorState(actorState));
	    	jQuery(".cantent_1 > .content > .actor-left > .actor-progress-1 >.ss_4").html(actorCPU + '%');
	    	jQuery(".cantent_1 > .content > .actor-left > .actor-progress-1 >.percent-1").css({ 'width': actorCPU + '%' });
	    	jQuery(".cantent_1 > .content > .actor-left > .actor-progress-2>.ss_4").html(actorMemory + '%');
	    	jQuery(".cantent_1 > .content > .actor-left > .actor-progress-2 >.percent-1").css({ 'width': actorMemory + '%' });
	    }
	 }else{
	     jQuery(".cantent_1 > .content > .actor-left > #actorControl").css({ 'display': 'none' });
	     jQuery('#divWorkerView').html('');
	     jQuery(".cantent_1 > .content > .actor-left > .actor-state").html('错误');
	     jQuery(".cantent_1 > .content > .actor-left > .actor-progress-1 >.ss_4").html('0%');
	     jQuery(".cantent_1 > .content > .actor-left > .actor-progress-1 >.percent-1").css({ 'width': '0%' });
	     jQuery(".cantent_1 > .content > .actor-left > .actor-progress-2>.ss_4").html('0%');
	     jQuery(".cantent_1 > .content > .actor-left > .actor-progress-2 >.percent-1").css({ 'width': '0%' });

	 }
     gDetailIntervalTime = setTimeout("showWorkerView()", gDetailInterval);
}

//启动worker
function startWorker(workerID, actorID, actorURL) {
	var param = new HashMap();
    param.put("workerID",workerID);
    param.put("actorID",actorID);
    param.put("actorURL",actorURL);
    var result = MTCDAO.execute("startWorker", param);
	if(result.errorCode==0){
		jetsennet.message("操作成功,请等待执行器启动");
        showWorkerView();
	}else{
		jetsennet.message("操作失败!");
	}
}

//停止worker
function stopWorker(workerID, actorID, actorURL) {
	jetsennet.confirm("确认停止吗？", function () {
		var param = new HashMap();
	    param.put("workerID",workerID);
	    param.put("actorID",actorID);
	    param.put("actorURL",actorURL);
	    var result = MTCDAO.execute("stopWorker", param);
		if(result.errorCode==0){
			jetsennet.message("操作成功,请等待执行器停止");
            showWorkerView();
		}else{
			jetsennet.message("操作失败!");
		}
		return true;
	});
}
/**
* 
* 启动Actor
*/
function startActor(actorId, ip, port) {
	var actorUrl = 'http://' + ip + ':' + port;
	var param = new HashMap();
    param.put("actorID",actorId);
    param.put("actorURL",actorUrl);
    var result = MTCDAO.execute("startActor", param);
	if(result.errorCode==0){
		jetsennet.message("操作成功,请等待执行器启动");
        showActorView(gActor.ip, gActor.port, gActor.name, 0);
	}else{
		jetsennet.message("操作失败!");
	}
}
/**
* 
* 停止Actor
*/
function stopActor(actorId, ip, port) {
	var actorUrl = 'http://' + ip + ':' + port;
	var param = new HashMap();
    param.put("actorID",actorId);
    param.put("actorURL",actorUrl);
    var result = MTCDAO.execute("stopActor", param);
	if(result.errorCode==0){
		jetsennet.message("操作成功,请等待执行器停止");
        showActorView(gActor.ip, gActor.port, gActor.name, 10);
	}else{
		jetsennet.message("操作失败!");
	}
}