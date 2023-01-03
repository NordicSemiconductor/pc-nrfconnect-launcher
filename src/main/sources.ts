/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { dialog } from 'electron';
import fs from 'fs-extra';
import path from 'path';
import { SourceJson } from 'pc-nrfconnect-shared';

import { DownloadableAppInfoBase } from '../ipc/apps';
import { OFFICIAL, Source, SourceName, SourceUrl } from '../ipc/sources';
import {
    getAppsJsonPath,
    getAppsRootDir,
    getConfig,
    getNodeModulesDir,
    getUpdatesJsonPath,
} from './config';
import describeError from './describeError';
import {
    createJsonFile,
    createJsonFileIfNotExists,
    readJsonFile,
} from './fileUtil';
import { ensureDirExists } from './mkdir';
import { downloadToJson } from './net';

let sourcesAreLoaded = false;
let sources: Source[] = [];

const officialSource = {
    name: OFFICIAL,
    url: 'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/source.json',
};

const convertToOldSourceJsonFormat = (allSources: Source[]) =>
    Object.fromEntries(
        allSources.map(source => [
            source.name,
            source.url.replace('source.json', 'apps.json'),
        ])
    );

const convertFromOldSourceJsonFormat = (
    sourceJsonParsed: Record<SourceName, SourceUrl>
) =>
    Object.entries(sourceJsonParsed).map(([name, url]) => ({
        name,
        url: url.replace('apps.json', 'source.json'),
    }));

const loadAllSources = () => {
    const filePath = getConfig().sourcesJsonPath;

    if (!fs.existsSync(filePath)) {
        return [];
    }
    let sourceJsonContent: string | undefined;
    try {
        sourceJsonContent = fs.readFileSync(filePath, 'utf-8');
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

    fs.writeFileSync(
        getConfig().sourcesJsonPath,
        JSON.stringify(convertToOldSourceJsonFormat(sources), undefined, 2)
    );
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

export const initialiseAllSources = () => {
    ensureSourcesAreLoaded();
    Promise.all(sources.map(initialise));
};

export const initialise = (source: Source) =>
    ensureDirExists(getAppsRootDir(source.name))
        .then(() => ensureDirExists(getNodeModulesDir(source.name)))
        .then(() => ensureFileExists(getAppsJsonPath(source.name)))
        .then(() => ensureFileExists(getUpdatesJsonPath(source.name)));

const ensureFileExists = (filename: string) =>
    createJsonFileIfNotExists(filename, {});

export const getSourceUrl = (name: SourceName) => {
    ensureSourcesAreLoaded();
    return sources.find(source => source.name === name)?.url;
};

export interface UpdatesJson {
    [app: string]: string;
}

export interface AppsJson {
    _source?: SourceName;
    [app: `pc-nrfconnect-${string}`]: DownloadableAppInfoBase;
}

const getSourceJsonPath = (source: Source) =>
    path.join(getAppsRootDir(source.name), 'source.json');

export const downloadSourceJson = (sourceUrl: SourceUrl) =>
    downloadToJson<SourceJson>(sourceUrl, true);

export const downloadSourceJsonToFile = async (source: Source) => {
    try {
        createJsonFile(
            getSourceJsonPath(source),
            await downloadSourceJson(source.url)
        );
    } catch (error) {
        throw source;
    }
};

const readSourceJson = (source: Source) =>
    readJsonFile<SourceJson>(getSourceJsonPath(source));

export const writeSourceJson = (source: Source, sourceJson: SourceJson) =>
    createJsonFile(getSourceJsonPath(source), sourceJson);

export const getAppUrls = (source: Source) => readSourceJson(source).apps;

export const sourceJsonExistsLocally = (source: Source) =>
    fs.existsSync(getSourceJsonPath(source));

export const downloadAllSources = async () => {
    const successfulSources: Source[] = [];
    const sourcesFailedToDownload: Source[] = [];

    await Promise.allSettled(
        sources.map(async source => {
            try {
                await downloadSourceJsonToFile(source);
                successfulSources.push(source);
            } catch (error) {
                sourcesFailedToDownload.push(source);
            }
        })
    );

    return {
        successfulSources,
        sourcesFailedToDownload,
    };
};
