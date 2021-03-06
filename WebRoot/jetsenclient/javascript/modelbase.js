// lixiaomin 2008-06-11
//=============================================================================
// jetsennet.AbstractModel，jetsennet.ModelBase
//=============================================================================	 
jetsennet.addLoadedUri(jetsennet.getloadUri("modelbase"));
jetsennet.require("webservice");
//=============================================================================
// jetsennet.AbstractModel; Simple Model Oject
//=============================================================================	
jetsennet.AbstractModel = function () {
    this.__typeName = "jetsennet.AbstractModel";
    this.__modelName = null;
    this.__xmlIgnore = jetsennet.create("jetsennet.util.ArrayList", { "aList": [] });
    this.__customXml = jetsennet.create("jetsennet.util.ArrayList", { "aList": [] });
};
jetsennet.AbstractModel.prototype._getDefaultRoot = function () {
    var ret = "";
    if (this.__modelName && !jetsennet.util.isNullOrEmpty(this.__modelName))
        return this.__modelName;
    if (this.__typeName) {
        var tmpArr = this.__typeName.split(".");
        ret = tmpArr[tmpArr.length - 1];
        ret = ret.substring(0, ret.length - 4);
        return ret;
    }
    return "Root";
};
jetsennet.AbstractModel.prototype._getNamespace = function () {
    var ret = "";
    if (this.__typeName) {
        var tmpArr = this.__typeName.split(".");
        tmpArr.pop();
        ret = tmpArr.join(".");
        return ret;
    }
    return "jetsennet";
};
jetsennet.AbstractModel.prototype._getPropertys = function () {
    var _arr = new Array(); //jetsennet.create("jetsennet.util.ArrayList",{"aList":[]});
    for (var p in this) {
        var __pType = typeof this[p];
        if (__pType == "function" || p.charAt(0) == "_" || this.__xmlIgnore.indexOf(p, 0) >= 0) {
            continue;
        }
        _arr.push(p);
    }
    return _arr;
};
//=============================================================================
// Ingnore Serialize overrite getCustomXml or setCustomXml
//=============================================================================
jetsennet.AbstractModel.prototype.addXmlIngnore = function (/*string*/property) {
    this.__xmlIgnore.add(property);
};
jetsennet.AbstractModel.prototype.addCustomXml = function (/*string*/property) {
    this.__customXml.add(property);
};
jetsennet.AbstractModel.prototype.getCustomXml = function (/*string*/property) {
    return "";
};
jetsennet.AbstractModel.prototype.setCustomXml = function (/*string*/property, /*xml*/xml) {

};
//=============================================================================
// Serializer
//=============================================================================	 
jetsennet.AbstractModel.prototype.toXml = function (/*string*/rootName) {

    var __rootName = rootName ? rootName : this._getDefaultRoot();
    var _xmlEscape = jetsennet.xml.xmlEscape;

    var __strXml = "<" + __rootName + ">";
    for (var p in this) {
        var __val = "";
        var __pType = typeof this[p];
        if (this.__customXml.indexOf(p, 0) >= 0) {
            __val = this.getCustomXml(p);
        }
        else if (__pType == "function" || p.charAt(0) == "_" || this.__xmlIgnore.indexOf(p, 0) >= 0) {
            continue;
        }
        else if (this[p] == null) {
            //__val = "<"+p+"></"+p+">";
        }
        else if (__pType == "string" || __pType == "number") {

            __val = "<" + p + ">" + _xmlEscape(this[p]) + "</" + p + ">";
        }
        else if (__pType == "boolean") {

            __val = "<" + p + ">" + (this[p] ? "true" : "false") + "</" + p + ">";
        }
        else if (__pType == "object") {
            if (this[p].toXml) {
                __val = this[p].toXml();
            }
            else if (this[p].length && this[p].pop && this[p].push) {

                __val = "<" + p + ">";
                for (var i = 0; i < this[p].length; i++) {
                    __val += this[p][i].toXml ? this[p][i].toXml() : this[p][i].toString();
                }
                __val += "</" + p + ">";
            }
            else if (this[p].toString) {

                __val = "<" + p + ">" + _xmlEscape(this[p].toString()) + "</" + p + ">";
            }
        }
        __strXml += __val;
    }

    __strXml += "</" + __rootName + ">";
    return __strXml;
};
//=============================================================================
// Deserializer
//=============================================================================	 
jetsennet.AbstractModel.prototype.fromXml = function (/*XML*/xml, /*string*/rootName) {
    if (xml == null) return;
    var __rootName = rootName ? rootName : this._getDefaultRoot();
    var __node;
    if (xml.nodeName == __rootName) {
        __node = xml;
    }
    else {
        for (var i = 0; i < xml.childNodes.length; i++) {
            if (xml.childNodes[i].nodeName == __rootName) {
                __node = xml.childNodes[i];
                break;
            }
        }
    }
    if (__node == null) return;
    var _propertys = this._getPropertys();
    var _pCount = _propertys.length;
    for (var i = 0; i < _pCount; i++) {
        var __subNode = __node.selectSingleNode(_propertys[i]);
        if (__subNode) {
            if (this.__customXml.indexOf(_propertys[i], 0) >= 0) {
                this.setCustomXml(_propertys[i], __subNode);
            }
            else if (this[_propertys[i]] && this[_propertys[i]].fromXml) {
                this[_propertys[i]].fromXml(__subNode);
            }
            else if (this[_propertys[i]] && this[_propertys[i]].push && this[_propertys[i]].pop) {

                this[_propertys[i]] = new Array();
                var __namespace = this._getNamespace();
                for (var j = 0; j < __subNode.childNodes.length; j++) {
                    if (__subNode.childNodes[j].nodeName == "#text")
                        continue;
                    try {
                        var _s = jetsennet.create(jetsennet.getTypeMapping(__namespace + "." + __subNode.childNodes[j].nodeName + "Info"), {});
                    } catch (ex) { }
                    if (_s && _s.fromXml) {
                        _s = _s.fromXml(__subNode.childNodes[j]);
                        this[_propertys[i]].push(_s);
                    } else {
                        //this[_propertys[i]].push(jetsennet.xml.getText(__subNode.childNodes[j]));
                    }
                    _s = null;
                }
            }
            else {
                //if(__subNode.childNodes[0]==null) continue;
                this[_propertys[i]] = jetsennet.xml.getText(__subNode);
            }
        }
    }
    return this;
}; 
//=============================================================================
// jetsennet.AbstractModel;
//=============================================================================	

