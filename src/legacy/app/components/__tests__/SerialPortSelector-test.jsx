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

// Do not decorate components
jest.mock('../../../decoration', () => ({
    decorate: component => component,
}));

import React from 'react';
import renderer from 'react-test-renderer';

import SerialPortSelector from '../SerialPortSelector';

const SEGGER_VENDOR_ID = '0x1366';

describe('SerialPortSelector', () => {
    it('should render empty port list', () => {
        expect(
            renderer.create(
                <SerialPortSelector
                    ports={[]}
                    onToggle={() => {}}
                    onSelect={() => {}}
                    onDeselect={() => {}}
                    bindHotkey={() => {}}
                />
            )
        ).toMatchSnapshot();
    });

    it('should render two ports', () => {
        expect(
            renderer.create(
                <SerialPortSelector
                    ports={[
                        {
                            path: '/dev/tty0',
                            serialNumber: '123456',
                            vendorId: SEGGER_VENDOR_ID,
                        },
                        {
                            path: '/dev/tty1',
                            serialNumber: '456789',
                            vendorId: SEGGER_VENDOR_ID,
                        },
                    ]}
                    onToggle={() => {}}
                    onSelect={() => {}}
                    onDeselect={() => {}}
                    bindHotkey={() => {}}
                />
            )
        ).toMatchSnapshot();
    });

    it('should render only segger ports by default filter', () => {
        expect(
            renderer.create(
                <SerialPortSelector
                    ports={[
                        {
                            path: '/dev/tty0',
                            serialNumber: '123456',
                            vendorId: '0x1234',
                        },
                        {
                            path: '/dev/tty1',
                            serialNumber: '456789',
                            vendorId: SEGGER_VENDOR_ID,
                        },
                    ]}
                    onToggle={() => {}}
                    onSelect={() => {}}
                    onDeselect={() => {}}
                    bindHotkey={() => {}}
                />
            )
        ).toMatchSnapshot();
    });

    it('should render filtered ports', () => {
        expect(
            renderer.create(
                <SerialPortSelector
                    ports={[
                        {
                            path: '/dev/tty0',
                            serialNumber: '123456',
                            vendorId: '0x1234',
                        },
                        {
                            path: '/dev/tty1',
                            serialNumber: '456789',
                            vendorId: SEGGER_VENDOR_ID,
                        },
                    ]}
                    onToggle={() => {}}
                    onSelect={() => {}}
                    onDeselect={() => {}}
                    bindHotkey={() => {}}
                    filter={port => port.serialNumber === '123456'}
                />
            )
        ).toMatchSnapshot();
    });

    it('should render two ports, one selected', () => {
        expect(
            renderer.create(
                <SerialPortSelector
                    ports={[
                        {
                            path: '/dev/tty0',
                            serialNumber: '123456',
                            vendorId: SEGGER_VENDOR_ID,
                        },
                        {
                            path: '/dev/tty1',
                            serialNumber: '456789',
                            vendorId: SEGGER_VENDOR_ID,
                        },
                    ]}
                    selectedPort="/dev/tty1"
                    onToggle={() => {}}
                    onSelect={() => {}}
                    onDeselect={() => {}}
                    bindHotkey={() => {}}
                />
            )
        ).toMatchSnapshot();
    });

    it('should render empty list while loading', () => {
        expect(
            renderer.create(
                <SerialPortSelector
                    ports={[
                        {
                            path: '/dev/tty0',
                            serialNumber: '123456',
                            vendorId: SEGGER_VENDOR_ID,
                        },
                    ]}
                    isLoading
                    onToggle={() => {}}
                    onSelect={() => {}}
                    onDeselect={() => {}}
                    bindHotkey={() => {}}
                />
            )
        ).toMatchSnapshot();
    });

    it('should render empty list while loading and port is selected', () => {
        expect(
            renderer.create(
                <SerialPortSelector
                    ports={[
                        {
                            path: '/dev/tty0',
                            serialNumber: '123456',
                            vendorId: SEGGER_VENDOR_ID,
                        },
                    ]}
                    selectedPort="/dev/tty0"
                    isLoading
                    onToggle={() => {}}
                    onSelect={() => {}}
                    onDeselect={() => {}}
                    bindHotkey={() => {}}
                />
            )
        ).toMatchSnapshot();
    });
});
