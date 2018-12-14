// lixiaomin 2008/05/16
//=============================================================================
// Jetsen DateTime
//=============================================================================

jetsennet.registerNamespace("jetsennet.DateTime");
jetsennet.addLoadedUri(jetsennet.getloadUri("datetime"));

// Create public static method System.DateTime.Now.ToString();

jetsennet.DateTime.Now = function () {

    return new Date();
};
jetsennet.DateTime.Now.toString = function (format) {

    var currentDate = new jetsennet.DateTime;
    return currentDate.toString(format);
};
jetsennet.DateTime.Expressions = {
    Default: new RegExp("(0[1-9]|1[012])/(0[1-9]|[12][0-9]|3[01])/([0-9]?[0-9]?[0-9][0-9])"),
    UtcDate: new RegExp("([0-9][0-9][0-9][0-9])-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])"),
    UtcTime: new RegExp("([01][0-9]|[2][0123]):([012345][0-9]):([012345][0-9])"),
    UtcMs: new RegExp("\.([0-9]+)"),
    Zone: new RegExp("([+-])([01][0-9]|[2][0123]):([012345][0-9])"),
    Utc: new RegExp("([0-9][0-9][0-9][0-9])-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])" + "[T ]" + "([01][0-9]|[2][0123]):([012345][0-9]):([012345][0-9])")
};

// Outdated: must be updated.
jetsennet.DateTime.Expression = new RegExp("(0[1-9]|1[012])/(0[1-9]|[12][0-9]|3[01])/([0-9]?[0-9]?[0-9][0-9])");
jetsennet.DateTime.ExpressionUtcDate = new RegExp("([0-9][0-9][0-9][0-9])-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])");
jetsennet.DateTime.ExpressionUtcTime = new RegExp("([01][0-9]|[2][0123]):([012345][0-9]):([012345][0-9])");
jetsennet.DateTime.ExpressionUtcMs = new RegExp("\.([0-9]+)");
jetsennet.DateTime.ExpressionZone = new RegExp("([+-])([01][0-9]|[2][0123]):([012345][0-9])");
jetsennet.DateTime.ExpressionUtc = new RegExp(jetsennet.DateTime.ExpressionUtcDate.toString() + "[T ]" + jetsennet.DateTime.ExpressionUtcTime.toString());

