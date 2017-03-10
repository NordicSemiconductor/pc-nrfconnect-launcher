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
/* eslint-disable class-methods-use-this */

jest.mock('pc-nrfjprog-js', () => ({
    DebugProbe: class {},
}));
jest.mock('os', () => ({
    type: () => {},
}));

import nrfjprog from 'pc-nrfjprog-js';
import os from 'os';
import { getVersionInfo, getBaudRate, program } from '../index';

const serialNumber = '1337';

describe('probe.getVersionInfo', () => {
    const createError = errcode => {
        const error = new Error();
        error.errcode = errcode;
        return error;
    };

    it('should throw error if serial number cannot be parsed to integer', () => {
        const invalidSerialNumber = 'foobar';
        return getVersionInfo(invalidSerialNumber).catch(error => {
            expect(error.message).toEqual(`Invalid serial number: ${invalidSerialNumber}`);
        });
    });

    it('should throw error if DebugProbe returns CouldNotLoadDLL error code', () => {
        nrfjprog.DebugProbe = class {
            getVersion(serialNum, callback) {
                callback(createError('CouldNotLoadDLL'));
            }
        };
        return getVersionInfo(serialNumber).catch(error => {
            expect(error.message).toEqual('Could not load nrfjprog DLL, firmware detection ' +
                'and programming will not be available');
        });
    });

    it('should throw error if DebugProbe returns CouldNotConnectToDevice error code', () => {
        nrfjprog.DebugProbe = class {
            getVersion(serialNum, callback) {
                callback(createError('CouldNotConnectToDevice'));
            }
        };
        return getVersionInfo(serialNumber).catch(error => {
            expect(error.message).toEqual('Could not connect to debug probe, firmware detection ' +
                'and programming will not be available');
        });
    });

    it('should throw error if DebugProbe returns WrongMagicNumber error code', () => {
        nrfjprog.DebugProbe = class {
            getVersion(serialNum, callback) {
                callback(createError('WrongMagicNumber'));
            }
        };
        return getVersionInfo(serialNumber).catch(error => {
            expect(error.message).toEqual('Could not connect to debug probe, firmware detection ' +
                'and programming will not be available');
        });
    });

    it('should throw error if DebugProbe returns error without error code', () => {
        nrfjprog.DebugProbe = class {
            getVersion(serialNum, callback) {
                callback(new Error('Foo'));
            }
        };
        return getVersionInfo(serialNumber).catch(error => {
            expect(error.message).toEqual('Unknown error when getting version info: Foo');
        });
    });

    it('should return version info if DebugProbe returns version info', () => {
        const versionInfo = {};
        nrfjprog.DebugProbe = class {
            getVersion(serialNum, callback) {
                callback(null, versionInfo);
            }
        };
        return getVersionInfo(serialNumber).then(result => {
            expect(result).toBe(versionInfo);
        });
    });
});

describe('probe.getBaudRate', () => {
    it('should throw error if DebugProbe returns error', () => {
        nrfjprog.DebugProbe = class {
            getVersion(serialNum, callback) {
                callback(new Error('Foo'));
            }
        };
        return getVersionInfo(serialNumber).catch(error => {
            expect(error.message).toContain('Foo');
        });
    });

    it('should return baud rate if DebugProbe returns version info with baud rate', () => {
        const versionInfo = {
            baudRate: 96000,
        };
        nrfjprog.DebugProbe = class {
            getVersion(serialNum, callback) {
                callback(null, versionInfo);
            }
        };
        return getBaudRate(serialNumber).then(baudRate => {
            expect(baudRate).toBe(versionInfo.baudRate);
        });
    });

    it('should fall back to 115200 if DebugProbe does not return baud rate, and OS is Darwin', () => {
        os.type = () => 'Darwin';
        nrfjprog.DebugProbe = class {
            getVersion(serialNum, callback) {
                callback(null);
            }
        };
        return getBaudRate(serialNumber).then(baudRate => {
            expect(baudRate).toEqual(115200);
        });
    });

    it('should fall back to 1000000 if DebugProbe does not return baud rate, and OS is not Darwin', () => {
        os.type = () => 'FoobarOS';
        nrfjprog.DebugProbe = class {
            getVersion(serialNum, callback) {
                callback(null);
            }
        };
        return getBaudRate(serialNumber).then(baudRate => {
            expect(baudRate).toEqual(1000000);
        });
    });
});

describe('probe.program', () => {
    it('should throw error if serial number cannot be parsed to integer', () => {
        const invalidSerialNumber = 'foobar';
        const options = {};
        return program(invalidSerialNumber, options).catch(error => {
            expect(error.message).toEqual(`Invalid serial number: ${invalidSerialNumber}`);
        });
    });

    it('should throw error if DebugProbe returns error', () => {
        nrfjprog.DebugProbe = class {
            program(serialNum, options, callback) {
                callback(new Error('Foo'));
            }
        };
        const options = {};
        return program(serialNumber, options).catch(error => {
            expect(error.message).toEqual('Unable to program. Error: Foo');
        });
    });
});
