// Twilio Text Service JS
// Node_Modules
var EventEmitter = require('events');
var util = require('util');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser')
const MessagingResponse = require('twilio').twiml.MessagingResponse;

// Twilio Credentials
const accountSid = 'ACd7032400b13dcd284f0bd5a7775f2407';
const authToken = '25e9b0b2d18d48ad2d430391f6d60ea3';

// require the Twilio module and create a REST client
const client = require('twilio')(accountSid, authToken);

// client.messages
//   .create({
//     to: '+19036179050',
//     from: '+18472436855',
//     body: 'This is the ship that made the Kessel Run in fourteen parsecs?',
//   })
//   .then((message) => console.log(message.sid));

// TEXT SERVICE SHOULD EMIT THE FOLLOWING:
// server:connected
// server:disconnected
// error
// received
var TextService = function (mailListenerSettings) { 
  var self = this;

  this.app = express();
  this.app.use(bodyParser.urlencoded({ extended: true }));

  this.app.post('/sms', (req, res) => {
    // const twiml = new MessagingResponse();
    console.log(req.body.Body);
    self.emit('received', req.body.From, req.body.Body);
    // twiml.message('The Robots are coming! Head for the hills! ' + req.body.Body);

    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(/*twiml.toString()*/);
  });

  http.createServer(this.app).listen(8787, () => {
    console.log('Twilio server listening on port 8787');
    self.emit('server:connected');
  });

  // // Setup Mail Listener
  // this.mailListener = new MailListener(mailListenerSettings);

  // Setup Node Mailer
  // create reusable transporter object using the default SMTP transport 
  // this.transporter = nodemailer.createTransport('smtps://' + mailListenerSettings.username + ':' + mailListenerSettings.password + '@smtp.gmail.com');

  // Mail Listener Callbacks
  // this.mailListener.on('server:connected', function () {
  //   console.log('MailListener in textService: IMAP server connected.');
  //   self.emit('server:connected');
  // });

  // this.mailListener.on('server:disconnected', function () {
  //   console.log('MailListener: IMAP server disconnected.');
  //   self.emit('server:disconnected');
  // });

  // this.mailListener.on('error', function (err) {
  //   console.log('Error in textServer: ' + err);
  //   self.emit('error', err);
  // });

  // this.mailListener.on('mail', function (mail, seqno, attributes) {
  //   // do something with mail object including attachments
  //   console.log("emailParsed");
  //   console.log("Message content: " + JSON.stringify(mail.text));
  //   console.log("subject: " + mail.subject);
  //   console.log("from: " + mail.from[0].address);
  //   console.log("to: " + mail.to[0].address);

  //   var addresses = {
  //     from: mail.from[0].address,
  //     to: mail.to[0].address
  //   }

  //   self.emit('received', addresses, mail.text, mail.subject);
  // });
};

util.inherits(TextService, EventEmitter);

// Start TextService
TextService.prototype.start = function () {
  // this.mailListener.start(); // start listening
}

// Send a Text
TextService.prototype.sendText = function (address, text) {
  // setup e-mail data
  client.messages
  .create({
    to: address,
    from: '+18472436855',
    body: text,
  })
  .then((message, err) => {
    if(err){
      return console.log(err);
    }
    console.log('Message sent: ' + message);
  });
}

module.exports = TextService;

