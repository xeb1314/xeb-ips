/* ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
 * 北京捷成世纪科技股份有限公司
 * 日 期：2011-12-16 下午15:50:00
 * 文 件：SUMPInstantiation.java
 * 作 者：吴宇新
 * 版 本：1.0.0
 * ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
 */
/**
 * 验证工具
 * @author <a href="mailto:wuyuxin@jetsen.cn">吴宇新 </a>
 * @version 1.0.0
 * 
 * 修订日期            修订人            描述
 * 2011-12-16       吴宇新            创建
 */

/**  
*textarea文本框输入字数检测  
*textareaId：textarea的dom标识  
*maxLen：要求的最大字节长度  
*示例：<Textarea id="deviceDesc"     
*onkeydown="chkTextareaLen(this.id,'counterDevic',5);"    
*onkeyup="chkTextareaLen(this.id,'counterDevic',5);"></textarea>
*/  
function chkTextareaLen(textareaId,counterId,maxLen) {   
	try{   
		var textareaValue = document.getElementById(textareaId).value;   
		var curLen = 0,substrLen = 0;   
		for (var i=0; i<textareaValue.length; i++) {     
			if (textareaValue.charCodeAt(i)>127 || textareaValue.charCodeAt(i)==94) {     
				//此范围内为字符（两个字节）
				curLen += 2;     
			} else {   
				curLen ++;     
			}    
			if(curLen > maxLen){   
				substrLen = i;   
				break;   
			}   
		}   
		if(curLen > maxLen) {   
			if(substrLen == 0) substrLen = maxLen;   
			document.getElementById(textareaId).value = textareaValue.substring(0,substrLen);   
			message("<img src='images/warn.png' align='middle' width='40px' hidth='40px'/>","输入过长");    
		}else{   
			document.getElementById(counterId).innerHTML = maxLen - curLen;   
		}   
	}catch(e){}   
}
/**
 * 验证特殊字符
 * @return
 */
function vilidataCode(){
	if ((event.keyCode > 32 && event.keyCode < 48) || (event.keyCode > 57 && event.keyCode < 65) || (event.keyCode > 90 && event.keyCode < 97)) event.returnValue = false;
}
/**
 * 验证特殊字符
 * 输入的字符不能包含%?<>
 * 2011-12-20
 * @return
 */
