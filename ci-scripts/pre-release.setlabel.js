
dw = require("../skywallet");

dw.setDeviceType(dw.DeviceTypeEnum.USB);

const usePassphrase = false;
const envLabel = process.env.ID3;
const deviceLabel = (!envLabel || envLabel === '')? `MyWallet${process.pid}` : envLabel;
console.log('Passphrase :', usePassphrase);

dw.devApplySettings(usePassphrase, deviceLabel).
  then(dw.devGetFeatures).
  then((features) => {
    console.log(features);
  });

