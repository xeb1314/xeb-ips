// lixiaomin 2013-03-27  
//=============================================================================
// jetsennet sql;
//=============================================================================

/*
var condition1 = jetsennet.SqlCondition.create("SYS_ID",requestID,jetsennet.SqlLogicType.Or,jetsennet.SqlRelationType.Equal,jetsennet.SqlParamType.String)
var condition = new jetsennet.SqlCondition();
condition.ParamName = "UserId";
condition.ParamValue = "admin";
condition.SqlRelationType = jetsennet.SqlRelationType.Like;

var condition1 = new jetsennet.SqlCondition();	 
condition1.SqlConditions = [condition,condition,condition,condition,condition];

var condition2 = new jetsennet.SqlCondition();
condition2.ParamName = "UserId";
condition2.ParamValue = "admin";

var conditions = new jetsennet.SqlConditionCollection();
conditions.SqlConditions = [condition1,condition2];
*/
jetsennet.addLoadedUri(jetsennet.getloadUri("sql"));
jetsennet.registerNamespace("jetsennet.SqlLogicType");
/**
SQL逻辑关系
*/
jetsennet.SqlLogicType.And = 0;
jetsennet.SqlLogicType.Or = 1;
//已过期
jetsennet.SqlLogicType.AndAll = 2;
//已过期
jetsennet.SqlLogicType.OrAll = 3;

jetsennet.registerNamespace("jetsennet.SqlRelationType");

/**
SQL关系类型
*/
jetsennet.SqlRelationType.Equal = 0;
jetsennet.SqlRelationType.Than = 1;
jetsennet.SqlRelationType.Less = 2;
jetsennet.SqlRelationType.ThanEqual = 3;
jetsennet.SqlRelationType.LessEqual = 4;
jetsennet.SqlRelationType.NotEqual = 5;
jetsennet.SqlRelationType.Like = 6;
jetsennet.SqlRelationType.In = 7;
jetsennet.SqlRelationType.NotIn = 8;
jetsennet.SqlRelationType.Between = 9;
/**
后台自定义处理条件
需要后台提供相应的处理，实现CustomParser
*/
jetsennet.SqlRelationType.Custom = 10;
jetsennet.SqlRelationType.NotLike = 11;
jetsennet.SqlRelationType.CustomLike = 12;
jetsennet.SqlRelationType.IsNull = 13;
jetsennet.SqlRelationType.IsNotNull = 14;
jetsennet.SqlRelationType.Exists = 15;
jetsennet.SqlRelationType.NotExists = 16;
jetsennet.SqlRelationType.ILike = 17;
jetsennet.SqlRelationType.IEqual = 18;
/**
后台解析条件
jetsennet.SqlCondition.create("","FIELD_A='A' AND FIELD_B=3",jetsennet.SqlLogicType.And,jetsennet.SqlRelationType.Parser,jetsennet.SqlParamType.Unknown);
*/
jetsennet.SqlRelationType.Parser = 19;
/**
InLike NotInLike 采用逗号或空格分隔格关键字
*/
jetsennet.SqlRelationType.InLike = 20;
jetsennet.SqlRelationType.NotInLike = 21;
/**
lxm=> %l%x%m%
*/
jetsennet.SqlRelationType.SplitLike = 22;


jetsennet.registerNamespace("jetsennet.SqlParamType");
/**
SQL数据类型
*/
jetsennet.SqlParamType.String = 0;
jetsennet.SqlParamType.Numeric = 1;
jetsennet.SqlParamType.DateTime = 2;
jetsennet.SqlParamType.Boolean = 3;
/**
SqlSelectCmd采用SqlQuery的序列化值作为条件值
var sqlQuery = new SqlQuery();
jetsennet.SqlCondition.create("",sqlQuery.toXml(),jetsennet.SqlLogicType.And,jetsennet.SqlRelationType.Parser,jetsennet.SqlParamType.SqlSelectCmd);
*/
jetsennet.SqlParamType.SqlSelectCmd = 4;
jetsennet.SqlParamType.Field = 5;
jetsennet.SqlParamType.Unknown = jetsennet.SqlParamType.UnKnow = 10;

