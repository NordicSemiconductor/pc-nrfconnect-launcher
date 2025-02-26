/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import {
    getArtifactoryTokenInformation as getPersistedArtifactoryTokenInformation,
    getCheckForUpdatesAtStartup as getPersistedCheckForUpdatesAtStartup,
    getIsQuickStartInfoShownBefore as getPersistedIsQuickStartInfoShownBefore,
    removeArtifactoryTokenInformation as removePersistedArtifactoryTokenInformation,
    setArtifactoryTokenInformation as setPersistedArtifactoryTokenInformation,
    setCheckForUpdatesAtStartup as setPersistedCheckForUpdatesAtStartup,
    setQuickStartInfoWasShown as setPersistedQuickStartInfoWasShown,
} from '../../../common/persistedStore';
import type { TokenInformation } from '../../../ipc/artifactoryToken';
import type { RootState } from '../../store';

export type State = {
    shouldCheckForUpdatesAtStartup: boolean;
    isUpdateCheckCompleteVisible: boolean;
    isQuickStartInfoShownBefore: boolean;
    isAddArtifactoryTokenVisible: boolean;
    artifactoryTokenInformation?: TokenInformation;
};

const initialState: State = {
    shouldCheckForUpdatesAtStartup: getPersistedCheckForUpdatesAtStartup(),
    isUpdateCheckCompleteVisible: false,
    isQuickStartInfoShownBefore: getPersistedIsQuickStartInfoShownBefore(),
    isAddArtifactoryTokenVisible: false,
    artifactoryTokenInformation: getPersistedArtifactoryTokenInformation(),
};

const slice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setCheckForUpdatesAtStartup(
            state,
            { payload: checkForUpdatesAtStartup }: PayloadAction<boolean>
        ) {
            state.shouldCheckForUpdatesAtStartup = checkForUpdatesAtStartup;
            setPersistedCheckForUpdatesAtStartup(checkForUpdatesAtStartup);
        },
        showUpdateCheckComplete(state) {
            state.isUpdateCheckCompleteVisible = true;
        },
        hideUpdateCheckComplete(state) {
            state.isUpdateCheckCompleteVisible = false;
        },
        quickStartInfoWasShown(state) {
            state.isQuickStartInfoShownBefore = true;
            setPersistedQuickStartInfoWasShown();
        },
        showAddArtifactoryToken(state) {
            state.isAddArtifactoryTokenVisible = true;
        },
        hideAddArtifactoryToken(state) {
            state.isAddArtifactoryTokenVisible = false;
        },
        setArtifactoryTokenInformation(
            state,
            { payload: tokenInformation }: PayloadAction<TokenInformation>
        ) {
            state.artifactoryTokenInformation = tokenInformation;
            setPersistedArtifactoryTokenInformation(tokenInformation);
        },
        removeArtifactoryTokenInformation(state) {
            state.artifactoryTokenInformation = undefined;
            removePersistedArtifactoryTokenInformation();
        },
    },
});

export default slice.reducer;

export const {
    hideAddArtifactoryToken,
    hideUpdateCheckComplete,
    quickStartInfoWasShown,
    removeArtifactoryTokenInformation,
    setArtifactoryTokenInformation,
    setCheckForUpdatesAtStartup,
    showAddArtifactoryToken,
    showUpdateCheckComplete,
} = slice.actions;

export const getShouldCheckForUpdatesAtStartup = (state: RootState) =>
    state.settings.shouldCheckForUpdatesAtStartup;
export const getIsUpdateCheckCompleteVisible = (state: RootState) =>
    state.settings.isUpdateCheckCompleteVisible;
export const getIsQuickStartInfoShownBefore = (state: RootState) =>
    state.settings.isQuickStartInfoShownBefore;
export const getArtifactoryTokenInformation = (state: RootState) =>
    state.settings.artifactoryTokenInformation;
export const getIsAddArtifactoryTokenVisible = (state: RootState) =>
    state.settings.isAddArtifactoryTokenVisible;
