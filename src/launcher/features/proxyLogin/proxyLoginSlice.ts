/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { AuthInfo } from 'electron';

import type { RootState } from '../../store';

export type State = {
    loginRequest: {
        username: string;
        host: string;
        requestIds: string[];
    };
    loginError: {
        isDialogVisible: boolean;
    };
};

const initialState: State = {
    loginRequest: {
        username: '',
        host: '',
        requestIds: [],
    },
    loginError: {
        isDialogVisible: false,
    },
};

const slice = createSlice({
    name: 'proxyLogin',
    initialState,
    reducers: {
        loginRequestedByServer(
            state,
            {
                payload: { authInfo, requestId },
            }: PayloadAction<{ requestId: string; authInfo: AuthInfo }>
        ) {
            state.loginRequest.requestIds.push(requestId);
            state.loginRequest.host = authInfo.realm
                ? `${authInfo.host} (realm: ${authInfo.realm})`
                : authInfo.host;
        },
        loginCancelledByUser(state) {
            state.loginRequest.requestIds = [];
            state.loginError.isDialogVisible = true;
        },
        loginRequestSent(state) {
            state.loginRequest.requestIds = [];
        },
        changeUserName(state, { payload: username }: PayloadAction<string>) {
            state.loginRequest.username = username;
        },
        loginErrorDialogClosed(state) {
            state.loginError.isDialogVisible = false;
        },
    },
});

export default slice.reducer;

export const {
    loginRequestedByServer,
    loginCancelledByUser,
    loginRequestSent,
    changeUserName,
    loginErrorDialogClosed,
} = slice.actions;

export const getProxyLoginRequest = (state: RootState) => ({
    ...state.proxyLogin.loginRequest,
    isVisible: state.proxyLogin.loginRequest.requestIds.length > 0,
});

export const getIsErrorVisible = (state: RootState) =>
    state.proxyLogin.loginError.isDialogVisible;
