/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import Immutable from 'immutable';
import { instanceOf, oneOfType, string } from 'prop-types';

import MenuItem from '../../components/HotkeyedMenuItem';

const renderItems = menuItems =>
    menuItems.map(({ id, onClick, isDivider, hotkey, text }) => (
        <MenuItem
            key={id}
            onClick={onClick}
            divider={isDivider}
            hotkey={hotkey ? hotkey.toLowerCase() : ''}
            title={hotkey ? `${text} (${hotkey})` : text}
        >
            {text}
        </MenuItem>
    ));

const MainMenu = ({
    menuItems,
    iconName,
    cssClass,
    dropdownCssClass,
    dropdownMenuCssClass,
    ...rest
}) => (
    <div className={cssClass}>
        <Dropdown id="main-menu" {...rest}>
            <Dropdown.Toggle className={dropdownCssClass}>
                <span className={iconName} />
            </Dropdown.Toggle>
            <Dropdown.Menu id="main-menu-list" className={dropdownMenuCssClass}>
                {renderItems(menuItems)}
            </Dropdown.Menu>
        </Dropdown>
    </div>
);

MainMenu.propTypes = {
    menuItems: oneOfType([instanceOf(Array), instanceOf(Immutable.Iterable)])
        .isRequired,
    iconName: string,
    cssClass: string,
    dropdownCssClass: string,
    dropdownMenuCssClass: string,
};

MainMenu.defaultProps = {
    iconName: 'mdi mdi-menu',
    cssClass: 'core-nav-section core-padded-row',
    dropdownCssClass: 'core-main-menu core-btn btn-primary',
    dropdownMenuCssClass: 'core-dropdown-menu',
};

export default MainMenu;
