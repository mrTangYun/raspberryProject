var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var rpio = require('rpio');

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


app.get('/', function(req, res){
  res.sendFile(__dirname + '/static/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('led-on', function(dataStr) {
	  try {
		  const data = JSON.parse(dataStr);
		  const point = data.point;
		  on(point || 11);
		  socket.emit('changeStatus', JSON.stringify({
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
	    socket.emit('changeStatus', JSON.stringify({
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
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
    
