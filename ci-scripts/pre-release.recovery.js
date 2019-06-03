
scanf = require("scanf");
dw = require("../skywallet");

dw.setDeviceType(dw.DeviceTypeEnum.USB);

const wordReader = function() {
  return new Promise((resolve) => {
    console.log("Inside wordReader callback, please input word: ");
    const word = scanf("%s");
    resolve(word);
  });
};

const usePassphrase = false;
console.log('Passphrase :', usePassphrase);


dw.devWipeDevice().
  then(() => {
    dw.devRecoveryDevice(12, usePassphrase, wordReader).
      then(() => {
        console.log("Success!");
      });
  });

