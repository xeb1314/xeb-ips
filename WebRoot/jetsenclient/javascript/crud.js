/**
 * @fileOverview 与界面配合实现一般的增删改查功能
 * @author 梁洪杰
 * @version 2.1.0
 */
jetsennet.addLoadedUri(jetsennet.getloadUri("curd"));

/*************************************表格crud定义**************************************/
/**
 * @class 表格crud
 * @param {String} gridId 表格控件id，可为null，当为null时仅作为增删改查封装类使用
 * @param {[]<Object>} columns 列设置
 * @param {String} pageBarId 分页控件id，可为null
 * @param {String} orderBy 初始排序条件，可为null
 * @constructor
 */
jetsennet.Crud = function(gridId, columns, pageBarId, orderBy) {
    if (gridId) {
        var $this = this;
        this.grid = $.createGridlist(gridId, columns, pageBarId, orderBy, $.proxy(this.load, this));//表格对象，自动生成
        this.grid.ondoubleclick = function(obj, el) {
            var id = $this.keyId.split(".");
            $this.edit(obj[id[id.length - 1]]);
        };
        this.pageBar = this.grid.getPageBar();//分页对象，自动生成
        if (this.pageBar) {
            this.pageBar.showNone = true;
        }
    } 
    this.init(orderBy);    
}

/**
 * 初始化该对象的属性
 * @param {String} orderBy 初始条件语句
 */
jetsennet.Crud.prototype.init = function(orderBy) {
    this.dao = null;//{jetsennet.DefaultDal} 访问数据库的dao
    this.keyId = "t.ID";//{String} 主键id
    this.keyType = jetsennet.SqlParamType.String;//{number} 主键类型
    this.tableName = null;//{String} 表格名称
    this.tabAliasName = "t";//{String} 表格别名
    this.joinTables = null;//{[]<[]<String>>} 关联查询表格列表，参见defaultdal.js的注释
    this.conditions = null;//{[]<[]<String>>} 条件列表，参见defaultdal.js的注释
    this.resultFields = "t.*";//{String} 值列表
    this.orderBy = orderBy;//{String} 排序语句，当没有使用分页时起作用
    this.groupFields = null;//{String} 分组语句
    this.subConditions = null;//{[]<[]<[]<String>>>} 子条件列表，参见defaultdal.js的注释
    
    this.name = null;//{String} 操作名称，会显示在增删改查相应的界面上
    this.className = null;//{String} 类名，与后台对应
    this.cfgId = null;//{String} 新建编辑对话框的内容id
    this.checkId = null;//{String} 列表选择框的name属性
    this.onAddInit = null;//{Function} 新建初始化时触发
    
    this.onAddValid = null;//{Function:Boolean} 新建界面数据校验,返回true为通过验证
    this.onAddGet = null;//{Function:Object} 新建界面获取数据时触发，需返回obj
    this.onAddSuccess = null;//{Function(Object obj)} 新建成功后在load之前触发，obj为新增的数据(不含id)
    this.addDlgOptions = null;//{Object} 新建对话框的选项，比如可以传入{size : {width : 500, height : 440}}以定制对话框大小
    this.onGetCheckId = jetsennet.Crud.getCheckIds;//{Function(String id, String this.checkId):[]<String> ids} 编辑或删除时获取选中对象的id列表
    this.onEditInit = null;//{Function(String id)} 编辑初始化时触发
    this.onEditSet = null;//{Function(Object obj)} 编辑界面数据初始化
    this.onEditValid = null;//{Function(String id, Object Obj):Boolean} 编辑界面数据校验,返回true为通过验证
    this.onEditGet = null;//{Function():Object} 编辑界面获取数据时触发，需返回obj 
    this.onEditSuccess = null;//{Function(Object obj)} 编辑成功后在load之前触发，obj为更改的数据
    this.editDlgOptions = null;//{Object} 编辑对话框的选项，比如可以传入{size : {width : 500, height : 440}}以定制对话框大小
    this.onRemoveValid = null;//{Function([]<String> ids):boolean} 删除下发前触发,返回true为通过验证
    this.onRemoveSuccess = null;//{Function([]<String> ids)} 删除成功后在load之前触发 
    
    this.msgAdd = "新建";//{String}
    this.msgEdit = "编辑";//{String}
    this.msgRemove = "删除";//{String}
    this.msgConfirmRemove = "确定" + this.msgRemove + "?";//{String}
    
    this.pageQueryMethodName = "commonQueryForPage";//{String} 后台分页查询方法名称
    this.queryMethodName = "commonXmlQuery";//{String} 后台普通查询方法名称
    this.objQueryMethodName = "commonXmlQuery";//{String} 后台单个对象查询方法名称
    this.insertMethodName = "commonObjInsert";//{String} 后台增加对象方法名称
    this.updateMethodName = "commonObjUpdateByPk";//{String} 后台更新对象方法名称
    this.deleteMethodName = "commonObjDelete";//{String} 后台删除对象方法名称
    this.exportMethodName = "commonExport";//{String} 后台导出数据方法名称
    this.isPageExport = false;//{boolean}默认不分页，导出最多65535条数据，若可能多于此请使用分页
};

