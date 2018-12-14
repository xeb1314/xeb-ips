/**
 *警告：
 * 平台还没提供任务返回结果的查看功能。
 * 暂时由我实现该功能，后续深圳实现该功能后，该功能作废，用深圳提供的版本。
 * 			-------Add by 薛恩彬 2014-12-20
 */

function taskResult(taskId){
	el("txt_ResultList").options.length=0;
	el("txt_ResultValue").value="";
	var jointables = [["WFM_TASKEXEC", "a", "a.PROCACT_ID=t.PROCACT_ID", jetsennet.TableJoinType.Inner]];
    var objs = WFMDAO.queryObjs("commonXmlQuery", "TASK_ID", "WFM_TASKLOG", "t", jointables,[["a.TASK_ID", taskId, jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.String]],"t.FIELD_1,t.TASK_ID");
     for(var i=0;i<objs.length;i++) {
    	 var filePath = objs[i].FIELD_1;
    	 if(filePath != ""){
    		 fileList(filePath,objs[i].TASK_ID);
    	 /*}else{
    		 jetsennet.warn("暂时没有返回值！");*/
    	 };
    };
    var dialog = new jetsennet.ui.Window("new-taskresult-win");  
	jQuery.extend(dialog, { maximizeBox: true, minimizeBox: true, windowStyle: 0,
		submitBox: false, cancelBox: false, title: "结果查看" }); 
	dialog.size = { width: 1200, height: 0 };
	dialog.controls = ["divTaskResult"];  
	dialog.showDialog();
}

/**
 * 遍历该目录下的所有xml并添加到”返回结果列表“中
 * @param filePath
 * @param taskId
 */
function fileList(filePath,taskId){
	var fso = new ActiveXObject("Scripting.FileSystemObject");
	var fldr = fso.GetFolder(filePath);
	var underFiles = new Enumerator(fldr.files); //文件夹下文件
	for (;!underFiles.atEnd();underFiles.moveNext()){   
	     var fn = "" + underFiles.item();
	     var fileName = fn.substring(fn.lastIndexOf("\\")+1,fn.lastIndexOf("."));
	     selectAddItem("txt_ResultList",fn,fileName);
	}
}

/**
 * 点击select事件
 */
function selectValue(obj){
	el("txt_ResultValue").value = readFile(obj.value);
}

/**
 * 读取xml文件
 * @param path
 * @returns
 */
function readFile(path){
	/*var f1 = fso.GetFile(path);
	var fh = fso.OpenTextFile(f1, 1reading,false,0);
//	var fh = f1.OpenAsTextStream(1,true);
	               var content = '';
//	               var a = fh.ReadAll();
	               while ( !fh.AtEndOfStream ) {
	                      content += fh.ReadLine();
	               }
	               fh.close();
	      return content;*/
	
	var xmlDoc = loadXML(path);
    if (xmlDoc == null) {
        alert('您的浏览器不支持xml文件读取,于是本页面禁止您的操作,推荐使用IE5.0以上可以解决此问题!');
        window.location.href = '../err.html';

    }
    return xmlDoc.xml;
	
	//读取到xml文件中的数据
//	 return checkXMLDocObj(path);

	}


/**
 * 往select中添加Item
 * @param selectId   select divId
 * @param value		id
 * @param name		显示的名称
 */
function selectAddItem(selectId,value,name){
	 var elm = el(selectId);
	    var len = elm.options.length;
	    for (var i = 0; i < len; i++) {
	        if (elm.options[i].value == value) {
	            return;
	        }
	    }
	    var objNewOption = document.createElement("option");
	    objNewOption.value = value;
	    objNewOption.innerHTML = name;
	    elm.options.add(objNewOption);
}

//加载xml文档
function loadXML(xmlFile) {
     var xmlDoc;
     if (window.ActiveXObject) {
         xmlDoc = new ActiveXObject('Microsoft.XMLDOM');//IE浏览器
         xmlDoc.async = false;
         xmlDoc.load(xmlFile);
     }
     else if (isFirefox=navigator.userAgent.indexOf("Firefox")>0) { //火狐浏览器
     //else if (document.implementation && document.implementation.createDocument) {//这里主要是对谷歌浏览器进行处理
         xmlDoc = document.implementation.createDocument('', '', null);
         xmlDoc.load(xmlFile);
     }
     else{ //谷歌浏览器
       var xmlhttp = new window.XMLHttpRequest();
         xmlhttp.open("GET",xmlFile,false);
         xmlhttp.send(null);
         if(xmlhttp.readyState == 4){
         xmlDoc = xmlhttp.responseXML.documentElement;
         } 
     }

     return xmlDoc;
 };

