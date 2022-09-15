/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import render from '../../../testrenderer';
import {
    cancelDownload,
    startDownload,
    updateAvailable,
    updateDownloading,
} from './launcherUpdateSlice';
import UpdateProgressContainer from './UpdateProgressDialog';

describe('UpdateProgressDialog', () => {
    it('is initially invisible', () => {
        expect(
            render(<UpdateProgressContainer />).baseElement
        ).toMatchSnapshot();
    });

    it('can have a version, percent downloaded, and be cancellable', () => {
        expect(
            render(<UpdateProgressContainer />, [
                updateAvailable('1.2.3'),
                startDownload({
                    isCancelSupported: true,
                    isProgressSupported: true,
                }),
                updateDownloading(42),
            ]).baseElement
        ).toMatchSnapshot();
    });

    it('can be without progress, and not cancellable', () => {
        expect(
            render(<UpdateProgressContainer />, [
                updateAvailable('1.2.3'),
                startDownload({
                    isCancelSupported: false,
                    isProgressSupported: false,
                }),
                updateDownloading(42),
            ]).baseElement
        ).toMatchSnapshot();
    });

    it('has cancelling disabled after being cancelled', () => {
        expect(
            render(<UpdateProgressContainer />, [
                updateAvailable('1.2.3'),
                startDownload({
                    isCancelSupported: true,
                    isProgressSupported: true,
                }),
                cancelDownload(),
            ]).baseElement
        ).toMatchSnapshot();
    });

    it('has cancelling disabled when 100 percent complete', () => {
        expect(
            render(<UpdateProgressContainer />, [
                updateAvailable('1.2.3'),
                startDownload({
                    isCancelSupported: true,
                    isProgressSupported: true,
                }),
                updateDownloading(100),
            ]).baseElement
        ).toMatchSnapshot();
    });
});
