/* eslint-disable import/first */

jest.mock('react-infinite', () => 'Infinite');
jest.mock('../../containers/LogHeaderContainer', () => 'LogHeaderContainer');

// Do not decorate components
jest.mock('../../util/plugins', () => ({
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
                time: new Date('2017-02-03T12:41:36.020Z'),
                message: 'Info message',
            }, {
                id: 2,
                level: 'error',
                time: new Date('2017-02-03T13:41:36.020Z'),
                message: 'Error message',
            },
        ]);
        expect(renderer.create(
            <LogViewer
                logEntries={entries}
                onOpenLogFile={() => {}}
                onClearLog={() => {}}
                onToggleAutoScroll={() => {}}
                autoScroll
            />,
        )).toMatchSnapshot();
    });
});
