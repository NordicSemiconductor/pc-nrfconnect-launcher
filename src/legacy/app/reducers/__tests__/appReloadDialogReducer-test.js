/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import * as AppReloadDialogActions from '../../actions/appReloadDialogActions';
import reducer from '../appReloadDialogReducer';

const initialState = reducer(undefined, {});

describe('appReloadDialogReducer', () => {
    it('should be invisible and no message carried when initializing', () => {
        expect(initialState.isVisible).toEqual(false);
        expect(initialState.message).toEqual('');
    });

    it('should be visible and carry message when showing dialog', () => {
        const message = 'App needs reload';
        const newState = reducer(
            initialState,
            AppReloadDialogActions.showDialog(message)
        );

        expect(newState.isVisible).toEqual(true);
        expect(newState.message).toEqual(message);
    });

    it('should be initial state when hiding dialog', () => {
        const newState = reducer(
            initialState,
            AppReloadDialogActions.hideDialog()
        );

        expect(newState.isVisible).toEqual(false);
        expect(newState.message).toEqual('');
    });
});
