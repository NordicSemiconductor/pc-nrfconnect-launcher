/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice } from '@reduxjs/toolkit';
import os from 'os';

import { getDoNotShowAppleSiliconWarning } from '../../../common/persistedStore';
import type { RootState } from '../../store';

export type State = {
    isAppleSiliconDialogVisible: boolean;
};

const isAppleSilicon = os.cpus()[0].model.includes('Apple');

export const isIntelElectronOnAppleSilicon =
    isAppleSilicon && process.arch !== 'arm64';

const initialState: State = {
    isAppleSiliconDialogVisible:
        process.platform === 'darwin' &&
        isIntelElectronOnAppleSilicon &&
        !getDoNotShowAppleSiliconWarning(),
};

const slice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        showAppleSiliconDialog(state) {
            state.isAppleSiliconDialogVisible = true;
        },
        hideAppleSiliconDialog(state) {
            state.isAppleSiliconDialogVisible = false;
        },
    },
});

export default slice.reducer;

export const { showAppleSiliconDialog, hideAppleSiliconDialog } = slice.actions;

export const getIsAppleSiliconDialogVisible = (state: RootState) =>
    state.appleSilicon.isAppleSiliconDialogVisible;
