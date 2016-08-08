// Text Service JS
// Node_Modules
var MailListener = require("mail-listener2");
var nodemailer = require('nodemailer');
var EventEmitter = require('events');
var util = require('util');


var TextService = function (mailListenerSettings) { 
  console.log("Constructing!");
  var self = this;

  // Setup Mail Listener
  this.mailListener = new MailListener(mailListenerSettings);

  // Setup Node Mailer
  // create reusable transporter object using the default SMTP transport 
  this.transporter = nodemailer.createTransport('smtps://' + mailListenerSettings.username + ':' + mailListenerSettings.password + '@smtp.gmail.com');

  // Mail Listener Callbacks
  this.mailListener.on('server:connected', function () {
    console.log('MailListener in textService: IMAP server connected.');
    self.emit('server:connected');
  });

  this.mailListener.on('server:disconnected', function () {
    console.log('MailListener: IMAP server disconnected.');
    self.emit('server:disconnected');
  });

  this.mailListener.on('error', function (err) {
    console.log('Error in textServer: ' + err);
    self.emit('error', err);
  });

  this.mailListener.on('mail', function (mail, seqno, attributes) {
    // do something with mail object including attachments
    console.log("emailParsed");
    console.log("Message content: " + JSON.stringify(mail.text));
    console.log("subject: " + mail.subject);
    console.log("from: " + mail.from[0].address);
    console.log("to: " + mail.to[0].address);

    var addresses = {
      from: mail.from[0].address,
      to: mail.to[0].address
    }

    self.emit('received', addresses, mail.text, mail.subject);
  });
};

util.inherits(TextService, EventEmitter);

TextService.prototype.start = function () {
  this.mailListener.start(); // start listening
}

TextService.prototype.sendText = function (addresses, text) {
  // setup e-mail data
  var mailOptions = {
      from: '<' + addresses.to + '>', // sender address 
      to: addresses.from, // list of receivers 
      text: text // plaintext body 
    };
    
  // send mail with defined transport object 
  this.transporter.sendMail(mailOptions, function(error, info){
    if(error){
      return console.log(error);
    }
    console.log('Message sent: ' + info.response);
  });
}

module.exports = TextService;