jetsennet.DateTime.getFromString = function (dateString, ignoreTimeZoneAndParseAsUtc) {

    var dVal = new Date();
    // extract variable;
    var yyyy = 0;
    var MM = 0;
    var dd = 0;
    var dateMatch = dateString.match(jetsennet.DateTime.ExpressionUtcDate);
    if (dateMatch) {
        var yyyy = dateMatch[0].replace(jetsennet.DateTime.ExpressionUtcDate, "$1");
        var MM = dateMatch[0].replace(jetsennet.DateTime.ExpressionUtcDate, "$2");
        var dd = dateMatch[0].replace(jetsennet.DateTime.ExpressionUtcDate, "$3");
    }
    var hh = 0;
    var mm = 0;
    var ss = 0;
    var timeMatch = dateString.match(jetsennet.DateTime.ExpressionUtcTime);
    if (timeMatch) {
        hh = timeMatch[0].replace(jetsennet.DateTime.ExpressionUtcTime, "$1");
        mm = timeMatch[0].replace(jetsennet.DateTime.ExpressionUtcTime, "$2");
        ss = timeMatch[0].replace(jetsennet.DateTime.ExpressionUtcTime, "$3");
    }
    var fff = 0;
    var msMatch = dateString.match(jetsennet.DateTime.ExpressionUtcMs);
    if (msMatch) {
        fff = msMatch[0].replace(jetsennet.DateTime.ExpressionUtcMs, "$1");
        fff = parseFloat("0." + fff);
        fff = parseInt(fff * 1000);
    }
    var znMatch = dateString.match(jetsennet.DateTime.ExpressionZone);
    var zn = 0;
    var zh = 0;
    var zm = 0;
    if (znMatch) {
        zn = parseInt(parseFloat(znMatch[0].replace(jetsennet.DateTime.ExpressionZone, "$1") + "1"));
        zh = parseInt(parseFloat(znMatch[0].replace(jetsennet.DateTime.ExpressionZone, "$2")) * zn);
        zm = parseInt(parseFloat(znMatch[0].replace(jetsennet.DateTime.ExpressionZone, "$3")) * zn);
    }
    if (ignoreTimeZoneAndParseAsUtc) {
        dVal.setUTCFullYear(yyyy, MM - 1, dd);
        dVal.setUTCHours(hh, mm, ss, fff);
    } else {
        // Check for marks which are same as "+00:00".
        var zeroZone = false;
        zeroZone = (zeroZone || (dateString.indexOf("GMT") > -1));
        zeroZone = (zeroZone || (dateString.indexOf("Z") > -1));
        // If timezone was not specified then treat string as local time.
        // This is default behaviour on all platforms.
        if (zn == 0 && !zeroZone) {
            dVal.setFullYear(yyyy, MM - 1, dd);
            dVal.setHours(hh, mm, ss, fff);
        } else {
            // Time zone was specified so we can use time zone.
            dVal.setUTCFullYear(yyyy, MM - 1, dd);
            dVal.setUTCHours(hh, mm, ss, fff);
            // This date contains time zone.
            dVal = new Date(dVal.getTime() - (zh * 60 + zm) * 60 * 1000);
        }
    }
    //jetsennet.alert(zn+":"+zh+":"+zm);	
    return dVal;
};
jetsennet.DateTime.toString = function (dateTime, format) {

    var date;
    var format;
    switch (arguments.length) {
        case 0:
            date = this;
            format = date.defaultFormat;
            break;
        case 1:
            date = this;
            format = arguments[0];
            break;
        case 2:
            date = arguments[0];
            format = arguments[1];
            break;
        default:
            return "";
            break
    }
    date.addZero = function (number) { return (number < 10) ? '0' + number : number };
    // www is provided for old compatibility. Use 'dddd' and 'ddd' instead.
    var wwwArray = new Array("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat");
    var dddArray = new Array("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat");
    var ddddArray = new Array("Sunday", "Monday", "Tuesday", "Wednesday", "Thuesday", "Friday", "Saturday");
    var MMMArray = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
    if (format == null) { format = date.DefaultFormat };
    // "X" format is used to store DateTome values inside XML files of DataSet.
    if (format == "Outlook") {
        var now = new Date();
        if (date.getFullYear() == now.getFullYear()
			&& date.getMonth() == now.getMonth()
			&& date.getDate() == now.getDate()) {
            results = "ddd HH:mm";
        } else {
            format = "yyyy-MM-dd HH:mm";
        }
    }
    if (format == "X") { format = "yyyy-MM-ddTHH:mm:ss.fffzzz" };
    // Generate values from Date.
    var fff = date.getMilliseconds();
    var yyyy = date.getFullYear();
    var yy = new String(date.addZero(yyyy));
    yy = yy.substr(yy.length - 2, 2);
    var www = wwwArray[date.getDay()]; // Outdated!!!
    var dddd = ddddArray[date.getDay()];
    var ddd = dddArray[date.getDay()];
    var dd = date.addZero(date.getDate());
    var MMM = MMMArray[date.getMonth()];
    var MM = date.addZero(date.getMonth() + 1);
    var hAmPm = date.getHours() % 12;
    if (hAmPm == 0) hAmPm = 12;
    var hh = date.addZero(hAmPm); // 12 format
    var HH = date.addZero(date.getHours()); // 24 format
    var mm = date.addZero(date.getMinutes());
    var ss = date.addZero(date.getSeconds());
    var tt = (date.getHours() < 12) ? "AM" : "PM";
    var zzz = date.addZero(date.getTimezoneOffset());
    var offset = date.getTimezoneOffset();
    var negative = (offset < 0);
    if (negative) offset = offset * -1;
    zzz = date.addZero(Math.floor(offset / 60)) + ":" + date.addZero((offset % 60));
    if (negative || offset == 0) {
        zzz = "+" + zzz;
    } else {
        zzz = "-" + zzz;
    }
    // Apply format.
    var strDate = new String(format);
    strDate = strDate.replace("yyyy", jetsennet.util.padLeft(yyyy,4,'0'));
    strDate = strDate.replace("yy", yy);
    strDate = strDate.replace("www", www);
    strDate = strDate.replace(new RegExp("[d]{4-10}", "g"), dddd);
    strDate = strDate.replace(new RegExp("[d]{3}", "g"), ddd);
    strDate = strDate.replace("dd", dd);
    strDate = strDate.replace("MMM", MMM);
    strDate = strDate.replace("MM", MM);
    strDate = strDate.replace("ss", ss);
    strDate = strDate.replace("hh", hh);
    strDate = strDate.replace("HH", HH);
    strDate = strDate.replace("mm", mm);
    strDate = strDate.replace("ss", ss);
    strDate = strDate.replace("tt", tt);
    strDate = strDate.replace("ffffff", (fff + "000000").substr(0, 6));
    strDate = strDate.replace("fff", (fff + "000").substr(0, 3));
    strDate = strDate.replace("zzz", zzz);
    return strDate;
};
jetsennet.DateTime.toDifferenceString = function (dateOld, dateNew) {

    this.addZero = function (number) { return (number < 10) ? '0' + number : number };
    dateNew = dateNew ? dateNew : new Date();
    var ms = dateNew.getTime() - dateOld.getTime();
    var nd = new Date(ms);
    var ph = nd.getHours();
    var pm = nd.getMinutes();
    var ps = nd.getSeconds();
    var msPassed = 1000 * (60 * (60 * ph + pm) + ps) + nd.getMilliseconds();
    var d = (nd.getTime() - msPassed) / 24 / 60 / 60 / 1000;
    var results = Math.round(d) + "d " + ph + "h " + pm + "m";

    return results;
};
//-------------------------------------------------------------
// Check DateTime
//-------------------------------------------------------------

