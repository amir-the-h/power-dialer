// call instance of storage
const callInstance = {
  id: 0,
  sid: '',
  status: '',
  direction: '',
  from: '',
  to: '',
  duration: 0,
  talkTime: 0,
  waitTime: 0,
  answeredAt: 0,
  calledAt: 0,
  startedAt: 0,
  endedAt: 0,
  isAgent: false,
  conference: {
    friendlyName: '',
  },
  logs: []
};

// directions of call
const DIRECTION_INBOUND = 'inbound';
const DIRECTION_OUTBOUND = 'outbound';

// statuses of call
const STATUS_INITIAL = 'initial';
const STATUS_RINGING = 'ringing';
const STATUS_IN_PROGRESS = 'in-progress';
const STATUS_CONNECTED = 'connected';
const STATUS_COMPLETED = 'completed';
const STATUS_BUSY = 'busy';
const STATUS_FAILED = 'failed';
const STATUS_NO_ANSWER = 'no-answer';
const STATUS_CANCELED = 'canceled';

// participants labels
const PARTICIPANT_AGENT = 'Agent';
const PARTICIPANT_CUSTOMER = 'Customer';

// webrtc identities
const WEBRTC_IDENTITY_AGENT = 'agent';
const WEBRTC_IDENTITY_MODERATOR = 'moderator';

// export all constants
module.exports = {
  callInstance,
  DIRECTION_INBOUND,
  DIRECTION_OUTBOUND,
  STATUS_INITIAL,
  STATUS_RINGING,
  STATUS_IN_PROGRESS,
  STATUS_CONNECTED,
  STATUS_COMPLETED,
  STATUS_BUSY,
  STATUS_FAILED,
  STATUS_NO_ANSWER,
  STATUS_CANCELED,
  PARTICIPANT_AGENT,
  PARTICIPANT_CUSTOMER,
  WEBRTC_IDENTITY_AGENT,
  WEBRTC_IDENTITY_MODERATOR,
};
