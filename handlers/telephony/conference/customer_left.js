const twilio = require('twilio');
const storage = require('../../../storage');

module.exports = (req, res) => {
  console.log("Customer left the conference.");
  // console.dir(req.body);

  // get the call from storage
  const call = storage.getCallBySid(req.body.CallSid);

  // check if the call exists
  if (!call) {
    res.status(404).send('Call not found');
    return;
  }

  // update the call ended_at timestamp
  call.ended_at = Date.now();
  call.duration = (call.ended_at - call.started_at) / 1000;
  console.log(`Call ${call.id} lasted ${call.duration} seconds`);

  res.sendStatus(200);
}