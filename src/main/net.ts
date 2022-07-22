/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { net, session } from 'electron';
import fs from 'fs-extra';

import { sendFromMain as sendDownloadProgress } from '../ipc/downloadProgress';
import { sendFromMain as requestProxyLogin } from '../ipc/proxyLogin';
import { storeProxyLoginRequest } from './proxyLogins';

// Using the same session name as electron-updater, so that proxy credentials
// (if required) only have to be sent once.
const NET_SESSION_NAME = 'electron-updater';

interface ProgressIdentifiers {
    name: string;
    source: string;
}

const reportInstallProgress = (
    { name, source }: ProgressIdentifiers,
    progress: number,
    totalInstallSize: number
) => {
    sendDownloadProgress({
        name,
        source,
        progressFraction: Math.floor((progress / totalInstallSize) * 100),
    });
};

type ErrorWithStatusCode = Error & { statusCode?: number };

interface DownloadResult {
    buffer: Buffer;
    etag?: string;
    statusCode: number;
}

const downloadToBuffer = (
    url: string,
    enableProxyLogin: boolean,
    headers: Record<string, string> = {},
    progressIdentifiers: ProgressIdentifiers | undefined = undefined
) =>
    new Promise<DownloadResult>((resolve, reject) => {
        const request = net.request({
            url,
            session: session.fromPartition(NET_SESSION_NAME),
        });
        request.setHeader('pragma', 'no-cache');
        Object.keys(headers).forEach(key =>
            request.setHeader(key, headers[key])
        );

        request.on('response', response => {
            const { statusCode } = response;
            if (statusCode >= 400) {
                const error: ErrorWithStatusCode = new Error(
                    `Unable to download ${url}. Got status code ${statusCode}`
                );
                error.statusCode = statusCode;
                // https://github.com/electron/electron/issues/24948
                response.on('error', () => {});
                reject(error);
                return;
            }
            const etag = Array.isArray(response.headers.etag)
                ? response.headers.etag[0]
                : undefined;

            const buffer: Buffer[] = [];
            const addToBuffer = (data: Buffer) => {
                buffer.push(data);
            };
            const downloadSize = Number(response.headers['content-length']);
            let progress = 0;
            response.on('data', data => {
                addToBuffer(data);
                progress += data.length;
                if (progressIdentifiers)
                    reportInstallProgress(
                        progressIdentifiers,
                        progress,
                        downloadSize
                    );
            });
            response.on('end', () =>
                resolve({
                    buffer: Buffer.concat(buffer),
                    etag,
                    statusCode,
                })
            );
            response.on('error', (error: Error) =>
                reject(new Error(`Error when reading ${url}: ${error.message}`))
            );
        });
        if (enableProxyLogin) {
            request.on('login', (authInfo, callback) => {
                const requestId = storeProxyLoginRequest(callback);
                requestProxyLogin(requestId, authInfo);
            });
        }
        request.on('error', error =>
            reject(new Error(`Unable to download ${url}: ${error.message}`))
        );
        request.end();
    });

/*
 * Download the given url to a string. If a previous etag is provided, then
 * use that in the request.
 *
 * If the server returns a 304 (not modified), return null as response.
 * If the server did not provide an Etag, then property etag will be undefined.
 */
export const downloadToStringIfChanged = async (
    url: string,
    previousEtag?: string
) => {
    const requestHeaders: Record<string, string> =
        previousEtag == null ? {} : { 'If-None-Match': previousEtag };

    const { buffer, etag, statusCode } = await downloadToBuffer(
        url,
        false,
        requestHeaders
    );

    const NOT_MODIFIED = 304;
    return {
        etag,
        response: statusCode === NOT_MODIFIED ? null : buffer.toString(),
    };
};

export const downloadToJson = async (
    url: string,
    enableProxyLogin: boolean
) => {
    const { buffer } = await downloadToBuffer(url, enableProxyLogin);
    return JSON.parse(buffer.toString());
};

export const downloadToFile = async (
    url: string,
    filePath: string,
    enableProxyLogin: boolean,
    progressIdentifiers: ProgressIdentifiers | undefined
) => {
    const { buffer } = await downloadToBuffer(
        url,
        enableProxyLogin,
        undefined,
        progressIdentifiers
    );
    await fs.writeFile(filePath, buffer);
};

/*
 * Does this error mean, that a resource was not found on the server?
 */
export const isResourceNotFound = (error: { statusCode?: number }) =>
    error.statusCode === 404;
