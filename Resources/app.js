Titanium.UI.setBackgroundColor('#000');

// create tab group
var tabGroup = Titanium.UI.createTabGroup();

Ti.include("runkeeper.config.js");

//
// create base UI tab and root window
//
var win1 = Titanium.UI.createWindow({
	title : 'Tab 1',
	backgroundColor : '#fff'
});
var tab1 = Titanium.UI.createTab({
	icon : 'KS_nav_views.png',
	title : 'Tab 1',
	window : win1
});

var b1 = Titanium.UI.createButton({
	title : 'RunKeeper Login',
	top : 40,
	width : 200,
	height : 50
});

win1.add(b1);

b1.addEventListener('click', function() {
	var actInd = Titanium.UI.createActivityIndicator();

	//actInd.setStyle(Titanium.UI.iPhone.ActivityIndicatorStyle.BIG);

	var win = Titanium.UI.createWindow({
		backButtonTitle : L('back'),
		backgroundColor : '#13386c',
		barColor : '#336699',
		//translucent : true,
	});
	var authorizationurl = authorization_url + "?" + "response_type=" + response_type + "&client_id=" + client_id + "&redirect_uri=" + redirect_uri;

	var webview = Titanium.UI.createWebView({
		url : authorizationurl,
		width : '100%',
		height : '100%',
	});

	win.add(webview);
	//win.setRightNavButton(actInd);
	actInd.show();

	tabGroup.activeTab.open(win, {
		animated : true
	});

	webview.addEventListener("load", function(e) {

		//actInd.hide();

		Ti.API.info("webview loaded: " + e.url);

		var regex = new RegExp("code=");
		if (regex.test(e.url) == true) {

			Ti.API.info("RegEx: " + e.url);

			var accessCode = e.url.substr(e.url.length - 32, e.url.length);
			Ti.API.info('accessCode= ' + accessCode);

			var actInd = Titanium.UI.createActivityIndicator();
			actInd.setMessage("loading...");
			actInd.setColor('black');
			actInd.setStyle(Titanium.UI.iPhone.ActivityIndicatorStyle.BIG)
			actInd.setStyle(Titanium.UI.iPhone.ActivityIndicatorStyle.DARK)
			win.add(actInd);
			actInd.show();

			var code = accessCode;
			var encodedURI = encodeURI(access_token_url);

			var xhr = Titanium.Network.createHTTPClient();

			xhr.onload = function(e) {
				if (this.status == '200') {

					parsedData = eval('(' + this.responseText + ')');

					Ti.API.info('token= ' + parsedData.access_token);

					Titanium.App.Properties.setString("runkeeper_token", parsedData.access_token);
					win.close();
					alert('You have successfully connected with RunKeeper!');
				}

			};
			xhr.onerror = function(e) {

				alert('Transmission error: ' + e.error + this.responseText);
			};
			var params = {
				grant_type : grant_type,
				code : code,
				client_id : client_id,
				client_secret : client_secret,
				redirect_uri : redirect_uri,

			};

			xhr.open('POST', encodedURI);
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			xhr.send(params);
			Ti.API.info(params);

		}

		var regex1 = new RegExp("error=access_denied");
		if (regex1.test(e.url) == true) {
			alert('The access was denied! ');

			win.close();

		}

	});

});
//

var b2 = Titanium.UI.createButton({
	title : 'Entry of Calories',
	bottom : 40,
	width : 200,
	height : 50
});

win1.add(b2);

b2.addEventListener('click', function() {

	if (!Titanium.App.Properties.getString("runkeeper_token") || (Titanium.App.Properties.getString("runkeeper_token") == "")) {
		alert('Connect To RunKeeper first !');

	} else {

		var timenow = new Date();
		var weekday = new Array(7);
		weekday[0] = "Sun";
		weekday[1] = "Mon";
		weekday[2] = "Tue";
		weekday[3] = "Wed";
		weekday[4] = "Thu";
		weekday[5] = "Fri";
		weekday[6] = "Sat";

		var n = weekday[timenow.getDay()];

		var month = new Array();
		month[0] = "January";
		month[1] = "February";
		month[2] = "March";
		month[3] = "April";
		month[4] = "May";
		month[5] = "June";
		month[6] = "July";
		month[7] = "August";
		month[8] = "September";
		month[9] = "October";
		month[10] = "November";
		month[11] = "December";
		var m = month[timenow.getMonth()];

		//var generalformat = datenowformated + ' ' + timenowformated;
		var generalformat = n + ", " + timenow.getDate() + ' ' + m + ' ' + timenow.getFullYear() + ' ' + timenow.getHours() + ":" + timenow.getMinutes() + ":" + timenow.getSeconds();

		var encodedURI = encodeURI(base_url + '/nutrition');

		var xhr = Titanium.Network.createHTTPClient();

		xhr.onload = function(e) {
			alert('Calories successful sent to RunKeeper!');

		};
		xhr.onerror = function(e) {

			//	Ti.API.info('transmission error: ' + e.error + this.responseText);

			alert('Transmission error: ' + e.error + this.responseText);
		};
		Ti.API.info('date= ' + generalformat);

		var params = {
			//timestamp : 'Sun, 12 May 2013 00:02:00',
			timestamp : generalformat,
			calories : 300,

		};

		xhr.open('POST', encodedURI);
		xhr.setRequestHeader("Authorization", "Bearer " + Titanium.App.Properties.getString("runkeeper_token"));
		xhr.setRequestHeader("Content-Type", "application/vnd.com.runkeeper.NewNutritionSet+json");

		xhr.send(JSON.stringify(params));
		Ti.API.info(params);

	}

});

tabGroup.addTab(tab1);

// open tab group
tabGroup.open();
