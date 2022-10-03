/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Immutable } from 'immer';

import { handle, invoke, on, send } from './infrastructure/rendererToMain';
import { SourceName } from './sources';

const channel = {
    reset: 'setting:reset',
    get: 'setting:get',
    showSource: 'setting:showSource',
    hideSource: 'setting:hideSource',
    setShownStates: 'setting:setShownStates',
    setNameFilter: 'setting:setNameFilter',
    setCheckUpdatesAtStartup: 'setting:setCheckUpdatesAtStartup',
};

export type WindowState = {
    x?: number;
    y?: number;
    width: number;
    height: number;
    maximized: boolean;
};

export type ShownStates = {
    installed: boolean;
    available: boolean;
};

export type Settings = Immutable<{
    appFilter: {
        sources: Record<SourceName, boolean>;
        nameFilter: string;
        shownStates: ShownStates;
    };
    lastWindowState: WindowState;
    shouldCheckForUpdatesAtStartup: boolean;
}>;

// Reset
type ResetSettings = () => void;

export const resetSettings = invoke<ResetSettings>(channel.reset);
export const registerResetSettings = handle<ResetSettings>(channel.reset);

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

// Set shown states
type SetShownStates = (shownStates: Partial<ShownStates>) => void;

export const setShownStates = send<SetShownStates>(channel.setShownStates);
export const registerSetShownStates = on<SetShownStates>(
    channel.setShownStates
);

// Set name filter
type SetNameFilter = (nameFilter: string) => void;

export const setNameFilter = send<SetNameFilter>(channel.setNameFilter);
export const registerSetNameFilter = on<SetNameFilter>(channel.setNameFilter);

// Set check updates at startup
type SetCheckUpdatesAtStartup = (isEnabled: boolean) => void;

export const setCheckUpdatesAtStartup = send<SetCheckUpdatesAtStartup>(
    channel.setCheckUpdatesAtStartup
);
export const registerSetCheckUpdatesAtStartup = on<SetCheckUpdatesAtStartup>(
    channel.setCheckUpdatesAtStartup
);
