/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { handle, invoke } from './infrastructure/rendererToMain';

const channel = {
    get: 'sources:get',
    add: 'sources:add',
    remove: 'sources:remove',
};

// Get
type GetSources = () => Record<string, string>;
export const invokeGetFromRenderer = invoke<GetSources>(channel.get);

export const registerGetHandlerFromMain = handle<GetSources>(channel.get);

// Add
type AddSource = (url: string) => string;
export const invokeAddFromRenderer = invoke<AddSource>(channel.add);

export const registerAddHandlerFromMain = handle<AddSource>(channel.add);

// Remove
type RemoveSource = (name: string) => void;
export const invokeRemoveFromRenderer = invoke<RemoveSource>(channel.remove);

export const registerRemoveHandlerFromMain = handle<RemoveSource>(
    channel.remove
);
