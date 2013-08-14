# ajnodebot

4WD RPI + Arduino based nodebot.

This is the robot used for my [MelbJS presentation](http://www.slideshare.net/andrewjfisher/building-droids-with-javassript) on nodebots and my 
[WDC13 presentation](http://www.slideshare.net/andrewjfisher/the-wonderfulamazingorientationmotionsensormatic-machine) 
on using the device API.

You can [see a short vid of the robot working](http://www.youtube.com/watch?v=Jkbcn1vA7yk)

# Acknowledgements

This has really been built upon the excellent work produced by (Rick Waldron - Johny-Five)[https://github.com/rwldrn/johnny-five],
(Julian Gaultier - Firmata for node and arduino)[https://github.com/jgautier/firmata] and 
(Chris Williams - Node serialport)[https://github.com/voodootikigod/node-serialport]. Without these libraries I'd be
still building robots in C and Python.

# Install

Clone the repository, cd into it and then run npm install to get the dependencies.

# Running

Two versions are available the full web control version and a more basic CLI
version that allows you to command the robot over command line from a repl. Use:

    robot.<tab>
    
to see the various options. 

To run the command line version:

    node app-cli.js

# Mods required

Make sure you use advanced firmata on the arduino so you get pulseIn as an option.

Also make a mod to the ping library at line 47 to set maxListeners much higher.
