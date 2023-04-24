/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import fs from 'fs';
import type { Draft } from 'immer';
import merge from 'lodash.merge';

import type { Settings } from '../ipc/settings';
import { getConfig } from './config';
import { readFile } from './fileUtil';

const defaultSettings = {};

const parseJsonFile = (filePath: string) => {
    if (!fs.existsSync(filePath)) {
        return {};
    }
    try {
        return JSON.parse(readFile(filePath));
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

export const get = () => data as Settings;
