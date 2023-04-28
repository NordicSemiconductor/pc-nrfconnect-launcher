/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import fs from 'fs-extra';
import { SourceJson } from 'pc-nrfconnect-shared';

import {
    allStandardSourceNames,
    OFFICIAL,
    Source,
    SourceName,
    SourceUrl,
} from '../../ipc/sources';
import { getAppsRootDir } from '../config';
import { addDownloadAppData } from './app';
import { downloadAppInfos } from './apps';
import {
    addToSourceList,
    downloadSourceJson,
    initialise,
    removeFromSourceList,
    writeSourceJson,
} from './sources';

const downloadSource = async (
    url: SourceUrl
): Promise<{ source: Source; sourceJson: SourceJson }> => {
    const sourceJson = await downloadSourceJson(url);
    const source: Source = { name: sourceJson.name, url };

    if (source.name === OFFICIAL) {
        throw new Error('The official source cannot be added.');
    }

    const isLegacyUrl = url.endsWith('/apps.json') && sourceJson.apps == null;
    if (isLegacyUrl) {
        return downloadSource(url.replace(/apps.json$/, 'source.json'));
    }

    return { source, sourceJson };
};

export const addSource = async (url: SourceUrl) => {
    const { source, sourceJson } = await downloadSource(url);

    initialise(source);
    writeSourceJson(source, sourceJson);

    addToSourceList(source);

    const apps = (await downloadAppInfos(source)).map(
        addDownloadAppData(source.name)
    );

    return { source, apps };
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
    if (isRemovableSource(sourceName)) {
        await removeSourceDirectory(sourceName);

        removeFromSourceList(sourceName);
    }
};