// add express package and create a new express app
const express = require('express');
const bodyParser = require('body-parser').urlencoded({ extended: false });
const app = express();
const handlers = require('./handlers');

// set views directory
app.set('views', './views');
// set pug as view engine
app.set('view engine', 'pug');
// set public directory
app.use(express.static(__dirname + '/public'));
// set the body parser to parse body of incoming requests
app.use(bodyParser);

// routes
app.get('/', handlers.homePage);
// telephony webhook
app.post('/call', handlers.telephony.call.agent);
app.post('/call/status', handlers.telephony.call.status);
app.post('/call/fallback', handlers.telephony.call.fallback);
app.post('/call/:callId/customer', handlers.telephony.call.customerAnswered);
app.post('/call/:callId/status', handlers.telephony.call.customerStatus);
// conference webhook
app.post('/conference/:callId/status', handlers.telephony.conference.status);

// return a not found error on any other route
app.all('*', (req, res) => {
  console.error(req.method, req.url, req.body, req.headers);
  res.status(404).send('Not Found');
});

module.exports = app;