/**
 * 执行查询，跳转到第一页，显示内容
 * @param {[]<[]<String>>} conditions 条件列表
 * @param {[]<[]<[]<String>>>} subConditions 子条件列表
 */
jetsennet.Crud.prototype.search = function(conditions, subConditions) {
    this.conditions = conditions;
    this.subConditions = subConditions;
    if (this.pageBar) {
        this.pageBar.currentPage = 1;
    }
    this.load();
};

/**
 * 执行查询，显示内容
 */
jetsennet.Crud.prototype.load = function() {
    if (!this.grid) {
        return;
    }
    var result = this.query(this.conditions, this.subConditions);
    if (result && result.resultVal) {
        this.grid.renderXML(result.resultVal);
    }
};

/**
 * 导出数据
 * @param {boolean} isAppendDate 文件名是否添加日期后缀
 * @param {object} options 参数选项：{filter:function(cols, index, col){}, error:function(errorString){}, success:function(){}}
 */
jetsennet.Crud.prototype.exportData = function(isAppendDate, options) {
    var url = this.dao.basePath + "rest/" + this.dao.wsName + "/" + this.exportMethodName;
    url += "?_type=xml&name=" + encodeURI(this.name);
    url += "&isAppendDate=" + !!isAppendDate;
    url += "&className=" + encodeURI(this.className);
    var query = this.getSqlQuery();
    query.IsPageResult = this.isPageExport;
    url += "&queryXml=" + encodeURI(query.toXml());
    var cols = this.grid.columns;
    var names = [];
    var fields = [];
    var widths = [];
    for (var i = 0; i < cols.length; i++) {
        if (options && options.filter) {
            if (options.filter(cols, i, cols[i])) {
                continue;
            }
        } else if (cols[i].format) {
            continue;
        }
        names.push(cols[i]["name"]);
        fields.push(cols[i]["fieldName"]);
        widths.push(cols[i]["width"]);
    }
    url += "&colnames=" + encodeURI(names.join(","));
    url += "&colfields=" + encodeURI(fields.join(","));
    url += "&colwidths=" + encodeURI(widths.join(","));
    
    var frame = document.getElementById("exportframe");
    if (!frame) {
        frame = document.createElement("iframe");
        frame.id = "exportframe";
        frame.style.display = "none";
        document.body.appendChild(frame);
        frame.onload = function() {
            if (!frame.contentWindow.document.body) {
                var result = frame.contentWindow.document.childNodes[0].childNodes;
                var errorCode = result[0].textContent;
                var errorString = result[1].textContent;
                if (errorCode == 50) {
                    jetsennet.warn("用户验证失败，请重新登录", {cancelBox: true, onsubmit: jetsennet.gotoLogin});
                } else {
                    if (options && options.error) {
                        options.error(errorString);
                    } else {
                        if (errorCode > 0 && jetsennet["ERROR_CODE"] && jetsennet["ERROR_CODE"]["" + errorCode]) {
                            errorString = jetsennet["ERROR_CODE"]["" + errorCode];
                        }
                        jetsennet.error("操作失败，" + errorString);
                    } 
                }
            } else {
                if (options && options.success) {
                    options.success();
                }
            }
        };
    }
    frame.src = url;
};

/**
 * 获取查询对象
 * @returns {Object} 查询对象
 */
jetsennet.Crud.prototype.getSqlQuery = function() {
    return this.dao.createSqlQuery(this.keyId, this.tableName, this.tabAliasName, this.joinTables, this.conditions, this.resultFields, this.pageBar, this.orderBy, this.groupFields, this.subConditions);
};

/**
 * 执行查询
 * @param {[]<[]<String>>} conditions 条件列表
 * @param {[]<[]<[]<String>>>} subConditions 子条件列表
 * @returns {Object} wsresult对象
 */
