/**
 * 新版本的gridlist对象
 * 建议一次创建（new）多次render来提高表格的生成速度。
 * 虽然统一了xslt和cols方式，但是cols的效率要高于xslt，所以如果没有特殊要求，请全部采用cols的方式创建表格。
 * 不建议每次render前都将container.innerHTML清空，当前显示的表格结构将被复用，改变的只是数据。如果清空，则重新创建表格结构，将耗费一定的资源。
 * 表格允许接收json数据，如果是json数据，你需要指定render方法的第二个参数 isJson。
 * 表格行的单击、双击、列的format方法，都将接收当前行所关联的那个对象，在老接口的参数列表最后增加一项传入。
 */
jetsennet.addLoadedUri(jetsennet.getloadUri("gridlist"));
/** 表格常量*/
var GridListConstant = {
   Sort : {
       SORT_NONE : 0,
       SORT_STRING : 1, 
       SORT_NUMBER : 2     
   },
   Operator : {
       COL_HEAD_NONE : 0,
       COL_HEAD_EDGE : 1,
       COL_HEAD_OVER : 2,
       COL_HEAD_SIZE : 3,
       COL_HEAD_DOWN : 4,
       COL_HEAD_MOVE : 5
   },
   DataType : {
       XML : "XML",
       JSON: "JSON",
       DOM: "DOM"
   }
};
/**兼容老版本**/
{
    SORT_NONE = 0,
    SORT_STRING = 1,
    SORT_NUMBER = 2
}

var GridListUtil = (function(){
    var _gridInstanceIds = [];
    var _defaultLength = 6;
    var _chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_";
    return {
        randomString: function(len) {
            var string = "";
            for(var i = 0; i < (len||_defaultLength) ; i ++) {
                var index = Math.ceil(Math.random()*(_chars.length-1));
                string += _chars.charAt(index);
            }
            return string;
        },
        
        formatInstanceId: function(instanceId) {
            instanceId = instanceId+"";
            while(_gridInstanceIds.contains(instanceId)) {
                instanceId = GridListUtil.randomString(_defaultLength);
            }
            _gridInstanceIds.push(instanceId);
            return instanceId;
        }
    };
}());

/**自动加载当前样式中的jetsenui.css*/
jetsennet.importCss("jetsenui");

/**jetsennet grid**/
jetsennet.ui.GridList = function (instanceId) {
    
    this.instanceId = GridListUtil.formatInstanceId(instanceId);
    this.enableResizeColumns = true;                                    // 是否允许改变列宽  
    this.enableColorRows = true;                                        // 是否隔行换色
    this.enableMoveColumns = true;                                      // 是否可以交换列
    this.enableSelectRows = true;                                       // 是否可以选择行
    this.enableMultiSelect = true;                                      // 是否可以多选
    this.enableReselectRows = false;                                    // 是否允许重选之前行 
    this.enableSortRows = true;                                         // 是否允许排序
    this.enableHideColumns = true;                                      // 是否允许隐藏列
    this.enableRemStatus = true;                                        // 是否允许记住列的状态(大小，位置等)
    this.enableReturnObj = false;                                       // 是否允许表格事件回传对象
    this.enableRemPosition = false;                                      // 是否允许记住滚动条位置，每次展示完之后都会重置为false                                          
    this.escape = true;                                                 // 是否需要处理特殊字符
    this.sortAscImage = 'fa fa-sort-asc';                               // 正序图标
    this.sortDescImage = 'fa fa-sort-desc';                             // 反序图标
    this.folderOpenImage = 'jetsen-grid-tree-icon fa fa-folder-open';   // 树表格时的展开图标
    this.folderCloseImage = 'jetsen-grid-tree-icon fa fa-folder';       // 树表格时的收缩图标
    this.itemImage = '';
    this.columnMinWidth = 20;                                           // 表格的最小列宽
    this.className = "jetsen-grid";                                     // 表格的样式名前辍，要更改样式名，必须实现所有样式
    
    /* events */
    this.onresize = null;                           //  表格大小改变的时候
    this.onselect = null;                           //  表格行被选中的时候
    this.onheaderclick = null;                      //  表头被点击的时候
    this.onrowclick = null;                         //  表格行被点击的时候
    this.ondoubleclick = null;                      //  表格行被双击的时候
    this.ondatasort = null;                         //  表格自定义排序    
    this.oncolumnchanged = null;                    //  表格列信息改变的时候（默认的处理方式：在允许记住列状态的时候存cookie）    
    this.oncontextmenu = null;                      //  表格右键事件
    this.onshowcheckmenu = null;                    //  表格复选框下拉菜单

    /* data */
    this.columns = [];                              //  列信息
    this.dataSource = null;                         //  数据源
    this.attachAttributes = [];                     //  行附加属性
    this.dateItemName = "Record";                   //  记录行对应的xml节点名
    this.objItems = new Array();                    //  数据源转换的对象数组，@private内部参数
    this.rowItems = new Array();                    //  用来生成行数据对象，@private内部参数
    this.dataCount = 0;                             //  数据源条目数，@private内部参数
    this.dataType = GridListConstant.DataType.XML;  //  数据源类型  ，@private内部参数
    this.xsltTable = null;                          //  xslt生成表格时，用来缓存xslt表格对象，@private内部参数

    /* tree properties */
    this.parentId = "";                             //  树状表格的顶层父ID
    this.parentField = "";                          //  树状表格的父字段名
    this.idField = "";                              //  树状表格的ID字段名
    this.treeControlIndex = -1;                     //  树状表格控制列索引
    this.treeLevelPadding = 25;                     //  树状表格各层次距离
    this.treeOpenLevel = 1;                         //  树状表格的树打开级别
    this.treeOpenAll = false;                       //  树表是否全部展开
    this.GRIDTREE_CHILDREN_FIELD = "JETSEN_GRIDTREE_CHILDREN_FIELD";

    /* private properties */
    this.sortCol = -1;                              //  当前排序列索引
    this.sortDescending = 0;                        //  正序or倒序, read only (SORT_ASCENDING or SORT_DESCENDING)
    this.selectedRows = [];                         //  被选择的行
    this.loadTimer = null;                          //  用来控制表格刷新
    this.container = null;                          //  存放表格的容器
    this.headContainer = null;                      //  表头容器
    this.bodyContainer = null;                      //  表体容器
    this.headTable = null;                          //  表头
    this.bodyTable = null;                          //  表体
    this.cookiename = jetsennet.util.utf8ToBase64String(window.location.toString().split("?")[0]+"-"+instanceId);//cookie名
};

/**展示表格**/
jetsennet.ui.GridList.prototype.render = function(container, dataType, reselectRow) {
    if(!container || typeof container == "string") {
        this.container = jQuery("#" + container||this.instanceId).addClass(this.className)[0];
    } else {
        this.container = jQuery(container).addClass(this.className)[0];
    }
    this.dataType = dataType||GridListConstant.DataType.XML;
    if (typeof(this.enableMultiRow) == "undefined") {
        this.enableMultiRow = false;
    }
    this.gridRending();
    this.initcolumns();
    this.createTable();
    this.reselectRow(reselectRow);
    this.refreshSize();
    this.colorEvenRows();
    this.assignEventHandlers();
    this.ctrlScroll();
    this.gridRendOver();
    if(!this.enableRemPosition)
    {
        jQuery(this.bodyContainer).data("jsp").scrollTo(0, 0, true);
    }
    this.enableRemPosition = false;
    this.isInit = true;
};

/**从xslt转化**/
jetsennet.ui.GridList.prototype.bind = function (container, xsltTable, reselectRow) {
    if(!xsltTable || typeof xsltTable == "string") {
        xsltTable = jQuery("#" + xsltTable);
    }
    if(!xsltTable || jQuery(xsltTable).length == 0) {
        throw "表格不存在，请检查！";
    }
    this.xsltTable = jQuery(xsltTable)[0];
    if (typeof(this.enableMultiRow) == "undefined") {
        this.enableMultiRow = true;
    }
    this.escape = false;//xslt已经处理了特殊字符，因此默认关掉
    this.formatColumn4Xslt();
    this.render(container, GridListConstant.DataType.DOM, reselectRow);
};

