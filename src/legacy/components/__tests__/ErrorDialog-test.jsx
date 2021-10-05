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
import { List } from 'immutable';

import ErrorDialog from '../ErrorDialog';

describe('ErrorDialog', () => {
    it('should render hidden dialog', () => {
        expect(
            shallow(
                <ErrorDialog
                    messages={List([])}
                    onClose={() => {}}
                    isVisible={false}
                />
            )
        ).toMatchSnapshot();
    });

    it('should render visible dialog with one message', () => {
        expect(
            shallow(
                <ErrorDialog
                    messages={List(['Oops. An error occurred.'])}
                    onClose={() => {}}
                    isVisible
                />
            )
        ).toMatchSnapshot();
    });

    it('should render visible dialog with two messages', () => {
        expect(
            shallow(
                <ErrorDialog
                    messages={List([
                        'Oops. An error occurred.',
                        'Another error',
                    ])}
                    onClose={() => {}}
                    isVisible
                />
            )
        ).toMatchSnapshot();
    });
});
