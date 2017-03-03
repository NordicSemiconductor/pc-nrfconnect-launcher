/* eslint-disable import/first */

jest.mock('../../api', () => {});

import reducer from '../firmwareDialogReducer';
import * as FirmwareDialogActions from '../../actions/firmwareDialogActions';

const initialState = reducer(undefined, {});

describe('firmwareDialogReducer', () => {
    it('should be hidden by default', () => {
        expect(initialState.isVisible).toEqual(false);
    });

    it('should be visible and have a port object after show action has been dispatched', () => {
        const port = { comName: '/dev/tty1' };
        const state = reducer(initialState, {
            type: FirmwareDialogActions.FIRMWARE_DIALOG_SHOW,
            port,
        });
        expect(state.isVisible).toEqual(true);
        expect(state.port.toJS()).toEqual(port);
    });

    it('should not be visible and not have a port object after hide action has been dispatched', () => {
        const port = { comName: '/dev/tty1' };
        const firstState = reducer(initialState, {
            type: FirmwareDialogActions.FIRMWARE_DIALOG_SHOW,
            port,
        });
        const secondState = reducer(firstState, {
            type: FirmwareDialogActions.FIRMWARE_DIALOG_HIDE,
        });
        expect(secondState.isVisible).toEqual(false);
        expect(secondState.port).toEqual(null);
    });

    it('should have isInProgress true after firmware update action has been dispatched', () => {
        const state = reducer(initialState, {
            type: FirmwareDialogActions.FIRMWARE_DIALOG_UPDATE_REQUESTED,
        });
        expect(state.isInProgress).toEqual(true);
    });

    it('should have initial state after firmware update has succeeded', () => {
        const port = { comName: '/dev/tty1' };
        const firstState = reducer(initialState, {
            type: FirmwareDialogActions.FIRMWARE_DIALOG_SHOW,
            port,
        });
        const secondState = reducer(firstState, {
            type: FirmwareDialogActions.FIRMWARE_DIALOG_UPDATE_REQUESTED,
        });
        const thirdState = reducer(secondState, {
            type: FirmwareDialogActions.FIRMWARE_DIALOG_UPDATE_SUCCESS,
        });
        expect(thirdState).toEqual(initialState);
    });

    it('should have initial state after firmware update has failed', () => {
        const port = { comName: '/dev/tty1' };
        const firstState = reducer(initialState, {
            type: FirmwareDialogActions.FIRMWARE_DIALOG_SHOW,
            port,
        });
        const secondState = reducer(firstState, {
            type: FirmwareDialogActions.FIRMWARE_DIALOG_UPDATE_REQUESTED,
        });
        const thirdState = reducer(secondState, {
            type: FirmwareDialogActions.FIRMWARE_DIALOG_UPDATE_ERROR,
        });
        expect(thirdState).toEqual(initialState);
    });
});
