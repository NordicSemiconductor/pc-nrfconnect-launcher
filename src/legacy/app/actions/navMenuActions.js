/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/**
 * Indicates that a navigation menu (NavMenu) item has been selected.
 *
 * Apps that use the NavMenu can listen to this action in their middleware to add
 * custom behavior when an item is selected. Apps can also dispatch this action
 * themselves to select a menu item.
 *
 * @param {number} The menu item ID.
 */
export const ITEM_SELECTED = 'NAV_MENU_ITEM_SELECTED';

export function menuItemSelected(id) {
    return {
        type: ITEM_SELECTED,
        id,
    };
}
