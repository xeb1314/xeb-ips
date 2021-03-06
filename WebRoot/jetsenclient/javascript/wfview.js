// lixiaomin 2008/09/01
//=============================================================================
// 工作流视图
//=============================================================================
jetsennet.addLoadedUri(jetsennet.getloadUri("wfview"));
jetsennet.importCss("workflowview");

jetsennet.ui.WfConfig = {
    linkLineSize: 1,            //线的大小
    nodeSize: { width: 100, height: 100 },
    breakLineHeight: 40,        //对于组合节点，节点上下的间隔
    complexNodeSpace: 30,       //对于组合节点，节点与边距的间隔
    status: { "0": "准备中", "1": "准备完毕，等待执行", "2": "执行中", "3": "执行结束", "4": "打回，等待任务重新提交", "5": "被打回", "6": "强制结束", "7": "任务停止", "10": "执行失败" },
    tempSize:{}
};

jetsennet.ui.WfViews = {};

/**
节点类型
*/
jetsennet.registerNamespace("jetsennet.ui.WfNodeType");
jetsennet.ui.WfNodeType.BeginNode = 0;
jetsennet.ui.WfNodeType.TaskNode = 1;
jetsennet.ui.WfNodeType.TaskAutoNode = 2;

jetsennet.ui.WfNodeType.SequenceNode = 10;
jetsennet.ui.WfNodeType.IfElseNode = 11;
jetsennet.ui.WfNodeType.ParallelNode = 12;
jetsennet.ui.WfNodeType.ListenNode = 13;
jetsennet.ui.WfNodeType.WhileNode = 14;

jetsennet.ui.WfNodeType.EmptyNode = 50;
jetsennet.ui.WfNodeType.LinkNode = 51;
jetsennet.ui.WfNodeType.BreakLinkNode = 52;
jetsennet.ui.WfNodeType.EndNode = 100;

/**
流程视图
*/
jetsennet.ui.WfView = function (container, width, height, viewName) {
    this.parent = container ? container : document.body;
    this.parent.innerHTML = "";
    this.bgColor = "#ffffff";

    this.workflowNode = null;
    this.margin = 10;

    this.size = { width: width ? width : this.parent.offsetWidth, height: height ? height : this.parent.offsetHeight };
    this.showStartEndNode = true;       //显示开始结束
    this.enableSelectNode = true;       //允许选择
    this.isDesignMode = true;           //设计模式   
    this.isEditMode = false;            //编辑模式 
    this.showToolTip = true;            //显示提示

    this.onnodeclick = null;
    this.onnodecontextmenu = null;
    this.onloaded = null;
    //this.onnoderulesetting = null;
    this.onnodeconfig = null;
    //this.onnoderenamesetting = null;

    this.isMoving = false;
    this.movingData = null;
    this.isRender = false;

    this.autoScroll = true;

    this.viewName = viewName ? viewName : "js-workflow-view";
    jetsennet.ui.WfViews[this.viewName] = this;
};

/**
呈现流程
*/
jetsennet.ui.WfView.prototype.render = function () {
    this.initWfObject();
    this.clearView();
    var ownerWf = this;

    var container = jQuery("<div>").addClass("wf-view").css({ position: "relative", width: this.size.width, height: this.size.height, background: this.bgColor, overflow: this.autoScroll ? "hidden" : "auto" })
    .mousemove(function () {
        ownerWf.onmousemove();
        if (ownerWf.autoScroll && this.scrollWidth != this.offsetWidth) {
            var evt = jetsennet.getEvent();
            var scrollSize = jetsennet.util.getWindowScrollSize();
            var curPointX = IS_IE ? evt.clientX : evt.pageX;
            curPointX = curPointX + scrollSize.width - jetsennet.util.getPosition(ownerWf.parent, 1).left; //this.offsetLeft;            
            curPointX = (curPointX * 1.0 / this.offsetWidth) * this.scrollWidth - (this.offsetWidth / 2);

            if (curPointX > 0) {
                this.scrollLeft = curPointX;
            }
            else {
                this.scrollLeft = 0;
            }
        }
    })
    .mouseup(function () { ownerWf.onmouseup(); })
    .contextmenu(function () {
        ownerWf.oncontextmenu();
        return false;
    }).appendTo(this.parent);

    container[0].onselectstart = function (e) { return false; };

    if (this.workflowNode != null) {
        this.workflowNode.showStartEndNode = this.showStartEndNode;
        var controlNode = this.workflowNode.render();
        if (this.autoScroll) {
            this.size.height = this.workflowNode.size.height;
            container.height(this.margin + this.size.height + this.margin + 10);
        }
        controlNode.style.top = this.margin + "px";
        container.append(controlNode);
    }

    this.isRender = true;

    if (this.onloaded && typeof this.onloaded == "function") {
        this.onloaded();
    }
};

jetsennet.ui.WfView.prototype.initWfObject = function () {
    if (this.workflowNode == null || this.workflowNode.childNodes == null)
        return;
    this.getMaxChildCount(this.workflowNode);
};

