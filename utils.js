const deviceWallet = require('./device-wallet');
const bufReceiver = require('./buffer-receiver');
const messages = require('./protob/js/skycoin');

const rejectPromise = function (reject) {
  return function(msg) {
    console.log("Promise rejected", msg);
    if (reject) {
      reject(new Error(msg));
    }
    return Promise.reject(new Error(msg));
  };
};

const wordReader = function () {
  return new Promise((resolve) => {
    console.log("Inside wordReader callback, please input word: ");
    const word = scanf('%s');
    resolve(word);
  });
};

const customPinCodeReader = function (func, msg) {
  return function() {
    return new Promise((resolve, reject) => {
      const pinCode = func(msg);
      if (pinCode === null || pinCode === "") {
        reject(new Error("Pin code operation canceled"));
        return;
      }
      resolve(pinCode);
    });
  };
};

const pinCodeReader = function (msg) {
  return customPinCodeReader(function() {
    console.log(`Enter pinCodeReader : ${msg}`);
    return scanf('%s');
  }, msg);
};

const constPinCodeReader = function(pinCode, msg) {
  return customPinCodeReader(() => pinCode, msg);
};

const deviceSetup = function () {
  return new Promise((resolve, reject) => {
    deviceWallet.devWipeDevice().
      then(() => {
        resolve("Device cleaned up. Setup done.");
      }, rejectPromise(reject));
  });
};

const timeout = function(ms) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(ms), ms);
  });
};

const decodeApplySettings = function (dataBuffer, respCallback) {
  const bufferReceiver = new bufReceiver.BufferReceiver();
  bufferReceiver.receiveBuffer(dataBuffer, (kind, data) => {
    if (kind != messages.MessageType.MessageType_ApplySettings) {
      console.error('Calling decodeApplySettings with wrong message type!', messages.MessageType[kind]);
      respCallback(null);
      return;
    }
    console.log("kind ", kind);
    console.log("data ", JSON.stringify(data));
    try {
      const answer = messages.ApplySettings.decode(data);
      console.log(
        'ApplySettings message:', 'label:', answer.label,
        'ApplySettings message:', 'language:', answer.language,
        'ApplySettings message:', 'usePassphrase:', answer.usePassphrase
      );
      respCallback(answer);
    } catch (e) {
      console.error('Wire format is invalid');
      respCallback(null);
    }
  });
};

module.exports = {
  constPinCodeReader,
  decodeApplySettings,
  deviceSetup,
  pinCodeReader,
  rejectPromise,
  timeout,
  wordReader
};
