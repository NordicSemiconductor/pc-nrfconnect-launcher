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

// import DeviceLister from 'nrf-device-lister';
import { getSetupModeForSerialNumber, setupSerialNumber } from 'nrf-device-setup';
import { logger } from '../../../api/logging';
import { getAppConfig } from '../../../util/apps';

/**
 * Indicates that a device has been selected.
 *
 * Apps can listen to this action in their middleware to add custom behavior when
 * the device is selected. Apps can also dispatch this action themselves to make
 * the device appear as selected in the DeviceSelector.
 *
 * @param {Object} device Device object, as given by nrf-device-lister.
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
 * Indicates that device setup is either complete, or not needed.
 *
 * This means that the device is ready for use according to the `config.deviceSetup`
 * configuration provided by the app. Apps can listen to this action in their middleware to
 * add custom behavior when device setup has completed.
*/
export const DEVICE_SETUP_COMPLETE = 'DEVICE_SETUP_COMPLETE';

/**
 * Indicates that device setup either failed, or was cancelled by the user.
 *
 * Apps can listen to this action in their middleware to add custom behavior
 * when device setup fails.
 *
 * @param {Error} error Error object describing the error.
 */
export const DEVICE_SETUP_ERROR = 'DEVICE_SETUP_ERROR';

/**
 * Indicates that the device setup might be destructive and requires confirmation
 * from the user. When the user has provided the required input, then
 * DEVICE_SETUP_CHOICE_RECEIVED is dispatched with the given input.
 *
 * @param {string} setupMode Either "dfu" or "jlink".
 */
export const DEVICE_SETUP_CONFIRMATION_REQUIRED = 'DEVICE_SETUP_CONFIRMATION_REQUIRED';

/**
 * Indicates that the user has provided confirmation to the device setup operation.
 * This action is dispatched after DEVICE_SETUP_CONFIRMATION_REQUIRED.
*/
export const DEVICE_SETUP_CONFIRMATION_RECEIVED = 'DEVICE_SETUP_CONFIRMATION_RECEIVED';

/**
 * Indicates that a DFU device setup operation requires the user
 * to choose from several options. When the user has provided the required
 * input, then DEVICE_SETUP_CHOICE_RECEIVED is dispatched with the given input.
 *
 * @param {String} message The message to display to the user.
 * @param {Array<String>} choices Values that the user can choose from.
 */
export const DEVICE_SETUP_CHOICE_REQUIRED = 'DEVICE_SETUP_CHOICE_REQUIRED';

/**
 * Indicates that the user has provided input to the DFU device setup operation.
 * This action is dispatched after DEVICE_SETUP_CHOICE_REQUIRED.
 *
 * @param {Boolean|String} input The input made by the user.
 */
export const DEVICE_SETUP_CHOICE_RECEIVED = 'DEVICE_SETUP_CHOICE_RECEIVED';


function deviceSelectedAction(device) {
    return {
        type: DEVICE_SELECTED,
        device,
    };
}

function deviceSetupErrorAction(error) {
    return {
        type: DEVICE_SETUP_ERROR,
        error,
    };
}

function deviceSetupCompleteAction() {
    return {
        type: DEVICE_SETUP_COMPLETE,
    };
}

function deviceSetupConfirmationRequiredAction(setupMode) {
    return {
        type: DEVICE_SETUP_CONFIRMATION_REQUIRED,
        setupMode,
    };
}

function deviceSetupConfirmationReceivedAction() {
    return {
        type: DEVICE_SETUP_CONFIRMATION_RECEIVED,
    };
}

function deviceSetupChoiceRequiredAction(message, choices) {
    return {
        type: DEVICE_SETUP_CHOICE_REQUIRED,
        message,
        choices,
    };
}

