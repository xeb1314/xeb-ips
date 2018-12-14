var gMplexConfig; //配置插件对象
var gFileProfileDoc = new jetsennet.XmlDoc(); //文件参数对象
var gVideoProfileDoc = new jetsennet.XmlDoc(); //视频参数对象
var gAudioProfileDoc = new jetsennet.XmlDoc(); //音频参数对象
var gTemplateData = ""; //模板base64 字符串
var gHasTemplate = false; //是否有模板
/**
* 待补充：
* 1、输入范围判断
* 
*/

//打开编目模板
function openTemplate() {
    try {
        var flag = mplexconfig.LoadTemplateFileDialog();
        if (flag) {
            gHasTemplate = true;
            gTemplateData = mplexconfig.GetTemplateBase64String();
            initFileFormat(true);
            getTemplate();
        }
    } catch (e) {
        jetsennet.message("加载配置插件错误！" + e);
    }

}

//可变码率勾选 控制最大码率显示隐藏 
function changeVidVarBitrate() {
    if (el("chkVidVarBitrate").checked == true) {
        el('videoMaxBitRateSpan').style.visibility = "visible";
    } else {
        el('videoMaxBitRateSpan').style.visibility = "hidden";
    }
}

//自动质量勾选 控制质量是否禁用
function changeAutoQuality() {
    if (el("autoQuality").checked == true) {
        el('speedorQuality').disabled = true;
    } else {
        el('speedorQuality').disabled = false;
    }
}

//初始化配置插件
function initMplexConfig() {
    el("divPlayer").innerHTML = '<object id="mplexconfig" name="mplexconfig" classid="clsid:8A4E4C8B-9335-46BA-966F-753BF2EC8F98" type="application/x-oleobject" viewastext="viewastext"></object>';
    gMplexConfig = el("mplexconfig");
}

////模板配置窗口
//function showParamConfig(type){
//	  gMplexConfig.InitConfigParam(type);//初始化高清或标清模板
//	  initFileFormat();
//    var dialog = new jetsennet.ui.Window("param-config");
//    jQuery.extend(dialog, { submitBox: true, cancelBox: true, windowStyle: 1, maximizeBox: false, minimizeBox: false, size: { width: 700, height: 600 }, showScroll: false, title: "参数配置" });
//    dialog.controls = ["paramConfig"];
//    dialog.onsubmit = function () {
//    	jetsennet.ui.Windows.close("param-config");
//    };
//    dialog.showDialog();
//}

//初始化文件格式列表
function initFileFormat(flag) {
    var fileFormatXml;
    if (flag) {
        fileFormatXml = gMplexConfig.InitMultiplexerFormat(true); //返回文件格式列表数据
    } else {
        fileFormatXml = gMplexConfig.InitMultiplexerFormat();
    }
    //错误判断
    if (fileFormatXml.substring(0, 8) == "errormsg") {
        var errString = fileFormatXml.substring(9);
        alert(errString);
        return;
    }
    var fileFormatDoc = new jetsennet.XmlDoc(); //文件格式doc
    fileFormatDoc.loadXML(fileFormatXml);
    var multiplexerNodes = fileFormatDoc.selectNodes("MPlexConfig/FileFormats/FileFormat");

    for (var i = 0; i < multiplexerNodes.length; i++) {
        var option = new Option(multiplexerNodes[i].selectSingleNode("name").text, multiplexerNodes[i].selectSingleNode("typeid").text);
        el('fileFormat').options[i] = option;
    }

    if (el('fileFormat').options.length > 0) {
        if (flag) {
            var selectItem = fileFormatDoc.selectSingleNode("MPlexConfig/SelectItem").text;
            $("#fileFormat").val(selectItem);
        }
        initAvInfo($("#fileFormat").val(), flag);
    }
}

