var app = require('express')();
var express = require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var dataCreator = require('./dataCreator');
var secrets = require('./secrets');

var teams = [];

var names = JSON.parse('{"teams":[{"name":"team1"},{"name":"team2"},{"name":"team3"},{"name":"team4"},{"name":"team5"}],"missions":[{"name":"M1","code":"UNIVERSITY"},{"name":"M2","code":"BOOKS"},{"name":"M3","code":"HOME"},{"name":"M4","code":"TRUTH"},{"name":"M5","code":"GRID"},{"name":"M6","code":"RELAX"}]}');
var routes = JSON.parse('[[0,1,2,3,5,4],[1,4,3,5,2,0],[3,2,5,4,0,1],[2,5,4,0,1,3],[5,3,0,1,4,2]]');

teams = dataCreator.dataToTeams(names);

teams = dataCreator.injectRoutes(teams, routes);

// BEGIN Simulate Mission Advancing
for (var i = 0; i < 5; i++) {
  teams = dataCreator.initializeTeam(teams, i);
}

teams = dataCreator.skipMission(teams, 3);
teams = dataCreator.advanceMission(teams, 2);
teams = dataCreator.advanceMission(teams, 2);

// var interval = setInterval(function () {
//     teams = dataCreator.advanceMission(teams, 0);
//     teams = dataCreator.advanceMission(teams, 3);
//     io.emit('status-update', JSON.stringify(teams));
//   }, 11000);

// var interval = setInterval(function () {
//     teams = dataCreator.advanceMission(teams, 1);
//     teams = dataCreator.advanceMission(teams, 2);
//     io.emit('status-update', JSON.stringify(teams));
//   }, 8000);

// var interval = setInterval(function () {
//     teams = dataCreator.advanceMission(teams, 0);
//     teams = dataCreator.advanceMission(teams, 4);
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
    teams = dataCreator.advanceMission(teams, teamNum);
    io.emit('status-update', JSON.stringify(teams));
  });

  socket.on('skipMission', function(teamNum){
    console.log('skip: ' + teamNum);
    teams = dataCreator.skipMission(teams, teamNum);
    io.emit('status-update', JSON.stringify(teams));
  });

  socket.on('backMission', function(teamNum){
    console.log('back: ' + teamNum);
    teams = dataCreator.backMission(teams, teamNum);
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

var MailListener = require("mail-listener2");

// START MAIL LISTENER HERE
var mailListener = new MailListener({
  username: secrets.googleAccount.username,
  password: secrets.googleAccount.password,
  host: "imap.gmail.com",
  port: 993, // imap port
  tls: true,
  connTimeout: 10000, // Default by node-imap
  authTimeout: 5000, // Default by node-imap,
  debug: console.log, // Or your custom function with only one incoming argument. Default: null
  tlsOptions: { rejectUnauthorized: false },
  mailbox: "INBOX", // mailbox to monitor
  searchFilter: ["UNSEEN"], // the search filter being used after an IDLE notification has been retrieved
  markSeen: true, // all fetched email willbe marked as seen and not fetched next time
  fetchUnreadOnStart: true, // use it only if you want to get all unread email on lib start. Default is `false`,
  mailParserOptions: {streamAttachments: true}, // options to be passed to mailParser lib.
  attachments: false, // download attachments as they are encountered to the project directory
  attachmentOptions: { directory: "attachments/" } // specify a download directory for attachments
});
// END MAIL LISTENER HERE

mailListener.start(); // start listening

mailListener.on("server:connected", function(){
  console.log("imapConnected");
});

mailListener.on("server:disconnected", function(){
  console.log("imapDisconnected");
});

mailListener.on("error", function(err){
  console.log(err);
});

mailListener.on("mail", function(mail, seqno, attributes){
  // do something with mail object including attachments
  console.log("emailParsed");
  console.log("Message content: " + JSON.stringify(mail.text));
  console.log("subject: " + mail.subject);
  console.log("from: " + mail.from[0].address);
  console.log("to: " + mail.to[0].address);

  // node mailer!
  var nodemailer = require('nodemailer');
  // create reusable transporter object using the default SMTP transport 
  var transporter = nodemailer.createTransport('smtps://' + secrets.googleAccount.username + ':' + secrets.googleAccount.password + '@smtp.gmail.com');

  // setup e-mail data with unicode symbols 
  var mailOptions = {
      from: '"HQ" <' + mail.to[0].address + '>', // sender address 
      to: mail.from[0].address, // list of receivers 
      text: 'I am a robot number.', // plaintext body 
    };
    
  // send mail with defined transport object 
  transporter.sendMail(mailOptions, function(error, info){
    if(error){
      return console.log(error);
    }
    console.log('Message sent: ' + info.response);
  });
});

http.listen(7000, function(){
  console.log('listening on *:7000');
});
