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
