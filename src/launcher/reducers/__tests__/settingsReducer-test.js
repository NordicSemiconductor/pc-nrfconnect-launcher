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

import * as SettingsActions from '../../actions/settingsActions';
import reducer from '../settingsReducer';

const initialState = reducer(undefined, {});

describe('settingsReducer', () => {
    it('should not be loading in initial state', () => {
        expect(initialState.isLoading).toEqual(false);
    });

    it('should be loading when SETTINGS_LOAD has been dispatched', () => {
        const state = reducer(initialState, {
            type: SettingsActions.SETTINGS_LOAD,
        });
        expect(state.isLoading).toEqual(true);
    });

    it('should not be loading when SETTINGS_LOAD_SUCCESS has been dispatched', () => {
        const state = reducer(initialState.set('isLoading', true), {
            type: SettingsActions.SETTINGS_LOAD_SUCCESS,
            settings: {},
        });
        expect(state.isLoading).toEqual(false);
    });

    it('should not be loading when SETTINGS_LOAD_ERROR has been dispatched', () => {
        const state = reducer(initialState.set('isLoading', false), {
            type: SettingsActions.SETTINGS_LOAD_ERROR,
        });
        expect(state.isLoading).toEqual(false);
    });

    it('should set shouldCheckForUpdatesAtStartup to true after loading when enabled', () => {
        const state = reducer(
            initialState.set('shouldCheckForUpdatesAtStartup', false),
            {
                type: SettingsActions.SETTINGS_LOAD_SUCCESS,
                settings: {
                    shouldCheckForUpdatesAtStartup: true,
                },
            }
        );
        expect(state.shouldCheckForUpdatesAtStartup).toEqual(true);
    });

    it('should set shouldCheckForUpdatesAtStartup to false after loading when disabled', () => {
        const state = reducer(
            initialState.set('shouldCheckForUpdatesAtStartup', true),
            {
                type: SettingsActions.SETTINGS_LOAD_SUCCESS,
                settings: {
                    shouldCheckForUpdatesAtStartup: false,
                },
            }
        );
        expect(state.shouldCheckForUpdatesAtStartup).toEqual(false);
    });

    it('should set shouldCheckForUpdatesAtStartup to false after loading if it is not defined in settings', () => {
        const state = reducer(
            initialState.set('shouldCheckForUpdatesAtStartup', true),
            {
                type: SettingsActions.SETTINGS_LOAD_SUCCESS,
                settings: {
                    shouldCheckForUpdatesAtStartup: null,
                },
            }
        );
        expect(state.shouldCheckForUpdatesAtStartup).toEqual(false);
    });

    it('should set shouldCheckForUpdatesAtStartup to true when changed to enabled', () => {
        const state = reducer(
            initialState.set('shouldCheckForUpdatesAtStartup', false),
            {
                type: SettingsActions.SETTINGS_CHECK_UPDATES_AT_STARTUP_CHANGED,
                isEnabled: true,
            }
        );
        expect(state.shouldCheckForUpdatesAtStartup).toEqual(true);
    });

    it('should set shouldCheckForUpdatesAtStartup to false when changed to disabled', () => {
        const state = reducer(
            initialState.set('shouldCheckForUpdatesAtStartup', false),
            {
                type: SettingsActions.SETTINGS_CHECK_UPDATES_AT_STARTUP_CHANGED,
                isEnabled: false,
            }
        );
        expect(state.shouldCheckForUpdatesAtStartup).toEqual(false);
    });

    it('should show update check complete dialog when SETTINGS_UPDATE_CHECK_COMPLETE_DIALOG_SHOW has been dispatched', () => {
        const state = reducer(initialState, {
            type: SettingsActions.SETTINGS_UPDATE_CHECK_COMPLETE_DIALOG_SHOW,
        });
        expect(state.isUpdateCheckCompleteDialogVisible).toEqual(true);
    });

    it('should not show update check complete dialog when SETTINGS_UPDATE_CHECK_COMPLETE_DIALOG_HIDE has been dispatched', () => {
        const state = reducer(
            initialState.set('isUpdateCheckCompleteDialogVisible', true),
            {
                type: SettingsActions.SETTINGS_UPDATE_CHECK_COMPLETE_DIALOG_HIDE,
            }
        );
        expect(state.isUpdateCheckCompleteDialogVisible).toEqual(false);
    });
});
