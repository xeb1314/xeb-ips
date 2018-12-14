var gMtcTaskTypes = {}; //任务类型
//加载受控类别
function loadCtrlWordType() {
	var conditions = [];
	conditions.push(["CW_TYPE", "2301", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
	conditions.push(["CW_SYS", "23", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, jetsennet.SqlParamType.Numeric]);
	var sResult = MTCDAO.query("commonXmlQuery", "CW_ID", "NET_CTRLWORD", null, null, conditions, "CW_ID,CW_NAME,CW_CODE,CW_DESC");
	var objs = jetsennet.xml.toObject(sResult.resultVal, "Record");
    jetsennet.ui.DropDownList["txt_taskType"].clear();
    jetsennet.ui.DropDownList["txt_taskType"].appendItem({ text: '全部', value: -1 });
    if (objs && objs.length > 0) {
        for (var i = 0; i < objs.length; i++) {
            jetsennet.ui.DropDownList["txt_taskType"].appendItem({ text: objs[i].CW_NAME, value: objs[i].CW_CODE });
            gMtcTaskTypes[objs[i].CW_CODE] = objs[i].CW_NAME;
        }
        jetsennet.ui.DropDownList["txt_taskType"].setSelectedIndex(0);
    }
}

/**
* 
* 将taskxml中的部分数据加入到详情中
*/

function addTaskConten(task,xmlDoc) {
    var taskxmlDoc = new jetsennet.XmlDoc();
    taskxmlDoc.async = false;
    taskxmlDoc.loadXML(task.TASK_XML);
    var taskNode = taskxmlDoc.selectSingleNode("mts/mtsTaskNew");
    var parentId = valueOf(taskNode.selectSingleNode("parentID"), "text", "");
    var objType = valueOf(taskNode.selectSingleNode("objType"), "text", "");  //250剪辑模式
    var objPath = objType!="250"?valueOf(taskNode.selectSingleNode("objPath/fileItem/filePath"), "text", ""):valueOf(taskNode.selectSingleNode("taskExtInfo/mtsCutlist/matterList/matterItem/fileGroup/fileItem/filePath"), "text", "");
    var fileSize = valueOf(taskNode.selectSingleNode("objPath/fileItem/fileSize"), "text", "");
    var objDstPath = valueOf(taskNode.selectSingleNode("objDstPath/fileItem/filePath"), "text", "");
    var dstfileSize = valueOf(taskNode.selectSingleNode("objDstPath/fileItem/fileSize"), "text", "");
    var paramType = valueOf(taskNode.selectSingleNode("taskParam/paramType"), "text", "");
    var templateName = valueOf(taskNode.selectSingleNode("taskParam/paramItem/paramData/templateName"), "text", "");
    var taskSubType = valueOf(taskNode.selectSingleNode("taskSubType"), "text", "");

    var nodes = xmlDoc.documentElement.selectNodes("Record");
    nodes[0].appendChild(xmlDoc.createElement("TASK_SUBTYPE"));
    nodes[0].appendChild(xmlDoc.createElement("PARENT_ID"));
    nodes[0].appendChild(xmlDoc.createElement("OBJ_PATH"));
    nodes[0].appendChild(xmlDoc.createElement("OBJ_DESTPATH"));
    nodes[0].appendChild(xmlDoc.createElement("PARAM_TYPE"));
    nodes[0].appendChild(xmlDoc.createElement("TEMPLATE_NAME"));
    nodes[0].appendChild(xmlDoc.createElement("FILE_SIZE"));
    nodes[0].appendChild(xmlDoc.createElement("DEST_FILE_SIZE"));
    nodes[0].selectSingleNode("TASK_SUBTYPE").text = taskSubType;
    nodes[0].selectSingleNode("PARENT_ID").text = parentId;
    nodes[0].selectSingleNode("OBJ_PATH").text = objPath;
    nodes[0].selectSingleNode("OBJ_DESTPATH").text = objDstPath;
    nodes[0].selectSingleNode("PARAM_TYPE").text = paramType;
    nodes[0].selectSingleNode("TEMPLATE_NAME").text = templateName;
    nodes[0].selectSingleNode("FILE_SIZE").text = fileSize;
    nodes[0].selectSingleNode("DEST_FILE_SIZE").text = dstfileSize;
    
    task['TASK_SUBTYPE'] = taskSubType;
    task['PARENT_ID'] = parentId;
    task['OBJ_PATH'] = objPath;
    task['OBJ_DESTPATH'] = objDstPath;
    task['PARAM_TYPE'] = paramType;
    task['TEMPLATE_NAME'] = templateName;
    task['FILE_SIZE'] = fileSize;
    task['DEST_FILE_SIZE'] = dstfileSize;

}

/**
* taskxml显示
* 
*/
function showTaskxml() {
    var dialog = new jetsennet.ui.Window("taskxml-window");
    jQuery.extend(dialog, { submitBox: false, cancelBox: false, maximizeBox: false, showScroll: false, windowStyle: 1, minimizeBox: false, title: "任务详细信息" });
    dialog.size = { width: 900, height: 0 };
    dialog.controls = ["taskxmlContent"];
    dialog.showDialog();
}