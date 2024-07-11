/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    NrfutilModuleName,
    NrfutilModules,
    NrfutilModuleVersion,
} from '@nordicsemiconductor/pc-nrfconnect-shared/main';
import { Progress } from '@nordicsemiconductor/pc-nrfconnect-shared/nrfutil';
import { setNrfutilLogger } from '@nordicsemiconductor/pc-nrfconnect-shared/nrfutil/nrfutilLogger';
import getSandbox, {
    NrfutilSandbox,
} from '@nordicsemiconductor/pc-nrfconnect-shared/nrfutil/sandbox';

import { AppSpec } from '../ipc/apps';
import { inRenderer as downloadProgress } from '../ipc/downloadProgress';
import { getUserDataDir } from './config';
import { logger } from './log';

type SandboxesCacheKeyType = `${NrfutilModuleName}-${NrfutilModuleVersion}`;
type SandboxesCacheType = {
    sandbox?: Promise<NrfutilSandbox>;
    progressCallbacks: ((progress: Progress) => void)[];
    lastProgress?: Progress;
};
const sandboxesCache: {
    [index: SandboxesCacheKeyType]: SandboxesCacheType;
} = {};

const cachedSandbox = (
    app: AppSpec,
    moduleName: string,
    moduleVersion: NrfutilModuleVersion
) => {
    const cached = sandboxesCache[`${moduleName}-${moduleVersion}`];

    if (cached) {
        const progressCallback = (progress: Progress) => {
            downloadProgress.reportDownloadProgress({
                app,
                progressFraction: progress.totalProgressPercentage,
                fractionName: moduleName,
            });
        };

        if (cached.lastProgress) {
            progressCallback(cached.lastProgress);
        }

        cached.progressCallbacks.push(progressCallback);
        return cached.sandbox;
    }
};

const preparedSandbox = (
    app: AppSpec,
    moduleName: string,
    moduleVersion: NrfutilModuleVersion
) => {
    setNrfutilLogger(logger);

    const key: SandboxesCacheKeyType = `${moduleName}-${moduleVersion}`;
    sandboxesCache[key] = {
        progressCallbacks: [
            progress => {
                downloadProgress.reportDownloadProgress({
                    app,
                    progressFraction: progress.totalProgressPercentage,
                    fractionName: moduleName,
                });
            },
        ],
    };

    const sandbox = getSandbox(
        getUserDataDir(),
        moduleName,
        moduleVersion,
        progress => {
            if (sandboxesCache[key]) {
                sandboxesCache[key].progressCallbacks.forEach(fn =>
                    fn(progress)
                );
                sandboxesCache[key].lastProgress = progress;
            }
        }
    );

    sandbox.finally(() => delete sandboxesCache[key]);
    sandboxesCache[key].sandbox = sandbox;

    return sandbox;
};
export const assertPreparedNrfutilModules = (
    app: AppSpec,
    nrfutilModules: NrfutilModules = {}
) =>
    Object.entries(nrfutilModules).map(
        ([moduleName, [moduleVersion]]) =>
            cachedSandbox(app, moduleName, moduleVersion) ??
            preparedSandbox(app, moduleName, moduleVersion)
    );
