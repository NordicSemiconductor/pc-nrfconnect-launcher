/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable import/first */

jest.mock('electron', () => ({
    remote: {
        require: () => ({
            autoUpdater: {},
            CancellationToken: class CancellationToken {},
        }),
    },
}));

import * as AutoUpdateActions from '../../actions/autoUpdateActions';
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

    it('should show the update available dialog when AUTO_UPDATE_AVAILABLE has been dispatched', () => {
        const state = reducer(initialState, {
            type: AutoUpdateActions.AUTO_UPDATE_AVAILABLE,
        });
        expect(state.isUpdateAvailableDialogVisible).toEqual(true);
    });

    it('should know latest version when AUTO_UPDATE_AVAILABLE has been dispatched with version', () => {
        const state = reducer(initialState, {
            type: AutoUpdateActions.AUTO_UPDATE_AVAILABLE,
            version: '1.2.3',
        });
        expect(state.latestVersion).toEqual('1.2.3');
    });

    it('should hide the update available dialog when AUTO_UPDATE_POSTPONE has been dispatched', () => {
        const firstState = reducer(initialState, {
            type: AutoUpdateActions.AUTO_UPDATE_AVAILABLE,
        });
        const secondState = reducer(firstState, {
            type: AutoUpdateActions.AUTO_UPDATE_POSTPONE,
        });
        expect(secondState.isUpdateAvailableDialogVisible).toEqual(false);
    });

    it('should hide the update available dialog when AUTO_UPDATE_START_DOWNLOAD has been dispatched', () => {
        const firstState = reducer(initialState, {
            type: AutoUpdateActions.AUTO_UPDATE_AVAILABLE,
        });
        const secondState = reducer(firstState, {
            type: AutoUpdateActions.AUTO_UPDATE_START_DOWNLOAD,
        });
        expect(secondState.isUpdateAvailableDialogVisible).toEqual(false);
    });

    it('should show the progress dialog when AUTO_UPDATE_START_DOWNLOAD has been dispatched', () => {
        const state = reducer(initialState, {
            type: AutoUpdateActions.AUTO_UPDATE_START_DOWNLOAD,
        });
        expect(state.isUpdateProgressDialogVisible).toEqual(true);
    });

    it('should not have progress/cancel support when AUTO_UPDATE_START_DOWNLOAD has been dispatched without it', () => {
        const state = reducer(initialState, {
            type: AutoUpdateActions.AUTO_UPDATE_START_DOWNLOAD,
        });
        expect(state.isProgressSupported).toEqual(false);
        expect(state.isCancelSupported).toEqual(false);
    });

    it('should set progress support when AUTO_UPDATE_START_DOWNLOAD has been dispatched with progress support', () => {
        const state = reducer(initialState, {
            type: AutoUpdateActions.AUTO_UPDATE_START_DOWNLOAD,
            isProgressSupported: true,
        });
        expect(state.isProgressSupported).toEqual(true);
    });

    it('should set cancel support when AUTO_UPDATE_START_DOWNLOAD has been dispatched with cancel support', () => {
        const state = reducer(initialState, {
            type: AutoUpdateActions.AUTO_UPDATE_START_DOWNLOAD,
            isCancelSupported: true,
        });
        expect(state.isCancelSupported).toEqual(true);
    });

    it('should update download percentage when AUTO_UPDATE_DOWNLOADING has been dispatched with percent', () => {
        const state = reducer(initialState, {
            type: AutoUpdateActions.AUTO_UPDATE_DOWNLOADING,
            percentDownloaded: 42,
        });
        expect(state.percentDownloaded).toEqual(42);
    });

    it('should round download percentage down to nearest integer', () => {
        const state = reducer(initialState, {
            type: AutoUpdateActions.AUTO_UPDATE_DOWNLOADING,
            percentDownloaded: 42.9,
        });
        expect(state.percentDownloaded).toEqual(42);
    });

    it('should set isCancelling when AUTO_UPDATE_CANCEL_DOWNLOAD has been dispatched', () => {
        const state = reducer(initialState, {
            type: AutoUpdateActions.AUTO_UPDATE_CANCEL_DOWNLOAD,
        });
        expect(state.isCancelling).toEqual(true);
    });

    it('should return initial state when AUTO_UPDATE_DOWNLOAD_CANCELLED has been dispatched', () => {
        const state = reducer(initialState, {
            type: AutoUpdateActions.AUTO_UPDATE_DOWNLOAD_CANCELLED,
        });
        expect(state).toEqual(initialState);
    });

    it('should return initial state when AUTO_UPDATE_ERROR has been dispatched', () => {
        const state = reducer(initialState, {
            type: AutoUpdateActions.AUTO_UPDATE_ERROR,
        });
        expect(state).toEqual(initialState);
    });
});
