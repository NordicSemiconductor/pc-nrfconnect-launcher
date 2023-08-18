/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import dispatchTo from '@nordicsemiconductor/pc-nrfconnect-shared/test/dispatchTo';

import reducer, {
    hideUpdateCheckComplete,
    setCheckForUpdatesAtStartup,
    showUpdateCheckComplete,
} from './settingsSlice';

describe('settingsReducer', () => {
    it('should set shouldCheckForUpdatesAtStartup to true when enabling', () => {
        const state = dispatchTo(reducer, [
            setCheckForUpdatesAtStartup(false),
            setCheckForUpdatesAtStartup(true),
        ]);
        expect(state.shouldCheckForUpdatesAtStartup).toEqual(true);
    });

    it('should set shouldCheckForUpdatesAtStartup to false when disabling', () => {
        const state = dispatchTo(reducer, [
            setCheckForUpdatesAtStartup(true),
            setCheckForUpdatesAtStartup(false),
        ]);
        expect(state.shouldCheckForUpdatesAtStartup).toEqual(false);
    });

    it('should show update check complete dialog when showUpdateCheckCompleteDialog has been dispatched', () => {
        const state = dispatchTo(reducer, [showUpdateCheckComplete()]);
        expect(state.isUpdateCheckCompleteVisible).toEqual(true);
    });

    it('should not show update check complete dialog when hideUpdateCheckCompleteDialog has been dispatched', () => {
        const state = dispatchTo(reducer, [
            showUpdateCheckComplete(),
            hideUpdateCheckComplete(),
        ]);
        expect(state.isUpdateCheckCompleteVisible).toEqual(false);
    });
});
