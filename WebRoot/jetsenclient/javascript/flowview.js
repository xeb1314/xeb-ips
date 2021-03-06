// lixiaomin 2008/09/01
//=============================================================================
// 工作流视图
//=============================================================================
jetsennet.addLoadedUri(jetsennet.getloadUri("wfview"));
jetsennet.importCss("workflowview");

jetsennet.ui.WfConfig = {
    linkLineSize: 2,            //线的大小
    nodeSize: { width: 80, height: 80 },
    breakLineHeight: 40,        //对于组合节点，节点上下的间隔
    complexNodeSpace: 30,       //对于组合节点，节点与边距的间隔
    tempSize: {}
};

jetsennet.ui.WfViews = {};

/**
节点类型
*/
jetsennet.registerNamespace("jetsennet.ui.WfNodeType");
jetsennet.ui.WfNodeType.TaskNode = 1;
jetsennet.ui.WfNodeType.TaskAutoNode = 2;
jetsennet.ui.WfNodeType.StrategyNode = 3;

jetsennet.ui.WfNodeType.SequenceNode = 10;
jetsennet.ui.WfNodeType.IfElseNode = 11;
jetsennet.ui.WfNodeType.ParallelNode = 12;
jetsennet.ui.WfNodeType.ListenNode = 13;
jetsennet.ui.WfNodeType.WhileNode = 14;

jetsennet.ui.WfNodeType.EmptyNode = 50;
jetsennet.ui.WfNodeType.LinkNode = 51;
jetsennet.ui.WfNodeType.BreakLinkNode = 52;

/**
流程视图
*/
jetsennet.ui.WfView = function (container, width, height, viewName) {
    this.parent = container ? container : document.body;
    this.parent.innerHTML = "";
    this.bgColor = "";

    this.workflowNode = null;
    this.margin = 10;
    this.align = "left-top";

    this.size = { width: width ? width : this.parent.offsetWidth, height: height ? height : this.parent.offsetHeight };

    this.enableSelectNode = true;       //允许选择
    this.isDesignMode = true;           //设计模式   

    this.onnodeclick = null;
    this.onnodedblclick = null;
    this.onnodecontextmenu = null;
    this.onloaded = null;
    this.onnodeconfig = null;
    this.onnodeassign = null;

    this.onnodemousemove = null;
    this.onnodemousedown = null;
    this.onnodemouseup = null;
    this.onnodemouseover = null;
    this.onnodemouseout = null;

    this.isChanged = false;
    this.isMoving = false;
    this.movingData = null;
    this.isRender = false;
    this.enableScale = true;

    this.autoScroll = false;
    this.reportScroll = false;  //记录滚动条的位置
    
    this.viewName = viewName ? viewName : "js-workflow-view";
    jetsennet.ui.WfViews[this.viewName] = this;
};
/**
清空视图
*/
jetsennet.ui.WfView.prototype.clearView = function () {
    this.parent.innerHTML = "";
};
/**
添加节点
*/
jetsennet.ui.WfView.prototype.addNode = function (/*node*/node) {
    if (this.workflowNode == null) {
        this.workflowNode = new jetsennet.ui.WfSequenceNode();
        this.workflowNode.enableSelected = false;
    }
    this.workflowNode.addNode(node);
};

