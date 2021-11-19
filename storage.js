const { DIRECTION_INBOUND, DIRECTION_OUTBOUND, callInstance } = require('./constants');

// in-memory storage for calls
module.exports = {
  calls: [],
  activeCall: null,
  lock: false,
  lockState() {
    // wait until lock is released
    while (this.lock);
    this.lock = true;
  },
  unlockState() {
    this.lock = false;
  },
  flushCall(call) {
    this.lockState();
    this.calls = this.calls.filter(c => c.id !== call.id);
    this.unlockState();
    // TODO: store in database
  },
  getActiveCall() {
    this.lockState();
    const activeCall = this.activeCall;
    this.unlockState();
    return activeCall;
  },
  setActiveCall(call) {
    this.lockState();
    this.activeCall = call;
    this.unlockState();
  },
  getCallsCount() {
    this.lockState();
    const data = this.calls.length;
    this.unlockState();
    return data;
  },
  newCall(direction, from, to, status, sid) {
    this.lockState();
    const callObject = JSON.parse(JSON.stringify(callInstance))
    const call = Object.assign(callObject, {
      id: this.calls.length + 1,
      sid: sid,
      direction: direction,
      status: status,
      startedAt: Date.now(),
      from: from,
      to: to,
    });
    this.calls.push(call);
    this.unlockState();
    return call;
  },
  addCall(call) {
    this.lockState();
    this.calls.push(call);
    this.unlockState();
  },
  getCall(id) {
    this.lockState();
    const data = this.calls.find(call => call.id === (+id));
    this.unlockState();
    return data;
  },
  getCallBySid(sid) {
    this.lockState();
    const data = this.calls.find(call => call.sid === sid);
    this.unlockState();
    return data;
  },
  getCalls() {
    this.lockState();
    const data = this.calls;
    this.unlockState();
    return data;
  },
  getInboundCalls() {
    this.lockState();
    const data = this.calls.filter(call => call.direction === DIRECTION_INBOUND);
    this.unlockState();
    return data;
  },
  getOutboundCalls() {
    this.lockState();
    const data = this.calls.filter(call => call.direction === DIRECTION_OUTBOUND);
    this.unlockState();
    return data;
  },
  removeCall(id) {
    this.lockState();
    this.calls = this.calls.filter(call => call.id !== id);
    this.unlockState();
  },
};
