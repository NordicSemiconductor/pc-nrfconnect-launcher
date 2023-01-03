/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import fs from 'fs-extra';

import {
    allStandardSourceNames,
    Source,
    SourceName,
    SourceUrl,
} from '../ipc/sources';
import { downloadAppInfos } from './appInfo';
import { getAppsRootDir } from './config';
import { addShownSource, removeShownSource } from './settings';
import {
    addToSourceList,
    downloadSourceJson,
    initialise,
    removeFromSourceList,
    writeSourceJson,
} from './sources';

export const addSource = async (url: SourceUrl) => {
    const sourceJson = await downloadSourceJson(url);
    const source: Source = { name: sourceJson.name, url };

    if (source.name == null) {
        throw new Error('The official source cannot be added.');
    }

    initialise(source);
    writeSourceJson(source, sourceJson);

    addToSourceList(source);

    addShownSource(source.name);

    const apps = (await downloadAppInfos(source)).map(app => ({
        ...app,
        currentVersion: undefined,
    }));

    return {
        source,
        apps,
    };
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

        removeShownSource(sourceName);
    }
};
