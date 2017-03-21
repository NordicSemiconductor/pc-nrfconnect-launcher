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

import React, { PropTypes } from 'react';
import { Dropdown } from 'react-bootstrap';
import DropdownToggle from 'react-bootstrap/lib/DropdownToggle';
import DropdownMenu from 'react-bootstrap/lib/DropdownMenu';
import { Iterable } from 'immutable';
import SerialPortSelectorItem from './SerialPortSelectorItem';
import { decorate } from '../../../util/plugins';

const DecoratedSerialPortSelectorItem = decorate(SerialPortSelectorItem, 'SerialPortSelectorItem');

class SerialPortSelector extends React.Component {
    componentDidMount() {
        const {
            bindHotkey,
            toggleExpanded,
            hotkeyExpand,
        } = this.props;

        bindHotkey(hotkeyExpand.toLowerCase(), toggleExpanded);
    }

    renderSerialPortItems() {
        const {
            ports,
            onSelect,
            isLoading,
            menuItemCssClass,
        } = this.props;

        if (!isLoading) {
            return ports.map(port => (
                <DecoratedSerialPortSelectorItem
                    key={port.comName}
                    port={port}
                    onSelect={onSelect}
                    cssClass={menuItemCssClass}
                />
            ));
        }
        return null;
    }

    renderCloseItem() {
        const {
            selectedPort,
            onDeselect,
            menuItemCssClass,
        } = this.props;

        if (selectedPort) {
            return (
                <DecoratedSerialPortSelectorItem
                    port={{ comName: 'Close serial port' }}
                    onSelect={onDeselect}
                    cssClass={menuItemCssClass}
                />
            );
        }
        return null;
    }

    render() {
        const {
            selectedPort,
            showPortIndicator,
            portIndicatorStatus,
            toggleExpanded,
            isExpanded,
            hotkeyExpand,
            cssClass,
            dropdownCssClass,
            dropdownMenuCssClass,
        } = this.props;

        const selectorText = selectedPort || 'Select serial port';
        const indicatorCssClass = `core-serial-port-indicator ${portIndicatorStatus}`;

        return (
            <span title={`Select serial port (${hotkeyExpand})`}>
                <div className={cssClass}>
                    <Dropdown id="serial-port-selector" open={isExpanded} onToggle={toggleExpanded}>
                        <DropdownToggle
                            className={dropdownCssClass}
                            title={selectorText}
                        />
                        <DropdownMenu
                            id="serial-port-selector-list"
                            className={dropdownMenuCssClass}
                        >
                            { this.renderSerialPortItems() }
                            { this.renderCloseItem() }
                        </DropdownMenu>
                    </Dropdown>
                    {
                        showPortIndicator ? <div className={indicatorCssClass} /> : <div />
                    }
                </div>
            </span>
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
    toggleExpanded: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    onDeselect: PropTypes.func.isRequired,
    bindHotkey: PropTypes.func.isRequired,
    hotkeyExpand: PropTypes.string,
    cssClass: PropTypes.string,
    dropdownCssClass: PropTypes.string,
    dropdownMenuCssClass: PropTypes.string,
    menuItemCssClass: PropTypes.string,
};

SerialPortSelector.defaultProps = {
    selectedPort: '',
    showPortIndicator: true,
    isExpanded: false,
    isLoading: false,
    portIndicatorStatus: 'off',
    hotkeyExpand: 'Alt+P',
    cssClass: 'core-padded-row',
    dropdownCssClass: 'core-serial-port-selector core-btn btn-primary',
    dropdownMenuCssClass: 'core-dropdown-menu',
    menuItemCssClass: 'btn-primary',
};

export default SerialPortSelector;
