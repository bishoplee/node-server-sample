/*
* Server entry file
*
*/

// Dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;


// Instantiate HTTP server
const httpServer = http.createServer((req, res) => {
    // Get URL and parse
    const parsedURL = url.parse(req.url, true);

    // Get path
    const path = parsedURL.pathname;

    // Trim path
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get query string as object
    const queryStringObject = parsedURL.query;

    // Get HTTP method
    const method = req.method.toLowerCase();

    // Get headers
    const headers = req.headers;

    // Get payload, if any
    const decoder = new StringDecoder('utf-8');

    // Get stream values into buffer
    let buffer = '';

    // Process payload stream
    req.on('data', data => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();

        // Point to handler in route, if not found, go to notFound
        const useHandler = typeof (route[trimmedPath]) !== "undefined" ? route[trimmedPath] : handlers.notFound;

        // Prepare data to send to handler
        const data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': buffer
        };

        // Route request to specified handler
        useHandler(data, (statusCode = 200, payload = {}) => {
            const payloadString = JSON.stringify(payload);

            // Send back response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);

            // Log response
            console.log("Response contains", statusCode, payloadString);
        });
    });
});

// Start http server and define port to listen on
httpServer.listen(3000, () => {
    console.log("Server listening on http port 3000");
});

//Define handlers
const handlers = {};

// Not found error handler
handlers.notFound = (data, callback) => {
    callback(404, {
        'message': 'Unfortunately, there\'s nothing for you at this time',
    });
};

// if route is /hello
handlers.hello = (data, callback) => {
    // Callback http status code and payload object
    callback(200, {'message' : 'Welcome to the barebone node server created for my Pirple Node.js Master Class assignment.'});
};

// Define routes
const route = {
    'hello': handlers.hello,
};