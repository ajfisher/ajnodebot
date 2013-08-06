var os = require("os");

var config = {};

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

    usrf: {
        centre: {
		    pin: 7,
            min_range: 15,
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

// if host is ares we're in dev, if it's pallas we're on the robot. The main
// implication being we have to reset the arduino hardware as we're using
// UART serial rather than USB serial.

if (config.host == "pallas") {
    // on the robot
	config.device = "/dev/ttyAMA0";
    //config.device = "";
    config.camera_id = 0;
} else {
    // in a dev environment
    config.device = "";
    config.camera_id = 1;
}

config.camera_framerate = 1000 / 1; // # put in fps as the val and then it will calc msec

module.exports = config;

