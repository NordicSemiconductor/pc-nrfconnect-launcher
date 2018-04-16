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

import DeviceLister from 'nrf-device-lister';
import { prepareDevice } from 'nrf-device-actions';
import { logger } from '../../../api/logging';
import { getAppConfig } from '../../../util/apps';

// TODO: import { prepareDevice } from nrf-device-actions;
// const prepareDevice = device => Promise.resolve(device);

let deviceSetupCallback;

/**
 * Indicates that a device has been selected.
 *
 * Apps can listen to this action in their middleware to add custom behavior when
 * the device is selected. Apps can also dispatch this action themselves to make
 * the device appear as selected in the DeviceSelector.
 *
 * @param {Object} device Device object as given by nrf-device-lister.
 * @see DEVICE_SETUP_COMPLETE
 */
export const DEVICE_SELECTED = 'DEVICE_SELECTED';

/**
 * Indicates that the currently selected device has been deselected.
 *
 * Apps can listen to this action in their middleware to add custom behavior when
 * the device is deselected, f.ex. closing the device. Apps can also dispatch this
 * action themselves to clear a selection in the DeviceSelector.
 */
export const DEVICE_DESELECTED = 'DEVICE_DESELECTED';

/**
 * Indicates that the system has started setting up a device. This is an async
 * operation that will check if the device has the expected firmware, and update
 * it if needed. This is triggered by default on device selection if the app
 * provides a `config.deviceSetup` property.
 *
 * This action is followed by DEVICE_SETUP_COMPLETE if the operation was
 * successful, or DEVICE_SETUP_ERROR if it failed.
 *
 * @param {Object} device Device object as given by nrf-device-lister.
 * @see DEVICE_SETUP_COMPLETE
 * @see DEVICE_SETUP_ERROR
 */
export const DEVICE_SETUP_STARTED = 'DEVICE_SETUP_STARTED';

/**
 * Indicates that device setup failed.
 *
 * @param {Object} device Device object as given by nrf-device-lister.
 * @see DEVICE_SETUP_STARTED
 * @see DEVICE_SETUP_COMPLETE
 */
export const DEVICE_SETUP_ERROR = 'DEVICE_SETUP_ERROR';

/**
 * Indicates that device setup is complete. This means that the device is
 * ready for use according to the `config.deviceSetup` configuration provided
 * by the application.
 *
 * @param {Object} device Device object as given by nrf-device-lister.
 * @see DEVICE_SETUP_STARTED
 * @see DEVICE_SETUP_ERROR
 */
export const DEVICE_SETUP_COMPLETE = 'DEVICE_SETUP_COMPLETE';

/**
 * Indicates that some part of the device setup operation requires confirmation
 * from the user.
 *
 * @param {String} message The message to display to the user.
 */
export const DEVICE_SETUP_CONFIRMATION_REQUIRED = 'DEVICE_SETUP_CONFIRMATION_REQUIRED';

/**
 * Indicates that the user has responded to a device setup confirmation request.
 *
 * @param {Boolean} choice True if confirmed by user, false if not.
 */
export const DEVICE_SETUP_CONFIRMATION_RECEIVED = 'DEVICE_SETUP_CONFIRMATION_RECEIVED';

/**
 * Indicates that some part of the device setup operation requires the user
 * to choose something in order to proceed.
 *
 * @param {String} message The message to display to the user.
 * @param {Array<String>} choices The options that the user can choose from.
 */
export const DEVICE_SETUP_CHOICE_REQUIRED = 'DEVICE_SETUP_CHOICE_REQUIRED';

/**
 * Indicates that the user has responded to a device setup choice request.
 *
 * @param {String} choice The choice that the user has made.
 */
export const DEVICE_SETUP_CHOICE_RECEIVED = 'DEVICE_SETUP_CHOICE_RECEIVED';

/**
 * Indicates that devices have been detected. This is triggered by default at
 * startup, and whenever a device is attached/detached. The app can configure
 * which devices to look for by providing a `config.selectorTraits` property.
 *
 * @param {Array} devices Array of all attached devices, ref. nrf-device-lister.
 */
export const DEVICES_DETECTED = 'DEVICES_DETECTED';

let deviceLister;

function deviceSelectedAction(device) {
    return {
        type: DEVICE_SELECTED,
        device,
    };
}

function deviceSetupStartedAction(device) {
    return {
        type: DEVICE_SETUP_STARTED,
        device,
    };
}

function deviceSetupErrorAction(device, error) {
    return {
        type: DEVICE_SETUP_ERROR,
        device,
        error,
    };
}

function deviceSetupCompleteAction(device) {
    return {
        type: DEVICE_SETUP_COMPLETE,
        device,
    };
}

function devicesDetectedAction(devices) {
    return {
        type: DEVICES_DETECTED,
        devices,
    };
}

function deviceSetupConfirmationRequiredAction(message) {
    return {
        type: DEVICE_SETUP_CONFIRMATION_REQUIRED,
        message,
    };
}

