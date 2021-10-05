/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Record } from 'immutable';

import portPath from '../../portPath';

const ImmutableSerialPort = Record({
    comName: null,
    path: null,
    serialNumber: null,
    manufacturer: null,
    vendorId: null,
    productId: null,
});

const ImmutableDevice = Record({
    comName: null,
    path: null,
    busNumber: null,
    deviceAddress: null,
    serialNumber: null,
    manufacturer: null,
    product: null,
    vendorId: null,
    productId: null,
});

function getImmutableSerialPort(serialPort) {
    return new ImmutableSerialPort({
        comName: portPath(serialPort),
        path: portPath(serialPort),
        serialNumber: serialPort.serialNumber,
        vendorId: serialPort.vendorId,
        productId: serialPort.productId,
        manufacturer: serialPort.manufacturer,
    });
}

function getImmutableDevice(device) {
    return new ImmutableDevice({
        ...device,
        comName: portPath(device),
        path: portPath(device),
    });
}

export { getImmutableSerialPort, getImmutableDevice };
