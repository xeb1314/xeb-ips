//=============================================================================
// lixiaomin 2009-09-15
// 2012-04-18 修改结果验证方式，改onvalideerror为onresultvalidate                           
//=============================================================================
jetsennet.registerNamespace("jetsennet.Service");
jetsennet.addLoadedUri(jetsennet.getloadUri("webservice"));

//=============================================================================
// jetsennet.Service 
//=============================================================================
jetsennet.Service = function (/*url string*/wsdlurl) {
    this.__typeName = "jetsennet.Service";
    this.nameSpace = null;
    this.wsdl = wsdlurl ? wsdlurl : "";
    this.arguments = null;
    this.async = true;
    this.cacheLevel = 1; 		//0，1系统自动缓存参数，2 缓存结果(兼容原来的)
    this.expires = 60; 		    //cache second,depend cachelevel;无效
    this.methodName = null;
    this.operation = null;
    this.displayLoading = true;
    this.soapheader = null;         //没有使用
    this.soapHeaderReader = null;   //如果没有传soap头，此为soap头的读取方法
    this.soapArgumentsReader = null; //如果没有传参数，此为参数的读取方法
    this.oncallback = null;
    this.onerror = null;
    this.onbeforerequest = null;
    this.onbeforecallback = null;
    this.dataType = "xml";

    this.__loadControl = null;
    this.returnObject = { errorCode: 0, resultVal: "", errorString: "" };
};
//=============================================================================
// 调用服务
//=============================================================================
jetsennet.Service.prototype.call = function (methodName, arguments) {
    this.methodName = methodName;
    this.arguments = arguments;

    if (this.cacheLevel == 2) {
        var cacheData = jetsennet.ServiceCache.cache(this.wsdl, methodName, arguments);
        if (cacheData != null) {
            this.returnObject = cacheData;
            return this.returnResult();
        }
    }

    var owner = this;
    this.showLoading();

    var soapString = null;
    try {
        this.operation = jetsennet.WebServiceDescription.getOperation(this.wsdl, methodName);
        soapString = jetsennet.WebServiceDescription.getRequestSoap(this.operation, arguments,
            this.soapHeaderReader ? this.soapHeaderReader : jetsennet.application.soapHeaderReader,
            this.soapArgumentsReader);
    }
    catch (e) {
        return this.returnResult(e);
    }

    if (this.onbeforerequest) {
        this.onbeforerequest(soapString, this.operation.location, this.operation.soapAction);
    }

    // send soap
    jQuery.ajax(this.operation.location, {
        async: owner.async,
        success: function (result) {
            var xmlDoc = new jetsennet.XmlDoc();
            xmlDoc.loadXML(result);
            owner.processResult(xmlDoc);
        },
        dataType: "text", error: function (obj, ex) {
            if (typeof ex == "string") return owner.returnResult(ex);
            else return owner.processResult(ex);
        },
        headers: { "SOAPAction": '"' + this.operation.soapAction + '"', "Content-type": "text/xml;charset=utf-8", "DataType":this.dataType },
        type: "POST",
        data: soapString
    });
};
jetsennet.Service.prototype.returnResult = function (errorString) {
    this.hideLoading();

    if (this.onerror) {
        if (errorString != null) {
            this.onerror(errorString);
            return;
        }

        if (this.onresultvalidate && this.onresultvalidate(this.returnObject) === false) {
            return;
        }

        if (this.returnObject.errorCode != 0) {
            this.onerror(this.returnObject.errorString);
            return;
        }
    }

    var beforecallback = this.onbeforecallback ? this.onbeforecallback(this.returnObject) : true;

    if (typeof beforecallback == "boolean" && !beforecallback)
        return false;
    if (this.oncallback)
        this.oncallback(this.returnObject);
};
//=============================================================================
// 解析返回结果
//=============================================================================
jetsennet.Service.prototype.processResult = function (sXmlObject) {

    if (!sXmlObject || !sXmlObject.documentElement) {
        this.returnObject = { errorCode: -1, errorString: "服务未启动或已关闭!" };
    }
    else {
        var faultNode = sXmlObject.getElementsByTagName("faultstring")[0];
        if (faultNode) {
            this.returnObject = { errorCode: -1, errorString: this.methodName + jetsennet.xml.getText(faultNode) };
        }
        else {
            var resultNode = null;
            if (window.ActiveXObject !== undefined) {
                sXmlObject.setProperty("SelectionNamespaces", "xmlns:sp='" + this.operation.targetNamespace + "'");
                resultNode = jetsennet.xml.getFirstChild(sXmlObject.documentElement.selectSingleNode("//sp:" + this.operation.outMessage.name));
            }
            else {
                //sXmlObject.documentElement.setAttribute("xmlns:sp",this.operation.targetNamespace);
                //sXmlObject.loadXML(sXmlObject.documentElement.xml);			   
                //resultNode = jetsennet.xml.getFirstChild(sXmlObject.documentElement.selectSingleNode("//sp:"+this.methodName+"Response"));

                if (!IS_SAFARI) {
                    var nsReg = new RegExp("xmlns:([^\"\']+)=\"" + this.operation.targetNamespace + "\"", "i");
                    var nsMatch = nsReg.exec(sXmlObject.xml);
                    var nsPrefix = (nsMatch != null && !jetsennet.util.isNullOrEmpty(nsMatch[1])) ? (nsMatch[1] + ":") : "";
                    resultNode = jetsennet.xml.getFirstChild(sXmlObject.documentElement.getElementsByTagName(nsPrefix + this.operation.outMessage.name)[0]);
                }
                else {
                    resultNode = jetsennet.xml.getFirstChild(sXmlObject.documentElement.getElementsByTagName(this.operation.outMessage.name)[0]);
                }

            }

            jQuery.extend(this.returnObject, jetsennet.xml.deserialize(resultNode));
            this.returnObject.value = valueOf(resultNode, "text", "");

            if (!jetsennet.util.isNullOrEmpty(this.returnObject.resultVal)) {
                this.returnObject.resultVal = this.returnObject.resultVal.replace(/&#/img, "&amp;#");
            }
            else if (!jetsennet.util.isNullOrEmpty(this.returnObject.value)) {
                this.returnObject.value = this.returnObject.value.replace(/&#/img, "&amp;#");
            }
        }
    }
    if (this.cacheLevel == 2 && this.returnObject.errorCode == 0) {
        jetsennet.ServiceCache.cache(this.wsdl, this.methodName, this.arguments, this.returnObject);
    }
    else {
        jetsennet.ServiceCache.cache(this.wsdl, this.methodName, this.arguments, null);
    }
    return this.returnResult();
};
//=============================================================================
// 显示加载状态
//=============================================================================
jetsennet.Service.loadControlId = jetsennet.util.Guid.NewGuid().toString();
jetsennet.Service.prototype.hideLoading = function () {
    if (this.displayLoading && this.__loadControl)
        this.__loadControl.style.display = "none";
};
jetsennet.Service.prototype.showLoading = function () {
    if (this.displayLoading) {
        if (document.body) {
            if (!el(jetsennet.Service.loadControlId)) {
                jQuery("<div>", { id: jetsennet.Service.loadControlId }).appendTo("body").addClass("serviceLoading").html("loading...");
            }
            this.__loadControl = el(jetsennet.Service.loadControlId);
            this.__loadControl.style.display = "";
        }
    }
};
//=============================================================================
// WebService Cache
//=============================================================================
jetsennet.ServiceCache = {};
jetsennet.ServiceCache._elements = {};
jetsennet.ServiceCache.cache = function (wsdlUrl, sMethodName, sAruments, result) {
    var serviceCache = jetsennet.ServiceCache._elements[wsdlUrl + sMethodName];
    var cacheKey = sAruments ? "key-" + sAruments.toString() : "key-null";
    if (typeof result == 'undefined') {
        return serviceCache == null ? null : serviceCache[cacheKey];
    }
    else {
        serviceCache = serviceCache == null ? {} : serviceCache;
        serviceCache[cacheKey] = result == "" ? null : result;
        jetsennet.ServiceCache._elements[wsdlUrl + sMethodName] = serviceCache;
    }
};
jetsennet.ServiceCache.removeCache = function (wsdlUrl, sMethodName) {
    jetsennet.ServiceCache._elements[wsdlUrl + sMethodName] = null;
};
//兼容原来的方法,与上同
jetsennet.ServiceCache.removeCacheData = function (wsdlUrl, sMethodName) {
    jetsennet.ServiceCache._elements[wsdlUrl + sMethodName] = null;
};
jetsennet.ServiceCache.clear = function () {
    jetsennet.ServiceCache._elements = {};
};
//=============================================================================
// get webservoce method parameter default value
//=============================================================================
jetsennet.Service.getMethodDefaultParamValue = function (/*string*/paramType) {
    if (!paramType)
        return "";
    switch (paramType) {
        case "int":
        case "short":
        case "double":
        case "decimal":
        case "integer":
        case "long":
        case "float":
            return 0;
        case "datetime":
        case "date":
            return "2008-08-08";
        case "boolean":
        case "bool":
            return "false";
        default:
            return "";
    }
};
//=============================================================================
// call ServiceMethods
//=============================================================================
jetsennet.callService = function (serviceUrl, serviceMethod, argments, callback, error, options) {
    var ws = jQuery.extend(new jetsennet.Service(serviceUrl), options);
    ws.oncallback = callback;
    ws.onerror = error;
    ws.call(serviceMethod, argments);
};

//=============================================================================
jetsennet.ServiceCalls = function (wsdl, methodName) {
    this.serviceWsdl = wsdl;
    this.async = true;
    this.serviceCalls = [];
    this.methodName = methodName;
    this.displayLoading = true;
};
jetsennet.ServiceCalls.prototype.addCall = function (methodName, arguments, oncallback, onerror) {
    this.serviceCalls.push({ methodName: methodName, arguments: arguments, oncallback: oncallback, onerror: onerror });
};
jetsennet.ServiceCalls.prototype.commit = function () {
    var owner = this;
    var ws = new jetsennet.Service(this.serviceWsdl);
    ws.async = this.async;
    ws.displayLoading = this.displayLoading;
    ws.oncallback = function (ret) {
        var results = jetsennet.xml.deserialize(ret.resultVal, "Result");
        if (results) {
            for (var i = 0; i < owner.serviceCalls.length; i++) {
                if (owner.serviceCalls[i].oncallback && typeof owner.serviceCalls[i].oncallback == "function") {
                    var subObj = jetsennet.xml.deserialize(results[i]);
                    if (subObj.errorCode != "0") {
                        if (owner.serviceCalls[i].onerror && typeof owner.serviceCalls[i].onerror == "function")
                            owner.serviceCalls[i].onerror(subObj.errorString);
                    }
                    else
                        owner.serviceCalls[i].oncallback(subObj);
                }
            }
        }
    };
    ws.onerror = function (ex) {
        for (var i = 0; i < owner.serviceCalls.length; i++) {
            if (owner.serviceCalls[i].onerror && typeof owner.serviceCalls[i].onerror == "function")
                owner.serviceCalls[i].onerror(ex);
        }
    };

    var xmlStr = [];
    xmlStr.push("<ServiceCalls>");

    for (var i = 0; i < this.serviceCalls.length; i++) {
        xmlStr.push("<ServiceCall><MethodName>" + this.serviceCalls[i].methodName + "</MethodName>");
        xmlStr.push("<Arguments>");
        if (this.serviceCalls[i].arguments) {
            for (var j = 0; j < this.serviceCalls[i].arguments.length; j++) {
                xmlStr.push("<Argument>" + jetsennet.xml.xmlEscape(this.serviceCalls[i].arguments[j]) + "</Argument>");
            }
        }
        xmlStr.push("</Arguments>");
        xmlStr.push("</ServiceCall>");
    }

    xmlStr.push("</ServiceCalls>");
    ws.call(this.methodName, [xmlStr.join("")]);
};
//=============================================================================
// jetsennet.WebServiceDescription
//=============================================================================
jetsennet.WebServiceDescription = {};
jetsennet.WebServiceDescription.getServiceWsdl = function (wsdlAddress) {
    var wsdlXmlDoc = jetsennet.cache(wsdlAddress);
    if (wsdlXmlDoc == null) {
        jQuery.ajax(wsdlAddress, {
            async: false,
            success: function (result) {
                var xmlDoc = new jetsennet.XmlDoc();
                xmlDoc.loadXML(result);

                if (!xmlDoc.documentElement) {
                    wsdlXmlDoc = null;
                    return;
                }
                wsdlXmlDoc = xmlDoc;
                jetsennet.cache(wsdlAddress, xmlDoc);
            },
            dataType: "text", error: function (obj, ex) {
                throw "无效的服务1:" + wsdlAddress;
            }
        });
    }
    return wsdlXmlDoc;
};
jetsennet.WebServiceDescription.getOperation = function (wsdlAddress, methodName) {
    var operationInfo = jetsennet.cache(wsdlAddress + methodName);
    if (operationInfo == null) {
        var wsdlXmlDoc = jetsennet.WebServiceDescription.getServiceWsdl(wsdlAddress);
        if (wsdlXmlDoc == null)
            throw "无效的服务:" + wsdlAddress;

        var schemaNsPrefix = "";
        var soapNsPrefix = "";
        var location = "";
        var nameSpace = "";
        var wsdlNsPrefix = "";
        var strNsTable = "";
        var rootNode = wsdlXmlDoc.documentElement;

        for (var i = 0; i < rootNode.attributes.length; i++) {
            var oAtt = rootNode.attributes.item(i);
            if (oAtt.name.indexOf("xmlns:") == 0) {
                var attName = oAtt.name.substr(6);
                var attValue = oAtt.value;
                if ((schemaNsPrefix == "" && attValue.indexOf("XMLSchema") > 0) || oAtt.value == "http://www.w3.org/2001/XMLSchema") {
                    schemaNsPrefix = attName;
                }
                if (soapNsPrefix == "" && attName.lastIndexOf("soap") >= 0 && attName.lastIndexOf("soap") == attName.length - 4) {
                    soapNsPrefix = attName;
                }
                if (attName == "soap") {
                    soapNsPrefix = "soap";
                }
                if (attValue == "http://schemas.xmlsoap.org/wsdl/soap/") {
                    soapNsPrefix = attName;
                }
                if (attName == "wsdl") {
                    wsdlNsPrefix = "wsdl";
                }
                strNsTable += "xmlns:" + attName + "=\"" + attValue + "\" ";
            }
            else if (oAtt.name == "xmlns") {
                if (oAtt.value == "http://schemas.xmlsoap.org/wsdl/") {
                    wsdlNsPrefix = "mywsdl";
                    strNsTable += "mywsdl:" + oAtt.name + "=\"" + oAtt.value + "\" ";
                }
            }
        }
        var targetNamespace = rootNode.getAttribute("targetNamespace");

        if (window.ActiveXObject !== undefined)
            wsdlXmlDoc.setProperty("SelectionNamespaces", strNsTable);

        var portNodes = rootNode.selectNodes(wsdlNsPrefix + ":service/" + wsdlNsPrefix + ":port");
        var portNode = portNodes[0];
        var location = portNode.selectSingleNode(soapNsPrefix + ":address").getAttribute("location");

        var strBinding = jetsennet.WebServiceDescription.getAttributeValue(portNode, "binding", false);
        var bindNode = rootNode.selectSingleNode(wsdlNsPrefix + ":binding[@name='" + strBinding + "']");
        var strPortType = jetsennet.WebServiceDescription.getAttributeValue(bindNode, "type", false);

        //operation
        var operationNode = bindNode.selectSingleNode(wsdlNsPrefix + ":operation[@name='" + methodName + "']");
        if (operationNode == null)
            throw "找不到服务方法:" + methodName + "!";

        var actionNode = operationNode.selectSingleNode(soapNsPrefix + ":operation ");

        var operationInfo = { name: methodName, targetNamespace: targetNamespace, location: location };
        operationInfo.soapAction = actionNode == null ? jetsennet.util.trimEnd(targetNamespace, "/") + "/" + methodName : jetsennet.WebServiceDescription.getAttributeValue(actionNode, "soapAction", true);

        var portOperationNode = rootNode.selectSingleNode(wsdlNsPrefix + ":portType/" + wsdlNsPrefix + ":operation[@name='" + operationInfo.name + "']");

        //in
        operationInfo.inMessage = {};
        var inPortTypeNode = portOperationNode.selectSingleNode(wsdlNsPrefix + ":input");
        var strInPortTypeMessage = jetsennet.WebServiceDescription.getAttributeValue(inPortTypeNode, "message", false);
        operationInfo.inMessage.targetNamespace = jetsennet.WebServiceDescription.getAttributeValue(operationNode.selectSingleNode(wsdlNsPrefix + ":input/" + soapNsPrefix + ":body "), "namespace", true);
        operationInfo.inMessage.name = operationInfo.name;
        var bodyPartName = jetsennet.WebServiceDescription.getAttributeValue(operationNode.selectSingleNode(wsdlNsPrefix + ":input/" + soapNsPrefix + ":body"), "parts", false);

        var inMessageNodes = rootNode.selectNodes(wsdlNsPrefix + ":message[@name='" + strInPortTypeMessage + "']/" + wsdlNsPrefix + ":part");
        if (inMessageNodes.length > 0) {
            var strInMessageElement = null;

            if (!jetsennet.util.isNullOrEmpty(bodyPartName) && inMessageNodes.length > 1) {
                for (var p = 0; p < inMessageNodes.length; p++) {
                    if (bodyPartName == jetsennet.WebServiceDescription.getAttributeValue(inMessageNodes[p], "name", false)) {
                        strInMessageElement = jetsennet.WebServiceDescription.getAttributeValue(inMessageNodes[p], "element", false);
                        break;
                    }
                }
            }

            if (strInMessageElement == null) {
                strInMessageElement = jetsennet.WebServiceDescription.getAttributeValue(inMessageNodes[inMessageNodes.length - 1], "element", false);
            }
            operationInfo.inMessage.name = strInMessageElement;
            if (!jetsennet.util.isNullOrEmpty(strInMessageElement)) {
                var inMessageElement = rootNode.selectSingleNode("//" + schemaNsPrefix + ":element[@name='" + strInMessageElement + "']");
                if (inMessageElement == null) {
                    //由于可能引用了其它架构文档，解析暂不支持!;
                }
                else {
                    operationInfo.inMessage.name = jetsennet.WebServiceDescription.getAttributeValue(inMessageElement, "name");
                    operationInfo.inMessage.targetNamespace = jetsennet.WebServiceDescription.getAttributeValue(inMessageElement.parentNode, "targetNamespace", true);
                    operationInfo.inMessage.elementForm = "unqualified" != inMessageElement.parentNode.getAttribute("elementFormDefault");
                    operationInfo.inMessage.nodes = jetsennet.WebServiceDescription.parseElement(inMessageElement, schemaNsPrefix, operationInfo.inMessage.targetNamespace).nodes;
                }
            }
            else {
                operationInfo.inMessage.nodes = [];
                for (var i = 0; i < inMessageNodes.length; i++)
                    operationInfo.inMessage.nodes.push(jetsennet.WebServiceDescription.parseElement(inMessageNodes[i], schemaNsPrefix, operationInfo.inMessage.targetNamespace));
            }
        }

        //header
        var headerNodes = operationNode.selectNodes(wsdlNsPrefix + ":input/" + soapNsPrefix + ":header");
        operationInfo.inMessage.headers = [];

        for (var i = 0; i < headerNodes.length; i++) {
            var headerNode = headerNodes[i];
            if (headerNode != null) {
                var header = {};
                header.name = headerNode.getAttribute("part");
                header.targetNamespace = operationInfo.inMessage.targetNamespace;
                var headerPartName = headerNode.getAttribute("part");

                var strHeadMessage = jetsennet.WebServiceDescription.getAttributeValue(headerNode, "message", false);
                var headerParts = rootNode.selectNodes(wsdlNsPrefix + ":message[@name='" + strHeadMessage + "']/" + wsdlNsPrefix + ":part");

                if (headerParts.length > 0) {

                    var headNode = null;

                    if (!jetsennet.util.isNullOrEmpty(headerPartName)) {
                        for (var h = 0; h < headerParts.length; h++) {
                            if (headerPartName == jetsennet.WebServiceDescription.getAttributeValue(headerParts[h], "name", false)) {
                                headNode = headerParts[h];
                            }
                        }
                    }
                    if (headNode == null) {
                        headNode = headerParts[0];
                    }

                    if (headNode != null) {
                        var strHeaderElement = jetsennet.WebServiceDescription.getAttributeValue(headNode, "element", false);
                        if (!jetsennet.util.isNullOrEmpty(strHeaderElement)) {
                            var headerElement = rootNode.selectSingleNode("//" + schemaNsPrefix + ":element[@name='" + strHeaderElement + "']");
                            if (headerElement == null) {
                                //由于可能引用了其它架构文档，解析暂不支持!;
                            }
                            else {
                                var strHeaderType = jetsennet.WebServiceDescription.getAttributeValue(headerElement, "type", false);
                                var headerType = rootNode.selectSingleNode("//" + schemaNsPrefix + ":complexType[@name='" + strHeaderType + "']");
                                header.elementForm = "unqualified" != headerElement.parentNode.getAttribute("elementFormDefault");
                                header.targetNamespace = headerElement.parentNode.getAttribute("targetNamespace");
                                header.name = jetsennet.WebServiceDescription.getAttributeValue(headerElement, "name");

                                if(headerType){
                                	var hTargetNamespace = headerType.parentNode.getAttribute("targetNamespace");
                                	header.nodes = jetsennet.WebServiceDescription.parseComplexType(headerType, schemaNsPrefix, hTargetNamespace);
                                }
                            }
                        }
                        else {
                            header.Nodes = [];
                            for (var i = 0; i < headerParts.length; i++)
                                header.Nodes.Add(jetsennet.WebServiceDescription.parseElement(headerParts[i], schemaNsPrefix, header.targetNamespace));
                        }
                    }
                }
                operationInfo.inMessage.headers.push(header);
            }
        }

        //out
        operationInfo.outMessage = {};
        var outPortTypeNode = portOperationNode.selectSingleNode(wsdlNsPrefix + ":output");
        var strOutPortTypeMessage = jetsennet.WebServiceDescription.getAttributeValue(outPortTypeNode, "message", false);
        operationInfo.outMessage.targetNamespace = jetsennet.WebServiceDescription.getAttributeValue(operationNode.selectSingleNode(wsdlNsPrefix + ":output/" + soapNsPrefix + ":body "), "namespace", true);
        operationInfo.outMessage.name = operationInfo.name + "Response";

        var outMessageNodes = rootNode.selectNodes(wsdlNsPrefix + ":message[@name='" + strOutPortTypeMessage + "']/" + wsdlNsPrefix + ":part");
        if (outMessageNodes.length > 0) {
            var strOutMessageElement = jetsennet.WebServiceDescription.getAttributeValue(outMessageNodes[0], "element");
            if (!jetsennet.util.isNullOrEmpty(strOutMessageElement)) {
                var outMessageElement = rootNode.selectSingleNode("//" + schemaNsPrefix + ":element[@name='" + strOutMessageElement + "']");

                if (outMessageElement == null) {
                    //由于可能引用了其它架构文档，解析暂不支持!;
                }
                else {
                    operationInfo.outMessage.targetNamespace = jetsennet.WebServiceDescription.getAttributeValue(outMessageElement.parentNode, "targetNamespace");
                    operationInfo.outMessage.name = jetsennet.WebServiceDescription.getAttributeValue(outMessageElement, "name");
                    operationInfo.outMessage.elementForm = "unqualified" != outMessageElement.parentNode.getAttribute("elementFormDefault");
                    operationInfo.outMessage.nodes = jetsennet.WebServiceDescription.parseElement(outMessageElement, schemaNsPrefix, operationInfo.outMessage.targetNamespace).nodes;
                }
            }
            else {
                operationInfo.outMessage.nodes = [];
                for (var i = 0; i < outMessageNode.length; i++)
                    operationInfo.outMessage.nodes.push(jetsennet.WebServiceDescription.parseElement(outMessageNode[i], schemaNsPrefix, operationInfo.outMessage.targetNamespace));
            }
        }
    }
    return operationInfo;
};
jetsennet.WebServiceDescription.getAttributeValue = function (node, name, includeNs) {
    if (node == null)
        return "";
    var atrr = node.getAttribute(name);
    if (atrr == null)
        return "";
    if (atrr.indexOf(":") > 0 && !includeNs)
        return atrr.split(":")[1];
    return atrr;
};
jetsennet.WebServiceDescription.parseElement = function (node, schemaNsPrefix, nsType) {
    var wsNode = {};
    if (node.getAttribute("name") != null) {
        wsNode.name = node.getAttribute("name");
        wsNode.dataType = jetsennet.WebServiceDescription.getAttributeValue(node, "type", false);
    }
    else if (node.getAttribute("ref") != null) {
        var refElement = jetsennet.WebServiceDescription.getAttributeValue(node, "ref", false);
        var nodeRef = node.ownerDocument.selectSingleNode("//" + schemaNsPrefix + ":element[@name='" + refElement + "']");
        if (nodeRef != null)
            return jetsennet.WebServiceDescription.parseElement(nodeRef, schemaNsPrefix, null);
    }

    if (!jetsennet.util.isNullOrEmpty(wsNode.dataType) && !jetsennet.WebServiceDescription.isServiceBaseDataType(wsNode.dataType)) {
        var nodeType = node.ownerDocument.selectSingleNode("//" + schemaNsPrefix + ":complexType[@name='" + wsNode.dataType + "']");
        if (nodeType != null) {
            wsNode.targetNamespace = nodeType.parentNode.getAttribute("targetNamespace");
            wsNode.nodes = jetsennet.WebServiceDescription.parseComplexType(nodeType, schemaNsPrefix, wsNode.targetNamespace);
            if (nsType != null && nsType != "") {
                wsNode.targetNamespace = nsType;
            }
        }
        else {
            nodeType = node.ownerDocument.selectSingleNode("//" + schemaNsPrefix + ":simpleType[@name='" + wsNode.dataType + "']");
            if (nodeType != null) {
                wsNode.targetNamespace = nodeType.parentNode.getAttribute("targetNamespace");
                wsNode.dataType = jetsennet.WebServiceDescription.parseSimpleType(nodeType, schemaNsPrefix);
            }
        }
    }
    else {
        wsNode.targetNamespace = nsType;
    }

    if (jetsennet.WebServiceDescription.hasChildNode(node)) {
        for (var i = 0; i < node.childNodes.length; i++) {
            var item = node.childNodes[i];
            var itemName = item.nodeName.indexOf(":") > 0 ? item.nodeName.split(":")[1] : item.nodeName;
            switch (itemName) {
                case "complexType":
                    var nodeItems = jetsennet.WebServiceDescription.parseComplexType(item, schemaNsPrefix, nsType);
                    if (nodeItems != null)
                        wsNode.nodes = nodeItems;
                    break;
                case "simpleType":
                    wsNode.nodeType = jetsennet.WebServiceDescription.parseSimpleType(item, schemaNsPrefix);
                    break;
            }
        }
    }
    return wsNode;
};
jetsennet.WebServiceDescription.parseElementItems = function (node, schemaNsPrefix, nsType) {
    if (!jetsennet.WebServiceDescription.hasChildNode(node))
        return null;

    var nodes = [];
    for (var i = 0; i < node.childNodes.length; i++) {
        var item = node.childNodes[i];
        var itemName = item.nodeName.indexOf(":") > 0 ? item.nodeName.split(":")[1] : item.nodeName;
        switch (itemName) {
            case "choice":
                var nodeChoices = jetsennet.WebServiceDescription.parseElementItems(item, schemaNsPrefix, nsType);
                if (nodeChoices != null)
                    nodes = nodeChoices;
                break;
            case "sequence":
                var nodeSequences = jetsennet.WebServiceDescription.parseElementItems(item, schemaNsPrefix, nsType);
                if (nodeSequences != null)
                    nodes = nodeSequences;
                break;
            case "element":
                var nodeItem = jetsennet.WebServiceDescription.parseElement(item, schemaNsPrefix, nsType);
                if (item != null)
                    nodes.push(nodeItem);
                break;
        }
    }
    return nodes;
};
jetsennet.WebServiceDescription.parseComplexType = function (node, schemaNsPrefix, nsType) {
    if (!jetsennet.WebServiceDescription.hasChildNode(node))
        return null;

    var nodes = [];
    for (var i = 0; i < node.childNodes.length; i++) {
        var item = node.childNodes[i];
        var itemName = item.nodeName.indexOf(":") > 0 ? item.nodeName.split(":")[1] : item.nodeName;
        switch (itemName) {
            case "choice":
                return jetsennet.WebServiceDescription.parseElementItems(item, schemaNsPrefix, nsType);
            case "all":
                return jetsennet.WebServiceDescription.parseElementItems(item, schemaNsPrefix, nsType);
            case "sequence":
                return jetsennet.WebServiceDescription.parseElementItems(item, schemaNsPrefix, nsType);
            case "simpleContent":
                break;
            case "complexContent":
                return jetsennet.WebServiceDescription.parseComplexContent(item, schemaNsPrefix, nsType);
        }
    }
    return nodes;
};
jetsennet.WebServiceDescription.parseComplexContent = function (node, schemaNsPrefix, nsType) {
    var nodes = [];

    var restrictionOrExtension = node.selectSingleNode(schemaNsPrefix + ":restriction");
    if (restrictionOrExtension == null) {
        //对于extension可能在原数据类型基础上，添加元素，现未处理
        restrictionOrExtension = node.selectSingleNode(schemaNsPrefix + ":extension");
    }
    if (restrictionOrExtension != null) {
        var baseType = jetsennet.WebServiceDescription.getAttributeValue(restrictionOrExtension, "base", false);

        var restrictionType = node.ownerDocument.selectSingleNode("//" + schemaNsPrefix + ":complexType[@name='" + baseType + "']");
        if (restrictionType != null)
            return jetsennet.WebServiceDescription.parseComplexType(restrictionType, schemaNsPrefix, nsType);
    }
    return nodes;
};
jetsennet.WebServiceDescription.parseSimpleType = function (node, schemaNsPrefix) {
    var restriction = node.selectSingleNode(schemaNsPrefix + ":restriction");
    if (restriction != null) {
        var baseType = jetsennet.WebServiceDescription.getAttributeValue(restriction, "base", false);
        if (jetsennet.WebServiceDescription.isServiceBaseDataType(baseType))
            return baseType;

        var restrictionType = node.ownerDocument.selectSingleNode("//" + schemaNsPrefix + ":simpleType[@name='" + baseType + "']");
        if (restrictionType != null)
            return jetsennet.WebServiceDescription.parseSimpleType(restrictionType, schemaNsPrefix);
    }
    else {
        var listNode = node.selectSingleNode(schemaNsPrefix + ":list");
        if (listNode != null) {
            if (listNode.getAttribute("itemType") != null)
                return jetsennet.WebServiceDescription.getAttributeValue(listNode, "itemType", false);

            var subSimpleNode = listNode.selectSingleNode(schemaNsPrefix + ":simpleType");
            if (subSimpleNode != null)
                return jetsennet.WebServiceDescription.parseSimpleType(subSimpleNode, schemaNsPrefix);
        }
    }
    return "string";
};
jetsennet.WebServiceDescription.BaseDataType = { "string": 1, "int": 1, "long": 1, "short": 1, "double": 1, "float": 1, "boolean": 1, "dateTime": 1, "date": 1, "time": 1, "decimal": 1, "base64Binary": 1, "integer": 1, "byte": 1,
    "normalizedString": 1, "token": 1, "unsignedLong": 1, "unsignedInt": 1, "unsignedShort": 1, "unsignedByte": 1, "anyURI": 1
};
jetsennet.WebServiceDescription.isServiceBaseDataType = function (dataType) {
    return jetsennet.WebServiceDescription.BaseDataType[dataType] == 1;
};
jetsennet.WebServiceDescription.hasChildNode = function (node) {
    if (node.childNodes.length > 0) {
        var _firstNode = jetsennet.xml.getFirstChild(node);
        if (_firstNode && _firstNode.nodeType == 1)
            return true;
    }
    return false;
};
//=============================================================================
// 生成Soap
//=============================================================================
jetsennet.WebServiceDescription.getRequestSoap = function (operation, arguments, headerReader, argumentReader) {
    operation.currentNsIndex = 0;
    var sbSoap = [];

    sbSoap.push("<?xml version=\"1.0\" encoding=\"utf-8\"?>");
    sbSoap.push("<soap:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">");
    sbSoap.push("<soap:Header>\n");

    var headers = operation.inMessage.headers;
    if (headers != null) {
        for (var i = 0; i < headers.length; i++) {
            sbSoap.push(jetsennet.WebServiceDescription.getNodeXml(operation, headers[i], true, null, headerReader, headers[i].elementForm));
        }
    }

    sbSoap.push("</soap:Header>\n");
    sbSoap.push("<soap:Body>\n");

    if (arguments == null) {
        sbSoap.push(jetsennet.WebServiceDescription.getNodeXml(operation, operation.inMessage, true, null, argumentReader, operation.inMessage.elementForm));
    }
    else {
        sbSoap.push("<" + operation.name + " xmlns=\"" + operation.targetNamespace + "\">\n");
        if (operation.inMessage.nodes != null) {
            var n = operation.inMessage.nodes.length;
            if (arguments.length < n) {
                throw "无效的服务参数个数:" + operation.name + "!";
            }
            for (var i = 0; i < n; i++) {
                var argumentName = operation.inMessage.nodes[i].name;
                var argumentValue = jetsennet.WebServiceDescription.isServiceBaseDataType(operation.inMessage.nodes[i].dataType) ? jetsennet.xml.xmlEscape(arguments[i]) : arguments[i];
                sbSoap.push("<" + argumentName + (operation.inMessage.elementForm ? "" : " xmlns=\"\"") + ">" + argumentValue + "</" + argumentName + ">\n");
            }
        }
        sbSoap.push("</" + operation.name + ">\n");
    }

    sbSoap.push("</soap:Body>\n");
    sbSoap.push("</soap:Envelope>");

    return sbSoap.join("");
};
jetsennet.WebServiceDescription.getNodeXml = function (operation, node, isParent, ns, valueReader, elementForm) {
    if (node == null)
        return string.Empty;

    var sbNode = [];
    sbNode.push("<");
    sbNode.push(node.name);

    var newNs = ns;
    if (isParent) {
        newNs = operation.targetNamespace;
        sbNode.push(" xmlns=\"");
        sbNode.push(operation.targetNamespace);
        sbNode.push("\">");
    }
    else {
        newNs = ns;
        if (elementForm) {
            if (!jetsennet.util.isNullOrEmpty(node.targetNamespace) && node.targetNamespace != ns) {
                newNs = node.targetNamespace;
                sbNode.push(" xmlns=\"");
                sbNode.push(node.targetNamespace);
                sbNode.push("\"");
            }
        }
        else {
            sbNode.push(" xmlns=\"\"");
        }
        sbNode.push(">");
    }

    if (node.nodes != null && node.nodes.length > 0) {
        for (var n = 0; n < node.nodes.length; n++) {
            sbNode.push(jetsennet.WebServiceDescription.getNodeXml(operation, node.nodes[n], false, newNs, valueReader, elementForm));
        }
    }
    else {
        if (valueReader != null)
            sbNode.push(valueReader(node.name, node.dataType, operation.name, operation.location));
        else {
            sbNode.push(node.dataType);
        }
    }

    sbNode.push("</");
    sbNode.push(node.name);
    sbNode.push(">");

    return sbNode.join("");
};