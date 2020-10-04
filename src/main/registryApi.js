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
