# ajnodebot

4WD RPI + Arduino based nodebot.

# Install

Clone the repository, cd into it and then run npm install

# Running

Two versions are available the full web control version and a more basic CLI
version that allows you to command the robot over command line.

To run the command line version:

    node app-cli.js

# Mods required

Make sure you use advanced firmata on the arduino so you get pulseIn as an option.

Also make a mod to the ping library at line 47 to set maxListeners much higher.
