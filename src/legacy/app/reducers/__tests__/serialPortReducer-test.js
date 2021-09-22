/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import * as SerialPortActions from '../../actions/serialPortActions';
import reducer from '../serialPortReducer';

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
