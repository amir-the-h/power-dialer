const {DIRECTION_INBOUND, DIRECTION_OUTBOUND, call_instance} = require('./constants');

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
  newCall: function(direction, from, to, status, sid) {
    this.lockState();
    const call_object = JSON.parse(JSON.stringify(call_instance))
    const call = Object.assign(call_object, {
      id: this.calls.length + 1,
      sid: sid,
      direction: direction,
      status: status,
      started_at: Date.now(),
      from: from,
      to: to,
    });
    this.calls.push(call);
    this.unlockState();
    return call;
  },
  addCall: function (call) {
    this.lockState();
    this.calls.push(call);
    this.unlockState();
  },
  getCall: function (id) {
    this.lockState();
    const data = this.calls.find(call => call.id === (+id));
    this.unlockState();
    return data;
  },
  getCallBySid: function (sid) {
    this.lockState();
    const data = this.calls.find(call => call.sid === sid);
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
  removeCall: function (id) {
    this.lockState();
    this.calls = this.calls.filter(call => call.id !== id);
    this.unlockState();
  },
};

module.exports = calls;