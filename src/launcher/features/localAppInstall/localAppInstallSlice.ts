/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice } from '@reduxjs/toolkit';

import type { RootState } from '../../store';

type State = {
    isDropZoneVisible: boolean;
};

const initialState: State = {
    isDropZoneVisible: false,
};

const slice = createSlice({
    name: 'localAppInstall',
    initialState,
    reducers: {
        showDropZone(state) {
            state.isDropZoneVisible = true;
        },
        hideDropZone(state) {
            state.isDropZoneVisible = false;
        },
    },
});

export default slice.reducer;

export const { hideDropZone, showDropZone } = slice.actions;

export const isDropZoneVisible = (state: RootState) =>
    state.localAppInstall.isDropZoneVisible;
