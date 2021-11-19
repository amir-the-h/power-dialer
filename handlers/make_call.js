const storage = require('../storage');
const { makeCallToAgent, dropOrContinue, connectCustomerToConference, getConferenceInfoByName, logCallStep } = require('../helpers');

module.exports = (req, res) => {
  // get the phone number from request
  const { phoneNumber, clientId } = req.body;

  // start the power dial
  // check if there is an active call
  agentCall = storage.getActiveCall();
  // and if the active call belongs to the same agent
  if (agentCall && agentCall.to === clientId) {
    // drop the customer call by timeout or continue to connect customer to conference
    connectCustomerToConference(phoneNumber)
      .then((customerCall) => {
        dropOrContinue(customerCall, 1000, 10)
          .then((customerCall) => {
            // call in progress
            logCallStep(agentCall, 'Call in progress');
            logCallStep(customerCall, 'Call in progress');
          })
          .catch(() => {
            return
          });
      })
      .catch((err) => {
        console.log(err);
        return
      });
  } else {
    // dial the client webrtc to put the agent in conference first
    makeCallToAgent(clientId)
      .then((agentCall) => {
        // drop the agent call by timeout or continue to dialing customer
        dropOrContinue(agentCall, 1000, 10)
          .then((agentCall) => {
            // get the conference info
            getConferenceInfoByName(agentCall)
              .then((agentCall) => {
                // set the agent call as the active call
                storage.setActiveCall(agentCall);
                // drop the customer call by timeout or continue to connect customer to conference
                connectCustomerToConference(phoneNumber)
                  .then((customerCall) => {
                    dropOrContinue(customerCall, 5000, 1000)
                      .then((customerCall) => {
                        // call in progress
                        logCallStep(agentCall, 'Call in progress');
                        logCallStep(customerCall, 'Call in progress');
                      })
                      .catch(() => {
                        return
                      });
                  })
                  .catch((err) => {
                    console.log(err);
                    return
                  });
              })
              .catch(() => {
                return;
              });
          })
          .catch(() => {
            return
          });
      })
      .catch((err) => {
        console.error(err);
      });
  }

  res.sendStatus(200);
}