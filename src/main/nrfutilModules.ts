/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { AppVersion } from '@nordicsemiconductor/pc-nrfconnect-shared/main';
import { setNrfutilLogger } from '@nordicsemiconductor/pc-nrfconnect-shared/nrfutil/nrfutilLogger';
import getSandbox, {
    NrfutilSandbox,
} from '@nordicsemiconductor/pc-nrfconnect-shared/nrfutil/sandbox';

import { AppSpec } from '../ipc/apps';
import { inRenderer as downloadProgress } from '../ipc/downloadProgress';
import { getUserDataDir } from './config';
import { logger } from './log';

const nrfutilSandboxesCache: { [index: string]: Promise<NrfutilSandbox> } = {};

export const assertPreparedNrfutilModules = async (
    app: AppSpec,
    versionToInstall: AppVersion
) => {
    const nrfutilModules = versionToInstall.nrfutilModules;

    if (nrfutilModules) {
        await Promise.all(
            Object.keys(nrfutilModules).map(module => {
                const versions = nrfutilModules[module];
                if (
                    nrfutilSandboxesCache[`${module}-${versions}`] !== undefined
                ) {
                    return nrfutilSandboxesCache[`${module}-${versions}`];
                }

                setNrfutilLogger(logger);
                if (versions && versions.length > 0) {
                    const promise = getSandbox(
                        getUserDataDir(),
                        module,
                        versions[0],
                        progress => {
                            downloadProgress.reportDownloadProgress({
                                app,
                                progressFraction: progress.progressPercentage,
                                key: module,
                            });
                        }
                    );

                    nrfutilSandboxesCache[`${module}-${versions}`] = promise;
                    return promise;
                }
                return Promise.resolve();
            })
        );
    }
};