jetsennet.ModelBase = function () {
    this.__typeName = "jetsennet.ModelBase";
    this.__modelName = null;
    this.__xmlIgnore = jetsennet.create("jetsennet.util.ArrayList", { "aList": ["onbeforedelete", "onbeforeinsert", "onbeforeupdate", "ondeleted", "oninserted", "onupdated", "onloaded"] });
    this.__customXml = jetsennet.create("jetsennet.util.ArrayList", { "aList": [] });
    //Event
    this.onbeforedelete = null;
    this.onbeforeinsert = null;
    this.onbeforeupdate = null;
    this.ondeleted = null;
    this.oninserted = null;
    this.onupdated = null;
    this.onloaded = null;

    this.__insertServiceName = null;
    this.__updateServiceName = null;
    this.__updateFieldServiceName = null;
    this.__deleteServiceName = null;
    this.__deleteByIdServiceName = null;
    this.__readServiceName = null;
    this.__loadServiceName = null;
    this.__getItemsServiceName = null;

    this.__serviceUrl = null;
    this.__tableName = null;
    this.__async = true;
};
jetsennet.ModelBase.prototype = new jetsennet.AbstractModel();

jetsennet.ModelBase.prototype.add = function () {
    if (this.onbeforeinsert) {
        this.onbeforeinsert();
    }
    var _owner = this;
    var ws = new jetsennet.Service(this.__serviceUrl);
    ws.async = this.__async;
    ws.oncallback = function (retVal) {
        if (_owner.oninserted) {
            _owner.oninserted(retVal.resultVal);
        }
    };
    ws.onerror = function (ex) { jetsennet.error ? jetsennet.error(ex) : alert(ex); };
    ws.call(this.__insertServiceName, [this.__tableName, this.toXml()]);
};
jetsennet.ModelBase.prototype.update = function () {
    if (this.onbeforeupdate) {
        this.onbeforeupdate();
    }
    var _owner = this;
    var ws = new jetsennet.Service(this.__serviceUrl);
    ws.async = this.__async;
    ws.oncallback = function (retVal) {
        if (_owner.onupdated) {
            _owner.onupdated(retVal.resultVal);
        }
    };
    ws.onerror = function (ex) { jetsennet.error ? jetsennet.error(ex) : alert(ex); };
    ws.call(this.__updateServiceName, [this.__tableName, this.toXml()]);
};
jetsennet.ModelBase.prototype.removeById = function (/*string*/keyId) {
    if (this.onbeforedelete) {
        this.onbeforedelete();
    }
    var _owner = this;
    var ws = new jetsennet.Service(this.__serviceUrl);
    ws.async = this.__async;
    ws.oncallback = function (retVal) {
        if (_owner.ondeleted) {
            _owner.ondeleted(retVal.resultVal);
        }
    };
    ws.onerror = function (ex) { jetsennet.error ? jetsennet.error(ex) : alert(ex); };
    ws.call(this.__deleteByIdServiceName, [this.__tableName, keyId]);
};
jetsennet.ModelBase.prototype.find = function (/*SqlConditionCollection*/conditions) {
    var _owner = this;
    var ws = new jetsennet.Service(this.__serviceUrl);
    ws.async = this.__async;
    ws.oncallback = function (retVal) {
        var resultXml = new jetsennet.XmlDoc();
        resultXml.async = false;
        resultXml.loadXML(retVal.resultVal);
        _owner.fromXml(resultXml.documentElement);
        if (_owner.onloaded) {
            _owner.onloaded(retVal.resultVal);
        }
    };
    ws.onerror = function (ex) { jetsennet.error ? jetsennet.error(ex) : alert(ex); };
    var conditionStr = conditions == null ? "" : conditions.toXml();
    ws.call(this.__readServiceName, [this.__tableName, conditionStr]);
};
jetsennet.ModelBase.prototype.findById = function (/*string*/keyId) {
    var _owner = this;
    var ws = new jetsennet.Service(this.__serviceUrl);
    ws.async = this.__async;
    ws.oncallback = function (retVal) {
        var resultXml = new jetsennet.XmlDoc();
        resultXml.async = false;
        resultXml.loadXML(retVal.resultVal);
        _owner.fromXml(resultXml.documentElement);
        if (_owner.onloaded) {
            _owner.onloaded(retVal.resultVal);
        }
    };
    ws.onerror = function (ex) { jetsennet.error ? jetsennet.error(ex) : alert(ex); };
    ws.call(this.__findByIdServiceName, [this.__tableName, keyId]);
};
jetsennet.ModelBase.prototype.load = function (/*SqlConditionCollection*/conditions, /*Page*/pageInfo) {
    var _owner = this;
    var ws = new jetsennet.Service(this.__serviceUrl);
    ws.async = this.__async;
    ws.oncallback = function (retVal) {
        if (_owner.onloaded) {
            _owner.onloaded(retVal.resultVal);
        }
    };
    ws.onerror = function (ex) { jetsennet.error ? jetsennet.error(ex) : alert(ex); };
    var conditionStr = conditions == null ? "" : conditions.toXml();
    var pageInfoStr = pageInfo == null ? "" : pageInfo.toXml();
    ws.call(this.__loadServiceName, [this.__tableName, conditionStr, pageInfoStr]);
};
jetsennet.ModelBase.prototype.getItems = function (/*SqlConditionCollection*/conditions) {
    var _owner = this;
    var ws = new jetsennet.Service(this.__serviceUrl);
    ws.async = this.__async;
    ws.oncallback = function (retVal) {
        var resultXml = new jetsennet.XmlDoc();
        resultXml.async = false;
        resultXml.loadXML(retVal.resultVal);
        var retArray = new Array();
        if (resultXml && resultXml.documentElement) {
            for (var i = 0; i < resultXml.documentElement.childNodes.length; i++) {
                var node = resultXml.documentElement.childNodes[i];
                if (node.nodeName == "#text") continue;
                var strVal = jetsennet.xml.getText(node.selectSingleNode("ValueField"));
                var strText = jetsennet.xml.getText(node.selectSingleNode("TextField"));
                if (strText && strText != "")
                    retArray.push({ "name": strText, "value": strVal });
            }
        }
        if (_owner.onloaded) {
            _owner.onloaded(retArray);
        }
    };
    ws.onerror = function (ex) { jetsennet.error ? jetsennet.error(ex) : alert(ex); };
    var conditionStr = conditions == null ? "" : conditions.toXml();
    ws.call(this.__getItemsServiceName, [this.__tableName, conditionStr]);
};
jetsennet.ModelBase.prototype.updateFields = function (/*SqlFieldCollection*/FieldInfos, /*SqlConditionCollection*/conditions) {
    if (this.onbeforeupdate) {
        this.onbeforeupdate();
    }
    var _owner = this;
    var ws = new jetsennet.Service(this.__serviceUrl);
    ws.async = this.__async;
    ws.oncallback = function (retVal) {
        if (_owner.onupdated) {
            _owner.onupdated(retVal.resultVal);
        }
    };
    ws.onerror = function (ex) { jetsennet.error ? jetsennet.error(ex) : alert(ex); };
    var fieldStr = FieldInfos == null ? "" : FieldInfos.toXml();
    var conditionStr = conditions == null ? "" : conditions.toXml();
    ws.call(this.__updateFieldServiceName, [this.__tableName, fieldStr, conditionStr]);
};
jetsennet.ModelBase.prototype.remove = function (/*SqlConditionCollection*/conditions) {
    if (this.onbeforedelete) {
        this.onbeforedelete();
    }
    var _owner = this;
    var ws = new jetsennet.Service(this.__serviceUrl);
    ws.async = this.__async;
    ws.oncallback = function (retVal) {
        if (_owner.ondeleted) {
            _owner.ondeleted(retVal.resultVal);
        }
    };
    ws.onerror = function (ex) { jetsennet.error ? jetsennet.error(ex) : alert(ex); };
    var conditionStr = conditions == null ? "" : conditions.toXml();
    ws.call(this.__deleteServiceName, [this.__tableName, conditionStr]);
};