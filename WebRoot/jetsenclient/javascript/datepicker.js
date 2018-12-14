// lixiaomin 2008/06/14
//=============================================================================
// Jetsen UI DatePicker
// 2013-01-21 修改时间部分的输入验证
//=============================================================================
jetsennet.addLoadedUri(jetsennet.getloadUri("datepicker"));
jetsennet.importCss("jetsenui");

jetsennet.ui.DatePicker = function (oDate) {
    this.__typeName = "jetsennet.ui.DatePicker";

    if (arguments.length == 0) {
        this._selectedDate = new Date;
        this._none = false;
    }
    else {
        this._selectedDate = oDate || new Date();
        this._none = oDate == null;
    }

    this._matrix = [[], [], [], [], [], [], []];
    this.showFooter = true;
    this.showTime = true;
    this.firstWeekDay = 0;
    this.redWeekDay = 6;
    this.currentViewType = 0;
    this.currentYear = 0;

    this.dontChangeNone = false;
    this.onchange = function () { };
    this.dateSelected = null;

    //this.months = ["January", "February", "March", "April","May", "June", "July", "August","September", "October", "November", "December"];
    this.months = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
    this.monthNumbers = {};
    for (var i = 1; i <= this.months.length; i++) {
        this.monthNumbers[this.months[i - 1]] = i;
    }
    //this.days = ["m", "t", "w", "t", "f", "s", "s"];
    this.days = ["一", "二", "三", "四", "五", "六", "日"];
    this.daysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
};

