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
import Immutable from 'immutable';
import Dropdown from 'react-bootstrap/Dropdown';

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
    menuItems: PropTypes.oneOfType([
        PropTypes.instanceOf(Array),
        PropTypes.instanceOf(Immutable.Iterable),
    ]).isRequired,
    iconName: PropTypes.string,
    cssClass: PropTypes.string,
    dropdownCssClass: PropTypes.string,
    dropdownMenuCssClass: PropTypes.string,
};

MainMenu.defaultProps = {
    iconName: 'mdi mdi-menu',
    cssClass: 'core-nav-section core-padded-row',
    dropdownCssClass: 'core-main-menu core-btn btn-primary',
    dropdownMenuCssClass: 'core-dropdown-menu',
};

export default MainMenu;
