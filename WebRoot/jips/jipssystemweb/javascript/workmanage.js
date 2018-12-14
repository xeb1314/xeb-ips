/**
 * 指挥管理-工作管理
 * @since 2015/03/27
 */
jetsennet.require(['gridlist', 'pagebar', 'window', 'crud', 'pageframe']);
jetsennet.importCss("bootstrap/daterangepicker-bs3");

var gJobCrud,
    gTaskCrud,
    userInfo = jetsennet.application.userInfo;

/**
 * 初始化页面
 */
function pageInit() {
//    $('#divPageFrame').pageFrame({showSplit: false, splitType: 1, layout: [{splitType: 1, size: {height: '40%'}, layout: [40, 'auto', 35]}, {splitType: 1, layout: [40, 'auto', 35]}]}).sizeBind(window);
    // 初始化工作列表
    workInit();
    // 初始化任务列表
    taskInit();
    //控制任务查询框的隐藏
    el("taskDivId").style.display = "none";
    //默认加载第一个工作以及对应的任务
    loadJob();
}

/**
 * 工作列表
 */
function workInit() {
    var columns = [
        {fieldName: 'JOB_ID', width: 30, align: 'center', isCheck: 1, checkName: 'chkJob'},
        {fieldName: 'JOB_NAME', sortField: 'JOB_NAME', width: '100%', align: 'left', name: '工作名称'},
        {fieldName: 'CREATE_USER', sortField: 'CREATE_USER', width: 200, align: 'center', name: '创建用户'},
        {fieldName: 'CREATE_USERID', sortField: 'CREATE_USERID', align: 'center', name: '创建用户ID', display: 0},
        {fieldName: 'CREATE_TIME', sortField: 'CREATE_TIME', width: 150, align: 'center', name: '创建时间'},
        {fieldName: 'UPDATE_TIME', sortField: 'UPDATE_TIME', width: 150, align: 'center', name: '修改时间'},
        {fieldName: 'JOB_DESC', width: 350, align: 'center', name: '描述'},
        {fieldName: 'JOB_ID', width: 45, align: 'center', name: '编辑', format: function(val, vals) {
            return jetsennet.Crud.getEditCell("gJobCrud.edit('" + val + "')");
        }},
        {fieldName: 'JOB_ID', width: 45, align: 'center', name: '删除', format: function(val, vals) {
            return jetsennet.Crud.getDeleteCell("gJobCrud.remove('" + val + "')");
        }}
    ];
    
    gJobCrud = $.extend(new jetsennet.Crud('divJobList', columns, 'divJobPage', ' ORDER BY CREATE_TIME DESC'), {
        dao: IPSDAO,
        tableName: 'IPS_JOB',
        keyId: 'JOB_ID',
        checkId: 'chkJob',
        cfgId: 'divJob',
        resultFields: 't.*',
        name: '工作',
        className: 'jetsennet.ips.schema.IpsJob',
        onAddValid: function() {
            var name = el('txt_JOB_NAME').value.trim();
            return validateJob(name);
        },
        onAddGet: function() {
            var data = {
                JOB_NAME: el('txt_JOB_NAME').value,
                JOB_DESC: el('txt_JOB_DESC').value,
                CREATE_USER: userInfo.UserName,
                CREATE_USERID: userInfo.UserId,
                CREATE_TIME: new Date().toDateTimeString()
            };
            return data;
        },
        onAddSuccess: function(obj) {
            jetsennet.message('创建成功！');
        },
        onEditSet: function(obj) {
            el('txt_JOB_NAME').value = obj['JOB_NAME'];
            el('txt_JOB_DESC').value = obj['JOB_DESC'];
            el('hidJOB_CREATE_USER').value = obj['CREATE_USER'];
            el('hidJOB_CREATE_USERID').value = obj['CREATE_USERID'];
            el('hidJOB_CREATE_TIME').value = obj['CREATE_TIME'];
            el('hidJOB_NAME').value = obj['JOB_NAME'];
        },
        onEditValid: function(id, obj) {
            var name = el('txt_JOB_NAME').value.trim();
            if (name === el('hidJOB_NAME').value.trim()) {
                return true;
            }
            return validateJob(name);
        },
        onEditGet: function(id, obj) {
            var data = {
                JOB_ID: id,
                JOB_NAME: el('txt_JOB_NAME').value,
                JOB_DESC: el('txt_JOB_DESC').value,
                UPDATE_USER: userInfo.UserName,
                UPDATE_USERID: userInfo.UserId,
                UPDATE_TIME: new Date().toDateTimeString(),
                CREATE_USER: el('hidJOB_CREATE_USER').value,
                CREATE_USERID: el('hidJOB_CREATE_USERID').value,
                CREATE_TIME: el('hidJOB_CREATE_TIME').value
            };
            return data;
        },
        onEditSuccess: function(obj) {
            jetsennet.message('修改成功！');
        },
        onRemoveValid: function(ids) {
            return checkTaskByJobId(ids.join(','));
        }
    });
//    gJobCrud.pageBar.pageSize = 9;
    gJobCrud.grid.onrowclick = function(obj) {
    	onJobRowClick(obj);
    };
}