//根据文件格式，设置关联的文件格式预置列表、视频格式列表、音频格式列表
function initAvInfo(typeId, flag) {
    var avInfoXml = "";
    if (flag) {
        avInfoXml = gMplexConfig.SetMultiplexerFormat(typeId, true); //设置某种文件格式  
    } else {
        avInfoXml = gMplexConfig.SetMultiplexerFormat(typeId);
    }
    //错误判断
    if (avInfoXml.substring(0, 8) == "errormsg") {
        var errString = avInfoXml.substring(9);
        alert(errString);
        return;
    }

    var avInfoDoc = new jetsennet.XmlDoc();
    avInfoDoc.loadXML(avInfoXml);
    //文件格式关联预置个数，可能为0
    var fileProfileCount = avInfoDoc.selectSingleNode("MPlexConfig/File/FileProfileCount").text;
    var fileNodes = null;
    if (fileProfileCount > 0) {
        fileNodes = avInfoDoc.selectNodes("MPlexConfig/File/FileProfiles/FileProfile")
    }
    var videoNodes = avInfoDoc.selectNodes("MPlexConfig/Video/VideoFormats/VideoFormat");
    var audioNodes = avInfoDoc.selectNodes("MPlexConfig/Audio/AudioFormats/AudioFormat");

    var fileFlag = avInfoDoc.selectSingleNode("MPlexConfig/File/flag").text;
    var videoFlag = avInfoDoc.selectSingleNode("MPlexConfig/Video/flag").text;
    var audioFlag = avInfoDoc.selectSingleNode("MPlexConfig/Audio/flag").text;

    //清空下拉框和选项值
    cleanUpSelection("videoProfile");
    cleanUpSelection("audioProfile");
    cleanUpFileProfile();
    cleanUpVideoProfile();
    cleanUpAudioProfile();

    //清空文件预置列表option选项
    cleanUpSelection("fileProfile");
    if (fileNodes != null) {
        for (var i = 0; i < fileNodes.length; i++) {
            var option = new Option(fileNodes[i].selectSingleNode("name").text, i);
            el('fileProfile').options[i] = option;
        }
    }

    if (fileFlag == "0") {
        //不可见
        el('fileProfile').style.visibility = "hidden";
        el('fileProfileTitle').style.visibility = "hidden";

    } else if (fileFlag == "1") {
        //可见不可编辑
        el('fileProfile').style.visibility = "visible";
        el('fileProfileTitle').style.visibility = "visible";
        el('fileProfile').disabled = true;

        if (el('fileProfile').options.length > 0) {
            if (flag) {
                var selecItem = avInfoDoc.selectSingleNode("MPlexConfig/File/SelectItem").text;
                $("#fileProfile").get(0).selectedIndex = selectItem;
            }
            initFileProfile($("#fileProfile").val(), flag);
        }
    } else if (fileFlag == "3") {
        //可编辑
        el('fileProfile').style.visibility = "visible";
        el('fileProfileTitle').style.visibility = "visible";
        el('fileProfile').disabled = false;

        if (el('fileProfile').options.length > 0) {
            if (flag) {
                var selecItem = avInfoDoc.selectSingleNode("MPlexConfig/File/SelectItem").text;
                $("#fileProfile").get(0).selectedIndex = selectItem;
            }
            initFileProfile($("#fileProfile").val(), flag);
        }
    }

    //清空视频格式列表option选项
    cleanUpSelection("videoFormat");
    for (var i = 0; i < videoNodes.length; i++) {
        var option = new Option(videoNodes[i].selectSingleNode("name").text, videoNodes[i].selectSingleNode("typeid").text);
        el('videoFormat').options[i] = option;
    }

    if (videoFlag == "0") {
        //不可见
        el('videoFormat').style.visibility = "hidden";
        el('videoFormatTitle').style.visibility = "hidden";

    } else if (videoFlag == "1") {
        //可见不可编辑
        el('videoFormat').style.visibility = "visible";
        el('videoFormatTitle').style.visibility = "visible";
        el('videoFormat').disabled = true;

        if (el('videoFormat').options.length > 0) {
            if (flag) {
                var selectItem = avInfoDoc.selectSingleNode("MPlexConfig/Video/SelectItem").text;
                $("#videoFormat").get(0).selectedIndex = selectItem;
            }
            initVideoFormat($("#videoFormat").val(), flag);
        }

    } else if (videoFlag == "3") {
        //可编辑
        el('videoFormat').style.visibility = "visible";
        el('videoFormatTitle').style.visibility = "visible";
        el('videoFormat').disabled = false;

        if (el('videoFormat').options.length > 0) {
            if (flag) {
                var selectItem = avInfoDoc.selectSingleNode("MPlexConfig/Video/SelectItem").text;
                $("#videoFormat").get(0).selectedIndex = selectItem;
            }
            initVideoFormat($("#videoFormat").val(), flag);
        }
    }

    //清空option选项
    cleanUpSelection("audioFormat");
    for (var i = 0; i < audioNodes.length; i++) {
        var option = new Option(audioNodes[i].selectSingleNode("name").text, audioNodes[i].selectSingleNode("typeid").text);
        el('audioFormat').options[i] = option;
    }

    if (audioFlag == "0") {
        //不可见
        el('audioFormat').style.visibility = "hidden";
        el('audioFormatTitle').style.visibility = "hidden";

    } else if (audioFlag == "1") {
        //可见不可编辑
        el('audioFormat').style.visibility = "visible";
        el('audioFormatTitle').style.visibility = "visible";
        el('audioFormat').disabled = true;

        if (el('audioFormat').options.length > 0) {
            if (flag) {
                var selectItem = avInfoDoc.selectSingleNode("MPlexConfig/Audio/SelectItem").text;
                $("#audioFormat").get(0).selectedIndex = selectItem;
            }
            initAudioFormat($("#audioFormat").val(), flag);
        }
    } else if (audioFlag == "3") {
        //可编辑
        el('audioFormat').style.visibility = "visible";
        el('audioFormatTitle').style.visibility = "visible";
        el('audioFormat').disabled = false;

        if (el('audioFormat').options.length > 0) {
            if (flag) {
                var selectItem = avInfoDoc.selectSingleNode("MPlexConfig/Audio/SelectItem").text;
                $("#audioFormat").get(0).selectedIndex = selectItem;
            }
            initAudioFormat($("#audioFormat").val(), flag);
        }
    }
}

//设置某种文件格式的预置
function initFileProfile(index, flag) {
    var fileProfileXml;
    if (flag) {
        fileProfileXml = gMplexConfig.GetLoadFileParam();
    } else {
        fileProfileXml = gMplexConfig.SetFileProfile(index); //返回界面中文件参数框的其他各个控件的属性及值
    }
    renderFileProfile(fileProfileXml);
}

