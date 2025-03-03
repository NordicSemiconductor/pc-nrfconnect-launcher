/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    SourceJson,
    WithdrawnJson,
    withdrawnJsonSchema,
} from '@nordicsemiconductor/pc-nrfconnect-shared/main';
import path from 'path';

import { Source } from '../../../ipc/sources';
import { getAppsRootDir } from '../../config';
import { readSchemedJsonFile, writeSchemedJsonFile } from '../../fileUtil';

const getWithdrawnJsonPath = (source: Source) =>
    path.join(getAppsRootDir(source.name), 'withdrawn.json');

export const readWithdrawnJson = (source: Source) =>
    readSchemedJsonFile(getWithdrawnJsonPath(source), withdrawnJsonSchema, []);

export const writeWithdrawnJson = (
    source: Source,
    withdrawnJson: WithdrawnJson
) =>
    writeSchemedJsonFile(
        getWithdrawnJsonPath(source),
        withdrawnJsonSchema,
        withdrawnJson
    );

export const isInListOfWithdrawnApps = (
    source: Source,
    appinfoFilename: string
) =>
    readWithdrawnJson(source).find(appUrl =>
        appUrl.endsWith(`/${appinfoFilename}`)
    ) != null;

const without = <T>(arr1: T[], arr2: T[]) =>
    arr1.filter(element => !arr2.includes(element));

const stillWithdrawnApps = (
    oldWithdrawnJson: WithdrawnJson,
    newSourceJson: SourceJson
) => without(oldWithdrawnJson, newSourceJson.apps);

const freshlyWithdrawnApps = (
    oldSourceJson: SourceJson,
    newSourceJson: SourceJson
) => without(oldSourceJson.apps, newSourceJson.apps);

export const newWithdrawnJson = (
    oldWithdrawnJson: WithdrawnJson,
    oldSourceJson: SourceJson,
    newSourceJson: SourceJson
) => [
    ...stillWithdrawnApps(oldWithdrawnJson, newSourceJson),
    ...freshlyWithdrawnApps(oldSourceJson, newSourceJson),
];
