//Xiaomin_Lee 2008-5-23 16:03:30
jetsennet.registerNamespace("jetsennet.jdma.Model");
//jetsennet.addLoadedUri(jetsennet.getloadUri("#model.ServiceInfo"));
jetsennet.require("modelbase");

jetsennet.jdma.Model.ServiceInfo = function ()
{
    this.__typeName = "jetsennet.jdma.Model.ServiceInfo";
    this.__modelName = "Service";
	//ServiceName
	this.ServiceName = "";
	//ServiceDesc
	this.ServiceDesc = "";
	//ServiceMethods
	this.ServiceMethods = [];

}
jetsennet.jdma.Model.ServiceInfo.prototype = new jetsennet.AbstractModel();

jetsennet.jdma.Model.ServiceInfo.prototype.load = function(/*string*/serviceId,/*string*/url,/*bool*/refresh)
{
	var _owner = this;
	var _ws = new jetsennet.Service(DMA_SYSTEM_SERVICE);
	_ws.displayLoading = false;
	_ws.async = false;
	_ws.dataType = "json";
	_ws.cacheLevel = 1;
	_ws.oncallback = function(ret)
	{	   
	   var resultXml = new jetsennet.XmlDoc();
	   resultXml.async = false;
	   resultXml.loadXML(ret.resultVal);
	   _owner.fromXml(resultXml.documentElement);
	   if(_owner.onloaded){
	       _owner.onloaded(ret.resultVal);
	   }
	}	
	_ws.onerror = function(ex){ jetsennet.error(ex);};	
	_ws.call("dmaParseService",[serviceId,url,refresh]);
}


jetsennet.jdma.Model.ServiceMethodInfo = function()
{
    this.__typeName = "jetsennet.jdma.Model.ServiceMethodInfo";
    this.__modelName = "ServiceMethod";
	//MethodName
	this.MethodName = "";
	//MethodDesc
	this.MethodDesc = "";
	//MethodInput
	this.MethodInput = "";
	//MethodOutput
	this.MethodOutput = "";
	//MethodFault
	this.MethodFault = "";
	
	this.MethodParams = [];
	this.HeadParams = [];
}
jetsennet.jdma.Model.ServiceMethodInfo.prototype = new jetsennet.AbstractModel();

jetsennet.jdma.Model.MethodParamInfo = function()
{
    this.__typeName = "jetsennet.jdma.Model.MethodParamInfo";
    this.__modelName = "MethodParam";
	//ParamName
	this.ParamName = "";
	//ParamType
	this.ParamType = "";
	//IsComplexParam
	this.IsComplexParam = "";
	
}
jetsennet.jdma.Model.MethodParamInfo.prototype = new jetsennet.AbstractModel();

jetsennet.jdma.Model.HeadParamInfo = function()
{
    this.__typeName = "jetsennet.jdma.Model.HeadParamInfo";
    this.__modelName = "HeadParam";
	//HeadName
	this.HeadName = "";	
	//HeadFeilds
	this.HeadFields = [];
	
	
}
jetsennet.jdma.Model.HeadParamInfo.prototype = new jetsennet.AbstractModel();


jetsennet.jdma.Model.HeadFieldInfo = function()
{
    this.__typeName = "jetsennet.jdma.Model.HeadFieldInfo";
    this.__modelName = "HeadField";
	//ParamName
	this.ParamName = "";
	//ParamType
	this.ParamType = "";
	//IsComplexParam
	this.IsComplexParam = "";
	
}
jetsennet.jdma.Model.HeadFieldInfo.prototype = new jetsennet.AbstractModel();
