//=============================================================================
// jetsennet.ui.Tree  -- lixiaomin
// 通一个jetsennet.ui.Tree对象加载多个TreeItem对象来实现整个树
// 可通过jetsennet.ui.Trees对象来访问树
//=============================================================================	
jetsennet.addLoadedUri(jetsennet.getloadUri("jetsentree"));
jetsennet.importCss("jetsenui");
jetsennet.ui.Trees = {};
//=============================================================================
// jetsennet.ui.Tree
//=============================================================================
jetsennet.ui.Tree = function (treeName) {
    this.__typeName = "jetsennet.ui.Tree";
    this.treeName = treeName ? treeName : "JetsenTree";
    this.treeItems = [];
    this.selectedIndex = null;
    this.onselect = null;
    this.onunselect = null;
    this.onclick = null;
    this.oncheckchanged = null;
    this.oncontextmenu = null;
    this.onrender = null;

    jetsennet.ui.Trees[this.treeName] = this;
};
/**
添加树的子项
*/
jetsennet.ui.Tree.prototype.addItem = function (item) {
    item.parent = this;
    this.treeItems.push(item);
    return this;
};

jetsennet.ui.Tree.prototype.hide = function () {
    for (var i = 0; i < this.treeItems.length; i++) {
        this.treeItems[i].hideSubTree();
    }
};

jetsennet.ui.Tree.prototype.dispose = function () {
    jetsennet.ui.Trees[this.treeName] = null;
};
/**
通过此方法可以实现树的遍历
可以在遍历时通过查找方法返回真值跳出
*/
jetsennet.ui.Tree.prototype.getItem = function (/*提供查找的方法*/fun, bDeep) {
    for (var i = 0; i < this.treeItems.length; i++) {
        if (this.treeItems[i].__typeName == "jetsennet.ui.TreeItem") {
            if (fun(this.treeItems[i]))
                return this.treeItems[i];
            else if (bDeep) {
                var item = this.treeItems[i].getItem(fun, bDeep);
                if (item)
                    return item;
            }
        }
    }
    return null;
};
/**
通过index获取项
*/
jetsennet.ui.Tree.prototype.getItemByIndex = function (index) {
    var item = jetsennet.ui.Trees[this.treeName].trees[index];
    if (item != null) {
        return item;
    }
};
/**
选中树的项
如果项处理收缩状态，会自动展开
*/
jetsennet.ui.Tree.prototype.select = function (index) {
    if (jetsennet.ui.Trees[this.treeName].selectedIndex == index)
        return;
    var item = jetsennet.ui.Trees[this.treeName].trees[index];
    if (item != null) {
        item.select();
    }
};

