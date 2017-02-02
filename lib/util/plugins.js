import { Record } from 'immutable';

const InitialState = Record({
});

const initialState = new InitialState();

function pluginReducer(state = initialState, action) {
    switch (action.type) {
        default:
            return state;
    }
}

export default {
    pluginReducer,
};
