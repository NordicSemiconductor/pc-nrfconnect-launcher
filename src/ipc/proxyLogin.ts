/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { AuthInfo } from 'electron';
import * as mainToRenderer from 'pc-nrfconnect-shared/ipc/infrastructure/mainToRenderer';
import * as rendererToMain from 'pc-nrfconnect-shared/ipc/infrastructure/rendererToMain';

const channel = {
    request: 'proxy-login:request',
    response: 'proxy-login:response',
};

// Request Proxy Login

type RequestProxyLogin = (requestId: string, authInfo: AuthInfo) => void;

const requestProxyLogin = mainToRenderer.send<RequestProxyLogin>(
    channel.request
);
const registerRequestProxyLogin = mainToRenderer.on<RequestProxyLogin>(
    channel.request
);

// Answer Proxy Login Request
type AnswerProxyLoginRequest = (
    requestId: string,
    username?: string,
    password?: string
) => void;

const answerProxyLoginRequest = rendererToMain.send<AnswerProxyLoginRequest>(
    channel.response
);
const registerAnswerProxyLoginRequest =
    rendererToMain.on<AnswerProxyLoginRequest>(channel.response);

export const inRenderer = { requestProxyLogin };
export const forRenderer = { registerAnswerProxyLoginRequest };
export const inMain = { answerProxyLoginRequest };
export const forMain = { registerRequestProxyLogin };
