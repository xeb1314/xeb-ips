
jetsennet.require("syntaxhighlighter/shcore2");
jetsennet.require("syntaxhighlighter/shBrushXml");
jetsennet.require([ "gridlist", "pagebar", "pageframe", "window", "bootstrap/moment", "crud", "autocomplete", 
                    "bootstrap/daterangepicker", "tabpane", "datepicker", "modelbase"]);//,"#model.ServiceInfo","SyntaxHighlighter.shCore2","SyntaxHighlighter.shBrushXml"
jetsennet.importCss("bootstrap/daterangepicker-bs3");


var serviceId = jetsennet.queryString("serviceId");
var gService = null;
var gWebService = null;
var gServiceSoapStyle = {};
var gResultIndex = 0;
var gWindowSizeChangedInterVal;
var gCurrentControlId = null;


/**r
 * 页面初始化
 */
function pageInit() {
	//{ layout : [  {splitType: 1, layout : [  30, 150,30]} ]}
//	 jQuery("#divPageFrame").pageFrame({ showSplit :false,splitType: 1, layout: [230,{ layout : [  {splitType: 1, layout : [  35, "auto",5,0]} , 1150]} ]}).sizeBind(window);
//	 alert(jetsennet.queryString("serviceId"));
	 loadWebService();
	 loadMethod();
};

/**
 * 处理后退
 */
function backward() {
	var a=  window.location.href;
	var b = a.substring(0,a.lastIndexOf("/",a.length-1));
    document.location = b+"/listwebservice.htm?width=screen.width&height=screen.height&img=collectionsysmgr.png&" + jetsennet.getValideQueryString() + "&sysid=163";
}

/**
 * 加载服务详情
 */
function loadWebService(){
	
	var sResult = DMADAO.query("commonXmlQuery", "SERVICE_ID", "DMA_WEBSERVICE", null, null, [["SERVICE_ID", serviceId , jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal]], "t.*");
	gWebService = jetsennet.xml.toObject(sResult.resultVal, "Record")[0];
	if(!$.isEmptyObject(gWebService)){
		el("lt_SERVICE_ID").innerHTML = gWebService.SERVICE_ID;
        el("lt_SERVICE_NAME").innerHTML = gWebService.SERVICE_NAME;
        el("lt_SERVICE_DESC").innerHTML = gWebService.SERVICE_DESC;
        el("lt_SERVICE_URL").innerHTML = gWebService.SERVICE_URL;
        el("lt_WSDL_PATH").innerHTML = gWebService.WSDL_PATH;
        el("lt_STATE").innerHTML = gWebService.STATE == "0" ? "正常" : "停用";
        el("lt_CREATE_USER").innerHTML = gWebService.CREATE_USER;
        el("lt_CREATE_TIME").innerHTML = gWebService.CREATE_TIME.substring(0, 10);

        if (gWebService.WSDL_PATH == null || gWebService.WSDL_PATH == "")
        	gWebService.WSDL_PATH = gWebService.SERVICE_URL;
	}
}

/**
 * 加载服务的方法
 */
function loadMethod() {
	
	el('divMethodList').innerHTML = "";
    var sqlCollection = new jetsennet.SqlConditionCollection();
    sqlCollection.add(jetsennet.SqlCondition.create("T.SERVICE_ID", serviceId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal));
    var gSqlQuery = new jetsennet.SqlQuery();
    var queryTable = jQuery.extend(new jetsennet.QueryTable(), { TableName: "DMA_WEBACTION", AliasName: "T" });
    jQuery.extend(gSqlQuery, { IsPageResult: 0,
        ResultFields: "T.METHOD_NAME",
        QueryTable: queryTable, Conditions: sqlCollection
    });
	
	var param = new HashMap();
    param.put("queryXml", gSqlQuery.toXml());
    var sResult = DMADAO.execute("commonXmlQuery", param);
    var xmlDoc = new jetsennet.XmlDoc();
//    var a = sResult.resultVal.replaceAll("Records","RecordSet");
    xmlDoc.loadXML(sResult.resultVal);
    el('divMethodList').innerHTML = jetsennet.xml.transform("xslt/servicemethod.xsl",xmlDoc);
	
}

/**
 *加载服务的soap
 * @param methodName
 * @param obj
 * @param isRefresh
 */
