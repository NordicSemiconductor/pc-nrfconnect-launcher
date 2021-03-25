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
import Dropdown from 'react-bootstrap/Dropdown';
import ReactDOM from 'react-dom';
import Mousetrap from 'mousetrap';
import { arrayOf, bool, func, node, oneOfType, string } from 'prop-types';

// Like react-bootstrap's `Dropdown`, but can receive an extra `hotkey` prop:
// a key combination handled by `mousetrap` that will toggle the open state
// of the dropdown.
// Also handles focusing the drop-down on the hotkey.

export default class HotkeyedDropdown extends React.Component {
    constructor(props) {
        super(props);
        this.state = { open: false };
        this.toggle = this.toggle.bind(this);
    }

    componentDidMount() {
        const { hotkey } = this.props;
        Mousetrap.bind(hotkey.toLowerCase(), this.toggle);
    }

    componentWillUnmount() {
        const { hotkey } = this.props;
        Mousetrap.unbind(hotkey.toLowerCase());
    }

    toggle() {
        const { open } = this.state;
        this.setState({ open: !open });

        if (open) {
            // Focus the drop-down
            // eslint-disable-next-line react/no-find-dom-node
            const thisNode = ReactDOM.findDOMNode(this);
            if (thisNode) {
                const button = thisNode.querySelector('button');
                if (button) {
                    button.focus();
                }
            }
        }

        const { onToggle } = this.props;
        onToggle();
    }

    render() {
        const { hotkey, disabled, title, children, ...childProps } = this.props;
        const { open } = this.state;
        return (
            <Dropdown
                {...childProps}
                disabled={disabled}
                show={open && !disabled}
                onToggle={this.toggle}
            >
                <Dropdown.Toggle title={`${title} (${hotkey})`}>
                    {title}
                </Dropdown.Toggle>
                <Dropdown.Menu>{children}</Dropdown.Menu>
            </Dropdown>
        );
    }
}

HotkeyedDropdown.propTypes = {
    title: string.isRequired,
    hotkey: string,
    onToggle: func,
    disabled: bool,
    children: oneOfType([arrayOf(node), node]),
};

HotkeyedDropdown.defaultProps = {
    hotkey: '',
    onToggle: () => {},
    disabled: false,
    children: null,
};