jetsennet.ui.DatePicker.prototype.create = function (doc) {
    if (doc == null) doc = document;
    var dp = this;

    var control = jQuery("<div>", {}).addClass("jetsen-datepicker")
    .click(function () {
        jetsennet.cancelEvent();
        return false;
    }).keydown(function (e) {
        if (e == null) e = doc.parentWindow.event;
        var kc = e.keyCode != null ? e.keyCode : e.charCode;

        if (kc < 37 || kc > 40) return true;

        var d = new Date(dp._selectedDate).valueOf();
        if (kc == 37) // left
            d -= 24 * 60 * 60 * 1000;
        else if (kc == 39) // right
            d += 24 * 60 * 60 * 1000;
        else if (kc == 38) // up
            d -= 7 * 24 * 60 * 60 * 1000;
        else if (kc == 40) // down
            d += 7 * 24 * 60 * 60 * 1000;

        dp.setDate(new Date(d));
        return false;
    });

    this.control = control[0];

    var tr = jQuery("<tr>", {}).appendTo(
        jQuery("<tbody>", {}).appendTo(
        jQuery("<table>", {}).addClass("h-table").attr("cellSpacing", 0).appendTo(
        jQuery("<div>", {}).addClass("header").appendTo(control))));

    //prev button
    jQuery("<i class='glyphicon glyphicon-arrow-left'></i>", {}).addClass("prev-btn").appendTo(jQuery("<td>").appendTo(tr).css("width", "10%"))
    .click(function (e) {

        dp.dontChangeNone = true;

        if (dp.currentViewType == 0) {
            dp.goToPreviousMonth();
        }
        else if (dp.currentViewType == 1) {
            dp.goToPreviousYear();
        }
        else if (dp.currentViewType == 2) {
            dp.goToPreviousRegion();
        }

        dp.dontChangeNone = false;
        jetsennet.cancelEvent();
    });

    //title
    jQuery("<a>").addClass("datetitle").attr("href", "#").css("text-align", "center").appendTo(
        jQuery("<td>").appendTo(tr).css({ width: "80%" })).html(String.fromCharCode(160)
    )
    .click(function (e) {

        if (dp.currentViewType == 0) {
            dp.showMonthView();
        }
        else if (dp.currentViewType == 1) {
            dp.showYearView();
        }

        jetsennet.cancelEvent();
    });

    //next button
    jQuery("<i class='glyphicon glyphicon-arrow-right'></i>").addClass("next-btn").attr("href", "#").css("text-align", "right").appendTo(
        jQuery("<td>").appendTo(tr).css({ width: "10%" })
    )
    .click(function (e) {
        dp.dontChangeNone = true;
        if (dp.currentViewType == 0) {
            dp.goToNextMonth();
        }
        else if (dp.currentViewType == 1) {
            dp.goToNextYear();
        }
        else if (dp.currentViewType == 2) {
            dp.goToNextRegion();
        }
        dp.dontChangeNone = false;
        jetsennet.cancelEvent();
    });

    //date body
    jQuery("<div>", {}).addClass("grid").appendTo(control).click(function (e) {
        if (e == null) e = doc.parentWindow.event;
        var el = e.target != null ? e.target : e.srcElement;

        while (el.nodeType != 1)
            el = el.parentNode;

        while (el != null && el.tagName && el.tagName.toLowerCase() != "td")
            el = el.parentNode;

        if (el == null || el.tagName == null || el.tagName.toLowerCase() != "td")
            return;

        var d = new Date(dp._selectedDate);
        var val = el.firstChild.data;
        if (dp.currentViewType == 1)
            val = dp.monthNumbers[val];

        var n = Number(val);
        if (isNaN(n) || n <= 0 || n == null) {
            return;
        }

        if (dp.currentViewType == 2) {
            d.setYear(n);
            dp.dontChangeNone = true;
            dp.setDate(d);
            dp.dontChangeNone = false;
            dp.showMonthView();
        }
        else if (dp.currentViewType == 1) {
            d.setMonth(n - 1);
            d.setYear(dp.currentYear);
            dp.dontChangeNone = true;
            dp.setDate(d);
            dp.dontChangeNone = false;
            dp.showDateView();
        }
        else {
            d.setDate(n);
            dp.setDate(d);
            if (!dp.showTime && dp.dateSelected) {
                dp.dateSelected(d);
            }
        }
    })
    .append(this.createDateTable())
    .append(this.createMonthTable())
    .append(this.createYearTable())[0];

    if (this.showFooter) {

        jQuery("<div>", {}).addClass("footer").attr("align","center")
        .appendTo(control)
        .append(jQuery("<span>", {}).addClass("todaybtn").html("今天").click(function (e) {
            dp.dontChangeNone = true;
            dp.goToToday();
            dp.dontChangeNone = false;
            dp.showDateView();
            jetsennet.cancelEvent();
        }))
        .append(jQuery("<span>", {}).html("：" + new Date().toDateString() + "&nbsp;&nbsp;"))
        .append(jQuery("<span>", {}).addClass("todaybtn").html("清空").click(function (e) {
            dp.dateSelected("");
        }));
    }

    var tmpTime = this._selectedDate.toTimeString();
    var timeArr = tmpTime.split(':');

    var divTimer = jQuery("<div>", {}).addClass("timer").attr("align", "center").appendTo(control)
        .html("<input type='text' style='width:18px' class='timer' value='" + timeArr[0]
            + "' maxlength=2 validatetype='uinteger,maxvalue' maxvalue='23'/>时<input type='text'style='width:18px' class='timer' value='"
            + timeArr[1] + "' maxlength=2 validatetype='uinteger,maxvalue' maxvalue='59'/>分<input type='text'style='width:18px' class='timer' value='"
            + timeArr[2] + "' maxlength=2 validatetype='uinteger,maxvalue' maxvalue='59'/>秒&nbsp;");

    //ok button
    jQuery('<input type="button" class="btn btn-primary btn-xs" value="确定">', {}).click(function () {

        var elements = jQuery(":text", dp.control).get();
        if (jetsennet.validate(elements, true)) {
            dp._selectedDate.setHours(parseInt(elements[0].value));
            dp._selectedDate.setMinutes(parseInt(elements[1].value));
            dp._selectedDate.setSeconds(parseInt(elements[2].value));
            var d = new Date(dp._selectedDate);
            dp.dateSelected(d);
        }
    }).appendTo(divTimer);

    this.showTime ? divTimer.show() : divTimer.hide();

    this.updateDateTable();
    this.setTitleLabel();

    // ie6 extension
    control[0].onmousewheel = function (e) {

        if (e == null) e = doc.parentWindow.event;
        var n = -e.wheelDelta / 120;
        var d = new Date(dp._selectedDate);
        
        if (dp.currentViewType == 0) {
            var m = d.getMonth() + n;
            d.setMonth(m);
        }
        else if (dp.currentViewType == 1) {
            dp.currentYear = Math.min(3000, dp.currentYear + n);
            d.setYear(dp.currentYear);
        }
        else if (dp.currentViewType == 2) {
            dp.currentYear = Math.min(3000, dp.currentYear + n);
            d.setYear(dp.currentYear);
            dp.updateYearTable();
        }

        dp.dontChangeNone = true;
        dp.setDate(d);
        dp.dontChangeNone = false;

        return false;
    };

    return control;
};
jetsennet.ui.DatePicker.prototype.setShowTime = function (showTime) {
    this.showTime = showTime;
    var timeContainer = jQuery(".timer", this.control);
    if (timeContainer.size() > 0) {
        this.showTime ? timeContainer.show() : timeContainer.hide();
        var elements = jQuery(":text", this.control).get();       
        jetsennet.clearValidateState(elements);
    }
};
jetsennet.ui.DatePicker.prototype.setDate = function (oDate) {

    // if null then set None
    if (oDate == null) {
        if (!this._none) {
            this._none = true;
            this.updateDateTable();

            if (typeof this.onchange == "function")
                this.onchange();
        }
        return;
    }

    // if string or number create a Date object
    if (typeof oDate == "string" || typeof oDate == "number") {
        oDate = new Date(oDate);
    }

    // do not update if not really changed
    if (this._selectedDate.getDate() != oDate.getDate() ||
		this._selectedDate.getMonth() != oDate.getMonth() ||
		this._selectedDate.getFullYear() != oDate.getFullYear() ||
		this._none) {

        if (!this.dontChangeNone)
            this._none = false;

        this._selectedDate = new Date(oDate);

        this.setTitleLabel();
        this.updateDateTable();

        if (typeof this.onchange == "function")
            this.onchange();
    }

    if (this.showTime) {
        var tmpTime = oDate.toTimeString();
        var timeArr = tmpTime.split(':');
        var elements = jQuery(":text", this.control).get();

        elements[0].value = timeArr[0];
        elements[1].value = timeArr[1];
        elements[2].value = timeArr[2];
    }

    if (!this.dontChangeNone)
        this._none = false;
};

