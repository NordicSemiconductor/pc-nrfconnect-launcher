/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import os from 'os';
import path from 'path';

import {
    convertAppsJsonToSourceJson,
    createNewAppInfo,
} from './legacyMetaFiles';

jest.mock('../../config', () => {
    const { join } = jest.requireActual('path');
    const { homedir } = jest.requireActual('os');
    return {
        getNodeModulesDir: () =>
            join(homedir(), '.nrfconnect-apps', 'node_modules'),
    };
});

const officialSource = {
    appsJson: {
        '_deprecation note_': {
            _1: 'Such a note was added when we deprecated downloading apps.json from GitHub.',
        },
        'pc-nrfconnect-rssi': {
            displayName: 'RSSI Viewer',
            description:
                'Live visualization of RSSI per frequency for nRF52832',
            homepage:
                'https://github.com/NordicSemiconductor/pc-nrfconnect-rssi',
            url: 'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/pc-nrfconnect-rssi',
        },
        'pc-nrfconnect-ppk': {
            displayName: 'Power Profiler',
            description: 'App for use with Nordic Power Profiler Kits',
            url: 'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/pc-nrfconnect-ppk',
        },
    },
    updatesJson: {
        'pc-nrfconnect-rssi': '1.4.3',
        'pc-nrfconnect-ppk': '3.5.4',
    },
    sourceJson: {
        name: 'official',
        apps: [
            'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/pc-nrfconnect-rssi.json',
            'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/pc-nrfconnect-ppk.json',
        ],
    },

    packageJsons: {
        'pc-nrfconnect-rssi': {
            name: 'pc-nrfconnect-rssi',
            version: '1.4.3',
            displayName: 'RSSI Viewer',
            description:
                'Live visualization of RSSI per frequency for nRF52832',
            homepage:
                'https://github.com/NordicSemiconductor/pc-nrfconnect-rssi',
            repository: {
                type: 'git',
                url: 'https://github.com/NordicSemiconductor/pc-nrfconnect-rssi.git',
            },
            engines: {
                nrfconnect: '>=4.2.0',
            },
            nrfConnectForDesktop: {
                html: '',
            },
        },
    },

    appInfos: {
        'pc-nrfconnect-rssi': {
            name: 'pc-nrfconnect-rssi',
            displayName: 'RSSI Viewer',
            description:
                'Live visualization of RSSI per frequency for nRF52832',
            homepage:
                'https://github.com/NordicSemiconductor/pc-nrfconnect-rssi',
            iconUrl:
                'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/pc-nrfconnect-rssi.svg',
            releaseNotesUrl:
                'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/pc-nrfconnect-rssi-Changelog.md',
            latestVersion: '1.4.3',
            versions: {
                '1.4.3': {
                    tarballUrl:
                        'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/pc-nrfconnect-rssi-1.4.3.tgz',
                },
            },
            installed: {
                path: path.join(
                    os.homedir(),
                    '.nrfconnect-apps',
                    'node_modules',
                    'pc-nrfconnect-rssi',
                ),
            },
        },
        'pc-nrfconnect-ppk': {
            name: 'pc-nrfconnect-ppk',
            displayName: 'Power Profiler',
            description: 'App for use with Nordic Power Profiler Kits',
            iconUrl:
                'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/pc-nrfconnect-ppk.svg',
            releaseNotesUrl:
                'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/pc-nrfconnect-ppk-Changelog.md',
            latestVersion: '3.5.4',
            versions: {
                '3.5.4': {
                    tarballUrl:
                        'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/pc-nrfconnect-ppk-3.5.4.tgz',
                },
            },
            homepage: undefined,
            installed: undefined,
        },
    },
};

const releaseTestSource = {
    appsJson: {
        _source: 'Release Test',
        'pc-nrfconnect-toolchain-manager': {
            displayName: 'Toolchain Manager',
            description: 'Toolchain Manager for release test',
            url: 'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/release-test/pc-nrfconnect-toolchain-manager',
        },
        'pc-nrfconnect-linkmonitor': {
            displayName: 'LTE Link Monitor',
            description: 'Link monitor and AT command terminal',
            homepage:
                'https://github.com/NordicSemiconductor/pc-nrfconnect-linkmonitor',
            url: 'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/release-test/pc-nrfconnect-linkmonitor',
        },
    },
    updatesJson: {
        'pc-nrfconnect-toolchain-manager': '1.2.2',
        'pc-nrfconnect-linkmonitor': '2.0.3',
    },
    sourceJson: {
        name: 'Release Test',
        apps: [
            'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/release-test/pc-nrfconnect-toolchain-manager.json',
            'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/release-test/pc-nrfconnect-linkmonitor.json',
        ],
    },
};
describe('Conversion of apps.json to source.json', () => {
    test('official source', () => {
        expect(convertAppsJsonToSourceJson(officialSource.appsJson)).toEqual(
            officialSource.sourceJson,
        );
    });

    test('additional source', () => {
        expect(convertAppsJsonToSourceJson(releaseTestSource.appsJson)).toEqual(
            releaseTestSource.sourceJson,
        );
    });
});

describe('Creating of new app info files', () => {
    test('installed app', () => {
        expect(
            createNewAppInfo(
                'pc-nrfconnect-rssi',
                officialSource.appsJson,
                officialSource.updatesJson,
                officialSource.packageJsons['pc-nrfconnect-rssi'],
            ),
        ).toEqual(officialSource.appInfos['pc-nrfconnect-rssi']);
    });

    test('uninstalled app', () => {
        expect(
            createNewAppInfo(
                'pc-nrfconnect-ppk',
                officialSource.appsJson,
                officialSource.updatesJson,
                null,
            ),
        ).toEqual(officialSource.appInfos['pc-nrfconnect-ppk']);
    });
});