function deviceSetupConfirmationReceivedAction(choice) {
    return {
        type: DEVICE_SETUP_CONFIRMATION_RECEIVED,
        choice,
    };
}

function deviceSetupChoiceRequiredAction(message, choices) {
    return {
        type: DEVICE_SETUP_CHOICE_REQUIRED,
        message,
        choices,
    };
}

function deviceSetupChoiceReceivedAction(choice) {
    return {
        type: DEVICE_SETUP_CHOICE_RECEIVED,
        choice,
    };
}

/**
 * Deselects the currently selected device.
 *
 * @returns {Object} Action object that can be passed to redux dispatch.
 */
export function deselectDevice() {
    return {
        type: DEVICE_DESELECTED,
    };
}

/**
 * Starts watching for devices with the given traits. See the nrf-device-lister
 * library for available traits. Whenever devices are attached/detached, this
 * will dispatch DEVICES_DETECTED with a complete list of attached devices.
 *
 * @returns {function(*)} Function that can be passed to redux dispatch.
 */
export function startWatchingDevices() {
    const config = getAppConfig();

    return (dispatch, getState) => {
        deviceLister = new DeviceLister(config.selectorTraits);

        deviceLister.on('conflated', devices => {
            const state = getState();
            if (state.core.device.selectedSerialNumber !== null &&
                !devices.has(state.core.device.selectedSerialNumber)) {
                dispatch(deselectDevice());
            }

            dispatch(devicesDetectedAction(Array.from(devices.values())));
        });

        deviceLister.on('error', err => {
            // TODO: Log USB specific errors
            logger.error(`Error while probing devices: ${err.message}`);
        });

        deviceLister.start();
    };
}

/**
 * Stops watching for devices.
 *
 * @returns {function(*)} Function that can be passed to redux dispatch.
 */
export function stopWatchingDevices() {
    return () => {
        deviceLister.removeAllListeners('conflated');
        deviceLister.removeAllListeners('error');
        deviceLister.stop();
    };
}

/**
 * Selects a device and sets it up for use according to the `config.deviceSetup`
 * configuration given by the app.
 *
 * @param {Object} device Device object, ref. nrf-device-lister.
 * @returns {function(*)} Function that can be passed to redux dispatch.
 */
export function selectAndSetupDevice(device) {
    return dispatch => {
        dispatch(deviceSelectedAction(device));

        const config = getAppConfig();
        if (config.deviceSetup) {
            dispatch(stopWatchingDevices());
            dispatch(deviceSetupStartedAction(device));

            const deviceSetup = { ...config.deviceSetup };
            if (!deviceSetup.promiseConfirm) {
                deviceSetup.promiseConfirm = message => new Promise(resolve => {
                    deviceSetupCallback = isConfirmed => {
                        resolve(isConfirmed);
                    };
                    dispatch(deviceSetupConfirmationRequiredAction(message));
                });
            }
            if (!deviceSetup.promiseChoice) {
                deviceSetup.promiseChoice = (message, choices) => new Promise((resolve, reject) => {
                    deviceSetupCallback = selectedFirmware => {
                        if (selectedFirmware) {
                            resolve(selectedFirmware);
                        } else {
                            reject(new Error('Cancelled by user.'));
                        }
                    };
                    dispatch(deviceSetupChoiceRequiredAction(message, choices));
                });
            }

            prepareDevice(device, deviceSetup)
                .then(preparedDevice => dispatch(deviceSetupCompleteAction(preparedDevice)))
                .catch(error => {
                    logger.error(`Error while setting up device ${device.serialNumber}: ${error.message}`);
                    dispatch(deviceSetupErrorAction(device, error));
                    dispatch(deselectDevice());
                })
                .then(() => dispatch(startWatchingDevices()));
        }
    };
}

/**
 * Responds to a device setup confirmation request with the given choice.
 *
 * @param {Boolean|String} choice The choice made by the user.
 * @returns {function(*)} Function that can be passed to redux dispatch.
 */
export function deviceSetupConfirmationReceived(choice) {
    return dispatch => {
        dispatch(deviceSetupConfirmationReceivedAction(choice));
        if (deviceSetupCallback) {
            deviceSetupCallback(choice);
            deviceSetupCallback = undefined;
        } else {
            logger.error('Received a device setup confirmation, but no callback exists.');
        }
    };
}

/**
 * Responds to a device setup choice request with the given choice.
 *
 * @param {Boolean|String} choice The choice made by the user.
 * @returns {function(*)} Function that can be passed to redux dispatch.
 */
export function deviceSetupChoiceReceived(choice) {
    return dispatch => {
        dispatch(deviceSetupChoiceReceivedAction(choice));
        if (deviceSetupCallback) {
            deviceSetupCallback(choice);
            deviceSetupCallback = undefined;
        } else {
            logger.error('Received a device setup choice, but no callback exists.');
        }
    };
}
