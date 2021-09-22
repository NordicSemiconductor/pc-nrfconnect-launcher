/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
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
