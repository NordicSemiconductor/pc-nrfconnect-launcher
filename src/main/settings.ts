/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import fs from 'fs';

import * as config from './config';

let data: Record<string, unknown> | undefined;

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
    const settings = parseJsonFile(config.getSettingsJsonPath());
    if (settings && typeof settings === 'object') {
        data = settings;
    } else {
        data = {};
    }

    return data;
};

const save = () => {
    fs.writeFileSync(config.getSettingsJsonPath(), JSON.stringify(data));
};

export const set = (key: string, value: unknown) => {
    const loadedData = load();
    loadedData[key] = value;
    save();
};

export const get = <T>(key: string, defaultValue: T | null = null) => {
    const loadedData = load();

    return key in loadedData ? (loadedData[key] as T) : defaultValue;
};
