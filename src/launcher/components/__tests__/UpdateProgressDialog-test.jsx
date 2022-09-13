/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import render from '../../../testrenderer';
import {
    cancelDownloadAction,
    startDownloadAction,
    updateAvailableAction,
    updateDownloadingAction,
} from '../../actions/autoUpdateActions';
import UpdateProgressContainer from '../../containers/UpdateProgressContainer';

describe('UpdateProgressDialog', () => {
    it('is initially invisible', () => {
        expect(
            render(<UpdateProgressContainer />).baseElement
        ).toMatchSnapshot();
    });

    it('can have a version, percent downloaded, and be cancellable', () => {
        expect(
            render(<UpdateProgressContainer />, [
                updateAvailableAction('1.2.3'),
                startDownloadAction(true, true),
                updateDownloadingAction(42),
            ]).baseElement
        ).toMatchSnapshot();
    });

    it('can be without progress, and not cancellable', () => {
        expect(
            render(<UpdateProgressContainer />, [
                updateAvailableAction('1.2.3'),
                startDownloadAction(false, false),
                updateDownloadingAction(42),
            ]).baseElement
        ).toMatchSnapshot();
    });

    it('has cancelling disabled after being cancelled', () => {
        expect(
            render(<UpdateProgressContainer />, [
                updateAvailableAction('1.2.3'),
                startDownloadAction(true, true),
                cancelDownloadAction(),
            ]).baseElement
        ).toMatchSnapshot();
    });

    it('has cancelling disabled when 100 percent complete', () => {
        expect(
            render(<UpdateProgressContainer />, [
                updateAvailableAction('1.2.3'),
                startDownloadAction(true, true),
                updateDownloadingAction(100),
            ]).baseElement
        ).toMatchSnapshot();
    });
});
