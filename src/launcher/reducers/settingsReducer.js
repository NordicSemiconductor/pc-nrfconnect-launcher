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

import { Map, Record } from 'immutable';
import * as SettingsActions from '../actions/settingsActions';
import * as UsageDataActions from '../actions/usageDataActions';

const InitialState = Record({
    shouldCheckForUpdatesAtStartup: true,
    isUpdateCheckCompleteDialogVisible: false,
    isLoading: false,
    sources: Map({}),
    isAddSourceDialogVisible: false,
    isRemoveSourceDialogVisible: false,
    removeSource: null,
    isUsageDataDialogVisible: false,
    isSendingUsageData: false,
});

const initialState = new InitialState();

function setSettings(state, settings) {
    return state
        .set('isLoading', false)
        .set(
            'shouldCheckForUpdatesAtStartup',
            !!settings.shouldCheckForUpdatesAtStartup
        )
        .set('sources', new Map(settings.sources));
}

function addSource(state, name, url) {
    const sources = state.get('sources');
    const newSources = sources.set(name, url);
    return state.set('sources', newSources);
}

function removeSource(state, name) {
    const sources = state.get('sources');
    const newSources = sources.delete(name);
    return state.set('sources', newSources);
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case SettingsActions.SETTINGS_LOAD:
            return state.set('isLoading', true);
        case SettingsActions.SETTINGS_LOAD_SUCCESS:
            return setSettings(state, action.settings);
        case SettingsActions.SETTINGS_LOAD_ERROR:
            return state.set('isLoading', false);
        case SettingsActions.SETTINGS_CHECK_UPDATES_AT_STARTUP_CHANGED:
            return state.set(
                'shouldCheckForUpdatesAtStartup',
                action.isEnabled
            );
        case SettingsActions.SETTINGS_UPDATE_CHECK_COMPLETE_DIALOG_SHOW:
            return state.set('isUpdateCheckCompleteDialogVisible', true);
        case SettingsActions.SETTINGS_UPDATE_CHECK_COMPLETE_DIALOG_HIDE:
            return state.set('isUpdateCheckCompleteDialogVisible', false);
        case SettingsActions.SETTINGS_SOURCE_ADDED:
            return addSource(state, action.name, action.url);
        case SettingsActions.SETTINGS_SOURCE_REMOVED:
            return removeSource(state, action.name);
        case SettingsActions.SETTINGS_ADD_SOURCE_DIALOG_SHOW:
            return state.set('isAddSourceDialogVisible', true);
        case SettingsActions.SETTINGS_ADD_SOURCE_DIALOG_HIDE:
            return state.set('isAddSourceDialogVisible', false);
        case SettingsActions.SETTINGS_REMOVE_SOURCE_DIALOG_SHOW:
            return state
                .set('isRemoveSourceDialogVisible', true)
                .set('removeSource', action.name);
        case SettingsActions.SETTINGS_REMOVE_SOURCE_DIALOG_HIDE:
            return state
                .set('isRemoveSourceDialogVisible', false)
                .set('removeSource', null);
        case UsageDataActions.USAGE_DATA_DIALOG_SHOW:
            return state.set('isUsageDataDialogVisible', true);
        case UsageDataActions.USAGE_DATA_DIALOG_HIDE:
            return state.set('isUsageDataDialogVisible', false);
        case UsageDataActions.USAGE_DATA_SEND_ON:
            return state.set('isSendingUsageData', true);
        case UsageDataActions.USAGE_DATA_SEND_OFF:
            return state.set('isSendingUsageData', false);
        default:
            return state;
    }
};

export default reducer;
