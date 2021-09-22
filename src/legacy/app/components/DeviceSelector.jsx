/*
 * Copyright (c) 2018 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { Iterable } from 'immutable';
import { bool, func, instanceOf, number, oneOfType, string } from 'prop-types';

import HotkeyedDropdown from '../../components/HotkeyedDropdown';

const getTraits = traits => {
    return Object.keys(traits).filter(key => traits[key]);
};

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
        return device.serialPorts.map(({ comName: port }) => (
            <li key={port}>Serial port: {port}</li>
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
        const { onSelect, menuItemCssClass, menuItemDetailsCssClass } =
            this.props;
        const menuItemCssClassWithTraits = [
            menuItemCssClass,
            ...getTraits(device.traits),
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
    onSelect: func.isRequired,
    onDeselect: func.isRequired,
    cssClass: string,
    menuItemCssClass: string,
    menuItemDetailsCssClass: string,
    showPortIndicator: bool,
    portIndicatorStatus: string,
    devices: oneOfType([instanceOf(Array), instanceOf(Iterable)]).isRequired,
    selectedSerialNumber: oneOfType([string, number]),
    onMount: func,
    onUnmount: func,
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
