/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Notifications } from '../../../ipc/prototypeAccountReport';
import type { RootState } from '../../store';

export type State = {
    notifications: Notifications;
};

const initialState: State = {
    notifications: [],
};

const slice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        setNotifications(state, action: PayloadAction<Notifications>) {
            state.notifications = [...action.payload];
        },
    },
});

export default slice.reducer;

export const { setNotifications } = slice.actions;

export const getNotifications = (state: RootState) =>
    state.notifications.notifications;
