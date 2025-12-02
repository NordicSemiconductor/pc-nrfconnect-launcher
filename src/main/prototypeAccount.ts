/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { net } from 'electron';
import { z } from 'zod';

import { removeEncryptedArtifactoryToken } from '../common/persistedStore';
import type { PrototypeAccountInformation } from '../ipc/prototypeAccount';
import { retrieveToken, storeToken } from './artifactoryTokenStorage';
import { getArtifactoryTokenInformation } from './net';

export const getTokenInformation = async () => {
    // const tokenResult = retrieveToken();
    // if (tokenResult.type !== 'Success') return tokenResult;
    // return {
    //     type: 'Success',
    //     information: await getArtifactoryTokenInformation(tokenResult.token),
    // } as const;
};

export const logIn = (): Promise<PrototypeAccountInformation> => {
    const {
        CENS_LOGIN_URL,
        CENS_GRANT_TYPE,
        CENS_CLIENT_ID,
        CENS_CLIENT_SECRET,
        CENS_SCOPE,
        CENS_USERNAME,
        CENS_PASSWORD,
    } = process.env;

    if (
        !CENS_LOGIN_URL ||
        !CENS_GRANT_TYPE ||
        !CENS_CLIENT_ID ||
        !CENS_CLIENT_SECRET ||
        !CENS_SCOPE ||
        !CENS_USERNAME ||
        !CENS_PASSWORD
    ) {
        throw new Error('Env variable must be set');
    }

    const request = net.request({
        // url: CENS_LOGIN_URL,
        url:
            `${CENS_LOGIN_URL}` +
            `?grant_type=${encodeURIComponent(CENS_GRANT_TYPE)}` +
            `&client_id=${encodeURIComponent(CENS_CLIENT_ID)}` +
            `&client_secret=${encodeURIComponent(CENS_CLIENT_SECRET)}` +
            `&scope=${encodeURIComponent(CENS_SCOPE)}` +
            `&username=${encodeURIComponent(CENS_USERNAME)}` +
            `&password=${encodeURIComponent(CENS_PASSWORD)}`,
        method: 'GET',
        // headers: { contentType: 'application/x-www-form-urlencoded' },
    });
    // request.end();
    request.end(
        `grant_type=${encodeURIComponent(CENS_GRANT_TYPE)}` +
            `&client_id=${encodeURIComponent(CENS_CLIENT_ID)}` +
            `&client_secret=${encodeURIComponent(CENS_CLIENT_SECRET)}` +
            `&scope=${encodeURIComponent(CENS_SCOPE)}` +
            `&username=${encodeURIComponent(CENS_USERNAME)}` +
            `&password=${encodeURIComponent(CENS_PASSWORD)}`,
    );

    return new Promise<PrototypeAccountInformation>((resolve, reject) => {
        request.on('response', response => {
            if (response.statusCode >= 400) {
                reject(
                    new Error(
                        `Failed to log in to CENS. Status code: ${response.statusCode}`,
                    ),
                );
            }
            response.on('data', chunk => {
                // console.log('XXX start');
                // console.log(chunk);
                // console.log(JSON.parse(chunk.toString()).access_token);
                // console.log(
                //     JSON.parse(
                //         atob(
                //             JSON.parse(chunk.toString()).access_token.split(
                //                 '.',
                //             )[1],
                //         ),
                //     ),
                // );

                const accessToken = JSON.parse(chunk.toString()).access_token;
                const { exp, name } = JSON.parse(
                    atob(accessToken.split('.')[1]),
                );

                console.log(accessToken);
                // console.log({ expires: new Date(exp * 1000), name });

                // console.log('XXX end');

                // storeToken(token);

                resolve({ expires: new Date(exp * 1000), name });
            });

            // response.on('end', () => {
            //     console.log('No more data in response.');
            // });
        });
    });

    // const response = await fetch(
    //     new URL(
    //         `${CENS_LOGIN_URL}?${new URLSearchParams({
    //             grant_type: encodeURIComponent(CENS_GRANT_TYPE),
    //             client_id: encodeURIComponent(CENS_CLIENT_ID),
    //             client_secret: encodeURIComponent(CENS_CLIENT_SECRET),
    //             scope: encodeURIComponent(CENS_SCOPE),
    //             username: encodeURIComponent(CENS_USERNAME),
    //             password: encodeURIComponent(CENS_PASSWORD),
    //         }).toString()}`,
    //     ),
    // );

    // const x = await response.json();
    // console.log(x);
    // const tokenInformation = await getArtifactoryTokenInformation(token);

    // storeToken(token);
};
