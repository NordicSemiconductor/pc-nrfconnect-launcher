/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    SourceJson,
    WithdrawnJson,
} from '@nordicsemiconductor/pc-nrfconnect-shared/main';
import { dialog } from 'electron';
import fs from 'fs-extra';
import path from 'path';

import { SourceWithError } from '../../ipc/apps';
import { OFFICIAL, Source, SourceName, SourceUrl } from '../../ipc/sources';
import {
    getAppsExternalDir,
    getAppsRootDir,
    getBundledResourcesDir,
    getNodeModulesDir,
} from '../config';
import describeError from '../describeError';
import { readFile, readJsonFile, writeJsonFile } from '../fileUtil';
import { ensureDirExists } from '../mkdir';
import { downloadToJson } from '../net';

let sourcesAreLoaded = false;
let sources: Source[] = [];

const officialSource = {
    name: OFFICIAL,
    url: 'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/source.json',
};

const sourcesJsonPath = () => path.join(getAppsExternalDir(), 'sources.json');

const convertToOldSourceJsonFormat = (allSources: Source[]) =>
    Object.fromEntries(
        allSources.map(source => [
            source.name,
            source.url.replace(/source.json$/, 'apps.json'),
        ])
    );

const convertFromOldSourceJsonFormat = (
    sourceJsonParsed: Record<SourceName, SourceUrl>
) =>
    Object.entries(sourceJsonParsed).map(([name, url]) => ({
        name,
        url: url.replace(/apps.json$/, 'source.json'),
    }));

const loadAllSources = () => {
    if (!fs.existsSync(sourcesJsonPath())) {
        return [];
    }
    let sourceJsonContent: string | undefined;
    try {
        sourceJsonContent = readFile(sourcesJsonPath());
        const sourceJsonParsed = JSON.parse(sourceJsonContent);

        if (Array.isArray(sourceJsonParsed)) {
            return sourceJsonParsed;
        }
        if (sourceJsonParsed != null && typeof sourceJsonParsed === 'object') {
            return convertFromOldSourceJsonFormat(sourceJsonParsed);
        }

        throw new Error('Unable to parse `source.json`.');
    } catch (err) {
        dialog.showErrorBox(
            'Could not load list of locally known sources',
            'No sources besides the official and the local one will be shown. ' +
                'Also apps from other sources will be hidden.\n\nError: ' +
                `${describeError(err)}\n\n` +
                `Content of \`source.json\`+ \`${sourceJsonContent}\``
        );
    }
    return [];
};

const saveAllSources = () => {
    ensureSourcesAreLoaded();

    writeJsonFile(sourcesJsonPath(), convertToOldSourceJsonFormat(sources));
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

export const ensureSourcesAreLoaded = () => {
    if (!sourcesAreLoaded) {
        sourcesAreLoaded = true;

        sources = loadAllSources();
        addToSourceList(officialSource, false);
    }
};

export const getAllSources = () => [...sources];

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
    downloadToJson<SourceJson>(sourceUrl, true);

const downloadSourceJsonToFile = async (source: Source) => {
    const sourceJson = await downloadSourceJson(source.url);
    writeJsonFile(getSourceJsonPath(source), sourceJson);

    return sourceJson;
};

const readSourceJson = (source: Source) =>
    readJsonFile<SourceJson>(getSourceJsonPath(source), {
        name: source.name,
        apps: [],
    });

export const writeSourceJson = (source: Source, sourceJson: SourceJson) =>
    writeJsonFile(getSourceJsonPath(source), sourceJson);

export const getAppUrls = (source: Source) => readSourceJson(source).apps;

export const getAllAppUrls = (source: Source) => [
    ...readSourceJson(source).apps,
    ...readWithdrawnJson(source),
];

export const sourceJsonExistsLocally = (source: Source) =>
    fs.existsSync(getSourceJsonPath(source));

const getWithdrawnJsonPath = (source: Source) =>
    path.join(getAppsRootDir(source.name), 'withdrawn.json');

const readWithdrawnJson = (source: Source) =>
    readJsonFile<WithdrawnJson>(getWithdrawnJsonPath(source), []);

export const writeWithdrawnJson = (
    source: Source,
    withdrawnJson: WithdrawnJson
) => writeJsonFile(getWithdrawnJsonPath(source), withdrawnJson);

export const isInListOfWithdrawnApps = (
    source: SourceName,
    appinfoFilename: string
) =>
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    readWithdrawnJson(getSource(source)!).find(appUrl =>
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
