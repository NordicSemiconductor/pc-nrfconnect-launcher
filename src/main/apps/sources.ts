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

import { SourceWithError } from '../../ipc/apps';
import { OFFICIAL, Source, SourceName, SourceUrl } from '../../ipc/sources';
import {
    getAppsRootDir,
    getBundledResourcesDir,
    getNodeModulesDir,
} from '../config';
import describeError from '../describeError';
import { readSchemedJsonFile, writeSchemedJsonFile } from '../fileUtil';
import { ensureDirExists } from '../mkdir';
import { downloadToJson } from '../net';
import { loadAllSources, writeSourcesFile } from './sourcesVersionedJson';
import {
    newWithdrawnJson,
    readWithdrawnJson,
    writeWithdrawnJson,
} from './withdrawnJson';

let sourcesAreLoaded = false;
let sources: Source[] = [];

const officialSource = {
    name: OFFICIAL,
    url: 'https://files.nordicsemi.com/ui/api/v1/download?isNativeBrowsing=false&repoKey=swtools&path=external/ncd/apps/official/source.json',
};

const saveAllSources = () => {
    ensureSourcesAreLoaded();

    writeSourcesFile(sources);
};

export const removeFromSourceList = (
    sourceNameToBeRemoved: SourceName,
    doSave = true
) => {
    ensureSourcesAreLoaded();

    sources = sources.filter(source => source.name !== sourceNameToBeRemoved);

    if (doSave) {
        saveAllSources();
    }
};

export const addToSourceList = (sourceToAdd: Source, doSave = true) => {
    removeFromSourceList(sourceToAdd.name, doSave);
    sources.push(sourceToAdd);

    if (doSave) {
        saveAllSources();
    }
};

const ensureSourcesAreLoaded = () => {
    if (!sourcesAreLoaded) {
        sourcesAreLoaded = true;

        sources = loadAllSources();
        addToSourceList(officialSource, false);
    }
};

export const getAllSources = () => {
    ensureSourcesAreLoaded();
    return [...sources];
};

export const initialise = (source: Source) =>
    ensureDirExists(getNodeModulesDir(source.name));

export const initialiseAllSources = () => {
    ensureSourcesAreLoaded();
    sources.forEach(initialise);
};

export const getSource = (name: SourceName) => {
    ensureSourcesAreLoaded();
    return sources.find(source => source.name === name);
};

const getSourceJsonPath = (source: Source) =>
    path.join(getAppsRootDir(source.name), 'source.json');

export const downloadSourceJson = (sourceUrl: SourceUrl) =>
    downloadToJson<SourceJson>(sourceUrl);

const downloadSourceJsonToFile = async (source: Source) => {
    const sourceJson = await downloadSourceJson(source.url);
    writeSourceJson(source, sourceJson);

    return sourceJson;
};

const readSourceJson = (source: Source) =>
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

export const getAppUrls = (source: Source) => readSourceJson(source).apps;

export const getAllAppUrls = (source: Source) => [
    ...readSourceJson(source).apps,
    ...readWithdrawnJson(source),
];

export const sourceJsonExistsLocally = (source: Source) =>
    fs.existsSync(getSourceJsonPath(source));

export const downloadAllSources = async () => {
    const successful: Source[] = [];
    const erroneos: SourceWithError[] = [];

    await Promise.allSettled(
        sources.map(async source => {
            try {
                const oldWithdrawnJson = readWithdrawnJson(source);
                const oldSourceJson = readSourceJson(source);

                const newSourceJson = await downloadSourceJsonToFile(source);

                writeWithdrawnJson(
                    source,
                    newWithdrawnJson(
                        oldWithdrawnJson,
                        oldSourceJson,
                        newSourceJson
                    )
                );

                successful.push(source);
            } catch (error) {
                erroneos.push({
                    source,
                    reason:
                        error instanceof Error
                            ? error.stack
                            : describeError(error),
                });
            }
        })
    );

    return {
        sources: successful,
        sourcesWithErrors: erroneos,
    };
};

export const ensureBundledSourceExists = () => {
    const bundledSource = path.join(
        getBundledResourcesDir(),
        'prefetched',
        'source.json'
    );

    // we need to overwrite source json so if new apps are in it but not on the machine source file
    // bundled apps will still be shown in the list
    if (fs.existsSync(bundledSource)) {
        const to = path.join(getAppsRootDir('official'), 'source.json');
        fs.copyFileSync(bundledSource, to);
    }

    const appFiles = fs
        .readdirSync(path.join(getBundledResourcesDir(), 'prefetched'))
        .filter(p => p.match(/^(pc-nrfconnect-).*/));

    appFiles.forEach(file => {
        const from = path.join(getBundledResourcesDir(), 'prefetched', file);
        const to = path.join(getAppsRootDir('official'), file);
        if (fs.existsSync(from) && !fs.existsSync(to)) {
            fs.copyFileSync(from, to);
        }
    });
};
