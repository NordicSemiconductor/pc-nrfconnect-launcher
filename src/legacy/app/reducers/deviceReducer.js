/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import { Record, List } from 'immutable';
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