/**
取得流程图的纵向高度
每个节点都有一个值，用于在显示时定位在中间位置
*/
jetsennet.ui.WfView.prototype.getMaxChildCount = function (node) {
    var maxCount = 1;
    if (node.childNodes && node.childNodes.length > 0) {
        for (var i = 0; i < node.childNodes.length; i++) {
            var newMaxCount = this.getMaxChildCount(node.childNodes[i]);
            if (newMaxCount > maxCount)
                maxCount = newMaxCount;
        }

        if (node.nodeType != jetsennet.ui.WfNodeType.IfElseNode
                && node.nodeType != jetsennet.ui.WfNodeType.ParallelNode
                && node.nodeType != jetsennet.ui.WfNodeType.ListenNode
                && node.nodeType != jetsennet.ui.WfNodeType.WhileNode) {

            for (var i = 0; i < node.childNodes.length; i++) {
                node.childNodes[i].maxCount = maxCount;
            }
        }
    }
    //组合类型
    if (node.nodeType == jetsennet.ui.WfNodeType.IfElseNode
            || node.nodeType == jetsennet.ui.WfNodeType.ParallelNode
            || node.nodeType == jetsennet.ui.WfNodeType.ListenNode
            || node.nodeType == jetsennet.ui.WfNodeType.WhileNode) {

        maxCount = 0;
        for (var i = 0; i < node.childNodes.length; i++) {
            maxCount += node.childNodes[i].maxCount;
        }

        if (node.nodeType == jetsennet.ui.WfNodeType.WhileNode) {
            maxCount = maxCount * 1.5;
        }
        //alert(maxCount);    
    }
    node.maxCount = maxCount;
    node.workflowView = this;
    return node.maxCount;
};
/**
选中节点
*/
jetsennet.ui.WfView.prototype.selectNode = function (node) {
    if (this.enableSelectNode) {
        if (this.isDesignMode || this.isEditMode || node.nodeType == jetsennet.ui.WfNodeType.TaskNode || node.nodeType == jetsennet.ui.WfNodeType.TaskAutoNode) {
            this.workflowNode.disSelect();
            node.select();
        }
    }
};
/**
鼠标事件
*/
jetsennet.ui.WfView.prototype.onclick = function (node) {
    this.selectNode(node);
    if (node) {
        if (this.isDesignMode || this.isEditMode
            || node.nodeType == jetsennet.ui.WfNodeType.TaskNode
            || node.nodeType == jetsennet.ui.WfNodeType.TaskAutoNode) {

            if (jQuery.isFunction(this.onnodeclick)) {
                this.onnodeclick(node);
            }
        }
    }
    jetsennet.cancelEvent();
    jetsennet.hide(el('div-workflow-menu'));
};
jetsennet.ui.WfView.prototype.onmouseover = function (node) {
    if (this.isDesignMode && this.isMoving) {
        var moveSeparator = jQuery("#div-workflow-move-sp");
        if (moveSeparator.size() == 0) {
            moveSeparator = jQuery("<div>", { id: "div-workflow-move-sp" }).addClass("wf-move-separator").css({ position: "absolute" }).html("").appendTo("body");
        }
        var top = jetsennet.util.getPosition(node.control, 2).top;
        top = top - ((this.movingData[1] - node.size.height) / 2);
        moveSeparator.show().css({ height: this.movingData[1], width: this.movingData[2], left: (jetsennet.util.getPosition(node.control, 2).left + 2), top: top });
        jetsennet.cancelEvent();
    }
    else if (this.showToolTip && node.description && node.description != "") {
        jetsennet.tooltip(node.description, { reference: node.control, width: 210, position: 0 });
    }
};
jetsennet.ui.WfView.prototype.onmouseout = function (node) {
    if (this.showToolTip && node.description && node.description != "") {
        jetsennet.hidetip();
    }
    if (this.isDesignMode && this.isMoving) {
        jQuery("#div-workflow-move-sp").hide();
    }
};
jetsennet.ui.WfView.prototype.onmousedown = function (node) {
    if (this.isDesignMode && node.enableMove) {
        var evt = jetsennet.getEvent();
        var curX = IS_IE ? evt.clientX : evt.pageX;
        var curY = IS_IE ? evt.clientY : evt.pageY;
        this.movingData = [node.index, node.size.height, node.size.width,curX,curY];
        this.isMoving = true;
        jetsennet.cancelEvent();
    }
};
jetsennet.ui.WfView.prototype.onmousemove = function (node) {
    if (this.isDesignMode && this.isMoving) {

        var evt = jetsennet.getEvent();
        var curX = IS_IE ? evt.clientX : evt.pageX;
        var curY = IS_IE ? evt.clientY : evt.pageY;

        if (Math.abs(curX - this.movingData[3]) > 3 && Math.abs(curY - this.movingData[4]) > 3) {
            var moveElement = el("div-workflow-move");
            if (moveElement != null) {
                moveElement.style.display = "";
                var evt = jetsennet.getEvent();
                var scrollSize = jetsennet.util.getWindowScrollSize();
                moveElement.style.left = ((IS_IE ? scrollSize.width + evt.clientX : scrollSize.width + evt.pageX) + 8) + "px";
                moveElement.style.top = ((IS_IE ? scrollSize.height + evt.clientY : scrollSize.height + evt.pageY) + 8) + "px";
            }
            else {
                moveElement = jQuery("<div>", { id: "div-workflow-move" }).addClass("wf-move-node").css({ position: "absolute" }).appendTo("body");
                moveElement[0].onselectstart = function (e) { return false; };
                var moveNode = this.getNodeAndParentByIndex(this.movingData[0]).node;
                moveElement.html(moveNode.control.innerHTML);
                moveElement.css({ width: moveNode.size.width, height: moveNode.size.height }); //.html(node.nodeData ? node.nodeData.nodeName : "");
            }

            this.parent.style.cursor = "move";
            jetsennet.cancelEvent();
        }
    }
};
jetsennet.ui.WfView.prototype.onmouseup = function (node) {

    if (this.isDesignMode && this.isMoving) {
        this.isMoving = false;

        jQuery("#div-workflow-move-sp").hide();

        if (node == null || node.index == this.movingData[0]) {
            var moveNode = this.getNodeAndParentByIndex(this.movingData[0]).node;
            var position = jetsennet.util.getPosition(moveNode.control, 0);
            jQuery("#div-workflow-move").animate({ left: position.left, top: position.top }, 200, null, function () { jQuery(this).remove(); });
        }
        else {
            jQuery("#div-workflow-move").remove();
            this.moveNode(node.index);
        }

        this.parent.style.cursor = "default";
        jetsennet.cancelEvent();
    }
};
jetsennet.ui.WfView.prototype.oncontextmenu = function (node) {
    if (jQuery.isFunction(this.onnodecontextmenu)) {
        this.onnodecontextmenu(node);
    }
    else if (this.isDesignMode) {
        if (node != null && !node.enableSelected)
            return;
        this.showContextMenu(node);
    }
};
jetsennet.ui.WfView.prototype.showContextMenu = function (node) {

    jQuery('#div-workflow-menu').hidepop().remove();

    var ownerWf = this;
    var nodeMenu = jQuery.extend(new jetsennet.ui.Menu(), { menuWidth: 120 });

    if (node == null) {
        nodeMenu.addItem(jQuery.extend(new jetsennet.ui.MenuItem("新增条件分支"),
            { onclick: jetsennet.bindFunction(ownerWf, function () { this.addNodeByType(jetsennet.ui.WfNodeType.IfElseNode); }) }));
        nodeMenu.addItem(jQuery.extend(new jetsennet.ui.MenuItem("新增并行节点"),
            { onclick: jetsennet.bindFunction(ownerWf, function () { this.addNodeByType(jetsennet.ui.WfNodeType.ParallelNode); }) }));
        nodeMenu.addItem(jQuery.extend(new jetsennet.ui.MenuItem("新增侦听节点"),
            { onclick: jetsennet.bindFunction(ownerWf, function () { this.addNodeByType(jetsennet.ui.WfNodeType.ListenNode); }) }));
        nodeMenu.addItem(jQuery.extend(new jetsennet.ui.MenuItem("新增循环节点"),
            { onclick: jetsennet.bindFunction(ownerWf, function () { this.addNodeByType(jetsennet.ui.WfNodeType.WhileNode); }) }));
    }
    else {
        //        nodeMenu.addItem(jQuery.extend(new jetsennet.ui.MenuItem("指派规则"), {
        //            icon: jetsennet.baseThemeUrl + "images/wficon/authorized.gif",
        //            onclick: jetsennet.bindFunction(ownerWf, function (index) { this.addNodeRule(index); }, node.index)
        //        }));
        nodeMenu.addItem(jQuery.extend(new jetsennet.ui.MenuItem("配置"), {
            icon: jetsennet.baseThemeUrl + "images/wficon/property.gif",
            onclick: jetsennet.bindFunction(ownerWf, function (index) { this.nodeConfig(index); }, node.index)
        }));

        if (node.enableMove) {
            nodeMenu.addItem(jQuery.extend(new jetsennet.ui.MenuItem("删除"), {
                icon: jetsennet.baseThemeUrl + "images/wficon/remove.gif",
                onclick: jetsennet.bindFunction(ownerWf, function (index) { this.removeNode(index); }, node.index)
            }));
        }

        //        if (node.nodeType == jetsennet.ui.WfNodeType.TaskAutoNode || node.nodeType == jetsennet.ui.WfNodeType.TaskNode) {
        //            nodeMenu.addItem(jQuery.extend(new jetsennet.ui.MenuItem("重命名"), {
        //                icon: jetsennet.baseThemeUrl + "images/wficon/rename.gif",
        //                onclick: jetsennet.bindFunction(ownerWf, function (index) { this.renameNode(index); }, node.index)
        //            }));
        //        }

        if (node.nodeType == jetsennet.ui.WfNodeType.ParallelNode || node.nodeType == jetsennet.ui.WfNodeType.ListenNode) {

            nodeMenu.addItem(jQuery.extend(new jetsennet.ui.MenuItem("添加分支"), {
                onclick: jetsennet.bindFunction(ownerWf, function (index) { this.addBranchNode(index); }, node.index)
            }));
            nodeMenu.addItem(jQuery.extend(new jetsennet.ui.MenuItem("删除空分支"), {
                onclick: jetsennet.bindFunction(ownerWf, function (index) { this.deleteEmptyNode(index); }, node.index)
            }));
        }
    }

    nodeMenu.render("div-workflow-menu").popup();
};

