/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const {
    FirmwareRegistry,
    AdapterFactory,
    ServiceFactory,
    Dfu,
} = require('pc-ble-driver-js');

let dfu;
let adapter;

const initializeDfu = (event, { name, options }) => {
    dfu = new Dfu(name, { adapter, ...options });
    event.sender.send('dfu-initialized');
};

const addDfuListener = ({ name, callback }) => {
    if (!dfu) return;
    dfu.on(name, callback);
};

const removeDfuListener = name => {
    if (!dfu) return;
    dfu.removeAllListeners(name);
};

const abortDfu = () => {
    dfu.abort();
};

const getDfuManifest = ({ filePath, callback }) =>
    dfu.getManifest(filePath, callback);

const performDfu = ({ filePath, callback }) =>
    dfu.performDFU(filePath, callback);

const getDeviceSetup = () => {
    return JSON.stringify(FirmwareRegistry.getDeviceSetup());
};

module.exports = {
    initializeDfu,
    addDfuListener,
    removeDfuListener,
    abortDfu,
    getDfuManifest,
    performDfu,
    getDeviceSetup,
};
