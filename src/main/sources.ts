/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { dialog } from 'electron';
import fs from 'fs-extra';

import { DownloadableAppInfoBase } from '../ipc/apps';
import { allStandardSourceNames } from '../ipc/sources';
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

let sourcesData: Record<string, string> | undefined;

export const officialSourceUrl =
    'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps/apps.json';

const loadAllSources = () => {
    const filePath = getConfig().sourcesJsonPath;

    if (!fs.existsSync(filePath)) {
        return {};
    }
    try {
        const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        if (parsed && typeof parsed === 'object') {
            return parsed as Record<string, string>;
        }
    } catch (err) {
        dialog.showErrorBox(
            'Could not load list of locally known sources',
            'No sources besides the official and the local one will be shown. ' +
                'Also apps from other sources will be hidde.\n\nError: ' +
                `${describeError(err)}`
        );
    }
    return {};
};

const saveAllSources = () => {
    fs.writeFileSync(getConfig().sourcesJsonPath, JSON.stringify(sourcesData));
};

const initialSources = () => ({
    ...loadAllSources(),
    official: officialSourceUrl,
});

export const getAllSources = () => {
    if (sourcesData == null) {
        sourcesData = initialSources();
    }

    return sourcesData;
};

export const getAllSourceNames = () => Object.keys(getAllSources());

export const initialiseAllSources = () =>
    Promise.all(getAllSourceNames().map(initialise));

const initialise = (sourceName?: string) =>
    ensureDirExists(getAppsRootDir(sourceName))
        .then(() => ensureDirExists(getNodeModulesDir(sourceName)))
        .then(() => ensureFileExists(getAppsJsonPath(sourceName)))
        .then(() => ensureFileExists(getUpdatesJsonPath(sourceName)));

const ensureFileExists = (filename: string) =>
    fileUtil.createJsonFileIfNotExists(filename, {});

export const getSourceUrl = (name: string) => getAllSources()[name];

class FailedToFetchAppsJsonError extends Error {
    source: { name?: string; url: string };
    sourceNotFound: boolean;
    statusCode?: number;

    constructor(
        error: unknown,
        source: { name?: string; url: string },
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
    _source?: string;
    [app: `pc-nrfconnect-${string}`]: DownloadableAppInfoBase;
}

const downloadAppsJson = async (url: string, name?: string) => {
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
    const isOfficial = url === officialSourceUrl;
    if (sourceName == null && !isOfficial) {
        throw new Error('JSON does not contain expected `_source` tag');
    }

    await initialise(sourceName);
    await fileUtil.createJsonFile(getAppsJsonPath(sourceName), appsJson);

    return sourceName;
};

export const downloadAllAppsJson = () => {
    const sources = getAllSources();

    const sequence = async (
        sourceName?: string,
        ...remainingSourceNames: string[]
    ): Promise<void> => {
        if (sourceName == null) return;

        await downloadAppsJson(sources[sourceName], sourceName);
        return sequence(...remainingSourceNames);
    };

    return sequence(...Object.keys(sources));
};

export const addSource = async (url: string) => {
    const name = await downloadAppsJson(url);

    if (name == null) {
        throw new Error('The official source cannot be added.');
    }

    getAllSources()[name] = url;
    saveAllSources();

    addShownSource(name);

    return name;
};

const isRemovableSource = (sourceName?: string): sourceName is string => {
    if (!sourceName || allStandardSourceNames.includes(sourceName)) {
        throw new Error('The official or local source shall not be removed.');
    }

    return true;
};

const removeSourceDirectory = (sourceName: string) =>
    fs.remove(getAppsRootDir(sourceName));

export const removeSource = async (sourceName?: string) => {
    if (isRemovableSource(sourceName)) {
        await removeSourceDirectory(sourceName);

        delete getAllSources()[sourceName];
        saveAllSources();

        removeShownSource(sourceName);
    }
};
