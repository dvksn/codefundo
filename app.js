var restify = require('restify');
var builder = require('botbuilder');
var http = require('https');

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
    appId: "cc55a152-1068-4519-a15b-7f753ab15343",
    appPassword: "N7aXVkqYa0hxqQxsMtC1X1b"
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================

bot.dialog('/', [
    function (session) {
        session.beginDialog('/ensureProfile', session.userData.profile);
    },
    function (session, results,next) {
    	if(!session.userData.profile){
	        session.userData.profile = results.response;
	        next();
	        // session.send('Hello %(name)s! I love %(company)s!', session.userData.profile);
    	}else{
    		next();
    	}
    },
    function(session, results, next) {
    	var questions = {
    "List all events": {},
    "Show events by date": {}
};

    	builder.Prompts.choice(session ,"How can i help you today? ", questions, {listStyle: builder.ListStyle.button});
    },
    function (session, results, next) {

    	if(results.response.entity == "List all events")
    	{
    		session.beginDialog('/fetchAllEvents', session.userData.profile);
    	}
    	else if (results.response.entity== "Show events by date") 
    	{
    		session.beginDialog('/fetchByDate', session.userData.profile);
    	}
    }
]);
bot.dialog('/ensureProfile', [
    function (session, args, next) {
        session.dialogData.profile = args || {};
        if (!session.dialogData.profile.name) {
            builder.Prompts.text(session, "What's your name?");
        } else {
            next();
        }
    },
    function (session, results, next) {
        if (results.response) {
            session.dialogData.profile.name = results.response;
        }
       	session.endDialogWithResult({ response: session.dialogData.profile });

    }
]);

bot.dialog('/fetchAllEvents', [
	function (session, args, next) {
		
  	http.get(api_url +"events/search/"+ authkey, (res) => {
  const statusCode = res.statusCode;
  const contentType = res.headers['content-type'];

  var error;
  if (statusCode !== 200) {
    error = new Error(`Request Failed.\n` +
                      `Status Code: ${statusCode}`);
  } else if (!/^application\/json/.test(contentType)) {
    error = new Error(`Invalid content-type.\n` +
                      `Expected application/json but received ${contentType}`);
  }
  if (error) {
    session.send(error.message);
    // consume response data to free up memory
    res.resume();
    
  }
  var eventlist = [];
  res.setEncoding('utf8');
  var  rawData = '';
  res.on('data', (chunk) => rawData += chunk);

  res.on('end', () => {
    try {
      var  parsedData = JSON.parse(rawData);
      // console.log(parsedData.events);
      for (var i = parsedData.events.length - 1; i >= 0; i--) {
      	eventlist.push(	parsedData.events[i].name.text);
        session.send(eventlist);

      }
      console.log(eventlist);

    } catch (e) {
      console.log(e.message);
    }
  });
	}).on('error', (e) => {
  console.log(`Got error: ${e.message}`);
	});
	}
])
bot.dialog('/fetchByDate', [
	function (session, args, next) {
	builder.Prompts.time(session, "Enter the date ");
	
 
	 },
	 function (session, results, next) {
	 	// session.send("hi");
	  session.send((builder.EntityRecognizer.resolveTime([results.response])).toString());
	 	//  	http.get(api_url +"events/search/"+ authkey, (res) => {
 //  const statusCode = res.statusCode;
 //  const contentType = res.headers['content-type'];

 //  var error;
 //  if (statusCode !== 200) {
 //    error = new Error(`Request Failed.\n` +
 //                      `Status Code: ${statusCode}`);
 //  } else if (!/^application\/json/.test(contentType)) {
 //    error = new Error(`Invalid content-type.\n` +
 //                      `Expected application/json but received ${contentType}`);
 //  }
 //  if (error) {
 //    session.send(error.message);
 //    // consume response data to free up memory
 //    res.resume();
    
 //  }
 //  var eventlist = [];
 //  res.setEncoding('utf8');
 //  var  rawData = '';
 //  res.on('data', (chunk) => rawData += chunk);

 //  res.on('end', () => {
 //    try {
 //      var  parsedData = JSON.parse(rawData);
 //      // console.log(parsedData.events);
 //      for (var i = parsedData.events.length - 1; i >= 0; i--) {
 //      	eventlist.push(	parsedData.events[i].name.text);
 //        session.send(eventlist);

 //      }
 //      console.log(eventlist);

 //    } catch (e) {
 //      console.log(e.message);
 //    }
 //  });
	// }).on('error', (e) => {
 //  console.log(`Got error: ${e.message}`);
	// });
	 }
])