//填充文件参数的值
function renderFileProfile(fileProfileXml) {
    cleanUpFileProfile();
    //错误判断
    if (fileProfileXml.substring(0, 8) == "errormsg") {
        var errString = fileProfileXml.substring(9);
        alert(errString);
        return;
    }
    gFileProfileDoc.loadXML(fileProfileXml);

    //复合码率值项
    var muxBitRateFlag = gFileProfileDoc.selectSingleNode("MPlexConfig/FileProfile/MuxBitrate/flag").text;
    if (muxBitRateFlag == "0") {
        //不可见
        el('muxBitRate').style.visibility = "hidden";
        el('muxBitRateTitle').style.visibility = "hidden";
    } else if (muxBitRateFlag == "1") {
        //可见不可编辑
        el('muxBitRate').style.visibility = "visible";
        el('muxBitRateTitle').style.visibility = "visible";
        el('muxBitRate').disabled = true;
        var muxBitRateValue = gFileProfileDoc.selectSingleNode("MPlexConfig/FileProfile/MuxBitrate/value").text;
        el("muxBitRate").value = muxBitRateValue;
    } else if (muxBitRateFlag == "3") {
        //可编辑
        el('muxBitRate').style.visibility = "visible";
        el('muxBitRateTitle').style.visibility = "visible";
        el('muxBitRate').disabled = false;
        var muxBitRateValue = gFileProfileDoc.selectSingleNode("MPlexConfig/FileProfile/MuxBitrate/value").text;
        el("muxBitRate").value = muxBitRateValue;
    }

    //MuxPMTID值
    var muxPMTIDFlag = gFileProfileDoc.selectSingleNode("MPlexConfig/FileProfile/MuxPMTID/flag").text;
    if (muxPMTIDFlag == "0") {
        //不可见
        el('muxPMTID').style.visibility = "hidden";
        el('muxPMTIDTitle').style.visibility = "hidden";
    } else if (muxPMTIDFlag == "1") {
        //可见不可编辑
        el('muxPMTID').style.visibility = "visible";
        el('muxPMTIDTitle').style.visibility = "visible";
        el('muxPMTID').disabled = true;
        var muxPMTIDValue = gFileProfileDoc.selectSingleNode("MPlexConfig/FileProfile/MuxPMTID/value").text;
        el("muxPMTID").value = muxPMTIDValue;
    } else if (muxPMTIDFlag == "3") {
        //可编辑
        el('muxPMTID').style.visibility = "visible";
        el('muxPMTIDTitle').style.visibility = "visible";
        el('muxPMTID').disabled = false;
        var muxPMTIDValue = gFileProfileDoc.selectSingleNode("MPlexConfig/FileProfile/MuxPMTID/value").text;
        el("muxPMTID").value = muxPMTIDValue;
    }
}

//返回设置视频编码格式的视频预置项列表，有可能为0个
function initVideoFormat(typeId, flag) {
    var videoFormatXml;
    if (flag) {
        videoFormatXml = gMplexConfig.SetVideoFormat(typeId, true); //返回设置视频编码格式的视频预置项列表
    } else {
        videoFormatXml = gMplexConfig.SetVideoFormat(typeId);
    }
    //错误判断
    if (videoFormatXml.substring(0, 8) == "errormsg") {
        var errString = videoFormatXml.substring(9);
        alert(errString);
        return;
    }
    var videoFormatDoc = new jetsennet.XmlDoc(); //视频预置项doc
    videoFormatDoc.loadXML(videoFormatXml);

    var videoProfileCount = videoFormatDoc.selectSingleNode("MPlexConfig/Video/VideoProfileCount").text;
    var videoProfileNodes = null;
    if (videoProfileCount > 0) {
        videoProfileNodes = videoFormatDoc.selectNodes("MPlexConfig/Video/VideoProfiles/VideoProfile");
    }

    if (videoProfileNodes != null) {
        //清空select
        cleanUpSelection("videoProfile");
        cleanUpVideoProfile();
        for (var i = 0; i < videoProfileNodes.length; i++) {
            var option = new Option(videoProfileNodes[i].selectSingleNode("name").text, i);
            el('videoProfile').options[i] = option;
        }
    }

    if (el('videoProfile').options.length > 0) {
        if (flag) {
            var selectItem = videoFormatDoc.selectSingleNode("MPlexConfig/Video/SelectItem").text;
            $("#videoProfile").get(0).selectedIndex = selectItem;
        }
        initVideoProfile($("#videoProfile").val(), flag);
    }
}

//设置一个文件格式关联的音频编码格式
function initAudioFormat(typeId, flag) {
    var audioFormatXml;
    if (flag) {
        audioFormatXml = gMplexConfig.SetAudioFormat(typeId, true); //返回设置视频编码格式的视频预置项列表
    } else {
        audioFormatXml = gMplexConfig.SetAudioFormat(typeId);
    }
    //错误判断
    if (audioFormatXml.substring(0, 8) == "errormsg") {
        var errString = audioFormatXml.substring(9);
        alert(errString);
        return;
    }
    var audioFormatDoc = new jetsennet.XmlDoc(); //音频预置项doc
    audioFormatDoc.loadXML(audioFormatXml);

    var audioProfileCount = audioFormatDoc.selectSingleNode("MPlexConfig/Audio/AudioProfileCount").text;
    var audioProfileNodes = null;
    if (audioProfileCount > 0) {
        audioProfileNodes = audioFormatDoc.selectNodes("MPlexConfig/Audio/AudioProfiles/AudioProfile");
    }

    if (audioProfileNodes != null) {
        //清空select
        cleanUpSelection("audioProfile");
        cleanUpAudioProfile();
        for (var i = 0; i < audioProfileNodes.length; i++) {
            var option = new Option(audioProfileNodes[i].selectSingleNode("name").text, i);
            el('audioProfile').options[i] = option;
        }
    }

    if (el('audioProfile').options.length > 0) {
        if (flag) {
            var selectItem = audioFormatDoc.selectSingleNode("MPlexConfig/Audio/SelectItem").text;
            $("#audioProfile").get(0).selectedIndex = selectItem;
        }
        initAudioProfile($("#audioProfile").val(), flag);
    }
}

//设置视频格式的预置项
function initVideoProfile(index, flag) {
    var videoProfileXml;
    if (flag) {
        videoProfileXml = gMplexConfig.GetLoadVideoParam();
    } else {
        videoProfileXml = gMplexConfig.SetVideoProfile(index); //返回视频格式的相关参数（所有参数均包含，某个预置没有那一项时也有参数）
    }
    renderVideoProfile(videoProfileXml);
}

