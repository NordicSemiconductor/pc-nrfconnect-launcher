/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import dispatchTo from 'pc-nrfconnect-shared/test/dispatchTo';

import reducer, {
    loginCancelledByUser,
    loginErrorDialogClosed,
    loginRequestedByServer,
    loginRequestSent,
} from './proxyLoginSlice';

const authInfo = {
    isProxy: true,
    scheme: 'https',
    host: 'test host',
    port: 4711,
    realm: 'test realm',
};

describe('proxyReducer', () => {
    it('should show login dialog with message when loginRequestedByServer has been dispatched', () => {
        const state = dispatchTo(reducer, [
            loginRequestedByServer({ requestId: 'test ID', authInfo }),
        ]);
        expect(state.isLoginDialogVisible).toEqual(true);
        expect(state.loginDialogMessage).toEqual(
            'The proxy server test host (realm: test realm) requires authentication. Please enter username and password'
        );
    });

    it('should hide login dialog when loginCancelledByUserAction has been dispatched', () => {
        const state = dispatchTo(reducer, [
            loginRequestedByServer({ requestId: 'test ID', authInfo }),
            loginCancelledByUser(),
        ]);
        expect(state.isLoginDialogVisible).toEqual(false);
    });

    it('should show login error dialog when loginCancelledByUserAction has been dispatched', () => {
        const state = dispatchTo(reducer, [
            loginRequestedByServer({ requestId: 'test ID', authInfo }),
            loginCancelledByUser(),
        ]);
        expect(state.isErrorDialogVisible).toEqual(true);
    });

    it('should hide login error dialog when loginErrorDialogClosedAction has been dispatched', () => {
        const state = dispatchTo(reducer, [
            loginRequestedByServer({ requestId: 'test ID', authInfo }),
            loginCancelledByUser(),
            loginErrorDialogClosed(),
        ]);
        expect(state.isErrorDialogVisible).toEqual(false);
    });

    it('should hide login dialog when loginRequestSentAction has been dispatched', () => {
        const state = dispatchTo(reducer, [
            loginRequestedByServer({ requestId: 'test ID', authInfo }),
            loginRequestSent('test username'),
        ]);
        expect(state.isLoginDialogVisible).toEqual(false);
    });
});
