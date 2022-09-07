/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { app, session } from 'electron';
import type installExtension from 'electron-devtools-installer';
import type { REDUX_DEVTOOLS } from 'electron-devtools-installer';
import fs from 'fs';
import path from 'path';
import { exit } from 'process';

type ExtensionReference = typeof REDUX_DEVTOOLS;
type InstallExtension = typeof installExtension;

type Extensions = Record<string, ExtensionReference>;

const installDevtools = async (
    extensions: Extensions,
    installExtension: InstallExtension
) => {
    try {
        // eslint-disable-next-line no-restricted-syntax, guard-for-in
        for (const extensionName in extensions) {
            // eslint-disable-next-line no-await-in-loop
            await installExtension(extensions[extensionName]);
            console.log(`Added extension ${extensionName}`);
        }
        console.log('Devtool extensions should exist now');
        app.quit();
    } catch (err) {
        console.log('An error occurred while adding the devtools: ', err);
        exit(1);
    }
};

const extensionPath = (extension: ExtensionReference) =>
    path.join(
        // @ts-expect-error -- getStoragePath returns string|null, the type definition is wrong and fixed in later versions: https://github.com/electron/electron/issues/35255
        session.defaultSession.getStoragePath() as string,
        'extensions',
        extension.id
    );

const removeDevtools = (extensions: Extensions) => {
    try {
        Object.entries(extensions).forEach(([name, extension]) => {
            if (fs.existsSync(extensionPath(extension))) {
                fs.rmdirSync(extensionPath(extension), { recursive: true });
                console.log(`Removed extension ${name}`);
            }
        });
        console.log('Devtool extensions should be removed now');
        exit(0);
    } catch (err) {
        console.log('An error occurred while removing devtools: ', err);
        exit(1);
    }
};

const loadInstalledDevtools = (extensions: Extensions) => {
    try {
        Object.values(extensions).forEach(extension => {
            if (fs.existsSync(extensionPath(extension))) {
                session.defaultSession.loadExtension(extensionPath(extension), {
                    allowFileAccess: true,
                });
            }
        });
    } catch (err) {
        console.log(
            'An error occurred while loading installed devtools: ',
            err
        );
        exit(1);
    }
};

export default async () => {
    let devToolsInstaller;
    try {
        devToolsInstaller = await import('electron-devtools-installer');
    } catch (error) {
        // In the production build the module electron-devtools-installer does
        // not exist, so ignore this error

        return;
    }

    const {
        REDUX_DEVTOOLS,
        REACT_DEVELOPER_TOOLS,
        // @ts-expect-error: installExtension really is nested like this
        default: { default: installExtension },
    } = devToolsInstaller;

    const extensions = { REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS };

    if (process.argv.includes('--install-devtools')) {
        await installDevtools(extensions, installExtension);
    } else if (process.argv.includes('--remove-devtools')) {
        removeDevtools(extensions);
    } else {
        loadInstalledDevtools(extensions);
    }
};
