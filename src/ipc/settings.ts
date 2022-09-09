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

// Get
type GetSetting = (settingKey: string, defaultValue?: unknown) => unknown;

export const getSetting = invoke<GetSetting>(channel.get);
export const registerGetSetting = handle<GetSetting>(channel.get);

// Set
type SetSetting = (key: string, value: unknown) => unknown;

export const setSetting = send<SetSetting>(channel.set);
export const registerSetSetting = on<SetSetting>(channel.set);
