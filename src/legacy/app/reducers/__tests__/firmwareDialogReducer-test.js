/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import * as FirmwareDialogActions from '../../actions/firmwareDialogActions';
import reducer from '../firmwareDialogReducer';

const initialState = reducer(undefined, {});

describe('firmwareDialogReducer', () => {
    it('should be hidden, with no port, and not in progress by default', () => {
        expect(initialState.isVisible).toEqual(false);
    });

    it('should be visible and have a port object after show action has been dispatched', () => {
        const port = {
            comName: '/dev/tty1',
            path: '/dev/tty1',
            manufacturer: null,
            productId: null,
            serialNumber: null,
            vendorId: null,
        };
        const state = reducer(initialState, {
            type: FirmwareDialogActions.FIRMWARE_DIALOG_SHOW,
            port,
        });
        expect(state.isVisible).toEqual(true);
        expect(state.port.toJS()).toEqual(port);
    });

    it('should have isInProgress true after firmware update action has been dispatched', () => {
        const state = reducer(initialState, {
            type: FirmwareDialogActions.FIRMWARE_DIALOG_UPDATE_REQUESTED,
        });
        expect(state.isInProgress).toEqual(true);
    });

    it('should be hidden, with no port, and not in progress after hide action has been dispatched', () => {
        const port = { path: '/dev/tty1' };
        const firstState = reducer(initialState, {
            type: FirmwareDialogActions.FIRMWARE_DIALOG_SHOW,
            port,
        });
        const secondState = reducer(firstState, {
            type: FirmwareDialogActions.FIRMWARE_DIALOG_UPDATE_REQUESTED,
        });
        const thirdState = reducer(secondState, {
            type: FirmwareDialogActions.FIRMWARE_DIALOG_HIDE,
        });
        expect(thirdState.isVisible).toEqual(false);
        expect(thirdState.isInProgress).toEqual(false);
        expect(thirdState.port).toEqual(null);
    });
});
