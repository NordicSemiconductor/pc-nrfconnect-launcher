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
import {
    existingIsOlderThanExpected,
    strippedVersionName,
} from './jlinkVersion';
import Link from './Link';
import minimalRequiredAppVersions from './minimalRequiredAppVersions';

enum WarningKind {
    ENGINE_CHECK = 'Engine check',
    UNSUPPORTED_APP = 'Unsupported app',
    JLINK = 'No appropriate J-Link',
}

type IncompatibilityWarning = {
    title: string;
    warning: string;
    longWarning: React.ReactNode;
    warningData: Record<string, unknown>;
};

const undecided = { isDecided: false } as const;
const incompatible = (
    title: string,
    warning: string,
    longWarning: React.ReactNode,
    warningData: Record<string, unknown>
) =>
    ({
        isDecided: true,
        isCompatible: false,
        title,
        warning,
        longWarning,
        warningData,
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
              'Version problem',
              'The app does not specify which nRF Connect for Desktop ' +
                  'versions it supports',
              'The app does not specify which nRF Connect for Desktop ' +
                  'versions it supports. Ask the app author to add an ' +
                  'engines.nrfconnect definition to package.json.',
              {
                  warningKind: WarningKind.ENGINE_CHECK,
                  app: app.name,
                  requestedEngine: 'not specified',
              }
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
              'Version problem',
              'The app only supports nRF Connect for Desktop ' +
                  `${app.engineVersion}, which does not match your ` +
                  'currently installed version',
              'The app only supports nRF Connect for Desktop ' +
                  `${app.engineVersion} while your installed version is ` +
                  `${providedVersionOfEngine}. The app might not work as expected.`,
              {
                  warningKind: WarningKind.ENGINE_CHECK,
                  app: app.name,
                  requestedEngine: app.engineVersion,
                  providedEngine: providedVersionOfEngine,
              }
          );
};

const checkMinimalRequiredAppVersions: AppCompatibilityChecker = app => {
    const minSupportedVersion = minimalRequiredAppVersions[app.name];
    if (minSupportedVersion === null) {
        return incompatible(
            'Version problem',
            'This version of nRF Connect for Desktop does not support ' +
                `this app anymore.`,
            `This version of nRF Connect for Desktop does not support ` +
                `this app "${app.displayName}". This app will not work.`,
            {
                warningKind: WarningKind.UNSUPPORTED_APP,
                app: app.name,
                appVersion: app.currentVersion,
                minimalAppVersion: 'none',
            }
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
              'Version problem',
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
                  } Running the currently installed version will not work.`,
              {
                  warningKind: WarningKind.UNSUPPORTED_APP,
                  app: app.name,
                  appVersion: app.currentVersion,
                  minimalAppVersion: minimalRequiredAppVersions[app.name],
              }
          );
};

const nrfutilDeviceToJLink = (device: string) => {
    // According to https://docs.nordicsemi.com/bundle/nrfutil/page/guides/installing.html#prerequisites
    if (semver.lt(device, '2.0.0')) {
        return 'V7.80c';
    }

    if (semver.lt(device, '2.1.0')) {
        return 'V7.88j';
    }

    if (semver.lt(device, '2.5.4')) {
        return 'V7.94e';
    }

    return 'V7.94i';
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

    const userDir = getUserDataDir();
    const sandbox = await getSandbox(userDir, 'device', deviceVersion);
    const moduleVersion = await sandbox.getModuleVersion();
    const jlinkVersionDependency = resolveModuleVersion(
        'JlinkARM',
        moduleVersion.dependencies
    );

    const noJlinkInstalled = jlinkVersionDependency?.version == null;
    if (noJlinkInstalled) {
        const requiredVersion = nrfutilDeviceToJLink(deviceVersion);

        return incompatible(
            'Missing dependency',
            `Required SEGGER J-Link not found: expected version ${requiredVersion}`,
            <div className="tw-flex tw-flex-col tw-gap-2">
                <div>This app requires SEGGER J-Link {requiredVersion}.</div>
                <div>
                    <Link href="https://www.segger.com/downloads/jlink/">
                        Download
                    </Link>{' '}
                    and install the SEGGER J-Link Software and Documentation
                    pack {requiredVersion}. Restart nRF Connect for Desktop
                    afterwards.
                </div>
            </div>,
            {
                warningKind: WarningKind.JLINK,
                app: app.name,
                nrfutilDevice: deviceVersion,
                requiredJlink: requiredVersion,
                actualJlink: 'none',
            }
        );
    }

    if (
        jlinkVersionDependency.expectedVersion &&
        existingIsOlderThanExpected(jlinkVersionDependency)
    ) {
        const expectedVersionNumber = strippedVersionName(
            jlinkVersionDependency.expectedVersion
        );
        const actualVersionNumber = strippedVersionName(jlinkVersionDependency);

        return incompatible(
            'Outdated dependency',
            `Untested version V${actualVersionNumber} of SEGGER J-Link found: ` +
                `expected at least version V${expectedVersionNumber}`,
            <div className="tw-flex tw-flex-col tw-gap-2">
                <div>
                    This app was tested with SEGGER J-Link V
                    {expectedVersionNumber} but version V{actualVersionNumber}{' '}
                    was found on your system.
                </div>
                <div>This app might not work as expected!</div>
                <div>
                    <Link href="https://www.segger.com/downloads/jlink/">
                        Download
                    </Link>{' '}
                    and install the SEGGER J-Link Software and Documentation
                    pack V{expectedVersionNumber}. Restart nRF Connect for
                    Desktop afterwards.
                </div>
            </div>,
            {
                warningKind: WarningKind.JLINK,
                app: app.name,
                nrfutilDevice: deviceVersion,
                requiredJlink: jlinkVersionDependency.expectedVersion.version,
                actualJlink: jlinkVersionDependency.version,
            }
        );
    }

    return undecided;
};

export default async (
    app: LaunchableApp,
    providedVersionOfEngine = launcherConfig().launcherVersion
): Promise<undefined | IncompatibilityWarning> => {
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
            return result;
        }
    }

    return undefined;
};