function loadServiceSoap(methodName, obj, isRefresh) {
    gServiceSoapStyle = {};
    gService = new jetsennet.jdma.Model.ServiceInfo();
    gService.onloaded = function (retVal) {
    	
    	
    	el('divServiceSoap').innerHTML = "";
    	/* var sqlCollection = new jetsennet.SqlConditionCollection();
        sqlCollection.add(jetsennet.SqlCondition.create("T.SERVICE_ID", serviceId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal));
        var gSqlQuery = new jetsennet.SqlQuery();
        var queryTable = jQuery.extend(new jetsennet.QueryTable(), { TableName: "DMA_WEBACTION", AliasName: "T" });
        jQuery.extend(gSqlQuery, { IsPageResult: 0,
            ResultFields: "T.METHOD_NAME",
            QueryTable: queryTable, Conditions: sqlCollection
        });
    	
    	var param = new HashMap();
        param.put("queryXml", gSqlQuery.toXml());
        var sResult = DMADAO.execute("commonXmlQuery", param);
        var xmlDoc = new jetsennet.XmlDoc();
        var a = sResult.resultVal.replaceAll("Records","RecordSet");
        xmlDoc.loadXML(a);*/
    	 retVal = jetsennet.xml.transformXML("xslt/servicesoap.xslt", retVal);
    	 
//    	 new jetsennet.ui.TabPane(el("tabPane"+methodName), el('divParam'+methodName)).select(0);
//        retVal = jetsennet.xml.transform("xslt/servicesoap.xslt",retVal);
    	
        if (!$.isEmptyObject(retVal)) {
            el('divServiceSoap').innerHTML = retVal;
            if (obj && obj != "") {
                if (typeof (obj) == "function")
                    obj();
                else
                    serviceMethodSelected(methodName, obj);
            }
        }
    }
    gService.load(serviceId, gWebService.WSDL_PATH, isRefresh ? 1 : 0);
}

//服务方法选择=================================================================================================
function serviceMethodSelected(methodName, obj) {
    if (gService == null) {
        return loadServiceSoap(methodName, obj, 0);
    }

    if (el('div' + methodName + '_Soap') != null) {
        var isCode = gServiceSoapStyle[methodName];
        if (!isCode || isCode == '0')
            dp.SyntaxHighlighter.HighlightAll('code' + methodName, false, false);

        gServiceSoapStyle[methodName] = "1";
        displayContent('div' + methodName + '_Soap');
    }
}

//测试服务方法=================================================================================================
function testMethod(methodName) {
   /* gSubFrame = jetsennet.extend(new jetsennet.UI.PageFrame('divSubFrame' + methodName), { splitType: 1, fixControlIndex: 0, showSplit: true,splitSize:3});
    gSubFrame.addControl(jetsennet.extend(new jetsennet.UI.PageItem("divTop" + methodName), { size: { height: 200, width: 0} }));
    gSubFrame.addControl(jetsennet.extend(new jetsennet.UI.PageItem("txtResult" + methodName), { showTitle: true, title: "服务测试结果" }));*/
    //gSubFrame.splitTitle = '<div class="title" style="border:0px;margin-top:1px"></div>';

   /* var d = jetsennet.extend(new jetsennet.UI.Window("test-" + methodName), { submitBox: true, cancelBox: true, okButtonText: "测试" });
    d.size = { width: 650, height: 450 };
    d.controls = ['div' + methodName];
    d.title = "服务方法测试 - " + methodName;
    d.onsubmit = function () {
        callTestMethod(methodName);
    };
    d.showDialog();*/
    var dialog = new jetsennet.ui.Window("test-" + methodName);
    jQuery.extend(dialog, { maximizeBox: false, minimizeBox: false, windowStyle: 1, submitBox: true, cancelBox: true, windowStyle: 1, okButtonText: "测试"});
    dialog.size = { width: 570, height: 550 };
    dialog.title = "服务方法测试 - " + methodName;
    dialog.onsubmit = function(){
    	callTestMethod(methodName);
    }
    dialog.controls = ['div' + methodName];
    dialog.showDialog();

    /*gSubFrame.size = { width: 650, height: d.currentStyle.contentHeight };
    gSubFrame.render();

    d.onresize = function (size) {
        gSubFrame.size = { width: size.width, height: size.contentHeight };
        gSubFrame.render();
    };*/
}

