/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ErrorDialogActions } from 'pc-nrfconnect-shared';

export const PROXY_LOGIN_REQUESTED_BY_SERVER =
    'PROXY_LOGIN_REQUESTED_BY_SERVER';
export const PROXY_LOGIN_CANCELLED_BY_USER = 'PROXY_LOGIN_CANCELLED_BY_USER';
export const PROXY_LOGIN_ERROR_DIALOG_CLOSED =
    'PROXY_LOGIN_ERROR_DIALOG_CLOSED';
export const PROXY_LOGIN_DIALOG_USERNAME_CHANGED =
    'PROXY_LOGIN_DIALOG_USERNAME_CHANGED';
export const PROXY_LOGIN_REQUEST_SENT = 'PROXY_LOGIN_REQUEST_SENT';
export const PROXY_LOGIN_REQUEST_ERROR = 'PROXY_LOGIN_REQUEST_ERROR';

let proxyLoginCallback;

function loginRequestedByServerAction(message) {
    return {
        type: PROXY_LOGIN_REQUESTED_BY_SERVER,
        message,
    };
}

function loginCancelledByUserAction() {
    return {
        type: PROXY_LOGIN_CANCELLED_BY_USER,
    };
}

function loginRequestSentAction(username) {
    return {
        type: PROXY_LOGIN_REQUEST_SENT,
        username,
    };
}

function loginRequestErrorAction() {
    return {
        type: PROXY_LOGIN_REQUEST_ERROR,
    };
}

export function changeUserName(username) {
    return {
        type: PROXY_LOGIN_DIALOG_USERNAME_CHANGED,
        username,
    };
}

export function loginErrorDialogClosedAction() {
    return {
        type: PROXY_LOGIN_ERROR_DIALOG_CLOSED,
    };
}

export function loginRequestedByServer(message, loginCallback) {
    proxyLoginCallback = loginCallback;
    return dispatch => {
        dispatch(loginRequestedByServerAction(message));
    };
}

export function authenticate(authInfo) {
    return dispatch =>
        new Promise(resolve => {
            const onSubmit = (username, password) => {
                resolve({ username, password });
            };
            let proxyString = `${authInfo.host}`;
            if (authInfo.realm) {
                proxyString += ` (realm: ${authInfo.realm})`;
            }
            dispatch(
                loginRequestedByServer(
                    `The proxy server ${proxyString} ` +
                        'requires authentication. Please enter username and password',
                    onSubmit
                )
            );
        });
}

export function loginCancelledByUser() {
    proxyLoginCallback = null;
    return dispatch => {
        dispatch(loginCancelledByUserAction());
    };
}

export function sendLoginRequest(username, password) {
    return dispatch => {
        if (proxyLoginCallback) {
            proxyLoginCallback(username, password);
            proxyLoginCallback = null;
            dispatch(loginRequestSentAction(username));
        } else {
            dispatch(loginRequestErrorAction());
            dispatch(
                ErrorDialogActions.showDialog(
                    'No login callback found ' +
                        'when authenticating with proxy.'
                )
            );
        }
    };
}
