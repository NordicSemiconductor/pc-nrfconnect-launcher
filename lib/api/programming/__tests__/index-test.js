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