/**
节点及节点的所有子节点  
*/
jetsennet.ui.WfView.prototype.createNodesByObject = function (objNode) {
    if (objNode == null) return null;
    var newNode = new jetsennet.ui.createWfNode(objNode.NodeType);
    newNode.nodeData = { actId: objNode.ActId,
        nodeId: objNode.NodeId,
        nodeName: objNode.NodeName,
        actParam: objNode.NodeParam,
        actType: objNode.NodeType
    };

    if (objNode["Childs"] && objNode["Childs"] != "") {
        var subNode = objNode["Childs"]["FlowNode"];
        subNode = subNode.length ? subNode : [subNode];
        for (var i = 0; i < subNode.length; i++) {
            newNode.addNode(this.createNodesByObject(subNode[i]));
        }
    }
    return newNode;
};
/**
添加节点
*/
jetsennet.ui.WfView.prototype.addNode = function (/*node*/node) {
    if (this.workflowNode == null) {
        this.workflowNode = new jetsennet.ui.WfSequenceNode();
    }
    this.workflowNode.addNode(node);
};
/**
添加节点(按类型)
*/
jetsennet.ui.WfView.prototype.addNodeByType = function (nodeType) {
    var newNode = jetsennet.ui.createWfNode(nodeType);
    if (nodeType == jetsennet.ui.WfNodeType.IfElseNode || nodeType == jetsennet.ui.WfNodeType.ParallelNode || nodeType == jetsennet.ui.WfNodeType.ListenNode) {
        newNode.addNode(jetsennet.ui.createWfNode(jetsennet.ui.WfNodeType.SequenceNode));
        newNode.addNode(jetsennet.ui.createWfNode(jetsennet.ui.WfNodeType.SequenceNode));
    }
    if (nodeType == jetsennet.ui.WfNodeType.WhileNode) {
        newNode.addNode(jetsennet.ui.createWfNode(jetsennet.ui.WfNodeType.SequenceNode));
    }
    this.addNode(newNode);
    if (this.isRender)
        this.render();
};
/**
添加节点规则

jetsennet.ui.WfView.prototype.addNodeRule = function (nodeIndex) {
if (this.onnoderulesetting && typeof this.onnoderulesetting == "function") {
this.onnoderulesetting(nodeIndex);
}
};*/
/**
添加节点参数
*/
jetsennet.ui.WfView.prototype.nodeConfig = function (nodeIndex) {
    if (this.onnodeconfig && typeof this.onnodeconfig == "function") {
        this.onnodeconfig(nodeIndex);
    }
};
/**
添加分支
*/
jetsennet.ui.WfView.prototype.addBranchNode = function (nodeIndex) {
    var nodeData = this.getNodeAndParentByIndex(nodeIndex);
    if (nodeData.node == null || (nodeData.node.nodeType != jetsennet.ui.WfNodeType.ParallelNode && nodeData.node.nodeType != jetsennet.ui.WfNodeType.ListenNode))
        return;

    var subNode1 = jetsennet.ui.createWfNode(jetsennet.ui.WfNodeType.SequenceNode);
    nodeData.node.addNode(subNode1);
    if (this.isRender)
        this.render();
};
/**
删除空分支
*/
jetsennet.ui.WfView.prototype.deleteEmptyNode = function (nodeIndex) {
    var nodeData = this.getNodeAndParentByIndex(nodeIndex);
    if (nodeData.node == null || (nodeData.node.nodeType != jetsennet.ui.WfNodeType.ParallelNode && nodeData.node.nodeType != jetsennet.ui.WfNodeType.ListenNode))
        return;

    var tempSequence = [];
    for (var i = 0; i < nodeData.node.childNodes.length; i++) {
        if (nodeData.node.childNodes[i].childNodes.length != 0) {
            tempSequence.push(nodeData.node.childNodes[i]);
        }
    }
    if (tempSequence.length == 0) {
        return this.removeNode(nodeIndex);
    }
    else {
        nodeData.node.childNodes = tempSequence;
    }

    if (this.isRender)
        this.render();
};
/**
移除节点
*/
jetsennet.ui.WfView.prototype.removeNode = function (nodeIndex) {

    var owner = this;
    jetsennet.confirm("确定删除?", function () {

        var nodeData = owner.getNodeAndParentByIndex(nodeIndex);
        if (nodeData.node == null)
            return;

        nodeData.node.index = -100;
        var tempOldSequence = [];
        for (var i = 0; i < nodeData.parent.childNodes.length; i++) {
            if (nodeData.parent.childNodes[i].index != -100) {
                tempOldSequence.push(nodeData.parent.childNodes[i]);
            }
        }
        nodeData.parent.childNodes = tempOldSequence;

        if (owner.isRender)
            owner.render();

        return true;
    });
};
/**
重命名

jetsennet.ui.WfView.prototype.renameNode = function (nodeIndex) {
if (this.onnoderenamesetting && typeof this.onnoderenamesetting == "function") {
this.onnoderenamesetting(nodeIndex);
}
};*/
/**
清空视图
*/
jetsennet.ui.WfView.prototype.clearView = function () {
    this.parent.innerHTML = "";
};

jetsennet.ui.WfView.prototype.getRefrenceTop = function (height, nodeHeight) {
    if (height > nodeHeight)
        return parseInt((height - nodeHeight) / 2);
    return 0;
};
/**
取得第一任务节点
*/
jetsennet.ui.WfView.prototype.getFristNode = function () {
    return this.getFristNodeByNode(this.workflowNode);
};
jetsennet.ui.WfView.prototype.getFristNodeByNode = function (node) {
    if (node == null)
        return null;
    if (node.nodeType == jetsennet.ui.WfNodeType.TaskNode || node.nodeType == jetsennet.ui.WfNodeType.TaskAutoNode) {
        return node;
    }
    for (var i = 0; i < node.childNodes.length; i++) {
        var firstNode = this.getFristNodeByNode(node.childNodes[i]);
        if (firstNode != null)
            return firstNode;
    }
    return null;
};
/**
取得节点（NodeId）
*/
jetsennet.ui.WfView.prototype.getNodeByNodeId = function (nodeId) {
    return this.getNodeByParentNode(this.workflowNode, nodeId);
};
jetsennet.ui.WfView.prototype.getNodeByParentNode = function (node, nodeId) {
    if (node == null)
        return null;
    if (node.nodeData != null && node.nodeData.nodeId == nodeId) {
        return node;
    }
    if (node.childNodes == null)
        return null;
    for (var i = 0; i < node.childNodes.length; i++) {
        var retNode = this.getNodeByParentNode(node.childNodes[i], nodeId);
        if (retNode != null)
            return retNode;
    }
    return null;
};
/**
移动节点
*/
jetsennet.ui.WfView.prototype.moveNode = function (nodeIndex) {
    if (nodeIndex == this.movingData[0])
        return;

    var oldNodeData = this.getNodeAndParentByIndex(this.movingData[0]);
    if (oldNodeData.node == null)
        return;
    var oldNode = oldNodeData.node;
    var oldNodeParent = oldNodeData.parent;

    var newNode = this.workflowNode;
    var newNodeParent = this.workflowNode;

    var copyNode = oldNode.cloneNode(oldNode);
    //新的位置 
    if (nodeIndex == -1) {
        //移动到新位置
        var tempNewSequence = [];
        tempNewSequence.push(copyNode);
        for (var i = 0; i < newNodeParent.childNodes.length; i++) {
            tempNewSequence.push(newNodeParent.childNodes[i]);
        }
        newNodeParent.childNodes = tempNewSequence;
    }
    else if (nodeIndex == 1000) {
        this.workflowNode.addNode(copyNode);
    }
    else {

        var newNodeData = this.getNodeAndParentByIndex(nodeIndex);
        if (newNodeData.node == null)
            return;
        newNode = newNodeData.node;
        newNodeParent = newNodeData.parent;

        if (newNode.isChildFor(oldNode))
            return;
        //移动到新位置
        var tempNewSequence = [];
        if (newNodeParent.childNodes.length == 0) {
            tempNewSequence.push(copyNode);
        }
        else {
            for (var i = 0; i < newNodeParent.childNodes.length; i++) {
                tempNewSequence.push(newNodeParent.childNodes[i]);
                if (newNodeParent.childNodes[i].index == nodeIndex) {
                    tempNewSequence.push(copyNode);
                }
            }
        }
        newNodeParent.childNodes = tempNewSequence;
    }

    //删除原节点
    oldNode.index = -100;
    var tempOldSequence = [];
    for (var i = 0; i < oldNodeParent.childNodes.length; i++) {
        if (oldNodeParent.childNodes[i].index != -100) {
            tempOldSequence.push(oldNodeParent.childNodes[i]);
        }
    }
    oldNodeParent.childNodes = tempOldSequence;
    this.render();
};

/**
按index取得节点及节点的父节点
*/
jetsennet.ui.WfView.prototype.getNodeAndParentByIndex = function (nodeIndex) {
    var node = this.workflowNode;
    var nodeParent = this.workflowNode;

    var tempIndexArr = nodeIndex.split(',');
    var layerIndex = 1;
    while (layerIndex < tempIndexArr.length) {
        var nodeData;
        if (node.childNodes)
            nodeData = node.childNodes[tempIndexArr[layerIndex]];

        if (nodeData == null)
            break;

        node = nodeData;
        layerIndex++;

        if (!node.childNodes || layerIndex == tempIndexArr.length)
            break;
        nodeParent = node;
    }
    return { node: node, parent: nodeParent };
};

