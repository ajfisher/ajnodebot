var config = require("./config.js"),
    FourWDBot = require("./lib/4wdbot"),
    five = require("johnny-five")

var board, robot;

console.info("Setting up robot. Attempting J5 connect to Arduino")

board = new five.Board(config.device);

board.on("ready", function(err) {

    if (err){
        console.log(err);
        return;
    }

    console.info("Board connected. Robot set up");

    robot = new FourWDBot(config.pinout, board);

    console.info("Robot running issue commands to it");

    board.repl.inject({
        robot: robot
    });


});



