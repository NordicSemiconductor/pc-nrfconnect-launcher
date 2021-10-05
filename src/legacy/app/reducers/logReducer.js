/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { List, Record } from 'immutable';

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
