const http = require('http');
const url = require('url');
const htmlHandler = require('./htmlHandler.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const urlStruct = {
  GET: {
    '/': htmlHandler.getIndex,
    '/style.css': htmlHandler.getCSS,
    '/getUsers': jsonHandler.getUsers,
    '/notReal': jsonHandler.notReal,
    notFound: jsonHandler.notReal,
  },
  POST: {
    '/addUser': jsonHandler.addUser,
  },
  HEAD: {
    '/getUsers': jsonHandler.getUsersMeta,
    '/notReal': jsonHandler.notRealMeta,
    notFound: jsonHandler.notRealMeta,
  },
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
    const body = [];
    request.on('error', (err) => {
      console.log(err);
      response.statusCode = 400;
      response.end();
    });
    request.on('data', (chunk) => {
      body.push(chunk);
    });
    request.on('end', () => {
      const bodyString = Buffer.concat(body).toString();
      const bodyParams = new URLSearchParams(bodyString);
      urlStruct[request.method][parsedUrl.pathname](request, response, bodyParams);
    });
  }

  // if the method is served by the server, and the path is not found, return the information
  if (urlStruct[request.method][parsedUrl.pathname]) {
    return urlStruct[request.method][parsedUrl.pathname](request, response);
  }

  // if we have reached the bottom without returning, give a 404
  return urlStruct.HEAD.notFound(request, response);
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1:${port}`);
});
