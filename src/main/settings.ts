/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import fs from 'fs';
import type { Draft } from 'immer';
import merge from 'lodash.merge';

import type { Settings, ShownStates, WindowState } from '../ipc/settings';
import type { SourceName } from '../ipc/sources';
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
        return merge({}, defaultSettings, settings);
    }

    return merge({}, defaultSettings);
};

let data: Draft<Settings> = load();

const save = () => {
    fs.writeFileSync(getConfig().settingsJsonPath, JSON.stringify(data));
};

export const resetSettings = () => {
    data = merge({}, defaultSettings);
    save();
};

export const get = () => data as Settings;

export const addShownSource = (name: SourceName) => {
    data['app-management.sources'][name] = true;
    save();
};

export const removeShownSource = (name: SourceName) => {
    delete data['app-management.sources'][name];
    save();
};

export const setNameFilter = (nameFilter: string) => {
    data['app-management.filter'] = nameFilter;
    save();
};

export const setShownStates = (shownStates: Partial<ShownStates>) => {
    data['app-management.show'] = {
        ...data['app-management.show'],
        ...shownStates,
    };
    save();
};

export const setCheckUpdatesAtStartup = (isEnabled: boolean) => {
    data.shouldCheckForUpdatesAtStartup = isEnabled;
    save();
};

export const setLastWindowState = (windowState: WindowState) => {
    data.lastWindowState = { ...windowState };
    save();
};
