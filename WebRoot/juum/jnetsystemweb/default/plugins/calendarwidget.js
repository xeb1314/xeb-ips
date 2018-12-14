/**
 * author 李明
 * 带钟表的日历挂件
 * @param $
 */
var CalendarWidget = (function(){
    var html = [];
    html.push('<div class="toolboxplugin calendarwidget">');
    html.push('<div class="calendar"></div>');
    html.push('<div class="right">');
    html.push('<div class="clock"></div>');
    html.push('<div class="bottom">');
    html.push('<span class="desc datedesc"></span><br/>');
    html.push('<span class="desc daydesc"></span><br/>');
    html.push('<span class="desc timedesc"></span><br/>');
    html.push('</div></div></div>');
    
    var _init = function(id) {
        if($("#"+id).length==0) {
            jQuery(html.join("")).attr("id", id).appendTo("body");
        }
        return $("#"+id);
    };
    
    return {
        render: function(id) {
            if(WindowUtil.isShow($("#"+id))) {
                jetsennet.cancelBubble();
                return ;
            }
            var el = _init(id);
            $(el).find(".calendar").calendar({width:294});
            $(el).find(".clock").clock({smooth:false, func: function(h, m, s){
                h=h<10?"0"+h:h;
                m=m<10?"0"+m:m;
                s=s<10?"0"+s:s;
                $(el).find(".timedesc").html(h+":"+m+":"+s);
                
                var now = new Date();
                $(el).find(".datedesc").html((now.getYear()+1900)+"年"+(now.getMonth()+1)+"月"+now.getDate()+"日");
                var dayNames = ['日', '一', '二', '三', '四', '五', '六'];
                $(el).find(".daydesc").html("星期"+dayNames[now.getDay()]);
            }});
            $(el).find(".datedesc").click(function(){
                $(el).find(".calendar").calendar({width:294});
            });
            WindowUtil.show(el, {height: "260px"});
        }
    };
}());

/**
 * @author 李明
 * 扩展jQuery实现的时钟插件
 * @param $
 */
(function($) { 
    function clock(el, params) {
        var imgsLoaded = 0, callInterval = 1000;
        var opts = {
           size : 120,          
           smooth: true,    
           bgImage: "images/clock/clockBg.png",     
           hpImage: "images/clock/hourHand.png",     
           mpImage: "images/clock/minuteHand.png",     
           spImage: "images/clock/secondHand.png"     
        };
        $.extend(opts, params);
        el.width(opts.size).height(opts.size).css("position", "relative");
        el.empty();
        var bg = $("<img style=\"left:0px;top:0px;position:absolute;display:none;\" src=" + opts.bgImage + " />").load(function(){isImagesLoaded();}).appendTo(el);
        var hp = $("<img style=\"left:0px;top:0px;position:absolute;display:none;\" src=" + opts.hpImage + " />").load(function(){isImagesLoaded();}).appendTo(el);
        var mp = $("<img style=\"left:0px;top:0px;position:absolute;display:none;\" src=" + opts.mpImage + " />").load(function(){isImagesLoaded();}).appendTo(el);
        var sp = $("<img style=\"left:0px;top:0px;position:absolute;display:none;\" src=" + opts.spImage + " />").load(function(){isImagesLoaded();}).appendTo(el);
        
        var isImagesLoaded = function() {
            imgsLoaded ++;
            if(imgsLoaded == 4) {
                sp.css({
                    "left" : (opts.size - sp.width()) / 2 + "px",
                    "top" : (opts.size - sp.height()) / 2 + "px"
                });
                mp.css({
                    "left" : (opts.size - mp.width()) / 2 + "px",
                    "top" : (opts.size - mp.height()) / 2 + "px"
                });
                hp.css({
                    "left" : (opts.size - hp.width()) / 2 + "px",
                    "top" : (opts.size - hp.height()) / 2 + "px"
                });     
                el.find('img').fadeIn();
                
                (function Run() {
            
                    var now = new Date(), hours = new Date().getHours(), 
                    minutes = new Date().getMinutes(), 
                    seconds = new Date().getSeconds();
                    
                    if(opts.func && $.isFunction(opts.func)) {
                        opts.func(hours, minutes, seconds);
                    }
                    
                    var hrotate = hours * 30 + (minutes / 2);
                    hp.css({
                        'transform' : 'rotate(' + hrotate + 'deg)',
                        '-moz-transform' : 'rotate(' + hrotate + 'deg)',
                        '-webkit-transform' : 'rotate(' + hrotate + 'deg)'
                    });
        
                    var mrotate = minutes * 6;
                    mp.css({
                        'transform' : 'rotate(' + mrotate + 'deg)',
                        '-moz-transform' : 'rotate(' + mrotate + 'deg)',
                        '-webkit-transform' : 'rotate(' + mrotate + 'deg)'
                    });
        
                    var srotate = seconds * 6;
                    if (opts.smooth) {
                        srotate = now.getMilliseconds() / 1000 * 6 + srotate;
                        callInterval = 50;
                    }
                    sp.css({
                        'transform' : 'rotate(' + srotate + 'deg)',
                        '-moz-transform' : 'rotate(' + srotate + 'deg)',
                        '-webkit-transform' : 'rotate(' + srotate + 'deg)'
                    });
                    setTimeout(Run, callInterval);
                })();
            }
        };
    }
    
    $.fn.clock = function(params) {    
        clock(this, params);       
        return this; 
    }; 
    
})(jQuery);

