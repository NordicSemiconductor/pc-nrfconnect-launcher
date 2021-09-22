/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const fs = require('fs');
const url = require('url');
const path = require('path');
const shasum = require('shasum');
const config = require('./config');
const settings = require('./settings');
const net = require('./net');

function getPackageUrl(name, regUrl) {
    return url.resolve(regUrl, name);
}

function getRegistryUrl(source) {
    if (source === 'official') {
        return config.getRegistryUrl();
    }
    const sources = settings.getSources();
    return url.resolve(sources[source], '.');
}

function getLatestFromPackageInfo(packageInfo) {
    return packageInfo['dist-tags'].latest;
}

function getPackageInfo(name, regUrl) {
    return net.downloadToJson(getPackageUrl(name, regUrl), true);
}

/**
 * Get the dist object for the given package name and version. The object
 * has these properties:
 * - tarball: URL to the tgz file
 * - shasum: SHA1 checksum of the file
 *
 * @param {string} name the package name.
 * @param {string} version either a semver version or 'latest'.
 * @param {string} regUrl the url of the registry to get the package from
 * @returns {Promise} promise that resolves with the dist object.
 */
function getDistInfo(name, version, regUrl) {
    return getPackageInfo(name, regUrl).then(packageInfo => {
        let versionToInstall;
        if (version === 'latest') {
            versionToInstall = getLatestFromPackageInfo(packageInfo);
        } else {
            versionToInstall = version;
        }
        return packageInfo.versions[versionToInstall].dist;
    });
}

function verifyShasum(filePath, expectedShasum) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, buffer) => {
            if (err) {
                reject(
                    new Error(
                        'Unable to read file when verifying shasum: ' +
                            `${filePath}`
                    )
                );
            } else {
                const computedShasum = shasum(buffer);
                if (expectedShasum === computedShasum) {
                    resolve();
                } else {
                    reject(
                        new Error(
                            `Shasum verification failed for ${filePath}. Expected ` +
                                `'${expectedShasum}', but got '${computedShasum}'.`
                        )
                    );
                }
            }
        });
    });
}

/**
 * Download the tarball of the given package the given destination directory.
 * Also compares the shasum from the registry with locally computed shasum.
 *
 * @param {string} name the package name.
 * @param {string} version either a semver version or 'latest'.
 * @param {string} destinationDir full path to the destination directory.
 * @param {string} source the registry source to get the package from
 * @returns {Promise} promise that resolves with path to the downloaded file.
 */
function downloadTarball(name, version, destinationDir, source) {
    const regUrl = getRegistryUrl(source);
    return getDistInfo(name, version, regUrl).then(distInfo => {
        if (!distInfo.tarball) {
            return Promise.reject(
                new Error(`No tarball found for ${name}@${version}`)
            );
        }
        const tarballUrl = distInfo.tarball;
        const parsedUrl = url.parse(tarballUrl);
        const fileName = path.basename(parsedUrl.pathname);
        const destinationFile = path.join(destinationDir, fileName);
        return net
            .downloadToFile(tarballUrl, destinationFile, true)
            .then(() => verifyShasum(destinationFile, distInfo.shasum))
            .then(() => destinationFile);
    });
}

function getLatestPackageVersion(name, regUrl) {
    return getPackageInfo(name, regUrl).then(packageInfo =>
        getLatestFromPackageInfo(packageInfo)
    );
}

/**
 * Get the latest package versions for the given packages. Returns
 * an object with package names as keys, and their latest versions
 * as values. E.g: { foo: "1.2.3", bar: "2.3.4" }.
 *
 * @param {string[]} names the package names to get latest versions for.
 * @param {string} source the registry source to get the package from
 * @returns {Promise} promise that resolves with path to the downloaded file.
 */
function getLatestPackageVersions(names, source) {
    const promises = names.map(name =>
        getLatestPackageVersion(name, getRegistryUrl(source)).then(
            latestVersion => ({
                [name]: latestVersion,
            })
        )
    );
    // Performing the network requests in sequence in case proxy auth is
    // required. When running in sequence, the first request will require
    // authentication, while subsequent requests use cached credentials.
    return promises.reduce(
        (prev, curr) =>
            prev.then(packages =>
                curr.then(packageVersion =>
                    Object.assign(packages, packageVersion)
                )
            ),
        Promise.resolve({})
    );
}

module.exports = {
    downloadTarball,
    getLatestPackageVersions,
};
