/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    handle,
    invoke,
} from '@nordicsemiconductor/pc-nrfconnect-shared/ipc/infrastructure/rendererToMain';

const channel = {
    getInformation: 'artifactory-token:get-information',
    set: 'artifactory-token:set',
    remove: 'artifactory-token:remove',
};

export type TokenInformation = {
    token_id: string;
    expiry?: number; // seconds since epoch
    description?: string;
};

// GetInformation
type GetTokenInformation = () =>
    | { type: 'No token set' }
    | { type: 'Encryption not available' }
    | { type: 'Success'; information: TokenInformation };

const getTokenInformation = invoke<GetTokenInformation>(channel.getInformation);
const registerGetTokenInformation = handle<GetTokenInformation>(
    channel.getInformation
);

// Set
type SetToken = (token: string) => TokenInformation;

const setToken = invoke<SetToken>(channel.set);
const registerSetToken = handle<SetToken>(channel.set);

// Remove
type RemoveToken = () => void;

const removeToken = invoke<RemoveToken>(channel.remove);
const registerRemoveToken = handle<RemoveToken>(channel.remove);

export const forRenderer = {
    registerGetTokenInformation,
    registerSetToken,
    registerRemoveToken,
};

export const inMain = {
    getTokenInformation,
    setToken,
    removeToken,
};
