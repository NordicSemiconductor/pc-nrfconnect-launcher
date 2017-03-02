import { Record } from 'immutable';

const ImmutableSerialPort = Record({
    comName: null,
    serialNumber: null,
    manufacturer: null,
    vendorId: null,
    productId: null,
});

function getImmutableSerialPort(serialPort) {
    return new ImmutableSerialPort({
        comName: serialPort.comName,
        serialNumber: serialPort.serialNumber,
        vendorId: serialPort.vendorId,
        productId: serialPort.productId,
        manufacturer: serialPort.manufacturer,
    });
}

export default {
    getImmutableSerialPort,
};
