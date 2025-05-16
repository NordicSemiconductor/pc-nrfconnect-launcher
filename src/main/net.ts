/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { net, session } from 'electron';
import fs from 'fs/promises';
import { z } from 'zod';

import { getUseChineseAppServer } from '../common/persistedStore';
import { urlWithDownloadApi } from '../common/sources';
import type { AppSpec } from '../ipc/apps';
import { TokenInformation } from '../ipc/artifactoryToken';
import { inRenderer as downloadProgress } from '../ipc/downloadProgress';
import { retrieveToken } from './artifactoryTokenStorage';
import describeError from './describeError';
import { handleLoginRequest } from './proxyLogins';

// Sharing electron-updater's session, so that proxy credentials (if required) only have to be sent once.
// It would be better to use autoUpdater.netSession, but I found no way to use that without breaking the tests.
export const sharedSession = () => session.fromPartition('electron-updater');

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

const isPublicUrl = (url: string) =>
    url.startsWith(
        'https://files.nordicsemi.com/ui/api/v1/download?isNativeBrowsing=false&repoKey=swtools&path=external/'
    );

const determineBearer = (url: string) => {
    if (!url.startsWith('https://files.nordicsemi.com/') || isPublicUrl(url))
        return;

    const tokenResult = retrieveToken();
    return tokenResult.type === 'Success' ? tokenResult.token : undefined;
};

type DownloadOptions = {
    app?: AppSpec;
    bearer?: string;
};

export const determineEffectiveUrl = (url: string) => {
    let effectiveUrl = urlWithDownloadApi(url);

    if (isPublicUrl(effectiveUrl) && getUseChineseAppServer()) {
        effectiveUrl = effectiveUrl.replace(
            '//files.nordicsemi.com/',
            '//files.nordicsemi.cn/'
        );
    }

    return effectiveUrl;
};

const isNordicArtifactoryUrl = (url: string) =>
    /^https?:\/\/files\.nordicsemi\.(com|cn)\//.test(url);

const shortNordicArtifactoryUrl = (url: string) => {
    const longArtifactoryUrlRegex =
        /^https:\/\/files\.nordicsemi\.(?<tld>com|cn)\/ui\/api\/v1\/download\?isNativeBrowsing=false&repoKey=(?<repo>[^&]+)&path=(?<path>.*)/;
    const match = url.match(longArtifactoryUrlRegex);

    if (match == null) return url;

    const {
        groups: { tld, repo, path },
    } = match as { groups: Record<string, string> };

    return `https://files.nordicsemi.${tld}/artifactory/${repo}/${path}`;
};

const getDownloadSize = async (url: string, bearer?: string) => {
    const effectiveUrl = isNordicArtifactoryUrl(url)
        ? shortNordicArtifactoryUrl(url)
        : url;

    try {
        const response = await sharedSession().fetch(effectiveUrl, {
            method: 'HEAD',
            headers:
                bearer != null ? { authorization: `Bearer ${bearer}` } : {},
        });

        const contentLength = response.headers.get('content-length');

        if (contentLength != null) {
            return Number(contentLength);
        }
    } catch (error) {
        // Ignore errors, e.g. because the server does not support HEAD requests, in this case we just cannot determine the download size
    }

    return undefined;
};

const withProgressReported = (
    response: Response,
    app: AppSpec,
    totalSize: number
) => {
    let progress = 0;
    const progressStream = new TransformStream({
        transform(chunk, controller) {
            progress += chunk.byteLength;

            if (totalSize != null)
                reportInstallProgress(app, progress, totalSize);

            controller.enqueue(chunk);
        },
    });
    const stream = response.body?.pipeThrough(progressStream);

    return new Response(stream);
};

const request = async (url: string, { bearer, app }: DownloadOptions = {}) => {
    await ensureNetworkIsInitialised();

    const effectiveUrl = determineEffectiveUrl(url);
    try {
        const effectiveBearer = bearer ?? determineBearer(effectiveUrl);

        const totalSize =
            app == null ? undefined : await getDownloadSize(url, bearer);

        const response = await sharedSession().fetch(effectiveUrl, {
            headers: {
                pragma: 'no-cache',
                ...(effectiveBearer != null
                    ? { authorization: `Bearer ${effectiveBearer}` }
                    : {}),
            },
        });

        if (!response.ok) {
            throw new Error(
                `Unable to download ${effectiveUrl}. Got status code ${response.status}`
            );
        }

        return app == null || totalSize == null
            ? response
            : withProgressReported(response, app, totalSize);
    } catch (error) {
        throw new Error(
            `Error when reading ${effectiveUrl}: ${describeError(error)}`
        );
    }
};

export const downloadToJson = async <T>(
    url: string,
    options?: DownloadOptions
) => <T>(await request(url, options)).json();

export const downloadToFile = async (
    url: string,
    filePath: string,
    options?: DownloadOptions
) => {
    const buffer = Buffer.from(
        await (await request(url, options)).arrayBuffer()
    );
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
            { bearer: token }
        )
    );

let networkIsInitialised = false;
const ensureNetworkIsInitialised = async () => {
    if (networkIsInitialised) return;

    await doNetworkRequestToCheckForProxyAuthentication();
    networkIsInitialised = true;
};

/* As described in https://github.com/electron/electron/issues/44249 the login
   event is not always emitted correctly to the electron app when using the
   fetch API. So we first do a request to a known location and if that
   requires a proxy login, request that from the user */
const doNetworkRequestToCheckForProxyAuthentication = () =>
    new Promise<void>((resolve, reject) => {
        const req = net.request({
            url: 'https://files.nordicsemi.com/api/system/ping',
            session: sharedSession(),
        });
        req.setHeader('pragma', 'no-cache');

        req.on('response', res => {
            res.on('data', () => {
                /* do nothing, handler is only needed to consume all data */
            });
            res.on('end', () => resolve());
            res.on('error', () => reject());
        });
        req.on('login', handleLoginRequest);
        req.on('error', () => reject());

        req.end();
    });
