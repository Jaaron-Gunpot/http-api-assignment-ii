const http = require('http');
const url = require('url');
const query = require('querystring');
const htmlHandler = require('./htmlHandler.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const urlStruct = {
    "GET": {
        '/': htmlHandler.getIndex,
        '/style.css': htmlHandler.getCSS,
        '/getUsers': jsonHandler.getUsers,
        '/notReal': jsonHandler.notReal,
        notFound: jsonHandler.notReal,
    },
    "POST": {
        '/addUser': jsonHandler.addUser,
    },
    "HEAD": {
        '/getUsers': jsonHandler.getUsersMeta,
        '/notReal': jsonHandler.notRealMeta,
        notFound: jsonHandler.notRealMeta,
    },
};

const parseBody = (request, response, handler) => {
    // The request will come in in pieces. We will store those pieces in this
    // body array.
    const body = [];

    // The body reassembly process is event driven, much like when we are streaming
    // media like videos, etc. We will set up a few event handlers. This first one
    // is for if there is an error. If there is, write it to the console and send
    // back a 400-Bad Request error to the client.
    request.on('error', (err) => {
        console.dir(err);
        response.statusCode = 400;
        response.end();
    });

    // The second possible event is the "data" event. This gets fired when we
    // get a piece (or "chunk") of the body. Each time we do, we will put it in
    // the array. We will always recieve these chunks in the correct order.
    request.on('data', (chunk) => {
        body.push(chunk);
    });

    // The final event is when the request is finished sending and we have recieved
    // all of the information. When the request "ends", we can proceed. Turn the body
    // array into a single entity using Buffer.concat, then turn that into a string.
    // With that string, we can use the querystring library to turn it into an object
    // stored in bodyParams. We can do this because we know that the client sends
    // us data in X-WWW-FORM-URLENCODED format. If it was in JSON we could use JSON.parse.
    request.on('end', () => {
        const bodyString = Buffer.concat(body).toString();
        const bodyParams = query.parse(bodyString);

        // Once we have the bodyParams object, we will call the handler function. We then
        // proceed much like we would with a GET request.
        handler(request, response, bodyParams);
    });
};


const onRequest = (request, response) => {
    const parsedUrl = url.parse(request.url);

    // if the method is not served by the server, return a 404 status code
    if (!urlStruct[request.method]) {
        return urlStruct.HEAD.notFound(request, response);
    }

    // handles post requests
    if (request.method === 'POST') {
        // if the url is not under post, return a 404
        if (!urlStruct[request.method][parsedUrl.pathname]) {
            return urlStruct.HEAD.notFound(request, response);
        }
        parseBody(request, response, urlStruct[request.method][parsedUrl.pathname]);
        //I don't know why this return is needed and i am scared to remove it
        return;
    }

    // if the method is served by the server, and the path is found, return the information
    if (urlStruct[request.method][parsedUrl.pathname]) {
        return urlStruct[request.method][parsedUrl.pathname](request, response);
    }

    // if we have reached the bottom without returning, give a 404
    return urlStruct.HEAD.notFound(request, response);
};

http.createServer(onRequest).listen(port, () => {
    console.log(`Listening on 127.0.0.1:${port}`);
});
