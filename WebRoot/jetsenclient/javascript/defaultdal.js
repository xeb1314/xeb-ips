/**
 * 功能：实现页面与底层（Service层）的通讯，包括soap模式和rest模式两种，返回数据格式支持xml和json，支持同步和异步模式
 * 实现页面的数据通用查询、新增、编辑、删除功能； 
 * 建议:系统内部查询采用rest协议查询，与第三方系统交互的页面可以采用soap协议 
 * 作者：李文刚 
 * 修改日期：2013-12-12 
 * 2014-06-09 梁洪杰 适配后台2.0框架，增加json处理
 * 2014-06-14 梁洪杰 增加异步处理，增加参数对象化接口，代码规范化
 */
jetsennet.addLoadedUri(jetsennet.getloadUri("defaultdal"));
/**
 * 构造函数
 * @param wsName WEB服务名称,默认BaseService
 * @param wsMode 通信方式：WEBSERVICE[soap]、 HTTP_JQUERY[rest],默认HTTP_JQUERY
 * @param async 异步模式：false[同步]、true[异步],默认false
 * @param getOrPost 访问模式:GET\POST,默认post
 * @param dataType 数据类型:text、xml、json等,默认json
 * @param basePath 基础路径：默认jetsennet.appPath + "../../services/"
 */
jetsennet.DefaultDal = defaultdal = function(wsName, wsMode, async, getOrPost, dataType, basePath) {
    this.wsName = wsName ? wsName : "BaseService";
    this.wsMode = wsMode ? wsMode : "HTTP_JQUERY";
    this.async = async ? async : false;
    this.getOrPost = getOrPost ? getOrPost : "POST";
    this.dataType = dataType ? dataType : "json";
    this.basePath = basePath ? basePath : (jetsennet.appPath + "../../services/");
    
    var $this = this;
    this.success = function (sResult, options) {
        if (options && options.success) {
            try {
                options.success(sResult.resultVal);
            } catch (ex) {
                $this.error(800001, "处理结果异常：" + ex, options);
            }
        }
    };
    this.error = function (errorCode, errorString, options) {
        if (errorCode == 50) {
            jetsennet.warn("用户验证失败，请重新登录", {cancelBox: true, onsubmit: jetsennet.gotoLogin});
            return;
        }
        if (options && options.error) {
            options.error(errorString);
            return;
        } 
        if (errorCode < 0 && !jetsennet["SHOW_UNKNOW_EXCEPTION"]) {
            jetsennet.error("操作失败");
            return;
        }
        if (errorCode > 0 && jetsennet["ERROR_CODE"] && jetsennet["ERROR_CODE"]["" + errorCode]) {
            errorString = jetsennet["ERROR_CODE"]["" + errorCode];
        }
        jetsennet.error("操作失败，" + errorString);
    };
};

/**
 * 执行调用,实现增删改查
 * @param method 方法名
 * @param param 下发参数,可为：null|HashMap对象|对象[只能用于http方式]|数组[只能用于soap方式],后台会用到
 * @param options 下发选项,实现单次下发定制化控制,如:{wsMode:"WEBSERVICE", async:true, getOrPost:"get", dataType:"xml", cacheLevel:2, success:function(resultVal)...}
 * @return WSResult WSResult:<errorCode、errorString、resultVal>
 */
defaultdal.prototype.execute = function(method, param, options) {
    var result = {
        errorCode : -1,
        resultVal : "",
        errorString : ""
    };
    var $this = this;
    try {
        var wsMode = valueOf(options, "wsMode", this.wsMode);
        if (wsMode == "HTTP_JQUERY") {
            param = param ? (param.toJson ? param.toJson() : param) : {};// 转换成JSON数组
            $.ajax({
                url : this.basePath + "rest/" + this.wsName + "/" + method,// 后台处理方法
                async : valueOf(options, "async", this.async),
                type : valueOf(options, "getOrPost", this.getOrPost),
                dataType : "json",
                headers : {
                    "DataType" : valueOf(options, "dataType", this.dataType)
                },
                data : param,
                success : function(sResult) {
                    result = sResult;
                    if (sResult) {
                        if (sResult.errorCode == 0) {
                            $this.success(sResult, options);
                        } else {
                            $this.error(sResult.errorCode, sResult.errorString, options);
                        }
                    } else {
                        $this.error(800002, "返回数据为空！", options);
                    }
                },
                error : function(obj, ex) {
                    $this.error(800003, "请求异常：" + ex, options);
                }
            });
        } else if (wsMode == "WEBSERVICE") {
            param = param ? (param.toArray ? param.toArray() : param) : [];// 转换成字符串数组
            var ws = new jetsennet.Service(this.basePath + this.wsName + "?wsdl");
            ws.displayLoading = false;
            ws.async = valueOf(options, "async", this.async);
            ws.dataType = valueOf(options, "dataType", this.dataType);
            ws.cacheLevel = valueOf(options, "cacheLevel", 1);
            ws.oncallback = function(sResult) {
                result = sResult;
                $this.success(sResult, options);
            };
            ws.onerror = function(ex) {
                $this.error(this.returnObject.errorCode, ex, options);
            };
            ws.call(method, param);// 调用方法
        }
    } catch (ex) {
        $this.error(800004, "处理请求异常：" + ex, options);
    }
    return result;
};

