/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import dispatchTo from '@nordicsemiconductor/pc-nrfconnect-shared/test/dispatchTo';

import reducer, {
    cancelDownload,
    reset,
    startDownload,
    updateAvailable,
    updateDownloading,
} from './launcherUpdateSlice';

describe('launcherUpdateReducer', () => {
    it('should not show any dialogs in initial state', () => {
        const initialState = dispatchTo(reducer);
        expect(initialState.isUpdateAvailableDialogVisible).toEqual(false);
        expect(initialState.isUpdateProgressDialogVisible).toEqual(false);
    });

    it('should have zero download percentage in initial state', () => {
        const initialState = dispatchTo(reducer);
        expect(initialState.percentDownloaded).toEqual(0);
    });

    it('should show the update available dialog when updateAvailable has been dispatched', () => {
        const state = dispatchTo(reducer, [updateAvailable('1.2.3')]);
        expect(state.isUpdateAvailableDialogVisible).toEqual(true);
    });

    it('should know latest version when updateAvailable has been dispatched with version', () => {
        const state = dispatchTo(reducer, [updateAvailable('1.2.3')]);
        expect(state.latestVersion).toEqual('1.2.3');
    });

    it('should hide the update available dialog when startDownload has been dispatched', () => {
        const state = dispatchTo(reducer, [
            updateAvailable('1.2.3'),
            startDownload(),
        ]);
        expect(state.isUpdateAvailableDialogVisible).toEqual(false);
    });

    it('should show the progress dialog when startDownload has been dispatched', () => {
        const state = dispatchTo(reducer, [startDownload()]);
        expect(state.isUpdateProgressDialogVisible).toEqual(true);
    });

    it('should not have progress/cancel support when startDownload has been dispatched without it', () => {
        const state = dispatchTo(reducer, [
            startDownload({
                isCancelSupported: false,
                isProgressSupported: false,
            }),
        ]);
        expect(state.isProgressSupported).toEqual(false);
        expect(state.isCancelSupported).toEqual(false);
    });

    it('should set progress support when startDownload has been dispatched with progress support', () => {
        const state = dispatchTo(reducer, [
            startDownload({ isProgressSupported: true }),
        ]);
        expect(state.isProgressSupported).toEqual(true);
    });

    it('should set cancel support when startDownload has been dispatched with cancel support', () => {
        const state = dispatchTo(reducer, [
            startDownload({ isCancelSupported: true }),
        ]);
        expect(state.isCancelSupported).toEqual(true);
    });

    it('should update download percentage when updateDownloading has been dispatched with percent', () => {
        const state = dispatchTo(reducer, [updateDownloading(42)]);
        expect(state.percentDownloaded).toEqual(42);
    });

    it('should round download percentage down to nearest integer', () => {
        const state = dispatchTo(reducer, [updateDownloading(42.9)]);
        expect(state.percentDownloaded).toEqual(42);
    });

    it('should set isCancelling when cancelDownload has been dispatched', () => {
        const state = dispatchTo(reducer, [cancelDownload()]);
        expect(state.isCancelling).toEqual(true);
    });

    it('should return initial state when reset has been dispatched', () => {
        const initialState = dispatchTo(reducer);
        const state = dispatchTo(reducer, [reset()]);
        expect(state).toEqual(initialState);
    });
});