function checkInputCharCode(object){
	var strInput = object.value;
	var zz=/^[^&%?<>@]*$/;
	if(zz.test(strInput)==false && strInput!=""){
		object.value = "";
		message("<img src='images/warn.png' width='40px' hight='40px' align='middle'/>","输入的字符不能包含&%?<>@");
		return;
	}
}
function d_out(textareaId,maxLen,vaildate){
	try{   
	var textareaValue = document.getElementById(textareaId).value;  
	var textareaName = document.getElementById(textareaId).name;
	textareaName = "<font color='#f47005'>\""+textareaName+"(字段)\"</font>"
	var curLen = getBytesLength(textareaValue); 
	if(curLen > maxLen) {  
		//alert(curLen);
		message("<img src='images/warn.png' align='middle' width='40px' hight='40px'/>","您输入"+textareaName+" 内容超出规定范围,长度不能超过"+maxLen+"个字符");
		return false;
	}else{
		if(vaildate==""){
			return true;
		}else{
			if(vaildate=="port"){
				//验证端口
				var v = /^[0-9]*$/;
				if(textareaValue =="" || (v.test(textareaValue) && textareaValue>0 && textareaValue<65536)){
					return true;
				}else{
					message("<img src='images/warn.png' align='middle' width='40px' hight='40px'/>","您输入的"+textareaName+"有误,必须在1-65535之间");
					return false;
				}
			}else if(vaildate=='ip'){
				//验证IP
				var v=/^(2[0-4]\d|25[0-5]|[01]?\d\d?)\.(2[0-4]\d|25[0-5]|[01]?\d\d?)\.(2[0-4]\d|25[0-5]|[01]?\d\d?)\.(2[0-4]\d|25[0-5]|[01]?\d\d?)$/;
				if(v.test(textareaValue)==false && textareaValue!=""){
					message("<img height='40px' width='40px' src='images/warn.png' align='middle'/>","您输入的"+textareaName+"有误，每段IP应在0-255之间");
					return false;
				}else{
					return true;
				}
			}else if(vaildate=='mobile'){
				//验证手机
				var v = /^1[3|4|5|8][0-9]\d{8}$/;
				if(v.test(textareaValue)==false && textareaValue!=""){
					message("<img height='40px' width='40px' src='images/warn.png' align='middle'/>","您输入的"+textareaName+"有误");	
					return false;
				}else{
					return true;
				}
			}else if(vaildate=='phone'){
				//验证办公电话
				var v = /(^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$)/;
				if(v.test(textareaValue)==false && textareaValue!=""){
					message("<img height='40px' width='40px' src='images/warn.png' align='middle'/>","您输入的"+textareaName+"有误");	
					return false
				}else{
					return true;
				}
			}else if(vaildate=='email'){
				//验证邮箱地址
				//var v = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,4}$/;
				var v = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
				if(v.test(textareaValue)==false && textareaValue!=""){
					message("<img height='40px' width='40px' src='images/warn.png' align='middle'/>","您输入的"+textareaName+"有误");	
					return false;
				}else{
					return true;
				}
			}else if(vaildate=='url'){
				//验证URL
				var v = /^(http(s)?:\/\/)?([\w-]+\.)+[\w-]+(:\d+)?(\/[\w- .\/?%&=#]*)?$/i;
				if(v.test(textareaValue)==false && textareaValue!=""){
					message("<img height='40px' width='40px' src='images/warn.png' align='middle'/>","您输入的"+textareaName+"有误");	
					return false;
				}else{
					return true;
				}
			}else if(vaildate=='xml'){
				//验证标记语言
				var v = /^\<\w*\>.*\<\/\w*\>$/;
				if(v.test(textareaValue)==false && textareaValue!=""){
					message("<img height='40px' width='40px' src='images/warn.png' align='middle'/>","您输入的"+textareaName+"格式有误");	
					return false;
				}else{
					return true;
				}
			}else if(vaildate=='bykey'){
				//只能输入字母和数字 用于数据库主键存储
				var v=/^([A-Z]|[a-z]|\d)*$/;
				if(v.test(textareaValue)==false && textareaValue!=""){
					message("<img src='images/warn.png' align='middle' width='40px' hight='40px'/>","您输入的"+textareaName+"内容格式有误,必须为"+document.getElementById(textareaId).title);
					return false;
				}else {
					return true;
				}
			}else if(vaildate=='number'){
				//只能输入字母和数字 用于数据库主键存储
				var v=/^[1-9][0-9]*$/;
				if(v.test(textareaValue)==false && textareaValue!=""){
					message("<img src='images/warn.png' align='middle' width='40px' hight='40px'/>","您输入的"+textareaName+"内容格式有误,必须为"+document.getElementById(textareaId).title);
					return false;
				}else {
					return true;
				}
			}
			else{
				var v=vaildate;
				if(v.test(textareaValue)==false && textareaValue!=""){
					message("<img src='images/warn.png' align='middle' width='40px' hight='40px'/>","您输入的"+textareaName+"内容格式有误，必须为"+document.getElementById(textareaId).title);
					return false;
				}else{
					return true;
				}
			}	
		}
	}   
	}catch(e){
		return false;
	}
}
function validateIP(ipstr) 
{
    var ipReg = new RegExp("^((25[0-5])|(2[0-4]\\d)|(1?\\d?\\d))\\.((25[0-5])|(2[0-4]\\d)|(1?\\d?\\d))\\.((25[0-5])|(2[0-4]\\d)|(1?\\d?\\d))\\.((25[0-5])|(2[0-4]\\d)|(1?\\d?\\d))$","g");
    return ipReg.test(ipstr);
}
/**
 * 获取字符的字节数
 * @param str
 * @return
 */
function getBytesLength(str){
	var len = 0; 
	for(var i=0;i<str.length;i++){ 
	    var iCode = str.charCodeAt(i);
	    if((iCode>=0 && iCode<=255)||(iCode>=0xff61 && iCode<=0xff9f)){
	        len += 1;
	    }else{
	        len += 3;
	    }
	}
	return len;
}



//显示剩余文字数
function showRemindWord(objDiv,maxNum) {
	el("remindWord").innerHTML = parseInt((parseInt(maxNum) - parseInt(getBytesCount(objDiv.value))) / 2);
	if (parseInt(maxNum) < parseInt(getBytesCount(objDiv.value))) {
		el("remindWord").style.color = "red";
		el("remindWord").innerHTML = 0;
	} else {
		el("remindWord").style.color = "black";
	}
}

//得到字符串字节数
function getBytesCount(str) 
{ 
	var bytesCount = 0; 
	if (str != null) 
	{ 
		for (var i = 0; i < str.length; i++) 
		{ 
			var c = str.charAt(i); 
			if (/^[\u0000-\u00ff]$/.test(c)) 
			{ 
				bytesCount += 1; 
			} 
			else 
			{ 
				bytesCount += 2; 
			} 
		} 
	} 
	return bytesCount; 
}
