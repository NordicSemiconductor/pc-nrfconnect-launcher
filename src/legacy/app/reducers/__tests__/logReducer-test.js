/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import * as LogActions from '../../actions/logActions';
import reducer from '../logReducer';

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
