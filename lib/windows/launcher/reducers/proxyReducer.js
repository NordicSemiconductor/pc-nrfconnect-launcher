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

import { Record } from 'immutable';
import * as ProxyActions from '../actions/proxyActions';

const InitialState = Record({
    isProxy: false,
    isProxyAuthRequired: false,
    isSupportedByNpm: false,
    scheme: '',
    socket: '',
    username: '',
    isLoginDialogVisible: false,
    loginDialogMessage: '',
});
const initialState = new InitialState();

const proxyConfigs = {
    PROXY: {
        scheme: 'http://',
        isSupportedByNpm: true,
    },
    HTTP: {
        scheme: 'http://',
        isSupportedByNpm: true,
    },
    HTTPS: {
        scheme: 'https://',
        isSupportedByNpm: true,
    },
    SOCKS: {
        scheme: 'socks://',
        isSupportedByNpm: false,
    },
    SOCKS4: {
        scheme: 'socks4://',
        isSupportedByNpm: false,
    },
    SOCKS5: {
        scheme: 'socks5://',
        isSupportedByNpm: false,
    },
};

function setProxy(state, proxyString) {
    if (!proxyString || proxyString === 'DIRECT') {
        return state;
    }
    // The proxy string may contain multiple entries separated with
    // semicolon, e.g:
    // PROXY http://localhost:8080; PROXY http://localhost:8090
    const proxies = String(proxyString).trim().split(/\s*;\s*/g).filter(Boolean);
    if (proxies.length < 1) {
        return state;
    }
    // There may be multiple proxies, but we just use the first one
    const firstProxy = proxies[0];
    const parts = firstProxy.split(/\s+/);
    if (parts.length < 2) {
        return state;
    }
    const type = parts[0];
    const socket = parts[1];
    const proxyConfig = proxyConfigs[type];
    if (!proxyConfig) {
        return state;
    }
    return state.set('isProxy', true)
        .set('isSupportedByNpm', proxyConfig.isSupportedByNpm)
        .set('scheme', proxyConfig.scheme)
        .set('socket', socket);
}

function showLoginDialog(state, message) {
    return state.set('isProxyAuthRequired', true)
        .set('loginDialogMessage', message)
        .set('isLoginDialogVisible', true);
}

function hideLoginDialog(state) {
    return state.set('loginDialogMessage', initialState.loginDialogMessage)
        .set('isLoginDialogVisible', false);
}

function setLoginRequestSent(state, username) {
    return hideLoginDialog(state)
        .set('username', username);
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case ProxyActions.PROXY_RESOLVE_SUCCESS:
            return setProxy(state, action.proxyString);
        case ProxyActions.PROXY_LOGIN_REQUESTED_BY_SERVER:
            return showLoginDialog(state, action.message);
        case ProxyActions.PROXY_LOGIN_CANCELLED_BY_USER:
            return hideLoginDialog(state);
        case ProxyActions.PROXY_LOGIN_DIALOG_USERNAME_CHANGED:
            return state.set('username', action.username);
        case ProxyActions.PROXY_LOGIN_REQUEST_SENT:
            return setLoginRequestSent(state, action.username);
        default:
            return state;
    }
};

export default reducer;
