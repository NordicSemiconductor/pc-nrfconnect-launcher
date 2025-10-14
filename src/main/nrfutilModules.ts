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
import {
    NrfutilSandbox,
    Progress,
} from '@nordicsemiconductor/pc-nrfconnect-shared/nrfutil';
import { setNrfutilLogger } from '@nordicsemiconductor/pc-nrfconnect-shared/nrfutil/nrfutilLogger';

import { inRenderer as appInstallProgress } from '../ipc/appInstallProgress';
import { AppSpec } from '../ipc/apps';
import { getUserDataPath } from './config';
import { logger } from './log';

type SandboxesCacheKeyType =
    `${NrfutilModuleName}-${NrfutilModuleVersion}-${NrfutilModuleVersion}`;
const cacheKey = (
    moduleName: string,
    moduleVersion: string,
    nrfutilCore: NrfutilModuleVersion = 'unspecified',
) => `${moduleName}-${moduleVersion}-${nrfutilCore}` as const;

type SandboxesCacheType = {
    promisedSandbox?: Promise<NrfutilSandbox>;
    progressCallbacks: ((progress: Progress) => void)[];
    lastProgress?: Progress;
};

const sandboxesCache = new Map<SandboxesCacheKeyType, SandboxesCacheType>();

const cachedSandbox = (
    app: AppSpec,
    moduleName: string,
    moduleVersion: NrfutilModuleVersion,
    nrfutilCore?: NrfutilModuleVersion,
) => {
    const cached = sandboxesCache.get(
        cacheKey(moduleName, moduleVersion, nrfutilCore),
    );

    if (cached) {
        const progressCallback = (progress: Progress) => {
            appInstallProgress.reportAppInstallProgress({
                app,
                progressFraction: progress.totalProgressPercentage,
                fractionName: moduleName,
            });
        };

        if (cached.lastProgress) {
            progressCallback(cached.lastProgress);
        }

        cached.progressCallbacks.push(progressCallback);
        return cached.promisedSandbox;
    }
};

const preparedSandbox = (
    app: AppSpec,
    moduleName: string,
    moduleVersion: NrfutilModuleVersion,
    nrfutilCore?: NrfutilModuleVersion,
) => {
    setNrfutilLogger(logger);

    const key: SandboxesCacheKeyType = cacheKey(
        moduleName,
        moduleVersion,
        nrfutilCore,
    );

    const cached: SandboxesCacheType = {
        progressCallbacks: [
            progress => {
                appInstallProgress.reportAppInstallProgress({
                    app,
                    progressFraction: progress.totalProgressPercentage,
                    fractionName: moduleName,
                });
            },
        ],
    };

    sandboxesCache.set(key, cached);

    const promisedSandbox = NrfutilSandbox.create(
        getUserDataPath(),
        moduleName,
        moduleVersion,
        nrfutilCore,
        progress => {
            if (sandboxesCache.has(key)) {
                cached.progressCallbacks.forEach(fn => fn(progress));
                cached.lastProgress = progress;
            }
        },
    );

    promisedSandbox.finally(() => sandboxesCache.delete(key));
    cached.promisedSandbox = promisedSandbox;

    return promisedSandbox;
};
export const assertPreparedNrfutilModules = (
    app: AppSpec,
    nrfutilModules: NrfutilModules = {},
    nrfutilCore: NrfutilModuleVersion | undefined = undefined,
) =>
    Object.entries(nrfutilModules).map(
        ([moduleName, [moduleVersion]]) =>
            cachedSandbox(app, moduleName, moduleVersion, nrfutilCore) ??
            preparedSandbox(app, moduleName, moduleVersion, nrfutilCore),
    );

export const sandboxFractionNames = (nrfutilModules: NrfutilModules = {}) =>
    Object.keys(nrfutilModules);
