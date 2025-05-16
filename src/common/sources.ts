/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    allStandardSourceNames,
    LOCAL,
    OFFICIAL,
    Source,
    SourceName,
    SourceUrl,
} from '@nordicsemiconductor/pc-nrfconnect-shared/ipc/sources';

import { asShortNordicArtifactoryUrl } from './artifactoryUrl';

export {
    allStandardSourceNames,
    LOCAL,
    OFFICIAL,
    type Source,
    type SourceName,
    type SourceUrl,
};

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

export const isDeprecatedSource = (source: Source) =>
    deprecatedSourceURLs.includes(asShortNordicArtifactoryUrl(source.url));
