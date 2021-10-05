/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

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
import { shallow } from 'enzyme';

import ConfirmationDialog from '../ConfirmationDialog';

describe('ConfirmationDialog', () => {
    it('should render invisible dialog', () => {
        expect(
            shallow(
                <ConfirmationDialog
                    isVisible={false}
                    text="Do you confirm?"
                    onCancel={() => {}}
                    onOk={() => {}}
                />
            )
        ).toMatchSnapshot();
    });

    it('should render visible dialog with text', () => {
        expect(
            shallow(
                <ConfirmationDialog
                    isVisible
                    text="Do you confirm?"
                    onCancel={() => {}}
                    onOk={() => {}}
                />
            )
        ).toMatchSnapshot();
    });

    it('should render visible dialog with text and operation in progress', () => {
        expect(
            shallow(
                <ConfirmationDialog
                    isVisible
                    isInProgress
                    text="Do you confirm?"
                    onCancel={() => {}}
                    onOk={() => {}}
                />
            )
        ).toMatchSnapshot();
    });

    it('should not render cancel button if onCancel function is not provided', () => {
        expect(
            shallow(
                <ConfirmationDialog
                    isVisible
                    text="Something happened."
                    onOk={() => {}}
                />
            )
        ).toMatchSnapshot();
    });
});
