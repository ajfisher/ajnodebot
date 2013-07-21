//
// Manages the various camera functions. Notably writing out the image
// as a jpeg stream so it can work as a video stream effectively.
// With thanks to this gist for jpeg frame idea: https://gist.github.com/mscdex/566f782827bbd873abfd

var cv = require("opencv");

var camera_id = 0; // which cam to use
var framerate = 1000; // how many msec to wait between frame streams

var last_frame = Date.now();
var capture_fps = framerate / 2;

var video_stream = null;
var video_buffer; // holder for the frame of vid             

var boundary = "videostream12345";  // multipart vid element

function write_frame(res, data) {
   // data is a buffer that can then be written out.
    if (data) {
        res.write("Content-Type: image/jpeg\nContent-Length: " + data.length + "\n\n");
        res.write(data);
        res.write("\n--" + boundary + "\n");
    }
}  

module.exports = {

    init: function(expapp, config) {
        // add a handler for the video stream

        // set various config components
        camera_id = config.camera_id;
        frame_rate = config.camera_framerate;

        // set up the video stream
        video_stream = new cv.VideoCapture(config.camera_id).toStream()

        video_stream.on('data', function(matrix){
            // got a buffer
			var curtime = Date.now();
			if (curtime > (last_frame + capture_fps)) {
				//video_buffer = matrix.pyrDown().toBuffer()
	            video_buffer = matrix.toBuffer();
				last_frame = curtime;
			}
        });

        // define a url for the video to play at.
        expapp.get('/video', function(request, response) {
            response.writeHead(200, {
                'Content-Type': 'multipart/x-mixed-replace;boundary="' + boundary + '"',
                'Connection': 'keep-alive',
                'Expires': 'Fri, 01 Jan 1990 00:00:00 GMT',
                'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate', 
                'Pragma': 'no-cache'
            }); 
            response.write("--" + boundary + "\n"); 

            // now we have a function that writes the video buffer over and over.
            setInterval(function(){                                                     
                write_frame(response, video_buffer);
            }.bind(response), framerate);
        });
    },

    start: function() {
        // start actually doing the camera reads
        if (this.started) {
            video_stream.resume();
        } else {
            video_stream.read();
            this.started = true;
        }
    },
    pause: function() {
        // pause the stream
        video_stream.pause();
    },
    
    started: false,
};

