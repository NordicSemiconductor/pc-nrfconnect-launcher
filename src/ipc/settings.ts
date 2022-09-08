/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import * as rendererToMain from './infrastructure/rendererToMain';

const channel = {
    get: 'setting:get',
    set: 'setting:set',
};

// Get
type GetSetting = (settingKey: string, defaultValue?: unknown) => unknown;

export const invokeGetFromRenderer = rendererToMain.invoke<GetSetting>(
    channel.get
);

export const registerGetHandlerFromMain =
    rendererToMain.registerInvoked<GetSetting>(channel.get);

// Set
type SetSetting = (key: string, value: unknown) => unknown;

export const sendSetFromRenderer = rendererToMain.send<SetSetting>(channel.set);

export const registerSetHandlerFromMain =
    rendererToMain.registerSent<SetSetting>(channel.set);
