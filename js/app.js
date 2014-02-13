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

controllers.page_loading = {

    pagecreate : function(event){
		//utils.checkLogin('orders.html');
		var autoLogin = AppView.utils.getStorageParam('infoAutoLogin');
		var username = AppView.utils.getStorageParam('infoUsername');
		var password = AppView.utils.getStorageParam('infoPassword');
		if(autoLogin || username) {
			$.mobile.changePage('orders.html', { transition: "slidefade", changeHash: true});
		} else {
			$.mobile.changePage("login.html", { transition: "slidefade", changeHash: true });
		}
    }
}

controllers.btn_login = {
    click : function(event){
		var username = $("#text_username").val(),
		    password = $("#text_password").val(),
		    autoLogin = $("#cbox_autoLogin").val();
		if (!username || !password) {
			$.mobile.changePage( "orders.html", { transition: "turn", changeHash: true });
			//toastr.error("用户名或者密码不能为空！");
		} else {
			var $this = $( this );
			$.mobile.loading( "show", {
				text: $this.jqmData( "msgtext" ) || $.mobile.loader.prototype.options.text,
				textVisible: $this.jqmData( "textvisible" ) || $.mobile.loader.prototype.options.textVisible,
				theme: "b",
				textonly: !!$this.jqmData( "textonly" ),
				html: $this.jqmData( "html" ) || ""
			});
			$.getJSON(baseUrl + "user!login?&callbak=?", {"username": username, "password": password}, function(json){
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
				  if (autoLogin == 'On') {
					  utils.setStorageParam('infoAutoLogin', true);
				  }
				  $.mobile.changePage( "orders.html", { transition: "turn", changeHash: true });
				}
			});
			/**
			$.ajax({
				url: '/api/mobile/login',
				data: requestJson,
				type: "post",
				dataType: "json",
				contentType: "application/json; charset=utf8",
				success: function (data) {
					jQuery.each(data, function (i, val) {
						$("#result").append(val.Title + '： ' + val.Uri +'<br/>');
					});
				}
			});
			**/
		}        
    }
}

// 构建客户列表模板
function bulidClientsListView(liArray, clients) {
	$.each(clients, function ( i, client ) {
		var liValue;
		if (client.isRegist) {
			li = '<li>' + client.realName + '<span style="padding-left:5px; font-size:12px; font-weight:500"><i class="fa fa-phone"></i>' + client.mobile + '<br/>编号：'+ client.code +'</span><p class="ui-li-aside"><br/><strong>已注册</strong></p></li>';
		} else {
			li = '<li><a>' + client.realName + '<span style="padding-left:5px; font-size:12px; font-weight:500"><i class="fa fa-phone"></i>' + client.mobile + '<br/>编号：'+ client.code +'</span></a><a href="#page_client_regist" data-transition="flow" data-clientId="' + client.ID + '" data-clientCode="' + client.code + '" data-clientRealName="' + client.realName + '" data-clientMobile="' + client.mobile + '"></a></li>';
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
			var clients_curr_page_no = utils.getParam('clients_curr_page_no');
			var clients_total_page_num = utils.getParam('clients_total_page_num');
			$.mobile.loading( "show", {
				text: '正在加载客户列表',
				textVisible: true,
				theme: "b",
				textonly: false,
				html: $this.jqmData( "html" ) || ""
			});
			$.getJSON(baseUrl + '/getClients?&callback=?', {userId:utils.getStorageParam('infoUserId'), pageIndex:clients_curr_page_no, pageSize:10}, function(data) {
				$.mobile.loading( "hide" );
				var liArray = ['<li data-role="list-divider">客户列表</li>'];
				var stateCode = data.stateCode;
				if (data.stateCode == 0) {
				  toastr.error(data.message);
				} else {
				  clients_total_page_num = parseInt(data.message);
				  utils.setParam('clients_total_page_num', clients_total_page_num);
				  bulidClientsListView(liArray, data.content);
				}
				var $listview = $('#page_clients').find('ul[data-role="listview"]');
				$listview.html(liArray.join(''));
				$listview.listview('refresh')
				$listview.undelegate();
				$listview.delegate('li a', 'click', function(e) {
				  utils.setParam('clientId', $(this).jqmData("clientId"));
				  utils.setParam('clientCode', $(this).jqmData("clientCode"));
				  utils.setParam('clientRealName', $(this).jqmData("clientRealName"));
				  utils.setParam('clientMobile', $(this).jqmData("clientMobile"));
				});
			});       
			//下面为了避免重新刷新，写的代码很丑
			$('#clients_page_count').html('')
			if(clients_curr_page_no > 1){
				//上一页
				$('#clients_page_count').append('<a data-inline="true" data-corners="true" data-action_page_no="' + (clients_page_count - 1).toString() + 
											'" data-role="button" href="#page_clients" data-shadow="true" data-iconshadow="true" data-wrapperels="span" ' + 
											'data-theme="c" class="ui-btn ui-btn-inline ui-shadow ui-btn-corner-all ui-btn-up-c">' + 
											'<span class="ui-btn-inner ui-btn-corner-all"><span class="ui-btn-text">上一页</span></span></a>');                    
			}
			if(clients_curr_page_no < clients_total_page_num){
				//下一页
				$('#clients_page_count').append('<a data-inline="true" data-corners="true" data-action_page_no="' + (clients_curr_page_no + 1).toString() + 
											'" data-role="button" href="#page_clients" data-shadow="true" data-iconshadow="true" data-wrapperels="span" ' + 
											'data-theme="c" class="ui-btn ui-btn-inline ui-shadow ui-btn-corner-all ui-btn-up-c">' + 
											'<span class="ui-btn-inner ui-btn-corner-all"><span class="ui-btn-text">下一页</span></span></a>');    
			} 
			
			$('#clients_page_count').append('&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<span>页数   ' + clients_curr_page_no.toString() + ' / ' + clients_total_page_num.toString() + '<span>');
			
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
				html: $this.jqmData( "html" ) || ""
			});
			$.getJSON(baseUrl + "registClientAccount?&callbak=?", {"userId":utils.getStorageParam('infoUserId'),"clientId":utils.getParam('clientId'), "username": username, "password": password}, function(json){
				$.mobile.loading( "hide" );
				var stateCode = json.stateCode;
				if (stateCode == 0){
				  toastr.error("注册失败，" + json.message);
				} else {
				  toastr.success("注册成功！");
				  $.mobile.changePage( "clients.html");
				}
				window.history.back();
			});
		}
	}
}

