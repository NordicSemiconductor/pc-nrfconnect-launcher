/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { net, session } from 'electron';
import fs from 'fs-extra';
import { z } from 'zod';

import type { AppSpec } from '../ipc/apps';
import { TokenInformation } from '../ipc/artifactoryToken';
import { inRenderer as downloadProgress } from '../ipc/downloadProgress';
import { inRenderer as proxyLogin } from '../ipc/proxyLogin';
import { retrieveToken } from './artifactoryTokenStorage';
import { storeProxyLoginRequest } from './proxyLogins';

// Using the same session name as electron-updater, so that proxy credentials
// (if required) only have to be sent once.
const NET_SESSION_NAME = 'electron-updater';

const reportInstallProgress = (
    app: AppSpec,
    progress: number,
    totalInstallSize: number
) => {
    downloadProgress.reportDownloadProgress({
        app,
        progressFraction: Math.floor((progress / totalInstallSize) * 100),
        fractionName: 'tarBall',
    });
};

const determineBearer = (url: string) =>
    url.startsWith('https://files.nordicsemi.com/')
        ? retrieveToken()
        : undefined;

export type NetError = Error & { statusCode?: number };

const downloadToBuffer = (
    url: string,
    enableProxyLogin: boolean,
    app: AppSpec | undefined = undefined,
    bearer = determineBearer(url)
) =>
    new Promise<Buffer>((resolve, reject) => {
        const request = net.request({
            url,
            session: session.fromPartition(NET_SESSION_NAME),
        });
        request.setHeader('pragma', 'no-cache');
        if (bearer) {
            request.setHeader('Authorization', `Bearer ${bearer}`);
        }

        request.on('response', response => {
            const { statusCode } = response;
            if (statusCode >= 400) {
                const error: NetError = new Error(
                    `Unable to download ${url}. Got status code ${statusCode}`
                );
                error.statusCode = statusCode;
                // https://github.com/electron/electron/issues/24948
                response.on('error', () => {});
                reject(error);
                return;
            }

            const buffer: Buffer[] = [];
            const addToBuffer = (data: Buffer) => {
                buffer.push(data);
            };
            const downloadSize = Number(response.headers['content-length']);
            let progress = 0;
            response.on('data', data => {
                addToBuffer(data);
                progress += data.length;
                if (app) {
                    reportInstallProgress(app, progress, downloadSize);
                }
            });
            response.on('end', () => resolve(Buffer.concat(buffer)));
            response.on('error', (error: Error) =>
                reject(new Error(`Error when reading ${url}: ${error.message}`))
            );
        });
        if (enableProxyLogin) {
            request.on('login', (authInfo, callback) => {
                if (
                    authInfo.isProxy === false &&
                    authInfo.host === 'files.nordicsemi.com'
                ) {
                    callback();
                    return;
                }

                const requestId = storeProxyLoginRequest(callback);
                proxyLogin.requestProxyLogin(requestId, authInfo);
            });
        }
        request.on('error', error =>
            reject(new Error(`Unable to download ${url}: ${error.message}`))
        );
        request.end();
    });

export const downloadToJson = async <T>(
    url: string,
    enableProxyLogin: boolean,
    bearer?: string
) =>
    <T>(
        JSON.parse(
            (
                await downloadToBuffer(url, enableProxyLogin, undefined, bearer)
            ).toString()
        )
    );

export const downloadToFile = async (
    url: string,
    filePath: string,
    enableProxyLogin: boolean | undefined = false,
    app: AppSpec | undefined = undefined
) => {
    const buffer = await downloadToBuffer(url, enableProxyLogin, app);
    await fs.writeFile(filePath, buffer);
};

const tokenInformationSchema = z.object({
    token_id: z.string(),
    expiry: z.number().optional().describe('In seconds since epoch'),
    description: z.string().optional(),
});

export const getArtifactoryTokenInformation = async (token: string) =>
    tokenInformationSchema.parse(
        await downloadToJson<TokenInformation>(
            'https://files.nordicsemi.com/access/api/v1/tokens/me',
            true,
            token
        )
    );
