const deviceWallet = require('../device-wallet');
const utils = require('../utils');
const rejectPromise = utils.rejectPromise;
const setup = utils.deviceSetup;

describe('Apply Setting -> label', function () {
  this.timeout(0);
  if (deviceWallet.getDevice() === null) {
    console.log("Skycoin hardware NOT FOUND, using emulator");
    deviceWallet.setDeviceType(deviceWallet.DeviceTypeEnum.EMULATOR);
    deviceWallet.setAutoPressButton(true, 'R');
  } else {
    console.log("Skycoin hardware is plugged in");
    deviceWallet.setDeviceType(deviceWallet.DeviceTypeEnum.USB);
  }

  it("Should apply device label settings", function() {
    const deviceLabel = 'My dev device';

    return setup().
      then(deviceWallet.devGetFeatures).
      then(function(features1) {
        if (features1.label === deviceLabel) {
          return Promise.reject(new Error("Label should be different at test startup."));
        }
        return deviceWallet.devApplySettings(false, deviceLabel, null);
      }).
      then(deviceWallet.devGetFeatures).
      then(function(features2) {
        if (deviceLabel === features2.label) {
          return "Setting applied as expected.";
        }
        return Promise.reject(new Error("Apply setting failed."));
      }).
      catch(rejectPromise());
  });

  it("Should not accept invalid languages", function(done) {
    setup().
      then(() => deviceWallet.devApplySettings(false, null, 'italiano')).
      then(() => done(new Error("Expected failure"))).
      catch(() => {
        done();
      });
  });

});