/**
 * 编辑共通 flag: true 编辑工作 false 编辑任务
 * @param flag
 */
function editCommon(flag) {
    var ids = jetsennet.form.getCheckedValues(flag ? 'chkJob' : 'chkTask');
    if (!ids.length) {
        jetsennet.warn(flag ? '请选择要编辑的工作!' : '请选择要编辑的任务!');
        return;
    }
    if (ids.length == 1) {
    	flag ? gJobCrud.edit(ids[0]) : gTaskCrud.edit(ids[0]);
    } else {
        jetsennet.warn(flag ? '一次只能编辑一条工作!' : '一次只能编辑一条任务!');
        return;
    }
}

/**
 * 删除共通 flag: true 删除工作 false 删除任务
 * @param flag
 */
function delCommon(flag,taskId) {
    var ids = jetsennet.form.getCheckedValues(flag ? 'chkJob' : 'chkTask');
    if (!ids.length && typeof(taskId) == "undefined") {
        jetsennet.warn(flag ? '请选择要删除的工作!' : '请选择要删除的任务!');
        return;
    }
    var className,
        callback,
        taskType = "",
        procId = "",
        taskState=[];
    if (flag) {
        if (!checkTaskByJobId(ids.join(','))) {
            return;
        }
        className = 'jetsennet.ips.schema.IpsJob';
        callback = gJobCrud;
    } else {
        className = 'jetsennet.ips.schema.IpsTask';
        callback = gTaskCrud;
//        var conditions = [];
        if(typeof(taskId)!="undefined"){
        	ids = [];
        	ids.push(taskId);
        }
       /* conditions.push(['TASK_ID', ids.join(), jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.In, jetsennet.SqlParamType.String]);
        var result = IPSDAO.queryObjs('commonXmlQuery', 'TASK_ID', 'IPS_TASK', null, null, conditions, 'TASK_ID,TASK_TYPE,PROC_ID');*/
        var result = searchTaskById(ids.join());
        if(result){
        	for(var i=0;i<result.length;i++){
        		var type = result[i].TASK_TYPE;
            	if(type == "10"){
            		taskType = "10";
            		procId = result[i].PROC_ID;
            	}
            	taskState.push(result[i].TASK_STATE);
        	}
        }
    }
    //运行中的任务不允许删除
    var isExec = false;
    for(var j = 0;j<taskState.length;j++){
    	if(taskState[j] == 11){
    		isExec = true;
    		break;
    	}
    };
    if(!isExec){
	    jetsennet.confirm('确定删除?', function () {
	    	if(procId != "0" && procId != ""){
	    		//先删除 当前任务对应的流程
	    		var params = new HashMap();
				params.put("className", "ProcessBusiness");
				params.put("deleteIds", procId);
			    var sResult = WFMDAO.execute("commonObjDelete",params);
			    if(sResult.errorCode==0){
			    	var params = new HashMap();
			        params.put('className', className);
			        params.put('deleteIds', ids.join(','));
			        var result = IPSDAO.execute('commonObjDelete', params);
			        if (result && result.errorCode == 0) {
			            jetsennet.message('删除成功！');
			            callback.load();
			            return true;
			        }
			    }else
			    {
			    	jetsennet.message("删除流程失败！");
			    	return false;
			    }
	    	}else{
		        var params = new HashMap();
		        params.put('className', className);
		        params.put('deleteIds', ids.join(','));
		        var result = IPSDAO.execute('commonObjDelete', params);
		        if (result && result.errorCode == 0) {
		            jetsennet.message('删除成功！');
		            callback.load();
		            return true;
		        }
	    	};
	    });
    }else{
    	jetsennet.warn("运行中的任务无法删除，请先停止任务！");
    }
}

