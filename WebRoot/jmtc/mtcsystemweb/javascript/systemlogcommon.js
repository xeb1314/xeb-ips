var gLogInfo={};

function viewLogDetail(id)
{
	var logDetail;
	for(var i in gLogInfo)
	{
		if(gLogInfo[i].ID == id)
		{
			logDetail = gLogInfo[i].LOG_INFO;
			break;
		}
	}
	el('logDetail').value= logDetail || '';
	var dialog = new jetsennet.ui.Window("detail-window");
    jQuery.extend(dialog, { submitBox: false, cancelBox: false, maximizeBox: false, showScroll: false, windowStyle: 1, minimizeBox: false, title: "错误详细信息" });
    dialog.size = { width: 750, height: 0 };
    dialog.controls = ["divLogDetail"];
    dialog.showDialog();
}