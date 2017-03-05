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
    "Show events by date": {},
    "Show events within next few days": {}
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
      else if(results.response.entity== "Show events within next few days")
      {
        session.beginDialog('/fetchEventsNextFewDays', session.userData.profile);
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
		
  	http.get(api_url +"events/search/"+ authkey+"&location.address=delhi", (res) => {
  
    session.beginDialog('/url',res);
 
	}).on('error', (e) => {
  console.log(`Got error: ${e.message}`);
	});
	}
]);

bot.dialog('/fetchByDate', [
	function (session, args, next) {
	builder.Prompts.time(session, "Enter the date ");
	 },
	 function (session, results, next) {
	  var time= (builder.EntityRecognizer.resolveTime([results.response])).toISOString().slice(0,19);
    //session.send(api_url +"events/search/"+ authkey+"&start_date.range_start="+time+"&start_date.range_end="+time);
	 	  	http.get(api_url +"events/search/"+ authkey+"&start_date.range_start="+time+"&start_date.range_end="+time+"&location.address=delhi", (res) => {

          session.beginDialog('/url',res);
	 }).on('error', (e) => {
  console.log(`Got error: ${e.message}`);
  });
  }
]);

bot.dialog('/fetchEventsNextFewDays', [
  function (session, args, next) {
  builder.Prompts.number(session, "Enter no of days: ");
   },
   function (session, results, next) {
    //results.response;
    var no_day=results.response;
    var date_now= new Date();// Date.now();
    var date_now1= new Date();
    date_now1.setDate(date_now.getDate()+no_day);
    //session.send(date_now.toString());
    var time= date_now.toISOString().slice(0,19);
    var time1= date_now1.toISOString().slice(0,19);
    //session.send(time);
    //session.send(api_url +"events/search/"+ authkey+"&start_date.range_start="+time+"&start_date.range_end="+time1);
       http.get(api_url +"events/search/"+ authkey+"&start_date.range_start="+time+"&start_date.range_end="+time1+"&location.address=delhi", (res) => {

        session.beginDialog('/url',res);
  }).on('error', (e) => {
   console.log(`Got error: ${e.message}`);
   });
  }
]);

bot.dialog('/url', [
    function (session, res, next) {
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
      for (var i =0 ; i < Math.min(parsedData.events.length,10) ; i++) {
        eventlist.push( parsedData.events[i].name.text);
        session.send(eventlist);

      }
      console.log(eventlist);

    } catch (e) {
      console.log(e.message);
    }
  });
    }
]);

// bot.dialog('/getEventsName', [
//     function (session, args, next) {
       
//     }
// ]);