
dw = require("../skywallet");

dw.setDeviceType(dw.DeviceTypeEnum.USB);

const address = process.argv[2];
const message = process.argv[3];
const sig     = process.argv[4];

dw.devCheckMessageSignature(address, message, sig).
  then(console.log).
  catch(console.log);

