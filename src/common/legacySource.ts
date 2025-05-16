/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { asLongNordicArtifactoryUrl } from './artifactoryUrl';

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
    json.replace(
        /"(https?:[^"]*)"/g,
        (_, url) => `"${asLongNordicArtifactoryUrl(migrateURL(url))}"`
    );
