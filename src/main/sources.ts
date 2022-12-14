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
import {
    allStandardSourceNames,
    OFFICIAL,
    Source,
    SourceName,
    SourceUrl,
} from '../ipc/sources';
import {
    getAppsJsonPath,
    getAppsRootDir,
    getConfig,
    getNodeModulesDir,
    getUpdatesJsonPath,
} from './config';
import describeError from './describeError';
import * as fileUtil from './fileUtil';
import { ensureDirExists } from './mkdir';
import * as net from './net';
import { addShownSource, removeShownSource } from './settings';

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

const removeFromSourceList = (sourceNameToBeRemoved: SourceName) => {
    sources = sources.filter(source => source.name !== sourceNameToBeRemoved);
};

const addToSourceList = (sourceToAdd: Source) => {
    removeFromSourceList(sourceToAdd.name);
    sources.push(sourceToAdd);
};

export const ensureSourcesAreLoaded = () => {
    if (!sourcesAreLoaded) {
        sourcesAreLoaded = true;

        sources = loadAllSources();
        addToSourceList(officialSource);
    }
};

export const getAllSources = () => sources;

export const getAllSourceNames = () => {
    ensureSourcesAreLoaded();
    return sources.map(source => source.name);
};

export const initialiseAllSources = () =>
    Promise.all(getAllSourceNames().map(initialise));

const initialise = (sourceName?: SourceName) =>
    ensureDirExists(getAppsRootDir(sourceName))
        .then(() => ensureDirExists(getNodeModulesDir(sourceName)))
        .then(() => ensureFileExists(getAppsJsonPath(sourceName)))
        .then(() => ensureFileExists(getUpdatesJsonPath(sourceName)));

const ensureFileExists = (filename: string) =>
    fileUtil.createJsonFileIfNotExists(filename, {});

export const getSourceUrl = (name: SourceName) => {
    ensureSourcesAreLoaded();
    return sources.find(source => source.name === name)?.url;
};

class FailedToFetchAppsJsonError extends Error {
    source: { name?: SourceName; url: SourceUrl };
    sourceNotFound: boolean;
    statusCode?: number;

    constructor(
        error: unknown,
        source: { name?: SourceName; url: SourceUrl },
        sourceNotFound: boolean,
        statusCode?: number
    ) {
        super(
            `Unable to download apps list: ${describeError(error)}. If you ` +
                'are using a proxy server, you may need to configure it as described on ' +
                'https://github.com/NordicSemiconductor/pc-nrfconnect-launcher'
        );

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, FailedToFetchAppsJsonError);
        }

        this.name = 'FailedToFetchAppsJsonError';

        this.source = source;
        this.statusCode = statusCode;
        this.sourceNotFound = sourceNotFound;
    }
}

export interface UpdatesJson {
    [app: string]: string;
}

export interface AppsJson {
    _source?: SourceName;
    [app: `pc-nrfconnect-${string}`]: DownloadableAppInfoBase;
}

const downloadAppsJson = async (url: SourceUrl, name?: SourceName) => {
    let appsJson;
    try {
        appsJson = await net.downloadToJson<AppsJson>(url, true);
    } catch (error) {
        const netError = error as net.NetError;
        throw new FailedToFetchAppsJsonError(
            netError,
            { name, url },
            net.isResourceNotFound(netError),
            netError.statusCode
        );
    }

    // eslint-disable-next-line no-underscore-dangle -- underscore is intentially used in JSON as a meta information
    const sourceName = appsJson._source;
    const isOfficial = url === officialSource.url;
    if (sourceName == null && !isOfficial) {
        throw new Error('JSON does not contain expected `_source` tag');
    }

    await initialise(sourceName);
    await fileUtil.createJsonFile(getAppsJsonPath(sourceName), appsJson);

    return sourceName;
};

const getSourceJsonPath = (source: Source) =>
    path.join(getAppsRootDir(source.name), 'source.json');

const downloadSourceJson = async (source: Source) => {
    try {
        await net.downloadToFile(source.url, getSourceJsonPath(source), true);
    } catch (error) {
        throw source;
    }
};

const readSourceJson = (source: Source) =>
    fileUtil.readJsonFile<SourceJson>(getSourceJsonPath(source));

export const getAppUrls = (source: Source) => readSourceJson(source).apps;

export const downloadAllSources = async () => {
    const successfulSources: Source[] = [];
    const sourcesFailedToDownload: Source[] = [];

    await Promise.allSettled(
        sources.map(async source => {
            try {
                await downloadSourceJson(source);
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

export const downloadAllAppsJson = () => {
    ensureSourcesAreLoaded();

    const sequence = async (
        source?: Source,
        ...remainingSources: Source[]
    ): Promise<void> => {
        if (source == null) return;

        await downloadAppsJson(source.url, source.name);
        return sequence(...remainingSources);
    };

    return sequence(...sources);
};

export const addSource = async (url: SourceUrl) => {
    ensureSourcesAreLoaded();

    const name = await downloadAppsJson(url);

    if (name == null) {
        throw new Error('The official source cannot be added.');
    }

    addToSourceList({ name, url });
    saveAllSources();

    addShownSource(name);

    return name;
};

const isRemovableSource = (
    sourceName?: SourceName
): sourceName is SourceName => {
    if (!sourceName || allStandardSourceNames.includes(sourceName)) {
        throw new Error('The official or local source shall not be removed.');
    }

    return true;
};

const removeSourceDirectory = (sourceName: SourceName) =>
    fs.remove(getAppsRootDir(sourceName));

export const removeSource = async (sourceName?: SourceName) => {
    ensureSourcesAreLoaded();

    if (isRemovableSource(sourceName)) {
        await removeSourceDirectory(sourceName);

        removeFromSourceList(sourceName);
        saveAllSources();

        removeShownSource(sourceName);
    }
};
