// 本地化命名空间
var utils = AppView.utils, 
	controllers = AppView.controllers,
	baseUrl = 'http://218.65.83.85:8167/huirenApp2/';
	
toastr.options = {
	"closeButton": true,
	"positionClass": "toast-bottom-full-width",
	"showDuration": "300",
	"hideDuration": "1000",
	"timeOut": "2000"
};

// 控制器业务处理中心

controllers.page_login = {

    pagecreate : function(event){
		//utils.checkLogin('orders.html');
		var autoLogin = AppView.utils.getStorageParam('infoAutoLogin');
		var username = AppView.utils.getStorageParam('infoUsername');
		var password = AppView.utils.getStorageParam('infoPassword');
		if(autoLogin && username) {
			$("#text_username").val(username),
		    $("#text_password").val(password),
			$.mobile.loading( "show", {
				text: '正在自动登录...',
				textVisible: true,
				theme: "b",
				textonly: false,
				html: ""
			});
			$.getJSON(baseUrl + "user!login?&callback=?", {"username": username, "password": password}, function(json){
				$.mobile.loading( "hide" );
				var stateCode = json.stateCode;
				if (stateCode == 0){
				  toastr.error("登录失败，" + json.message);
				} else {
				  toastr.success("登录成功！");
				  var user = json.content;
				  utils.setStorageParam('infoUserId', user.ID);
				  utils.setStorageParam('infoRoleCode', user.roleCode);
				  utils.setStorageParam('infoUsername', user.username);
				  utils.setStorageParam('infoPassword', password);
				  utils.setStorageParam('infoMobile', user.mobile);
				  utils.setStorageParam('infoEmail', user.mobile);
				  utils.setStorageParam('infoRealName', user.realName);
				  if (autoLogin == 'on') {
					  utils.setStorageParam('infoAutoLogin', true);
				  }
				  $.mobile.changePage( "orders.html", { transition: "turn", changeHash: true });
				}
			});
		}
    }
}

controllers.btn_login = {
    click : function(event){
		var username = $("#text_username").val(),
		    password = $("#text_password").val(),
		    autoLogin = $("#cbox_autoLogin").val();
		if (!username || !password) {
			//$.mobile.changePage( "orders.html", { transition: "turn", changeHash: true });
			toastr.error("用户名或者密码不能为空！");
		} else {
			var $this = $( this );
			$.mobile.loading( "show", {
				text: $this.jqmData( "msgtext" ) || $.mobile.loader.prototype.options.text,
				textVisible: $this.jqmData( "textvisible" ) || $.mobile.loader.prototype.options.textVisible,
				theme: "b",
				textonly: !!$this.jqmData( "textonly" ),
				html: ""
			});
			$.getJSON(baseUrl + "user!login?&callback=?", {"username": username, "password": password}, function(json){
				$.mobile.loading( "hide" );
				var stateCode = json.stateCode;
				if (stateCode == 0){
				  toastr.error("登录失败，" + json.message);
				} else {
				  toastr.success("登录成功！");
				  var user = json.content;
				  utils.setStorageParam('infoUserId', user.ID);
				  utils.setStorageParam('infoRoleCode', user.roleCode);
				  utils.setStorageParam('infoUsername', user.username);
				  utils.setStorageParam('infoPassword', password);
				  utils.setStorageParam('infoMobile', user.mobile);
				  utils.setStorageParam('infoEmail', user.mobile);
				  utils.setStorageParam('infoRealName', user.realName);
				  if (autoLogin == 'on') {
					  utils.setStorageParam('infoAutoLogin', true);
				  }
				  $.mobile.changePage( "orders.html", { transition: "turn", changeHash: true });
				}
			});
		}        
    }
}

// 构建客户列表模板
function bulidClientsListView(liArray, clients) {
	$.each(clients, function ( i, client ) {
		var liValue;
		if (client.isRegist) {
			liValue = '<li>' + client.realName + '<span style="padding-left:5px; font-size:12px; font-weight:500">';
			if (client.mobile) {
				liValue = liValue + '<i class="fa fa-phone"></i>' + client.mobile;
			}
			liValue = liValue + '<br/>编号：'+ client.code +'</span><p class="ui-li-aside"><br/><strong>已注册</strong></p></li>';
		} else {
			liValue = '<li><a href="#">' + client.realName + '<span style="padding-left:5px; font-size:12px; font-weight:500">';
			if (client.mobile) {
				liValue = liValue + '<i class="fa fa-phone"></i>' + client.mobile;
			}
			liValue = liValue + '<br/>编号：'+ client.code +'</span></a><a href="clientRegist.html" data-transition="flow" data-clientId="' + client.ID + '" data-clientCode="' + client.code + '" data-clientRealName="' + client.realName + '" data-clientMobile="' + client.mobile + '"></a></li>';
		}
    	liArray.push(liValue);
    });
}

