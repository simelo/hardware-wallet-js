
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

dw.devWipeDevice().
  then(() => {
    dw.devRecoveryDevice(12, true, wordReader).
      then(() => {
        console.log("Success!");
      });
  });