//填充视频参数的值
function renderVideoProfile(videoProfileXml) {
    cleanUpVideoProfile();
    //错误判断
    if (videoProfileXml.substring(0, 8) == "errormsg") {
        var errString = videoProfileXml.substring(9);
        alert(errString);
        return;
    }
    gVideoProfileDoc.loadXML(videoProfileXml);

    //视频码率
    var videoBitRateFlag = gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/VideoBitRate/flag").text;
    if (videoBitRateFlag == "0") {
        //不可见
        //    	el('videoBitRate').style.visibility = "hidden";
        el('videoBitRateSpan').style.visibility = "hidden";

    } else if (videoBitRateFlag == "1") {
        //可见不可编辑
        //		el('videoBitRate').style.visibility = "visible";
        el('videoBitRateSpan').style.visibility = "visible";
        el('videoBitRate').disabled = true;
        var videoBitRateValue = gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/VideoBitRate/value").text;
        el("videoBitRate").value = videoBitRateValue;
    } else if (videoBitRateFlag == "3") {
        //可编辑
        //		el('videoBitRate').style.visibility = "visible";
        el('videoBitRateSpan').style.visibility = "visible";
        el('videoBitRate').disabled = false;
        var videoBitRateValue = gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/VideoBitRate/value").text;
        el("videoBitRate").value = videoBitRateValue;
    }

    //自动质量  
    var autoQualityFlag = gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/AutoQuality/flag").text;
    if (autoQualityFlag == "0") {
        //不可见
        el('autoQualitySpan').style.visibility = "hidden";

    } else if (autoQualityFlag == "1") {
        //可见不可编辑
        el('autoQualitySpan').style.visibility = "visible";
        el('autoQuality').disabled = true;
        var autoQualityValue = gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/AutoQuality/value").text;
        if (autoQualityValue == 0) {
            el('autoQuality').checked = false;
            el('speedorQuality').disabled = false;
        } else if (autoQualityValue == 1) {
            el('autoQuality').checked = true;
            el('speedorQuality').disabled = true;
        }
    } else if (autoQualityFlag == "3") {
        //可编辑
        el('autoQualitySpan').style.visibility = "visible";
        el('autoQuality').disabled = false;
        var autoQualityValue = gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/AutoQuality/value").text;
        if (autoQualityValue == 0) {
            el('autoQuality').checked = false;
            el('speedorQuality').disabled = false;
        } else if (autoQualityValue == 1) {
            el('autoQuality').checked = true;
            el('speedorQuality').disabled = true;
        }
    }

    //质量调整
    var speedorQualityFlag = gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/SpeedorQuality/flag").text;
    if (speedorQualityFlag == "0") {
        //不可见
        el('speedorQualitySpan').style.visibility = "hidden";

    } else if (speedorQualityFlag == "1") {
        //可见不可编辑
        el('speedorQualitySpan').style.visibility = "visible";
        el('speedorQuality').disabled = true;
        var speedorQualityValue = gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/SpeedorQuality/value").text;
        el("speedorQuality").value = speedorQualityValue;
    } else if (speedorQualityFlag == "3") {
        //可编辑
        el('speedorQualitySpan').style.visibility = "visible";
        el('speedorQuality').disabled = false;
        var speedorQualityValue = gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/SpeedorQuality/value").text;
        el("speedorQuality").value = speedorQualityValue;
    }

    //可变码率  
    var chkVidVarBitrateFlag = gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/VarBitrate/flag").text;
    if (chkVidVarBitrateFlag == "0") {
        //不可见
        el('chkVidVarBitrateSpan').style.visibility = "hidden";

    } else if (chkVidVarBitrateFlag == "1") {
        //可见不可编辑
        el('chkVidVarBitrateSpan').style.visibility = "visible";
        el('chkVidVarBitrate').disabled = true;
        var chkVidVarBitrateValue = gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/VarBitrate/value").text;
        if (chkVidVarBitrateValue == 0) {
            el('chkVidVarBitrate').checked = false;
            el('videoMaxBitRateSpan').style.visibility = "hidden";
        } else if (chkVidVarBitrateValue == 1) {
            el('chkVidVarBitrate').checked = true;
            el('videoMaxBitRateSpan').style.visibility = "visible";
        }
    } else if (chkVidVarBitrateFlag == "3") {
        //可编辑
        el('chkVidVarBitrateSpan').style.visibility = "visible";
        el('chkVidVarBitrate').disabled = false;
        var chkVidVarBitrateValue = gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/VarBitrate/value").text;
        if (chkVidVarBitrateValue == 0) {
            el('chkVidVarBitrate').checked = false;
            el('videoMaxBitRateSpan').style.visibility = "hidden";
        } else if (chkVidVarBitrateValue == 1) {
            el('chkVidVarBitrate').checked = true;
            el('videoMaxBitRateSpan').style.visibility = "visible";
        }
    }

    //最大码率  
    var videoMaxBitRateFlag = gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/VideoMaxBitRate/flag").text;
    if (videoMaxBitRateFlag == "0") {
        //不可见
        el('videoMaxBitRateSpan').style.visibility = "hidden";

    } else if (videoMaxBitRateFlag == "1") {
        //可见不可编辑
        el('videoMaxBitRateSpan').style.visibility = "visible";
        el('videoMaxBitRate').disabled = true;
        var videoMaxBitRateValue = gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/VideoMaxBitRate/value").text;
        el("videoMaxBitRate").value = videoMaxBitRateValue;
    } else if (videoMaxBitRateFlag == "3") {
        //可编辑
        el('videoMaxBitRateSpan').style.visibility = "visible";
        el('videoMaxBitRate').disabled = false;
        var videoMaxBitRateValue = gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/VideoMaxBitRate/value").text;
        el("videoMaxBitRate").value = videoMaxBitRateValue;
    }

    //二次编码  
    //	var chkVid2PassFlag = gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/Vid2Pass/flag").text;
    //    if (chkVid2PassFlag == "0") {
    //    	//不可见
    //    	el('chkVid2PassSpan').style.visibility = "hidden";
    //    	
    //	}else if (chkVid2PassFlag == "1") {
    //		//可见不可编辑
    //		el('chkVid2PassSpan').style.visibility = "visible";
    //		el('chkVid2Pass').disabled = true;
    //	}else if (chkVid2PassFlag == "3") {
    //		//可编辑
    //		el('chkVid2PassSpan').style.visibility = "visible";
    //		el('chkVid2Pass').disabled = false;
    //	}

    //颜色空间  
    var vidColorFlag = gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/Color/flag").text;
    if (vidColorFlag == "0") {
        //不可见
        el('vidColorSpan').style.visibility = "hidden";

    } else if (vidColorFlag == "1") {
        //可见不可编辑
        el('vidColorSpan').style.visibility = "visible";
        el('vidColor').disabled = true;
        var vidColorValue = gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/Color/value").text;
        el("vidColor").selectedIndex = vidColorValue;
    } else if (vidColorFlag == "3") {
        //可编辑
        el('vidColorSpan').style.visibility = "visible";
        el('vidColor').disabled = false;
        var vidColorValue = gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/Color/value").text;
        el("vidColor").selectedIndex = vidColorValue;
    }

    //扫描方式  
    var scanTypeFlag = gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/ScanType/flag").text;
    if (scanTypeFlag == "0") {
        //不可见
        el('scanTypeSpan').style.visibility = "hidden";

    } else if (scanTypeFlag == "1") {
        //可见不可编辑
        el('scanTypeSpan').style.visibility = "visible";
        el('scanType').disabled = true;
        var scanTypeValue = gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/ScanType/value").text;
        el("scanType").selectedIndex = scanTypeValue;
    } else if (scanTypeFlag == "3") {
        //可编辑
        el('scanTypeSpan').style.visibility = "visible";
        el('scanType').disabled = false;
        var scanTypeValue = gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/ScanType/value").text;
        el("scanType").selectedIndex = scanTypeValue;
    }

    //关键帧间隔
    var gopFlag = gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/GOP/flag").text;
    if (gopFlag == "0") {
        //不可见
        el('gopSpan').style.visibility = "hidden";

    } else if (gopFlag == "1") {
        //可见不可编辑
        el('gopSpan').style.visibility = "visible";
        el('gop').disabled = true;
        var gopValue = gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/GOP/value").text;
        el("gop").value = gopValue;
        el("gopSpanLabel").innerHTML = "关键帧(I)间隔：";
    } else if (gopFlag == "3") {
        //可编辑
        el('gopSpan').style.visibility = "visible";
        el('gop').disabled = false;
        var gopValue = gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/GOP/value").text;
        el("gop").value = gopValue;
        el("gopSpanLabel").innerHTML = "关键帧(I)间隔：";
    }

    //B帧个数
    var bFrameFlag = gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/BFrame/flag").text;
    if (bFrameFlag == "0") {
        //不可见
        el('bFrameSpan').style.visibility = "hidden";

    } else if (bFrameFlag == "1") {
        //可见不可编辑
        el('bFrameSpan').style.visibility = "visible";
        el('bFrame').disabled = true;
        var bFrameValue = gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/BFrame/value").text;
        el("bFrame").value = bFrameValue;
    } else if (bFrameFlag == "3") {
        //可编辑
        el('bFrameSpan').style.visibility = "visible";
        el('bFrame').disabled = false;
        var bFrameValue = gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/BFrame/value").text;
        el("bFrame").value = bFrameValue;
    }

    //IDR帧间隔
    var idrsFlag = gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/IDRs/flag").text;
    if (idrsFlag == "0") {
        //不可见
        el('idrsSpan').style.visibility = "hidden";

    } else if (idrsFlag == "1") {
        //可见不可编辑
        el('idrsSpan').style.visibility = "visible";
        el('idrs').disabled = true;
        var idrsValue = gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/IDRs/value").text;
        el("idrs").value = idrsValue;
        var lblGop = gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/IDRs/lblGop").text;
        //修改关键帧间隔文本
        el("gopSpanLabel").innerHTML = lblGop;
    } else if (idrsFlag == "3") {
        //可编辑
        el('idrsSpan').style.visibility = "visible";
        el('idrs').disabled = false;
        var idrsValue = gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/IDRs/value").text;
        el("idrs").value = idrsValue;
        var lblGop = gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/IDRs/lblGop").text;
        //修改关键帧间隔文本
        el("gopSpanLabel").innerHTML = lblGop;
    }

    //参考帧数
    var refsFlag = gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/Refs/flag").text;
    if (refsFlag == "0") {
        //不可见
        el('refsSpan').style.visibility = "hidden";

    } else if (refsFlag == "1") {
        //可见不可编辑
        el('refsSpan').style.visibility = "visible";
        el('refs').disabled = true;
        var refsValue = gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/Refs/value").text;
        el("refs").value = refsValue;
    } else if (refsFlag == "3") {
        //可编辑
        el('refsSpan').style.visibility = "visible";
        el('refs').disabled = false;
        var refsValue = gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/Refs/value").text;
        el("refs").value = refsValue;
    }

    //帧速率
    var fameSpeedFlag = gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/FrameSpeed/flag").text;
    if (fameSpeedFlag == "0") {
        //不可见
        el('fameSpeedSpan').style.visibility = "hidden";

    } else if (fameSpeedFlag == "1") {
        //可见不可编辑
        el('fameSpeedSpan').style.visibility = "visible";
        el('fameSpeed').disabled = true;
        var fameSpeedValue = gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/FrameSpeed/value").text;
        el("fameSpeed").value = fameSpeedValue;
    } else if (fameSpeedFlag == "3") {
        //可编辑
        el('fameSpeedSpan').style.visibility = "visible";
        el('fameSpeed').disabled = false;
        var fameSpeedValue = gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/FrameSpeed/value").text;
        el("fameSpeed").value = fameSpeedValue;
    }

    //帧大小
    var frameSizeFlag = gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/FrameSize/flag").text;
    if (frameSizeFlag == "0") {
        //不可见
        el('frameSizeTitle').style.visibility = "hidden";

    } else if (frameSizeFlag == "1") {
        //可见不可编辑
        el('frameSizeTitle').style.visibility = "visible";
        el('frameSize').disabled = true;
        var frameSizeValue = gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/FrameSize/value").text;
        el("frameSize").value = frameSizeValue;
    } else if (frameSizeFlag == "3") {
        //可编辑
        el('frameSizeTitle').style.visibility = "visible";
        el('frameSize').disabled = false;
        var frameSizeValue = gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/FrameSize/value").text;
        el("frameSize").value = frameSizeValue;
    }

}

