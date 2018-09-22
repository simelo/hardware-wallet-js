const HID = require('node-hid');
const messages = require('./protob/skycoin');
const dgram = require('dgram');


// Returns a handle to usbhid device
const getDevice = function() {
    const deviceInfo = HID.devices().find( function(d) {
        const isTeensy = d.manufacturer == "SatoshiLabs";
        return isTeensy;
    });
    if( deviceInfo ) {
        const device = new HID.HID( deviceInfo.path );
        return device;
    }
    return null;
};

// Prepares buffer containing message to device
// eslint-disable-next-line max-statements
const makeTrezorMessage = function(buffer, msgId) {
    const u8Array = new Uint8Array(buffer);
    const trezorMsg = new ArrayBuffer(10 + u8Array.byteLength - 1);
    const dv = new DataView(trezorMsg);
    // Adding the '##' at the begining of the header
    dv.setUint8(0, 35);
    dv.setUint8(1, 35);
    dv.setUint16(2, msgId);
    dv.setUint32(4, u8Array.byteLength);
    // Adding '\n' at the end of the header
    dv.setUint8(8, 10);
    const trezorMsg8 = new Uint8Array(trezorMsg);
    trezorMsg8.set(u8Array.slice(1), 9);
    let lengthToWrite = u8Array.byteLength;
    const chunks = [];
    let j = 0;
    while (lengthToWrite > 0) {
        const u64pack = new Uint8Array(64);
        u64pack[0] = 63;
        u64pack.set(trezorMsg8.slice(63 * j, 63 * (j + 1)), 1);
        lengthToWrite -= 63;
        chunks[j] = u64pack;
        j += 1;
    }
    return chunks;
};

// Sends Address generation request
// eslint-disable-next-line max-statements, max-lines-per-function
const deviceAddressGen = function(addressN, startIndex) {
    const dev = getDevice();
    if (dev === null) {
        // eslint-disable-next-line no-console
        console.error("Device not connected");
        return;
    }
    const dataBytes = createAddressGenRequest(addressN, startIndex);
    dev.write(dataBytes);

    // eslint-disable-next-line max-statements, max-lines-per-function
    dev.read(function(err, data) {
        if (err) {
            // eslint-disable-next-line no-console
            console.error(err);
            return;
        }
        const dv8 = new Uint8Array(data);
        const kind = new Uint16Array(dv8.slice(4, 5))[0];
        const msgSize = new Uint32Array(dv8.slice(8, 11))[0];

        const dataBuffer = new Uint8Array(2 + (64 * Math.ceil(msgSize / 64)));
        dataBuffer.set(dv8.slice(9));
        let bytesToGet = msgSize + 9 - 64;
        let i = 0;
        while (bytesToGet > 0) {
            dataBuffer.set(dev.readSync().slice(1), (63 * i) + 55);
            i += 1;
            bytesToGet -= 64;
        }
        // eslint-disable-next-line no-console
        console.log(
            "Received data", dataBuffer, " msg kind: ",
            messages.MessageType[kind],
            " size: ", msgSize, "buffer lenght: ", dataBuffer.byteLength
            );
        if (kind == messages.MessageType.MessageType_Failure) {
            try {
                const answer = messages.Failure.
                                decode(dataBufferArray);
                // eslint-disable-next-line no-console
                console.log(
                    "Failure message code",
                    answer.code, "message: ",
                    answer.message
                    );
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error("Wire format is invalid");
            }
            dev.close();
        }

        if (kind == messages.MessageType.MessageType_ResponseSkycoinAddress) {
            try {
                // eslint-disable-next-line no-console
                console.log(dataBuffer.slice(0, msgSize));
                const answer = messages.ResponseSkycoinAddress.
                                decode(dataBuffer.slice(0, msgSize));
                // eslint-disable-next-line no-console
                console.log("Addresses", answer.addresses);
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error("Wire format is invalid", e);
            }
            dev.close();
        }
    });
};