controllers.page_clients = {
	pagebeforecreate : function(event){
        //每次show之前，先看看分页信息
        var clients_curr_page_no = 1, clients_total_page_num = 0;
        if (utils.getParam('clients_curr_page_no')) {
            clients_curr_page_no = utils.getParam('clients_curr_page_no');
        } else {
            utils.setParam('clients_curr_page_no', clients_curr_page_no); 
        }         
        if (utils.getParam('clients_total_page_num')) {
            clients_total_page_num = utils.getParam('clients_total_page_num');                           
        } else {
			utils.setParam('clients_total_page_num', clients_total_page_num);
			//controllers.page_clients.pageshow();
        }
    },
    
    pageshow : function(event){     
		var clients_curr_page_no = parseInt(utils.getParam('clients_curr_page_no'));
		var clients_total_page_num = parseInt(utils.getParam('clients_total_page_num'));
		$.mobile.loading( "show", {
			text: '正在加载客户列表',
			textVisible: true,
			theme: "b",
			textonly: false,
			html: ""
		});
		$.getJSON(baseUrl + 'customer!getClients?&callback=?', {userId:utils.getStorageParam('infoUserId'), pageIndex:clients_curr_page_no, pageSize:10}, function(data) {
			$.mobile.loading( "hide" );
			var liArray = ['<li data-role="list-divider">客户列表</li>'];
			var stateCode = data.stateCode;
			if (data.stateCode == 0) {
			  toastr.error(data.message);
			} else {
				if (data.message) {
					var size = parseInt(data.message);
					clients_total_page_num = size%10 == 0 ? size/10 : (size/10 + 1);
				} else {
					clients_total_page_num = 1;
				}
				utils.setParam('clients_total_page_num', clients_total_page_num);
				if (data.content && data.content.length > 0) {
					bulidClientsListView(liArray, data.content);
				} else {
					toastr.info("暂无数据！");
					liArray.push('<li>暂无客户数据！</li>');
				}
			}
			var $listview = $('#page_clients').find('ul[data-role="listview"]');
			$listview.html(liArray.join(''));
			$listview.listview('refresh')
			$listview.undelegate();
			$listview.delegate('li a', 'click', function(e) {
			  utils.setParam('clientId', $(this).jqmData("clientid"));
			  utils.setParam('clientCode', $(this).jqmData("clientcode"));
			  utils.setParam('clientRealName', $(this).jqmData("clientrealname"));
			  utils.setParam('clientMobile', $(this).jqmData("clientmobile"));
			});
			initPaging();
		}); 
		
		function initPaging() {
			$('#clients_page_count').html('')
			if(clients_curr_page_no > 1){
			//上一页
				$('#clients_page_count').append('<a data-action_page_no="' + (clients_curr_page_no - 1).toString() + '" href="#page_clients" data-shadow="true" data-iconshadow="true" data-wrapperels="span" ' + 
										'class="ui-btn ui-mini ui-btn-inline ui-btn-corner-all">' + 
										'<span class="ui-btn-inner ui-btn-corner-all"><span class="ui-btn-text">上一页</span></span></a>');                    
			}
			if(clients_curr_page_no < clients_total_page_num){
				//下一页
				$('#clients_page_count').append('<a data-action_page_no="' + (clients_curr_page_no + 1).toString() + '" href="#page_clients" data-shadow="true" data-iconshadow="true" data-wrapperels="span" ' + 
											'class="ui-btn ui-mini ui-btn-inline ui-btn-corner-all">' + 
											'<span class="ui-btn-inner ui-btn-corner-all"><span class="ui-btn-text">下一页</span></span></a>');   
			}
			$('#clients_page_count').append('&nbsp<span>页数   ' + clients_curr_page_no.toString() + ' / ' + clients_total_page_num.toString() + '<span>');
			
			var $pageView = $('#clients_page_count');
			//防止重复绑定
			$pageView.undelegate();
			$pageView.delegate('a', 'click', function(e){
				var actionPageNo = parseInt($(this).jqmData('action_page_no'));
				utils.setParam('clients_curr_page_no', actionPageNo);
				//$.mobile.changePage('index.html', {reloadPage: true},{ allowSamePageTranstion: true},{ transition: 'none'});
				//局部刷新，提高速度
				controllers.page_clients.pageshow();
			});	
		}
    }
}

