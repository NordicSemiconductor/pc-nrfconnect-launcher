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
import { addDownloadableApps } from '../apps/appsSlice';
import ReleaseNotesDialog from './ReleaseNotesDialog';
import { hide, show } from './releaseNotesDialogSlice';

const uninstalledApp = createUninstalledTestApp('one', {
    releaseNotes: 'Release notes for one uninstalled app',
});
const installedApp = createDownloadableTestApp('another', {
    releaseNotes: 'Release notes for another installed app',
});
const updatableApp = createDownloadableTestApp('third', {
    releaseNotes: 'Release notes for a third updatable app',
    currentVersion: '2.0.0',
    latestVersion: '2.1.0',
});

const downloadableApps = [uninstalledApp, installedApp, updatableApp];

describe('ReleaseNotesDialog', () => {
    it('is initially invisible', () => {
        expect(
            render(<ReleaseNotesDialog />, [
                addDownloadableApps(downloadableApps),
            ]).baseElement,
        ).toMatchSnapshot();
    });

    it('is displayed for an uninstalled app', () => {
        expect(
            render(<ReleaseNotesDialog />, [
                addDownloadableApps(downloadableApps),
                show(uninstalledApp),
            ]).baseElement,
        ).toMatchSnapshot();
    });

    it('is displayed for an up-to-date installed app', () => {
        expect(
            render(<ReleaseNotesDialog />, [
                addDownloadableApps(downloadableApps),
                show(installedApp),
            ]).baseElement,
        ).toMatchSnapshot();
    });

    it('is displayed for an updatable app', () => {
        expect(
            render(<ReleaseNotesDialog />, [
                addDownloadableApps(downloadableApps),
                show(updatableApp),
            ]).baseElement,
        ).toMatchSnapshot();
    });

    it('is hidden again after closing the dialog', () => {
        expect(
            render(<ReleaseNotesDialog />, [
                addDownloadableApps(downloadableApps),
                show(uninstalledApp),
                hide(),
            ]).baseElement,
        ).toMatchSnapshot();
    });
});
