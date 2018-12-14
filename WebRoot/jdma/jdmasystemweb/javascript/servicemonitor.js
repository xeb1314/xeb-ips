jetsennet.require("syntaxhighlighter/shcore2");
jetsennet.require("syntaxhighlighter/shBrushXml");
jetsennet.require([ "gridlist", "pagebar", "pageframe", "window", "bootstrap/moment", "crud","autocomplete", "bootstrap/daterangepicker","datepicker"]);
jetsennet.importCss("bootstrap/daterangepicker-bs3");

var gCurDate = new Date();
var gLastWeekDate;
var sqlCollection = new jetsennet.SqlConditionCollection();
var pInfo = new jetsennet.ui.PageBar();
pInfo.onpagechange = function () {
	loadServiceLog();
};
pInfo.orderBy = " ORDER BY REQUEST_TIME DESC";
pInfo.currentPage = 1;
//pInfo.pageSize = 5;
pInfo.onupdate = function () {
el('divRequestServiceListPage').innerHTML = this.render();
};
var gGridList = new jetsennet.ui.GridList();
gGridList.ondatasort = function(sortfield, desc) {
pInfo.setOrderBy(sortfield, desc);
};

/**
 * 页面初始化
 */
function pageInit() {
	
	 jQuery("#txtStartTime").pickDate();
 	 jQuery("#txtEndTime").pickDate();
	/* gLastWeekDate = new Date(gCurDate.getTime() - 6 * 24 * 3600 * 1000);
     el('txtStartTime').value = gLastWeekDate.toDateString();
     el('txtEndTime').value = gCurDate.toDateString();*/
     searchServiceLog();
};

/**
*查找服务日志
*/
function searchServiceLog() {
	sqlCollection.clear();
   if (el("txtStartTime").value != '') {
   	sqlCollection.add(jetsennet.SqlCondition.create("REQUEST_TIME", el("txtStartTime").value + " 00:00:00", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.ThanEqual, jetsennet.SqlParamType.DateTime));						
   }
   if (el("txtEndTime").value != '') {
   	sqlCollection.add(jetsennet.SqlCondition.create("REQUEST_TIME", el("txtEndTime").value + " 23:59:59", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.LessEqual, jetsennet.SqlParamType.DateTime));						
   }
   if (el('ddlState').value != "") {
   	sqlCollection.add(jetsennet.SqlCondition.create("STATE", el('ddlState').value, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric));
   }
   var varOperation = jetsennet.util.trim(el("txt_Operation").value);
   if (varOperation.length > 0) {
   	sqlCollection.add(jetsennet.SqlCondition.create("ACTION_NAME", varOperation, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Like, jetsennet.SqlParamType.String));
   }
   if (el('txt_RequestUser').value.length > 0) {
   	sqlCollection.add(jetsennet.SqlCondition.create("USER_NAME", el('txt_RequestUser').value, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Like, jetsennet.SqlParamType.String));
   }
   loadServiceLog();
}


//加载服务日志======================================================================================
function loadServiceLog() {

	 	el('divRequestServiceList').innerHTML = "";
	    var gSqlQuery = new jetsennet.SqlQuery();
	    var queryTable = jQuery.extend(new jetsennet.QueryTable(), { TableName: "DMA_WEBINVOKE", AliasName: "T" });
	    jQuery.extend(gSqlQuery, { IsPageResult: 1, PageInfo : pInfo ,OrderString: pInfo.orderBy,
	        ResultFields: "T.*",
	        QueryTable: queryTable, Conditions: sqlCollection
	    });
		
	    var param = new HashMap();
	    param.put("queryXml", gSqlQuery.toXml());
	    param.put("startPageNum", pInfo.currentPage-1);
	    param.put("pageSize", pInfo.pageSize);
	    var sResult = DMADAO.execute("commonQueryForPage", param);
    	var xmlDoc = new jetsennet.XmlDoc();
 	    xmlDoc.loadXML(sResult.resultVal);
 	    var count = xmlDoc.documentElement.getAttribute("TotalCount");
 	    el('divRequestServiceList').innerHTML = jetsennet.xml.transform("xslt/servicemonitor.xslt",xmlDoc);
 	    gGridList.bind(el("divRequestServiceList"), el("tabServiceLog"));
 	    pInfo.setRowCount(count);
}

