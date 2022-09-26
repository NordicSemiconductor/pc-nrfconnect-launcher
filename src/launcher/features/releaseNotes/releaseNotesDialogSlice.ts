/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import type { RootState } from '../..';

export type State = {
    source?: string;
    name?: string;
};

const initialState: State = {};

const slice = createSlice({
    name: 'releaseNotesDialog',
    initialState,
    reducers: {
        show(
            state,
            { payload }: PayloadAction<{ name: string; source: string }>
        ) {
            state.name = payload.name;
            state.source = payload.source;
        },
        hide() {
            return initialState;
        },
    },
});

export default slice.reducer;

export const { show, hide } = slice.actions;

export const getReleaseNotesDialog = (state: RootState) =>
    state.releaseNotesDialog;
