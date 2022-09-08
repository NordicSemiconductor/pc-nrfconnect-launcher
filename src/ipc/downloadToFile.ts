/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import * as rendererToMain from './infrastructure/rendererToMain';

const channel = 'download-to-file';

type DownloadToFile = (url: string, filePath: string) => void;

export const invokeFromRenderer =
    rendererToMain.invoke<DownloadToFile>(channel);

export const registerHandlerFromMain =
    rendererToMain.registerInvoked<DownloadToFile>(channel);
