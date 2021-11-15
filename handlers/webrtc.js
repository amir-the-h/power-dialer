const AccessToken = require("twilio").jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;
const { WEBRTC_IDENTITY_AGENT, WEBRTC_IDENTITY_MODERATOR } = require('../constants');

module.exports = (req, res) => {
  // generate a static token for the client
  const identity = (req.query.moderator) ? WEBRTC_IDENTITY_MODERATOR : WEBRTC_IDENTITY_AGENT;

  // create a new access token
  let accessToken = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY,
    process.env.TWILIO_API_SECRET
  );
  // set the identity of the access token
  accessToken.identity = identity;

  // grant access to Twilio Voice
  const grant = new VoiceGrant({
    outgoingApplicationSid: process.env.TWILIO_APP_SID,
    incomingAllow: true,
  });
  accessToken.addGrant(grant);

  res.render('webrtc', { identity: identity, token: accessToken.toJwt(), });
}