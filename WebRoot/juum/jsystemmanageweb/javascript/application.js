//=============================================================================
// Jsystemmanageweb application
//=============================================================================
jetsennet.require(["layoutit", "bootstrap/moment", "bootstrap/daterangepicker"]);
jetsennet.importCss([ "jetsen", "bootstrap/bootstrap"]);

//uumdao
var UUMDAO = new jetsennet.DefaultDal("UUMSystemService");

//sysdao
var SYSDAO = new jetsennet.DefaultDal("SystemService");
SYSDAO.dataType = "xml";

//权限模式:disable,hidden
var AUTH_MODE = "disable";

//日期范围选取框通用配置
var dataPickerOptions = { 
      ranges : { 
        '今天' : [ moment(), moment()], 
        '昨天' : [ moment().subtract('days', 1), moment().subtract('days', 1) ], 
        '最近一周' : [ moment().subtract('days', 6), moment() ], 
        '最近一月' : [ moment().subtract('days', 29), moment() ],
        '本月' : [ moment().startOf('month'), moment().endOf('month') ], 
        '上月' : [ moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month') ] 
      }, 
      format: 'YYYY-MM-DD', 
      startDate: new Date(), 
      showDropdowns: true, 
      separator:' - ', 
      locale: { 
        applyLabel: '确定',
        cancelLabel: '取消', 
        fromLabel: '从', 
        toLabel: '到', 
        customRangeLabel: '其他', 
        daysOfWeek: ['日', '一', '二', '三', '四', '五','六'], 
        monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'], 
        firstDay: 0 
      } 
};

/**
 * 取系统配置
 * @param {String} configNames 配置项列表
 */
jetsennet.application.getSysConfig = function(configNames) {
    var param = new HashMap();
    param.put("params", configNames);
    var result = SYSDAO.execute("getVagueMutiConfigFromDB", param);
    var configs = {};
    if (result && result.resultVal) {
        var objs = jQuery.parseJSON(result.resultVal);
        if (objs && objs.length > 0) {
            for (var i = 0; i < objs.length; i++) {
                var obj = objs[i];
                configs[obj.NAME] = obj.DATA;
            }
        }
    }
    return configs;
};

/**
 * 校验界面上的控件是否可用
 */
jetsennet.application.checkFunctionValidate = function() {
    var menuId = jetsennet.queryString("sysid");
    if (!menuId) {
        return;
    }
    var param = new HashMap();
    param.put("userId", jetsennet.application.userInfo.UserId);
    param.put("menuId", menuId);
    var result = UUMDAO.execute("uumGetUserOperateFunction", param);
    if (result && result.resultVal) {
        var objs = jetsennet.xml.toObject(result.resultVal, "Table");
        if (objs && objs.length > 0) {
            for (var i = 0; i < objs.length; i++) {
                var element = $(".func-" + objs[i]["PARAM"]);
                if (element) {
                    if (!objs[i]["STATE"] == "0") {
                        if (AUTH_MODE == "hidden") {
                            element.hide();
                        } else {
                            element.attr("disabled", true);
                        }
                    }
                }
            }
        }
    }
};