//显示服务援用详情======================================================================================
function viewServiceInvoke(invokeId) {
    var condition = new jetsennet.SqlConditionCollection();
    condition.SqlConditions.push(jetsennet.SqlCondition.create("INVOKE_ID", invokeId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Like, jetsennet.SqlParamType.String));

/*    var sqlQuery = new jetsennet.SqlQuery();
    jQuery.extend(sqlQuery, { IsPageResult: 0, KeyId: "INVOKE_ID", PageInfo: null, ResultFields: "SERVICE_URL,ACTION_NAME,STATE_DESC,REQUEST_XML,INVOKE_ID,RESPONSE_XML",
        QueryTable: jQuery.extend(new jetsennet.QueryTable(), { TableName: "DMA_WEBINVOKE" })
    });
    sqlQuery.Conditions = condition;
*/
   var gSqlQuery = new jetsennet.SqlQuery();
    var queryTable = jQuery.extend(new jetsennet.QueryTable(), { TableName: "DMA_WEBINVOKE", AliasName: "T" });
    jQuery.extend(gSqlQuery, { IsPageResult: 0,
        ResultFields: "T.*",
        QueryTable: queryTable, Conditions: condition
    });
	
	var param = new HashMap();
    param.put("queryXml", gSqlQuery.toXml());
	//  queryXmlForPage
    var sResult = DMADAO.execute("commonXmlQuery", param);
	var xmlDoc = new jetsennet.XmlDoc();
	    xmlDoc.loadXML(sResult.resultVal);
	    
	    el('divInvokeInfo').innerHTML = "";
	    el('divInvokeInfo').innerHTML = jetsennet.xml.transform("xslt/serviceinvoke.xslt",xmlDoc);
	    
	    var dialog = new jetsennet.ui.Window("invoke-info-window");
        dialog.controls = ["divInvokeInfo"];
        dialog.size = { width: 600, height: 550 };
        dialog.title = "服务请求信息";
        dialog.maximizeBox = true;
        dialog.minimizeBox = true;
        dialog.submitBox = false;
        dialog.cancelBox = false;
        dialog.showDialog();
        dp.SyntaxHighlighter.HighlightAll('request' + invokeId, false, false);
}

//全选======================================================================================
function checkAllLog(isCheck) {
    var obj = document.getElementsByName("chkServiceLog");
    if (obj != null) {
        for (var i = 0; i < obj.length; i++) {
            obj[i].checked = isCheck;
        }
    }
}

//删除服务日志======================================================================================
function deleteServiceLog() {
    var ids = "";
    var obj = document.getElementsByName("chkServiceLog");
    if (obj != null) {
        for (var i = 0; i < obj.length; i++) {
            if (obj[i].checked) {
                if (ids == "")
                    ids = obj[i].value;
                else
                    ids += "," + obj[i].value;
            }
        }
    }
    if (ids == "") {
        jetsennet.alert("请选择要删除的记录!");
        return;
    }
    jetsennet.confirm("确定删除?", function () {
       /* var ws = new jetsennet.Service(DMA_MANAGER_SERVICE);
        ws.displayLoading = false;
        ws.oncallback = function (el) {
            loadServiceLog();
        }
        ws.onerror = function (ex) { jetsennet.error(ex); };
        ws.call("dmaObjDelete", ["DMA_WEBINVOKE", ids]);*/
    /*	var Xml=[];
		Xml.push("<TABLE TABLE_NAME='DMA_WEBINVOKE'><SqlWhereInfo><INVOKE_ID ParamType='String' RelationType='In' LogicType='And'>"+ids+"</INVOKE_ID>" +
				"</SqlWhereInfo></TABLE>");
    	var param = new HashMap();
    	    param.put("deleteXml", Xml.join(""));
        var sResult = DMADAO.execute("commonObjsDeleteByCondition", param);*/
    	
    	var params = new HashMap();
	    params.put("className", "jetsennet.jdma.schema.DmaWebinvoke");
	    params.put("deleteIds", ids);
	    var result = DMADAO.execute("commonObjDelete", params);
	    if (result && result.errorCode == 0) {
	        /*if (this.onRemoveSuccess) {
	            this.onRemoveSuccess(ids);
	        }
	        this.load();*/
	    	loadServiceLog();
	    }
    	
    	
        return true;
    });
}
