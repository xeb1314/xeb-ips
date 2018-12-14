jetsennet.require([ "pagebar","pageframe", "window", "bootstrap/moment",
                    "bootstrap/daterangepicker","autocomplete", "datepicker","jetsentree"]);
jetsennet.importCss("bootstrap/daterangepicker-bs3");

	var pDSInfo = new jetsennet.ui.PageBar("dataSourceListPage");
		pDSInfo.onpagechange = function () {
			internalData();
		};
		pDSInfo.orderBy = " ORDER BY T.CREATE_TIME DESC";
		pDSInfo.currentPage = 1;
		pDSInfo.pageSize = 5;
		pDSInfo.onupdate = function () {
			el('divDataSourcePage').innerHTML = this.render();
		};
	var gDSGridList = new jetsennet.ui.GridList();
		gDSGridList.ondatasort = function(sortfield, desc) {
			pDSInfo.setOrderBy(sortfield, desc);
		};

/**
 * 页面初始化
 */
function pageInit() {
	 jQuery("#divPageFrame").
	 	pageFrame({ 
	 		showSplit :false,
	 	//	minSize: { width: bodyWidth>1100?1100:bodyWidth, height: 300},
	 		layout : [ 300, {splitType: 1, layout : [ {splitType: 1, layout : [ 40,"auto" , 35]},{splitType: 1, layout : [ 40,"auto" , 35]} ]} ]
	 	
	 	}).sizeBind(window);
	 
	 jetsennet.ui.DropDownList.initOptions("dataManageOptions", true);
//	 jetsennet.ui.DropDownList.initOptions("lableSelectState", true);
	 
	 //加载数据源类别下拉框
	 loadSelectType("dataManageOptions","10","-------------请选择分类类别------------");
	 
	 //分类类别下拉框的onchanged事件
     jetsennet.ui.DropDownList["dataManageOptions"].onchanged= function (item){
    	 var val = item.value;
    	 if(val != "-1"){
    		 //加载该分类类别下所有子项
    		 loadSubClass(val);
    		 //创建数据源分类树
    		 createClassTree(val,"divDataSourceTree","internalData");
    	 }else{
    		 el("divDataSourceTree").innerHTML="";
    		 el("divDataSourceList").innerHTML="";
    		 el("divDataSourcePage").innerHTML="";
    	 }
     };
     //加载数据字典所有的项
     loadCWWord();
};

