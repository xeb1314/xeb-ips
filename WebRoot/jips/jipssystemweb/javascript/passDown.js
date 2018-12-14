jetsennet.require([ "gridlist", "pagebar","pageframe", "window", "bootstrap/moment", "bootstrap/daterangepicker", "crud","datepicker"]);
jetsennet.importCss("bootstrap/daterangepicker-bs3");

var gCurDate = new Date();
var gLastWeekDate;

var tdColor={l4:'#FF0000',l3:'#FFDA44',l2:'#92FF77',l1:'#44DAFF'};


var gErrorlogColumns = [ { fieldName: "CMOBJ_ID", width: 30, align: "center", isCheck: 1, checkName: "chkLog"},
                         { fieldName: "NAME", sortField: "NAME", width:"100%", align: "center", name: "文件名"},
                        { fieldName: "CREATE_TIME", sortField: "CREATE_TIME", width:200, align: "center", name: "入库时间"},
                        { fieldName: "STYPE", sortField: "STYPE", width:200, align: "center", name: "STYPE"},
                        { fieldName: "PASSWORD", sortField: "PASSWORD", width:200, align: "center", name: "PASSWORD"},
                        { fieldName: "IISCRACTED", sortField: "IISCRACTED", width:200, align: "center", name: "IISCRACTED"},
                        { fieldName: "CMOBJ_ID,NAME,BEGINTIME,STYPE,USERNAME,PASSWORD,IISCRACTED,CVALID,LINENO1,LINENO2,FILEID,FILELEN,FTPIP,FROM_IP,TO_IP,SFROMIP,STOIP,SOURE_PORT,DEST_PORT," +
                        		"LINENO3,LINENO4,GRADE0,GRADE1,PUNIT,XTYPE,DATAFROMSYS,PARTNO,DOWNLOADFILENAME,DATASERVERIP,FROMUSER", width:45, align: "center", name: "详情", format: function(val,vals){
                        	return '<span onclick="viewPassDownDetail(\''+vals+'\')"><img src="images/cel_info.png"/></span>';
                        }}
                        ];
var gCrud = $.extend(new jetsennet.Crud("divList", gErrorlogColumns, "logPageBar", "ORDER BY t.CREATE_TIME DESC"), {
    dao : IPSDAO,
    tableName : "CM802_OBJECT",
    resultFields : "t.*",
    keyId : "CMOBJ_ID",
    name : "口令下载",
    checkId : "chkLog",
    className : "jetsennet.ips.schema.Cm802Object",
});
gCrud.grid.ondoubleclick = null;

/**
 * 页面初始化
 */
function pageInit() {
	if(true){
		var color = "red";
	}
	//alert(color);
//	alert(Array.isArray([]));
	var color = ["red","green","blue"];
	/*alert(color.unshift("1"));
	alert(color);*/
	/*
	 jQuery("#divPageFrame").pageFrame({ showSplit :false,splitType: 1,layout: [130, {splitType: 1, layout: [45, "auto"]}, 35]}).sizeBind(window);
	 jQuery("#txtStartTime").pickDate();
 	 jQuery("#txtEndTime").pickDate();
	 gLastWeekDate = new Date(gCurDate.getTime() - 6 * 24 * 3600 * 1000);
     el('txtStartTime').value = gLastWeekDate.toDateString();
     el('txtEndTime').value = gCurDate.toDateString();
     gCrud.search();
     var num = 0;
     stop : for(var i=0;i<10;i++){
    	 for(var j=0;j<10;j++){
    		 if(i== 5 && j==5){
    			 break stop;
    		 }
    		 num++;
    	 }
     }*/
//     alert(num);
     var num = [0,1,15,10,5];
// 	alert(num.sort(compare2));
     var date = new Date();
//     alert(date.getTime());
     /*var string = "12322sssedfre,tp34rqewef43";
     var i,
     	pattern = null;
     for(i=0;i<10;i++){
    	 pattern = /322s/ig;
         alert(pattern.test(string));
         alert("2-"+pattern.test(string));
     }
     for(i=0;i<10;i++){
    	 pattern = new RegExp("322s","gi");
    	 alert("-"+pattern.test(string));
    	 alert("2-"+pattern.test(string));
     }*/
      
     /*sum1(10,10);
     sum(10,10);*/
     var person1 = new Person("x",20,"engineer");
     var person2 = new Person("e",26,"Doctor");
     person1.friends.push("Van");
     //alert(person1.syaName()+"===="+person2.syaName());//true  both of undefined
     //alert(person1.friends+"-"+person2.friends);
//     test();
     
     testExtends();
};


