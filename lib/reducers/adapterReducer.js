import { Record, List } from 'immutable';
import { getImmutableAdapter } from '../util/immutableModels';
import * as AdapterActions from '../actions/adapterActions';
import { decorateReducer } from '../util/plugins';

const SEGGER_VENDOR_IDS = new Set(['0x1366', '1366']);
const SEGGER_SERIAL_PREFIX = 'SEGGER_J-Link_';

const InitialState = Record({
    isLoading: false,
    isSelectorExpanded: false,
    adapters: List(),
    selectedAdapter: null,
});

const initialState = new InitialState();

function cleanSerialNumber(serialNumber) {
    if (serialNumber && serialNumber.startsWith(SEGGER_SERIAL_PREFIX)) {
        return serialNumber
            .slice(SEGGER_SERIAL_PREFIX.length)
            .replace(/\b0+/g, '');
    }
    return serialNumber;
}

function getSeggerAdapters(serialPorts) {
    return serialPorts
        .filter(port => SEGGER_VENDOR_IDS.has(port.vendorId))
        .map(port => {
            const adapter = Object.assign(port, {
                serialNumber: cleanSerialNumber(port.serialNumber),
            });
            return getImmutableAdapter(adapter);
        });
}

function setLoading(state, isLoading) {
    return state.set('isLoading', isLoading);
}

function toggleSelectorExpanded(state) {
    return state.set('isSelectorExpanded', !state.get('isSelectorExpanded'));
}

function setSelectedAdapter(state, serialPort) {
    return state.set('selectedAdapter', serialPort.comName);
}

function clearSelectedAdapter(state) {
    return state.set('selectedAdapter', initialState.selectedAdapter);
}

function setAdapterList(state, serialPorts) {
    const newState = setLoading(state, false);
    return newState.set('adapters', List(getSeggerAdapters(serialPorts)));
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case AdapterActions.ADAPTERS_LOAD:
            return setLoading(state, true);
        case AdapterActions.ADAPTERS_LOAD_ERROR:
            return setLoading(state, false);
        case AdapterActions.ADAPTERS_LOAD_SUCCESS:
            return setAdapterList(state, action.serialPorts);
        case AdapterActions.ADAPTER_SELECTOR_TOGGLE_EXPANDED:
            return toggleSelectorExpanded(state);
        case AdapterActions.ADAPTER_SELECTED:
            return setSelectedAdapter(state, action.serialPort);
        case AdapterActions.ADAPTER_DESELECTED:
            return clearSelectedAdapter(state);
        default:
            return state;
    }
};

export default decorateReducer(reducer, 'Adapter');
