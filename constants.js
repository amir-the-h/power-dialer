// call instance of storage
const call_instance = {
  sid: '',
  status: '',
  direction: '',
  from: '',
  to: '',
  duration: 0,
  start_timestamp: 0,
  end_timestamp: 0,
};

// directions of call
const DIRECTION_INBOUND = 'inbound';
const DIRECTION_OUTBOUND = 'outbound';

// statuses of call
const STATUS_INITIAL = 'initial';
const STATUS_RINGING = 'ringing';
const STATUS_CONNECTED = 'connected';
const STATUS_COMPLETED = 'completed';
const STATUS_BUSY = 'busy';
const STATUS_FAILED = 'failed';
const STATUS_NO_ANSWER = 'no-answer';
const STATUS_CANCELED = 'canceled';

// export all constants
module.exports = {
  call_instance,
  DIRECTION_INBOUND,
  DIRECTION_OUTBOUND,
  STATUS_INITIAL,
  STATUS_RINGING,
  STATUS_CONNECTED,
  STATUS_COMPLETED,
  STATUS_BUSY,
  STATUS_FAILED,
  STATUS_NO_ANSWER,
  STATUS_CANCELED,
};
