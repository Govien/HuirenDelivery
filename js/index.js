var baseUrl = 'http://www.kaoyaya.com/app/';

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');
		window.location = 'login.html';
    },
	// 弹窗提示APP升级
	showUpdateDialog: function(result) {
		var stateCode = result.stateCode;
        var version = result.content;
		if (stateCode) {
			navigator.notification.confirm(
				version.memo + '\n是否现在更新？', // message
				onConfirm,          // callback to invoke with index of button pressed
				'发现新版本 V' + version.versionCode,           // title
				['更新','取消']         // buttonLabels
			);
		} else {
			window.location = 'http://m.kaoyaya.com/index1.php';
		}

		function onConfirm(buttonIndex) {
			if (version && buttonIndex == 1) {
				window.open(version.updateUrl, "_system");
			} else {
				window.location = 'http://m.kaoyaya.com/index1.php';
			}
		};
	}
};



function localFile() {
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){
	//创建目录
	fileSystem.root.getDirectory("Kaoyaya_ExamOline", {create:true}, function(fileEntry){ }, function(){console.log("创建目录失败");});
	
	var _localFile = "Kaoyaya_ExamOline/bitcare.apk";
	var _url = "http://59.63.158.22:8822/file/bitcare_2.0.6675.apk";
	 
	fileSystem.root.getFile(_localFile, {create:true}, function(fileEntry){  
			var targetURL = fileEntry.toURL();  
			downloadPic(_url,targetURL);   
		},	function(){  
			alert('下载出错');  
		});   
	});   
}

function downloadPic(sourceUrl,targetUrl){
	var fileTransfer = new FileTransfer();
	var uri = encodeURI(sourceUrl);
	
	fileTransfer.download(uri,targetUrl,function(entry){
			alert('下载成功！');
		},function(error){  
			console.log("下载网络图片出现错误");  
		});    
}