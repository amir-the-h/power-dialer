const { call_instance } = require('./constants');
const storage = require('./storage');

// create a call instance from incoming call request
function createCallFromIncomingCallRequest(body) {
  // close call from call_instance
  const call = Object.assign(call_instance, {
    sid: body.CallSid,
    status: body.CallStatus,
    direction: body.Direction,
    from: body.From,
    to: body.To,
    start_timestamp: Date.now()
  })

  return call;
}

// check if the incoming call exists in the storage or add it
function findOrCreateCallFromIncomingCallRequest(body) {
  let call = storage.getCall(body.CallSid)
  // if call is not found in storage, create it
  if (!call) {
    call = createCallFromIncomingCallRequest(body);
    storage.addCall(call);
  }

  return call;
}

// export all functions
module.exports = {
  createCallFromIncomingCallRequest,
  findOrCreateCallFromIncomingCallRequest
};