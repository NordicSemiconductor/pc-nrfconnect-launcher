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

import reducer from '../serialPortReducer';
import * as SerialPortActions from '../../actions/serialPortActions';

jest.mock('serialport', () => {});

const SEGGER_VENDOR_ID = '0x1366';
const initialState = reducer(undefined, {});

describe('serialPortReducer', () => {
    it('should set loading state when loading ports', () => {
        const state = reducer(initialState, {
            type: SerialPortActions.SERIAL_PORTS_LOAD,
        });
        expect(state.isLoading).toEqual(true);
    });

    it('should remove loading state when loading ports has failed', () => {
        const stateBefore = initialState.set('isLoading', true);
        const state = reducer(stateBefore, {
            type: SerialPortActions.SERIAL_PORTS_LOAD_ERROR,
        });
        expect(state.isLoading).toEqual(false);
    });

    it('should remove loading state when loading ports has succeeded', () => {
        const stateBefore = initialState.set('isLoading', true);
        const state = reducer(stateBefore, {
            type: SerialPortActions.SERIAL_PORTS_LOAD_SUCCESS,
            ports: [],
        });
        expect(state.isLoading).toEqual(false);
    });

    it('should add port metadata to state when loading ports has succeeded', () => {
        const seggerPort = {
            path: '/dev/tty1',
            vendorId: SEGGER_VENDOR_ID,
            manufacturer: 'SEGGER',
            serialNumber: 'SEGGER_J-Link_000680551615',
            productId: '0x0105',
        };

        const state = reducer(initialState, {
            type: SerialPortActions.SERIAL_PORTS_LOAD_SUCCESS,
            ports: [seggerPort],
        });

        expect(state.ports.first().toJS()).toEqual({
            comName: '/dev/tty1',
            path: '/dev/tty1',
            vendorId: SEGGER_VENDOR_ID,
            manufacturer: 'SEGGER',
            serialNumber: 680551615,
            productId: '0x0105',
        });
    });

    it('should set serial number to "undefined" if it is not a number', () => {
        const seggerPort = {
            vendorId: SEGGER_VENDOR_ID,
            serialNumber: 'foobar',
        };

        const state = reducer(initialState, {
            type: SerialPortActions.SERIAL_PORTS_LOAD_SUCCESS,
            ports: [seggerPort],
        });

        const port = state.ports.first().toJS();
        expect(port.serialNumber).toBeNull();
    });

    it('should set selected port comPort when port has been selected', () => {
        const state = reducer(
            initialState,
            SerialPortActions.selectPortAction({ path: '/dev/tty1' })
        );
        expect(state.selectedPort).toEqual('/dev/tty1');
    });

    it('should reset selected port when port has been deselected', () => {
        const stateBefore = initialState.set('selectedPort', '/dev/tty1');
        const state = reducer(stateBefore, {
            type: SerialPortActions.SERIAL_PORT_DESELECTED,
        });
        expect(state.selectedPort).toEqual(initialState.selectedPort);
    });
});