/**
节点基类
*/
jetsennet.ui.WfNodeBase = function () {
    this.icon = null;
    this.text = "";
    this.description = "";
    this.nodeType = null;
    this.isRender = false;
    //this.nodeId = null;
    this.workflowView = null;
    this.className = null;
    this.control = null;
    this.index = 0;
    this.enableSelected = false;
    this.lastPosition = { left: 0, top: 1 };
};
jetsennet.ui.WfNodeBase.prototype.select = function () {
    if (this.control && this.enableSelected)
        this.control.className = this.getControlClassName(this.selectedClassName);
};
jetsennet.ui.WfNodeBase.prototype.disSelect = function () {
    if (this.control && this.enableSelected)
        this.control.className = this.getControlClassName(this.className);
};
jetsennet.ui.WfNodeBase.prototype.getControlClassName = function (className) {

    var classes = [];
    if (className)
        classes.push(className);

    if (this.nodeData && this.nodeData.actId) {
        classes.push("wf-node-" + this.nodeData.actId);
    }
    return classes.join(" ");
};
//呈现节点
jetsennet.ui.WfNodeBase.prototype.render = function () {
    var ownerWf = this;
    this.size = this.size ? this.size : jetsennet.ui.WfConfig.nodeSize;
    var edgeSize = this.getEdgeSize();

    var nodeControl = jQuery("<div>").css({ position: "absolute", overflow: "hidden", width: this.size.width - edgeSize.left - edgeSize.right, height: this.size.height - edgeSize.top - edgeSize.bottom })
    .mouseover(function () { ownerWf.workflowView.onmouseover(ownerWf); })
    .mouseout(function () { ownerWf.workflowView.onmouseout(ownerWf); })
    .mousedown(function () { ownerWf.workflowView.onmousedown(ownerWf); })
    .mouseup(function () { ownerWf.workflowView.onmouseup(ownerWf); })
    .contextmenu(function (e) {
        jetsennet.cancelEvent();
        ownerWf.workflowView.oncontextmenu(ownerWf);
        return false;
    }).addClass(this.getControlClassName(this.className));

    if (this.description == null || this.description == "") {
        this.description = this.nodeData.description == null ? "" : this.nodeData.description;
    }

    if (this.icon && this.icon != "") {
        jQuery("<img>").attr("src", this.icon).css({ width: this.size.width, height: this.size.height }).appendTo(nodeControl);
    }
    else {
        nodeControl.html(this.nodeData.nodeName);
    }

    this.control = nodeControl[0];
    return this.control;
};
/**
克隆节点
*/
jetsennet.ui.WfNodeBase.prototype.cloneNode = function (node) {
    var newNode = jetsennet.ui.createWfNode(node.nodeType);
    newNode.icon = node.icon;
    newNode.nodeData = node.nodeData;
    newNode.lastPosition = node.lastPosition;

    if (node.childNodes) {
        for (var i = 0; i < node.childNodes.length; i++) {
            newNode.addNode(this.cloneNode(node.childNodes[i]));
        }
    }
    return newNode;
};
//序列化=======================================================================
jetsennet.ui.WfNodeBase.prototype.toXml = function () {
    var xmlStr = ["<FlowNode>"];
    xmlStr.push("<NodeType>" + this.nodeType + "</NodeType>");
    xmlStr.push(this.nodeData.assignRule ? jetsennet.xml.serialize(this.nodeData.assignRule, "AssignRule") : "");
    xmlStr.push("<ActId>" + this.nodeData.actId + "</ActId>");
    xmlStr.push("<NodeName>" + jetsennet.xml.xmlEscape(this.nodeData.nodeName) + "</NodeName>");
    xmlStr.push("<NodeDesc></NodeDesc>");
    xmlStr.push("<NodeId>" + (jetsennet.util.isNullOrEmpty(this.nodeData.nodeId) ? -1 : this.nodeData.nodeId) + "</NodeId>");
    xmlStr.push("<NodeParam>" + (this.nodeData.actParam ? jetsennet.xml.xmlEscape(this.nodeData.actParam) : "") + "</NodeParam>");
    if (this.childNodes) {
        xmlStr.push("<Children>");
        for (var i = 0; i < this.childNodes.length; i++) {
            xmlStr.push(this.childNodes[i].toXml());
        }
        xmlStr.push("</Children>");
    }
    xmlStr.push("</FlowNode>");
    return xmlStr.join("");
};
/**
是否某节点的子层节点
*/
jetsennet.ui.WfNodeBase.prototype.isChildFor = function (parent, node) {
    var flag = false;
    var subNode = node ? node : this;
    if (parent.childNodes) {
        for (var i = 0; i < parent.childNodes.length; i++) {
            if (parent.childNodes[i] == subNode)
                return true;
            if (subNode.isChildFor(parent.childNodes[i], subNode))
                return true;
        }
    }
    else {
        flag = parent == subNode;
    }
    return flag;
};
jetsennet.ui.WfNodeBase.prototype.getEdgeSize = function () {
    var edgeSize = jetsennet.util.isNullOrEmpty(this.className) ? { left: 0, right: 0, top: 0, bottom: 0} : jetsennet.ui.WfConfig.tempSize[this.className];
    if (edgeSize == null) {
        var temp = jQuery("<div>").addClass(this.getControlClassName(this.className)).appendTo("body");
        edgeSize = jetsennet.util.getControlEdgeSize(temp[0]);
        jetsennet.ui.WfConfig.tempSize[this.className] = edgeSize;
        temp.remove();
    }
    return edgeSize;
};

/**
开始节点
*/
jetsennet.ui.WfBeginNode = function () {
    this.icon = jetsennet.baseThemeUrl + "images/wficon/begin.gif";
    this.nodeData = { nodeId: -1 };
    this.size = { width: 33, height: 33 };
    this.index = -1;
    this.nodeType = jetsennet.ui.WfNodeType.BeginNode;
};
jetsennet.ui.WfBeginNode.prototype = new jetsennet.ui.WfNodeBase();
/**
结束节点
*/
jetsennet.ui.WfEndNode = function () {
    this.icon = jetsennet.baseThemeUrl + "images/wficon/end.gif";
    this.nodeData = { nodeId: -1 };
    this.size = { width: 32, height: 32 };
    this.index = 1000;
    this.nodeType = jetsennet.ui.WfNodeType.EndNode;
};
jetsennet.ui.WfEndNode.prototype = new jetsennet.ui.WfNodeBase();
/**
连接节点
*/
jetsennet.ui.WfLinkNode = function () {
    this.icon = jetsennet.baseThemeUrl + "images/wficon/link.gif";
    this.nodeData = { nodeId: -1 };
    this.size = { width: 31, height: 28 };
    this.nodeType = jetsennet.ui.WfNodeType.LinkNode;
};
jetsennet.ui.WfLinkNode.prototype = new jetsennet.ui.WfNodeBase();
/**
空节点
*/
jetsennet.ui.WfEmptyNode = function () {
    //this.icon = jetsennet.baseThemeUrl + "images/wficon/empty.gif";
    this.nodeData = { nodeId: -1 };
    this.size = { width: 30, height: 10 };
    this.nodeType = jetsennet.ui.WfNodeType.WfEmptyNode;
    this.className = "wf-emptynode";

};
jetsennet.ui.WfEmptyNode.prototype = new jetsennet.ui.WfNodeBase();
/**
任务节点
*/
jetsennet.ui.WfTaskNode = function () {
    this.nodeType = jetsennet.ui.WfNodeType.TaskNode;
    this.className = "wf-tasknode";
    this.selectedClassName = "wf-selected-tasknode";
    this.enableSelected = true;
    this.enableMove = true;
    this.nodeData = { nodeId: -1, actId: 1 };
    this.moving = false;
};
jetsennet.ui.WfTaskNode.prototype = new jetsennet.ui.WfNodeBase();