/**
 * 分页查询
 * @param method 方法名
 * @param keyId 表的主键
 * @param tableName 主表名称
 * @param tabAliasName 主表别名，默认值为t
 * @param joinTables 关联表关系，二维数组（多个条件二维数组[[tabName, tabAliasName, joinCondition, joinType)],[tabName, tabAliasName, joinCondition, joinType)]]数组），可以为空
 * @param conditions 查询条件（多个条件二维数组[[field,value,sqlLogicType,sqlRelationType,sqlParamType],[field,value,sqlLogicType,sqlRelationType,sqlParamType]]数组）
 * @param resultFields 结果集字段，默认null为所有的字段
 * @param pageInfo 分页信息
 * @param groupFields 分组字段
 * @param subConditions 需要用括号括起来的查询条件（多个集合条件三维数组[[[field,value,sqlLogicType,sqlRelationType,sqlParamType],[field,value,sqlLogicType,sqlRelationType,sqlParamType]]],
 * @param options 下发选项,实现单次下发定制化控制,如:{wsMode:"WEBSERVICE", async:true, getOrPost:"get", dataType:"xml", cacheLevel:2, success:function(resultVal)...}
 * @returns WSResult:<errorCode、errorString、resultVal>
 */
defaultdal.prototype.queryForPage = function() {
    var len = arguments.length;
    if (len == 1) {
        var param = arguments[0];
        return this._queryForPage(param.method, param.keyId, param.tableName, param.tabAliasName, param.joinTables, param.conditions, param.resultFields, param.pageInfo, param.groupFields, param.subConditions, param.options);
    } else {
        return this._queryForPage.apply(this, arguments);
    }
}
defaultdal.prototype._queryForPage = function(method, keyId, tableName, tabAliasName, joinTables, conditions, resultFields, pageInfo, groupFields, subConditions, options) {
    try {
        var params = new HashMap();
        var sqlQuery = this.createSqlQuery(keyId, tableName, tabAliasName, joinTables, conditions, resultFields, pageInfo, null, groupFields, subConditions);
        params.put("queryXml", sqlQuery.toXml());
        params.put("startPageNum", (pageInfo.currentPage - 1));
        params.put("pageSize", pageInfo.pageSize);
        return this.execute(method, params, options);
    } catch (e) {
        jetsennet.error("分页查询(queryForPage):执行操作异常：" + e);
    }
};

/**
 * 不带分页查询
 * @param method 方法名
 * @param keyId 主键
 * @param tableName 主表名称
 * @param tabAliasName 主表别名
 * @param joinTables 关联表关系（多个条件二维数组[[tabName, tabAliasName, joinCondition, joinType)],[tabName, tabAliasName, joinCondition, joinType)]]数组），可以为空
 * @param conditions 查询条件（多个条件二维数组[[field,value,sqlLogicType,sqlRelationType,sqlParamType],[field,value,sqlLogicType,sqlRelationType,sqlParamType]]数组）
 * @param resultFields 结果集字段
 * @param orderBy 排序字段
 * @param groupFields 分组字段
 * @param subConditions 需要用括号括起来的查询条件（多个集合条件三维数组[[[field,value,sqlLogicType,sqlRelationType,sqlParamType],[field,value,sqlLogicType,sqlRelationType,sqlParamType]]],
 * @param options 下发选项,实现单次下发定制化控制,如:{wsMode:"WEBSERVICE", async:true, getOrPost:"get", dataType:"xml", cacheLevel:2, success:function(resultVal)...}
 * @returns WSResult:<errorCode、errorString、resultVal>
 */