/**为xslt翻译列信息**/
jetsennet.ui.GridList.prototype.formatColumn4Xslt = function() {
    if(!this.isInit) {
        var existFields = new Array();
        var rows = this.xsltTable.tBodies[0].rows;
        var columns = new Array();
        jQuery(rows[0]).children().each(function(index){
            var column = { name: this.innerText,
                    fieldName: attributeOf(this, "fieldname", ""),
                    title: attributeOf(this, "title", false),
                    sortField: attributeOf(this, "sortfield", ""),
                    sortType: attributeOf(this, "sorttype", GridListConstant.Sort.SORT_NONE),
                    align: attributeOf(this, "align", ""),
                    display: attributeOf(this, "display", "1") != "0",
                    wrap: attributeOf(this, "wrap", "0") == "1",
                    escape: attributeOf(this, "escape", "0") == "1",
                    isCheck: attributeOf(this, "ischeck", "0") == "1",
                    checkName: attributeOf(this, "checkname", ""),
                    checkId: attributeOf(this, "checkid", ""),
                    width: attributeOf(this, "width", this.style.width||"")
            };
            column.width = column.width.replace("px", "");
            if(!column["fieldName"]) {
                var fieldName = GridListUtil.randomString();
                while(column.hasOwnProperty(fieldName) || existFields.contains(fieldName)) {
                    fieldName = GridListUtil.randomString();
                }
                existFields.push(fieldName);
                column["fieldName"] = fieldName;
            }
            if (!column.isCheck || (column.isCheck && column.checkId=="" && column.checkName=="")) {
                for(var i=0; i<2&&i<rows.length; i++) {
                    var oldChecks = rows[i].cells[index].getElementsByTagName("input");
                    if (oldChecks != null && oldChecks.length > 0) {
                        column.isCheck = true;
                        column.checkId = oldChecks[0].id;
                        column.checkName = oldChecks[0].name;
                        break;
                    }
                }
            }
            if(column.isCheck) {
                if(!column.checkName && !column.checkId) {
                    throw "请至少为复选框列设置一个checkName或者checkId";
                } else if(!column.checkName){
                    column.checkName = column.checkId.replace("-all", "");
                } else if(!column.checkId) {
                    column.checkId = column.checkName + "-all";
                }
            }
            columns.push(column);
        });
        this.columns = columns;
    }
    var tempCols = [];
    tempCols = jQuery.extend(this.columns, tempCols);   //  xslt原生表格转换。此原生表格未考虑column position的排序处理。固此处需要做特殊处理。
    if(this.isInit) {
        tempCols.sort( function(col1, col2) {   
            if (col1.index > col2.index)  
                return 1;
            else        
                return -1;
        });
    }
    var datasource = [];
    datasource.push("<RecordSet>");
    var rows = this.xsltTable.tBodies[0].rows;
    for(var i=1; i<rows.length; i++) {
        datasource.push("<"+this.dateItemName+">");
        var cels = rows[i].cells;
        for(var j=0; j<cels.length; j++) {
            var col = tempCols[j];
            datasource.push("<" + col["fieldName"] + ">");
            if(col.isCheck) {
                var input = cels[j].getElementsByTagName("input")[0];
                if (input) {
                    datasource.push(input.value);
                }
            } else {
                datasource.push(jetsennet.xml.xmlEscape(cels[j].innerHTML));
            }
            datasource.push("</" + col["fieldName"] + ">");
        }
        datasource.push("</"+this.dateItemName+">");
    }
    datasource.push("</RecordSet>");
    this.dataSource = datasource.join("");
};

/**表格展现中**/
jetsennet.ui.GridList.prototype.gridRending = function() {
    var icon = jQuery(this.container).children("#" + this.instanceId + "-grid-rending-icon");
    if(icon.length == 0) {
        icon = jQuery("<span>").attr("id", this.instanceId + "-grid-rending-icon").addClass("jetsen-grid-loading-icon").appendTo(this.container);
    } else {
        icon.css("display", "block");
    }
};

/**表格展示结束**/
jetsennet.ui.GridList.prototype.gridRendOver = function() {
    var owner = this;
    if(this.loadTimer) {
        clearTimeout(this.loadTimer);
    }
    this.loadTimer = setTimeout(function(){
        jQuery(owner.container).children("#" + owner.instanceId + "-grid-rending-icon").css("display", "none");
    }, 300);
};

/**格式化列**/
jetsennet.ui.GridList.prototype.initcolumns = function() {
    if(this.isInit) { return ; }
    //初始化列索引，索引永久不变，位置默认情况下等于索引值
    jQuery.each(this.columns, function(i) {
        this.index = i;
        this.position = i;
        if(this.hasOwnProperty("display") && this.display/1==0) {
            this.display = false;
        } else {
            this.display = true;
        }
    });
    //允许记录表格状态。s->show显示  p->position位置  i->index列索引 w->width宽度，如果是百分比列，此项不存
    if (this.enableRemStatus) {   
        var columnInfo = jetsennet.util.cookie(this.cookiename);
        if (!jetsennet.util.isNullOrEmpty(columnInfo)) {
            var cols = jetsennet.xml.deserialize(columnInfo, "c");
            if (cols && cols.length>0) 
            {
                for (var i = 0; i < this.columns.length; i++) 
                {
                    for(var j = 0; j < cols.length; j++)
                    {
                        if(this.columns[i].index == cols[j].i)
                        {
                            this.columns[i].display = cols[j].s/1==1 ;
                            this.columns[i].position = cols[j].p/1;
                            this.columns[i].width = cols[j].w/1;
                            break;
                        }
                    }
                }
            }
        }
    }
    this.columns.sort( function(col1, col2) {   //  将表格列重新排列
        if (col1.position > col2.position)  
            return 1;
        else        
            return -1;
        }
    );
    var numberExp = new RegExp("^\\d+$");     //匹配整数    
    var percentExp = new RegExp("^\\d+%$");   //匹配百分比
    var percent = 0;
    var nowidArr = new Array();
    var index = 0;
    jQuery.each(this.columns, function(minWidth){
        if(this.hasOwnProperty("width")) {
            if(numberExp.test(this.width) && this.width/1!=1) {
                this.percent = false ;
                this.width = Number(this.width);
            } else if(percentExp.test(this.width)) {
                this.percent = true ;
                var num = Number(this.width.replace("%", ""))/100;
                this.initialPercent = num ;
                this.currentPercent = num ;
                percent += num;
                this.width = minWidth;
            } else if(this.width>0&&this.width<=1){
                this.percent = true ;
                this.initialPercent = Number(this.width) ;
                this.currentPercent = Number(this.width) ;
                percent += Number(this.width);
                this.width = minWidth;
            }else if(this.width=="auto" || jetsennet.util.isNullOrEmpty(this.width)){
                nowidArr.push(this);
            }else{
                throw "表格" + this.gridName + "的第" + index + "列，宽度:" + this.width + "无法正确解析，可能影响表格的正常展示!";  
            }
        }else {
            nowidArr.push(this);
        }
        index++;
    }, [this.columnMinWidth]);
    if(percent > 1) {
        throw ("表格"+this.gridName+"的百分比列宽之和大于1，可能影响表格的正常展示！");
    } else if(percent==1 && nowidArr.length>0) {
        jQuery.each(nowidArr, function(minWidth) {
            this.percent = false ;
            this.width = minWidth;
        }, [this.columnMinWidth]);
    } else {
        jQuery.each(nowidArr, function(minWidth, count) {
            this.percent = true ;
            var num = Number(1-percent)/count;
            this.initialPercent = num ;
            this.currentPercent = num ;
            this.width = minWidth;
        }, [this.columnMinWidth, nowidArr.length]);
    }
};

/**创建表格**/
jetsennet.ui.GridList.prototype.createTable = function () {
    this.formatDatasource();
    this.createHead();
    this.createBody();
    this.setProperties();
    this.rendData();
    var owner = this;
    jQuery.each(this.tbodyTable.childNodes, function(index){
        if(index == 0) {
            owner.blankRowHeight = jQuery(this).height();
        }
        jQuery(this).data("item", owner.rowItems[index]);
    });
};

/**附加属性**/
jetsennet.ui.GridList.prototype._attachAttributes = function(content, ele) {
    if(content instanceof Array && ele && ele.hasAttributes()) {
        var attrs = ele.attributes;
        for(var i=0; i< attrs.length; i++) {
            content.push(" " + attrs[i].name + "=\""+ attrs[i].value +"\"");
        }
    }
};

