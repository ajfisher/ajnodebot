// 4WD Robot platform.
//

var events = require("events"),
    five = require("johnny-five"),
    util = require("util");


function FourWDBot(opts, board) {
    // sets up a new robot instance and sets all of the various pins
    // etc to the relevant actutors and sensors

    FourWDBot.super_.call(this);

    if ( !(this instanceof FourWDBot) ) {
        return new FourWDBot( opts );
    }

    this.board = board;

    this.emergencyStopped = false;
    this.moving = false;

    console.log("Robot Init: Left Motor");
    this.left_motor = {};
    this.left_motor.motor = new five.Motor(opts.left_motor);
    this.left_motor.thresholds = opts.left_motor.thresholds;

    console.log("Robot Init: Right Motor");
    this.right_motor = {};
    this.right_motor.motor = new five.Motor(opts.right_motor);
    this.right_motor.thresholds = opts.right_motor.thresholds;

	this.usrf_centre = {};
	this.usrf_centre.ping = new five.Ping(opts.usrf.centre);

	this.usrf_centre.ping.on("change", function(err, value){
        var err = null;
        var cm = this.usrf_centre.ping.cm;
        
        if (cm > 0) {
	    	this.emit("distchange", err, cm); 
            if (cm > 20 && this.emergencyStopped) {
                this.emergencyStopped = false;
            }
        }

		if (cm <20 && cm > 0) {
			this.emit("rangealert", err, cm);
		}
	}.bind(this)); // bind to the robot for emitting the events.

}

//FourWDBot.prototype.__proto__ = events.EventEmitter.prototype;

util.inherits( FourWDBot, events.EventEmitter);

FourWDBot.prototype.forward = function(speed) {
    // drives forward at given speed.

    if (! this.emergencyStopped) {
        this.left_motor.motor.forward(speed);
        this.right_motor.motor.forward(speed);

        this.moving = true;

        this.emit("Robot forward", null, speed);
    } else {
        console.log("Can't move forward. Emergency stopped");
    }
    return this;
};


FourWDBot.prototype.reverse = function(speed) {
    // drives backwards at given speed.

    this.left_motor.motor.reverse(speed);
    this.right_motor.motor.reverse(speed);

    this.moving = true;

    this.emit("Robot backwards", null, speed)

    return this;
};

FourWDBot.prototype.stop = function() {
    // stops the motion.
    
    this.left_motor.motor.stop();
    this.right_motor.motor.stop();

    this.moving = false;
};

FourWDBot.prototype.emergencyStop = function() {
    // go into emergency stop mode.

    if (! this.emergencyStopped) {
        this.stop();
        this.emergencyStopped = true;
    }

};

FourWDBot.prototype.pivotLeft = function(speed) {
    // on the spot turn to the left
    this._pivot(speed, FourWDBot.DIRECTION.LEFT);
};

FourWDBot.prototype.pivotRight = function(speed) {
    // on the spot turn to the right
    this._pivot(speed, FourWDBot.DIRECTION.RIGHT);
};

FourWDBot.prototype._pivot = function(speed, direction) {
    // internally used for pivoting on the spot.
    if (direction === FourWDBot.DIRECTION.LEFT) {
        this.left_motor.motor.reverse(speed);
        this.right_motor.motor.forward(speed);
    } else {
        this.left_motor.motor.forward(speed);
        this.right_motor.motor.reverse(speed);
    }

    this.moving = true;
};

FourWDBot.prototype.help = function() {
    // prints a help list

    console.log("Welcome to the bot. You can do the following:");
    console.log(".forward(speed)\tDrive forward at speed [0-255]");
    console.log(".reverse(speed)\tDrive backwards at speed [0-255]");
    console.log(".pivotRight(speed)\tPivot rightwards at speed [0-255]");
    console.log(".pivotLeft(speed)\tPivot leftwards at speed [0-255]");

    console.log(".stop()\tStop the robot");


};


FourWDBot.DIRECTION = {
    LEFT: -1,
    RIGHT: 1
};


module.exports = FourWDBot;