controllers.page_client_regist = {
	pageshow:function(event){
		$("#text_client_code").val(utils.getParam('clientCode'));
		$("#text_client_realName").val(utils.getParam('clientRealName'));
	}
}

controllers.btn_client_regist = {
	click : function(event){
		var username = $("#text_client_username").val(),
		    password = $("#text_client_password").val(),
		    confirmPassword = $("#text_client_password_confirm").val();
		if (!username || !password) {
			toastr.error("账号名或者密码不能为空！");
		} else if (password != confirmPassword) {
			toastr.error("两次密码输入不一致，请重新输入！");
		} else {
			var $this = $( this );
			$.mobile.loading( "show", {
				text: '正在注册客户账号',
				textVisible: true,
				theme: "b",
				textonly: false,
				html: ""
			});
			$.getJSON(baseUrl + "customer!registClientAccount?&callback=?", {"userId":utils.getStorageParam('infoUserId'),"clientId":utils.getParam('clientId'), "username": username, "password": password}, function(json){
				$.mobile.loading( "hide" );
				var stateCode = json.stateCode;
				if (stateCode == 0){
				  toastr.error("注册失败，" + json.message);
				} else {
				  toastr.success("注册成功！");
				  window.history.back();
				}
			});
		}
	}
}

// 构建订单列表模板
function bulidOrdersListView(liArray, orders) {
	$.each(orders, function ( i, order ) {
		var liValue;
		liValue = '<li><a href="orderDetail.html" data-transition="slidefade"'
			+' data-orderCode="'+ order.code
			+'" data-orderCreateTime="'+ order.createTime
			+'" data-orderType="'+ order.type
			+'" data-orderStatus="'+ order.status
			+'" data-orderDeliverWay="'+ order.deliverWay
			+'" data-orderTicketStatus="'+ order.ticketStatus
			+'" data-orderTicketNo="'+ order.ticketNo
			+'" data-orderAgencyNo="'+ order.FConsignNumber
			+'" data-orderLongitude="'+ order.longitude
			+'" data-orderLatitude="'+ order.latitude
			+'" data-orderAddreess="'+ order.addreess
			+'" data-orderUpdateTime="'+ order.updateTime
			+'"><br/>'+ '订单编号：'+ order.code +'<p>订单类型：'+ order.type +'</p><span class="ui-li-count">'+ order.status +'</span><p class="ui-li-aside">'+ order.createTime +'</p></a></li>';
    	liArray.push(liValue);
    });
}

