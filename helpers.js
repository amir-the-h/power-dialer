const twilio = require('twilio');
const { DIRECTION_OUTBOUND, PARTICIPANT_AGENT, PARTICIPANT_CUSTOMER, STATUS_IN_PROGRESS } = require('./constants');
const storage = require('./storage');

// simple phone number validation
function validatePhoneNumber(phoneNumber) {
  const regex = /^\+?[0-9]{10,15}$/;
  return regex.test(phoneNumber);
}

// generate conference room name
function generateConferenceName(call) {
  return `conference-${call.id}`;
}

// log the call step
function logCallStep(call, message) {
  const time = new Date();
  message = time.toLocaleTimeString() + ' #' + call.id + ': ' + message;
  call.logs.push(message);
  console.log(message);
}

// make a new outbound call and to the Agent's webrtc
function makeCallToAgent(clientId) {
  const client = new twilio();
  // create a new promise
  return new Promise((resolve, reject) => {
    // create a new outbound call
    const agentCall = storage.newCall(DIRECTION_OUTBOUND, process.env.TWILIO_CALLER_ID, clientId);
    agentCall.conference.friendlyName = generateConferenceName(agentCall);
    // log the step
    logCallStep(agentCall, `Calling Agent ${clientId}`);
    // create a twiml response
    const twiml = new twilio.twiml.VoiceResponse();
    // create a dial action
    const dial = twiml.dial();
    dial.conference({
      startConferenceOnEnter: true,
      endConferenceOnExit: true,
      participantLabel: PARTICIPANT_AGENT,
      waitUrl: 'https://twimlets.com/holdmusic?Bucket=com.twilio.music.guitars&Message=we%20are%20dialing%20out.%20stay%20on%20the%20line.'
    }, agentCall.conference.friendlyName);

    // now make a call to the agent
    client.calls.create({
      from: process.env.TWILIO_CALLER_ID,
      to: `client:${clientId}`,
      twiml: twiml.toString(),
    }).then(outboundCall => {
      // log the step
      logCallStep(agentCall, `Call to Agent ${clientId} initiated`);

      // update the call object with the outbound call
      agentCall.sid = outboundCall.sid;
      agentCall.status = outboundCall.status;
      agentCall.calledAt = Date.now();

      // resolve the promise
      resolve(agentCall);
    }).catch(err => {
      // log the step
      logCallStep(agentCall, `Call to Agent ${clientId} failed:\t ${err}`);

      // update agent call status
      agentCall.status = 'failed';
      agentCall.endedAt = Date.now();

      // reject the promise
      reject(err);
    });
  });
}

// drop the call
function dropCall(call, reason) {
  // make a new promise
  return new Promise((resolve, reject) => {
    // log the step
    logCallStep(call, `Dropping call: ${reason}`);
    // update the call status
    const client = new twilio();
    client.calls(call.sid)
      .update({ status: 'completed' })
      .then(() => {
        // log the step
        logCallStep(call, `Call dropped: ${reason}`);

        // update call timestamp
        call.endedAt = Date.now();
        // update the duration 
        call.duration = (call.endedAt - call.calledAt) / 1000;
        // update the status
        call.status = 'dropped';

        // resolve the promise
        resolve(call);
      })
      .catch(err => {
        // log the step
        logCallStep(call, `Call drop failed: ${err}`);

        // reject the promise
        reject(err);
      });
  });
}

// check if call is in-progress
function isCallInProgress(call) {
  // make a new promise
  return new Promise((resolve, reject) => {
    // log the step
    // make twilio client
    const client = new twilio();
    // get the call status from twilio
    client.calls(call.sid)
      .fetch()
      .then(twilioCall => {
        // check if the call has been picked up
        if (call.status !== STATUS_IN_PROGRESS && twilioCall.status === STATUS_IN_PROGRESS) {
          call.answeredAt = Date.now();
          // log the step
          logCallStep(call, `Call answered`);
          // update the call status
          call.status = twilioCall.status;
          // resolve the promise
          resolve(call);
        }

        // update the call status
        call.status = twilioCall.status;
        if (call.status === STATUS_IN_PROGRESS) {
          resolve(call);
        }

        // reject the promise
        reject(null);
      })
      .catch(err => {
        // log the step
        logCallStep(call, `Call status check failed: ${err}`);
        // reject the promise
        reject(err);
      });
  });
}

