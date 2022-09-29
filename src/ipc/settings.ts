/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { handle, invoke, on, send } from './infrastructure/rendererToMain';

const channel = {
    get: 'setting:get',
    set: 'setting:set',
};

export type WindowState = {
    x?: number;
    y?: number;
    width: number;
    height: number;
    maximized: boolean;
};

export type Settings = {
    'app-management.filter': string;
    'app-management.show': {
        installed: boolean;
        available: boolean;
    };
    'app-management.sources': Record<string, boolean>;
    lastWindowState: WindowState;
    shouldCheckForUpdatesAtStartup: boolean;
};

// Get
type GetSetting = <Key extends keyof Settings>(
    settingKey: Key
) => Settings[Key];

export const getSetting = invoke<GetSetting>(channel.get);
export const registerGetSetting = handle<GetSetting>(channel.get);

// Set
type SetSetting = <Key extends keyof Settings>(
    key: Key,
    value: Settings[Key]
) => void;

export const setSetting = send<SetSetting>(channel.set);
export const registerSetSetting = on<SetSetting>(channel.set);
