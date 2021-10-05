/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import * as ErrorDialogActions from '../../actions/errorDialogActions';
import reducer from '../errorDialogReducer';

const initialState = reducer(undefined, {});

describe('errorDialogReducer', () => {
    it('should be hidden by default', () => {
        expect(initialState.isVisible).toEqual(false);
    });

    it('should be visible and have the supplied message after show action has been dispatched', () => {
        const message = 'An error occurred';
        const state = reducer(initialState, {
            type: ErrorDialogActions.ERROR_DIALOG_SHOW,
            message,
        });
        expect(state.isVisible).toEqual(true);
        expect(state.messages.get(0)).toEqual(message);
    });

    it('should be visible and have all messages after multiple show actions have been dispatched', () => {
        const message1 = 'Error 1';
        const message2 = 'Error 2';
        const state1 = reducer(initialState, {
            type: ErrorDialogActions.ERROR_DIALOG_SHOW,
            message: message1,
        });
        const state2 = reducer(state1, {
            type: ErrorDialogActions.ERROR_DIALOG_SHOW,
            message: message2,
        });
        expect(state2.isVisible).toEqual(true);
        expect(state2.messages.get(0)).toEqual(message1);
        expect(state2.messages.get(1)).toEqual(message2);
    });

    it('should not add message if it already exists in list', () => {
        const message = 'Error 1';
        const state1 = reducer(initialState, {
            type: ErrorDialogActions.ERROR_DIALOG_SHOW,
            message,
        });
        const state2 = reducer(state1, {
            type: ErrorDialogActions.ERROR_DIALOG_SHOW,
            message,
        });
        expect(state2.messages.size).toEqual(1);
        expect(state2.messages.get(0)).toEqual(message);
    });

    it('should set dialog to invisible and clear message list when hide action has been dispatched', () => {
        const message = 'Error 1';
        const state1 = reducer(initialState, {
            type: ErrorDialogActions.ERROR_DIALOG_SHOW,
            message,
        });
        const state2 = reducer(state1, {
            type: ErrorDialogActions.ERROR_DIALOG_HIDE,
        });
        expect(state2.isVisible).toEqual(false);
        expect(state2.messages.size).toEqual(0);
    });
});
