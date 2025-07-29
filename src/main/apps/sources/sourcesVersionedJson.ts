/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { dialog } from 'electron';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';

import { Source } from '../../../common/sources';
import { getAppsExternalDir } from '../../config';
import describeError from '../../describeError';
import { readSchemedJsonFile, writeSchemedJsonFile } from '../../fileUtil';

export const sourcesVersionedJsonPath = () =>
    path.join(getAppsExternalDir(), 'sources-versioned.json');

const source = z.object({
    name: z.string(),
    url: z.string().url(),
    description: z.string().optional(),
    state: z.enum(['in use', 'available']).default('in use'),
});

const sourcesSchema = z.array(source);

const sourcesSchemaV1 = z.array(
    source.omit({ state: true, description: true })
);

export const sourcesVersionedJsonSchema = z.object({
    v1: sourcesSchemaV1.optional(),
    v2: sourcesSchema,
});

export type SourcesVersionedJson = z.infer<typeof sourcesVersionedJsonSchema>;

const readSourcesVersionedJson = () => {
    if (!fs.existsSync(sourcesVersionedJsonPath())) {
        return { v2: [] };
    }

    return readSchemedJsonFile(
        sourcesVersionedJsonPath(),
        sourcesVersionedJsonSchema
    );
};

export const writeSourcesVersionedJson = (data: SourcesVersionedJson) =>
    writeSchemedJsonFile(
        sourcesVersionedJsonPath(),
        sourcesVersionedJsonSchema,
        data
    );

export const loadAllSources = () => {
    if (!fs.existsSync(sourcesVersionedJsonPath())) {
        return [];
    }
    try {
        return readSchemedJsonFile(
            sourcesVersionedJsonPath(),
            sourcesVersionedJsonSchema
        ).v2;
    } catch (err) {
        dialog.showErrorBox(
            'Could not load list of locally known sources',
            'No sources besides the official and the local one will be shown. ' +
                'Also apps from other sources will be hidden.\n\nError: ' +
                `${describeError(err)}`
        );
        return [];
    }
};

export const writeSourcesFile = (allSources: Source[]) => {
    const previousContent = readSourcesVersionedJson();

    writeSchemedJsonFile(
        sourcesVersionedJsonPath(),
        sourcesVersionedJsonSchema,
        {
            ...previousContent,
            v2: allSources,
        }
    );
};
