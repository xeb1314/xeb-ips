	
function getPos(obj){  
	obj.focus();   
　　var workRange=document.selection.createRange();
　　obj.select();   
　　var allRange=document.selection.createRange();   
　  workRange.setEndPoint("StartToStart",allRange);   
　　var len=workRange.text.length;   
　　workRange.collapse(false);   
　　workRange.select();   
　　return len;   
}   
    
    
function setCursor(obj,num){
　　range=obj.createTextRange();    
　　range.collapse(true);    
　　range.moveStart('character',num);    
　　range.select();   
}   
    
function keyDownEvent(obj){   
    code=event.keyCode;   
    if(!((code>=48&&code<=57)||(code>=96&&code<=105)||code==190||code==110||code==13||code==9||code==39||code==8||code==46||code==99||code==37))   
        event.returnValue=false;   
    if(code==13)   
        event.keyCode=9;   
    if(code==110||code==190)   
        if(obj.value)   
            event.keyCode=9;   
        else   
            event.returnValue=false;   
}   

   function keyUpEvent(obj0,obj1,obj2){   
    if (obj1.value > 255)   
    {   
        jetsennet.warn("填写范围必须在 0 - 255间");   
        obj1.value = obj1.value.substring(0, obj1.value.length - 1);   
        return;   
        }   
    code=event.keyCode; 
       
    if(obj1.value.length>=3&&code!=37&&code!=39&&code!=16&&code!=9&&code!=13)   
        obj2.focus();   
       
    if(code == 32)   
        obj2.focus();   
    
    if(code == 8 && obj1.value.length == 0)   
    {   
        obj0.focus();   
        setCursor(obj0,obj0.value.length);   
    }   
    
    if (code == 37 && (getPos(obj1) == 0))   
    {   
        obj0.focus();   
        setCursor(obj0,obj0.value.length);   
    }   
    if (code == 39 && (getPos(obj1) == obj1.value.length))   
    {   
        obj2.focus();   
    }   
}   
function keyUpEventForIp4(obj0,obj){   
    if (obj.value > 255)   
    {   
    	jetsennet.warn("填写范围必须在 0 - 255间");   
        obj.value = obj.value.substring(0, obj.value.length - 1);   
        return;   
    }   
    if(code == 8 && obj.value.length == 0)   
    {   
        obj0.focus();   
        setCursor(obj0,obj0.value.length);   
    }   
    if (code == 37 && (getPos(obj) == 0))   
    {   
        obj0.focus();   
        setCursor(obj0,obj0.value.length);   
    }   
    
};   

/**
 * 判断IP输入框是否为空 和 是否是格式正确的IP地址
 */ 
function ipIsEmpty(array){
   /* for(var i=0; i<array.length; i++){
    	var value = el(array[i]).value;
        	if(value){
        		ip += value+".";
            }else{
            	ip += 0+".";
            };
    }*/
	var value1 = el(array[0]).value;
	var value2 = el(array[1]).value;
	var value3 = el(array[2]).value;
	var value4 = el(array[3]).value;
	if(value1 && value2 && value3 && value4){
		if(value1 == "0"){
			jetsennet.warn("0不是有效项。请制定一个介于1和223间的值。");
			return;
		};
		return value1+"."+value2+"."+value3+"."+value4;
	}else if(value1 == "" && value2 == "" && value3 == "" && value4 == ""){
		return "";
	}else if(value1 != "" && (value2 || value3 || value4)){
		var ip = "";
		if(value1 == "0"){
			jetsennet.warn("0不是有效项。请指定一个介于1和223间的值。");
			return;
		}
		if(value2){
			ip += value1+"."+value2+".";
		}else{
			ip += value1+"."+0+".";
		}
		if(value3){
			ip += value3+".";
		}else{
			ip += 0+".";
		}
		if(value4){
			ip += value4;
		}else{
			ip += 0;
		}
		return ip;
	}else if(value1 != "" && value2 == ""&& value3== "" && value4== ""){
		jetsennet.warn("IP地址无效，请输入一个有效的IP地址。");
		return;
	}else if(value1 == "" && (value2 || value3 || value4)){
		jetsennet.warn("IP地址无效，请输入一个有效的IP地址。");
		return;
	};
};


