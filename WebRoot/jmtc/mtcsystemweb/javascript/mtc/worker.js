
jetsennet.require([ "window", "gridlist", "pagebar", "validate", "crud", "bootstrap/bootstrap"]);
jetsennet.importCss(["bootstrap/bootstrap", "jetsen"]);

var gActorLst;
var gActorObjArr=[];
var vWorkNum={};
var gGridList ; //数据列表
var gCurrentActor={}; //当前操作的actor信息
var gCtrlWordType={}; //受控类别
var MTC_CTRL_WORDTYPE=2301; // 工作流节点受控词类型
var gWorkersConfigDoc=new jetsennet.XmlDoc(); 

var gReqWorkerTime; //页面定时刷新
var gReqWorkerTimeL=5000; //页面定时刷新间隔

//worker状态
var WORKSTATE_STOP=10;
var WORKSTATE_RUN=3;
var WORKSTATE_WAIT=0;
var WORKSTATE_EXCEPTION=101;
var WORKSTATE_SYNCH=-1;

function pageInit(){
	initGridList();
	loadCtrlWordType(MTC_CTRL_WORDTYPE);
	getActorList();
}

function initGridList(){
    var columns = [   { fieldName: "workerName", width:"100%", align: "left", name: "执行器"},
                      { fieldName: "taskType",   width:200, align: "left", name: "类型",format: function(val, vals){
                      	return gCtrlWordType[val]||'未知';
						}},
                      { fieldName: "taskGroup",  width:120, align: "left", name: "分组"},
                      { fieldName: "workerNum,taskType,workerName",  width:120, align: "left", name: "配置个数",format: function(val,vals){
                      		return '<span id=\'taskType_'+vals[1]+'_'+checkEleId(vals[2])+'\'>'+val+'</span>';
                      }},
                      { fieldName: "taskType,workerName",  width:120, align: "left", name: "启动个数",format: function(val,vals){
                      		return '<span id=\'taskType_'+vals[0]+'_on_'+checkEleId(vals[1])+'\'>--</span>';
                      }},
                      { fieldName: "taskType,workerName",  width:120, align: "left", name: "未启动个数",format: function(val,vals){
                      		return '<span  id=\'taskType_'+vals[0]+'_off_'+checkEleId(vals[1])+'\'>--</span>';
                      }},
                      { fieldName: "workerPort", width:45, align: "center", name: "配置", format: function(val,vals){
                      		return '<span class="glyphicon" onclick="editWorker(\''+val+'\')"><img src="../images/cel_config.png"></span>';
                      }}
                      ];

   gGridList=jQuery.createGridlist("divList",columns);
   gGridList.dateItemName = "worker";
   gGridList.ondoubleclick = function(obj, el) {
      editWorker(obj.workerPort);
   };
}

/**
 * 加载受控类别
 */
