/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { TokenInformation } from '../ipc/artifactoryToken';
import { removeEncryptedArtifactoryToken } from '../ipc/persistedStore';
import { retrieveToken, storeToken } from './artifactoryTokenStorage';
import { getArtifactoryTokenInformation } from './net';

export const getTokenInformation = () => {
    const token = retrieveToken();
    if (token == null) return;

    return getArtifactoryTokenInformation(token);
};

export const setToken = async (token: string): Promise<TokenInformation> => {
    const tokenInformation = await getArtifactoryTokenInformation(token);

    storeToken(token);

    return tokenInformation;
};

export const removeToken = removeEncryptedArtifactoryToken;
