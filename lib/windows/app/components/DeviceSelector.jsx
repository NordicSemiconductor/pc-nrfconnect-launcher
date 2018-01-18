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

import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Dropdown, MenuItem } from 'react-bootstrap';
import DropdownToggle from 'react-bootstrap/lib/DropdownToggle';
import DropdownMenu from 'react-bootstrap/lib/DropdownMenu';
import { Iterable } from 'immutable';

const VENDOR_ID_NORDIC = 0x1915;
const VENDOR_ID_SEGGER = 0x1366;

/**
 * Default filtering of what to show in the device selector. Can be
 * overridden by passing a custom `filter` function as a prop to
 * DeviceSelector.
 *
 * @param {Object} device The device to be filtered.
 * @returns {boolean} True if the device should be shown, false if not.
 */
function deviceFilter(device) {
    return device && !!device.serialNumber &&
        [VENDOR_ID_NORDIC, VENDOR_ID_SEGGER].includes(device.vendorId);
}

/**
 * Default compare function to use when sorting devices in the selector.
 * Can be overridden by passing a custom `compareFunction` as a prop to
 * DeviceSelector.
 *
 * @param {Object} deviceA A device.
 * @param {Object} deviceB Another device to be compared with deviceA.
 * @returns {number} -1 if A should be sorted before B, +1 if B should be
 *     sorted before A, or 0 if the devices are equal.
 */
function deviceCompareFunction(deviceA, deviceB) {
    if (deviceA.serialNumber < deviceB.serialNumber) {
        return -1;
    }
    if (deviceA.serialNumber > deviceB.serialNumber) {
        return 1;
    }
    return 0;
}

/**
 * Default name to show for each device. Can be overridden by passing
 * a custom `deviceNameParser` function as a prop to DeviceSelector.
 *
 * @param {Object} device The device to parse a name from.
 * @returns {string} The device name to display.
 */
function getDeviceDisplayName(device) {
    return device.serialNumber;
}

/**
 * Default details to show for each device. Can be overridden by
 * passing a custom `deviceDetailsParser` function as a prop to
 * DeviceSelector.
 *
 * @param {Object} device The device to parse details from.
 * @returns {string} The device details to display.
 */
function getDeviceDisplayDetails(device) {
    return device.comName;
}

/**
 * Default key (identifier) for each device. Must be unique within the
 * device list. Can be overridden by passing a custom `deviceKeyParser`
 * function as a prop to DeviceSelector.
 *
 * @param {Object} device The device to parse a key from.
 * @returns {string} The device key to use.
 */
function getDeviceKey(device) {
    return `usb-${device.busNumber}-${device.deviceAddress}`;
}

/**
 * Component that displays a list of available devices, and allows the
 * user to select and deselect a device.
 *
 * The component receives a list of all available devices, and applies
 * a filter so that only those devices that the app supports are shown.
 * Apps can apply their own filter by passing a custom `filter` function
 * as a prop.
 */
class DeviceSelector extends React.Component {
    componentDidMount() {
        const {
            bindHotkey,
            toggleExpanded,
            hotkeyExpand,
        } = this.props;

        bindHotkey(hotkeyExpand.toLowerCase(), () => {
            // Focusing the dropdown button, so that up/down arrow keys
            // can be used to select device.
            this.focusDropdownButton();
            toggleExpanded();
        });
    }

    /**
     * Focuses the selector dropdown button.
     *
     * @returns {void}
     */
    focusDropdownButton() {
        // eslint-disable-next-line react/no-find-dom-node
        const node = ReactDOM.findDOMNode(this);
        if (node) {
            const button = node.querySelector('button');
            if (button) {
                button.focus();
            }
        }
    }

    /**
     * Render one device menu item based on the configured `deviceNameParser`,
     * `deviceDetailsParser`, and `deviceKeyParser` props. The `onSelect` prop
     * function is invoked when an item is selected.
     *
     * @param {Object} device The device to render as a menu item.
     * @returns {*} One menu item element.
     */
    renderDeviceItem(device) {
        const {
            onSelect,
            isSerialPortVerificationEnabled,
            menuItemCssClass,
            menuItemDetailsCssClass,
            deviceNameParser,
            deviceDetailsParser,
            deviceKeyParser,
        } = this.props;

        const name = deviceNameParser(device);
        const details = deviceDetailsParser(device);
        return (
            <MenuItem
                key={deviceKeyParser(device)}
                className={menuItemCssClass}
                eventKey={deviceKeyParser(device)}
                onSelect={() => onSelect(device, isSerialPortVerificationEnabled)}
            >
                <div>{name}</div>
                {
                    details ?
                        <div className={menuItemDetailsCssClass}>{details}</div> :
                        null
                }
            </MenuItem>
        );
    }

