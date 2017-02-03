import React from 'react';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';
import Immutable from 'immutable';
import NavMenu from '../NavMenu';

function renderComponent(menuItems, selectedItemId, onItemSelected) {
    const onSelected = onItemSelected || (() => {});
    return renderer.create(
        <NavMenu
            menuItems={menuItems}
            selectedItemId={selectedItemId}
            onItemSelected={onSelected}
        />,
    ).toJSON();
}

const menuItems = Immutable.List([
    {
        id: 1,
        text: 'Connection map',
        iconClass: 'icon-columns',
    }, {
        id: 2,
        text: 'Server setup',
        iconClass: 'icon-indent-right',
    },
]);

describe('NavMenu', () => {
    it('should render menu with no items', () => {
        expect(renderComponent([])).toMatchSnapshot();
    });

    it('should render menu with two items, and none selected', () => {
        expect(renderComponent(menuItems)).toMatchSnapshot();
    });

    it('should render menu with two items, and one selected', () => {
        expect(renderComponent(menuItems, 1)).toMatchSnapshot();
    });

    it('should invoke onItemSelected when item has been selected', () => {
        const onItemSelected = jest.fn();
        const wrapper = mount(<NavMenu menuItems={menuItems} onItemSelected={onItemSelected} />);
        wrapper.find('button').first().simulate('click');

        expect(onItemSelected).toHaveBeenCalledWith(menuItems.first().id);
    });
});