/**
 * 新增工作
 */
function addJob() {
    gJobCrud.add();
}

/**
 * 编辑工作
 */
function editJob() {
    editCommon(true);
}

/**
 * 删除工作
 */
function delJob() {
    delCommon(true);
}

/**
 * 校验当前工作是否存在任务
 */
function checkTaskByJobId(ids) {
    var conditions = [['JOB_ID', ids, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.In, jetsennet.SqlParamType.String]],
        tasks = IPSDAO.queryObjs('commonXmlQuery', 'TASK_ID', 'IPS_TASK', null, null, conditions, 'TASK_ID');
    if (tasks && tasks.length) {
        jetsennet.alert('当前工作下有任务，不能删除！');
        return false;
    }
    return true;
}

/**
 * 校验工作名称重复
 * @param name
 * @returns {Boolean}
 */
function validateJob(name) {
    var conditions = [];
    conditions.push(['JOB_NAME', name, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal]);
    var result = IPSDAO.query('commonXmlQuery', 'JOB_ID', 'IPS_JOB', null, null, conditions, 'JOB_ID'),
        objs = jetsennet.xml.toObject(result.resultVal, 'Record');
    if (!!objs && objs.length) {
        jetsennet.alert('工作名称已经存在，请重新输入!');
        return false;
    }
    return true;
}

/**
 * 任务列表
 */