    /**
     * Render device menu items.
     *
     * @returns {*} Array of menu item elements.
     */
    renderDeviceItems() {
        const {
            devices,
            isLoading,
            filter,
            compareFunction,
        } = this.props;

        if (!isLoading) {
            return devices.filter(filter)
                .sort(compareFunction)
                .map(device => this.renderDeviceItem(device));
        }
        return null;
    }

    /**
     * Render a menu item that allows the user to close the selected
     * device. If no device is selected, then no close item is rendered.
     *
     * @returns {*} A 'close device' menu item.
     */
    renderCloseItem() {
        const {
            selectedDevice,
            isLoading,
            onDeselect,
            menuItemCssClass,
        } = this.props;

        if (selectedDevice && !isLoading) {
            return (
                <MenuItem
                    className={menuItemCssClass}
                    eventKey="Close device"
                    onSelect={onDeselect}
                >
                    <div>Close device</div>
                </MenuItem>
            );
        }
        return null;
    }

    render() {
        const {
            selectedDevice,
            toggleExpanded,
            isExpanded,
            hotkeyExpand,
            cssClass,
            dropdownCssClass,
            dropdownMenuCssClass,
            deviceNameParser,
        } = this.props;

        const selectorText = selectedDevice ? deviceNameParser(selectedDevice) : 'Select device';

        return (
            <span title={`Select device (${hotkeyExpand})`}>
                <div className={cssClass}>
                    <Dropdown id="device-selector" open={isExpanded} onToggle={toggleExpanded}>
                        <DropdownToggle
                            className={dropdownCssClass}
                            title={selectorText}
                        />
                        <DropdownMenu
                            id="device-selector-list"
                            className={dropdownMenuCssClass}
                        >
                            { this.renderDeviceItems() }
                            { this.renderCloseItem() }
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </span>
        );
    }
}

DeviceSelector.propTypes = {
    devices: PropTypes.oneOfType([
        PropTypes.instanceOf(Array),
        PropTypes.instanceOf(Iterable),
    ]).isRequired,
    selectedDevice: PropTypes.shape({
        serialNumber: PropTypes.serialNumber,
    }),
    isLoading: PropTypes.bool,
    isExpanded: PropTypes.bool,
    isSerialPortVerificationEnabled: PropTypes.bool,
    toggleExpanded: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    onDeselect: PropTypes.func.isRequired,
    bindHotkey: PropTypes.func.isRequired,
    hotkeyExpand: PropTypes.string,
    cssClass: PropTypes.string,
    dropdownCssClass: PropTypes.string,
    dropdownMenuCssClass: PropTypes.string,
    menuItemCssClass: PropTypes.string,
    menuItemDetailsCssClass: PropTypes.string,
    filter: PropTypes.func,
    compareFunction: PropTypes.func,
    deviceNameParser: PropTypes.func,
    deviceDetailsParser: PropTypes.func,
    deviceKeyParser: PropTypes.func,
};

DeviceSelector.defaultProps = {
    selectedDevice: null,
    isExpanded: false,
    isLoading: false,
    isSerialPortVerificationEnabled: true,
    indicatorStatus: 'off',
    hotkeyExpand: 'Alt+P',
    cssClass: 'core-padded-row',
    dropdownCssClass: 'core-device-selector core-btn btn-primary',
    dropdownMenuCssClass: 'core-dropdown-menu',
    menuItemCssClass: 'core-device-selector-item btn-primary',
    menuItemDetailsCssClass: 'core-device-selector-item-details',
    filter: deviceFilter,
    compareFunction: deviceCompareFunction,
    deviceNameParser: getDeviceDisplayName,
    deviceDetailsParser: getDeviceDisplayDetails,
    deviceKeyParser: getDeviceKey,
};

export default DeviceSelector;