// 构建订单列表模板
function bulidOrdersListView(liArray, orders) {
	$.each(orders, function ( i, order ) {
		var liValue;
		li = '<li><a href="#page_order_detail"'
			+' data-orderId='+ order.ID
			+' data-orderCode='+ order.code
			+' data-orderCreateTime='+ order.createTime
			+' data-orderType='+ order.type
			+' data-orderCount='+ order.count
			+' data-orderStatus='+ order.status
			+' data-orderDeliverWay='+ order.deliverWay
			+' data-orderTicketStatus='+ order.ticketStatus
			+' data-orderTicketNo='+ order.ticketNo
			+' data-orderAgencyNo='+ order.agencyNo
			+' data-orderInvalidate='+ order.invalidate
			+' data-orderMaterialName='+ order.materialName
			+' data-orderMaterialUnit='+ order.materialUnit
			+' data-orderOrigin='+ order.origin
			+' data-orderNormsType='+ order.normsType
			+' data-orderPrice='+ order.price
			+' data-orderUnit='+ order.unit
			+' data-orderSum='+ order.sum
			+' data-orderBatchNo='+ order.batchNo
			+'><br/>'+ order.materialName +'<p>订单编号：'+ order.code +'</p><p>订单金额：'+ order.sum + order.unit +'</p><span class="ui-li-count">'+ order.status +'</span><p class="ui-li-aside">'+ order.createTime +'</p></a></li>';
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
		var orders_curr_page_no = utils.getParam('orders_curr_page_no');
		var orders_total_page_num = utils.getParam('orders_total_page_num');
		$.mobile.loading( "show", {
			text: '正在获取订单',
			textVisible: true,
			theme: "b",
			textonly: false,
			html: $this.jqmData( "html" ) || ""
		});
		$.getJSON(baseUrl + '/getOrdersOfUser?&callback=?', {userId:utils.getStorageParam('infoUserId'), pageIndex:orders_curr_page_no, pageSize:10}, function(data) {
			$.mobile.loading( "hide" );
			var liArray = ['<li data-role="list-divider">订单列表</li>'];
			var stateCode = data.stateCode;
			if (data.stateCode == 0) {
			  toastr.error(data.message);
			} else {
			  orders_total_page_num = parseInt(data.message);
			  utils.setParam('orders_total_page_num', orders_total_page_num);
			  bulidOrdersListView(liArray, data.content);
			}
			var $listview = $('#page_orders').find('ul[data-role="listview"]');
			$listview.html(liArray.join(''));
			$listview.listview('refresh')
			$listview.undelegate();
			$listview.delegate('li a', 'click', function(e) {
			  utils.setParam('orderId', $(this).jqmData("orderId"));
			  utils.setParam('orderCode', $(this).jqmData("orderCode"));
			  utils.setParam('orderCreateTime', $(this).jqmData("orderCreateTime"));
			  utils.setParam('orderType', $(this).jqmData("orderType"));
			  utils.setParam('orderCount', $(this).jqmData("orderCount"));
			  utils.setParam('orderStatus', $(this).jqmData("orderStatus"));
			  utils.setParam('orderDeliverWay', $(this).jqmData("orderDeliverWay"));
			  utils.setParam('orderTicketStatus', $(this).jqmData("orderTicketStatus"));
			  utils.setParam('orderTicketNo', $(this).jqmData("orderTicketNo"));
			  utils.setParam('orderAgencyNo', $(this).jqmData("orderAgencyNo"));
			  utils.setParam('orderInvalidate', $(this).jqmData("orderInvalidate"));
			  utils.setParam('orderMaterialName', $(this).jqmData("orderMaterialName"));
			  utils.setParam('orderMaterialUnit', $(this).jqmData("orderMaterialUnit"));
			  utils.setParam('orderOrigin', $(this).jqmData("orderOrigin"));
			  utils.setParam('orderNormsType', $(this).jqmData("orderNormsType"));
			  utils.setParam('orderPrice', $(this).jqmData("orderPrice"));
			  utils.setParam('orderUnit', $(this).jqmData("orderUnit"));
			  utils.setParam('orderSum', $(this).jqmData("orderSum"));
			  utils.setParam('orderBatchNo', $(this).jqmData("orderBatchNo"));
			});
		});
		     
		//下面为了避免重新刷新，写的代码很丑
		$('#orders_page_count').html('')
		if(orders_curr_page_no > 1){
			//上一页
			$('#orders_page_count').append('<a data-inline="true" data-corners="true" data-action_page_no="' + (orders_page_count - 1).toString() + 
										'" data-role="button" href="#page_orders" data-shadow="true" data-iconshadow="true" data-wrapperels="span" ' + 
										'data-theme="c" class="ui-btn ui-btn-inline ui-shadow ui-btn-corner-all ui-btn-up-c">' + 
										'<span class="ui-btn-inner ui-btn-corner-all"><span class="ui-btn-text">上一页</span></span></a>');                    
		}
		if(orders_curr_page_no < orders_total_page_num){
			//下一页
			$('#orders_page_count').append('<a data-inline="true" data-corners="true" data-action_page_no="' + (orders_curr_page_no + 1).toString() + 
										'" data-role="button" href="#page_orders" data-shadow="true" data-iconshadow="true" data-wrapperels="span" ' + 
										'data-theme="c" class="ui-btn ui-btn-inline ui-shadow ui-btn-corner-all ui-btn-up-c">' + 
										'<span class="ui-btn-inner ui-btn-corner-all"><span class="ui-btn-text">下一页</span></span></a>');    
		} 
		
		$('#orders_page_count').append('&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<span>页数   ' + orders_curr_page_no.toString() + ' / ' + orders_total_page_num.toString() + '<span>');
		
		var $pageView = $('#orders_page_count');
		//防止重复绑定
		$pageView.undelegate();
		$pageView.delegate('a', 'click', function(e){
			var actionPageNo = parseInt($(this).jqmData('action_page_no'));
			utils.setParam('orders_curr_page_no', actionPageNo);
			//$.mobile.changePage('index.html', {reloadPage: true},{ allowSamePageTranstion: true},{ transition: 'none'});
			//局部刷新，提高速度
			controllers.page_orders.pageshow();
		});
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
		$("#td_order_invalidate").text(utils.getParam('orderInvalidate'));
		$("#td_order_materialName").text(utils.getParam('orderMaterialName'));
		$("#td_order_origin").text(utils.getParam('orderOrigin'));
		$("#td_order_count").text(utils.getParam('orderCount'));
		$("#td_order_batchNo").text(utils.getParam('orderBatchNo'));
		$("#td_order_price").text(utils.getParam('orderPrice') + '/' + utils.getParam('orderUnit'));
		$("#td_order_sum").text(utils.getParam('orderSum'));
		$("#td_order_normsType").text(utils.getParam('orderNormsType'));
    }
}

controllers.page_order_location = {

    pageshow : function(event){	
		$.mobile.loading( "show", {
			text: '正在获取物流信息',
			textVisible: true,
			theme: "b",
			textonly: false,
			html: $this.jqmData( "html" ) || ""
		});
		$.getJSON(baseUrl + "getOrderDelivery?&callbak=?", {"orderId":utils.getParam('orderId')}, function(json){
			$.mobile.loading( "hide" );
			var stateCode = json.stateCode;
			if (stateCode == 0){
			  toastr.error("没有物流信息，" + json.message);
			} else {
				showMap(json.content);
			}
		});
		
		function showMap(delivery) {
			var map = new BMap.Map("div_order_location");//在百度地图容器中创建一个地图
			var point = new BMap.Point(delivery.longitude, delivery.latitude);      
			map.centerAndZoom(point, 15);
			map.enableScrollWheelZoom();
			map.addControl(new BMap.NavigationControl());  
			map.addControl(new BMap.ScaleControl());  
			map.addControl(new BMap.OverviewMapControl());
			
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

var pages = [
	{id:'page_loading', event:'pagecreate'},
	{id:'btn_login', event:'click'},
	{id:'page_clients', event:'pagebeforecreate,pageshow'},
	{id:'page_client_regist', event:'pageshow'},
	{id:'btn_client_regist', event:'click'},
	{id:'page_orders', event:'pagebeforecreate,pageshow'},
	{id:'page_order_detail', event:'pageshow'},
	{id:'page_order_location', event:'pageshow'}
];
AppView.run(pages);