/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { SourceJson } from '@nordicsemiconductor/pc-nrfconnect-shared/main';
import fs from 'fs-extra';

import {
    allStandardSourceNames,
    OFFICIAL,
    Source,
    SourceName,
    SourceUrl,
} from '../../../common/sources';
import { type AddSourceResult } from '../../../ipc/sources';
import { getAppsRootDir } from '../../config';
import describeError from '../../describeError';
import { addDownloadAppData } from '../app';
import { downloadAppInfos } from '../apps';
import { downloadSourceJson, writeSourceJson } from './sourceJson';
import {
    addToSourceList,
    getSource,
    initialise,
    removeFromSourceList,
} from './sources';

const downloadSource = async (
    url: SourceUrl
): Promise<{ source: Source; sourceJson: SourceJson }> => {
    const sourceJson = await downloadSourceJson(url);
    const source: Source = { name: sourceJson.name, url };

    return { source, sourceJson };
};

export const addSource = async (url: SourceUrl): Promise<AddSourceResult> => {
    let downloadResult;
    try {
        downloadResult = await downloadSource(url);
    } catch (error) {
        return {
            type: 'error',
            errorType: 'Unable to retrieve source.json',
            message: describeError(error),
        };
    }
    const { source, sourceJson } = downloadResult;

    if (source.name === OFFICIAL) {
        return { type: 'error', errorType: 'Official sources cannot be added' };
    }

    const existingSource = getSource(source.name);
    if (existingSource != null) {
        return {
            type: 'error',
            errorType: 'Source already exists',
            existingSource,
        };
    }

    initialise(source);
    writeSourceJson(source, sourceJson);

    addToSourceList(source);

    const apps = (await downloadAppInfos(source)).map(
        addDownloadAppData(source.name)
    );

    return { type: 'success', source, apps };
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
