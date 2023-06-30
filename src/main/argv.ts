/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import parseArgs from 'minimist';

import { OFFICIAL } from '../ipc/sources';

/*
 * Supported command line arguments:
 *
 * Launch app on startup
 * --open-local-app <id>         Open a local app with the given id on start.
 * --open-downloadable-app <id>  Open a downloadable app with the given id on start.
 * --open-official-app <id>      [Deprecated] Alias for --open-downloadable-app.
 * --source <name>               From which source to open the downloadable app.
 *                               Default: official
 *
 * Directories
 * --apps-root-dir  The directory where app data is stored.
 *                  Default: "<homeDir>/.nrfconnect-apps"
 * --user-data-dir  Path to the user data dir. If this is not set, the environment
 *                  variable NRF_USER_DATA_DIR is also used.
 *                  See also https://www.electronjs.org/docs/api/app#appgetpathname
 *                  Default: The appData directory appended with 'nrfconnect'.
 *
 * Startup behaviour
 * --skip-update-apps      Do not download info/updates about apps.
 *                         Default: false
 * --skip-update-launcher  Skip checking for updates for nRF Connect for Desktop.
 *                         Default: false
 * --skip-splash-screen    Skip the splash screen at startup.
 *                         Default: false
 *
 * Dev tools
 * --install-devtools  Install dev tools
 * --remove-devtools   Remove dev tools
 */

interface CommandLineArguments {
    'open-local-app': string | undefined;
    'open-downloadable-app': string | undefined;
    'open-official-app': string | undefined;
    source: string | undefined;

    'apps-root-dir': string | undefined;
    'user-data-dir': string | undefined;

    'skip-splash-screen': boolean;
    'skip-update-apps': boolean;
    'skip-update-launcher': boolean;

    'install-devtools': boolean;
    'remove-devtools': boolean;
}

const argv = parseArgs<CommandLineArguments>(process.argv.slice(2), {
    boolean: [
        'skip-splash-screen',
        'skip-update-apps',
        'skip-update-launcher',
        'install-devtools',
        'remove-devtools',
    ],
});

type StartupApp =
    | {
          local: true;
          name: string;
      }
    | {
          local: false;
          name: string;
          source: string;
      };

export const getStartupApp = (): StartupApp | undefined => {
    const localApp = argv['open-local-app'];
    if (localApp != null) {
        return {
            local: true,
            name: localApp,
        };
    }

    const source = argv.source ?? OFFICIAL;

    const downloadableApp = argv['open-downloadable-app'];
    if (downloadableApp != null) {
        return {
            local: false,
            source,
            name: downloadableApp,
        };
    }

    const officialApp = argv['open-official-app'];
    if (officialApp != null) {
        console.warn(
            'Using the command line switch --open-official-app is deprecated,\n' +
                'use --open-downloadable-app instead.'
        );

        return {
            local: false,
            source,
            name: officialApp,
        };
    }
};

export default argv;
