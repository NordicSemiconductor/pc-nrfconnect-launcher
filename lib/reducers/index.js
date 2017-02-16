import { combineReducers } from 'redux';
import core from './coreReducer';
import plugin from './pluginReducer';

export default combineReducers({
    core,
    plugin,
});