//呈现节点
jetsennet.ui.WfTaskNode.prototype.render = function () {
    var ownerWf = this;
    this.size = this.size ? this.size : jQuery.extend({}, jetsennet.ui.WfConfig.nodeSize);

    var edgeSize = this.getEdgeSize();

    var nodeControl = jQuery("<div>").css({ position: "absolute", overflow: "hidden" }).height(this.size.height).width(this.size.width)
    .mouseover(function () { ownerWf.workflowView.onmouseover(ownerWf); })
    .mouseout(function () { ownerWf.workflowView.onmouseout(ownerWf); })
    .mousedown(function () { ownerWf.workflowView.onmousedown(ownerWf); })
    .mouseup(function () { ownerWf.workflowView.onmouseup(ownerWf); })
    .contextmenu(function (e) {
        jetsennet.cancelEvent();
        ownerWf.workflowView.oncontextmenu(ownerWf);
        return false;
    })
    .click(function () {
        if (ownerWf.onclick && typeof ownerWf.onclick == "function") {
            ownerWf.onclick(ownerWf);
        }
        ownerWf.workflowView.onclick(ownerWf);
        jetsennet.cancelEvent();
    })
    .addClass(this.getControlClassName(this.className))
    .height(this.size.height - edgeSize.top - edgeSize.bottom).width(this.size.width - edgeSize.left - edgeSize.right);

    var backTimeDesc = "";
    if (this.nodeData.backTimes != null && this.nodeData.backTimes != "" && parseInt(this.nodeData.backTimes) > 0) {
        backTimeDesc = "<b>打回次数：</b>" + this.nodeData.backTimes + "<br/>";
    }

    this.nodeData.startTime = this.nodeData.startTime ? this.nodeData.startTime.replace(/T/, " ") : "";
    this.nodeData.endTime = this.nodeData.endTime ? this.nodeData.endTime.replace(/T/, " ") : "";
    this.description = "<b>任务状态：</b>" + jetsennet.ui.WfConfig.status[this.nodeData.nodeState] + "<br/>";

    switch (this.nodeData.nodeState) {
        case "0":
            this.className = "wf-pedding-tasknode";
            break;
        case "1":
            this.className = "wf-current-tasknode";
            this.description += backTimeDesc + "<b>开始时间：</b>" + this.nodeData.startTime;
            break;
        case "2":
            this.className = "wf-current-tasknode";
            this.description += backTimeDesc + "<b>开始时间：</b>" + this.nodeData.startTime;
            break;
        case "3":
            this.className = "wf-pass-tasknode";
            this.description += "<b>执行用户：</b>" + this.nodeData.executeUser + "<br>" + backTimeDesc + "<b>开始时间：</b>" + this.nodeData.startTime + "<br/><b>结束时间：</b>" + this.nodeData.endTime;
            break;
        case "4":
            this.className = "wf-tasknode";
            this.description += "<b>执行用户：</b>" + this.nodeData.executeUser + "<br>" + backTimeDesc;
            break;
        case "5":
            this.className = "wf-returned-tasknode";
            this.description += "<b>执行用户：</b>" + this.nodeData.executeUser + "<br>" + backTimeDesc;
            break;
        case "6":
            this.className = "wf-forceend-tasknode";
            this.description += "<b>执行用户：</b>" + this.nodeData.executeUser + "<br>" + backTimeDesc + "<b>开始时间：</b>" + this.nodeData.startTime + "<br/><b>结束时间：</b>" + this.nodeData.endTime;
            break;
        case "7":
            this.className = "wf-pause-tasknode";
            this.description += backTimeDesc + "<b>开始时间：</b>" + this.nodeData.startTime + "<br/><b>结束时间：</b>" + this.nodeData.endTime;
            break;
        case "10":
            this.className = "wf-returned-tasknode";
            this.description += backTimeDesc + "<b>开始时间：</b>" + this.nodeData.startTime;
            break;
    }

    this.description += "<br/><b>任务信息：</b>" + valueOf(this.nodeData, "description", "");

    nodeControl.append(jQuery("<div>").html(this.nodeData.nodeName).css({ padding: 2 }));
    nodeControl.append(jQuery("<img>").attr("src", this.icon).css({ width: 20, height: 20, position: "absolute", right: 3, top: 3 }));
    nodeControl.append(jetsennet.ui.createWfLine(0, 25, this.size.width, null));
    nodeControl.append(jetsennet.ui.createWfLine(0, this.size.height - 25, this.size.width, null));
    nodeControl.append(jQuery("<div>").html(this.nodeData.nodeText).css({ padding: 2, position: "absolute", bottom: 0, width: this.size.width, height: 20, overflow: "hidden" }));

    this.control = nodeControl[0];
    return this.control;
};
/**
顺序流节点
*/
jetsennet.ui.WfSequenceNode = function () {
    this.nodeType = jetsennet.ui.WfNodeType.SequenceNode;
    this.className = "wf-containernode";
    this.selectedClassName = "wf-selected-containernode";
    this.enableSelected = true;
    this.nodeData = { nodeId: -1, actId: 10001 };

    this.childNodes = [];

    this.showStartEndNode = false;
    this.showStartEndNode = false;
};
jetsennet.ui.WfSequenceNode.prototype = new jetsennet.ui.WfNodeBase();

jetsennet.ui.WfSequenceNode.prototype.addNode = function (/*node*/node) {
    this.childNodes.push(node);
};

jetsennet.ui.WfSequenceNode.prototype.disSelect = function () {
    if (this.childNodes) {
        var childLength = this.childNodes.length;
        for (var i = 0; i < childLength; i++) {
            this.childNodes[i].disSelect();
        }
    }
    if (this.control && this.enableSelected)
        this.control.className = this.getControlClassName(this.className);
};

/**
取得纵向中间位置
*/
jetsennet.ui.WfSequenceNode.prototype.getRefrenceTop = function (height, nodeHeight) {
    if (height > nodeHeight)
        return parseInt((height - nodeHeight) / 2);
    return 0;
};

jetsennet.ui.WfSequenceNode.prototype.render = function () {
    var ownerWf = this;
    var currentLeft = 0;
    var currentTop = 0;

    this.size = { height: (this.maxCount * jetsennet.ui.WfConfig.nodeSize.height) + ((this.maxCount - 1) * jetsennet.ui.WfConfig.breakLineHeight) };

    var container = document.createElement("DIV");
    container.onselectstart = function (e) { return false; };
    container.style.position = "absolute";
    container.style.height = this.size.height + "px";

    //显示开始
    if (this.showStartEndNode) {
        var beginNode = jQuery.extend(new jetsennet.ui.WfBeginNode(), { workflowView: this.workflowView });
        var beginControl = beginNode.render();
        beginControl.style.left = currentLeft + "px";
        beginControl.style.top = (currentTop + this.getRefrenceTop(this.size.height, beginNode.size.height)) + "px";
        container.appendChild(beginControl);

        currentLeft += beginNode.size.width;
        //连接
        var beginLinkNode = jQuery.extend(new jetsennet.ui.WfLinkNode(), { workflowView: this.workflowView, index: -1 });
        var linkControl = beginLinkNode.render();
        linkControl.style.left = currentLeft + "px";
        linkControl.style.top = (currentTop + this.getRefrenceTop(this.size.height, beginLinkNode.size.height)) + "px";
        container.appendChild(linkControl);

        currentLeft += beginLinkNode.size.width;
    }

    if (this.childNodes) {
        var childLength = this.childNodes.length;
        //alert(childLength);
        if (childLength == 0 && this.nodeType == jetsennet.ui.WfNodeType.SequenceNode && this.workflowView.workflowNode.childNodes.length>0) {
            var emptyNode = jQuery.extend(new jetsennet.ui.WfEmptyNode(), { workflowView: this.workflowView, index: this.index + "," + i });
            var emptyControl = emptyNode.render();
            emptyControl.style.left = currentLeft + "px";
            emptyControl.style.top = (currentTop + this.getRefrenceTop(this.size.height, emptyNode.size.height)) + "px";
            container.appendChild(emptyControl);
            currentLeft += emptyNode.size.width;
        }

        for (var i = 0; i < childLength; i++) {
            //子节点   
            var thisChild = this.childNodes[i];
            thisChild.index = this.index + "," + i;
            var nodeControl = thisChild.render();
            if (nodeControl == null)
                continue;

            if (thisChild.nodeType == jetsennet.ui.WfNodeType.IfElseNode || thisChild.nodeType == jetsennet.ui.WfNodeType.ListenNode
                 || thisChild.nodeType == jetsennet.ui.WfNodeType.WhileNode || thisChild.nodeType == jetsennet.ui.WfNodeType.ParallelNode) {
                currentLeft += 10;
            }

            container.appendChild(nodeControl);

            var position = { left: currentLeft, top: (currentTop + this.getRefrenceTop(this.size.height, thisChild.size.height)) };
            jQuery(nodeControl).css({ left: thisChild.lastPosition.left, top: thisChild.lastPosition.top });
            if (thisChild.lastPosition.left != position.left || thisChild.lastPosition.top != position.top) {
                //alert([thisChild.lastPosition.left, position.left]);
                jQuery(nodeControl).animate({ left: position.left, top: position.top }, 200, null, function () { });
                thisChild.lastPosition = position;
            }

            currentLeft += thisChild.size.width;

            //连接
            if (i < childLength - 1) {
                var linkNode = jQuery.extend(new jetsennet.ui.WfLinkNode(), { workflowView: this.workflowView, index: this.index + "," + i });
                var linkControl = linkNode.render();
                linkControl.style.left = currentLeft + "px";
                linkControl.style.top = (currentTop + this.getRefrenceTop(this.size.height, linkNode.size.height)) + "px";
                container.appendChild(linkControl);
                currentLeft += linkNode.size.width;
            }
        }
    }
    //显示结束
    if (this.showStartEndNode) {
        if (this.childNodes != null && this.childNodes.length > 0) {
            var endLinkNode = jQuery.extend(new jetsennet.ui.WfLinkNode(), { workflowView: this.workflowView, index: this.index + "," + (this.childNodes.length - 1) });
            var linkControl = endLinkNode.render();
            linkControl.style.left = currentLeft + "px";
            linkControl.style.top = (currentTop + this.getRefrenceTop(this.size.height, endLinkNode.size.height)) + "px";
            container.appendChild(linkControl);

            currentLeft += endLinkNode.size.width;
        }

        var endNode = jQuery.extend(new jetsennet.ui.WfEndNode(), { workflowView: this.workflowView });
        var endControl = endNode.render();
        endControl.style.left = currentLeft + "px";
        endControl.style.top = (currentTop + this.getRefrenceTop(this.size.height, endNode.size.height)) + "px";
        container.appendChild(endControl);

        currentLeft += endNode.size.width;
    }

    container.onclick = function () {
        if (ownerWf.childNodes.length == 0) {
            return;
        }
        ownerWf.workflowView.onclick(ownerWf);
    };
    container.oncontextmenu = function () {
        jetsennet.cancelEvent();
        ownerWf.workflowView.oncontextmenu(ownerWf);
        return false;
    };
    this.control = container;
    this.size.width = currentLeft;
    container.style.width = (this.size.width) + "px";

    return container;
};

