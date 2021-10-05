/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Record } from 'immutable';

import * as ProxyActions from '../actions/proxyActions';

const InitialState = Record({
    username: '',
    isLoginDialogVisible: false,
    isErrorDialogVisible: false,
    loginDialogMessage: '',
});
const initialState = new InitialState();

function showLoginDialog(state, message) {
    return state
        .set('loginDialogMessage', message)
        .set('isLoginDialogVisible', true);
}

function hideLoginDialog(state) {
    return state
        .set('loginDialogMessage', initialState.loginDialogMessage)
        .set('isLoginDialogVisible', false);
}

function cancelLoginDialog(state) {
    return hideLoginDialog(state).set('isErrorDialogVisible', true);
}

function setLoginRequestSent(state, username) {
    return hideLoginDialog(state).set('username', username);
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case ProxyActions.PROXY_LOGIN_REQUESTED_BY_SERVER:
            return showLoginDialog(state, action.message);
        case ProxyActions.PROXY_LOGIN_CANCELLED_BY_USER:
            return cancelLoginDialog(state);
        case ProxyActions.PROXY_LOGIN_ERROR_DIALOG_CLOSED:
            return state.set('isErrorDialogVisible', false);
        case ProxyActions.PROXY_LOGIN_DIALOG_USERNAME_CHANGED:
            return state.set('username', action.username);
        case ProxyActions.PROXY_LOGIN_REQUEST_SENT:
            return setLoginRequestSent(state, action.username);
        default:
            return state;
    }
};

export default reducer;
