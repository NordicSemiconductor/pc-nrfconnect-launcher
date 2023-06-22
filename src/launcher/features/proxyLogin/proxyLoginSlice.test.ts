/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import dispatchTo from 'pc-nrfconnect-shared/test/dispatchTo';

import { RootState } from '../../store';
import reducer, {
    getIsErrorVisible,
    getProxyLoginRequest,
    loginCancelledByUser,
    loginErrorDialogClosed,
    loginRequestedByServer,
    loginRequestSent,
    State,
} from './proxyLoginSlice';

const authInfo = {
    isProxy: true,
    scheme: 'https',
    host: 'test host',
    port: 4711,
    realm: 'test realm',
};

const asRootState = (proxyLogin: State) => ({ proxyLogin } as RootState);

describe('proxy login', () => {
    it('shows login dialog when requested', () => {
        const state = dispatchTo(reducer, [
            loginRequestedByServer({ requestId: 'test ID', authInfo }),
        ]);

        const { isVisible, host } = getProxyLoginRequest(asRootState(state));

        expect(isVisible).toBe(true);
        expect(host).toBe('test host (realm: test realm)');
    });

    it('hides login dialog when cancelled', () => {
        const state = dispatchTo(reducer, [
            loginRequestedByServer({ requestId: 'test ID', authInfo }),
            loginCancelledByUser(),
        ]);

        const { isVisible } = getProxyLoginRequest(asRootState(state));

        expect(isVisible).toBe(false);
    });

    it('shows error dialog when login was cancelled', () => {
        const state = dispatchTo(reducer, [
            loginRequestedByServer({ requestId: 'test ID', authInfo }),
            loginCancelledByUser(),
        ]);

        const isVisible = getIsErrorVisible(asRootState(state));

        expect(isVisible).toBe(true);
    });

    it('hides login error dialog when it is closed', () => {
        const state = dispatchTo(reducer, [
            loginRequestedByServer({ requestId: 'test ID', authInfo }),
            loginCancelledByUser(),
            loginErrorDialogClosed(),
        ]);

        const isVisible = getIsErrorVisible(asRootState(state));

        expect(isVisible).toBe(false);
    });

    it('hides login dialog when login is sent', () => {
        const state = dispatchTo(reducer, [
            loginRequestedByServer({ requestId: 'test ID', authInfo }),
            loginRequestSent(),
        ]);

        const { isVisible } = getProxyLoginRequest(asRootState(state));

        expect(isVisible).toBe(false);
    });

    it('stores multiple request ids', () => {
        const state = dispatchTo(reducer, [
            loginRequestedByServer({ requestId: 'test ID', authInfo }),
            loginRequestedByServer({ requestId: 'another test ID', authInfo }),
        ]);

        const { requestIds } = getProxyLoginRequest(asRootState(state));

        expect(requestIds).toEqual(['test ID', 'another test ID']);
    });

    it('clears all request ids', () => {
        const state = dispatchTo(reducer, [
            loginRequestedByServer({ requestId: 'test ID', authInfo }),
            loginRequestedByServer({ requestId: 'another test ID', authInfo }),
            loginRequestSent(),
        ]);

        const { requestIds } = getProxyLoginRequest(asRootState(state));

        expect(requestIds).toEqual([]);
    });
});
