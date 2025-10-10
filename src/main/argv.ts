/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    isOpenAppOptionsDeviceSN,
    OpenAppOptions,
} from '@nordicsemiconductor/pc-nrfconnect-shared/main';
import parseArgs from 'minimist';

import { OFFICIAL } from '../common/sources';

const helpText = `
Supported command line arguments:

--help     Show this help

Launch app on startup
=====================
--open-local-app <id>         Open a local app with the given id on start.
--open-downloadable-app <id>  Open a downloadable app with the given id on start.
--open-official-app <id>      [Deprecated] Alias for --open-downloadable-app.
--source <name>               From which source to open the downloadable app.
                              Default: official

Directories
===========
--apps-root-dir  The directory where app data is stored.
                 Default: "<homeDir>/.nrfconnect-apps"
--user-data-dir  Path to the user data dir. If this is not set, the environment
                 variable NRF_USER_DATA_DIR is also used.
                 See also https://www.electronjs.org/docs/api/app#appgetpathname
                 Default: The appData directory appended with 'nrfconnect'.

Startup behaviour
=================
--skip-splash-screen    Skip the splash screen at startup.
                        Default: false
--new-instance          Launch a new instance, independent of other, potentially
                        already running instances.

Dev tools
=========
--install-devtools  Install dev tools
--remove-devtools   Remove dev tools

Proxy settings
==============
--no-proxy-server                 Disable proxy
--proxy-server=<scheme>=<uri>[:<port>][;...] | <uri>[:<port>] | "direct://"
                                  Manual proxy address
--proxy-pac-url=<pac-file-url>    Manual PAC address
--proxy-bypass-list=(<trailing_domain>|<ip-address>)[:<port>][;...]
                                  Disable proxy per host
`.trim();

interface CommandLineArguments {
    'open-local-app': string | undefined;
    'open-downloadable-app': string | undefined;
    'open-official-app': string | undefined;
    source: string | undefined;

    'apps-root-dir': string | undefined;
    'user-data-dir': string | undefined;

    'skip-splash-screen': boolean;

    'install-devtools': boolean;
    'remove-devtools': boolean;
}

const isBundledApp = !process.defaultApp;
const argSlice = process.argv.slice(isBundledApp ? 1 : 2);

const argv = parseArgs<CommandLineArguments>(argSlice, {
    '--': true,
    boolean: [
        'skip-splash-screen',
        'new-instance',
        'install-devtools',
        'remove-devtools',
    ],
});

if (argv.help) {
    console.log(helpText);
    process.exit();
}

export const appArguments = (arg = argv) => arg['--'] ?? [];

const hasDeviceSerialNumber = appArguments().some(a => a === '--deviceSerial');
const hasDeviceSerialPort = appArguments().some(a => a === '--comPort');

if (hasDeviceSerialNumber && hasDeviceSerialPort) {
    console.log('--deviceSerial and --comPort cannot be used at the same time');
    process.exit();
}

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

export const getStartupApp = (arg: typeof argv): StartupApp | undefined => {
    const localApp = arg['open-local-app'];
    if (localApp != null) {
        return {
            local: true,
            name: localApp,
        };
    }

    const source = arg.source ?? OFFICIAL;

    const downloadableApp = arg['open-downloadable-app'];
    if (downloadableApp != null) {
        return {
            local: false,
            source,
            name: downloadableApp,
        };
    }

    const officialApp = arg['open-official-app'];
    if (officialApp != null) {
        console.warn(
            'Using the command line switch --open-official-app is deprecated,\n' +
                'use --open-downloadable-app instead.',
        );

        return {
            local: false,
            source,
            name: officialApp,
        };
    }
};

const removeArguments = (args: string[], argumentsToRemove: string[]) => {
    const result = [...args];

    const argumentCountToRemove = 2;
    argumentsToRemove.forEach(argToRemove => {
        const index = result.findIndex(arg => arg === argToRemove);
        if (index !== -1) {
            result.splice(index, argumentCountToRemove);
        }
    });

    return result;
};

const convertToArguments = (
    device: { serialNumber: string } | { serialPortPath: string },
) =>
    isOpenAppOptionsDeviceSN(device)
        ? ['--deviceSerial', device.serialNumber]
        : ['--comPort', device.serialPortPath];

export const mergeAppArguments = (
    args: string[],
    openAppOptions?: OpenAppOptions,
) => {
    if (openAppOptions?.device == null) {
        return args;
    }

    return [
        ...removeArguments(args, ['--deviceSerial', '--comPort']),
        ...convertToArguments(openAppOptions.device),
    ];
};

export default argv;
