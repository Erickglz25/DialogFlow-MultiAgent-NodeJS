const express = require('express');
const bodyParser = require('body-parser');
const apiai = require('apiai');
const mongoose = require('mongoose');
const Agent = require('./models/agent');

require('dotenv').config();
const config = require('./config/config');


let message = 'Hola';     // peticion default para el servidor
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

app.post('/send-messages',config._checkToken,function(req,res,next) {
    
    if(req.body.UserMsg) message = req.body.UserMsg;

    Agent.findOne({agentName: req.body.UserName},function(error,myagent){

        if(error) return res.status(501).json(error);
        if(myagent == null) return res.status(404).json('agent not found');

        let dialogflow = apiai(myagent.agentToken);

        var request = dialogflow.textRequest(message, {
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
    /*res.status(200).json(z);
    next();*/// pruebas de rendimiento
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