controllers.page_orders = {
	pagebeforecreate : function(event){
        //每次show之前，先看看分页信息
        var orders_curr_page_no = 1, orders_total_page_num = 0;
        if (utils.getParam('orders_curr_page_no')) {
            orders_curr_page_no = utils.getParam('orders_curr_page_no');
        } else {
            utils.setParam('orders_curr_page_no', orders_curr_page_no); 
        }         
        if (utils.getParam('orders_total_page_num')) {
            orders_total_page_num = utils.getParam('orders_total_page_num');                           
        } else {
			utils.setParam('orders_total_page_num', orders_total_page_num);
			//controllers.page_orders.pageshow();
        }
    },
    
    pageshow : function(event){
		var orders_curr_page_no = parseInt(utils.getParam('orders_curr_page_no'));
		var orders_total_page_num = parseInt(utils.getParam('orders_total_page_num'));
		$.mobile.loading( "show", {
			text: '正在获取订单',
			textVisible: true,
			theme: "b",
			textonly: false,
			html: ""
		});
		$.getJSON(baseUrl + "saleOrder!getOrdersOfUser?&callback=?", {"userId":utils.getStorageParam('infoUserId'), "pageIndex":orders_curr_page_no, "pageSize":10}, function(data) {
			$.mobile.loading( "hide" );
			var liArray = ['<li data-role="list-divider">订单列表</li>'];
			var stateCode = data.stateCode;
			if (data.stateCode == 0) {
				if (parseInt(data.message)) {
					toastr.info(data.message);
				} else {
					toastr.info("暂无数据！");
				}
			} else {
				if (data.message) {
					var size = parseInt(data.message);
					orders_total_page_num = size%10 == 0 ? size/10 : (size/10 + 1);
				} else {
					orders_total_page_num = 1;
				}
				utils.setParam('orders_total_page_num', orders_total_page_num);
				if (data.content && data.content.length > 0) {
					bulidOrdersListView(liArray, data.content);
				} else {
					toastr.info("暂无数据！");
					liArray.push('<li>暂无订单数据！</li>');
				}
			}
			var $listview = $('#page_orders').find('ul[data-role="listview"]');
			$listview.html(liArray.join(''));
			$listview.listview('refresh');
			$listview.undelegate();
			$listview.delegate('li a', 'click', function(e) {
			  utils.setParam('orderCode', $(this).jqmData("ordercode"));
			  utils.setParam('orderCreateTime', $(this).jqmData("ordercreatetime"));
			  utils.setParam('orderType', $(this).jqmData("ordertype"));
			  utils.setParam('orderStatus', $(this).jqmData("orderstatus"));
			  utils.setParam('orderDeliverWay', $(this).jqmData("orderdeliverway"));
			  utils.setParam('orderTicketStatus', $(this).jqmData("orderticketstatus"));
			  utils.setParam('orderTicketNo', $(this).jqmData("orderticketno"));
			  utils.setParam('orderAgencyNo', $(this).jqmData("orderagencyno"));
			  utils.setParam('orderLongitude', $(this).jqmData("orderlongitude"));
			  utils.setParam('orderLatitude', $(this).jqmData("orderlatitude"));
			  utils.setParam('orderAddreess', $(this).jqmData("orderaddreess"));
			  utils.setParam('orderUpdateTime', $(this).jqmData("orderupdatetime"));
			});
			initPaging();
		});
		
		// 分页
		function initPaging() {
			$('#orders_page_count').html('')
			if(orders_curr_page_no > 1){
				//上一页
				$('#orders_page_count').append('<a data-action_page_no="' + (orders_curr_page_no - 1).toString() + '" href="#page_orders" data-shadow="true" data-iconshadow="true" data-wrapperels="span" ' + 
											'class="ui-btn ui-mini ui-btn-inline ui-btn-corner-all">' + 
											'<span class="ui-btn-inner ui-btn-corner-all"><span class="ui-btn-text">上一页</span></span></a>');                    
			}
			if(orders_curr_page_no < orders_total_page_num){
				//下一页
				$('#orders_page_count').append('<a data-action_page_no="' + (orders_curr_page_no + 1).toString() + '" href="#page_orders" data-shadow="true" data-iconshadow="true" data-wrapperels="span" ' + 
											'class="ui-btn ui-mini ui-btn-inline ui-btn-corner-all">' + 
											'<span class="ui-btn-inner ui-btn-corner-all"><span class="ui-btn-text">下一页</span></span></a>');   
			}
			
			$('#orders_page_count').append('&nbsp&nbsp<span>页数   ' + orders_curr_page_no.toString() + ' / ' + orders_total_page_num.toString() + '<span>');
			
			var pageView = $('#orders_page_count');
			//防止重复绑定
			pageView.undelegate();
			pageView.delegate('a', 'click', function(e){
				var actionPageNo = parseInt($(this).jqmData('action_page_no'));
				utils.setParam('orders_curr_page_no', actionPageNo);
				//$.mobile.changePage('index.html', {reloadPage: true},{ allowSamePageTranstion: true},{ transition: 'none'});
				//局部刷新，提高速度
				controllers.page_orders.pageshow();
			});
		}
    }
}

controllers.page_order_detail = {

    pageshow : function(event){
		$("#td_order_code").text(utils.getParam('orderCode'));
		$("#td_order_type").text(utils.getParam('orderType'));
		$("#td_order_ticketStatus").text(utils.getParam('orderTicketStatus'));
		$("#td_order_status").text(utils.getParam('orderStatus'));
		$("#td_order_deliverWay").text(utils.getParam('orderDeliverWay'));
		$("#td_order_ticketNo").text(utils.getParam('orderTicketNo'));
		$("#td_order_agencyNo").text(utils.getParam('orderAgencyNo'));
		$("#td_order_createTime").text(utils.getParam('orderCreateTime'));
		$("#td_order_addreess").text(utils.getParam('orderAddreess'));
		$.mobile.loading( "show", {
			text: '正在加载订单详情',
			textVisible: true,
			theme: "b",
			textonly: false,
			html: ""
		});
		$.getJSON(baseUrl + "saleOrder!getOrderDetail?&callback=?", {"orderCode":'02695273'}, function(data){
			$.mobile.loading( "hide" );
			var stateCode = data.stateCode;
			if (stateCode == 0){
				toastr.error("没有订单详情信息，" + data.message);
			} else {
				var liArray = [];
				bulidOrderDetail(liArray, data.content);
				$("table#table_order_detail").append(liArray.join(''));
			}
		});
    }
}

