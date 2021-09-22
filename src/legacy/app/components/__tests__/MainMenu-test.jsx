/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable import/first */

// Do not decorate components
jest.mock('../../../decoration', () => ({
    decorate: component => component,
}));

import React from 'react';
import { mount } from 'enzyme';
import Immutable from 'immutable';

import MainMenu from '../MainMenu';

const menuItems = Immutable.List([
    {
        id: 1,
        text: 'First item',
    },
    {
        id: 2,
        isDivider: true,
    },
    {
        id: 3,
        text: 'Last item',
    },
]);

describe('MainMenu', () => {
    it('should render menu with no items', () => {
        expect(
            mount(<MainMenu menuItems={[]} defaultShow />)
        ).toMatchSnapshot();
    });

    it('should render menu with two items separated by divider', () => {
        expect(
            mount(<MainMenu menuItems={menuItems} defaultShow />)
        ).toMatchSnapshot();
    });

    it('should invoke onClick when item has been clicked', () => {
        const onClick = jest.fn();
        const wrapper = mount(
            <MainMenu
                menuItems={[
                    {
                        id: 1,
                        text: 'Foo',
                        onClick,
                    },
                ]}
                defaultShow
            />
        );
        wrapper.find('a[title="Foo"]').first().simulate('click');

        expect(onClick).toHaveBeenCalled();
    });
});
