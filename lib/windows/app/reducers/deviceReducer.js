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
import { getImmutableDevice } from '../models';
import * as DeviceActions from '../actions/deviceActions';

const InitialState = Record({
    isLoading: false,
    isSelectorExpanded: false,
    devices: List(),
    selectedDevice: null,
});

const initialState = new InitialState();

function setLoading(state, isLoading) {
    return state.set('isLoading', isLoading);
}

function toggleSelectorExpanded(state) {
    return state.set('isSelectorExpanded', !state.get('isSelectorExpanded'));
}

function setSelectedDevice(state, device) {
    return state.set('selectedDevice', device);
}

function clearSelectedDevice(state) {
    return state.set('selectedDevice', initialState.selectedDevice);
}

/**
 * Remove leading zeroes from the given serial number. Only removes the
 * leading zeroes if the serial number is actually a number.
 *
 * @param {string} serialNumber The serial number to process.
 * @returns {string} Serial number with no leading zeroes.
 */
function removeLeadingZeroes(serialNumber) {
    if (serialNumber) {
        const number = parseInt(serialNumber, 10);
        if (number) {
            return number.toString();
        }
    }
    return serialNumber;
}

/**
 * Returns a new device object with a trimmed version of the serial number.
 * The serial number value is sometimes a long text string like
 * 'SEGGER_J-Link_00012345678'. In this case, we are only interested in
 * the number after the last '_'. We also remove any leading zeroes.
 *
 * @param {Object} device The device object to trim serial number for.
 * @returns {Object} New device with a trimmed version of the serial number.
 */
function trimSerialNumber(device) {
    if (device.serialNumber) {
        let serialNumber = device.serialNumber;
        const serialNumberParts = device.serialNumber.split('_');
        if (serialNumberParts.length > 0) {
            serialNumber = serialNumberParts[serialNumberParts.length - 1];
        }
        return {
            ...device,
            serialNumber: removeLeadingZeroes(serialNumber),
        };
    }
    return device;
}

/**
 * Returns a new device object where non-numeric productId and vendorId values
 * have been converted to hexadecimal numeric values. Will produce NaN if
 * the values are defined but cannot be parsed as numbers.
 *
 * @param {Object} device The device to convert ids for.
 * @returns {Object} New device with converted productId and vendorId.
 */
function convertToNumericVidAndPid(device) {
    const idToHex = idValue => {
        if (idValue != null && typeof idValue !== 'number') {
            return parseInt(idValue, 16);
        }
        return idValue;
    };

    return {
        ...device,
        productId: idToHex(device.productId),
        vendorId: idToHex(device.vendorId),
    };
}

/**
 * Create a list of ImmutableDevice objects from the given POJO devices.
 *
 * @param {Array<Object>} devices Array of POJO devices.
 * @returns {List<ImmutableDevice>} List of ImmutableDevice objects.
 */
function createDeviceList(devices) {
    return List(devices.map(device => (
        getImmutableDevice(convertToNumericVidAndPid(trimSerialNumber(device)))
    )));
}

function setDeviceList(state, devices) {
    const newState = setLoading(state, false);
    return newState.set('devices', createDeviceList(devices));
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case DeviceActions.DEVICES_LOAD:
            return setLoading(state, true);
        case DeviceActions.DEVICES_LOAD_ERROR:
            return setLoading(state, false);
        case DeviceActions.DEVICES_LOAD_SUCCESS:
            return setDeviceList(state, action.devices);
        case DeviceActions.DEVICE_SELECTOR_TOGGLE_EXPANDED:
            return toggleSelectorExpanded(state);
        case DeviceActions.DEVICE_SELECTED:
            return setSelectedDevice(state, action.device);
        case DeviceActions.DEVICE_DESELECTED:
            return clearSelectedDevice(state);
        default:
            return state;
    }
};

export default reducer;
