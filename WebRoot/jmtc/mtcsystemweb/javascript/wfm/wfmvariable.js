var currentIndex;
function getTabIndex(obj){
	currentIndex = obj.rowIndex;
}

//弹出可供选择的条件变量
var gGridList = new jetsennet.ui.GridList(); 
gGridList.enableMultiRow = false;
function loadVariable(htmlId) {
	var result = viarable_result;
	if(result&&result.length>0){
        for (var i = 0; i < result.length; i++) {
            var varName = result[i].VAR_NAME;
            if (varName != null&&varName.substring(0,1)=="@") {
                result[i].VAR_NAME = jetsennet.xml.htmlEscape(varName.substring(1));
                result[i].VAR_DESC = jetsennet.xml.htmlEscape(result[i].VAR_DESC);
            }
        }
    }
    var window = new jetsennet.ui.Window("show-variable1");
    jQuery.extend(window, { submitBox: true, cancelBox: true, okButtonText: "确定", cancelButtonText: "取消", maximizeBox: false, minimizeBox: false, windowStyle: 1, size: { width: 500, height: 420 }, showScroll: false, title: "变量选择" });
    window.controls = ["divVariableList"];
    window.onsubmit = function () {
        if (htmlId) {
        	$("#divVariableList tr").each(function(){
        		if(this.className=="selected"){
        			el(htmlId).value = this.cells[0].innerText.trim();
        		}
        	});
        } else {
            selectVariable();
            showConditionVariableTable();
        }
        jetsennet.ui.Windows.close("show-variable1");
    };
    window.showDialog();
    var varXml = "<RecordSet>";
    $.each(result,function(){
    	varXml += jetsennet.xml.serialize(this, "Record");
    });
    varXml += "</RecordSet>";
    el('divVariableList').innerHTML = jetsennet.xml.transform("../xslt/wfm/variableselect.xslt", varXml);
    gGridList.bind(el("divVariableList"), el("tabFlow"));
}

//选中的变量
function selectVariable() {
	$("#divVariableList tr").each(function(){
		if(this.className=="selected"){
			var addstr = "";
            if (this.cells[1].innerText.indexOf("字符") > -1) {
                addstr = this.cells[0].innerText + "='" + this.cells[2].innerText + "'";
            } else if (this.cells[1].innerText.indexOf("日期") > -1) {
                addstr = this.cells[0].innerText + "=" + (this.cells[2].innerText&&this.cells[2].innerText.trim() ? this.cells[2].innerText.trim() : new Date().toDateString());
            } else {
                addstr = this.cells[0].innerText + "=" + this.cells[2].innerText;
            }
            conditionArray.push(addstr);
		}
	});
}

function delConditionVariable(obj) {
	setTimeout(function(){
		conditionArray.remove(currentIndex);
		showConditionVariableTable();
	}, 0);
}

Array.prototype.remove = function (dx) {
    if (isNaN(dx) || dx > this.length) { return false; }
    for (var i = 0, n = 0; i < this.length; i++) {
        if (this[i] != this[dx]) {
            this[n++] = this[i];
        }
    }
    this.length -= 1;
};

