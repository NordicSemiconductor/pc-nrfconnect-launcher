/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { List, Record } from 'immutable';

import * as SerialPortActions from '../actions/serialPortActions';
import { getImmutableSerialPort } from '../models';

const SEGGER_SERIAL_PREFIX = 'SEGGER_J-Link_';

const InitialState = Record({
    isLoading: false,
    isSelectorExpanded: false,
    ports: List(),
    selectedPort: null,
});

const initialState = new InitialState();

function removeSeggerPrefix(serialNumber) {
    if (serialNumber && serialNumber.startsWith(SEGGER_SERIAL_PREFIX)) {
        return serialNumber.slice(SEGGER_SERIAL_PREFIX.length);
    }
    return serialNumber;
}

function cleanSerialNumber(serialNumber) {
    const number = parseInt(removeSeggerPrefix(serialNumber), 10);
    return Number.isNaN(number) ? undefined : number;
}

function getSeggerPorts(ports) {
    return ports.map(port => {
        const serialPort = Object.assign(port, {
            serialNumber: cleanSerialNumber(port.serialNumber),
        });
        return getImmutableSerialPort(serialPort);
    });
}

function setLoading(state, isLoading) {
    return state.set('isLoading', isLoading);
}

function toggleSelectorExpanded(state) {
    return state.set('isSelectorExpanded', !state.get('isSelectorExpanded'));
}

function setSelectedPort(state, port) {
    return state.set('selectedPort', port.path);
}

function clearSelectedPort(state) {
    return state.set('selectedPort', initialState.selectedPort);
}

function setPortList(state, ports) {
    const newState = setLoading(state, false);
    return newState.set('ports', List(getSeggerPorts(ports)));
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case SerialPortActions.SERIAL_PORTS_LOAD:
            return setLoading(state, true);
        case SerialPortActions.SERIAL_PORTS_LOAD_ERROR:
            return setLoading(state, false);
        case SerialPortActions.SERIAL_PORTS_LOAD_SUCCESS:
            return setPortList(state, action.ports);
        case SerialPortActions.SERIAL_PORT_SELECTOR_TOGGLE_EXPANDED:
            return toggleSelectorExpanded(state);
        case SerialPortActions.SERIAL_PORT_SELECTED:
            return setSelectedPort(state, action.port);
        case SerialPortActions.SERIAL_PORT_DESELECTED:
            return clearSelectedPort(state);
        default:
            return state;
    }
};

export default reducer;
