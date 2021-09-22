/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable import/first */

jest.mock('../../containers/LogHeaderContainer', () => 'LogHeaderContainer');

// Do not decorate components
jest.mock('../../../decoration', () => ({
    decorate: component => component,
}));

import React from 'react';
import renderer from 'react-test-renderer';
import Immutable from 'immutable';

import LogViewer from '../LogViewer';

describe('LogViewer', () => {
    it('should render log entries', () => {
        const entries = Immutable.List([
            {
                id: 1,
                level: 'info',
                timestamp: '2017-02-03T12:41:36.020Z',
                message: 'Info message',
            },
            {
                id: 2,
                level: 'error',
                timestamp: '2017-02-03T13:41:36.020Z',
                message: 'Error message',
            },
            {
                id: 3,
                level: 'info',
                timestamp: '2017-02-03T13:41:36.020Z',
                message:
                    'For reference see: https://github.com/example/doc.md or reboot Windows.',
            },
        ]);
        expect(
            renderer.create(
                <LogViewer
                    logEntries={entries}
                    onOpenLogFile={() => {}}
                    onClearLog={() => {}}
                    onToggleAutoScroll={() => {}}
                    autoScroll
                />
            )
        ).toMatchSnapshot();
    });
});
