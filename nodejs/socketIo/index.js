const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const rpio = require('rpio');
const exec = require('child_process').exec;
const fs = require("fs");
const path = require("path");

let currentAngle = 0;
let isSg90Free = true;
// rpio.open(7, rpio.OUTPUT);

function on(point) {
	// 打开 11 号针脚（GPIO17) 作为输出
	rpio.open(point, rpio.OUTPUT);

    // 指定 11 号针脚输出电流（HIGH）
	rpio.write(point, rpio.HIGH);
}

function off(point) {
	// 打开 11 号针脚（GPIO17) 作为输出
	rpio.open(point, rpio.OUTPUT);
	// 指定 11 号针脚输出电流（HIGH）
	rpio.write(point, rpio.LOW);
}

function get(point) {
	return rpio.read(point) ? 'high' : 'low';
}

function handlerPressKey(key, socket) {
	var cmdStr;
	const filename = new Date().getTime() + '.jpg';
	switch (key) {
		case 'powerTV':
			cmdStr = 'irsend SEND_ONCE TCL KEY_POWER';
			break;
		case 'power':
			cmdStr = 'irsend SEND_ONCE HMD KEY_POWER && irsend SEND_ONCE TCL KEY_POWER';
			break;
		case 'left':
			cmdStr = 'irsend SEND_ONCE HMD KEY_LEFT';
			break;
		case 'right':
			cmdStr = 'irsend SEND_ONCE HMD KEY_RIGHT';
			break;
		case 'up':
			cmdStr = 'irsend SEND_ONCE HMD KEY_UP';
			break;
		case 'down':
			cmdStr = 'irsend SEND_ONCE HMD KEY_DOWN';
			break;
		case 'back':
			cmdStr = 'irsend SEND_ONCE HMD KEY_BACK';
			break;
		case 'home':
			cmdStr = 'irsend SEND_ONCE HMD KEY_HOME';
			break;
		case 'enter':
			cmdStr = 'irsend SEND_ONCE HMD KEY_ENTER';
			break;
		case 'camera':
			cmdStr = 'raspistill -o ./build/camera/' + filename + ' -w 400 -h 300';
			break;
	}

	console.log(cmdStr);
	cmdStr && exec(cmdStr, function(error, stdout, stderr) {
		if (key === 'camera') {
            // const fullPath = path.resolve(__dirname) + controllerPath;
            fs.readdir('./build/camera/', (err, files) => {
            	// console.log(files);
                files && files.map(item => {
                	if (item !== filename) {
                        fs.unlink('./build/camera/' + item, () => {});
					}
				});

			});
			socket.emit('camera', 'camera/' + filename);
		}
	});
}
function handlerAngle(angle, socket) {
    // currentAngle =
	if (!isSg90Free) {
        socket.emit('sg90', JSON.stringify({
            status: 'busy'
        }));
        return false;
	}
	const _tmpAngle = currentAngle + angle * 1;
    let nextAngle = _tmpAngle > 180 ? 180 : (_tmpAngle < 0 ? 0 : _tmpAngle);
    const diffAngle = nextAngle - currentAngle;
    const time = Math.abs(diffAngle) / 180 * 2;
    currentAngle = nextAngle;
    if (diffAngle) {
        isSg90Free = false;
        const cmdStr = 'python ./rotate.py ' + nextAngle + ' ' + time;
        console.log(nextAngle);
        cmdStr && exec(cmdStr, function(error, stdout, stderr) {
            isSg90Free = true;
            socket.emit('sg90', JSON.stringify({
				status: 'free'
			}));
        });
	} else {
        isSg90Free = true;
        socket.emit('sg90', JSON.stringify({
            status: 'free'
        }));
	}
}

app.use(express.static('build'));

// app.get('/', function(req, res){
//   res.sendFile(__dirname + '/static/index.html');
// });

io.on('connection', function(socket){
  // console.log('a user connected');
  socket.on('led-on', function(dataStr) {
	  try {
		  const data = JSON.parse(dataStr);
		  const point = data.point;
		  on(point || 11);
		  io.emit('changeStatus', JSON.stringify({
			  errCode: 0,
			  errText: '',
			  point: point,
			  status: get(point)
		  }));
	  } catch (e) {
		  console.log(e);
      }
  });
  socket.on('led-off', function(dataStr) {
    try {
	    const data = JSON.parse(dataStr);
	    const point = data.point;
	    off(point || 11);
	    io.emit('changeStatus', JSON.stringify({
		    errCode: 0,
		    errText: '',
		    point: point,
		    status: get(point)
	    }));
    } catch (e) {
      console.log(e)
    }
  });
  socket.on('chat message', function(msg){
      console.log('message: ' + msg);
	  io.emit('chat message', msg);
  });
  socket.on('KEY_PRESS', function(dataStr) {
		try {
			const data = JSON.parse(dataStr);
			const keyType = data.key_type;
			handlerPressKey(keyType, socket);
		} catch (e) {
			console.log(e)
		}
	});
    socket.on('ROTATE', function(dataStr) {
        try {
            const data = JSON.parse(dataStr);
            const angle = data.angle;
            handlerAngle(angle, socket);
        } catch (e) {
            console.log(e)
        }
    });
});

http.listen(8580, function(){
  console.log('listening on *:8580');
});
    
