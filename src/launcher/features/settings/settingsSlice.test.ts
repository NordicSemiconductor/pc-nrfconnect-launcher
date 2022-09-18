/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import dispatchTo from 'pc-nrfconnect-shared/test/dispatchTo';

import reducer, {
    hideUpdateCheckCompleteDialog,
    setCheckUpdatesAtStartup,
    showUpdateCheckCompleteDialog,
} from './settingsSlice';

describe('settingsReducer', () => {
    it('should set shouldCheckForUpdatesAtStartup to true when enabling', () => {
        const state = dispatchTo(reducer, [
            setCheckUpdatesAtStartup(false),
            setCheckUpdatesAtStartup(true),
        ]);
        expect(state.shouldCheckForUpdatesAtStartup).toEqual(true);
    });

    it('should set shouldCheckForUpdatesAtStartup to false when disabling', () => {
        const state = dispatchTo(reducer, [
            setCheckUpdatesAtStartup(true),
            setCheckUpdatesAtStartup(false),
        ]);
        expect(state.shouldCheckForUpdatesAtStartup).toEqual(false);
    });

    it('should show update check complete dialog when showUpdateCheckCompleteDialog has been dispatched', () => {
        const state = dispatchTo(reducer, [showUpdateCheckCompleteDialog()]);
        expect(state.isUpdateCheckCompleteDialogVisible).toEqual(true);
    });

    it('should not show update check complete dialog when hideUpdateCheckCompleteDialog has been dispatched', () => {
        const state = dispatchTo(reducer, [
            showUpdateCheckCompleteDialog(),
            hideUpdateCheckCompleteDialog(),
        ]);
        expect(state.isUpdateCheckCompleteDialogVisible).toEqual(false);
    });
});
