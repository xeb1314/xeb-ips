// lixiaomin 2008-05-16
//=============================================================================
// jetsennet.ui.PageBar;
//=============================================================================
/*
var pInfo = new jetsennet.ui.PageBar("pageName");
pInfo.pageSize = 20;
pInfo.currentPage = 1;
pInfo.onpagechange = function(){loadData();}
pInfo.onupdate = function(){
el('divPage').innerHTML = this.render();
};
function loadData(){       	             
pInfo.setRowCount(el('hid_TotalCount').value);     
};

<body onload="loadData();">
<div id="divPage" class="text_style"></div>
</body>
*/
jetsennet.addLoadedUri(jetsennet.getloadUri("pagebar"));
jetsennet.ui.PageBars = {};

jetsennet.ui.PageBar = function (instanceId) {
    this.instanceId = instanceId ? instanceId : "pagebar";
    this.__typeName = "jetsennet.ui.PageBar";

    this.pageSize = 20;
    this.currentPage = 1;
    this.rowCount = 0;
    this.pageCount = 0;
    this.orderBy = "";                              //排序,带ORDER BY 关键字

    this.showNone = false;                      //无记录是否显示
    this.showPageNum = true;                    //显示导航页数
    this.showPageInfo = true;                   //显示分页信息
    this.showPrevNext = true;                   //显示上一页下一页
    this.showFirstLast = true;                  //显示首页末页
    this.showGoto = true;                       //显示跳转
    this.navigationSize = 6;                        //导航页显示数
    this.customPage = true;                         //是否可以自定义分页
    this.customSizeList = [10, 20, 30, 50, 100];    //自定义页数

    this.onpagechange = null;
    this.onupdate = null;

    this.FIRST_PAGE = "<li><a href=\"#\" onclick='jetsennet.ui.PageBars[\"" + this.instanceId + "\"].firstPage()' title='首页'>&laquo;</a></li>";
    this.PREV_PAGE = "<li><a href=\"#\" onclick='jetsennet.ui.PageBars[\"" + this.instanceId + "\"].prevPage()' title='上一页'>&lsaquo;</a></li>";
    this.NEXT_PAGE = "<li><a href=\"#\" onclick='jetsennet.ui.PageBars[\"" + this.instanceId + "\"].nextPage()' title='下一页'>&rsaquo;</a></li>";
    this.LAST_PAGE = "<li><a href=\"#\" onclick='jetsennet.ui.PageBars[\"" + this.instanceId + "\"].lastPage()' title='尾页'>&raquo;</a></li>";

    this.FIRST_PAGE2 = "<li class=\"disabled\"><a href=\"#\">&laquo;</a></li>";
    this.PREV_PAGE2 = "<li class=\"disabled\"><a href=\"#\">&lsaquo;</a></li>";
    this.NEXT_PAGE2 = "<li class=\"disabled\"><a href=\"#\">&rsaquo;</a></li>";
    this.LAST_PAGE2 = "<li class=\"disabled\"><a href=\"#\">&raquo;</a></li>";

    jetsennet.ui.PageBars[this.instanceId] = this;
};
jetsennet.ui.PageBar.prototype.toXml = function () {
    return jetsennet.xml.serialize({ PageSize: this.pageSize, CurrentPage: this.currentPage, RowCount: this.rowCount, PageCount: this.pageCount, OrderBy: this.orderBy }, "PageInfo");
};
jetsennet.ui.PageBar.prototype.setOrderBy = function (sortfield, desc) {
    if (!jetsennet.util.isNullOrEmpty(sortfield)) {
        this.currentPage = 1;
        var sortfields = sortfield.split(",");

        this.orderBy = "";
        for (var i = 0; i < sortfields.length; i++) {
            if (this.orderBy == "") {
                this.orderBy += (desc == true || desc == "desc") ? " ORDER BY " + sortfields[i] + " desc" : " ORDER BY " + sortfields[i];
            }
            else {
                this.orderBy += (desc == true || desc == "desc") ? " , " + sortfields[i] + " desc" : " , " + sortfields[i];
            }
        }
        if (this.onpagechange != null) {
            this.onpagechange();
        }
    }
};
jetsennet.ui.PageBar.prototype.nextPage = function () {
    if (this.currentPage < this.pageCount) {
        this.currentPage++;
        if (this.onpagechange != null) {
            this.onpagechange();
        }
    }
};
jetsennet.ui.PageBar.prototype.prevPage = function () {
    if (this.currentPage > 1) {
        this.currentPage--;
        if (this.onpagechange != null) {
            this.onpagechange();
        }
    }
};
jetsennet.ui.PageBar.prototype.firstPage = function () {
    if (this.currentPage != 1 && this.pageCount > 1) {
        this.currentPage = 1;
        if (this.onpagechange != null) {
            this.onpagechange();
        }
    }
};
jetsennet.ui.PageBar.prototype.lastPage = function () {
    if (this.currentPage != this.pageCount && this.pageCount > 1) {
        this.currentPage = this.pageCount;
        if (this.onpagechange != null) {
            this.onpagechange();
        }
    }
};
jetsennet.ui.PageBar.prototype.refresh = function () {
    if (this.onpagechange != null) {
        this.onpagechange();
    }
};
jetsennet.ui.PageBar.prototype.setCurrentPage = function (/*int*/page) {
    if (this.currentPage == page) {
        return;
    } else if (page > this.pageCount) {
        page = this.pageCount;
    } else if (page < 1) {
        page = 1;
    }
    this.currentPage = page;
    if (this.onpagechange != null) {
        this.onpagechange();
    }
};
jetsennet.ui.PageBar.prototype.jumpto = function (obj) {
    var re = /^[1-9][0-9]*$/ ;  
    if (re.test(obj.value)) {
        this.setCurrentPage(parseInt(obj.value));
    }
    obj.value = this.currentPage;
};
jetsennet.ui.PageBar.prototype.setRowCount = function (/*int*/count) {
    count = count ? count : 0;
    var intRowCount = parseInt(count);
    this.rowCount = intRowCount;
    this.pageCount = Math.ceil(intRowCount / this.pageSize);
    if (this.pageCount <= 0) {
        this.currentPage = 0;
    } else if (this.currentPage <= 0) {
        this.currentPage = 1;
    } else if (this.currentPage > this.pageCount) {
        this.currentPage = this.pageCount;
    }
    if (this.onupdate != null) {
        this.onupdate();
    }
};
jetsennet.ui.PageBar.prototype.render = function () {
    var strRet = [];
    if (this.showNone == false && this.pageCount <= 0)
        return "";
    strRet.push("<div class='pagebar clearfix'>");
    strRet.push("<div class='pull-left' style='min-width:250px; color:gray;'>");
    if (this.showPageInfo) {
        if (this.showGoto) {
            strRet.push("第");
            strRet.push("<input type='text' value='" + this.currentPage + "' id='pageValue" + this.instanceId + "' class='pagebar-go' onkeyup='jetsennet.ui.PageBars[\"" + this.instanceId + "\"].jumpto(pageValue" + this.instanceId +");'/>");
        } else {
            strRet.push("第&nbsp;" + this.currentPage + "&nbsp;");
        }
        strRet.push("/&nbsp;" + this.pageCount);
        strRet.push("&nbsp;页,&nbsp;共&nbsp;");
        strRet.push(this.rowCount + "&nbsp;条记录");
    }
    if (this.customPage) {
        strRet.push("&nbsp;&nbsp;页大小&nbsp;<span class='pagebar-current' onclick='jetsennet.ui.PageBars[\"" + this.instanceId + "\"].showCustomPage(this);' onmouseover='this.className=\"pagebar-scurrent\"' onmouseout='this.className=\"pagebar-current\"'>" + this.pageSize + "</span>");
    }

    strRet.push("</div>");
    strRet.push("<div class='pull-right'>");
    strRet.push("<ul class='pagination' style='margin-top: 2px;'>")
    if (this.currentPage <= this.pageCount && this.currentPage > 1) {
        strRet.push(this.showFirstLast ? this.FIRST_PAGE : "");
        strRet.push(this.showPrevNext ? this.PREV_PAGE : "");
    }
    else {
        strRet.push(this.showFirstLast ? this.FIRST_PAGE2 : "");
        strRet.push(this.showPrevNext ? this.PREV_PAGE2 : "");
    }

    if (this.pageCount == 0 || !this.showPageNum)
        strRet.push(""); //" 0 ";
    else {
        var start = 1;
        var end = this.pageCount;
        if (this.pageCount > this.navigationSize) {
            end = this.currentPage + parseInt(this.navigationSize / 2);
            if (end > this.pageCount) {
                end = this.pageCount;
            }
            if (end < this.navigationSize) end = this.navigationSize;
            start = end - this.navigationSize + 1;
        }
        if (start > 1) {
            strRet.push("<li><a href=\"#\" onclick='jetsennet.ui.PageBars[\"" + this.instanceId + "\"].setCurrentPage(1);'>1..</a></li>");
        }
        for (var i = start; i <= end; i++) {
            if (i == this.currentPage) {
                strRet.push("<li class=\"active\"><a href=\"#\">" + i + "</a></li>");
            }
            else {
                strRet.push("<li><a href=\"#\" onclick='jetsennet.ui.PageBars[\"" + this.instanceId + "\"].setCurrentPage(" + i + ");'>" + i + "</a></li>");
            }
        }
        if (end < this.pageCount) {
            strRet.push("<li><a href=\"#\" onclick='jetsennet.ui.PageBars[\"" + this.instanceId + "\"].setCurrentPage(" + this.pageCount + ");'>.." + this.pageCount + "</a></li>");
        }
    }

    if (this.currentPage < this.pageCount) {
        strRet.push(this.showPrevNext ? this.NEXT_PAGE : "");
        strRet.push(this.showFirstLast ? this.LAST_PAGE : "");
    }
    else {
        strRet.push(this.showPrevNext ? this.NEXT_PAGE2 : "");
        strRet.push(this.showFirstLast ? this.LAST_PAGE2 : "");
    }
    strRet.push("</ul></div>");
    strRet.push("<div>");
    return strRet.join("");
};
jetsennet.ui.PageBar.prototype.showCustomPage = function (obj) {
    var customElement = el(this.instanceId + "-custom");
    if (customElement == null) {
        customElement = document.createElement("DIV");
        customElement.id = this.instanceId + "-custom";
        customElement.className = 'pagebar-custom';
        document.body.appendChild(customElement);
    }
    var customContent = [];
    for (var i = 0; i < this.customSizeList.length; i++) {
        var customSize = this.customSizeList[i];
        customContent.push("<div onclick='jetsennet.ui.PageBars[\"" + this.instanceId + "\"].changePageSize(" + customSize + ");' onmouseover='this.className=\"pagebar-custom-sitem\"' onmouseout='this.className=\"pagebar-custom-item\"' >" + customSize + "</div>");
    }

    customElement.innerHTML = customContent.join("");
    jetsennet.popup(customElement, { reference: obj });
};
jetsennet.ui.PageBar.prototype.changePageSize = function (pageSize) {
    if (this.pageSize == pageSize)
        return;

    this.currentPage = 1;
    this.pageSize = pageSize;
    this.refresh();
};
   