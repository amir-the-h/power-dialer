const storage = require('../storage');
const { STATUS_COMPLETED } = require('../constants');
const {logCallStep} = require('../helpers');
const formatDuration = require('../format_duration');

module.exports = (req, res) => {
  // get the call id, and isAgent from params
  const { callId } = req.params;

  // get the call from storage
  const call = storage.getCall(callId);
  // if the call is not found
  if (!call) {
    // send 404
    res.status(404).send();
    return;
  }

  // mark the call as completed
  call.status = STATUS_COMPLETED;
  call.endedAt = Date.now();

  // calculate the duration
  call.duration = (call.endedAt - call.calledAt) / 1000;
  call.talkTime = (call.endedAt - call.answeredAt) / 1000;
  call.waitTime = call.duration - call.talkTime;

  // if its an agent call
  if (call.isAgent) {
    // also remove the active call from storage
    storage.setActiveCall(null);
    // TODO:
    // we can drop all customer calls now the agent has left the party
    // or try to redial the agent
  }

  // flush the call from storage
  storage.flushCall(call);
  
  // log the call end and duration in human readable format
  logCallStep(call, `Call ended after ${formatDuration(call.duration)} while talked for ${formatDuration(call.talkTime)}`);

  // OK
  res.sendStatus(200);
};