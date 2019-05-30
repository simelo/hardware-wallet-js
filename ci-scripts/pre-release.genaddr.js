
scanf = require("scanf");
dw = require("../skywallet");

dw.setDeviceType(dw.DeviceTypeEnum.USB);

dw.devAddressGen(5, 0).
  then((addresses) => {
    for (i = 0; i < addresses.length; ++i) {
      console.log(addresses[i]);
    }
  });

