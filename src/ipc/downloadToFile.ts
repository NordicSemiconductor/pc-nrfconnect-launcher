/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { handle, invoke } from './infrastructure/rendererToMain';

const channel = 'download-to-file';

type DownloadToFile = (url: string, filePath: string) => void;

export const downloadToFile = invoke<DownloadToFile>(channel);
export const registerDownloadToFile = handle<DownloadToFile>(channel);
