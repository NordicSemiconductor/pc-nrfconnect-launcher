/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import {
    getUserDataDir,
    launcherConfig,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import { resolveModuleVersion } from '@nordicsemiconductor/pc-nrfconnect-shared/nrfutil/moduleVersion';
import getSandbox from '@nordicsemiconductor/pc-nrfconnect-shared/nrfutil/sandbox';
import semver from 'semver';

import { isDownloadable, isWithdrawn, LaunchableApp } from '../../ipc/apps';
import Link from './Link';
import minimalRequiredAppVersions from './minimalRequiredAppVersions';

const undecided = { isDecided: false } as const;
const incompatible = (warning: string, longWarning: React.ReactNode) =>
    ({
        isDecided: true,
        isCompatible: false,
        warning,
        longWarning,
    } as const);

type Undecided = typeof undecided;
type Incompatible = ReturnType<typeof incompatible>;

type AppCompatibilityChecker = (
    app: LaunchableApp,
    providedVersionOfEngine: string
) => Promise<Undecided | Incompatible> | Undecided | Incompatible;

export const checkEngineVersionIsSet: AppCompatibilityChecker = app =>
    app.engineVersion
        ? undecided
        : incompatible(
              'The app does not specify which nRF Connect for Desktop ' +
                  'versions it supports',
              'The app does not specify which nRF Connect for Desktop ' +
                  'versions it supports. Ask the app author to add an ' +
                  'engines.nrfconnect definition to package.json.'
          );

const replaceCaretWithGreaterEqual = (engineVersion: string) =>
    engineVersion.startsWith('^')
        ? engineVersion.replace('^', '>=')
        : engineVersion;

export const checkEngineIsSupported: AppCompatibilityChecker = (
    app,
    providedVersionOfEngine
) => {
    const isSupportedEngine = semver.satisfies(
        semver.coerce(providedVersionOfEngine) ?? '0.0.0',
        replaceCaretWithGreaterEqual(app.engineVersion!) // eslint-disable-line @typescript-eslint/no-non-null-assertion -- checkEngineVersionIsSet above already checks that this is defined
    );

    return isSupportedEngine
        ? undecided
        : incompatible(
              'The app only supports nRF Connect for Desktop ' +
                  `${app.engineVersion}, which does not match your ` +
                  'currently installed version',
              'The app only supports nRF Connect for Desktop ' +
                  `${app.engineVersion} while your installed version is ` +
                  `${providedVersionOfEngine}. It might not work as expected.`
          );
};

const checkMinimalRequiredAppVersions: AppCompatibilityChecker = app => {
    const minSupportedVersion = minimalRequiredAppVersions[app.name];
    if (minSupportedVersion === null) {
        return incompatible(
            'This version of nRF Connect for Desktop does not support ' +
                `this app anymore.`,
            `This version of nRF Connect for Desktop does not support ` +
                `this app "${app.displayName}". Running this will not work.`
        );
    }

    const appIsRecentEnough =
        minimalRequiredAppVersions[app.name] == null ||
        semver.gte(app.currentVersion, minSupportedVersion);

    const fittingVersionExists =
        minimalRequiredAppVersions[app.name] != null &&
        isDownloadable(app) &&
        !isWithdrawn(app) &&
        app.latestVersion != null &&
        semver.gte(app.latestVersion, minSupportedVersion);

    return appIsRecentEnough
        ? undecided
        : incompatible(
              'This version of nRF Connect for Desktop does not support ' +
                  `version ${app.currentVersion} of this app. You ` +
                  `need at least version ` +
                  `${minimalRequiredAppVersions[app.name]}.`,
              `This version of nRF Connect for Desktop does not support ` +
                  `version ${app.currentVersion} of this app ` +
                  `"${app.displayName}". You need at least version ` +
                  `${minimalRequiredAppVersions[app.name]}.${
                      fittingVersionExists
                          ? ' Download the latest available version of this app.'
                          : ''
                  } Running the currently installed version will not work.`
          );
};

const nrfutilDeviceToJLink = (device: string) => {
    if (semver.gte(device, '1.4.4') && semver.lt(device, '2.0.0')) {
        return 'V7.80c';
    }

    if (semver.gte(device, '2.0.0') && semver.lt(device, '2.1.0')) {
        return 'V7.88j';
    }

    if (semver.gte(device, '2.1.0') && semver.lt(device, '2.5.44')) {
        return 'V7.94e';
    }

    if (semver.gte(device, '2.5.4')) {
        return 'V7.94i';
    }
};

const checkJLinkRequirements: AppCompatibilityChecker = async (
    app: LaunchableApp
) => {
    if (!isDownloadable(app)) {
        return undecided;
    }

    const deviceVersion =
        app.versions?.[app.currentVersion]?.nrfutilModules?.device?.at(0);

    if (!deviceVersion) {
        return undecided;
    }

    const requiredVersion = nrfutilDeviceToJLink(deviceVersion);

    const userDir = getUserDataDir();
    const sandbox = await getSandbox(userDir, 'device', deviceVersion);
    const moduleVersion = await sandbox.getModuleVersion();
    const jlinkVersion = resolveModuleVersion(
        'JlinkARM',
        moduleVersion.dependencies
    );

    if (!jlinkVersion) {
        return incompatible(
            `Unable to detect SEGGER J-Link version. Expected version: J-Link ${requiredVersion}.`,
            <div className="tw-flex tw-flex-col tw-gap-2">
                <div>
                    {`This app requires a SEGGER J-Link installation to work. nRF Util's device command v${requiredVersion} was unable to find J-Link DLLs.`}
                </div>
                <div>{`Make sure that SEGGER J-Link v${requiredVersion} is installed.`}</div>
                <div>
                    You can download the tested version from from{' '}
                    <Link href="https://www.segger.com/downloads/jlink/" />
                </div>
            </div>
        );
    }

    if (jlinkVersion?.expectedVersion) {
        return incompatible(
            `Untested version of SEGGER J-Link found. Expected version: ${jlinkVersion.expectedVersion.version}.`,
            <div className="tw-flex tw-flex-col tw-gap-2">
                <div>
                    {`This app requires a SEGGER J-Link v${jlinkVersion.expectedVersion.version}, but nRF Util's device command v${deviceVersion} found J-Link v${jlinkVersion.version}.`}
                </div>
                <div>Things might not work as expected!.</div>
                <div>
                    You can download the tested version from from{' '}
                    <Link href="https://www.segger.com/downloads/jlink/" />
                </div>
            </div>
        );
    }

    return undecided;
};

export default async (
    app: LaunchableApp,
    providedVersionOfEngine = launcherConfig().launcherVersion
): Promise<undefined | { warning: string; longWarning: React.ReactNode }> => {
    // eslint-disable-next-line no-restricted-syntax -- because here a loop is simpler than an array iteration function
    for (const check of [
        checkEngineVersionIsSet,
        checkEngineIsSupported,
        checkMinimalRequiredAppVersions,
        checkJLinkRequirements,
    ]) {
        // eslint-disable-next-line no-await-in-loop
        const result = await check(app, providedVersionOfEngine);
        if (result.isDecided) {
            return { warning: result.warning, longWarning: result.longWarning };
        }
    }

    return undefined;
};