jetsennet.registerNamespace("jetsennet.TableJoinType");
/**
SQL表连接类型
*/
jetsennet.TableJoinType.Inner = 0;
jetsennet.TableJoinType.Left = 1;
jetsennet.TableJoinType.Right = 2;
jetsennet.TableJoinType.All = 3;

jetsennet.registerNamespace("jetsennet.QueryUnionType");
/**
SQL表合并类型
*/
jetsennet.QueryUnionType.UnionAll = 0;
jetsennet.QueryUnionType.Union = 1;

//=============================================================================
// jetsennet.SqlCondition
// 为了避免XML数据标记内容太多，采用缩写方式进行序列化
// 两个条件之间的关系是由第一个条件的SqlLogicType决定的
// 如果一个SqlCondition它的SqlConditions有值，那么它本身相当于一个括号将它的子条件括起
//=============================================================================
jetsennet.SqlCondition = function () {
    this.__typeName = "jetsennet.SqlCondition";
    this.__modelName = "SC";
    this.ParamName = null;
    this.ParamValue = null;
    this.SqlLogicType = jetsennet.SqlLogicType.And;
    this.SqlRelationType = jetsennet.SqlRelationType.Equal;
    this.SqlParamType = jetsennet.SqlParamType.String;
    this.SqlConditions = [];
};
jetsennet.SqlCondition.create = function (paramName, paramValue, logicType, relationType, paramType) {
    var c = new jetsennet.SqlCondition();
    c.ParamName = paramName;
    c.ParamValue = paramValue;
    c.SqlLogicType = logicType == null ? jetsennet.SqlLogicType.And : logicType;
    c.SqlRelationType = relationType == null ? jetsennet.SqlRelationType.Equal : relationType;
    c.SqlParamType = paramType == null ? jetsennet.SqlParamType.String : paramType;
    return c;
};
jetsennet.SqlCondition.prototype.toXml = function (rootName) {
    var xmlEscape = jetsennet.xml.xmlEscape;
    var _rootName = rootName ? rootName : this.__modelName;
    var strXml = "<" + _rootName + ">";
    strXml += "<SLT>" + this.SqlLogicType + "</SLT>";
    if (this.SqlConditions.length > 0) {
        strXml += "<SCS>";
        for (var i = 0; i < this.SqlConditions.length; i++)
            strXml += this.SqlConditions[i].toXml();
        strXml += "</SCS>";
    }
    else {
        strXml += "<PN>" + xmlEscape(this.ParamName) + "</PN>";
        strXml += "<PV>" + xmlEscape(this.ParamValue) + "</PV>";
        strXml += "<SRT>" + this.SqlRelationType + "</SRT>";
        strXml += "<SPT>" + this.SqlParamType + "</SPT>";
    }

    strXml += "</" + _rootName + ">";
    return strXml;
};
jetsennet.SqlCondition.prototype.fromXml = function (/*XML*/xml) {
    if (xml && xml.childNodes) {
        for (var i = 0; i < xml.childNodes.length; i++) {
            var node = xml.childNodes[i];
            switch (node.nodeName) {
                case "ParamName":
                case "PN":
                    this.ParamName = node.childNodes[0].data;
                    break;
                case "ParamValue":
                case "PV":
                    this.ParamValue = node.childNodes[0].data;
                    break;
                case "SqlLogicType":
                case "SLT":
                    this.SqlLogicType = node.childNodes[0].data;
                    break;
                case "SqlRelationType":
                case "SRT":
                    this.SqlRelationType = node.childNodes[0].data;
                    break;
                case "SqlParamType":
                case "SPT":
                    this.SqlParamType = node.childNodes[0].data;
                    break;
                case "SqlConditions":
                case "SCS":
                    this.SqlConditions = new Array();
                    for (var j = 0; j < node.childNodes.length; j++) {
                        var c = new Jetsen.Util.SqlCondition();
                        s.fromXml(node.childNodes[j]);
                        this.SqlConditions.push(s);
                    }
                    break;
            }
        }
    }
};
//=============================================================================
//SqlConditionCollection
//=============================================================================
jetsennet.SqlConditionCollection = function () {
    this.__typeName = "jetsennet.SqlConditionCollection";
    this.__modelName = "Conditions";
    this.SqlConditions = [];
};
jetsennet.SqlConditionCollection.prototype.toXml = function (rootName) {
    var _rootName = rootName ? rootName : this.__modelName;
    var strXml = "<" + _rootName + ">";
    for (var i = 0; i < this.SqlConditions.length; i++) {
        strXml += this.SqlConditions[i].toXml();
    }
    strXml += "</" + _rootName + ">";
    return strXml;
};
jetsennet.SqlConditionCollection.prototype.add = function (condition) {
    this.SqlConditions.push(condition);
    return this;
};
jetsennet.SqlConditionCollection.prototype.clear = function () {
    this.SqlConditions = [];
    return this;
};
//=============================================================================
// jetsennet.SqlFieldInfo
//=============================================================================
jetsennet.SqlField = function () {
    this.__typeName = "jetsennet.SqlField";
    this.__modelName = "SqlField";
    this.FieldName = null;
    this.FieldValue = null;
    this.ParamType = jetsennet.SqlParamType.String;
};
jetsennet.SqlField.prototype.toXml = function (rootName) {
    var _rootName = rootName ? rootName : this.__modelName;
    var xmlEscape = jetsennet.xml.xmlEscape;
    var strXml = "<" + _rootName + ">";
    strXml += "<FieldName>" + xmlEscape(this.FieldName) + "</FieldName>";
    strXml += "<FieldValue>" + xmlEscape(this.FieldValue) + "</FieldValue>";
    strXml += "<ParamType>" + xmlEscape(this.ParamType) + "</ParamType>";
    strXml += "</" + _rootName + ">";
    return strXml;
};
jetsennet.SqlField.prototype.fromXml = function (/*XML*/xml) {
    if (xml && xml.childNodes) {
        for (var i = 0; i < xml.childNodes.length; i++) {
            var node = xml.childNodes[i];
            switch (node.nodeName) {
                case "FieldName":
                    this.FieldName = node.childNodes[0].data;
                    break;
                case "FieldValue":
                    this.FieldValue = node.childNodes[0].data;
                    break;
                case "ParamType":
                    this.ParamType = node.childNodes[0].data;
                    break;
            }
        }
    }
};
//=============================================================================
//SqlFieldCollection
//=============================================================================
jetsennet.SqlFieldCollection = function () {
    this.__typeName = "jetsennet.SqlFieldCollection";
    this.__modelName = "SqlFields";
    this.SqlFields = [];
};
jetsennet.SqlFieldCollection.prototype.toXml = function (rootName) {
    var _rootName = rootName ? rootName : this.__modelName;
    var strXml = "<" + _rootName + ">";
    for (var i = 0; i < this.SqlFields.length; i++) {
        strXml += this.SqlFields[i].toXml();
    }
    strXml += "</" + _rootName + ">";
    return strXml;
};
jetsennet.SqlFieldCollection.prototype.add = function (field) {
    this.SqlFields.push(field);
    return this;
};
jetsennet.SqlFieldCollection.prototype.clear = function () {
    this.SqlFields = [];
    return this;
};
//=============================================================================
//PageInfo
//=============================================================================
jetsennet.PageInfo = function () {
    this.__typeName = "jetsennet.PageInfo";
    this.__modelName = "PageInfo";
    this.PageSize = 20;
    this.CurrentPage = 1;
};
jetsennet.PageInfo.prototype.toXml = function (rootName) {
    var _rootName = rootName ? rootName : this.__modelName;
    return jetsennet.xml.serialize(this, _rootName);
};