const createAddressGenRequest = function(addressN, startIndex) {
    const msgStructure = {
        addressN,
        startIndex
    };
    const msg = messages.SkycoinAddress.create(msgStructure);
    const buffer = messages.SkycoinAddress.encode(msg).finish();
    const chunks = makeTrezorMessage(
        buffer,
        messages.MessageType.MessageType_SkycoinAddress
    );
    const dataBytes = [];
    chunks[0].forEach((elt, i) => {
        dataBytes[i] = elt;
    });
    return dataBytes;
}

// Sends Address generation request
// eslint-disable-next-line max-statements, max-lines-per-function
const emulatorAddressGen = function(addressN, startIndex) {
    const dataBytes = createAddressGenRequest(addressN, startIndex);
    const client = dgram.createSocket('udp4');
    const port = 21324;
    // client.bind(port);
    const message = new Buffer(dataBytes);
    let msg_index = 0;
    let msgSize = 3600*8;// max_size:36, max_count:100
    let bytesToGet = 0;
    let kind = -1;
    const dataBuffer = new Uint8Array(2 + (64 * Math.ceil(msgSize / 64)));
    client.on('message', function(data, rinfo) {
        if (rinfo) {
            // eslint-disable-next-line no-console
            console.log(`server got: ${data} from ${rinfo.address}:${rinfo.port}`);
        }
        // eslint-disable-next-line no-console
        console.log('Received message from emulator', data.toString());

        if (bytesToGet == 0) {       
            const dv8 = new Uint8Array(data);
            kind = new Uint16Array(dv8.slice(4, 5))[0];
            msgSize = new Uint32Array(dv8.slice(8, 11))[0];
            // eslint-disable-next-line no-console
            console.log('Msg size', msgSize);
            dataBuffer.set(dv8.slice(9));
            bytesToGet = msgSize + 9 - 64;
            console.log(
                "Received data", dataBuffer, " msg kind: ",
                messages.MessageType[kind],
                " size: ", msgSize, "buffer lenght: ", dataBuffer.byteLength
                );
            return;
        // const dataBuffer = new Uint8Array(2 + (64 * Math.ceil(msgSize / 64)));
        }

        dataBuffer.set(data.slice(1), (63 * msg_index) + 55);
        msg_index += 1;
        bytesToGet -= 64;

        console.log(
            "Received data", dataBuffer, " msg kind: ",
            messages.MessageType[kind],
            " size: ", msgSize, "buffer lenght: ", dataBuffer.byteLength
            );

        console.log("bytesToGet", bytesToGet, "msg_index", msg_index);

        if (bytesToGet > 0) {
            return;
        }

        if (kind == messages.MessageType.MessageType_Failure) {
            try {
                const answer = messages.Failure.
                                decode(dataBufferArray);
                // eslint-disable-next-line no-console
                console.log(
                    "Failure message code",
                    answer.code, "message: ",
                    answer.message
                    );
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error("Wire format is invalid");
            }
        }

        if (kind == messages.MessageType.MessageType_ResponseSkycoinAddress) {
            try {
                // eslint-disable-next-line no-console
                console.log(dataBuffer.slice(0, msgSize));
                const answer = messages.ResponseSkycoinAddress.
                                decode(dataBuffer.slice(0, msgSize));
                // eslint-disable-next-line no-console
                console.log("Addresses", answer.addresses);
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error("Wire format is invalid", e);
            }
        }

        client.close();
    });
    // eslint-disable-next-line max-statements, max-lines-per-function
    client.send(message, 0, message.length, port, '127.0.0.1', function(err, bytes) {
        // eslint-disable-next-line no-console
        if (err) throw err;
        console.log("Sending data", message);
        // client.close();
    });
};

module.exports = {
    emulatorAddressGen,
    deviceAddressGen,
    getDevice,
    makeTrezorMessage
};
