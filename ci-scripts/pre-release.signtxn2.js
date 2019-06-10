
scanf = require('scanf');

dw = require("../skywallet");

dw.setDeviceType(dw.DeviceTypeEnum.USB);

const usePassphrase = false;
const address1 = process.env.ADDRESS1;
const address2 = process.env.ADDRESS2;
const address3 = process.env.ADDRESS3;
const address4 = process.env.ADDRESS4;
const envTxn = process.env.TXN3_JSON;
const rTxn = JSON.parse(envTxn);

console.log("WALLET1 addresses", address1, address2, address3);
console.log("WALLET2 addresses", address4);
console.log("Detected transaction JSON object", JSON.stringify(rTxn));
console.log('Passphrase :', usePassphrase);

const confirmPromise = function() {
  return new Promise((resolve) => {
    console.log("Continue? [yes]/no:");
    answer = scanf("%s");
    resolve(answer != 'no');
  });
};

console.log("Please confirm that all data is correct");
confirmPromise().
  then((goFwd) => {
    if (!goFwd) {
      throw new Error('Process cancelled by user');
    }
    return dw.devAddressGen(6, 0);
  }).
  then((addresses) => {
    let inputs = [];
    let outputs = [];

    for (i = 0; i < rTxn.inputs.length; i += 1) {
      const item = rTxn.inputs[i];
      let obj = {'hashIn': item.uxid};
      const index = addresses.indexOf(item.address);
      if (index >= 0) {
        obj.index = index;
      }
      inputs.push(obj);
    }

    for (i = 0; i < rTxn.outputs.length; i += 1) {
      const out = rTxn.outputs[i];
      const index = addresses.indexOf(out.address);
      let obj = {
        'address': out.address,
        'coin': out.coins.replace('.', ''),
        'hour': out.hours
      };
      if (index >= 0) {
        obj.address_index = index;
      }
      outputs.push(obj);
    }

    console.log('Sending inputs to device', JSON.stringify(inputs));
    console.log('Sending outputs to device', JSON.stringify(outputs));
    return dw.devSkycoinTransactionSign(inputs, outputs);
  }).
  then(console.log).
  catch(console.log);

