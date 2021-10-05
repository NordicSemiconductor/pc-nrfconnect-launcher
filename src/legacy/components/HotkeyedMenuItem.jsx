/*
 * Copyright (c) 2018 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import Mousetrap from 'mousetrap';
import { bool, func, string } from 'prop-types';

// Like react-bootstrap's `MenuItem`, but can receive an extra `hotkey` prop:
// a key combination handled by `mousetrap` that will click this item.

export default class HotkeyedMenuItem extends React.Component {
    componentDidMount() {
        const { hotkey, onClick } = this.props;
        Mousetrap.bind(hotkey, onClick);
    }

    componentWillUnmount() {
        const { hotkey } = this.props;
        Mousetrap.unbind(hotkey);
    }

    render() {
        const { divider, ...childProps } = this.props;
        if (divider) {
            return <Dropdown.Divider />;
        }
        return <Dropdown.Item {...childProps} />;
    }
}

HotkeyedMenuItem.propTypes = {
    hotkey: string,
    divider: bool,
    onClick: func,
};

HotkeyedMenuItem.defaultProps = {
    hotkey: '',
    divider: false,
    onClick: () => {},
};
