/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { powerSaveBlocker } from 'electron';

import { handle, invoke, on, send } from './infrastructure/rendererToMain';

const channel = {
    start: 'prevent-sleep:start',
    end: 'prevent-sleep:end',
};

// Currently the functions to send these IPC messages are not called from
// anywhere, but we want to enable apps to prevent sleep, e.g.during long
// running operations. So this might change in the future.

// Start
type StartPreventingSleep = () => number;

export const invokeStartFromRenderer = invoke<StartPreventingSleep>(
    channel.start
);

export const registerStartHandlerFromMain = () =>
    handle<StartPreventingSleep>(channel.start)(() =>
        powerSaveBlocker.start('prevent-app-suspension')
    );

// End
type EndPreventingSleep = (id: number) => void;
export const sendEndFromRender = send<EndPreventingSleep>(channel.end);

export const registerEndHandlerFromMain = () =>
    on<EndPreventingSleep>(channel.end)(id => powerSaveBlocker.stop(id));
