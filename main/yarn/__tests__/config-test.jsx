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

/* eslint-disable import/first */

jest.mock('../../fileUtil', () => ({}));
jest.mock('../../config', () => ({
    getHomeDir: () => '/home/user',
}));

import fileUtil from '../../fileUtil';
import { getSetting, optionsToEnv } from '../config';

describe('getSetting', () => {
    it('should reject if unable to read file', () => {
        fileUtil.readFile = () => Promise.reject(new Error('Read error'));

        return getSetting('foo').catch(error => {
            expect(error.message).toEqual('Read error');
        });
    });

    it('should return null if setting does not exist', () => {
        fileUtil.readFile = () => Promise.resolve('');

        return getSetting('https-proxy').then(value => {
            expect(value).toEqual(null);
        });
    });

    it('should return null if setting is commented out', () => {
        fileUtil.readFile = () => Promise.resolve('#https-proxy http://localhost:8080');

        return getSetting('https-proxy').then(value => {
            expect(value).toEqual(null);
        });
    });

    it('should return null if setting exists without space', () => {
        fileUtil.readFile = () => Promise.resolve('https-proxyhttp://localhost:8080');

        return getSetting('https-proxy').then(value => {
            expect(value).toEqual(null);
        });
    });

    it('should return value if setting exists', () => {
        const configuredValue = 'http://user:pass@proxy-host.com:8080';
        fileUtil.readFile = () => Promise.resolve(`https-proxy ${configuredValue}`);

        return getSetting('https-proxy').then(value => {
            expect(value).toEqual(configuredValue);
        });
    });

    it('should return value without quotes if setting exists with quotes', () => {
        const configuredValue = '"http://user:pass@proxy-host.com:8080"';
        const expectedValue = 'http://user:pass@proxy-host.com:8080';
        fileUtil.readFile = () => Promise.resolve(`https-proxy ${configuredValue}`);

        return getSetting('https-proxy').then(value => {
            expect(value).toEqual(expectedValue);
        });
    });

    it('should return queried setting if multiple settings exist', () => {
        const configContents = 'cafile "/path/to/file"\nproxy "http://localhost:8080"';
        fileUtil.readFile = () => Promise.resolve(configContents);

        return getSetting('proxy').then(value => {
            expect(value).toEqual('http://localhost:8080');
        });
    });
});

describe('optionsToEnv', () => {
    it('should return empty object if no options provided', () => {
        return optionsToEnv().then(args => {
            expect(args).toEqual({});
        });
    });

    it('should return empty object if httpsProxy option is not provided', () => {
        return optionsToEnv({}).then(args => {
            expect(args).toEqual({});
        });
    });

    it('should return empty object if httpsProxy option provided, but already configured in .yarnrc', () => {
        fileUtil.readFile = () => Promise.resolve('https-proxy http://localhost:8080');

        return optionsToEnv({
            httpsProxy: 'http://localhost:8080',
        }).then(args => {
            expect(args).toEqual({});
        });
    });

    it('should return YARN_HTTPS_PROXY env if httpsProxy option provided, and not configured in .yarnrc', () => {
        fileUtil.readFile = () => Promise.resolve();

        return optionsToEnv({
            httpsProxy: 'http://localhost:8080',
        }).then(args => {
            expect(args).toEqual({
                YARN_HTTPS_PROXY: 'http://localhost:8080',
            });
        });
    });

    it('should return YARN_HTTPS_PROXY env if httpsProxy option provided, and not able to read .yarnrc', () => {
        fileUtil.readFile = () => Promise.reject(new Error('Read error'));

        return optionsToEnv({
            httpsProxy: 'http://localhost:8080',
        }).then(args => {
            expect(args).toEqual({
                YARN_HTTPS_PROXY: 'http://localhost:8080',
            });
        });
    });
});
