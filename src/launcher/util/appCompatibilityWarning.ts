/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { launcherConfig } from '@nordicsemiconductor/pc-nrfconnect-shared';
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

export default (
    app: LaunchableApp,
    providedVersionOfEngine = launcherConfig().launcherVersion
): undefined | { warning: string; longWarning: string } => {
    // eslint-disable-next-line no-restricted-syntax -- because here a loop is simpler than an array iteration function
    for (const check of [
        checkEngineVersionIsSet,
        checkEngineIsSupported,
        checkMinimalRequiredAppVersions,
    ]) {
        const result = check(app, providedVersionOfEngine);
        if (result.isDecided) {
            return { warning: result.warning, longWarning: result.longWarning };
        }
    }

    return undefined;
};
