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

export const requestProxyLogin = mainToRenderer.send<RequestProxyLogin>(
    channel.request
);
export const registerRequestProxyLogin = mainToRenderer.on<RequestProxyLogin>(
    channel.request
);

// Answer Proxy Login Request
type AnswerProxyLoginRequest = (
    requestId: string,
    username?: string,
    password?: string
) => void;

export const answerProxyLoginRequest =
    rendererToMain.send<AnswerProxyLoginRequest>(channel.response);
export const registerAnswerProxyLoginRequest =
    rendererToMain.on<AnswerProxyLoginRequest>(channel.response);
