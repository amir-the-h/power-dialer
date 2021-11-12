const storage = require('../../../storage');

module.exports = (req, res) => {
  // log the call status request
  const callSid = req.body.CallSid;
  console.log('Call status');
  // console.dir(req.body);

  // find the call by id
  let call = storage.getCallBySid(callSid);
  // check if the call was not found
  if (!call) {
    // return a 404 not found
    res.status(404).send('Call not found');
    return;
  }

  // update the call status
  call.status = req.body.CallStatus;

  // return a success response
  res.sendStatus(200);
}