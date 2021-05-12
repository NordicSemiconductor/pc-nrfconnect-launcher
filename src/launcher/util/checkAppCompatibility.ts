/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import { remote } from 'electron';
import semver from 'semver';

import launcherPackageJson from '../../../package.json';
import { App } from '../../main/apps';
import requiredVersionOfShared from '../../main/requiredVersionOfShared';

const config = remote.require('../main/config');

const isValidVersionNumber = (maybeVersionNumber?: string) =>
    semver.valid(maybeVersionNumber) != null;

const requestedVersionOfShared = (app: App) => app.sharedVersion;

interface LauncherCompatibilityConfig {
    providedVersionOfEngine: string;
    providedVersionOfShared: string;
}

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
    app: App,
    launcherCompatibilityConfig: LauncherCompatibilityConfig
) => Undecided | Compatible | Incompatible;

export const checkEngineVersionIsSet: AppCompatibilityChecker = app =>
    app.engineVersion
        ? undecided
        : incompatible(
              'The app does not specify which nRF Connect version(s) ' +
                  'it supports',
              'The app does not specify ' +
                  'which nRF Connect version(s) it supports. Ask the app ' +
                  'author to add an engines.nrfconnect definition to package.json, ' +
                  'ref. the documentation.'
          );

export const checkEngineIsSupported: AppCompatibilityChecker = (
    app,
    { providedVersionOfEngine }
) => {
    const isSupportedEngine = semver.satisfies(
        semver.coerce(providedVersionOfEngine) ?? '0.0.0',
        app.engineVersion! // eslint-disable-line @typescript-eslint/no-non-null-assertion -- checkEngineVersionIsSet above already checks that this is defined
    );

    return isSupportedEngine
        ? undecided
        : incompatible(
              `The app only supports nRF Connect ${app.engineVersion}, ` +
                  'which does not match your currently installed version',
              'The app only supports ' +
                  `nRF Connect ${app.engineVersion} while your installed version ` +
                  `is ${providedVersionOfEngine}. It might not work as expected.`
          );
};

export const checkIdenticalShared: AppCompatibilityChecker = (
    app,
    { providedVersionOfShared }
) =>
    requestedVersionOfShared(app) === providedVersionOfShared
        ? compatible
        : undecided;

export const checkProvidedVersionOfSharedIsValid: AppCompatibilityChecker = (
    app,
    { providedVersionOfShared }
) =>
    requestedVersionOfShared(app) == null ||
    isValidVersionNumber(providedVersionOfShared)
        ? undecided
        : incompatible(
              `nRF Connect uses "${providedVersionOfShared}" of shared ` +
                  'which cannot be checked against the version required by ' +
                  'this app.',
              `nRF Connect uses "${providedVersionOfShared}" of shared ` +
                  'which cannot be checked against the version required by ' +
                  'this app. Inform the developer, that the launcher needs ' +
                  'to reference a correct version of shared. The app might ' +
                  'not work as expected.'
          );

export const checkRequestedVersionOfSharedIsValid: AppCompatibilityChecker =
    app =>
        requestedVersionOfShared(app) == null ||
        isValidVersionNumber(requestedVersionOfShared(app))
            ? undecided
            : incompatible(
                  `The app requires "${requestedVersionOfShared(app)}" of ` +
                      'shared which cannot be checked against the version ' +
                      'provided by nRF Connect.',
                  `The app requires "${requestedVersionOfShared(app)}" of ` +
                      'shared which cannot be checked against the version ' +
                      'provided by nRF Connect. Inform the developer, that the ' +
                      'app needs to reference a correct version of shared. The ' +
                      'app might not work as expected.'
              );

export const checkRequestedSharedIsProvided: AppCompatibilityChecker = (
    app,
    { providedVersionOfShared }
) => {
    const requestedVersionOfSharedByApp = requestedVersionOfShared(app);
    const providesRequestedVersionOfShared =
        requestedVersionOfSharedByApp == null ||
        semver.lte(requestedVersionOfSharedByApp, providedVersionOfShared!); // eslint-disable-line @typescript-eslint/no-non-null-assertion

    return providesRequestedVersionOfShared
        ? undecided
        : incompatible(
              `The app requires ${requestedVersionOfShared(app)} of ` +
                  'pc-nrfconnect-shared, but nRF Connect only provided ' +
                  `${providedVersionOfShared}. Inform the app developer, that ` +
                  'the app needs a more recent version of nRF Connect.',
              `The app requires ${requestedVersionOfShared(app)} of ` +
                  'pc-nrfconnect-shared, but nRF Connect only provided ' +
                  `${providedVersionOfShared}. Inform the app developer, that ` +
                  'the app needs a more recent version of nRF Connect. The app ' +
                  'might not work as expected.'
          );
};

const getProvidedVersionOfShared = () => {
    const providedVersionOfShared =
        requiredVersionOfShared(launcherPackageJson);

    if (providedVersionOfShared == null) {
        throw new Error(
            'The launcher must depend on a version of pc-nrfconnect-shared'
        );
    }

    return providedVersionOfShared;
};

export default (
    app: App,
    launcherCompatibilityConfig = {
        providedVersionOfEngine: config.getVersion(),
        providedVersionOfShared: getProvidedVersionOfShared(),
    }
): Compatible | Incompatible => {
    // eslint-disable-next-line no-restricted-syntax -- because here a loop is simpler than an array iteration function
    for (const check of [
        checkEngineVersionIsSet,
        checkEngineIsSupported,
        checkIdenticalShared,
        checkProvidedVersionOfSharedIsValid,
        checkRequestedVersionOfSharedIsValid,
        checkRequestedSharedIsProvided,
    ]) {
        const result = check(app, launcherCompatibilityConfig);
        if (result.isDecided) {
            return result;
        }
    }

    return compatible;
};
