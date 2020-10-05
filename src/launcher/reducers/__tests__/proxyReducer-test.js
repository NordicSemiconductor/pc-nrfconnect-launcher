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
