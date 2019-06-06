
scanf = require('scanf');

dw = require("../skywallet");

dw.setDeviceType(dw.DeviceTypeEnum.USB);

const usePassphrase = false;
const address1 = process.env.ADDRESS1;
const address2 = process.env.ADDRESS2;
const envTxn = process.env.TXN1_JSON;
const rTxn = JSON.parse(envTxn);

console.log("Sender address", address1);
console.log("Destination address", address2);
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
      inputs.push({
        'hashIn': rTxn.inputs[i],
        'index': 0
      });
    }

    for (i = 0; i < rTxn.outputs.length; i += 1) {
      const out = rTxn.outputs[i];
      outputs.push({
        'address': out.dst,
        'address_index': addresses.indexOf(out.dst),
        'coin': out.coins.replace('.', ''),
        'hour': out.hours
      });
    }

    console.log('Sending inputs to device', JSON.stringify(inputs));
    console.log('Sending outputs to device', JSON.stringify(outputs));
    return dw.devSkycoinTransactionSign(inputs, outputs);
  }).
  then(console.log).
  catch(console.log);