/**
条件节点
*/
jetsennet.ui.WfIfElseNode = function () {
    this.nodeType = jetsennet.ui.WfNodeType.IfElseNode;
    this.className = "wf-containernode";
    this.selectedClassName = "wf-selected-containernode";
    this.enableSelected = true;
    this.childNodes = [];
    this.enableMove = true;
    this.nodeData = { nodeId: -1, actId: 10101 };
};
jetsennet.ui.WfIfElseNode.prototype = new jetsennet.ui.WfNodeBase();

jetsennet.ui.WfIfElseNode.prototype.addNode = function (/*node*/node) {
    if (node.nodeType != jetsennet.ui.WfNodeType.SequenceNode)
        return;

    this.childNodes.push(node);
};

jetsennet.ui.WfIfElseNode.prototype.disSelect = function () {
    if (this.childNodes) {
        var childLength = this.childNodes.length;
        for (var i = 0; i < childLength; i++) {
            this.childNodes[i].disSelect();
        }
    }
    if (this.control && this.enableSelected)
        this.control.className = this.getControlClassName(this.className);
};

jetsennet.ui.WfIfElseNode.prototype.render = function () {
    if (this.childNodes.length == 0)
        return null;
    var ownerWf = this;
    var complexNodeSpace = jetsennet.ui.WfConfig.complexNodeSpace;
    this.size = { height: (this.maxCount * jetsennet.ui.WfConfig.nodeSize.height) + ((this.maxCount - 1) * jetsennet.ui.WfConfig.breakLineHeight) };

    var container = document.createElement("DIV");
    container.onselectstart = function (e) { return false; };
    container.style.position = "absolute";
    container.style.height = this.size.height + "px";
    container.style.background = "#ffffff";

    this.childNodes[0].index = this.index + ",0";
    this.childNodes[1].index = this.index + ",1";
    var branch1Control = this.childNodes[0].render();
    var branch2Control = this.childNodes[1].render();

    branch2Control.style.top = (this.size.height - this.childNodes[1].size.height) + "px";
    branch1Control.style.left = complexNodeSpace + "px";
    branch2Control.style.left = complexNodeSpace + "px";

    container.appendChild(branch1Control); // alert(branch1Control.outerHTML);
    container.appendChild(branch2Control);

    var maxWidth = (this.childNodes[0].size.width > this.childNodes[1].size.width ? this.childNodes[0].size.width : this.childNodes[1].size.width);
    this.size.width = complexNodeSpace * 2 + maxWidth;
    container.style.width = (this.size.width) + "px";
    this.childNodes[0].control.style.width = (maxWidth) + "px";
    this.childNodes[1].control.style.width = (maxWidth) + "px";

    var ponitLeftTop = { x: 0, y: this.childNodes[0].size.height / 2 };
    var ponitLeftBottom = { x: 0, y: (this.size.height - (this.childNodes[1].size.height / 2)) };
    var ponitRightTop = { x: (this.size.width), y: (this.childNodes[0].size.height / 2) };
    var ponitRightBottom = { x: (this.size.width), y: (this.size.height - (this.childNodes[1].size.height / 2)) };

    var linkLeftTopV = jetsennet.ui.createWfLine(ponitLeftTop.x, ponitLeftTop.y, null, this.size.height / 2 - 10 - ponitLeftTop.y);
    var linkLeftBottomV = jetsennet.ui.createWfLine(ponitLeftTop.x, this.size.height / 2 + 10, null, ponitRightBottom.y - (this.size.height / 2 + 10));
    var linkRightV = jetsennet.ui.createWfLine(ponitRightTop.x, ponitRightTop.y, null, ponitRightBottom.y - ponitRightTop.y);

    var linkLeftBottomH = jetsennet.ui.createWfLine(ponitLeftTop.x, ponitLeftBottom.y, complexNodeSpace, null);
    var linkLeftTopH = jetsennet.ui.createWfLine(ponitLeftTop.x, ponitLeftTop.y, complexNodeSpace, null);
    var linkRightTopH = jetsennet.ui.createWfLine(this.childNodes[0].size.width + complexNodeSpace, ponitRightTop.y, ponitRightTop.x - this.childNodes[0].size.width - complexNodeSpace, null);
    var linkRightBottomH = jetsennet.ui.createWfLine(this.childNodes[1].size.width + complexNodeSpace, ponitRightBottom.y, ponitRightBottom.x - this.childNodes[1].size.width - complexNodeSpace, null);

    container.appendChild(linkLeftTopV);
    container.appendChild(linkLeftBottomV);
    container.appendChild(linkRightV);
    container.appendChild(linkLeftBottomH);
    container.appendChild(linkLeftTopH);
    container.appendChild(linkRightTopH);
    container.appendChild(linkRightBottomH);

    var ifelseImage = jetsennet.ui.createWfImg(jetsennet.baseThemeUrl + "images/wficon/ifelse.gif", this.size.height / 2 - 10, -10);
    container.appendChild(ifelseImage);

    container.onmouseover = function () { ownerWf.workflowView.onmouseover(ownerWf); };
    container.onmouseout = function () { ownerWf.workflowView.onmouseout(ownerWf); };
    container.onmousedown = function () { ownerWf.workflowView.onmousedown(ownerWf); };
    container.onmouseup = function () { ownerWf.workflowView.onmouseup(ownerWf); };
    container.oncontextmenu = function () {
        jetsennet.cancelEvent();
        ownerWf.workflowView.oncontextmenu(ownerWf);
        return false;
    };
    container.onclick = function () {
        ownerWf.workflowView.onclick(ownerWf);
    };

    this.control = container;

    return container;
};

/**
并行节点
*/
jetsennet.ui.WfParallelNode = function () {
    this.nodeType = jetsennet.ui.WfNodeType.ParallelNode;
    this.className = "wf-containernode";
    this.selectedClassName = "wf-selected-containernode";
    this.enableSelected = true;
    this.nodeData = { nodeId: -1, actId: 10201 };
    this.childNodes = [];
    this.enableMove = true;
};
jetsennet.ui.WfParallelNode.prototype = new jetsennet.ui.WfNodeBase();

