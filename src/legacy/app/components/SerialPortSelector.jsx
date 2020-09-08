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
import PropTypes from 'prop-types';
import Dropdown from 'react-bootstrap/Dropdown';
import { Iterable } from 'immutable';

import portPath from '../../portPath';
import HotkeyedDropdown from '../../components/HotkeyedDropdown';

const SEGGER_VENDOR_IDS = new Set(['0x1366', '1366']);

function filterSeggerPorts(port) {
    return SEGGER_VENDOR_IDS.has(port.vendorId);
}

class SerialPortSelector extends React.Component {
    renderSerialPortItems() {
        const {
            ports,
            onSelect,
            isLoading,
            menuItemCssClass,
            filter,
        } = this.props;

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
        const {
            selectedPort,
            isLoading,
            onDeselect,
            menuItemCssClass,
        } = this.props;

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
    ports: PropTypes.oneOfType([
        PropTypes.instanceOf(Array),
        PropTypes.instanceOf(Iterable),
    ]).isRequired,
    selectedPort: PropTypes.string,
    showPortIndicator: PropTypes.bool,
    portIndicatorStatus: PropTypes.string,
    isLoading: PropTypes.bool,
    isExpanded: PropTypes.bool,
    onToggle: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    onDeselect: PropTypes.func.isRequired,
    cssClass: PropTypes.string,
    menuItemCssClass: PropTypes.string,
    filter: PropTypes.func,
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