jetsennet.Crud.prototype.query = function(conditions, subConditions) {
    if (this.pageBar) {
        return this.dao.queryForPage(this.pageQueryMethodName, this.keyId, this.tableName, this.tabAliasName, this.joinTables, conditions, this.resultFields, this.pageBar, this.groupFields, subConditions);
    } else {
        return this.dao.query(this.queryMethodName, this.keyId, this.tableName, this.tabAliasName, this.joinTables, conditions, this.resultFields, this.orderBy, this.groupFields, subConditions);
    }
};

/**
 * 查询多个对象
 * @param {[]<[]<String>>} conditions 条件列表
 * @param {[]<[]<[]<String>>>} subConditions 子条件列表
 * @returns {[]<Object>} objs列表
 */
jetsennet.Crud.prototype.queryObjs = function(conditions, subConditions) {
    if (this.pageBar) {
        return this.dao.querysForPage(this.pageQueryMethodName, this.keyId, this.tableName, this.tabAliasName, this.joinTables, conditions, this.resultFields, this.pageBar, this.groupFields, subConditions);
    } else {
        return this.dao.queryObjs(this.queryMethodName, this.keyId, this.tableName, this.tabAliasName, this.joinTables, conditions, this.resultFields, this.orderBy, this.groupFields, subConditions);
    }
};

/**
 * 查询单个对象
 * @param {[]<[]<String>>} conditions 条件列表
 * @param {[]<[]<[]<String>>>} subConditions 子条件列表
 * @returns {Object} 单个obj
 */
jetsennet.Crud.prototype.queryObj = function(conditions, subConditions) {
    return this.dao.queryObj(this.objQueryMethodName, this.keyId, this.tableName, this.tabAliasName, this.joinTables, conditions, this.resultFields, this.groupFields, subConditions);
};

/**
 * 显示新建对话框，并处理其中的逻辑
 */
jetsennet.Crud.prototype.add = function() {
    var $this = this;
    var dialog = jetsennet.Crud.getConfigDialog(this.msgAdd + this.name, this.cfgId, this.addDlgOptions);
    if (this.onAddInit) {
        this.onAddInit();
    }
    dialog.onsubmit = function() {
        var areaElements = jetsennet.form.getElements($this.cfgId);
        if (!jetsennet.form.validate(areaElements, true)) {
            return false;
        }
        if ($this.onAddValid && !$this.onAddValid()) {
            return false;
        }
        var obj = $this.onAddGet();
        return $this.directAdd(obj);
    };
    dialog.showDialog();
};

/**
 * 直接往数据库插入数据并刷新界面
 * @param {Object} obj 对象
 * @returns {Boolean} 是否成功
 */
jetsennet.Crud.prototype.directAdd = function(obj) {
    var params = new HashMap();
    params.put("className", this.className);
    params.put("saveXml", jetsennet.xml.serialize(obj, this.tableName));
    var result = this.dao.execute(this.insertMethodName, params);
    if (result && result.errorCode == 0) {
        if (this.onAddSuccess) {
            this.onAddSuccess(obj, result);
        }
        this.load();
        return true;
    }
};

/**
 * 显示编辑对话框，并处理其中的逻辑
 * @param {String} id 要修改的对象的主键id，若为null，则取选中的控件
 */
jetsennet.Crud.prototype.edit = function(id) {
    var $this = this;
    var checkIds = this.onGetCheckId ? this.onGetCheckId(id, this.checkId) : jetsennet.Crud.getCheckIds(id, this.checkId);
    if (checkIds.length != 1) {
        jetsennet.alert("请选择一个要" + this.msgEdit + "的" + this.name + "！");
        return;
    }
    
    var dialog = jetsennet.Crud.getConfigDialog(this.msgEdit + this.name, this.cfgId, this.editDlgOptions);
    if (this.onEditInit) {
        this.onEditInit(checkIds[0]);
    }
    
    var oldObj = null;
    if (this.onEditSet) {
        var conditions = [ [ this.keyId, checkIds[0], jetsennet.SqlLogicType.And, jetsennet.SqlRelationType.Equal, this.keyType ] ];
        oldObj = this.dao.queryObj(this.objQueryMethodName, this.keyId, this.tableName, this.tabAliasName, null, conditions);
        if (oldObj) {
            this.onEditSet(oldObj);
        }
    }
    
    dialog.onsubmit = function() {
        var areaElements = jetsennet.form.getElements($this.cfgId);
        if (!jetsennet.form.validate(areaElements, true)) {
            return false;
        }
        if ($this.onEditValid && !$this.onEditValid(checkIds[0], oldObj)) {
            return false;
        }
        var obj = $this.onEditGet(checkIds[0], $this.oldObj);
        return $this.directEdit(obj);
    };
    dialog.showDialog();
};

