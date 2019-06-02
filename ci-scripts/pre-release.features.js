
dw = require("../skywallet");

dw.setDeviceType(dw.DeviceTypeEnum.USB);

dw.devGetFeatures().
  then((features) => {
    console.log(features);
  });

