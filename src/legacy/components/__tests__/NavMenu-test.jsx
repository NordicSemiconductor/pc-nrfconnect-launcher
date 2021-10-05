/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable import/first */

import React from 'react';
import { mount, shallow } from 'enzyme';
import Immutable from 'immutable';

import NavMenu from '../NavMenu';

const menuItems = Immutable.List([
    {
        id: 1,
        text: 'Connection map',
        iconClass: 'icon-columns',
    },
    {
        id: 2,
        text: 'Server setup',
        iconClass: 'icon-indent-right',
    },
]);

describe('NavMenu', () => {
    it('should render menu with no items', () => {
        expect(
            shallow(
                <NavMenu
                    menuItems={[]}
                    onItemSelected={() => {}}
                    bindHotkey={() => {}}
                />
            )
        ).toMatchSnapshot();
    });

    it('should render menu with two items, and none selected', () => {
        expect(
            shallow(
                <NavMenu
                    menuItems={menuItems}
                    onItemSelected={() => {}}
                    bindHotkey={() => {}}
                />
            )
        ).toMatchSnapshot();
    });

    it('should render menu with two items, and one selected', () => {
        expect(
            shallow(
                <NavMenu
                    menuItems={menuItems}
                    selectedItemId={1}
                    onItemSelected={() => {}}
                    bindHotkey={() => {}}
                />
            )
        ).toMatchSnapshot();
    });

    it('should invoke onItemSelected when item has been selected', () => {
        const onItemSelected = jest.fn();
        const wrapper = mount(
            <NavMenu
                menuItems={menuItems}
                onItemSelected={onItemSelected}
                bindHotkey={() => {}}
            />
        );
        wrapper.find('button').first().simulate('click');

        expect(onItemSelected).toHaveBeenCalledWith(menuItems.first().id);
    });
});
