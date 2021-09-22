/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { Iterable } from 'immutable';
import { bool, func, instanceOf, oneOfType, string } from 'prop-types';

import HotkeyedDropdown from '../../components/HotkeyedDropdown';
import portPath from '../../portPath';

const SEGGER_VENDOR_IDS = new Set(['0x1366', '1366']);

function filterSeggerPorts(port) {
    return SEGGER_VENDOR_IDS.has(port.vendorId);
}

class SerialPortSelector extends React.Component {
    renderSerialPortItems() {
        const { ports, onSelect, isLoading, menuItemCssClass, filter } =
            this.props;

        if (!isLoading) {
            return ports.filter(filter).map(port => (
                <Dropdown.Item
                    key={portPath(port)}
                    className={menuItemCssClass}
                    eventKey={portPath(port)}
                    onSelect={() => onSelect(port)}
                >
                    <div>{portPath(port)}</div>
                    <div style={{ fontSize: 'small' }}>
                        {port.serialNumber || ''}
                    </div>
                </Dropdown.Item>
            ));
        }
        return null;
    }

    renderCloseItem() {
        const { selectedPort, isLoading, onDeselect, menuItemCssClass } =
            this.props;

        if (selectedPort && !isLoading) {
            return (
                <Dropdown.Item
                    className={menuItemCssClass}
                    eventKey="Close serial port"
                    onSelect={onDeselect}
                >
                    <div>Close serial port</div>
                </Dropdown.Item>
            );
        }
        return null;
    }

    render() {
        const {
            selectedPort,
            showPortIndicator,
            portIndicatorStatus,
            onToggle,
            isExpanded,
            cssClass,
        } = this.props;

        const selectorText = selectedPort || 'Select serial port';
        const indicatorCssClass = `core-serial-port-indicator ${portIndicatorStatus}`;

        return (
            <div className={cssClass}>
                <HotkeyedDropdown
                    id="serial-port-selector"
                    open={isExpanded}
                    onToggle={onToggle}
                    hotkey="Alt+P"
                    title={`${selectorText}`}
                >
                    {this.renderSerialPortItems()}
                    {this.renderCloseItem()}
                </HotkeyedDropdown>
                {showPortIndicator ? (
                    <div className={indicatorCssClass} />
                ) : (
                    <div />
                )}
            </div>
        );
    }
}

SerialPortSelector.propTypes = {
    ports: oneOfType([instanceOf(Array), instanceOf(Iterable)]).isRequired,
    selectedPort: string,
    showPortIndicator: bool,
    portIndicatorStatus: string,
    isLoading: bool,
    isExpanded: bool,
    onToggle: func.isRequired,
    onSelect: func.isRequired,
    onDeselect: func.isRequired,
    cssClass: string,
    menuItemCssClass: string,
    filter: func,
};

SerialPortSelector.defaultProps = {
    selectedPort: '',
    showPortIndicator: true,
    isExpanded: false,
    isLoading: false,
    portIndicatorStatus: 'off',
    cssClass: 'core-padded-row core-serial-port-selector',
    menuItemCssClass: 'btn-primary',
    filter: filterSeggerPorts,
};

export default SerialPortSelector;
