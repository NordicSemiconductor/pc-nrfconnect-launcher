/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { app } from 'electron/main';

import argv from './argv';
import { openInitialWindow } from './configureElectronApp';

export default () => {
    if (argv['new-instance']) {
        return;
    }

    const isFirstInstance = app.requestSingleInstanceLock({
        argv: JSON.stringify(argv),
    });

    if (isFirstInstance) {
        app.on('second-instance', (_event, _args, _wd, message) => {
            const args = (message as { argv: string }).argv;
            openInitialWindow(JSON.parse(args) as typeof argv);
        });
    } else {
        console.log(
            'Other instance already running. Bringing that to the front.'
        );
        app.quit();
        process.exit();
    }
};
