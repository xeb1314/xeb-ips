jetsennet.require(["window"]);

function pageInit() {
	getDBType();
	getData();
}


//加载数据库类型
function getDBType() {
	var conditions = [];
	conditions.push(["CW_SYS", "22", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
	conditions.push(["CW_TYPE", "2202", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
	var sResult = WFMDAO.query("commonXmlQuery", "CW_ID", "NET_CTRLWORD", null, null,conditions, "CW_ID,CW_NAME,CW_TYPE");
	var objs = jetsennet.xml.toObject(sResult.resultVal, "Record");
	if (objs && objs.length > 0) {
		for (var i = 0; i < objs.length; i++) {
			jQuery("<option>"+objs[i].CW_NAME+"</option>", {}).attr("value", objs[i].CW_NAME).appendTo($("#txtSourceType"));
		}
	}
}


/**
 * 保存数据 保存ManagerUrl
 * @param flag
 * @return
 */
function saveDataManager(){
	var areaElements = jetsennet.form.getElements("form_manager_url");
	if (jetsennet.form.validate(areaElements, true)) {
		var dataOjb =
	    	{
				NAME: "MANAGER_URL",
				DATA: el("txtManagerUrl").value
	    	};
		var params = new HashMap();
        params.put("className", "SysConfigBusiness");
		if(el("hidManagerUrlName").value){
			params.put("updateXml", jetsennet.xml.serialize(dataOjb, "WFM_SYSCONFIG"));
            params.put("isFilterNull", true);
			var sResult = WFMDAO.execute("commonObjUpdateByPk",params);
	        if(sResult.errorCode==0) {
	        	el("hidManagerUrlName").value = "MANAGER_URL";
	        	jetsennet.clearValidateState(areaElements);
			    jetsennet.message('保存成功！');
	        }
		}else{
			params.put("saveXml", jetsennet.xml.serialize(dataOjb, "WFM_SYSCONFIG"));
			var sResult = WFMDAO.execute("commonObjInsert",params);
	        if(sResult.errorCode==0){
	        	el("hidManagerUrlName").value = "MANAGER_URL";
	        	jetsennet.clearValidateState(areaElements);
			    jetsennet.message('保存成功！');
	        }
		}
    }
}


/**
 * 保存业务系统数据库信息
 * @return
 */
function saveDataSource(){
	var areaElements = jetsennet.form.getElements("form_datasource");
	if (jetsennet.form.validate(areaElements, true)) {
		var dataSource = {
				dbType:el("txtSourceType").value,
				dbName:el("txtDBName").value,
				dbUrl:el("txtSourceUrl").value,
				dbUser:el("txtUserName").value,
				dbPwd:el("txtPassword").value
		};
		var	dataOjb =
		{
				NAME: "CM_DB",
				DATA: jetsennet.xml.serialize(dataSource, "DBCfg")
		};
		var params = new HashMap();
        params.put("className", "SysConfigBusiness");
		if(el("hidDataSourceName").value){
			params.put("updateXml", jetsennet.xml.serialize(dataOjb, "WFM_SYSCONFIG"));
            params.put("isFilterNull", true);
			var sResult = WFMDAO.execute("commonObjUpdateByPk",params);
	        if(sResult.errorCode==0){
	        	el("hidDataSourceName").value = "CM_DB";
	        	jetsennet.clearValidateState(areaElements);
			    jetsennet.message('保存成功！');
	        }
		}else{
			params.put("saveXml", jetsennet.xml.serialize(dataOjb, "WFM_SYSCONFIG"));
			var sResult = WFMDAO.execute("commonObjInsert",params);
	        if(sResult.errorCode==0){
	        	el("hidDataSourceName").value = "CM_DB";
	        	jetsennet.clearValidateState(areaElements);
			    jetsennet.message('保存成功！');
	        }
		}
    }
}

/**
 * 获取值
 * @return
 */
function getData(){
	el('hidManagerUrlName').value = "";
    el('hidDataSourceName').value = "";
    var result = WFMDAO.query("commonXmlQuery", "NAME", "WFM_SYSCONFIG", null, null,[], "");
    var objs = jetsennet.xml.toObject(result.resultVal, "Record");
    if (objs && objs.length > 0) {
    	for ( var i = 0; i < objs.length; i++) {
			if(objs[i].NAME=="MANAGER_URL"){
				el('hidManagerUrlName').value = "MANAGER_URL";
				el("txtManagerUrl").value = objs[i].DATA;
			}else if(objs[i].NAME=="CM_DB"){
				el('hidDataSourceName').value = objs[i].NAME;
			    var params = jQuery.extend({}, jetsennet.xml.deserialize(objs[i].DATA));
			    el('txtSourceUrl').value = params.dbUrl;
			    el('txtDBName').value = params.dbName;
			    el('txtUserName').value = params.dbUser;
			    el('txtPassword').value = params.dbPwd;
			    el("txtSourceType").value = params.dbType;
			}
		}
    }
}