function taskInit() {
    var columns = [
        {fieldName: 'TASK_ID', width: 30, align: 'center', isCheck: 1, checkName: 'chkTask'},
        {fieldName: 'TASK_NAME', sortField: 'TASK_NAME', width: '100%', align: 'left', name: '任务名称'},
        {fieldName: 'TASK_TYPE', sortField: 'TASK_TYPE', width: 150, align: 'center', name: '任务类型', format: function(val, vals) {
            switch(parseInt(val, 10)) {
            case 10:
                return '数据处理任务';
            case 20:
                return '数据采集任务';
            default:
                return '';
            }
        }},
        { fieldName: "TASK_STATE", sortField: "TASK_STATE", width:80, align: "center", name: "任务状态",format: function(val,vals){
        	var stateName;
        	switch(parseInt(val,10)){
        	  case 100:
        		  stateName="未运行";
        		  break;
        	  case 11:
        		  stateName="运行中";
        		  break;
              default:
            	  stateName="未知-"+val;
                  break;
        	}
        	return stateName;
        }},
        {fieldName: 'CREATE_USER', width: 150, align: 'center', name: '创建用户'},
        {fieldName: 'CREATE_USERID', align: 'center', name: '创建用户ID', display: 0},
        {fieldName: 'CLASS_ID', align: 'center', name: 'classid', display: 0},
        {fieldName: 'CREATE_TIME', sortField: 'CREATE_TIME', width: 150, align: 'center', name: '创建时间'},
        {fieldName: 'UPDATE_TIME', sortField: 'UPDATE_TIME', width: 150, align: 'center', name: '修改时间'},
        {fieldName: 'TASK_DESC', sortField: 'TASK_DESC', width: 260, align: 'center', name: '描述'},
        {fieldName: 'TASK_ID,TASK_STATE', width: 45, align: 'center', name: '编辑', format: function(val, vals) {
            return jetsennet.Crud.getEditCell("taskEdit('" + val + "',"+vals[1]+")");
        }},
        {fieldName: 'TASK_ID,TASK_STATE', width: 45, align: 'center', name: '删除', format: function(val, vals) {
            return jetsennet.Crud.getDeleteCell("delCommon(false,'" + val + "')");
//        	return '<span style="cursor:pointer;" onclick="delCommon(false,"' + val + '")"><img src="images/cel_del.png"></img></span>';
        }}
    ];
    
    gTaskCrud = $.extend(new jetsennet.Crud('divTaskList', columns, 'divTaskPage', ' ORDER BY CREATE_TIME DESC'), {
        dao: IPSDAO,
        tableName: 'IPS_TASK',
        keyId: 'TASK_ID',
        checkId: 'chkTask',
        cfgId: 'divTask',
        resultFields: 't.*',
        name: '任务',
        className: 'jetsennet.ips.schema.IpsTask',
        onAddValid: function() {
            return validateTaskName(el('txt_TASK_NAME').value.trim(),el("txt_TASK_TYPE").value);
        },
        onAddGet: function() {
            var data = {
                TASK_NAME: el('txt_TASK_NAME').value,
                TASK_DESC: el('txt_TASK_DESC').value,
                TASK_STATE: 100,
                JOB_ID: el('txt_JOB_ID').value,
                CLASS_ID: '0',
                CREATE_USER: userInfo.UserName,
                CREATE_USERID: userInfo.UserId,
                CREATE_TIME: new Date().toDateTimeString(),
                TASK_TYPE: el('txt_TASK_TYPE').value
            };
            return data;
        },
        onAddSuccess: function(obj) {
            jetsennet.message('创建成功！');
        },
        onEditInit: function(){
        },
        onEditValid: function(id, obj) {
            return validateTaskName(el('txt_TASK_NAME').value.trim(),el("txt_TASK_TYPE").value,id);
        },
        onEditSet: function(obj) {
            el('txt_TASK_NAME').value = obj['TASK_NAME'];
            el('txt_TASK_DESC').value = obj['TASK_DESC'];
            el('txt_TASK_TYPE').value = obj['TASK_TYPE'];
            el('hidCLASS_ID').value = obj['CLASS_ID'];
            el('hidCREATE_USER').value = obj['CREATE_USER'];
            el('hidCREATE_USERID').value = obj['CREATE_USERID'];
            el('hidCREATE_TIME').value = obj['CREATE_TIME'];
        },
        onEditGet: function(id) {
            var data = {
                TASK_ID: id,
                TASK_NAME: el('txt_TASK_NAME').value,
                TASK_DESC: el('txt_TASK_DESC').value,
                JOB_ID: el('txt_JOB_ID').value,
                CLASS_ID: el('hidCLASS_ID').value,
                CREATE_USER: el('hidCREATE_USER').value,
                CREATE_USERID: el('hidCREATE_USERID').value,
                CREATE_TIME: el('hidCREATE_TIME').value,
                TASK_TYPE: el('txt_TASK_TYPE').value,
                UPDATE_USER: userInfo.UserName,
                UPDATE_USERID: userInfo.UserId,
                UPDATE_TIME: new Date().toDateTimeString(),
            };
            return data;
        },
        edit : function(id) {
        	var result = searchTaskById(id);
        	if(result[0].TASK_STATE != 11){
	            var $this = this;
	            var checkIds = this.onGetCheckId ? this.onGetCheckId(id, this.checkId) : jetsennet.Crud.getCheckIds(id, this.checkId);
	            if (checkIds.length != 1) {
	                jetsennet.alert("请选择一个要" + this.msgEdit + "的" + this.name + "！");
	                return;
	            }
	            
	            var dialog = jetsennet.Crud.getConfigDialog(this.msgEdit + this.name, this.cfgId, this.editDlgOptions);
	            if (this.onEditInit) {
	                this.onEditInit(checkIds[0]);
	            }
	            
	            var oldObj = null;
	            if (this.onEditSet) {
	                var conditions = [ [ this.keyId, checkIds[0], jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String ] ];
	                oldObj = this.dao.queryObj(this.objQueryMethodName, this.keyId, this.tableName, this.tabAliasName, null, conditions);
	                if (oldObj) {
	                    this.onEditSet(oldObj);
	                }
	            }
	            
	            dialog.onsubmit = function() {
	                var areaElements = jetsennet.form.getElements($this.cfgId);
	                if (!jetsennet.form.validate(areaElements, true)) {
	                    return false;
	                }
	                if ($this.onEditValid && !$this.onEditValid(checkIds[0], oldObj)) {
	                    return false;
	                }
	                var obj = $this.onEditGet(checkIds[0], $this.oldObj);
	                return $this.directEdit(obj);
	            };
	            dialog.showDialog();
        	}else{
            	jetsennet.warn('运行中的任务无法编辑，请先停止任务！');
            }
        },
        onEditSuccess: function(obj) {
            jetsennet.message('修改成功！');
        }
    });
}

/**
 * 新增任务
 */
