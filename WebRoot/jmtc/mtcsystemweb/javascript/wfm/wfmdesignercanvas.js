var paper;                 // 定义画布
var canvasDivObj;          // 画布jquery对象
var shapes = {};           // 保存画布上每个节点，以及节点相关的信息
var paths = {};            // 保存画布上每个path
var editable = false;      // 画布是否可编辑
var sequence = true;       // 默认为顺序流
var pathAttr = {"stroke-width": "2px", "stroke-linecap": "round", "stroke-linejoin": "round", stroke: "gray"};

// 初始化画布
function initCanvas(canvasDiv, width, height) {
    // 创建画布
	paper = Raphael(canvasDiv, width, height);
	canvasDivObj = jQuery("#"+canvasDiv);

    // 拖动恢复到原位置
    jQuery(".dragDiv").draggable({
    	cursor: "move",
    	revert: true, 
    	revertDuration: 300,
    	opacity: 0.5,
    	helper: "clone"
    });
    // 拖到画布上
    canvasDivObj.droppable({
        // 拖拽停止事件
        drop: function(event, ui){
    		if (!editable){
    			return;
    		}

    		var dragObj = ui.draggable,
    			actId = dragObj.attr("actId"),
    			actType = dragObj.attr("actType"),
    			longName = dragObj.attr("longName"),
    			actIcon = dragObj.attr("actIcon"),
    			point = getXY(event);
    		//简单节点：人工，自动，策略节点
            if (actType == "1" || actType == "2" || actType == "3"){
            	isOverNodeOrPath(createSimpleNode(actId, actType, actIcon, longName, point.x-42.5, point.y-42.5));
            }
        }
    });
    
    canvasDivObj.mousemove(function (event) {
    	if (!editable){
    		return;
    	}
    	// 判断点在路径附近
    	if (!jQuery.isEmptyObject(paths))
    		pointLineNear(getXY(event).x, getXY(event).y);
    	// 判断点在节点point附近
        if (!jQuery.isEmptyObject(shapes))
        	pointLineNodePoint(getXY(event).x, getXY(event).y);
    });
    
    canvasDivObj.dblclick(function (){
    	if (!editable){
    		return;
    	}
    	arrangeNode(getStartNode());
    });
}
// 获取鼠标的相对位置
function getXY(obj1, obj2, flag){
	if (!obj2){
		var e = obj1 || window.event;
		obj1 = e.clientX;
		obj2 = e.clientY;
	}
	if (flag){//body滚动条高度：document.documentElement.scrollTop + document.body.scrollTop
		return {x: obj1 - canvasDivObj.offset().left + canvasDivObj.scrollLeft() - document.documentElement.scrollLeft - document.body.scrollLeft, y: obj2 - canvasDivObj.offset().top + canvasDivObj.scrollTop() - document.documentElement.scrollTop - document.body.scrollTop};
	}
	else {
		return {x: obj1 - canvasDivObj.offset().left + canvasDivObj.scrollLeft(), y: obj2 - canvasDivObj.offset().top + canvasDivObj.scrollTop()};
	}
}

// 获取开始结点
function getStartNode(){
	var startNode = null, flag;
	jQuery.each(shapes, function (id, shape){
		flag = false;
		jQuery.each(paths, function (id1, path){
			if (path.to == shape.rect){
				flag = true;
				return false;
			}
		});
		if (!flag){
			startNode = shape;
			return false;
		}
	});
	if (startNode){
		setNodeXY(startNode, 108, 108);
	}
	return startNode;
}
// 节点排序
function arrangeNode(startNode){
	if (!startNode)
		return;
	var flag = false;
	jQuery.each(paths, function (id, path){
		if (path.from == startNode.rect){
			flag = true;
			setNodeXY(shapes[path.to.id], startNode.rect.attr("x") + 170, startNode.rect.attr("y"));
			connection(startNode.rect, path.to);
			arrangeNode(shapes[path.to.id]);
			return false;
		}
	});
	if (!flag)
		return;
}

//清空画布元素
function clearCanvas(){
	shapes = {};
	paths = {};
	
	paper.clear();
}

// 创建简单节点：人工节点和自动节点
function createSimpleNode(actId, actType, actIcon, longName, x, y){
    var rect = paper.rect(x, y, 85, 85, 5).attr({ fill: "#2c597a", stroke: "#4d79ef" }),
		img_node = paper.image(actIcon || "../images/tleac_06.png", x + 21, y + 5, 43, 43),
		img_drop = paper.image("../images/drop.png", x + 77, y - 8, 16, 16).attr("opacity", 0),
		img_set = paper.image("../images/set.png", x + 77, y + 77, 16, 16).attr("opacity", 0),
		img_ok = paper.image("../images/ok.png", x - 8, y - 8, 16, 16).hide(),
		img_error = paper.image("../images/error.png", x - 8, y - 8, 16, 16).hide(),
		text = paper.text(x + 42.5, y + 70, longName).attr({"font-size": 12, "stroke": "#FFF"}),
		point = paper.circle(x + 90, y + 42.5, 2).attr({fill: "#ffcc66", stroke: "#FFF"});
    // 保存节点信息
    shapes[rect.id] = {
    		"id": guid(),
    		"actId": actId, 
    		"actType": actType, 
    		"img_node": img_node, 
    		"img_drop": img_drop, 
    		"img_set": img_set, 
    		"img_ok": img_ok, 
    		"img_error": img_error, 
    		"rect": rect, 
    		"text": text, 
    		"point": point, 
    		"param": ""
    };

    nodeClick(shapes[rect.id]);     // 注册点击事件
	moveNode(shapes[rect.id]);      // 注册可移动事件
	drawLine(shapes[rect.id]);      // 注册画线事件
	imgClick(shapes[rect.id]);
	
	return shapes[rect.id];
}
// 判断新创建的节点是否在并行节点或路径上
function isOverNodeOrPath(obj){
	if (obj.actType == "3")
		return;
	var pathSelected;
    if (!jQuery.isEmptyObject(paths)) {
    	for (var k in paths){
        	if (Raphael.pathIntersection(getRectPath(obj.rect), getPathStr1(paths[k].path)).length > 0){
        		pathSelected = paths[k];
        		break;
        	}
        }
        if (pathSelected){// pathSelected存在表示rect移到了路径上
        	connection(pathSelected.from, obj.rect);
        	connection(obj.rect, pathSelected.to);
        	deletePath(pathSelected);
        }
    }
}

// 验证流程
function validateProcess(flag){
	var validate = false;
	jQuery.each(shapes, function(index, shape){
		validate = false;
		jQuery.each(paths, function(index, path){
			if (shape.rect == path.from || shape.rect == path.to){
				validate = true;
				return false;
			}
		});
		if (!validate){
			return false;
		}
	});
	
	flag && (jetsennet.message(validate ? "验证通过！" : "验证不通过！"));
	
	return validate;
}
// 判断一个节点是否有连线
function nodeHasPaths(obj){
	var flag = false;
	jQuery.each(paths, function(index, item){
		if (obj.rect == item.from || obj.rect == item.to){
			flag = true;
			return false;
		}
	});
	return flag;
}
// 获取流程xml
function getProcessXml(procId){
	var processXml = [];
	processXml.push('<WorkFlow>');
	processXml.push('<ProcessId>'+(procId || gCurrentProcess.ProcId)+'</ProcessId>');
	processXml.push('<ProcessName>'+gCurrentProcess.ProcName+'</ProcessName>');
	processXml.push('<ProcessType>'+gCurrentProcess.ProcType+'</ProcessType>');
	processXml.push('<ProcessDesc>'+gCurrentProcess.ProcDesc+'</ProcessDesc>');
	processXml.push('<ObjType>'+gCurrentProcess.ObjType+'</ObjType>');
	processXml.push('<ProcActs>');
	// 普通节点
	jQuery.each(shapes, function(index, shape){
		processXml.push('<ProcAct>');
		processXml.push('<ProcActId>'+shape.id+'</ProcActId>');
		processXml.push('<ActId>'+shape.actId+'</ActId>');
		processXml.push('<ActType>'+shape.actType+'</ActType>');
		processXml.push('<ActIcon>'+shape.img_node.attr("src")+'</ActIcon>');
		processXml.push('<ProcActName>'+shape.text.attr('text')+'</ProcActName>');
		processXml.push('<ActParam>'+jetsennet.xml.xmlEscape(shape.param)+'</ActParam>');
		processXml.push('<Coordinate>'+shape.rect.attr('x')+','+shape.rect.attr('y')+'</Coordinate>');
		if (shape.assignRule){
			processXml.push('<AssignRule>');
			processXml.push('<AssignType>'+shape.assignRule.assignType+'</AssignType>');
			processXml.push('<AssignObjId>'+shape.assignRule.assignObjId+'</AssignObjId>');
			processXml.push('<AssignParam>'+jetsennet.xml.xmlEscape(shape.assignRule.assignParam)+'</AssignParam>');
			processXml.push('</AssignRule>');
		}
		processXml.push('<Transitions>');
		jQuery.each(paths, function(index, path){
			if (path.from == shape.rect){
				processXml.push('<Transition>');
				processXml.push('<NextProcActId>'+shapes[path.to.id].id+'</NextProcActId>');
				processXml.push('<TransRule>'+jetsennet.xml.xmlEscape(path.param)+'</TransRule>');
				processXml.push('<TransShape>'+getPathStr1(path.path)+'</TransShape>');
				processXml.push('<TransText>'+path.text.attr("text")+'</TransText>');
				processXml.push('<TransPoints>'+getPathPointStr(path.point)+'</TransPoints>');
				processXml.push('</Transition>');
			}
		});
		processXml.push('</Transitions>');
		processXml.push('</ProcAct>');
	});
	processXml.push('</ProcActs>');
	processXml.push('</WorkFlow>');
	
	return processXml.join('');
}

