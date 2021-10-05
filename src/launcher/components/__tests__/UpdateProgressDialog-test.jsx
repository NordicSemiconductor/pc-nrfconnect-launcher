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
    ProgressBar: 'ProgressBar',
}));

import React from 'react';
import { shallow } from 'enzyme';

import UpdateProgressDialog from '../UpdateProgressDialog';

describe('UpdateProgressDialog', () => {
    it('should render invisible', () => {
        expect(
            shallow(
                <UpdateProgressDialog
                    isVisible={false}
                    isProgressSupported={false}
                    isCancelSupported={false}
                    version=""
                    percentDownloaded={0}
                    onCancel={() => {}}
                    isCancelling={false}
                />
            )
        ).toMatchSnapshot();
    });

    it('should render with version, percent downloaded, and cancellable', () => {
        expect(
            shallow(
                <UpdateProgressDialog
                    isVisible
                    isProgressSupported
                    isCancelSupported
                    version="1.2.3"
                    percentDownloaded={42}
                    onCancel={() => {}}
                    isCancelling={false}
                />
            )
        ).toMatchSnapshot();
    });

    it('should render with version, without progress, and not cancellable', () => {
        expect(
            shallow(
                <UpdateProgressDialog
                    isVisible
                    isProgressSupported={false}
                    isCancelSupported={false}
                    version="1.2.3"
                    percentDownloaded={0}
                    onCancel={() => {}}
                    isCancelling={false}
                />
            )
        ).toMatchSnapshot();
    });

    it('should render cancelling', () => {
        expect(
            shallow(
                <UpdateProgressDialog
                    isVisible
                    isProgressSupported
                    isCancelSupported
                    version="1.2.3"
                    percentDownloaded={42}
                    onCancel={() => {}}
                    isCancelling
                />
            )
        ).toMatchSnapshot();
    });

    it('should render with cancel disabled when 100 percent complete', () => {
        expect(
            shallow(
                <UpdateProgressDialog
                    isVisible
                    isProgressSupported
                    isCancelSupported
                    version="1.2.3"
                    percentDownloaded={100}
                    onCancel={() => {}}
                    isCancelling={false}
                />
            )
        ).toMatchSnapshot();
    });
});
