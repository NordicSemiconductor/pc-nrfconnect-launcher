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
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Dropdown, MenuItem } from 'react-bootstrap';
import DropdownToggle from 'react-bootstrap/lib/DropdownToggle';
import DropdownMenu from 'react-bootstrap/lib/DropdownMenu';
import { Iterable } from 'immutable';

import { logger } from '../../../api/logging';
import * as DeviceActions from '../actions/deviceActions';
import { connect } from '../../../util/apps';


class CapabilitiesDeviceSelector extends React.Component {
    constructor(props) {
        super(props);

// debugger;
        this.deviceLister = new DeviceLister(props.capabilities);

        this.state = {
            devices: [],
            selectedSerialNumber: undefined,
        };

        this.deviceLister.on('conflated', devices => {
            this.setState((prev, props) => {
//                 debugger;

                logger.info(`Changes in available devices. Now ${Array.from(devices).length} devices.`);

                return { ...prev, devices };
            });
        });

        this.deviceLister.on('error', err => {
            if (err.usb) {
                const usbAddr = `${err.usb.device.busNumber}.${err.usb.device.deviceAddress}`;

                let errMsg = (`Error while probing usb device at bus.address ${usbAddr}. `);
                if (process.platform === 'linux') {
                    errMsg += 'Please check your udev rules concerning permissions for USB devices.';
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

    /**
     * Given a device definition from nrf-device-lister, returns the JSX
     * that corresponds to a menu entry for that device.
     *
     * @param {Object} device The device to render as a menu item.
     * @returns {*} One menu item element.
     */
    getItemFromDevice([serialNumber, device]) {
        const {
            onSelect,
            onDeselect,
            menuItemCssClass,
            menuItemDetailsCssClass,
        } = this.props;

        const details = '';

        const onSelectItem = () => {
            this.setState((prev, props) => {
                logger.info(`Selecting device with s/n ${device.serialNumber}`);
                return { ...prev, selectedSerialNumber: device.serialNumber };
            });
            if (this.state.selectedSerialNumber) { onDeselect(); }
            onSelect(device);
        };

//         const name = deviceNameParser(device);
//         const details = deviceDetailsParser(device);
        return (
            <MenuItem
                key={serialNumber}
                className={menuItemCssClass}
                onSelect={() => onSelectItem()}
            >
                <div>{ device.serialNumber }</div>
                <ul>
                    { device.serialport ? (<li>Serial port: {device.serialport.comName}</li>) : null }
                    { device.usb ? (<li>USB: {device.usb.manufacturer} {device.usb.product}</li>) : null }
                    { device.jlink ? (<li>Debug probe</li>) : null }
                </ul>
            </MenuItem>
        );
    }

    /**
     * Returns the JSX that corresponds to a "Close device" menu item.
     * If no device is selected, then no close item is rendered.
     *
     * @returns {*} A 'close device' menu item.
     */
    getCloseItem() {
        const {
            onDeselect,
            menuItemCssClass,
        } = this.props;

        const onDeselectItem = () => {
            this.setState((prev, props) => {
                logger.info('Deselecting device');
                return { ...prev, selectedSerialNumber: undefined };
            });
            onDeselect();
        };

        return ([
            <MenuItem key="close-device-divider" divider />,
            <MenuItem
                key="close-device"
                className={menuItemCssClass}
                eventKey="Close device"
                onSelect={onDeselectItem}
            >
                <div>Close device</div>
            </MenuItem>,
        ]);
    }

    /*
     * Returns the JSX corresponding to a drop-down menu.
     */
    render() {
        const {
//             selectedDevice,
//             toggleExpanded,
//             isExpanded,
//             hotkeyExpand,
            cssClass,
            dropdownCssClass,
            dropdownMenuCssClass,
            deviceNameParser,
        } = this.props;

//         debugger;

//         const selectorText = selectedDevice ? deviceNameParser(selectedDevice) : 'Select device';

        const togglerText = this.state.selectedSerialNumber ?
            this.state.selectedSerialNumber.toString() :
            'Select device';

        const closeItem = this.state.selectedSerialNumber ? this.getCloseItem() : '';
        const devices = Array.from(this.state.devices);

        return (
            <Dropdown id="device-selector" className={cssClass}>
                <DropdownToggle
                    className={dropdownCssClass}
                    title={togglerText}
                />
                <DropdownMenu
                    id="device-selector-list"
                    className={dropdownMenuCssClass}
                >
                    { devices.map(this.getItemFromDevice.bind(this)) }
                    { closeItem }
                </DropdownMenu>
            </Dropdown>
        );
    }
}

DeviceSelector.propTypes = {
//     devices: PropTypes.oneOfType([
//         PropTypes.instanceOf(Array),
//         PropTypes.instanceOf(Iterable),
//     ]).isRequired,
//     selectedDevice: PropTypes.shape({
//         serialNumber: PropTypes.serialNumber,
//     }),
//     isLoading: PropTypes.bool,
//     isExpanded: PropTypes.bool,
//     isSerialPortVerificationEnabled: PropTypes.bool,
//     toggleExpanded: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    onDeselect: PropTypes.func.isRequired,
//     bindHotkey: PropTypes.func.isRequired,
//     hotkeyExpand: PropTypes.string,
    cssClass: PropTypes.string,
    dropdownCssClass: PropTypes.string,
    dropdownMenuCssClass: PropTypes.string,
    menuItemCssClass: PropTypes.string,
    menuItemDetailsCssClass: PropTypes.string,
//     filter: PropTypes.func,
//     compareFunction: PropTypes.func,
//     deviceNameParser: PropTypes.func,
//     deviceDetailsParser: PropTypes.func,
//     deviceKeyParser: PropTypes.func,
};

DeviceSelector.defaultProps = {
//     selectedDevice: null,
//     isExpanded: false,
//     isLoading: false,
//     isSerialPortVerificationEnabled: true,
//     indicatorStatus: 'off',
//     hotkeyExpand: 'Alt+P',
    cssClass: 'core-padded-row',
    dropdownCssClass: 'core-device-selector core-btn btn-primary',
    dropdownMenuCssClass: 'core-dropdown-menu',
    menuItemCssClass: 'core-device-selector-item btn-primary',
    menuItemDetailsCssClass: 'core-device-selector-item-details',
//     filter: deviceFilter,
//     compareFunction: deviceCompareFunction,
//     deviceNameParser: selectorTypeDisplayName,
//     deviceDetailsParser: selectorTypeDisplayDetails,
//     deviceKeyParser: selectorTypeKey,
};

// export default CapabilitiesDeviceSelector;


function mapDispatchToProps(dispatch) {
    return {
        onSelect: (device, verifySerialPortAvailable) =>
            dispatch(DeviceActions.selectDevice(device, verifySerialPortAvailable)),
        onDeselect: () => dispatch(DeviceActions.deselectDevice()),
//         toggleExpanded: () => dispatch(DeviceActions.toggleSelectorExpanded()),
    };
}

export default connect(
    args => args,
    mapDispatchToProps,
)(CapabilitiesDeviceSelector, 'DeviceSelector');