// 获取折点，拼成字符串
function getPathPointStr(points){
	var pointsStr = [];
	jQuery.each(points, function(index, item){
		pointsStr.push(item.attr("cx") + "," + item.attr("cy"));
	});
	return pointsStr.join(";");
}
function setPathPoint(pointsStr){
	var cx, cy, point = [], pointsStrs = pointsStr.split(";");
	jQuery.each(pointsStrs, function(index, item){
		cx = parseInt(item.substring(0, item.indexOf(",")));
		cy = parseInt(item.substring(item.indexOf(",") + 1));
		point.push(paper.circle(cx, cy, 4).attr({"fill": "#f10a0a"}).hide());
	});
	return point;
}

//设置流程xml
function setProcessXml(processXml){
	var guid2Obj = {};
	var xmlDoc = new jetsennet.XmlDoc()
    xmlDoc.loadXML(processXml);
	var procActs = xmlDoc.selectNodes("WorkFlow/ProcActs/ProcAct[ActType=1 or ActType=2 or ActType=3]");
	jQuery.each(procActs, function(index, item){
		createSimpleNode1(item, guid2Obj);
	});
	procActs = xmlDoc.selectNodes("WorkFlow/ProcActs/ProcAct[ActType=1 or ActType=2 or ActType=3]");
	jQuery.each(procActs, function(index, item){
		createPaths(item, guid2Obj);
	});
}
function createSimpleNode1(item, guid2Obj){
	var procActId = item.selectSingleNode("ProcActId").text,
		actId = item.selectSingleNode("ActId").text,
		actType = item.selectSingleNode("ActType").text,
		actIcon = item.selectSingleNode("ActIcon").text,
		procActName = item.selectSingleNode("ProcActName").text,
		actParam = jetsennet.xml.xmlUnescape(item.selectSingleNode("ActParam").text),
		dbId = item.selectSingleNode("DbId").text,
		taskId = valueOf(item.selectSingleNode("TaskId"), "text", ""),
		taskState = valueOf(item.selectSingleNode("TaskState"), "text", ""),
		coordinate = item.selectSingleNode("Coordinate").text,
		x = parseInt(coordinate.substring(0, coordinate.indexOf(","))),
		y = parseInt(coordinate.substring(coordinate.indexOf(",") + 1)),
		attr, title;
	
	var rect = paper.rect(x, y, 85, 85, 5).attr({fill: "#2c597a", stroke: "#2c597a"}),
		img_node = paper.image(actIcon || "../images/tleac_06.png", x + 21, y + 5, 43, 43),
		img_drop = paper.image("../images/drop.png", x + 77, y - 8, 16, 16).attr("opacity", 0),
		img_set = paper.image("../images/set.png", x + 77, y + 77, 16, 16).attr("opacity", 0),
		img_ok = paper.image("../images/ok.png", x - 8, y - 8, 16, 16).hide(),
		img_error = paper.image("../images/error.png", x - 8, y - 8, 16, 16).hide(),
		text = paper.text(x + 42.5, y + 70, procActName).attr({"font-size": 12, "stroke": "#FFF"}),
		point = paper.circle(x + 90, y + 42.5, 2).attr({fill: "#ffcc66", stroke: "#FFF"});
	
	if (taskId){
		// 获取任务信息
		var task = getTaskInfo(taskId);
		// 任务状态
		switch (taskState) {
			case "0" : //1准备中
				title = "任务状态：准备中";
				attr = {fill: "#2c597a", stroke: "#ffcc66", "stroke-width": 2, "stroke-dasharray": "-", title: title};
				break; 
			case "1" : //1准备完毕，等待执行
				title = "任务状态：准备完毕，等待执行";
				attr = {fill: "#2c597a", stroke: "#525DE2", "stroke-width": 2, title: title};
				break; 
			case "2" : //2执行中
				title = "任务状态：执行中";
				attr = {fill: "#2c597a", stroke: "#525DE2", "stroke-width": 2, title: title};
				break; 
			case "3" : //3执行结束
				title = "任务状态：执行结束";
				attr = {fill: "#2c597a", stroke: "#00cc66", "stroke-width": 2, title: title};
				break; 
			case "4" : //4打回，等待上一节点重新提交
				title = "任务状态：打回，等待上一节点重新提交";
				attr = {fill: "#2c597a", stroke: "#ffcc66", "stroke-width": 2, title: title};
				break; 
			case "5" : //5被打回
				title = "任务状态：被打回";
				attr = {fill: "#2c597a", stroke: "#ff0066", "stroke-width": 2, title: title};
				break; 
			case "6" : //6强制结束 
				title = "任务状态：强制结束";
				attr = {fill: "#2c597a", stroke: "#ff6666", "stroke-width": 2, title: title};
				break;
			case "7" : //7：暂停
				title = "任务状态：暂停";
				attr = {fill: "#2c597a", stroke: "gray", "stroke-width": 2, title: title};
				break;
			case "10" : //10错误
				title = "任务状态：错误" + (task.taskDesc ? "(" + task.taskDesc + ")" : "");
				attr = {fill: "#2c597a", stroke: "#ff0066", "stroke-width": 2, title: title};
				break;
			default: 
				attr = {fill: "#2c597a", stroke: "#ffcc66", "stroke-width": 2};
				break;
		}
		if (title){
			rect.attr(attr);
			img_node.attr("title", title);
			text.attr("title", title);
		}
		
		// 任务运行中
		if (taskState == "2"){
			if (actType != "3"){// 任务进度
				if (task.subTaskPercent){// mapreduce任务
					var subTaskPercents = task.subTaskPercent.split(";"),
						len = subTaskPercents.length,
						width = canvasDivObj.width() - len * 5 - 30,
						subWidth = width / len;
					for (var i = 0; i < len; i++){
						var pRect = paper.rect(15 + i * (subWidth + 5), y + 120, subWidth, 10).attr({fill: "gray", stroke: "gray", title: subTaskPercents[i] + "%"});
							sRect = paper.rect(15 + i * (subWidth + 5), y + 120, parseInt(subTaskPercents[i]) / 100 * subWidth, 10).attr({fill: "#2c597a", stroke: "#2c597a", title: subTaskPercents[i] + "%"});
							sText = paper.text(pRect.attr("x") + pRect.attr("width") / 2, y + 140, subTaskPercents[i] + "%").attr({stroke: "#fff"});
					}
				}
				else if (parseInt(task.taskPercent) > 0){// 普通任务
					var pRect = paper.rect(x - 90, y + 120, 265, 10).attr({fill: "gray", stroke: "gray", title: task.taskPercent + "%"});
						sRect = paper.rect(x - 90, y + 120, parseInt(task.taskPercent) / 100 * 265, 10).attr({fill: "#2c597a", stroke: "#2c597a", title: task.taskPercent + "%"});
					    sText = paper.text(pRect.attr("x") + pRect.attr("width") + 15, y + 125, task.taskPercent + "%").attr({stroke: "#fff"});
				}
			}
			// 边框闪烁
			(function(){
				rect.animate({stroke: Raphael.hsb(Math.random(), 1, 1)});
				setTimeout(arguments.callee, 1000);
			})()
		}
	}
	
	// 保存节点信息
	shapes[rect.id] = {
			"id": procActId,
			"actId": actId, 
			"actType": actType, 
			"dbId": dbId, 
			"taskId": taskId, 
			"taskState": taskState, 
			"img_node": img_node, 
			"img_drop": img_drop, 
			"img_set": img_set, 
    		"img_ok": img_ok, 
    		"img_error": img_error, 
			"rect": rect, 
			"text": text, 
			"point": point, 
			"param": actParam
	};
	
	//指派规则
	var assignRule = item.selectSingleNode("AssignRule");
	if (assignRule){
		shapes[rect.id].assignRule = {};
		shapes[rect.id].assignRule.assignType = assignRule.selectSingleNode("AssignType").text;
		shapes[rect.id].assignRule.assignObjId = assignRule.selectSingleNode("AssignObjId").text;
		shapes[rect.id].assignRule.assignParam = jetsennet.xml.xmlUnescape(assignRule.selectSingleNode("AssignParam").text);
	}
	
	guid2Obj[procActId] = shapes[rect.id];
	
	nodeClick(shapes[rect.id]);     // 注册点击事件
	moveNode(shapes[rect.id]);      // 注册可移动事件
	drawLine(shapes[rect.id]);
	imgClick(shapes[rect.id]);
}
// 创建路径
function createPaths(item, guid2Obj){
	var procActId = item.selectSingleNode("ProcActId").text,
		transitions = item.selectNodes("Transitions/Transition"),
		transShape,
		transText;
	jQuery.each(transitions, function(index, transition){
		transShape = transition.selectSingleNode("TransShape");
		if (transShape){
			nextProcActId = transition.selectSingleNode("NextProcActId").text;
			transRule = jetsennet.xml.xmlUnescape(transition.selectSingleNode("TransRule").text);
			transText = transition.selectSingleNode("TransText").text;
			transPoints = transition.selectSingleNode("TransPoints").text;
			var path = paper.path(transShape.text).attr(pathAttr),
			pps = getPathPoints(path),
	        text = paper.text((pps.x1 + pps.x2) / 2, (pps.y1 + pps.y2) / 2 - 20, transText).attr({"font-size": 10, stroke: "gray"});
	        paths[path.id] = {path: path, text: text, from: guid2Obj[procActId].rect, to: guid2Obj[nextProcActId].rect, point: setPathPoint(transPoints), param: transRule};
	        setImgDrop(paths[path.id]);
	        //拖动折点，起点和终点
	        dragPoints(paths[path.id]);
	        moveObj(text);
	        createPathMenu(path, paths[path.id]);
	        imgClick(paths[path.id]);
		}
	});
}

