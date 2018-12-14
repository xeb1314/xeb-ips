jetsennet.importCss([ "jetsen", "bootstrap/bootstrap" ]);
jetsennet.require(["layoutit"]);

var DMADAO = new jetsennet.DefaultDal("DMASystemService");
DMADAO.dataType = "xml";

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

//=============================================================================
//互联互通平台配置系统
//=============================================================================
jetsennet.registerNamespace("jetsennet.application");

jetsennet.valideLogin();

var DMA_SYSTEM_SERVICE = jetsennet.appPath + "../../services/DMASystemService?wsdl";
var DMA_MANAGER_SERVICE = jetsennet.appPath + "../../services/DMAManagerService?wsdl";
/*var FMS_SYSTEM_SERVICE = jetsennet.appPath + "../../services/FMSSystemService?wsdl";
var FMS_MANAGER_SERVICE = jetsennet.appPath + "../../services/FMSManagerService?wsdl";*/

jetsennet.application.getTypeMapping = function (/*string*/typeName) {
    switch (typeName) {
        case "":
            break;
    }
    return typeName;
};

jetsennet.application.isServiceErrorAutoGoTo = true;
//webservice结果验证===========================================================
jetsennet.Service.prototype.onresultvalidate = function (retObj) {
    if (retObj) {
        if (retObj.error === true || retObj.errorCode != 0) {
            var errorName = valueOf(valueOf(jetsennet, "ERROR_CODE", null), retObj.errorCode, null);
            if (!jetsennet.util.isNullOrEmpty(errorName)) {
                retObj.errorString = errorName;
                if (jetsennet.application.isServiceErrorAutoGoTo) {
                    if (jetsennet.alertAndCall) {
                        jetsennet.alertAndCall(retObj.errorString, "jetsennet.gotoLogin();")
                    }
                    else {
                        alert(retObj.errorString);
                        jetsennet.gotoLogin();
                    }
                    return false;
                }
            }
        }
    }
};




