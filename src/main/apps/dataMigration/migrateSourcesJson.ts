/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import fs from 'fs-extra';
import path from 'path';
import { z } from 'zod';

import { getAppsExternalDir } from '../../config';
import { readSchemedJsonFile } from '../../fileUtil';
import { sourcesVersionedJsonPath, writeSourcesFile } from '../sources';

export const oldSourcesJsonPath = () =>
    path.join(getAppsExternalDir(), 'sources.json');

const oldSourcesJsonSchema = z.record(z.string(), z.string().url());

export const migrateSourcesJson = () => {
    if (
        !fs.existsSync(oldSourcesJsonPath()) ||
        fs.existsSync(sourcesVersionedJsonPath())
    ) {
        return;
    }

    const oldSourcesJson = readSchemedJsonFile(
        oldSourcesJsonPath(),
        oldSourcesJsonSchema
    );
    const migratedSources = Object.entries(oldSourcesJson).map(
        ([name, url]) => ({
            name,
            url: url.replace(/apps\.json$/, 'source.json'),
        })
    );

    writeSourcesFile(migratedSources);
};