// 点击节点，显示划线，显示选中状态, 显示可修改状态
function nodeClick(obj) {
	var st = paper.set();
	st.push(obj.rect, obj.img_node, obj.text);
	st.dblclick(function(e){
		if (!obj.taskId)
			showParamConfig(obj);
		stopBubble(e);
	}).mousedown(function (e){
		if (e.button == 2){// 右键
			if (el('divWfMenu')) {
	            el('divWfMenu').parentNode.removeChild(el('divWfMenu'));
	        }
	
	        var wfMenu = jQuery.extend(new jetsennet.ui.Menu(), { menuWidth: 150 });
	        if (obj.taskId){
	        	gCurrentTaskId = obj.taskId;
	        	if (obj.taskState == 1 || obj.taskState == 5 || (obj.taskState == 10 && obj.actType != 3)){
		        	wfMenu.addItem(jQuery.extend(new jetsennet.ui.MenuItem("提交"), {
			        	onclick: function(){commitTask(actionCallback);}}));
			        wfMenu.addItem(jQuery.extend(new jetsennet.ui.MenuItem("打回"), {
			        	onclick: function(){rollbackTask(actionCallback);}}));
		        }
		        if (obj.taskState == 10 && (obj.actType == 2 || obj.actType == 3)) {
		        	wfMenu.addItem(jQuery.extend(new jetsennet.ui.MenuItem("重新执行任务"), {
			        	onclick: function(){resetTask(actionCallback);}}));
		    	}
		     	if (obj.actType == 1) {
		     		wfMenu.addItem(jQuery.extend(new jetsennet.ui.MenuItem("指派执行者"), {
			        	onclick: function(){assignTask(actionCallback);}}));
		     	}
		     	if (obj.actType == 2) {
		     		if (obj.taskState == 2){
		     			wfMenu.addItem(jQuery.extend(new jetsennet.ui.MenuItem("暂停"), {
			        		onclick: function(){}}));
		     		}
		     		else if (obj.taskState == 7){
		     			wfMenu.addItem(jQuery.extend(new jetsennet.ui.MenuItem("启动"), {
			        		onclick: function(){}}));
		     		}
		     	}
	        } else {
	        	wfMenu.addItem(jQuery.extend(new jetsennet.ui.MenuItem("设置"), {
		            icon: "../../../jetsenclient/themes/icon/property.gif", 
		            onclick: function(){showParamConfig(obj);}}));
		        if (editable){
		        	wfMenu.addItem(jQuery.extend(new jetsennet.ui.MenuItem("删除节点"), {
		                icon: "../../../jetsenclient/themes/icon/drop.gif", 
		                onclick: function(){deleteObj(obj);}}));
		        }
	        }
	        
	        wfMenu.render("divWfMenu");
	        jetsennet.popup(el('divWfMenu'));
	        
	        return false;
		}
	});
}

//删除对象
function deleteObj(obj) {
	if (!editable){
		return;
	}
	if (obj.img_node) {
        deleteNode(obj);
    }
    else {
    	deletePath(obj);
    }
    return true;
}
// 删除节点
function deleteNode(obj) {
	var pathTo = [], pathFrom = [];
    jQuery.each(paths, function (index, item) {
        if (item.to == obj.rect) {
        	pathTo.push(item);
        }
        else if (item.from == obj.rect){
        	pathFrom.push(item);
        }
    });

    delete shapes[obj.rect.id];
    for (var i in obj){
    	if (obj[i].type){
    		obj[i].remove();
    	}
    }
    
    // 如果被删的节点只有一条路径进和出，那直接把两头的节点相连
    if (pathTo.length == 1 && pathFrom.length == 1) {
    	deletePath(pathTo[0]);
    	deletePath(pathFrom[0]);
    	connection(pathTo[0].from, pathFrom[0].to);
    }
    else {
    	for (var i in pathTo){
    		deletePath(pathTo[i]);
    	}
    	for (var j in pathFrom){
    		deletePath(pathFrom[j]);
    	}
    }
}
//删除路径
function deletePath(obj) {
    delete paths[obj.path.id];
    obj.path.remove();
    obj.text.remove();
    obj.img_drop.remove();
    if (obj.mpoint) obj.mpoint.remove();
    for (var i in obj.point) {
        obj.point[i].remove();
    }
}