jetsennet.ui.DatePicker.prototype.getDate = function () {
    if (this._none) return null;
    return new Date(this._selectedDate);
};
jetsennet.ui.DatePicker.prototype.createMonthTable = function () {

    var table = jQuery("<table>", {}).addClass("m-table").attr("cellSpacing", "0");
    var tBody = jQuery("<tbody>", {}).appendTo(table);

    for (var i = 0; i < 4; i++) {
        var tr = jQuery("<tr>", {}).appendTo(tBody);
        for (var j = 0; j < 3; j++) {
            jQuery("<td>", {}).html(this.months[i * 3 + j]).appendTo(tr);
        }
    }

    return table;
};
jetsennet.ui.DatePicker.prototype.createYearTable = function () {

    var table = jQuery("<table>", {}).addClass("y-table").attr("cellSpacing", 0);
    var tBody = jQuery("<tbody>", {}).appendTo(table);

    for (var i = 0; i < 6; i++) {
        var tr = jQuery("<tr>", {}).appendTo(tBody);
        for (var j = 0; j < 4; j++) {
            jQuery("<td>", {}).html(1900 + i * 4 + j).appendTo(tr);
        }
    }

    return table;
};

jetsennet.ui.DatePicker.prototype.updateYearTable = function () {
    var rows = 6;
    var cols = 4;
    var startYear = Math.max(0, this.currentYear - 12);
    var yearRows = jQuery(".y-table",this.control)[0].tBodies[0].rows;

    for (i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            yearRows[i].cells[j].firstChild.data = startYear;
            startYear++;
        }
    }
};
jetsennet.ui.DatePicker.prototype.createDateTable = function () {

    var rows = 6;
    var cols = 7;

    var table = jQuery("<table>", {}).addClass("d-table").attr("cellSpacing", 0);
    var tBody = jQuery("<tbody>", {}).appendTo(table);
    var tr = jQuery("<tr>", {}).addClass("daysRow").appendTo(tBody);

    var nbsp = String.fromCharCode(160);
    for (var i = 0; i < cols; i++) {
        jQuery("<td>", {}).html(nbsp).appendTo(tr);
    }

    jQuery("<td>", {}).html(nbsp).appendTo(jQuery("<tr>", {}).appendTo(tBody)).addClass("upperline").attr("colSpan", 7);

    // rest
    for (var i = 0; i < rows; i++) {
        tr = jQuery("<tr>", {}).appendTo(tBody);
        for (var j = 0; j < cols; j++) {
            jQuery("<td>", {}).html(nbsp).appendTo(tr);
        }
    }

    return table;
};