jetsennet.ui.Tree.prototype.unselect = function (index) {
    var item = jetsennet.ui.Trees[this.treeName].trees[index];
    if (item != null) {
        item.unselect();
    }
};
/**显示树*/
jetsennet.ui.Tree.prototype.render = function (controlId) {
    jetsennet.ui.Trees[this.treeName].trees = {};

    var itemLen = this.treeItems.length;
    if (itemLen > 0) {
        var treeControl = jQuery("<div>", {}).addClass("jetsen-tree").appendTo("body");
        for (var i = 0; i < itemLen; i++) {
            this.treeItems[i].parent = this;
            if (this.treeItems[i].__typeName == "jetsennet.ui.TreeItem") {
                this.treeItems[i].render(this.treeName, i).css("paddingLeft", 5).appendTo(treeControl);
            }
        }
        if (controlId) {
            if (el(controlId) != null) {
                el(controlId).appendChild(treeControl[0]);
            }
            else {
                treeControl.attr("id", controlId);
            }
        }
        return treeControl;
    }
    return null;
};
/**
私有
树的点击事件，所有子级节点的点击事件都会触发
*/
jetsennet.ui.Tree.prototype.click = function (treeItem) {
    if (jQuery.isFunction(this.onclick))
        this.onclick(treeItem);
};
/**
私有
树的选中改变事件，所有子级节点的选中改变事件都会触发
*/
jetsennet.ui.Tree.prototype.checkChanged = function (treeItem) {
    if (jQuery.isFunction(this.oncheckchanged))
        this.oncheckchanged(treeItem);
};
/**
私有
树的右击事件
*/
jetsennet.ui.Tree.prototype.contextmenu = function (treeItem) {
    if (jQuery.isFunction(this.oncontextmenu)) {
        this.oncontextmenu(treeItem);
    }
};
/**私有*/
jetsennet.ui.Tree.prototype.treeSelected = function (index) {
    if (jQuery.isFunction(this.onselect))
        this.onselect(index);
};
/**私有*/
jetsennet.ui.Tree.prototype.treeUnSelected = function (index) {
    if (jQuery.isFunction(this.onunselect))
        this.onunselect(index);
};
/**
私有
树的展现事件
*/
jetsennet.ui.Tree.prototype.treeRender = function (treeItem) {
    if (jQuery.isFunction(this.onrender)) {
        this.onrender(treeItem);
    }
};
/**
创建树的快捷方式
通过提供数据源(xml),树的层级关系来自动创建树
*/
jetsennet.ui.Tree.createTree = function (treeName, treeXml, options) {
    var xmlDoc = new jetsennet.XmlDoc();
    xmlDoc.loadXML(treeXml);

    var tree = new jetsennet.ui.Tree(treeName);
    var treeOptions = jQuery.extend({ parentId: "0", parentField: "ParentId", itemName: "Record", textField: "Name", valueField: "Id", showCheck: false }, options);
    var paramFields = treeOptions.paramFields ? treeOptions.paramFields.split(",") : [];
    var nodes = xmlDoc.documentElement.selectNodes(treeOptions.itemName + "[" + treeOptions.parentField + "='" + treeOptions.parentId + "']");

    for (var i = 0; i < nodes.length; i++) {
        var valId = valueOf(nodes[i].selectSingleNode(treeOptions.valueField), "text", "");

        if (valId != treeOptions.parentId) {
            var treeParam = {};
            for (var j = 0; j < paramFields.length; j++) {
                treeParam[paramFields[j]] = valueOf(nodes[i].selectSingleNode(paramFields[j]), "text", "");
            }

            var subTree = new jetsennet.ui.TreeItem(valueOf(nodes[i].selectSingleNode(treeOptions.textField), "text", ""), null, null, null, treeParam);
            if (treeOptions.showCheck) {
                subTree.showCheck = true;
                subTree.checkValue = valId;
            }
            jetsennet.ui.Tree.createSubTree(xmlDoc, subTree, treeOptions.itemName, valId, treeOptions.parentField, treeOptions.textField, treeOptions.valueField, paramFields, treeOptions.showCheck);

            tree.addItem(subTree);
        }
    }
    return tree;
};
/**私有*/
jetsennet.ui.Tree.createSubTree = function (xmlDoc, treeNode, itemName, parentId, parentField, textField, valueField, paramFields, showCheck) {
    var nodes = xmlDoc.documentElement.selectNodes(itemName + "[" + parentField + "='" + parentId + "']");

    for (var i = 0; i < nodes.length; i++) {
        var valId = valueOf(nodes[i].selectSingleNode(valueField), "text", "");
        if (valId != parentId) {
            var treeParam = {};
            for (var j = 0; j < paramFields.length; j++) {
                treeParam[paramFields[j]] = valueOf(nodes[i].selectSingleNode(paramFields[j]), "text", "");
            }
            var treeItem = new jetsennet.ui.TreeItem(valueOf(nodes[i].selectSingleNode(textField), "text", ""), null, null, null, treeParam);
            if (showCheck) {
                treeItem.showCheck = true;
                treeItem.checkValue = valId;
            }
            jetsennet.ui.Tree.createSubTree(xmlDoc, treeItem, itemName, valId, parentField, textField, valueField, paramFields, showCheck);

            treeNode.addItem(treeItem);
        }
    }
};
//=============================================================================
// jetsennet.ui.TreeItem
//=============================================================================
jetsennet.ui.TreeItem = function (treeText, action, description, target, treeParam) {
    this.__typeName = "jetsennet.ui.TreeItem";
    this.treeText = treeText;
    this.action = action;
    this.target = target;
    this.description = description;
    this.treeItems = [];

    this.treeIndex = "";
    this.itemIndex = "";

    this.control = null;
    this.treeParam = treeParam;

    this.isOpen = false;                //是否展开
    this.isSelected = false;
    this.linkControl = null;
    this.treeName = "";
    this.isRenderItem = false;          //是否呈现子节点
    this.alwaysRenderItem = false;      //始终呈现子节点，默认不呈现

    this.showCheck = false;             //显示复选框
    this.checked = false;               //选中
    this.cascadeCheck = true;           //级联选中
    this.checkValue = "";               //复选框值

    this.onclick = null;
    this.oncheckchanged = null;
    this.onopen = null;
    this.oncontextmenu = null;

    this.openIcon = 'fa fa-folder-open';
    this.closeIcon = 'fa fa-folder';
    this.fileIcon = 'fa fa-file-text-o';
};
jetsennet.ui.TreeItem.prototype.addItem = function (item) {
    item.parent = this;
    this.treeItems.push(item);
    return this;
};