/**
 * 测试js中的继承
 */
function testExtends(){
	
	//工厂模式
	/*var car1 = new createFactory("杰德","1.8L");
	var car2 = new createFactory("思域","2.0T");
	alert(car1.run()+"========"+car2.run());*/
	
	//构造函数的测试
	/*var xeb = new Person("xeb","20","jmtc");
	var jojy = new Person("jojy","23","Flowers");*/
	
	//原型模式
	var car1 = new Car(); 
	var car2 = new Car();
	alert(car1.run()+"======"+car2.run());
	
}

/**
 * 原型模式 所有实例共享一个对象
 * @returns
 */
function Car(){
};
Car.prototype.name = "杰德";
Car.prototype.run = function(){
	return this.name;
};


/**
 * 测试构造函数的继承
 * @param name
 * @param age
 * @param job
 * @returns
 */
function Person(name,age,job){
	this.name = name;
	this.age = age;
	this.job = job;
	this.friends = ["a","b"];
	this.sayName = function(){
		return this.name;
	};
}

/**
 * 创建工厂模式  解决了 多个相似对象的问题，但是无法识别对象类型，无法通过instanceof检测对象类型
 * @param car
 * @param type
 * @param mutch
 */
function createFactory(car,type){
	var obj = new Object();
		obj.car = car;
		obj.type = type;
		obj.run = function(){
			return this.car;
		};
		return obj;
}


var a,
	b;
function sum1(w,q){
	return sum.apply(this,arguments);
}
function sum(num1,num2){
	a= this;
	return num1+num2;
	
}

/**
 *测试原型对象共享的问题
 * @param name
 * @param age
 * @param job
 * @returns
 */


/*Person.prototype = {
	constructor : Person,
	syaName : function(){
		this.name;
	}
};*/

/**
 * 父类构造函数
 * @param name
 * @returns
 */
function SuperType(name){
	this.name = name;
	this.color = ["red","green"];
}

//父类方法
SuperType.prototype.syaName = function(){
	alert(this.name);
};

/**
 * 子类构造函数
 * @param name
 * @param age
 * @returns
 */
function SubType(name,age){
	SuperType.call(this,name);
	this.age = age;
}

/**
 * 接受参数：子类型构造器和超类型构造器
 * 1.创建一个超类型原型副本。
 * 2.为创建的新对象添加构造函数。
 * 3.子类型的原型指向新对象。
 */
function inheritPrototype(SubType,SuperType){
	var newSuper = object(SuperType.prototype);
	newSuper.constructor = SubType;
	SubType.prototype = newSuper;
}

SubType.prototype.sayAge = function(){
	alert(this.age);
};

