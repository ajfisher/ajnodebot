var config = require("./config.js"),
    FourWDBot = require("./lib/4wdbot"),
    five = require("johnny-five")

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

console.log("MESSAGE: Web server now listening");

app.get('/', function(request, response) {
    response.sendfile(__dirname + '/public/index.html');
});

// now we define all the socket routing

io.sockets.on("connection", function(socket) {

    console.log("New connection");
    if (board.ready) {
        socket.emit("connect_ack", {msg: "Welcome Control", state: "ONLINE"});
    } else {
        socket.emit("connect_ack", {msg: "Welcome Control", state: "NOMOTORS"});
    }

    socket.on("control", function(data) {
        // control messages are simply a direction FBLR and a speed
        //
        console.log(data);

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
        console.log("SOCKET:: CLOSE EMERGENCY");
        process.exit();
    });

    socket.on("disconnect", function() {
        console.log("SOCKET:: User has been disconnected");
    });

    robot.on("distchange", function(err, centimetres) {
        socket.emit("distance", {cm: centimetres});
    });
});
// 
//
// Set up the robot control
//

console.info("Setting up robot. Attempting J5 connect to Arduino")

board = new five.Board(config.device);

board.on("ready", function(err) {

    if (err){
        console.log(err);
        return;
    }

    console.info("Board connected. Robot set up");

    robot = new FourWDBot(config.pinout, board);

    console.info("Robot running");


});



