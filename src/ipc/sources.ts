/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { DownloadableApp } from './apps';
import { handle, invoke } from './infrastructure/rendererToMain';

export enum StandardSourceNames {
    OFFICIAL = 'official',
    LOCAL = 'local',
}

export const { LOCAL, OFFICIAL } = StandardSourceNames;
export const allStandardSourceNames: SourceName[] = [OFFICIAL, LOCAL];

const channel = {
    get: 'sources:get',
    add: 'sources:add',
    remove: 'sources:remove',
};

export type SourceName = string;
export type SourceUrl = string;
export type Source = { name: SourceName; url: SourceUrl };

// Get
type GetSources = () => Source[];

export const getSources = invoke<GetSources>(channel.get);
export const registerGetSources = handle<GetSources>(channel.get);

// Add
type AddSource = (url: SourceUrl) => {
    source: Source;
    apps: DownloadableApp[];
};

export const addSource = invoke<AddSource>(channel.add);
export const registerAddSource = handle<AddSource>(channel.add);

// Remove
type RemoveSource = (name: SourceName) => void;

export const removeSource = invoke<RemoveSource>(channel.remove);
export const registerRemoveSource = handle<RemoveSource>(channel.remove);
