/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import path from 'node:path';

import { getAppsRootDir } from '../../config';
import { listFiles, readFile, writeFile } from '../../fileUtil';
import { getAllSources, writeSourcesVersionedJson } from '../sources';
import { readV1SourcesFile } from './sourcesVersionedJsonV1';

export const migrateURL = (url: string) =>
    url
        .replace(
            /https:\/\/developer\.nordicsemi\.com\/\.pc-tools\/nrfconnect-apps\/(3\.\d+-apps)\/(.+)/,
            'https://files.nordicsemi.com/ui/api/v1/download?isNativeBrowsing=false&repoKey=swtools&path=external/ncd/apps/$1/$2'
        )
        .replace(
            /https:\/\/developer\.nordicsemi\.com\/\.pc-tools\/nrfconnect-apps\/directionfinding\/(.+)/,
            'https://files.nordicsemi.com/ui/api/v1/download?isNativeBrowsing=false&repoKey=swtools&path=external-confidential/ncd/apps/directionfinding/$1'
        )
        .replace(
            /https:\/\/developer\.nordicsemi\.com\/\.pc-tools\/nrfconnect-apps\/([^/]+)\/(.+)/,
            'https://files.nordicsemi.com/ui/api/v1/download?isNativeBrowsing=false&repoKey=swtools&path=internal/ncd/apps/$1/$2'
        )
        .replace(
            /https:\/\/developer.nordicsemi.com\/\.pc-tools\/nrfconnect-apps\/(.+)/,
            'https://files.nordicsemi.com/ui/api/v1/download?isNativeBrowsing=false&repoKey=swtools&path=external/ncd/apps/official/$1'
        );

export const migrateAllURLsInJSON = (json: string) =>
    json.replace(/"https?:[^"]*"/g, migrateURL);

const migrateOtherJsonFiles = () => {
    getAllSources().forEach(({ name }) => {
        const sourceRoot = getAppsRootDir(name);
        listFiles(sourceRoot, /\.json$/).forEach(file => {
            const jsonPath = path.join(sourceRoot, file);

            const json = readFile(jsonPath);
            const migratedJson = migrateAllURLsInJSON(json);
            writeFile(jsonPath, migratedJson);
        });
    });
};

export const migrateSourcesVersionedJson = () => {
    const sourcesVersionedJson = readV1SourcesFile();
    if (sourcesVersionedJson.v1 == null || sourcesVersionedJson.v2 != null) {
        return;
    }

    const v2 = sourcesVersionedJson.v1.map(({ name, url }) => ({
        name,
        url: migrateURL(url),
    }));

    writeSourcesVersionedJson({ ...sourcesVersionedJson, v2 });

    migrateOtherJsonFiles();
};
