/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Source } from '../ipc/sources';

export const isLegacyUrl = (url: string) =>
    url.match(/^https?:\/\/developer\.nordicsemi\.com\//);

export const migrateURL = (url: string) =>
    url
        .replace(
            /https?:\/\/developer\.nordicsemi\.com\/\.pc-tools\/nrfconnect-apps\/(3\.\d+-apps)\/(.+)/,
            'https://files.nordicsemi.com/artifactory/swtools/external/ncd/apps/$1/$2'
        )
        .replace(
            /https?:\/\/developer\.nordicsemi\.com\/\.pc-tools\/nrfconnect-apps\/directionfinding\/(.+)/,
            'https://files.nordicsemi.com/artifactory/swtools/external-confidential/ncd/apps/directionfinding/$1'
        )
        .replace(
            /https?:\/\/developer\.nordicsemi\.com\/\.pc-tools\/nrfconnect-apps\/([^/]+)\/(.+)/,
            'https://files.nordicsemi.com/artifactory/swtools/internal/ncd/apps/$1/$2'
        )
        .replace(
            /https?:\/\/developer.nordicsemi.com\/\.pc-tools\/nrfconnect-apps\/(.+)/,
            'https://files.nordicsemi.com/artifactory/swtools/external/ncd/apps/official/$1'
        );

export const migrateAllURLsInJSON = (json: string) =>
    json.replace(/"https?:[^"]*"/g, migrateURL);

const deprecatedSources = [
    'toolchain-manager',
    '3.8-release-test',
    'neutrino-external',
    'neutrino-internal',
    'crasher',
    'internal',
    'experimental',
];

const deprecatedSourceURLs = deprecatedSources.map(
    name =>
        `https://files.nordicsemi.com/artifactory/swtools/internal/ncd/apps/${name}/source.json`
);

export const isDeprecatedSource = (url: Source) =>
    deprecatedSourceURLs.includes(url.url);