/**
 * author 李明
 * 扩展jQuery实现的日历插件
 * @param $
 */
(function($) { 
    function calendar(el, params) { 
        
        var monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
        var dayNames = ['日', '一', '二', '三', '四', '五', '六'];
        var now   = new Date();
        var thismonth = now.getMonth();
        var thisdate = now.getDate();
        var thisyear  = now.getYear() + 1900;
        var opts = {
            month: thismonth,
            date: thisdate,  
            year: thisyear,
            width: 266,
            height: 240
        };
        $.extend(opts, params);
        el.css({width: opts.width, height: opts.height});
        var month = parseInt(opts.month);
        var year = parseInt(opts.year);
        
        var table = [];
        table.push('<div class="calendar-head"><i class="fa fa-angle-left left"></i>'+year+'年'+monthNames[month]+'<i class="fa fa-angle-right right"></i></div>');
        table.push('<table class="calendar-month">');
        table.push('<tr>');
        for (var d=0; d<7; d++) {
            table.push('<th class="weekday">' + dayNames[d] + '</th>');
        }
        table.push('</tr>');
    
        var days = getDaysInMonth(month, year);
        var firstDayDate = new Date(year, month, 1);
        var firstDay = firstDayDate.getDay();
        firstDay = (firstDay == 0 && firstDayDate) ? 7 : firstDay;
        var prev_m = month == 0 ? 11 : month-1;
        var prev_y = prev_m == 11 ? year - 1 : year;
        var prev_days = getDaysInMonth(prev_m, prev_y);
        var nxt_m = month==11 ? 0 : month+1;
        var nxt_y = nxt_m==0 ? year + 1 : year;
        
        var i = 0;
        for (var j=0;j<42;j++){
          if(j%7 == 0) table.push('<tr>');
          if ((j<firstDay)){
              table.push('<td class="other-month last" day="'+(prev_days-firstDay+j+1)+'"><span class="day">'+ (prev_days-firstDay+j+1) +'</span></td>');
          } else if ((j>=firstDay+days)) {
              i = i+1;
              table.push('<td class="other-month next" day="'+i+'"><span class="day">'+ i +'</span></td>');          
          }else{
              table.push('<td class="current-month day'+(j-firstDay+1)+'" day="'+(j-firstDay+1)+'"><span class="day">'+(j-firstDay+1)+'</span></td>');
          }
          if (j%7==6)  table.push('</tr>');
        }
        table.push('</table>');
        el.html(table.join(""));
        
        $('.day'+opts.date).addClass("selected");
        if(opts.year == thisyear && opts.month == thismonth) {
            $('.day'+thisdate).addClass("today");
        }
        el.find(".calendar-month tbody tr").height((opts.height - el.find(".calendar-head").height())/7);
        el.find(".current-month").click(function(){
            el.find(".current-month.selected").removeClass("selected");
           $(this).addClass("selected"); 
        });
        el.find(".other-month").click(function(){
           if($(this).hasClass("last")) {
               var o = {
                   month: prev_m,
                   date: $(this).attr("day"),  
                   year: prev_y
               };
               el.calendar($.extend(opts, o));
           } else {
               var o = {
                       month: nxt_m,
                       date: $(this).attr("day"),  
                       year: nxt_y
               };
               el.calendar($.extend(opts, o));
           }
        });
        el.find(".calendar-head > i").click(function(){
           if($(this).hasClass("left")) {
               var o = {
                       month: prev_m,
                       date: 1,  
                       year: prev_y
                   };
               el.calendar($.extend(opts, o));
           } else {
               var o = {
                       month: nxt_m,
                       date: 1,  
                       year: nxt_y
               };
               el.calendar($.extend(opts, o));
           }
        });
        
        function getDaysInMonth(month,year)  {
            var daysInMonth=[31,28,31,30,31,30,31,31,30,31,30,31];
            if ((month==1)&&(year%4==0)&&((year%100!=0)||(year%400==0))){
              return 29;
            }else{
              return daysInMonth[month];
            }
        }
    }
    
    $.fn.calendar = function(params) {    
        calendar(this, params);       
        return this; 
    }; 

})(jQuery);