jetsennet.ui.TreeItem.prototype.click = function () {
    this.select();

    if (jQuery.isFunction(this.onclick))
        this.onclick();
    jetsennet.ui.Trees[this.treeName].click(this);
};

jetsennet.ui.TreeItem.prototype.checkChanged = function () {

    if (jQuery.isFunction(this.oncheckchanged))
        this.oncheckchanged();

    //当前节点可能没有render,所以没有treeName
    var treeName = this.treeName;
    var parentItem = this.parent;
    while (!treeName && parentItem) {
        treeName = parentItem.treeName;
        parentItem = parentItem.parent;
    }
    jetsennet.ui.Trees[treeName].checkChanged(this);
};

jetsennet.ui.TreeItem.prototype.contextmenu = function () {
    if (jQuery.isFunction(this.oncontextmenu))
        this.oncontextmenu();
    jetsennet.ui.Trees[this.treeName].contextmenu(this);
};

jetsennet.ui.TreeItem.prototype.render = function (treeName, index) {
    var uiOwner = this;
    this.treeName = treeName ? treeName : this.treeName;

    var treeControl = jQuery("<div>", { id: treeName + "-" + index, title: this.description ? this.description : this.treeText }).addClass("jetsen-tree");
    this.treeIndex = treeName + "-" + index;
    this.itemIndex = index;

    jetsennet.ui.Trees[treeName].trees[treeName + "-" + index] = this;

    var treeIcon = jQuery("<i>", { id: this.treeIndex + "-img" }).attr("class", this.treeItems.length > 0 ? (this.isOpen ? this.openIcon : this.closeIcon) : this.fileIcon)
    .css({ "cursor": "pointer" }).appendTo(treeControl).click(function () {
        uiOwner.openOrClose();
        jetsennet.cancelEvent();
    });

    if (this.showCheck) {
        var treeCheck = $("<span class='jetsen-checkbox'></span>")
        .attr("id", this.treeIndex + "-chk")
        .attr("name", "chk_" + treeName)
        .attr("value", this.checkValue)
        .appendTo(treeControl)
        .click(function() {
            $(this).toggleClass("checked");
            uiOwner.checked = $(this).hasClass("checked");
            if (uiOwner.cascadeCheck) {
                if (uiOwner.checked) {
                    uiOwner.checkParentCheck();
                }
                else {
                    uiOwner.cancelParentCheck();
                }
                uiOwner.setSubCheck(uiOwner.checked);
            }
            uiOwner.checkChanged();
            jetsennet.cancelEvent(true);
        });
        if (this.checked) {
            treeCheck.addClass("checked");
        }
    }

    var treeLink = jQuery("<a>", { id: this.treeIndex + "-a" }).html(this.treeText)
    .contextmenu(function () { uiOwner.contextmenu(); return false; })
    .click(function () { uiOwner.click(); })
    .dblclick(function () { uiOwner.openOrClose(); uiOwner.select(); })
    .focus(function () { })
    .mouseup(function () {
        if (jQuery.isFunction(uiOwner.onmouseup))
            uiOwner.onmouseup();
    })
    .mouseover(function () {
        if (!uiOwner.isSelected) {
            this.style.textDecoration = "underline";
        }
    })
    .mouseout(function () {
        if (!uiOwner.isSelected) {
            this.style.textDecoration = "none";
        }
    })
    .appendTo(treeControl);

    if (this.target != null && this.target != "")
        treeLink.attr("target", this.target);

    if (this.action == null || this.action == "") {
        treeLink.attr("href", "javascript:void(0);");
    }
    else if (jetsennet.util.left(this.action, 10).equal("javascript")) {
        treeLink.attr("href", this.action);
    }
    else {
        treeLink.attr("href", this.action);
    }

    this.control = treeControl[0];
    this.linkControl = treeLink[0];

    if (this.treeItems.length > 0) {
        treeControl.removeClass().addClass(this.isOpen ? "jetsen-treeitem-open" : "jetsen-treeitem-close");
        if (this.isOpen || this.alwaysRenderItem)
            this.renderItem();
    }
    else {
        treeControl.removeClass().addClass("file");
    }

    if (jQuery.isFunction(this.onrender))
        this.onrender();
    jetsennet.ui.Trees[this.treeName].treeRender(this);

    return treeControl;
};

