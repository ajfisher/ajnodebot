var config = require("./config.js"),
    FourWDBot = require("./lib/4wdbot"),
    five = require("johnny-five");

var board, robot;

var ping;

var speed = 0;
var max_speed = 150;
var cur_speed_setting = 0.6

// set up the input
var stdin = process.openStdin();
require('tty').setRawMode(true);

console.info("Setting up robot. Attempting J5 connect to Arduino")

board = new five.Board({port: config.device});

board.on("ready", function(err) {

    if (err){
        console.log(err);
        return;
    }

    console.info("Board connected. Robot set up");

    robot = new FourWDBot(config.pinout, board);

    console.info("Robot running issue commands to it.");
	console.info("LRUP arrows. Space stop. H help");

    board.repl.inject({
        robot: robot
    });

});

stdin.on('keypress', function(chunk, key) {
	// process the keypresses

	if (key && key.ctrl && key.name == 'c') {
		console.log("Exiting");
		process.exit();
	}

	speed = cur_speed_setting * max_speed;

	if (key) {	
		switch (key.name) {
			case "up":
				robot.forward(speed);
				break;
			case "down":
				robot.reverse(speed);
				break;
			case "left":
				robot.pivotLeft(speed);
				break;
			case "right":
				robot.pivotRight(speed);
				break;
			case "space":
				robot.stop();
				break;
		}
	} else {
		// we're a chunk so go with that

		switch (chunk) {
			case "1":
				cur_speed_setting = 0.1;
				break;
			case "2":
				cur_speed_setting = 0.2;
				break;
			case "3":
				cur_speed_setting = 0.3;
				break;
			case "4":
				cur_speed_setting = 0.4;
				break;
			case "5":
				cur_speed_setting = 0.5;
				break;
			case "6":
				cur_speed_setting = 0.6;
				break;
			case "7":
				cur_speed_setting = 0.7;
				break;
			case "8":
				cur_speed_setting = 0.8;
				break;
			case "9":
				cur_speed_setting = 0.9;
				break;
		}
	}

});

