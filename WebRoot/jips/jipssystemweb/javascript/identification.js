jetsennet.require([ "gridlist", "pagebar","pageframe", "window", "bootstrap/moment", "bootstrap/daterangepicker", "crud","datepicker"]);
jetsennet.importCss("bootstrap/daterangepicker-bs3");

var gCurDate = new Date();
var gLastWeekDate;

var tdColor={l4:'#FF0000',l3:'#FFDA44',l2:'#92FF77',l1:'#44DAFF'};


var gColumns = [ { fieldName: "CMOBJ_ID", width: 30, align: "center", isCheck: 1, checkName: "chkIdentification"},
                         { fieldName: "NAME", sortField: "NAME", width:"100%", align: "center", name: "文件名"},
                        { fieldName: "CREATE_TIME", sortField: "CREATE_TIME", width:200, align: "center", name: "入库时间"},
                        { fieldName: "FIELD_1", sortField: "FIELD_1", width:200, align: "center", name: "选择标示"},
                        { fieldName: "FIELD_2", sortField: "FIELD_2", width:200, align: "center", name: "细分类型名"},
                        { fieldName: "FIELD_32", sortField: "FIELD_32", width:200, align: "center", name: "数据服务器IP地址"},
                        { fieldName: "CMOBJ_ID,NAME,FIELD_1,TIME_1,FIELD_2,FIELD_3,FIELD_4,FIELD_5,FIELD_6,FIELD_7,FIELD_8,FIELD_9,FIELD_10,FIELD_11,FIELD_12,FIELD_13,FIELD_14,FIELD_15," +
                        		"FIELD_16,FIELD_17,FIELD_18,FIELD_20,FIELD_21,FIELD_22,FIELD_23,FIELD_24,FIELD_25,FIELD_26,FIELD_27,FIELD_28,FIELD_29,FIELD_30,FIELD_19,FIELD_31,FIELD_32,", width:45, align: "center", name: "详情", format: function(val,vals){
                        	return '<span onclick="viewIdentificationDetail(\''+vals+'\')"><img src="images/cel_info.png"/></span>';
                        }}
                        ];
var gCrud = $.extend(new jetsennet.Crud("divList", gColumns, "divPageBar", "ORDER BY t.CREATE_TIME DESC"), {
    dao : IPSDAO,
    tableName : "CM803_OBJECT",
    resultFields : "t.*",
    keyId : "CMOBJ_ID",
    name : "身份认证",
    checkId : "chkIdentification",
    className : "jetsennet.ips.schema.Cm803Object",
});
gCrud.grid.ondoubleclick = null;

/**
 * 页面初始化
 */
function pageInit() {
	
	 jQuery("#divPageFrame").pageFrame({ showSplit :false,splitType: 1,layout: [130, {splitType: 1, layout: [45, "auto"]}, 35]}).sizeBind(window);
	 jQuery("#txtStartTime").pickDate();
 	 jQuery("#txtEndTime").pickDate();
	 gLastWeekDate = new Date(gCurDate.getTime() - 6 * 24 * 3600 * 1000);
     el('txtStartTime').value = gLastWeekDate.toDateString();
     el('txtEndTime').value = gCurDate.toDateString();
     gCrud.search();
};

/**
 * 查询列表
 */
function searchlog() {
    var conditions = [];
    
    if (el("txtStartTime").value != '') {
    	conditions.push(["CREATE_TIME", el("txtStartTime").value + " 00:00:00", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.ThanEqual, jetsennet.SqlParamType.DateTime]);						
    }
    if (el("txtEndTime").value != '') {
    	conditions.push(["CREATE_TIME", el("txtEndTime").value + " 23:59:59", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.LessEqual, jetsennet.SqlParamType.DateTime]);						
    }
    if (el("txtKeyWord").value != '') {
    	conditions.push(["NAME", el("txtKeyWord").value , jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Like]);						
    }
    gCrud.search(conditions);
}


function viewIdentificationDetail(vals)
{
	 var values = vals.split(",");
	
	el("txtName").value=values[1];
	el("txtheckedMark").value=values[2];
	el("txtBEGINTIME").value=values[3];
	el("txtSTYPEName").value=values[4];
	el("txtUserName").value=values[5];
	el("txtPASSWORD").value=values[6];
	el("txtLightLayer").value=values[7];
	el("txtElectricityLayer").value=values[8];
	el("txtFileNum").value=values[9];
	el("txtFileLength").value=values[10];
	el("txtFTPIP").value=values[11];
	el("txtSourceIP").value=values[12];
	el("txtGoal_IP").value=values[13];
	el("txtSourceIPAttribute").value=values[14];
	el("txtGoalAttribute").value=values[15];
	el("txtSourcePort").value=values[16];
	el("txtDEST_PORT").value=values[17];
	el("txtSTYPE").value=values[18];
	el("txtSlotTime").value=values[19];
	el("txtSLINENO").value=values[20];
	el("txtIsImportanceIP").value=values[21];
	el("txtTask").value=values[22];
	el("txtAreaCode").value=values[23];
	el("txtIsFull").value=values[24];
	el("txtIsPlaintextData").value=values[25];
	el("txtIsEnabledPassWord").value=values[26];
	el("txtIsDoubleData").value=values[27];
	el("txtToLightLayer").value=values[28];
	el("txtToElectricityLayer").value=values[29];
	el("txtToSlotTime").value=values[30];
	el("txtToSLINENO").value=values[31];
	el("txtFiltrate").value=values[32];
	el("txtFrameHeader").value=values[33];
	el("txtServerIp").value=values[34];
	
	var dialog = new jetsennet.ui.Window("identiDetail-window");
    jQuery.extend(dialog, { submitBox: false, cancelBox: false, maximizeBox: false, showScroll: false, windowStyle: 1, minimizeBox: false, title: "身份认证详情" });
    dialog.size = { width: 1100, height: 0 };
    dialog.controls = ["divIdentification"];
    dialog.showDialog();
}
