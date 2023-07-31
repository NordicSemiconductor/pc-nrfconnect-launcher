/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    handle,
    invoke,
} from 'pc-nrfconnect-shared/ipc/infrastructure/rendererToMain';
import {
    allStandardSourceNames,
    LOCAL,
    OFFICIAL,
    Source,
    SourceName,
    SourceUrl,
} from 'pc-nrfconnect-shared/ipc/sources';

import type { DownloadableApp } from './apps';

export {
    allStandardSourceNames,
    LOCAL,
    OFFICIAL,
    type Source,
    type SourceName,
    type SourceUrl,
};

const channel = {
    get: 'sources:get',
    add: 'sources:add',
    remove: 'sources:remove',
};

// Get
type GetSources = () => Source[];

const getSources = invoke<GetSources>(channel.get);
const registerGetSources = handle<GetSources>(channel.get);

// Add
export type AddSourceError =
    | {
          type: 'error';
          errorType: 'Unable to retrieve source.json';
          message: string;
      }
    | {
          type: 'error';
          errorType: 'Official sources cannot be added';
      }
    | {
          type: 'error';
          errorType: 'Source already exists';
          existingSource: Source;
      };
export type AddSourceSuccess = {
    type: 'success';
    source: Source;
    apps: DownloadableApp[];
};
export type AddSourceResult = AddSourceSuccess | AddSourceError;

type AddSource = (url: SourceUrl) => AddSourceResult;

const addSource = invoke<AddSource>(channel.add);
const registerAddSource = handle<AddSource>(channel.add);

// Remove
type RemoveSource = (name: SourceName) => void;

const removeSource = invoke<RemoveSource>(channel.remove);
const registerRemoveSource = handle<RemoveSource>(channel.remove);

export const forRenderer = {
    registerAddSource,
    registerGetSources,
    registerRemoveSource,
};

export const inMain = {
    addSource,
    getSources,
    removeSource,
};
