/* Copyright (c) 2016, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 *   1. Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 *   2. Redistributions in binary form, except as embedded into a Nordic
 *   Semiconductor ASA integrated circuit in a product or a software update for
 *   such product, must reproduce the above copyright notice, this list of
 *   conditions and the following disclaimer in the documentation and/or other
 *   materials provided with the distribution.
 *
 *   3. Neither the name of Nordic Semiconductor ASA nor the names of its
 *   contributors may be used to endorse or promote products derived from this
 *   software without specific prior written permission.
 *
 *   4. This software, with or without modification, must only be used with a
 *   Nordic Semiconductor ASA integrated circuit.
 *
 *   5. Any software provided in binary form under this license must not be
 *   reverse engineered, decompiled, modified and/or disassembled.
 *
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 * GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT
 * OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import React, { PropTypes } from 'react';
import { DropdownButton } from 'react-bootstrap';
import { Iterable } from 'immutable';
import AdapterSelectorItem from './AdapterSelectorItem';

class AdapterSelector extends React.Component {
    componentDidMount() {
        const {
            bindHotkey,
            toggleExpanded,
            hotkeyExpand,
        } = this.props;

        bindHotkey(hotkeyExpand.toLowerCase(), toggleExpanded);
    }

    renderAdapterItems() {
        const {
            adapters,
            onSelect,
            isLoading,
        } = this.props;

        if (!isLoading) {
            return adapters.map(adapter => (
                <AdapterSelectorItem
                    key={adapter.comName}
                    adapter={adapter}
                    onSelect={onSelect}
                />
            ));
        }
        return null;
    }

    renderCloseItem() {
        const {
            selectedAdapter,
            onDeselect,
        } = this.props;

        if (selectedAdapter) {
            return (
                <AdapterSelectorItem
                    key="closeAdapter"
                    adapter={{
                        comName: 'Close adapter',
                        serialNumber: '',
                    }}
                    onSelect={onDeselect}
                />
            );
        }
        return null;
    }

    render() {
        const {
            selectedAdapter,
            adapterIndicator,
            toggleExpanded,
            isExpanded,
            hotkeyExpand,
        } = this.props;

        const selectorText = selectedAdapter || 'Select serial port';

        return (
            <span title={`Select serial port (${hotkeyExpand})`}>
                <div className="padded-row">
                    <DropdownButton
                        id="navbar-dropdown"
                        className="btn-primary btn-nordic"
                        title={selectorText}
                        open={isExpanded}
                        onToggle={toggleExpanded}
                    >
                        { this.renderAdapterItems() }
                        { this.renderCloseItem() }
                    </DropdownButton>
                    <div className={`indicator ${adapterIndicator}`} />
                </div>
            </span>
        );
    }
}

AdapterSelector.propTypes = {
    adapters: PropTypes.oneOfType([
        PropTypes.instanceOf(Array),
        PropTypes.instanceOf(Iterable),
    ]).isRequired,
    selectedAdapter: PropTypes.string,
    adapterIndicator: PropTypes.string,
    isLoading: PropTypes.bool,
    isExpanded: PropTypes.bool,
    toggleExpanded: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    onDeselect: PropTypes.func.isRequired,
    bindHotkey: PropTypes.func.isRequired,
    hotkeyExpand: PropTypes.string,
};

AdapterSelector.defaultProps = {
    selectedAdapter: '',
    isExpanded: false,
    isLoading: false,
    adapterIndicator: 'off',
    hotkeyExpand: 'Alt+P',
};

export default AdapterSelector;
