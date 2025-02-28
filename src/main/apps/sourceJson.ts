/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    SourceJson,
    sourceJsonSchema,
} from '@nordicsemiconductor/pc-nrfconnect-shared/main';
import fs from 'fs-extra';
import path from 'path';

import { Source, SourceUrl } from '../../ipc/sources';
import { getAppsRootDir } from '../config';
import { readSchemedJsonFile, writeSchemedJsonFile } from '../fileUtil';
import { downloadToJson } from '../net';

const getSourceJsonPath = (source: Source) =>
    path.join(getAppsRootDir(source.name), 'source.json');

export const downloadSourceJson = (sourceUrl: SourceUrl) =>
    downloadToJson<SourceJson>(sourceUrl);

export const downloadSourceJsonToFile = async (source: Source) => {
    const sourceJson = await downloadSourceJson(source.url);
    writeSourceJson(source, sourceJson);

    return sourceJson;
};

export const readSourceJson = (source: Source) =>
    readSchemedJsonFile(getSourceJsonPath(source), sourceJsonSchema, {
        name: source.name,
        apps: [],
    });

export const writeSourceJson = (source: Source, sourceJson: SourceJson) =>
    writeSchemedJsonFile(
        getSourceJsonPath(source),
        sourceJsonSchema,
        sourceJson
    );

export const sourceJsonExistsLocally = (source: Source) =>
    fs.existsSync(getSourceJsonPath(source));
