setInterval(function() {update()}, 10);

//setTimeout(function(){debugger;}, 10000);

var playerColor = "#555555";

var edibleColor = "#00ff00";
var neutralColor = "#000000";
var dangerColor = "#ff0000";

var splitDangerColor = "#ff00ff";
var splitEdibleColor = "#005500";

var botoverlay;

var botX;
var botY;

var extra;

var players;
var objects;

init();

function init() {
	$("body").append("<div id=\"botoverlay\"></div>");

	botoverlay = $("#botoverlay");

	botoverlay.append("<div id=\"botX\"></div><div id=\"botY\"></div><div id=\"extra\"></div>");

	botX = $("#botX");
	botY = $("#botY");
	extra = $("#extra")

	//A.onmousemove = function() {};

	//setNick("HiWorld");
}

var count;

function update() {
	if(typeof window[objectArrayName] === 'undefined') {
		return;
	}

	if(window[playerArrayName].length > 0) {
		players = window[playerArrayName];
		objects = window[objectArrayName];
	} else {
		return;
	}

	botX.html("X: " + window[xName]);
	botY.html("Y: " + window[yName]);
	//extra.html("Extra: " + Q + " : " + R);
	//extra.html("k: " + k);

	var smallestPlayer;

	for(var iCount = 0; iCount < players.length; iCount++) {
		var player = players[iCount];

		if(typeof smallestPlayer === 'undefined') {
			smallestPlayer = player;
		} else if(smallestPlayer.size < player.size) {
			smallestPlayer = player;
		}

		var smallestPlayerMass = edibleSize(smallestPlayer, false);

		for(var kCount = 0; kCount < objects.length; kCount++) {
			var object = objects[kCount];
			if(getMass(object) < 10) {
				object.color = edibleColor;
				continue;
			}

			if(object.isVirus) {
				object.color = dangerColor;
				continue;
			} else if(isPlayer(object)) {
				object.color = playerColor;
				continue;
			} else if(edibleSize(object, false) > smallestPlayerMass) {
				// Danger comparison must occur before edible comparison
				object.color = dangerColor;
			} else if(edibleSize(object, false) < smallestPlayerMass) {
				object.color = edibleColor;
			} else {
				object.color = neutralColor;
			}

			if(edibleSize(player, true) > getMass(object) && withinSplittingDistance(player, object)) {
				object.color = splitEdibleColor;
			} else if(edibleSize(object, true) > getMass(player) && withinSplittingDistance(object, player)) {
				object.color = splitDangerColor;
			}
		}
	}

	/*for(var iCount = 0; iCount < p.length; iCount++) {
		var object = p[iCount];
		if(getMass(object) < 10) {
			object.color = edibleColor;
			continue;
		}

		if(object.isVirus) {

		} else if(edibleSize(object, false) < smallestPlayerMass) {
			object.color = edibleColor;
		} else if(edibleSize(object, false) > smallestPlayerMass) {
			object.color = dangerColor;
		} else {
			object.color = neutralColor;
		}
	}*/


	//count += .01;

	//console.log(h);
}

function isPlayer(potentialPlayer) {
	var playerIDs = window[playerIDArrayName];

	if(playerIDs.length <= 0) {
		return false;
	}

	for(var iCount = 0; iCount < playerIDs.length; iCount++) {
		if(typeof potentialPlayer === 'undefined') {
			return false;
		}
		if(potentialPlayer.id == players[iCount].id) {
			return true;
		}
	}

	return false;
}

function edibleSize(smallestPlayer, split) {
	// Set edible as being 10% smaller
	var mass = getMass(smallestPlayer);
	if(split) {
		mass = mass / 2;
	}
	return mass * .75;
}

function withinSplittingDistance(player, object) {
	// blob.size is equal to the radius of the object
	// Base player size is 32
	if(distanceBetween(player.x, player.y, object.x, object.y) < player.size * 2 * 3.5 && getMass(player) >= 36 && getMass(object) > 10) {
		return true;
	}

	return false;
}

function distanceBetween(x1, y1, x2, y2) {
	return Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
}

function getMass(object) {
	return object.size * object.size / 100;
}

