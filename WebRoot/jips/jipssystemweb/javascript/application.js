jetsennet.importCss([ "jetsen", "bootstrap/bootstrap" ]);
jetsennet.require(["layoutit", "bootstrap/moment", "bootstrap/daterangepicker"]);
var IPSDAO = new jetsennet.DefaultDal("IPSSystemService");
IPSDAO.dataType = "xml";

//uumdao
var UUMDAO = new jetsennet.DefaultDal("UUMSystemService");
UUMDAO.dataType = "xml";

var WFMDAO = new jetsennet.DefaultDal("WFMSystemService");
WFMDAO.dataType = "xml";

var MTCDAO = new jetsennet.DefaultDal("MTCSystemService");
MTCDAO.dataType = "xml";

//页面跳转
function goto(pageUrl) {
    window.location = pageUrl + "?" + jetsennet.getValideQueryString();
}


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
}

jetsennet.Application.openPage = function (funcId)
{
	var sqlCollection = new jetsennet.SqlConditionCollection();
    gSqlQuery = new jetsennet.SqlQuery();
    var queryTable = jQuery.extend(new jetsennet.QueryTable(), { TableName: "UUM_FUNCTION", AliasName: "J" });
    jQuery.extend(gSqlQuery, { IsPageResult: 0, PageInfo : null, ResultFields: "J.*",
        QueryTable: queryTable, Conditions: sqlCollection
    });
	
	var param = new HashMap();
    param.put("queryXml", gSqlQuery.toXml());
    var sResult = UUMDAO.execute("commonXmlQuery", param);
    var xmlDoc = new jetsennet.XmlDoc();
    xmlDoc.loadXML(sResult.resultVal.replaceAll("Records","RecordSet"));
    var nodes = xmlDoc.documentElement.selectNodes("Record");
    for ( var i = 0; i < nodes.length; i++) {
        var menuUrl = valueOf(nodes[i].selectSingleNode("PARAM"),"text", "");
        $('#JetsenMain').attr("src", "../../../" + menuUrl);
//		var menuId = valueOf(nodes[i].selectSingleNode("ID"),"text", "0");
//		var queryString = jetsennet.getValideQueryString(menuUrl);
//		if(menuUrl.indexOf('?')>=0){
//			menuUrl += "&"+queryString;
//		}else{
//			menuUrl += "?"+queryString;
//			menuUrl += "&sysid="+menuId;
//		}
//		window.parent.openPage(records.NAME,menuUrl,false);
    }
}

//日期范围选取框通用配置
var dataPickerOptions = { 
      ranges : { 
        '今天' : [ moment(), moment()], 
        '昨天' : [ moment().subtract('days', 1), moment().subtract('days', 1) ], 
        '最近一周' : [ moment().subtract('days', 6), moment() ], 
        '最近一月' : [ moment().subtract('days', 29), moment() ],
        '本月' : [ moment().startOf('month'), moment().endOf('month') ], 
        '上月' : [ moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month') ] 
      }, 
      format: 'YYYY-MM-DD', 
      startDate: new Date(), 
      showDropdowns: true, 
      separator:' - ', 
      locale: { 
        applyLabel: '确定',
        cancelLabel: '取消', 
        fromLabel: '从', 
        toLabel: '到', 
        customRangeLabel: '其他', 
        daysOfWeek: ['日', '一', '二', '三', '四', '五','六'], 
        monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'], 
        firstDay: 0 
      } 
};


