const express = require('express');
const bodyParser = require('body-parser');
const apiai = require('apiai');
const mongoose = require('mongoose');
const Agent = require('./models/agent');
const Promise = require('promise');

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
    
    if( AgentNameLocal === req.body.UserName ){
        console.log(z++);
        
        function getDialogFlow(){  
            return new Promise((res,rej) =>{
 
                var request = apiai(AgentTokenLocal).textRequest(req.body.UserMsg, {
                    sessionId: req.body.UserName+'session'
                });

                res(request);
            })
        }
    
        getDialogFlow()

            .then((request)=>{
        
                request.on('response', function(response) { 
                    
                    if (response.result.metadata.isFallbackIntent === 'true'  || response.result.metadata.intentName === 'support.problem')
                        return res.status(201).json("Bot Asking For Help"); 
        
                    return res.status(200).json(response.result.fulfillment['speech']);
                });
            
                request.on('error', function(error) {
                    return res.status(501).json(error);
                });
            
                request.end();
            })
            .catch((err) => {
                return res.status(403).json(err);
            });

    }else{
                
        function SaveAgent(){  
            return new Promise((res,rej) =>{

                Agent.findOne({agentName: req.body.UserName},function(error,myagent){
                    
                    if(error) rej(error);
                    if(myagent == null) rej('agent not found');
        
                    res(myagent);     
                }); 
            })
        }
        
        SaveAgent()
            .then((myagent) => {
        
                AgentNameLocal = myagent.agentName;
                AgentSessionLocal = myagent.agentSession;
                AgentTokenLocal = myagent.agentToken;

                let dialogflow = apiai(myagent.agentToken);
                return dialogflow;

            })
            .then((dialogflow)=>{
                var request = dialogflow.textRequest(req.body.UserMsg, {
                    sessionId: req.body.UserName+'session' || 'M4ND78ND'
                });
                return request;
            })
            .then((request)=>{
        
                request.on('response', function(response) {     
                        
                    if (response.result.metadata.isFallbackIntent === 'true'  || response.result.metadata.intentName === 'support.problem')
                        return res.status(201).json("Bot Asking For Help"); 

                    return res.status(200).json(response.result.fulfillment['speech']);
                });
            
                request.on('error', function(error) {
                    return res.status(500).json(error);
                });
            
                request.end();
        
            })
            .catch((err) => {
                return res.status(403).json(err);
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

    return new Promise((res,rej) =>{
        agent.save(function(err,result){
            if(err) rej(err);
            res();     
        }); 
    }).then(()=>{
        return res.status(200).json('Agent succesfully created inside a promise');
    })
    .catch((err) => {
       return res.status(403).json(err);
    });

    /*ejemplo de promesas y conexion a la base de datos en sandbox
    function saveagent(){
        return new Promise(
            (resolve,reject)=>{
                let x = 5;
                resolve(x);
            })
    }

    saveagent()
        .then((result) => {
            console.log(result);
            return result;
        })
        .then((result2)=>{
            result2+=1;
            console.log(result2);
            return res.send('ok');
        })
        .catch((err) => {
            console.log(err);
           return res.send('bad');
        });
    */

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

  
