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

import {
    DEVICES_DETECTED,
    DEVICE_SELECTED,
    DEVICE_DESELECTED,
    DEVICE_SETUP_COMPLETE,
    DEVICE_SETUP_ERROR,
    DEVICE_SETUP_INPUT_REQUIRED,
    DEVICE_SETUP_INPUT_RECEIVED,
} from './deviceActions';

const initialState = {
    devices: [],
    selectedSerialNumber: null,
    isSetupDialogVisible: false,
    isSetupWaitingForUserInput: false,
    setupDialogText: null,
    setupDialogChoices: [],
};

export default (state = initialState, action) => {
    switch (action.type) {
        case DEVICES_DETECTED:
            return { ...state, devices: [...action.devices] };
        case DEVICE_SELECTED:
            return { ...state, selectedSerialNumber: action.device.serialNumber };
        case DEVICE_DESELECTED:
            return { ...state, selectedSerialNumber: initialState.selectedSerialNumber };
        case DEVICE_SETUP_COMPLETE:
        case DEVICE_SETUP_ERROR:
            return {
                ...state,
                isSetupDialogVisible: initialState.isSetupDialogVisible,
                setupDialogText: initialState.setupDialogText,
                setupDialogChoices: initialState.setupDialogChoices,
            };
        case DEVICE_SETUP_INPUT_REQUIRED:
            return {
                ...state,
                isSetupDialogVisible: true,
                isSetupWaitingForUserInput: true,
                setupDialogText: action.message,
                setupDialogChoices: action.choices == null ? [] : [...action.choices],
            };
        case DEVICE_SETUP_INPUT_RECEIVED:
            return { ...state, isSetupWaitingForUserInput: false };
        default:
            return state;
    }
};
