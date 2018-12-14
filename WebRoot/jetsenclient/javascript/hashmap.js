jetsennet.addLoadedUri(jetsennet.getloadUri("hashmap"));

/**
 * HashMap构造函数
 */
jetsennet.HashMap = HashMap = function() {
    this.keys = [];
    this.values = [];
}
/**
 * 向HashMap中添加键值对
 */
HashMap.prototype.put = function(key, value) {
    for (var i = 0; i < this.keys.length; i++) {
        if (this.keys[i] == key) {
            this.values[i] = value;
            return;
        }
    }
    this.keys.push(key);
    this.values.push(value);
}
/**
 * 从HashMap中获取value值
 */
HashMap.prototype.get = function(key) {
    for (var i = 0; i < this.keys.length; i++) {
        if (this.keys[i] == key) {
            return this.values[i];
        }
    }
    return null;
}
/**
 * 从HashMap中获取所有key的集合，以数组形式返回
 */
HashMap.prototype.keys = function() {
    return this.keys;
}
/**
 * 从HashMap中获取value的集合，以数组形式返回
 */
HashMap.prototype.values = function() {
    return this.values;
}
/**
 * 获取HashMap的value值数量
 */
HashMap.prototype.size = function() {
    return this.keys.length;
}
/**
 * 删除指定的值
 */
HashMap.prototype.remove = function(key) {
    for (var i = 0; i < this.keys.length; i++) {
        if (this.keys[i] == key) {
            this.keys.splice(i, 1);
            this.values.splice(i, 1);
            break;
        }
    }
}
/**
 * 清空HashMap
 */
HashMap.prototype.clear = function() {
    this.keys = [];
    this.values = [];
}
/**
 * 判断HashMap是否为空
 */
HashMap.prototype.isEmpty = function() {
    return this.keys.length == 0;
}
/**
 * 判断HashMap是否存在某个key
 */
HashMap.prototype.containsKey = function(key) {
    for (var i = 0; i < this.keys.length; i++) {
        if (this.keys[i] == key) {
            return true;
        }
    }
    return false;
}
/**
 * 判断HashMap是否存在某个value
 */
HashMap.prototype.containsValue = function(value) {
    for (var i = 0; i < this.values.length; i++) {
        if (this.values[i] == value) {
            return true;
        }
    }
    return false;
}
/**
 * 把一个HashMap的值加入到另一个HashMap中，参数必须是HashMap
 */
HashMap.prototype.putAll = function(map) {
    if (map == null) {
        return;
    }
    if (map.constructor != HashMap) {
        return;
    }
    var arrKey = map.keys();
    var arrValue = map.values();
    for (var i = 0; i < arrKey.length; i++) {
        this.put(arrKey[i], arrValue[i]);
    }
}
// toString
HashMap.prototype.toString = function() {
    var array = [];
    for (var i = 0; i < this.keys.length; i++) {
        array.push(this.keys[i] + " : " + this.values[i]);
    }
    return array.join("\r\n");
}

// toJson HashMap转换成Json字符串
HashMap.prototype.toJson = function() {
    var json = {};
    for (var i = 0; i < this.keys.length; i++) {
        json[this.keys[i]] = this.values[i];
    }
    return json;
}

// toArray HashMap转换成Array
HashMap.prototype.toArray = function() {
    var array = [];
    for (var i = 0; i < this.values.length; i++) {
        array.push(this.values[i]);
    }
    return array;
}