//=============================================================================
//SqlQuery
//=============================================================================
jetsennet.SqlQuery = function () {
    this.__typeName = "jetsennet.SqlQuery";
    this.__modelName = "SqlQuery";
    /// 主键   
    this.KeyId;
    /// 排序  
    this.OrderString;
    /// 记录集根名称  
    this.RecordSetName;
    /// 记录项名称   
    this.RecordName;
    /// 是否分页
    this.IsPageResult;
    /// 分页信息   - jetsennet.PageInfo
    this.PageInfo;
    /// 查询条件   - jetsennet.SqlConditionCollection
    this.Conditions;
    /// 分组字段   
    this.GroupFields;
    /// 是否排除重复   
    this.IsDistinct;
    /// 取记录数  
    this.TopRows;
    /// 结果字段    
    this.ResultFields;
    /// 查询表   - jetsennet.QueryTable
    this.QueryTable;
    /// 合并查询   - jetsennet.UnionQuery
    this.UnionQuery;
};
jetsennet.SqlQuery.prototype.toXml = function (rootName) {
    var _rootName = rootName ? rootName : this.__modelName;
    return jetsennet.xml.serialize(this, _rootName);
};
//=============================================================================
//QueryTable
//TableName可以表现为一个SqlQuery对象的序列化值,例：
//SELECT A FROM TABLE_A INNER JOIN (SELECT B FROM INNER_TABLE) TABLE_B
//SELECT B FROM INNER_TABLE则可以用一个SqlQuery来表示
//=============================================================================
jetsennet.QueryTable = function () {
    this.__typeName = "jetsennet.QueryTable";
    this.__modelName = "QueryTable";
    /// 表名
    this.TableName;
    /// 表别名
    this.AliasName;
    /// 连接表 - jetsennet.JoinTableCollection
    this.JoinTables;
};
jetsennet.QueryTable.prototype.toXml = function (rootName) {
    var _rootName = rootName ? rootName : this.__modelName;
    return jetsennet.xml.serialize(this, _rootName);
};
jetsennet.QueryTable.prototype.addJoinTable = function (joinTable) {
    if (this.JoinTables == null)
        this.JoinTables = new jetsennet.JoinTableCollection();
    this.JoinTables.JoinTables.push(joinTable);

    return this;
};
//=============================================================================
//JoinTable
//=============================================================================
jetsennet.JoinTable = function () {
    this.__typeName = "jetsennet.JoinTable";
    this.__modelName = "JoinTable";
    /// 表信息
    this.QueryTable;
    /// 连接条件
    this.JoinCondition;
    /// 连接类型
    this.JoinType = jetsennet.TableJoinType.Inner;
};
jetsennet.JoinTable.prototype.toXml = function (rootName) {
    var _rootName = rootName ? rootName : this.__modelName;
    return jetsennet.xml.serialize(this, _rootName);
};
//=============================================================================
//JoinTableCollection
//=============================================================================
jetsennet.JoinTableCollection = function () {
    this.__typeName = "jetsennet.JoinTableCollection";
    this.__modelName = "JoinTables";
    this.JoinTables = [];
};
jetsennet.JoinTableCollection.prototype.toXml = function (rootName) {
    var _rootName = rootName ? rootName : this.__modelName;
    var strXml = "<" + _rootName + ">";
    for (var i = 0; i < this.JoinTables.length; i++) {
        strXml += this.JoinTables[i].toXml();
    }
    strXml += "</" + _rootName + ">";
    return strXml;
};
//=============================================================================
//UnionQuery
//=============================================================================
jetsennet.UnionQuery = function (sqlQuery, unionType) {
    this.__typeName = "jetsennet.UnionQuery";
    this.__modelName = "UnionQuery";
    this.UnionType = unionType ? unionType : jetsennet.QueryUnionType.UnionAll;
    this.SqlQuery = sqlQuery;
};
jetsennet.UnionQuery.prototype.toXml = function (rootName) {
    var _rootName = rootName ? rootName : this.__modelName;
    return jetsennet.xml.serialize(this, _rootName);
};
//=============================================================================
// 一些快捷方式的实现
// A a inner join B b on a.ID=B.ID inner join C c on a.ID=c.ID
// var queryTable = jetsennet.createQueryTable("A","a");
// queryTable.addJoinTable(jetsennet.createJoinTable("B","b","a.ID=b.ID",jetsennet.TableJoinType.Inner));
// queryTable.addJoinTable(jetsennet.createJoinTable("C","c","a.ID=c.ID",jetsennet.TableJoinType.Inner));
//=============================================================================
jetsennet.createQueryTable = function (tabName, tabAliasName) {
    return jQuery.extend(new jetsennet.QueryTable(), { TableName: tabName, AliasName: tabAliasName });
};
jetsennet.createJoinTable = function (tabName, tabAliasName, joinCondition, joinType) {
    var queryTable = jQuery.extend(new jetsennet.QueryTable(), { TableName: tabName, AliasName: tabAliasName });
    var joinTable = jQuery.extend(new jetsennet.JoinTable(), 
        { QueryTable: queryTable, JoinCondition: joinCondition, JoinType: joinType != null ? joinType : jetsennet.TableJoinType.Inner });
    return joinTable;
};