/**创建表头**/
jetsennet.ui.GridList.prototype.createHead = function () {
    if(el(this.instanceId + "-div-head") != null && el(this.instanceId + "-tab-head") != null) {
        jQuery(el(this.instanceId + "-tab-head")).find("span.jetsen-checkbox-chk-all").removeClass("checked");
        return ;
    }
    jQuery(this.container).empty();
    this.gridRending();
    var row = (this.dataType == GridListConstant.DataType.DOM && this.xsltTable) ? this.xsltTable.tBodies[0].rows[0] : null;
    var content = [];
    content.push("<div id='" + this.instanceId + "-div-head' class='" + this.className + "-head' style='position:absolute;left:0px;top:0px;'>");
    content.push("<table id='" + this.instanceId + "-tab-head' cellspacing='0' cellpadding='0'>");
    content.push("<tbody>");
    content.push("<tr");
    this._attachAttributes(content, row);
    content.push(">");
    var owner = this;
    jQuery.each(this.columns, function(i) {
        content.push("<td align='"+(this.align||"left")+"' class='"+(this.isCheck?owner.className+"-head-check":"")+"'");
        owner._attachAttributes(content, row?row.cells[i]:null);
        content.push(">");
        content.push("<div class='" + owner.className + "-head-inner'>");
        if(this.isCheck) {
            content.push("<span class='jetsen-checkbox jetsen-checkbox-chk-all' id='"+((this.checkId||this.checkName + "-all"))+"' checkname='"+this.checkName+"'>&nbsp;</span>");
            content.push("<div class='" + owner.className + "-head-dropbtn' checkname='"+this.checkName+"'></div>");
        } else {
            content.push(this.name||"&nbsp;");
        }
        content.push("</div></td>");
    });
    content.push("<td class='" + this.className + "-head-autotd'></td>");
    content.push("</tr></tbody></table></div>");
    this.container.innerHTML = this.container.innerHTML + content.join("");
};

/**展示复选框菜单**/
jetsennet.ui.GridList.prototype.showCheckMenu = function (obj, checkName) {
    var menuControl = el(this.instanceId + '-head-menu-' + checkName);
    if (menuControl == null) {
        jetsennet.require(["menu"]);
        var headCheckMenu = jQuery.extend(new jetsennet.ui.Menu(""), { menuWidth: 100 });
        headCheckMenu.addItem(jQuery.extend(new jetsennet.ui.MenuItem("全部选择"), { menuParam: checkName, onclick: function () {
            if (el(checkName + "-all") != null) {
                jQuery("#" + checkName + "-all").addClass("checked");
                jQuery("[name='" + checkName + "']").addClass("checked");
            };
        }}));
        headCheckMenu.addItem(jQuery.extend(new jetsennet.ui.MenuItem("反向选择"), { menuParam: checkName, onclick: function () {
            if (el(checkName + "-all") != null) {
                $("#" + checkName + "-all").removeClass("checked");
                jQuery("[name='" + checkName + "']").toggleClass("checked");
            };
        }}));
        if (jQuery.isFunction(this.onshowcheckmenu)) {
            this.onshowcheckmenu(headCheckMenu, checkName);
        }
        headCheckMenu.render().attr("id", this.instanceId + '-head-menu-' + checkName).popup({ reference: obj.parentNode.parentNode });
    }
    jetsennet.popup(menuControl, { reference: obj.parentNode.parentNode });
};

/**格式化数据源**/
jetsennet.ui.GridList.prototype.formatDatasource = function() {
    this.objItems = new Array();
	this.rowItems = new Array();
    this.dataCount = 0;
    if (this.dataSource == null) { return; }
    var items = null; 
    if(this.dataType == GridListConstant.DataType.JSON) {
        items = jQuery.parseJSON(this.dataSource)||[];
    } else if(this.dataType == GridListConstant.DataType.XML || this.dataType == GridListConstant.DataType.DOM){
        items = jetsennet.xml.toObject(this.dataSource, this.dateItemName)||[];
    }
    if(items==null || items.length==0) { return ; }
    if (jetsennet.util.isNullOrEmpty(this.parentField)) {
        this.dataCount = items.length;
        this.objItems = items;
        this.rowItems = items;
        return;
    } 
    var owner = this;
    /**生成一个不影响当前对象的有效的随机字段**/
    var getValidField = function(obj) {
        while(true) {
            var field = "VALID_" + GridListUtil.randomString();
            if(!obj[field] && !obj.hasOwnProperty(field)) {
                return field;
            }
        }
    };
    /**添加子孙**/
    var addChildren = function(node, nodes, pIdField, idField, validField, childrenField, count) {
        jQuery.each(nodes, function(){
            if(this[pIdField] == node[idField] && this[idField] != node[idField] && !this[validField]) {
                node[childrenField] = node[childrenField]||[];
                count ++;
                node[childrenField].push(this);
                owner.rowItems.push(this);
                this[validField] = true;
                count = addChildren(this, nodes, pIdField, idField, validField, childrenField, count);
            }
        });
        return count;
    };
    /**构建树表数据源**/
    var validField = getValidField(items[0]);
    var count = 0;
    jQuery.each(items, function(){     
        if(this[owner.parentField] == owner.parentId && this[owner.idField] != owner.parentId  && !this[validField])
        {
            count ++;
            owner.objItems.push(this);
            owner.rowItems.push(this);
            this[validField] = true;
            count = addChildren(this, items, owner.parentField, owner.idField, validField, owner.GRIDTREE_CHILDREN_FIELD, count);
        }
    }); 
    this.dataCount = count;
    jQuery.each(items, function(){
        delete this[validField]; 
    });
};

/**创建表体**/
jetsennet.ui.GridList.prototype.createBody = function () {
    if(el(this.instanceId + "-div-body") != null && el(this.instanceId + "-tab-body") != null) {
        return ;
    }
    var content = [];
    content.push("<div id='"+ this.instanceId + "-div-body' class='"+ this.className +"-body' style='height:100%;width:100%'>");
    content.push("<table id='"+ this.instanceId + "-tab-body' class='"+ this.className +"-body' cellspacing='0' cellpadding='0'>");
    content.push("<tbody></tbody></table></div>");
    this.container.innerHTML = this.container.innerHTML + content.join("");
};

/**设置属性，此方法用于在innerHTML修改之后**/
jetsennet.ui.GridList.prototype.setProperties = function() {
    this.headContainer = el(this.instanceId + "-div-head");
    this.headTable = el(this.instanceId + "-tab-head");
    this.theadTable = jQuery(this.headTable).children("tbody")[0];
    this.bodyContainer = el(this.instanceId + "-div-body");
    this.bodyTable = el(this.instanceId + "-tab-body");
    this.tbodyTable = jQuery(this.bodyTable).children("tbody")[0];
};

/**填充表体数据**/
jetsennet.ui.GridList.prototype.rendData = function () {
    var owner = this;
    var content = [];
    if (!jetsennet.util.isNullOrEmpty(this.parentField)) {
        var rowNum = 0;
        jQuery.each(this.objItems, function() {
            rowNum = owner.rendSubItem(this, 0, rowNum, content);
        });
    } else {
        jQuery.each(this.objItems, function(rowNum) { 
            owner.rendItem(this, false, 0, rowNum, content);
        });
    }
    jQuery(this.tbodyTable).html(content.join(""));
};

/**树表情况下，递归生成行**/
jetsennet.ui.GridList.prototype.rendSubItem = function (item, treeLevel, rowNum, content) {
    var childs = item[this.GRIDTREE_CHILDREN_FIELD]||[];
    this.rendItem(item, childs.length>0, treeLevel++, rowNum++, content);
    jQuery.each(childs, function(owner){
        rowNum = owner.rendSubItem(this, treeLevel, rowNum, content);
    }, [this]);
    return rowNum;
};

