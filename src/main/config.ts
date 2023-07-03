/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { app } from 'electron';
import path from 'path';

import { OFFICIAL, SourceName } from '../ipc/sources';
import argv from './argv';

const appsRootDir =
    argv['apps-root-dir'] ?? path.join(app.getPath('home'), '.nrfconnect-apps');

export const getAppsExternalDir = () => path.join(appsRootDir, 'external');

export const getAppsLocalDir = () => path.join(appsRootDir, 'local');

export const getAppsRootDir = (sourceName: SourceName = OFFICIAL) =>
    sourceName === OFFICIAL
        ? appsRootDir
        : path.join(getAppsExternalDir(), sourceName);

export const getElectronResourcesDir = () =>
    path.join(app.getAppPath(), 'resources');

export const getNodeModulesDir = (sourceName?: string) =>
    path.join(getAppsRootDir(sourceName), 'node_modules');
