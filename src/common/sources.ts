/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { UrlString } from '@nordicsemiconductor/pc-nrfconnect-shared/ipc/MetaFiles';
import {
    LOCAL,
    OFFICIAL,
    SourceName,
} from '@nordicsemiconductor/pc-nrfconnect-shared/ipc/sources';

import { asShortNordicArtifactoryUrl } from './artifactoryUrl';

export { LOCAL, OFFICIAL, type SourceName };

export const allStandardSourceNames: SourceName[] = [OFFICIAL, LOCAL];

export type SourceUrl = UrlString;
export type Source = { name: SourceName; url: SourceUrl };

export type SourceWithError = { source: Source; reason?: string };

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
        `https://files.nordicsemi.com/artifactory/swtools/internal/ncd/apps/${name}/source.json`,
);

export const isDeprecatedSource = (source: Source) =>
    deprecatedSourceURLs.includes(asShortNordicArtifactoryUrl(source.url));
