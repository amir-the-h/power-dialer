const twilio = require('twilio');
const storage = require('../../../storage');

module.exports = (req, res) => {
  const callId = req.params.callId;
  console.log("Agent left the conference");
  // console.dir(req.body);

  // get call id from request params
  // find call in storage
  let call = storage.getCall(callId);
  // check if the call exists
  if (!call) {
    res.status(404).send('Call not found');
    return;
  }

  call.ended_at = Date.now();
  call.duration = (call.ended_at - call.started_at) / 1000;
  console.log(`Call #${call.id} lasted ${call.duration} seconds`);
  
  res.sendStatus(200);
}