// 移动节点
function moveNode(obj){
	var x, y, pathSelected, moveObj, st = paper.set();
	st.push(obj.rect, obj.img_node, obj.text);
    st.drag(function(dx, dy){
    	if (!editable){
    		return;
    	}
        setNodeXY(obj, x + dx, y + dy);//设置各元素的位置
        movingConnection(obj.rect, moveObj);//设置路径
        
        if (nodeHasPaths(obj) || obj.actType == 3){
        	return;
        }
		pathSelected = void(0);// 判断是否移到路径上
        for (var k in paths){
        	if (Raphael.pathIntersection(getRectPath(obj.rect), getPathStr1(paths[k].path)).length > 0){
        		paths[k].path.attr({stroke: "#525DE2"});
        		pathSelected = paths[k];
        		break;
        	}
        	else {
        		paths[k].path.attr({stroke: "gray"});
        	}
        }
        if (pathSelected){
        	for (var p in paths){
        		if (paths[p] != pathSelected){
        			paths[p].path.attr({stroke: "gray"});
        		}
        	}
        }
    }, function(){
    	x = obj.rect.attr("x");
        y = obj.rect.attr("y");
        pathSelected = void(0);
        moveObj = moveStart(obj.rect);
        move2Top(obj);
    }, function(){
		if (pathSelected){// pathSelected存在表示rect移到了路径上
        	pathSelected.path.attr({stroke: "gray"});
        	connection(pathSelected.from, obj.rect);
        	connection(obj.rect, pathSelected.to);
        	deletePath(pathSelected);
        }
		else {
			// 节点相交处理
			jQuery.each(shapes, function (index, shape){
	        	if (shape != obj && Raphael.isBBoxIntersect(getBBox(obj.rect), getBBox(shape.rect))){
	        		setNodeXY(obj, x, y);
	        		movingConnection(obj.rect, moveObj);
	        		return false;
	        	}
	        });
		}
    });
    var moveStart = function (rect){
    	var objFrom = [], objTo = [];
	    jQuery.each(paths, function (index, item) {
	        if (item.from == rect) {
	            objTo.push(item);
	        }
	        if (item.to == rect) {
	            objFrom.push(item);
	        }
	    });
	    return {objFrom: objFrom, objTo: objTo};
    };
    var movingConnection = function (rect, moveObj){
    	var p, objTo = moveObj.objTo, objFrom = moveObj.objFrom;
	    jQuery.each(objTo, function (index, item) {
	        var path = getPathStr1(item.path);
	        // 长度等于4说明没有折点，否则有折点
	        if (path.split("L").length == 4) {
	            p = getStartAndEndPoint(rect, item.to);
	            if (p) {
	                item.point[0].attr({cx: p.x1, cy: p.y1});
	                item.point[1].attr({cx: p.x2, cy: p.y2});
	                item.path.attr({path: ["M", p.x1, p.y1, "L", p.x2, p.y2].join(",") + getArr(p.x1, p.y1, p.x2, p.y2)});
	                item.text.attr({x: (p.x1 + p.x2) / 2, y: (p.y1 + p.y2) / 2 - 20, transform: "r" + Raphael.angle(p.x2, p.y2, p.x1, p.y1)});
	            }
	        }
	        else {
	            p = getStartAndEndPoint(rect, item.point[1]);
	            if (p) {
	                item.point[0].attr({cx: p.x1, cy: p.y1});
	                item.path.attr("path", "M" + getPathArray(item.point).join("L") + getArr(item.point[item.point.length - 2].attr("cx"), item.point[item.point.length - 2].attr("cy"), item.point[item.point.length - 1].attr("cx"), item.point[item.point.length - 1].attr("cy")));
	                item.text.attr({x: (item.point[0].attr("cx") + item.point[1].attr("cx")) / 2, y: (item.point[0].attr("cy") + item.point[1].attr("cy")) / 2 - 20, transform: "r" + Raphael.angle(item.point[1].attr("cx"), item.point[1].attr("cy"), item.point[0].attr("cx"), item.point[0].attr("cy"))});
	            }
	        }
	        setImgDrop(item);
	    });
	    jQuery.each(objFrom, function (index, item) {
	        var path = getPathStr1(item.path);
	        if (path.split("L").length == 4) {
	            p = getStartAndEndPoint(item.from, rect);
	            if (p) {
	                item.point[0].attr({cx: p.x1, cy: p.y1});
	                item.point[1].attr({cx: p.x2, cy: p.y2});
	                item.path.attr({path: ["M", p.x1, p.y1, "L", p.x2, p.y2].join(",") + getArr(p.x1, p.y1, p.x2, p.y2)});
	                item.text.attr({x: (p.x1 + p.x2) / 2, y: (p.y1 + p.y2) / 2 - 20, transform: "r" + Raphael.angle(p.x2, p.y2, p.x1, p.y1)});
	            }
	        }
	        else {
	            p = getStartAndEndPoint(item.point[item.point.length - 2], rect);
	            if (p) {
	                item.point[item.point.length - 1].attr({cx: p.x2, cy: p.y2});
	                item.path.attr("path", "M" + getPathArray(item.point).join("L") + getArr(item.point[item.point.length - 2].attr("cx"), item.point[item.point.length - 2].attr("cy"), item.point[item.point.length - 1].attr("cx"), item.point[item.point.length - 1].attr("cy")));
	            }
	        }
	        setImgDrop(item);
	    });
    };
}

// 画线
function drawLine(obj){
	var x, y, objDraged, isSecond, line, xy;
	obj.point.drag(function(dx, dy, cx, cy){
		if (!editable){
			return;
		}
		xy = getXY(cx, cy, true);
		line.attr({path: ["M", x, y, "L", xy.x, xy.y].join(",") + getArr(x, y, xy.x, xy.y)});
        objDraged = findDestShapeByXY(obj.rect, objDraged, xy.x, xy.y);
	}, function(){
		x = this.attr("cx");
		y = this.attr("cy");
		line = paper.path().attr({"stroke-dasharray": "- ", stroke: "gray"});
	}, function(){
		line.remove();
        if (objDraged) {
        	shapes[objDraged.id].img_ok.hide();
        	isSecond = false;
        	jQuery.each(paths, function(index, item){
        		if (item.from == obj.rect && item.to == objDraged){
        			isSecond = true; // 存在相同方向的线
        		}
        	});
            if (!isSecond){
            	connection(obj.rect, objDraged);
            }
        }
	});
}

// 根据点查找可以画线的形状
function findDestShapeByXY(obj, destShape, x, y, flag){
	var isFound = false;
	for (var i in shapes){
		if (Raphael.isPointInsideBBox(getBBox(shapes[i].rect), x, y) && shapes[i].rect != obj && (flag || shapes[i].actType != 3) && (!sequence || isDrawLine(obj, shapes[i]))){
			isFound = true;
			shapes[i].img_ok.show();
			destShape = shapes[i].rect;
			break;
		}
	}
	if (!isFound && destShape){
		shapes[destShape.id].img_ok.hide();
        destShape = void(0);
	}
	return destShape;
}

// 顺序流时判断是否能连线
function isDrawLine(obj, shape){
	var draw = true;
	jQuery.each(paths, function (i, path){
		if (path.from == obj || path.to == shape.rect || (path.to == obj && path.from == shape.rect)){
			draw = false;
			return false;
		}
	});
	return draw;
}

function getBBox(obj){
	var bbox = obj.getBBox();
	if (obj.type == "path"){
		bbox = Raphael.pathBBox(getPathStr1(obj));
	}
	if (Raphael.vml){
		if (obj.type == "circle"){
			bbox = {
					x: obj.attr("cx") - obj.attr("r"), 
					y: obj.attr("cy") - obj.attr("r"), 
					x2: obj.attr("cx") + obj.attr("r"), 
					y2: obj.attr("cy") + obj.attr("r"),
					width: 2 * obj.attr("r"),
					height: 2 * obj.attr("r")
				};
		}
	}
	return bbox;
}

