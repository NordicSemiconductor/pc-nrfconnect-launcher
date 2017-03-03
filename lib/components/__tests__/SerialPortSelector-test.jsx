/* eslint-disable import/first */

// Do not render react-bootstrap components in tests
jest.mock('react-bootstrap', () => ({
    DropdownButton: 'DropdownButton',
    MenuItem: 'MenuItem',
}));

// Do not decorate components
jest.mock('../../util/plugins', () => ({
    decorate: component => component,
}));

import React from 'react';
import renderer from 'react-test-renderer';
import SerialPortSelector from '../SerialPortSelector';

describe('SerialPortSelector', () => {
    it('should render empty port list, not expanded', () => {
        expect(renderer.create(
            <SerialPortSelector
                ports={[]}
                toggleExpanded={() => {}}
                onSelect={() => {}}
                onDeselect={() => {}}
                bindHotkey={() => {}}
            />,
        )).toMatchSnapshot();
    });

    it('should render empty port list, expanded', () => {
        expect(renderer.create(
            <SerialPortSelector
                ports={[]}
                isExpanded
                toggleExpanded={() => {}}
                onSelect={() => {}}
                onDeselect={() => {}}
                bindHotkey={() => {}}
            />,
        )).toMatchSnapshot();
    });

    it('should render two ports', () => {
        expect(renderer.create(
            <SerialPortSelector
                ports={[
                    {
                        comName: '/dev/tty0',
                        serialNumber: '123456',
                    }, {
                        comName: '/dev/tty1',
                        serialNumber: '456789',
                    },
                ]}
                isExpanded
                toggleExpanded={() => {}}
                onSelect={() => {}}
                onDeselect={() => {}}
                bindHotkey={() => {}}
            />,
        )).toMatchSnapshot();
    });

    it('should render two ports, one selected', () => {
        expect(renderer.create(
            <SerialPortSelector
                ports={[
                    {
                        comName: '/dev/tty0',
                        serialNumber: '123456',
                    }, {
                        comName: '/dev/tty1',
                        serialNumber: '456789',
                    },
                ]}
                selectedPort={'/dev/tty1'}
                isExpanded
                toggleExpanded={() => {}}
                onSelect={() => {}}
                onDeselect={() => {}}
                bindHotkey={() => {}}
            />,
        )).toMatchSnapshot();
    });

    it('should render empty list while loading', () => {
        expect(renderer.create(
            <SerialPortSelector
                ports={[
                    {
                        comName: '/dev/tty0',
                        serialNumber: '123456',
                    },
                ]}
                isExpanded
                isLoading
                toggleExpanded={() => {}}
                onSelect={() => {}}
                onDeselect={() => {}}
                bindHotkey={() => {}}
            />,
        )).toMatchSnapshot();
    });
});
