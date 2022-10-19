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
    username: string;
    isLoginDialogVisible: boolean;
    isErrorDialogVisible: boolean;
    loginDialogMessage?: string;
    requestId?: string;
};

const initialState: State = {
    username: '',
    isLoginDialogVisible: false,
    isErrorDialogVisible: false,
    loginDialogMessage: undefined,
    requestId: undefined,
};

const slice = createSlice({
    name: 'proxyLogin',
    initialState,
    reducers: {
        loginRequestedByServer(
            state,
            action: PayloadAction<{ requestId: string; authInfo: AuthInfo }>
        ) {
            const proxyString = `${action.payload.authInfo.host}${
                !action.payload.authInfo.realm
                    ? ''
                    : ` (realm: ${action.payload.authInfo.realm})`
            }`;

            state.requestId = action.payload.requestId;
            state.loginDialogMessage =
                `The proxy server ${proxyString} requires authentication. ` +
                'Please enter username and password';
            state.isLoginDialogVisible = true;
        },
        loginCancelledByUser(state) {
            state.isLoginDialogVisible = false;
            state.isErrorDialogVisible = true;
        },
        loginRequestSent(state, { payload: username }: PayloadAction<string>) {
            state.isLoginDialogVisible = false;
            state.username = username;
        },
        changeUserName(state, { payload: username }: PayloadAction<string>) {
            state.username = username;
        },
        loginErrorDialogClosed(state) {
            state.isErrorDialogVisible = false;
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

export const getProxyLogin = (state: RootState) => state.proxyLogin;