//移动对象
function moveObj(obj) {
    var x, y;
    obj.drag(function (dx, dy) {
        var attr = this.type == "circle" ? {cx: x + dx, cy: y + dy} : {x: x + dx, y: y + dy};
        this.attr(attr);
    }, function (cx, cy, event) {
        x = this.type == "circle" ? this.attr("cx") : this.attr("x");
        y = this.type == "circle" ? this.attr("cy") : this.attr("y");
        stopBubble(event);
    }, function () {
    });
}
function getPathPoints(path){
    var pathStr = getPathStr1(path), x1, x2, y1, y2;
    if (pathStr.indexOf(",") == 1){
    	var pathStrs = pathStr.split(",");
    	x1 = parseInt(pathStrs[1]),
        y1 = parseInt(pathStrs[2]),
        x2 = parseInt(pathStrs[4]),
        y2 = parseInt(pathStrs[5]);
    }
    else {
    	x1 = parseInt(pathStr.substring(1, pathStr.indexOf(","))),
        y1 = parseInt(pathStr.substring(pathStr.indexOf(",") + 1, pathStr.indexOf("L"))),
        x2 = parseInt(pathStr.substring(pathStr.indexOf("L") + 1, pathStr.indexOf(",", pathStr.indexOf(",") + 1))),
        y2 = parseInt(pathStr.substring(pathStr.indexOf(",", pathStr.indexOf(",") + 1) + 1, pathStr.indexOf("L", pathStr.indexOf("L") + 1)));
    }
    
    return {x1: x1, x2: x2, y1: y1, y2: y2};
}
function setNodeXY(obj, x, y, animate){
    if (!animate){
    	obj.rect.attr({x: x, y: y});
    	obj.img_node.attr({x: x + 21, y: y + 5});
    	obj.img_drop.attr({x: x + 77, y: y - 8});
    	obj.img_set.attr({x: x + 77, y: y + 77});
    	obj.img_ok.attr({x: x - 8, y: y - 8});
    	obj.img_error.attr({x: x - 8, y: y - 8});
        obj.text.attr({x: x + 42.5, y: y + 70});
        obj.point.attr({cx: x + 90, cy: y + 42.5});
    }
    else {
    	obj.rect.animate({x: x, y: y}, animate.time, animate.type, animate.callback);
    	obj.img_node.animate({x: x + 21, y: y + 5}, animate.time, animate.type);
    	obj.img_drop.animate({x: x + 77, y: y - 8}, animate.time, animate.type);
    	obj.img_set.animate({x: x + 77, y: y + 77}, animate.time, animate.type);
    	obj.img_ok.animate({x: x - 8, y: y - 8}, animate.time, animate.type);
    	obj.img_error.animate({x: x - 8, y: y - 8}, animate.time, animate.type);
        obj.text.animate({x: x + 42.5, y: y + 70}, animate.time, animate.type);
        obj.point.animate({cx: x + 90, cy: y + 42.5}, animate.time, animate.type);
    }
}
function getPathStr1(path){
	return path.attr("path").toString();
}
//设置节点在画布的顶层
function move2Top(obj){
	obj.rect.insertAfter(paper.top);
	obj.img_drop.insertAfter(paper.top);
	obj.img_node.insertAfter(paper.top);
	obj.img_set.insertAfter(paper.top);
	obj.img_ok.insertAfter(paper.top);
	obj.img_error.insertAfter(paper.top);
	obj.text.insertAfter(paper.top);
	obj.point.insertAfter(paper.top);
}

//点在路径附近
function pointLineNear(x, y) {
    var x1, y1, x2, y2, keyPoint, centerPoint;
    for (var i in paths) {
        var flag = false;
        for (var j = 1, len = paths[i].point.length; j < len; j++) {
            x1 = paths[i].point[j - 1].attr("cx");
            y1 = paths[i].point[j - 1].attr("cy");
            x2 = paths[i].point[j].attr("cx");
            y2 = paths[i].point[j].attr("cy");
            //垂足坐标
            keyPoint = getKeyPoint(x, y, x1, y1, x2, y2);
            //垂足坐标在路径上且鼠标坐标到路径的距离小于5
            if (isKeyPointInPath(keyPoint.x, keyPoint.y, x1, y1, x2, y2) && point2PathDistance(x, y, x1, y1, x2, y2) < 5) {
                flag = true;
                for (var k in paths[i].point) {
                    paths[i].point[k].show();
                }

                centerPoint = getPathCenterPoint(paths[i].path);
                //垂足坐标不能靠近折点和路径中点
                if (isKeyPointNotNear(keyPoint.x, keyPoint.y, x1, y1, x2, y2) && isKeyPointNotNear(keyPoint.x, keyPoint.y, centerPoint.x, centerPoint.y)) {
                    if (!paths[i].mpoint) {
                        paths[i].mpoint = paper.circle(keyPoint.x, keyPoint.y, 4).attr({"fill": "#00f50f"});
                        dragLine(paths[i]);
                    }
                    else {
                        paths[i].mpoint.attr({cx: keyPoint.x, cy: keyPoint.y}).show();
                    }
                    paths[i].img_drop.insertAfter(paths[i].mpoint).animate({opacity: .3}, 500);
                }
                else {
                    if (paths[i].mpoint) paths[i].mpoint.hide();
                }

                break;
            }
            else {
                for (var k in paths[i].point) {
                    paths[i].point[k].hide();
                }
                if (paths[i].mpoint) paths[i].mpoint.hide();
                paths[i].img_drop.animate({opacity: 0}, 500);
            }
        }
        if (flag) {
            break;
        }
    }
}
//判断点在节点point附近
function pointLineNodePoint(x, y){
	jQuery.each(shapes, function (index, obj){
		if (distance(x, y, obj.point.attr("cx"), obj.point.attr("cy")) < 15){
			obj.point.animate({r: 10}, 500);
		}else {
			obj.point.animate({r: 2}, 500);
		}
	});
}

// 拖动直线生成折点
function dragLine(obj) {
    var x, y, x1, y1, index, flag, isDrag;
    obj.mpoint.drag(function (dx, dy) {
        isDrag = true;
        this.attr({cx: x + dx, cy: y + dy}).show();

        var p1 = getStartAndEndPoint(obj.from, obj.point[1]);
        var p2 = getStartAndEndPoint(obj.point[obj.point.length - 2], obj.to);
        if (p1 && p2) {
            obj.point[0].attr({cx: p1.x1, cy: p1.y1});
            obj.point[obj.point.length - 1].attr({cx: p2.x2, cy: p2.y2});
            obj.text.attr({x: (obj.point[0].attr("cx") + obj.point[1].attr("cx")) / 2, y: (obj.point[0].attr("cy") + obj.point[1].attr("cy")) / 2 - 20, transform: "r" + Raphael.angle(obj.point[1].attr("cx"), obj.point[1].attr("cy"), obj.point[0].attr("cx"), obj.point[0].attr("cy"))});
        }

        var _x = x + dx,
            _y = y + dy,
            _x1 = obj.point[index - 1].attr("cx"),
            _y1 = obj.point[index - 1].attr("cy"),
            _x2 = obj.point[index + 1].attr("cx"),
            _y2 = obj.point[index + 1].attr("cy"),
            //垂足坐标
            keyPoint = getKeyPoint(_x, _y, _x1, _y1, _x2, _y2);
        if (isKeyPointInPath(keyPoint.x, keyPoint.y, _x1, _y1, _x2, _y2) && point2PathDistance(_x, _y, _x1, _y1, _x2, _y2) < 10) {
            this.attr({cx: keyPoint.x, cy: keyPoint.y});
            flag = true;
        }
        else {
            flag = false;
        }
        obj.path.attr("path", "M" + getPathArray(obj.point).join("L") + getArr(obj.point[obj.point.length - 2].attr("cx"), obj.point[obj.point.length - 2].attr("cy"), obj.point[obj.point.length - 1].attr("cx"), obj.point[obj.point.length - 1].attr("cy")));
        setImgDrop(obj);
    }, function (cx, cy, event) {
        isDrag = false;
        x = this.attr("cx");
        y = this.attr("cy");
        x1 = obj.text.attr("x");
        y1 = obj.text.attr("y");

        if (!isInPoints(obj.point, this)) {
            var _x1, _y1, _x2, _y2;
            for (var i = 0, len = obj.point.length; i < len; i++) {
                if (i > 0) {
                    _x1 = obj.point[i - 1].attr("cx");
                    _y1 = obj.point[i - 1].attr("cy");
                    _x2 = obj.point[i].attr("cx");
                    _y2 = obj.point[i].attr("cy");
                    if (Math.floor(Math.abs(Raphael.angle(_x1, _y1, x, y, _x2, _y2))) == 0) {
                        index = i;
                        break;
                    }
                }
            }
            if (index) {
                obj.point.splice(index, 0, this.attr({fill: "#f10a0a"}));
            }
        }
        else {
        	index = getIndex(obj.point, this);
        }
        stopBubble(event);
    }, function () {
        //没有拖动成折点，只是单击了一下
        if (this.attr("cx") == x && this.attr("cy") == y && this == obj.mpoint) {
            obj.point.splice(index, 1)[0].attr({fill: "#00f50f"});
        }
        //删除一条直线上的折点
        else if (flag) {
            obj.point.splice(index, 1)[0].remove();
            delete obj.mpoint;
        }
        else {
            delete obj.mpoint;
        }
    });

    createPathMenu(obj.mpoint, obj);
}
function createPathMenu(obj1, obj2){
	obj1.mousedown(function (e){
		if (e.button == 2){// 右键
			if (el('divWfMenu')) {
		        el('divWfMenu').parentNode.removeChild(el('divWfMenu'));
		    }

		    var wfMenu = jQuery.extend(new jetsennet.ui.Menu(), { menuWidth: 150 });
		    if (editable){
		    	wfMenu.addItem(jQuery.extend(new jetsennet.ui.MenuItem("删除线路"), {
	                icon: "../../../jetsenclient/themes/icon/drop.gif", 
	                onclick: function(){deleteObj(obj2);}}));
		    }
		    wfMenu.render("divWfMenu");
		    jetsennet.popup(el('divWfMenu'));
		    
		    return false;
		}
	});
}

