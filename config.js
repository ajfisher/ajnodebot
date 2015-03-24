var 	os = require("os"),
	    colors = require("colors");

var config = {};

config.switches = {
	camera: 	true,
	pings: 		true,
	motors:		true,
	useusb:		false
};


config.host = os.hostname();

config.pinout = {
    right_motor: {
        pins: {
            pwm: 3,
            dir: 12,
        },
        thresholds: {
            max: 100,
            min: 30
        }
    },

    left_motor: {
        pins: {
            pwm: 11,
            dir: 13,
        },
        thresholds: {
            max: 100,
            min: 30,
        }
    },

	pan_servo: {
		pin: 8,
		min: 30,
		max: 150,
		centre: 90,
	},

	tilt_servo: {
		pin: 9,
		min: 90,
		max: 140,
		centre: 115,
	},

    usrf: {
        centre: {
		    pin: 7,
            min_range: 25,
	    },
    },

};

config.colours = {
    verbose: 'cyan',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red',
    io_info: 'grey',
    io_help: 'cyan',
    io_connection: 'green',
    web: 'grey',
    bot: 'cyan',
    bot_error: 'red',
    bot_note: 'magenta',
    bot_good: 'green',
}

colors.setTheme(config.colours);

// if host is ares we're in dev, if it's pallas we're on the robot. The main
// implication being we have to reset the arduino hardware as we're using
// UART serial rather than USB serial.

if (config.host == "pallas") {
    // on the robot
	if (! config.switches.useusb) {
		config.device = "/dev/ttyS99";
	} else {
		config.device = "";
	}
    config.camera_id = 0;
} else {
    // in a dev environment
    config.device = "";
    config.camera_id = 1;
}

config.camera_framerate = 1000 / 25; // # put in fps as the val and then it will calc msec

// process the arguments and expose them out
process.argv.forEach(function(val, index, array) {
	switch(val) {
		case "--nocam":
			// sets no camera
			console.log("NO CAMERA".bot);
			config.switches.camera = false;
			break;
		case "--noping":
			// removed the ping sensors TODO
			console.log("NO USRFs".bot);
			config.switches.pings = false;
			break;
		case "--nomotor":
			// turns off the motors TODO
			console.log("NO MOTORS".bot);
			config.switches.motors = false;
			break;
		case "--useusb":
			// uses a USB connector not UART
			console.log("Using Serial over USB".bot);
			config.switches.useusb = true;
			break;
	};
});

module.exports = config;

