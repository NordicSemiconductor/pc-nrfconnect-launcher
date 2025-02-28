/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Source } from '@nordicsemiconductor/pc-nrfconnect-shared/ipc/sources';
import fs from 'fs-extra';

import { readSchemedJsonFile, writeSchemedJsonFile } from '../../fileUtil';
import {
    sourcesVersionedJsonPath,
    sourcesVersionedJsonSchema,
} from '../sources/sourcesVersionedJson';

const sourcesVersionedJsonV1Schema = sourcesVersionedJsonSchema.partial();

export const writeV1SourcesFile = (allSources: Source[]) => {
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