//设置音频格式的预置项
function initAudioProfile(index, flag) {
    var audioProfileXml = "";
    if (flag) {
        audioProfileXml = gMplexConfig.GetLoadAudioParam();
    } else {
        audioProfileXml = gMplexConfig.SetAudioProfile(index);
    }
    renderAudioProfile(audioProfileXml);
}

//填充音频参数的值
function renderAudioProfile(audioProfileXml) {
    cleanUpAudioProfile();
    //错误判断
    if (audioProfileXml.substring(0, 8) == "errormsg") {
        var errString = audioProfileXml.substring(9);
        alert(errString);
        return;
    }

    gAudioProfileDoc.loadXML(audioProfileXml);

    //音频码率
    var audioBitRateFlag = gAudioProfileDoc.selectSingleNode("MPlexConfig/Audio/AudioParam/AudioBitRate/flag").text;
    if (audioBitRateFlag == "0") {
        //不可见
        el('audioBitRate').style.visibility = "hidden";
        el('audioBitRateTitle').style.visibility = "hidden";
    } else if (audioBitRateFlag == "1") {
        //可见不可编辑
        el('audioBitRate').style.visibility = "visible";
        el('audioBitRateTitle').style.visibility = "visible";
        el('audioBitRate').disabled = true;
        var audioBitRateValue = gAudioProfileDoc.selectSingleNode("MPlexConfig/Audio/AudioParam/AudioBitRate/value").text;
        el("audioBitRate").value = audioBitRateValue;
    } else if (audioBitRateFlag == "3") {
        //可编辑
        el('audioBitRate').style.visibility = "visible";
        el('audioBitRateTitle').style.visibility = "visible";
        el('audioBitRate').disabled = false;
        var audioBitRateValue = gAudioProfileDoc.selectSingleNode("MPlexConfig/Audio/AudioParam/AudioBitRate/value").text;
        el("audioBitRate").value = audioBitRateValue;
    }

    //    //可变码率   展示有bug
    var autoQualityFlag = gAudioProfileDoc.selectSingleNode("MPlexConfig/Audio/AudioParam/VarBitRate/flag").text;
    if (autoQualityFlag == "0") {
        //不可见
        el('audVarBitrateSpan').style.visibility = "hidden";
    } else if (autoQualityFlag == "1") {
        //可见不可编辑
        el('audVarBitrateSpan').style.visibility = "visible";
        el('audVarBitrate').disabled = true;

        var audVarBitrateValue = gAudioProfileDoc.selectSingleNode("MPlexConfig/Audio/AudioParam/VarBitRate/value").text;
        if (audVarBitrateValue == 0) {
            el('audVarBitrate').checked = false;
        } else if (audVarBitrateValue == 1) {
            el('audVarBitrate').checked = true;
        }
    } else if (autoQualityFlag == "3") {
        //可编辑
        el('audVarBitrateSpan').style.visibility = "visible";
        el('audVarBitrate').disabled = false;
        var audVarBitrateValue = gAudioProfileDoc.selectSingleNode("MPlexConfig/Audio/AudioParam/VarBitRate/value").text;
        if (audVarBitrateValue == 0) {
            el('audVarBitrate').checked = false;
        } else if (audVarBitrateValue == 1) {
            el('audVarBitrate').checked = true;
        }
    }

    //声道个数
    var channelsFlag = gAudioProfileDoc.selectSingleNode("MPlexConfig/Audio/AudioParam/Channels/flag").text;
    if (channelsFlag == "0") {
        //不可见
        el('channels').style.visibility = "hidden";
        el('channelsTitle').style.visibility = "hidden";
    } else if (channelsFlag == "1") {
        //可见不可编辑
        el('channels').style.visibility = "visible";
        el('channelsSpan').style.visibility = "visible";
        el('channels').disabled = true;
        var channelsValue = gAudioProfileDoc.selectSingleNode("MPlexConfig/Audio/AudioParam/Channels/value").text;
        el("channels").value = channelsValue;
    } else if (channelsFlag == "3") {
        //可编辑
        el('channels').style.visibility = "visible";
        el('channelsSpan').style.visibility = "visible";
        el('channels').disabled = false;
        var channelsValue = gAudioProfileDoc.selectSingleNode("MPlexConfig/Audio/AudioParam/Channels/value").text;
        el("channels").value = channelsValue;
    }
}

