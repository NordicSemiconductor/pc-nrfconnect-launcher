/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */
import { send } from './infrastructure/mainToRenderer';
import { on } from './infrastructure/rendererToMain';

const channel = {
    onReload: 'on-reload',
    onReloadCleaned: 'on-reload-cleaned',
};

// Maybe it should respond before triggering the reload
// Or we can send a separate event when reload is ready
type OnReload = (browserId: number) => void;
export const onReload = send<OnReload>(channel.onReload);

type OnReloadCleaned = (browserId: string) => void;
export const registerOnReloadCleaned = on<OnReloadCleaned>(
    channel.onReloadCleaned
);