// dial the customer and add it to the conference
function connectCustomerToConference(phoneNumber) {
  // make a new promise
  return new Promise((resolve, reject) => {
    // get the active call
    const activeCall = storage.getActiveCall();
    if (!activeCall) {
      // reject the promise
      reject('No active call to add customer to');
    }
    // create a new outbound call
    const customerCall = storage.newCall(DIRECTION_OUTBOUND, process.env.TWILIO_CALLER_ID, phoneNumber);
    customerCall.conference = activeCall.conference;
    // log the step
    logCallStep(customerCall, `Dialing customer ${phoneNumber} into the conference ${customerCall.conference.friendlyName}`);
    // make twilio client
    const client = new twilio();
    // create a twiml response
    const twiml = new twilio.twiml.VoiceResponse();
    // create a dial action
    const dial = twiml.dial();
    dial.conference({
      startConferenceOnEnter: true,
      participantLabel: PARTICIPANT_CUSTOMER,
    }, customerCall.conference.friendlyName);

    // make a new outbound call to the customer
    client.calls.create({
      from: process.env.TWILIO_CALLER_ID,
      to: phoneNumber,
      twiml: twiml.toString(), // directly connect to conference
    })
      .then((twilioCall) => {
        // log the step
        logCallStep(customerCall, `Call to customer initiated`);

        // update the call object with the outbound call
        customerCall.sid = twilioCall.sid;
        customerCall.status = twilioCall.status;
        customerCall.calledAt = Date.now();

        // resolve the promise
        resolve(customerCall);
      })
      .catch((err) => {
        // log the step
        logCallStep(twilioCall, `Call to customer failed: ${err}`);
        // update agent call status
        twilioCall.status = 'failed';
        twilioCall.endedAt = Date.now();
        // reject the promise
        reject(err);
      })
  });
}

// drop the call or continue the call based on timeout or answer
function dropOrContinue(call, timeoutDelay, tickerDelay) {
  // create a new promise
  // this will keep track of the agent call to determine when to drop the call
  // or when to dial the Customer
  return new Promise((resolve, reject) => {
    // log the step
    logCallStep(call, `Checking if call is timed out or answered`);
    // time out flag
    let timedOut = false;

    // set a timeout to drop the call after 10 seconds
    const timeout = setTimeout(() => {
      // log the step
      logCallStep(call, `Call timed out`);
      dropCall(call, 'timeout')
        .then(() => {
          timedOut = true;
          reject('timeout');
        })
        .catch((err) => {
          timedOut = true;
          console.log(err);
          reject(err);
        });
    }, timeoutDelay);

    // set a ticker to check if the Agent picks up the call
    const ticker = setInterval(() => {
      if (timedOut) {
        clearInterval(ticker);
        clearTimeout(timeout);
        return;
      }
      // log the step
      isCallInProgress(call)
        .then((updatedCall) => {
          clearTimeout(timeout);
          clearInterval(ticker);
          resolve(updatedCall);
        })
        .catch((err) => {
          if (err !== null) {
            clearTimeout(timeout);
            clearInterval(ticker);
            reject(err);
          }
        });
    }, tickerDelay);
  });
}

// get the conference info from twilio api by conference room name
function getConferenceInfoByName(call) {
  // make a new promise
  return new Promise((resolve, reject) => {
    // log the step
    logCallStep(call, `Getting conference ${call.conference.friendlyName} info`);
    // check call conference name is set
    if (!call.conference.friendlyName) {
      // log the step
      logCallStep(call, `Conference name is not set`);
      // reject the promise
      reject(null);
    }
    // make twilio client
    const client = new twilio();
    // get the conference info
    client.conferences.list({ friendlyName: call.conference.friendlyName, limit: 1 })
      .then(conferences => conferences.forEach(conference => {
        // add it to the agent call
        call.conference = conference;
        // log the step
        logCallStep(call, `Got conference info`);
        // resolve the promise
        resolve(call);
      }))
      .catch(err => {
        // log the step
        logCallStep(call, `Getting conference info failed: ${err}`);
        // reject the promise
        reject(err);
      });
  });
}

// export all functions
module.exports = {
  validatePhoneNumber,
  generateConferenceName,
  logCallStep,
  makeCallToAgent,
  dropCall,
  isCallInProgress,
  connectCustomerToConference,
  dropOrContinue,
  getConferenceInfoByName,
};