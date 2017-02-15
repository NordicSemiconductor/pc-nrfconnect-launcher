import { combineReducers } from 'redux';
import navMenu from './navMenuReducer';
import log from './logReducer';
import adapter from './adapterReducer';

export default combineReducers({
    navMenu,
    log,
    adapter,
});
