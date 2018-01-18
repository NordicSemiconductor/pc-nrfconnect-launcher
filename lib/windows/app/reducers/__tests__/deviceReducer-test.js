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

/* eslint-disable import/first */

jest.mock('serialport', () => {});
jest.mock('usb', () => {});
jest.mock('../../../../api/logging', () => {});

import reducer from '../deviceReducer';
import * as DeviceActions from '../../actions/deviceActions';

const initialState = reducer(undefined, {});

describe('deviceReducer', () => {
    it('should set loading state when loading devices', () => {
        const state = reducer(initialState, {
            type: DeviceActions.DEVICES_LOAD,
        });
        expect(state.isLoading).toEqual(true);
    });

    it('should remove loading state when loading devices has failed', () => {
        const stateBefore = initialState.set('isLoading', true);
        const state = reducer(stateBefore, {
            type: DeviceActions.DEVICES_LOAD_ERROR,
        });
        expect(state.isLoading).toEqual(false);
    });

    it('should remove loading state when loading devices has succeeded', () => {
        const stateBefore = initialState.set('isLoading', true);
        const state = reducer(stateBefore, {
            type: DeviceActions.DEVICES_LOAD_SUCCESS,
            usbDevices: [],
            serialPorts: [],
        });
        expect(state.isLoading).toEqual(false);
    });

    it('should remove leading zeroes from serial number', () => {
        const usbDevice = {
            serialNumber: '00012345678',
        };
        const state = reducer(initialState, {
            type: DeviceActions.DEVICES_LOAD_SUCCESS,
            usbDevices: [usbDevice],
            serialPorts: [],
        });
        expect(state.devices.first().serialNumber).toEqual('12345678');
    });

    it('should only use the last part of the serial number if it contains underscore', () => {
        const usbDevice = {
            serialNumber: 'SEGGER_J-Link_00012345678',
        };
        const state = reducer(initialState, {
            type: DeviceActions.DEVICES_LOAD_SUCCESS,
            usbDevices: [usbDevice],
            serialPorts: [],
        });
        expect(state.devices.first().serialNumber).toEqual('12345678');
    });

    it('should not remove leading zeroes from serial number if it is not a number', () => {
        const usbDevice = {
            serialNumber: '000foobar',
        };
        const state = reducer(initialState, {
            type: DeviceActions.DEVICES_LOAD_SUCCESS,
            usbDevices: [usbDevice],
            serialPorts: [],
        });
        expect(state.devices.first().serialNumber).toEqual('000foobar');
    });

    it('should add all device metadata to state when loading devices has succeeded', () => {
        const usbDevice = {
            busNumber: 1,
            deviceAddress: 1,
            vendorId: 0x1366,
            productId: 0x0105,
            manufacturer: 'SEGGER',
            product: 'J-Link',
            serialNumber: 'SEGGER_J-Link_000680551615',
        };

        const state = reducer(initialState, {
            type: DeviceActions.DEVICES_LOAD_SUCCESS,
            usbDevices: [usbDevice],
            serialPorts: [],
        });

        expect(state.devices.first().toJS()).toEqual(
            expect.objectContaining({
                busNumber: 1,
                deviceAddress: 1,
                vendorId: 0x1366,
                productId: 0x0105,
                manufacturer: 'SEGGER',
                product: 'J-Link',
                serialNumber: '680551615',
            }),
        );
    });


    it('should add comName to device if a serial port with the same serial number exists', () => {
        const usbDevice = {
            serialNumber: '000680551615',
        };
        const serialPort1 = {
            comName: '/dev/tty1',
            serialNumber: 'SEGGER_J-Link_000680551615',
        };
        const serialPort2 = {
            comName: '/dev/tty2',
            serialNumber: 'SEGGER_J-Link_000680551616',
        };

        const state = reducer(initialState, {
            type: DeviceActions.DEVICES_LOAD_SUCCESS,
            usbDevices: [usbDevice],
            serialPorts: [serialPort1, serialPort2],
        });

        expect(state.devices.first().toJS()).toEqual(
            expect.objectContaining({
                serialNumber: '680551615',
                comName: '/dev/tty1',
            }),
        );
    });

    it('should set selected device when device has been selected', () => {
        const device = {
            serialNumber: '12345678',
        };
        const state = reducer(initialState, {
            type: DeviceActions.DEVICE_SELECTED,
            device,
        });
        expect(state.selectedDevice).toEqual(device);
    });

    it('should reset selected device when the device has been deselected', () => {
        const stateBefore = initialState.set('selectedDevice', {
            serialNumber: '12345678',
        });
        const state = reducer(stateBefore, {
            type: DeviceActions.DEVICE_DESELECTED,
        });
        expect(state.selectedDevice).toEqual(initialState.selectedDevice);
    });
});