var sysbol = ["≠", "≤", "≥", "<", ">", "="];
var sysbolChan = ["不等于", "小于等于", "大于等于", "小于", "大于", "等于"];
function setVariableParam(varName,varType,varOperate,varValue) {
	setTimeout(function(){
		if(varType == "0"){
			var varstr = conditionArray[currentIndex].split(varOperate)[1];
			varValue = varstr.substring(varstr.indexOf("'")+1,varstr.lastIndexOf("'"));
		}else{
			varValue = conditionArray[currentIndex].split(varOperate)[1];
		}
		var window = new jetsennet.ui.Window("show-variable-detail");
		var elements = jetsennet.form.getElements("divVariableDetail");
		jetsennet.form.clearValidateState(elements);
	    jQuery.extend(window, { submitBox: true, cancelBox: true, okButtonText: "确定", cancelButtonText: "取消", maximizeBox: false, minimizeBox: false, windowStyle: 1, size: { width: 550, height: 180 }, showScroll: false, title: "条件修改" });
	    window.controls = ["divVariableDetail"];
	    window.onsubmit = function () {
		    if (jetsennet.validate(elements, true)) {
		    	getConditionValue(varType);
		    	showConditionVariableTable();
		    	jetsennet.ui.Windows.close("show-variable-detail");
		    }
	    };
	    window.showDialog();
	    el("span_VariableName").innerHTML = varName;
	    el("txt_VariableOperate").value = varOperate;
	    if (varType == "2") {
	        el("txt_VeriableValue_Str").style.display = "none";
	        el("txt_VeriableValue_Int").style.display = "none";
	        el("txt_VeriableValue_Date_span").style.display = "";
	        el("txt_VeriableValue_Date").value = varValue;
	        $("#txt_VeriableValue_Int").attr("validatetype","");
	        $("#txt_VeriableValue_Str").attr("validatetype","");
	        $("#txt_VeriableValue_Date").attr("validatetype","NotEmpty");
	    } else if (varType == "0") {
	        el("txt_VeriableValue_Str").style.display = "";
	        el("txt_VeriableValue_Int").style.display = "none";
	        el("txt_VeriableValue_Date_span").style.display = "none";
	        el("txt_VeriableValue_Str").value = varValue;
	        $("#txt_VeriableValue_Int").attr("validatetype","");
	        $("#txt_VeriableValue_Date").attr("validatetype","");
	        $("#txt_VeriableValue_Str").attr("validatetype","maxlength");
	    }
	    else {
	        el("txt_VeriableValue_Str").style.display = "none";
	        el("txt_VeriableValue_Int").style.display = "";
	        el("txt_VeriableValue_Date_span").style.display = "none";
	        el("txt_VeriableValue_Int").value = varValue;
	        $("#txt_VeriableValue_Int").attr("validatetype","Integer,NotEmpty,maxvalue");
	        $("#txt_VeriableValue_Date").attr("validatetype","");
	        $("#txt_VeriableValue_Str").attr("validatetype","");
	    }
	}, 0);
}


function getConditionValue(varType){
	var conditionValue = "";
	var operValue = el("txt_VariableOperate").value;
	switch(parseInt(varType)){
		case 2:
			conditionValue = el("txt_VeriableValue_Date").value;
			break;
		case 1:
			conditionValue = el("txt_VeriableValue_Int").value;
			break;
		case 0:
			conditionValue = el("txt_VeriableValue_Str").value;
			break;
		default:
            return false;
	}
	$("#divConditionVariableWin tr").each(function () {
    	if(this.className=="selected") {
    		this.cells[2].innerText = operValue;
    		var elements = jetsennet.form.getElements("divVariableDetail");
    		jetsennet.form.clearValidateState(elements);
    		if (jetsennet.validate(elements, true)) {
    			this.cells[3].innerText = conditionValue;
    		}
            var editStr = "";
            if (this.cells[1].innerText.indexOf("字符") > -1) {
                editStr = this.cells[0].innerText + this.cells[2].innerText + "'" + this.cells[3].innerText + "'";
            } else {
                editStr = this.cells[0].innerText + this.cells[2].innerText + this.cells[3].innerText;
            }
            var index = this.rowIndex;
            conditionArray[index] = editStr;
        }
    });
}

function changeOperate(operValue, type) {
//	if(type=="text"){
//		 var elements = jetsennet.form.getElements("divVariableDetail");
//         jetsennet.form.clearValidateState(elements);
//         if (jetsennet.validate(elements, true)) {
//         }
//	}
//	if(type=="select"){
//		
//	}
}


var allVarNameArray = [];
function initVaribale() {
    var sqlQuery = new jetsennet.SqlQuery();
    var queryTable = jetsennet.createQueryTable("WFM_VARIABLE");
    jQuery.extend(sqlQuery, { IsPageResult: 0, QueryTable: queryTable, ResultFields: "" });

    var param = new HashMap();
    param.put("queryXml", sqlQuery.toXml());
    var sResult = MTCDAO.execute("commonXmlQuery", param);
    var records = jetsennet.xml.toObject(sResult.resultVal, "Record");
    viarable_result = records;
    allVarNameArray = [];
    if (records) {
        for (var i = 0, len = records.length; i < len; i++) {
            allVarNameArray.push(records[i]["VAR_NAME"].replace("@", ""));
        }
    }
}
