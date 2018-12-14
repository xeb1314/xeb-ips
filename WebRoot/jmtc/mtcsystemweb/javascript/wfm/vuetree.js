var currentTreeId;

Vue.component('linetree', {
      template: '#linetree-template',
      data: {
          selectId: 0
      },
      methods: {
          click: function(e) {
              var vm = e.targetVM;
              if (vm) {
                  this.selectId = vm.id;
                  Vue_Notify(this, "on-click", [vm.$data]);
              }
          },
      }
  });
  Vue.component('folder', {
      template: '#folder-template',
      data: {
          open: false
      },
      methods: {
    	  dblclick: function(e) {
    		  this.open = !this.open;
    	  }
      }
  });
  Vue.component('file', {
      template: '#file-template',
  });
  
  var treeParamData = [];
  var leftMenuTree = new Vue({
      el: '#divProcessList',
      data: {
          treeData: treeParamData
      },
      methods: {
    	  onClick: function(data) {
    		  if(data.id.indexOf("processType_")>-1){
    			  if(gFlowView&&gFlowView.isChanged){
    			    	jetsennet.confirm("确定是否保存当前流程配置?",function() {
    			    		saveProcess();
    			    		gFlowView.clearView();
    	    	            gCurrentProcess = null;
    	    				gCurrentProcessType = { typeId: data.typeId, procIds: data.procIds,name:data.name};
    			    		return true;
    			    	},{oncancel:function() {
    			    		gFlowView.isChanged = false;
    			    		gFlowView.clearView();
    	    	            gCurrentProcess = null;
    	    				gCurrentProcessType = { typeId: data.typeId, procIds: data.procIds,name:data.name};
    			    		return true;
    			    		}
    			    	});
    				}else{
    					gFlowView.isChanged = false;
    					gFlowView.clearView();
        	            gCurrentProcess = null;
        				gCurrentProcessType = { typeId: data.typeId, procIds: data.procIds,name:data.name};
    				}
    		  }else{
    			  if(gFlowView&&gFlowView.isChanged){
  			    	jetsennet.confirm("确定是否保存当前流程配置?",function() {
  			    		saveProcess();
  			    		currentTreeId = data.id;
  	    			    gCurrentProcessType = {};
  	  				    processChanged(data.procId, data.objType, data.procType, data.procState, data.procName, data.procDesc,data.objDataType);
  			    		return true;
  			    	},{oncancel:function() {
  			    		currentTreeId = data.id;
  	    			    gCurrentProcessType = {};
  	  				    processChanged(data.procId, data.objType, data.procType, data.procState, data.procName, data.procDesc,data.objDataType);
  			    		return true;
  			    		}
  			    	});
  				}else{
  					currentTreeId = data.id;
    			    gCurrentProcessType = {};
  				    processChanged(data.procId, data.objType, data.procType, data.procState, data.procName, data.procDesc,data.objDataType);
  				}
    		  }
          }
      }
});
  
  function bindingProcess(records) {
	    var openList = {};
	    var oldTreeData = leftMenuTree.treeData;
	    if(oldTreeData&&oldTreeData.length>0){
	    	for ( var i = 0; i < oldTreeData.length; i++) {
	    		openList[oldTreeData[i].id] = oldTreeData[i].open;
			}
	    }
	    treeParamData = [];
		var process = {};
		if (records == null || records.length == 0) {
			treeParamData = [];      
			leftMenuTree.treeData = treeParamData;
			return;
		}
		for (var i = 0, len = records.length; i < len; i++) {
			var objType = records[i].PROC_TYPE+ "," + records[i].TYPE_NAME.replaceAll(",","@@@@")+","+records[i].TYPE_ID;
			process[objType] = process[objType] || [];
//			var showProcName = records[i].PROC_NAME.replace("<","&lt;").replace(">","&gt;");
			process[objType].push(jetsennet.xml.xmlUnescape(cutstr(records[i].PROC_NAME,50))+"_@"+records[i].PROC_ID+"_@"+records[i].PROC_TYPE+"_@"+records[i].FLOW_TYPE+"_@"+
					records[i].PROC_STATE+"_@"+jetsennet.xml.xmlUnescape(records[i].PROC_DESC)+"_@"+records[i].PROC_NAME+"_@"+records[i].TYPE_ID+"_@"+records[i].OBJ_TYPE);
		}
		var count = 0;
		$.each(process, function (objType, item) {
			count++;
			var procIdsArray = [];
			var open = true;
			var childrenArray = [];
			if(item&&item.length>0){
				for ( var i = 0; i < item.length; i++) {
					if(item[i].indexOf("_@")>-1){
						var array = item[i].split("_@");
						if(!array[0]){
							continue;
						}
						var icon = "";
						switch(parseInt(array[4])){
							case 0:
								icon = "../images/edit.png";
								break;
							case 10:
								icon = "../images/default.png";
								break;
							case 11:
								icon = "../images/activate.png";
								break;
							case 100:
								icon = "../images/unactivate.png";
								break;
							default:
							icon = "../images/edit.png";
						}
						var treeParam = {"type": 'file', "id":"process_"+array[1],"name": array[0],"icon":icon,"procId":array[1],"objType":array[2],"procType":array[3],"procState":array[4],"procName":array[6],"procDesc":array[5],"objName":array[7],"objDataType":array[8]};
						childrenArray.push(treeParam);
						procIdsArray.push(array[1]);
						if(!currentTreeId&&count==1&&i==0){
							gCurrentProcessType = {};
							processChanged(array[1], array[2], array[3], array[4], array[6], array[5],array[8]);
						}
						if(currentTreeId&&currentTreeId=="process_"+array[1]){
							gCurrentProcessType = {};
							processChanged(array[1], array[2], array[3], array[4], array[6], array[5],array[8]);
							leftMenuTree.$.linetree.selectId = currentTreeId;
						}
					}
				}
			}
			var hasProp = false; 
			for(var prop in openList){
				hasProp = true;
				break;
			}
			if(hasProp){
				if(openList["processType_"+objType.split(',')[2]]){
					open = openList["processType_"+objType.split(',')[2]];
				}else{
					open = false;
				}
			}
			treeParamData.push({"id":"processType_"+objType.split(',')[2],"typeId":objType.split(',')[2],"procIds":procIdsArray.join(","),"name":objType.split(',')[1].replaceAll("@@@@",",") +"["+objType.split(',')[2]+"] ","open":open,children:childrenArray});
		});
		leftMenuTree.treeData = treeParamData;
		if(!currentTreeId&&gCurrentProcess&&gCurrentProcess.procId){
			currentTreeId = "process_"+gCurrentProcess.procId;
			leftMenuTree.$.linetree.selectId = currentTreeId;
		}
	}
  