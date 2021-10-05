/*
 * Copyright (c) 2018 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
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