function addTask() {
    var jobId = el('txt_JOB_ID').value;
    if (!jobId) {
        jetsennet.warn('请先选中任务对应的一个工作！');
        return;
    }
    var result = IPSDAO.queryObjs('commonXmlQuery', 'JOB_ID', 'IPS_JOB', null, null, [['JOB_ID', jobId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal,jetsennet.SqlParamType.String]], 'JOB_ID');
    if(!result){
    	jetsennet.warn("所选工作失效，请重新选择工作！");
    	return;
    }
    gTaskCrud.add();
}

/**
 * 编辑任务
 */
function editTask() {
	
    editCommon(false);
}

/**
 * 删除任务
 */
function delTask() {
	
    delCommon(false);
}

/**
 * 任务跳转
 */
function locationTask() {
    var checkIds = jetsennet.form.getCheckedValues('chkTask');
    if (!checkIds.length) {
        jetsennet.alert('请选择要跳转的任务！');
        return;
    }
    
    if (checkIds.length != 1) {
        jetsennet.alert('请选择一个要跳转的任务！');
        return;
    }
    
    var href = '',
        name = '',
        identify = '',
        id = checkIds[0],
        type = $('[value="'+id + '"]').parents('tr').find('td:eq(2) div').html();
    
    if (type === '数据处理任务') {
        href = 'dataprocess.htm?id=' + id;
        name = '数据处理';
        identify = '143';
    } else if (type === '数据采集任务') {
        href = 'datacollection.htm?id=' + id;
        name = '数据采集';
        identify = '142';
    }
    window.parent.MyApp.showIframe({ID: identify, NAME: name, URL: href}, false);
}

/**
 * 校验工作名称重复
 * @param name
 * @returns {Boolean}
 */
function validateTaskName(name,type,id) {
    var conditions = [];
    conditions.push(['TASK_NAME', name, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal,jetsennet.SqlParamType.String]);
    conditions.push(['TASK_TYPE', type, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
    if(typeof(id) != "undefined"){
    	conditions.push(['TASK_ID', id, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.NotEqual,jetsennet.SqlParamType.String]);
    }
    var result = IPSDAO.query('commonXmlQuery', 'TASK_ID', 'IPS_TASK', null, null, conditions, 'TASK_ID'),
        objs = jetsennet.xml.toObject(result.resultVal, 'Record');
    if (!!objs && objs.length) {
        jetsennet.alert('任务名称已经存在，请重新输入!');
        return false;
    }
    return true;
}

/**
 * 工作点击行事件
 * @param obj
 */
function onJobRowClick(obj){
	if(typeof(obj) != "undefined"){
		var conditions = [],
	    jobId = obj['JOB_ID'];
		conditions.push(['JOB_ID', jobId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal]);
		gTaskCrud.search(conditions);
//		gTaskCrud.conditions = null;
		el('txt_JOB_ID').value = jobId;
		el("taskDivId").style.display = "";
	}
}

/**
 * 加载工作列表并且默认选中第一行
 */
function loadJob(){
	var name = el("txtJobName").value.replace(/\s/ig,'');
	if(name){
		var conditions = [['JOB_NAME', name, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Like]];
		gJobCrud.search(conditions);
		gJobCrud.conditions = null;
	}else{
		gJobCrud.load();
	}
    //默认选择行事件
	onJobRowClick(gJobCrud.grid.objItems[0]);
    //默认渲染第一行
    gJobCrud.grid.selectRow(0);
}

/**
 *查询任务列表
 */
function searchTaskList(){
	var jobId = el('txt_JOB_ID').value;
    if (!jobId) {
        jetsennet.warn('请先选中任务对应的一个工作！');
        return;
    }
    var name = el('txtTaskName').value.replace(/\s/ig,''),
    	conditions = [];
    if(name){
		conditions.push(['TASK_NAME', name, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Like]);
	}
    conditions.push(['JOB_ID', jobId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal]);
	gTaskCrud.search(conditions);
//	gTaskCrud.conditions = null;
}

/**
 * 编辑任务
 * @param taskId
 * @param taskState
 */
function taskEdit(taskId,taskState){

	if(taskState != 11){
		gTaskCrud.edit(taskId);
	}else{
		jetsennet.warn('运行中的任务无法编辑，请先停止任务！');
	}
}

function searchTaskById(ids){
    return IPSDAO.queryObjs('commonXmlQuery', 'TASK_ID', 'IPS_TASK', null, null, [['TASK_ID', ids, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.In, jetsennet.SqlParamType.String]], 'TASK_ID,TASK_TYPE,PROC_ID,TASK_STATE');
}

