/**
 * 数据源，为所有模板提供数据
 */
var Data = (function(){
	
	var _toFunctionItem = function(dataItem) {
		
		var item = $.extend(dataItem, {params: new HashMap(), childs: []});
		
		item.PARAM = item.PARAM ? item.PARAM : "";
		var arr = item.PARAM.split("?");
		var pageUrl = arr[0];
		if(!jetsennet.util.isNullOrEmpty(pageUrl))//链接地址不为空,有可能只是参数不是url，不做判断，均会生成相应的请求路径，只是无法正常访问
		{
			item.URL = item.PARAM;
			var token = jetsennet.getValideQueryString(pageUrl);//封装token信息,形式：token=tokenstr	       
	        if(arr.length==2){
	        	item.URL += "&"+token;
	        }
	        else{
	        	item.URL += "?"+token;
	        }
	        item.URL += "&sysid="+item.ID;
	        if(pageUrl.indexOf("http://") != 0)
	        {
	        	item.URL = "../../../" + item.URL;
	        }
	        var keyvalue = token.split("=");
	        item.params.put(keyvalue[0], keyvalue[1]);	//加入token
	        item.params.put("sysid", this.id);// 加入sysid
		}
		
		var paramstr = arr[1]||arr[0];
		if(!jetsennet.util.isNullOrEmpty(paramstr))//参数列表不为空
		{
			var keyvalues = paramstr.split("&");
			for(var i=0; i<keyvalues.length; i++)
			{
				var keyvalue = keyvalues[i].split("=");
				if(keyvalue.length==2)
				{
					item.params.put(keyvalue[0], keyvalue[1]);
				}
			}
		}
		
		item.getparam = function(name) {
			return this.params.get(name);
		};
		
		return item;
	};
	
	/**
	 *	组织节点（树形）
	 */
	var _addChildren2Node = function(uFunction, nodes, pIdName, idName) {
		$.each(nodes, function(){
			if(this[pIdName] === uFunction[idName] && !this.failure)
			{
				this.failure = true;
				uFunction.childs = uFunction.childs||[];
				uFunction.childs.push(this);
				_addChildren2Node(this, nodes, pIdName, idName);
			}
		});
	};
	
	return {
		
		get: function () {
			var map = new HashMap();
			map.put("userId", jetsennet.Application.userInfo.UserId);
			var UUMDAO = new jetsennet.DefaultDal("UUMSystemService");
			var result = UUMDAO.execute("uumGetUserFunctionTree", map);
			if (result && result.errorCode == 0) {
				return jetsennet.xml.toObject(result.resultVal,"Table");  
			}
			return null;
		},
		
		format: function (datas, pIdName, idName, initId) {
			var news = new Array();
			$.each(datas, function(){     
				if(this[pIdName] === initId && !this.failure)
			    {
					this.failure=true;
					news.push(this);
					_addChildren2Node(this, datas, pIdName, idName);
			    }
			});   
			return news;
		},
		
		serialize: function (uFunction) {
			return _toFunctionItem(uFunction);
		}
		
	};
}()); 

