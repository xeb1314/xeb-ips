
	//运行中流程ID
	var procId;
	//设置数据处理自动刷新统计信息
	var totalInterVal;
	//设置数据采集自动刷新
	var collocInterVal;
	//采集任务ID
	var cllocTaskId;
	//采集任务名称
	var cllocTaskName;
	//数据处理任务ID
	var ipsTaskId;
	/*//成功的统计
	var procactCount=0;
	//失败的统计
	var failCount = 0;*/
	
	//动态加载使用echarts
	/*require(
		    [
		        'echarts',
		        'echarts/chart/bar'  // 按需加载所需图表
		    ],
		    //回调函数
		    function (ec) {
//		        ec.init(el("main")).setOption({});;
		    }
//		    requireCallback
	);*/
	
/**
 * 展现数据处理任务的统计
 * @param procID
 */
function procTaskToCount(ipsTaskID,procID){
	if (totalInterVal != null)
        window.clearTimeout(totalInterVal);
	if(collocInterVal!=null)
		window.clearTimeout(collocInterVal);
	if(typeof(ipsTaskID) != "undefined"){
	    ipsTaskId = ipsTaskID;
	    procId = procID;
	}
	
	require('echarts').init(el("main")).clear();
	var xAxisData=[];
    var handleCount=[];
    var failCounts=[];
    var totalCount = [];
	//统计图表展现
	var option = totalTask(ipsTaskId,procId,xAxisData,handleCount,failCounts,totalCount);
	if(option){
		require('echarts').init(el("main")).setOption(option, true);	
	}else{
		require('echarts').init(el("main")).setOption({}, true);
	}
	
	totalInterVal = window.setTimeout(procTaskToCount, 10000);
}	

/**
 * 数据处理统计图表展现
 * @param procactId
 * @returns {Number}
 */
function totalTask(ipsTaskId,procID,xAxisData,handleCount,failCounts,totalCount){
	
	var params = new HashMap();
     params.put("taskId", ipsTaskId);
     params.put("procId", procID);
     params.put("startTime", $('#txtprocessTotalTime').data('daterangepicker').startDate.format('YYYY-MM-DD'));
     params.put("endTime", $('#txtprocessTotalTime').data('daterangepicker').endDate.format('YYYY-MM-DD') + " 23:59:59");
     var result = IPSDAO.execute("collocTotalQuery", params);
     if (result && result.errorCode == 0) {
		var objs = jetsennet.xml.toObject(result.resultVal, "Record");
	    if(objs){
			for(var i=0;i<objs.length;i++){
				var success = 0;
				var failed = 0;
		//		var json = totalTask(obj[i].ACT_ID,ipsTaskId);
				xAxisData.push(objs[i].PROCACT_NAME);
				success = objs[i].SUCCESS;
				if(success != ""){
					handleCount.push(success);
				}else{
					handleCount.push(0);
					success = 0;
				}
				failed = objs[i].FAIL;
				if(failed != ""){
		    		failCounts.push(failed);
		    		
				}else{
					failCounts.push(0);
					failed = 0;
				}
				var totalCounts = parseInt(success)+parseInt(failed);
				totalCount.push(totalCounts);
		    }
			return optionObj(xAxisData,handleCount,failCounts,totalCount);
	    }else{
	    	return {};
	    }
    }
}

/**
 * 展示采集任务的统计
 * @param taskID
 * @param taskName
 */
function collectTaskToCount(taskID,taskName) {
	
	/*el('txtStartTime').value = gLastMonthDate;
	el('txtEndTime').value = gCurDate.toDateString();*/
	if (collocInterVal != null) {
		window.clearTimeout(collocInterVal);
	}
	if (totalInterVal != null){
		window.clearTimeout(totalInterVal);
	}
	require('echarts').init(el('main')).clear();
	if(typeof(taskID) == "undefined"){
		taskID = cllocTaskId;
		taskName = cllocTaskName;
	}else{
		cllocTaskId = taskID;
		cllocTaskName = taskName;
	}
    var xAxisData=[];
    var totalCount = [];
    var objs;
    var startTime = $('#txtCollocTotalTime').data('daterangepicker').startDate.format('YYYY-MM-DD');
	var endTime = $('#txtCollocTotalTime').data('daterangepicker').endDate.format('YYYY-MM-DD');
	if(startTime != "" && endTime != ""){
		/* //统计数据采集处理量
	    if(startTime == endTime){
	    	objs = totalCollectTask(taskID,"2","114");
	    }else{
	    	objs = totalCollectTask(taskID,"10","111");
		}	*/
		var params = new HashMap();
		 params.put("taskId", taskID, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal);
		 params.put("startTime",$('#txtCollocTotalTime').data('daterangepicker').startDate.format('YYYY-MM-DD'), jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Than, jetsennet.SqlParamType.DateTime);
		 params.put("endTime",$('#txtCollocTotalTime').data('daterangepicker').endDate.format('YYYY-MM-DD') + " 23:59:59", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Less, jetsennet.SqlParamType.DateTime);
		 var sResult = IPSDAO.execute("collectTaskToCount", params);
		 objs = jetsennet.xml.toObject(sResult.resultVal, "Record");
		
	    if(objs){
			for( var i=0;i<objs.length;i++){
				var date = objs[i].DATE_TIME;
				var count = objs[i].COUNT;
				xAxisData.push(date);
				totalCount.push(Number(count).toFixed(2));
			}
			var option = optionColloc(xAxisData,totalCount);
			require('echarts').init(el('main')).setOption(option, true);
	    }else{
	    	var option = optionColloc(["该时间段没有数据"],["0"]);
	    	require('echarts').init(el('main')).setOption(option, true);
//	    	jetsennet.warn("该时间段没有统计信息！");
	    }
	}else{
		require('echarts').init(el('main')).setOption({});
	}
	
	collocInterVal = window.setTimeout(collectTaskToCount, 300000);
}	

