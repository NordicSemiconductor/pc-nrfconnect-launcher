/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { handle, invoke } from './infrastructure/rendererToMain';

const channel = 'download-to-file';

type DownloadToFile = (url: string, filePath: string) => void;

export const invokeFromRenderer = invoke<DownloadToFile>(channel);

export const registerHandlerFromMain = handle<DownloadToFile>(channel);
