/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import type {
    InstalledDownloadableApp,
    UninstalledDownloadableApp,
} from '../../../ipc/apps';
import render from '../../../testrenderer';
import { loadDownloadableAppsSuccess } from '../apps/appsSlice';
import ReleaseNotesDialog from './ReleaseNotesDialog';
import { hide, show } from './releaseNotesDialogSlice';

const unimportantAppProperties = {
    description: 'the test app',
    isDownloadable: true,
    source: 'test source',
    url: 'test url',
    path: '',
    iconPath: '',
    shortcutIconPath: '',
} as const;

const uninstalledApp: UninstalledDownloadableApp = {
    ...unimportantAppProperties,
    name: 'uninstalled',
    displayName: 'uninstalled test app',
    latestVersion: '2.0.0',
    releaseNote: 'Release notes for uninstalled',
    isInstalled: false,
    currentVersion: null,
};
const installedApp: InstalledDownloadableApp = {
    ...unimportantAppProperties,
    name: 'installed',
    displayName: 'installed test app',
    latestVersion: '2.0.0',
    currentVersion: '2.0.0',
    releaseNote: 'Release notes for installed',
    isInstalled: true,
};
const updatableApp: InstalledDownloadableApp = {
    ...unimportantAppProperties,
    name: 'updatable',
    displayName: 'updatable test app',
    latestVersion: '2.0.0',
    currentVersion: '2.1.0',
    releaseNote: 'Release notes for updatable',
    isInstalled: true,
};

const downloadableApps = [uninstalledApp, installedApp, updatableApp];

describe('ReleaseNotesDialog', () => {
    it('is initially invisible', () => {
        expect(
            render(<ReleaseNotesDialog />, [
                loadDownloadableAppsSuccess({ downloadableApps }),
            ]).baseElement
        ).toMatchSnapshot();
    });

    it('is displayed for an uninstalled app', () => {
        expect(
            render(<ReleaseNotesDialog />, [
                loadDownloadableAppsSuccess({ downloadableApps }),
                show(uninstalledApp),
            ]).baseElement
        ).toMatchSnapshot();
    });

    it('is displayed for an up-to-date installed app', () => {
        expect(
            render(<ReleaseNotesDialog />, [
                loadDownloadableAppsSuccess({ downloadableApps }),
                show(installedApp),
            ]).baseElement
        ).toMatchSnapshot();
    });

    it('is displayed for an updatable app', () => {
        expect(
            render(<ReleaseNotesDialog />, [
                loadDownloadableAppsSuccess({ downloadableApps }),
                show(updatableApp),
            ]).baseElement
        ).toMatchSnapshot();
    });

    it('is hidden again after closing the dialog', () => {
        expect(
            render(<ReleaseNotesDialog />, [
                loadDownloadableAppsSuccess({ downloadableApps }),
                show(uninstalledApp),
                hide(),
            ]).baseElement
        ).toMatchSnapshot();
    });
});
