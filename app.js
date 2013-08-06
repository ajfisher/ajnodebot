var config = require("./config.js"),
    FourWDBot = require("./lib/4wdbot"),
    five = require("johnny-five"),
	camera = require("./lib/camera")

var colors = require("colors");
    colors.setTheme(config.colours);

// web server elements
var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var fs = require('fs');
var board, robot;

//
//
// Set up the application server
//

// configuration and routing
app.configure(function() {
    app.set('port', 8000);
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

server.listen(app.get('port'));

var io = require('socket.io').listen(server);
io.set('log level', 1);

console.log("MESSAGE: Web server now listening".web);

app.get('/', function(request, response) {
    response.sendfile(__dirname + '/public/index.html');
});

//
//
// Camera Set up.
//
camera.init(app, config);

//
//
// WebSocket routing
//

io.sockets.on("connection", function(socket) {

    console.log("New connection".io_connection);
    if (board.ready) {
        socket.emit("connect_ack", {msg: "Welcome Control", state: "ONLINE"});
        camera.start();
    } else {
        socket.emit("connect_ack", {msg: "Welcome Control", state: "NOMOTORS"});
    }

    socket.on("control", function(data) {
        // control messages are just a velocity and a turning speed.
        var vel = data.vel;
        var turn = data.turn;

        if (Math.abs(turn) > Math.abs(vel)) {
            // we want to turn
            if (turn < 0) {
                robot.pivotLeft(Math.abs(turn));
            } else {
                robot.pivotRight(Math.abs(turn));
            }
        } else {
            // got forward and back
            if (vel > 0) {
                robot.forward(Math.abs(vel));
            } else {
                robot.reverse(Math.abs(vel));
            }
        }
    });

    socket.on("faststop", function() {
        console.log("SOCKET:: CLOSE EMERGENCY".warn);
        process.exit();
    });

    socket.on("disconnect", function() {
        console.log("SOCKET:: User has been disconnected".io_connection);
        camera.pause();
    });

    // robot events to send to socket.
    robot.on("distchange", function(err, centimetres) {
        // send the current ping distance
        socket.emit("distance", {cm: centimetres});
    });
    robot.on("rangealert", function(err, cm) {
        // got too close to something
        robot.emergencyStop();
        socket.emit("rangealert", {alert: true});
    });
    robot.on("rangeokay", function(err, cm) {
        // recovered from closeness
        socket.emit("rangealert", {alert: false});
    });
});
// 
//
// Set up the robot control
//

console.info("Robot:".bot_note + "Attempting J5 --> Arduino".bot)

board = new five.Board({port: config.device});

board.on("ready", function(err) {

    if (err){
        console.log(err);
        return;
    }

    console.info("Robot: ".bot_note + "Board connected. Init control & sensors".bot);

    robot = new FourWDBot(config.pinout, board);
    console.info("Robot: ".bot_note + "Running".bot_good );
    console.log("Control the robot via your browser".data);
});



