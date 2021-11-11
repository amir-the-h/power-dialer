// import env variables from .env file
require('dotenv').config();

// server port
const port = process.env.PORT || 3000;

// add twilio package and create a new twilio client
// twilio package will automatically import credentials from environment variables
const twilio = require('twilio');
const AccessToken = require("twilio").jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;
const client = new twilio();

// also add express package and create a new express app
const express = require('express');
const bodyParser = require('body-parser').urlencoded({ extended: false });
const app = express();

// in-memory storage of calls
const storage = require('./storage');

// helper functions
const { findOrCreateCallFromIncomingCallRequest } = require('./helpers.js');
const { STATUS_FAILED, DIRECTION_INBOUND } = require('./constants');

// set views directory
app.set('views', './views');
// set pug as view engine
app.set('view engine', 'pug');
// set public directory
app.use(express.static('public'));
// set the body parser to parse body of incoming requests
app.use(bodyParser);

// routes
// render the index page
app.get('/', (req, res) => {
  // generate a random device token
  const identity = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  // create a new access token
  accessToken = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY,
    process.env.TWILIO_API_SECRET
  );
  // set the identity of the access token
  accessToken.identity = identity;

  // grant access to Twilio Voice
  const grant = new VoiceGrant({
    outgoingApplicationSid: process.env.TWILIO_APP_SID,
    incomingAllow: true,
  });
  accessToken.addGrant(grant);

  res.render('index', { identity: identity, token: accessToken.toJwt(), });
});


// telephony webhook
// incoming call route
app.post('/voice', (req, res) => {
  // log the call request
  console.log('Incoming call from ' + req.body.From);

  // find or create the call
  const call = findOrCreateCallFromIncomingCallRequest(req.body);

  // check if it is from webrtc by checking the patter "client:"
  if (call.direction == DIRECTION_INBOUND && call.from.indexOf('client:') === 0) {
    // TODO: create a new outbound call and connect it to the incoming call
    // it should be done by another function
  }

  // create a twiml response and redirect call to waiting room
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.redirect('/waiting');

  // return the twiml response
  res.type('text/xml');
  res.send(twiml.toString());
});

// incoming call status route
app.post('/voice/status', (req, res) => {
  // log the incoming call status
  console.log('Incoming call status');
  console.dir(req.body);

  // find the call in the storage
  const call_sid = req.body.CallSid;
  let call = storage.getCall(call_sid);
  // check if the call was not found
  if (!call) {
    // return a 404 not found
    res.status(404).send('Call not found');
    return;
  }

  // update the call status
  call.status = req.body.CallStatus;

  // update the storage
  storage.updateCall(call_sid, call);

  // return a success response
  res.sendStatus(200);
});

// call error route
app.post('/voice/fallback', (req, res) => {
  // log the call error
  console.log('Call error');
  console.dir(req.body);

  // find the call in the storage
  const call_sid = req.body.CallSid;
  let call = storage.getCall(call_sid);

  // check if the call was not found
  if (!call) {
    // return a 404 not found
    res.status(404).send('Call not found');
    return;
  }

  // update the call status
  call.status = STATUS_FAILED;

  // update the storage
  storage.updateCall(call_sid, call);

  // return a success response
  res.sendStatus(200);
});

// waiting room route
app.post('/waiting', (req, res) => {
  // find the call in the storage
  const call_sid = req.body.CallSid;
  const call = storage.getCall(call_sid);
  
  // check if the call was not found
  if (!call) {
    // return a 404 not found
    res.status(404).send('Call not found');
    return;
  }

  // create a twiml response and say the wait message
  const twiml = new twilio.twiml.VoiceResponse();

  // say the wait message
  twiml.say('Please wait while we connect your call...');

  // wait for a while
  twiml.pause({
    length: 5,
  });

  // and redirect back here
  twiml.redirect('/waiting');

  // return the twiml response
  res.type('text/xml');
  res.send(twiml.toString());
});

// not found route
app.get('/not-found', (req, res) => {
  // log the request
  console.log('Not found');
  console.dir(req.body);

  // create a twiml response and say hello
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say('Sorry but your call is not in our storage. Bye bye!');

  // return the twiml response
  res.type('text/xml');
  res.send(twiml.toString());
});

// return a not found error on any other route
app.all('*', (req, res) => {
  console.error(req.method, req.url, req.body, req.headers);
  res.status(404).send('Not Found');
});

// run the express app on port 3000
app.listen(port, () => {
  console.log(`Listenting on http://localhost:${port}`);
});