defaultdal.prototype.query = function() {
    var len = arguments.length;
    if (len == 1) {
        var param = arguments[0];
        return this._query(param.method, param.keyId, param.tableName, param.tabAliasName, param.joinTables, param.conditions, param.resultFields, param.orderBy, param.groupFields, param.subConditions, param.options);
    } else {
        return this._query.apply(this, arguments);
    }
}
defaultdal.prototype._query = function(method, keyId, tableName, tabAliasName, joinTables, conditions, resultFields, orderBy, groupFields, subConditions, options) {
    try {
        var params = new HashMap();
        var sqlQuery = this.createSqlQuery(keyId, tableName, tabAliasName, joinTables, conditions, resultFields, null, orderBy, groupFields, subConditions);
        params.put("queryXml", sqlQuery.toXml());
        return this.execute(method, params, options);
    } catch (e) {
        jetsennet.error("查询(query):执行操作异常：" + e);
    }
};

/**
 * @param keyId 主键
 * @param tableName 主表名称
 * @param tabAliasName 主表别名
 * @param joinTables 关联表关系（多个条件二维数组[[tabName, tabAliasName, joinCondition, joinType)],[tabName, tabAliasName, joinCondition, joinType)]]数组），可以为空
 * @param conditions 查询条件（多个条件二维数组[[field,value,sqlLogicType,sqlRelationType,sqlParamType],[field,value,sqlLogicType,sqlRelationType,sqlParamType]]数组）
 * @param resultFields 结果集字段
 * @param pageInfo 分页信息
 * @param orderBy 排序字段
 * @param groupFields 分组字段
 * @param subConditions 需要用括号括起来的查询条件（多个集合条件三维数组[[[field,value,sqlLogicType,sqlRelationType,sqlParamType],[field,value,sqlLogicType,sqlRelationType,sqlParamType]]],
 * @returns {jetsennet.SqlQuery}
 */
defaultdal.prototype.createSqlQuery = function() {
    var len = arguments.length;
    if (len == 1) {
        var param = arguments[0];
        return this._createSqlQuery(param.keyId, param.tableName, param.tabAliasName, param.joinTables, param.conditions, param.resultFields, param.pageInfo, param.orderBy, param.groupFields, param.subConditions);
    } else {
        return this._createSqlQuery.apply(this, arguments);
    }
}
defaultdal.prototype._createSqlQuery = function(keyId, tableName, tabAliasName, joinTables, conditions, resultFields, pageInfo, orderBy, groupFields, subConditions) {
    keyId = (!keyId ? "" : keyId);
    tabAliasName = (!tabAliasName ? "t" : tabAliasName);
    resultFields = (!resultFields ? tabAliasName + ".*" : resultFields);
    
    var sqlQuery = new jetsennet.SqlQuery();
    var queryTable = jetsennet.createQueryTable(tableName, tabAliasName);

    // 表连接条件
    if (joinTables && joinTables.length > 0) {
        for (var i = 0; i < joinTables.length; i++) {
            queryTable.addJoinTable(jetsennet.createJoinTable(joinTables[i][0], joinTables[i][1], joinTables[i][2], joinTables[i][3]));
        }
    }

    // 查询条件
    var condition = new jetsennet.SqlConditionCollection();
    if (conditions && conditions.length > 0) {
        for (var i = 0; i < conditions.length; i++) {
            condition.SqlConditions.push(jetsennet.SqlCondition.create(conditions[i][0], conditions[i][1],// 字段名称，字段值
            (!conditions[i][2] ? jetsennet.SqlLogicType.And : conditions[i][2]), // 逻辑符号
            (!conditions[i][3] ? jetsennet.SqlRelationType.Equal : conditions[i][3]),// 关系符号
            (!conditions[i][4] ? jetsennet.SqlParamType.String : conditions[i][4])));// 数据类型
        }
    }

    // 带括号的条件
    if (subConditions && subConditions.length > 0) {
        for (var k = 0; k < subConditions.length; k++) {
            var subConditon = new jetsennet.SqlCondition();
            subConditon.SqlLogicType = jetsennet.SqlLogicType.And;
            for (var j = 0; j < subConditions[k].length; j++) {
                subConditon.SqlConditions.push(jetsennet.SqlCondition.create(subConditions[k][j][0], subConditions[k][j][1],// 字段名称，字段值
                (!subConditions[k][j][2] ? jetsennet.SqlLogicType.And : subConditions[k][j][2]), // 逻辑符号
                (!subConditions[k][j][3] ? jetsennet.SqlRelationType.Equal : subConditions[k][j][3]),// 关系符号
                (!subConditions[k][j][4] ? jetsennet.SqlParamType.String : subConditions[k][j][4])));
            }
            condition.SqlConditions.push(subConditon);
        }
    }

    jQuery.extend(sqlQuery, {
        IsPageResult : (pageInfo ? 1 : 0),
        KeyId : keyId,
        PageInfo : (pageInfo ? pageInfo : null),
        QueryTable : queryTable,
        Conditions : condition,
        ResultFields : resultFields,
        OrderString : (pageInfo ? pageInfo.orderBy : (orderBy ? orderBy : "")),
        GroupFields : groupFields
    });
    return sqlQuery;
}