//调用测试方法=================================================================================================
function callTestMethod(methodName) {
    el('txtResult' + methodName).value = "";

    jetsennet.Application.isServiceErrorAutoGoTo = false;

    var ws = new jetsennet.Service(DMA_SYSTEM_SERVICE);
    ws.displayLoading = false;
	ws.async = false;
	ws.dataType = "json";
	ws.cacheLevel = 1;
    ws.oncallback = function (ret) {
        el('txtResult' + methodName).value = ret.value;
        jetsennet.alert("测试成功");
    }
    ws.onerror = function (ex) {
        jetsennet.error(ex);
        el('txtResult' + methodName).value = ex;
    };
    var params = new Array();
    var obj = document.getElementsByName('txtParam' + methodName);
    for (var i = 0; i < obj.length; i++) {
        params.push(obj[i].value);
    }
    ws.call("callService", [gWebService.WSDL_PATH, gWebService.SERVICE_URL, methodName, getMethodHead(methodName), jetsennet.xml.serialize(params, "params")]);

    jetsennet.Application.isServiceErrorAutoGoTo = true;
}

//获取方法头=================================================================================================
function getMethodHead(methodName) {
    var headStr = "";
    for (var i = 0; i < gService.ServiceMethods.length; i++) {
        if (gService.ServiceMethods[i].MethodName == methodName) {
            for (var j = 0; j < gService.ServiceMethods[i].HeadParams.length; j++) {
                var headParam = gService.ServiceMethods[i].HeadParams[j];
                headStr += "<" + headParam.HeadName + ">";
                for (var k = 0; k < headParam.HeadFields.length; k++) {
                    headStr += "<" + headParam.HeadFields[k].ParamName + ">";
                    headStr += getMethodHeadParamValue(methodName, headParam.HeadName, headParam.HeadFields[k].ParamName);
                    headStr += "</" + headParam.HeadFields[k].ParamName + ">";
                }
                headStr += "</" + headParam.HeadName + ">";
            }
        }
    }
    return headStr;
}

//获取方法头部值=================================================================================================
function getMethodHeadParamValue(methodName, headName, paramName) {
    var obj = el("txtHead" + methodName + headName + paramName);
    if (obj.value != "")
        return obj.value;
    return jetsennet.Service.getMethodDefaultParamValue(obj.paramType);
}

//测试方法==============================================================================================
function testChecked() {
    if (gService == null) {
        return loadServiceSoap(methodName, testChecked, 0);
    }

    jetsennet.Application.isServiceErrorAutoGoTo = false;

    el("divAllResult").innerHTML = "";
    displayContent('divAllResult');
    gResultIndex = 0;
    var obj = document.getElementsByName("checkMethod");
    if (obj) {
        for (var i = 0; i < obj.length; i++) {
            if (obj[i].checked) {
                var methodName = obj[i].value;
                var subws = new jetsennet.Service(DMA_SYSTEM_SERVICE);
                subws.async = false;
                subws.oncallback = function ($) {
                    appendResult("<b>" + methodName + "</b>：测试成功");
                }
                subws.onerror = function (ex) {
                    appendResult("<b>" + methodName + "</b>:" + ex);
                }
                var params = new Array();
                var obj2 = document.getElementsByName('txtParam' + methodName);
                for (var j = 0; j < obj2.length; j++) {
                    params.push(jetsennet.Service.getMethodDefaultParamValue(obj2[j].paramType));
                }
                subws.call("callService", [gWebService.WSDL_PATH, gWebService.SERVICE_URL, methodName, getMethodHead(methodName), jetsennet.xml.serialize(params, "params")]);
            }
        }
    }

    jetsennet.Application.isServiceErrorAutoGoTo = true;
}

//添加结果================================================================================================
function appendResult(str) {
    if (gResultIndex == 0)
        el("divAllResult").appendChild(document.createElement("HR"));
    var e = document.createElement("DIV");
    if (gResultIndex % 2 == 0)
        e.className = "result1";
    else
        e.className = "result2";
    e.innerHTML = str;
    el("divAllResult").appendChild(e);
    gResultIndex++;
}

//全选事件================================================================================================= 
function selectAll(checked) {
  var obj = document.getElementsByName("checkMethod");
  if (obj) {
      for (var i = 0; i < obj.length; i++) {
          obj[i].checked = checked;
      }
  }
}

//显示内容=================================================================================================
function displayContent(controlId) {
    if (gCurrentControlId != null) {
        var oldControl = el(gCurrentControlId);
        if (oldControl) {
            oldControl.style.display = "none";
            document.body.appendChild(oldControl);
        }
    }
    gCurrentControlId = controlId;
    var newControl = el(gCurrentControlId);
    newControl.style.display = "";
    el('divRight').appendChild(newControl);
}