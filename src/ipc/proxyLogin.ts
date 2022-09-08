/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { AuthInfo } from 'electron';

import * as mainToRenderer from './infrastructure/mainToRenderer';
import * as rendererToMain from './infrastructure/rendererToMain';

const channel = {
    request: 'proxy-login:request',
    response: 'proxy-login:response',
};

// Request Proxy Login

type RequestProxyLogin = (requestId: string, authInfo: AuthInfo) => void;

export const sendFromMain = mainToRenderer.send<RequestProxyLogin>(
    channel.request
);

export const registerHandlerFromRenderer =
    mainToRenderer.registerSent<RequestProxyLogin>(channel.request);

// Respond to Proxy Login Request
type RespondToProxyLoginRequest = (
    requestId: string,
    username?: string,
    password?: string
) => void;

export const sendFromRenderer = rendererToMain.send<RespondToProxyLoginRequest>(
    channel.response
);

export const registerHandlerFromMain =
    rendererToMain.registerSent<RespondToProxyLoginRequest>(channel.response);
