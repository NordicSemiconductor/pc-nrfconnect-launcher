/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import fs from 'fs';

import { Settings } from '../ipc/settings';
import { getConfig } from './config';

let data: Settings | undefined;

const parseJsonFile = (filePath: string) => {
    if (!fs.existsSync(filePath)) {
        return {};
    }
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Record<
            string,
            unknown
        >;
    } catch (err) {
        console.error('Could not load settings. Reason: ', err);
    }
    return {};
};

const load = () => {
    if (data != null) {
        return data;
    }
    const settings = parseJsonFile(getConfig().settingsJsonPath);
    if (settings && typeof settings === 'object') {
        data = <Settings>settings;
    } else {
        data = <Settings>{};
    }

    return data;
};

const save = () => {
    fs.writeFileSync(getConfig().settingsJsonPath, JSON.stringify(data));
};

export const set = <Key extends keyof Settings>(
    key: Key,
    value: Settings[Key]
) => {
    const loadedData = load();
    loadedData[key] = value;
    save();
};

export const get = <Key extends keyof Settings>(
    key: Key,
    defaultValue: Settings[Key]
) => {
    const loadedData = load();

    return key in loadedData ? loadedData[key] : defaultValue;
};
