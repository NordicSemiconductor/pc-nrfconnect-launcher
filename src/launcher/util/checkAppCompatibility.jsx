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
import requiredVersionOfShared from '../../main/requiredVersionOfShared';

const config = remote.require('../main/config');

const isSupportedEngine = requiredVersionOfEngine => {
    const coreEngineVersion = config.getVersion();

    // The semver.satisfies() check will return false if receiving a pre-release
    // (e.g. 2.0.0-alpha.0), so stripping away the pre-release part.
    const currentEngine = [
        semver.major(coreEngineVersion),
        semver.minor(coreEngineVersion),
        semver.patch(coreEngineVersion),
    ].join('.');
    return semver.satisfies(currentEngine, requiredVersionOfEngine);
};

const requiresMoreRecentVersionOfShared = (
    requestedVersionOfShared,
    providedVersionOfShared
) =>
    requestedVersionOfShared != null &&
    semver.gt(requestedVersionOfShared, providedVersionOfShared);

const isNotAVersionNumber = versionNumberString =>
    semver.valid(versionNumberString) == null;

export default app => {
    if (!app.engineVersion) {
        return {
            isCompatible: false,
            warning:
                'The app does not specify which nRF Connect version(s) ' +
                'it supports',
            longWarning:
                'The app does not specify ' +
                'which nRF Connect version(s) it supports. Ask the app ' +
                'author to add an engines.nrfconnect definition to package.json, ' +
                'ref. the documentation.',
        };
    }

    if (!isSupportedEngine(app.engineVersion)) {
        return {
            isCompatible: false,
            warning:
                `The app only supports nRF Connect ${app.engineVersion}, ` +
                'which does not match your currently installed version',
            longWarning:
                'The app only supports ' +
                `nRF Connect ${app.engineVersion} while your installed version ` +
                `is ${config.getVersion()}. It might not work as expected.`,
        };
    }

    const requestedVersionOfShared = app.sharedVersion;
    const providedVersionOfShared = requiredVersionOfShared(
        launcherPackageJson
    );

    if (requestedVersionOfShared === providedVersionOfShared) {
        return { isCompatible: true };
    }

    if (
        requestedVersionOfShared != null &&
        isNotAVersionNumber(providedVersionOfShared)
    ) {
        return {
            isCompatible: false,
            warning:
                `nRF Connect uses "${providedVersionOfShared}" of shared ` +
                'which cannot be checked against the version required by ' +
                'this app.',
            longWarning:
                `nRF Connect uses "${providedVersionOfShared}" of shared ` +
                'which cannot be checked against the version required by ' +
                'this app. Inform the developer, that the launcher needs ' +
                'to reference a correct version of shared. The app might ' +
                'not work as expected.',
        };
    }

    if (
        requestedVersionOfShared != null &&
        isNotAVersionNumber(requestedVersionOfShared)
    ) {
        return {
            isCompatible: false,
            warning:
                `The app requires "${requestedVersionOfShared}" of shared ` +
                'which cannot be checked against the version provided by ' +
                'nRF Connect.',
            longWarning:
                `The app requires "${requestedVersionOfShared}" of shared ` +
                'which cannot be checked against the version provided by ' +
                'nRF Connect. Inform the developer, that the app needs ' +
                'to reference a correct version of shared. The app might ' +
                'not work as expected.',
        };
    }

    if (
        requiresMoreRecentVersionOfShared(
            requestedVersionOfShared,
            providedVersionOfShared
        )
    ) {
        return {
            isCompatible: false,
            warning:
                `The app requires ${requestedVersionOfShared} of ` +
                'pc-nrfconnect-shared, but nRF Connect only provided ' +
                `${providedVersionOfShared}. Inform the app developer, that ` +
                'the app needs a more recent version of nRF Connect.',
            longWarning:
                `The app requires ${requestedVersionOfShared} of ` +
                'pc-nrfconnect-shared, but nRF Connect only provided ' +
                `${providedVersionOfShared}. Inform the app developer, that ` +
                'the app needs a more recent version of nRF Connect. The app ' +
                'might not work as expected.',
        };
    }

    return { isCompatible: true };
};
