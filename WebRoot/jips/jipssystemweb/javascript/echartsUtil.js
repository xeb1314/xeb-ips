jetsennet.require(["echarts/esl"]);
jetsennet.importCss("bootstrap/bootstrap");

//echarts.js的绝对路径
	var fileLocation = jetsennet.require([ "echarts/echarts"]);
	//把所需视图指向文件绝对路径
	require.config({
	    paths:{ 
	        echarts: fileLocation,
	        'echarts/chart/bar': fileLocation,// 把所需图表指向单文件
	    }
	});

/**
 * 定义option对象
 * @param xAxisData
 * @returns {___anonymous2021_7686}
 */
function optionObj(xAxisData,handleCount,failCounts,totalCount){

	var option = {
			//提示框，鼠标悬浮交互时的信息提示。	
		    tooltip : {
		    	//显示策略，可选为：true（显示） | false（隐藏）
		        show: true,
		        //触发类型，默认数据触发，可选为：'item' | 'axis'
		        trigger: 'item' //默认值
		    },
		    //图例，每个图表最多仅有一个图例
		    legend: {
		        data:['失败','成功','处理量']//,'空闲执行器'
		    },
		    //具箱，每个图表最多仅有一个工具箱。
		    toolbox: {
		        show : true,
		        feature : {
		            mark : {show: true},
		            dataView : {show: true, readOnly: false},
		            magicType : {show: true, type: ['line', 'bar', 'stack', 'tiled']},
		            restore : {show: true},
		            saveAsImage : {show: true}
		        }
		    },
		    //是否启用拖拽重计算特性，默认关闭
		    calculable : true,
		    //x轴坐标
		    xAxis : [
		        {
		        	//坐标轴类型，横轴默认为类目型'category'，纵轴默认为数值型'value'
		            type : 'category',
//		            data : ['周一','周二','周三','周四','周五','周六','周日']
		            data : xAxisData
		        }
		    ],
		    //y轴坐标
		    yAxis : [
		        {
		            type : 'value',
		            //分割区域
		            splitArea : {show : true}
		        }
		    ],
		    series : [
		        {
		            name:'失败',
		            type:"bar",
		            itemStyle: {        // 系列级个性化样式，纵向渐变填充
		                normal: {
		                    borderColor:'red',
		                    color : (function(){
		                        var zrColor = require('zrender/tool/color');
		                        return zrColor.getLinearGradient(
		                            0, 400, 0, 300,
		                            [[0, 'green'],[1, 'yellow']]
		                        );
		                    })(),
		                    label : {
		                        show : true,
		                        textStyle : {
		                            fontSize : '15',
		                            fontFamily : '微软雅黑',
		                            fontWeight : 'bold'
		                        }
		                    }
		                },
		                emphasis: {
		                    borderWidth: 5,
		                    borderColor:'green',
		                    color: (function(){
		                        var zrColor = require('zrender/tool/color');
		                        return zrColor.getLinearGradient(
		                            0, 400, 0, 300,
		                            [[0, 'red'],[1, 'orange']]
		                        );
		                    })(),
		                    label : {
		                        show : true,
		                        position : 'top',
		                        formatter : "{a} {b} {c}",
		                        textStyle : {
		                            color: 'blue'
		                        }
		                    }
		                }
		            },
		            data:failCounts
		            	/*[0, 0, 0, 0, 0, 0, 0]*/
		        },
		       /* {
		            name:'空闲执行器',
		            type:'bar',
		            stack: '总量',
		            data:[120, '-', 451, 134, 190, 230, 110]
		        },*/
		        {
		            name:'成功',
		            type:"bar",
		            stack: '总量',
		            itemStyle: {                // 系列级个性化
		                normal: {
		                    borderWidth: 6,
		                    borderColor:'tomato',
		                    color: 'red',
		                    label : {
		                        show : true,
		                        textStyle : {
		                            fontSize : '15',
		                            fontFamily : '微软雅黑',
		                            fontWeight : 'bold'
		                        }
		                    }
		                },
		                emphasis: {
		                    borderColor:'red',
		                    color: 'blue'
		                }
		            },
		            data: handleCount,
		            	/*[
		                320, 332, 100, 334,
		                {
		                    value: 390,
		                    symbolSize : 10,   // 数据级个性化
		                    itemStyle: {
		                        normal: {
		                            color :'lime'
		                        },
		                        emphasis: {
		                            color: 'skyBlue'
		                        }
		                    }
		                },
		                330, 320
		            ]*/
		        },
		        {
		            name:'处理量',
		            type:"bar",
//		            barWidth: 40,                   // 系列级个性化，柱形宽度
		            itemStyle: {
		                normal: {                   // 系列级个性化，横向渐变填充
		                    borderRadius: 5,
		                    color : (function(){
		                        var zrColor = require('zrender/tool/color');
		                        return zrColor.getLinearGradient(
		                            0, 0, 1000, 0,
		                            [[0, 'rgba(30,144,255,0.8)'],[1, 'rgba(138,43,226,0.8)']]
		                        );
		                    })(),
		                    label : {
		                        show : true,
		                        textStyle : {
		                            fontSize : '15',
		                            fontFamily : '微软雅黑',
		                            fontWeight : 'bold'
		                        }
		                    }
		                }
		            },
		            data: totalCount,
		            	/*[
		                620, 732, 
		                {
		                    value: 701,
		                    itemStyle : { normal: {label : {position: 'inside'}}}
		                },
		                734, 890, 
		                {
		                    value: 930,
		                    itemStyle : { normal: {label : {show: false}}}
		                },
		                820
		            ],*/
		            	
		            markPoint : {
		                data : [
		                    {name : '最高', value : 930, xAxis: '周六', yAxis: 930, symbolSize:14}
		                ]
		            },
		            markLine : {
		                data : [
		                    [
		                        {type : 'average', name : '平均值'},
		                        {type : 'max'},
		                        {type : 'min'}
		                    ]
		                ]
		            }
		        }
		    ]
		};
	return option;
}