jetsennet.ui.WfParallelNode.prototype.render = function () {
    if (this.childNodes.length == 0)
        return null;

    var ownerWf = this;
    var complexNodeSpace = jetsennet.ui.WfConfig.complexNodeSpace;
    var totalStandHeight = (this.maxCount * jetsennet.ui.WfConfig.nodeSize.height) + ((this.maxCount - 1) * jetsennet.ui.WfConfig.breakLineHeight);

    var container = document.createElement("DIV");
    container.onselectstart = function (e) { return false; };
    container.style.position = "absolute";
    container.style.background = "#ffffff";

    var maxWidth = 0;
    var childLength = this.childNodes.length;
    var totalSize = 0;
    for (var i = 0; i < childLength; i++) {
        this.childNodes[i].index = this.index + "," + i;
        var branchControl = this.childNodes[i].render();
        container.appendChild(branchControl);
        this.childNodes[i].control = branchControl;

        if (maxWidth < this.childNodes[i].size.width)
            maxWidth = this.childNodes[i].size.width;

        totalSize += this.childNodes[i].size.height + jetsennet.ui.WfConfig.breakLineHeight;

        branchControl.style.left = complexNodeSpace + "px";
    }
    totalSize = totalSize > 0 ? totalSize - jetsennet.ui.WfConfig.breakLineHeight : jetsennet.ui.WfConfig.nodeSize.height;
    this.size = { height: totalSize, width: maxWidth + complexNodeSpace * 2 };

    container.style.width = (this.size.width) + "px";
    container.style.top = (totalStandHeight > totalSize ? parseInt((totalStandHeight - totalSize) / 2) : 0) + "px";
    container.style.height = this.size.height + "px";

    var curHeight = 0;
    for (var i = 0; i < this.childNodes.length; i++) {
        var linkLeftH = jetsennet.ui.createWfLine(0, curHeight + this.childNodes[i].size.height / 2, complexNodeSpace, null);
        var linkRightH = jetsennet.ui.createWfLine(this.childNodes[i].size.width + complexNodeSpace, curHeight + this.childNodes[i].size.height / 2, this.size.width - this.childNodes[i].size.width - complexNodeSpace, null);

        container.appendChild(linkLeftH);
        container.appendChild(linkRightH);

        this.childNodes[i].control.style.top = curHeight + "px";
        this.childNodes[i].control.style.width = maxWidth + "px";
        curHeight += jetsennet.ui.WfConfig.breakLineHeight + this.childNodes[i].size.height;
    }

    var lineTop = parseInt(this.childNodes[0].control.style.top) + this.childNodes[0].size.height / 2;
    var lineHeight = parseInt(this.childNodes[this.childNodes.length - 1].control.style.top) + this.childNodes[this.childNodes.length - 1].size.height / 2 - (parseInt(this.childNodes[0].control.style.top) + this.childNodes[0].size.height / 2);

    var linkLeftTopV = jetsennet.ui.createWfLine(0, lineTop, null, lineHeight / 2 - 10);
    var linkLeftBottomV = jetsennet.ui.createWfLine(0, lineTop + lineHeight / 2 + 10, null, lineHeight / 2 - 10);
    var linkRightV = jetsennet.ui.createWfLine(this.size.width, lineTop, null, lineHeight);

    container.appendChild(linkLeftTopV);
    container.appendChild(linkLeftBottomV);
    container.appendChild(linkRightV);

    var parallelImage = jetsennet.ui.createWfImg(jetsennet.baseThemeUrl + "images/wficon/parallel.gif", lineTop + lineHeight / 2 - 10, -10);
    container.appendChild(parallelImage);

    container.onmouseover = function () { ownerWf.workflowView.onmouseover(ownerWf); };
    container.onmouseout = function () { ownerWf.workflowView.onmouseout(ownerWf); };
    container.onmousedown = function () { ownerWf.workflowView.onmousedown(ownerWf); };
    container.onmouseup = function () { ownerWf.workflowView.onmouseup(ownerWf); };
    container.oncontextmenu = function () {
        jetsennet.cancelEvent();
        ownerWf.workflowView.oncontextmenu(ownerWf);
        return false;
    };
    container.onclick = function () {
        ownerWf.workflowView.onclick(ownerWf);
    };

    this.control = container;
    return container;
};

jetsennet.ui.WfParallelNode.prototype.addNode = function (/*node*/node) {
    if (node.nodeType != jetsennet.ui.WfNodeType.SequenceNode)
        return;

    this.childNodes.push(node);
};

jetsennet.ui.WfParallelNode.prototype.disSelect = function () {
    if (this.childNodes) {
        var childLength = this.childNodes.length;
        for (var i = 0; i < childLength; i++) {
            this.childNodes[i].disSelect();
        }
    }
    if (this.control && this.enableSelected)
        this.control.className = this.getControlClassName(this.className);
};


/**
侦听节点
*/
jetsennet.ui.WfListenNode = function () {
    this.nodeType = jetsennet.ui.WfNodeType.ListenNode;
    this.className = "wf-containernode";
    this.selectedClassName = "wf-selected-containernode";
    this.enableSelected = true;
    this.nodeData = { nodeId: -1, actId: 10301 };
    this.childNodes = [];
    this.enableMove = true;
};
jetsennet.ui.WfListenNode.prototype = new jetsennet.ui.WfNodeBase();

jetsennet.ui.WfListenNode.prototype.render = function () {
    if (this.childNodes.length == 0)
        return null;

    var ownerWf = this;
    var complexNodeSpace = jetsennet.ui.WfConfig.complexNodeSpace;
    var totalStandHeight = (this.maxCount * jetsennet.ui.WfConfig.nodeSize.height) + ((this.maxCount - 1) * jetsennet.ui.WfConfig.breakLineHeight);

    var container = document.createElement("DIV");
    container.onselectstart = function (e) { return false; };
    container.style.position = "absolute";
    container.style.background = "#ffffff";

    var maxWidth = 0;
    var childLength = this.childNodes.length;
    var totalSize = 0;
    for (var i = 0; i < childLength; i++) {
        this.childNodes[i].index = this.index + "," + i;
        var branchControl = this.childNodes[i].render();
        container.appendChild(branchControl);
        this.childNodes[i].control = branchControl;

        if (maxWidth < this.childNodes[i].size.width)
            maxWidth = this.childNodes[i].size.width;

        branchControl.style.left = complexNodeSpace + "px";

        totalSize += this.childNodes[i].size.height + jetsennet.ui.WfConfig.breakLineHeight;
    }
    totalSize = totalSize > 0 ? totalSize - jetsennet.ui.WfConfig.breakLineHeight : jetsennet.ui.WfConfig.nodeSize.height;
    this.size = { height: totalSize, width: maxWidth + complexNodeSpace * 2 };

    container.style.width = (this.size.width) + "px";
    container.style.top = (totalStandHeight > totalSize ? parseInt((totalStandHeight - totalSize) / 2) : 0) + "px";
    container.style.height = this.size.height + "px";

    var curHeight = 0;
    for (var i = 0; i < this.childNodes.length; i++) {
        var linkLeftH = jetsennet.ui.createWfLine(0, curHeight + this.childNodes[i].size.height / 2, complexNodeSpace, null);
        var linkRightH = jetsennet.ui.createWfLine(this.childNodes[i].size.width + complexNodeSpace, curHeight + this.childNodes[i].size.height / 2, this.size.width - this.childNodes[i].size.width - complexNodeSpace, null);

        container.appendChild(linkLeftH);
        container.appendChild(linkRightH);

        this.childNodes[i].control.style.top = curHeight + "px";
        this.childNodes[i].control.style.width = maxWidth + "px";
        curHeight += jetsennet.ui.WfConfig.breakLineHeight + this.childNodes[i].size.height;
    }

    var lineTop = parseInt(this.childNodes[0].control.style.top) + this.childNodes[0].size.height / 2;
    var lineHeight = parseInt(this.childNodes[this.childNodes.length - 1].control.style.top) + this.childNodes[this.childNodes.length - 1].size.height / 2 - (parseInt(this.childNodes[0].control.style.top) + this.childNodes[0].size.height / 2);

    var linkLeftTopV = jetsennet.ui.createWfLine(0, lineTop, null, lineHeight / 2 - 10);
    var linkLeftBottomV = jetsennet.ui.createWfLine(0, lineTop + lineHeight / 2 + 10, null, lineHeight / 2 - 10);
    var linkRightV = jetsennet.ui.createWfLine(this.size.width, lineTop, null, lineHeight);

    container.appendChild(linkLeftTopV);
    container.appendChild(linkLeftBottomV);
    container.appendChild(linkRightV);


    var listenImage = jetsennet.ui.createWfImg(jetsennet.baseThemeUrl + "images/wficon/listen.gif", lineTop + lineHeight / 2 - 10, -10);
    container.appendChild(listenImage);

    container.onmouseover = function () { ownerWf.workflowView.onmouseover(ownerWf); };
    container.onmouseout = function () { ownerWf.workflowView.onmouseout(ownerWf); };
    container.onmousedown = function () { ownerWf.workflowView.onmousedown(ownerWf); };
    container.onmouseup = function () { ownerWf.workflowView.onmouseup(ownerWf); };
    container.oncontextmenu = function () {
        jetsennet.cancelEvent();
        ownerWf.workflowView.oncontextmenu(ownerWf);
        return false;
    };
    container.onclick = function () {
        ownerWf.workflowView.onclick(ownerWf);
    };

    this.control = container;
    return container;
};

