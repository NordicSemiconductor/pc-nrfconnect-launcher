/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import NavMenu from '../../components/NavMenu';
import { connect } from '../../decoration';
import * as NavMenuActions from '../actions/navMenuActions';

function mapStateToProps(state) {
    const { navMenu } = state.core;

    return {
        menuItems: navMenu.menuItems,
        selectedItemId: navMenu.selectedItemId,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onItemSelected: id => dispatch(NavMenuActions.menuItemSelected(id)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(NavMenu, 'NavMenu');
