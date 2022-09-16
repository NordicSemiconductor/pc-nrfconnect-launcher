/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    checkUpdatesAtStartupChangedAction,
    hideUpdateCheckCompleteDialog,
    loadSettingsAction,
    loadSettingsErrorAction,
    loadSettingsSuccessAction,
    showUpdateCheckCompleteDialog,
} from '../../actions/settingsActions';
import reducer from '../settingsReducer';

const initialState = reducer(undefined, {});

describe('settingsReducer', () => {
    it('should not be loading in initial state', () => {
        expect(initialState.isLoading).toEqual(false);
    });

    it('should be loading when loadSettings has been dispatched', () => {
        const state = reducer(initialState, loadSettingsAction());
        expect(state.isLoading).toEqual(true);
    });

    it('should not be loading when loadSettingsSuccess has been dispatched', () => {
        const state = reducer(
            initialState.set('isLoading', true),
            loadSettingsSuccessAction({})
        );
        expect(state.isLoading).toEqual(false);
    });

    it('should not be loading when loadSettingsError has been dispatched', () => {
        const state = reducer(
            initialState.set('isLoading', false),
            loadSettingsErrorAction()
        );
        expect(state.isLoading).toEqual(false);
    });

    it('should set shouldCheckForUpdatesAtStartup to true after loading when enabled', () => {
        const state = reducer(
            initialState.set('shouldCheckForUpdatesAtStartup', false),
            loadSettingsSuccessAction({
                shouldCheckForUpdatesAtStartup: true,
            })
        );
        expect(state.shouldCheckForUpdatesAtStartup).toEqual(true);
    });

    it('should set shouldCheckForUpdatesAtStartup to false after loading when disabled', () => {
        const state = reducer(
            initialState.set('shouldCheckForUpdatesAtStartup', true),
            loadSettingsSuccessAction({
                shouldCheckForUpdatesAtStartup: false,
            })
        );
        expect(state.shouldCheckForUpdatesAtStartup).toEqual(false);
    });

    it('should set shouldCheckForUpdatesAtStartup to false after loading if it is not defined in settings', () => {
        const state = reducer(
            initialState.set('shouldCheckForUpdatesAtStartup', true),
            loadSettingsSuccessAction({
                shouldCheckForUpdatesAtStartup: null,
            })
        );
        expect(state.shouldCheckForUpdatesAtStartup).toEqual(false);
    });

    it('should set shouldCheckForUpdatesAtStartup to true when changed to enabled', () => {
        const state = reducer(
            initialState.set('shouldCheckForUpdatesAtStartup', false),
            checkUpdatesAtStartupChangedAction(true)
        );
        expect(state.shouldCheckForUpdatesAtStartup).toEqual(true);
    });

    it('should set shouldCheckForUpdatesAtStartup to false when changed to disabled', () => {
        const state = reducer(
            initialState.set('shouldCheckForUpdatesAtStartup', false),
            checkUpdatesAtStartupChangedAction(false)
        );
        expect(state.shouldCheckForUpdatesAtStartup).toEqual(false);
    });

    it('should show update check complete dialog when showUpdateCheckCompleteDialog has been dispatched', () => {
        const state = reducer(initialState, showUpdateCheckCompleteDialog());
        expect(state.isUpdateCheckCompleteDialogVisible).toEqual(true);
    });

    it('should not show update check complete dialog when hideUpdateCheckCompleteDialog has been dispatched', () => {
        const state = reducer(
            initialState.set('isUpdateCheckCompleteDialogVisible', true),
            hideUpdateCheckCompleteDialog()
        );
        expect(state.isUpdateCheckCompleteDialogVisible).toEqual(false);
    });
});
