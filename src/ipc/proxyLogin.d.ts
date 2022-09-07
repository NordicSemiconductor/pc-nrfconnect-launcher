/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { AuthInfo } from 'electron';

// Request Proxy Login
export const registerHandlerFromRenderer: (
    onProxyLogin: (requestId: string, authInfo: AuthInfo) => void
) => void;

export const sendFromMain: (requestId: string, authInfo: AuthInfo) => void;

// Respond to Proxy Login Request

export const registerHandlerFromMain: (
    onProxyLoginCredentials: (
        requestId: string,
        username?: string,
        password?: string
    ) => void
) => void;

export const sendFromRenderer: (
    requestId: string,
    username?: string,
    password?: string
) => void;
