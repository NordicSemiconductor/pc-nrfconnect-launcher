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

import reducer from '../errorDialogReducer';
import * as ErrorDialogActions from '../../actions/errorDialogActions';

const initialState = reducer(undefined, {});

describe('errorDialogReducer', () => {
    it('should be hidden by default', () => {
        expect(initialState.isVisible).toEqual(false);
    });

    it('should be visible and have the supplied message after show action has been dispatched', () => {
        const message = 'An error occurred';
        const state = reducer(initialState, {
            type: ErrorDialogActions.ERROR_DIALOG_SHOW,
            message,
        });
        expect(state.isVisible).toEqual(true);
        expect(state.messages.get(0)).toEqual(message);
    });

    it('should be visible and have all messages after multiple show actions have been dispatched', () => {
        const message1 = 'Error 1';
        const message2 = 'Error 2';
        const state1 = reducer(initialState, {
            type: ErrorDialogActions.ERROR_DIALOG_SHOW,
            message: message1,
        });
        const state2 = reducer(state1, {
            type: ErrorDialogActions.ERROR_DIALOG_SHOW,
            message: message2,
        });
        expect(state2.isVisible).toEqual(true);
        expect(state2.messages.get(0)).toEqual(message1);
        expect(state2.messages.get(1)).toEqual(message2);
    });

    it('should not add message if it already exists in list', () => {
        const message = 'Error 1';
        const state1 = reducer(initialState, {
            type: ErrorDialogActions.ERROR_DIALOG_SHOW,
            message,
        });
        const state2 = reducer(state1, {
            type: ErrorDialogActions.ERROR_DIALOG_SHOW,
            message,
        });
        expect(state2.messages.size).toEqual(1);
        expect(state2.messages.get(0)).toEqual(message);
    });

    it('should set dialog to invisible and clear message list when hide action has been dispatched', () => {
        const message = 'Error 1';
        const state1 = reducer(initialState, {
            type: ErrorDialogActions.ERROR_DIALOG_SHOW,
            message,
        });
        const state2 = reducer(state1, {
            type: ErrorDialogActions.ERROR_DIALOG_HIDE,
        });
        expect(state2.isVisible).toEqual(false);
        expect(state2.messages.size).toEqual(0);
    });
});
