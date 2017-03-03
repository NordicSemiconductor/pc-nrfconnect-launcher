/* eslint-disable import/first */

// Do not render react-bootstrap components in tests
jest.mock('react-bootstrap', () => ({
    Modal: 'Modal',
    Button: 'Button',
    ModalHeader: 'ModalHeader',
    ModalFooter: 'ModalFooter',
    ModalBody: 'ModalBody',
    ModalTitle: 'ModalTitle',
}));

import React from 'react';
import renderer from 'react-test-renderer';
import ConfirmationDialog from '../ConfirmationDialog';

describe('ConfirmationDialog', () => {
    it('should render invisible dialog', () => {
        expect(renderer.create(
            <ConfirmationDialog
                isVisible={false}
                text="Do you confirm?"
                onCancel={() => {}}
                onOk={() => {}}
            />,
        )).toMatchSnapshot();
    });

    it('should render visible dialog with text', () => {
        expect(renderer.create(
            <ConfirmationDialog
                isVisible
                text="Do you confirm?"
                onCancel={() => {}}
                onOk={() => {}}
            />,
        )).toMatchSnapshot();
    });

    it('should render visible dialog with text and operation in progress', () => {
        expect(renderer.create(
            <ConfirmationDialog
                isVisible
                isInProgress
                text="Do you confirm?"
                onCancel={() => {}}
                onOk={() => {}}
            />,
        )).toMatchSnapshot();
    });
});
