import { Record } from 'immutable';

const InitialState = Record({
});

const initialState = new InitialState();

export default function navigation(state = initialState, action) {
    switch (action.type) {
        default:
            return state;
    }
}
