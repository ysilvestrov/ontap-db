// server.js
const express = require('express');
const path = require('path');
const proxy = require('http-proxy-middleware');

const app = express();
// Run the app by serving the static files
// in the dist directory
app.use(express.static(__dirname + '/dist/ontap-db'));
// Start the app by listening on the default
// Heroku port

const apiProxy = proxy('/api', {target: 'https://ontap.in.ua', changeOrigin: true, logLevel: 'debug'});
app.use(apiProxy);

// For all GET requests, send back index.html
// so that PathLocationStrategy can be used
app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname + '/dist/ontap-db/index.html'));
});

app.listen(process.env.PORT || 5000);