var gOrderColumns=[ { fieldName: "ORDER_ID", width: 30, align: "center", isCheck: 1, checkName: "chkOrder"},
	                     { fieldName: "ORDER_NAME", sortField: "ORDER_NAME", width:200, align: "center", name: "订单名称"},
	                     { fieldName: "CREATE_USER", sortField: "CREATE_USER", width:"100%", align: "center", name: "创建人"},
                         { fieldName: "CREATE_USER", sortField: "CREATE_USER", width:80, align: "center", name: "创建用户"},
                         { fieldName: "CREATE_TIME", sortField: "CREATE_TIME", width:130, align: "center", name: "创建时间"},
                         { fieldName: "ORDER_DESC", sortField: "ORDER_DESC", width:200, align: "center", name: "描述"},
                         { fieldName: "ORDER_ID", width:45, align: "center", name: "详情", format: function(val,vals){
                        	 return '<span onclick="viewLabelDetail(\''+vals[0]+"="+vals[1]+'\',\''+vals[2]+'\')"><img src="images/cel_info.png"/></span>';
                         }},
                         { fieldName: "ORDER_ID", width: 45, align: "center", name: "编辑", format: function(val,vals){
                             return jetsennet.Crud.getEditCell("gOrderCrud.edit('" + val + "')");
                         }},
                         { fieldName: "ORDER_ID", width:45, align: "center", name: "删除", format: function(val,vals){
                        	var value= "'"+val+"'";
                         	return '<span style="cursor:pointer;" onclick="gOrderCrud.remove(' + value + ')"><img src="images/cel_del.png"></img></span>';
                         }}
                         ];
	var gOrderCrud = $.extend(new jetsennet.Crud("divOrderList", gOrderColumns, "divOrderList", "ORDER BY t.CREATE_TIME DESC"), {
		dao : IPSDAO,
		tableName : "IPS_ORDER",
		keyId : "ORDER_ID",
		resultFields : "t.*",
		name : "订单列表",
		checkId : "chkOrder",
		cfgId : "divOrderDialog",
		className : "jetsennet.ips.schema.IpsDatasource",
		addDlgOptions : {size : {width : 610, height :0}},
	    editDlgOptions : {size : {width : 610, height :0}},
	    onAddInit : function() {
	    },
	    onAddValid : function() {
		    return true;
	    },
	    onAddGet : function() {
	    	var lables=[];
	    	var userIds = getInit(lables,"").split("=");
	    	return {
	    		DS_NAME : el("txt_DataSourceName").value,
	    		STR_1 : el("txt_SourcePath").value,
	    		STR_2 : lables.join(","),
	    		DS_CLASS : el("txt_DataSourceType").value,
	    		STATE : jetsennet.ui.DropDownList["lableSelectState"].selectedValue,
	    		DS_DESC : el("txt_DataSourceDesc").value,
	    		DS_TYPE : 0,
	    		DS_PARAM : "-1",
	    		CREATE_USER : jetsennet.application.userInfo.UserName,
	    		CREATE_USERID : jetsennet.application.userInfo.UserId,
	    		USER_ID : userIds[1]
	    		//CREATE_TIME : new Date().toDateTimeString()
	    			
	        };
	    },
	    directAdd : function (obj){
	    	var params = new HashMap();
	    	var userXml = [];
	    	userXml.push("<TABLES><TABLE CLASS_NAME='IpsDatasource'><DS_NAME>"+obj.DS_NAME+"</DS_NAME><STR_1>"+obj.STR_1+"</STR_1><STR_2>"+obj.STR_2+"</STR_2><DS_CLASS>"+obj.DS_CLASS+"</DS_CLASS><STATE>"+obj.STATE+"</STATE><DS_DESC>"+obj.DS_DESC+"</DS_DESC><DS_TYPE>"+obj.DS_TYPE+"</DS_TYPE>"
	    		+"<DS_PARAM>"+obj.DS_PARAM+"</DS_PARAM><CREATE_USER>"+obj.CREATE_USER+"</CREATE_USER><CREATE_USERID>"+obj.CREATE_USERID+"</CREATE_USERID></TABLE>");
	    	var userId = obj.USER_ID.split(",");
	    	if(userId != ""){
	    		for(var i=0; i<userId.length;i++){
	        		userXml.push("<TABLE CLASS_NAME='IpsDatatouser'><DS_ID ref-field='IpsDatasource.DS_ID'></DS_ID><USER_ID>"+userId[i]+"</USER_ID></TABLE>");
	        	};
	    	}
	    	userXml.push("</TABLES>");
	    	params.put("saveXml", userXml.join(""));
	    		var result = this.dao.execute("commonObjsInsert", params);
	    	if (result && result.errorCode == 0) {
	    	    if (this.onAddSuccess) {
	    	        this.onAddSuccess(obj);
	    	    }
	    	    this.load();
	    	    return true;
	    	}
	    },
	    onAddSuccess : function(){
	    	 jetsennet.message("新建成功！");
	    },
	    onEditInit : function() {
	    	loadLables("编辑");
	    	
	    },
	    onEditValid : function(id, obj) {
	    	 return true;
		},
	    onEditSet : function(obj) {
	    	el("gratFunToUsers").style.display="none";
	    	var state = valueOf(obj, "STATE", "");
	    	//根据状态判断是否有授权用户，有则显示，没有不显示
	    	if(state == "1"){
	    		el("gratFunToUsers").style.display="";
	    		var conditions = [];
	    		conditions.push(["d.DS_ID", valueOf(obj, "DS_ID", ""), jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal]);
	    		userList("selMember",conditions);
	    	}
	    	//给状态栏赋值
	    	var stateItem = jetsennet.ui.DropDownList["lableSelectState"].dataItems;
			for(var h=0;h<stateItem.length;h++){
				if(stateItem[h].value == state){
					el("lableSelectState").value = stateItem[h].text;
					jetsennet.ui.DropDownList["lableSelectState"].selectedValue = stateItem[h].value;
				}
			}
	    	//根据分类ID去往每个标签项中赋值
    		var classIds = valueOf(obj, "STR_2", "");
    		var classId = classIds.split(",");
    		var types = queryClassType(classId);
    		for(var i=1;i<=classId.length;i++){
    			var singleClass = types[i-1].CLASS_TYPE;
    			var name = "";
    			if(singleClass == "-1"){
    				singleClass = types[i-1].CLASS_DESC;
    				name =  types[i-1].CLASS_NAME;
    			}else{
    				name = gCWWordDoc.documentElement.selectSingleNode("Record[CW_ID='" + types[i-1].CLASS_NAME + "']").selectSingleNode("CW_NAME").text;
    			}
    			var items = jetsennet.ui.DropDownList["lableNamesType"+i].dataItems;
    			for(var j=0;j<items.length;j++){
    				if(items[j].value == singleClass){
    					el("lableNamesType"+i).value = items[j].text;
    					el("hidlableType"+i).value = items[j].value;
    				}
    			}
    			el("lableName"+i).value = name;
    			el("hidDialogTreeId"+i).value = classId[i-1];
    		}
    		
	    	el("txt_DataSourceName").value = valueOf(obj, "DS_NAME", "");
	    	el("txt_SourcePath").value = valueOf(obj, "STR_1", "");
	    	el("txt_DataSourceType").value = valueOf(obj, "DS_CLASS", "");
	    	el("txt_DataSourceDesc").value = valueOf(obj, "DS_DESC", "");
	    },
	    onEditGet : function(id) {
	    	
	    	var lables=[];
	    	var userIds = "";
	    	var values = getInit(lables,userIds).split("=");
	    	afterGrantID = values[1];
	        return {
	        	DS_ID : id,
	        	DS_NAME : el("txt_DataSourceName").value,
	    		STR_1 : el("txt_SourcePath").value,
	    		STR_2 : values[0],
	    		DS_CLASS : el("txt_DataSourceType").value,
	    		STATE : jetsennet.ui.DropDownList["lableSelectState"].selectedValue,
	    		DS_DESC : el("txt_DataSourceDesc").value,
	    		UPDATE_USER : jetsennet.application.userInfo.UserName,
	    		UPDATE_USERID : jetsennet.application.userInfo.UserId
	        };
	    },
	    onEditSuccess : function(obj){
    		/**
    	      * 根据条件删除数据 （单表）
    	      * @param xml 
    	      * <TABLE TABLE_NAME='DMP_SIGNAL'>
    	      *		<SqlWhereInfo>"
    	      *			<SERVICE_CODE ParamType='String' RelationType='Equal' LogicType='And'>110000G02</SERVICE_CODE>
    	      *			<WHEREINFO>"
    	      *				<SIGNAL_NAME ParamType='String' RelationType='Equal' LogicType='And'>ll</SIGNAL_NAME
    	      *	   		    <SIGNAL_TYPE ParamType='Numeric' RelationType='Equal' LogicType='And'>8</SIGNAL_TYPE>
    	      *			</WHEREINFO>
    	      *		</SqlWhereInfo>
    	      * </TABLE>
    	      * @throws Exception 
    	      */
	    	var beforeGrants = beforeGrantID.split(",");
	    	if(beforeGrants != ""){
	    		var userParams = new HashMap();
		    	var userXml=[];
		    		userXml.push("<TABLE TABLE_NAME='IPS_DATATOUSER'><SqlWhereInfo><DS_ID ParamType='String' RelationType='Equal' LogicType='And'>"+obj.DS_ID+"</DS_ID>" +
		    				"<USER_ID ParamType='Numeric' RelationType='In' LogicType='And'>"+beforeGrants+"</USER_ID></SqlWhereInfo></TABLE>");
		    	userParams.put("deleteXml", userXml.join(""));
		    	var result = IPSDAO.execute("commonObjDeleteByCondition", userParams);
		    	if (result && result.errorCode == 0) {
		    	};
	    	}
	    	
	    	var afterUserId = afterGrantID.split(",");
	    	if(afterUserId != "" ){
	    		var uParams = new HashMap();
	    		var uIds = [];
	    			uIds.push("<TABLES>");
	    		for(var j=0;j<afterUserId.length;j++){
	    			uIds.push("<TABLE CLASS_NAME='IpsDatatouser'><DS_ID>"+obj.DS_ID+"</DS_ID><USER_ID>"+afterUserId[j]+"</USER_ID></TABLE>");
	    		}
	    		uIds.push("</TABLES>");
	    		uParams.put("saveXml", uIds.join(""));
		    	var result = IPSDAO.execute("commonObjsInsert", uParams);
		    	if (result && result.errorCode == 0) {
		    		jetsennet.message("编辑成功！");
		    	};
	    	}
	    },
	    directRemove : function(ids){
	    	var params = new HashMap();
	    	var dataXml=[];
	    	var conditions = [];
	    	dataXml.push("<TABLES>");
	    	conditions.push(["DS_ID", ids, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.In]);
	    	var sResult = IPSDAO.query("commonXmlQuery", "DS_ID", "IPS_DATATOUSER", null, null, conditions, "DS_ID");
	    	var ssResult = jetsennet.xml.toObject(sResult.resultVal, "Record");
	    	if(!$.isEmptyObject(ssResult)){
	    			dataXml.push("<TABLE TABLE_NAME='IPS_DATATOUSER'><SqlWhereInfo><DS_ID ParamType='String' RelationType='In' LogicType='And'>"+ids+"</DS_ID></SqlWhereInfo></TABLE>");
	    		}
	    	dataXml.push("<TABLE TABLE_NAME='IPS_DATASOURCE'><SqlWhereInfo><DS_ID ParamType='String' RelationType='In' LogicType='And'>"+ids+"</DS_ID></SqlWhereInfo></TABLE>");
	    	dataXml.push("</TABLES>"); 
	    	params.put("deleteXml", dataXml.join(""));
	    		var result = IPSDAO.execute("commonObjsDeleteByCondition", params);
	    	    if (result && result.errorCode == 0) {
	    	        if (this.onRemoveSuccess) {
	    	            this.onRemoveSuccess(ids);
	    	        }
	    	        this.load();
	    	        jetsennet.message("删除成功！"); 
	    	    }
	    	    return true;
	    }
 });
	//选择授权用户配置项
	var gSelectUserColumns = [{ fieldName: "ID,USER_NAME", width: 30, align: "center", isCheck: 1, checkName: "chk_SelectUser", format: function(val, vals){
	                                return vals[0] + "," + vals[1];
	                            }},
	                            { fieldName: "USER_NAME", sortField: "USER_NAME", width: "50%", align: "left", name: "用户姓名"},
	                            { fieldName: "LOGIN_NAME", sortField: "LOGIN_NAME", width: "50%", align: "left", name: "登录名称"}];

	var gUserCrud = $.extend(new jetsennet.Crud("divSelectUserList", gSelectUserColumns, "divSelectUserPage", "order by t.ID"), {
	    dao : UUMDAO,
	    tableName : "UUM_USER",
	    name : "用户",
	    checkId : "chk_SelectUser"
	});	


