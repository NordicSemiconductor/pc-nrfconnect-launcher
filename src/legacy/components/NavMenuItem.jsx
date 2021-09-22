/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Mousetrap from 'mousetrap';
import { bool, func, string } from 'prop-types';

function getClassName(baseClass, isSelected) {
    return `${baseClass} ${isSelected ? 'active' : ''}`;
}

export default class NavMenuItem extends React.Component {
    componentDidMount() {
        const { hotkey, onClick } = this.props;
        Mousetrap.bind(hotkey, onClick);
    }

    componentWillUnmount() {
        const { hotkey } = this.props;
        Mousetrap.unbind(hotkey);
    }

    render() {
        const { title, text, cssClass, iconClass, isSelected, onClick } =
            this.props;
        return (
            <button
                title={title}
                className={getClassName(cssClass, isSelected)}
                onClick={onClick}
                type="button"
            >
                <span className={iconClass} />
                <span>{text}</span>
            </button>
        );
    }
}

NavMenuItem.propTypes = {
    isSelected: bool.isRequired,
    text: string.isRequired,
    title: string.isRequired,
    iconClass: string.isRequired,
    onClick: func.isRequired,
    cssClass: string,
    hotkey: string.isRequired,
};

NavMenuItem.defaultProps = {
    cssClass: 'btn btn-primary core-btn core-padded-row',
};
