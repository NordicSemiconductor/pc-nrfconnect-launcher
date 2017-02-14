/* eslint-disable import/first */

jest.mock('../../api/logging', () => {});

import reducer from '../logReducer';
import * as LogActions from '../../actions/logActions';

const initialState = reducer(undefined, {});

describe('logReducer', () => {
    it('should have autoScroll enabled by default', () => {
        expect(initialState.autoScroll).toEqual(true);
    });

    it('should have empty list of entries by default', () => {
        expect(initialState.entries.toJS()).toEqual([]);
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
        expect(state.entries.toJS()).toEqual(entries);
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
        expect(state.entries.toJS()).toEqual([]);
    });
});
