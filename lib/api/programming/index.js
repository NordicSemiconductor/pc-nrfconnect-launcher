import { getVersionInfo, program } from '../probe';

function programWithHexFile(serialNumber, options) {
    return program(serialNumber, {
        0: options.nrf51 || '',
        1: options.nrf52 || '',
        filecontent: false,
    });
}

function programWithHexString(serialNumber, options) {
    return program(serialNumber, {
        0: options.nrf51 || '',
        1: options.nrf52 || '',
        filecontent: true,
    });
}

export default {
    programWithHexFile,
    programWithHexString,
    getVersionInfo,
};
