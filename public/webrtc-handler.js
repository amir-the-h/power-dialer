// global variables
let device = null;
let activeCall = null;

// ui handlers
// areas
const phoneControlsDiv = $("#phoneControls");
// log 
const logsDiv = $("#logs")
// buttons
const powerOnButton = $("#powerOn")
const makeCallButton = $("#makeCall")
const hangupCallButton = $("#hangupCall")
// phone number
const phoneNumberInput = $("#phoneNumber");

// button helper functions
function disablePowerOnButton() {
  powerOnButton.addClass("bg-green-400").removeClass("hover:bg-green-500 hover:text-gray-100 focus:border-4 focus:border-green-300").attr("disabled", true);
}
function enablePowerOnButton() {
  powerOnButton.removeClass("bg-green-400 hidden").addClass("hover:bg-green-500 hover:text-gray-100 focus:border-4 focus:border-green-300").attr("disabled", false);
}
function disableMakeCallButton() {
  makeCallButton.addClass("bg-green-400").removeClass("hover:bg-green-500 hover:text-gray-100 focus:border-4 focus:border-green-300").attr("disabled", true);
}
function disableHangupButton() {
  hangupCallButton.addClass("bg-red-400").removeClass("hover:bg-red-500 hover:text-gray-100 focus:border-4 focus:border-red-300").attr("disabled", true);
}

function enableMakeCallButton() {
  makeCallButton.removeClass("bg-green-400").addClass("hover:bg-green-500 hover:text-gray-100 focus:border-4 focus:border-green-300").attr("disabled", false);
}
function enableHangupButton() {
  hangupCallButton.removeClass("bg-red-400").addClass("hover:bg-red-500 hover:text-gray-100 focus:border-4 focus:border-red-300").attr("disabled", false);
}
function disableBothControls() {
  disableMakeCallButton();
  disableHangupButton();
}
function enableBothControls() {
  enableMakeCallButton();
  enableHangupButton();
}

// add a paragraph to the logs
function addLog(message) {
  logsDiv.append("<p>" + message + "</p>");
}

// create a new device and connect to Twilio
function createTwilioDevice() {
  // disable power on button
  disablePowerOnButton();
  // create twilio device
  device = new Twilio.Device(token, {
    debug: true,
    answerOnBridge: true,
    // Set Opus as our preferred codec. Opus generally performs better, requiring less bandwidth and
    // providing better audio quality in restrained network conditions. Opus will be default in 2.0.
    codecPreferences: ["opus", "pcmu"],
  });

  // add event listeners
  addDeviceListeners(device);

  // Device must be registered in order to receive incoming calls
  device.register();
}

// add event listeners to the device
function addDeviceListeners(device) {
  device.on("registered", function () {
    addLog("Twilio device Registered.");
    powerOnButton.addClass("hidden")
    phoneControlsDiv.removeClass("hidden")
  });

  device.on("error", function (error) {
    addLog("Twilio device Error: " + error.message);
    // disable controls
    phoneControlsDiv.addClass("hidden")
    // enable power on button
    enablePowerOnButton();
  });

  device.on("disconnect", function () {
    addLog("Twilio device Disconnected.");
    // disable controls
    phoneControlsDiv.addClass("hidden")
    // enable power on button
    enablePowerOnButton();
  });

  device.on("incoming", handleIncomingCall);
}

// handle incoming calls
function handleIncomingCall(incomingCall) {
  addLog("New incoming call");
  // accept the incoming call
  incomingCall.accept();
  // setup the call for further use
  activeCall = incomingCall;

  activeCall.on("accept", function () {
    addLog("Call accepted");
    enableHangupButton();
    // disableMakeCallButton();
  });
  activeCall.on("cancel", function () {
    addLog("Call cancelled");
    disableHangupButton();
    enableMakeCallButton();
  });
  activeCall.on("disconnect", function () {
    addLog("Call disconnected");
    disableHangupButton();
    enableMakeCallButton();
  });
  activeCall.on("error", function (error) {
    addLog("Call error: " + error.message);
    disableHangupButton();
    enableMakeCallButton();
  });
  activeCall.on("mute", function (isMuted, call) {
    addLog("Call muted: " + isMuted);
    // add mute button control
  });
  activeCall.on("reject", function () {
    addLog("Call rejected");
    disableHangupButton();
    enableMakeCallButton();
  });
}

// simple phone number validation
function validatePhoneNumber(phoneNumber) {
  const regex = /^\+?[0-9]{10,15}$/;
  return regex.test(phoneNumber);
}

// add event listeners to the buttons
powerOnButton.on("click", createTwilioDevice);
makeCallButton.on("click", function () {
  // accept the call if there is one
  if (device !== null && activeCall !== null) {
    activeCall.accept();
  }

  // make a call if there is a valid number
  if (device !== null && validatePhoneNumber(phoneNumberInput.val())) {
    disableBothControls();
    // make an post request to the server to make the call
    $.post("/call", {
      phoneNumber: phoneNumberInput.val(),
      clientId: identity,
    }).done(function (data) {
      console.log(data);
      addLog("Call request to " + phoneNumberInput.val() + " successfully sent.");
      enableMakeCallButton();
    }).fail(function (error) {
      console.error(error);
      addLog("Call request to " + phoneNumberInput.val() + " failed: " + error.message);
      enableMakeCallButton();
    });

    // device.connect({
    //   params: {
    //     // to: "client:phone-app",
    //     To: phoneNumberInput.val(),
    //   }
    // }).then((call) => {
    //   activeCall = call;
    //   disableMakeCallButton();
    //   enableHangupButton();
    // }).catch((error) => {
    //   addLog("Error connecting call: " + error.message);
    //   activeCall = null;
    //   disableHangupButton();
    //   enableMakeCallButton();
    // });
  }
});
hangupCallButton.on("click", function () {
  // hangup the call if there is one
  if (activeCall !== null) {
    addLog("Hanging up call");
    activeCall.disconnect();
    disableHangupButton();
    enableMakeCallButton();
  }
});