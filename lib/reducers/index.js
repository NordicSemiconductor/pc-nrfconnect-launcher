import {combineReducers} from 'redux';
import core from './coreReducer';
import {pluginReducer as plugin} from '../util/plugins';

export default combineReducers({
    core,
    plugin
});