jetsennet.DateTime.Separator = "/";
jetsennet.DateTime.YearMin = 1900;
jetsennet.DateTime.YearMax = 2999;
jetsennet.DateTime.DateFormat = "dd/mm/yyyy";
jetsennet.DateTime.Expression = new RegExp("(0[1-9]|1[012])/(0[1-9]|[12][0-9]|3[01])/([0-9]?[0-9]?[0-9][0-9])");

jetsennet.DateTime.daysInFebruary = function (valYear) {

    return (((valYear % 4 == 0) && ((!(valYear % 100 == 0)) || (valYear % 400 == 0))) ? 29 : 28);
};

jetsennet.DateTime.daysArray = function (valYear) {

    var arrDays = new Array;
    for (var i = 1; i <= 12; i++) {
        arrDays[i] = 31;
        if (i == 4 || i == 6 || i == 9 || i == 11) { arrDays[i] = 30 };
    }
    // Set February days.
    arrDays[2] = jetsennet.DateTime.daysInFebruary(valYear);
    return arrDays;
};

jetsennet.DateTime.isDate = function (valDate) {
    var dateString = new String(valDate);
    var reg = /^\d{1,4}-\d{1,2}-\d{1,2}$/;
    if (dateString.match(reg) == null) {
        reg = /^\d{1,4}\/\d{1,2}\/\d{1,2}$/;
        if (dateString.match(reg) == null)
            return false;
        dateString = dateString.replace(/\//g, "-");
    }
    dateString = jetsennet.DateTime.getFromString(dateString).toDateString("MM/dd/yyyy");
    return jetsennet.DateTime._isDate(dateString);
};
jetsennet.DateTime._isDate = function (valDate) {
    var dateString = new String(valDate);
    var re = /\d+/g;
    // Get Day, Month, Year;
    if (!jetsennet.DateTime.Expression.test(dateString)) return false;
    // Date looks OK so continue to check.
    var MM = parseInt(dateString.replace(jetsennet.DateTime.Expression, "$1"), 10);
    var DD = parseInt(dateString.replace(jetsennet.DateTime.Expression, "$2"), 10);
    var YY = parseInt(dateString.replace(jetsennet.DateTime.Expression, "$3"), 10);
    //jetsennet.alert(DD+"/"+MM+"/"+YY);
    if (YY >= 0 && YY <= 50) YY += 2000;
    if (YY > 50 && YY <= 99) YY += 1900;
    var DaysInMonth = jetsennet.DateTime.daysArray(YY)[MM];
    //jetsennet.alert(DD+"/"+MM+"/"+YY+" - "+DaysInMonth);
    if (MM < 1 || MM > 12) return false;
    if (DD > DaysInMonth) return false;
    if (YY < jetsennet.DateTime.YearMin || YY > jetsennet.DateTime.YearMax) return false;
    return true;
};
jetsennet.DateTime.parseDate = function (valDate) {
    var dateString = new String(valDate);
    dateString = jetsennet.DateTime.getFromString(valDate).toDateString("MM/dd/yyyy");
    if (jetsennet.DateTime._isDate(dateString))
        return new Date(dateString);
    return null;
};
jetsennet.DateTime.getWeekDay = function (dayOfWeek) {
    switch (dayOfWeek) {
        case 1:
            return "星期一";
            break;
        case 2:
            return "星期二";
            break;
        case 3:
            return "星期三";
            break;
        case 4:
            return "星期四";
            break;
        case 5:
            return "星期五";
            break;
        case 6:
            return "星期六";
            break;
        case 7:
            return "星期日";
            break;
    }
    return "";
};
//-------------------------------------------------------------
// Extend JavaScript Date object.
//-------------------------------------------------------------

//Date.prototype.getFromString = jetsennet.DateTime.getFromString;
Date.prototype.defaultFormat = "yyyy-MM-dd";
Date.prototype.toDateString = jetsennet.DateTime.toString;

