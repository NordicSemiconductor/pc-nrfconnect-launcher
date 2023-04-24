/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Immutable } from 'immer';

import { handle, invoke, on, send } from './infrastructure/rendererToMain';
import { SourceName } from './sources';

const channel = {
    get: 'setting:get',
    showSource: 'setting:showSource',
    hideSource: 'setting:hideSource',
};

export type Settings = Immutable<{
    appFilter: {
        shownSources: Set<SourceName>;
    };
}>;

// Get
type GetSettings = () => Settings;

export const getSettings = invoke<GetSettings>(channel.get);
export const registerGetSettings = handle<GetSettings>(channel.get);

// Show source
type ShowSource = (sourceName: SourceName) => void;

export const showSource = send<ShowSource>(channel.showSource);
export const registerShowSource = on<ShowSource>(channel.showSource);

// Hide source
type HideSource = (sourceName: SourceName) => void;

export const hideSource = send<HideSource>(channel.hideSource);
export const registerHideSource = on<HideSource>(channel.hideSource);
