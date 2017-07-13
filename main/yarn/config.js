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

const path = require('path');
const fileUtil = require('../fileUtil');
const config = require('../config');

function findLine(configData, key) {
    const lines = configData.split('\n');
    return lines.find(line => line.startsWith(key));
}

function stripQuotes(value) {
    return value.replace(/^"(.*)"$/, '$1');
}

function getValue(line) {
    const parts = line.split(' ');
    return parts[1] ? stripQuotes(parts[1]) : null;
}

/**
 * Returns the value for the given setting in $HOME/.yarnrc. If unable
 * to read the file, the promise rejects with an error. If the value
 * does not exist, then the promise resolves with null.
 *
 * @param {string} key The setting to get value for.
 * @returns {Promise} Promise that resolves with value if setting was found.
 */
function getSetting(key) {
    return fileUtil.readFile(path.join(config.getHomeDir(), '.yarnrc'))
        .then(data => {
            if (data) {
                const line = findLine(data, key);
                if (line) {
                    return getValue(line);
                }
            }
            return null;
        });
}

/**
 * Converts the provided options into environment variables that should
 * be set when running the yarn command.
 *
 * Supported options:
 * - httpsProxy {string} Format: 'http://proxy.company.com:8080'
 *
 * @param {Object} options Options object.
 * @returns {Promise} Promise that resolves with an env object.
 */
function optionsToEnv(options) {
    if (options && options.httpsProxy) {
        const httpsProxyEnv = {
            YARN_HTTPS_PROXY: options.httpsProxy,
        };
        return new Promise(resolve => {
            // Only add proxy env variable if there is no
            // https-proxy already configured in .yarnrc.
            getSetting('https-proxy')
                .then(configuredProxy => {
                    if (configuredProxy) {
                        resolve({});
                    } else {
                        resolve(httpsProxyEnv);
                    }
                })
                .catch(() => resolve(httpsProxyEnv));
        });
    }
    return Promise.resolve({});
}

module.exports = {
    getSetting,
    optionsToEnv,
};
