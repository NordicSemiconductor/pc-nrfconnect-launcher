/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import * as ProxyActions from '../../actions/proxyActions';
import reducer from '../proxyReducer';

const initialState = reducer(undefined, {});

describe('proxyReducer', () => {
    it('should show login dialog with message when PROXY_LOGIN_REQUESTED_BY_SERVER has been dispatched', () => {
        const state = reducer(initialState, {
            type: ProxyActions.PROXY_LOGIN_REQUESTED_BY_SERVER,
            message: 'Please enter proxy credentials',
        });
        expect(state.isLoginDialogVisible).toEqual(true);
        expect(state.loginDialogMessage).toEqual(
            'Please enter proxy credentials'
        );
    });

    it('should hide login dialog when PROXY_LOGIN_CANCELLED_BY_USER has been dispatched', () => {
        const state = reducer(initialState.set('isLoginDialogVisible', true), {
            type: ProxyActions.PROXY_LOGIN_CANCELLED_BY_USER,
        });
        expect(state.isLoginDialogVisible).toEqual(false);
    });

    it('should show login error dialog when PROXY_LOGIN_CANCELLED_BY_USER has been dispatched', () => {
        const state = reducer(initialState, {
            type: ProxyActions.PROXY_LOGIN_CANCELLED_BY_USER,
        });
        expect(state.isErrorDialogVisible).toEqual(true);
    });

    it('should hide login error dialog when PROXY_LOGIN_ERROR_DIALOG_CLOSED has been dispatched', () => {
        const state = reducer(initialState.set('isErrorDialogVisible', true), {
            type: ProxyActions.PROXY_LOGIN_ERROR_DIALOG_CLOSED,
        });
        expect(state.isErrorDialogVisible).toEqual(false);
    });

    it('should hide login dialog when PROXY_LOGIN_REQUEST_SENT has been dispatched', () => {
        const state = reducer(initialState.set('isLoginDialogVisible', true), {
            type: ProxyActions.PROXY_LOGIN_REQUEST_SENT,
        });
        expect(state.isLoginDialogVisible).toEqual(false);
    });
});
