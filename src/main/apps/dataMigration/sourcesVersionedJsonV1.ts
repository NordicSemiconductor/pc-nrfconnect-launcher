/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import fs from 'fs';

import type { Source } from '../../../common/sources';
import { readSchemedJsonFile, writeSchemedJsonFile } from '../../fileUtil';
import {
    sourcesVersionedJsonPath,
    sourcesVersionedJsonSchema,
} from '../sources/sourcesVersionedJson';

const sourcesVersionedJsonV1Schema = sourcesVersionedJsonSchema.partial();

type SourceV1 = Omit<Source, 'state' | 'description'>;

export const writeV1SourcesFile = (allSources: SourceV1[]) => {
    writeSchemedJsonFile(
        sourcesVersionedJsonPath(),
        sourcesVersionedJsonV1Schema,
        {
            v1: allSources,
        }
    );
};

export const readV1SourcesFile = () => {
    if (!fs.existsSync(sourcesVersionedJsonPath())) {
        return { v2: [] };
    }

    return readSchemedJsonFile(
        sourcesVersionedJsonPath(),
        sourcesVersionedJsonV1Schema
    );
};