/**
 * 直接往数据库更新数据并刷新界面
 * @param {Object} obj 对象
 * @returns {Boolean} 是否成功
 */
jetsennet.Crud.prototype.directEdit = function(obj) {
    var params = new HashMap();
    params.put("className", this.className);
    params.put("updateXml", jetsennet.xml.serialize(obj, this.tableName));
    params.put("isFilterNull", true);
    var result = this.dao.execute(this.updateMethodName, params);
    if (result && result.errorCode == 0) {
        if (this.onEditSuccess) {
            this.onEditSuccess(obj, result);
        }
        this.load();
        return true;
    }
};

/**
 * 显示删除确认框，并处理其中的逻辑
 * @param {String} id 要修改的对象的主键id，若为null，则取选中的控件
 */
jetsennet.Crud.prototype.remove = function(id) {
    var $this = this;
    var checkIds = this.onGetCheckId ? this.onGetCheckId(id, this.checkId) : jetsennet.Crud.getCheckIds(id, this.checkId);
    if (checkIds.length == 0) {
        jetsennet.alert("请选择要" + this.msgRemove + "的" + this.name + "！");
        return;
    }
    if (this.onRemoveValid && !this.onRemoveValid(checkIds)) {
        return;
    }
    jetsennet.confirm(this.msgConfirmRemove, function() {
        return $this.directRemove(checkIds.join(","));
    });
};


/**
 * 直接从数据库删除数据并刷新界面
 * @param {String} ids 以","分割的主键列表字符串
 * @returns {Boolean} 是否成功
 */
jetsennet.Crud.prototype.directRemove = function(ids) {
    var params = new HashMap();
    params.put("className", this.className);
    params.put("deleteIds", ids);
    var result = this.dao.execute(this.deleteMethodName, params);
    if (result && result.errorCode == 0) {
        if (this.onRemoveSuccess) {
            this.onRemoveSuccess(ids, result);
        }
        this.load();
    }
    return true;
};

/**
 * 显示选择对话框，并处理其中的逻辑
 * @param {String} contentId 内容id
 * @param {String} selectId 选择对话框外的列表框id
 * @param {Object} options 对话框选项
 */
jetsennet.Crud.prototype.showSelectDlg = function(contentId, selectId, options) {
    jetsennet.Crud.showSelectDlg("选择" + this.name, contentId, this.checkId, selectId, options);
    this.load();
};

/**
 * 获取通用的配置对话框
 * @param {String} title 标题
 * @param {String} controlId 内容id
 * @param {Object} options 对话框选项
 * @returns {Object} 对话框
 */
jetsennet.Crud.getConfigDialog = function(title, controlId, options) {
    var areaElements = jetsennet.form.getElements(controlId);
    jetsennet.resetValue(areaElements);
    jetsennet.clearValidateState(areaElements);
    var dialog = new jetsennet.ui.Window(title);
    jQuery.extend(dialog, {
        title : title,
        size : {
            width : 0,
            height : 0
        },
        submitBox : true,
        cancelBox : true,
        maximizeBox : false,
        minimizeBox : false,
        showScroll : false,
        controls : [ controlId ]
    }, options);
    return dialog;
};

/**
 * 显示选择对话框，并处理其中的逻辑
 * @param {String} title 标题
 * @param {String} controlId 内容id
 * @param {String} checkName 选择对话框内的check控件name属性
 * @param {String} selectId 选择对话框外的列表框id
 * @param {Object} options 对话框选项
 */
jetsennet.Crud.showSelectDlg = function(title, controlId, checkName, selectId, options) {
    var dialog = new jetsennet.ui.Window(title);
    jQuery.extend(dialog, {
        title : title,
        size : {
            width : 520,
            height : 370
        },
        submitBox : true,
        cancelBox : true,
        showScroll : false,
        controls : [ controlId ],
    }, options);
    dialog.onsubmit = function() {
        jetsennet.Crud.addSelectItems(checkName, selectId);
        return true;
    };
    dialog.showDialog();
};

/**
 * 将选中的数据添加到列表框中
 * @param {String} checkName 控件name属性
 * @param {String} selectId 列表框id
 */
jetsennet.Crud.addSelectItems = function(checkName, selectId) {
    var objs = $("[name='" + checkName + "']");
    objs.each(function(index,element) {
        if (element.tagName == "SPAN") {
            var ck = $(element);
            if (ck.hasClass("checked")) {
                var vals = ck.attr("value").split("\,");
                jetsennet.Crud.addItem(selectId, vals[0], vals[1]);
            }
        } else {
            if (element.checked) {
                var vals = element.value.split("\,");
                jetsennet.Crud.addItem(selectId, vals[0], vals[1]);
            }
        }
    });
};