//修改文件选项的参数
function modifyFileProfileDoc() {
    if (gFileProfileDoc.xml != "") {
        if (gFileProfileDoc.selectSingleNode("MPlexConfig/FileProfile/MuxBitrate/flag").text != 0 && el('muxBitRate').value != gFileProfileDoc.selectSingleNode("MPlexConfig/FileProfile/MuxBitrate/value").text) {
            gFileProfileDoc.selectSingleNode("MPlexConfig/FileProfile/MuxBitrate/value").text = el('muxBitRate').value;
            gFileProfileDoc.selectSingleNode("MPlexConfig/FileProfile/MuxBitrate/flag").text = 7;
        }
        if (gFileProfileDoc.selectSingleNode("MPlexConfig/FileProfile/MuxPMTID/flag").text != 0 && el("muxPMTID").value != gFileProfileDoc.selectSingleNode("MPlexConfig/FileProfile/MuxPMTID/value").text) {
            gFileProfileDoc.selectSingleNode("MPlexConfig/FileProfile/MuxPMTID/value").text = el("muxPMTID").value;
            gFileProfileDoc.selectSingleNode("MPlexConfig/FileProfile/MuxPMTID/flag").text = 7;
        }
    }
}

//修改音频选项的参数
function modifyAudioProfileDoc() {
    if (gAudioProfileDoc.xml != "") {
        //音频码率
        if (gAudioProfileDoc.selectSingleNode("MPlexConfig/Audio/AudioParam/AudioBitRate/flag").text != 0 && el("audioBitRate").value != gAudioProfileDoc.selectSingleNode("MPlexConfig/Audio/AudioParam/AudioBitRate/value").text) {
            gAudioProfileDoc.selectSingleNode("MPlexConfig/Audio/AudioParam/AudioBitRate/value").text = el("audioBitRate").value;
            gAudioProfileDoc.selectSingleNode("MPlexConfig/Audio/AudioParam/AudioBitRate/flag").text = 7;
        }

        //可变码率
        var checkFlag = el('audVarBitrate').checked == true ? 1 : 0;
        if (gAudioProfileDoc.selectSingleNode("MPlexConfig/Audio/AudioParam/VarBitRate/flag").text != 0 && checkFlag != gAudioProfileDoc.selectSingleNode("MPlexConfig/Audio/AudioParam/VarBitRate/value").text) {
            gAudioProfileDoc.selectSingleNode("MPlexConfig/Audio/AudioParam/VarBitRate/value").text = checkFlag;
            gAudioProfileDoc.selectSingleNode("MPlexConfig/Audio/AudioParam/VarBitRate/flag").text = 7;
        }
        //声道个数	
        if (gAudioProfileDoc.selectSingleNode("MPlexConfig/Audio/AudioParam/Channels/flag").text != 0 && el("channels").value != gAudioProfileDoc.selectSingleNode("MPlexConfig/Audio/AudioParam/Channels/value").text) {
            gAudioProfileDoc.selectSingleNode("MPlexConfig/Audio/AudioParam/Channels/value").text = el("channels").value;
            gAudioProfileDoc.selectSingleNode("MPlexConfig/Audio/AudioParam/Channels/flag").text = 7;
        }
    }
}

