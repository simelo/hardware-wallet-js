
dw = require("../skywallet");

dw.setDeviceType(dw.DeviceTypeEnum.USB);

const usePassphrase = false;
console.log('Passphrase :', usePassphrase);

dw.devApplySettings(usePassphrase, process.env.ID3).
  then(dw.devGetFeatures).
  then((features) => {
    console.log(features);
  });

