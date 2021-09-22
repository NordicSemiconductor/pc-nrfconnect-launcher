/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { logger } from 'pc-nrfconnect-shared';
import SerialPort from 'serialport';

import { decorateWithSerialNumber, isPortAvailable } from '../../api/jlink';
import portPath from '../../portPath';

/**
 * Indicates that loading all available serial ports has been requested. This action is
 * normally followed by either SERIAL_PORTS_LOAD_SUCCESS or SERIAL_PORTS_LOAD_ERROR
 * to indicate success or failure.
 */
export const SERIAL_PORTS_LOAD = 'SERIAL_PORTS_LOAD';

/**
 * Indicates that loading of serial ports was successful.
 *
 * @param {Array} ports Array of serial port objects, ref. the serialport library.
 */
export const SERIAL_PORTS_LOAD_SUCCESS = 'SERIAL_PORTS_LOAD_SUCCESS';

/**
 * Indicates that loading of serial ports failed.
 *
 * @param {string} message Error message from the subsystem.
 */
export const SERIAL_PORTS_LOAD_ERROR = 'SERIAL_PORTS_LOAD_ERROR';

/**
 * Indicates that the expanded state of the SerialPortSelector was toggled.
 */
export const SERIAL_PORT_SELECTOR_TOGGLE_EXPANDED =
    'SERIAL_PORT_SELECTOR_TOGGLE_EXPANDED';

/**
 * Indicates that a serial port was selected.
 *
 * Apps can listen to this action in their middleware to add custom behavior when
 * the port is selected, f.ex. opening the port or checking its firmware. Apps can
 * also dispatch this action themselves to make the port appear as selected in the
 * SerialPortSelector.
 *
 * @param {Object} port Serial port object, ref. the serialport library.
 */
export const SERIAL_PORT_SELECTED = 'SERIAL_PORT_SELECTED';

/**
 * Indicates that a serial port was deselected.
 *
 * Apps can listen to this action in their middleware to add custom behavior when
 * the port is deselected, f.ex. closing the port. Apps can also dispatch this action
 * themselves to clear a selection in the SerialPortSelector.
 */
export const SERIAL_PORT_DESELECTED = 'SERIAL_PORT_DESELECTED';

function loadPortsAction() {
    return {
        type: SERIAL_PORTS_LOAD,
    };
}

function loadPortsSuccessAction(ports) {
    return {
        type: SERIAL_PORTS_LOAD_SUCCESS,
        ports,
    };
}

function loadPortsErrorAction(message) {
    return {
        type: SERIAL_PORTS_LOAD_ERROR,
        message,
    };
}

function selectorToggleExpandedAction() {
    return {
        type: SERIAL_PORT_SELECTOR_TOGGLE_EXPANDED,
    };
}

export function selectPortAction(port) {
    return {
        type: SERIAL_PORT_SELECTED,
        port,
    };
}

export function loadPorts() {
    return dispatch => {
        dispatch(loadPortsAction());

        SerialPort.list()
            .then(decorateWithSerialNumber)
            .then(finalPorts => dispatch(loadPortsSuccessAction(finalPorts)))
            .catch(error => loadPortsErrorAction(error.message));
    };
}

export function toggleSelectorExpanded() {
    return (dispatch, getState) => {
        const state = getState();
        if (!state.core.serialPort.isSelectorExpanded) {
            dispatch(loadPorts());
        }
        dispatch(selectorToggleExpandedAction());
    };
}

export function selectPort(port) {
    return dispatch => {
        isPortAvailable(portPath(port))
            .then(() => dispatch(selectPortAction(port)))
            .catch(error => {
                logger.error(
                    'Unable to open the port. Please power cycle the device and try again.'
                );
                logger.debug(error.message);
            });
    };
}

export function deselectPort() {
    return {
        type: SERIAL_PORT_DESELECTED,
    };
}