/**
 * 往列表框中添加值
 * @param {String} selectId 列表框id
 * @param {String} value 值
 * @param {String} name 显示名称
 */
jetsennet.Crud.addItem = function(selectId, value, name) {
    var elm = el(selectId);
    var len = elm.options.length;
    for (var i = 0; i < len; i++) {
        if (elm.options[i].value == value) {
            return;
        }
    }
    elm.options.add(new Option(name, value));
};

/**
 * 初始化列表框的值
 * @param {String} selectId 列表框id
 * @param {[]<Object>} objs 对象列表[必须包含ID和NAME]
 */
jetsennet.Crud.initItems = function(selectId, objs) {
    var elm = el(selectId);
    elm.options.length = 0
    if (objs) {
        for (var i = 0; i < objs.length; i++) {
            elm.options.add(new Option(objs[i].NAME, objs[i].ID));
        }
    }
};

/**
 * 清除列表框的选中数据
 * @param {String} selectId 要删除数据的列表框id
 */
jetsennet.Crud.selectOptionsDel = function(selectId) {
    var elm = el(selectId);
    var _itemCount = elm.options.length;
    if (_itemCount > 0) {
        for (var i = _itemCount - 1; i >= 0; i--) {
            if (elm.options[i].selected) {
                elm.removeChild(elm.options[i]);
            }
        }
    }
};

/**
 * 获取列表框的选中数据
 * @return {String} 选中值列表字符串
 */
jetsennet.Crud.getSelectVals = function(selectId) {
    var vals = [];
    var elm = el(selectId);
    var len = elm.options.length;
    for (var i = 0; i < len; i++) {
        vals.push(elm.options[i].value);
    }
    return vals.join(",");
};

/**
 * 获取表格中选中的id列表
 * @param {String} id null或者id
 * @param {String} checkName 控件name属性
 * @returns {[]<String>} id数组
 */
jetsennet.Crud.getCheckIds = function(id, checkName) {
    var checkIds = [];
    if (id) {
        checkIds[0] = id;
    } else {
        checkIds = jetsennet.form.getCheckedValues(checkName);
    }
    return checkIds;
};

/**
 * 生成表格单元格html
 * @param {String} action onclink处理字符串
 */
jetsennet.Crud.getEditCell = function(action) {
    return "<span class=\"glyphicon glyphicon-edit\" style=\"color: green;cursor:pointer;\" onclick=\"" + action + "\"></span>" ;
};
jetsennet.Crud.getDeleteCell = function(action) {
    return "<span class=\"glyphicon glyphicon-remove\" style=\"color: red;cursor:pointer;\" onclick=\"" + action + "\"></span>" ;
};

/*************************************树crud定义**************************************/
/**
 * @class 树crud
 * @extends jetsennet.Crud
 * @param {String} treeId 树控件id
 * @constructor
 */
jetsennet.TreeCrud = function(treeId) {
    var $this = this;
    this.treeId = treeId;//{String} 树控件id
    this.nodeId = "ID";//{String} 树节点id字段
    this.parentId = "PARENT_ID";//{String} 树节点父id字段
    this.renderName = "NAME";//{String} 树节点显示名称字段
    this.curNode = null;//{Object} 当前选择树节点
    this.onClick = function() {
        $this.curNode = getTreeNode($this.treeId);
        if ($this.onClickEvent) {
            $this.onClickEvent($this.curNode);
        }
    };
    this.onClickEvent = null;//{Functioin(Object curNode)} 响应节点选中事件，例如触发一次表格查询
    
    this.init();    
    this.onGetCheckId = function() {
        var checkIds = [];
        if (id) {
            checkIds[0] = id;
        } else if ($this.curNode){
            var id = $this.curNode["id"];
            if (id > 0) {
                checkIds[0] = id;
            }
        }
        return checkIds;
    };
    this.onRemoveSuccess = function() {
        $this.curNode = null;
    };
}
jQuery.extend(jetsennet.TreeCrud.prototype, jetsennet.Crud.prototype);

/**
 * @overwrite 实现树的加载和刷新
 */
jetsennet.TreeCrud.prototype.load = function() {
    var result = this.query(this.conditions, this.subConditions);
    if (result && result.resultVal) {
        createTree(result.resultVal, this.nodeId, this.parentId, this.renderName, this.treeId, this.onClick);
    }
    if (this.curNode) {
        expandTreeNode(this.treeId, this.curNode["id"]);
    }
};