jetsennet.ui.TreeItem.prototype.renderItem = function () {
    if (this.isRenderItem)
        return;
    this.isRenderItem = true;

    var itemLength = this.showCheck ? 3 : 2;
    //remove item;    
    while (this.control.childNodes.length > itemLength) {
        var oldLength = this.control.childNodes.length;
        for (var i = 0; i < oldLength; i++) {
            var item = this.control.childNodes[i];
            if (item.id != this.treeIndex + "-a" && item.id != this.treeIndex + "-img" && item.id != this.treeIndex + "-chk") {
                this.control.removeChild(item);
                break;
            }
        }
    }

    //add item;
    var newLength = this.treeItems.length;

    if (newLength == 0) {
        var subImgControl = el(this.treeIndex + "-img");

        if (subImgControl != null)
            $(subImgControl).attr("class", this.fileIcon);

        return;
    }

    for (var i = 0; i < newLength; i++) {
        var treeItem = this.treeItems[i];
        if (treeItem.__typeName == "jetsennet.ui.TreeItem") {
            if (treeItem.treeText == null || treeItem.treeText == "")
                continue;
            treeItem.parent = this;
            treeItem.isRenderItem = false;
            jQuery(this.control).append(treeItem.render(this.treeName, this.itemIndex + "-" + i));
        }
    }
};

jetsennet.ui.TreeItem.prototype.clear = function () {
    var i = 0;
    var curTree = jetsennet.ui.Trees[this.treeName];
    var treeItem = curTree.trees[this.treeIndex + "-" + i];
    while (treeItem) {
        treeItem = null;
        i++;
        treeItem = curTree.trees[this.treeIndex + "-" + i];
    }

    var itemLength = this.showCheck ? 3 : 2;
    while (this.control.childNodes.length > itemLength) {
        var oldLength = this.control.childNodes.length;
        for (var i = 0; i < oldLength; i++) {
            var item = this.control.childNodes[i];
            if (item.id != this.treeIndex + "-a" && item.id != this.treeIndex + "-img" && item.id != this.treeIndex + "-chk") {
                this.control.removeChild(item);
                break;
            }
        }
    }
    this.treeItems = [];
};

jetsennet.ui.TreeItem.prototype.getItem = function (/*提供查找的方法*/fun, bDeep) {
    for (var i = 0; i < this.treeItems.length; i++) {
        if (this.treeItems[i].__typeName == "jetsennet.ui.TreeItem") {
            if (fun(this.treeItems[i]))
                return this.treeItems[i];
            else if (bDeep) {
                var item = this.treeItems[i].getItem(fun, bDeep);
                if (item != null)
                    return item;
            }
        }
    }
    return null;
};
//选中项
jetsennet.ui.TreeItem.prototype.select = function () {

    this.checkRender();
    this.checkDisplay();

    if (jetsennet.ui.Trees[this.treeName].selectedIndex == this.treeIndex)
        return;
    if (jetsennet.ui.Trees[this.treeName].selectedIndex != null) {
        var oldSelected = jetsennet.ui.Trees[this.treeName].trees[jetsennet.ui.Trees[this.treeName].selectedIndex];
        if (oldSelected != null) {
            oldSelected.unselect();
        }
    }
    this.linkControl.className = "jetsen-tree-selected";
    //    this.linkControl.style.backgroundColor = "#03c";
    //    this.linkControl.style.color = "#fff";
    this.isSelected = true;
    jetsennet.ui.Trees[this.treeName].selectedIndex = this.treeIndex;
    jetsennet.ui.Trees[this.treeName].treeSelected(this.treeIndex);
};

jetsennet.ui.TreeItem.prototype.unselect = function () {
    this.linkControl.className = "";
    //    this.linkControl.style.backgroundColor = "";
    //    this.linkControl.style.color = "#333";
    this.linkControl.style.textDecoration = "none";
    this.isSelected = false;
    jetsennet.ui.Trees[this.treeName].treeUnSelected(this.treeIndex);
    jetsennet.ui.Trees[this.treeName].selectedIndex = null;
};
jetsennet.ui.TreeItem.prototype.setCheck = function (isCheck) {
    if (!this.showCheck)
        return;

    var isChecked = isCheck ? true : false;
    var oldChecked = this.checked == true;
    this.checked = isChecked;

    var checkControl = el(this.treeIndex + "-chk");
    if (checkControl) {
        if (isCheck) {
            $(checkControl).addClass("checked");
        } else {
            $(checkControl).removeClass("checked");
        }
    }
    if (this.cascadeCheck) {
        if (!isChecked) {
            this.cancelParentCheck();
        }
        else {
            this.checkParentCheck();
        }
        this.setSubCheck(isChecked);
    }

    if (oldChecked != isChecked) {
        this.checkChanged();
    }
};

