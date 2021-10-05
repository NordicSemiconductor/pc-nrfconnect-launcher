/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { List, Record } from 'immutable';

import * as DeviceActions from '../actions/deviceActions';

const InitialState = Record({
    devices: List(),
    deviceInfo: null,
    selectedSerialNumber: null,
    isSetupDialogVisible: false,
    isSetupWaitingForUserInput: false,
    setupDialogText: null,
    setupDialogChoices: List(),
});

const initialState = new InitialState();

function setSelectedSerialNumber(state, serialNumber) {
    return state.set('selectedSerialNumber', serialNumber);
}

function clearSelectedSerialNumber(state) {
    return state
        .set('selectedSerialNumber', initialState.selectedSerialNumber)
        .set('deviceInfo', initialState.deviceInfo);
}

function setDeviceList(state, devices) {
    return state.set('devices', List(devices));
}

function setSetupInputRequired(state, message, choices = List()) {
    return state
        .set('isSetupDialogVisible', true)
        .set('isSetupWaitingForUserInput', true)
        .set('setupDialogText', message)
        .set('setupDialogChoices', List(choices));
}

function setSetupInputReceived(state) {
    return state.set('isSetupWaitingForUserInput', false);
}

function setSetupComplete(state, device) {
    return state
        .set('isSetupDialogVisible', initialState.isSetupDialogVisible)
        .set('setupDialogText', initialState.setupDialogText)
        .set('setupDialogChoices', initialState.setupDialogChoices)
        .set('deviceInfo', device.deviceInfo);
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case DeviceActions.DEVICES_DETECTED:
            return setDeviceList(state, action.devices);
        case DeviceActions.DEVICE_SELECTED:
            return setSelectedSerialNumber(state, action.device.serialNumber);
        case DeviceActions.DEVICE_DESELECTED:
            return clearSelectedSerialNumber(state);
        case DeviceActions.DEVICE_SETUP_COMPLETE:
        case DeviceActions.DEVICE_SETUP_ERROR:
            return setSetupComplete(state, action.device);
        case DeviceActions.DEVICE_SETUP_INPUT_REQUIRED:
            return setSetupInputRequired(state, action.message, action.choices);
        case DeviceActions.DEVICE_SETUP_INPUT_RECEIVED:
            return setSetupInputReceived(state);
        default:
            return state;
    }
};

export default reducer;
