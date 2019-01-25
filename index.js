const express = require('express');
const bodyParser = require('body-parser');
const apiai = require('apiai');
const mongoose = require('mongoose');
const Agent = require('./models/agent');

require('dotenv').config();
const config = require('./config/config');

let AgentNameLocal = "locx4d4SW";
let AgentTokenLocal = "n7Ab$SWS4r"
let AgentSessionLocal = "d4rAc4jd54&"

let z =0;
const app = express();


mongoose.set('useCreateIndex', true)
mongoose.connect(process.env.MONGODB_URI,{ useNewUrlParser: true });

const db = mongoose.connection;

db.on('error', console.log.bind(console, 'connection error:'));

db.once('open', function() {
  console.log('Connection Success');
})

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.post('/send-messages',config._checkToken,config._reviewBasics,function(req,res,next) {
    console.log(z++);
    
    if( AgentNameLocal === req.body.UserName ){

        let dialogflow = apiai(AgentTokenLocal);

        var request = dialogflow.textRequest(req.body.UserMsg, {
            sessionId: AgentSessionLocal || 'M4ND78ND'
        });

        request.on('response', function(response) { 
            console.log(response.result.metadata.isFallbackIntent,response.result.metadata.intentName);
            
            if (response.result.metadata.isFallbackIntent === 'true'  || response.result.metadata.intentName === 'support.problem')
                return res.status(201).json("Bot Asking For Help"); 

            return res.status(200).json(response.result.fulfillment['speech']);
        });
    
        request.on('error', function(error) {
            return res.status(501).json(error);
        });
    
        request.end();

    }else{
        
        Agent.findOne({agentName: req.body.UserName},function(error,myagent){

            if(error) return res.status(501).json(error);
            if(myagent == null) return res.status(404).json('agent not found');

            AgentNameLocal = myagent.agentName;
            AgentSessionLocal = myagent.agentSession;
            AgentTokenLocal = myagent.agentToken;
    
            let dialogflow = apiai(myagent.agentToken);
    
            var request = dialogflow.textRequest(req.body.UserMsg, {
                sessionId: myagent.agentSession || 'M4ND78ND'
            });
            
            request.on('response', function(response) {        
                return res.status(200).json(response.result.fulfillment['speech']);
            });
        
            request.on('error', function(error) {
                return res.status(501).json(error);
            });
        
            request.end();
        });
    }

});

app.post('/create-agent',config._checkToken,function(req,res) { 
  
    var agent = new Agent({
        agentName: req.body.Name,
        agentToken: req.body.ClientToken,
        agentStatus: true,
        agentSession: req.body.Name+'Session'
    });
    
    agent.save(function(err,result){
        if(err) return res.status(504).json(err);
        return res.status(200).json("Agent succesfully created");     
    }); 

});

app.listen((process.env.PORT || 3000), () => {
    console.log("Server is up and running...");
});

app.use(function(err, req, res, next) {
    
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // render the error page
    res.status(err.status || 500);
    next();
  });

