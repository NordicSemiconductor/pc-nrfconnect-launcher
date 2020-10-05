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

import { Record, List } from 'immutable';
import * as LogAction from '../actions/logActions';

const MAX_ENTRIES = 1000;

const InitialState = Record({
    autoScroll: true,
    logEntries: List(),
    containerHeight: 155,
});

const initialState = new InitialState();

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case LogAction.ADD_ENTRIES: {
            let newEntries = state.logEntries.push(...action.entries);
            if (newEntries.size > MAX_ENTRIES) {
                newEntries = newEntries.slice(-MAX_ENTRIES).unshift({
                    id: -1,
                    level: 'info',
                    timestamp: new Date(),
                    message:
                        'The log in this view has been shortened. Open the log file to see the full content.',
                });
            }
            return state.set('logEntries', newEntries);
        }
        case LogAction.CLEAR_ENTRIES:
            return state.set('logEntries', state.logEntries.clear());
        case LogAction.TOGGLE_AUTOSCROLL:
            return state.set('autoScroll', !state.autoScroll);
        case LogAction.RESIZE_LOG_CONTAINER:
            return state.set('containerHeight', action.containerHeight);
        default:
            return state;
    }
};

export default reducer;
