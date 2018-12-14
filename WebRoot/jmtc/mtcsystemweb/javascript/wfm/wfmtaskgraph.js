function  loadimage()
 {
	if (navigator.appVersion.indexOf("MSIE") != -1 && parseFloat(navigator.appVersion.split("MSIE")[1]) < 9)
	{
		jetsennet.require(["flotr2/base64","flotr2/excanvas"]);
	}

	basic_bars(document.getElementById('graphTotalTypeBar'), jsonType);
 }

//柱状图
 function basic_bars(container, jsonObj, horizontal) 
 {
	var horizontal = (horizontal ? true : false), datas = [], ticks = [], point, i;
	var tracks = [];
	for (i = 0; i < jsonObj.types.length; i++) 
	{

		if (horizontal) 
		{
			point = [ jsonObj.time[i], i ];
		} else 
		{
			point = [ i, jsonObj.time[i] ];

		}
		if (jsonObj.types[i].length > 5) 
		{
			ticks.push( [ i, jetsennet.util.left(jsonObj.types[i], 4) + ".." ]);
		} else 
		{
			ticks.push( [ i, jsonObj.types[i] ]);
		}
		var data = [];
		data.push(point);
		datas.push(data);
		tracks.push(jsonObj.types[i]);

	};
	Flotr.defaultOptions.fontColor = '#000000';
	// Draw the graph
	Flotr.draw(container, datas, {
		bars : {
			show : true,
			horizontal : horizontal,
			shadowSize : 0,
			barWidth : 0.5,
			fillOpacity : 0.8
		},
		markers : {
			show : true,
			position : 'ct',
			color : '#000000'
		},
		mouse : {
			track : true,
			trackFormatter : function(o) {
				return tracks[parseInt(o.x)] + "延迟:" + o.y + "小时";
			}
		},
		xaxis : {
			ticks : (horizontal ? null : ticks),
			min : 0,
			autoscaleMargin : 0
		},
		yaxis : {
			ticks : (horizontal ? ticks : null),
			min : 0,
			noTicks : 5
		},
		grid : {
			verticalLines : false,//horizontal,
			horizontalLines : false,//!horizontal,
			color : '#000000',
			backgroundColor : '#9FB6B1'
	
		},
		title : jsonObj.title + "（柱状图）",
		ieBackgroundColor : '#9FB6B1',
//		colors: ['red', 'blue', 'green', 'white', 'black'],  
		});
}
 
 //统计图表
 function getTaskGraph()
 {
    
 	gSqlCollection = new jetsennet.SqlConditionCollection();
   // gSqlCollection.add(jetsennet.SqlCondition.create("T3.PROC_STATE", 2, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric));
   // gSqlCollection.add(jetsennet.SqlCondition.create("T4.PROC_STATE", 11, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric));
	     
	var procactId = jetsennet.ui.DropDownList["labCurrentTask"].selectedValue;
    if (procactId != -1) 
    {
        gSqlCollection.add(jetsennet.SqlCondition.create("T1.ACT_ID", procactId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric));
    }
    if(illegalityTime(el("txtStartTime").value, el("txtEndTime").value)){
		return;
	}
	if (el('txtStartTime').value != "") 
	{
        gSqlCollection.add(jetsennet.SqlCondition.create("T2.START_TIME", el('txtStartTime').value + " 00:00:00", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Than, jetsennet.SqlParamType.DateTime));
    }
    if (el('txtEndTime').value != "") 
    {
        gSqlCollection.add(jetsennet.SqlCondition.create("T2.END_TIME", el('txtEndTime').value + " 23:59:59", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Less, jetsennet.SqlParamType.DateTime));
    }
    gSqlQuery.conditions = gSqlCollection;
    
    var param = new HashMap();
    param.put("query", gSqlQuery.toXml());
    var result = WFMDAO.execute("taskStatistics", param);
    if(result.errorCode==0){
	    var taskData = jQuery.parseJSON(result.resultVal);
	    if(taskData && taskData.types.length >0)
    	{
    		jsonType.types = taskData.types;
			jsonType.time = taskData.time;
			
    	}
	    else
	    {
	    	jsonType.types = [];
			jsonType.time = [];
	    	jetsennet.message("找不到数据！");
	    	jQuery('#taskGraph').html('');
	    	return ;
	    }
	    jQuery('#taskGraph').html('<div id="graphTotalTypeBar" style="width: 100%; height: 100%; margin:0; background: #FAFFF0;"></div>');
	    loadimage();
    }
 }