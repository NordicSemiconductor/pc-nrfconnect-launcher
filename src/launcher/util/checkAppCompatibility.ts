/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import semver from 'semver';

import { InstalledApp } from '../../ipc/apps';
import mainConfig from './mainConfig';

const undecided = { isDecided: false } as const;
const compatible = { isDecided: true, isCompatible: true } as const;
const incompatible = (warning: string, longWarning: string) =>
    ({
        isDecided: true,
        isCompatible: false,
        warning,
        longWarning,
    } as const);

type Undecided = typeof undecided;
type Compatible = typeof compatible;
type Incompatible = ReturnType<typeof incompatible>;

type AppCompatibilityChecker = (
    app: InstalledApp,
    providedVersionOfEngine: string
) => Undecided | Compatible | Incompatible;

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

export const checkEngineIsSupported: AppCompatibilityChecker = (
    app,
    providedVersionOfEngine
) => {
    const isSupportedEngine = semver.satisfies(
        semver.coerce(providedVersionOfEngine) ?? '0.0.0',
        app.engineVersion! // eslint-disable-line @typescript-eslint/no-non-null-assertion -- checkEngineVersionIsSet above already checks that this is defined
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

export default (
    app: InstalledApp,
    providedVersionOfEngine = mainConfig().version
): Compatible | Incompatible => {
    // eslint-disable-next-line no-restricted-syntax -- because here a loop is simpler than an array iteration function
    for (const check of [checkEngineVersionIsSet, checkEngineIsSupported]) {
        const result = check(app, providedVersionOfEngine);
        if (result.isDecided) {
            return result;
        }
    }

    return compatible;
};
