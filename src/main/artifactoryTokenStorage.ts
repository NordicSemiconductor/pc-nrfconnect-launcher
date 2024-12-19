/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { safeStorage } from 'electron';

import {
    getEncryptedArtifactoryToken,
    setEncryptedArtifactoryToken,
} from '../ipc/persistedStore';

export const retrieveToken = () => {
    const encryptedToken = getEncryptedArtifactoryToken();
    if (encryptedToken == null) return;

    if (!safeStorage.isEncryptionAvailable()) {
        throw new Error('Encryption not available');
    }

    return safeStorage.decryptString(Buffer.from(encryptedToken, 'base64'));
};

export const storeToken = (token: string) => {
    if (!safeStorage.isEncryptionAvailable()) {
        throw new Error('Encryption not available');
    }

    setEncryptedArtifactoryToken(
        safeStorage.encryptString(token).toString('base64')
    );
};
