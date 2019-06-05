
dw = require("../skywallet");

dw.setDeviceType(dw.DeviceTypeEnum.USB);

const usePassphrase = false;
const address1 = process.env.ADDRESS1;
const address2 = process.env.ADDRESS2;
const envTxn = process.env.TXN1_JSON;
const rTxn = JSON.parse(envTxn);

console.log("Detected transaction JSON object", envTxn);

console.log('Passphrase :', usePassphrase);

let inputs = [];
let outputs = [];

dw.devAddressGen(6, 0).
  then((addresses) => {
    for (i = 0; i < rTxn.inputs; i += 1) {
      inputs.push = {
        'hashIn': rTxn.inputs[i],
        'index': 0
      };
    }

    for (i = 0; i < rTxn.outputs; i += 1) {
      const out = rTxn.outputs[i];
      outputs.push = {
        'address': out.dst,
        'address_index': addresses.indexOf(out.dst),
        'coin': out.coins,
        'hour': out.hours
      };
    }

    return dw.devSkycoinTransactionSign(inputs, outputs);
  }).
  then(console.log).
  catch(console.log);