/**
 * 定义option对象
 * @param xAxisData
 * @returns {___anonymous2021_7686}
 */
function optionColloc(xAxisData,totalCount){

	var option = {
			//提示框，鼠标悬浮交互时的信息提示。	
		    tooltip : {
		    	//显示策略，可选为：true（显示） | false（隐藏）
		        show: true,
		        //触发类型，默认数据触发，可选为：'item' | 'axis'
		        trigger: 'item' //默认值
		    },
		    //图例，每个图表最多仅有一个图例
		    legend: {
		        data:['处理量 (M)']//,'空闲执行器'
		    },
		    //具箱，每个图表最多仅有一个工具箱。
		    toolbox: {
		        show : true,
		        feature : {
		            mark : {show: true},
		            dataView : {show: true, readOnly: false},
		            magicType : {show: true, type: ['line', 'bar', 'stack', 'tiled']},
		            restore : {show: true},
		            saveAsImage : {show: true}
		        }
		    },
		    //是否启用拖拽重计算特性，默认关闭
		    calculable : true,
		    //x轴坐标
		    xAxis : [
		        {
		        	//坐标轴类型，横轴默认为类目型'category'，纵轴默认为数值型'value'
		            type : 'category',
//		            data : ['周一','周二','周三','周四','周五','周六','周日']
		            data : xAxisData
		        }
		    ],
		    //y轴坐标
		    yAxis : [
		        {
		            type : 'value',
		            //分割区域
		            splitArea : {show : true}
		        }
		    ],
		    series : [
		        {
		            name:'处理量 (M)',
		            type:'line',
//		            barWidth: 40,                   // 系列级个性化，柱形宽度
		            itemStyle: {
		                normal: {                   // 系列级个性化，横向渐变填充
		                    borderRadius: 5,
		                    color : (function(){
		                        var zrColor = require('zrender/tool/color');
		                        return zrColor.getLinearGradient(
		                            0, 0, 1000, 0,
		                            [[0, 'rgba(30,144,255,0.8)'],[1, 'rgba(138,43,226,0.8)']]
		                        );
		                    })(),
		                    label : {
		                        show : true,
		                        textStyle : {
		                            fontSize : '20',
		                            fontFamily : '微软雅黑',
		                            fontWeight : 'bold'
		                        }
		                    }
		                }
		            },
		            data: totalCount,
		            markPoint : {
		                data : [
		                    {name : '最高', value : 930, xAxis: '周六', yAxis: 930, symbolSize:14}
		                ]
		            },
		            markLine : {
		                data : [
		                    [
		                        {type : 'average', name : '平均值'},
		                        {type : 'max'},
		                        {type : 'min'}
		                    ]
		                ]
		            }
		        }
		    ]
		};
	return option;
}
