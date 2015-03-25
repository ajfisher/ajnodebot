// 4WD Robot platform.
//

var events = require("events"),
    five = require("johnny-five"),
    util = require("util");


function FourWDBot(opts, board, switches) {
    // sets up a new robot instance and sets all of the various pins
    // etc to the relevant actutors and sensors

    FourWDBot.super_.call(this);

    if ( !(this instanceof FourWDBot) ) {
        return new FourWDBot( opts );
    }

    this.board = board;

    this.emergencyStopped = false;
    this.moving = false;

    console.log("Robot:".bot_note + " Init Left Motor".bot);
    this.left_motor = {};
    this.left_motor.motor = new five.Motor(opts.left_motor);
    //this.left_motor.motor = new five.Motor({pins: {pwm: 11, dir: 13}});
    this.left_motor.thresholds = opts.left_motor.thresholds;

    console.log("Robot:".bot_note + " Init Right Motor".bot);
    this.right_motor = {};
    this.right_motor.motor = new five.Motor(opts.right_motor);
    this.right_motor.thresholds = opts.right_motor.thresholds;

	// set up servos
	console.log("Robot:".bot_note + "Init Servos".bot);
	this.pan_servo = {};
	this.pan_servo.servo = new five.Servo(opts.pan_servo.pin);
	this.pan_servo.position = opts.pan_servo.centre; // central position;
	this.pan_servo.servo.to(this.pan_servo.position);
	this.pan_servo.min = opts.pan_servo.min;
	this.pan_servo.max = opts.pan_servo.max;

	//TODO: add in the other servo here now as well for tilt.
	
	this.tilt_servo = {};
	this.tilt_servo.servo = new five.Servo(opts.tilt_servo.pin);
	this.tilt_servo.position = opts.tilt_servo.centre; // central position;
	this.tilt_servo.servo.to(this.tilt_servo.position);
	this.tilt_servo.min = opts.tilt_servo.min;
	this.tilt_servo.max = opts.tilt_servo.max;

	if (switches.pings) { 	
		console.log("Robot:".bot_note + " Init ultrasonic range finder".bot);
		this.usrf_centre = {};
		this.usrf_centre.ping = new five.Ping(opts.usrf.centre);

	    	console.log("Robot".bot_note + " Init responses".bot);
		this.usrf_centre.ping.on("change", function(err, value){
			var err = null;
			var cm = this.usrf_centre.ping.cm;
			
			if (cm > 0) {
				this.emit("distchange", err, cm); 
			    if (cm > this.usrf_centre.min_range && this.emergencyStopped) {
				this.emergencyStopped = false;
				this.emit("rangeokay", err, cm);
			    }
			}

			if (cm <this.usrf_centre.min_range && cm > 0) {
				this.emit("rangealert", err, cm);
			}
		}.bind(this)); // bind to the robot for emitting the events.
	} else {
		console.log("No USRFs");
	}
}


util.inherits( FourWDBot, events.EventEmitter);

FourWDBot.prototype.forward = function(speed) {
    // drives forward at given speed.

    if (! this.emergencyStopped) {
        this.left_motor.motor.forward(speed);
        this.right_motor.motor.forward(speed);

        this.moving = true;
    } else {
        console.log("Robot:".bot_note + " Can't move forward. Emergency stopped".bot_error);
    }
    return this;
};


FourWDBot.prototype.reverse = function(speed) {
    // drives backwards at given speed.

    this.left_motor.motor.reverse(speed);
    this.right_motor.motor.reverse(speed);

    this.moving = true;

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

//
//
// Servo related methods
//

FourWDBot.prototype.panLeft = function(amount) {
	// moves the pan servo left by the amount given. 
	// Amount is relative so central position is 90, an amount of 5
	// would move it to 85 degrees etc.
	
	this._servomove(this.pan_servo, this.pan_servo.position+amount)
};

FourWDBot.prototype.panRight = function(amount) {
	// moves the pan servo right by the amount given. 
	// Amount is relative so central position is 90, an amount of 5
	// would move it to 95 degrees etc.
	
	this._servomove(this.pan_servo, this.pan_servo.position-amount)
};

FourWDBot.prototype.panCentre = function() {
	// moves the pan servo to the center point
	
	this._servomove(this.pan_servo, 90)
};

FourWDBot.prototype.tiltUp = function(amount) {
	// moves the tilt servo up by the amount given. 
	// Amount is relative so central position is 90, an amount of 5
	// would move it to 85 degrees etc.
	this._servomove(this.tilt_servo, this.tilt_servo.position+amount)
};

FourWDBot.prototype.tiltDown = function(amount) {
	// moves the tilt servo down by the amount given. 
	// Amount is relative so central position is 90, an amount of 5
	// would move it to 95 degrees etc.
	
	this._servomove(this.tilt_servo, this.tilt_servo.position-amount)
};
FourWDBot.prototype._servomove = function(servo, position) {
	// changes the position of the servo to the position given.
	
	// limit up the movement range.
	if (position < servo.min) position = servo.min;
	if (position > servo.max) position = servo.max;

	// now shift.
	servo.servo.to(position);
	servo.position = position; // update pos so we know where it is.
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


