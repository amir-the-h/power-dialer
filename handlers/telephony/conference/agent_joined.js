const twilio = require('twilio');
const storage = require('../../../storage');
const bringCustomer = require('../../../helpers').bringCustomer;

module.exports = (req, res) => {
  console.log("Agent joined into the conference");
  // console.dir(req.body);

  // get call id from request params
  const callId = req.params.callId;
  // find call in storage
  let call = storage.getCall(callId);
  // check if the call exists
  if (!call) {
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say('Sorry, the call you are trying to join does not exist.');

    res.type('text/xml');
    res.send(twiml.toString());
    return;
  }

  // make an outbound call
  bringCustomer(call, process.env.TWILIO_CALLER_ID, call.to)
    .then(call => {
      // console.dir(call);
    })
    .catch(err => {
      console.error(err);
    });

  res.sendStatus(200);
}