function loadCtrlWordType(type) 
{
	var conditions = [];
	conditions.push(["CW_SYS", "23", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
	if(type){
		conditions.push(["CW_TYPE", type, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);		
	}
	var sResult = MTCDAO.query("commonXmlQuery", "CW_ID", "NET_CTRLWORD", null, null, conditions, "CW_ID,CW_NAME,CW_CODE,CW_DESC");
	var objs = jetsennet.xml.toObject(sResult.resultVal, "Record");
	if (objs && objs.length > 0) 
	{
		for (var i = 0; i < objs.length; i++) 
		{
			gCtrlWordType[objs[i].CW_CODE] = objs[i].CW_NAME;
		}
	}
}



/**
* 获取actor列表
*/
function getActorList(isRefresh) {
	$("#actorListDiv").html("");
	var conditions = [];
	conditions.push(["SERVER_TYPE", "2", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
	var sResult = MTCDAO.query("commonXmlQuery", "SERVER_ID", "MTC_SERVER", null, null, conditions, "SERVER_ID,SERVER_NAME,HOST_IP,HOST_PORT," +
    "HOST_NAME,SERVER_TYPE,WORK_MODE,WORK_STATE,STATE_DESC,UPDATE_TIME,CREATE_USER,CREATE_TIME,FIELD_1 AS SRCID");
	gActorLst = jetsennet.xml.toObject(sResult.resultVal, "Record");
	if (gActorLst && gActorLst.length > 0) {
		ActorView.showTree(gActorLst,vWorkNum);
        if(isRefresh){
        	getActorConfig();
        }else{
        	getActorConfig(gActorLst[0]["HOST_IP"],'http://'+ gActorLst[0]["HOST_IP"] + ':' + gActorLst[0]["HOST_PORT"]);        	
        }
        
	}
	
}

/**
 * 请求actor参数
 * @param {Object} id
 * @param {Object} url
 */
function getActorConfig(id, url) 
{
	jQuery('#divList').html('');
	if(id&&url){
		gCurrentActor["actorId"]=id;
		gCurrentActor["actorUrl"]=url;		
	}
	
    var param = new HashMap();
    param.put("actorID",gCurrentActor["actorId"]);
    param.put("actorURL",gCurrentActor["actorUrl"]);
    
    var mtcDAO = new jetsennet.DefaultDal("MTCSystemService","HTTP_JQUERY","true","POST","xml");
    mtcDAO.execute("getActorConfig", param,{
    	serverId:id,
    	success:function(resultVal){
    	if(ActorView.getCurrentActor()&&ActorView.getCurrentActor().HOST_IP==this.serverId){
    		gWorkersConfigDoc.loadXML(resultVal);
    	    renderConfig();
    	    getWorkerStateFromCache();
    	}
    },error:function(errorString){
    	if(ActorView.getCurrentActor()&&ActorView.getCurrentActor().HOST_IP==this.serverId){
    		jetsennet.message(errorString);
    	}
    }});
    getWorkerStateFromCache();
}
/**
 * 渲染配置页面
 */
function renderConfig() 
{
	var workersNode = gWorkersConfigDoc.selectSingleNode("mtsConfig/actorCfg/workers");
    gGridList.renderXML(workersNode.xml);
}

/**
 * 从portal缓存里面加载worker状态
 */
function getWorkerStateFromCache(){
	if(!(gActorLst&&gActorLst.length>0)){
		return ;
	}
	
	var param = new HashMap();
	param.put("serverXML", jetsennet.xml.serialize({SERVER:gActorLst}, "SERVERS"));
	 
    var mtcDAO = new jetsennet.DefaultDal("MTCSystemService","HTTP_JQUERY","true","POST","xml");
    var resultHander= {
        	success : function(resultVal){
        		if(gReqWorkerTime){
        			clearTimeout(gReqWorkerTime);
        		}
        		
        		var workList = jQuery.parseJSON(resultVal);
            	vWorkNum={};
                jQuery.each(workList.workerList, function (i, item) {
                	    var workerNameArr={};
                	    var taskType=item.type;
                        jQuery.each(item.worker, function (index, worker) {
        			                var workerState = parseInt(valueOf(worker, "workerState", ""),10);
        			                var actorId = valueOf(worker, "actorID", "");
        			                var workName=valueOf(worker, "workerName", "");
        			                workName=workName.substring(0,workName.lastIndexOf("-"));
        			                workerNameArr[workName]=workName;
        			                if(workerState==WORKSTATE_RUN||workerState==WORKSTATE_WAIT){
        			                	if(!vWorkNum[actorId+"_on"]){
        			                		vWorkNum[actorId+"_on"]=1;
        			                	}else{
        			                		vWorkNum[actorId+"_on"]+=1;
        			                	}
        			                	
        			                	if(!vWorkNum[actorId+"_"+taskType+"_on_"+workName]){
        			                		vWorkNum[actorId+"_"+taskType+"_on_"+workName]=1;
        			                	}else{
        			                		vWorkNum[actorId+"_"+taskType+"_on_"+workName]+=1;
        			                	}
        			                }
                     });
                        
                     for(var workName in workerNameArr){
                         if(el("taskType_"+taskType+"_on_"+checkEleId(workName))){
                        	 var onNum=vWorkNum[gCurrentActor["actorId"]+"_"+taskType+"_on_"+workName]||0;
                        	 $("#taskType_"+taskType+"_on_"+checkEleId(workName)).text(onNum);
                        	 $("#taskType_"+taskType+"_off_"+checkEleId(workName)).text(parseInt($("#taskType_"+taskType+"_"+checkEleId(workName)).text(),10)-onNum);
                         }
                     }
                }
                );
                
                for(var i=0;i<gActorLst.length;i++){
                	setWorkNum("span_"+gActorLst[i]["SERVER_ID"],vWorkNum[gActorLst[i]["HOST_IP"]+"_on"]);        	
                }
                gReqWorkerTime=setTimeout("getWorkerStateFromCache()",gReqWorkerTimeL);
        	},
        	error:function(){
        		jetsennet.message("查询worker状态异常");
        		if(gReqWorkerTime){
        			clearTimeout(gReqWorkerTime);
        		}
        	}
        	};
  mtcDAO.execute("getAllWorkerStateFromCache", param,resultHander);
}

function checkEleId(name){
	if(name){
		return name.replace(/\./g, "").replace(/\[/g, "").replace(/\]/g, "").replace(/\#/g, "");		
	}
	return "";
}

function setWorkNum(id,num){
	if(isNaN(num)||!num){
		num=0;
	}
	
    if(!el(id)){
    	var t=setTimeout("setWorkNum('"+id+"','"+num+"')",500);
    	return;
	}
    $("#"+id).text(num);
}

/**
 * 修改
 * @param {Object} startID
 * @return {TypeName} 
 */
function editWorker(workerPort) 
{
	$(".dropdown-menu a").click(function(){
		var selectVal=$(this).attr("val");
		var inputObj=$(this).parents('.input-group-btn').siblings(".form-control");
		if(selectVal=="..."){
			inputObj.focus().select();
		}else{
			inputObj.val(selectVal);
		}
	});
	
    var areaElements = jetsennet.form.getElements('divWorkerNew');
    jetsennet.form.resetValue(areaElements);
    jetsennet.form.clearValidateState(areaElements);

    var vWorkerNode = gWorkersConfigDoc.selectNodes('mtsConfig/actorCfg/workers/worker[workerPort=\'' + workerPort + '\']')[0];
   
    el('txt_workerName').value = valueOf(vWorkerNode.selectSingleNode("workerName"), "text", "");
    el('txt_taskGroup').value = valueOf(vWorkerNode.selectSingleNode("taskGroup"), "text", "0");
    el('txt_workerNum').value = valueOf(vWorkerNode.selectSingleNode("workerNum"), "text", "");
    el('txt_taskSubType').value = jetsennet.xml.getText(vWorkerNode, "taskSubType");
    el("txt_taskType").innerHTML= gCtrlWordType[valueOf(vWorkerNode.selectSingleNode("taskType"), "text", "")]||"";
    
    el("txt_worker_on").innerHTML=$("#taskType_"+jetsennet.xml.getText(vWorkerNode, "taskType")+"_on_"+checkEleId(el('txt_workerName').value)).text();
    if(valueOf(vWorkerNode.selectSingleNode("workerEnable"), "text", "")=="1"){
    	el("workerEnableON").checked=true;     	
    }else{    	
    	el("workerEnableOff").checked=true;     
    }

    
    var dialog = new jetsennet.ui.Window("edit-1");
    jQuery.extend(dialog, { submitBox: true, cancelBox: true, maximizeBox: false, minimizeBox: false, size: { width: 550, height: 460 }, showScroll: false, windowStyle: 1, title: "修改媒体服务" });
    dialog.controls = ["divWorkerNew"];
    dialog.onsubmit = function () 
    {
        if (jetsennet.form.validate(areaElements, true)) 
        {
        	var workerNode = gWorkersConfigDoc.selectNodes('mtsConfig/actorCfg/workers/worker[workerPort=\'' + workerPort + '\']')[0];
            var actorNode = gWorkersConfigDoc.selectSingleNode("mtsConfig/actorCfg/workers");
            gWorkersConfigDoc.selectSingleNode("mtsConfig/actorCfg/actorIP").text = gCurrentActor["actorId"];
            gWorkersConfigDoc.selectSingleNode("mtsConfig/actorCfg/actorURL").text =  gCurrentActor["actorUrl"];
            
            jetsennet.xml.setText(workerNode, el('txt_workerName').value, "workerName");
            jetsennet.xml.setText(workerNode, parseInt(el('txt_workerNum').value), "workerNum");
            jetsennet.xml.setText(workerNode, el('txt_taskSubType').value, "taskSubType");
            jetsennet.xml.setText(workerNode, el("workerEnableON").checked==true?"1":"0", "workerEnable");
            jetsennet.xml.setText(workerNode, parseInt(el('txt_taskGroup').value), "taskGroup");
            
            if (!checkConfig(actorNode, workerNode, true)) 
            {
                return;
            }

            var param = new HashMap();
            param.put("actorID",gCurrentActor["actorId"]);
            param.put("actorURL",gCurrentActor["actorUrl"]);
            param.put("cmdInfo",gWorkersConfigDoc.xml);
            var sResult = MTCDAO.execute("saveWorkerConfig", param);
        	if (sResult.errorCode==0) 
        	{
        		jetsennet.message("修改成功！");
                dialog.close();
                getActorConfig(gCurrentActor["actorId"], gCurrentActor["actorUrl"]);
        	}
        	else 
            {
                jetsennet.message("操作失败!");
            }
        }
    };
    dialog.showDialog();
}


/**
 * 检测配置冲突
 * @param {Object} actorNode
 * @param {Object} workerNode
 * @param {Object} flag
 * @return {TypeName} 
 */
function checkConfig(actorNode, workerNode, flag) 
{
    var workerNodes = gWorkersConfigDoc.selectNodes("mtsConfig/actorCfg/workers/worker");

    for (var i = 0; i < workerNodes.length; i++) 
    {
        var workerName = valueOf(workerNodes[i].selectSingleNode("workerName"), "text", "");
        for (var j = i + 1; j < workerNodes.length; j++) 
        {
            var next_workerName = valueOf(workerNodes[j].selectSingleNode("workerName"), "text", "");

            if (workerName == next_workerName)
            {
                jetsennet.alert("媒体服务名称重复：" + workerName);
                if (!flag) 
                {
                    actorNode.removeChild(workerNode);
                }
                return false;
            }
        }
    }

    return true;
}


/**
 * 调度器视图
 */
var ActorView = (function() {
	
	var _currentActor = null;//当前被选中的actor对象
	
	/**
	 * 生成树节点
	 */
	var _genTreeNode = function(node, item, badge){
		
		//图片前缀
		var icon = item.SERVER_TYPE==1 ? "manager" : "actor";
		//添加状态
		if(gWorkerStates[item.WORK_STATE])
		{
			icon +=  "_" + gWorkerStates[item.WORK_STATE]["NAME"];
		}
		else
		{
			icon +=  "_default";
		}
		//构造全路径
		icon = "../images/" + icon + ".png";
		
		var link = jQuery("<a>", {}).appendTo(node);
		var img = jQuery("<img>", {}).attr("src", icon).addClass("actorimg").load(function(){

		var leftPosition = $(this).position().left + $(this).width() - 15;
		jQuery("<span>", {}).addClass("badge").attr("id","span_"+item.SERVER_ID).text(isNaN(badge)||!badge?"0":badge).css({"left" : leftPosition}).appendTo(link);
			
		}).appendTo(link);
		var name = jQuery("<span>"+item.HOST_IP+"</span>", {}).appendTo(link);
		$(node).data("item", item);
	};
	
	/**
	 * 绑定actor操作菜单
	 */
	var _bindActortmenu = function(node, item) {
        if(item.WORK_STATE == 10)//停止
        {
        	jQuery("<i>", {}).addClass("fa fa-play-circle-o").attr("title", "启动").click(function(){
        		Operator.startActor(item.HOST_IP, item.HOST_IP, item.HOST_PORT);
        	}).appendTo(node);
        }else
        {
        	jQuery("<i>", {}).addClass("fa fa-pause").attr("title", "停止").click(function(){
        		Operator.stopActor(item.HOST_IP, item.HOST_IP, item.HOST_PORT);
        	}).appendTo(node);
        }
	};
	
	/**
	 * 设置当前actor
	 */
	var _selectActor = function(item, node) {
		_currentActor = item;
		$("#managertree").find("ul").find("li.selected").removeClass("selected");
		$(node).addClass("selected");
	}
	
	return {
		
		/**
		 * 展示树，缺陷：每次重新生成
		 */
		showTree: function(servers,workNumObj) {
			
			$("#managertree li").remove();//清空树
			//	manager节点
		    var liManager = jQuery("<li>", {}).addClass("selected").appendTo("#managertree").click(function(){
		    	
		    	
		    });
		    //	actor列表
		    var ulActors = jQuery("<ul>", {});
		    var lstActor = ActorView.getCurrentActor() ;
		    var isFstActor = true;
		    $.each(servers, function(i, item){
		    	if (this.SERVER_TYPE == "1" && this.WORK_MODE == "1") {
		    		$("#manageName").text(this.SERVER_NAME);
		    		_genTreeNode(liManager, this,0);
		    	}
		    	else if(this.SERVER_TYPE == "2") {
		    		
		    		var node =  jQuery("<li>", {}).appendTo(ulActors).click(function(){
		    			_selectActor(item, node);
		    			if(gReqWorkerTime){
		    				clearTimeout(gReqWorkerTime);		    				
		    			}
		    			getActorConfig(item.HOST_IP,'http://'+ item.HOST_IP + ':' + item.HOST_PORT);
		    		});
//		    		_genTreeNode(node, this, 2);//2表示角标值
		    		
		    		_genTreeNode(node, this,workNumObj[item.HOST_IP+"_on"]);
		    		//_bindActortmenu(node, this);
		    		
		    		if((lstActor && this.SERVER_ID == lstActor.SERVER_ID)||(isFstActor&&!lstActor))
		    		{
		    			isFstActor = false;
		    			_selectActor(this, node);
		    		}
		    	}
		    });
		    ulActors.appendTo(liManager);
		},
		
		getCurrentActor: function() {
			return _currentActor;
		}
		
	};
	
}());
