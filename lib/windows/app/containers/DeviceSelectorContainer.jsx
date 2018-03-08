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

import DeviceLister from 'nrf-device-lister';

import React from 'react';
import PropTypes from 'prop-types';

import DeviceSelector from '../components/DeviceSelector';
import { connect } from '../../../util/apps';
import { logger } from '../../../api/logging';
import withHotkey from '../../../util/withHotkey';

/*
 * Stateful device selector.
 *
 * Displays a drop-down list of nRF devices so the user can choose one of
 * them.
 *
 * This uses nrf-device-lister under the hood. Depending on what kind
 * of devices the application needs, developers can specify a `traits`
 * object (e.g. look only for serial ports, look only for j-link probes, look
 * for several things at once). This will be passed to nrf-device-lister.
 *
 * Interaction-wise, this component does two things and two things *only*:
 * - Dispatch a DEVICE_SELECTED action whenever the user selects
 *     a device from the drop-down list. This action has a `device` property
 *     containing the data structure for the device as given by
 *     nrf-device-lister.
 * - Dispatch a DEVICE_DESELECTED action whenever the user selects the
 *     "close device" option from the drop-down list, or whenever the
 *     user selects a different device, or when the device is physically
 *     disconnected.
 *
 * This file implements the logic. The view/rendering/template/whatchacallit
 * stays in ../components/DeviceSelector
 */

class DeviceSelectorContainer extends React.Component {
    constructor(props) {
        super(props);

        this.deviceLister = new DeviceLister(props.traits);

        this.state = {
            devices: [],
            selectedSerialNumber: undefined,
        };

        this.deviceLister.on('conflated', devices => {
            this.setState(prev => ({ ...prev, devices }));

            // Maybe the user has physically disconnected the currently selected device
            if (this.state.selectedSerialNumber !== undefined &&
                !devices.has(this.state.selectedSerialNumber)) {
                this.onDeselect();
            }
        });

        this.deviceLister.on('error', err => {
            if (err.usb) {
                const usbAddr = `${err.usb.device.busNumber}.${err.usb.device.deviceAddress}`;

                let errMsg = (`Error while probing usb device at bus.address ${usbAddr}. `);
                if (process.platform === 'linux') {
                    errMsg += 'Please check your udev rules concerning permissions for USB devices, see https://github.com/NordicSemiconductor/nrf-udev';
                } else if (process.platform === 'win32') {
                    errMsg += 'Please check that a libusb-compatible kernel driver is bound to this device.';
                }

                logger.error(err.error.toString());
                logger.error(errMsg);
            } else {
                logger.error(`Error while probing devices: ${err.error}`);
            }
        });

        this.deviceLister.start();
    }

    componentDidMount() {
        this.props.bindHotkey('alt+p', () => {
            this.onToggle();
        });
    }


    /*
     * Called from the templated selector.
     * Shall receive a device definition.
     * Resets the internal state, and calls the downstream onSelect().
     * Note that this.onSelect() is different from this.props.onSelect(),
     * the later one is the one that actually triggers the action.
     */
    onSelect(device) {
        if (this.state.selectedSerialNumber) {
            this.onDeselect();
        }
        this.setState(prev => ({ ...prev, selectedSerialNumber: device.serialNumber }));
        this.props.onSelect(device);
    }

    /*
     * Called from the templated selector.
     * Resets the internal state, and calls the downstream onDeselect().
     * Note that this.onDeselect() is different from this.props.onDeselect(),
     * the later one is the one that actually triggers the action.
     */
    onDeselect() {
        this.setState(prev => ({ ...prev, selectedSerialNumber: undefined }));
        this.props.onDeselect();
    }

    onToggle() {
        this.setState(prev => ({ ...prev, isExpanded: !prev.isExpanded }));
    }

    /*
     * Returns the JSX corresponding to a drop-down menu.
     * Prepares some properties for the template, uses it.
     */
    render() {
        let togglerText;
        if (this.state.selectedSerialNumber) {
            togglerText = this.state.selectedSerialNumber.toString();
        } else if (this.state.devices.size === 0) {
            togglerText = 'No devices available';
        } else {
            togglerText = 'Select device';
        }

        const displayCloseItem = Boolean(this.state.selectedSerialNumber);
        const devices = Array.from(this.state.devices.values());

        const templateProps = {
            ...this.props,
            togglerText,
            displayCloseItem,
            devices,
            onSelect: device => { this.onSelect(device); },
            onDeselect: () => { this.onDeselect(); },
            onToggle: () => { this.onToggle(); },
            isExpanded: this.state.isExpanded,
        };

        return (
            <DeviceSelector {...templateProps} />
        );
    }
}

DeviceSelectorContainer.propTypes = {
    onSelect: PropTypes.func.isRequired,
    onDeselect: PropTypes.func.isRequired,
    bindHotkey: PropTypes.func.isRequired,
    traits: PropTypes.shape({}),
};

DeviceSelectorContainer.defaultProps = {
    traits: undefined,
};

function mapDispatchToProps(dispatch) {
    return {
        onSelect: device =>
            dispatch({
                type: 'DEVICE_SELECTED',
                device,
            }),
        onDeselect: () =>
            dispatch({
                type: 'DEVICE_DESELECTED',
            }),
    };
}

export default connect(
    args => args,
    mapDispatchToProps,
)(withHotkey(DeviceSelectorContainer), 'DeviceSelector');
