
dw = require("../skywallet");

dw.setDeviceType(dw.DeviceTypeEnum.USB);

dw.devAddressGen(5, 1).
  then((addresses) => {
    for (i = 0; i < addresses.length; i += 1) {
      console.log(addresses[i]);
    }
  });

