jest.mock('react-infinite', () => 'Infinite');

/* eslint-disable import/first */
import React from 'react';
import renderer from 'react-test-renderer';
import Immutable from 'immutable';
import LogViewer from '../LogViewer';
/* eslint-enable import/first */

function renderComponent(entries) {
    return renderer.create(<LogViewer logEntries={entries} autoScroll />).toJSON();
}

describe('LogViewer', () => {
    it('should render log entries', () => {
        const entries = Immutable.List([
            {
                id: 1,
                level: 2,
                time: '2017-02-03T12:41:36.020Z',
                message: 'Info message',
            }, {
                id: 2,
                level: 4,
                time: '2017-02-03T13:41:36.020Z',
                message: 'Error message',
            },
        ]);
        expect(renderComponent(entries)).toMatchSnapshot();
    });
});
