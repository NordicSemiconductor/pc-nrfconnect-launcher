/* Copyright (c) 2018, Nordic Semiconductor ASA
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
import PropTypes from 'prop-types';
import Dropdown from 'react-bootstrap/Dropdown';
import { Iterable } from 'immutable';

import HotkeyedDropdown from '../../components/HotkeyedDropdown';
import portPath from '../../portPath';

// Stateless, templating-only component. Used only from ../containers/DeviceSelectorContainer
export default class DeviceSelector extends React.Component {
    /**
     * Returns an array of JSX that corresponds to the list of serialports
     * of a device definition from nrf-device-lister
     *
     * @param {Object} device The device to render as a menu item.
     * @returns {*} Array of 'serialport: ...' JSX item
     */
    static mapSerialPortsToListItems(device) {
        return Object.keys(device)
            .filter(key => key.startsWith('serialport'))
            .map(key => (
                <li key={key}>Serial port: {portPath(device[key])}</li>
            ));
    }

    componentDidMount() {
        const { onMount } = this.props;
        onMount();
    }

    componentWillUnmount() {
        const { onUnmount } = this.props;
        onUnmount();
    }

    /**
     * Returns the JSX that corresponds to a "Close device" menu item.
     * If no device is selected, then no close item is rendered.
     *
     * @returns {*} A 'close device' menu item.
     */
    getCloseItem() {
        const { onDeselect, menuItemCssClass } = this.props;

        return [
            <Dropdown.Divider key="close-divider" />,
            <Dropdown.Item
                key="close-device"
                className={menuItemCssClass}
                eventKey="Close device"
                onSelect={onDeselect}
            >
                <div>Close device</div>
            </Dropdown.Item>,
        ];
    }

    /**
     * Given a device definition from nrf-device-lister, returns the JSX
     * that corresponds to a menu entry for that device.
     *
     * @param {Object} device The device to render as a menu item.
     * @returns {*} One menu item element.
     */
    getItemFromDevice(device) {
        const {
            onSelect,
            menuItemCssClass,
            menuItemDetailsCssClass,
        } = this.props;

        const menuItemCssClassWithTraits = [
            menuItemCssClass,
            ...device.traits,
        ].join(' ');
        return (
            <Dropdown.Item
                key={device.serialNumber}
                className={menuItemCssClassWithTraits}
                onSelect={() => onSelect(device)}
            >
                <div>
                    {device.serialNumber}
                    <span>{device.boardVersion}</span>
                </div>
                <ul className={menuItemDetailsCssClass}>
                    {DeviceSelector.mapSerialPortsToListItems(device)}
                    {device.usb ? (
                        <li>
                            USB: {device.usb.manufacturer} {device.usb.product}
                        </li>
                    ) : null}
                </ul>
            </Dropdown.Item>
        );
    }

    /*
     * Returns the JSX corresponding to a drop-down menu.
     */
    render() {
        const {
            cssClass,
            selectedSerialNumber,
            devices,
            showPortIndicator,
            portIndicatorStatus,
        } = this.props;

        const hasDevices = devices && (devices.length > 0 || devices.size > 0);
        let togglerText;

        let displayCloseItem = false;
        if (selectedSerialNumber) {
            togglerText = selectedSerialNumber;
            displayCloseItem = true;
        } else if (!hasDevices) {
            togglerText = 'No devices available';
        } else {
            togglerText = 'Select device';
        }
        const indicatorCssClass = `core-device-port-indicator ${portIndicatorStatus}`;

        return (
            <>
                <HotkeyedDropdown
                    id="device-selector"
                    className={cssClass}
                    disabled={!hasDevices}
                    hotkey="Alt+P"
                    title={`${togglerText}`}
                >
                    {devices.map(device => this.getItemFromDevice(device))}
                    {displayCloseItem ? this.getCloseItem() : null}
                </HotkeyedDropdown>
                {showPortIndicator ? (
                    <div className={indicatorCssClass} />
                ) : (
                    <div />
                )}
            </>
        );
    }
}

DeviceSelector.propTypes = {
    onSelect: PropTypes.func.isRequired,
    onDeselect: PropTypes.func.isRequired,
    cssClass: PropTypes.string,
    menuItemCssClass: PropTypes.string,
    menuItemDetailsCssClass: PropTypes.string,
    showPortIndicator: PropTypes.bool,
    portIndicatorStatus: PropTypes.string,
    devices: PropTypes.oneOfType([
        PropTypes.instanceOf(Array),
        PropTypes.instanceOf(Iterable),
    ]).isRequired,
    selectedSerialNumber: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
    onMount: PropTypes.func,
    onUnmount: PropTypes.func,
};

DeviceSelector.defaultProps = {
    cssClass: 'core-padded-row core-device-selector',
    menuItemCssClass: 'core-device-selector-item btn-primary',
    menuItemDetailsCssClass: 'core-device-selector-item-details',
    showPortIndicator: true,
    portIndicatorStatus: 'off',
    selectedSerialNumber: undefined,
    onMount: () => {},
    onUnmount: () => {},
};
