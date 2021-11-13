const storage = require('../storage');
const { makeCallToAgent, dropOrContinue, connectCustomerToConference, logCallStep } = require('../helpers');

module.exports = (req, res) => {
  // get the phone number from request
  const { phoneNumber, clientId } = req.body;

  // start the power dial
  // dial the client webrtc to put the agent in conference first
  makeCallToAgent(clientId)
    .then((agentCall) => {
      // drop the agent call by timeout or continue to dialing customer
      dropOrContinue(agentCall, 10000, 1000)
        .then((agentCall) => {
          // drop the customer call by timeout
          connectCustomerToConference(agentCall, phoneNumber)
            .then((customerCall) => {
              dropOrContinue(customerCall, 10000, 1000)
                .then((customerCall) => {
                  // call in progress
                  logCallStep(agentCall, 'Call in progress');
                  logCallStep(customerCall, 'Call in progress');
                })
                .catch(() => {
                  return
                });
            })
            .catch(() => {
              return
            });
        })
        .catch(() => {
          return
        });
    })
    .catch((err) => {
      console.error(err);
    });

  res.sendStatus(200);
}