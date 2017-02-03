import { combineReducers } from 'redux';
import navMenu from './navMenuReducer';
import log from './logReducer';

export default combineReducers({
    navMenu,
    log,
    /*
    adapter,
    errorDialog,
    log,
    */
});