function deviceSetupChoiceReceivedAction() {
    return {
        type: DEVICE_SETUP_CHOICE_RECEIVED,
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
 * Selects a device and checks if it needs setup according to the `config.deviceSetup`
 * configuration given by the app. If it does, triggers a confirmation dialog.
 *
 * @param {Object} device Device object, ref. nrf-device-lister.
 * @returns {function(*)} Function that can be passed to redux dispatch.
 */
export function selectDevice(device) {
    return dispatch => {
        dispatch(deviceSelectedAction(device));

        const config = getAppConfig();
        console.log('selectDevice', config.deviceSetup);
        if (config.deviceSetup) {
            const deviceSetup = config.deviceSetup;

            getSetupModeForSerialNumber(device.serialNumber, deviceSetup).then(mode => {
                if (mode === 'ready' || mode === 'impossible') {
                    dispatch(deviceSetupCompleteAction(device));
                } else if (mode === 'dfu' || mode === 'jlink') {
                    dispatch(deviceSetupConfirmationRequiredAction(mode));
                } else {
                    throw new Error(`Got unknown setup mode from getSetupMode(): ${mode}`);
                }
            });
        } else {
            dispatch(deviceSetupCompleteAction(device));
        }
    };
}

/**
 * Called when the user has confirmed that they want to setup the device.
 * Triggers device setup if there is only one way to proceed with the setup,
 * or triggers a choice dialog if there are several.
 *
 * @param {boolean} proceed Whether to proceed with the setup, or abort
 * @param {number} serialNumber Serial number of the device under setup
 * @param {string} setupMode Either "dfu" or "jlink"
 * @returns {function(*)} Function that can be passed to redux dispatch.
 */
export function deviceSetupConfirmationReceived(proceed, serialNumber, setupMode) {
    return dispatch => {
        console.log('deviceSetupConfirmationReceived', proceed, serialNumber, setupMode);

        dispatch(deviceSetupConfirmationReceivedAction());
        const deviceSetup = getAppConfig().deviceSetup;
        console.log(deviceSetup);

        if (!proceed) {
            logger.error('Device setup cancelled by user');
            dispatch(deviceSetupErrorAction('Device setup cancelled by user'));
        } else if (setupMode === 'jlink') {
            setupSerialNumber(serialNumber, deviceSetup);
        } else if (setupMode === 'dfu') {
            const choices = Object.keys(deviceSetup.dfu);
            if (choices.length === 0) {
                logger.error('No DFU images available');
                dispatch(deviceSetupErrorAction('No DFU images available'));
            } else if (choices.length === 1) {
                setupSerialNumber(serialNumber, deviceSetup);
            } else {
                dispatch(deviceSetupChoiceRequiredAction('Which firmware do you want to program?', choices));
            }
        } else {
            throw new Error(`Got unknown setup mode at deviceSetupConfirmationReceived: ${setupMode}`);
        }
    };
}

/**
 * Called when the user has confirmed an option for DFU device setup (or cancelled
 * the operation). Triggers DFU setup of the device, with the choosen DFU image.
 *
 * @param {Boolean|String} input A string with the user's choice, or boolean false
 * @param {number} serialNumber Serial number of the device under setup
 * @returns {function(*)} Function that can be passed to redux dispatch.
 */
export function deviceSetupChoiceReceived(input, serialNumber) {
    return dispatch => {
        dispatch(deviceSetupChoiceReceivedAction());

        if (!input) {
            logger.error('Device setup cancelled by user');
            dispatch(deviceSetupErrorAction('Device setup cancelled by user'));
        } else {
            const dfu = getAppConfig().deviceSetup.dfu;
            if (dfu[input]) {
                // Fake a deviceSetup structure, containing only one DFU image
                const deviceSetup = {
                    dfu: {
                        [input]: dfu[input],
                    },
                };

                setupSerialNumber(serialNumber, deviceSetup).then(() => {
                    dispatch(deviceSetupCompleteAction());
                }).catch(err => {
                    logger.error(err.toString());
                    dispatch(deviceSetupErrorAction(err));
                });
            } else {
                logger.error('Specified DFU image does not exist');
                dispatch(deviceSetupErrorAction('Specified DFU image does not exist'));
            }
        }
    };
}

