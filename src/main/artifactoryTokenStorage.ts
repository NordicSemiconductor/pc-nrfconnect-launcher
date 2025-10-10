/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { safeStorage } from 'electron';

import {
    getEncryptedArtifactoryToken,
    setEncryptedArtifactoryToken,
} from '../common/persistedStore';

export type RetrieveTokenResult =
    | { type: 'No token set' }
    | { type: 'Encryption not available' }
    | { type: 'Success'; token: string };

export const retrieveToken = (): RetrieveTokenResult => {
    const encryptedToken = getEncryptedArtifactoryToken();
    if (encryptedToken == null) return { type: 'No token set' };

    if (!safeStorage.isEncryptionAvailable())
        return { type: 'Encryption not available' };

    return {
        type: 'Success',
        token: safeStorage.decryptString(Buffer.from(encryptedToken, 'base64')),
    };
};

export const storeToken = (token: string) => {
    if (!safeStorage.isEncryptionAvailable()) {
        throw new Error('Encryption not available');
    }

    setEncryptedArtifactoryToken(
        safeStorage.encryptString(token).toString('base64'),
    );
};
