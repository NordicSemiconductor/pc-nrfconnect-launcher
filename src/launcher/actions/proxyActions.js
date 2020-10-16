/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
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
