/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
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
                type:
                    SettingsActions.SETTINGS_UPDATE_CHECK_COMPLETE_DIALOG_HIDE,
            }
        );
        expect(state.isUpdateCheckCompleteDialogVisible).toEqual(false);
    });
});
