/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    cancelDownloadAction,
    resetAction,
    startDownloadAction,
    updateAvailableAction,
    updateDownloadingAction,
} from '../../actions/autoUpdateActions';
import reducer from '../autoUpdateReducer';

const initialState = reducer(undefined, {});

describe('autoUpdateReducer', () => {
    it('should not show any dialogs in initial state', () => {
        expect(initialState.isUpdateAvailableDialogVisible).toEqual(false);
        expect(initialState.isUpdateProgressDialogVisible).toEqual(false);
    });

    it('should have zero download percentage in initial state', () => {
        expect(initialState.percentDownloaded).toEqual(0);
    });

    it('should show the update available dialog when updateAvailable has been dispatched', () => {
        const state = reducer(initialState, updateAvailableAction());
        expect(state.isUpdateAvailableDialogVisible).toEqual(true);
    });

    it('should know latest version when updateAvailable has been dispatched with version', () => {
        const state = reducer(initialState, updateAvailableAction('1.2.3'));
        expect(state.latestVersion).toEqual('1.2.3');
    });

    it('should hide the update available dialog when startDownload has been dispatched', () => {
        const firstState = reducer(initialState, updateAvailableAction());
        const secondState = reducer(
            firstState,
            startDownloadAction(false, false)
        );
        expect(secondState.isUpdateAvailableDialogVisible).toEqual(false);
    });

    it('should show the progress dialog when startDownload has been dispatched', () => {
        const state = reducer(initialState, startDownloadAction(false, false));
        expect(state.isUpdateProgressDialogVisible).toEqual(true);
    });

    it('should not have progress/cancel support when startDownload has been dispatched without it', () => {
        const state = reducer(initialState, startDownloadAction(false, false));
        expect(state.isProgressSupported).toEqual(false);
        expect(state.isCancelSupported).toEqual(false);
    });

    it('should set progress support when startDownload has been dispatched with progress support', () => {
        const state = reducer(initialState, startDownloadAction(true, false));
        expect(state.isProgressSupported).toEqual(true);
    });

    it('should set cancel support when startDownload has been dispatched with cancel support', () => {
        const state = reducer(initialState, startDownloadAction(false, true));
        expect(state.isCancelSupported).toEqual(true);
    });

    it('should update download percentage when updateDownloading has been dispatched with percent', () => {
        const state = reducer(initialState, updateDownloadingAction(42));
        expect(state.percentDownloaded).toEqual(42);
    });

    it('should round download percentage down to nearest integer', () => {
        const state = reducer(initialState, updateDownloadingAction(42.9));
        expect(state.percentDownloaded).toEqual(42);
    });

    it('should set isCancelling when cancelDownload has been dispatched', () => {
        const state = reducer(initialState, cancelDownloadAction());
        expect(state.isCancelling).toEqual(true);
    });

    it('should return initial state when reset has been dispatched', () => {
        const state = reducer(initialState, resetAction());
        expect(state).toEqual(initialState);
    });
});
