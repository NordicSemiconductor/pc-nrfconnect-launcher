/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import fs from 'fs';
import type { Draft } from 'immer';
import merge from 'lodash.merge';

import type { Settings } from '../ipc/settings';
import { allStandardSourceNames, SourceName } from '../ipc/sources';
import { getConfig } from './config';
import { readFile, writeJsonFile } from './fileUtil';

const defaultSettings = {
    appFilter: {
        shownSources: new Set(allStandardSourceNames),
    },
};

const parseJsonFile = (filePath: string) => {
    if (!fs.existsSync(filePath)) {
        return {};
    }
    try {
        return JSON.parse(readFile(filePath), (key, value) =>
            key === 'shownSources' ? new Set(value) : value
        );
    } catch (err) {
        console.error(`Could not load settings at ${filePath}. Reason: `, err);
    }
    return {};
};

const load = () => {
    const settings = parseJsonFile(getConfig().settingsJsonPath);
    if (settings && typeof settings === 'object') {
        return merge({}, defaultSettings, settings);
    }

    return merge({}, defaultSettings);
};

const data: Draft<Settings> = load();

const save = () => {
    const dataToSave = {
        ...data,
        appFilter: {
            ...data.appFilter,
            shownSources: [...data.appFilter.shownSources],
        },
    };

    writeJsonFile(getConfig().settingsJsonPath, dataToSave);
};

export const get = () => data as Settings;

export const addShownSource = (sourceToAdd: SourceName) => {
    data.appFilter.shownSources.add(sourceToAdd);
    save();
};

export const removeShownSource = (sourceToRemove: SourceName) => {
    data.appFilter.shownSources.delete(sourceToRemove);
    save();
};
