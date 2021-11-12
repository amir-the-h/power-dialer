const twilio = require('twilio');
const storage = require('../../../storage');
const createCallFromIncomingCallRequest = require('../../../helpers').createCallFromIncomingCallRequest;
const generateConferenceRoomName = require('../../../helpers').generateConferenceRoomName;

module.exports = (req, res) => {
  console.log("Customer call status.");
  // console.dir(req.body);

  // get call id from request params
  const callId = req.params.callId;
  // find call in storage
  let call = storage.getCall(callId);
  // check if the call exists
  if (!call) {
    return res.status(404).send('Call not found');
  }

  // update the call status
  call.status = req.body.CallStatus;

  return res.sendStatus(200);
}