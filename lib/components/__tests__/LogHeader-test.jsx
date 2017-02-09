/* eslint-disable import/first */

// Do not decorate components
jest.mock('../../util/plugins', () => ({
    decorate: component => component,
}));

import React from 'react';
import { mount } from 'enzyme';
import renderer from 'react-test-renderer';
import LogHeader from '../LogHeader';

describe('LogHeader', () => {
    it('should render autoScroll enabled', () => {
        expect(renderer.create(
            <LogHeader
                autoScroll
                onOpenLogFile={() => {}}
                onClearLog={() => {}}
                onToggleAutoScroll={() => {}}
            />,
        )).toMatchSnapshot();
    });

    it('should render autoScroll disabled', () => {
        expect(renderer.create(
            <LogHeader
                autoScroll={false}
                onOpenLogFile={() => {}}
                onClearLog={() => {}}
                onToggleAutoScroll={() => {}}
            />,
        )).toMatchSnapshot();
    });

    it('should invoke onOpenLogFile when openLogFileButton has been clicked', () => {
        const onOpenLogFile = jest.fn();
        const wrapper = mount(
            <LogHeader
                autoScroll
                onOpenLogFile={onOpenLogFile}
                onClearLog={() => {}}
                onToggleAutoScroll={() => {}}
                openLogFileButtonTitle="Open log file"
            />,
        );
        wrapper.find('[title="Open log file"]').simulate('click');

        expect(onOpenLogFile).toHaveBeenCalled();
    });

    it('should invoke onClearLog when clearLogButton has been clicked', () => {
        const onClearLog = jest.fn();
        const wrapper = mount(
            <LogHeader
                autoScroll
                onOpenLogFile={() => {}}
                onClearLog={onClearLog}
                onToggleAutoScroll={() => {}}
                clearLogButtonTitle="Clear log"
            />,
        );
        wrapper.find('[title="Clear log"]').simulate('click');

        expect(onClearLog).toHaveBeenCalled();
    });

    it('should invoke onToggleAutoScroll when autoScrollButton has been clicked', () => {
        const onToggleAutoScroll = jest.fn();
        const wrapper = mount(
            <LogHeader
                autoScroll
                onOpenLogFile={() => {}}
                onClearLog={() => {}}
                onToggleAutoScroll={onToggleAutoScroll}
                autoScrollButtonTitle="Toggle autoscroll"
            />,
        );
        wrapper.find('[title="Toggle autoscroll"]').simulate('click');

        expect(onToggleAutoScroll).toHaveBeenCalled();
    });
});
