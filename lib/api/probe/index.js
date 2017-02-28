import { DebugProbe } from 'pc-nrfjprog-js';
import os from 'os';

const ERROR_MESSAGE = {
    CouldNotLoadDLL: 'Could not load nrfjprog DLL, firmware detection and ' +
        'programming will not be available',
    CouldNotConnectToDevice: 'Could not connect to debug probe, firmware ' +
        'detection and programming will not be available',
    WrongMagicNumber: 'Could not connect to debug probe, firmware detection ' +
        'and programming will not be available',
};

function getBaudRateFromVersionInfo(versionInfo) {
    if (!versionInfo || !versionInfo.baudRate) {
        return os.type() === 'Darwin' ? 115200 : 1000000;
    }
    return versionInfo.baudRate;
}

function parseSerialNumber(serialNumber) {
    const parsedSerial = parseInt(serialNumber, 10);
    if (!parsedSerial) {
        throw new Error(`Invalid serial number: ${serialNumber}`);
    }
    return parsedSerial;
}

function getVersionInfo(serialNumber) {
    return new Promise((resolve, reject) => {
        const probe = new DebugProbe();
        probe.getVersion(parseSerialNumber(serialNumber), (err, versionInfo) => {
            if (err) {
                const errorMessage = ERROR_MESSAGE[err.errcode];
                reject(new Error(errorMessage || `Unknown error when getting version info: ${err.message}`));
            } else {
                resolve(versionInfo);
            }
        });
    });
}

function getBaudRate(serialNumber) {
    return getVersionInfo(serialNumber)
        .then(versionInfo => getBaudRateFromVersionInfo(versionInfo));
}

function program(serialNumber, options) {
    return new Promise((resolve, reject) => {
        const probe = new DebugProbe();
        probe.program(parseSerialNumber(serialNumber), options, err => {
            if (err) {
                reject(new Error(`Unable to program. Error: ${err.message}`));
            } else {
                resolve();
            }
        });
    });
}

export default {
    getVersionInfo,
    getBaudRate,
    program,
};
