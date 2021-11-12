const agentJoined = require('./agent_joined');
const agentLeft = require('./agent_left');
const customerJoined = require('./customer_joined');
const customerLeft = require('./customer_left');
module.exports = (req, res) => {
  console.log("Conference status");
  // console.dir(req.body);

  // check if it is a joined or left event
  if (req.body.StatusCallbackEvent === 'participant-join') {
    // check if agent or customer joined the conference
    if (req.body.ParticipantLabel === "Agent") {
      return agentJoined(req, res);
    } 
    if (req.body.ParticipantLabel === "Customer") {
      return customerJoined(req, res);
    }
  }
  if (req.body.StatusCallbackEvent === 'participant-leave') {
    // check if agent or customer left the conference
    if (req.body.ParticipantLabel === "Agent") {
      return agentLeft(req, res);
    }
    if (req.body.ParticipantLabel === "Customer") {
      return customerLeft(req, res);
    }
  }
}