// 构建订单列表模板
function bulidOrderDetail(liArray, products) {
	$.each(products, function (i, product) {
		var liValue;
		liValue= '<tr><th class="specalt">物料名称</th><td id="td_product_materialName" class="alt" colspan="3">' + product.materialName + '</td></tr>'
				+'<tr><th class="spec">物料单位</th><td id="td_product_materialUnit">' + product.materialUnit + '</td><th class="spec">产地</th><td id="td_product_origin">' + product.origin + '</td></tr>'
				+'<tr><th class="spec">失效日期</th><td id="td_product_invalidate" colspan="3">' + product.invalidate + '</td></tr>'
				+'<tr><th class="spec">规格型号</th><td id="td_product_normsType" colspan="3">' + product.normsType + '</td></tr>'
				+'<tr><th class="spec">单价</th><td id="td_product_price">' + product.price + '/' + product.unit + '</td><th class="spec">数量</th><td id="td_product_count">' + product.count + '</td></tr>'
				+'<tr><th class="spec">总金额</th><td id="td_product_sum">' + product.sum + '</td><th class="spec">批号</th><td id="td_product_batchNo">' + product.batchNo + '</td></tr>' + '<tr><th class="blank"></th><td class="blank" colspan="3"></td></tr>';
    	liArray.push(liValue);
    });
}

controllers.page_order_location = {

    pageshow : function(event){	
		var longitude = utils.getParam('orderLongitude');
		var latitude = utils.getParam('orderLatitude');
		if (!longitude || !latitude) {
			showMap(longitude, latitude, true);
		} else {
			toastr.info("此订单暂无物流信息！");
			showMap(115.89, 28.68, false);
		}
		function showMap(longitude, latitude, showIcon) {
			var map = new BMap.Map("div_order_location");//在百度地图容器中创建一个地图
			var point = new BMap.Point(longitude, latitude);      
			map.centerAndZoom(point, 12);
			map.enableScrollWheelZoom();
			map.addControl(new BMap.NavigationControl());  
			map.addControl(new BMap.ScaleControl());  
			map.addControl(new BMap.OverviewMapControl());
			
			if (showIcon) {
				var myIcon = new BMap.Icon("http://api.map.baidu.com/mapCard/img/location.gif",   
				new BMap.Size(14, 23), {      
					// 指定定位位置,当标注显示在地图上时，其所指向的地理位置距离图标左上角各偏移7像素和25像素。您可以看到在本例中该位置即是图标中央下端的尖角位置。      
					anchor: new BMap.Size(7, 25),      
				});        
				// 创建标注对象并添加到地图     
				var marker = new BMap.Marker(point, {icon: myIcon});      
				map.addOverlay(marker); 
			} 
		}
    }
}

controllers.page_setting = {

    pagecreate : function(event){
		var $pUser = $('#page_setting').find('p[id="p_user"]');
		var $btnLogin = $('#page_setting').find('a[id="btn_setting_login"]');
		var useId = utils.getStorageParam('infoUserId');
		var realName = utils.getStorageParam('infoRealName');
		if (useId) {
			$pUser.text(realName + ',您好！');
			$btnLogin.text('注销');
		} else {
			$pUser.text('您当前未登录，请先登录！');
			$btnLogin.text('登录');
		}
		var $listview = $('#page_setting').find('ul[data-role="listview"]');
		//防止重复绑定
		$listview.undelegate();
		$listview.delegate('#btn_setting_login', 'click', function(e){
			utils.removeStorageParam('infoUserId');
			utils.removeStorageParam('infoRoleCode');
			utils.removeStorageParam('infoUsername');
			utils.removeStorageParam('infoPassword');
			utils.removeStorageParam('infoMobile');
			utils.removeStorageParam('infoEmail');
			utils.removeStorageParam('infoRealName');
			utils.removeStorageParam('infoAutoLogin');
			$.mobile.changePage( "login.html", { transition: "turn"});
		});
    }
}

var pages = [
	{id:'page_login', event:'pagecreate'},
	{id:'btn_login', event:'click'},
	{id:'page_clients', event:'pagebeforecreate,pageshow'},
	{id:'page_client_regist', event:'pageshow'},
	{id:'btn_client_regist', event:'click'},
	{id:'page_orders', event:'pagebeforecreate,pageshow'},
	{id:'page_order_detail', event:'pageshow'},
	{id:'page_order_location', event:'pageshow'},
	{id:'page_setting', event:'pagecreate'}
];
AppView.run(pages);