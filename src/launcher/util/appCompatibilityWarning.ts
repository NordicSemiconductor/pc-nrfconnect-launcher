/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { launcherConfig } from '@nordicsemiconductor/pc-nrfconnect-shared';
import fs from 'fs';
import path from 'path';
import semver from 'semver';

import { isDownloadable, isWithdrawn, LaunchableApp } from '../../ipc/apps';
import minimalRequiredAppVersions from './minimalRequiredAppVersions';

const undecided = { isDecided: false } as const;
const incompatible = (warning: string, longWarning: string) =>
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
) => Undecided | Incompatible;

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

export const checkLegacyDependencies: AppCompatibilityChecker = (
    app: LaunchableApp,
    providedVersionOfEngine: string
) => {
    if (app?.installed.path == null) {
        return undecided;
    }

    // The proxy app is an exceptions
    if (app.name === 'pc-nrfconnect-ble') {
        return undecided;
    }

    const packageJSONPath = path.join(app?.installed.path, 'package.json');

    if (!fs.existsSync(packageJSONPath)) {
        return undecided;
    }

    try {
        const parsed = JSON.parse(fs.readFileSync(packageJSONPath, 'utf8')) as {
            nrfConnectForDesktop?: {
                nrfutil?: unknown;
            };
        };

        if (!parsed.nrfConnectForDesktop?.nrfutil) {
            return incompatible(
                'The app only supports nRF Connect for Desktop' +
                    `${app.engineVersion} and <=4.4.1, which does not match your ` +
                    'currently installed version',
                'The app only supports nRF Connect for Desktop' +
                    `${app.engineVersion} and <=4.4.1 while your installed version is ` +
                    `${providedVersionOfEngine}. Application will not work.`
            );
        }
    } catch {
        // nothing
    }

    return undecided;
};

const checkMinimalRequiredAppVersions: AppCompatibilityChecker = app => {
    const appIsRecentEnough =
        minimalRequiredAppVersions[app.name] == null ||
        semver.gte(app.currentVersion, minimalRequiredAppVersions[app.name]);

    const fittingVersionExists =
        minimalRequiredAppVersions[app.name] != null &&
        isDownloadable(app) &&
        !isWithdrawn(app) &&
        app.latestVersion != null &&
        semver.gte(app.latestVersion, minimalRequiredAppVersions[app.name]);

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
                  } Running the currently installed version of this app might not work as expected.`
          );
};

export default (
    app: LaunchableApp,
    providedVersionOfEngine = launcherConfig().launcherVersion
): undefined | { warning: string; longWarning: string } => {
    // eslint-disable-next-line no-restricted-syntax -- because here a loop is simpler than an array iteration function
    for (const check of [
        checkEngineVersionIsSet,
        checkEngineIsSupported,
        checkMinimalRequiredAppVersions,
        checkLegacyDependencies,
    ]) {
        const result = check(app, providedVersionOfEngine);
        if (result.isDecided) {
            return { warning: result.warning, longWarning: result.longWarning };
        }
    }

    return undefined;
};
