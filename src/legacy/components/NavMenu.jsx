/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Immutable from 'immutable';
import { func, instanceOf, number, oneOfType, string } from 'prop-types';

import NavMenuItem from './NavMenuItem';

const NavMenu = ({ menuItems, selectedItemId, onItemSelected, cssClass }) => (
    <div className={cssClass}>
        {menuItems.map((item, index) => {
            const hotkey = `Alt+${index + 1}`;
            const onSelected = () => onItemSelected(item.id);

            return (
                <NavMenuItem
                    key={item.id}
                    id={item.id}
                    isSelected={item.id === selectedItemId}
                    text={item.text}
                    title={`${item.text} (${hotkey})`}
                    hotkey={hotkey.toLowerCase()}
                    iconClass={item.iconClass}
                    onClick={onSelected}
                />
            );
        })}
    </div>
);

NavMenu.propTypes = {
    menuItems: oneOfType([instanceOf(Array), instanceOf(Immutable.Iterable)])
        .isRequired,
    onItemSelected: func.isRequired,
    selectedItemId: number,
    cssClass: string,
};

NavMenu.defaultProps = {
    selectedItemId: -1,
    cssClass: 'core-nav-section core-padded-row',
};

export default NavMenu;
