var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var rpio = require('rpio');
const exec = require('child_process').exec;

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
			cmdStr = 'raspistill -o ./client/image.jpg -w 800 -h 600';
			break;
	}

	console.log(cmdStr);
	cmdStr && exec(cmdStr, function(error, stdout, stderr) {
		if (key === 'camera') {
			socket.emit('camera', 'image.jpg');
		}
	});
}

app.use(express.static('build'));

// app.get('/', function(req, res){
//   res.sendFile(__dirname + '/static/index.html');
// });

io.on('connection', function(socket){
  console.log('a user connected');
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
});

http.listen(8580, function(){
  console.log('listening on *:8580');
});
    
