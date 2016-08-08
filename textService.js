// Text Service JS
// Node_Modules
var MailListener = require("mail-listener2");
var nodemailer = require('nodemailer');
var EventEmitter = require('events');
var util = require('util');

// Local Requires
var secrets = require('./secrets');


var TextService = function () { 
  console.log("Constructing!");
  var self = this;

  // Setup Mail Listener
  this.mailListener = new MailListener({
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

  // Setup Node Mailer
  // create reusable transporter object using the default SMTP transport 
  var transporter = nodemailer.createTransport('smtps://' + secrets.googleAccount.username + ':' + secrets.googleAccount.password + '@smtp.gmail.com');

  // Mail Listener Callbacks
  this.mailListener.on('server:connected', function(){
    console.log('MailListener in textService: IMAP server connected.');
    self.emit('server:connected');
  });

  this.mailListener.on('server:disconnected', function(){
    console.log('MailListener: IMAP server disconnected.');
    this.emit('server:disconnected');
  });

  this.mailListener.on('error', function(err){
    console.log(err);
    this.emit('error', err);
  });

  this.mailListener.on('mail', function(mail, seqno, attributes){
    // do something with mail object including attachments
    console.log("emailParsed");
    console.log("Message content: " + JSON.stringify(mail.text));
    console.log("subject: " + mail.subject);
    console.log("from: " + mail.from[0].address);
    console.log("to: " + mail.to[0].address);

    // io.emit('notification', JSON.parse('{ "subject": "' + mail.subject + '", "body": ' + JSON.stringify(mail.text) + '}'));
    var response = teamsObjectUpdater.checkCode(teams, mail.text);
    console.log(response);
  });
};

util.inherits(TextService, EventEmitter);

TextService.prototype.start = function () {
  this.mailListener.start(); // start listening
}

TextService.prototype.sendText = function (content, addresses) {
  // setup e-mail data
  var mailOptions = {
      from: '<' + addresses.to + '>', // sender address 
      to: addresses.from, // list of receivers 
      text: content // plaintext body 
    };
    
  // send mail with defined transport object 
  transporter.sendMail(mailOptions, function(error, info){
    if(error){
      return console.log(error);
    }
    console.log('Message sent: ' + info.response);
  });
}



module.exports = TextService;



