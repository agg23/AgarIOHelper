var mainjs;
var botjs;

var xName;
var yName;

var objectArrayName;
var playerArrayName;
var playerIDArrayName;

var botURL = chrome.extension.getURL("bot.js");
var cssURL = chrome.extension.getURL("css.css");

chrome.browserAction.onClicked.addListener( function() {
	if(mainjs == null || mainjs == "") {
		console.log("No script to load");
		return;
	}
	//chrome.tabs.executeScript({file: "jquery.min.js"});
	chrome.tabs.executeScript(null, {code: "var script = document.createElement('script');\
	var code = document.createTextNode(\""+ escapeCode(mainjs) +"\");\
	script.appendChild(code);\
	(document.body || document.head).appendChild(script);\
	console.log(\"Injecting\");\
	var botScript = document.createElement('script');\
	var botCode = document.createTextNode(\""+ escapeCode(botjs) +"\");\
	botScript.appendChild(botCode);\
	(document.body || document.head).appendChild(botScript);\
	var css = document.createElement('link');\
	css.setAttribute(\"href\", \"" + cssURL + "\");\
	css.setAttribute(\"rel\", \"stylesheet\");\
	css.setAttribute(\"type\", \"text/css\");\
	(document.body || document.head).appendChild(css);\
	"});
});

updateFilters(["*://agar.io/main_out.*"]);

$.ajax({
	url: 'http://agar.io/main_out.js',
	converters: {
		'text script': function (text) {
			return text;
		}
	},
	success: function (js_code) {
		mainjs = js_code;
		modifyScript(js_code);
	}
});

/* -- Filtering URLs -- */

function blockRequest(details) {
	if(details.type == "xmlhttprequest") {
		return {cancel: false};
	}
	console.log("Blocking");
	return {cancel: true};
}

function updateFilters(urls) {
	if(chrome.webRequest.onBeforeRequest.hasListener(blockRequest))
		chrome.webRequest.onBeforeRequest.removeListener(blockRequest);
	chrome.webRequest.onBeforeRequest.addListener(blockRequest, {urls: urls}, ['blocking']);
}

/* -- Modifying Main Script */

function modifyScript(script) {
	//mainjs.replace(/\(function\(h, r\) \{/, "");

	var regExtractWindow = /\(function\((.),.\)\{/;
	var regExtractJquery = /\(function\(.,(.)\)\{/;

	var windowName = regExtractWindow.exec(script)[1];
	var jqueryName = regExtractJquery.exec(script)[1];

	var regExtractObjectArray = /(.)\[.\]==this/;
	var regExtractPlayerArray = /(.)\[.\]\.updatePos\(\)/;
	var regExtractPlayerIDArray = /(.)\.indexOf\(this\.id\)/;

	objectArrayName = regExtractObjectArray.exec(script)[1];
	playerArrayName = regExtractPlayerArray.exec(script)[1];
	playerIDArrayName = regExtractPlayerIDArray.exec(script)[1];

	console.log("ObjectArray: " + objectArrayName);
	console.log("PlayerArray: " + playerArrayName);
	console.log("PlayerIDArray: " + playerIDArrayName);

	var regRemoveFunction = /(\(function\(.,.\)\{)/;
	var regRemoveFunctionEnd = /\}\)\(window,jQuery\);/;
	var regDollar = /(\$)/g;

	script = script.replace(regRemoveFunction, "");
	script = script.replace(regRemoveFunctionEnd, "");
	script = script.replace(regDollar, "dollar");

	var regExtractShowMass = /setShowMass\=function\(a\)\{(.{1,3})\=.\}/;
	var showMassName = regExtractShowMass.exec(script)[1];

	var regShowMassModifier = /\&\&\(.\|\|0\=\=.\.length\&\&\(!this.isVirus\|\|this.isAgitated\)\&\&20<this.size\)/;

	/*var regZoomReplace = /k\=\(9\*k\+a\)\/10/;

	script = script.replace(regZoomReplace, "k = (9 * k + a) / 11");*/

	script = script.replace(regShowMassModifier, "&&this.size>=20");

	var regColorReplace = /(.\.color=.)/;
	script = script.replace(regColorReplace, "n");

	xName = getVariable("clientX", "onmousemove");
	yName = getVariable("clientY", "onmousemove");

	var custom = "var " + windowName + " = window; var " + jqueryName + " = jQuery;";

	mainjs = custom + script + "window.onload();";

	getBotScript();
}

function escapeCode(str) {
	return ('' + str).replace(/["'\\\n\r\u2028\u2029]/g, function (character) {

	    switch (character) {
			case '"':
			case "'":
			case '\\':
				return '\\' + character

			case '\n':
				return '\\n'
			case '\r':
				return '\\r'
			case '\u2028':
				return '\\u2028'
			case '\u2029':
				return '\\u2029'
		}
	})
}

/* -- Modifying Bot Script -- */

function getBotScript() {
	$.ajax({
		url: botURL,
		converters: {
			'text script': function (text) {
				return text;
			}
		},
		success: function (js_code) {
			botjs = js_code;
			modifyBotScript(js_code);
		}
	});
}

function modifyBotScript(script) {
	var custom = "var xName = \"" + xName + "\";\
	var yName = \"" + yName + "\";\
	var objectArrayName = \"" + objectArrayName + "\";\
	var playerArrayName = \"" + playerArrayName + "\";\
	var playerIDArrayName = \"" + playerIDArrayName + "\";\
	";

	botjs = custom + script;
}

/* -- Variable Detection -- */

function getVariable(str, context) {
	var offset = 0;
	if(context != "") {
		offset = mainjs.indexOf(context);
	}

	if(offset == -1) {
		offset = 0;
	}

	var index = mainjs.indexOf(str, offset);

	if(index == -1) {
		console.log("No variable found");
		return "";
	}

	var equalsIndex;

	var character;

	for(var i = -1; i > -19; i--) {
		if(mainjs.charAt(index + i) == "=") {
			equalsIndex = index + i;
			if(mainjs.charAt(index + i - 1) == " ") {
				character = mainjs.charAt(index + i - 2);
			} else {
				character = mainjs.charAt(index + i - 1);
			}
			break;
		}
	}
	console.log("Variable name: " + character);
	return character;
}

function replaceAll(find, replace, str) {
	return str.replace(new RegExp(find, 'g'), replace);
}

/* -- Bot Operations -- */

function update() {
	console.log(window[xName]);
}
