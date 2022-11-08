/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import {
    createDownloadableTestApp,
    createUninstalledTestApp,
} from '../../../test/testFixtures';
import render from '../../../test/testrenderer';
import { setAllDownloadableApps } from '../apps/appsSlice';
import ReleaseNotesDialog from './ReleaseNotesDialog';
import { hide, show } from './releaseNotesDialogSlice';

const uninstalledApp = createUninstalledTestApp('one', {
    releaseNote: 'Release notes for one uninstalled app',
});
const installedApp = createDownloadableTestApp('another', {
    releaseNote: 'Release notes for another installed app',
});
const updatableApp = createDownloadableTestApp('third', {
    releaseNote: 'Release notes for a third updatable app',
    currentVersion: '2.0.0',
    latestVersion: '2.1.0',
    updateAvailable: false,
});

const downloadableApps = [uninstalledApp, installedApp, updatableApp];

describe('ReleaseNotesDialog', () => {
    it('is initially invisible', () => {
        expect(
            render(<ReleaseNotesDialog />, [
                setAllDownloadableApps(downloadableApps),
            ]).baseElement
        ).toMatchSnapshot();
    });

    it('is displayed for an uninstalled app', () => {
        expect(
            render(<ReleaseNotesDialog />, [
                setAllDownloadableApps(downloadableApps),
                show(uninstalledApp),
            ]).baseElement
        ).toMatchSnapshot();
    });

    it('is displayed for an up-to-date installed app', () => {
        expect(
            render(<ReleaseNotesDialog />, [
                setAllDownloadableApps(downloadableApps),
                show(installedApp),
            ]).baseElement
        ).toMatchSnapshot();
    });

    it('is displayed for an updatable app', () => {
        expect(
            render(<ReleaseNotesDialog />, [
                setAllDownloadableApps(downloadableApps),
                show(updatableApp),
            ]).baseElement
        ).toMatchSnapshot();
    });

    it('is hidden again after closing the dialog', () => {
        expect(
            render(<ReleaseNotesDialog />, [
                setAllDownloadableApps(downloadableApps),
                show(uninstalledApp),
                hide(),
            ]).baseElement
        ).toMatchSnapshot();
    });
});
