import { Record } from 'immutable';

const InitialState = Record({
});

const initialState = new InitialState();

export function pluginReducer(state = initialState, action) {
    return state;
}