jetsennet.ui.TreeItem.prototype.setSubCheck = function (isCheck) {

    for (var i = 0; i < this.treeItems.length; i++) {
        var treeItem = this.treeItems[i];
        if (treeItem.__typeName == "jetsennet.ui.TreeItem") {
            if (treeItem.showCheck) {

                var oldChecked = treeItem.checked == true;
                treeItem.checked = isCheck;
                var checkCon = el(treeItem.treeIndex + "-chk");
                if (checkCon) {
                    if (isCheck) {
                        $(checkCon).addClass("checked");
                    } else {
                        $(checkCon).removeClass("checked");
                    }
                }
                if (oldChecked != isCheck) {
                    treeItem.checkChanged();
                }
            }
            if (treeItem.cascadeCheck)
                treeItem.setSubCheck(isCheck);
        }
    }
};

jetsennet.ui.TreeItem.prototype.cancelParentCheck = function () {
    if (this.parent && this.parent.showCheck && this.parent.cascadeCheck) {

        var oldChecked = this.parent.checked == true;
        this.parent.checked = false;
        var checkCon = el(this.parent.treeIndex + "-chk");
        if (checkCon)
            $(checkCon).removeClass("checked");

        this.parent.cancelParentCheck();

        if (oldChecked != false) {
            this.parent.checkChanged();
        }
    }
};
//检测父项是否需要选中
jetsennet.ui.TreeItem.prototype.checkParentCheck = function () {
    if (this.parent && this.parent.showCheck && this.parent.cascadeCheck) {

        var isCheckAll = true;
        for (var i = 0; i < this.parent.treeItems.length; i++) {
            var treeItem = this.parent.treeItems[i];
            if (treeItem.__typeName == "jetsennet.ui.TreeItem") {
                if (treeItem.showCheck) {
                    if (treeItem.checked != true) {
                        isCheckAll = false;
                        break;
                    }
                }
            }
        }
        if (isCheckAll) {

            var oldChecked = this.parent.checked == true;
            this.parent.checked = true;
            var checkCon = el(this.parent.treeIndex + "-chk");
            if (checkCon)
                $(checkCon).addClass("checked");
            this.parent.checkParentCheck();

            if (oldChecked != true) {
                this.parent.checkChanged();
            }
        }
    }
};
//检测项是否render--私有
jetsennet.ui.TreeItem.prototype.checkRender = function () {
    if (this.parent) {
        if (!this.parent.isRenderItem) {
            if (this.parent.__typeName == "jetsennet.ui.TreeItem") {
                this.parent.checkRender();
                this.parent.renderItem();
            }
        }
    }
};
//检测项是否展开--私有
jetsennet.ui.TreeItem.prototype.checkDisplay = function () {
    if (this.parent) {
        if (this.parent.__typeName == "jetsennet.ui.TreeItem") {

            this.parent.checkDisplay();

            if (!this.parent.isOpen) {
                this.parent.showSubTree();
            }
        }
    }
};
jetsennet.ui.TreeItem.prototype.openOrClose = function () {
    this.renderItem();
    if (this.isOpen) {
        this.isOpen = false;
        this.hideSubTree();
    }
    else {
        this.isOpen = true;
        this.showSubTree();
        if (jQuery.isFunction(this.onopen)) {
            this.onopen();
        }
    }
};
jetsennet.ui.TreeItem.prototype.showSubTree = function () {
    if (this.treeItems.length == 0 || this.treeIndex == null || this.treeIndex == "")
        return;

    this.isOpen = true;

    jQuery("#" + this.treeIndex).removeClass().addClass("jetsen-treeitem-open");
    jQuery("#" + this.treeIndex + "-img").attr("class", this.openIcon);
};

jetsennet.ui.TreeItem.prototype.hideSubTree = function () {
    if (this.treeItems.length == 0 || this.treeIndex == null || this.treeIndex == "")
        return;

    this.isOpen = false;

    jQuery("#" + this.treeIndex).removeClass().addClass("jetsen-treeitem-close");
    jQuery("#" + this.treeIndex + "-img").attr("class", this.closeIcon);
};
