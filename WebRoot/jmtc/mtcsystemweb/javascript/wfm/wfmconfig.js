jetsennet.require([ "gridlist", "pagebar", "window", "bootstrap/moment", "bootstrap/daterangepicker", "crud","datepicker"]);
jetsennet.importCss("bootstrap/daterangepicker-bs3");
       
var WFM_CTRL_WORDTYPE=2201; // 工作流节点受控词类型
var gCtrlWordType={};
var actClasses=[{ID:"",NAME:"请选择节点分类"}];

function pageInit(){
	loadCtrlWordType(WFM_CTRL_WORDTYPE);
	gActCrud.load();
	gVarCrud.load();
}


/**
 * 加载受控类别
 */
function loadCtrlWordType(type) 
{
	var conditions = [];
	if(type){
		conditions.push(["CW_TYPE", type, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);		
	}
	conditions.push(["CW_SYS", "22", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
	var sResult = WFMDAO.query("commonXmlQuery", "CW_ID", "NET_CTRLWORD", null, null, conditions, "CW_ID,CW_NAME,CW_CODE,CW_DESC");
	var objs = jetsennet.xml.toObject(sResult.resultVal, "Record");
	if (objs && objs.length > 0) 
	{
		for (var i = 0; i < objs.length; i++) 
		{
			gCtrlWordType[objs[i].CW_ID] = objs[i].CW_NAME;
			actClasses.push({ID:objs[i].CW_ID,NAME:objs[i].CW_NAME});
		}
	}
}


/**
 * 工作流节点列
 */
var gActColumns = [{ fieldName: "ACT_ID", width: 40, align: "center", isCheck: 1, checkName: "chkAct"},
                        { fieldName: "ACT_ID", sortType: SORT_STRING, width:50, align: "center", name: "编号"},
                        { fieldName: "ACT_NAME", sortType: SORT_STRING, width:100, align: "left", name: "节点名称"},
                        { fieldName: "ACT_TYPE", sortType: SORT_STRING, width:80, align: "left", name: "类型",format: function(val,vals){
                        	var typeName;
                        	switch(parseInt(val,10)){
                        	  case 1:
                        		  typeName="人工节点";
                        		  break;
                        	  case 2:
                        		  typeName="自动节点";
                        		  break;
                        	  case 3:
                        		  typeName="策略节点";
                        		  break;
                        	  case 10:
                        		  typeName="顺序流";
                        		  break;
                        	  case 11:
                        		  typeName="条件";
                        		  break;
                        	  case 12:
                        		  typeName="并行";
                        		  break;
                        	  case 13:
                        		  typeName="侦听";
                        		  break;
                        	  case 14:
                        		  typeName="循环";
                        		  break;
                              default:
                            	  typeName="未知-"+val;
                                  break;
                        	}
                        	return typeName;
                        }},
                        { fieldName: "ACT_CLASS", sortType: SORT_STRING, width:80, align: "left", name: "分类",format: function(val,vals){
                        	return gCtrlWordType[val] || '--';
                        }},
                        
                        { fieldName: "ACT_DESC", sortType: SORT_STRING, width:"100%", align: "left", name: "描述"},
                        { fieldName: "ACT_ID", width:45, align: "center", name: "删除", format: function(val,vals){
                            return '<span style="cursor:pointer;" onclick="gActCrud.remove(' + val + ')"><img src="../images/cel_del.png"></img></span>';
                          }}
                        ];

/**
 * 工作流变量列
 */
var gVarColumns = [ { fieldName: "VAR_ID", width: 40, align: "center", isCheck: 1, checkName: "chkVar"},
                    { fieldName: "VAR_NAME", sortType: SORT_STRING, width:100, align: "left", name: "变量名称",format: function(val,vals){
                    		return val?jetsennet.xml.htmlEscape(val.substring(1,val.length)):'--';
                    }},
                    { fieldName: "VAR_TYPE", sortType: SORT_STRING, width:100, align: "left", name: "变量类型",format: function(val,vals){
                    	var typeName;
                    	switch(parseInt(val,10)){
                    	  case 0:
                    		  typeName="字符型";
                    		  break;
                    	  case 1:
                    		  typeName="数值型";
                    		  break;
                    	  case 2:
                    		  typeName="日期型";
                    		  break;
                          default:
                        	  typeName="未知-"+val;
                              break;
                    	}
                    	return typeName;
                    }},
                    { fieldName: "VAR_DESC", sortType: SORT_STRING, width:"100%", align: "left", name: "描述"},
                    { fieldName: "VAR_ID", width:45, align: "center", name: "删除", format: function(val,vals){
                    	return '<span style="cursor:pointer;" onclick="gVarCrud.remove(' + val + ')"><img src="../images/cel_del.png"></img></span>';
                      }}
                    ];

var gActCrud = $.extend(new jetsennet.Crud("activityDivList", gActColumns,null, "ORDER BY t.ACT_ID ASC"), {
			    dao : WFMDAO,
			    tableName : "WFM_ACTIVITY",
			    keyId:"ACT_ID",
			    keyType:jetsennet.SqlParamType.Numeric,
			    cfgId :"divActivity",
			    resultFields : "t.*",
			    name : "流程节点",
			    checkId : "chkAct",
			    className : "jetsennet.wfm.schema.Activity",
			    addDlgOptions : {size : {width : 520, height : 430}},
			    editDlgOptions : {size : {width : 520, height : 430}},
			    onAddInit: function(){
			    	$("#div_ACTIVITY_CONCURRENT_NUM").hide();
			    	$("#txt_ACTIVITY_ID").removeAttr("readonly");
			    	_initActDlg();	
			    },
			    onAddValid : function() {
			        return !_checkActExist(el("txt_ACTIVITY_ID").value,false);
			    },
			    onAddGet : function() {
			        return {
			        	ACT_ID: el("txt_ACTIVITY_ID").value,
			        	ACT_NAME:el("txt_ACTIVITY_NAME").value,
		                ACT_TYPE: el("txt_ACTIVITY_TYPE").value,
		                ACT_CLASS: el("txt_ACTIVITY_CLASS").value,
		                ACTION: el("txt_ACTIVITY_ACTION").value,
		                CONCURRENT_NUM: el("txt_ACTIVITY_CONCURRENT_NUM").value,
		                ACT_DESC: el("txt_ACTIVITY_DESC").value
			        };
			    },
			    onEditInit:function(){
			    	$("#txt_ACTIVITY_ID").attr("readonly", "readonly");
			    	_initActDlg();	
			    },
			    onEditSet : function(obj) {
			    	changeActType(obj.ACT_TYPE);
			    	el("txt_ACTIVITY_ID").value=valueOf(obj,"ACT_ID","");
			    	el("txt_ACTIVITY_NAME").value=valueOf(obj,"ACT_NAME","");
			    	el("txt_ACTIVITY_TYPE").value=valueOf(obj,"ACT_TYPE","");
			    	el("txt_ACTIVITY_CLASS").value=valueOf(obj,"ACT_CLASS","");
			    	el("txt_ACTIVITY_ACTION").value=valueOf(obj,"ACTION","");
			    	el("txt_ACTIVITY_CONCURRENT_NUM").value=valueOf(obj,"CONCURRENT_NUM","");
			    	el("txt_ACTIVITY_DESC").value=valueOf(obj,"ACT_DESC","");
			    },
			    onEditValid : function(id, obj) {
			        if (el("txt_ACTIVITY_NAME").value != valueOf(obj, "ACT_NAME", "") && _checkActExist(id,true)) {
			            return false;
			        }
			        return true;
			    },
			    onEditGet : function(id) {
			        return {
			        	ACT_ID: el("txt_ACTIVITY_ID").value,
			        	ACT_NAME:el("txt_ACTIVITY_NAME").value,
		                ACT_TYPE: el("txt_ACTIVITY_TYPE").value,
		                ACT_CLASS: el("txt_ACTIVITY_CLASS").value,
		                ACTION: el("txt_ACTIVITY_ACTION").value,
		                CONCURRENT_NUM: el("txt_ACTIVITY_CONCURRENT_NUM").value,
		                ACT_DESC: el("txt_ACTIVITY_DESC").value
			        };
			    },
			    onRemoveValid: function(id){
			    	if (_checkProcactExist(id)) {
			            return false;
			        }
			        return true;
			    }
                });

//var gVarCrud = $.extend(new jetsennet.Crud("varDivList", gVarColumns, "varPageBar", "ORDER BY t.VAR_ID DESC"), {
var gVarCrud = $.extend(new jetsennet.Crud("varDivList", gVarColumns, null,"ORDER BY t.VAR_ID DESC"), {
				dao : WFMDAO,
				tableName : "WFM_VARIABLE",
				cfgId:"divVariable",
				resultFields : "t.*",
				name : "流程变量",
				checkId : "chkVar",
				keyId:"VAR_ID",
				keyType:jetsennet.SqlParamType.Numeric,
				className : "VariableBusiness",
				addDlgOptions : {size : {width : 520, height : 300}},
			    editDlgOptions : {size : {width : 520, height : 300}},
			    onAddInit: function(){
			    	$("#txt_VAR_NAME").removeAttr("disabled");
			    },
			    onAddValid : function(id) {
			        return !_checkVarExist(id);
			    },
			    onAddGet : function() {
			        return {
			        	VAR_NAME : "@"+el("txt_VAR_NAME").value ,
			        	VAR_TYPE : el("txt_VAR_TYPE").value ,
			        	VAR_VALUE : getVarValue() ,
			        	VAR_DESC : el('txt_VAR_DESC').value
			        };
			    },
			    onEditSet : function(obj) {
			        el("txt_VAR_NAME").value = obj.VAR_NAME.substring(1,obj.VAR_NAME.length);
			        el("txt_VAR_TYPE").value = valueOf(obj, "VAR_TYPE", "");
			        changeVarType(el("txt_VAR_TYPE").value);
			        if(valueOf(obj, "VAR_TYPE", "")=="0"){
			        	el("txt_VAR_VALUE_str").value = valueOf(obj, "VAR_VALUE", "");
			        }else if(valueOf(obj, "VAR_TYPE", "")=="1"){
			        	el("txt_VAR_VALUE_int").value = valueOf(obj, "VAR_VALUE", "");
			        }else if(valueOf(obj, "VAR_TYPE", "")=="2"){
			        	el("txt_VAR_VALUE_date").value = valueOf(obj, "VAR_VALUE", "");
			        }
			        el('txt_VAR_DESC').value = valueOf(obj, "VAR_DESC", "");
			        if(_checkVarExistByWfm(obj.VAR_ID)){
			        	$("#txt_VAR_NAME").attr("disabled","disabled");
			        }else{
			        	$("#txt_VAR_NAME").removeAttr("disabled");
			        }	
			    },
			    onEditValid : function(id, obj) {
			        if (el("txt_VAR_NAME").value != valueOf(obj, "VAR_NAME", "") && _checkVarExist(id)) {
			            return false;
			        }
			        return true;
			    },
			    onEditGet : function(id) {
			        return {
			        	VAR_ID : id,
			            VAR_NAME : "@"+el("txt_VAR_NAME").value ,
			        	VAR_TYPE : el("txt_VAR_TYPE").value ,
			        	VAR_VALUE : getVarValue() ,
			        	VAR_DESC : el('txt_VAR_DESC').value
			        };
			    },
			    onRemoveValid: function(id){
			    	if (_checkVarExistByWfm(id)) {
			    		jetsennet.alert("变量正在使用,不能删除!");
			            return false;
			        }
			        return true;
			    }
               });
//gActCrud.grid.ondoubleclick = null;


function getVarValue(){
	var varValue = "";
	switch(el("txt_VAR_TYPE").value){
    	case "0":
    		varValue = el("txt_VAR_VALUE_str").value;
    		break;
    	case "1":
    		varValue = el("txt_VAR_VALUE_int").value;
    		break;
    	case "2":
    		varValue = el("txt_VAR_VALUE_date").value;
    		break;
	}
	return varValue;
}


/**
 * 校验节点是否被使用
 */
function _checkProcactExist(id){
	var acts = WFMDAO.queryObjs("commonXmlQuery", "PROCACT_ID", "WFM_PROCACT", null, null, [[ "ACT_ID", id, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.In, jetsennet.SqlParamType.Numeric ]], "distinct PROCACT_NAME");
    if (acts&&acts.length>0) {
    	var actNames = [];
    	jQuery.each(acts,function(i,item){actNames.push(item.PROCACT_NAME);});
    	jetsennet.alert(actNames+"节点已使用不能删除，请重新选择！");
    	return true;
    }
    return false;
}


/**
 * 校验节点编号、节目名称是否冲突
 */
function _checkActExist(id,isEdit){
	
	var name = el("txt_ACTIVITY_NAME").value;
	var sqlQueryView = new jetsennet.SqlQuery();
	var plQueryTable = jQuery.extend(new jetsennet.QueryTable(), { TableName: "WFM_ACTIVITY", AliasName: "A" });
	var sqlCollectionView = new jetsennet.SqlConditionCollection();
	if(isEdit){
		sqlCollectionView.add(jetsennet.SqlCondition.create("ACT_ID", id, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.NotEqual, jetsennet.SqlParamType.Numeric));
	}else{
		sqlCollectionView.add(jetsennet.SqlCondition.create("ACT_ID", id, jetsennet.SqlLogicType.Or, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric));
	}
	sqlCollectionView.add(jetsennet.SqlCondition.create("ACT_NAME", name, jetsennet.SqlLogicType.Or, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String));
	
	jQuery.extend(sqlQueryView, { IsPageResult: 0,
        ResultFields: "ACT_ID",
        QueryTable: plQueryTable, Conditions: sqlCollectionView
    });
    
    var paramc = new HashMap();
    paramc.put("queryXml", sqlQueryView.toXml());
    var resultc = WFMDAO.execute("commonXmlQuery", paramc);
    var records = jetsennet.xml.toObject(resultc.resultVal, "Record");
    
    if(records && records.length>0){
    	jetsennet.alert("节点名称或编号已被使用！");
		return true;
    }
    
    return false;
}

/**
 * 校验工作流变量名是否冲突
 */
function _checkVarExist(id){
	var firstVarName = /^[a-zA-Z]*$/.test(el("txt_VAR_NAME").value.substring(0,1));
	if(!firstVarName){
		jetsennet.alert("变量名称首字母必须是英文字母！");
        return true;
	}
	var vars = WFMDAO.queryObjs("commonXmlQuery", "VAR_ID", "WFM_VARIABLE", null, null, [ [ "VAR_ID", id, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.NotEqual, jetsennet.SqlParamType.Numeric ] ], "VAR_NAME");
    if (vars&&vars.length>0) {
        var name = "@"+el("txt_VAR_NAME").value;
        for (var i = 0; i < vars.length; i++) {
            if (name == vars[i]["VAR_NAME"]) {
                jetsennet.alert("变量名称已被使用！");
                return true;
            }
        }
    }
    return false;
}



/**
 * 检验当前变量是否被流程使用 正在使用不允许编辑名称 也不允许删除
 * @param id
 * @returns {Boolean}
 */
function _checkVarExistByWfm(id){
	var vars = WFMDAO.queryObjs("commonXmlQuery", "VAR_ID", "WFM_PROCVAR", null, null, [ [ "VAR_ID", id, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.In, jetsennet.SqlParamType.Numeric ] ], "VAR_ID");
	if (vars&&vars.length>0) {
		return true;
	}
	return false;
}

function _initActDlg(){
	if(el("txt_ACTIVITY_CLASS").options.length==0){
		jetsennet.Crud.initItems("txt_ACTIVITY_CLASS",actClasses);
	}
}

function changeActType(val){
	if(val!=2){
		$("#div_ACTIVITY_CONCURRENT_NUM").hide();
		el("txt_ACTIVITY_CONCURRENT_NUM").value = "10";
		$("#txt_ACTIVITY_CONCURRENT_NUM").attr("validatetype",""); 
	}else{
		$("#div_ACTIVITY_CONCURRENT_NUM").show();
		$("#txt_ACTIVITY_CONCURRENT_NUM").attr("validatetype","Integer,minValue,NotEmpty"); 
	}
}


function changeVarType(varValue){
	switch(varValue){
		case "0":
			$("#txt_VAR_VALUE_str").show();
			$("#txt_VAR_VALUE_int").hide();
			$("#txt_VeriableValue_Date_label").hide();
			break;
		case "1":
			$("#txt_VAR_VALUE_str").hide();
			$("#txt_VAR_VALUE_int").show();
			$("#txt_VeriableValue_Date_label").hide();
			break;
		case "2":
			$("#txt_VAR_VALUE_str").hide();
			$("#txt_VAR_VALUE_int").hide();
			$("#txt_VeriableValue_Date_label").show();
			break;
		default:
			$("#txt_VAR_VALUE_str").show();
			$("#txt_VAR_VALUE_int").hide();
			$("#txt_VeriableValue_Date_label").hide();
	}
}