jetsennet.ui.DatePicker.prototype.updateDateTable = function () {

    var table = jQuery(".grid", this.control)[0];
    if (table == null)
        return;

    var i;
    var str = "";
    var rows = 6;
    var cols = 7;
    var currentWeek = 0;

    var cells = new Array(rows);
    this._matrix = new Array(rows);
    for (i = 0; i < rows; i++) {
        cells[i] = new Array(cols);
        this._matrix[i] = new Array(cols);
    }

    // Set the tmpDate to this month
    var tmpDate = new Date(this._selectedDate.getFullYear(), this._selectedDate.getMonth(), 1);
    var today = new Date();

    for (i = 1; i < 32; i++) {
        tmpDate.setDate(i);

        var weekDay = (tmpDate.getDay() + 6) % 7;
        var colIndex = (weekDay - this.firstWeekDay + 7) % 7;

        if (tmpDate.getMonth() == this._selectedDate.getMonth()) {

            var isToday = tmpDate.getDate() == today.getDate() &&
						tmpDate.getMonth() == today.getMonth() &&
						tmpDate.getFullYear() == today.getFullYear();

            cells[currentWeek][colIndex] = { text: "", className: "" };

            if (this._selectedDate.getDate() == tmpDate.getDate() && !this._none)
                cells[currentWeek][colIndex].className += "selected ";
            if (isToday)
                cells[currentWeek][colIndex].className += "today ";
            if ((tmpDate.getDay() + 6) % 7 == this.redWeekDay) // ISO
                cells[currentWeek][colIndex].className += "red";

            cells[currentWeek][colIndex].text =
				this._matrix[currentWeek][colIndex] = tmpDate.getDate();

            if (colIndex == 6)
                currentWeek++;
        }
    }

    var weekDays = this.days;
    if (this.firstWeekDay != 0) {
        weekDays = new Array(7);
        for (i = 0; i < 7; i++)
            weekDays[i] = this.days[(i + this.firstWeekDay) % 7];
    }

    var tds = table.firstChild.tBodies[0].rows[0].cells;
    for (i = 0; i < cols; i++)
        tds[i].firstChild.data = weekDays[i];


    var trs = table.firstChild.tBodies[0].rows;
    var tmpCell;
    var nbsp = String.fromCharCode(160);
    for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++) {
            tmpCell = trs[y + 2].cells[x];
            if (typeof cells[y][x] != "undefined") {
                tmpCell.className = cells[y][x].className;
                tmpCell.firstChild.data = cells[y][x].text;
            }
            else {
                tmpCell.className = "";
                tmpCell.firstChild.data = nbsp;
            }
        }
    }
};
jetsennet.ui.DatePicker.prototype.showDateView = function () {

    this.currentViewType = 0;
    jQuery(".y-table", this.control).hide();
    jQuery(".m-table", this.control).hide();
    jQuery(".d-table", this.control).show();
    this.setTitleLabel();
};
jetsennet.ui.DatePicker.prototype.showMonthView = function () {

    var tmp = new Date(this._selectedDate);
    this.currentYear = tmp.getFullYear();
    this.currentViewType = 1;
    jQuery(".y-table", this.control).hide();
    jQuery(".m-table", this.control).show();
    jQuery(".d-table", this.control).hide();
    jQuery(".datetitle",this.control).html(this.currentYear);
};
jetsennet.ui.DatePicker.prototype.showYearView = function () {
    var tmp = new Date(this._selectedDate);
    this.currentViewType = 2;
    this.currentYear = tmp.getFullYear();
    jQuery(".y-table", this.control).show();
    jQuery(".m-table", this.control).hide();
    jQuery(".d-table", this.control).hide();
    jQuery(".datetitle",this.control).html(Math.max(0, this.currentYear - 12) + "-" + (this.currentYear + 12 - 1));
    this.updateYearTable();
};
jetsennet.ui.DatePicker.prototype.setTitleLabel = function () {
    if (this.currentViewType == 0) {
        var strYear = this._selectedDate.getFullYear();
        var strMonth = this.months[this._selectedDate.getMonth()];
        jQuery(".datetitle",this.control).html(strYear + " " + strMonth);
    }
    else if (this.currentViewType == 1) {
        jQuery(".datetitle",this.control).html(this.currentYear);
    }
    else if (this.currentViewType == 2) {
        jQuery(".datetitle",this.control).html((this.currentYear - 12) + "-" + (this.currentYear + 12 - 1));
    }
};
jetsennet.ui.DatePicker.prototype.goToNextRegion = function () {
    this.currentYear = Math.min(3000, this.currentYear + 24);
    this.setTitleLabel();
    this.updateYearTable();
};
jetsennet.ui.DatePicker.prototype.goToPreviousRegion = function () {
    this.currentYear = Math.max(1000, this.currentYear - 24);
    this.setTitleLabel();
    this.updateYearTable();
};
jetsennet.ui.DatePicker.prototype.goToNextYear = function () {
    this.currentYear = Math.min(3000, this.currentYear + 1);
    this.setTitleLabel();
};
jetsennet.ui.DatePicker.prototype.goToPreviousYear = function () {
    this.currentYear = Math.max(1000, this.currentYear - 1);
    this.setTitleLabel();
};
jetsennet.ui.DatePicker.prototype.goToNextMonth = function () {
    var d = new Date(this._selectedDate);
    d.setDate(Math.min(d.getDate(), this.getDaysPerMonth(d.getMonth() + 1,
		d.getFullYear()))); // no need to catch dec -> jan for the year
    d.setMonth(d.getMonth() + 1);
    this.setDate(d);
};
jetsennet.ui.DatePicker.prototype.goToPreviousMonth = function () {
    var d = new Date(this._selectedDate);
    d.setDate(Math.min(d.getDate(), this.getDaysPerMonth(d.getMonth() - 1,
		d.getFullYear()))); // no need to catch jan -> dec for the year
    d.setMonth(d.getMonth() - 1);
    this.setDate(d);
};
jetsennet.ui.DatePicker.prototype.goToToday = function () {
    if (this._none)
        this._selectedDate = new Date(this._selectedDate + 10000000000);
    this._none = false;
    this.setDate(new Date());
};

