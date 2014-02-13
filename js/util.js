// 全局命名空间
var AppView = {
	author : 'Goven',
	version: '1.0',
	modified: 'gxl3999@gmail.com',
	website:'http://www.goven.com'
}

AppView.utils = {
	checkLogin : function(page) {
		var autoLogin = AppView.utils.getStorageParam('infoAutoLogin');
		var username = AppView.utils.getStorageParam('infoUsername');
		var password = AppView.utils.getStorageParam('infoPassword');
		if(autoLogin || username) {
			$.mobile.changePage(page, { transition: "slidefade", changeHash: true});
		} else {
			$.mobile.changePage("login.html", { transition: "slidefade", changeHash: true });
		}
	},
	setParam : function (name,value) {
	    //ios上需要先remove
	    sessionStorage.removeItem(name);
		sessionStorage.setItem(name,value);
	},
	getParam : function(name){
		return sessionStorage.getItem(name);
	},
	removeParam : function(name){
	    sessionStorage.removeItem(name);
	},
	
	//增加一个本地持久化存储的接口
	setStorageParam : function (name, value){
		localStorage.removeItem(name);
		localStorage.setItem(name, value);
	},
	getStorageParam : function (name){
		return localStorage.getItem(name);
	},
	removeStorageParam : function (name){
		localStorage.removeItem(name);
	},
	isLogin : function() {
    },
    
    //用于转换的工具函数
    object2String : function(obj){
        var val, output = "";
        if(obj){
            output += "{";
            for(var i in obj){
                val = obj[i];
                switch(typeof val){
                    case ("object"):
                        if(val && val[0]){
                            output += "'" + i + "':" + AppView.utils.array2String(val) + ",";
                        }else{
                            output += "'" + i + "':" + AppView.utils.object2String(val) + ",";
                        }
                        break;
                    case ("string"):
                        output += "'" + i + "':'" + encodeURI(val) + "',";
                        break;
                    default:
                        output += i + ":" + val + ",";
                }
            }
            output = output.substring(0, output.length - 1) + "}";
        }
        return output;
    },
        
    array2String : function(array){
        var val,output = "";
        if(array){
            output += "[";
            for(var i in array){
                val = array[i];
                switch(typeof val){
                    case ("object"):
                        if(val[0]){
                            output += AppView.utils.array2String(val) + ",";
                        }else{
                            output += AppView.utils.object2String(val) + ",";
                        }
                        break;
                    case ("string"):
                        output += "'" + encodeURI(val) + "',";
                        break;
                    default:
                        output += val + ",";
                }
            }
            output = output.substring(0, output.length - 1) + "]";
        }
        return output;
    },
        
    string2Object : function(string){
        eval("var result = " + decodeURI(string));
        return result;
    },
        
    string2Array : function(string){
        eval("var result = " + decodeURI(string));
        return result;
    },
    
    getPropertyCount : function(o){
       var n, count = 0;
       for(n in o){
          if(o.hasOwnProperty(n)){
             count++;
          }
       }
       return count;
    }
}

// 业务控制中心，需应用实现
AppView.controllers = {}

// 事件注册
AppView.run = function (pages) {
	var pages = pages, 
		count = pages.length;
	for(var i=0;i<count;i++){
		var page = pages[i],
			id = page.id,
			eArray = page.event.split(',');
		for(var j=0; j < eArray.length; j++){
			var e = eArray[j];
			if($.trim(e).length == 0) continue;
			$('body').on(e, '#'+id, AppView.controllers[id][e]);
		}
	}
}