/**
添加节点(按类型)
*/
jetsennet.ui.WfView.prototype.addNodeByType = function (nodeType, nodeParam,pos) {
    var newNode = jetsennet.ui.createWfNode(nodeType);
    jQuery.extend(newNode.nodeParam, jQuery.extend({}, nodeParam));

    if (nodeType == jetsennet.ui.WfNodeType.IfElseNode || newNode.enableBranchNode) {
        newNode.addNode(jetsennet.ui.createWfNode(jetsennet.ui.WfNodeType.SequenceNode));
        newNode.addNode(jetsennet.ui.createWfNode(jetsennet.ui.WfNodeType.SequenceNode));
    }

    if (nodeType == jetsennet.ui.WfNodeType.WhileNode) {
        newNode.addNode(jetsennet.ui.createWfNode(jetsennet.ui.WfNodeType.SequenceNode));
    }

    this.addNode(newNode);

    //流程设计 移动node 滚动条位置不变化
    var scrollLeft = 0;
    var scrollTop = 0;
    if(this.reportScroll){
    	scrollLeft = $(".wf-view")[0].scrollLeft;
    	scrollTop = $(".wf-view")[0].scrollTop;
    }
    if (this.isRender) {
    	this.render();
    }
    $(".wf-view")[0].scrollLeft = scrollLeft;
    $(".wf-view")[0].scrollTop = scrollTop;
    
    if (pos) {
        var newIndex = this.findRecentNodeIndexByPos(pos);
        if (newIndex != null) {
            var nodes = this.workflowNode.childNodes;
            this.movingData = [nodes[nodes.length - 1].index];
            this.moveNode(newIndex);
        }
    }

    this.isChanged = true;
    return newNode;
};
/**
节点及节点的所有子节点  
*/
jetsennet.ui.WfView.prototype.createNodesByObject = function (objNode) {
    if (objNode == null)
        return null;

    var isParentNode = false;
    if (!objNode.actType) {
        objNode.actType = 10;
        isParentNode = true;
        this.isChanged = false;
    }

    var newNode = new jetsennet.ui.createWfNode(objNode.actType);
    if (isParentNode) {
        newNode.enableSelected = false;
    }

    newNode.nodeParam = { id: objNode.flowActId,
        actId: objNode.actId,
        actClass: valueOf(objNode, "actClass", ""),
        name: valueOf(objNode, "name", ""),
        actType: objNode.actType,
        parameter: valueOf(objNode, "parameter", ""),
        assignRule: valueOf(objNode, "assignRule", null)
    };

    if (objNode["flowActivities"]) {
        var subNode = objNode["flowActivities"]["flowActivity"];
        subNode = subNode.length ? subNode : [subNode];

        for (var i = 0; i < subNode.length; i++) {
            newNode.addNode(this.createNodesByObject(subNode[i]));
        }
    }
    return newNode;
};
/**
呈现流程
*/
jetsennet.ui.WfView.prototype.render = function () {
    this.initWfObject();
    this.clearView();
    var ownerWf = this;
    var container = jQuery("<div>").addClass("wf-view").css({ position: "relative", width: "100%", height: "100%", background: this.bgColor, overflow: this.autoScroll ? "hidden" : "auto" })
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

    if (this.enableScale) {
    	jQuery("#divDesign").append(jQuery("<div>").addClass("wf-scale-down").css({ top: 10, left: 40, position: "absolute", width: 20, height: 20 })
            .click(function () {
            	//放大缩小 作大小控制
            	if(parseInt(jetsennet.ui.WfConfig.nodeSize.width)<56){
            		return;
            	}
                ownerWf.clearView();
                jetsennet.ui.WfConfig.nodeSize = { width: jetsennet.ui.WfConfig.nodeSize.width / 1.1, height: jetsennet.ui.WfConfig.nodeSize.height / 1.1 };
                ownerWf.render();
            }))
            .append(jQuery("<div>").addClass("wf-scale-up").css({ top: 10, left: 10, position: "absolute", width: 20, height: 20 })
            .click(function () {
            	if(parseInt(jetsennet.ui.WfConfig.nodeSize.width)>105){
            		return;
            	}
                ownerWf.clearView();
                jetsennet.ui.WfConfig.nodeSize = { width: jetsennet.ui.WfConfig.nodeSize.width * 1.1, height: jetsennet.ui.WfConfig.nodeSize.height * 1.1 };
                ownerWf.render();
            }));
    }

    container[0].onselectstart = function (e) { return false; };

    if (this.workflowNode != null) {
        var controlNode = this.workflowNode.render();
        var top = this.margin + 50;  //默认距顶部50px;
        var left = this.margin;

        if (this.align.indexOf("middle") >= 0) {
            var height = this.workflowNode.size.height;
            if (height < this.size.height) {
                top = (this.size.height - height) / 2;
            }
        }

        if (this.align.indexOf("center") >= 0) {
            var width = this.workflowNode.size.width;
            if (width < this.size.width) {
                left = (this.size.width - width) / 2;
            }
        }

        controlNode.style.top = top + "px";
        controlNode.style.left = left + "px";

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

        if (!node.isComplexNode) {

            for (var i = 0; i < node.childNodes.length; i++) {
                node.childNodes[i].maxCount = maxCount;
            }
        }
    }
    //组合类型
    if (node.isComplexNode) {

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

jetsennet.ui.WfView.prototype.findRecentNodeIndexByPos = function (pos, nodes) {
    var index = null;

    if (nodes == null) {
        nodes = this.workflowNode.childNodes;
    }

    for (var i = 0; i < nodes.length; i++) {

        if (jetsennet.util.isInPosition(pos, nodes[i].control)) {
            index = nodes[i].index;

            if (nodes[i].isComplexNode) {
                var childNodes = nodes[i].childNodes;
                for (var j = 0; j < childNodes.length; j++) {
                    var subNodes = childNodes[j].childNodes;
                    for (var k = 0; k < subNodes.length; k++) {
                        var subIndex = this.findRecentNodeIndexByPos(pos, subNodes);
                        if (subIndex != null) {
                            return subIndex;
                        }
                    }
                }

                for (var j = 0; j < childNodes.length; j++) {
                    if (jetsennet.util.isInPosition(pos, childNodes[j].control)) {
                        return childNodes[j].index;
                    }
                }
            }

            return index;
        }
    }

    return index;
};
/**
选中节点
*/
jetsennet.ui.WfView.prototype.selectNode = function (node) {
    if (this.enableSelectNode && this.isDesignMode) {
        this.workflowNode.disSelect();
        node.select();
    }
};
/**
鼠标事件
*/
jetsennet.ui.WfView.prototype.onclick = function (node) {
    if (jQuery.isFunction(this.onnodeclick)) {
        this.onnodeclick(node);
    }

    if (node) {
        this.selectNode(node);
    }
    jetsennet.cancelEvent();
    jetsennet.hide(el('div-workflow-menu'));
};
jetsennet.ui.WfView.prototype.ondblclick = function (node) {   
    if (jQuery.isFunction(this.onnodedblclick)) {
        this.onnodedblclick(node);
    }
}
jetsennet.ui.WfView.prototype.onmouseover = function (node) {

    if (jQuery.isFunction(this.onnodemouseover)) {
        this.onnodemouseover(node);
    }

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
};
jetsennet.ui.WfView.prototype.onmouseout = function (node) {

    if (jQuery.isFunction(this.onnodemouseout)) {
        this.onnodemouseout(node);
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
        this.movingData = [node.index, node.size.height, node.size.width, curX, curY];
        this.isMoving = true;
        jetsennet.cancelEvent();
    }

    if (jQuery.isFunction(this.onnodemousedown)) {
        this.onnodemousedown(node);
    }
};
jetsennet.ui.WfView.prototype.onmousemove = function (node) {
    if (jQuery.isFunction(this.onnodemousemove)) {
        this.onnodemousemove(node);
    }

    if (this.isDesignMode && this.isMoving) {
        var evt = jetsennet.getEvent();
        var curX = IS_IE ? evt.clientX : evt.pageX;
        var curY = IS_IE ? evt.clientY : evt.pageY;

        if (Math.abs(curX - this.movingData[3]) > 3 && Math.abs(curY - this.movingData[4]) > 3) {
            var moveElement = jQuery("#div-workflow-move");

            if (moveElement.size() == 0) {
                var moveNode = this.getNodeAndParentByIndex(this.movingData[0]).node;
                var moveObj = jQuery(moveNode.control);
                moveObj.children(".wf-sicon").hide();
                moveElement = moveObj.clone().attr("id", "div-workflow-move").addClass("wf-move-node")
            .appendTo("body").css({ width: moveNode.size.width, height: moveNode.size.height });
                moveElement[0].onselectstart = function (e) { return false; };
            }

            var evt = jetsennet.getEvent();
            var scrollSize = jetsennet.util.getWindowScrollSize();
            var pos = { left: ((IS_IE ? scrollSize.width + evt.clientX : scrollSize.width + evt.pageX) + 8),
                top: ((IS_IE ? scrollSize.height + evt.clientY : scrollSize.height + evt.pageY) + 8)
            };
            moveElement.show().css({ left: pos.left, top: pos.top });

            this.parent.style.cursor = "move";
            jetsennet.cancelEvent();
        }
    }
};
jetsennet.ui.WfView.prototype.onmouseup = function (node) {

    if (jQuery.isFunction(this.onnodemouseup)) {
        this.onnodemouseup(node);
    }

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
};
jetsennet.ui.WfView.prototype.onassign = function (node) {
    if (jQuery.isFunction(this.onnodeassign)) {
        this.onnodeassign(node);
    }
};

/**
移除节点
*/
jetsennet.ui.WfView.prototype.removeNode = function (nodeIndex) {

    var owner = this;

    var nodeAndParent = owner.getNodeAndParentByIndex(nodeIndex);
    if (nodeAndParent.node == null)
        return;

    nodeAndParent.node.index = -100;
    var tempOldSequence = [];
    for (var i = 0; i < nodeAndParent.parent.childNodes.length; i++) {
        if (nodeAndParent.parent.childNodes[i].index != -100) {
            tempOldSequence.push(nodeAndParent.parent.childNodes[i]);
        }
    }
    nodeAndParent.parent.childNodes = tempOldSequence;
    
    //流程设计 移动node 滚动条位置不变化
    var scrollLeft = 0;
    var scrollTop = 0;
    if(this.reportScroll){
    	scrollLeft = $(".wf-view")[0].scrollLeft;
    	scrollTop = $(".wf-view")[0].scrollTop;
    }
    if (owner.isRender) {
        owner.render();
    }
    $(".wf-view")[0].scrollLeft = scrollLeft;
    $(".wf-view")[0].scrollTop = scrollTop;
    
    this.isChanged = true;
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

    if (node.nodeType == jetsennet.ui.WfNodeType.TaskNode || node.nodeType == jetsennet.ui.WfNodeType.TaskAutoNode
        || node.nodeType == jetsennet.ui.WfNodeType.StrategyNode) {
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

        if (newNode.nodeType == jetsennet.ui.WfNodeType.SequenceNode) {
            newNodeParent = newNode;
        }

        //移动到新位置
        var tempNewSequence = [];
        if (newNodeParent.childNodes.length == 0) {
            tempNewSequence.push(copyNode);
        }
        else {
            var childLength = newNodeParent.childNodes.length;
            for (var i = 0; i < childLength; i++) {
                var currentNodeIndex = newNodeParent.childNodes[i].index;
                var isToPrex = false;
                if (i < childLength - 1) {

                    var nextNodeIndex = newNodeParent.childNodes[i + 1].index;
                    if (currentNodeIndex == nodeIndex && this.movingData[0] == nextNodeIndex) {
                        
                        isToPrex = true;
                    }
                }

                if (isToPrex) {
                    tempNewSequence.push(copyNode);
                }

                tempNewSequence.push(newNodeParent.childNodes[i]);

                if (currentNodeIndex == nodeIndex && !isToPrex) {
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

    //流程设计 移动node 滚动条位置不变化
    var scrollLeft = 0;
    var scrollTop = 0;
    if(this.reportScroll){
    	scrollLeft = $(".wf-view")[0].scrollLeft;
    	scrollTop = $(".wf-view")[0].scrollTop;
    }
    this.render();
    $(".wf-view")[0].scrollLeft = scrollLeft;
    $(".wf-view")[0].scrollTop = scrollTop;
    
    this.isChanged = true;
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
        var tempNode = null;

        if (node.childNodes) {
            tempNode = node.childNodes[tempIndexArr[layerIndex]];
        }

        if (tempNode == null)
            break;

        node = tempNode;
        layerIndex++;

        if (!node.childNodes || layerIndex == tempIndexArr.length)
            break;
        nodeParent = node;
    }
    return { node: node, parent: nodeParent };
};
//取得节点（NodeId）=============================================================
jetsennet.ui.WfView.prototype.getNodeByNodeId = function (nodeId) {
    return this.__getNodeByNodeId(this.workflowNode, nodeId);
};
jetsennet.ui.WfView.prototype.__getNodeByNodeId = function (node, nodeId) {
    if (node == null)
        return null;

    if (node.nodeParam != null && node.nodeParam.id == nodeId) {
        return node;
    }

    if (node.childNodes == null)
        return null;

    for (var i = 0; i < node.childNodes.length; i++) {
        var nodeResult = this.__getNodeByNodeId(node.childNodes[i], nodeId);
        if (nodeResult != null)
            return nodeResult;
    }
    return null;
};

/**
节点基类
*/
jetsennet.ui.WfNodeBase = function () {
    this.icon = null;
    this.nodeType = null;
    this.isRender = false;
    this.workflowView = null;
    this.className = null;
    this.control = null;
    this.index = 0;
    this.enableSelected = false;
    this.lastPosition = { left: 0, top: 1 };
};
jetsennet.ui.WfNodeBase.prototype.select = function () {
    if (this.control && this.enableSelected)
        jQuery(this.control).removeClass(this.className).addClass(this.selectedClassName);
};
jetsennet.ui.WfNodeBase.prototype.disSelect = function () {
    if (this.control && this.enableSelected)
        jQuery(this.control).removeClass(this.selectedClassName).addClass(this.className);
};

//呈现节点
jetsennet.ui.WfNodeBase.prototype.render = function () {
    var ownerWf = this;
    this.size = this.size ? this.size : jetsennet.ui.WfConfig.nodeSize;
    var trueSize = this.getTrueSize();

    var nodeControl = jQuery("<div>").css({ position: "absolute", overflow: "hidden",
        width: trueSize.width, height: trueSize.height
    })
    .mouseover(function () { ownerWf.workflowView.onmouseover(ownerWf); })
    .mouseout(function () { ownerWf.workflowView.onmouseout(ownerWf); })
    .mousedown(function () { ownerWf.workflowView.onmousedown(ownerWf); })
    .mouseup(function () { ownerWf.workflowView.onmouseup(ownerWf); })
    .contextmenu(function (e) {
        jetsennet.cancelEvent();
        ownerWf.workflowView.oncontextmenu(ownerWf);
        return false;
    }).addClass(this.className);

    if (this.icon && this.icon != "") {
        jQuery("<img>").attr("src", this.icon).css({ width: this.size.width, height: this.size.height }).appendTo(nodeControl);
    }
    else {
        nodeControl.html(this.nodeParam.name);
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
    newNode.nodeParam = node.nodeParam;
    newNode.lastPosition = node.lastPosition;

    if (node.childNodes) {
        for (var i = 0; i < node.childNodes.length; i++) {
            newNode.addNode(this.cloneNode(node.childNodes[i]));
        }
    }
    return newNode;
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
    var edgeSize = jetsennet.util.isNullOrEmpty(this.className) 
        ? { left: 0, right: 0, top: 0, bottom: 0,borderTop:0,borderLeft:0,borderRight:0,borderBottom:0} : jetsennet.ui.WfConfig.tempSize[this.className];
    if (edgeSize == null) {
        var temp = jQuery("<div>").addClass(this.className).appendTo("body");
        edgeSize = jetsennet.util.getControlEdgeSize(temp[0]);
        jetsennet.ui.WfConfig.tempSize[this.className] = edgeSize;
        temp.remove();
    }
    return edgeSize;
};
jetsennet.ui.WfNodeBase.prototype.getTrueSize = function () {
    var edgeSize = this.getEdgeSize();
    return { width: this.size.width - edgeSize.left + edgeSize.borderLeft - edgeSize.right + edgeSize.borderRight,
        height: this.size.height - edgeSize.top + edgeSize.borderTop - edgeSize.bottom + edgeSize.borderBottom
    };
};
/**
连接节点
*/
jetsennet.ui.WfLinkNode = function () {
    this.icon = jetsennet.baseThemeUrl + "images/wficon/link.gif";
    this.nodeParam = { id: -1 };
    this.size = { width: 30, height: jetsennet.ui.WfConfig.linkLineSize };
    this.nodeType = jetsennet.ui.WfNodeType.LinkNode;
};
jetsennet.ui.WfLinkNode.prototype = new jetsennet.ui.WfNodeBase();

jetsennet.ui.WfLinkNode.prototype.render = function () {
    var ownerWf = this;
    this.size = this.size ? this.size : jQuery.extend({}, jetsennet.ui.WfConfig.nodeSize);
    var trueSize = this.getTrueSize();
    var nodeControl = jQuery("<div>").css({ position: "absolute", overflow: "hidden" }).height(this.size.height).width(this.size.width)
    .height(trueSize.height).width(trueSize.width);

    jetsennet.ui.createWfLine(nodeControl[0], 0, 0, this.size.width, null);

    this.contorl = nodeControl[0];

    return this.contorl;
};
/**
空节点
*/
jetsennet.ui.WfEmptyNode = function () {
    //this.icon = jetsennet.baseThemeUrl + "images/wficon/empty.gif";
    this.nodeParam = { id: -1 };
    this.size = { width: 50, height: 15 };
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
    this.nodeParam = { id: -1, actId: 1 };
    this.moving = false;
};
jetsennet.ui.WfTaskNode.prototype = new jetsennet.ui.WfNodeBase();

//呈现节点
jetsennet.ui.WfTaskNode.prototype.render = function () {
    var ownerWf = this;
    this.size = this.size ? this.size : jQuery.extend({}, jetsennet.ui.WfConfig.nodeSize);
    this.size = jQuery.extend({}, jetsennet.ui.WfConfig.nodeSize);

    var trueSize = this.getTrueSize();

    var nodeControl = jQuery("<div>").css({ position: "absolute" }).height(this.size.height).width(this.size.width)
    .addClass(this.className).addClass("wf-act-" + this.nodeParam.actId)
    .addClass("img-rounded").addClass("word-space")
    .height(trueSize.height).width(trueSize.width);

    nodeControl.append(jQuery("<div>").html(jetsennet.xml.htmlEscape(this.nodeParam.name)).css({ padding: 2, position: "absolute", bottom: 1, width: this.size.width - 4, textAlign: "center" }).addClass("nodeWord-space")).addClass("wf-nodename");

    this.control = nodeControl[0];
    jetsennet.ui.appendWfNodeEvent(ownerWf);

    if (!ownerWf.workflowView.isDesignMode) {
        this.refreshNodeStatus();
    }
//    WfmActivityConfigEffect.validateAllAct(this);
    return this.control;
};
jetsennet.ui.WfTaskNode.prototype.setNodeName = function (nodeName) {
    jQuery("div", this.control).html(nodeName);
};
/**
节点状态
*/
jetsennet.ui.WfTaskNode.prototype.refreshNodeStatus = function () {
    //    state = 2;
    //    stateDesc = 状态描述 || "100;100;100;100;100;100;80;90";
    //    progress = 50;
    var state = this.nodeParam.state;
    var stateDesc = this.nodeParam.stateDesc;
    var progress = this.nodeParam.progress;

    var c = jQuery(this.control);

    for (var i = 0; i <= 10; i++) {
        c.removeClass("wf-status-" + i);
    }
    c.addClass("wf-status-" + state);
    jQuery(".wf-progress", c).remove();

    if (state == 2 && progress && progress != "0") {

        var progressWidth = this.size.width * 2;
        var progressControl = jQuery("<div>").addClass("wf-progress").css({ position: "absolute", bottom: -20, left: -(this.size.width / 2), width: progressWidth });

        if (stateDesc && stateDesc.indexOf(";") > 0) {
            var subProgress = stateDesc.split(";");
            var subWidth = (progressWidth - (subProgress.length - 1)) / (subProgress.length);
            for (var i = 0; i < subProgress.length; i++) {
                progressControl.append(jQuery("<div>").addClass("wf-progress-value").css({ left: i == 0 ? 0 : ((subWidth + 1) * i), width: subProgress[i] * 0.01 * subWidth }));
            }
        }
        else {
            progressControl.append(jQuery("<div>").addClass("wf-progress-value").css({ left: 0, width: progress * 0.01 * progressWidth }));
        }

        c.append(progressControl);
    }
};
/**
顺序流节点
*/
jetsennet.ui.WfSequenceNode = function () {
    this.nodeType = jetsennet.ui.WfNodeType.SequenceNode;
    this.className = "wf-containernode";
    this.selectedClassName = "wf-selected-containernode";
    this.enableSelected = true;
    this.nodeParam = { id: -1, actId: 10001, name :"分支",actType:10 };

    this.childNodes = [];
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
        this.control.className = this.className;
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

    if (this.childNodes) {
        var childLength = this.childNodes.length;

        if (childLength == 0 && this.nodeType == jetsennet.ui.WfNodeType.SequenceNode
         && this.workflowView.workflowNode.childNodes.length > 0) {
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

            container.appendChild(nodeControl);
        }
    }

    if (ownerWf.workflowView.isDesignMode) {
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
    }

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
    this.isComplexNode = true;
    this.nodeParam = { id: -1, actId: 10101 };
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
        this.control.className = this.className;
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

    jetsennet.ui.createWfLine(container, ponitLeftTop.x, ponitLeftTop.y, null, this.size.height / 2 - 10 - ponitLeftTop.y);
    jetsennet.ui.createWfLine(container, ponitLeftTop.x, this.size.height / 2 + 10, null, ponitRightBottom.y - (this.size.height / 2 + 10));
    jetsennet.ui.createWfLine(container, ponitRightTop.x, ponitRightTop.y, null, ponitRightBottom.y - ponitRightTop.y + jetsennet.ui.WfConfig.linkLineSize);

    jetsennet.ui.createWfLine(container, ponitLeftTop.x, ponitLeftBottom.y, complexNodeSpace, null);
    jetsennet.ui.createWfLine(container, ponitLeftTop.x, ponitLeftTop.y, complexNodeSpace, null);
    jetsennet.ui.createWfLine(container, this.childNodes[0].size.width + complexNodeSpace, ponitRightTop.y, ponitRightTop.x - this.childNodes[0].size.width - complexNodeSpace, null);
    jetsennet.ui.createWfLine(container, this.childNodes[1].size.width + complexNodeSpace, ponitRightBottom.y, ponitRightBottom.x - this.childNodes[1].size.width - complexNodeSpace, null);

    var ifelseImage = jetsennet.ui.createWfImg(jetsennet.baseThemeUrl + "images/wficon/ifelse.gif", this.size.height / 2 - 10, -10);
    container.appendChild(ifelseImage);

    this.control = container;
    jetsennet.ui.appendWfNodeEvent(ownerWf);

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
    this.nodeParam = { id: -1, actId: 10201 };
    this.childNodes = [];
    this.enableBranchNode = true;
    this.isComplexNode = true;
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
        var conditionLineTop = curHeight + this.childNodes[i].size.height / 2;
        jetsennet.ui.createWfLine(container, 0, conditionLineTop, (complexNodeSpace - 9) / 2, null);
        var parallelImage = jetsennet.ui.createWfImg(jetsennet.baseThemeUrl + "images/wficon/setting2.png", conditionLineTop - 4, (complexNodeSpace - 9) / 2);
        container.appendChild(parallelImage);

        //jetsennet.ui.createWfLine(container, 0, curHeight + this.childNodes[i].size.height / 2, complexNodeSpace, null)
        jQuery(parallelImage).dblclick(jetsennet.bindFunction(this.childNodes[i], function () {
            ownerWf.workflowView.ondblclick(this);
            jetsennet.cancelEvent();
        }));
        jetsennet.ui.createWfLine(container, (complexNodeSpace - 9) / 2 + 9, conditionLineTop, (complexNodeSpace - 9) / 2, null);

        jetsennet.ui.createWfLine(container, this.childNodes[i].size.width + complexNodeSpace, curHeight + this.childNodes[i].size.height / 2, this.size.width - this.childNodes[i].size.width - complexNodeSpace, null);

        this.childNodes[i].control.style.top = curHeight + "px";
        this.childNodes[i].control.style.width = maxWidth + "px";
        curHeight += jetsennet.ui.WfConfig.breakLineHeight + this.childNodes[i].size.height;
    }

    var lineTop = parseInt(this.childNodes[0].control.style.top) + this.childNodes[0].size.height / 2;
    var lineHeight = parseInt(this.childNodes[this.childNodes.length - 1].control.style.top) + this.childNodes[this.childNodes.length - 1].size.height / 2 - (parseInt(this.childNodes[0].control.style.top) + this.childNodes[0].size.height / 2);
    var imgSize = 20 / 2;
    var imageTop = this.size.height / 2 - imgSize - lineTop;

    jetsennet.ui.createWfLine(container, 0, lineTop, null, imageTop);
    jetsennet.ui.createWfLine(container, 0, lineTop + imageTop + imgSize * 2, null, lineHeight - imageTop - imgSize * 2);
    jetsennet.ui.createWfLine(container, this.size.width, lineTop, null, lineHeight + jetsennet.ui.WfConfig.linkLineSize);

    var parallelImage = jetsennet.ui.createWfImg(jetsennet.baseThemeUrl + "images/wficon/parallel.gif", lineTop + imageTop, -10);
    container.appendChild(parallelImage);

    this.control = container;
    jetsennet.ui.appendWfNodeEvent(ownerWf);

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
        this.control.className = this.className;
};


/**
侦听节点
*/
jetsennet.ui.WfListenNode = function () {
    this.nodeType = jetsennet.ui.WfNodeType.ListenNode;
    this.className = "wf-containernode";
    this.selectedClassName = "wf-selected-containernode";
    this.enableSelected = true;
    this.nodeParam = { id: -1, actId: 10301 };
    this.childNodes = [];
    this.enableBranchNode = true;
    this.isComplexNode = true;
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
        jetsennet.ui.createWfLine(container, 0, curHeight + this.childNodes[i].size.height / 2, complexNodeSpace, null);
        jetsennet.ui.createWfLine(container, this.childNodes[i].size.width + complexNodeSpace, curHeight + this.childNodes[i].size.height / 2, this.size.width - this.childNodes[i].size.width - complexNodeSpace, null);

        this.childNodes[i].control.style.top = curHeight + "px";
        this.childNodes[i].control.style.width = maxWidth + "px";
        curHeight += jetsennet.ui.WfConfig.breakLineHeight + this.childNodes[i].size.height;
    }

    var lineTop = parseInt(this.childNodes[0].control.style.top) + this.childNodes[0].size.height / 2;
    var lineHeight = parseInt(this.childNodes[this.childNodes.length - 1].control.style.top) + this.childNodes[this.childNodes.length - 1].size.height / 2 - (parseInt(this.childNodes[0].control.style.top) + this.childNodes[0].size.height / 2);
    var imgSize = 20 / 2;
    var imageTop = this.size.height / 2 - imgSize - lineTop;

    jetsennet.ui.createWfLine(container, 0, lineTop, null, imageTop);
    jetsennet.ui.createWfLine(container, 0, lineTop + imageTop + imgSize*2, null, lineHeight - imageTop - imgSize*2);
    jetsennet.ui.createWfLine(container, this.size.width, lineTop, null, lineHeight + jetsennet.ui.WfConfig.linkLineSize);

    var listenImage = jetsennet.ui.createWfImg(jetsennet.baseThemeUrl + "images/wficon/listen.gif", lineTop + imageTop, -10);
    container.appendChild(listenImage);

    this.control = container;
    jetsennet.ui.appendWfNodeEvent(ownerWf);

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
        this.control.className = this.className;
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
    this.isComplexNode = true;
    this.nodeParam = { id: -1, actId: 10401 };
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
        this.control.className = this.className;
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

    jetsennet.ui.createWfLine(container, ponitLeftTop.x, ponitLeftTop.y, null, this.size.height / 2 - imgSize - ponitLeftTop.y);
    jetsennet.ui.createWfLine(container, ponitLeftTop.x, this.size.height / 2 + imgSize, null, ponitRightBottom.y - (this.size.height / 2 + imgSize));
    jetsennet.ui.createWfLine(container, ponitRightTop.x, ponitRightTop.y, null, ponitRightBottom.y - ponitRightTop.y + jetsennet.ui.WfConfig.linkLineSize);
    jetsennet.ui.createWfLine(container, ponitLeftTop.x, ponitLeftBottom.y, complexNodeSpace, null);
    jetsennet.ui.createWfLine(container, ponitLeftTop.x, ponitLeftTop.y, ponitRightTop.x - ponitLeftTop.x, null);
    jetsennet.ui.createWfLine(container, this.childNodes[0].size.width + complexNodeSpace, ponitRightBottom.y, this.size.width - this.childNodes[0].size.width - complexNodeSpace, null);


    var whileImage = jetsennet.ui.createWfImg(jetsennet.baseThemeUrl + "images/wficon/while.gif", this.size.height / 2 - imgSize, -imgSize);
    container.appendChild(whileImage);

    this.control = container;
    jetsennet.ui.appendWfNodeEvent(ownerWf);

    return container;
};
/**
创建流程线
*/
jetsennet.ui.createWfLine = function (container, left, top, width, height) {
    var line = jQuery("<div>").css({ top: top, left: left, position: "absolute",
        width: (width ? width : jetsennet.ui.WfConfig.linkLineSize),
        height: (height ? height : jetsennet.ui.WfConfig.linkLineSize)
    }).addClass("wf-line");
    container.appendChild(line[0]);

    return line;
};
/**
创建流程辅助图标
*/
jetsennet.ui.createWfImg = function (src, top, left) {

    return jQuery("<img>").attr("src", src).css({ top: top, left: left, position: "absolute" })[0];
};

/**
给节点添加事件
*/
jetsennet.ui.appendWfNodeEvent = function (ownerWf) {

    var cotrolObj = jQuery(ownerWf.control);

    cotrolObj.mouseover(function () {
    	if(!jQuery(ownerWf.control).attr("title")){
    		if(parseInt(ownerWf.nodeParam.actId)<10000){
    			jQuery(ownerWf.control).attr("title",ownerWf.control.innerText);
    		}
    	}
        if (!ownerWf.workflowView.isMoving) {
            jQuery(ownerWf.control).children(".wf-sicon").show();
        }
        ownerWf.workflowView.onmouseover(ownerWf);
        jetsennet.cancelEvent();
    })
    .mouseout(function () {
        jQuery(ownerWf.control).children(".wf-sicon").stop().hide();
        ownerWf.workflowView.onmouseout(ownerWf);
        jetsennet.cancelEvent();
    })
    .mousedown(function () {
        ownerWf.workflowView.onmousedown(ownerWf);
        jetsennet.cancelEvent();
    })
    .mouseup(function () { ownerWf.workflowView.onmouseup(ownerWf); jetsennet.cancelEvent(); })
    .contextmenu(function (e) {
        jetsennet.cancelEvent();
        ownerWf.workflowView.oncontextmenu(ownerWf);
        return false;
    })
    .click(function () {
        if (jQuery.isFunction(ownerWf.onclick)) {
            ownerWf.onclick(ownerWf);
        }
        ownerWf.workflowView.onclick(ownerWf);
        jetsennet.cancelEvent();
    })
    .dblclick(function () {
        ownerWf.workflowView.ondblclick(ownerWf);
        jetsennet.cancelEvent();
    });

    if (ownerWf.workflowView.isDesignMode) {
        cotrolObj.append(jQuery("<img>").addClass("wf-sicon").attr("title", "删除").attr("src", jetsennet.baseThemeUrl + "images/wficon/drop.png").css({ width: 16, height: 16, position: "absolute", display: "none", right: -8, top: -8 })
            .click(jetsennet.bindFunction(ownerWf.workflowView, function (index) { this.removeNode(index); }, ownerWf.index)))
        .append(jQuery("<img>").addClass("wf-sicon").attr("title", "配置").attr("src", jetsennet.baseThemeUrl + "images/wficon/setting.png").css({ width: 16, height: 16, position: "absolute", display: "none", left: -8, top: -8 })
            .click(jetsennet.bindFunction(ownerWf.workflowView, function (node) { this.onnodeconfig(node); }, ownerWf)));

        if (ownerWf.enableBranchNode) {
            cotrolObj.append(jQuery("<img>").addClass("wf-sicon").attr("title", "去除多余分支").attr("src", jetsennet.baseThemeUrl + "images/wficon/sub.png").css({ width: 16, height: 16, position: "absolute", display: "none", bottom: -8, left: -8 })
            .click(jetsennet.bindFunction(ownerWf.workflowView, function (index) {

                var nodeAndParent = this.getNodeAndParentByIndex(index);

                if (nodeAndParent.node != null && nodeAndParent.node.enableBranchNode) {
                    var tempSequence = [];
                    for (var i = 0; i < nodeAndParent.node.childNodes.length; i++) {
                        if (nodeAndParent.node.childNodes[i].childNodes.length != 0) {
                            tempSequence.push(nodeAndParent.node.childNodes[i]);
                        }
                    }

                    while (tempSequence.length < 2) {
                        tempSequence.push(jetsennet.ui.createWfNode(jetsennet.ui.WfNodeType.SequenceNode));                                          
                    }
                    
                    nodeAndParent.node.childNodes = tempSequence;                   

                    if (this.isRender) {
                        this.render();
                    }

                    this.isChanged = true;
                }
            }, ownerWf.index)))
            .append(jQuery("<img>").addClass("wf-sicon").attr("title", "添加分支").attr("src", jetsennet.baseThemeUrl + "images/wficon/add.gif").css({ width: 16, height: 16, position: "absolute", display: "none", bottom: -8, right: -8 })
            .click(jetsennet.bindFunction(ownerWf.workflowView, function (index) {
                var nodeAndParent = this.getNodeAndParentByIndex(index);
                if (nodeAndParent.node != null && nodeAndParent.node.enableBranchNode) {
                    var subNode1 = jetsennet.ui.createWfNode(jetsennet.ui.WfNodeType.SequenceNode);
                    nodeAndParent.node.addNode(subNode1);
                    if (this.isRender) {
                        this.render();
                    }
                    this.isChanged = true;
                }
            }, ownerWf.index)));
        }
        else if (ownerWf.nodeParam.actType == jetsennet.ui.WfNodeType.TaskNode) {
            cotrolObj.append(jQuery("<img>").addClass("wf-sicon").attr("title", "任务指派").attr("src", jetsennet.baseThemeUrl + "images/wficon/assign.gif").css({ width: 16, height: 16, position: "absolute", display: "none", bottom: -8, left: -8 })
            .click(jetsennet.bindFunction(ownerWf.workflowView, function (node) {
                this.onassign(node);
            }, ownerWf)));
        }
    }
    else if (ownerWf.nodeParam.actType == jetsennet.ui.WfNodeType.TaskNode) {
        if (jQuery.isFunction(ownerWf.workflowView.onnodeassign)) {
            cotrolObj.append(jQuery("<img>").addClass("wf-sicon").attr("title", "任务指派").attr("src", jetsennet.baseThemeUrl + "images/wficon/assign.gif").css({ width: 16, height: 16, position: "absolute", display: "none", bottom: -8, left: -8 })
            .click(jetsennet.bindFunction(ownerWf.workflowView, function (node) {
                this.onassign(node);
            }, ownerWf)));
        }
    }
};

/**
创建节点
*/
jetsennet.ui.createWfNode = function (type) {
    var nodeType = parseInt(type);
    switch (nodeType) {
        case jetsennet.ui.WfNodeType.TaskNode:
        case jetsennet.ui.WfNodeType.TaskAutoNode:
        case jetsennet.ui.WfNodeType.StrategyNode:
            return new jetsennet.ui.WfTaskNode();
        case jetsennet.ui.WfNodeType.LinkNode:
            return new jetsennet.ui.WfLinkNode();
        case jetsennet.ui.WfNodeType.BreakLinkNode:
            return new jetsennet.ui.WfBreakLinkNode();
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


//流程节点校验
var WfmActivityConfigEffect = (function(){
	return{
		//打回
		validateAllAct: function(node) {
//			alert(node.nodeParam.actType);
		}
	};
}());