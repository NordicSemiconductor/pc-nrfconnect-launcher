/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    handle,
    invoke,
} from '@nordicsemiconductor/pc-nrfconnect-shared/ipc/infrastructure/rendererToMain';

const channel = {
    logIn: 'prototype-account:log-in',
};

export type PrototypeAccountInformation = {
    name: string;
    expires: Date;
};

// // Log in
type LogIn = () => PrototypeAccountInformation;

const logIn = invoke<LogIn>(channel.logIn);
const registerLogIn = handle<LogIn>(channel.logIn);

export const forRenderer = {
    registerLogIn,
};

export const inMain = {
    logIn,
};
