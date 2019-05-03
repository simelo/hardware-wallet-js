const deviceWallet = require('../device-wallet');
const utils = require('../utils');
const setup = utils.deviceSetup;
const constPinCodeReader = utils.constPinCodeReader;
const pinCodeReader = utils.pinCodeReader;
const expect = require('chai').expect;

describe('Cancel Request test', function () {
  this.timeout(0);
  if (deviceWallet.getDevice() === null) {
    console.log("Skycoin hardware NOT FOUND, using emulator");
    deviceWallet.setDeviceType(deviceWallet.DeviceTypeEnum.EMULATOR);
    deviceWallet.setAutoPressButton(true, 'R');
  } else {
    console.log("Skycoin hardware is plugged in");
    deviceWallet.setDeviceType(deviceWallet.DeviceTypeEnum.USB);
  }

  it("Should cancel pending requests", function(done) {
    setup().
      then(function() {
        setTimeout(deviceWallet.devCancelRequest, 2000);

        return deviceWallet.devChangePin(pinCodeReader);
      }).
      then(() => {
        done(new Error('The Cancel Request is not working'));
      }).
      catch(() => {
        done();
      });
  });

  it("Should change and remove PIN if not canceled", function(done) {
    const thePinCodeReader = constPinCodeReader('1234', 'Enter pin code:');
    return setup().
      then(deviceWallet.devGetFeatures).
      then((features1) => {
        expect(features1.pinProtection).to.be.false();
      }).
      then(deviceWallet.devChangePin(thePinCodeReader)).
      then(deviceWallet.devGetFeatures).
      then((features2) => {
        expect(features2.pinProtection).to.be.true();
      }).
      then(deviceWallet.devRemovePin(thePinCodeReader)).
      then(deviceWallet.devGetFeatures).
      then((features3) => {
        expect(features3.pinProtection).to.be.false();
        done();
      });
  });

});
