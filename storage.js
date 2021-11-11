const {DIRECTION_INBOUND, DIRECTION_OUTBOUND} = require('./constants');

// in-memory storage for calls
const calls = {
  calls: [],
  lock: false,
  async lockState() {
    // wait until lock is released
    while (this.lock) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    this.lock = true;
  },
  unlockState() {
    this.lock = false;
  },
  getCallsCount() {
    this.lockState();
    const data = this.calls.length;
    this.unlockState();
    return data;
  },
  addCall: function (call) {
    this.lockState();
    this.calls.push(call);
    this.unlockState();
  },
  getCall: function (call_sid) {
    this.lockState();
    const data = this.calls.find(call => call.sid === call_sid);
    this.unlockState();
    return data;
  },
  getCalls: function () {
    this.lockState();
    const data = this.calls;
    this.unlockState();
    return data;
  },
  getInboundCalls: function () {
    this.lockState();
    const data = this.calls.filter(call => call.direction === DIRECTION_INBOUND);
    this.unlockState();
    return data;
  },
  getOutboundCalls: function () {
    this.lockState();
    const data = this.calls.filter(call => call.direction === DIRECTION_OUTBOUND);
    this.unlockState();
    return data;
  },
  updateCall: function (call_sid, call) {
    this.lockState();
    const index = this.calls.findIndex(call => call.sid === call_sid);
    this.calls[index] = call;
    this.unlockState();
  },
  removeCall: function (call_sid) {
    this.lockState();
    this.calls = this.calls.filter(call => call.call_sid !== call_sid);
    this.unlockState();
  },
};

module.exports = calls;