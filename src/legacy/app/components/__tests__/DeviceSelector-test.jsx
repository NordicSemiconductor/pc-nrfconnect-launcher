/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable import/first */

// Do not render react-bootstrap components in tests
jest.mock('react-bootstrap', () => ({
    Dropdown: 'Dropdown',
    MenuItem: 'MenuItem',
    DropdownToggle: 'DropdownToggle',
    DropdownMenu: 'DropdownMenu',
}));

import React from 'react';
import renderer from 'react-test-renderer';

import DeviceSelector from '../DeviceSelector';

const selectDeviceText = 'Select device';

describe('DeviceSelector', () => {
    it('should render empty device list', () => {
        expect(
            renderer.create(
                <DeviceSelector
                    devices={[]}
                    togglerText={selectDeviceText}
                    onToggle={() => {}}
                    displayCloseItem={false}
                    onSelect={() => {}}
                    onDeselect={() => {}}
                />
            )
        ).toMatchSnapshot();
    });

    it('should render one device with serialport, usb, and jlink traits', () => {
        expect(
            renderer.create(
                <DeviceSelector
                    devices={[
                        {
                            serialNumber: '123456789',
                            serialport: {
                                path: '/dev/ttyACM0',
                            },
                            'serialport.1': {
                                path: '/dev/ttyACM1',
                            },
                            usb: {
                                manufacturer: 'Nordic Semiconductor',
                                product: 'nRF52 USB',
                            },
                            boardVersion: 'PCA42424',
                            traits: ['serialport', 'nordicUsb', 'jlink'],
                        },
                    ]}
                    togglerText={selectDeviceText}
                    onToggle={() => {}}
                    displayCloseItem={false}
                    onSelect={() => {}}
                    onDeselect={() => {}}
                />
            )
        ).toMatchSnapshot();
    });
});
