var app = require('express')();
var express = require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('web'));

app.get('/', function(req, res){
  res.sendFile('web/missioncontrol.html', { root: __dirname });
});

io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

http.listen(7000, function(){
  console.log('listening on *:7000');
});