//修改视频选项的参数
function modifyVideoProfileDoc() {
    if (gVideoProfileDoc.xml != "") {
        //视频码率
        if (gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/VideoBitRate/flag").text != 0 && el("videoBitRate").value != gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/VideoBitRate/value").text) {
            gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/VideoBitRate/value").text = el("videoBitRate").value;
            gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/VideoBitRate/flag").text = 7;
        }

        //自动质量
        var autoQualityValue = el('autoQuality').checked = true ? 1 : 0;
        if (gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/AutoQuality/flag").text != 0 && autoQualityValue != gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/AutoQuality/value").text) {
            gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/AutoQuality/value").text = autoQualityValue;
            gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/AutoQuality/flag").text = 7;
        }

        //质量调整
        if (gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/SpeedorQuality/flag").text != 0 && el("speedorQuality").value != gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/SpeedorQuality/value").text) {
            gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/SpeedorQuality/value").text = el("speedorQuality").value;
            gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/SpeedorQuality/flag").text = 7;
        }

        //可变码率
        var chkVidVarBitrateValue = el('chkVidVarBitrate').checked == true ? 1 : 0;
        if (gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/VarBitrate/flag").text != 0 && chkVidVarBitrateValue != gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/VarBitrate/value").text) {
            gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/VarBitrate/value").text = chkVidVarBitrateValue;
            gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/VarBitrate/flag").text = 7;
        }

        //最大码率待完善 缺value字段
        if (gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/VideoMaxBitRate/flag").text != 0 && el("videoMaxBitRate").value != gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/VideoMaxBitRate/value").text) {
            gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/VideoMaxBitRate/value").text = el("videoMaxBitRate").value;
            gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/VideoMaxBitRate/flag").text = 7;
        }

        //二次编码待完善   不处理

        //颜色空间待完善 缺value字段
        if (gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/Color/flag").text != 0 && el("vidColor").selectedIndex != gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/Color/value").text) {
            gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/Color/value").text = el("vidColor").selectedIndex;
            gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/Color/flag").text = 7;
        }

        //扫描方式待完善 缺value字段
        if (gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/ScanType/flag").text != 0 && el("scanType").selectedIndex != gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/ScanType/value").text) {
            gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/ScanType/value").text = el("scanType").selectedIndex;
            gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/ScanType/flag").text = 7;
        }

        //关键帧间隔
        if (gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/GOP/flag").text != 0 && el("gop").value != gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/GOP/value").text) {
            gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/GOP/value").text = el("gop").value;
            gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/GOP/flag").text = 7;
        }
        //B帧个数
        if (gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/BFrame/flag").text != 0 && el("bFrame").value != gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/BFrame/value").text) {
            gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/BFrame/value").text = el("bFrame").value;
            gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/BFrame/flag").text = 7;
        }

        //IDR帧间隔
        if (gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/IDRs/flag").text != 0 && el("idrs").value != gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/IDRs/value").text) {
            gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/IDRs/value").text = el("idrs").value;
            gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/IDRs/flag").text = 7;
        }

        //参考帧数
        if (gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/Refs/flag").text != 0 && el("refs").value != gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/Refs/value").text) {
            gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/Refs/value").text = el("refs").value;
            gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/Refs/flag").text = 7;
        }

        //帧速率 默认,无需修改
        if (gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/FrameSpeed/flag").text != 0 && el("fameSpeed").value != gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/FrameSpeed/value").text) {
            gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/FrameSpeed/value").text = el("fameSpeed").value;
            gVideoProfileDoc.selectSingleNode("MPlexConfig/Video/VideoParam/FrameSpeed/flag").text = 7;
        }

    }
}

