var mainjs;
var botjs;

var scriptAdditions = "";

var botURL = chrome.extension.getURL("bot.js");
var cssURL = chrome.extension.getURL("css.css");
var jsonURL = chrome.extension.getURL("regex.json");

chrome.browserAction.onClicked.addListener( function() {
	if(mainjs == null || mainjs == "") {
		console.log("No script to load");
		return;
	}
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

function getRegexJson(script) {
	console.log(jsonURL);
	$.getJSON(jsonURL, function(data) {
		parseRegexJson(data, script);
	});
}

function parseRegexJson(json, script) {
	var mainAdditions = "";

	var variables = json["variables"];
	var replaces = json["replace"];
	
	if(variables) {
		for(var iCount = 0; iCount < variables.length; iCount++) {
			var variable = variables[iCount];
			var name = variable["name"];
			var regexText = variable["regex"];
			var regex = new RegExp(regexText);
			var type = variable["type"];

			if(type == "exec") {
				mainAdditions += "var " + regex.exec(script)[1] + " = " + name + ";\n";
			} else if(type == "capture") {
				scriptAdditions += "var " + name + " = \"" + regex.exec(script)[1] + "\";\n";
			}
		}
	}

	if(replaces) {
		for(var iCount = 0; iCount < replaces.length; iCount++) {
			var item = replaces[iCount];

			var replace = item["replace"];
			var regexText = item["regex"];
			var modifier = item["modifier"];

			var regex = new RegExp(regexText, modifier);

			script = script.replace(regex, replace);
		}
	}

	script = mainAdditions + script + "window.onload();";
	mainjs = script;

	console.log(scriptAdditions);
}

function modifyScript(script) {
	getRegexJson(script);

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
	botjs = scriptAdditions + script;
	console.log(botjs);
}