/**
 * 点击左侧树加载对应的数据源列表
 * @param classId
 * @param className
 */
function internalData(classId,className){
	if(typeof(classId) == "undefined")
	{
		internalData(classID);
		return;
	}
	classID = classId;
    
    el('divDataSourceList').innerHTML = "";
    var sqlCollection = new jetsennet.SqlConditionCollection();
    sqlCollection.add(jetsennet.SqlCondition.create("T.STR_2", classId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Like));
    var gSqlQuery = new jetsennet.SqlQuery();
    var queryTable = jQuery.extend(new jetsennet.QueryTable(), { TableName: "IPS_DATASOURCE", AliasName: "T" });
    jQuery.extend(gSqlQuery, { IsPageResult: 1, PageInfo : pDSInfo ,OrderString: pDSInfo.orderBy,
        ResultFields: "T.*",
        QueryTable: queryTable, Conditions: sqlCollection
    });
	
	var param = new HashMap();
    param.put("queryXml", gSqlQuery.toXml());
    var sResult = IPSDAO.execute("queryJobXmlForPage", param);
    var xmlDoc = new jetsennet.XmlDoc();
    xmlDoc.loadXML(sResult.resultVal.replaceAll("Records","RecordSet"));
    var count = xmlDoc.documentElement.getAttribute("TotalCount");
    el('divDataSourceList').innerHTML = jetsennet.xml.transform("xslt/ordertodatasource.xsl",xmlDoc);
    gDSGridList.bind(el("divDataSourceList"), el("tabDS"));
    pDSInfo.setRowCount(count);
//    gDataSourceCrud.search(conditions);
}

