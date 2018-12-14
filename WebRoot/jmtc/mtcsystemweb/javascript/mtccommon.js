//组装worker列表
function showWorker(actor) {
    var workersHTML = [];
    var taskWorkers = {};
    var actorInfo = {};
    workersHTML.push('<table width="100%" border="1" cellpadding="0" cellspacing="1" class="table1" style="border: solid #1f1e1e 1px">');
    workersHTML.push('<colgroup><col width="150px"/><col width="200px"/><col width="100px"/><col width="auto"/><col width="60px"/></colgroup>');
    actorInfo = actor;
    var actorURL = 'http://' + actor.ip + ':' + actor.port;
    var workerList = actor.worker;
    var workerTypeList = getWorkerTypeList(workerList);

    var index = 0;
    
    jQuery.each(workerTypeList, function (taskType, item) {
        
        var workerTypeName = gTaskTyps[taskType];
        if (workerTypeName == null) {
            workerTypeName = "未知执行器";
        }
        jQuery.each(item, function (j, obj) {

            var workerState = valueOf(obj, "workerState", "");
            var taskType = valueOf(obj, "taskType", "");
            var workerID = valueOf(obj, "workerID", "");
            var stateDesc = valueOf(obj, "stateDesc", "");
            var workerName = valueOf(obj, "workerName", "");
            workerState = actorInfo.actorState == -1 ? -1 : workerState;
            workerState = parseInt(workerState, 10);
            if (index % 2 == 0) {
                workersHTML.push('<tr class="rt">');
            }
            else {
                workersHTML.push('<tr class="rr">');
            }

            if (j == 0) {
                workersHTML.push('<td  rowspan="' + item.length + '" scope="row">' + workerTypeName + '</td>');
            }

            workersHTML.push('<td>' + workerName + '</td>');

            if (workerState == 10) {
                workersHTML.push('<td>停止</td>');
            } else if (workerState == 101) {
                workersHTML.push('<td>异常</td>');
            } else if (workerState == 3) {
                workersHTML.push('<td>运行中</td>');
            } else if (workerState == 0) {
                workersHTML.push('<td>空闲</td>');
            } else if (workerState == -1) {
                workersHTML.push('<td>同步中</td>');
            }
            else {
                workersHTML.push('<td></td>');
            }

            workersHTML.push('<td>');
            workersHTML.push(workerState == -1 ? "" : checkStateDescLength(stateDesc));
            workersHTML.push('</td>');

            workersHTML.push('<td>');

            if (workerState == 10) {
                workersHTML.push('<div class="worker-start" onclick="startWorker(\'' + workerID + '\',\'' + actorInfo.actorIP + '\',\'' + actorURL + '\')"><span>启动</span></div>');
            }
            else {
                workersHTML.push('<div class="worker-stop" onclick="stopWorker(\'' + workerID + '\',\'' + actorInfo.actorIP + '\',\'' + actorURL + '\')"><span>停止</span></div>');
            }

            workersHTML.push('</td>');
            workersHTML.push('</tr>');

            index++;
        });
    });


    workersHTML.push('</table>');
    return workersHTML.join('');
}

//对worker进行分类
function getWorkerTypeList(workerList) {
    var obj = {};
    if (workerList != null) {
        for (var i in workerList) {
            var taskType = valueOf(workerList[i], "taskType", "");
            if(taskType){
            	if (obj[taskType] == null) {
            		obj[taskType] = [];
            	}
            	obj[taskType].push(workerList[i]);
            }
        }
    }

    return obj;
}


function getDistinctWorkerTypeList(workerList) {
    var obj = {};
    if (workerList != null) {
        for (var i in workerList) {
            var taskType = valueOf(workerList[i], "taskType", "");
            if (obj[taskType] == null) {
                obj[taskType] = [];
            }
            if(obj[taskType].length==0){
            	obj[taskType].push(workerList[i]);
            }
        }
    }
    return obj;
}


/**
Worker描述文字的长度
*/
function checkStateDescLength(stateDesc) {
    if (stateDesc.length > 35) {
        var lastIndex = stateDesc.lastIndexOf('[');
        if (lastIndex > 0 && lastIndex > stateDesc.length - 7) {
            stateDesc = stateDesc.substring(0, 31) + "..." + stateDesc.substring(lastIndex);
        }
        else {
            stateDesc = jetsennet.util.left(stateDesc, 35) + "...";
        }
    }
    return stateDesc;
}
//状态转换
function getActorState(state) {
    var stateStr = '未知';
    if(jetsennet.util.isNullOrEmpty(state))
	{
		return stateStr;
	}
    switch (parseInt(state, 10)) {
        case 0: stateStr = '空闲'; break;
        case 3: stateStr = '执行中'; break;
        case 10: stateStr = '停止'; break;
        case 101: stateStr = '错误'; break;
    }
    return stateStr;
}