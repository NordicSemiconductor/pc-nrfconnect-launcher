/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import * as mainToRenderer from '@nordicsemiconductor/pc-nrfconnect-shared/ipc/infrastructure/mainToRenderer';
import * as rendererToMain from '@nordicsemiconductor/pc-nrfconnect-shared/ipc/infrastructure/rendererToMain';
import { AuthInfo } from 'electron';

const channel = {
    request: 'proxy-login:request',
    response: 'proxy-login:response',
};

// Request Proxy Login

type RequestProxyLogin = (requestId: string, authInfo: AuthInfo) => void;

const requestProxyLogin = mainToRenderer.send<RequestProxyLogin>(
    channel.request,
);
const registerRequestProxyLogin = mainToRenderer.on<RequestProxyLogin>(
    channel.request,
);

// Answer Proxy Login Request
type AnswerProxyLoginRequest = (
    requestId: string,
    host: string,
    username?: string,
    password?: string,
) => void;

const answerProxyLoginRequest = rendererToMain.send<AnswerProxyLoginRequest>(
    channel.response,
);
const registerAnswerProxyLoginRequest =
    rendererToMain.on<AnswerProxyLoginRequest>(channel.response);

export const inRenderer = { requestProxyLogin };
export const forRenderer = { registerAnswerProxyLoginRequest };
export const inMain = { answerProxyLoginRequest };
export const forMain = { registerRequestProxyLogin };