/**
 * 获取采集任务的一天的统计量
 * @param taskID
 * @returns {OBJ}
 */
function totalCollectTask(taskID,charLength,convertNumber) {
	/*var conditions = [];
		conditions.push(["t.TASK_ID", taskID, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal]);
		conditions.push(["t.STAT_TIME",$('#txtCollocTotalTime').data('daterangepicker').startDate.format('YYYY-MM-DD'), jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Than, jetsennet.SqlParamType.DateTime]);
		conditions.push(["t.STAT_TIME",$('#txtCollocTotalTime').data('daterangepicker').endDate.format('YYYY-MM-DD') + " 23:59:59", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Less, jetsennet.SqlParamType.DateTime]);
	var joinTable = [];
	joinTable.push(["IPS_TASK", "i", "i.TASK_ID=t.TASK_ID", jetsennet.TableJoinType.Inner]);*/
	
//	var sResult = IPSDAO.query("commonXmlQuery", "CLASS_ID", "IPS_GATHTERSTAT", "t", joinTable, conditions, "CONVERT(char("+charLength+"),T.STAT_TIME,"+convertNumber+") DATE_TIME,SUM(t.AMOUNT) AS COUNT",null,"CONVERT(char("+charLength+"),T.STAT_TIME,"+convertNumber+")");
	//return jetsennet.xml.toObject(sResult.resultVal, "Record");
}

/**
 * 获取采集任务的总量
 * @param taskID
 * @returns {Number}
 */
function totalCollectTask2(taskID) {
	var gSqlCollection = new jetsennet.SqlConditionCollection();
	var gSqlQuery = new jetsennet.SqlQuery();
	gSqlCollection.add(jetsennet.SqlCondition.create("t.TASK_ID", taskID, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.In));
	var gQueryTable = jetsennet.createQueryTable("IPS_GATHTERSTAT", "t");
	gQueryTable.addJoinTable(jetsennet.createJoinTable("IPS_TASK", "i", "i.TASK_ID=t.TASK_ID", jetsennet.TableJoinType.Inner));
	jQuery.extend(gSqlQuery, {IsPageResult: 1, KeyId: "STAT_ID", /*PageInfo: gTaskPage,*/ QueryTable: gQueryTable, ResultFields: "SUM(t.AMOUNT) AS COUNT" });
	gSqlQuery.Conditions = gSqlCollection;
    var param = new HashMap();
    param.put("queryXml", gSqlQuery.toXml());
    var sResult = IPSDAO.execute("commonXmlQuery", param);
    var obj = jetsennet.xml.toObject(sResult.resultVal, "Record");
    if(!$.isEmptyObject(obj)) {
    	return obj[0].COUNT;
    }
    return 0;
}

/**
 * 删除数据处理任务的统计信息
 */
function delProcessCount(){
	if(typeof(ipsTaskId) != "undefined" && typeof(procId) != "undefined"){
		jetsennet.confirm('确定重置,删除该任务的所有统计信息?', function () {
		    var deleteXml = "<TABLE TABLE_NAME='CM801_OBJTASK'><SqlWhereInfo><IPSTASK_ID ParamType='String' RelationType='Equal' LogicType='And'>"+ipsTaskId+"</IPSTASK_ID><PROC_ID ParamType='Int' RelationType='Equal' LogicType='And'>"+procId+"</PROC_ID></SqlWhereInfo></TABLE>";
			var params = new HashMap();
			params.put("deleteXml", deleteXml);
			var result = IPSDAO.execute("commonObjDeleteByCondition", params);
			if (result && result.errorCode == 0) {
				procTaskToCount();
				return true;
			}else return false;
			/*var curDate = new Date();
			el('txtprocessTotalTime').value = curDate.toDateString()+" - "+curDate.toDateString();
			restTime = curDate.toTimeString();
			procTaskToCount();
			return true;*/
			
		});
	}else jetsennet.warn("请先选中任务，再重置！");
}