//设置文件选项的参数
function setFileProfile() {
    modifyFileProfileDoc();
    if (gFileProfileDoc.xml != "") {
        var fileProfileXml = gMplexConfig.SetFileParam(gFileProfileDoc.xml); //返回设置后的文件选项参数xml字串
        renderFileProfile(fileProfileXml);
    }
}

//设置视频选项的参数
function setVideoProfile() {
    modifyVideoProfileDoc();
    if (gVideoProfileDoc.xml != "") {
        var videoProfileXml = gMplexConfig.SetVideoParam(gVideoProfileDoc.xml);
        renderVideoProfile(videoProfileXml);
    }
}

//设置音频选项的参数
function setAudioProfile() {
    modifyAudioProfileDoc();
    if (gAudioProfileDoc.xml != "") {
        var audioProfileXml = gMplexConfig.SetAudioParam(gAudioProfileDoc.xml);
        renderAudioProfile(audioProfileXml);
    }
}

//清空文件选项的参数
function cleanUpFileProfile() {
    el("muxBitRate").value = "";
    el("muxPMTID").value = "";

    gFileProfileDoc = new jetsennet.XmlDoc();
}

//清空视频选项的参数
function cleanUpVideoProfile() {
    //扫描方式、颜色空间未处理
    el("videoBitRate").value = "";
    el('autoQuality').checked = false;
    el("speedorQuality").value = 50;
    el('chkVidVarBitrate').checked = false;
    el('videoMaxBitRate').value = "";
    el('chkVid2Pass').checked = false;
    el("gop").value = "";
    el("bFrame").value = "";
    el("idrs").value = "";
    el("refs").value = "";
    el("fameSpeed").value = "";
    el("frameSize").value = "";

    gVideoProfileDoc = new jetsennet.XmlDoc();
}

//清空音频选项的参数
function cleanUpAudioProfile() {
    el("audioBitRate").value = "";
    el('audVarBitrate').checked = false;
    el("channels").value = "";

    //采样频率未处理

    gAudioProfileDoc = new jetsennet.XmlDoc();
}

//清空下拉选框
function cleanUpSelection(elementId) {
    var obj = el(elementId);
    var count = obj.options.length;
    for (var i = 0; i < count; i++) {
        obj.options.remove(0);
    }
}

////添加模板
//function addTemplate(){
//	
//	if (el('templateList').rows.length>1) {
//		alert("只能添加一个");
//		return;
//	}
//	
//	setFileProfile();
//	setAudioProfile();
//	setVideoProfile();
//	var templateInfoXml = gMplexConfig.AddTemplate();
//	//错误判断
//	if (templateInfoXml.substring(0,8) == "errormsg") {
//		var errString = templateInfoXml.substring(9);
//		alert(errString);
//		return;
//	}
//	
//	var templateInfoDoc = new jetsennet.XmlDoc();
//	templateInfoDoc.loadXML(templateInfoXml);
//	var fileInfo = templateInfoDoc.selectSingleNode("MPlexConfig/File/info").text;
//	var videoInfo = templateInfoDoc.selectSingleNode("MPlexConfig/Video/info").text;
//	var audioInfo = templateInfoDoc.selectSingleNode("MPlexConfig/Audio/info").text;
//	
//	var tbl = el('templateList');
//    var row = tbl.insertRow(-1); //-1表示最后的一个位置
//
//    cell = row.insertCell(-1);
//    cell.innerHTML = fileInfo+"</br>"+videoInfo+"</br>"+audioInfo;
//    
//}
//
////删除所有模板列表
//function deleteAllTemplate() {
//	var templateTable = el('templateList');
//	var len = templateTable.rows.length;
//    for(var i = len - 1; i > 0; i--) {
//    	templateTable.deleteRow(i);
//    }
//	return templateTable;
//}
//

//获取模板信息
function getTemplate() {
    var templateInfoXml = gMplexConfig.GetTemplate();
    //错误判断
    if (templateInfoXml.substring(0, 8) == "errormsg") {
        var errString = templateInfoXml.substring(9);
        alert(errString);
        return;
    }

    var templateInfo = "";
    var templateInfoDoc = new jetsennet.XmlDoc();
    templateInfoDoc.loadXML(templateInfoXml);
    var formatNodes = templateInfoDoc.selectNodes("MPlexConfig/Formats/Format");
    for (var i = 0; i < formatNodes.length; i++) {
        var fileInfo = formatNodes[i].selectSingleNode("File/info").text;
        var videoInfo = formatNodes[i].selectSingleNode("Video/info").text;
        var audioInfo = formatNodes[i].selectSingleNode("Audio/info").text;
        templateInfo += fileInfo + "</br>" + videoInfo + "</br>" + audioInfo;
    }

    el("templateInfo").innerHTML = templateInfo;
}

//保存模板信息
function saveTemplate() {
    setFileProfile();
    setAudioProfile();
    setVideoProfile();
    var templateInfoXml = gMplexConfig.AddTemplate();
    //错误判断
    if (templateInfoXml.substring(0, 8) == "errormsg") {
        var errString = templateInfoXml.substring(9);
        alert(errString);
        return;
    }

    var templateInfoDoc = new jetsennet.XmlDoc();
    templateInfoDoc.loadXML(templateInfoXml);
    var fileInfo = templateInfoDoc.selectSingleNode("MPlexConfig/File/info").text;
    var videoInfo = templateInfoDoc.selectSingleNode("MPlexConfig/Video/info").text;
    var audioInfo = templateInfoDoc.selectSingleNode("MPlexConfig/Audio/info").text;

    el("templateInfo").innerHTML = fileInfo + "</br>" + videoInfo + "</br>" + audioInfo;

    gTemplateData = mplexconfig.GetTemplateBase64String();
}







