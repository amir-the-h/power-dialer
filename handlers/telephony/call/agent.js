// import twilio package
const twilio = require('twilio');
const findOrCreateCallFromIncomingCallRequest = require('../../../helpers').findOrCreateCallFromIncomingCallRequest;
const generateConferenceRoomName = require('../../../helpers').generateConferenceRoomName;
const rejectCall = require('../../../helpers').rejectCall;
const storage = require('../../../storage');
const DIRECTION_INBOUND = require('../../../constants').DIRECTION_INBOUND;

module.exports = (req, res) => {
  // log the call request
  console.log('Incoming call from ' + req.body.From);
  // console.dir(req.body);

  // find or create the call
  const call = findOrCreateCallFromIncomingCallRequest(req.body);
  call.answered_at = Date.now();

  // only accept inbound webrtc calls by validating From parameter with pattern "client:"
  if (call.direction === DIRECTION_INBOUND && req.body.From.indexOf('client:') === 0) {
    // create a dial object first
    const response = new twilio.twiml.VoiceResponse();
    const dial = response.dial();
    // create a conference name
    const conferenceName = generateConferenceRoomName(call);
    // then put the customer first
    // end the conference when the customer hangs up
    dial.conference(conferenceName, {
      startConferenceOnEnter: false,
      endConferenceOnExit: true,
      participantLabel: 'Agent',
      statusCallback: `${process.env.BASE_URL}/conference/${call.id}/status`,
      statusCallbackEvent: 'join leave',
      waitUrl: 'https://twimlets.com/holdmusic?Bucket=com.twilio.music.guitars&Message=we%20are%20dialing%20out.%20stay%20on%20the%20line.',
    });

    // return the twiml response
    res.send(response.toString());
    return;
  }

  rejectCall(call, res);
}