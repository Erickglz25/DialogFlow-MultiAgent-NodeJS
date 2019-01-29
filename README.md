# DialogFlow Chatbot API multi-agent apiai
###### Documentation - Última actualización Viernes 25/01/2019 "Status: Testing"

### Funciones y rutas

**Async/Await Version:same logic improved performance: factor 1.4**

**app.post('/send-messages')**

La ruta /send-messages recibe 3 parametros, el token de acceso, el nombre del agente(bot) como aparece en la base de datos, y el mensaje que se procesará 

El primer if compara si el flujo de mensajes tienen como destinatario el mismo agente, de ser cierto usa los valores de las variables AgentNameLocal, AgentTokenLocal, AgentSessionLocal. De lo contrario busca las credenciales en la base de datos, guarda esos mismos valores en las variables mencionadas para la proxima iteración, el proposito es aumentar el rendimiento, disminuyendo las consultas a la base de datos

* **CASO : request.on = response**
    Devuleve la respuesta ya procesada por DialogFlow,
    la condicion if revisa si el agente entendio la peticion del usuario, o si el usuario pregunta al especifico, en caso de ser cierto devuelve la bandera "Bot Asking For Help" con un status 201, el proceso fue exitoso, pero se requiere atencion para dicho mensaje

**app.post('/Create agent')**

La ruta /create-agent puede ser usada de forma opcional para incluir nuevos agentes(bots) a la base de datos, recibe 3 parametros, el token de acceso del servidor, el token de cliente del agente y un nombre (mongoose unique, not active).

> Función _checkToken revisa el token de acceso del servidor, se incluye por "process.env.TOKEN_ACCESS"

> Funcion _reviwBasics (opcional/en desarrollo) revisa las coincidencias con los mensajes más comunes, evita la peticion a DialogFlow y aumenta el rendimiento del servidor
________________________________________

### Ejemplo de cliente



    let MyData = { //// Remplazar con el mensaje de cada usuario
        "UserName":"Hosting1A", // O el cliente del token
        "UserMsg": "Hola",
        "AccessToken": 'iusybe87ybc88um9m8uxw'
    }; 

    request.post('https://5be318fe.ngrok.io/send-messages',
    {form:MyData},
    function (error, response, body) {
        if(error) res.status(501).json(error); 

        if(response.statusCode == 201){
            res.send('Agent asking for help'); //El bot no entiende lo que el usuario quiere o el usuario pregunta algo especifico
        }else{
            res.send(body); // Respuesta normal
        }
    });

>
    
    let MyData = { //// Remplazar con el mensaje de cada usuario
        "Name":"Hosting1B",
        "ClientToken": "iduheiu",
        "AccessToken": 'iusybe87ybc88um9m8uxw'
    }; 

    request.post('https://bf6f5a39.ngrok.io/create-agent',
    {form:MyData},
    function (error, response, body) {
        if(error) res.status(501).json(error); 

        if(response.statusCode == 200){
            res.send(body); // Data and code ...
        }else
        res.send('error al crear el agente'); //handle your own error
    });







