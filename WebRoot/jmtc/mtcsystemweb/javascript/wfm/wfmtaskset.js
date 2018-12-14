//流程任务操作
var WfmTaskOperate = (function(){
	return{
		//打回
		rollbackTask: function() {
			var areaElements = jetsennet.form.getElements('divTaskBack');
		    jetsennet.form.resetValue(areaElements);
		    jetsennet.form.clearValidateState(areaElements);
		    var dialog = new jetsennet.ui.Window("task-back-win");
		    jQuery.extend(dialog, { submitBox: true, cancelBox: true, windowStyle: 1, maximizeBox: false, minimizeBox: false, size: { width: 440, height: 0 }, showScroll: false, title: "打回任务" });
		    dialog.controls = ["divTaskBack"];
		    dialog.onsubmit = function () {
		    	if (jetsennet.form.validate(areaElements, true)) {
		    		var param = new HashMap();
		    		param.put("taskId",gCurrentTaskId);
		    		param.put("backTaskId","");
		    		param.put("backNote",el('txtBackDesc').value);
		    		param.put("processUser",jetsennet.Application.userInfo.UserName);
		    		param.put("processUserId",jetsennet.Application.userInfo.LoginId);
		    		var sResult = RUNDAO.execute("pushBackTask", param);
		    		if(sResult.errorCode==0){
		    			el('txtBackDesc').value = "";
		    			getTaskStatus();
		    			jetsennet.ui.Windows.close("task-back-win");  
		    		}
		    	};
		    };
		    dialog.showDialog();
		},

		//暂停任务
		pauseTask: function() {
			 var param = new HashMap();
		     param.put("taskId",gCurrentTaskId);
		     param.put("pauseNote","");
		     param.put("processUser",jetsennet.Application.userInfo.UserName);
		     param.put("processUserId",jetsennet.Application.userInfo.LoginId);
		     var sResult = RUNDAO.execute("pauseTask", param);
		     if(sResult.errorCode==0){
		    	 jetsennet.message('操作成功!');
				 getTaskStatus();
		     }
		},
		//恢复任务
		resumeTask: function() {
			 var param = new HashMap();
		     param.put("taskId",gCurrentTaskId);
		     param.put("resumeNote","");
		     param.put("processUser",jetsennet.Application.userInfo.UserName);
		     param.put("processUserId",jetsennet.Application.userInfo.LoginId);
		     var sResult = RUNDAO.execute("resumeTask", param);
		     if(sResult.errorCode==0){
		    	 jetsennet.message('操作成功!');
				 getTaskStatus();
		     }
		},
		//重新执行
		resetTask: function() {
			var param = new HashMap();
		    param.put("taskId",gCurrentTaskId);
		    param.put("resetNote","");
		    param.put("processUser",jetsennet.Application.userInfo.UserName);
		    param.put("processUserId",jetsennet.Application.userInfo.LoginId);
		    var sResult = RUNDAO.execute("resetTask", param);
		    if(sResult.errorCode==0){
		    	jetsennet.message('操作成功!');
			    getTaskStatus();
		    }
		},
		//提交工作流
		commitTask: function() {
		    jetsennet.confirm("确定跳过当前任务?", function () {
		    	var param = new HashMap();
		        param.put("taskId",gCurrentTaskId);
		        param.put("commitNote","");
		        param.put("processUser",jetsennet.Application.userInfo.UserName);
		        param.put("processUserId",jetsennet.Application.userInfo.LoginId);
		        var sResult = RUNDAO.execute("commitTask", param);
		        if(sResult.errorCode==0){
		        	jetsennet.message('操作成功!');
				    getTaskStatus();
		        }
		        return true;
		    });
		},

		//结束任务
		stopTask: function() {
		    jetsennet.confirm("确定终止当前任务?", function () {
		    	var param = new HashMap();
		        param.put("taskId",gCurrentTaskId);
		        param.put("finishNote","");
		        param.put("processUser",jetsennet.Application.userInfo.UserName);
		        param.put("processUserId",jetsennet.Application.userInfo.LoginId);
		        var sResult = RUNDAO.execute("finishTask", param);
		        if(sResult.errorCode==0){
		        	jetsennet.message('操作成功!');
				    getTaskStatus();
		        }
		        return true;
		    });
		}
	};
}());