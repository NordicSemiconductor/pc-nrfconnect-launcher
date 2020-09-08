/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import { Record, List } from 'immutable';
import { getImmutableSerialPort } from '../models';
import * as SerialPortActions from '../actions/serialPortActions';

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
