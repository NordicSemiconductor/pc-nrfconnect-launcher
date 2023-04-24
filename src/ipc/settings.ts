/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Immutable } from 'immer';

import { handle, invoke } from './infrastructure/rendererToMain';

const channel = {
    get: 'setting:get',
};

export type Settings = Immutable<object>;

// Get
type GetSettings = () => Settings;

export const getSettings = invoke<GetSettings>(channel.get);
export const registerGetSettings = handle<GetSettings>(channel.get);