//拖动折点，起点和终点
function dragPoints(obj) {
    var x0, y0, x1, y1, x2, y2, x3, y3, flag, objDraged;
    for (var i = 1, len = obj.point.length - 1; i < len; i++) {
        var j;
        obj.point[i].drag(function (dx, dy) {
            this.attr({cx: x2 + dx, cy: y2 + dy}).show();
            var p1 = getStartAndEndPoint(obj.from, obj.point[1]);
            var p2 = getStartAndEndPoint(obj.point[obj.point.length - 2], obj.to);
            if (p1 && p2) {
                obj.point[0].attr({cx: p1.x1, cy: p1.y1});
                obj.point[obj.point.length - 1].attr({cx: p2.x2, cy: p2.y2});
                obj.text.attr({x: (obj.point[0].attr("cx") + obj.point[1].attr("cx")) / 2, y: (obj.point[0].attr("cy") + obj.point[1].attr("cy")) / 2 - 20, transform: "r" + Raphael.angle(obj.point[1].attr("cx"), obj.point[1].attr("cy"), obj.point[0].attr("cx"), obj.point[0].attr("cy"))});
            }

            flag = false;
            j = getIndex(obj.point, this);
            var x = x2 + dx,
                y = y2 + dy,
                _x1 = obj.point[j - 1].attr("cx"),
                _y1 = obj.point[j - 1].attr("cy"),
                _x2 = obj.point[j + 1].attr("cx"),
                _y2 = obj.point[j + 1].attr("cy"),
            //垂足坐标
                keyPoint = getKeyPoint(x, y, _x1, _y1, _x2, _y2);
            if (isKeyPointInPath(keyPoint.x, keyPoint.y, _x1, _y1, _x2, _y2) && point2PathDistance(x, y, _x1, _y1, _x2, _y2) < 10) {
                this.attr({cx: keyPoint.x, cy: keyPoint.y});
                flag = true;
            }
            obj.path.attr("path", "M" + getPathArray(obj.point).join("L") + getArr(obj.point[obj.point.length - 2].attr("cx"), obj.point[obj.point.length - 2].attr("cy"), obj.point[obj.point.length - 1].attr("cx"), obj.point[obj.point.length - 1].attr("cy")));
            setImgDrop(obj);
        }, function (cx, cy, event) {
            x2 = this.attr("cx");
            y2 = this.attr("cy");
            x3 = obj.text.attr("x");
            y3 = obj.text.attr("y");
            stopBubble(event);
        }, function () {
            if (flag){
                obj.point.splice(j, 1)[0].remove();
            }
        });
    }
    // 拖动起点
    obj.point[0].drag(function (dx, dy) {
        this.show();
        this.attr({cx: x0 + dx, cy: y0 + dy});

        var path = getPathStr1(obj.path);
        if (path.split("L").length == 4) {
            var p = getStartAndEndPoint(this, obj.to);
            if (p) {
                obj.point[1].attr({cx: p.x2, cy: p.y2});
                obj.path.attr({path: ["M", p.x1, p.y1, "L", p.x2, p.y2].join(",") + getArr(p.x1, p.y1, p.x2, p.y2)});
            }
        }
        else {
            obj.path.attr("path", "M" + getPathArray(obj.point).join("L") + getArr(obj.point[obj.point.length - 2].attr("cx"), obj.point[obj.point.length - 2].attr("cy"), obj.point[obj.point.length - 1].attr("cx"), obj.point[obj.point.length - 1].attr("cy")));
        }
        setImgDrop(obj);
        obj.text.attr({x: (obj.point[0].attr("cx") + obj.point[1].attr("cx")) / 2, y: (obj.point[0].attr("cy") + obj.point[1].attr("cy")) / 2 - 20, transform: "r" + Raphael.angle(obj.point[1].attr("cx"), obj.point[1].attr("cy"), obj.point[0].attr("cx"), obj.point[0].attr("cy"))});

        objDraged = findDestShapeByXY(obj.to, objDraged, x0 + dx, y0 + dy, true);
    }, function (cx, cy, event) {
        x0 = this.attr("cx");
        y0 = this.attr("cy");
        stopBubble(event);
    }, function () {
        if (objDraged) {
        	shapes[objDraged.id].img_ok.hide();
            var p = getStartAndEndPoint(objDraged, obj.point[1]);
            if (p) this.attr({cx: p.x1, cy: p.y1});
            obj.path.attr("path", "M" + getPathArray(obj.point).join("L") + getArr(obj.point[obj.point.length - 2].attr("cx"), obj.point[obj.point.length - 2].attr("cy"), obj.point[obj.point.length - 1].attr("cx"), obj.point[obj.point.length - 1].attr("cy")));

            obj.from = objDraged;
        }
        else {
            var path = getPathStr1(obj.path);
            if (path.split("L").length == 4) {
                var p = getStartAndEndPoint(obj.from, obj.to);
                if (p) this.attr({cx: p.x1, cy: p.y1});
                obj.point[obj.point.length - 1].attr({cx: p.x2, cy: p.y2});
            }
            else {
                this.attr({cx: x0, cy: y0});
            }
            obj.path.attr("path", "M" + getPathArray(obj.point).join("L") + getArr(obj.point[obj.point.length - 2].attr("cx"), obj.point[obj.point.length - 2].attr("cy"), obj.point[obj.point.length - 1].attr("cx"), obj.point[obj.point.length - 1].attr("cy")));
            obj.text.attr({x: (obj.point[0].attr("cx") + obj.point[1].attr("cx")) / 2, y: (obj.point[0].attr("cy") + obj.point[1].attr("cy")) / 2 - 20, transform: "r" + Raphael.angle(obj.point[1].attr("cx"), obj.point[1].attr("cy"), obj.point[0].attr("cx"), obj.point[0].attr("cy"))});
        }
        setImgDrop(obj);
    });
    // 拖动终点
    obj.point[obj.point.length - 1].drag(function (dx, dy) {
        this.show();
        this.attr({cx: x1 + dx, cy: y1 + dy});

        var path = getPathStr1(obj.path);
        if (path.split("L").length == 4) {
            var p = getStartAndEndPoint(obj.from, this);
            if (p) {
                obj.point[0].attr({cx: p.x1, cy: p.y1});
                obj.path.attr({path: ["M", p.x1, p.y1, "L", p.x2, p.y2].join(",") + getArr(p.x1, p.y1, p.x2, p.y2)});
            }
        }
        else {
            obj.path.attr("path", "M" + getPathArray(obj.point).join("L") + getArr(obj.point[obj.point.length - 2].attr("cx"), obj.point[obj.point.length - 2].attr("cy"), obj.point[obj.point.length - 1].attr("cx"), obj.point[obj.point.length - 1].attr("cy")));
        }
        setImgDrop(obj);
        obj.text.attr({x: (obj.point[0].attr("cx") + obj.point[1].attr("cx")) / 2, y: (obj.point[0].attr("cy") + obj.point[1].attr("cy")) / 2 - 20, transform: "r" + Raphael.angle(obj.point[1].attr("cx"), obj.point[1].attr("cy"), obj.point[0].attr("cx"), obj.point[0].attr("cy"))});

        objDraged = findDestShapeByXY(obj.from, objDraged, x1 + dx, y1 + dy);
    }, function (cx, cy, event) {
        x1 = this.attr("cx");
        y1 = this.attr("cy");
        stopBubble(event);
    }, function () {
        if (objDraged) {
        	shapes[objDraged.id].img_ok.hide();
            var p = getStartAndEndPoint(obj.point[obj.point.length - 2], objDraged);
            if (p) this.attr({cx: p.x2, cy: p.y2});
            obj.path.attr("path", "M" + getPathArray(obj.point).join("L") + getArr(obj.point[obj.point.length - 2].attr("cx"), obj.point[obj.point.length - 2].attr("cy"), obj.point[obj.point.length - 1].attr("cx"), obj.point[obj.point.length - 1].attr("cy")));

            obj.to = objDraged;
        }
        else {
            var path = getPathStr1(obj.path);
            if (path.split("L").length == 4) {
                var p = getStartAndEndPoint(obj.from, obj.to);
                if (p) this.attr({cx: p.x2, cy: p.y2});
                obj.point[0].attr({cx: p.x1, cy: p.y1});
            }
            else {
                this.attr({cx: x1, cy: y1});
            }
            obj.path.attr("path", "M" + getPathArray(obj.point).join("L") + getArr(obj.point[obj.point.length - 2].attr("cx"), obj.point[obj.point.length - 2].attr("cy"), obj.point[obj.point.length - 1].attr("cx"), obj.point[obj.point.length - 1].attr("cy")));
            obj.text.attr({x: (obj.point[0].attr("cx") + obj.point[1].attr("cx")) / 2, y: (obj.point[0].attr("cy") + obj.point[1].attr("cy")) / 2 - 20, transform: "r" + Raphael.angle(obj.point[1].attr("cx"), obj.point[1].attr("cy"), obj.point[0].attr("cx"), obj.point[0].attr("cy"))});
        }
        setImgDrop(obj);
    });
}

