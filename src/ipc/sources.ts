/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import * as rendererToMain from './infrastructure/rendererToMain';

const channel = {
    get: 'sources:get',
    add: 'sources:add',
    remove: 'sources:remove',
};

// Get
type GetSources = () => Record<string, string>;
export const invokeGetFromRenderer = rendererToMain.invoke<GetSources>(
    channel.get
);

export const registerGetHandlerFromMain = rendererToMain.handle<GetSources>(
    channel.get
);

// Add
type AddSource = (url: string) => string;
export const invokeAddFromRenderer = rendererToMain.invoke<AddSource>(
    channel.add
);

export const registerAddHandlerFromMain = rendererToMain.handle<AddSource>(
    channel.add
);

// Remove
type RemoveSource = (name: string) => void;
export const invokeRemoveFromRenderer = rendererToMain.invoke<RemoveSource>(
    channel.remove
);

export const registerRemoveHandlerFromMain =
    rendererToMain.handle<RemoveSource>(channel.remove);
