jetsennet.require([ "gridlist", "pagebar", "window", "bootstrap/moment", "bootstrap/daterangepicker", "crud","datepicker"]);
jetsennet.importCss("bootstrap/daterangepicker-bs3");

var logInfoMap = new HashMap(); //缓存日志详细信息
var gCurDate = new Date();
var gLastWeekDate;
var sysCode =jetsennet.queryString("syscode")||WFM_SYS_CODE;

var tdColor={l4:'#f0dada',l3:'#fcf7e0'};


var gErrorlogColumns = [ { fieldName: "ID", width: 40, align: "center", isCheck: 1, checkName: "chkLog"},
                        { fieldName: "LOG_LEVEL", sortField: "LOG_LEVEL", width:100, align: "center", name: "日志级别",format: function(val, vals){
							if (val == 1) {
						    	return "<span loglevel='1'>调试</span>";
						    } else if(val==2) {
						    	return "<span loglevel='2'>信息</span>";
						    }else if(val==3){
						    	return "<span loglevel='3' style='color:blue'>警告</span>";
						    }else if(val==4){
						    	return "<span loglevel='4' style='color:red'>错误</span>";
						    }
						}},
                        { fieldName: "DESCRIPTION", sortField: "DESCRIPTION", width:"100%", align: "left", name: "日志描述"},
                        { fieldName: "LOG_TIME", sortField: "LOG_TIME", width:200, align: "center", name: "日志时间"},
                        { fieldName: "ID,LOG_INFO", width:45, align: "center", name: "详情", format: function(val,vals){
                        	if(vals[1]){
                        		logInfoMap.put(vals[0], vals[1]);
                        		return '<span onclick="viewLogDetail(\''+val+'\')"><img src="images/cel_info.png"/></span>';
                        	
                        	}else{
                        		return '--';
                        	}
                        }}
                        ];
var gCrud = $.extend(new jetsennet.Crud("divList", gErrorlogColumns, "logPageBar", "ORDER BY t.LOG_TIME DESC"), {
    dao : WFMDAO,
    tableName : "NET_OPERATORLOG",
    resultFields : "t.ID,t.DESCRIPTION,t.LOG_LEVEL,t.LOG_TIME,t.LOG_INFO",
    name : sysCode==22?"流程日志":"调度日志",
    checkId : "chkLog",
    className : "jetsennet.wfm.schema.NetOperatorlog",
});
gCrud.grid.ondoubleclick = null;

//导出定制
function exportData(isAppendDate){
	gCrud.exportData(isAppendDate, {filter:function(cols, index, col){
		return (index == 0 || index == cols.length - 1);
	}});
};


/**
 * 页面初始化
 */
function pageInit() {
	
	 jQuery("#txtStartTime").pickDate();
 	 jQuery("#txtEndTime").pickDate();
 	 //update by xueenbin 20151228
//	 gLastWeekDate = new Date(gCurDate.getTime() - 6 * 24 * 3600 * 1000);
//     el('txtStartTime').value = gLastWeekDate.toDateString();
     el('txtStartTime').value = gCurDate.toDateString();
     el('txtEndTime').value = gCurDate.toDateString();
	 searchlog();
};

/**
 * 查询列表
 */
function searchlog() {
	logInfoMap.clear();
	if(illegalityTime(el("txtStartTime").value, el("txtEndTime").value)){
		jetsennet.alert("开始时间不能大于结束时间！");
		return;
	}
    var conditions = [];
    conditions.push(["SYS_CODE", sysCode, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);						
    if (el('txtKeyWord').value != '') {
    	conditions.push(["DESCRIPTION", el('txtKeyWord').value, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Like, jetsennet.SqlParamType.String]);						
    }
    
    if (el("txtStartTime").value != '') {
    	conditions.push(["LOG_TIME", el("txtStartTime").value + " 00:00:00", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.ThanEqual, jetsennet.SqlParamType.DateTime]);						
    }
    if (el("txtEndTime").value != '') {
    	conditions.push(["LOG_TIME", el("txtEndTime").value + " 23:59:59", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.LessEqual, jetsennet.SqlParamType.DateTime]);						
    }
    
    var logLevel = jetsennet.form.getCheckedValues("txt_logLevel");
    
    if (logLevel!="") {
    	conditions.push(["LOG_LEVEL",logLevel, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.In, jetsennet.SqlParamType.Numeric]);						
    }
    
    gCrud.search(conditions);
//    changeTdBackColor();
}

function changeTdBackColor(){
	for(var i=3;i<=4;i++){
		$("span[loglevel='"+i+"']").parent().parent().css("background-color",tdColor["l"+i]);;		
	}
}

function viewLogDetail(id)
{
	el('logDetail').value= logInfoMap.get(id) || '';
	var dialog = new jetsennet.ui.Window("detail-window");
    jQuery.extend(dialog, { submitBox: false, cancelBox: false, maximizeBox: false, showScroll: false, windowStyle: 1, minimizeBox: false, title: "错误详细信息" });
    dialog.size = { width: 750, height: 0 };
    dialog.controls = ["divLogDetail"];
    dialog.showDialog();
}
