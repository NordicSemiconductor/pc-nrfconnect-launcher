/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */
import type {
    AutoDetectTypes,
    SetOptions,
    UpdateOptions,
} from '@serialport/bindings-cpp';
import {
    OverwriteOptions,
    SERIALPORT_CHANNEL,
} from 'pc-nrfconnect-shared/main';
import { SerialPortOpenOptions } from 'serialport';

import {
    handle,
    handleWithSender,
    invoke,
} from './infrastructure/rendererToMain';

const channel = {
    open: SERIALPORT_CHANNEL.OPEN,
    close: SERIALPORT_CHANNEL.CLOSE,
    write: SERIALPORT_CHANNEL.WRITE,
    isOpen: SERIALPORT_CHANNEL.IS_OPEN,
    // @ts-expect-error --Will be included in the next version of shared.
    getOptions: SERIALPORT_CHANNEL.GET_OPTIONS ?? 'serialport:get-options',
    update: SERIALPORT_CHANNEL.UPDATE,
    set: SERIALPORT_CHANNEL.SET,
};

type Open = (
    options: SerialPortOpenOptions<AutoDetectTypes>,
    overwriteOptions: OverwriteOptions
) => void;
export const open = invoke<Open>(channel.open);
export const registerOpen = handleWithSender<Open>(channel.open);

type Close = (path: string) => void;
export const close = invoke<Close>(channel.close);
export const registerClose = handleWithSender<Close>(channel.close);

type Write = (path: string, data: string) => void;
export const write = invoke<Write>(channel.write);
export const registerWrite = handle<Write>(channel.write);

type IsOpen = (path: string) => boolean;
export const isOpen = invoke<IsOpen>(channel.isOpen);
export const registerIsOpen = handle<IsOpen>(channel.isOpen);

type GetOptions = (
    path: string
) => SerialPortOpenOptions<AutoDetectTypes> | undefined;
export const getOptions = invoke<GetOptions>(channel.getOptions);
export const registerGetOptions = handle<GetOptions>(channel.getOptions);

type Update = (path: string, options: UpdateOptions) => void;
export const update = invoke<Update>(channel.update);
export const registerUpdate = handle<Update>(channel.update);

type Set = (path: string, set: SetOptions) => void;
export const set = invoke<Set>(channel.set);
export const registerSet = handle<Set>(channel.set);