// 连接节点
function connection(srcObj, destObj) {
    var allPaths = [];
    var sb = getBBox(srcObj);
    var db = getBBox(destObj);
    var p = getStartAndEndPoint(srcObj, destObj);
    var points = [];//保存折点
    // 预定了9条路径，从中选择最佳路径，默认为第1条直线路径
    if (p) points.push([
        {cx: p.x1, cy: p.y1},
        {cx: p.x2, cy: p.y2}
    ]);
    var p11 = getStartAndEndPoint(srcObj, (sb.x + sb.width / 2 + db.x + db.width / 2) / 2, sb.y + sb.height / 2);
    var p12 = getStartAndEndPoint((sb.x + sb.width / 2 + db.x + db.width / 2) / 2, db.y + db.height / 2, destObj);
    if (p11 && p12) points.push([
        {cx: p11.x, cy: p11.y},
        {cx: (sb.x + sb.width / 2 + db.x + db.width / 2) / 2, cy: sb.y + sb.height / 2},
        {cx: (sb.x + sb.width / 2 + db.x + db.width / 2) / 2, cy: db.y + db.height / 2},
        {cx: p12.x, cy: p12.y}
    ]);
    var p21 = getStartAndEndPoint(srcObj, sb.x + sb.width / 2, (sb.y + sb.height / 2 + db.y + db.height / 2) / 2);
    var p22 = getStartAndEndPoint(db.x + db.width / 2, (sb.y + sb.height / 2 + db.y + db.height / 2) / 2, destObj);
    if (p21 && p22) points.push([
        {cx: p21.x, cy: p21.y},
        {cx: sb.x + sb.width / 2, cy: (sb.y + sb.height / 2 + db.y + db.height / 2) / 2},
        {cx: db.x + db.width / 2, cy: (sb.y + sb.height / 2 + db.y + db.height / 2) / 2},
        {cx: p22.x, cy: p22.y}
    ]);
    var p31 = getStartAndEndPoint(srcObj, db.x + db.width / 2, sb.y + sb.height / 2);
    var p32 = getStartAndEndPoint(db.x + db.width / 2, sb.y + sb.height / 2, destObj);
    if (p31 && p32) points.push([
        {cx: p31.x, cy: p31.y},
        {cx: db.x + db.width / 2, cy: sb.y + sb.height / 2},
        {cx: p32.x, cy: p32.y}
    ]);
    var p41 = getStartAndEndPoint(srcObj, sb.x + sb.width / 2, db.y + db.height / 2);
    var p42 = getStartAndEndPoint(sb.x + sb.width / 2, db.y + db.height / 2, destObj);
    if (p41 && p42) points.push([
        {cx: p41.x, cy: p41.y},
        {cx: sb.x + sb.width / 2, cy: db.y + db.height / 2},
        {cx: p42.x, cy: p42.y}
    ]);
    var p51 = getStartAndEndPoint(srcObj, sb.x + sb.width / 2, Math.min(sb.y - 12, db.y - 12));
    var p52 = getStartAndEndPoint(db.x + db.width / 2, Math.min(sb.y - 12, db.y - 12), destObj);
    if (p51 && p52) points.push([
        {cx: p51.x, cy: p51.y},
        {cx: sb.x + sb.width / 2, cy: Math.min(sb.y - 12, db.y - 12)},
        {cx: db.x + db.width / 2, cy: Math.min(sb.y - 12, db.y - 12)},
        {cx: p52.x, cy: p52.y}
    ]);
    var p61 = getStartAndEndPoint(srcObj, sb.x + sb.width / 2, Math.max(sb.y + sb.height + 12, db.y + db.height + 12));
    var p62 = getStartAndEndPoint(db.x + db.width / 2, Math.max(sb.y + sb.height + 12, db.y + db.height + 12), destObj);
    if (p61 && p62) points.push([
        {cx: p61.x, cy: p61.y},
        {cx: sb.x + sb.width / 2, cy: Math.max(sb.y + sb.height + 12, db.y + db.height + 12)},
        {cx: db.x + db.width / 2, cy: Math.max(sb.y + sb.height + 12, db.y + db.height + 12)},
        {cx: p62.x, cy: p62.y}
    ]);
    var p71 = getStartAndEndPoint(srcObj, Math.max(sb.x + sb.width + 30, db.x + db.width + 30), sb.y + sb.height / 2);
    var p72 = getStartAndEndPoint(Math.max(sb.x + sb.width + 30, db.x + db.width + 30), db.y + db.height / 2, destObj);
    if (p71 && p72) points.push([
        {cx: p71.x, cy: p71.y},
        {cx: Math.max(sb.x + sb.width + 30, db.x + db.width + 30), cy: sb.y + sb.height / 2},
        {cx: Math.max(sb.x + sb.width + 30, db.x + db.width + 30), cy: db.y + db.height / 2},
        {cx: p72.x, cy: p72.y}
    ]);
    var p81 = getStartAndEndPoint(srcObj, Math.min(sb.x - 30, db.x - 30), sb.y + sb.height / 2);
    var p82 = getStartAndEndPoint(Math.min(sb.x - 30, db.x - 30), db.y + db.height / 2, destObj);
    if (p81 && p82) points.push([
        {cx: p81.x, cy: p81.y},
        {cx: Math.min(sb.x - 30, db.x - 30), cy: sb.y + sb.height / 2},
        {cx: Math.min(sb.x - 30, db.x - 30), cy: db.y + db.height / 2},
        {cx: p82.x, cy: p82.y}
    ]);

    for (var p in points) {
        var pathstr = [], len = points[p].length;
        for (var k in points[p]) {
            pathstr.push("L");
            pathstr.push(points[p][k].cx);
            pathstr.push(points[p][k].cy);
        }
        allPaths.push("M" + pathstr.join(",").substring(1) + getArr(points[p][len - 2].cx, points[p][len - 2].cy, points[p][len - 1].cx, points[p][len - 1].cy));
    }

    var flag, pathStr, path, point=[], exist = false, existPathObj, text;
    // 查找有没有合适的路径
    for (var i in allPaths) {
    	flag = false;
        for (var j in shapes) {
            if (shapes[j].rect != srcObj && shapes[j].rect != destObj && Raphael.pathIntersection(allPaths[i], getRectPath(shapes[j].rect)).length > 0) {
                flag = true;
                break;
            }
        }
        if (!flag){
        	pathStr = allPaths[i];
        	break;
        }
    }
    for (var k in paths){
        if (paths[k].from == srcObj && paths[k].to == destObj){
            exist = true;
            existPathObj = paths[k];
            break;
        }
    }
    if (exist){
        existPathObj.path.attr({path: pathStr || allPaths[0]});
        setImgDrop(existPathObj);
        point = [];
        for (var j in points[i]) {
            point.push(paper.circle(points[i][j].cx, points[i][j].cy, 4).attr({"fill": "#f10a0a"}).hide());
        }
        for (var p in existPathObj.point){
            existPathObj.point[p].remove();
        }
        existPathObj.point = point;
        existPathObj.text.attr({x: (point[0].attr("cx") + point[1].attr("cx")) / 2, y: (point[0].attr("cy") + point[1].attr("cy")) / 2 - 20, transform: "r" + Raphael.angle(point[1].attr("cx"), point[1].attr("cy"), point[0].attr("cx"), point[0].attr("cy"))});
        //拖动折点，起点和终点
        dragPoints(existPathObj);
    } else {
        path = paper.path(pathStr || allPaths[0]).attr(pathAttr);
        point = [];
        for (var j in points[i]) {
            point.push(paper.circle(points[i][j].cx, points[i][j].cy, 4).attr({"fill": "#f10a0a"}).hide());
        }
        text = paper.text((point[0].attr("cx") + point[1].attr("cx")) / 2, 
        		(point[0].attr("cy") + point[1].attr("cy")) / 2 - 20, 
        		"TO " + shapes[destObj.id].text.attr("text"))
        		.attr({"font-size": 10, stroke: "gray", transform: "r" + Raphael.angle(point[1].attr("cx"), point[1].attr("cy"), point[0].attr("cx"), point[0].attr("cy"))});
        paths[path.id] = {path: path, text: text, from: srcObj, to: destObj, point: point, param: ""};
        setImgDrop(paths[path.id]);
        //拖动折点，起点和终点
        dragPoints(paths[path.id]);
        imgClick(paths[path.id]);
        moveObj(text);
    }
}
//获取组成箭头的三条线段的路径
function getArr(x1, y1, x2, y2) {
    var size = 8,
    	angle = Raphael.angle(x1, y1, x2, y2),//得到两点之间的角度
    	a45 = Raphael.rad(angle - 30),//角度转换成弧度
    	a45m = Raphael.rad(angle + 30),
    	x2a = x2 + Math.cos(a45) * size,
    	y2a = y2 + Math.sin(a45) * size,
    	x2b = x2 + Math.cos(a45m) * size,
    	y2b = y2 + Math.sin(a45m) * size;
    	arr = ["L", x2a, y2a, "M", x2, y2, "L", x2b, y2b].join(",");
    return arr;
}
function setImgDrop(obj){
	var centerPoint = getPathCenterPoint(obj.path);
	if (obj.img_drop){
		obj.img_drop.attr({x: centerPoint.x - 7, y: centerPoint.y - 7});
	}
	else {
		obj.img_drop = paper.image("../images/drop.png", centerPoint.x -7, centerPoint.y -7, 14, 14).attr("opacity", 0);
	}
}
// 获取路径中点
function getPathCenterPoint(path){
	return path.getPointAtLength(path.getTotalLength() / 2);
}
function imgClick(obj){
	if (obj.img_node){
		var st = paper.set();
		st.push(obj.rect, obj.img_node, obj.text);
		st.hover(function(){
			if (editable){
				obj.img_drop.animate({opacity: .3}, 500);
			}
			if (!obj.taskId){
				obj.img_set.animate({opacity: .3}, 500);
			}
		}, function(){
			if (editable){
				obj.img_drop.animate({opacity: 0}, 500);
			}
			if (!obj.taskId){
				obj.img_set.animate({opacity: 0}, 500);
			}
		});
		obj.img_set.hover(function(){
			if (!obj.taskId)
				this.animate({opacity: 1}, 500);
		}, function(){
			if (!obj.taskId)
				this.animate({opacity: 0}, 500);
		}).click(function(){
			if (!obj.taskId)
				showParamConfig(obj);
	    });
	}
	
	obj.img_drop.hover(function(){
		if (!editable){
			return;
		}
		this.animate({opacity: 1}, 500);
	}, function(){
		if (!editable){
			return;
		}
		this.animate({opacity: 0}, 500);
	}).click(function(){
    	deleteObj(obj);
    });
}

