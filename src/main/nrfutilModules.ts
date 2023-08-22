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
import { setNrfutilLogger } from '@nordicsemiconductor/pc-nrfconnect-shared/nrfutil/nrfutilLogger';
import getSandbox, {
    NrfutilSandbox,
} from '@nordicsemiconductor/pc-nrfconnect-shared/nrfutil/sandbox';

import { AppSpec } from '../ipc/apps';
import { inRenderer as downloadProgress } from '../ipc/downloadProgress';
import { getUserDataDir } from './config';
import { logger } from './log';

const sandboxesCache: {
    [
        index: `${NrfutilModuleName}-${NrfutilModuleVersion}`
    ]: Promise<NrfutilSandbox>;
} = {};

const cachedSandbox = (
    moduleName: string,
    moduleVersion: NrfutilModuleVersion
) => sandboxesCache[`${moduleName}-${moduleVersion}`];

const preparedSandbox = (
    app: AppSpec,
    moduleName: string,
    moduleVersion: NrfutilModuleVersion
) => {
    setNrfutilLogger(logger);

    const sandbox = getSandbox(
        getUserDataDir(),
        moduleName,
        moduleVersion,
        progress => {
            downloadProgress.reportDownloadProgress({
                app,
                progressFraction: progress.progressPercentage,
                key: moduleName,
            });
        }
    );

    sandboxesCache[`${moduleName}-${moduleVersion}`] = sandbox;
    return sandbox;
};
export const assertPreparedNrfutilModules = (
    app: AppSpec,
    nrfutilModules: NrfutilModules = {}
) =>
    Object.entries(nrfutilModules).map(
        ([moduleName, [moduleVersion]]) =>
            cachedSandbox(moduleName, moduleVersion) ??
            preparedSandbox(app, moduleName, moduleVersion)
    );
