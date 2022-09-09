/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { answerProxyLoginRequest } from '../../ipc/proxyLogin';

export const PROXY_LOGIN_REQUESTED_BY_SERVER =
    'PROXY_LOGIN_REQUESTED_BY_SERVER';
export const PROXY_LOGIN_CANCELLED_BY_USER = 'PROXY_LOGIN_CANCELLED_BY_USER';
export const PROXY_LOGIN_ERROR_DIALOG_CLOSED =
    'PROXY_LOGIN_ERROR_DIALOG_CLOSED';
export const PROXY_LOGIN_DIALOG_USERNAME_CHANGED =
    'PROXY_LOGIN_DIALOG_USERNAME_CHANGED';
export const PROXY_LOGIN_REQUEST_SENT = 'PROXY_LOGIN_REQUEST_SENT';

function loginRequestedByServerAction(requestId, message) {
    return {
        type: PROXY_LOGIN_REQUESTED_BY_SERVER,
        requestId,
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

export function authenticate(requestId, authInfo) {
    return dispatch => {
        let proxyString = `${authInfo.host}`;
        if (authInfo.realm) {
            proxyString += ` (realm: ${authInfo.realm})`;
        }
        dispatch(
            loginRequestedByServerAction(
                requestId,
                `The proxy server ${proxyString} requires authentication. ` +
                    'Please enter username and password'
            )
        );
    };
}

export function loginCancelledByUser(requestId) {
    return dispatch => {
        answerProxyLoginRequest(requestId);
        dispatch(loginCancelledByUserAction());
    };
}

export function sendLoginRequest(requestId, username, password) {
    return dispatch => {
        answerProxyLoginRequest(requestId, username, password);
        dispatch(loginRequestSentAction(username));
    };
}