/**
 * 分页查询,将WSResult.resultVal转换成ObjectList
 * @param method 方法名
 * @param keyId 主键
 * @param tableName 主表名称
 * @param tabAliasName 主表别名
 * @param joinTables 关联表关系（多个条件二维数组[[tabName, tabAliasName, joinCondition, joinType)],[tabName, tabAliasName, joinCondition, joinType)]]数组），可以为空
 * @param conditions 查询条件（多个条件二维数组[[field,value,sqlLogicType,sqlRelationType,sqlParamType],[field,value,sqlLogicType,sqlRelationType,sqlParamType]]数组）
 * @param resultFields 结果集字段
 * @param pageInfo 分页信息
 * @param groupFields 分组字段
 * @param subConditions 需要用括号括起来的查询条件（多个集合条件三维数组[[[field,value,sqlLogicType,sqlRelationType,sqlParamType],[field,value,sqlLogicType,sqlRelationType,sqlParamType]]],
 * @param options 下发选项,实现单次下发定制化控制,如:{wsMode:"WEBSERVICE", async:true, getOrPost:"get", dataType:"xml", cacheLevel:2, success:function(objs)...}
 * @returns Object 数组
 */
defaultdal.prototype.queryObjsForPage = function() {
    var len = arguments.length;
    if (len == 1) {
        var param = arguments[0];
        return this._queryObjsForPage(param.method, param.keyId, param.tableName, param.tabAliasName, param.joinTables, param.conditions, param.resultFields, param.pageInfo, param.groupFields, param.subConditions, param.options);
    } else {
        return this._queryObjsForPage.apply(this, arguments);
    }
}
defaultdal.prototype._queryObjsForPage = function(method, keyId, tableName, tabAliasName, joinTables, conditions, resultFields, pageInfo, groupFields, subConditions, options) {
    $this = this;
    try {
        if (options && options.success) {
            var target = options.success;
            options.success = function (resultVal) {
                var objs = null;
                if (resultVal && resultVal.length > 0) {
                    if (jetsennet.util.trim($this.dataType).toLowerCase() == "json") {
                        objs = JSON.parse(resultVal);
                    } else {
                        objs = jetsennet.xml.toObject(resultVal, "Record");
                    }
                }
                target(objs);
            };
        }
        var sResult = this._queryForPage(method, keyId, tableName, tabAliasName, joinTables, conditions, resultFields, pageInfo, groupFields, subConditions, options);
        if (sResult && sResult.resultVal && sResult.resultVal.length > 0) {
            if (jetsennet.util.trim(this.dataType).toLowerCase() == "json") {
                return JSON.parse(sResult.resultVal);// 转json对象
            } else {
                return jetsennet.xml.toObject(sResult.resultVal, "Record");// 转换成对象数组
            }
        } else {
            return null;
        }
    } catch (e) {
        jetsennet.error("分页查询对象(queryObjsForPage):执行操作异常：" + e);
    }
};
/**
 * 查询,将WSResult.resultVal转换成ObjectList
 * @param method 方法名
 * @param keyId 主键
 * @param tableName 主表名称
 * @param tabAliasName 主表别名
 * @param joinTables 关联表关系（多个条件二维数组[[tabName, tabAliasName, joinCondition, joinType)],[tabName, tabAliasName, joinCondition, joinType)]]数组），可以为空
 * @param conditions 查询条件（多个条件二维数组[[field,value,sqlLogicType,sqlRelationType,sqlParamType],[field,value,sqlLogicType,sqlRelationType,sqlParamType]]数组）
 * @param resultFields 结果集字段
 * @param orderBy 排序字段
 * @param groupFields 分组字段
 * @param subConditions 需要用括号括起来的查询条件（多个集合条件三维数组[[[field,value,sqlLogicType,sqlRelationType,sqlParamType],[field,value,sqlLogicType,sqlRelationType,sqlParamType]]],
 * @param options 下发选项,实现单次下发定制化控制,如:{wsMode:"WEBSERVICE", async:true, getOrPost:"get", dataType:"xml", cacheLevel:2, success:function(objs)...}
 * @returns Object数组
 */
