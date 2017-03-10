import { programming, logger } from '../api';
import { getPluginConfig } from '../util/plugins';
import * as SerialPortActions from './serialPortActions';

export const FIRMWARE_DIALOG_SHOW = 'FIRMWARE_DIALOG_SHOW';
export const FIRMWARE_DIALOG_HIDE = 'FIRMWARE_DIALOG_HIDE';
export const FIRMWARE_DIALOG_UPDATE_REQUESTED = 'FIRMWARE_DIALOG_UPDATE_REQUESTED';
export const FIRMWARE_DIALOG_UPDATE_SUCCESS = 'FIRMWARE_DIALOG_UPDATE_SUCCESS';
export const FIRMWARE_DIALOG_UPDATE_ERROR = 'FIRMWARE_DIALOG_UPDATE_ERROR';

function program(serialNumber) {
    const config = getPluginConfig();
    if (config.firmwareData) {
        return programming.programWithHexString(serialNumber, config.firmwareData);
    } else if (config.firmwarePaths) {
        return programming.programWithHexFile(serialNumber, config.firmwarePaths);
    }
    return Promise.reject(new Error('None of \'config.firmwareData\' or \'config.firmwarePaths\'' +
        ' were provided by plugin.'));
}

export function showDialog(port) {
    return {
        type: FIRMWARE_DIALOG_SHOW,
        port,
    };
}

export function hideDialog() {
    return {
        type: FIRMWARE_DIALOG_HIDE,
    };
}

export function firmwareUpdateRequested() {
    return {
        type: FIRMWARE_DIALOG_UPDATE_REQUESTED,
    };
}

export function firmwareUpdateSuccess() {
    return {
        type: FIRMWARE_DIALOG_UPDATE_SUCCESS,
    };
}

export function firmwareUpdateError(message) {
    return {
        type: FIRMWARE_DIALOG_UPDATE_ERROR,
        message,
    };
}

export function updateFirmware(port) {
    return dispatch => {
        dispatch(firmwareUpdateRequested());
        program(port.serialNumber)
            .then(() => {
                dispatch(firmwareUpdateSuccess());
                dispatch(SerialPortActions.selectPort(port));
            })
            .catch(error => {
                logger.error(`Unable to update firmware for ${port.serialNumber}: ${error.message}`);
                dispatch(firmwareUpdateError(error.message));
            });
    };
}