jetsennet.ui.WfListenNode.prototype.addNode = function (/*node*/node) {
    if (node.nodeType != jetsennet.ui.WfNodeType.SequenceNode)
        return;

    this.childNodes.push(node);
};

jetsennet.ui.WfListenNode.prototype.disSelect = function () {
    if (this.childNodes) {
        var childLength = this.childNodes.length;
        for (var i = 0; i < childLength; i++) {
            this.childNodes[i].disSelect();
        }
    }
    if (this.control && this.enableSelected)
        this.control.className = this.getControlClassName(this.className);
};
/**
循环节点
*/
jetsennet.ui.WfWhileNode = function () {
    this.nodeType = jetsennet.ui.WfNodeType.WhileNode;
    this.className = "wf-containernode";
    this.selectedClassName = "wf-selected-containernode";
    this.enableSelected = true;
    this.childNodes = [];
    this.enableMove = true;
    this.nodeData = { nodeId: -1, actId: 10401 };
};
jetsennet.ui.WfWhileNode.prototype = new jetsennet.ui.WfNodeBase();

jetsennet.ui.WfWhileNode.prototype.addNode = function (/*node*/node) {
    if (node.nodeType != jetsennet.ui.WfNodeType.SequenceNode)
        return;

    this.childNodes.push(node);
};

jetsennet.ui.WfWhileNode.prototype.disSelect = function () {
    if (this.childNodes) {
        var childLength = this.childNodes.length;
        for (var i = 0; i < childLength; i++) {
            this.childNodes[i].disSelect();
        }
    }
    if (this.control && this.enableSelected)
        this.control.className = this.getControlClassName(this.className);
};

jetsennet.ui.WfWhileNode.prototype.render = function () {
    if (this.childNodes.length == 0)
        return null;
    var ownerWf = this;
    var complexNodeSpace = jetsennet.ui.WfConfig.complexNodeSpace;
    this.size = { height: (this.maxCount * jetsennet.ui.WfConfig.nodeSize.height) };

    var container = document.createElement("DIV");
    container.onselectstart = function (e) { return false; };
    container.style.position = "absolute";
    container.style.height = this.size.height + "px";
    container.style.background = "#ffffff";

    this.childNodes[0].index = this.index + ",0";
    var branchControl = this.childNodes[0].render();

    branchControl.style.top = (this.size.height - this.childNodes[0].size.height) + "px";
    branchControl.style.left = complexNodeSpace + "px";

    container.appendChild(branchControl);

    this.size.width = this.childNodes[0].size.width + complexNodeSpace * 2;
    container.style.width = (this.size.width) + "px";
    //this.childNodes[0].control.style.width = (this.size.width) + "px";

    var imgSize = 20 / 2;
    var tempHeight1 = this.childNodes[0].size.height / 2;
    var tempHeight2 = this.size.height / 2;
    var bottom = this.size.height - tempHeight1;
    if (bottom < tempHeight2 + imgSize)
        bottom = tempHeight2 + imgSize;

    var ponitLeftTop = { x: 0, y: 2 };
    var ponitLeftBottom = { x: 0, y: bottom };
    var ponitRightTop = { x: (this.size.width), y: 2 };
    var ponitRightBottom = { x: (this.size.width), y: bottom };

    var linkLeftTopV = jetsennet.ui.createWfLine(ponitLeftTop.x, ponitLeftTop.y, null, this.size.height / 2 - imgSize - ponitLeftTop.y);
    var linkLeftBottomV = jetsennet.ui.createWfLine(ponitLeftTop.x, this.size.height / 2 + imgSize, null, ponitRightBottom.y - (this.size.height / 2 + imgSize));
    var linkRightV = jetsennet.ui.createWfLine(ponitRightTop.x, ponitRightTop.y, null, ponitRightBottom.y - ponitRightTop.y);
    var linkLeftBottomH = jetsennet.ui.createWfLine(ponitLeftTop.x, ponitLeftBottom.y, complexNodeSpace, null);
    var linkTopH = jetsennet.ui.createWfLine(ponitLeftTop.x, ponitLeftTop.y, ponitRightTop.x - ponitLeftTop.x, null);
    var linkRightBottomH = jetsennet.ui.createWfLine(this.childNodes[0].size.width + complexNodeSpace, ponitRightBottom.y, this.size.width - this.childNodes[0].size.width - complexNodeSpace, null);

    container.appendChild(linkLeftTopV);
    container.appendChild(linkLeftBottomV);
    container.appendChild(linkRightV);
    container.appendChild(linkLeftBottomH);
    container.appendChild(linkTopH);
    container.appendChild(linkRightBottomH);

    var whileImage = jetsennet.ui.createWfImg(jetsennet.baseThemeUrl + "images/wficon/while.gif", this.size.height / 2 - imgSize, -imgSize);
    container.appendChild(whileImage);

    container.onmouseover = function () { ownerWf.workflowView.onmouseover(ownerWf); };
    container.onmouseout = function () { ownerWf.workflowView.onmouseout(ownerWf); };
    container.onmousedown = function () { ownerWf.workflowView.onmousedown(ownerWf); };
    container.onmouseup = function () { ownerWf.workflowView.onmouseup(ownerWf); };
    container.oncontextmenu = function () {
        jetsennet.cancelEvent();
        ownerWf.workflowView.oncontextmenu(ownerWf);
        return false;
    };
    container.onclick = function () {
        ownerWf.workflowView.onclick(ownerWf);
    };

    this.control = container;

    return container;
};
/**
创建流程线
*/
jetsennet.ui.createWfLine = function (left, top, width, height) {
    return jQuery("<div>").css({ top: top, left: left, position: "absolute",
        width: (width ? width : jetsennet.ui.WfConfig.linkLineSize),
        height: (height ? height : jetsennet.ui.WfConfig.linkLineSize)
    }).addClass("wf-line")[0];
};
/**
创建流程辅助图标
*/
jetsennet.ui.createWfImg = function (src, top, left) {
    return jQuery("<img>").attr("src", src).css({ top: top, left: left, position: "absolute" })[0];
};

//创建节点=====================================================================
jetsennet.ui.createWfNode = function (type) {
    var nodeType = parseInt(type);
    switch (nodeType) {
        case jetsennet.ui.WfNodeType.BeginNode:
            return new jetsennet.ui.WfBeginNode();
        case jetsennet.ui.WfNodeType.TaskNode:
        case jetsennet.ui.WfNodeType.TaskAutoNode:
            return new jetsennet.ui.WfTaskNode();
        case jetsennet.ui.WfNodeType.LinkNode:
            return new jetsennet.ui.WfLinkNode();
        case jetsennet.ui.WfNodeType.BreakLinkNode:
            return new jetsennet.ui.WfBreakLinkNode();
        case jetsennet.ui.WfNodeType.EndNode:
            return new jetsennet.ui.WfEndNode();
        case jetsennet.ui.WfNodeType.SequenceNode:
            return new jetsennet.ui.WfSequenceNode();
        case jetsennet.ui.WfNodeType.IfElseNode:
            return new jetsennet.ui.WfIfElseNode();
        case jetsennet.ui.WfNodeType.ParallelNode:
            return new jetsennet.ui.WfParallelNode();
        case jetsennet.ui.WfNodeType.ListenNode:
            return new jetsennet.ui.WfListenNode();
        case jetsennet.ui.WfNodeType.WhileNode:
            return new jetsennet.ui.WfWhileNode();
    }
    return null;
};