/**生成行**/
jetsennet.ui.GridList.prototype.rendItem = function (itemObj, hasItem, treeLevel, rowNum, content) 
{
    var row = (this.dataType == GridListConstant.DataType.DOM && this.xsltTable) ? this.xsltTable.tBodies[0].rows[rowNum+1] : null;
    var isOpen = this.treeOpenAll?true:this.treeOpenLevel>=treeLevel;
    var idValue = "";
    if (!jetsennet.util.isNullOrEmpty(this.parentField)) {
        idValue = itemObj[this.idField];
        var group = itemObj[this.parentField];
        content.push("<tr id='"+(this.instanceId + "-row-" + idValue)+"' rid='"+idValue+"' rgroup='"+group+"' isopen='"+(isOpen?1:0)+"' style='display:"+(isOpen?"":"none")+";'");
    } else {
        content.push("<tr");
    }
    this._attachAttributes(content, row);   //xslt行属性
    if(this.attachAttributes.length>0) {    //附加属性
        jQuery.each(this.attachAttributes, function(){
            content.push(" "+this.name+ "='"+ itemObj[this.field].replace(/'/g, '') +"'");
        });
    }
    content.push(">");
    var owner = this;
    jQuery.each(this.columns, function(index) {
        content.push("<td align='"+(this.align||"left")+"' class='"+(this.wrap?owner.className+"-wraptd":"")+"'");
        owner._attachAttributes(content, row?row.cells[index]:null);   //xslt列属性
        if(treeLevel > 0) {
            if (owner.treeControlIndex == index) {
                content.push(" style='padding-left:"+(treeLevel * owner.treeLevelPadding)+"px;'");
            }
            else if (this.levelPadding && (this.levelPadding/1) > 0) {
                content.push(" style='padding-left:"+(treeLevel * this.levelPadding)+"px;'");
            }
        } 
        var cellValue = "";
        if(this.fieldName) {
            var cellValues = [];    //  获取单元格值
            var tmpFields = this.fieldName.split(",");
            for (var i = 0; i < tmpFields.length; i++) {
                cellValues.push(itemObj[tmpFields[i]]);
            }
            cellValue = cellValues[0];
            if(this.format && jQuery.isFunction(this.format)) { //  格式化值
                cellValue = this.format(cellValue, cellValues, hasItem, treeLevel, itemObj);
            }else if(owner.escape || this.escape){
                cellValue = jetsennet.xml.xmlEscape(cellValue);
            }
            if(this.hasOwnProperty("title")) {
                if(this.title === false || this.title === "false") {}
                else if(this.title === true || this.title === "true") {
                    content.push(" title=\""+cellValue+"\"");
                } else {
                    content.push(" title=\""+this.title+"\"");
                }
            }
        }
        content.push(">");
        if(!owner.enableMultiRow) {
            content.push("<div class='"+owner.className + "-body-inner'>");
        }
        if (owner.treeControlIndex == index) {
            if (hasItem) {
                var imageSrc = (isOpen ? owner.folderOpenImage : owner.folderCloseImage);
                content.push("<i id='"+ (this.instanceId + "-tree-" + idValue)+"' class='"+ owner.className + "-tree-icon tree-ctrl-icon " + imageSrc + "'></i>");
            }
            else if (!jetsennet.util.isNullOrEmpty(owner.itemImage)) {
                content.push("<i src='"+ owner.itemImage +"' class='"+ owner.className +"-tree-icon'></i>");
            }
        }
        if(this.fieldName) {
            if (this.isCheck && this.checkName && !jetsennet.util.isNullOrEmpty(cellValue)) {   //  复选框
                content.push("<span class='jetsen-checkbox jetsen-checkbox-chk-one' name='"+ this.checkName +"' value='"+ cellValue +"' checkid='"+(this.checkId||this.checkName + "-all")+"'");
                jQuery.each(this.attachParam||[], function(){
                    content.push(" " + this.key + "='"+ itemObj[this.value].replace(/'/g, '') +"'");
                });
                content.push(">&nbsp;</span>");
            }
            else {
                content.push(cellValue);
            }
        }
        if(!owner.enableMultiRow) {
            content.push("</div>");
        }
        content.push("</td>");
    });
    content.push("<td class='"+(this.className + "-body-autotd")+"'></td>");
    content.push("</tr>");
};

/**控制滚动条**/
jetsennet.ui.GridList.prototype.ctrlScroll = function () {
    
    if(!jQuery(this.bodyContainer).data("jsp")) {
        jetsennet.require(["mousewheel", "scrollpane"]);
        var owner = this;
        var lstSize = null;
        jQuery(this.bodyContainer).bind("jsp-initialised", function(event, resize){
            var w = jQuery(this).width();
            var h = jQuery(this).height();
            if(w <=0 || h<=0) {
                return;
            }
            if(!lstSize || lstSize.width != w || lstSize.height != h) {
                owner.refreshSize();
                if(lstSize && owner.onresize) { owner.onresize(); }
                lstSize = {height: h, width: w};
            }
            jQuery(this).find(".jspContainer > .jspHorizontalBar > .jspTrack > .jspDrag").bind("mousedown.jsp", function(e){
                jQuery("html").bind("mousemove.jsp", function(evt){
                    var scrollLeft = Math.abs(parseInt(jQuery(owner.bodyTable).parent().css("left")));
                    owner.headContainer.scrollLeft = scrollLeft;
                    var hScrollLeft = owner.headContainer.scrollLeft;
                    if (hScrollLeft != scrollLeft) {
                        jQuery(owner.bodyContainer).data("jsp").scrollToX(hScrollLeft, false);
                    }
                });
            });
        });
        jQuery(this.bodyContainer).jScrollPane({
            autoReinitialise: true
        });
    } 
};

/**刷新尺寸大小**/
jetsennet.ui.GridList.prototype.refreshSize = function () {
    //  控制空白行
    var rowHeight = this.blankRowHeight||29;
    var containerHeight = jQuery(this.bodyContainer).height();      //  容器高度
    var actualHeight = this.tbodyTable.rows.length * rowHeight;     //  实际高度
    var theoryHeight = this.dataCount * rowHeight;                  //  理论高度
    while(actualHeight + rowHeight < containerHeight) {
        var tr = jQuery("<tr>").attr("blank", "fill-blank").appendTo(this.tbodyTable);
        jQuery.each(this.columns, function(owner) {
            var td = jQuery("<td>&nbsp;</td>").attr("align", this.align||"left").appendTo(tr);
            if(this.wrap) {
                td.addClass(owner.className + "-wraptd");
            }
        }, [this]);
        jQuery("<td>").addClass(this.className + "-body-autotd").appendTo(tr);
        actualHeight += rowHeight;
    }
    if(theoryHeight < containerHeight) {
        while(actualHeight > containerHeight) {
            var rows = this.tbodyTable.rows;
            var row = jQuery(rows[rows.length-1]);
            if(row.attr("blank")) {
                actualHeight -= row.height();
                row.remove();
            } else {
                break;
            }
        }
    } else if(actualHeight > theoryHeight){
        while(actualHeight > theoryHeight) {
            var rows = this.tbodyTable.rows;
            var row = jQuery(rows[rows.length-1]);
            if(row.attr("blank")) {
                actualHeight -= row.height();
                row.remove();
            } else {
                break;
            }
        }
    }
    
    var scrollWidth = jQuery(this.bodyContainer).find(".jspVerticalBar").width()||8;
    //  控制列宽
    var divWidth = jQuery(this.container).width() - scrollWidth;
    var fixColumnWidth = 0 ;    //计算固定值
    var minColumnSize = 0;
    jQuery.each(this.columns, function(minsize){
        if(!this.percent && this.display){
            fixColumnWidth += this.width ;
        } else if(this.percent && this.display){
            minColumnSize += minsize;
        }
    }, [this.columnMinWidth]);
    jQuery.each(this.columns, function(gap, min, def){
        if(this.percent && this.display) {
            if(gap > min) {
                this.width = this.currentPercent * gap;
            } else {
                this.width = def;
            }
        }
    }, [divWidth-fixColumnWidth, minColumnSize, this.columnMinWidth]);
    jQuery(this.headTable).children("colgroup").remove();
    jQuery(this.bodyTable).children("colgroup").remove();
    var headRows = this.theadTable.childNodes ;
    var bodyRows = this.tbodyTable.childNodes;
    jQuery(headRows).children().show();
    jQuery(bodyRows).children().show();
    
    var colcontent = ["<colgroup>"];
    var totalWidth = 0;
    jQuery.each(this.columns, function(index) {
        if(this.display) {
            colcontent.push("<col style='width:"+this.width+"px;' />");
            totalWidth += this.width;
        } else {
            colcontent.push("<col style='display:none;' />");
            for (var i = 0; i < headRows.length; i++) {
                jQuery(headRows[i].childNodes[index]).hide();
            }
            for (var i = 0; i < bodyRows.length; i++) {
                jQuery(bodyRows[i].childNodes[index]).hide();
            }
        }
    });
    colcontent.push("<col />");
    colcontent.push("</colgroup>");
    var headWidth = totalWidth + scrollWidth;
    jQuery(this.headTable).width(headWidth).css("min-width", "100%");
    jQuery(this.bodyTable).width(totalWidth).css("min-width", "100%");
    jQuery(colcontent.join("")).insertBefore(this.tbodyTable);
    jQuery(colcontent.join("")).insertBefore(this.theadTable);
    
    if(jQuery(this.bodyContainer).data("jsp")) {
        var scrollLeft = Math.abs(parseInt(jQuery(this.bodyTable).parent().css("left")));
        this.headContainer.scrollLeft = scrollLeft;
        var hScrollLeft = this.headContainer.scrollLeft;
        if (hScrollLeft != scrollLeft) {
            jQuery(this.bodyContainer).data("jsp").scrollToX(hScrollLeft, false);
        }
    }
};

/**重选行**/
jetsennet.ui.GridList.prototype.reselectRow = function (reselect) {
    if(reselect === false) {
        this.selectedRows = [];
    } else if(reselect === true || this.enableReselectRows) {
        var rows = this.tbodyTable.rows;
        for (var i = 0; i < this.selectedRows.length; i++) {
            rows[this.selectedRows[i]].className = 'selected';
        }
    } else {
        this.selectedRows = [];
    }
};

/**选择行**/
jetsennet.ui.GridList.prototype.selectRow = function (iRowIndex, bMultiple) {
    if (!this.enableSelectRows) { return; } //列必须可选
    if ((iRowIndex < 0) || (iRowIndex > this.dataCount)) {
        return ;
    }
    var rows = this.tbodyTable.rows;
    var bSelect = true;
    if ((!bMultiple) || (!this.enableMultiSelect)) {
        for (var i = 0; i < this.selectedRows.length; i++) {
            rows[this.selectedRows[i]].className = "";
        }
        this.colorEvenRows();
        this.selectedRows = [];
    } else {
        for (var i = 0; i < this.selectedRows.length; i++) {
            if (this.selectedRows[i] == iRowIndex) {
                var className = (iRowIndex & 1) ? 'odd' : 'even';
                if (className != rows[iRowIndex].className)
                    rows[iRowIndex].className = className;
                this.selectedRows.splice(i, 1);
                bSelect = false;
                break;
            }
        }
    }
    if (bSelect) {
        this.selectedRows.push(iRowIndex);
        rows[iRowIndex].className = 'selected';
    }
    if (this.onselect) { 
        if(this.enableReturnObj) {
            var objlst = [];
            jQuery.each(this.selectedRows, function(){
                objlst.push(jQuery(rows[this]).data("item"));
            });
            this.onselect(this.selectedRows, objlst); 
        } else {
            this.onselect(this.selectedRows); 
        }
    }
    return 0;
};

/**上下左右键选中行**/
jetsennet.ui.GridList.prototype.handleRowKey = function (e) {
    var iKeyCode = (e) ? e.keyCode : window.event.keyCode;
    var selectedRow = -1;
    if (this.selectedRows.length != 0) {
        selectedRow = this.selectedRows[this.selectedRows.length - 1];
    }
    if (iKeyCode == 38) {   //  up
        if (selectedRow > 0) {
            this.selectRow(selectedRow - 1);
        }
    } else if (iKeyCode == 40) {    //down
        if (selectedRow < this.dataCount - 1) {
            this.selectRow(selectedRow + 1);
        }
    } else if (iKeyCode == 33) {    //page up
        if (selectedRow > 10) {
            this.selectRow(selectedRow - 10);
        } else {
            this.selectRow(0);
        }
    } else if (iKeyCode == 34) {    //page down
        if (selectedRow < this.dataCount - 10) {
            this.selectRow(selectedRow + 10);
        } else {
            this.selectRow(this.dataCount - 1);
        }
    }
};

/**表格行着色**/
jetsennet.ui.GridList.prototype.colorEvenRows = function () {
    if(this.enableColorRows) {
        var nodes = this.tbodyTable.rows;
        var index = 0;
        for (var i = 0; i < nodes.length; i++) {
            var nclass = (index & 1) ? 'odd' : 'even';
            if (nclass != nodes[i].className) {
                nodes[i].className = nclass;
            }
            if (nodes[i].style.display == "") {
                index++;
            }
        }
    }
};

/**给表头注册事件**/
jetsennet.ui.GridList.prototype.assignEventHandlers = function () {
    var owner = this;
    /**内部元素事件提前，以停止事件冒泡，主要是在xslt或者是dom数据源的情况**/
    jQuery(this.container).find("span.jetsen-checkbox").unbind("click").bind("click", function(e){
        var $this = jQuery(this);
        if($this.hasClass("jetsen-checkbox-chk-all")) {
            $this.toggleClass("checked");
            if ($this.hasClass("checked")) {
                jQuery("[name='" + $this.attr("checkname") + "']").addClass("checked");
            } else {
                jQuery("[name='" + $this.attr("checkname") + "']").removeClass("checked");
            }
        } else if($this.hasClass("jetsen-checkbox-chk-one")) {
            $this.toggleClass('checked');
            jQuery("#" + $this.attr("checkid")).removeClass('checked');
        }
        return false;
    });
    jQuery(this.container).find("div."+this.className+"-head-dropbtn").unbind("click").bind("click", function(e){
        owner.showCheckMenu(this, jQuery(this).attr("checkname"));
        return false;
    });
    jQuery(this.container).find("i.tree-ctrl-icon."+this.className+"-tree-icon").bind("click", function(e){
        owner.treeControlEvent(this);
        return false;
    });
    
    if(this.isInit) { return ; }
    this.headerOper = GridListConstant.Operator.COL_HEAD_NONE; //表头操作类型
    jQuery(this.container).bind("click", function(e){
        owner.click(e);
    }).bind("dblclick", function(e){
        owner.dblclick(e);
    }).bind("mousedown", function(e){
        owner.mouseDown(e);
    }).bind("mousemove", function(e){
        owner.mouseMove(e);
    }).bind("mouseup", function(e){
        owner.mouseUp(e);
    }).bind("contextmenu", function(e){
        return owner.contextmenu(e);
    }).bind("selectstart", function(e){
        return true;
    }).bind("keydown", function(e){
        owner.handleRowKey(e);
    });
};

/**确认事件类型**/
jetsennet.ui.GridList.prototype.checkHeaderOperation = function (el, x) {
    var left, right,  r;
    if (el.tagName != "TD") {
        var temp = jQuery(el).closest("td");
        if (temp.size() > 0) {
            el = temp[0];
        }
    }
    if (el.tagName == 'TD' && jQuery(el).closest("div").hasClass(this.className + '-head')) {
        if (el.cellIndex == this.columns.length) {
            jQuery(this.container).css("cursor", "default");
            this.headerOper = GridListConstant.Operator.COL_HEAD_NONE;
            this.headerData = null;
            return;
        }
        left = jetsennet.util.getPosition(el, 1).left;
        right = left + el.offsetWidth;
        r = Math.abs(right - x);
        if (r < 5 && this.enableResizeColumns) {
            this.headerOper = GridListConstant.Operator.COL_HEAD_EDGE;
            jQuery(this.container).css("cursor", "e-resize");
            this.headerData = null;
            var pos = jetsennet.util.getPosition(jQuery(this.container)[0], 0);
            this.headerData = [el, x, pos.top, pos.left - jQuery(this.bodyContainer)[0].scrollLeft, el.cellIndex, el.cellIndex];
        } else {
            this.headerOper = GridListConstant.Operator.COL_HEAD_OVER;
            jQuery(this.container).css("cursor", "default");
            this.headerData = null;
            var pos = jetsennet.util.getPosition(jQuery(this.container)[0], 0);
            this.headerData = [el, x, pos.top, pos.left - jQuery(this.bodyContainer)[0].scrollLeft, el.cellIndex, el.cellIndex];
        }
    } else {
        this.headerOper = GridListConstant.Operator.COL_HEAD_NONE;
        jQuery(this.container).css("cursor", "default");
        this.headerData = null;
    }
};

/**鼠标单击**/
jetsennet.ui.GridList.prototype.click = function (e) {
    var el = (e) ? e.target : window.event.srcElement;
    var eventObjType = null;
    try { eventObjType = el.type; } catch (e) { }
    if (el.tagName == "INPUT" && eventObjType == "checkbox")
        return;
    if (el.tagName != "TD") {
        var tempTd = jQuery(el).closest("td");
        if (tempTd.size() > 0) {
            el = tempTd[0];
        }
    }
    if (el.tagName == 'TD') {
        var tempTab = jQuery(el).closest("table");
        if (tempTab.hasClass(this.className + '-body')) {
            if (el.parentNode.rowIndex >= this.dataCount) {return;}
            this.selectRow(el.parentNode.rowIndex, (e) ? e.ctrlKey : window.event.ctrlKey);
            if (jQuery.isFunction(this.onrowclick)) {
                if(this.enableReturnObj) {
                    this.onrowclick(jQuery(el.parentNode).data("item"), el);
                } else {
                    this.onrowclick(el.parentNode, el);
                }
            }
        } else if (tempTab.closest("div").hasClass(this.className + '-head')) {
            if (jQuery.isFunction(this.onheaderclick) && el.cellIndex < this.columns.length) {
                this.onheaderclick(this.columns[el.cellIndex]);
            }
        }
    }
};

/**鼠标双击**/
jetsennet.ui.GridList.prototype.dblclick = function (e) {
    var el = (e) ? e.target : window.event.srcElement;
    var eventObjType = null;
    try { eventObjType = el.type; } catch (e) { }
    if (el.tagName == "INPUT" && eventObjType == "checkbox")
        return;
    if (el.tagName != "TD") {
        var temp = jQuery(el).closest("td");
        if (temp.size() > 0) {
            el = temp[0];
        }
    }
    if (el.tagName == 'TD') {
        var tempTab = jQuery(el).closest("table");
        if (tempTab.hasClass(this.className + '-body')) {
            if (el.parentNode.rowIndex >= this.dataCount) { return;}
            if (jQuery.isFunction(this.ondoubleclick)){
                if(this.enableReturnObj) {
                    this.ondoubleclick(jQuery(el.parentNode).data("item"), el);
                } else {
                    this.ondoubleclick(el.parentNode, el);
                }
            }
        } else if (tempTab.closest("div").hasClass(this.className + '-head')) {
            return;
        }
    }
};

/**鼠标按下事件-私有**/
jetsennet.ui.GridList.prototype.mouseDown = function (e) {
    var el = (e) ? e.target : window.event.srcElement;
    var x = (e) ? e.pageX : window.event.clientX;
    if (el.tagName != "TD") {
        var temp = jQuery(el).closest("td");
        if (temp.size() > 0) {
            el = temp[0];
        }
    }
    if (el.tagName == 'TD' && jQuery(el).closest("div").hasClass(this.className + '-head')) {
        document.body.onselectstart = function (e) { return false; };
        this.isHeaderMouseDown = true;
        if (this.headerOper == GridListConstant.Operator.COL_HEAD_NONE) {
            this.checkHeaderOperation(el, x);
        }
        if (this.headerOper == GridListConstant.Operator.COL_HEAD_EDGE) {
            this.headerOper = GridListConstant.Operator.COL_HEAD_SIZE;
        } else if (this.headerOper == GridListConstant.Operator.COL_HEAD_OVER) {
            this.headerOper = GridListConstant.Operator.COL_HEAD_DOWN;
            jQuery(this.headerData[0]).addClass(this.className + '-active-header');
        }
    }
};

/**鼠标移动事件-私有**/
jetsennet.ui.GridList.prototype.mouseMove = function (e) {
    var el, x, pagex, owner = this;
    el = (e) ? e.target : window.event.srcElement;
    pagex = x = (e) ? e.pageX : window.event.clientX;
    if(jQuery(this.container).find(".jspHorizontalBar").length>0) {
        pagex += Math.abs(parseInt(jQuery(this.bodyTable).parent().css("left")));
    }
    
    if (this.isHeaderMouseDown && (this.headerOper == GridListConstant.Operator.COL_HEAD_DOWN) && (this.enableMoveColumns) && Math.abs(this.headerData[1] - x) > 20) {
        this.headerOper = GridListConstant.Operator.COL_HEAD_MOVE;
        jQuery(this.container).css("cursor", "move");
        var pos = jetsennet.util.getPosition(jQuery(this.container)[0], 0);
        if (!this.moveEl) {
            this.moveEl = jQuery("<div/>").css({ top: pos.top,
                width: this.headerData[0].clientWidth,
                height: this.headerData[0].clientHeight - 2
            }).addClass(this.className + '-move-header').html(this.headerData[0].innerText).appendTo("body")[0];
            this.moveEl.onmouseup = function (e) { owner.mouseUp(e); };
        } else { this.moveEl.firstChild.nodeValue = this.headerData[0].firstChild.nodeValue; }
        if (!this.moveSplitEl) {
            this.moveSplitEl = jQuery("<div/>").addClass(this.className + '-separator-header').css({ top: pos.top, height: this.headerData[0].clientHeight }).appendTo("body")[0];
        }
    }
    if (this.isHeaderMouseDown && this.headerOper == GridListConstant.Operator.COL_HEAD_MOVE && this.moveEl != null) {
        this.moveEl.style.left = (x + 15) + 'px';
        var headCols = jQuery(this.headTable).children("tbody").children("tr").children("td");
        var ox = 0, rx = pagex - this.headerData[3];
        for (var i = 0; i < this.columns.length; i++) {
            ox += headCols[i].offsetWidth;
            if (ox >= rx) { break; }
        }
        this.moveSplitEl.style.left = (jetsennet.util.getPosition(headCols[i], 0).left - 1) + "px";
        this.headerData[5] = i;
    }
    if (this.headerOper == GridListConstant.Operator.COL_HEAD_SIZE) {
        if (!this.resizeSplitEl) {
            var pos = jetsennet.util.getPosition(jQuery(this.headContainer)[0], 0);
            var headerHeight = jQuery(this.headContainer)[0].clientHeight;
            this.resizeSplitEl = jQuery("<div/>").css({ top: pos.top + headerHeight,
                height: jQuery(this.bodyContainer).innerHeight()
            }).addClass(this.className + '-resize-split').appendTo("body")[0];
            this.resizeSplitEl.onmouseup = function (e) { owner.mouseUp(e); };
        }
        this.resizeSplitEl.style.left = x + "px";
    } else {
        if (!this.isHeaderMouseDown) {
            this.checkHeaderOperation(el, x);
        }
    }
};

/**鼠标放开事件-私有**/
jetsennet.ui.GridList.prototype.mouseUp = function (e) {
    if (!this.isHeaderMouseDown) { return;}
    var el = (e) ? e.target : window.event.srcElement;
    var x = (e) ? e.pageX : window.event.clientX;
    document.body.onselectstart = function (e) { return true; };
    if (this.headerOper == GridListConstant.Operator.COL_HEAD_MOVE) {
        if (this.moveEl) {
            this.moveEl.parentNode.removeChild(this.moveEl);
            this.moveEl = null;
        }
        if (this.moveSplitEl) { this.moveSplitEl.parentNode.removeChild(this.moveSplitEl); this.moveSplitEl = null; }
        this.headerData[5] = (this.headerData[5]+ 1 >=this.columns.length)?this.columns.length-1 : this.headerData[5]; 
        if (this.headerData[4] != this.headerData[5]) {
            this.moveColumn(this.headerData[4], this.headerData[5]);
            this.columnChanged(3);
        }
    } else if (this.headerOper == GridListConstant.Operator.COL_HEAD_SIZE) {
        if (this.resizeSplitEl) { this.resizeSplitEl.parentNode.removeChild(this.resizeSplitEl); this.resizeSplitEl = null; }
        if (this.enableResizeColumns) {
            var w = this.headerData[0].offsetWidth + x - this.headerData[1];
			w = Math.round(w);
            var index = this.headerData[4];
            if (w < this.columnMinWidth){ w = this.columnMinWidth;}
            if (this.columns[index].width != w) {
                this.columns[index].percent = false ;
                this.columns[index].width = w ;
                this.columnChanged(1);
            }
        }
    } else if (this.headerOper == GridListConstant.Operator.COL_HEAD_DOWN) {
        if (jetsennet.getEvent().button == 1 || jetsennet.getEvent().button == 0) {
            if (el.cellIndex != null)
                this.sort(el.cellIndex);
            else if (el.parentNode.cellIndex != null)
                this.sort(el.parentNode.cellIndex);
        }
    }
    this.isHeaderMouseDown = false;
    if (this.headerData) {
        jQuery(this.headerData[0]).removeClass(this.className + '-active-header');
    }
    if (this.headerOper != GridListConstant.Operator.COL_HEAD_NONE) {
        jQuery(this.container).css("cursor", "default");
        this.headerData = null;
        this.headerOper = GridListConstant.Operator.COL_HEAD_NONE;
    }
};

/**列交换**/
jetsennet.ui.GridList.prototype.moveColumn = function (iCol, iNew) {
    var oCol, oBefore;
    if(iNew > iCol) {
        this.columns[iCol].position = this.columns[iNew].position;
        for(var i=iNew; i>iCol; i--) {
            this.columns[i].position = this.columns[i].position - 1; 
        }
        iNew ++ ;
    } else {
        this.columns[iCol].position = this.columns[iNew].position;
        for(var i=iNew; i<iCol; i++) {
            this.columns[i].position = this.columns[i].position + 1; 
        }
    }
    this.columns.sort( function(col1, col2) {   //  将表格列重新排列
        if (col1.position > col2.position)  
            return 1;
        else        
            return -1;
        }
    );
    /* Move header */
    oCol = this.headTable.getElementsByTagName('colgroup')[0].getElementsByTagName('col')[iCol];
    oBefore = this.headTable.getElementsByTagName('colgroup')[0].getElementsByTagName('col')[iNew];
    oCol.parentNode.insertBefore(oCol, oBefore);
    
    oCol = this.headTable.tBodies[0].rows[0].cells[iCol];
    oBefore = this.headTable.tBodies[0].rows[0].cells[iNew];
    this.headTable.tBodies[0].rows[0].insertBefore(oCol, oBefore);
    /* Move table */
    oCol = this.bodyTable.getElementsByTagName('colgroup')[0].getElementsByTagName('col')[iCol];
    oBefore = this.bodyTable.getElementsByTagName('colgroup')[0].getElementsByTagName('col')[iNew];
    oCol.parentNode.insertBefore(oCol, oBefore);
    
    var aRows = this.tbodyTable.rows;
    var rows = aRows.length;
    for (var i = 0; i < rows; i++) {
        oCol = aRows[i].cells[iCol];
        if (oCol == null)
            continue;
        oBefore = aRows[i].cells[iNew];
        aRows[i].insertBefore(oCol, oBefore);
    }
};

/**表格右键**/
jetsennet.ui.GridList.prototype.contextmenu = function (e) {
    var el = (e) ? e.target : window.event.srcElement;
    var eventObjType = null;
    try { eventObjType = el.type; } catch (e) { }
    if (eventObjType == "checkbox")
        return false;
    if (el.tagName != "TD") {
        var temp = jQuery(el).closest("td");
        if (temp.size() > 0) {
            el = temp[0];
        }
    }
    if (el.tagName == 'TD') {
        var tempTab = jQuery(el).closest("table");
        if (tempTab.hasClass(this.className + '-body')) {
            if (el.parentNode.rowIndex >= this.dataCount) { return;}
            this.selectRow(el.parentNode.rowIndex, false);
            if (jQuery.isFunction(this.oncontextmenu)) {
                if(this.enableReturnObj) {
                    this.oncontextmenu(jQuery(el.parentNode).data("item"), el);
                } else {
                    this.oncontextmenu(el.parentNode, el);
                }
            }
        } else if (tempTab.closest("div").hasClass(this.className + '-head')) {
            this.showRightMenu(e);
        }
    }
    return false;
};

/**表头右键菜单**/
jetsennet.ui.GridList.prototype.showRightMenu = function (e) {
    if (this.enableHideColumns) {
        var owner = this;
        var menuControl = el(this.instanceId + '-head-menu');
        if (menuControl == null) {
            jetsennet.require(["menu"]);
            var headMenu = jQuery.extend(new jetsennet.ui.Menu(""), { menuWith: 150 });
            var menuCol = headMenu;
            for (var i = 0; i < this.columns.length; i++) {
                var columnName = this.columns[i].name;
                if (!jetsennet.util.isNullOrEmpty(columnName)) {
                    var subMItem = new jetsennet.ui.CheckMenuItem(columnName);
                    subMItem.checked = this.columns[i].display;
                    subMItem.checkValue = this.columns[i].index;
                    subMItem.oncheckchanged = function () {
                        if (!this.checked) {    // 必须显示至少一列
                            var displayCount = 0;
                            for (var j = 0; j < owner.columns.length; j++) {
                                if (owner.columns[j].display) {
                                    displayCount++;
                                    if (displayCount > 1)
                                        break;
                                }
                            }
                            if (displayCount <= 1) {
                                jetsennet.cancelEvent();
                                return;
                            }
                        }
                        for (var i = 0; i < owner.columns.length; i++) {
                            if (owner.columns[i].index == this.checkValue) {
                                owner.columns[i].display = this.checked;
                                break;
                            }
                        }
                        owner.columnChanged(2);
                    };
                    menuCol.addItem(subMItem);
                }
            }
            headMenu.render().attr("id", this.instanceId + '-head-menu').popup();
        } else {
            jetsennet.popup(menuControl);
        }
    }
};

/**列状态改变，包括了1:大小、3:位置、2是否显示**/
jetsennet.ui.GridList.prototype.columnChanged = function (type) {
    var contents = [];
    var cookieColumns = [];
    jQuery.each(this.columns, function(){
        /**cookie解读：索引index为i的列，是否显示s，显示在第几列p，显示的宽度为w**/
        cookieColumns.push({ i: this.index, s: this.display ? 1 : 0, p: this.position, w: this.percent?this.initialPercent:this.width });
    });
    contents.push("<t>");
    jQuery.each(cookieColumns, function(){
        contents.push(jetsennet.xml.serialize(this, "c"));
    });
    contents.push("</t>");
    if (this.oncolumnchanged && jQuery.isFunction(this.oncolumnchanged)) {
        this.oncolumnchanged(type, contents.join(""));
    } else {
        if (this.enableRemStatus) {
            jetsennet.util.cookie(this.cookiename, contents.join(""));
        }
    }
    //  交换位置无需刷新尺寸
    if(type != 3) {
        var initPercent = 0;
        var curPercent = 0;
        jQuery.each(this.columns, function(){
            if(this.percent && this.display) {
                initPercent += this.initialPercent;
                curPercent += this.currentPercent;
            }
        });
        if(curPercent!=0 || curPercent != 1) {
            jQuery.each(this.columns, function(totalPercent){
                if(this.percent && this.display) {
                    this.currentPercent = this.initialPercent/totalPercent;
                }
            }, [initPercent]);
        }
        this.refreshSize();
    }
};

/**表头单击排序**/
jetsennet.ui.GridList.prototype.sort = function (iCol, bDesc) {
    if (!this.enableSortRows || (this.sortCol == -1 && iCol == -1) || this.columns.length <= iCol) { return; }
    if ((jQuery.isFunction(this.ondatasort) && this.columns[iCol].sortField)//自定义方法排序
        || (this.columns[iCol].hasOwnProperty("sortType") && this.columns[iCol].sortType != GridListConstant.Sort.SORT_NONE)) {
        if (bDesc == null) {
            bDesc = false;
            if ((!this.sortDescending) && (iCol == this.sortCol)) { bDesc = true; }
        }
        this.sortCol = iCol;
        this.sortDescending = bDesc;
        if (jQuery.isFunction(this.ondatasort) && this.columns[iCol].sortField) {
            this.ondatasort(this.columns[iCol].sortField, bDesc);
        } else if (jetsennet.util.isNullOrEmpty(this.parentField)) { //非树表提供默认的排序方式
            this.gridRending();
            if (jQuery(this.bodyTable).length<1) return;
            var rows = jQuery(this.bodyTable).children("tbody").children("tr");
            var l = this.dataCount;
            var tempRows = new Array(l);
            for (var i = 0; i < l; i++) {
                var cellValue = jQuery(rows[i].cells[iCol]).text();
                tempRows[i] = {
                    value: this.columns[iCol].sortType == GridListConstant.Sort.SORT_NUMBER ? parseFloat(cellValue) : cellValue,
                    element: rows[i]
                };
            };
            tempRows.sort(function compare(n1, n2) {
                if (n1.value < n2.value)
                    return -1;
                if (n2.value < n1.value)
                    return 1;
                return 0;
            });
            if (bDesc)
                tempRows.reverse();
            var body = jQuery(this.bodyTable).children("tbody");
            for (var i = l - 1; i >= 0; i--) {
                body.prepend(tempRows[i].element);
            }
            this.gridRendOver();
        }
        this.setSortStatus();
        this.colorEvenRows();
    }
};

/**重置排序图标-私有**/
jetsennet.ui.GridList.prototype.setSortStatus = function () {
    if (this.sortCol != null && this.sortCol != -1) {
        var imgSort = jQuery("#" + this.instanceId + "-sort-img");
        if (imgSort.size() == 0) {
            imgSort = jQuery("<i>", { id: this.instanceId + "-sort-img" });
        }
        var cell = jQuery(jQuery(this.headTable).children("tbody").children("tr").children("td")[this.sortCol]);
        var innerDiv = jQuery("> div", cell);
        if (innerDiv.size() > 0) {
            innerDiv.append(imgSort);
        } else {
            cell.append(imgSort);
        }
        imgSort.css({ display: "inline" }).attr("class", (this.sortDescending) ? this.sortDescImage : this.sortAscImage);
    }
};
//===========================================  对树状表格的支撑 ，未做修改         ====================
/**仅用于树状表格的根扰ID选择行**/
jetsennet.ui.GridList.prototype.selectRowById = function (id) {
    var row = el(this.instanceId + "-row-" + id);
    if (row != null) {
        this.selectRow(row.rowIndex, false);
        this.checkRowDisplay(row);
    }
};

/**树的展开与关闭事件-私有,树的展开与关闭不仅影响到当前级的子级，也影响当前级的深层次子级**/
jetsennet.ui.GridList.prototype.treeControlEvent = function (obj) {
    if (obj == null)
        return;
    var tr = obj.parentNode;
    while (tr && !"tr".equal(tr.tagName)) {
        tr = tr.parentNode;
    }
    var group = attributeOf(tr, "rid", "");
    var isOpen = attributeOf(tr, "isopen", "") == "1";
    var nodes = jQuery(this.bodyTable).children("tbody").children("tr[rgroup="+group+"]");
    jQuery.each(nodes, function(owner){
        owner.openOrCloseItems(this, isOpen);
    }, [this]);
    $(obj).attr('class', isOpen ? this.folderCloseImage : this.folderOpenImage).addClass("tree-ctrl-icon");
    tr.setAttribute("isopen", isOpen ? 0 : 1);
    this.colorEvenRows();
};

/**树的展开与关闭时深层次树的关联操作-私有,在树的深层次的打开和关闭上，需要保留树的原有状态**/
jetsennet.ui.GridList.prototype.openOrCloseItems = function (rowObj, isClose) {
    var group = attributeOf(rowObj, "rid", "");
    var isOpen = attributeOf(rowObj, "isopen", "") == "1";
    var nodes = jQuery(this.bodyTable).children("tbody").children("tr[rgroup="+group+"]");
    jQuery.each(nodes, function(owner){
        owner.openOrCloseItems(this, isClose ? true : (isOpen ? false : true));
    }, [this]);
    jetsennet.util.displayElements([rowObj], isClose ? false : true);
};

/**递归检查选取的行是否展开**/
jetsennet.ui.GridList.prototype.checkRowDisplay = function (row) {
    var group = attributeOf(row, "rgroup", "");
    var prow = el(this.instanceId + "-row-" + group);
    if (prow) {
        var isOpen = attributeOf(prow, "isopen", "") == "1";
        if (!isOpen) {
            this.treeControlEvent(el(this.instanceId + "-tree-" + group));
        }
        this.checkRowDisplay(prow);
    }
};
//===========================================  暴露的非核心，基本用不上的方法， 不再建议使用！未改          ====================
/**
添加表格行
rowItem是按当前表格列排列的一个数组
*/
jetsennet.ui.GridList.prototype.addRow = function (rowItem, bBefore) {

    if (!rowItem)
        return;
    var tbody = this.bodyTable.tBodies[0];
    var row = document.createElement("tr");
    for (var i = 0; i < this.columns.length; i++) {
        var td = document.createElement("td");
        row.appendChild(td);
        var cellValue = this.columns[i].format ? this.columns[i].format(rowItem[i], rowItem) : jetsennet.xml.xmlEscape(rowItem[i]);
        if (this.columns[i].isCheck && this.columns[i].checkName && !jetsennet.util.isNullOrEmpty(rowItem[i])) {   //  复选框
            td.innerHTML = "<span class='jetsen-checkbox jetsen-checkbox-chk-one' name='"+ this.columns[i].checkName +"' value='"+ cellValue +"' checkid='"+(this.columns[i].checkId||this.columns[i].checkName + "-all")+"'>&nbsp;</span>";
        }
        else {
            td.innerHTML = cellValue || "&nbsp;";
        }
        if (this.columns[i].align) {
            td.align = this.columns[i].align;
        }
    }
    var td = document.createElement("td");
    td.className = this.className + "-body-autotd";
    row.appendChild(td);
    if (bBefore && tbody.rows.length > 0) {
        tbody.insertBefore(row, tbody.rows[0]);
    }
    else {
        tbody.appendChild(row);
    }
};
/**获取表格行**/
jetsennet.ui.GridList.prototype.getRowCount = function () {
    return this.tbodyTable.rows.length;
};
//获取表格列数
jetsennet.ui.GridList.prototype.getColumnCount = function () {
    return this.columns.length;
};
//设置表头内容
jetsennet.ui.GridList.prototype.setHeadText = function (iColIndex, sValue) {
    if ((iColIndex < 0) || (iColIndex > this.columns.length - 1)) {
        return null;
    }
    var el = jQuery(this.headTable).children("tbody").children("tr").children("td")[iColIndex];
    if (el == null) {
        return null;
    }
    el.innerHTML = sValue;
};
//获取表格内容
jetsennet.ui.GridList.prototype.getCellValue = function (iRowIndex, iColIndex, bHTML) {

    if ((iRowIndex < 0) || (iRowIndex > this.rowCount - 1)) {
        return null;
    }
    if ((iColIndex < 0) || (iColIndex > this.columns.length - 1)) {
        return null;
    }
    var el = jQuery(jQuery(this.bodyTable).children("tbody").children("tr")[iRowIndex]).children("td")[iColIndex];
    if (el == null) {
        return null;
    }
    return (bHTML) ? el.innerHTML : jQuery(el).text();
};
//设置表格内容
jetsennet.ui.GridList.prototype.setCellValue = function (iRowIndex, iColIndex, sValue) {

    if ((iRowIndex < 0) || (iRowIndex > this.rowCount - 1)) {
        return;
    }
    if ((iColIndex < 0) || (iColIndex > this.columns.length - 1)) {
        return;
    }
    var el = jQuery(jQuery(this.bodyTable).children("tbody").children("tr")[iRowIndex]).children("td")[iColIndex];
    if (el == null) {
        return;
    }
    el.innerHTML = sValue;
};

/**
快捷方式
@Option GridList的属性
*/
jQuery.fn.gridlist = function (options) {
    var size = this.size();
    if (size == 0) {
        return null;
    }
    if (size > 1) {
        var result = [];
        var instanceId = valueOf(options, "instanceId", "");
        for (var s = 0; s < size; s++) {

            var newId = instanceId;
            if (instanceId != "" && s > 0) {
                newId = instanceId + "-" + s;
            }
            result.push(jQuery(this[s]).gridlist(jQuery.extend(options, { instanceId: newId })));
        }
        return result;
    }
    else {
        var gridlist = jQuery.extend(new jetsennet.ui.GridList(valueOf(options, "instanceId", "")), options);
        gridlist.bind(this[0], this.children("table")[0]);
        return gridlist;
    }
};


/**扩展带滚动条的表格*/
jQuery.createGridlist = function (gridId, columns, pagebarId, orderbyStr, pagechangeFunc, pageSize) {
    var pageBar = null ;
    if(pagebarId){
        pageBar = new jetsennet.ui.PageBar(pagebarId);
        pageBar.pageSize = pageSize ? pageSize : 20 ;
        pageBar.orderBy = orderbyStr ;
        pageBar.onpagechange = function () {
            if(jQuery.isFunction(pagechangeFunc)) {
                pagechangeFunc();
            }
        };
        pageBar.onupdate = function () {
            el(pagebarId).innerHTML = this.render();
        };
    }
    var gridlist = jQuery.extend(new jetsennet.ui.GridList(gridId), {
        columns : columns,
        enableReturnObj: true,
        getPageBar: function(){
            return pageBar ;
        },
        renderXML : function (xml){
            var xmlDoc  = xml ;
            if (typeof xml == 'string') {
                xmlDoc = new jetsennet.XmlDoc();
                xmlDoc.loadXML(xml);
            }
            this.dataSource = xmlDoc ;
            this.render(this.instanceId);
            if(pageBar)
            {
                pageBar.setRowCount(xmlDoc.documentElement.getAttribute("TotalCount"));
            }
        }
    });
    if(pageBar) {
        gridlist.ondatasort = function(sortfield, isDesc){
            pageBar.setOrderBy(sortfield, isDesc);
        };
    }
    return gridlist ;
};