defaultdal.prototype.queryObjs = function() {
    var len = arguments.length;
    if (len == 1) {
        var param = arguments[0];
        return this._queryObjs(param.method, param.keyId, param.tableName, param.tabAliasName, param.joinTables, param.conditions, param.resultFields, param.orderBy, param.groupFields, param.subConditions, param.options);
    } else {
        return this._queryObjs.apply(this, arguments);
    }
}
defaultdal.prototype._queryObjs = function(method, keyId, tableName, tabAliasName, joinTables, conditions, resultFields, orderBy, groupFields, subConditions, options) {
    $this = this;
    try {
        if (options && options.success) {
            var target = options.success;
            options.success = function (resultVal) {
                var objs = null;
                if (resultVal && resultVal.length > 0) {
                    if (jetsennet.util.trim($this.dataType).toLowerCase() == "json") {
                        objs = JSON.parse(resultVal);
                    } else {
                        objs = jetsennet.xml.toObject(resultVal, "Record");
                    }
                }
                target(objs);
            };
        }
        var sResult = this._query(method, keyId, tableName, tabAliasName, joinTables, conditions, resultFields, orderBy, groupFields, subConditions, options);
        if (sResult && sResult.resultVal && sResult.resultVal.length > 0) {
            if (jetsennet.util.trim(this.dataType).toLowerCase() == "json") {
                return JSON.parse(sResult.resultVal);// 转json对象
            } else {
                return jetsennet.xml.toObject(sResult.resultVal, "Record");
            }
        } else {
            return null;
        }
    } catch (e) {
        jetsennet.error("查询对象列表(queryObjs):执行操作异常：" + e);
    }
};
/**
 * 查询,将WSResult.resultVal转换成Object 如有多个，取第一个
 * @param method：方法名
 * @param keyId 主键
 * @param tableName 主表名称
 * @param tabAliasName 主表别名
 * @param joinTables 关联表关系（多个条件二维数组[[tabName, tabAliasName, joinCondition, joinType)],[tabName, tabAliasName, joinCondition, joinType)]]数组），可以为空
 * @param conditions 查询条件（多个条件二维数组[[field,value,sqlLogicType,sqlRelationType,sqlParamType],[field,value,sqlLogicType,sqlRelationType,sqlParamType]]数组）
 * @param resultFields 结果集字段
 * @param groupFields 分组字段
 * @param subConditions 需要用括号括起来的查询条件（多个集合条件三维数组[[[field,value,sqlLogicType,sqlRelationType,sqlParamType],[field,value,sqlLogicType,sqlRelationType,sqlParamType]]],
 * @param options 下发选项,实现单次下发定制化控制,如:{wsMode:"WEBSERVICE", async:true, getOrPost:"get", dataType:"xml", cacheLevel:2, success:function(obj)...}
 * @returns Object
 */
defaultdal.prototype.queryObj = function() {
    var len = arguments.length;
    if (len == 1) {
        var param = arguments[0];
        return this._queryObj(param.method, param.keyId, param.tableName, param.tabAliasName, param.joinTables, param.conditions, param.resultFields, param.groupFields, param.subConditions, param.options);
    } else {
        return this._queryObj.apply(this, arguments);
    }
}
defaultdal.prototype._queryObj = function(method, keyId, tableName, tabAliasName, joinTables, conditions, resultFields, groupFields, subConditions, options) {
    $this = this;
    try {
        if (options && options.success) {
            var target = options.success;
            options.success = function (objs) {
                var obj = null;
                if (objs && objs.length > 0) {
                    obj = objs[0];
                }
                target(obj);
            };
        }
        var sResult = this._queryObjs(method, keyId, tableName, tabAliasName, joinTables, conditions, resultFields, null, groupFields, subConditions, options);
        if (sResult && sResult.length > 0) {
            return sResult[0];
        } else {
            return null;
        }
    } catch (e) {
        jetsennet.error("查询对象(queryObj):执行操作异常：" + e);
    }
};