// 获取节点间的连接点
// 两个bbox中心连线与它们的交点间的线段即为它们之间的连线
function getStartAndEndPoint(obj1, obj2, obj3) {
    if (!obj3) {
        var bb1 = getBBox(obj1),
            bb2 = getBBox(obj2),
            cpath = ["M", bb1.x + bb1.width / 2, bb1.y + bb1.height / 2, "L", bb2.x + bb2.width / 2, bb2.y + bb2.height / 2 ].join(","),
            path1 = getRectPath(obj1),
            path2 = getRectPath(obj2),
            arr1 = Raphael.pathIntersection(path1, cpath),
            arr2 = Raphael.pathIntersection(path2, cpath);
        return (arr1.length > 0 && arr2.length > 0) ? {x1: arr1[0].x, y1: arr1[0].y, x2: arr2[0].x, y2: arr2[0].y} : null;
    }
    else if (!obj3.type) {
        var bb1 = getBBox(obj1),
            cpath = ["M", bb1.x + bb1.width / 2, bb1.y + bb1.height / 2, "L", obj2, obj3].join(","),
            path1 = getRectPath(obj1),
            arr1 = Raphael.pathIntersection(path1, cpath);
        return arr1.length > 0 ? {x: arr1[0].x, y: arr1[0].y} : null;
    }
    else {
        var bb1 = getBBox(obj3),
            cpath = ["M", obj1, obj2, "L", bb1.x + bb1.width / 2, bb1.y + bb1.height / 2].join(","),
            path1 = getRectPath(obj3),
            arr1 = Raphael.pathIntersection(path1, cpath);
        return arr1.length > 0 ? {x: arr1[0].x, y: arr1[0].y} : null;
    }
}

// 获取矩形闭合路径
function getRectPath(obj) {
    var bb = getBBox(obj);
    return ["M", bb.x, bb.y, bb.x2, bb.y, bb.x2, bb.y2, bb.x, bb.y2, "Z"].join(",");
}

// 获取索引
function getIndex(array, obj){
    var index;
    for (var i = 0, len = array.length; i < len; i++){
        if (array[i] == obj){
            index = i;
            break;
        }
    }

    return index;
}

//获取垂足坐标，点(x, y)到直线(x1, y1)(x2, y2)的垂足坐标
function getKeyPoint(x, y, x1, y1, x2, y2) {
    return {x: (Math.pow(x1 - x2, 2) * x - (y2 - y1) * (x1 - x2) * y - (y2 - y1) * (x2 * y1 - x1 * y2)) / (Math.pow(y2 - y1, 2) + Math.pow(x1 - x2, 2)), 
    	y: (Math.pow(y2 - y1, 2) * y - (y2 - y1) * (x1 - x2) * x - (x1 - x2) * (x2 * y1 - x1 * y2)) / (Math.pow(y2 - y1, 2) + Math.pow(x1 - x2, 2))};
}

//判断垂足坐标(x, y)是否在线段(x1, y1)(x2, y2)上
function isKeyPointInPath(x, y, x1, y1, x2, y2) {
    return Math.floor(Raphael.getTotalLength(["M", x1, y1, "L", x, y].join(",")) + Raphael.getTotalLength(["M", x2, y2, "L", x, y].join(","))) == 
    	Math.floor(Raphael.getTotalLength(["M", x2, y2, "L", x1, y1].join(",")));
}

//点到直线的距离
function point2PathDistance(x, y, x1, y1, x2, y2) {
    return Math.abs((y2 - y1) * x + (x1 - x2) * y + (x2 * y1 - x1 * y2)) / Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x1 - x2, 2));
}

//垂足是否靠近折点
function isKeyPointNotNear(x, y, x1, y1, x2, y2) {
	var flag = Raphael.getTotalLength(["M", x1, y1, "L", x, y].join(",")) > 10;
	if (x2) flag = flag && Raphael.getTotalLength(["M", x2, y2, "L", x, y].join(",")) > 10
	return flag;
}

//两点间的距离
function distance(x1, y1, x2, y2){
	return Math.sqrt(Math.pow(Math.abs(x1 - x2), 2) + Math.pow(Math.abs(y1 - y2), 2));
}

//返回path中所有折点
function getPathArray(points) {
    var pointsXY = [];
    for (var p in points) {
        pointsXY.push(points[p].attr("cx") + "," + points[p].attr("cy"));
    }
    return pointsXY;
}

//判断点是否在points中
function isInPoints(points, p1, p2) {
    var flag = false;
    if (p2) {
        jQuery.each(points, function (index, item) {
            if (item.attr("cx") == p1 && item.attr("cy") == p2) {
                flag = true;
                return false;
            }
        });
    }
    else {
        jQuery.each(points, function (index, item) {
            if (item == p1) {
                flag = true;
                return false;
            }
        });
    }
    return flag;
}

//阻止事件冒泡传递
function stopBubble(e) {//jetsennet.cancelBubble();
    e = e || window.event;
    if (window.event) { // IE
        e.cancelBubble = true;
    } else { // FF
        e.stopPropagation();
    }
}

function guid(){
	return Raphael.createUUID();
}