//私有
// 0 is monday and 6 is sunday as in the ISO standard
jetsennet.ui.DatePicker.prototype.setFirstWeekDay = function (nFirstWeekDay) {
    if (this.firstWeekDay != nFirstWeekDay) {
        this.firstWeekDay = nFirstWeekDay;
        this.updateDateTable();
    }
};
//私有
jetsennet.ui.DatePicker.prototype.getFirstWeekDay = function () {
    return this.firstWeekDay;
};
// 私有
// 0 is monday and 6 is sunday as in the ISO standard
jetsennet.ui.DatePicker.prototype.setRedWeekDay = function (nRedWeekDay) {
    if (this.redWeekDay != nRedWeekDay) {
        this.redWeekDay = nRedWeekDay;
        this.updateDateTable();
    }
};
//私有
jetsennet.ui.DatePicker.prototype.getRedWeekDay = function () {
    return this.redWeekDay;
};
//私有
jetsennet.ui.DatePicker.prototype.getDaysPerMonth = function (nMonth, nYear) {
    nMonth = (nMonth + 12) % 12;
    var res = this.daysPerMonth[nMonth];
    if (nMonth == 1) {
        res += nYear % 4 == 0 && !(nYear % 400 == 0) ? 1 : 0;
    }
    return res;
};
jetsennet.pickDate = function (control, showTime) {
    if (!control)
        return;
    jetsennet.require("datetime");
    var d = new Date();
    try {
        if (!jetsennet.util.isNullOrEmpty(control.value)) {
            var dTemp = jetsennet.DateTime.getFromString(control.value);
            if (dTemp.getDate() && dTemp.getFullYear() > 0)
                d = dTemp;
        }
    } catch (ex) { }

    var datePicker = el('div-datepicker');
    if (datePicker == null) {
        var dp = new jetsennet.ui.DatePicker(d);
        dp.showTime = showTime;
        dp.setFirstWeekDay(6);

        datePicker = jQuery("<div>", { id: "div-datepicker" }).append(dp.create()).appendTo("body")[0];
        datePicker.datePicker = dp;
    }
    else {
        datePicker.datePicker.setShowTime(showTime);
        datePicker.datePicker.setDate(d);
    }

    datePicker.datePicker.showDateView();
    datePicker.datePicker.dateSelected = function (d) {
        if (d != null) {
            control.value = d == "" ? "" : (this.showTime ? d.toDateTimeString() : d.toDateString());
            jQuery(control).trigger("change");
        }
        jetsennet.hide(datePicker);
    };
        
    jetsennet.popup(datePicker, { reference: control });
};

jQuery.fn.pickDate = function (showTime) {    
    this.click(
        function () {            
            jetsennet.pickDate(this, showTime);
        }
    );
};