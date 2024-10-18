/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    type Dependency,
    type SubDependency,
    versionToString,
} from '@nordicsemiconductor/pc-nrfconnect-shared/nrfutil/sandboxTypes';
import semver from 'semver';

type Version = {
    version: Dependency['version'];
    versionFormat: Dependency['versionFormat'];
};

export const strippedVersionName = ({ version, versionFormat }: Version) =>
    versionToString(versionFormat, version).trim().replace('JLink_V', '');

export const hasExpectedFormat = ({
    versionDependency: { version, versionFormat },
    logFailure = true,
}: {
    versionDependency: Version;
    logFailure?: boolean;
}) => {
    const jlinkVersionRegex = /^JLink_V\d+\.\d+[a-z]?$/;
    const result =
        versionFormat === 'string' &&
        versionToString(versionFormat, version)
            .trim()
            .match(jlinkVersionRegex) != null;

    if (!result && logFailure) {
        console.error(
            `The J-Link version was not reported in the expected format. ` +
                `Format: ${versionFormat}, ` +
                `version: ${JSON.stringify(version)}, `
        );
    }

    return result;
};

export const convertToSemver = (versionDependency: Version) => {
    const [, majorMinor, patchLetter] =
        strippedVersionName(versionDependency).match(/(\d\.\d+)(.)?/) ?? [];

    const patch = patchLetter
        ? patchLetter.charCodeAt(0) - 'a'.charCodeAt(0) + 1
        : 0;

    return `${majorMinor}.${patch}`;
};

export const existingIsOlderThanExpected = (
    jlinkVersionDependency: Dependency | SubDependency
) => {
    if (
        jlinkVersionDependency.expectedVersion == null ||
        !hasExpectedFormat({ versionDependency: jlinkVersionDependency }) ||
        !hasExpectedFormat({
            versionDependency: jlinkVersionDependency.expectedVersion,
        })
    )
        return false;

    return semver.lt(
        convertToSemver(jlinkVersionDependency),
        convertToSemver(jlinkVersionDependency.expectedVersion)
    );
};
