/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Record } from 'immutable';

import * as FirmwareDialogActions from '../actions/firmwareDialogActions';
import { getImmutableSerialPort } from '../models';

const InitialState = Record({
    port: null,
    isVisible: false,
    isInProgress: false,
});

const initialState = new InitialState();

function showDialog(state, port) {
    return state
        .set('port', getImmutableSerialPort(port))
        .set('isVisible', true);
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case FirmwareDialogActions.FIRMWARE_DIALOG_SHOW:
            return showDialog(state, action.port);
        case FirmwareDialogActions.FIRMWARE_DIALOG_HIDE:
            return initialState;
        case FirmwareDialogActions.FIRMWARE_DIALOG_UPDATE_REQUESTED:
            return state.set('isInProgress', true);
        default:
            return state;
    }
};

export default reducer;
