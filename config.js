var os = require("os");


var config = {};

config.host = os.hostname();

config.pinout = {
    right_motor: {
        pins: {
            motor: 3,
            dir: 12,
        },
        thresholds: {
            max: 100,
            min: 30
        }
    },

    left_motor: {
        pins: {
            motor: 11,
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


// if host is ares we're in dev, if it's pallas we're on the robot. The main
// implication being we have to reset the arduino hardware as we're using
// UART serial rather than USB serial.

if (config.host == "pallas") {
    // on the robot
	config.device = "/dev/ttyAMA0";
} else {
    // in a dev environment
    config.device = "";
}



module.exports = config;

