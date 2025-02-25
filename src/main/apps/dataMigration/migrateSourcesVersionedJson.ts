/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import path from 'node:path';

import { migrateAllURLsInJSON, migrateURL } from '../../../ipc/legacySource';
import { getAppsRootDir } from '../../config';
import { listFiles, readFile, writeFile } from '../../fileUtil';
import { getAllSources, writeSourcesVersionedJson } from '../sources';
import { readV1SourcesFile } from './sourcesVersionedJsonV1';

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
