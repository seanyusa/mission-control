var app = require('express')();
var express = require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var teamsObjectUpdater = require('./teamsObjectUpdater');
var secrets = require('./secrets'),
  mailListenerSettings = require('./secrets/mailListenerSettings.js');
var TextService = require('./textService');

var textService = new TextService(mailListenerSettings);

var teams = [];

var names = JSON.parse('{"teams":[{"name":"B1"},{"name":"B2"},{"name":"G1"},{"name":"G2"},{"name":"R1"}],"missions":[{"name":"M1","code":"UNIVERSITY"},{"name":"M2","code":"BOOKS"},{"name":"M3","code":"HOME"},{"name":"M4","code":"TRUTH"},{"name":"M5","code":"GRID"},{"name":"M6","code":"RELAX"}]}');
var routes = JSON.parse('[[0,1,2,3,5,4],[1,4,3,5,2,0],[3,2,5,4,0,1],[2,5,4,0,1,3],[5,3,0,1,4,2]]');

teams = teamsObjectUpdater.dataToTeams(names);

teams = teamsObjectUpdater.injectRoutes(teams, routes);

// BEGIN Simulate Mission Advancing
for (var i = 0; i < 5; i++) {
  teams = teamsObjectUpdater.initializeTeam(teams, i);
}

teams = teamsObjectUpdater.skipMission(teams, 3);
teams = teamsObjectUpdater.advanceMission(teams, 2);
teams = teamsObjectUpdater.advanceMission(teams, 2);

// var interval = setInterval(function () {
//     teams = teamsObjectUpdater.advanceMission(teams, 0);
//     teams = teamsObjectUpdater.advanceMission(teams, 3);
//     io.emit('status-update', JSON.stringify(teams));
//   }, 11000);

// var interval = setInterval(function () {
//     teams = teamsObjectUpdater.advanceMission(teams, 1);
//     teams = teamsObjectUpdater.advanceMission(teams, 2);
//     io.emit('status-update', JSON.stringify(teams));
//   }, 8000);

// var interval = setInterval(function () {
//     teams = teamsObjectUpdater.advanceMission(teams, 0);
//     teams = teamsObjectUpdater.advanceMission(teams, 4);
//     io.emit('status-update', JSON.stringify(teams));
//   }, 5000);
// END Simulate Mission Advancing

// Serve the /web folder as static files.
app.use(express.static('web'));

app.get('/', function(req, res){
  res.sendFile('web/missioncontrol.html', { root: __dirname });
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.emit('status-update', JSON.stringify(teams));

  socket.on('advanceMission', function(teamNum){
    console.log('advance: ' + teamNum);
    teams = teamsObjectUpdater.advanceMission(teams, teamNum);
    io.emit('status-update', JSON.stringify(teams));
  });

  socket.on('skipMission', function(teamNum){
    console.log('skip: ' + teamNum);
    teams = teamsObjectUpdater.skipMission(teams, teamNum);
    io.emit('status-update', JSON.stringify(teams));
  });

  socket.on('backMission', function(teamNum){
    console.log('back: ' + teamNum);
    teams = teamsObjectUpdater.backMission(teams, teamNum);
    io.emit('status-update', JSON.stringify(teams));
  });

  // var interval = setInterval(function () {
  // 	console.log('Sent event');
  //   socket.emit('status-update', JSON.stringify(teams));
  // }, 15000);

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

textService.start();

textService.on('server:connected', function () {
  console.log('textService started');
});

textService.on('server:disconnected', function () {
  
});

textService.on('received', function (addresses, text, subjectLine) {
  console.log('received message: ' + JSON.stringify(text));
  textService.sendText(addresses, 'Hello Node.js');
});

// io.emit('notification', JSON.parse('{ "subject": "' + mail.subject + '", "body": ' + JSON.stringify(mail.text) + '}'));
    // var response = teamsObjectUpdater.checkCode(teams, mail.text);
    // console.log(response);

http.listen(7000, function(){
  console.log('listening on *:7000');
});
