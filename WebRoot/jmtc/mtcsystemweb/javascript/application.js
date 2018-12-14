jetsennet.valideLogin();    
jetsennet.importCss([ "jetsen", "bootstrap/bootstrap" ]);
jetsennet.require(["layoutit"]);
var MTCDAO = new jetsennet.DefaultDal("MTCSystemService");
MTCDAO.dataType = "xml";

var UUMDAO = new jetsennet.DefaultDal("UUMSystemService");
UUMDAO.dataType = "xml";

var WFMDAO = new jetsennet.DefaultDal("WFMSystemService");
WFMDAO.dataType = "xml";

var RUNDAO = new jetsennet.DefaultDal("RuntimeSystemService");
RUNDAO.dataType = "xml";

var WFM_SYS_CODE=22; //工作流系统code
var MTC_SYS_CODE=23; //mtc系统code

var gTaskTyps=(function(){
    var sqlQuery = new jetsennet.SqlQuery();
    jQuery.extend(sqlQuery, { IsPageResult: 0, KeyId: "CW_ID", PageInfo: null, ResultFields: "CW_NAME,CW_CODE",
        QueryTable: jQuery.extend(new jetsennet.QueryTable(), { TableName: "NET_CTRLWORD" })
    });

    var condition = new jetsennet.SqlConditionCollection();
    condition.SqlConditions.push(jetsennet.SqlCondition.create("CW_TYPE", 2301, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric));
    sqlQuery.Conditions = condition;

    var param = new HashMap();
    param.put("queryXml", sqlQuery.toXml());
    var sResult = MTCDAO.execute("commonXmlQuery", param);
    var objs = jetsennet.xml.toObject(sResult.resultVal, "Record");
    var taskTypes={};
    if (objs&&objs.length>0) {
        for (var i = 0; i < objs.length; i++) {
        	taskTypes[objs[i].CW_CODE+""]=objs[i].CW_NAME;
        }
    }
	return taskTypes;
})();

/*
var gTaskTyps = { 
		"1": "磁盘迁移", 
		"20": "MD5生成、验证", 
		"30": "磁盘文件删除", 
		"40": "磁盘文件剪切", 
		"100": "磁带迁移", 
		"101": "磁带上载", 
		"102": "磁带下载",
        "103": "磁带下载解压", 
        "104": "磁带打包上载", 
        "105": "磁带任务删除", 
        "106": "索引任务", 
        "200": "转码任务", 
        "201": "打包任务", 
        "210": "素材剪辑", 
        "211": "码流剪辑",
        "212":"媒体信息提取",
        "213":"媒体索引生成",
        "220":"媒体文件比较",
        "300": "SDI信号收录", 
        "301": "SDI信号播出", 
        "302": "SDI信号实时预监", 
        "310": "ts流ASI信号收录", 
        "320": "ts流UDP信号收录", 
        "321": "ts流UDP信号播出", 
        "322": "ts流UDP信号实时预监",
        "400": "技术审核", 
        "401": "关键帧提取", 
        "450": "视频水印添加", 
        "451": "视频水印检测", 
        "460": "音频水印添加", 
        "461": "音频水印检测",
        "500": "特征提取", 
        "501": "特征检索", 
        "510": "图像特征提取", 
        "511": "图像特征检索", 
        "520": "台标检测", 
        "521": "挂角广告检测",
        "522": "游动字幕检测", 
        "523": "错播检测", 
        "530": "字幕识别", 
        "531": "语音识别"
};*/

var gTaskStates = {
		"0": 	{DESC:"", NAME: "rely"},
		"1":	{DESC:"新任务", NAME: "ready"}, //等待
		"2":	{DESC:"新任务", NAME: "waiting"}, //准备
		"100":	{DESC:"执行中", NAME: "running"},
		"101":	{DESC:"运行时异常", NAME: "runtime_exception"},
		"199":	{DESC:"未知", NAME: "unknow"},
		"200":	{DESC:"成功", NAME: "success"},
		"210":	{DESC:"失败", NAME: "failure"},
		"220":	{DESC:"停止", NAME: "stop"},
		"230":	{DESC:"重审失败", NAME: "error_retry"},
		"240":	{DESC:"暂停", NAME: "pause"},
		"250":	{DESC:"终止", NAME: "terminate"},
		"260":	{DESC:"过期", NAME: "overdue"},
		"500":	{DESC:"删除", NAME: "delete"}
};

var gWorkerStates = {
		"0": 	{DESC:"空闲", NAME: "idle"},
		"3": 	{DESC:"运行中", NAME: "running"},
		"10": 	{DESC:"停止", NAME: "stop"},
		"101": 	{DESC:"异常", NAME: "error"}
};

jetsennet.Application.getUserByFunctionId = function (funcId) {
    var objs;
    jetsennet.request(jetsennet.appPath + "../../user",
			{ command: "getUserByFuncId", funcId: funcId },
			 function (sResult) {
			     objs = jetsennet.xml.toObject(sResult);
			 },
		     function (ex) { jetsennet.alert(ex); },
		     { async: false }
	);
    return objs;
};



/**
 * 是否为非法开始时间和结束时间
 * @param startTime
 * @param endTime
 * @return
 */
function illegalityTime(startDate, endDate){
	if(startDate&&endDate){
		var startTime = new Date(Date.parse(startDate.replace(/-/g,   "/"))).getTime();
		var endTime = new Date(Date.parse(endDate.replace(/-/g,   "/"))).getTime();
		if(startTime>endTime){
			jetsennet.alert("开始时间不能大于结束时间!");
			return true;
		}else{
			return false;
		}
	}else{
		return false;
	}
}


var gCwSysTypes = { 
		"0": "JMAM", 
		"1": "JDVN", 
		"2": "JNMP", 
		"3": "JSMP", 
		"4": "JDIN", 
		"5": "JDMA",
        "6": "JPPM", 
        "7": "JPPN", 
        "8": "JURM", 
        "9": "JDMP", 
        "10": "JMMP", 
        "11": "JMAMS", 
        "21": "JCMP", 
        "22": "JWFM",
        "23":"JMTC",
        "24": "JDSM", 
        "25": "JTSE", 
        "26": "JTSM", 
        "27": "JMSE"
};