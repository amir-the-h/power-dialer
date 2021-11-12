const twilio = require('twilio');
const storage = require('../../../storage');
const createCallFromIncomingCallRequest = require('../../../helpers').createCallFromIncomingCallRequest;
const generateConferenceRoomName = require('../../../helpers').generateConferenceRoomName;

module.exports = (req, res) => {
  console.log("Customer answered call.");
  // console.dir(req.body);

  // get destination call id from request params
  const destinationCallId = req.params.callId;
  // find call in storage
  let destinationCall = storage.getCall(destinationCallId);
  // check if the call exists
  if (!destinationCall) {
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say('Sorry, the call you are trying to join does not exist.');

    res.type('text/xml');
    res.send(twiml.toString());
    return;
  }

  // create current call object from request body
  const call = createCallFromIncomingCallRequest(req.body);
  call.answered_at = Date.now();

  const twiml = new twilio.twiml.VoiceResponse();
  const dial = twiml.dial();
  // create conference name
  const conferenceName = generateConferenceRoomName(destinationCall);
  // dial the conference
  dial.conference(conferenceName, {
    participantLabel: 'Customer',
    startConferenceOnEnter: true,
    endConferenceOnExit: false,
    statusCallback: `${process.env.BASE_URL}/conference/${call.id}/status`,
    statusCallbackEvent: 'join leave',
  });

  res.type('text/xml');
  res.send(twiml.toString());
}