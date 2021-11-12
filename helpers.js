const twilio = require('twilio');
const DIRECTION_OUTBOUND = require('./constants').DIRECTION_OUTBOUND;
const storage = require('./storage');

// create a call instance from incoming call request
function createCallFromIncomingCallRequest(body) {
  return storage.newCall(body.Direction, body.From, body.To, body.CallStatus, body.CallSid);
}

// check if the incoming call exists in the storage or add it
function findOrCreateCallFromIncomingCallRequest(body) {
  let call = storage.getCallBySid(body.CallSid)
  // if call is not found in storage, create it
  if (!call) {
    call = createCallFromIncomingCallRequest(body);
  }

  return call;
}

// reject the incoming call
function rejectCall(call, res) {
  // update call timestamp
  call.ended_at = Date.now();


  // create a reject response
  const twiml = new twilio.twiml.VoiceResponse();
  // twiml.reject({ reason: 'not accepting incomings' });
  twiml.say('Sorry, I am not accepting incoming calls right now.');
  twiml.hangup();

  // send twiml response
  res.type('text/xml');
  res.send(twiml.toString());

  return;
}

// make a new outbound call and send it to the conference room
function bringCustomer(destinationCall, from, to) {
  const client = new twilio();
  // create a new promise
  return new Promise((resolve, reject) => {
    // create a new outbound call
    const call = storage.newCall(DIRECTION_OUTBOUND, from, to);
    client.calls.create({
      from: from,
      to: to,
      url: `${process.env.BASE_URL}/call/${destinationCall.id}/customer`,
      statusCallback: `${process.env.BASE_URL}/call/${destinationCall.id}/status`,
    })
      .then(outboundCall => {
        call.sid = outboundCall.sid;
        resolve(call);
      })
      .catch(err => {
        reject(err);
      });
  });
}

// simple phone number validation
function validatePhoneNumber(phoneNumber) {
  const regex = /^\+?[0-9]{10,15}$/;
  return regex.test(phoneNumber);
}

// generate conference room name
function generateConferenceRoomName(call) {
  return `conference-${call.id}`;
}

// export all functions
module.exports = {
  createCallFromIncomingCallRequest,
  findOrCreateCallFromIncomingCallRequest,
  rejectCall,
  bringCustomer,
  validatePhoneNumber,
  generateConferenceRoomName,
};