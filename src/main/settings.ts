/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import fs from 'fs';
import merge from 'lodash.merge';

import { Settings } from '../ipc/settings';
import { SourceName } from '../ipc/sources';
import { getConfig } from './config';

const defaultWindowSize = {
    width: 1024,
    height: 800,
    maximized: false,
};

const defaultSettings: Settings = {
    'app-management.filter': '',
    'app-management.show': {
        installed: true,
        available: true,
    },
    'app-management.sources': {
        official: true,
        local: true,
    },
    lastWindowState: defaultWindowSize,
    shouldCheckForUpdatesAtStartup: true,
};

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
    const settings = parseJsonFile(getConfig().settingsJsonPath);
    if (settings && typeof settings === 'object') {
        return merge(defaultSettings, settings);
    }

    return defaultSettings;
};

const data = load();

const save = () => {
    fs.writeFileSync(getConfig().settingsJsonPath, JSON.stringify(data));
};

export const set = <Key extends keyof Settings>(
    key: Key,
    value: Settings[Key]
) => {
    data[key] = value;
    save();
};

export const get = <Key extends keyof Settings>(key: Key) => data[key];

export const addShownSource = (name: SourceName) => {
    const names = get('app-management.sources');
    delete names[name];
    set('app-management.sources', {
        ...names,
        [name]: true,
    });
};

export const removeShownSource = (name: SourceName) => {
    const names = get('app-management.sources');
    delete names[name];
    set('app-management.sources', names);
};
