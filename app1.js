var restify = require('restify');
var builder = require('botbuilder');
var api_url = "https://www.eventbriteapi.com/v3/";
var authkey = "?token=GXNZMZWKOWG5XSE4FZ2T"
//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var connector = new builder.ChatConnector({
    appId: "cc55a152-1068-4519-a15b-7f753ab15343", //process.env.MICROSOFT_APP_ID,
    appPassword: "N7aXVkqYa0hxqQxsMtC1X1b" //process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================

bot.dialog('/', function (session) {
    session.send("Hello World");
})