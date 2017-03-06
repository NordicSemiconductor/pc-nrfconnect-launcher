import path from 'path';
import { getVersionInfo, program } from '../probe';
import { getPluginDir } from '../../util/plugins';

function getPathRelativeToPlugin(firmwarePath) {
    if (firmwarePath) {
        return path.join(getPluginDir(), firmwarePath);
    }
    return null;
}

/**
 * Programs the given serial number by using the hex files provided in options.
 * The devkit family of the given serial number is automatically detected. Hex
 * file for at least one family has to be provided in options.
 *
 * Available options:
 * - {string} nrf51: Path to firmware hex file for nRF51.
 * - {string} nrf52: Path to firmware hex file for nRF52.
 * - {boolean} isRelativeToPlugin: Whether or not paths are relative to the
 *             plugin directory. Default: true.
 *
 * @param {string} serialNumber The serial number that should be programmed.
 * @param {Object} options Options for programming.
 * @returns {Promise} Promise that resolves if ok, rejects if error.
 */
function programWithHexFile(serialNumber, options) {
    let nrf51Path = options.nrf51;
    let nrf52Path = options.nrf52;
    if (options.isRelativeToPlugin !== false) {
        nrf51Path = getPathRelativeToPlugin(options.nrf51);
        nrf52Path = getPathRelativeToPlugin(options.nrf52);
    }
    return program(serialNumber, {
        0: nrf51Path || '',
        1: nrf52Path || '',
        filecontent: false,
    });
}

/**
 * Programs the given serial number by using hex strings provided in options.
 * The devkit family of the given serial number is automatically detected. Hex
 * content for at least one family has to be provided in options.
 *
 * Available options:
 * - {string} nrf51: Firmware hex content for nRF51.
 * - {string} nrf52: Firmware hex content for nRF52.
 *
 * @param {string} serialNumber The serial number that should be programmed.
 * @param {Object} options Options for programming.
 * @returns {Promise} Promise that resolves if ok, rejects if error.
 */
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
