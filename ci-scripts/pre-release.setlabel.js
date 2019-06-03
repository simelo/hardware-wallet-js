
dw = require("../skywallet");

dw.setDeviceType(dw.DeviceTypeEnum.USB);

const usePassphrase = (process.env.USE_PASSPHRASE == 'true')? true : (process.env.USE_PASSPHRASE == 'false')? false: null;
console.log('Passphrase :', usePassphrase);

dw.devApplySettings(usePassphrase, process.env.ID3).
  then(dw.devGetFeatures).
  then((features) => {
    console.log(features);
  });

