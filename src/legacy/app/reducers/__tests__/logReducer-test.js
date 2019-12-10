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

import reducer from '../logReducer';
import * as LogActions from '../../actions/logActions';

const initialState = reducer(undefined, {});

describe('logReducer', () => {
    it('should have autoScroll enabled by default', () => {
        expect(initialState.autoScroll).toEqual(true);
    });

    it('should have empty list of entries by default', () => {
        expect(initialState.logEntries.toJS()).toEqual([]);
    });

    it('should toggle autoScroll state', () => {
        const firstState = reducer(initialState, {
            type: LogActions.TOGGLE_AUTOSCROLL,
        });
        expect(firstState.autoScroll).toEqual(false);
        const secondState = reducer(firstState, {
            type: LogActions.TOGGLE_AUTOSCROLL,
        });
        expect(secondState.autoScroll).toEqual(true);
    });

    it('should add entries to state', () => {
        const entries = [
            { id: 0, message: 'foo' },
            { id: 1, message: 'bar' },
        ];
        const state = reducer(initialState, {
            type: LogActions.ADD_ENTRIES,
            entries,
        });
        expect(state.logEntries.toJS()).toEqual(entries);
    });

    it('should clear entries', () => {
        const stateWithEntries = reducer(initialState, {
            type: LogActions.ADD_ENTRIES,
            entries: [
                { id: 0, message: 'foo' },
                { id: 1, message: 'bar' },
            ],
        });
        const state = reducer(stateWithEntries, {
            type: LogActions.CLEAR_ENTRIES,
        });
        expect(state.logEntries.toJS()).toEqual([]);
    });
});