/**
 * 数据源详情
 */
function dsDetail(values,sourcePath){
	/*==================详情弹出窗=========================================================================================================**/
	var dialog = new jetsennet.ui.Window("detail-window");
    jQuery.extend(dialog, { submitBox: false, cancelBox: false, maximizeBox: false, showScroll: false, windowStyle: 1, minimizeBox: false, title: "详情" });
    dialog.size = { width: 400, height: 0 };
    dialog.controls = ["divLabelDetail"];
    dialog.showDialog();
	
    el("txtSourcePathDetail").value=sourcePath;
    /*==================根据数据源存的分类ID，找出分类名称(名称是从数据字典里取的)=========================================================================================================**/
	var b=values.indexOf("=");
	var conditions = [];
	conditions.push(["CLASS_ID", values.substring(0,b), jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.In]);
	var sResult = IPSDAO.query("commonXmlQuery", "CLASS_ID", "IPS_CTRLCLASS", null, null, conditions, "CLASS_NAME");
	var classNames = new jetsennet.XmlDoc();
		classNames.loadXML(sResult.resultVal);
		
	var names = classNames.documentElement.selectNodes("Record");
	for ( var i = 0; i < names.length; i++) {
		var value = names[i].selectSingleNode("CLASS_NAME").text;
		var name = gCWWordDoc.documentElement.selectSingleNode("Record[CW_ID='" + value + "']").selectSingleNode("CW_NAME").text;
		selectAddItem("lableClassDetails",value,name);
	}
	/*================根据数据源ID去用户表里查找数据源所有用户并在弹出窗详情中显示=========================================================================================================**/
	var condition = [];
	condition.push(["d.DS_ID", values.substring(b+1,values.length), jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.In]);
	userList("lableUserDetails",condition);
}

/**
 * 数据源对应的订单
 */
function dsToOrder(obj){
	
}