function test(){
	/*inheritPrototype(SubType,SuperType);
	var a = new SubType("xeb","20");
	a.sayName();*/
//	alert(createFun());
	/*function Person(name,age,job){
		this.name = name;
		this.age = age;
		this.job = job;
	}
	Person.prototype = {
	       constructor : Person,
//	       likew : "www",
	       sayName : function(){
	           alert(this.name);    
		   }
		};
	var friend = new Person("a",20,"Engineer");
	friend.sayName();*/
	
/*	function SuperType(name){
		this.name = name;
		this.colors = ["red","green","blue"];
	}
		SuperType.prototype.sayName = function(){
			alert(this.name);
		};
	function SubType(name,age){
		SuperType.call(this,name);
		this.age = age;
	}
		SubType.prototype = new SuperType();
//		SubType.prototype.constructor = SubType;
		SubType.prototype.sayAge = function(){
			alert(this.age);
		};
		var instance1 = new SubType("xeb",20);
		instance1.colors.push("yellow");
		instance1.sayAge();
		instance1.sayName();
		instance1.colors;
		var instance2 = new SubType("admin",22);
		instance2.sayAge();
		instance2.sayName();
		alert(instance2.colors);
		*/
//	alert(b()());
//	alert(createFun());
}
/*function Person(){}
Person.prototype.name = "Nicholas";
Person.prototype.age = 20;
Person.prtotype.job = "Engineer";
Person.prototype.sayName = function(){
	alert(this.name);
};*/
/*var person1 = new Person();
person1.sayName();//Nicholas
var person2 = new Person();
person2.syaName();//Nicholas
*/

function object(proto){
	function F(){};
	F.prototype = proto;
	return new F();
}

function createFun(){
	var array = new Array();
	for(var i=0;i<10;i++){
		array[i] = function(){
			/*return function(){
				return num;
			};*/
			return i;
		}();
	}
	return array;
};

function b(){
	var array = new Array();
	return function(){
		for(var i=0;i<10;i++){
			array.push(i);
		}
		return array;
	};
};
/**
 * 
 * 查询列表
 */
function searchlog() {
    var conditions = [];
    
    if (el("txtStartTime").value != '') {
    	conditions.push(["CREATE_TIME", el("txtStartTime").value + " 00:00:00", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.ThanEqual, jetsennet.SqlParamType.DateTime]);						
    }
    if (el("txtEndTime").value != '') {
    	conditions.push(["CREATE_TIME", el("txtEndTime").value + " 23:59:59", jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.LessEqual, jetsennet.SqlParamType.DateTime]);						
    }
    if (el("txtKeyWord").value != '') {
    	conditions.push(["NAME", el("txtKeyWord").value , jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Like]);						
    }
    gCrud.search(conditions);
}


function viewPassDownDetail(vals)
{
	 var values = vals.split(",");
	
	el("txtName").value=values[1];
	el("txtBEGINTIME").value=values[2];
	el("txtSTYPE").value=values[3];
	el("txtUSERNAME").value=values[4];
	el("txtPASSWORD").value=values[5];
	el("txtIISCRACTED").value=values[6];
	el("txtCVALID").value=values[7];
	el("txtLINENO1").value=values[8];
	el("txtLINENO2").value=values[9];
	el("txtFILEID").value=values[10];
	el("txtFILELEN").value=values[11];
	el("txtFTPIP").value=values[12];
	el("txtFROM_IP").value=values[13];
	el("txtTO_IP").value=values[14];
	el("txtSFROMIP").value=values[15];
	el("txtSTOIP").value=values[16];
	el("txtSOURE_PORT").value=values[17];
	el("txtDEST_PORT").value=values[18];
	el("txtLINENO3").value=values[19];
	el("txtSLINENO4").value=values[20];
	el("txtGRADE0").value=values[21];
	el("txtGRADE1").value=values[22];
	el("txtPUNIT").value=values[23];
	el("txtXTYPE").value=values[24];
	el("txtDATAFROMSYS").value=values[25];
	el("txtPARTNO").value=values[26];
	el("txtDOWNLOADFILENAME").value=values[27];
	el("txtDATASERVERIP").value=values[28];
	el("txtFROMUSER").value=values[29];
	
	var dialog = new jetsennet.ui.Window("detail-window");
    jQuery.extend(dialog, { submitBox: false, cancelBox: false, maximizeBox: false, showScroll: false, windowStyle: 1, minimizeBox: false, title: "口令字详情" });
    dialog.size = { width: 1000, height: 0 };
    dialog.controls = ["divPassDown"];
    dialog.showDialog();
}
