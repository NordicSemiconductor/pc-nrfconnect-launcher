/* eslint-disable import/first */

jest.mock('react-bootstrap', () => ({
    DropdownButton: 'DropdownButton',
    MenuItem: 'MenuItem',
}));

import React from 'react';
import renderer from 'react-test-renderer';
import AdapterSelector from '../AdapterSelector';

describe('AdapterSelector', () => {
    it('should render empty adapter list, not expanded', () => {
        expect(renderer.create(
            <AdapterSelector
                adapters={[]}
                toggleExpanded={() => {}}
                onSelect={() => {}}
                onDeselect={() => {}}
                bindHotkey={() => {}}
            />,
        )).toMatchSnapshot();
    });

    it('should render empty adapter list, expanded', () => {
        expect(renderer.create(
            <AdapterSelector
                adapters={[]}
                isExpanded
                toggleExpanded={() => {}}
                onSelect={() => {}}
                onDeselect={() => {}}
                bindHotkey={() => {}}
            />,
        )).toMatchSnapshot();
    });

    it('should render two adapters', () => {
        expect(renderer.create(
            <AdapterSelector
                adapters={[
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

    it('should render two adapters, one selected', () => {
        expect(renderer.create(
            <AdapterSelector
                adapters={[
                    {
                        comName: '/dev/tty0',
                        serialNumber: '123456',
                    }, {
                        comName: '/dev/tty1',
                        serialNumber: '456789',
                    },
                ]}
                selectedAdapter={'/dev/tty1'}
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
            <AdapterSelector
                adapters={[
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
