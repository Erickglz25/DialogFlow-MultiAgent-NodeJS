const express = require('express');
const bodyParser = require('body-parser');
const apiai = require('apiai');

const tokens = [
"d6af728b47e0421b89b013c4e9025833","221470edcacb46ee9a095ca3af5c4b49"
]

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.post('/send-messages',function (req,res,next) {

    let message = 'Hola';     // peticion default para el servidor
    let AgentName = req.body.UserName; 

    if(req.body.UserMsg) message = req.body.UserMsg;
 
    let dialogflow = apiai(tokens[AgentName]);

    var request = dialogflow.textRequest(message, {
        sessionId: 'mr4ehd'
    });

    request.on('response', function(response) {
        res.status(200).json(response.result.fulfillment['speech']);
    });

    request.on('error', function(error) {
        res.status(501).json(error);
    });

    request.end();  
    //next();
});

app.listen((process.env.PORT || 3000), () => {
    console.log("Server is up and running...");
});

