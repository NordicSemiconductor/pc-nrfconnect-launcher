/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { net, session } from 'electron';
import fs from 'fs-extra';

import type { AppSpec } from '../ipc/apps';
import { inRenderer as downloadProgress } from '../ipc/downloadProgress';
import { inRenderer as proxyLogin } from '../ipc/proxyLogin';
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
        key: 'tarBall',
    });
};

export type NetError = Error & { statusCode?: number };

const downloadToBuffer = (
    url: string,
    enableProxyLogin: boolean,
    app: AppSpec | undefined = undefined
) =>
    new Promise<Buffer>((resolve, reject) => {
        const request = net.request({
            url,
            session: session.fromPartition(NET_SESSION_NAME),
        });
        request.setHeader('pragma', 'no-cache');

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
    enableProxyLogin: boolean
) => <T>JSON.parse((await downloadToBuffer(url, enableProxyLogin)).toString());

export const downloadToFile = async (
    url: string,
    filePath: string,
    enableProxyLogin: boolean | undefined = false,
    app: AppSpec | undefined = undefined
) => {
    const buffer = await downloadToBuffer(url, enableProxyLogin, app);
    await fs.writeFile(filePath, buffer);
};
