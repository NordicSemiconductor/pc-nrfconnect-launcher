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

const fork = require('child_process').fork;
const parseOutdated = require('./parsing').parseOutdated;
const yarnConfig = require('./config');
const config = require('../config');
const log = require('electron-log');

const yarnPath = require.resolve('yarn/bin/yarn.js');

function yarn(args, env) {
    return new Promise((resolve, reject) => {
        const proc = fork(yarnPath, args, {
            cwd: config.getAppsRootDir(),
            env: Object.assign({}, env, {
                DISABLE_V8_COMPILE_CACHE: 1,
            }),
            stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
        });

        let buffer = '';
        const addToBuffer = data => {
            buffer += data.toString();
        };
        proc.stdout.on('data', addToBuffer);
        proc.stderr.on('data', addToBuffer);

        proc.on('exit', code => (
            code !== 0 ? reject(new Error(buffer)) : resolve(buffer)
        ));
        proc.on('error', err => (
            reject(new Error(`Error when running yarn: ${err.message}`))
        ));
    });
}

function logAndThrowError(error) {
    log.error(error.message);
    throw new Error(`Error when running yarn. See ${log.transports.file.file} ` +
        'for details. If you are using a proxy server, you may need to ' +
        'configure it as described on ' +
        'https://github.com/NordicSemiconductor/pc-nrfconnect-core');
}

/**
 * Installs the given npm package in the apps root directory. The package
 * is added as an exact dependency in package.json in the same directory.
 * The name can optionally have a version, e.g. 'package@1.2.3'.
 *
 * Supported options:
 * - httpsProxy {string} Format: 'http://proxy.company.com:8080'
 *
 * @param {string} name The name of the package to install.
 * @param {Object} options Optional parameter for specifying options.
 * @returns {Promise} Promise that resolves or rejects with the yarn output.
 */
function add(name, options) {
    return yarnConfig.optionsToEnv(options)
        .then(env => yarn(['add', '--exact', name], env))
        .catch(logAndThrowError);
}

/**
 * Uninstalls the given npm package in the apps root directory. The package
 * is removed from the list of dependencies in package.json in the same
 * directory.
 *
 * Supported options:
 * - httpsProxy {string} Format: 'http://proxy.company.com:8080'
 *
 * @param {string} name The name of the package to remove.
 * @param {Object} options Optional parameter for specifying options.
 * @returns {Promise} Promise that resolves or rejects with the yarn output.
 */
function remove(name, options) {
    return yarnConfig.optionsToEnv(options)
        .then(env => yarn(['remove', name], env))
        .catch(logAndThrowError);
}

/**
 * Returns packages that have outdated versions. A promise is returned,
 * which resolves with an object containing package names as keys and
 * their latest version as values.
 *
 * If no outdated packages are found, the promise will resolve with an
 * empty object.
 *
 * Supported options:
 * - httpsProxy {string} Format: 'http://proxy.company.com:8080'
 *
 * @param {Object} options Optional parameter for specifying options.
 * @returns {Promise} Promise that resolves with an object of packages.
 */
function outdated(options) {
    return yarnConfig.optionsToEnv(options)
        .then(env => yarn(['outdated'], env))
        .then(output => parseOutdated(output))
        .catch(logAndThrowError);
}

module.exports = {
    add,
    remove,
    outdated,
};
