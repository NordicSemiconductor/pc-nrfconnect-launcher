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

jest.mock('../../probe', () => ({}));
jest.mock('../../../util/plugins', () => ({}));

import probe from '../../probe';
import plugins from '../../../util/plugins';
import { programWithHexFile, programWithHexString } from '../index';

const serialNumber = '1337';

describe('programming.programWithHexFile', () => {
    it('should return error if probe.program() fails', () => {
        probe.program = () => Promise.reject(new Error('Foo'));

        return programWithHexFile(serialNumber, {}).catch(error => {
            expect(error.message).toEqual('Foo');
        });
    });

    it('should invoke probe.program() with filecontent=false and hex file paths relative to plugin', () => {
        plugins.getPluginDir = () => '/path/to/plugin';
        probe.program = jest.fn();
        probe.program.mockReturnValue(Promise.resolve());
        const options = {
            nrf51: './path/to/nrf51.hex',
            nrf52: './path/to/nrf52.hex',
        };

        return programWithHexFile(serialNumber, options).then(() => {
            expect(probe.program).toHaveBeenCalledWith(serialNumber, {
                0: '/path/to/plugin/path/to/nrf51.hex',
                1: '/path/to/plugin/path/to/nrf52.hex',
                filecontent: false,
            });
        });
    });

    it('should invoke probe.program() with filecontent=false and unchanged paths if isRelativeToPlugin=false', () => {
        probe.program = jest.fn();
        probe.program.mockReturnValue(Promise.resolve());
        const options = {
            nrf51: '/path/to/nrf51.hex',
            nrf52: '/path/to/nrf52.hex',
            isRelativeToPlugin: false,
        };

        return programWithHexFile(serialNumber, options).then(() => {
            expect(probe.program).toHaveBeenCalledWith(serialNumber, {
                0: options.nrf51,
                1: options.nrf52,
                filecontent: false,
            });
        });
    });

    it('should invoke probe.program() with empty hex file strings if values are not provided', () => {
        probe.program = jest.fn();
        probe.program.mockReturnValue(Promise.resolve());
        const options = {};

        return programWithHexFile(serialNumber, options).then(() => {
            expect(probe.program).toHaveBeenCalledWith(serialNumber, {
                0: '',
                1: '',
                filecontent: false,
            });
        });
    });
});

describe('programming.programWithHexString', () => {
    it('should return error if probe.program() fails', () => {
        probe.program = () => Promise.reject(new Error('Foo'));

        return programWithHexString(serialNumber, {}).catch(error => {
            expect(error.message).toEqual('Foo');
        });
    });

    it('should invoke probe.program() with provided hex files and filecontent flag set to true', () => {
        probe.program = jest.fn();
        probe.program.mockReturnValue(Promise.resolve());
        const options = {
            nrf51: 'nrf51 hex content',
            nrf52: 'nrf52 hex content',
        };

        return programWithHexString(serialNumber, options).then(() => {
            expect(probe.program).toHaveBeenCalledWith(serialNumber, {
                0: options.nrf51,
                1: options.nrf52,
                filecontent: true,
            });
        });
    });

    it('should invoke probe.program() with empty hex content strings if values are not provided', () => {
        probe.program = jest.fn();
        probe.program.mockReturnValue(Promise.resolve());
        const options = {};

        return programWithHexString(serialNumber, options).then(() => {
            expect(probe.program).toHaveBeenCalledWith(serialNumber, {
                0: '',
                1: '',
                filecontent: true,
            });
        });
    });
});
