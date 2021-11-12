const STATUS_FAILED = require('../../../constants').STATUS_FAILED;
const storage = require('../../../storage');

module.exports = (req, res) => {
  // log the call error request
  console.log('Call error');
  // console.dir(req.body);

  // find the call by id
  const callSid = req.body.CallSid;
  let call = storage.getCallBySid(callSid);

  // check if the call was not found
  if (!call) {
    // return a 404 not found
    res.status(404).send('Call not found');
    return;
  }

  // update the call status
  call.status = STATUS_FAILED;

  // return a success response
  res.sendStatus(200);
}